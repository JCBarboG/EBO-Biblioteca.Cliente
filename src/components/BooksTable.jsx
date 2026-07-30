import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

// Símbolos de puntuación ISBD disponibles para el control manual por columna.
// Reemplaza la lógica automática que antes vivía en utils/marcSymbols.js —
// ver project_ebo_cliente_ui_decisions.md.
const PUNCT_SYMBOLS = [
  { value: '', label: 'Ninguno' },
  { value: ' :', label: ': dos puntos' },
  { value: ' /', label: '/ barra' },
  { value: ' ;', label: '; punto y coma' },
  { value: ',', label: ', coma' },
  { value: '.', label: '. punto' },
  { value: ' +', label: '+ más' },
];

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
    setOpenMenuKey(null);
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
              {cats.map((cat) => {
                const active = Boolean(columnPunctuation[cat.key]);
                return (
                  <th key={cat.key} className="field-names__cell">
                    <span className="field-names__label">
                      {cat.colLabel[lang] || cat.colLabel.es}
                      {cat.marcTag && <span className="field-names__tag">{cat.marcTag}</span>}
                    </span>
                    <button
                      type="button"
                      className={`col-punct-corner${active ? ' col-punct-corner--active' : ''}`}
                      aria-label={`Elegir puntuación para ${cat.colLabel[lang] || cat.colLabel.es}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuKey((prev) => (prev === cat.key ? null : cat.key));
                      }}
                    />
                    {openMenuKey === cat.key && (
                      <div className="punct-menu" onClick={(e) => e.stopPropagation()}>
                        {PUNCT_SYMBOLS.map((s) => (
                          <button
                            type="button"
                            key={s.label}
                            className="punct-menu__item"
                            onClick={() => setSymbolFor(cat.key, s.value)}
                          >
                            {s.label}
                          </button>
                        ))}
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
            <tr>
              <td className="empty-cell">{books.length + 2}</td>
              {cats.map((cat) => <td key={cat.key} />)}
            </tr>
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
