import { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLicensees, getLicenseeSummary } from '../api/client';
import { statusColorHex } from '../utils/status';

export default function LicenseeSummary() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLicensee, setSelectedLicensee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      getLicensees(inputValue)
        .then((res) => {
          setSuggestions(res.data);
          setShowDropdown(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [inputValue]);

  useEffect(() => {
    if (!selectedLicensee) return;
    setLoadingSummary(true);
    setError(null);
    getLicenseeSummary(selectedLicensee)
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load licensee summary.'))
      .finally(() => setLoadingSummary(false));
  }, [selectedLicensee]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setSelectedLicensee(null);
    setSummary(null);
  };

  const handleSelect = (name) => {
    setInputValue(name);
    setSelectedLicensee(name);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowDropdown(false), 150);
  };

  const chartData = summary
    ? Object.entries(summary.status_breakdown).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Licensee Summary</h1>
        <p className="subtitle">Search a licensee to see total wells and status breakdown</p>
      </header>

      <div className="combobox-wrap">
        <input
          className="search-input"
          type="text"
          placeholder="Search licensee name…"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={handleBlur}
        />
        {showDropdown && suggestions.length > 0 && (
          <div className="combobox-dropdown">
            {suggestions.map((name) => (
              <div
                key={name}
                className="combobox-option"
                onMouseDown={() => handleSelect(name)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {!selectedLicensee && <p className="no-data">Search for a licensee above.</p>}
      {error && <p className="error">{error}</p>}

      {selectedLicensee && loadingSummary && <p className="loading">Loading…</p>}

      {selectedLicensee && !loadingSummary && summary && (
        <>
          <div className="kpi-card" style={{ maxWidth: 240, marginTop: 20, marginBottom: 24 }}>
            <span className="kpi-label">Total Wells</span>
            <span className="kpi-value">{summary.total_wells.toLocaleString()}</span>
          </div>

          <section className="chart-section">
            <h2 className="section-title">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="status" stroke="#a1a1a1" tick={{ fontSize: 11 }} />
                <YAxis stroke="#a1a1a1" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fafafa' }} />
                <Bar dataKey="count">
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={statusColorHex(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </div>
  );
}
