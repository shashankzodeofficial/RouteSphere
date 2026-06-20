import React, { useState, useMemo } from 'react';
import { BookOpen, Award, CheckCircle, Clock, AlertTriangle, Play, Users, type LucideIcon } from 'lucide-react';
import {
  COURSES, RIDER_LEARNING_PROFILES, ALL_CERTIFICATES, getHubSummary,
  CATEGORY_COLORS, CATEGORY_LABELS,
  type Course, type CourseCategory, type RiderLearningProfile,
} from '../data/learningData';

type TabKey = 'catalog' | 'progress' | 'certificates';

// ============================================================
// HELPERS
// ============================================================

const STATUS_COLORS = {
  completed:   { bg:'#ECFDF5', text:'#059669', border:'#A7F3D0', label:'Completed' },
  in_progress: { bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE', label:'In Progress' },
  not_started: { bg:'#F8FAFC', text:'#64748B', border:'#E2E8F0', label:'Not Started' },
  overdue:     { bg:'#FEF2F2', text:'#DC2626', border:'#FECACA', label:'Overdue' },
  failed:      { bg:'#FFFBEB', text:'#D97706', border:'#FDE68A', label:'Retry Needed' },
};

const LEVEL_LABEL = { beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced' };
const LEVEL_COLOR  = { beginner:'#059669',  intermediate:'#2563EB',      advanced:'#DC2626' };
const MODULE_ICON: Record<string, string>  = { video:'🎥', quiz:'📝', document:'📄', practical:'🔧' };

function RingProgress({ pct, size = 48, stroke = 4, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ transform:'rotate(90deg)', transformOrigin:'center',
          fontSize:size < 48 ? 8 : 10, fontWeight:700, fill:color }}>
        {pct}%
      </text>
    </svg>
  );
}

// ============================================================
// CATALOG TAB
// ============================================================

