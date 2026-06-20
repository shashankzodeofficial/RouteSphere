import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useFilterStore, filterOrders, filterMetrics } from '../store/filterStore';

export default function CODCollection() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);
  const metrics = useMemo(() => filterMetrics(f), [f.dateFrom, f.dateTo]);

  const codOrders = orders.filter(o => o.cod > 0);
  const collected = orders.filter(o => o.cod > 0 && o.codCollected);
  const totalExpected = codOrders.reduce((s, o) => s + o.cod, 0);
  const totalCollected = collected.reduce((s, o) => s + o.cod, 0);
  const pending = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0.0';

  const trend = metrics.map(m => ({
    date: m.date.slice(5),
    expected: Math.round(m.cod / 1000),
    collected: Math.round(m.codCollected / 1000),
  }));

  const byHub = orders.reduce<Record<string, { exp: number; col: number }>>((acc, o) => {
    if (o.cod > 0) {
      if (!acc[o.hub]) acc[o.hub] = { exp: 0, col: 0 };
      acc[o.hub].exp += o.cod;
      if (o.codCollected) acc[o.hub].col += o.cod;
    }
    return acc;
  }, {});
  const hubData = Object.entries(byHub).map(([hub, v]) => ({
    hub: hub.replace('-Hub','').replace('-Central',''),
    expected: Math.round(v.exp / 1000),
    collected: Math.round(v.col / 1000),
    rate: v.exp > 0 ? +((v.col / v.exp) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.expected - a.expected);

  const fmt = (v: number) => v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

  return (
    <div>
      <div className="page-title">COD Collection Dashboard</div>
      <div className="page-sub">Cash on Delivery collection status and reconciliation</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total COD Expected', value: fmt(totalExpected), icon: <DollarSign size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Total COD Collected', value: fmt(totalCollected), icon: <CheckCircle size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'Pending Collection', value: fmt(pending), icon: <AlertCircle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: <TrendingUp size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Daily COD Trend (₹ '000s)</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Expected vs collected daily</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BFDBFE" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#BFDBFE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${v}K`]} />
              <Area type="monotone" dataKey="expected" stroke="#2563EB" fill="url(#gExp)" strokeWidth={2} name="Expected" />
              <Area type="monotone" dataKey="collected" stroke="#059669" fill="url(#gCol)" strokeWidth={2} name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Hub-wise COD Collection (₹ '000s)</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Expected vs collected by hub</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hubData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${v}K`]} />
              <Bar dataKey="expected" fill="#BFDBFE" name="Expected" radius={[3,3,0,0]} />
              <Bar dataKey="collected" fill="#059669" name="Collected" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Hub COD Summary</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Hub</th><th>Expected (₹)</th><th>Collected (₹)</th><th>Pending (₹)</th><th>Rate</th><th>Progress</th></tr>
            </thead>
            <tbody>
              {hubData.map(h => (
                <tr key={h.hub}>
                  <td style={{ fontWeight: 600 }}>{h.hub}</td>
                  <td>₹{(h.expected * 1000).toLocaleString('en-IN')}</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>₹{(h.collected * 1000).toLocaleString('en-IN')}</td>
                  <td style={{ color: '#DC2626' }}>₹{((h.expected - h.collected) * 1000).toLocaleString('en-IN')}</td>
                  <td><span style={{ fontWeight: 700, color: h.rate >= 90 ? '#059669' : h.rate >= 80 ? '#D97706' : '#DC2626' }}>{h.rate}%</span></td>
                  <td style={{ minWidth: 120 }}>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div className="progress-fill" style={{ width: `${h.rate}%`, background: h.rate >= 90 ? '#059669' : h.rate >= 80 ? '#D97706' : '#DC2626' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
