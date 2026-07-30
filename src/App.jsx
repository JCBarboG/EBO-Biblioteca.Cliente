import { useEffect, useRef, useState } from 'react';
import { useApp } from './context/AppContext';
import { useT } from './i18n/translations';
import { CATEGORIES_BY_TYPE, emptyFieldsForType } from './constants/docTypes';
import { exportBooksToExcel } from './utils/exportExcel';
import { rotateImageBlob } from './utils/rotateImage';
import { useOcrWorker } from './hooks/useOcrWorker';
import { useToast } from './hooks/useToast';

import ImageInput from './components/ImageInput';
import OcrProgress from './components/OcrProgress';
import TextEditor from './components/TextEditor';
import CategoryFields from './components/CategoryFields';
import BooksTable from './components/BooksTable';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Drawer from './components/Drawer';
import ConfigPanel from './components/ConfigPanel';
import DocTypeSelector from './components/DocTypeSelector';
import HelpButton from './components/HelpButton';

import SupportView from './views/SupportView';
import AboutView from './views/AboutView';
import PremiumView from './views/PremiumView';
import TermsView from './views/TermsView';
import PrivacyView from './views/PrivacyView';
import GuideView from './views/GuideView';

import './App.css';

const MAX_IMAGES = 3;

function checkPortrait(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img.naturalHeight >= img.naturalWidth); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(true); };
    img.src = url;
  });
}

