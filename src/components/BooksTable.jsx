import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';
import { hasOverride, presetRuleFor, punctuationParts } from '../config/punctuationPresets';

// Símbolos de puntuación ISBD disponibles para el override manual por
// columna. `glyph` es solo para mostrar en la paleta; `value` es el sufijo
// real que se aplica (el espacio inicial es parte de la regla).
const PUNCT_SYMBOLS = [
  { value: '', glyph: '—', label: 'Ninguno' },
  { value: ' -', glyph: '-', label: '- guión' },
  { value: ' :', glyph: ':', label: ': dos puntos' },
  { value: ' /', glyph: '/', label: '/ barra' },
  { value: ' ;', glyph: ';', label: '; punto y coma' },
  { value: ',', glyph: ',', label: ', coma' },
  { value: '.', glyph: '.', label: '. punto' },
  { value: ' +', glyph: '+', label: '+ más' },
];

// Alto de la caja de la tabla (redimensionable arrastrando el borde inferior).
const TABLE_HEIGHT_KEY = 'ebo:tableHeight';
const DEFAULT_TABLE_HEIGHT = 300;
const MIN_TABLE_HEIGHT = 240;
const maxTableHeight = () => Math.round(window.innerHeight * 0.9);

// Filas vacías de relleno: al menos 6, y las que quepan en el alto elegido
// para que al alargar la tabla se vean más filas tipo Excel.
const MIN_VISIBLE_ROWS = 6;
const HEADER_HEIGHT = 64;
const ROW_HEIGHT = 27;

const POP_WIDTH = 214;
const POP_GAP = 6;
const VIEWPORT_MARGIN = 8;

function excelColumnLetters(index) {
  // 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB, ...
  let n = index;
  let letters = '';
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letters;
}

function readStoredHeight() {
  try {
    const v = parseInt(localStorage.getItem(TABLE_HEIGHT_KEY), 10);
    if (Number.isFinite(v)) return Math.max(MIN_TABLE_HEIGHT, v);
  } catch { /* almacenamiento no disponible */ }
  return DEFAULT_TABLE_HEIGHT;
}

function symbolLabel(value) {
  const found = PUNCT_SYMBOLS.find((s) => s.value === value);
  return found ? found.label : value.trim();
}

function describeRule(rule, t) {
  if (typeof rule === 'string') return rule ? symbolLabel(rule) : t.punct.none;
  if (rule && rule.conditional) {
    const { then, else: otherwise } = rule.conditional;
    return t.punct.conditional(then.trim(), otherwise.trim());
  }
  return t.punct.none;
}

