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
import ConfirmDialog from './components/ConfirmDialog';

import SupportView from './views/SupportView';
import AboutView from './views/AboutView';
import PremiumView from './views/PremiumView';
import TermsView from './views/TermsView';
import PrivacyView from './views/PrivacyView';
import GuideView from './views/GuideView';
import HistoryView from './views/HistoryView';

import {
  HISTORY_LIMIT, HistoryQuotaError, createPackage, formatPackageDate, loadHistory,
  oldestPackage, packageFileStamp, writeHistory,
} from './utils/history';

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
  // Overrides manuales de puntuación por columna ({ [fieldKey]: símbolo }).
  // Sin entrada = se usa el preset del tipo de documento
  // (config/punctuationPresets.js). Pertenecen al tipo de documento actual.
  const [columnPunctuation, setColumnPunctuation] = useState({});
  // Ventana modal activa del historial: { kind: 'load' | 'limit' | 'quota', ... }
  const [historyDialog, setHistoryDialog] = useState(null);
  // Overrides a restaurar cuando un paquete del historial cambia el tipo de
  // documento (el efecto de docType limpia los overrides; ver abajo).
  const pendingOverridesRef = useRef(null);

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
    // la puntuación asignada manualmente no debe arrastrarse de un tipo a otro:
    // al cambiar de tipo se carga el preset limpio del nuevo tipo. Excepción:
    // al cargar un paquete del historial se restauran sus overrides.
    setColumnPunctuation(pendingOverridesRef.current || {});
    pendingOverridesRef.current = null;
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

  const handlePunctuationReset = (key) => {
    setColumnPunctuation((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // ── Historial ──
  const downloadPackage = (pkg) => {
    exportBooksToExcel(pkg.rows, pkg.docType, lang, pkg.overrides || {}, packageFileStamp(pkg.createdAt));
  };

  const commitHistory = (pkg, list) => {
    try {
      writeHistory([pkg, ...list]);
      setHistoryDialog(null);
      showToast(t.step03.historySaved);
    } catch (e) {
      if (e instanceof HistoryQuotaError) setHistoryDialog({ kind: 'quota' });
      else { setHistoryDialog(null); showToast(t.history.quotaTitle); }
    }
  };

  const handleSaveHistory = () => {
    if (records.length === 0) { showToast(t.step03.historyEmpty); return; }
    const pkg = createPackage(records, docType, columnPunctuation);
    const list = loadHistory();
    if (list.length >= HISTORY_LIMIT) {
      setHistoryDialog({ kind: 'limit', pkg, list, oldest: oldestPackage(list) });
      return;
    }
    commitHistory(pkg, list);
  };

  const resolveLimit = (download) => {
    const { pkg, list, oldest } = historyDialog;
    if (download) downloadPackage(oldest);
    // Si todavía sobra (p. ej. >50 por datos viejos), se recorta a 49 + el nuevo.
    const kept = list.filter((p) => p.id !== oldest.id).slice(0, HISTORY_LIMIT - 1);
    commitHistory(pkg, kept);
  };

  const applyPackage = (pkg) => {
    setRecords(pkg.rows.map((r) => ({ ...r, id: r.id || crypto.randomUUID() })));
    if (pkg.docType === docType) {
      setColumnPunctuation({ ...(pkg.overrides || {}) });
    } else {
      pendingOverridesRef.current = { ...(pkg.overrides || {}) };
      setDocType(pkg.docType);
    }
    setHistoryDialog(null);
    setView('main');
    showToast(t.history.loaded(pkg.rows.length));
  };

  const handleLoadPackage = (pkg) => {
    if (records.length > 0) setHistoryDialog({ kind: 'load', pkg });
    else applyPackage(pkg);
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
      <ConfirmDialog
        open={historyDialog?.kind === 'load'}
        title={t.history.loadTitle}
        message={t.history.loadMessage}
        onCancel={() => setHistoryDialog(null)}
        actions={[
          { label: t.history.cancel, variant: 'outline', onClick: () => setHistoryDialog(null) },
          { label: t.history.load, variant: 'primary', onClick: () => applyPackage(historyDialog.pkg) },
        ]}
      />
      <ConfirmDialog
        open={historyDialog?.kind === 'limit'}
        title={t.history.limitTitle}
        message={t.history.limitMessage}
        onCancel={() => setHistoryDialog(null)}
        actions={[
          { label: t.history.cancel, variant: 'ghost', onClick: () => setHistoryDialog(null) },
          { label: t.history.limitContinue, variant: 'outline', onClick: () => resolveLimit(false) },
          { label: t.history.limitDownload, variant: 'primary', onClick: () => resolveLimit(true) },
        ]}
      >
        {historyDialog?.kind === 'limit' && historyDialog.oldest && (
          <p className="dialog__package">
            {t.history.packageSummary(
              formatPackageDate(historyDialog.oldest.createdAt),
              t.history.types[historyDialog.oldest.docType] || historyDialog.oldest.docType,
              historyDialog.oldest.rowCount ?? historyDialog.oldest.rows.length,
            )}
          </p>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        open={historyDialog?.kind === 'quota'}
        title={t.history.quotaTitle}
        message={t.history.quotaMessage}
        onCancel={() => setHistoryDialog(null)}
        actions={[
          { label: t.history.close, variant: 'outline', onClick: () => setHistoryDialog(null) },
          { label: t.history.openHistory, variant: 'primary', onClick: () => { setHistoryDialog(null); setView('history'); } },
        ]}
      />
      {view !== 'guide' && (
        <HelpButton
          visible={helpVisible}
          onOpen={() => setView('guide')}
          onDismiss={() => setHelpVisible(false)}
        />
      )}
    </>
  );

  const header = <AppHeader onHamburger={() => setDrawerOpen(true)} onLogoClick={() => setView('main')} />;

  if (view === 'support') return shell(<>{header}<SupportView onBack={() => setView('main')} /></>);
  if (view === 'about') return shell(<>{header}<AboutView onBack={() => setView('main')} onNavigate={setView} /></>);
  if (view === 'premium') return shell(<>{header}<PremiumView onBack={() => setView('main')} /></>);
  if (view === 'terms') return shell(<>{header}<TermsView onBack={() => setView('about')} /></>);
  if (view === 'privacy') return shell(<>{header}<PrivacyView onBack={() => setView('about')} /></>);
  if (view === 'history') {
    return shell(
      <>
        {header}
        <HistoryView
          onBack={() => setView('main')}
          onLoad={handleLoadPackage}
          onDownload={(pkg) => { showToast(t.history.downloading); downloadPackage(pkg); }}
          showToast={showToast}
        />
      </>,
    );
  }
  if (view === 'guide') return shell(<>{header}<GuideView onBack={() => setView('main')} /></>);

  return shell(
    <div className="app">
      {header}
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
            onSaveHistory={handleSaveHistory}
            columnPunctuation={columnPunctuation}
            onPunctuationChange={handlePunctuationChange}
            onPunctuationReset={handlePunctuationReset}
          />
        </section>
      </main>
    </div>
  );
}

function AppHeader({ onHamburger, onLogoClick }) {
  const { lang } = useApp();
  const t = useT(lang);
  return (
    <header className="app__header">
      <div className="header-banner">
        <button
          type="button"
          className="header-brand header-brand--link"
          onClick={onLogoClick}
          aria-label={t.header.goHome}
        >
          <h1>EBO</h1>
          <p className="header-sub">{t.header.subtitle}</p>
        </button>
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
