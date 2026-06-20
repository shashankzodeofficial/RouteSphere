import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, CheckCircle2, RotateCcw, ArrowLeftRight } from 'lucide-react';
import { useFilterStore, filterOrders } from '../store/filterStore';

export default function AttemptRate() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);

  const total = orders.length;
  const first  = orders.filter(o => o.attempt === 1 && o.status === 'delivered').length;
  const second = orders.filter(o => o.attempt === 2 && o.status === 'delivered').length;
  const third  = orders.filter(o => o.attempt >= 3 && o.status === 'delivered').length;
  const rto    = orders.filter(o => o.status === 'rto').length;
  const fa     = total > 0 ? ((first / total) * 100).toFixed(1) : 0;

  const attemptDist = [
    { name: '1st Attempt', value: first, color: '#059669' },
    { name: '2nd Attempt', value: second, color: '#2563EB' },
    { name: '3rd Attempt', value: third, color: '#D97706' },
    { name: 'RTO', value: rto, color: '#DC2626' },
  ];

  // By hub
  const hubAttempts = orders.reduce<Record<string, { fa: number; sa: number; ta: number; total: number }>>((acc, o) => {
    if (!acc[o.hub]) acc[o.hub] = { fa: 0, sa: 0, ta: 0, total: 0 };
    acc[o.hub].total++;
    if (o.attempt === 1 && o.status === 'delivered') acc[o.hub].fa++;
    if (o.attempt === 2 && o.status === 'delivered') acc[o.hub].sa++;
    if (o.attempt >= 3 && o.status === 'delivered') acc[o.hub].ta++;
    return acc;
  }, {});

  const byHub = Object.entries(hubAttempts).map(([hub, v]) => ({
    hub: hub.replace('-Hub','').replace('-Central',''),
    fa: v.total ? +((v.fa / v.total) * 100).toFixed(0) : 0,
    sa: v.total ? +((v.sa / v.total) * 100).toFixed(0) : 0,
    ta: v.total ? +((v.ta / v.total) * 100).toFixed(0) : 0,
  }));

  return (
    <div>
      <div className="page-title">Attempt Rate Analysis</div>
      <div className="page-sub">Breakdown of delivery attempts and first-attempt success across the network</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'First Attempt Rate', value: `${fa}%`, icon: <CheckCircle2 size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: '1st Attempt Delivered', value: first, icon: <RefreshCw size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Re-Attempts (2nd+3rd)', value: second + third, icon: <RotateCcw size={18} />, color: '#D97706', bg: '#FFFBEB' },
          { label: 'RTO Orders', value: rto, icon: <ArrowLeftRight size={18} />, color: '#DC2626', bg: '#FEF2F2' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: k.color }}>{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-21" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Attempt Distribution by Hub</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>% of orders per attempt tier per hub</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byHub} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="fa" stackId="a" fill="#059669" name="1st Attempt" radius={[0,0,0,0]} />
              <Bar dataKey="sa" stackId="a" fill="#2563EB" name="2nd Attempt" />
              <Bar dataKey="ta" stackId="a" fill="#D97706" name="3rd Attempt" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Overall Attempt Split</div>
          <div style={{ marginBottom: 8 }} />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={attemptDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                {attemptDist.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
            {attemptDist.map(d => (
              <div className="legend-item" key={d.name}>
                <div className="legend-dot" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Attempt Detail Table</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Hub</th><th>1st Attempt %</th><th>2nd Attempt %</th><th>3rd Attempt %</th><th>1st Attempt Bar</th></tr>
            </thead>
            <tbody>
              {byHub.map(h => (
                <tr key={h.hub}>
                  <td style={{ fontWeight: 600 }}>{h.hub}</td>
                  <td><span style={{ color: '#059669', fontWeight: 700 }}>{h.fa}%</span></td>
                  <td><span style={{ color: '#2563EB', fontWeight: 600 }}>{h.sa}%</span></td>
                  <td><span style={{ color: '#D97706', fontWeight: 600 }}>{h.ta}%</span></td>
                  <td style={{ minWidth: 140 }}>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div className="progress-fill" style={{ width: `${h.fa}%`, background: '#059669' }} />
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
