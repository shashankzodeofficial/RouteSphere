import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Award, TrendingUp, TrendingDown, AlertTriangle, Users, Star, Minus } from 'lucide-react';
import { useFilterStore } from '../store/filterStore';
import { riderPerformanceData, getTeamSummary, teamTrend30d, filterPerformance } from '../data/performanceData';
import type { RiderPerformance, PerformanceGrade } from '../types/performance';

// ─── Constants ───────────────────────────────────────────────

const GRADE_COLOR: Record<PerformanceGrade, string> = {
  S: '#7C3AED', A: '#059669', B: '#2563EB', C: '#D97706', D: '#DC2626',
};
const GRADE_BG: Record<PerformanceGrade, string> = {
  S: '#EDE9FE', A: '#D1FAE5', B: '#DBEAFE', C: '#FEF3C7', D: '#FEE2E2',
};
const GRADE_LABEL: Record<PerformanceGrade, string> = {
  S: 'Elite', A: 'High Performer', B: 'Good', C: 'Needs Improvement', D: 'At Risk',
};

function GradeBadge({ grade, size = 'sm' }: { grade: PerformanceGrade; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? { fontSize: 18, padding: '4px 12px', borderRadius: 8 }
           : size === 'md' ? { fontSize: 13, padding: '3px 9px', borderRadius: 6 }
           : { fontSize: 11, padding: '2px 7px', borderRadius: 5 };
  return (
    <span style={{
      background: GRADE_BG[grade], color: GRADE_COLOR[grade],
      fontWeight: 800, border: `1px solid ${GRADE_COLOR[grade]}33`, ...sz,
    }}>
      {grade}
    </span>
  );
}

function TrendIcon({ v }: { v: number | null }) {
  if (!v || Math.abs(v) < 0.5) return <Minus size={13} color="#94A3B8" />;
  return v > 0
    ? <TrendingUp size={13} color="#059669" />
    : <TrendingDown size={13} color="#DC2626" />;
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 90 ? '#7C3AED' : score >= 80 ? '#059669' : score >= 70 ? '#2563EB' : score >= 60 ? '#D97706' : '#DC2626';
  return (
    <div style={{ background: '#F1F5F9', borderRadius: 4, height: 6, width: '100%' }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4, transition: 'width .3s' }} />
    </div>
  );
}

const GRADE_FILTER_OPTIONS: Array<PerformanceGrade | 'All'> = ['All', 'S', 'A', 'B', 'C', 'D'];

// ─── Main Component ───────────────────────────────────────────

