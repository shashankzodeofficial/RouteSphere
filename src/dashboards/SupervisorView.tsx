import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import {
  User, AlertTriangle, TrendingUp, TrendingDown, Award, Phone,
  Truck, Calendar, MapPin, CheckCircle, XCircle, AlertCircle, Minus,
} from 'lucide-react';
import { useFilterStore } from '../store/filterStore';
import { riderPerformanceData, filterPerformance } from '../data/performanceData';
import type { RiderPerformance, PerformanceGrade, AlertSeverity } from '../types/performance';

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
const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: '#DC2626', warning: '#D97706', info: '#2563EB',
};
const SEVERITY_BG: Record<AlertSeverity, string> = {
  critical: '#FEE2E2', warning: '#FEF3C7', info: '#DBEAFE',
};

// ─── Sub-components ───────────────────────────────────────────

function GradeBadge({ grade, large }: { grade: PerformanceGrade; large?: boolean }) {
  return (
    <span style={{
      background: GRADE_BG[grade], color: GRADE_COLOR[grade],
      fontWeight: 800, border: `1px solid ${GRADE_COLOR[grade]}44`,
      fontSize: large ? 20 : 11, padding: large ? '6px 16px' : '2px 7px',
      borderRadius: large ? 10 : 5,
    }}>
      {grade} — {GRADE_LABEL[grade]}
    </span>
  );
}

function MetricRow({ label, value, target, unit = '%', inverse = false }:
  { label: string; value: number; target: number; unit?: string; inverse?: boolean }) {
  const ok = inverse ? value <= target : value >= target;
  const warn = inverse ? value > target * 0.5 : value >= target * 0.8;
  const color = ok ? '#059669' : warn ? '#D97706' : '#DC2626';
  const Icon = ok ? CheckCircle : warn ? AlertCircle : XCircle;
  const pct = Math.min(100, (value / (inverse ? target * 2 : 100)) * 100);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} color={color} />
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color }}>{value.toFixed(1)}{unit}</span>
          <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>/ {target}{unit}</span>
        </div>
      </div>
      <div style={{ background: '#F1F5F9', borderRadius: 6, height: 8 }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 6, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color = '#1E293B' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#94A3B8' }}>{sub}</div>}
    </div>
  );
}

// ─── Rider Selector ───────────────────────────────────────────