function CatalogTab() {
  const [selectedCat, setSelectedCat] = useState<CourseCategory | 'all'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filtered = selectedCat === 'all' ? COURSES : COURSES.filter(c => c.category === selectedCat);

  const stats = useMemo(() => {
    const total = RIDER_LEARNING_PROFILES.length;
    return COURSES.reduce((acc, course) => {
      const completed = RIDER_LEARNING_PROFILES.filter(p =>
        p.progress.find(pr => pr.courseId === course.id && pr.status === 'completed')
      ).length;
      acc[course.id] = Math.round((completed / total) * 100);
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const CATS: Array<{ key: CourseCategory | 'all'; label: string }> = [
    { key:'all',         label:'All Courses' },
    { key:'safety',      label:'🦺 Safety' },
    { key:'compliance',  label:'✅ Compliance' },
    { key:'delivery',    label:'📦 Delivery' },
    { key:'app',         label:'📱 App Usage' },
    { key:'customer',    label:'🤝 Customer' },
    { key:'new_rider',   label:'🌱 Onboarding' },
  ];

  return (
    <div style={{ display:'flex', gap:16 }}>
      {/* Course grid */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>
        {/* Category filter */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {CATS.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCat(cat.key)}
              style={{ padding:'5px 12px', borderRadius:20, border:'1px solid',
                borderColor: selectedCat === cat.key ? '#2563EB' : '#E2E8F0',
                background: selectedCat === cat.key ? '#2563EB' : '#fff',
                color: selectedCat === cat.key ? '#fff' : '#475569',
                fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {filtered.map(course => {
            const cc = CATEGORY_COLORS[course.category];
            const completionPct = stats[course.id] ?? 0;
            const isSelected = selectedCourse?.id === course.id;
            return (
              <div key={course.id} onClick={() => setSelectedCourse(isSelected ? null : course)}
                style={{ background:'#fff', border:`2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                  borderRadius:12, padding:16, cursor:'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <span style={{ fontSize:10, fontWeight:700, background:cc.bg, color:cc.text,
                    padding:'2px 8px', borderRadius:20, border:`1px solid ${cc.border}` }}>
                    {CATEGORY_LABELS[course.category]}
                  </span>
                  {course.required && (
                    <span style={{ fontSize:10, fontWeight:700, background:'#FEF2F2', color:'#DC2626',
                      padding:'2px 7px', borderRadius:20, border:'1px solid #FECACA' }}>Required</span>
                  )}
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:4, lineHeight:1.4 }}>
                  {course.title}
                </div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:10 }}>
                  <span style={{ color: LEVEL_COLOR[course.level], fontWeight:600 }}>
                    {LEVEL_LABEL[course.level]}
                  </span>
                  {' · '}
                  <Clock size={10} style={{ display:'inline', marginRight:2 }} />
                  {course.durationMinutes} min · {course.modules.length} modules
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ flex:1, height:4, background:'#E2E8F0', borderRadius:2, marginRight:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${completionPct}%`,
                      background: completionPct >= 80 ? '#059669' : completionPct >= 50 ? '#D97706' : '#2563EB',
                      borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700,
                    color: completionPct >= 80 ? '#059669' : completionPct >= 50 ? '#D97706' : '#64748B' }}>
                    {completionPct}% team
                  </span>
                </div>
                {course.requiredByDate && (
                  <div style={{ marginTop:6, fontSize:10, color:'#D97706' }}>
                    📅 Due: {new Date(course.requiredByDate).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course detail panel */}
      {selectedCourse && (
        <div style={{ width:280, flexShrink:0, background:'#fff', border:'1px solid #E2E8F0',
          borderRadius:12, padding:20, height:'fit-content', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', position:'sticky', top:0 }}>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700,
              background:CATEGORY_COLORS[selectedCourse.category].bg,
              color:CATEGORY_COLORS[selectedCourse.category].text,
              padding:'2px 8px', borderRadius:20, display:'inline-block',
              border:`1px solid ${CATEGORY_COLORS[selectedCourse.category].border}`, marginBottom:8 }}>
              {CATEGORY_LABELS[selectedCourse.category]}
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:'#0F172A', lineHeight:1.4, marginBottom:6 }}>
              {selectedCourse.title}
            </div>
            <div style={{ fontSize:12, color:'#475569', lineHeight:1.6 }}>{selectedCourse.description}</div>
          </div>

          {/* Meta row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            {[
              { label:'Duration',  value:`${selectedCourse.durationMinutes} min` },
              { label:'Level',     value:LEVEL_LABEL[selectedCourse.level] },
              { label:'Modules',   value:selectedCourse.modules.length },
              { label:'Pass Score',value:`${selectedCourse.passingScore}%` },
            ].map(m => (
              <div key={m.label} style={{ background:'#F8FAFC', borderRadius:8, padding:'8px 10px' }}>
                <div style={{ fontSize:10, color:'#94A3B8' }}>{m.label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Modules list */}
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:8 }}>Modules</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {selectedCourse.modules.map((mod, i) => (
              <div key={mod.id} style={{ display:'flex', gap:8, padding:'8px 10px', background:'#F8FAFC',
                borderRadius:8, alignItems:'center' }}>
                <span style={{ fontSize:14 }}>{MODULE_ICON[mod.type]}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#334155' }}>{i+1}. {mod.title}</div>
                  <div style={{ fontSize:10, color:'#94A3B8' }}>{mod.durationMinutes} min · {mod.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Team completion */}
          <div style={{ marginTop:14, padding:12, background:'#EFF6FF', borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'#2563EB' }}>{stats[selectedCourse.id]}%</div>
            <div style={{ fontSize:11, color:'#64748B' }}>team completion rate</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROGRESS TAB
// ============================================================

function ProgressTab() {
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'overdue'>('completion');

  const sorted = useMemo(() => {
    return [...RIDER_LEARNING_PROFILES].sort((a, b) => {
      if (sortBy === 'name')       return a.riderName.localeCompare(b.riderName);
      if (sortBy === 'overdue')    return b.overdue - a.overdue;
      return b.completionPct - a.completionPct;
    });
  }, [sortBy]);

  const hubSummary = getHubSummary();

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Hub summary chart */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        {hubSummary.slice(0,5).map(h => (
          <div key={h.hub} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10, padding:'12px 14px',
            boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#64748B', marginBottom:8,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{h.hub}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#0F172A' }}>{h.completionPct}%</div>
            <div style={{ fontSize:10, color:'#94A3B8' }}>completion</div>
            {h.overdue > 0 && (
              <div style={{ marginTop:6, fontSize:10, color:'#DC2626', fontWeight:600 }}>
                ⚠ {h.overdue} overdue
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>Sort:</span>
        {(['completion','name','overdue'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            style={{ padding:'4px 12px', borderRadius:20, border:'1px solid',
              borderColor: sortBy === s ? '#2563EB' : '#E2E8F0',
              background: sortBy === s ? '#2563EB' : '#fff',
              color: sortBy === s ? '#fff' : '#475569',
              fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
            {s === 'completion' ? 'Completion %' : s === 'overdue' ? 'Overdue First' : 'Name'}
          </button>
        ))}
      </div>

      {/* Rider progress table */}
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden',
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
              <th style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Rider</th>
              <th style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Hub</th>
              <th style={{ textAlign:'center', padding:'12px 8px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Progress</th>
              <th style={{ textAlign:'center', padding:'12px 8px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Done</th>
              <th style={{ textAlign:'center', padding:'12px 8px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Active</th>
              <th style={{ textAlign:'center', padding:'12px 8px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Overdue</th>
              <th style={{ textAlign:'center', padding:'12px 8px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Certs</th>
              <th style={{ textAlign:'right', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>Hours</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rider, i) => (
              <tr key={rider.riderId} style={{ borderBottom:i < sorted.length-1 ? '1px solid #F8FAFC' : 'none',
                background: rider.overdue > 0 ? '#FFFBEB20' : 'transparent' }}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{rider.riderName}</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>{rider.region}</div>
                </td>
                <td style={{ padding:'12px 16px', fontSize:12, color:'#475569' }}>{rider.hub}</td>
                <td style={{ padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:100, height:6, background:'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${rider.completionPct}%`,
                        background: rider.completionPct >= 80 ? '#059669' : rider.completionPct >= 50 ? '#D97706' : '#2563EB',
                        borderRadius:3 }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:700,
                      color: rider.completionPct >= 80 ? '#059669' : rider.completionPct >= 50 ? '#D97706' : '#64748B' }}>
                      {rider.completionPct}%
                    </span>
                  </div>
                </td>
                <td style={{ padding:'12px 8px', textAlign:'center', fontSize:13, fontWeight:700, color:'#059669' }}>
                  {rider.completed}
                </td>
                <td style={{ padding:'12px 8px', textAlign:'center', fontSize:13, fontWeight:700, color:'#2563EB' }}>
                  {rider.inProgress}
                </td>
                <td style={{ padding:'12px 8px', textAlign:'center' }}>
                  {rider.overdue > 0
                    ? <span style={{ fontSize:12, fontWeight:700, color:'#DC2626', background:'#FEF2F2',
                        padding:'2px 8px', borderRadius:10 }}>⚠ {rider.overdue}</span>
                    : <span style={{ fontSize:12, color:'#94A3B8' }}>—</span>}
                </td>
                <td style={{ padding:'12px 8px', textAlign:'center', fontSize:13, fontWeight:700,
                  color: rider.certificates > 0 ? '#D97706' : '#94A3B8' }}>
                  {rider.certificates > 0 ? `🎖 ${rider.certificates}` : '—'}
                </td>
                <td style={{ padding:'12px 16px', textAlign:'right', fontSize:12, color:'#475569' }}>
                  {Math.round(rider.totalMinutesLearned / 60)}h
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
// CERTIFICATES TAB
// ============================================================

function CertificatesTab() {
  const sorted = [...ALL_CERTIFICATES].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Certificates Issued', value:ALL_CERTIFICATES.length, color:'#D97706', emoji:'🎖' },
          { label:'Certified Riders',    value:new Set(ALL_CERTIFICATES.map(c=>c.riderId)).size, color:'#059669', emoji:'✅' },
          { label:'Expiring ≤30 Days',   value:ALL_CERTIFICATES.filter(c=>c.expiresOn && new Date(c.expiresOn) < new Date('2026-07-20')).length, color:'#DC2626', emoji:'⚠' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:10,
            padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:6 }}>{s.emoji}</div>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {sorted.map(cert => {
          const expiring = cert.expiresOn && new Date(cert.expiresOn) < new Date('2026-07-20');
          return (
            <div key={cert.id} style={{ background:'#fff', border:`1px solid ${expiring ? '#FECACA' : '#E2E8F0'}`,
              borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:22 }}>🎖</span>
                {expiring && <span style={{ fontSize:10, fontWeight:700, color:'#DC2626',
                  background:'#FEF2F2', padding:'2px 7px', borderRadius:10, border:'1px solid #FECACA' }}>
                  Expiring Soon
                </span>}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:'#0F172A', marginBottom:4, lineHeight:1.4 }}>
                {cert.courseTitle}
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:'#2563EB', marginBottom:4 }}>{cert.riderName}</div>
              <div style={{ fontSize:11, color:'#64748B', marginBottom:8 }}>{cert.hub}</div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10, color:'#94A3B8' }}>Issued</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#334155' }}>
                    {new Date(cert.issuedOn).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:10, color:'#94A3B8' }}>Score</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#059669' }}>{cert.score}%</div>
                </div>
              </div>
              {cert.expiresOn && (
                <div style={{ marginTop:6, fontSize:10, color: expiring ? '#DC2626' : '#94A3B8' }}>
                  Expires: {new Date(cert.expiresOn).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const TABS: Array<{ key:TabKey; label:string; icon:LucideIcon }> = [
  { key:'catalog',      label:'Course Catalog',   icon:BookOpen },
  { key:'progress',     label:'Team Progress',     icon:Users    },
  { key:'certificates', label:'Certificates',      icon:Award    },
];

export default function LearningCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('catalog');

  const totalCompleted = RIDER_LEARNING_PROFILES.reduce((s, r) => s + r.completed, 0);
  const totalCourses   = RIDER_LEARNING_PROFILES.reduce((s, r) => s + r.totalCourses, 0);
  const overallPct     = Math.round((totalCompleted / totalCourses) * 100);
  const overdueRiders  = RIDER_LEARNING_PROFILES.filter(r => r.overdue > 0).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">Learning Center</h1>
        <p className="page-sub">Training courses, completion tracking, and certifications for RouteSphere delivery riders</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {[
            { emoji:'📚', label:'Total Courses',      value:COURSES.length,          sub:`${COURSES.filter(c=>c.required).length} required`, color:'#2563EB' },
            { emoji:'✅', label:'Team Completion',     value:`${overallPct}%`,        sub:`${totalCompleted}/${totalCourses} completions`,    color:'#059669' },
            { emoji:'🔄', label:'In Progress',         value:RIDER_LEARNING_PROFILES.reduce((s,r)=>s+r.inProgress,0), sub:'Active learners',            color:'#7C3AED' },
            { emoji:'⚠',  label:'Riders Overdue',      value:overdueRiders,           sub:'Required courses past due',                       color:'#DC2626' },
            { emoji:'🎖', label:'Certificates Issued',  value:ALL_CERTIFICATES.length, sub:'All time',                                        color:'#D97706' },
            { emoji:'⏱',  label:'Total Hours Learned',  value:`${Math.round(RIDER_LEARNING_PROFILES.reduce((s,r)=>s+r.totalMinutesLearned,0)/60)}h`, sub:'Across all riders', color:'#0891B2' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{kpi.emoji}</div>
              <div style={{ fontSize:typeof kpi.value === 'string' ? 18 : 22, fontWeight:800, color:kpi.color }}>{kpi.value}</div>
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
              borderBottom:`3px solid ${activeTab === tab.key ? '#2563EB' : 'transparent'}`,
              background: activeTab === tab.key ? '#EFF6FF' : 'transparent',
              color: activeTab === tab.key ? '#2563EB' : '#64748B',
              fontSize:13, fontWeight:700, display:'flex', alignItems:'center',
              justifyContent:'center', gap:6 }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {activeTab === 'catalog'      && <CatalogTab />}
        {activeTab === 'progress'     && <ProgressTab />}
        {activeTab === 'certificates' && <CertificatesTab />}
      </div>
    </div>
  );
}
