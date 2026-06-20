import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useFilterStore, filterOrders, filterMetrics } from '../store/filterStore';
import { exceptionBreakdown } from '../data/mockData';

export default function ExceptionDashboard() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);
  const metrics = useMemo(() => filterMetrics(f), [f.dateFrom, f.dateTo]);

  const exceptions = orders.filter(o => o.status === 'exception');
  const total = exceptions.length;
  const resolved = Math.floor(total * 0.62);
  const open = total - resolved;
  const avgResolution = 4.2;

  const typeBreakdown = orders.reduce<Record<string, number>>((acc, o) => {
    if (o.exception) { acc[o.exception] = (acc[o.exception] ?? 0) + 1; }
    return acc;
  }, {});
  const typeData = Object.entries(typeBreakdown).map(([type, count]) => ({
    type: type.length > 20 ? type.slice(0, 18) + '…' : type,
    fullType: type, count,
    resolved: Math.floor(count * (0.5 + Math.random() * 0.4)),
  })).sort((a, b) => b.count - a.count);

  const trend = metrics.map(m => ({ date: m.date.slice(5), exceptions: m.exceptions }));

  return (
    <div>
      <div className="page-title">Exception Dashboard</div>
      <div className="page-sub">Monitor, track and resolve delivery exceptions across the network</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Exceptions', value: total, icon: <AlertTriangle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Open Exceptions', value: open, icon: <XCircle size={18} />, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Resolved', value: resolved, icon: <CheckCircle size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'Avg Resolution (hrs)', value: avgResolution, icon: <Clock size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
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

      <div className="chart-grid chart-grid-21" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Exception Types</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Count by exception category</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeData.length ? typeData : exceptionBreakdown.map(e => ({ type: e.type.slice(0,18), count: e.count, resolved: e.resolved }))}
              layout="vertical" margin={{ top: 0, right: 16, left: 120, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#FCA5A5" name="Total" radius={[0,3,3,0]} />
              <Bar dataKey="resolved" fill="#059669" name="Resolved" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Exception Trend</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Daily exception count</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="exceptions" stroke="#DC2626" strokeWidth={2} dot={false} name="Exceptions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Open Exception Queue</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>AWB</th><th>Customer</th><th>City</th><th>Hub</th><th>Rider</th><th>Exception Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {exceptions.slice(0, 12).map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.awb.slice(-10)}</td>
                  <td>{o.customer}</td>
                  <td>{o.city}</td>
                  <td>{o.hub}</td>
                  <td>{o.rider}</td>
                  <td><span className="badge badge-warning">{o.exception}</span></td>
                  <td><span className="badge badge-danger">Open</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