function RiderSelector({ riders, selected, onSelect }:
  { riders: RiderPerformance[]; selected: RiderPerformance | null; onSelect: (r: RiderPerformance) => void }) {
  const [search, setSearch] = useState('');
  const filtered = riders.filter(r =>
    r.riderName.toLowerCase().includes(search.toLowerCase()) ||
    r.hub.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 600 }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Select Rider</div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or hub…"
          style={{ width: '100%', padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: 7,
            fontSize: 11, outline: 'none', background: '#F8FAFC' }} />
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.map(r => (
          <div key={r.riderId} onClick={() => onSelect(r)}
            style={{
              padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F8FAFC',
              background: selected?.riderId === r.riderId ? GRADE_BG[r.grade] : undefined,
              transition: 'background .1s',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{r.riderName}</div>
                <div style={{ fontSize: 10, color: '#94A3B8' }}>{r.hub.replace('-Hub','').replace('-Central','')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: GRADE_BG[r.grade], color: GRADE_COLOR[r.grade],
                  fontWeight: 800, fontSize: 11, padding: '1px 7px', borderRadius: 5,
                }}>{r.grade}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRADE_COLOR[r.grade], marginTop: 2 }}>
                  {r.overallScore.toFixed(1)}
                </div>
              </div>
            </div>
            {r.alerts.length > 0 && (
              <div style={{ marginTop: 3, display: 'flex', gap: 3 }}>
                {r.alerts.slice(0,2).map((a, i) => (
                  <span key={i} style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 4,
                    background: SEVERITY_BG[a.severity], color: SEVERITY_COLOR[a.severity], fontWeight: 600,
                  }}>{a.type.replace(/_/g,' ')}</span>
                ))}
                {r.alerts.length > 2 && <span style={{ fontSize: 9, color: '#94A3B8' }}>+{r.alerts.length-2}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rider Detail Panel ───────────────────────────────────────

function RiderDetail({ rider }: { rider: RiderPerformance }) {
  const [activeTab, setActiveTab] = useState<'overview'|'metrics'|'trend'|'actions'>('overview');

  const trendColor = (score: number) =>
    score >= 90 ? '#7C3AED' : score >= 80 ? '#059669' : score >= 70 ? '#2563EB' : score >= 60 ? '#D97706' : '#DC2626';

  const scoreDelta = rider.scoreChange ?? 0;

  const tabs = ['overview','metrics','trend','actions'] as const;
  const tabLabels = { overview:'Overview', metrics:'Metric Detail', trend:'30-Day Trend', actions:'Coaching Actions' };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 12, padding: 20, marginBottom: 16, color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: GRADE_COLOR[rider.grade],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0,
            }}>
              {rider.riderName[0]}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC' }}>{rider.riderName}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {rider.hub}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Truck size={11} /> {rider.vehicleType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {rider.phoneNumber}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} /> Joined {rider.joinDate}
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: GRADE_COLOR[rider.grade], lineHeight: 1 }}>
              {rider.overallScore.toFixed(1)}
            </div>
            <GradeBadge grade={rider.grade} large />
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
              Rank #{rider.rankOverall} overall · #{rider.rankInHub} in hub
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: scoreDelta > 0 ? '#34D399' : scoreDelta < 0 ? '#F87171' : '#94A3B8' }}>
              {scoreDelta > 0 ? '▲' : scoreDelta < 0 ? '▼' : '—'}
              {' '}{Math.abs(scoreDelta).toFixed(1)} vs prev period
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
        <StatBox label="Assigned"       value={rider.ordersAssigned.toLocaleString()} color="#1E293B" />
        <StatBox label="Delivered"      value={rider.ordersDelivered.toLocaleString()} color="#059669" />
        <StatBox label="Exceptions"     value={rider.ordersException} color={rider.ordersException > 20 ? '#DC2626' : '#D97706'} />
        <StatBox label="Days Present"   value={`${rider.daysPresent}/${rider.workingDays}`} color="#2563EB" />
        <StatBox label="Avg / Day"      value={rider.avgDeliveriesPerDay} sub="deliveries" color="#7C3AED" />
        <StatBox label="Total KM"       value={rider.totalKm.toLocaleString()} sub="km" color="#0891B2" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #F1F5F9', marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: 'none', color: activeTab === t ? '#2563EB' : '#94A3B8',
              borderBottom: activeTab === t ? '2px solid #2563EB' : '2px solid transparent',
              marginBottom: -2,
            }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Delivery Metrics</div>
              <MetricRow label="Success Rate"         value={rider.successRate}      target={85} />
              <MetricRow label="On-Time Rate"         value={rider.onTimeRate}       target={80} />
              <MetricRow label="First Attempt Rate"   value={rider.firstAttemptRate} target={75} />
              <MetricRow label="Attempt Rate"
                value={rider.ordersAttempted > 0 ? +(rider.ordersAttempted / rider.ordersAssigned * 100).toFixed(1) : 0}
                target={90} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Quality & Compliance</div>
              <MetricRow label="POD Compliance"       value={rider.podCompliance}    target={95} />
              <MetricRow label="COD Accuracy"         value={rider.codAccuracy}      target={98} />
              <MetricRow label="GPS Discipline Score" value={rider.gpsScore}         target={90} />
              <MetricRow label="Attendance Score"     value={rider.attendanceScore}  target={95} />
            </div>
          </div>

          {/* Alerts */}
          {rider.alerts.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Active Alerts</div>
              {rider.alerts.map((a, i) => (
                <div key={i} style={{
                  background: SEVERITY_BG[a.severity], border: `1px solid ${SEVERITY_COLOR[a.severity]}44`,
                  borderRadius: 8, padding: '10px 14px', marginBottom: 8,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <AlertTriangle size={14} color={SEVERITY_COLOR[a.severity]} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: SEVERITY_COLOR[a.severity] }}>
                      {a.type.replace(/_/g, ' ')}
                      <span style={{
                        marginLeft: 8, fontSize: 10, padding: '1px 6px', borderRadius: 4,
                        background: SEVERITY_COLOR[a.severity], color: '#fff', fontWeight: 600,
                      }}>{a.severity.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{a.message}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                      Actual: {a.metricValue.toFixed(1)} · Threshold: {a.threshold}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Metrics ── */}
      {activeTab === 'metrics' && (
        <div>
          <div className="chart-card" style={{ marginBottom: 0 }}>
            <div className="chart-card-title" style={{ marginBottom: 12 }}>Score Breakdown by Dimension</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={rider.scoreBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 90, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={88} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: number, _, { payload }) =>
                    [`${v.toFixed(1)}/100  (Rate: ${payload.rate.toFixed(1)}%  Target: ${payload.target}%)`, 'Score']}
                />
                <ReferenceLine x={80} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target 80', fontSize: 9, fill: '#059669', position: 'right' }} />
                <Bar dataKey="score" radius={[0,4,4,0]} name="Score">
                  {rider.scoreBreakdown.map(d => (
                    <Cell key={d.metric}
                      fill={d.score >= 80 ? '#059669' : d.score >= 60 ? '#2563EB' : d.score >= 40 ? '#D97706' : '#DC2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Metric</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Actual Rate</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Target</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Score / 100</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Weight</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B', fontWeight: 600 }}>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {rider.scoreBreakdown.map(d => {
                    const contrib = d.score * (d.weight / 100);
                    const statusColor = d.rate >= d.target ? '#059669' : d.rate >= d.target * 0.85 ? '#D97706' : '#DC2626';
                    return (
                      <tr key={d.metric} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '7px 8px', fontWeight: 600, color: '#1E293B' }}>{d.metric}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', color: statusColor, fontWeight: 700 }}>
                          {d.rate.toFixed(1)}%
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', color: '#64748B' }}>{d.target}%</td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700,
                          color: d.score >= 80 ? '#059669' : d.score >= 60 ? '#D97706' : '#DC2626' }}>
                          {d.score.toFixed(1)}
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', color: '#64748B' }}>{d.weight}%</td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: '#1E293B' }}>
                          {contrib.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                    <td colSpan={5} style={{ padding: '8px 8px', fontWeight: 700, color: '#374151' }}>Overall Score</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 900,
                      color: GRADE_COLOR[rider.grade], fontSize: 14 }}>
                      {rider.overallScore.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 30-Day Trend ── */}
      {activeTab === 'trend' && (
        <div>
          <div className="chart-card" style={{ marginBottom: 12 }}>
            <div className="chart-card-title">30-Day Score Trend</div>
            <div className="chart-card-sub" style={{ marginBottom: 12 }}>Daily performance score with grade band overlays</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rider.dailyScores} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => d.slice(5)} interval={3} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: number) => [v.toFixed(1), 'Score']}
                  labelFormatter={l => `Date: ${l}`} />
                {/* Grade band reference lines */}
                <ReferenceLine y={90} stroke="#7C3AED" strokeDasharray="3 3" label={{ value:'S',fontSize:9,fill:'#7C3AED',position:'right'}} />
                <ReferenceLine y={80} stroke="#059669" strokeDasharray="3 3" label={{ value:'A',fontSize:9,fill:'#059669',position:'right'}} />
                <ReferenceLine y={70} stroke="#2563EB" strokeDasharray="3 3" label={{ value:'B',fontSize:9,fill:'#2563EB',position:'right'}} />
                <ReferenceLine y={60} stroke="#D97706" strokeDasharray="3 3" label={{ value:'C',fontSize:9,fill:'#D97706',position:'right'}} />
                <Line type="monotone" dataKey="score" stroke={GRADE_COLOR[rider.grade]} strokeWidth={2.5}
                  dot={{ fill: GRADE_COLOR[rider.grade], r: 2 }} name="Daily Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-title" style={{ marginBottom: 10 }}>Daily Deliveries (Last 30 Days)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={rider.dailyScores} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => d.slice(5)} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: number) => [v, 'Deliveries']}
                  labelFormatter={l => `Date: ${l}`} />
                <Bar dataKey="delivered" radius={[3,3,0,0]} name="Deliveries">
                  {rider.dailyScores.map(d => (
                    <Cell key={d.date} fill={trendColor(d.score)} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Tab: Actions ── */}
      {activeTab === 'actions' && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Coaching Recommendations</div>
          {rider.recommendations.map((rec, i) => (
            <div key={i} style={{
              background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8,
              padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 10,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#0EA5E9',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.5 }}>{rec}</div>
            </div>
          ))}

          <div style={{ marginTop: 20, fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            Action Plan Template
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
            {[
              { phase: 'Week 1', action: 'Conduct 1:1 debrief session, review last 30 days performance data', type: 'coaching_session' },
              { phase: 'Week 2', action: 'Shadow ride — supervisor joins rider for half a day to identify field issues', type: 'field_observation' },
              { phase: 'Week 3', action: 'Set weekly targets; check-in every 2 days on key metrics', type: 'monitoring' },
              { phase: 'Week 4', action: 'Review progress; if score improves ≥ 10 pts, commendation. Otherwise formal warning.', type: 'review' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{
                  background: '#2563EB', color: '#fff', borderRadius: 6,
                  padding: '3px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                }}>{s.phase}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#1E293B' }}>{s.action}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Type: {s.type.replace(/_/g,' ')}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 14, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Note for Supervisors</div>
            <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.6 }}>
              All coaching actions must be logged in the Admin Portal before they take effect in the scoring engine.
              Performance improvement plans (PIP) require HUB_MANAGER approval. Formal warnings require OPS_MANAGER countersign.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────

export default function SupervisorView() {
  const f = useFilterStore();
  const [selectedRider, setSelectedRider] = useState<RiderPerformance | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const riders = useMemo(
    () => filterPerformance(riderPerformanceData, f.region, f.hub),
    [f.region, f.hub]
  );

  const alertRiders = useMemo(() =>
    riders.filter(r => {
      if (alertFilter === 'critical') return r.alerts.some(a => a.severity === 'critical');
      if (alertFilter === 'warning')  return r.alerts.some(a => a.severity === 'warning');
      return r.alerts.length > 0;
    }).sort((a, b) => {
      const sev = (r: RiderPerformance) =>
        r.alerts.some(a => a.severity === 'critical') ? 2 : r.alerts.some(a => a.severity === 'warning') ? 1 : 0;
      return sev(b) - sev(a);
    }), [riders, alertFilter]
  );

  return (
    <div>
      <div className="page-title">Supervisor View</div>
      <div className="page-sub">Individual rider scorecards, alert management, coaching actions and trend analysis</div>

      {/* ── Alert Banner ── */}
      {alertRiders.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#DC2626" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>
                {alertRiders.length} rider{alertRiders.length !== 1 ? 's' : ''} require attention
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all','critical','warning'] as const).map(v => (
                <button key={v} onClick={() => setAlertFilter(v)}
                  style={{
                    padding: '3px 10px', border: '1px solid', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    borderColor: alertFilter === v ? '#DC2626' : '#E2E8F0',
                    background: alertFilter === v ? '#FEE2E2' : '#fff',
                    color: alertFilter === v ? '#DC2626' : '#64748B',
                  }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {alertRiders.slice(0, 8).map(r => (
              <div key={r.riderId} onClick={() => setSelectedRider(r)}
                style={{
                  background: r.alerts.some(a => a.severity === 'critical') ? '#FEE2E2' : '#FEF3C7',
                  border: `1px solid ${r.alerts.some(a => a.severity === 'critical') ? '#FCA5A5' : '#FDE68A'}`,
                  borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <span style={{ fontSize: 11, fontWeight: 600,
                  color: r.alerts.some(a => a.severity === 'critical') ? '#991B1B' : '#92400E' }}>
                  {r.riderName}
                </span>
                <span style={{ fontSize: 10, color: '#64748B' }}>{r.alerts.length} alert{r.alerts.length!==1?'s':''}</span>
              </div>
            ))}
            {alertRiders.length > 8 && (
              <span style={{ fontSize: 11, color: '#64748B', padding: '5px 0' }}>+{alertRiders.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'flex-start' }}>
        <RiderSelector riders={riders} selected={selectedRider} onSelect={setSelectedRider} />
        <div>
          {selectedRider
            ? <RiderDetail rider={selectedRider} />
            : (
              <div style={{
                background: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: 12,
                padding: 48, textAlign: 'center', color: '#94A3B8',
              }}>
                <User size={40} color="#CBD5E0" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>Select a Rider</div>
                <div style={{ fontSize: 12 }}>
                  Choose a rider from the list to view their full scorecard,<br />metric breakdown, 30-day trend, and coaching actions.
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

function trendColor(score: number): string {
  if (score >= 90) return '#7C3AED';
  if (score >= 80) return '#059669';
  if (score >= 70) return '#2563EB';
  if (score >= 60) return '#D97706';
  return '#DC2626';
}
