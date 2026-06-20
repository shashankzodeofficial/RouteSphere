import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  getReturnsKPIs, getReturnsByStatus, getReturnsByReason,
  getReturnsByHub, getReturnsDailyTrend, getReconciliationBreakdown, RETURNS_RAW,
} from '../data/returnsData';
import { useLiveDataStore } from '../store/liveDataStore';

const STATUS_COLORS: Record<string, string> = {
  requested: '#F59E0B', approved: '#3B82F6', rejected_request: '#EF4444',
  pickup_scheduled: '#8B5CF6', pickup_failed: '#EF4444', picked_up: '#06B6D4',
  in_transit: '#6366F1', hub_received: '#F97316', verified: '#10B981', completed: '#059669',
};
const RECON_COLORS: Record<string, string> = { refund: '#10B981', replacement: '#3B82F6', rejection: '#EF4444' };

function KPICard({ label, value, sub, color = '#F5A623' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export default function ReturnsDashboard() {
  const staticKpis = useMemo(() => getReturnsKPIs(), []);
  const { kpis: live } = useLiveDataStore();
  // Merge static base with live increments
  const kpis = {
    ...staticKpis,
    total: staticKpis.total + live.returnsPickedUpToday,
    completed: staticKpis.completed + live.returnsReconciled,
    pickupFailed: staticKpis.pickupFailed + live.pickupFailuresToday,
  };
  const byStatus = useMemo(() => getReturnsByStatus(), []);
  const byReason = useMemo(() => getReturnsByReason(), []);
  const byHub = useMemo(() => getReturnsByHub(), []);
  const trend = useMemo(() => getReturnsDailyTrend(), []);
  const recon = useMemo(() => getReconciliationBreakdown(), []);
  const liveQueue = useMemo(() => RETURNS_RAW.filter(r => ['pickup_scheduled','approved','hub_received'].includes(r.status)).slice(0, 12), []);

  return (
    <div className="dashboard-grid">
      {/* KPI row */}
      <div className="widget span-full" style={{ display: 'flex', gap: 16 }}>
        <KPICard label="Total Returns"      value={kpis.total}                              color="#F5A623" />
        <KPICard label="Pending Action"     value={kpis.pending}                            color="#F59E0B" sub="Awaiting pickup / approval" />
        <KPICard label="Pickup Success Rate" value={`${kpis.pickupRate}%`}                 color="#10B981" />
        <KPICard label="Completed"          value={kpis.completed}                          color="#059669" sub="Fully reconciled" />
        <KPICard label="Pickup Failures"    value={kpis.pickupFailed}                       color="#EF4444" />
        <KPICard label="Total Refund Value" value={`₹${(kpis.totalRefundValue / 1000).toFixed(0)}K`} color="#6366F1" />
      </div>

      {/* 14-day trend */}
      <div className="widget span-2">
        <div className="widget-title">14-Day Returns Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="requests"  stroke="#F59E0B" strokeWidth={2} dot={false} name="Requests" />
            <Line type="monotone" dataKey="pickups"   stroke="#3B82F6" strokeWidth={2} dot={false} name="Pickups" />
            <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={false} name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Return reasons */}
      <div className="widget">
        <div className="widget-title">Returns by Reason</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byReason} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis dataKey="reason" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} width={100} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#F5A623" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status breakdown pie */}
      <div className="widget">
        <div className="widget-title">Status Distribution</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {byStatus.map(entry => <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#475569'} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {byStatus.map(s => (
            <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[s.status] ?? '#475569' }} />
              <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>{s.status.replace(/_/g, ' ')} ({s.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reconciliation decisions */}
      <div className="widget">
        <div className="widget-title">Reconciliation Decisions</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={recon} dataKey="count" nameKey="decision" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ decision, count }) => `${decision}: ${count}`} labelLine={false}>
              {recon.map(r => <Cell key={r.decision} fill={RECON_COLORS[r.decision] ?? '#475569'} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Per-hub breakdown */}
      <div className="widget span-2">
        <div className="widget-title">Returns by Hub</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byHub.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="hub" tick={{ fill: '#64748B', fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="total"     fill="#F5A623" name="Total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed"    fill="#EF4444" name="Failed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Live queue table */}
      <div className="widget span-full">
        <div className="widget-title">Live Action Queue</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Tracking</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Hub</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Reason</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Driver</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Days Open</th>
            </tr>
          </thead>
          <tbody>
            {liveQueue.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#0F1826' : 'transparent', borderBottom: '1px solid #1E293B10' }}>
                <td style={{ padding: '7px 10px', color: '#94A3B8' }}>{r.id}</td>
                <td style={{ padding: '7px 10px', color: '#F5A623', fontWeight: 600 }}>{r.tracking}</td>
                <td style={{ padding: '7px 10px', color: '#CBD5E1' }}>{r.customer}</td>
                <td style={{ padding: '7px 10px', color: '#94A3B8' }}>{r.hub}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: (STATUS_COLORS[r.status] ?? '#475569') + '25', color: STATUS_COLORS[r.status] ?? '#475569' }}>
                    {r.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '7px 10px', color: '#94A3B8', textTransform: 'capitalize' }}>{r.reason.replace(/_/g, ' ')}</td>
                <td style={{ padding: '7px 10px', color: '#CBD5E1' }}>{r.driver}</td>
                <td style={{ padding: '7px 10px', color: r.daysOpen > 5 ? '#EF4444' : '#94A3B8', fontWeight: r.daysOpen > 5 ? 700 : 400 }}>{r.daysOpen}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
