import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const formatMonth = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function buildChartData(production, forecast, fluid) {
  const sorted = [...production].sort((a, b) => new Date(a.month) - new Date(b.month));

  const historical = sorted.map((r) => ({
    label: formatMonth(r.month),
    hist: r[fluid] ?? null,
  }));

  if (!sorted.length) return historical;

  const lastDate = new Date(sorted[sorted.length - 1].month);
  const forecastRows = [];
  for (let i = 1; i <= 12; i++) {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + i);
    forecastRows.push({
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      fc: forecast?.[fluid]?.forecast?.[i - 1] ?? null,
    });
  }

  return [...historical, ...forecastRows];
}

export default function ForecastChart({ production, forecast, fluid, color, domain }) {
  if (!production || production.length === 0) {
    return <p className="no-data">No production data available.</p>;
  }

  const data = buildChartData(production, forecast, fluid);
  const hasForecast = !!forecast?.[fluid]?.forecast;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="label" stroke="#a1a1a1" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis domain={domain} stroke="#a1a1a1" tick={{ fontSize: 11 }} label={{ value: 'm³', angle: -90, position: 'insideLeft', fill: '#a1a1a1', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fafafa' }} />
        <Legend wrapperStyle={{ color: '#a1a1a1', fontSize: '0.8rem' }} />
        <Line type="monotone" dataKey="hist" stroke={color} dot={false} name="Actual" strokeWidth={2} connectNulls />
        {hasForecast && (
          <Line type="monotone" dataKey="fc" stroke={color} dot={false} name="Forecast" strokeWidth={2} strokeDasharray="5 5" connectNulls />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
