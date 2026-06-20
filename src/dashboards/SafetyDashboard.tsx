import React, { useState, useMemo } from 'react';
import { AlertTriangle, Shield, Wifi, Map, TrendingDown, CheckCircle, type LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  SAFETY_INCIDENTS, RIDER_SAFETY_PROFILES, getSafetyStats,
  INCIDENT_TYPE_LABELS, SEVERITY_COLORS, RISK_COLORS,
  type IncidentSeverity, type IncidentType, type RiderSafetyProfile,
} from '../data/safetyData';

// ============================================================
// HELPERS
// ============================================================

function SeverityChip({ severity }: { severity: IncidentSeverity }) {
  const c = SEVERITY_COLORS[severity];
  return (
    <span style={{ fontSize:10, fontWeight:700, background:c.bg, color:c.text,
      padding:'2px 8px', borderRadius:10, border:`1px solid ${c.border}` }}>
      {severity.toUpperCase()}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const MAP: Record<string, { bg:string; color:string }> = {
    open:         { bg:'#FEF2F2', color:'#DC2626' },
    under_review: { bg:'#FFFBEB', color:'#D97706' },
    escalated:    { bg:'#F5F3FF', color:'#7C3AED' },
    resolved:     { bg:'#ECFDF5', color:'#059669' },
  };
  const c = MAP[status] ?? { bg:'#F8FAFC', color:'#64748B' };
  return (
    <span style={{ fontSize:10, fontWeight:700, background:c.bg, color:c.color,
      padding:'2px 8px', borderRadius:10, textTransform:'capitalize' }}>
      {status.replace('_',' ')}
    </span>
  );
}

function ScoreGauge({ score, size=60 }: { score:number; size?:number }) {
  const color = score >= 90 ? '#059669' : score >= 70 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626';
  const r = (size-6)/2;
  const circ = Math.PI * r; // half circle
  const dash = (score/100)*circ;
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={size} height={size/2+8} style={{ overflow:'visible' }}>
        <path d={`M 6 ${size/2} A ${r} ${r} 0 0 1 ${size-6} ${size/2}`}
          fill="none" stroke="#E2E8F0" strokeWidth={6} strokeLinecap="round" />
        <path d={`M 6 ${size/2} A ${r} ${r} 0 0 1 ${size-6} ${size/2}`}
          fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ-dash}`} />
        <text x={size/2} y={size/2+6} textAnchor="middle" fontSize={size/4.5}
          fontWeight={800} fill={color}>{score}</text>
      </svg>
    </div>
  );
}

// ============================================================
// INCIDENTS TABLE
// ============================================================

function IncidentsTable({ incidents, title }: { incidents: typeof SAFETY_INCIDENTS; title: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12,
      overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:8 }}>
        <AlertTriangle size={14} color="#D97706" />
        <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{title} ({incidents.length})</span>
      </div>
      {incidents.length === 0 ? (
        <div style={{ padding:24, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No incidents found ✓</div>
      ) : (
        incidents.map((inc, i) => (
          <div key={inc.id} style={{ borderBottom: i < incidents.length-1 ? '1px solid #F8FAFC' : 'none' }}>
            <div onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
              style={{ padding:'12px 16px', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start',
                background: expanded === inc.id ? '#FFFBEB' : 'transparent' }}>
              <div style={{ flexShrink:0, paddingTop:2 }}>
                <SeverityChip severity={inc.severity} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{inc.riderName}</span>
                  <span style={{ fontSize:11, color:'#64748B' }}>{inc.hub}</span>
                  <StatusChip status={inc.status} />
                </div>
                <div style={{ fontSize:12, color:'#475569' }}>
                  {INCIDENT_TYPE_LABELS[inc.type as IncidentType]} · {inc.incidentDate} {inc.incidentTime}
                </div>
                {expanded === inc.id && (
                  <div style={{ marginTop:8, fontSize:12, color:'#334155', lineHeight:1.7,
                    padding:'10px 12px', background:'#F8FAFC', borderRadius:8 }}>
                    {inc.description}
                    {inc.resolvedNote && (
                      <div style={{ marginTop:6, fontStyle:'italic', color:'#059669' }}>
                        ✓ {inc.resolvedNote}
                      </div>
                    )}
                    {inc.escalatedTo && (
                      <div style={{ marginTop:6, color:'#7C3AED', fontWeight:600 }}>
                        ↗ Escalated to: {inc.escalatedTo}
                      </div>
                    )}
                    {inc.fineAmount && (
                      <div style={{ marginTop:6, color:'#DC2626', fontWeight:600 }}>
                        💸 Fine: ₹{inc.fineAmount.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================================
// RIDER SAFETY TABLE
// ============================================================

function RiderSafetyTable() {
  const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all');

  const filtered = RIDER_SAFETY_PROFILES.filter(r =>
    filter === 'all' ? true : r.riskLevel === filter || (filter === 'high' && r.riskLevel === 'critical')
  );

  const VEHICLE_STATUS = {
    valid:   { emoji:'✅', color:'#059669' },
    due:     { emoji:'⚠',  color:'#D97706' },
    overdue: { emoji:'❌', color:'#DC2626' },
  };

  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12,
      overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', gap:8, alignItems:'center' }}>
        <Shield size={14} color="#2563EB" />
        <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>Rider Safety Profiles</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {(['all','high','critical'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'3px 10px', borderRadius:12, border:'1px solid',
                borderColor: filter===f ? '#2563EB' : '#E2E8F0',
                background: filter===f ? '#2563EB' : '#fff',
                color: filter===f ? '#fff' : '#475569',
                fontSize:11, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
              {f === 'all' ? 'All' : f === 'high' ? 'High+ Risk' : 'Critical'}
            </button>
          ))}
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #F1F5F9' }}>
            {['Rider','Hub','Safety Score','GPS Score','Risk','Incidents','Open','Vehicle','Helmet'].map(h => (
              <th key={h} style={{ textAlign:h==='Rider'||h==='Hub'?'left':'center', padding:'10px 12px',
                fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.sort((a,b) => a.safetyScore - b.safetyScore).map((r, i) => (
            <tr key={r.riderId} style={{ borderBottom:i<filtered.length-1?'1px solid #F8FAFC':'none' }}>
              <td style={{ padding:'10px 12px' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{r.riderName}</div>
              </td>
              <td style={{ padding:'10px 12px', fontSize:11, color:'#64748B' }}>{r.hub}</td>
              <td style={{ padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:800, color: r.safetyScore >= 90 ? '#059669' : r.safetyScore >= 70 ? '#2563EB' : r.safetyScore >= 50 ? '#D97706' : '#DC2626' }}>
                  {r.safetyScore}
                </div>
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:13, fontWeight:700, color: r.gpsScore >= 95 ? '#059669' : r.gpsScore >= 80 ? '#D97706' : '#DC2626' }}>
                  {r.gpsScore.toFixed(1)}%
                </div>
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center' }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10,
                  background: r.riskLevel==='low'?'#ECFDF5':r.riskLevel==='medium'?'#EFF6FF':r.riskLevel==='high'?'#FFFBEB':'#FEF2F2',
                  color: RISK_COLORS[r.riskLevel], textTransform:'capitalize' }}>
                  {r.riskLevel}
                </span>
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center', fontSize:13, fontWeight:700,
                color: r.incidentCount > 0 ? '#DC2626' : '#059669' }}>
                {r.incidentCount}
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center' }}>
                {r.openIncidents > 0
                  ? <span style={{ fontSize:11, fontWeight:700, color:'#DC2626' }}>{r.openIncidents} open</span>
                  : <span style={{ fontSize:11, color:'#94A3B8' }}>—</span>}
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center' }}>
                <span title={r.vehicleInspectionDate} style={{ fontSize:14 }}>
                  {VEHICLE_STATUS[r.vehicleInspectionStatus].emoji}
                </span>
              </td>
              <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12, fontWeight:700,
                color: r.helmetCompliance >= 95 ? '#059669' : r.helmetCompliance >= 80 ? '#D97706' : '#DC2626' }}>
                {r.helmetCompliance}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SafetyDashboard() {
  const stats = getSafetyStats();

  const openIncidents    = SAFETY_INCIDENTS.filter(i => ['open','under_review','escalated'].includes(i.status));
  const resolvedIncidents= SAFETY_INCIDENTS.filter(i => i.status === 'resolved');

  // Type breakdown chart
  const typeChart = Object.entries(
    SAFETY_INCIDENTS.reduce((acc, inc) => {
      const label = INCIDENT_TYPE_LABELS[inc.type as IncidentType];
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count })).sort((a,b) => b.count-a.count);

  // Hub safety scores
  const hubScores = Object.entries(
    RIDER_SAFETY_PROFILES.reduce((acc, r) => {
      if (!acc[r.hub]) acc[r.hub] = [];
      acc[r.hub].push(r.safetyScore);
      return acc;
    }, {} as Record<string, number[]>)
  ).map(([hub, scores]) => ({
    hub: hub.replace('-Hub','').replace('-Central','').replace('Hub','').trim(),
    score: Math.round(scores.reduce((s,v)=>s+v,0)/scores.length),
  })).sort((a,b)=>b.score-a.score);

  const PIE_COLORS = ['#DC2626','#D97706','#2563EB','#059669','#7C3AED','#0891B2','#B45309','#64748B'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">Safety Dashboard</h1>
        <p className="page-sub">GPS compliance monitoring, incident tracking, vehicle inspections, and safety scoring</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {[
            { emoji:'🛡️', label:'Avg Safety Score', value:stats.avgScore, sub:'Fleet-wide', color: stats.avgScore>=80?'#059669':'#D97706' },
            { emoji:'🚨', label:'Open Incidents',    value:openIncidents.length, sub:`${stats.total} total this month`,   color:'#DC2626' },
            { emoji:'❗', label:'Critical Incidents',value:stats.critical, sub:'GPS spoofing detected', color:'#DC2626' },
            { emoji:'📍', label:'GPS Spoofing',      value:stats.mockLoc,  sub:'Mock location events', color:'#7C3AED' },
            { emoji:'⚠',  label:'High-Risk Riders',  value:stats.highRisk, sub:'Need immediate action', color:'#D97706' },
            { emoji:'✅', label:'Resolved',           value:resolvedIncidents.length, sub:'Closed this month', color:'#059669' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{kpi.emoji}</div>
              <div style={{ fontSize:22, fontWeight:800, color:kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize:11, color:'#0F172A', fontWeight:600, marginTop:3 }}>{kpi.label}</div>
              <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
        {/* Hub safety score */}
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>
            Safety Score by Hub (avg)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hubScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize:10 }} />
              <YAxis domain={[0,100]} tick={{ fontSize:10 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[4,4,0,0]}>
                {hubScores.map((h,i) => (
                  <Cell key={i} fill={h.score>=90?'#059669':h.score>=70?'#2563EB':h.score>=50?'#D97706':'#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Incident types */}
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>
            Incidents by Type
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={typeChart} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {typeChart.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
              {typeChart.map((item, i) => (
                <div key={item.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:PIE_COLORS[i%PIE_COLORS.length] }} />
                  <div style={{ fontSize:11, color:'#475569', flex:1 }}>{item.name}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#0F172A' }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Open incidents + Rider table */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <IncidentsTable incidents={openIncidents} title="Open Incidents" />
        <RiderSafetyTable />
        {resolvedIncidents.length > 0 && (
          <IncidentsTable incidents={resolvedIncidents} title="Recently Resolved" />
        )}
      </div>
    </div>
  );
}
