import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Warehouse, Package, TrendingUp, Layers } from 'lucide-react';
import { useFilterStore, filterHubs } from '../store/filterStore';

export default function HubDashboard() {
  const f = useFilterStore();
  const hubs = useMemo(() => filterHubs(f), [f.region, f.hub, f.city]);

  const totalVolume = hubs.reduce((s, h) => s + h.currentVolume, 0);
  const totalCapacity = hubs.reduce((s, h) => s + h.capacity, 0);
  const totalDelivered = hubs.reduce((s, h) => s + h.delivered, 0);
  const avgSort = hubs.length ? (hubs.reduce((s, h) => s + h.sortAccuracy, 0) / hubs.length).toFixed(1) : 0;
  const utilization = totalCapacity > 0 ? ((totalVolume / totalCapacity) * 100).toFixed(0) : 0;

  const barData = hubs.map(h => ({
    hub: h.name.replace('-Hub','').replace('-Central',''),
    capacity: h.capacity,
    volume: h.currentVolume,
    delivered: h.delivered,
    pending: h.pending,
    failed: h.failed,
  }));

  const radarData = hubs.slice(0, 1).map(h => [
    { metric: 'Utilization', value: +((h.currentVolume / h.capacity) * 100).toFixed(0) },
    { metric: 'Dispatch Rate', value: +((h.dispatched / h.currentVolume) * 100).toFixed(0) },
    { metric: 'Delivery Rate', value: +((h.delivered / h.dispatched) * 100).toFixed(0) },
    { metric: 'Sort Accuracy', value: +h.sortAccuracy.toFixed(0) },
    { metric: 'On-Time', value: 82 },
  ])[0] ?? [];

  return (
    <div>
      <div className="page-title">Hub Dashboard</div>
      <div className="page-sub">Operational overview of all fulfilment hubs and sort centres</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Active Hubs', value: hubs.length, icon: <Warehouse size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Total Volume', value: totalVolume.toLocaleString(), icon: <Package size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Avg Utilization', value: `${utilization}%`, icon: <Layers size={18} />, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Avg Sort Accuracy', value: `${avgSort}%`, icon: <TrendingUp size={18} />, color: '#059669', bg: '#ECFDF5' },
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

      <div className="chart-grid chart-grid-21" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Hub Volume & Performance</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Capacity, volume and delivery outcomes per hub</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="volume" fill="#BFDBFE" name="Volume" radius={[0,0,0,0]} />
              <Bar dataKey="delivered" fill="#059669" name="Delivered" radius={[0,0,0,0]} />
              <Bar dataKey="pending" fill="#FCD34D" name="Pending" radius={[0,0,0,0]} />
              <Bar dataKey="failed" fill="#FCA5A5" name="Failed" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Hub Health Radar</div>
          <div className="chart-card-sub" style={{ marginBottom: 8 }}>Key metrics for top hub</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Hub Performance Summary</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Hub</th><th>Region</th><th>Capacity</th><th>Volume</th><th>Utilization</th><th>Delivered</th><th>Sort Accuracy</th><th>Status</th></tr>
            </thead>
            <tbody>
              {hubs.map(h => {
                const util = +((h.currentVolume / h.capacity) * 100).toFixed(0);
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td><span className="badge badge-primary">{h.region}</span></td>
                    <td>{h.capacity}</td>
                    <td>{h.currentVolume}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${util}%`, background: util > 90 ? '#DC2626' : util > 75 ? '#D97706' : '#059669' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{util}%</span>
                      </div>
                    </td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>{h.delivered}</td>
                    <td><span style={{ fontWeight: 700, color: h.sortAccuracy >= 97 ? '#059669' : '#D97706' }}>{h.sortAccuracy.toFixed(1)}%</span></td>
                    <td>
                      <span className={`badge ${util <= 90 ? 'badge-success' : 'badge-danger'}`}>
                        {util <= 90 ? 'Optimal' : 'Overloaded'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
