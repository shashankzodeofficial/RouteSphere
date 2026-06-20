import React, { useState, useMemo } from 'react';
import {
  Award, AlertTriangle, CheckCircle, Clock, Calendar, User, XCircle,
  ChevronRight, FileText, Target, TrendingUp, TrendingDown,
  MessageSquare, ClipboardList, BarChart2, BookOpen,
  AlertCircle, Minus, ArrowRight, Phone,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { coachingRiders, getCoachingStats } from '../data/coachingData';
import { riderPerformanceData } from '../data/performanceData';
import type { CoachingRiderSummary, CoachingSession, ImprovementPlan } from '../types/coaching';
import type { RiderPerformance } from '../types/performance';

// ============================================================
// GRADE & SEVERITY HELPERS
// ============================================================

const GRADE_COLOR: Record<string, string> = {
  S: '#7C3AED', A: '#059669', B: '#2563EB', C: '#D97706', D: '#DC2626',
};

const SEV_COLOR: Record<string, string> = {
  critical: '#DC2626', high: '#D97706', moderate: '#2563EB',
};
const SEV_BG: Record<string, string> = {
  critical: '#FEF2F2', high: '#FFFBEB', moderate: '#EFF6FF',
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed',
  cancelled: 'Cancelled', no_show: 'No Show',
};

const SESSION_TYPE_LABEL: Record<string, string> = {
  alert_response:        'Alert Response',
  performance_review:    'Performance Review',
  improvement_plan_review: 'Plan Review',
  commendation:          'Commendation',
  formal_warning:        'Formal Warning',
  welfare_check:         'Welfare Check',
};

const ACTION_STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  open:        { bg: '#EFF6FF', text: '#2563EB' },
  in_progress: { bg: '#FFFBEB', text: '#D97706' },
  completed:   { bg: '#ECFDF5', text: '#059669' },
  overdue:     { bg: '#FEF2F2', text: '#DC2626' },
  waived:      { bg: '#F1F5F9', text: '#64748B' },
};

// ============================================================
// INLINE FEEDBACK GENERATION
// (mirrors Performance/coaching_engine.ts for Control Tower use)
// ============================================================

interface MetricIssueUI {
  metric: string;
  label: string;
  currentRate: number;
  targetRate: number;
  gap: number;
  severity: 'critical' | 'high' | 'moderate';
  weight: number;
  impact: string;
  rootCauses: string[];
  immediateActions: string[];
  coachingScript: string;
  successCriteria: string;
  weeklyTargets: Array<{ week: number; label: string; targetRate: number; focus: string }>;
}

