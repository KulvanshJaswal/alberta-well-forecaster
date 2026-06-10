import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWells } from '../api/client';
import WellMap from '../components/WellMap';
import { statusColorClass } from '../utils/status';
import { formatLicensee } from '../utils/format';

export default function WellList() {
  const [wells, setWells] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getWells(100)
      .then((res) => setWells(res.data))
      .catch(() => setError('Failed to load wells. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = wells.filter(
    (w) =>
      w.uwi.toLowerCase().includes(search.toLowerCase()) ||
      (w.licensee || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = wells.reduce(
    (acc, w) => {
      if (w.status === 'ABD') acc.ABD++;
      else if (w.status === 'SUSP') acc.SUSP++;
      else if (w.status === 'PUMP') acc.PUMP++;
      else acc.other++;
      return acc;
    },
    { ABD: 0, SUSP: 0, PUMP: 0, other: 0 }
  );

  return (
    <div className="page">
      <header className="page-header">
        <p className="subtitle">Real AER + Petrinex data — Arps decline curve forecasting</p>
      </header>

      <section className="map-section">
        <WellMap wells={wells} />
      </section>

      <section className="table-section">
        <div className="table-toolbar">
          <span className="well-count">Showing first {wells.length} wells</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search UWI, licensee, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="loading">Loading wells…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="status-summary">
            <span className="status-summary-item"><span className="status-dot status-red" /> ABD: {statusCounts.ABD}</span>
            <span className="status-summary-item"><span className="status-dot status-yellow" /> SUSP: {statusCounts.SUSP}</span>
            <span className="status-summary-item"><span className="status-dot status-green" /> PUMP: {statusCounts.PUMP}</span>
            <span className="status-summary-item"><span className="status-dot status-grey" /> Other: {statusCounts.other}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="well-table">
              <thead>
                <tr>
                  <th>UWI</th>
                  <th>Licensee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr
                    key={w.uwi}
                    className="well-row"
                    onClick={() => navigate(`/wells/${encodeURIComponent(w.uwi)}`)}
                  >
                    <td className="mono">{w.uwi}</td>
                    <td>{formatLicensee(w.licensee)}</td>
                    <td>
                      <span className={`status-dot ${statusColorClass(w.status)}`} />
                      {w.status}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="no-data">No matching wells.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
