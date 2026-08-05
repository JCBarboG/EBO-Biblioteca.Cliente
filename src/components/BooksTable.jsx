import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

// Símbolos de puntuación ISBD disponibles para el control manual por columna.
// Reemplaza la lógica automática que antes vivía en utils/marcSymbols.js —
// ver project_ebo_cliente_ui_decisions.md. `glyph` es solo para mostrar en la
// paleta; `value` es el sufijo real que se aplica (se mantiene igual al
// diseño original para no romper el export).
const PUNCT_SYMBOLS = [
  { value: '', glyph: '—', label: 'Ninguno' },
  { value: ' :', glyph: ':', label: ': dos puntos' },
  { value: ' /', glyph: '/', label: '/ barra' },
  { value: ' ;', glyph: ';', label: '; punto y coma' },
  { value: ',', glyph: ',', label: ', coma' },
  { value: '.', glyph: '.', label: '. punto' },
  { value: ' +', glyph: '+', label: '+ más' },
];

// La tabla siempre reserva espacio visual para al menos esta cantidad de
// filas (datos + filas vacías) para que el área no se sienta angosta y para
// que el popover de puntuación nunca necesite scroll de página para verse
// completo. Superada esta cantidad, aparece scroll interno acotado a la
// propia tabla (con encabezado fijo), nunca scroll de la página completa.
const MIN_VISIBLE_ROWS = 6;

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

export default function BooksTable({ books, onSave, onExport, columnPunctuation, onPunctuationChange }) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;

  const [openMenuKey, setOpenMenuKey] = useState(null);

  useEffect(() => {
    if (!openMenuKey) return;
    const closeOnOutsideClick = () => setOpenMenuKey(null);
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [openMenuKey]);

  const setSymbolFor = (key, value) => {
    onPunctuationChange(key, value);
  };

  const symbolLabel = (value) => {
    const found = PUNCT_SYMBOLS.find((s) => s.value === value);
    return found ? found.label : 'Ninguno';
  };

  return (
    <div className="books-table-section">
      <div className="excel-wrap">
        <table className="excel-table">
          <thead>
            <tr className="col-letters">
              <th />
              {cats.map((_, i) => <th key={i}>{excelColumnLetters(i)}</th>)}
            </tr>
            <tr className="field-names">
              <th>1</th>
              {cats.map((cat, idx) => {
                const active = Boolean(columnPunctuation[cat.key]);
                const colLabel = cat.colLabel[lang] || cat.colLabel.es;
                // Por defecto la burbuja se abre hacia la izquierda (se
                // extiende sobre las columnas anteriores). Las primeras
                // columnas no tienen columnas previas donde extenderse, así
                // que para esas se invierte: se abre hacia la derecha.
                const nearFirstColumn = idx <= 1;
                return (
                  <th key={cat.key} className="field-names__cell">
                    <span className="field-names__label">
                      {colLabel}
                      {cat.marcTag && <span className="field-names__tag">{cat.marcTag}</span>}
                    </span>
                    <button
                      type="button"
                      className={`col-punct-corner${active ? ' col-punct-corner--active' : ''}`}
                      aria-label={`Elegir puntuación para ${colLabel}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuKey((prev) => (prev === cat.key ? null : cat.key));
                      }}
                    />
                    {openMenuKey === cat.key && (
                      <div
                        className={`punct-pop${nearFirstColumn ? ' punct-pop--right' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="punct-pop__title">
                          Puntuación · <span>{colLabel}{cat.marcTag ? ` ${cat.marcTag}` : ''}</span>
                        </p>
                        <div className="punct-grid">
                          {PUNCT_SYMBOLS.map((s) => {
                            const selected = (columnPunctuation[cat.key] || '') === s.value;
                            return (
                              <button
                                type="button"
                                key={s.label}
                                className={`punct-btn${s.value === '' ? ' punct-btn--none' : ''}${selected ? ' punct-btn--active' : ''}`}
                                aria-label={s.label}
                                onClick={() => setSymbolFor(cat.key, s.value)}
                              >
                                {s.glyph}
                              </button>
                            );
                          })}
                        </div>
                        <p className="punct-pop__caption">
                          Aplicado: <b>{symbolLabel(columnPunctuation[cat.key] || '')}</b>
                        </p>
                      </div>
                    )}
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
                  const val = book[cat.key] || '';
                  const suffix = val ? columnPunctuation[cat.key] : '';
                  return (
                    <td key={cat.key}>
                      {val}
                      {suffix && <span className="marc-sym">{suffix}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {Array.from({ length: Math.max(MIN_VISIBLE_ROWS - books.length, 1) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="empty-cell">{books.length + i + 2}</td>
                {cats.map((cat) => <td key={cat.key} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--outline" onClick={onSave}>
          {t.step03.save}
        </button>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          {t.step03.export}
        </button>
      </div>
    </div>
  );
}
