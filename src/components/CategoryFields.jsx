import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

export default function CategoryFields({ fields, onFieldChange, selection, onAssign, activeKey }) {
  const { lang, docType } = useApp();
  const t = useT(lang);
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const hasSelection = Boolean(selection.text && selection.text.trim());

  const handleEmptyInputMouseDown = (e, key) => {
    if (fields[key]) return; // ya tiene contenido: comportamiento normal de edición
    if (!hasSelection) return; // nada seleccionado: comportamiento normal (foco)
    e.preventDefault();
    onAssign(key);
    e.currentTarget.focus();
  };

  return (
    <div className="category-fields">
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
          {cats.map((cat) => (
            <div
              className={`category-grid__item${activeKey === cat.key ? ' category-grid__item--active' : ''}`}
              key={cat.key}
            >
              <div
                className="category-grid__head"
                role="button"
                tabIndex={0}
                onClick={() => onAssign(cat.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAssign(cat.key); } }}
              >
                <label htmlFor={`field-${cat.key}`}>{cat.fieldLabel[lang] || cat.fieldLabel.es}</label>
                {cat.marcTag && <span className="category-grid__tag">{cat.marcTag}</span>}
              </div>
              <input
                id={`field-${cat.key}`}
                type="text"
                value={fields[cat.key] || ''}
                onChange={(e) => onFieldChange(cat.key, e.target.value)}
                onMouseDown={(e) => handleEmptyInputMouseDown(e, cat.key)}
                placeholder={`${cat.fieldLabel[lang] || cat.fieldLabel.es}…`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
