import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Zap, WifiOff, MapPin, Battery } from 'lucide-react';
import { useFilterStore, filterRiders } from '../store/filterStore';

export default function RiderTracking() {
  const f = useFilterStore();
  const riders = useMemo(() => filterRiders(f), [f.region, f.hub, f.city, f.deliveryPartner]);

  const active = riders.filter(r => r.status === 'active').length;
  const idle   = riders.filter(r => r.status === 'idle').length;
  const offline = riders.filter(r => r.status === 'offline').length;
  const avgDelivered = riders.length
    ? (riders.reduce((s, r) => s + r.ordersDelivered, 0) / riders.length).toFixed(1)
    : 0;

  const perf = riders.slice().sort((a, b) => b.ordersDelivered - a.ordersDelivered).slice(0, 10).map(r => ({
    name: r.name.split(' ')[0], delivered: r.ordersDelivered, assigned: r.ordersAssigned,
  }));

  const STATUS_COLOR: Record<string, string> = { active: '#059669', idle: '#D97706', offline: '#94A3B8' };

  return (
    <div>
      <div className="page-title">Rider Tracking</div>
      <div className="page-sub">Live status and performance of all delivery partners</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Riders', value: riders.length, icon: <Users size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Active', value: active, icon: <Zap size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'Idle', value: idle, icon: <MapPin size={18} />, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Offline', value: offline, icon: <WifiOff size={18} />, color: '#94A3B8', bg: '#F8FAFC' },
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
          <div className="chart-card-title">Top 10 Riders by Deliveries</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Assigned vs Delivered</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={perf} layout="vertical" margin={{ top: 0, right: 16, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={50} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="assigned" fill="#BFDBFE" name="Assigned" radius={[0,3,3,0]} />
              <Bar dataKey="delivered" fill="#2563EB" name="Delivered" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Avg Deliveries / Rider</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>{avgDelivered}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>orders / rider today</div>
            </div>
            {[
              { label: 'Highest', value: Math.max(...riders.map(r => r.ordersDelivered), 0), color: '#059669' },
              { label: 'Lowest (active)', value: Math.min(...riders.filter(r => r.status === 'active').map(r => r.ordersDelivered), 999) === 999 ? 0 : Math.min(...riders.filter(r => r.status === 'active').map(r => r.ordersDelivered)), color: '#DC2626' },
              { label: 'Avg Distance (km)', value: riders.length ? (riders.reduce((s, r) => s + r.distance, 0) / riders.length).toFixed(0) : 0, color: '#7C3AED' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Rider Status Grid</div>
        <div className="rider-grid">
          {riders.map(r => (
            <div className="rider-card" key={r.id}>
              <div className="rider-avatar" style={{ background: r.color }}>{r.name.slice(0, 2).toUpperCase()}</div>
              <div className="rider-info">
                <div className="rider-name">{r.name}</div>
                <div className="rider-meta">{r.hub} · {r.city}</div>
                <div className="rider-meta" style={{ marginTop: 2 }}>
                  {r.ordersDelivered}/{r.ordersAssigned} orders
                </div>
              </div>
              <div className="rider-status">
                <span className="badge" style={{
                  background: r.status === 'active' ? '#ECFDF5' : r.status === 'idle' ? '#FFFBEB' : '#F8FAFC',
                  color: STATUS_COLOR[r.status],
                }}>{r.status}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                  <Battery size={10} />
                  {r.battery}%
                </div>
                {r.status !== 'offline' && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.speed} km/h</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