export default function BooksTable({
  books, onSave, onExport, onSaveHistory, columnPunctuation, onPunctuationChange, onPunctuationReset,
}) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;

  // { key, anchor: DOMRect } de la columna cuyo panel está abierto.
  const [menu, setMenu] = useState(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  const [tableHeight, setTableHeight] = useState(readStoredHeight);
  const wrapRef = useRef(null);

  // Cerrar el panel con clic fuera, Esc, scroll (tabla o página) o resize.
  useEffect(() => {
    if (!menu) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    const onScroll = (e) => {
      if (e.target instanceof Element && e.target.closest('.punct-pop')) return;
      // Al tocar un ícono parcialmente visible el navegador puede desplazar
      // la tabla para mostrarlo; ese scroll inmediato no debe cerrar el panel.
      if (performance.now() - menu.openedAt < 250) return;
      closeMenu();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', closeMenu);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [menu, closeMenu]);

  // Al cambiar de tipo de documento, el panel abierto ya no aplica.
  useEffect(() => { closeMenu(); }, [docType, closeMenu]);

  // ── Redimensionar la tabla ──
  const dragRef = useRef(null);
  const onHandleDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startH: wrapRef.current?.offsetHeight || tableHeight };
  };
  const onHandleMove = (e) => {
    if (!dragRef.current) return;
    const { startY, startH } = dragRef.current;
    const next = Math.min(maxTableHeight(), Math.max(MIN_TABLE_HEIGHT, startH + (e.clientY - startY)));
    setTableHeight(next);
  };
  const onHandleUp = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ya liberado */ }
    setTableHeight((h) => {
      try { localStorage.setItem(TABLE_HEIGHT_KEY, String(Math.round(h))); } catch { /* sin espacio */ }
      return h;
    });
  };
  const onHandleKey = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    setTableHeight((h) => {
      const next = Math.min(maxTableHeight(), Math.max(MIN_TABLE_HEIGHT, h + (e.key === 'ArrowDown' ? 40 : -40)));
      try { localStorage.setItem(TABLE_HEIGHT_KEY, String(next)); } catch { /* sin espacio */ }
      return next;
    });
  };

  const effectiveHeight = Math.min(tableHeight, Math.max(MIN_TABLE_HEIGHT, maxTableHeight()));
  const fillRows = Math.max(MIN_VISIBLE_ROWS, Math.floor((effectiveHeight - HEADER_HEIGHT) / ROW_HEIGHT));
  const emptyRows = Math.max(fillRows - books.length, 1);

  const openCat = menu ? cats.find((c) => c.key === menu.key) : null;

  return (
    <div className="books-table-section">
      <div className="excel-wrap" ref={wrapRef} style={{ height: effectiveHeight }}>
        <table className="excel-table">
          <thead>
            <tr className="col-letters">
              <th />
              {cats.map((_, i) => <th key={i}>{excelColumnLetters(i)}</th>)}
            </tr>
            <tr className="field-names">
              <th>1</th>
              {cats.map((cat) => {
                const overridden = hasOverride(columnPunctuation, cat.key);
                const rule = presetRuleFor(cat, docType);
                const hasPunct = overridden ? Boolean(columnPunctuation[cat.key]) : Boolean(rule);
                const colLabel = cat.colLabel[lang] || cat.colLabel.es;
                const isOpen = menu?.key === cat.key;
                return (
                  <th key={cat.key} className="field-names__cell">
                    <span className="field-names__label">
                      {colLabel}
                      {cat.marcTag && <span className="field-names__tag">{cat.marcTag}</span>}
                    </span>
                    {overridden && (
                      <span className="col-override-dot" title={t.punct.overrideHint} aria-label={t.punct.overrideHint} />
                    )}
                    <button
                      type="button"
                      className={`col-punct-corner${hasPunct ? ' col-punct-corner--active' : ''}`}
                      aria-label={t.punct.choose(colLabel)}
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        const anchor = e.currentTarget.getBoundingClientRect();
                        setMenu((prev) => (prev?.key === cat.key ? null : { key: cat.key, anchor, openedAt: performance.now() }));
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 2}</td>
                {cats.map((cat) => {
                  const { body, suffix } = punctuationParts(book, cat, docType, columnPunctuation);
                  return (
                    <td key={cat.key}>
                      {body}
                      {suffix && <span className="marc-sym">{suffix}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="empty-cell">{books.length + i + 2}</td>
                {cats.map((cat) => <td key={cat.key} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="table-resize"
        role="separator"
        aria-orientation="horizontal"
        aria-label={t.punct.resize}
        aria-valuemin={MIN_TABLE_HEIGHT}
        aria-valuenow={Math.round(effectiveHeight)}
        tabIndex={0}
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
        onPointerCancel={onHandleUp}
        onKeyDown={onHandleKey}
      >
        <span className="table-resize__grip" />
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--outline" onClick={onSave}>
          {t.step03.save}
        </button>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          {t.step03.export}
        </button>
      </div>
      <button type="button" className="btn btn--ghost btn--history" onClick={onSaveHistory}>
        {t.step03.saveHistory}
      </button>

      {openCat && (
        <PunctPopover
          cat={openCat}
          anchor={menu.anchor}
          lang={lang}
          docType={docType}
          overrides={columnPunctuation}
          onPick={(value) => onPunctuationChange(openCat.key, value)}
          onReset={() => onPunctuationReset(openCat.key)}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}

// Panel de puntuación renderizado en <body> con position: fixed para que el
// contenedor con scroll de la tabla no lo recorte.
function PunctPopover({ cat, anchor, lang, docType, overrides, onPick, onReset, onClose }) {
  const t = useT(lang);
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999, placement: 'below' });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let placement = 'below';
    let top = anchor.bottom + POP_GAP;
    if (top + h > vh - VIEWPORT_MARGIN && anchor.top - POP_GAP - h >= VIEWPORT_MARGIN) {
      placement = 'above';
      top = anchor.top - POP_GAP - h;
    }
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - h - VIEWPORT_MARGIN));

    // Por defecto se abre hacia la derecha desde el ícono; si no cabe, se
    // alinea su borde derecho con el ícono (se abre hacia la izquierda).
    let left = anchor.left - 8;
    if (left + POP_WIDTH > vw - VIEWPORT_MARGIN) left = anchor.right + 8 - POP_WIDTH;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - POP_WIDTH - VIEWPORT_MARGIN));

    setPos({ top, left, placement });
  }, [anchor, overrides]);

  // Clic/toque fuera del panel lo cierra. Se ignora el propio ícono de
  // esquina para que su onClick pueda alternar abrir/cerrar.
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (e.target instanceof Element && e.target.closest('.col-punct-corner')) return;
      onClose();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [onClose]);

  const colLabel = cat.colLabel[lang] || cat.colLabel.es;
  const overridden = hasOverride(overrides, cat.key);
  const rule = presetRuleFor(cat, docType);
  // Símbolo marcado: el override si existe; si no, el del preset cuando es
  // fijo. Un preset condicional (245$a) no marca ningún botón: depende de la fila.
  const selectedValue = overridden
    ? overrides[cat.key] || ''
    : typeof rule === 'string' ? rule : rule ? null : '';

  return createPortal(
    <div
      ref={ref}
      className={`punct-pop punct-pop--${pos.placement}`}
      style={{ top: pos.top, left: pos.left, width: POP_WIDTH }}
      role="dialog"
      aria-label={t.punct.title}
    >
      <p className="punct-pop__title">
        {t.punct.title} · <span>{colLabel}{cat.marcTag ? ` ${cat.marcTag}` : ''}</span>
      </p>
      <div className="punct-grid">
        {PUNCT_SYMBOLS.map((s) => {
          const selected = selectedValue === s.value;
          return (
            <button
              type="button"
              key={s.label}
              className={`punct-btn${s.value === '' ? ' punct-btn--none' : ''}${selected ? ' punct-btn--active' : ''}`}
              aria-label={s.label}
              aria-pressed={selected}
              onClick={() => onPick(s.value)}
            >
              {s.glyph}
            </button>
          );
        })}
      </div>
      <p className="punct-pop__caption">
        {overridden ? (
          <>{t.punct.manual}: <b>{symbolLabel(overrides[cat.key] || '')}</b></>
        ) : (
          <>{t.punct.preset}: <b>{describeRule(rule, t)}</b></>
        )}
      </p>
      <button type="button" className="punct-reset" onClick={onReset} disabled={!overridden}>
        {t.punct.reset}
      </button>
    </div>,
    document.body,
  );
}
