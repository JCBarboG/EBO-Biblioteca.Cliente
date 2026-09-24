import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/translations';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  HISTORY_LIMIT, formatPackageDate, loadHistory, writeHistory,
} from '../utils/history';

const FILTERS = ['all', 'libro', 'articulosLibro', 'articuloRevista', 'tesis', 'revista'];

export default function HistoryView({ onBack, onLoad, onDownload, showToast }) {
  const { lang } = useApp();
  const t = useT(lang);
  const th = t.history;

  const [packages, setPackages] = useState(loadHistory);
  const [filter, setFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);

  const visible = useMemo(
    () => (filter === 'all' ? packages : packages.filter((p) => p.docType === filter)),
    [packages, filter],
  );

  const confirmDelete = () => {
    const next = packages.filter((p) => p.id !== toDelete.id);
    try {
      writeHistory(next);
      setPackages(next);
      showToast(th.deleted);
    } catch {
      showToast(th.deleteError);
    }
    setToDelete(null);
  };

  return (
    <div className="view">
      <div className="view-header">
        <button type="button" className="view-back" onClick={onBack}>←</button>
        <h2>{th.title}</h2>
      </div>

      <div className="view-body history">
        <div className="history__top">
          <p className="history__count">{th.counter(packages.length, HISTORY_LIMIT)}</p>
          <div className="history__filters" role="tablist" aria-label={th.filterLabel}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={`history__filter${filter === f ? ' history__filter--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? th.all : th.types[f]}
              </button>
            ))}
          </div>
        </div>

        <p className="history__notice">{th.notice}</p>

        {visible.length === 0 ? (
          <p className="history__empty">{packages.length === 0 ? th.empty : th.emptyFilter}</p>
        ) : (
          <ul className="history__list">
            {visible.map((p) => (
              <li key={p.id} className="history-card">
                <div className="history-card__info">
                  <span className="history-card__date">{formatPackageDate(p.createdAt)}</span>
                  <div className="history-card__meta">
                    <span className="history-card__type">{th.types[p.docType] || p.docType}</span>
                    <span className="history-card__rows">{th.records(p.rowCount ?? p.rows.length)}</span>
                  </div>
                </div>
                <div className="history-card__actions">
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => onDownload(p)}>
                    {th.download}
                  </button>
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => onLoad(p)}>
                    {th.load}
                  </button>
                  <button type="button" className="btn btn--danger-outline btn--sm" onClick={() => setToDelete(p)}>
                    {th.remove}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={th.deleteTitle}
        message={toDelete ? th.packageSummary(formatPackageDate(toDelete.createdAt), th.types[toDelete.docType], toDelete.rowCount) : ''}
        onCancel={() => setToDelete(null)}
        actions={[
          { label: th.cancel, variant: 'outline', onClick: () => setToDelete(null) },
          { label: th.remove, variant: 'danger', onClick: confirmDelete },
        ]}
      />
    </div>
  );
}