export default function App() {
  const { lang, docType, setDocType } = useApp();
  const t = useT(lang);

  const [view, setView] = useState('main');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const [images, setImages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [orientationWarn, setOrientationWarn] = useState('');
  const [helpVisible, setHelpVisible] = useState(true);

  const [ocrText, setOcrText] = useState('');
  const [fields, setFields] = useState(() => emptyFieldsForType(docType));
  const [records, setRecords] = useState([]);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: '' });
  const [activeChip, setActiveChip] = useState(null);
  const [columnPunctuation, setColumnPunctuation] = useState({});

  const chipTimerRef = useRef(null);
  const imagesRef = useRef([]);
  const textareaRef = useRef(null);

  const { recognize, progress, statusLabel, isProcessing, error: ocrError } = useOcrWorker();
  const { toastMessage, showToast } = useToast();

  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => () => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
  }, []);

  useEffect(() => {
    setFields(emptyFieldsForType(docType));
    // Las columnas cambian de significado entre tipos de documento, así que
    // la puntuación asignada manualmente no debe arrastrarse de un tipo a otro.
    setColumnPunctuation({});
  }, [docType]);

  const handleNewRecord = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setCurrentIdx(0);
    setOrientationWarn('');
    setOcrText('');
    setFields(emptyFieldsForType(docType));
    setSelection({ start: 0, end: 0, text: '' });
    setDocType('libro');
    setView('main');
  };

  const handleImageAdded = (file) => {
    if (images.length >= MAX_IMAGES) return;
    setOrientationWarn('');
    const url = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev, { file, previewUrl: url }];
      setCurrentIdx(next.length - 1);
      return next;
    });
    setOcrText('');
    setFields(emptyFieldsForType(docType));
    setSelection({ start: 0, end: 0, text: '' });
  };

  const handleNavigate = (idx) =>
    setCurrentIdx(Math.max(0, Math.min(idx, images.length - 1)));

  const handleRotate = async () => {
    const cur = images[currentIdx];
    if (!cur) return;
    setOrientationWarn('');
    try {
      const rotated = await rotateImageBlob(cur.file, 90);
      const newUrl = URL.createObjectURL(rotated);
      URL.revokeObjectURL(cur.previewUrl);
      setImages((prev) => prev.map((img, i) =>
        i === currentIdx ? { file: rotated, previewUrl: newUrl } : img
      ));
    } catch {
      showToast(t.toastRotateError);
    }
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setCurrentIdx(0);
    setOrientationWarn('');
    setOcrText('');
    setFields(emptyFieldsForType(docType));
    setSelection({ start: 0, end: 0, text: '' });
  };

  const handleExtract = async () => {
    if (images.length === 0 || isProcessing) return;
    const portraits = await Promise.all(images.map((img) => checkPortrait(img.file)));
    const bad = portraits.findIndex((p) => !p);
    if (bad !== -1) {
      const label = t.orientationLabel(bad + 1, images.length);
      setOrientationWarn(t.orientationWarning(label));
      setCurrentIdx(bad);
      return;
    }
    setOrientationWarn('');
    try {
      const texts = [];
      for (const img of images) texts.push(await recognize(img.file));
      setOcrText(texts.join('\n\n---\n\n'));
    } catch { /* error shown via ocrError */ }
  };

  const handleAssign = (key) => {
    const frag = selection.text.trim();
    if (!frag) return;
    setFields((prev) => ({ ...prev, [key]: prev[key] ? `${prev[key]}; ${frag}` : frag }));
    setActiveChip(key);
    if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
    chipTimerRef.current = setTimeout(() => setActiveChip(null), 400);

    // Limpiar la selección tras asignar: evita que un clic posterior en otra
    // casilla vacía pegue el mismo fragmento por accidente (ver
    // project_ebo_cliente_ui_decisions.md).
    setSelection({ start: 0, end: 0, text: '' });
    const ta = textareaRef.current;
    if (ta) {
      const pos = ta.selectionEnd;
      ta.setSelectionRange(pos, pos);
    }
  };

  const handleSave = () => {
    const hasData = Object.values(fields).some((v) => v.trim());
    if (!hasData) { showToast(t.step03.noData); return; }
    setRecords((prev) => [...prev, { id: crypto.randomUUID(), _type: docType, ...fields }]);
    setFields(emptyFieldsForType(docType));
    showToast(t.step03.saved(docType));
  };

  const handleExport = () => {
    if (records.length === 0) { showToast(t.step03.noRecords); return; }
    showToast(t.step03.exporting(records.length));
    exportBooksToExcel(records, docType, lang, columnPunctuation);
  };

  const handlePunctuationChange = (key, value) => {
    setColumnPunctuation((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearRecords = () => {
    if (!window.confirm(t.step03.clearConfirm)) return;
    setRecords([]);
  };

  const handleDocTypeChange = () => {
    setFields(emptyFieldsForType(docType));
  };

  const openConfig = () => {
    setDrawerOpen(false);
    setConfigOpen(true);
  };

  const shell = (content) => (
    <>
      {content}
      <Footer />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNewRecord={handleNewRecord}
        onExport={handleExport}
        onOpenConfig={openConfig}
        onNavigate={(v) => setView(v)}
      />
      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
      <Toast message={toastMessage} />
      {view !== 'guide' && (
        <HelpButton
          visible={helpVisible}
          onOpen={() => setView('guide')}
          onDismiss={() => setHelpVisible(false)}
        />
      )}
    </>
  );

  const header = <AppHeader onHamburger={() => setDrawerOpen(true)} />;

  if (view === 'support') return shell(<>{header}<SupportView onBack={() => setView('main')} /></>);
  if (view === 'about') return shell(<>{header}<AboutView onBack={() => setView('main')} onNavigate={setView} /></>);
  if (view === 'premium') return shell(<>{header}<PremiumView onBack={() => setView('main')} /></>);
  if (view === 'terms') return shell(<>{header}<TermsView onBack={() => setView('about')} /></>);
  if (view === 'privacy') return shell(<>{header}<PrivacyView onBack={() => setView('about')} /></>);
  if (view === 'guide') return shell(<>{header}<GuideView onBack={() => setView('main')} /></>);

  return shell(
    <div className="app">
      <AppHeader onHamburger={() => setDrawerOpen(true)} />
      <DocTypeSelector onTypeChange={handleDocTypeChange} />

      <main className="app__main">
        {/* Step 01 */}
        <section className="card">
          <div className="step-head">
            <span className="step-num">01</span>
            <h2>{t.step01.title}</h2>
          </div>
          <div className="divider" />
          <ImageInput
            images={images}
            currentIndex={currentIdx}
            onImageAdded={handleImageAdded}
            onNavigate={handleNavigate}
            onRotate={handleRotate}
            onClear={handleClearAll}
            onExtract={handleExtract}
            isBusy={isProcessing}
            orientationWarning={orientationWarn}
          />
          {isProcessing && <OcrProgress statusLabel={statusLabel} progress={progress} />}
          {ocrError && <p className="error-text">{ocrError}</p>}
        </section>

        {/* Step 02 */}
        <section className="card">
          <div className="step-head">
            <span className="step-num">02</span>
            <h2>{t.step02.title}</h2>
          </div>
          <div className="divider" />
          <div className="step-grid">
            <TextEditor ref={textareaRef} value={ocrText} onChange={setOcrText} onSelectionChange={setSelection} />
            <CategoryFields
              fields={fields}
              onFieldChange={(key, val) => setFields((prev) => ({ ...prev, [key]: val }))}
              selection={selection}
              onAssign={handleAssign}
              activeKey={activeChip}
            />
          </div>
        </section>

        {/* Step 03 */}
        <section className="card">
          <div className="step-head">
            <span className="step-num">03</span>
            <h2>{t.step03.title}</h2>
          </div>
          <div className="divider" />
          <div className="status-row">
            <p className="status-count">{t.step03.count(records.length)}</p>
            <button type="button" className="icon-btn" aria-label={t.step03.clearTable} onClick={handleClearRecords}>
              <TrashGlyph />
            </button>
          </div>
          <BooksTable
            books={records}
            onSave={handleSave}
            onExport={handleExport}
            columnPunctuation={columnPunctuation}
            onPunctuationChange={handlePunctuationChange}
          />
        </section>
      </main>
    </div>
  );
}

function AppHeader({ onHamburger }) {
  const { lang } = useApp();
  const t = useT(lang);
  return (
    <header className="app__header">
      <div className="header-banner">
        <div className="header-brand">
          <h1>EBO</h1>
          <p className="header-sub">{t.header.subtitle}</p>
        </div>
        <button type="button" className="hamburger" onClick={onHamburger} aria-label="Abrir menú">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function TrashGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
