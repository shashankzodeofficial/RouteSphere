import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, type LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  RIDER_ATTENDANCE, getAttendanceStats, getHubAttendance,
  ATT_STATUS_COLOR, type AttendanceStatus, type RiderAttendance,
} from '../data/attendanceData';

// ============================================================
// HELPERS
// ============================================================

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present:'P', late:'L', absent:'A', half_day:'H', leave:'EL', holiday:'🎉', week_off:'',
};

function AttCell({ status }: { status: AttendanceStatus }) {
  if (status === 'week_off' || status === 'holiday') {
    return (
      <div style={{ width:22, height:22, borderRadius:4, background: status==='holiday'?'#F1F5F9':'transparent',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#94A3B8' }}>
        {status === 'holiday' ? '🎉' : ''}
      </div>
    );
  }
  return (
    <div style={{ width:22, height:22, borderRadius:4,
      background: ATT_STATUS_COLOR[status] + '20',
      border:`1px solid ${ATT_STATUS_COLOR[status]}40`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:8, fontWeight:800, color:ATT_STATUS_COLOR[status] }}>
      {STATUS_LABEL[status]}
    </div>
  );
}

const DATE_LABELS = [
  '1','2','H','4','5','S','S','8','9','10','11','12','S','S','15','16','17','18','19','20',
];

// ============================================================
// OVERVIEW TAB
// ============================================================

function OverviewTab() {
  const stats = getAttendanceStats();
  const hubAtt = getHubAttendance();

  const topRiders = [...RIDER_ATTENDANCE]
    .sort((a, b) => b.attendancePct - a.attendancePct)
    .slice(0, 5);
  const bottomRiders = [...RIDER_ATTENDANCE]
    .sort((a, b) => a.attendancePct - b.attendancePct)
    .slice(0, 5);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Today row */}
      <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:14, padding:20, color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase',
          letterSpacing:'0.1em', marginBottom:12 }}>
          Today — Friday, 20 June 2026
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[
            { label:'Present',   value:stats.presentToday, color:'#059669', emoji:'✅' },
            { label:'Late',      value:stats.lateToday,    color:'#D97706', emoji:'⏰' },
            { label:'Absent',    value:stats.absentToday,  color:'#DC2626', emoji:'❌' },
            { label:'On Leave',  value:stats.onLeaveToday, color:'#2563EB', emoji:'📝' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'12px 0' }}>
              <div style={{ fontSize:28, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontSize:36, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Hub attendance */}
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>
            Attendance by Hub — June 1–20
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hubAtt.sort((a,b)=>b.avgAtt-a.avgAtt)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize:9 }}
                tickFormatter={v => v.replace('-Central','').replace('-Hub','').trim()} />
              <YAxis domain={[70,100]} tick={{ fontSize:9 }} unit="%" />
              <Tooltip formatter={(v:number) => `${v}%`} />
              <Bar dataKey="avgAtt" radius={[4,4,0,0]} name="Attendance %">
                {hubAtt.map((h,i) => (
                  <Cell key={i} fill={h.avgAtt>=95?'#059669':h.avgAtt>=85?'#2563EB':h.avgAtt>=75?'#D97706':'#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top vs Bottom */}
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>
            Attendance Rankings
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'#059669', marginBottom:6 }}>🏆 Perfect Attendance</div>
          {topRiders.filter(r => r.attendancePct === 100).slice(0,3).map(r => (
            <div key={r.riderId} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
              <span style={{ fontSize:12, color:'#0F172A' }}>{r.riderName}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#059669' }}>100%</span>
            </div>
          ))}
          {topRiders.filter(r => r.attendancePct < 100).slice(0,2).map(r => (
            <div key={r.riderId} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
              <span style={{ fontSize:12, color:'#0F172A' }}>{r.riderName}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#059669' }}>{r.attendancePct}%</span>
            </div>
          ))}
          <div style={{ height:1, background:'#F1F5F9', margin:'10px 0' }} />
          <div style={{ fontSize:11, fontWeight:700, color:'#DC2626', marginBottom:6 }}>⚠ Needs Attention</div>
          {bottomRiders.slice(0,4).map(r => (
            <div key={r.riderId} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
              <span style={{ fontSize:12, color:'#0F172A' }}>{r.riderName}</span>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {r.absent >= 2 && (
                  <span style={{ fontSize:10, color:'#DC2626', fontWeight:600 }}>{r.absent} absent</span>
                )}
                <span style={{ fontSize:12, fontWeight:700, color:'#DC2626' }}>{r.attendancePct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HEATMAP TAB
// ============================================================

function HeatmapTab() {
  const [sortBy, setSortBy] = useState<'name' | 'att' | 'absent'>('att');

  const sorted = useMemo(() => {
    return [...RIDER_ATTENDANCE].sort((a, b) => {
      if (sortBy === 'name')   return a.riderName.localeCompare(b.riderName);
      if (sortBy === 'absent') return b.absent - a.absent;
      return a.attendancePct - b.attendancePct;
    });
  }, [sortBy]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>Sort:</span>
        {(['att','absent','name'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            style={{ padding:'4px 12px', borderRadius:20, border:'1px solid',
              borderColor: sortBy===s?'#2563EB':'#E2E8F0', background: sortBy===s?'#2563EB':'#fff',
              color: sortBy===s?'#fff':'#475569', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {s==='att'?'Attendance %':s==='absent'?'Most Absent':'Name'}
          </button>
        ))}
        {/* Legend */}
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          {([
            { color:'#059669', label:'Present' }, { color:'#D97706', label:'Late' },
            { color:'#DC2626', label:'Absent' }, { color:'#2563EB', label:'Leave' },
            { color:'#7C3AED', label:'Half Day' },
          ] as const).map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:`${l.color}40`,
                border:`1px solid ${l.color}60` }} />
              <span style={{ fontSize:10, color:'#64748B' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'auto',
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ borderCollapse:'collapse', minWidth:'100%' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
              <th style={{ position:'sticky', left:0, background:'#fff', textAlign:'left',
                padding:'10px 16px', fontSize:11, fontWeight:700, color:'#64748B', minWidth:140, zIndex:1 }}>
                Rider
              </th>
              <th style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:700, color:'#64748B', minWidth:100 }}>Hub</th>
              <th style={{ textAlign:'center', padding:'10px 8px', fontSize:11, fontWeight:700, color:'#64748B', minWidth:60 }}>Att%</th>
              {DATE_LABELS.map((d, i) => (
                <th key={i} style={{ textAlign:'center', padding:'4px 2px', fontSize:9, fontWeight:700,
                  color: d==='S'?'#E2E8F0':d==='H'?'#94A3B8':'#64748B', minWidth:26 }}>{d}</th>
              ))}
              <th style={{ textAlign:'center', padding:'10px 8px', fontSize:11, fontWeight:700, color:'#64748B' }}>Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rider, i) => (
              <tr key={rider.riderId} style={{ borderBottom:i<sorted.length-1?'1px solid #F8FAFC':'none' }}>
                <td style={{ position:'sticky', left:0, background:'#fff', padding:'8px 16px',
                  fontSize:12, fontWeight:700, color:'#0F172A', borderRight:'1px solid #F1F5F9', zIndex:1 }}>
                  {rider.riderName}
                </td>
                <td style={{ padding:'8px 12px', fontSize:11, color:'#64748B' }}>
                  {rider.hub.replace('-Central','').replace('-Hub','').trim()}
                </td>
                <td style={{ padding:'8px 8px', textAlign:'center', fontSize:12, fontWeight:700,
                  color: rider.attendancePct>=95?'#059669':rider.attendancePct>=85?'#2563EB':rider.attendancePct>=75?'#D97706':'#DC2626' }}>
                  {rider.attendancePct}%
                </td>
                {rider.days.map((d, j) => (
                  <td key={j} style={{ padding:'4px 2px', textAlign:'center' }}>
                    <AttCell status={d.status} />
                  </td>
                ))}
                <td style={{ padding:'8px 8px', textAlign:'center' }}>
                  {rider.streak > 0 ? (
                    <span style={{ fontSize:11, fontWeight:700,
                      color: rider.streak >= 10 ? '#059669' : '#2563EB' }}>
                      🔥{rider.streak}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// LEAVE TAB
// ============================================================

function LeaveTab() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {(['sick','casual','earned'] as const).map(type => {
          const totals = RIDER_ATTENDANCE.reduce((s, r) => ({
            total: s.total + r.leaveBalance[type].total,
            used:  s.used  + r.leaveBalance[type].used,
          }), { total:0, used:0 });
          const COLOR = { sick:'#DC2626', casual:'#2563EB', earned:'#059669' };
          const LABEL = { sick:'Sick Leave', casual:'Casual Leave', earned:'Earned Leave' };
          return (
            <div key={type} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12,
              padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:10 }}>{LABEL[type]}</div>
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:COLOR[type] }}>{totals.used}</div>
                  <div style={{ fontSize:10, color:'#94A3B8' }}>used</div>
                </div>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#94A3B8' }}>{totals.total - totals.used}</div>
                  <div style={{ fontSize:10, color:'#94A3B8' }}>remaining</div>
                </div>
              </div>
              <div style={{ height:4, background:'#E2E8F0', borderRadius:2, marginTop:10, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(totals.used/totals.total)*100}%`,
                  background:COLOR[type], borderRadius:2 }} />
              </div>
              <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>
                {totals.used}/{totals.total} days used across fleet
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave balance table */}
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden',
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:8 }}>
          <Calendar size={14} color="#2563EB" />
          <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>Leave Balances — All Riders (FY 2026)</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #F1F5F9' }}>
              {['Rider','Hub','Sick Leave','Casual Leave','Earned Leave','Total Used','Absences'].map(h => (
                <th key={h} style={{ textAlign:h==='Rider'||h==='Hub'?'left':'center',
                  padding:'10px 12px', fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIDER_ATTENDANCE.map((r, i) => {
              const totalUsed = r.leaveBalance.sick.used + r.leaveBalance.casual.used + r.leaveBalance.earned.used;
              return (
                <tr key={r.riderId} style={{ borderBottom:i<RIDER_ATTENDANCE.length-1?'1px solid #F8FAFC':'none' }}>
                  <td style={{ padding:'10px 12px', fontSize:13, fontWeight:700, color:'#0F172A' }}>{r.riderName}</td>
                  <td style={{ padding:'10px 12px', fontSize:11, color:'#64748B' }}>{r.hub}</td>
                  {(['sick','casual','earned'] as const).map(type => (
                    <td key={type} style={{ padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ display:'flex', gap:4, justifyContent:'center', alignItems:'center' }}>
                        <span style={{ fontSize:12, fontWeight:700,
                          color: r.leaveBalance[type].used > 0 ? '#D97706' : '#94A3B8' }}>
                          {r.leaveBalance[type].used}
                        </span>
                        <span style={{ fontSize:10, color:'#94A3B8' }}>/{r.leaveBalance[type].total}</span>
                      </div>
                    </td>
                  ))}
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:13, fontWeight:700,
                    color: totalUsed > 3 ? '#DC2626' : totalUsed > 0 ? '#D97706' : '#94A3B8' }}>
                    {totalUsed}
                  </td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12, fontWeight:700,
                    color: r.absent >= 2 ? '#DC2626' : r.absent === 1 ? '#D97706' : '#059669' }}>
                    {r.absent}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

type TabKey = 'overview' | 'heatmap' | 'leave';
const TABS: Array<{ key:TabKey; label:string; icon:LucideIcon }> = [
  { key:'overview', label:'Overview',    icon:Users     },
  { key:'heatmap',  label:'Attendance Heatmap', icon:Calendar  },
  { key:'leave',    label:'Leave Management', icon:CheckCircle },
];

export default function AttendanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const stats = getAttendanceStats();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">Attendance Dashboard</h1>
        <p className="page-sub">Daily attendance, heatmaps, leave management, and punctuality tracking — June 2026</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {[
            { emoji:'✅', label:'Present Today',     value:stats.presentToday,      sub:'as of now',              color:'#059669' },
            { emoji:'⏰', label:'Late Today',         value:stats.lateToday,         sub:'arrived after 9:00',     color:'#D97706' },
            { emoji:'❌', label:'Absent Today',       value:stats.absentToday,       sub:'unplanned',              color:'#DC2626' },
            { emoji:'📊', label:'Fleet Attendance',   value:`${stats.avgAttendance}%`, sub:'average this month',   color:'#2563EB' },
            { emoji:'🌟', label:'Perfect Attendance', value:stats.perfectAttendance, sub:'zero absences Jun 1–20', color:'#7C3AED' },
            { emoji:'⚠',  label:'Chronic Absentees', value:stats.chronicAbsentees,  sub:'2+ absences this month', color:'#DC2626' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{kpi.emoji}</div>
              <div style={{ fontSize:typeof kpi.value==='string'?18:22, fontWeight:800, color:kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize:11, color:'#0F172A', fontWeight:600, marginTop:3 }}>{kpi.label}</div>
              <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'#fff', border:'1px solid #E2E8F0', borderRadius:12,
        overflow:'hidden', marginBottom:20, flexShrink:0, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex:1, padding:'14px 8px', border:'none', cursor:'pointer',
              borderBottom:`3px solid ${activeTab===tab.key?'#2563EB':'transparent'}`,
              background: activeTab===tab.key?'#EFF6FF':'transparent',
              color: activeTab===tab.key?'#2563EB':'#64748B',
              fontSize:13, fontWeight:700, display:'flex', alignItems:'center',
              justifyContent:'center', gap:6 }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {activeTab==='overview' && <OverviewTab />}
        {activeTab==='heatmap'  && <HeatmapTab />}
        {activeTab==='leave'    && <LeaveTab />}
      </div>
    </div>
  );
}
