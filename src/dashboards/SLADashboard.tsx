import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Clock, AlertCircle, CheckCircle, Timer } from 'lucide-react';
import { useFilterStore, filterOrders, filterMetrics } from '../store/filterStore';

const BREACH_REASONS = [
  { reason: 'Traffic Delay', count: 28 },
  { reason: 'Multiple Attempts', count: 22 },
  { reason: 'Route Deviation', count: 18 },
  { reason: 'Customer Unavailable', count: 15 },
  { reason: 'Address Issue', count: 11 },
  { reason: 'Vehicle Breakdown', count: 6 },
];

export default function SLADashboard() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);
  const metrics = useMemo(() => filterMetrics(f), [f.dateFrom, f.dateTo]);

  // SLA only applies to concluded orders (delivered + failed); exclude pending/in-transit
  const concluded = orders.filter(o => o.status === 'delivered' || o.status === 'failed').length;
  const breaches  = orders.filter(o => o.slaBreach).length;
  const onTime    = concluded - breaches;
  const slaRate   = concluded > 0 ? ((onTime / concluded) * 100).toFixed(1) : '0.0';

  const trend = metrics.map(m => ({
    date: m.date.slice(5),
    breaches: m.slaBreaches,
    // Use delivered as denominator — SLA only applies to concluded deliveries
    rate: m.delivered > 0 ? +((1 - m.slaBreaches / m.delivered) * 100).toFixed(1) : 100,
  }));

  const byHub = orders.reduce<Record<string, { total: number; breach: number }>>((acc, o) => {
    if (!acc[o.hub]) acc[o.hub] = { total: 0, breach: 0 };
    acc[o.hub].total++;
    if (o.slaBreach) acc[o.hub].breach++;
    return acc;
  }, {});
  const hubData = Object.entries(byHub).map(([hub, v]) => ({
    hub: hub.replace('-Hub','').replace('-Central',''),
    slaRate: v.total > 0 ? +((1 - v.breach / v.total) * 100).toFixed(1) : 100,
    breaches: v.breach,
    total: v.total,
  })).sort((a, b) => a.slaRate - b.slaRate);

  const timeSlots = [
    { slot: '9AM–12PM', onTime: 91, breach: 9 },
    { slot: '12PM–3PM', onTime: 87, breach: 13 },
    { slot: '3PM–6PM', onTime: 83, breach: 17 },
    { slot: '6PM–9PM', onTime: 78, breach: 22 },
  ];

  return (
    <div>
      <div className="page-title">SLA Dashboard</div>
      <div className="page-sub">Service Level Agreement compliance and breach analysis</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'SLA Compliance Rate', value: `${slaRate}%`, icon: <CheckCircle size={18} />, color: +slaRate >= 90 ? '#059669' : '#D97706', bg: +slaRate >= 90 ? '#ECFDF5' : '#FFFBEB' },
          { label: 'On-Time Deliveries', value: onTime.toLocaleString(), icon: <Clock size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'SLA Breaches', value: breaches.toLocaleString(), icon: <AlertCircle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Avg Delay (mins)', value: '24', icon: <Timer size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">SLA Compliance Trend</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Daily SLA rate vs target (90%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, 'SLA Rate']} />
              <ReferenceLine y={90} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target 90%', fontSize: 10, fill: '#059669' }} />
              <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} dot={false} name="SLA Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Breach Reasons</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Top causes of SLA breaches</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BREACH_REASONS} layout="vertical" margin={{ top: 0, right: 16, left: 100, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#FCA5A5" name="Breaches" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid chart-grid-21">
        <div className="chart-card">
          <div className="chart-card-title">Hub SLA Performance</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>SLA compliance rate by hub</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hubData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize: 10 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="slaRate" radius={[4,4,0,0]} name="SLA Rate">
                {hubData.map(h => <Cell key={h.hub} fill={h.slaRate >= 90 ? '#059669' : h.slaRate >= 80 ? '#D97706' : '#DC2626'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Time Slot Adherence</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {timeSlots.map(s => (
              <div key={s.slot}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.slot}</span>
                  <span style={{ fontSize: 12, color: s.onTime >= 85 ? '#059669' : '#D97706', fontWeight: 700 }}>{s.onTime}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${s.onTime}%`, background: s.onTime >= 85 ? '#059669' : '#D97706' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
