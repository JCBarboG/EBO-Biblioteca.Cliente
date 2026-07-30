import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';

export default function DocTypeSelector({ onTypeChange }) {
  const { lang, docType, setDocType } = useApp();
  const t = useT(lang);

  const types = [
    { key: 'libro', label: t.docTypes.libro },
    { key: 'articulosLibro', label: t.docTypes.articulosLibro },
    { key: 'revista', label: t.docTypes.revista },
    { key: 'articuloRevista', label: t.docTypes.articuloRevista },
    { key: 'tesis', label: t.docTypes.tesis },
  ];

  const handleChange = (key) => {
    setDocType(key);
    if (onTypeChange) onTypeChange(key);
  };

  return (
    <div className="doc-type-selector">
      {types.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`doc-type-tab${docType === key ? ' doc-type-tab--active' : ''}`}
          onClick={() => handleChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