const METRIC_CONFIG: Record<string, {
  label: string; weight: number; target: number; critical: number; high: number; unit: string;
  impact: string; rootCauses: string[]; immediateActions: string[]; script: string; criteria: string; milestoneRate: number;
}> = {
  successRate:       { label:'Success Rate',      weight:25, target:85, critical:60, high:72, unit:'%', milestoneRate:5,
    impact:'Every 1% below 85% is ~2 undelivered packages per 20-stop day. Directly reduces revenue per trip.',
    rootCauses:['Not calling customers before arrival (no-show)','Address not verified before departure from hub','Route running late — last stops outside customer availability window','Refused deliveries not escalated for re-routing'],
    immediateActions:['Mandatory pre-call 20 min before every stop','Flag unverified addresses at hub before dispatch','Daily debrief on every failed attempt with supervisor'],
    script:'Ask "Walk me through the last 3 failed stops — what did you do before arriving?" Listen for missing pre-call habit. Role-play a customer call together.',
    criteria:'Success rate above 80% for 5 consecutive working days' },

  onTimeRate:        { label:'On-Time Rate',       weight:20, target:80, critical:55, high:67, unit:'%', milestoneRate:4,
    impact:'SLA penalties begin below 80%. Time-sensitive orders are most affected — pharmacy and e-commerce fail rate rises sharply.',
    rootCauses:['Ignoring app route order — visiting stops in personal sequence','Late departure from hub (>20 min after shift start)','COD change not prepared — time lost at customer door','Extended breaks mid-route'],
    immediateActions:['Follow app route order exactly for 2 weeks — no deviation','Hub departure within 15 min of shift start','Prepare exact COD change before departure'],
    script:'Ask "On a late day — what time do you reach stop 5 vs stop 10?" Review GPS track together. Find the longest dwell gaps.',
    criteria:'On-time rate above 75% for two consecutive weeks' },

  firstAttemptRate:  { label:'First Attempt Rate', weight:15, target:75, critical:50, high:62, unit:'%', milestoneRate:4,
    impact:'Each re-attempt costs ₹35–80. At 60% FAR on 20 deliveries = 8 re-attempts/day = ₹280–640 daily extra cost per rider.',
    rootCauses:['Not calling before arrival — customer absent','Wrong building/flat in apartment complexes','Not waiting 3 min before marking failure','No delivery notice left for customer'],
    immediateActions:['Pre-call is mandatory for every stop — not just COD','Wait minimum 3 minutes before marking failure (set timer)','Leave delivery notice card for every failed attempt'],
    script:'Ask "Show me on your phone — step by step what happens when you arrive at a new stop." Watch for the pre-call being skipped.',
    criteria:'First attempt rate above 70% for 10 consecutive attempts' },

  podCompliance:     { label:'POD Compliance',     weight:15, target:95, critical:70, high:82, unit:'%', milestoneRate:5,
    impact:'Missing POD creates dispute liability. Each unresolved dispute costs 2–4× delivery value in resolution time and potential refund.',
    rootCauses:['Skipping POD under time pressure','Poor photo — blurry, wrong item, no address visible','App shortcuts bypassing POD screen','Device storage/battery preventing camera function'],
    immediateActions:['POD is non-negotiable — delivery cannot be marked complete without it','Photo must show package + address in same frame','Battery check every morning — minimum 80% at departure'],
    script:'Be direct: "Our policy requires POD for every delivery. I\'ve seen X completions without it — can you help me understand what happens at those stops?" Check device for storage issues on the spot.',
    criteria:'POD captured for 100% of deliveries for 5 consecutive days' },

  codAccuracy:       { label:'COD Accuracy',       weight:10, target:98, critical:80, high:90, unit:'%', milestoneRate:3,
    impact:'Every discrepancy is a cash shortfall. 5% gap on ₹50,000 daily COD = ₹2,500/rider/day. Persistent gaps trigger financial audit.',
    rootCauses:['Not verifying COD amount in app before departure','Wrong change given under pressure','Not recording partial/refused COD correctly','Mixing personal and collected cash','Skipping EOD reconciliation'],
    immediateActions:['Prepare exact change envelope per COD stop before departure','Never accept non-standard amounts — escalate to supervisor','EOD reconciliation mandatory before leaving hub — stay until accounts balance'],
    script:'Ask "Walk me through exactly what you do from collecting cash at the door to handing it in tonight." Map every step. Find the specific gap.',
    criteria:'Zero COD discrepancy for 10 consecutive COD deliveries' },

  gpsScore:          { label:'GPS Discipline',     weight:5,  target:90, critical:50, high:68, unit:'pts', milestoneRate:15,
    impact:'GPS anomalies indicate route deviation or potential delivery fraud. Customers lose trust when delivery proof doesn\'t match GPS records.',
    rootCauses:['Mock location app installed (policy violation)','GPS disabled during shift','Unplanned personal stops mid-route','Geofence violations at restricted zones'],
    immediateActions:['Device inspection immediately — check for mock location apps','GPS must stay enabled throughout entire shift','Daily device check by Hub Manager until score recovers'],
    script:'Be factual and firm: "The system flagged X anomalies on your device in 7 days. I\'d like to understand what happened on each occasion." Inspect device during session.',
    criteria:'Zero GPS anomalies for 14 consecutive working days' },

  attendanceScore:   { label:'Attendance',         weight:5,  target:95, critical:65, high:78, unit:'%', milestoneRate:5,
    impact:'Each absent rider redistributes 15–20 deliveries. Teams below 90% attendance consistently miss SLA — the load falls on others, raising their error rates.',
    rootCauses:['Health issues — investigate if medical support needed','Commute difficulty — review shift timing','Personal/family circumstances','Engagement and motivation concerns'],
    immediateActions:['Welfare check first — understand root cause before any process conversation','Review shift timing — can hub time be adjusted?','HR support if personal circumstances are involved'],
    script:'Lead with care: "I\'ve noticed you\'ve had X absences. Before we talk about impact, I want to check — is everything alright? Is there anything the team can do?" Listen first.',
    criteria:'Present on all scheduled days for 3 consecutive weeks' },

  productivityScore: { label:'Productivity',       weight:5,  target:80, critical:40, high:58, unit:'%', milestoneRate:5,
    impact:'Below 1.5 del/hr leaves 20–30% capacity unused. Raises cost-per-delivery and limits orders the hub can process per day.',
    rootCauses:['Ignoring optimised route order','Extended breaks mid-route (visible in GPS)','Excessive dwell time at each stop','Slow hub loading — no pre-sort before departure'],
    immediateActions:['Review GPS track every day — identify unusually long dwell stops','Stop-time targets: simple ≤3 min, COD ≤5 min, complex ≤8 min','Pre-sort packages by route order before shift start'],
    script:'Use data, not judgement. "On Tuesday there was a 45-min gap between stop 7 and 8. Can you tell me what happened?" Find the process gap together.',
    criteria:'Average ≥ 2.0 deliveries per active hour for 5 consecutive days' },
};

