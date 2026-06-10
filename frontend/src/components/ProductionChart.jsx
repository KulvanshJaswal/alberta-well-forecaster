import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const formatMonth = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ProductionChart({ data, fluid, color, domain }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No production data available.</p>;
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.month) - new Date(b.month))
    .map((r) => ({ label: formatMonth(r.month), value: r[fluid] ?? null }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="label" stroke="#a1a1a1" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis domain={domain} stroke="#a1a1a1" tick={{ fontSize: 11 }} label={{ value: 'm³', angle: -90, position: 'insideLeft', fill: '#a1a1a1', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fafafa' }} />
        <Line type="monotone" dataKey="value" stroke={color} dot={false} name="Actual" strokeWidth={2} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
