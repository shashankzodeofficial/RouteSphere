import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';
import { useFilterStore, filterOrders, filterMetrics } from '../store/filterStore';

export default function SuccessRate() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);
  const metrics = useMemo(() => filterMetrics(f), [f.dateFrom, f.dateTo]);

  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const failed     = orders.filter(o => o.status === 'failed').length;
  const concluded  = delivered + failed;   // pending/in-transit haven't resolved yet
  const total      = orders.length;        // kept for "Total Attempted" label only
  const rate       = concluded > 0 ? (delivered / concluded) * 100 : 0;

  // By hub
  const hubMap = orders.reduce<Record<string, { d: number; t: number }>>((acc, o) => {
    if (!acc[o.hub]) acc[o.hub] = { d: 0, t: 0 };
    acc[o.hub].t++;
    if (o.status === 'delivered') acc[o.hub].d++;
    return acc;
  }, {});
  const byHub = Object.entries(hubMap).map(([hub, v]) => ({
    hub: hub.replace('-Hub', '').replace('-Central', ''),
    rate: +((v.d / v.t) * 100).toFixed(1),
    delivered: v.d, total: v.t,
  })).sort((a, b) => b.rate - a.rate);

  // Trend
  const trend = metrics.map(m => ({
    date: m.date.slice(5),
    rate: +((m.delivered / m.attempted) * 100).toFixed(1),
  }));

  // Day of week
  const dowMap: Record<string, { d: number; t: number }> = {};
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  metrics.forEach(m => {
    const day = DAYS[new Date(m.date).getDay()];
    if (!dowMap[day]) dowMap[day] = { d: 0, t: 0 };
    dowMap[day].d += m.delivered;
    dowMap[day].t += m.attempted;
  });
  const byDay = DAYS.map(d => ({
    day: d,
    rate: dowMap[d] ? +((dowMap[d].d / dowMap[d].t) * 100).toFixed(1) : 0,
  }));

  const rateColor = rate >= 85 ? '#059669' : rate >= 70 ? '#D97706' : '#DC2626';

  return (
    <div>
      <div className="page-title">Success Rate Dashboard</div>
      <div className="page-sub">Delivery success analysis across hubs, cities and time periods</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Overall Success Rate', value: `${rate.toFixed(1)}%`, icon: <Target size={18} />, color: rateColor, bg: rate >= 85 ? '#ECFDF5' : rate >= 70 ? '#FFFBEB' : '#FEF2F2' },
          { label: 'Total Delivered', value: delivered.toLocaleString(), icon: <Award size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'Concluded Orders', value: concluded.toLocaleString(), icon: <TrendingUp size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Best Hub Rate', value: byHub[0] ? `${byHub[0].rate}%` : '—', icon: <AlertCircle size={18} />, color: '#7C3AED', bg: '#F5F3FF', sub: byHub[0]?.hub },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            {k.sub && <div className="kpi-sub">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Success Rate Trend</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Daily success rate over selected period</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(trend.length / 7)} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Success Rate']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={85} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target 85%', fontSize: 10, fill: '#059669' }} />
              <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} dot={false} name="Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Success by Day of Week</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Average success rate per weekday</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Success Rate']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="rate" radius={[4,4,0,0]} name="Rate">
                {byDay.map(d => (
                  <Cell key={d.day} fill={d.rate >= 85 ? '#059669' : d.rate >= 75 ? '#D97706' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Hub-wise Success Rate</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hub</th>
                <th>Success Rate</th>
                <th>Delivered</th>
                <th>Total</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {byHub.map(h => (
                <tr key={h.hub}>
                  <td style={{ fontWeight: 600 }}>{h.hub}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: h.rate >= 85 ? '#059669' : h.rate >= 75 ? '#D97706' : '#DC2626' }}>
                      {h.rate}%
                    </span>
                  </td>
                  <td>{h.delivered}</td>
                  <td>{h.total}</td>
                  <td style={{ minWidth: 140 }}>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div className="progress-fill" style={{
                        width: `${h.rate}%`,
                        background: h.rate >= 85 ? '#059669' : h.rate >= 75 ? '#D97706' : '#DC2626',
                      }} />
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