function buildFeedback(rider: RiderPerformance): MetricIssueUI[] {
  const values: Record<string, number> = {
    successRate: rider.successRate, onTimeRate: rider.onTimeRate,
    firstAttemptRate: rider.firstAttemptRate, podCompliance: rider.podCompliance,
    codAccuracy: rider.codAccuracy, gpsScore: rider.gpsScore,
    attendanceScore: rider.attendanceScore, productivityScore: rider.productivityScore,
  };

  const issues: MetricIssueUI[] = [];
  for (const [key, cfg] of Object.entries(METRIC_CONFIG)) {
    const rate   = values[key] ?? 100;
    const target = cfg.target;
    if (rate >= target * 0.95) continue;
    const gap = target - rate;
    const sev: 'critical' | 'high' | 'moderate' =
      rate <= cfg.critical ? 'critical' :
      rate <= cfg.high     ? 'high' : 'moderate';
    const milestoneRate = cfg.milestoneRate;
    issues.push({
      metric: key,
      label: cfg.label,
      currentRate: rate,
      targetRate: target,
      gap,
      severity: sev,
      weight: cfg.weight,
      impact: cfg.impact,
      rootCauses: cfg.rootCauses,
      immediateActions: cfg.immediateActions,
      coachingScript: cfg.script,
      successCriteria: cfg.criteria,
      weeklyTargets: [
        { week:1, label:'Foundation',    targetRate: Math.min(rate + milestoneRate, target),      focus: cfg.immediateActions[0] },
        { week:2, label:'Building',      targetRate: Math.min(rate + milestoneRate*2, target),    focus: cfg.immediateActions[1] ?? cfg.immediateActions[0] },
        { week:3, label:'Consolidation', targetRate: Math.min(rate + milestoneRate*3, target),    focus: 'Sustain gains; address secondary root causes' },
        { week:4, label:'Assessment',    targetRate: Math.min(target, rate + milestoneRate*4),    focus: 'Final review — transition to standard monitoring?' },
      ],
    });
  }
  return issues.sort((a,b) => {
    const sv = { critical:3, high:2, moderate:1 };
    if (sv[a.severity] !== sv[b.severity]) return sv[b.severity] - sv[a.severity];
    return b.gap * b.weight - a.gap * a.weight;
  });
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function GradeBadge({ grade, size = 'sm' }: { grade: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? { width:44,height:44,fontSize:18 } :
             size === 'md' ? { width:32,height:32,fontSize:14 } :
                             { width:24,height:24,fontSize:11 };
  return (
    <div style={{ ...sz, borderRadius:6, background:GRADE_COLOR[grade]??'#64748B',
      color:'#fff', display:'flex',alignItems:'center',justifyContent:'center',
      fontWeight:800, flexShrink:0 }}>
      {grade}
    </div>
  );
}

function SeverityBadge({ sev }: { sev: string }) {
  return (
    <span style={{ background: SEV_BG[sev], color: SEV_COLOR[sev],
      fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, textTransform:'capitalize' }}>
      {sev}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const col = status === 'completed' ? { bg:'#ECFDF5', text:'#059669' }
    : status === 'scheduled'   ? { bg:'#EFF6FF', text:'#2563EB' }
    : status === 'in_progress' ? { bg:'#FFFBEB', text:'#D97706' }
    : status === 'formal_warning' ? { bg:'#FEF2F2', text:'#DC2626' }
    : { bg:'#F1F5F9', text:'#64748B' };
  return (
    <span style={{ background:col.bg, color:col.text, fontSize:11, fontWeight:600,
      padding:'2px 8px', borderRadius:20 }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ScoreBar({ score, max=100 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const col = pct >= 90 ? '#7C3AED' : pct >= 80 ? '#059669' : pct >= 70 ? '#2563EB' : pct >= 60 ? '#D97706' : '#DC2626';
  return (
    <div style={{ flex:1, height:6, background:'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height:'100%', background:col, borderRadius:3 }} />
    </div>
  );
}

// ============================================================
// TABS: Feedback
// ============================================================

function FeedbackTab({ rider, issues }: { rider: RiderPerformance; issues: MetricIssueUI[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const strengths = Object.entries(METRIC_CONFIG)
    .filter(([k]) => {
      const v: Record<string,number> = {
        successRate: rider.successRate, onTimeRate: rider.onTimeRate,
        firstAttemptRate: rider.firstAttemptRate, podCompliance: rider.podCompliance,
        codAccuracy: rider.codAccuracy, gpsScore: rider.gpsScore,
        attendanceScore: rider.attendanceScore, productivityScore: rider.productivityScore,
      };
      return v[k] >= METRIC_CONFIG[k].target * 0.95;
    })
    .map(([,cfg]) => cfg.label);

  if (issues.length === 0) {
    return (
      <div style={{ padding:24, textAlign:'center', color:'#059669' }}>
        <CheckCircle size={40} style={{ margin:'0 auto 12px' }} />
        <div style={{ fontSize:16, fontWeight:600 }}>Performance On Track</div>
        <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>All metrics are meeting targets. No coaching required at this time.</div>
      </div>
    );
  }

  return (
    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
      {/* Summary */}
      <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:14 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#DC2626', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
          <AlertTriangle size={14} /> Performance Summary
        </div>
        <div style={{ fontSize:13, color:'#7F1D1D', lineHeight:1.6 }}>
          {rider.riderName} is currently Grade {rider.grade} ({rider.overallScore.toFixed(1)} pts) with {issues.length} metric{issues.length>1?'s':''} below target.
          {issues.filter(i=>i.severity==='critical').length > 0 &&
            ` ${issues.filter(i=>i.severity==='critical').length} critical metric${issues.filter(i=>i.severity==='critical').length>1?'s':''} require immediate action.`}
        </div>
      </div>

      {/* Issues */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {issues.map(issue => (
          <div key={issue.metric} style={{ border:`1px solid ${SEV_COLOR[issue.severity]}40`,
            borderRadius:8, overflow:'hidden' }}>
            {/* Issue header */}
            <div
              onClick={() => setExpanded(e => e === issue.metric ? null : issue.metric)}
              style={{ padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'space-between', background: SEV_BG[issue.severity],
                userSelect:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <SeverityBadge sev={issue.severity} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>{issue.label}</div>
                  <div style={{ fontSize:12, color:'#475569' }}>
                    {issue.currentRate.toFixed(1)}{issue.label.includes('Score') || issue.label === 'Productivity' ? ' pts' : '%'}
                    {' → Target '}{issue.targetRate}{issue.label.includes('Score') || issue.label === 'Productivity' ? ' pts' : '%'}
                    {' (gap: −'}{issue.gap.toFixed(1)}{issue.label.includes('Score') || issue.label === 'Productivity' ? ' pts' : 'pp'})
                  </div>
                </div>
              </div>
              <ChevronRight size={16} style={{ color:'#64748B', transform: expanded === issue.metric ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }} />
            </div>

            {/* Expanded detail */}
            {expanded === issue.metric && (
              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14,
                borderTop:`1px solid ${SEV_COLOR[issue.severity]}30` }}>

                {/* Impact */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Business Impact</div>
                  <div style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>{issue.impact}</div>
                </div>

                {/* Root causes + Actions side-by-side */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Likely Root Causes</div>
                    {issue.rootCauses.map((rc,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                        <div style={{ width:16, height:16, border:'1px solid #CBD5E1', borderRadius:3, flexShrink:0, marginTop:1 }} />
                        <span style={{ fontSize:12, color:'#475569', lineHeight:1.5 }}>{rc}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Immediate Actions</div>
                    {issue.immediateActions.map((a,i) => (
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                        <ArrowRight size={12} style={{ color:'#2563EB', marginTop:2, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:'#1E40AF', lineHeight:1.5 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4-week targets */}
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>4-Week Recovery Path</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                    {issue.weeklyTargets.map(wt => (
                      <div key={wt.week} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:6, padding:10 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#2563EB', textTransform:'uppercase', marginBottom:4 }}>
                          Wk {wt.week} · {wt.label}
                        </div>
                        <div style={{ fontSize:18, fontWeight:700, color:'#0F172A' }}>{wt.targetRate.toFixed(0)}{METRIC_CONFIG[issue.metric]?.unit ?? '%'}</div>
                        <div style={{ fontSize:11, color:'#64748B', marginTop:4, lineHeight:1.4 }}>{wt.focus}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coaching script */}
                <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:6, padding:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                    <MessageSquare size={12} /> Coaching Script — What to Say
                  </div>
                  <div style={{ fontSize:12, color:'#065F46', lineHeight:1.7, fontStyle:'italic' }}>{issue.coachingScript}</div>
                </div>

                {/* Success criteria */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#EFF6FF', borderRadius:6 }}>
                  <Target size={14} style={{ color:'#2563EB', flexShrink:0 }} />
                  <div>
                    <span style={{ fontSize:11, fontWeight:700, color:'#2563EB', textTransform:'uppercase', marginRight:6 }}>Success Criteria</span>
                    <span style={{ fontSize:12, color:'#1E40AF' }}>{issue.successCriteria}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={{ border:'1px solid #BBF7D0', borderRadius:8, padding:14, background:'#F0FDF4' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#059669', marginBottom:10 }}>
            Strengths to Acknowledge in Session
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {strengths.map(s => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px',
                background:'#fff', borderRadius:20, fontSize:12, color:'#065F46', border:'1px solid #BBF7D0' }}>
                <CheckCircle size={12} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABS: Action Items
// ============================================================

function ActionItemsTab({ cr }: { cr: CoachingRiderSummary }) {
  const allActions = cr.sessions.flatMap(s => s.actionItems);
  const open       = allActions.filter(a => a.status === 'open' || a.status === 'in_progress' || a.status === 'overdue');
  const done       = allActions.filter(a => a.status === 'completed' || a.status === 'waived');

  const PriorityDot = ({ p }: { p: string }) => {
    const c = p === 'critical' ? '#DC2626' : p === 'high' ? '#D97706' : p === 'medium' ? '#2563EB' : '#64748B';
    return <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />;
  };

  const ActionRow = ({ a }: { a: typeof allActions[0] }) => {
    const sc = ACTION_STATUS_COLOR[a.status];
    return (
      <div style={{ padding:'12px 14px', borderBottom:'1px solid #F1F5F9' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:6 }}>
          <PriorityDot p={a.priority} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>{a.title}</div>
            <div style={{ fontSize:12, color:'#475569', marginTop:2, lineHeight:1.5 }}>{a.description}</div>
          </div>
          <span style={{ background:sc.bg, color:sc.text, fontSize:11, fontWeight:600,
            padding:'2px 8px', borderRadius:20, flexShrink:0, textTransform:'capitalize' }}>
            {a.status.replace('_',' ')}
          </span>
        </div>
        <div style={{ display:'flex', gap:12, fontSize:11, color:'#94A3B8', paddingLeft:18 }}>
          <span>Due: {a.dueDate}</span>
          <span style={{ textTransform:'capitalize' }}>Category: {a.category}</span>
          {a.completedNote && <span style={{ color:'#059669' }}>✓ {a.completedNote.slice(0,60)}{a.completedNote.length > 60 ? '…' : ''}</span>}
        </div>
      </div>
    );
  };

  if (allActions.length === 0) {
    return (
      <div style={{ padding:40, textAlign:'center', color:'#94A3B8', fontSize:13 }}>
        No action items yet. They will be created during coaching sessions.
      </div>
    );
  }

  return (
    <div>
      {open.length > 0 && (
        <>
          <div style={{ padding:'12px 16px', background:'#F8FAFC', fontSize:12, fontWeight:700,
            color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #E2E8F0' }}>
            Open · {open.length}
          </div>
          {open.map(a => <ActionRow key={a.id} a={a} />)}
        </>
      )}
      {done.length > 0 && (
        <>
          <div style={{ padding:'12px 16px', background:'#F8FAFC', fontSize:12, fontWeight:700,
            color:'#64748B', textTransform:'uppercase', letterSpacing:'0.05em',
            borderTop:'1px solid #E2E8F0', borderBottom:'1px solid #E2E8F0' }}>
            Completed · {done.length}
          </div>
          {done.map(a => <ActionRow key={a.id} a={a} />)}
        </>
      )}
    </div>
  );
}

// ============================================================
// TABS: Session History
// ============================================================

function SessionHistoryTab({ cr }: { cr: CoachingRiderSummary }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sessions = [...cr.sessions].sort((a,b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const OutcomeIcon = ({ o }: { o?: string }) => {
    if (o === 'improved') return <TrendingUp size={14} style={{ color:'#059669' }} />;
    if (o === 'declined') return <TrendingDown size={14} style={{ color:'#DC2626' }} />;
    if (o === 'escalated') return <AlertTriangle size={14} style={{ color:'#DC2626' }} />;
    return <Minus size={14} style={{ color:'#94A3B8' }} />;
  };

  if (sessions.length === 0) {
    return (
      <div style={{ padding:40, textAlign:'center', color:'#94A3B8', fontSize:13 }}>
        No sessions recorded yet.
      </div>
    );
  }

  return (
    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:0, position:'relative' }}>
      {/* Timeline line */}
      <div style={{ position:'absolute', left:36, top:24, bottom:24, width:2, background:'#E2E8F0', zIndex:0 }} />

      {sessions.map((s, idx) => (
        <div key={s.id} style={{ display:'flex', gap:16, position:'relative', zIndex:1,
          marginBottom: idx < sessions.length-1 ? 20 : 0 }}>
          {/* Timeline dot */}
          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
            background: s.status === 'completed' ? '#059669' : s.status === 'scheduled' ? '#2563EB' : '#94A3B8',
            display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #fff',
            boxShadow:'0 0 0 2px #E2E8F0' }}>
            {s.status === 'completed' ? <CheckCircle size={14} color='#fff' /> :
             s.status === 'scheduled' ? <Calendar size={14} color='#fff' /> :
             <Clock size={14} color='#fff' />}
          </div>

          {/* Card */}
          <div style={{ flex:1, background:'#fff', border:'1px solid #E2E8F0', borderRadius:8,
            overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div
              onClick={() => setExpanded(e => e === s.id ? null : s.id)}
              style={{ padding:'12px 14px', cursor: s.status === 'completed' ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>
                    {SESSION_TYPE_LABEL[s.sessionType]}
                  </span>
                  <StatusBadge status={s.status} />
                  {s.outcome && <OutcomeIcon o={s.outcome} />}
                  {s.escalatedTo && (
                    <span style={{ fontSize:10, fontWeight:700, color:'#DC2626', background:'#FEF2F2',
                      padding:'1px 6px', borderRadius:20 }}>ESCALATED</span>
                  )}
                </div>
                <div style={{ fontSize:12, color:'#64748B' }}>
                  {new Date(s.scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  {s.durationMinutes && ` · ${s.durationMinutes} min`}
                  {' · '}{s.supervisorName}
                  {s.scoreAtSession > 0 && ` · Score: ${s.scoreAtSession} (${s.gradeAtSession})`}
                </div>
              </div>
              {s.status === 'completed' && (
                <ChevronRight size={16} style={{ color:'#64748B', flexShrink:0,
                  transform: expanded === s.id ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }} />
              )}
            </div>

            {/* Expanded session details */}
            {expanded === s.id && s.status === 'completed' && (
              <div style={{ padding:'0 14px 14px', borderTop:'1px solid #F1F5F9' }}>
                {s.primaryIssues.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', marginBottom:6 }}>Issues Discussed</div>
                    {s.primaryIssues.map((pi,i) => (
                      <div key={i} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                        <SeverityBadge sev={pi.severity} />
                        <span style={{ fontSize:12, color:'#475569' }}>{pi.metric}: {pi.rate.toFixed(1)} vs {pi.target}</span>
                      </div>
                    ))}
                  </div>
                )}
                {s.discussionNotes && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', marginBottom:4 }}>Discussion Notes</div>
                    <div style={{ fontSize:12, color:'#334155', lineHeight:1.7, padding:10, background:'#F8FAFC', borderRadius:6 }}>{s.discussionNotes}</div>
                  </div>
                )}
                {s.strengthsNoted.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#059669', textTransform:'uppercase', marginBottom:6 }}>Strengths Noted</div>
                    {s.strengthsNoted.map((str,i) => (
                      <div key={i} style={{ display:'flex', gap:6, marginBottom:4 }}>
                        <CheckCircle size={12} style={{ color:'#059669', marginTop:1, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:'#065F46' }}>{str}</span>
                      </div>
                    ))}
                  </div>
                )}
                {s.outcomeNotes && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', marginBottom:4 }}>Outcome & Next Steps</div>
                    <div style={{ fontSize:12, color:'#334155', lineHeight:1.7, padding:10, background:'#EFF6FF', borderRadius:6 }}>{s.outcomeNotes}</div>
                  </div>
                )}
                {s.followUpDate && (
                  <div style={{ marginTop:10, display:'flex', gap:6, alignItems:'center' }}>
                    <Calendar size={12} style={{ color:'#D97706' }} />
                    <span style={{ fontSize:12, color:'#D97706', fontWeight:600 }}>Follow-up: {s.followUpDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TABS: Improvement Plan
// ============================================================

function ImprovementPlanTab({ plan, currentScore }: { plan?: ImprovementPlan; currentScore: number }) {
  if (!plan) {
    return (
      <div style={{ padding:40, textAlign:'center', color:'#94A3B8' }}>
        <Target size={40} style={{ margin:'0 auto 12px', opacity:0.3 }} />
        <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>No Active Improvement Plan</div>
        <div style={{ fontSize:12 }}>A 30-day improvement plan is recommended for Grade D riders.<br/>Create one after the first coaching session.</div>
        <button style={{ marginTop:16, padding:'8px 20px', background:'#2563EB', color:'#fff',
          border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Create 30-Day Plan
        </button>
      </div>
    );
  }

  const progress = Math.min(100, ((currentScore - plan.baselineScore) / (plan.targetScore - plan.baselineScore)) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(plan.endDate).getTime() - Date.now()) / 86400000));

  const statusColor: Record<string, string> = {
    active: '#2563EB', completed: '#059669', failed: '#DC2626', extended: '#D97706', draft: '#94A3B8',
  };

  return (
    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
        {[
          { label:'Status',    value: plan.status.charAt(0).toUpperCase() + plan.status.slice(1), color: statusColor[plan.status] },
          { label:'Baseline',  value: `${plan.baselineScore.toFixed(1)} (${plan.baselineGrade})`, color:'#DC2626' },
          { label:'Target',    value: `${plan.targetScore.toFixed(1)} (B+)`, color:'#059669' },
          { label:'Days Left', value: `${daysLeft} days`, color:'#D97706' },
        ].map(card => (
          <div key={card.label} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:12 }}>
            <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>{card.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:8, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'#0F172A' }}>Score Progress</span>
          <span style={{ fontSize:12, color:'#475569' }}>
            {plan.baselineScore.toFixed(1)} → <strong>{currentScore.toFixed(1)}</strong> / {plan.targetScore.toFixed(1)}
          </span>
        </div>
        <div style={{ height:12, background:'#E2E8F0', borderRadius:6, overflow:'hidden', position:'relative' }}>
          <div style={{ width:`${progress}%`, height:'100%', background:'#2563EB', borderRadius:6, transition:'width 0.5s' }} />
        </div>
        <div style={{ fontSize:11, color:'#94A3B8', marginTop:6 }}>{progress.toFixed(0)}% of target reached</div>
      </div>

      {/* Focus metrics */}
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:8, padding:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0F172A', marginBottom:12 }}>Focus Metrics</div>
        {plan.focusMetrics.map(fm => {
          const pct = Math.min(100, Math.max(0, ((fm.current - fm.baseline) / (fm.target - fm.baseline)) * 100));
          return (
            <div key={fm.metric} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#334155' }}>{fm.metric}</span>
                <span style={{ fontSize:12, color:'#64748B' }}>{fm.current.toFixed(1)} / {fm.target}</span>
              </div>
              <ScoreBar score={pct} />
            </div>
          );
        })}
      </div>

      {/* Weekly milestones */}
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:8, padding:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#0F172A', marginBottom:12 }}>Weekly Milestones</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {plan.weeks.map(wk => {
            const col = wk.status === 'completed' ? '#059669'
              : wk.status === 'on_track' ? '#2563EB'
              : wk.status === 'off_track' ? '#DC2626' : '#94A3B8';
            return (
              <div key={wk.week} style={{ border:`2px solid ${col}40`, borderRadius:8, padding:12,
                background: wk.status === 'completed' ? '#ECFDF5' : wk.status === 'off_track' ? '#FEF2F2' : '#F8FAFC' }}>
                <div style={{ fontSize:10, fontWeight:700, color:col, textTransform:'uppercase', marginBottom:4 }}>
                  Week {wk.week} · {wk.label}
                </div>
                <div style={{ fontSize:22, fontWeight:700, color:'#0F172A' }}>{wk.targetScore}</div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>Target score</div>
                {wk.actualScore !== null && (
                  <div style={{ fontSize:12, fontWeight:600, color:col, marginTop:4 }}>
                    Actual: {wk.actualScore}
                  </div>
                )}
                <div style={{ fontSize:11, color:'#64748B', marginTop:6, lineHeight:1.4 }}>{wk.focus}</div>
                <div style={{ fontSize:10, color:'#94A3B8', marginTop:6 }}>
                  Check-in: {new Date(wk.checkInDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                </div>
                {wk.notes && <div style={{ fontSize:11, color:col, marginTop:4, fontStyle:'italic' }}>{wk.notes}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CoachingCenter() {
  const [selectedId, setSelectedId]   = useState<string>(coachingRiders[0]?.riderId ?? '');
  const [activeTab,  setActiveTab]    = useState<'feedback' | 'actions' | 'history' | 'plan'>('feedback');
  const [searchQ,    setSearchQ]      = useState('');

  const stats = getCoachingStats();

  const filteredRiders = useMemo(() => {
    if (!searchQ.trim()) return coachingRiders;
    const q = searchQ.toLowerCase();
    return coachingRiders.filter(r =>
      r.riderName.toLowerCase().includes(q) || r.hub.toLowerCase().includes(q)
    );
  }, [searchQ]);

  const selected = coachingRiders.find(r => r.riderId === selectedId);
  const perfData = riderPerformanceData.find(r => r.riderName === selected?.riderName);
  const issues   = perfData ? buildFeedback(perfData) : [];

  const openActions = selected
    ? selected.sessions.flatMap(s => s.actionItems)
        .filter(a => a.status === 'open' || a.status === 'in_progress' || a.status === 'overdue').length
    : 0;

  const TABS = [
    { key: 'feedback', label: 'Structured Feedback', icon: BookOpen },
    { key: 'actions',  label: 'Action Items',        icon: ClipboardList, badge: openActions },
    { key: 'history',  label: 'Session History',     icon: FileText, badge: selected?.sessions.length },
    { key: 'plan',     label: 'Improvement Plan',    icon: Target },
  ] as const;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Page header */}
      <div style={{ padding:'0 0 20px' }}>
        <h1 className="page-title">Coaching Center</h1>
        <p className="page-sub">Identify at-risk riders, generate structured feedback, and track improvement plans</p>

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {[
            { label:'Riders in Coaching', value: stats.total,       icon: User,          col:'#2563EB', bg:'#EFF6FF' },
            { label:'Critical (Grade D)', value: stats.critical,    icon: AlertTriangle, col:'#DC2626', bg:'#FEF2F2' },
            { label:'Active Plans',        value: stats.activePlans, icon: Target,        col:'#D97706', bg:'#FFFBEB' },
            { label:'Scheduled Sessions', value: stats.scheduled,   icon: Calendar,      col:'#7C3AED', bg:'#F5F3FF' },
            { label:'Sessions Completed', value: stats.completed,   icon: CheckCircle,   col:'#059669', bg:'#ECFDF5' },
            { label:'Open Action Items',  value: stats.openActions, icon: ClipboardList, col:'#0891B2', bg:'#ECFEFF' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34,height:34,borderRadius:8,background:kpi.bg,
                  display:'flex',alignItems:'center',justifyContent:'center', flexShrink:0 }}>
                  <kpi.icon size={18} color={kpi.col} />
                </div>
                <div>
                  <div style={{ fontSize:22, fontWeight:700, color:'#0F172A', lineHeight:1 }}>{kpi.value}</div>
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:3 }}>{kpi.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div style={{ display:'flex', gap:16, flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ── Left: Priority Queue ── */}
        <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column',
          background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden',
          boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>

          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F1F5F9' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0F172A', marginBottom:10 }}>
              Priority Queue
            </div>
            <input
              type="text"
              placeholder="Search riders…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ width:'100%', height:32, padding:'0 10px', border:'1px solid #E2E8F0',
                borderRadius:6, fontSize:13, outline:'none', boxSizing:'border-box', color:'#0F172A' }}
            />
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredRiders.map((cr, idx) => {
              const isSelected = cr.riderId === selectedId;
              const urgencyCol = cr.urgencyScore >= 60 ? '#DC2626'
                : cr.urgencyScore >= 40 ? '#D97706' : '#D97706';

              return (
                <div
                  key={cr.riderId}
                  onClick={() => { setSelectedId(cr.riderId); setActiveTab('feedback'); }}
                  style={{
                    padding:'12px 14px', cursor:'pointer', borderBottom:'1px solid #F1F5F9',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                    transition:'background 0.1s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <GradeBadge grade={cr.grade} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0F172A', overflow:'hidden',
                        whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{cr.riderName}</div>
                      <div style={{ fontSize:11, color:'#64748B' }}>{cr.hub}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:16, fontWeight:700, color:GRADE_COLOR[cr.grade]??'#64748B' }}>
                        {cr.overallScore.toFixed(0)}
                      </div>
                      <div style={{ fontSize:10, color:'#94A3B8' }}>pts</div>
                    </div>
                  </div>

                  <div style={{ fontSize:11, color: urgencyCol, lineHeight:1.4, marginBottom:6 }}>
                    {cr.urgencyReason}
                  </div>

                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {cr.openAlerts > 0 && (
                      <span style={{ background:'#FEF2F2', color:'#DC2626', fontSize:10, fontWeight:600,
                        padding:'1px 6px', borderRadius:20 }}>
                        {cr.openAlerts} alert{cr.openAlerts>1?'s':''}
                      </span>
                    )}
                    {cr.activePlan && (
                      <span style={{ background:'#FFFBEB', color:'#D97706', fontSize:10, fontWeight:600,
                        padding:'1px 6px', borderRadius:20 }}>
                        Active Plan
                      </span>
                    )}
                    {cr.lastSessionDate && (
                      <span style={{ background:'#F1F5F9', color:'#64748B', fontSize:10,
                        padding:'1px 6px', borderRadius:20 }}>
                        Session {cr.daysSinceSession}d ago
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Coaching Panel ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff',
          border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden',
          boxShadow:'0 1px 3px rgba(0,0,0,0.06)', minWidth:0 }}>

          {selected ? (
            <>
              {/* Rider header */}
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #E2E8F0',
                background:'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <GradeBadge grade={selected.grade} size='lg' />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:18, fontWeight:700, color:'#F1F5F9' }}>{selected.riderName}</div>
                    <div style={{ fontSize:13, color:'#94A3B8', marginTop:2 }}>
                      {selected.hub} · {selected.region}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:32, fontWeight:800, color: GRADE_COLOR[selected.grade]??'#fff', lineHeight:1 }}>
                      {selected.overallScore.toFixed(1)}
                    </div>
                    <div style={{ fontSize:12, color:'#64748B' }}>Current Score</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexDirection:'column', alignItems:'flex-end' }}>
                    <button style={{ padding:'6px 14px', background:'#2563EB', color:'#fff',
                      border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      + New Session
                    </button>
                    <button style={{ padding:'6px 14px', background:'rgba(255,255,255,0.1)', color:'#E2E8F0',
                      border:'1px solid rgba(255,255,255,0.2)', borderRadius:6, fontSize:12, cursor:'pointer' }}>
                      <Phone size={11} style={{ marginRight:4 }} />
                      {perfData?.phoneNumber ?? '—'}
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginTop:14 }}>
                  {[
                    { label:'Sessions',       value: selected.sessions.length },
                    { label:'Open Actions',   value: openActions },
                    { label:'Open Alerts',    value: selected.openAlerts },
                    { label:'Days Since Ses', value: selected.daysSinceSession ?? '—' },
                    { label:'Active Plan',    value: selected.activePlan ? 'Yes' : 'No' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign:'center', padding:'8px 6px',
                      background:'rgba(255,255,255,0.06)', borderRadius:6 }}>
                      <div style={{ fontSize:18, fontWeight:700, color:'#F1F5F9' }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'#64748B' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', borderBottom:'1px solid #E2E8F0', flexShrink:0 }}>
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{ flex:1, padding:'12px 8px', border:'none', cursor:'pointer',
                      borderBottom: activeTab === tab.key ? '2px solid #2563EB' : '2px solid transparent',
                      background: activeTab === tab.key ? '#EFF6FF' : 'transparent',
                      color: activeTab === tab.key ? '#2563EB' : '#64748B',
                      fontSize:12, fontWeight:600, display:'flex', alignItems:'center',
                      justifyContent:'center', gap:6, transition:'all 0.15s' }}>
                    <tab.icon size={14} />
                    {tab.label}
                    {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                      <span style={{ background: activeTab === tab.key ? '#2563EB' : '#94A3B8',
                        color:'#fff', fontSize:10, fontWeight:700,
                        padding:'0 5px', borderRadius:10, minWidth:16, textAlign:'center' }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex:1, overflowY:'auto' }}>
                {activeTab === 'feedback' && perfData && (
                  <FeedbackTab rider={perfData} issues={issues} />
                )}
                {activeTab === 'actions' && (
                  <ActionItemsTab cr={selected} />
                )}
                {activeTab === 'history' && (
                  <SessionHistoryTab cr={selected} />
                )}
                {activeTab === 'plan' && (
                  <ImprovementPlanTab plan={selected.plan} currentScore={selected.overallScore} />
                )}
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              flexDirection:'column', gap:12, color:'#94A3B8' }}>
              <User size={48} style={{ opacity:0.3 }} />
              <div style={{ fontSize:14 }}>Select a rider from the queue to start coaching</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
