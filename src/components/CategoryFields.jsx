import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

// `columns`: lista final (MARC + propias) de utils/columns.js → getColumns.
// Sin ella se usan las columnas MARC del tipo, como antes.
export default function CategoryFields({ fields, onFieldChange, selection, onAssign, activeKey, columns, flashKey }) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = columns || CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const hasSelection = Boolean(selection.text && selection.text.trim());

  const handleEmptyInputMouseDown = (e, key) => {
    if (fields[key]) return; // ya tiene contenido: comportamiento normal de edición
    if (!hasSelection) return; // nada seleccionado: comportamiento normal (foco)
    e.preventDefault();
    onAssign(key);
    e.currentTarget.focus();
  };

  return (
    <div className={`category-fields${hasSelection ? ' category-fields--selecting' : ''}`}>
      <div className="selection-bar">
        <p className="selection-bar__hint">
          {hasSelection ? (
            <>
              {t.step02.selectionPrefix}
              <span className="selection-bar__text">"{truncate(selection.text.trim(), 80)}"</span>
            </>
          ) : (
            t.step02.hint
          )}
        </p>
      </div>

      <div className="fields-scroll">
        <div className="category-grid">
          {cats.map((cat) => {
            const label = cat.fieldLabel[lang] || cat.fieldLabel.es;
            const empty = !String(fields[cat.key] || '').trim();
            const cls = [
              'category-grid__item',
              activeKey === cat.key && 'category-grid__item--active',
              cat.custom && 'category-grid__item--custom',
              flashKey === cat.key && 'oc-flash',
            ].filter(Boolean).join(' ');
            return (
              <div className={cls} key={cat.key}>
                <div
                  className="category-grid__head"
                  role="button"
                  tabIndex={0}
                  onClick={() => onAssign(cat.key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAssign(cat.key); } }}
                >
                  <label htmlFor={`field-${cat.key}`}>{label}</label>
                  <span className="category-grid__tags">
                    {cat.custom && <span className="oc-badge">{t.cols.custom}</span>}
                    {cat.marcTag
                      ? <span className="category-grid__tag">{cat.marcTag}</span>
                      : cat.custom && <span className="category-grid__tag category-grid__tag--none">{t.cols.noMarc}</span>}
                  </span>
                </div>
                <input
                  id={`field-${cat.key}`}
                  type="text"
                  className={hasSelection && empty ? 'field-input--target' : undefined}
                  value={fields[cat.key] || ''}
                  onChange={(e) => onFieldChange(cat.key, e.target.value)}
                  onMouseDown={(e) => handleEmptyInputMouseDown(e, cat.key)}
                  placeholder={`${label}…`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
