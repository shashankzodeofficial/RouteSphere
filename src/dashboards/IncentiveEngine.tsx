import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Crown, Users, type LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import {
  RIDER_INCENTIVES, INCENTIVE_TIERS, MONTHLY_HISTORY, TIER_COLORS,
  getIncentiveStats,
  type RiderIncentive, type IncentiveTierName,
} from '../data/incentiveData';

// ============================================================
// HELPERS
// ============================================================

function inr(v: number) {
  return '₹' + v.toLocaleString('en-IN');
}

const GRADE_COLOR: Record<string, string> = {
  S:'#7C3AED', A:'#059669', B:'#2563EB', C:'#D97706', D:'#DC2626',
};

function GradeBadge({ grade }: { grade: string }) {
  return (
    <div style={{ width:24, height:24, borderRadius:6, background:GRADE_COLOR[grade]??'#64748B',
      color:'#fff', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
      {grade}
    </div>
  );
}

function TierBadge({ tier }: { tier: IncentiveTierName }) {
  const t = TIER_COLORS[tier];
  return (
    <span style={{ fontSize:11, fontWeight:700, background:t?.bg, color:t?.color,
      padding:'2px 9px', borderRadius:20, border:`1px solid ${t?.border}` }}>
      {tier}
    </span>
  );
}

// ============================================================
// TIER OVERVIEW (top section)
// ============================================================

function TierOverview() {
  const grouped = useMemo(() => {
    const map: Record<string, RiderIncentive[]> = { Platinum:[], Gold:[], Silver:[], Bronze:[], Other:[] };
    RIDER_INCENTIVES.forEach(r => {
      if (map[r.tier]) map[r.tier].push(r);
      else map.Other.push(r);
    });
    return map;
  }, []);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
      {INCENTIVE_TIERS.map(tier => {
        const riders  = grouped[tier.name] ?? [];
        const total   = riders.reduce((s, r) => s + r.totalPayout, 0);
        const avg     = riders.length > 0 ? Math.round(total / riders.length) : 0;
        return (
          <div key={tier.name} style={{ background:tier.bg, border:`1px solid ${tier.border}`,
            borderRadius:14, padding:18, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:14, fontWeight:800, color:tier.color }}>{tier.name}</div>
              <div style={{ fontSize:11, fontWeight:600, color:tier.color,
                background:'rgba(255,255,255,0.6)', padding:'2px 8px', borderRadius:20 }}>
                Grade {tier.grade}+
              </div>
            </div>
            <div style={{ fontSize:26, fontWeight:900, color:tier.color, marginBottom:2 }}>
              {riders.length}
            </div>
            <div style={{ fontSize:11, color:'#64748B', marginBottom:12 }}>riders in this tier</div>

            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#64748B' }}>Base bonus</span>
                <span style={{ fontSize:11, fontWeight:700, color:tier.color }}>{inr(tier.baseBonus)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#64748B' }}>Delivery target</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#0F172A' }}>{tier.deliveryTarget} orders</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#64748B' }}>Per extra delivery</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#0F172A' }}>{inr(tier.deliveryRate)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#64748B' }}>Avg this month</span>
                <span style={{ fontSize:11, fontWeight:700, color:tier.color }}>{inr(avg)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#64748B' }}>Monthly cap</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#64748B' }}>{inr(tier.monthlyMax)}</span>
              </div>
            </div>

            {/* Rider avatars */}
            {riders.length > 0 && (
              <div style={{ marginTop:12, display:'flex', gap:4, flexWrap:'wrap' }}>
                {riders.map(r => (
                  <div key={r.riderId} title={r.riderName} style={{
                    width:28, height:28, borderRadius:'50%',
                    background:`linear-gradient(135deg,${tier.color},${tier.border})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:'#fff', border:`2px solid ${tier.border}` }}>
                    {r.riderName.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// RIDER DETAIL PANEL
// ============================================================

function RiderDetail({ rider, onClose }: { rider: RiderIncentive; onClose: () => void }) {
  const tier = TIER_COLORS[rider.tier];
  const totalComponents = rider.components.reduce((s, c) => s + c.amount, 0);

  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, overflow:'hidden',
      boxShadow:'0 4px 24px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px', background:`linear-gradient(135deg,#0F172A,#1E293B)` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:10, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
              Incentive Breakdown — June 2026
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#F1F5F9' }}>{rider.riderName}</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{rider.hub} · {rider.region}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <TierBadge tier={rider.tier} />
            <div style={{ fontSize:32, fontWeight:900, color:tier?.color ?? '#FFD700', marginTop:8 }}>
              {inr(rider.totalPayout)}
            </div>
            <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>Total payout</div>
          </div>
        </div>
      </div>

      {/* Components */}
      <div style={{ padding:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#64748B', textTransform:'uppercase',
          letterSpacing:'0.06em', marginBottom:12 }}>Payout Components</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {rider.components.map(comp => (
            <div key={comp.label} style={{ display:'flex', gap:12, alignItems:'center',
              padding:'10px 14px', borderRadius:8,
              background: comp.achieved ? '#F0FDF4' : '#F8FAFC',
              border:`1px solid ${comp.achieved ? '#A7F3D0' : '#E2E8F0'}` }}>
              <div style={{ fontSize:16 }}>{comp.achieved ? '✅' : '❌'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{comp.label}</div>
                <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{comp.detail}</div>
              </div>
              <div style={{ fontSize:16, fontWeight:800,
                color: comp.achieved ? '#059669' : '#94A3B8', minWidth:70, textAlign:'right' }}>
                {inr(comp.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ marginTop:14, padding:'12px 14px', background:'#F8FAFC', borderRadius:8,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          border:'1px solid #E2E8F0' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>Total (before cap)</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#0F172A' }}>{inr(totalComponents)}</div>
        </div>
        <div style={{ marginTop:6, padding:'12px 14px', background:'linear-gradient(135deg,#0F172A,#1E293B)',
          borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8' }}>Final Payout</div>
          <div style={{ fontSize:20, fontWeight:900, color:tier?.color ?? '#FFD700' }}>
            {inr(rider.totalPayout)}
          </div>
        </div>

        {/* vs last month */}
        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          <div style={{ flex:1, padding:'10px 12px', background:'#F8FAFC', borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#94A3B8' }}>May 2026</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#64748B' }}>{inr(rider.prevMonthPayout)}</div>
          </div>
          <div style={{ flex:1, padding:'10px 12px', borderRadius:8, textAlign:'center',
            background: rider.payoutChange >= 0 ? '#ECFDF5' : '#FEF2F2',
            border:`1px solid ${rider.payoutChange >= 0 ? '#A7F3D0' : '#FECACA'}` }}>
            <div style={{ fontSize:11, color:'#94A3B8' }}>Change</div>
            <div style={{ fontSize:15, fontWeight:800, color: rider.payoutChange >= 0 ? '#059669' : '#DC2626' }}>
              {rider.payoutChange >= 0 ? '+' : ''}{inr(rider.payoutChange)}
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{ marginTop:14, width:'100%', padding:'8px 0', borderRadius:8,
          border:'1px solid #E2E8F0', background:'#F8FAFC', color:'#64748B', fontSize:12,
          fontWeight:600, cursor:'pointer' }}>Close</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function IncentiveEngine() {
  const [selectedRider, setSelectedRider] = useState<RiderIncentive | null>(null);
  const [sortBy, setSortBy] = useState<'payout' | 'name' | 'score'>('payout');

  const stats = getIncentiveStats();

  const sorted = useMemo(() => {
    return [...RIDER_INCENTIVES].sort((a, b) => {
      if (sortBy === 'name')  return a.riderName.localeCompare(b.riderName);
      if (sortBy === 'score') return b.currentScore - a.currentScore;
      return b.totalPayout - a.totalPayout;
    });
  }, [sortBy]);

  const chartData = MONTHLY_HISTORY.map(m => ({ month: m.month.split(' ')[0], total: m.totalPayout, avg: m.avgPayout }));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 className="page-title">Incentive Engine</h1>
        <p className="page-sub">June 2026 performance-based incentives — tier targets, delivery bonuses, and payouts</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {[
            { emoji:'💰', label:'Total Payout',     value:inr(stats.totalPayout),       sub:'Jun 2026',              color:'#D97706' },
            { emoji:'📊', label:'Avg per Rider',    value:inr(stats.avgPayout),          sub:`of ${RIDER_INCENTIVES.length} riders`, color:'#2563EB' },
            { emoji:'✅', label:'Targets Met',       value:stats.achievedCount,           sub:'hit delivery target',   color:'#059669' },
            { emoji:'👑', label:'Platinum Tier',     value:stats.platinumCount,           sub:`Grade S riders`,        color:'#7C3AED' },
            { emoji:'🌟', label:'Gold Tier',         value:stats.goldCount,               sub:'Grade A riders',        color:'#D97706' },
            { emoji:'⚠',  label:'At Risk',           value:stats.atRiskCount,             sub:'Below delivery target', color:'#DC2626' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{kpi.emoji}</div>
              <div style={{ fontSize:typeof kpi.value === 'string' ? 15 : 22, fontWeight:800, color:kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontSize:11, color:'#0F172A', fontWeight:600, marginTop:3 }}>{kpi.label}</div>
              <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier overview */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#0F172A', marginBottom:12 }}>Tier Breakdown — June 2026</div>
        <TierOverview />
      </div>

      {/* Charts + Table */}
      <div style={{ display:'flex', gap:16, flex:1, minHeight:0 }}>
        {/* Left: chart */}
        <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
            boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>Monthly Payout Trend</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} dot={{ r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:16,
            boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', marginBottom:12 }}>June Payout by Rider</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sorted.slice(0,10).map(r=>({ name:r.riderName.split(' ')[0], payout:r.totalPayout, tier:r.tier }))}
                layout="vertical">
                <XAxis type="number" tick={{ fontSize:9 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:9 }} width={50} />
                <Tooltip formatter={(v:number)=>inr(v)} />
                <Bar dataKey="payout" radius={[0,4,4,0]}>
                  {sorted.slice(0,10).map((r, idx) => (
                    <Cell key={idx} fill={TIER_COLORS[r.tier]?.color ?? '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: table + detail */}
        <div style={{ flex:1, display:'flex', gap:14, minWidth:0 }}>
          <div style={{ flex:1, background:'#fff', border:'1px solid #E2E8F0', borderRadius:12,
            overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', height:'fit-content' }}>
            {/* Sort controls */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#64748B' }}>Sort:</span>
              {(['payout','score','name'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ padding:'3px 10px', borderRadius:12, border:'1px solid',
                    borderColor: sortBy === s ? '#2563EB' : '#E2E8F0',
                    background: sortBy === s ? '#2563EB' : '#fff',
                    color: sortBy === s ? '#fff' : '#475569', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                  {s === 'payout' ? 'Payout' : s === 'score' ? 'Score' : 'Name'}
                </button>
              ))}
            </div>

            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #F1F5F9' }}>
                  {['Rider','Hub','Tier','Score','Deliveries','Payout','vs May','Status'].map(h => (
                    <th key={h} style={{ textAlign:h==='Rider'||h==='Hub'?'left':'center', padding:'10px 12px',
                      fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={r.riderId}
                    onClick={() => setSelectedRider(selectedRider?.riderId === r.riderId ? null : r)}
                    style={{ borderBottom: i < sorted.length-1 ? '1px solid #F8FAFC' : 'none',
                      cursor:'pointer', background: selectedRider?.riderId === r.riderId ? '#EFF6FF' : 'transparent' }}>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{r.riderName}</div>
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:11, color:'#64748B' }}>{r.hub}</td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}><TierBadge tier={r.tier} /></td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                        <GradeBadge grade={r.grade} />
                        <span style={{ fontSize:12, fontWeight:600 }}>{r.currentScore.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12, fontWeight:600 }}>
                      {r.ordersDelivered}
                      {r.targetAchieved
                        ? <span style={{ fontSize:9, color:'#059669', marginLeft:4 }}>✓</span>
                        : <span style={{ fontSize:9, color:'#DC2626', marginLeft:4 }}>↓</span>}
                    </td>
                    <td style={{ padding:'10px 12px', textAlign:'center', fontSize:14, fontWeight:800,
                      color: TIER_COLORS[r.tier]?.color ?? '#64748B' }}>
                      {inr(r.totalPayout)}
                    </td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700,
                        color: r.payoutChange >= 0 ? '#059669' : '#DC2626' }}>
                        {r.payoutChange >= 0 ? '+' : ''}{inr(r.payoutChange)}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10,
                        background: r.status==='achieved'?'#ECFDF5':r.status==='on_track'?'#EFF6FF':r.status==='at_risk'?'#FFFBEB':'#FEF2F2',
                        color: r.status==='achieved'?'#059669':r.status==='on_track'?'#2563EB':r.status==='at_risk'?'#D97706':'#DC2626' }}>
                        {r.status.replace('_',' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedRider && (
            <div style={{ width:300, flexShrink:0 }}>
              <RiderDetail rider={selectedRider} onClose={() => setSelectedRider(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