export default function PerformanceDashboard() {
  const f = useFilterStore();
  const [gradeFilter, setGradeFilter] = useState<PerformanceGrade | 'All'>('All');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'hub' | 'deliveries'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRider, setSelectedRider] = useState<RiderPerformance | null>(null);

  const filtered = useMemo(
    () => filterPerformance(riderPerformanceData, f.region, f.hub, gradeFilter),
    [f.region, f.hub, gradeFilter]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const mul = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'score')      return mul * (a.overallScore - b.overallScore);
      if (sortBy === 'name')       return mul * a.riderName.localeCompare(b.riderName);
      if (sortBy === 'hub')        return mul * a.hub.localeCompare(b.hub);
      if (sortBy === 'deliveries') return mul * (a.ordersDelivered - b.ordersDelivered);
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const summary = useMemo(() => getTeamSummary(filtered), [filtered]);

  const gradeDistribution = useMemo(() => {
    const g: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    filtered.forEach(r => g[r.grade]++);
    return Object.entries(g).map(([grade, count]) => ({ grade, count, color: GRADE_COLOR[grade as PerformanceGrade] }));
  }, [filtered]);

  const radarData = useMemo(() => {
    if (!filtered.length) return [];
    const avg = (key: keyof RiderPerformance) =>
      filtered.reduce((s, r) => s + (r[key] as number), 0) / filtered.length;
    return [
      { metric: 'Success', value: +avg('successRate').toFixed(1), target: 85 },
      { metric: 'On-Time',  value: +avg('onTimeRate').toFixed(1),  target: 80 },
      { metric: '1st Att',  value: +avg('firstAttemptRate').toFixed(1), target: 75 },
      { metric: 'POD',      value: +avg('podCompliance').toFixed(1), target: 95 },
      { metric: 'COD',      value: +avg('codAccuracy').toFixed(1),  target: 98 },
      { metric: 'GPS',      value: +avg('gpsScore').toFixed(1),     target: 90 },
      { metric: 'Attend',   value: +avg('attendanceScore').toFixed(1), target: 95 },
      { metric: 'Prod',     value: +avg('productivityScore').toFixed(1), target: 80 },
    ];
  }, [filtered]);

  const openAlerts = useMemo(
    () => filtered.flatMap(r => r.alerts.map(a => ({ ...a, riderName: r.riderName, hub: r.hub }))),
    [filtered]
  );

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const ThIcon = ({ k }: { k: typeof sortBy }) =>
    sortBy === k ? (sortDir === 'desc' ? <span> ↓</span> : <span> ↑</span>) : null;

  if (!summary) return <div style={{ color: '#64748B', padding: 24 }}>No performance data for current filters.</div>;

  return (
    <div>
      <div className="page-title">Rider Performance Dashboard</div>
      <div className="page-sub">30-day performance scores, grade distribution, and metric breakdown across the fleet</div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Team Avg Score', value: summary.avgScore.toFixed(1), icon: <Star size={18} />, color: '#7C3AED', bg: '#EDE9FE',
            sub: `${summary.eliteCount} Elite · ${summary.highPerformerCount} High` },
          { label: 'Active Riders', value: summary.totalRiders, icon: <Users size={18} />, color: '#2563EB', bg: '#DBEAFE',
            sub: `Across ${new Set(filtered.map(r => r.hub)).size} hubs` },
          { label: 'Open Alerts', value: summary.openAlerts, icon: <AlertTriangle size={18} />, color: '#DC2626', bg: '#FEE2E2',
            sub: `${summary.atRiskCount} riders at risk` },
          { label: 'Avg Success Rate', value: `${summary.avgSuccessRate}%`, icon: <TrendingUp size={18} />, color: '#059669', bg: '#D1FAE5',
            sub: `Avg POD: ${summary.avgPodCompliance}%` },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Grade Band Overview ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['S','A','B','C','D'] as PerformanceGrade[]).map(g => {
          const cnt = filtered.filter(r => r.grade === g).length;
          const pct = filtered.length > 0 ? Math.round(cnt / filtered.length * 100) : 0;
          return (
            <div key={g} onClick={() => setGradeFilter(gradeFilter === g ? 'All' : g)}
              style={{ background: gradeFilter === g ? GRADE_BG[g] : '#F8FAFC', border: `2px solid ${gradeFilter === g ? GRADE_COLOR[g] : '#E2E8F0'}`,
                borderRadius: 10, padding: '10px 14px', cursor: 'pointer', flex: '1 1 80px', textAlign: 'center', transition: 'all .15s' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: GRADE_COLOR[g] }}>{cnt}</div>
              <GradeBadge grade={g} size="sm" />
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>{GRADE_LABEL[g]} · {pct}%</div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>

        {/* Team Avg Score Trend */}
        <div className="chart-card">
          <div className="chart-card-title">Team Avg Score — 30 Days</div>
          <div className="chart-card-sub" style={{ marginBottom: 12 }}>Daily average performance score across all riders</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={teamTrend30d} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }}
                tickFormatter={d => d.slice(5)} interval={4} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number) => [v.toFixed(1), 'Avg Score']}
                labelFormatter={l => `Date: ${l}`} />
              <Line type="monotone" dataKey="avg" stroke="#7C3AED" strokeWidth={2}
                dot={false} name="Avg Score" />
              {/* Target line at 80 */}
              <Line type="monotone" dataKey={() => 80} stroke="#059669" strokeDasharray="4 4"
                strokeWidth={1.5} dot={false} name="Target (80)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="chart-card">
          <div className="chart-card-title">Grade Distribution</div>
          <div className="chart-card-sub" style={{ marginBottom: 12 }}>Number of riders per performance grade</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="grade" tick={{ fontSize: 13, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number, _, { payload }) => [v, GRADE_LABEL[payload.grade as PerformanceGrade]]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Riders">
                {gradeDistribution.map(d => <Cell key={d.grade} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Radar + Alerts Row ── */}
      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>

        {/* Team Metric Radar */}
        <div className="chart-card">
          <div className="chart-card-title">Team Metric Profile (Avg)</div>
          <div className="chart-card-sub" style={{ marginBottom: 4 }}>Average rate per metric vs. target</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <Radar name="Team Avg" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Target"   dataKey="target" stroke="#059669" fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
              <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v}%`]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Open Alerts Panel */}
        <div className="chart-card" style={{ maxHeight: 320, overflow: 'auto' }}>
          <div className="chart-card-title" style={{ marginBottom: 10 }}>
            Open Alerts ({openAlerts.length})
          </div>
          {openAlerts.length === 0
            ? <div style={{ color: '#64748B', fontSize: 13, padding: '20px 0' }}>No open alerts for current filters.</div>
            : openAlerts.slice(0, 12).map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '7px 0',
                borderBottom: '1px solid #F1F5F9', alignItems: 'flex-start',
              }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                  background: a.severity === 'critical' ? '#DC2626' : a.severity === 'warning' ? '#D97706' : '#2563EB',
                }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1E293B' }}>{a.riderName}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{a.message}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="chart-card-title">Performance Leaderboard</div>
            <div className="chart-card-sub">Click a rider to open Supervisor View for coaching details</div>
          </div>
          {/* Grade filter pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {GRADE_FILTER_OPTIONS.map(g => (
              <button key={g} onClick={() => setGradeFilter(g)}
                style={{
                  padding: '3px 10px', border: '1px solid',
                  borderColor: gradeFilter === g ? (g === 'All' ? '#2563EB' : GRADE_COLOR[g as PerformanceGrade]) : '#E2E8F0',
                  background: gradeFilter === g ? (g === 'All' ? '#DBEAFE' : GRADE_BG[g as PerformanceGrade]) : '#fff',
                  color: gradeFilter === g ? (g === 'All' ? '#2563EB' : GRADE_COLOR[g as PerformanceGrade]) : '#64748B',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Rider <ThIcon k="name" /></th>
                <th onClick={() => toggleSort('hub')}  style={{ cursor: 'pointer' }}>Hub <ThIcon k="hub" /></th>
                <th>Grade</th>
                <th onClick={() => toggleSort('score')} style={{ cursor: 'pointer' }}>Score <ThIcon k="score" /></th>
                <th>Trend</th>
                <th>Success</th>
                <th>On-Time</th>
                <th>POD</th>
                <th>GPS</th>
                <th onClick={() => toggleSort('deliveries')} style={{ cursor: 'pointer' }}>Deliveries <ThIcon k="deliveries" /></th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.riderId} onClick={() => setSelectedRider(r)} style={{ cursor: 'pointer' }}
                  className={selectedRider?.riderId === r.riderId ? 'row-selected' : ''}>
                  <td style={{ color: '#64748B', fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{r.riderName}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>Rank #{r.rankOverall} overall</div>
                  </td>
                  <td style={{ fontSize: 11, color: '#64748B' }}>{r.hub.replace('-Hub','').replace('-Central','')}</td>
                  <td><GradeBadge grade={r.grade} /></td>
                  <td>
                    <div style={{ fontWeight: 700, color: GRADE_COLOR[r.grade], marginBottom: 3 }}>
                      {r.overallScore.toFixed(1)}
                    </div>
                    <ScoreBar score={r.overallScore} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendIcon v={r.scoreChange} />
                      <span style={{ fontSize: 11, color: !r.scoreChange ? '#94A3B8' : r.scoreChange > 0 ? '#059669' : '#DC2626' }}>
                        {r.scoreChange ? (r.scoreChange > 0 ? '+' : '') + r.scoreChange.toFixed(1) : '—'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: r.successRate < 70 ? '#DC2626' : r.successRate < 80 ? '#D97706' : '#059669' }}>
                      {r.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.onTimeRate.toFixed(1)}%</td>
                  <td>
                    <span style={{ color: r.podCompliance < 85 ? '#DC2626' : '#1E293B' }}>
                      {r.podCompliance.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span style={{ color: r.gpsScore < 70 ? '#DC2626' : r.gpsScore < 85 ? '#D97706' : '#059669' }}>
                      {r.gpsScore.toFixed(0)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.ordersDelivered.toLocaleString()}</td>
                  <td>
                    {r.alerts.length > 0
                      ? <span style={{
                          background: r.alerts.some(a => a.severity === 'critical') ? '#FEE2E2' : '#FEF3C7',
                          color:      r.alerts.some(a => a.severity === 'critical') ? '#DC2626' : '#D97706',
                          padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                        }}>{r.alerts.length}</span>
                      : <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Selected Rider Quick Panel ── */}
      {selectedRider && (
        <div style={{ marginTop: 16, background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{selectedRider.riderName}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {selectedRider.hub} · {selectedRider.region} · {selectedRider.vehicleType}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GradeBadge grade={selectedRider.grade} size="lg" />
              <span style={{ fontSize: 28, fontWeight: 900, color: GRADE_COLOR[selectedRider.grade] }}>
                {selectedRider.overallScore.toFixed(1)}
              </span>
              <button onClick={() => setSelectedRider(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18 }}>×</button>
            </div>
          </div>

          {/* Score breakdown bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {selectedRider.scoreBreakdown.map(d => (
              <div key={d.metric}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748B' }}>{d.metric}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.rate < d.target - 10 ? '#DC2626' : d.rate >= d.target ? '#059669' : '#D97706' }}>
                    {d.rate.toFixed(1)}%
                  </span>
                </div>
                <ScoreBar score={d.score} />
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Target: {d.target}% · Score: {d.score.toFixed(0)}/100</div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {selectedRider.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Coaching Recommendations</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {selectedRider.recommendations.map((r, i) => (
                  <li key={i} style={{ fontSize: 11, color: '#475569', marginBottom: 3 }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
