import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import {
  getRiderKPIs, getScoreDistribution, getEarningsBreakdownByHub,
  getEarningsTrend, getRatingDistribution, getTopPerformers, getBadgeSummary,
  RIDER_INTELLIGENCE,
} from '../data/riderIntelligenceData';
import { useLiveDataStore } from '../store/liveDataStore';

const STATUS_COLORS = { active: '#10B981', idle: '#F59E0B', offline: '#475569', on_leave: '#6366F1' };
const SCORE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#EF4444'];

function KPICard({ label, value, sub, color = '#F5A623', alert }: { label: string; value: string | number; sub?: string; color?: string; alert?: boolean }) {
  return (
    <div className="kpi-card" style={alert ? { borderTop: '3px solid #EF4444' } : {}}>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub" style={alert ? { color: '#EF4444' } : {}}>{sub}</div>}
    </div>
  );
}

export default function RiderIntelligenceDashboard() {
  const staticKpis = useMemo(() => getRiderKPIs(), []);
  const { kpis: live } = useLiveDataStore();
  const kpis = {
    ...staticKpis,
    active: live.activeRiders,
    avgRating: live.ratingsReceivedToday > 0 ? live.avgRatingToday : staticKpis.avgRating,
    totalIncentivesMonth: staticKpis.totalIncentivesMonth + live.incentivesTotalToday,
    totalPenaltiesMonth: staticKpis.totalPenaltiesMonth + live.penaltiesTotalToday,
  };
  const scores = useMemo(() => getScoreDistribution(), []);
  const hubEarnings = useMemo(() => getEarningsBreakdownByHub(), []);
  const trend  = useMemo(() => getEarningsTrend(), []);
  const ratings = useMemo(() => getRatingDistribution(), []);
  const topRiders = useMemo(() => getTopPerformers(10), []);
  const badges = useMemo(() => getBadgeSummary(), []);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    RIDER_INTELLIGENCE.forEach(r => { map[r.status] = (map[r.status] ?? 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, []);

  const radarData = useMemo(() => [
    { metric: 'On-Time', value: Math.round(RIDER_INTELLIGENCE.reduce((s, r) => s + r.onTimeRate, 0) / RIDER_INTELLIGENCE.length) },
    { metric: 'Success', value: Math.round(RIDER_INTELLIGENCE.reduce((s, r) => s + r.successRate, 0) / RIDER_INTELLIGENCE.length) },
    { metric: 'Rating', value: Math.round((RIDER_INTELLIGENCE.reduce((s, r) => s + r.avgRating, 0) / RIDER_INTELLIGENCE.length) * 20) },
    { metric: 'Streak', value: Math.min(100, Math.round(RIDER_INTELLIGENCE.reduce((s, r) => s + r.streakDays, 0) / RIDER_INTELLIGENCE.length * 4)) },
    { metric: 'Training', value: Math.round(RIDER_INTELLIGENCE.reduce((s, r) => s + (r.trainingCompleted / r.trainingTotal) * 100, 0) / RIDER_INTELLIGENCE.length) },
  ], []);

  return (
    <div className="dashboard-grid">

      {/* KPI row */}
      <div className="widget span-full" style={{ display: 'flex', gap: 16 }}>
        <KPICard label="Active Riders"     value={`${kpis.active}/${kpis.total}`} color="#10B981" sub="Online now" />
        <KPICard label="Avg Score"         value={kpis.avgScore}                  color={kpis.avgScore >= 80 ? '#10B981' : kpis.avgScore >= 65 ? '#F59E0B' : '#EF4444'} sub="out of 100" />
        <KPICard label="Avg Rating"        value={`${kpis.avgRating}★`}           color="#F5A623" />
        <KPICard label="Month Earnings"    value={`₹${(kpis.totalEarningsMonth / 100000).toFixed(1)}L`} color="#6366F1" sub="All riders" />
        <KPICard label="Incentives Paid"   value={`₹${(kpis.totalIncentivesMonth / 1000).toFixed(0)}K`} color="#10B981" sub="This month" />
        <KPICard label="Docs Alert"        value={kpis.docsAlert}                 color="#EF4444" sub="Expiring soon" alert={kpis.docsAlert > 0} />
        <KPICard label="Training Pending"  value={kpis.trainingAlert}             color="#F59E0B" sub="Riders incomplete" alert={kpis.trainingAlert > 5} />
      </div>

      {/* Earnings 14-day trend */}
      <div className="widget span-2">
        <div className="widget-title">Earnings Trend — 14 Days (₹)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} formatter={(v: number) => `₹${v.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="deliveryEarnings" stroke="#3B82F6" strokeWidth={2} dot={false} name="Delivery" />
            <Line type="monotone" dataKey="incentives"       stroke="#10B981" strokeWidth={2} dot={false} name="Incentives" />
            <Line type="monotone" dataKey="penalties"        stroke="#EF4444" strokeWidth={2} dot={false} name="Penalties" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance score distribution */}
      <div className="widget">
        <div className="widget-title">Score Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={scores}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {scores.map((_, i) => <Cell key={i} fill={SCORE_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hub earnings breakdown */}
      <div className="widget span-2">
        <div className="widget-title">Earnings Breakdown by Hub (Month)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hubEarnings.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="hub" tick={{ fill: '#64748B', fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} formatter={(v: number) => `₹${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="delivery"   fill="#3B82F6" stackId="a" name="Delivery" />
            <Bar dataKey="returns"    fill="#F59E0B" stackId="a" name="Returns" />
            <Bar dataKey="incentives" fill="#10B981" stackId="a" name="Incentives" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rider status donut */}
      <div className="widget">
        <div className="widget-title">Rider Status</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={statusDist} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ status, count }) => `${count}`}>
              {statusDist.map(s => <Cell key={s.status} fill={STATUS_COLORS[s.status as keyof typeof STATUS_COLORS] ?? '#475569'} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4, justifyContent: 'center' }}>
          {statusDist.map(s => (
            <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[s.status as keyof typeof STATUS_COLORS] ?? '#475569' }} />
              <span style={{ color: '#94A3B8', textTransform: 'capitalize' }}>{s.status} ({s.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet radar */}
      <div className="widget">
        <div className="widget-title">Fleet Health Radar</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Radar name="Fleet Avg" dataKey="value" stroke="#F5A623" fill="#F5A623" fillOpacity={0.2} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Rating distribution */}
      <div className="widget">
        <div className="widget-title">Rating Distribution</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ratings} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis dataKey="stars" type="category" tick={{ fill: '#F5A623', fontSize: 13 }} width={28} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#F5A623" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Badge leaderboard */}
      <div className="widget">
        <div className="widget-title">Badge Leaderboard</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={badges} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis dataKey="badge" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} width={110} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8 }} />
            <Bar dataKey="earned" fill="#7C3AED" radius={[0, 4, 4, 0]} name="Riders Earned" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top performers table */}
      <div className="widget span-full">
        <div className="widget-title">Top 10 Performers</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
              {['Rank','Name','Hub','Score','On-Time','Rating','Streak','Earnings (Month)','Incentives','Badges','Status'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topRiders.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#0F1826' : 'transparent', borderBottom: '1px solid #1E293B10' }}>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ color: i < 3 ? '#F5A623' : '#64748B', fontWeight: 700 }}>#{r.rank}</span>
                </td>
                <td style={{ padding: '7px 10px', color: '#CBD5E1', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '7px 10px', color: '#94A3B8' }}>{r.hub}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ color: r.performanceScore >= 85 ? '#10B981' : r.performanceScore >= 70 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                    {r.performanceScore}
                  </span>
                </td>
                <td style={{ padding: '7px 10px', color: '#94A3B8' }}>{r.onTimeRate}%</td>
                <td style={{ padding: '7px 10px', color: '#F5A623' }}>{r.avgRating}★</td>
                <td style={{ padding: '7px 10px', color: r.streakDays >= 7 ? '#F97316' : '#94A3B8' }}>
                  {r.streakDays > 0 ? `🔥 ${r.streakDays}d` : '—'}
                </td>
                <td style={{ padding: '7px 10px', color: '#10B981', fontWeight: 600 }}>₹{r.earningsMonth.toLocaleString()}</td>
                <td style={{ padding: '7px 10px', color: '#6366F1' }}>₹{r.incentivesThisMonth.toLocaleString()}</td>
                <td style={{ padding: '7px 10px', color: '#7C3AED' }}>{r.badgesEarned}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: (STATUS_COLORS[r.status] ?? '#475569') + '25', color: STATUS_COLORS[r.status] ?? '#475569' }}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
