import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWell, getProduction, getForecast } from '../api/client';
import ProductionChart from '../components/ProductionChart';
import ForecastChart from '../components/ForecastChart';
import { statusColorClass } from '../utils/status';

const FLUIDS = [
  { key: 'oil', label: 'Oil', color: '#00bb7f' },
  { key: 'gas', label: 'Gas', color: '#f99c00' },
  { key: 'water', label: 'Water', color: '#1447e6' },
];

function fluidDomain(production, forecast, fluid) {
  const vals = [
    ...production.map((r) => r[fluid]).filter((v) => v != null),
    ...(forecast?.[fluid]?.forecast || []).filter((v) => v != null),
  ];
  const max = Math.max(0, ...vals);
  return [0, Math.ceil(max * 1.1) || 1];
}

function EurCard({ label, value, color }) {
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <span className="kpi-label">{label} EUR</span>
      <span className="kpi-value">
        {value != null ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })} m³` : 'N/A'}
      </span>
    </div>
  );
}

export default function WellDetail() {
  const { uwi } = useParams();
  const navigate = useNavigate();

  const [well, setWell] = useState(null);
  const [production, setProduction] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getWell(uwi), getProduction(uwi), getForecast(uwi)])
      .then(([wellRes, prodRes, fcRes]) => {
        setWell(wellRes.data);
        setProduction(prodRes.data);
        setForecast(fcRes.data);
      })
      .catch(() => setError('Failed to load well data.'))
      .finally(() => setLoading(false));
  }, [uwi]);

  if (loading) return <div className="page"><p className="loading">Loading…</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!well) return <div className="page"><p className="error">Well not found.</p></div>;

  const anomalies = [
    ...(forecast?.oil?.anomalies || []).map((a) => ({ ...a, product: 'Oil' })),
    ...(forecast?.gas?.anomalies || []).map((a) => ({ ...a, product: 'Gas' })),
    ...(forecast?.water?.anomalies || []).map((a) => ({ ...a, product: 'Water' })),
  ].sort((a, b) => new Date(a.month) - new Date(b.month));

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to wells</button>

      <div className="well-info-card">
        <div className="info-row">
          <span className="info-label">UWI</span>
          <span className="info-value mono">{well.uwi}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Licensee</span>
          <span className="info-value">{well.licensee}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status</span>
          <span className="info-value">
            <span className={`status-dot ${statusColorClass(well.status)}`} />
            {well.status}
          </span>
        </div>
        {well.latitude != null && (
          <div className="info-row">
            <span className="info-label">Coordinates</span>
            <span className="info-value">{well.latitude?.toFixed(4)}°N, {well.longitude?.toFixed(4)}°W</span>
          </div>
        )}
      </div>

      <div className="kpi-row">
        <EurCard label="Oil" value={forecast?.oil?.eur} color="#00bb7f" />
        <EurCard label="Gas" value={forecast?.gas?.eur} color="#f99c00" />
        <EurCard label="Water" value={forecast?.water?.eur} color="#1447e6" />
      </div>

      <section className="chart-section">
        <h2 className="section-title">Production &amp; Forecast</h2>
        <p className="chart-note">
          Showing available production data (24 months max). Curve fitted on {production.length} month{production.length === 1 ? '' : 's'} of data — more data will improve forecast accuracy.
        </p>
        <div className="chart-grid">
          <div className="chart-grid-header">Production History</div>
          <div className="chart-grid-header">Forecast (12-month Arps decline)</div>
          {FLUIDS.map(({ key, label, color }) => {
            const domain = fluidDomain(production, forecast, key);
            return (
              <Fragment key={key}>
                <div className="chart-cell">
                  <span className="chart-cell-label" style={{ color }}>{label}</span>
                  <ProductionChart data={production} fluid={key} color={color} domain={domain} />
                </div>
                <div className="chart-cell">
                  <span className="chart-cell-label" style={{ color }}>{label}</span>
                  <ForecastChart production={production} forecast={forecast} fluid={key} color={color} domain={domain} />
                </div>
              </Fragment>
            );
          })}
        </div>
      </section>

      <section className="anomaly-section">
        <h2 className="section-title">Anomalies Detected</h2>
        {anomalies.length === 0 ? (
          <div className="anomaly-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
            No anomalies detected
          </div>
        ) : (
          <div className="table-wrap">
            <table className="well-table">
              <thead>
                <tr>
                  <th>Fluid</th>
                  <th>Month</th>
                  <th>Actual (m³)</th>
                  <th>Predicted (m³)</th>
                  <th>Deviation (m³)</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a, i) => (
                  <tr key={i} className="anomaly-row">
                    <td>{a.product}</td>
                    <td className="mono">{a.month?.slice(0, 10)}</td>
                    <td>{Number(a.actual).toFixed(1)}</td>
                    <td>{Number(a.predicted).toFixed(1)}</td>
                    <td style={{ color: a.deviation > 0 ? '#00bb7f' : '#ff6568' }}>
                      {a.deviation > 0 ? '+' : ''}{Number(a.deviation).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
