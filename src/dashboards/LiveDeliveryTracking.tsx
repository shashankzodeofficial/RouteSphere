import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Package, CheckCircle, XCircle, Clock, Truck, AlertTriangle } from 'lucide-react';
import { useFilterStore, filterOrders, filterMetrics } from '../store/filterStore';
import { useLiveDataStore } from '../store/liveDataStore';
import { hourlyDeliveries } from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#059669', out_for_delivery: '#2563EB',
  failed: '#DC2626', pending: '#D97706', rto: '#7C3AED', exception: '#DB2777',
};
const STATUS_LABELS: Record<string, string> = {
  delivered: 'Delivered', out_for_delivery: 'Out for Delivery',
  failed: 'Failed', pending: 'Pending', rto: 'RTO', exception: 'Exception',
};

export default function LiveDeliveryTracking() {
  const f = useFilterStore();
  const { kpis, events } = useLiveDataStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);
  const metrics = useMemo(() => filterMetrics(f), [f.dateFrom, f.dateTo]);

  // Total Orders = Delivered + In-Transit + Failed (the only consistent tally)
  const delivered      = kpis.deliveriesToday;
  const outForDelivery = kpis.deliveriesInTransit;
  const failed         = kpis.deliveriesFailed;
  const total          = delivered + outForDelivery + failed;
  const pending      = orders.filter(o => o.status === 'pending').length;
  const exceptions   = orders.filter(o => o.status === 'exception').length;
  const successRate  = kpis.successRateLive.toFixed(1);

  const pieData = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const trendData = metrics.slice(-14).map(m => ({
    date: m.date.slice(5), delivered: m.delivered, failed: m.failed, rto: m.rto,
  }));

  const liveOrders = orders.filter(o => o.status === 'out_for_delivery').slice(0, 10);

  return (
    <div>
      <div className="page-title">Live Delivery Tracking</div>
      <div className="page-sub">Real-time view of all active deliveries across the network</div>

      <div className="kpi-grid kpi-grid-5" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Orders', value: total, icon: <Package size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Delivered', value: delivered, icon: <CheckCircle size={18} />, color: '#059669', bg: '#ECFDF5', trend: `${successRate}%` },
          { label: 'Out for Delivery', value: outForDelivery, icon: <Truck size={18} />, color: '#0891B2', bg: '#ECFEFF' },
          { label: 'Failed', value: failed, icon: <XCircle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Exceptions', value: exceptions, icon: <AlertTriangle size={18} />, color: '#D97706', bg: '#FFFBEB' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              {k.trend && <span className="kpi-trend up">{k.trend}</span>}
            </div>
            <div className="kpi-value">{k.value.toLocaleString()}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-21" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title">Hourly Delivery Timeline</div>
              <div className="chart-card-sub">Deliveries by hour of day</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyDeliveries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="delivered" stroke="#2563EB" strokeWidth={2} fill="url(#gDel)" name="Delivered" />
              <Area type="monotone" dataKey="failed" stroke="#DC2626" strokeWidth={2} fill="url(#gFail)" name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title">Status Breakdown</div>
              <div className="chart-card-sub">Current distribution</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={2}>
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n as string] ?? n]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend" style={{ justifyContent: 'center', marginTop: 8 }}>
            {pieData.map(d => (
              <div className="legend-item" key={d.name}>
                <div className="legend-dot" style={{ background: STATUS_COLORS[d.name] }} />
                {STATUS_LABELS[d.name] ?? d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid chart-grid-21">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title">14-Day Delivery Trend</div>
              <div className="chart-card-sub">Daily delivery outcomes</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="delivered" fill="#059669" name="Delivered" radius={[2,2,0,0]} />
              <Bar dataKey="failed" fill="#DC2626" name="Failed" radius={[2,2,0,0]} />
              <Bar dataKey="rto" fill="#7C3AED" name="RTO" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Live Event Feed</div>
          <div className="chart-card-sub" style={{ marginBottom: 8 }}>Real-time delivery &amp; return events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {events.filter(e => ['delivery_completed','delivery_failed','return_picked_up','pickup_started'].includes(e.type)).slice(0, 12).map(e => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', background: 'var(--surface-2)', borderRadius: 6,
                borderLeft: `3px solid ${e.type === 'delivery_completed' ? '#10B981' : e.type === 'delivery_failed' ? '#EF4444' : '#F59E0B'}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {e.type === 'delivery_completed' ? '✅' : e.type === 'delivery_failed' ? '❌' : '↩'} {e.rider}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{e.hub} · {new Date(e.timestamp).toLocaleTimeString('en-IN',{hour12:false})}</div>
                </div>
                <span className={`badge ${e.type === 'delivery_completed' ? 'badge-success' : e.type === 'delivery_failed' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                  {e.type.replace(/_/g,' ')}
                </span>
              </div>
            ))}
            {events.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 20 }}>Events loading…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
