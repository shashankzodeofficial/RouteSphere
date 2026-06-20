import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Package, Truck, Users, RefreshCw,
  MapPin, Star, ShieldCheck, BarChart3, Clock, DollarSign,
  CheckCircle2, XCircle, AlertCircle, Cpu, ChevronRight,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  DEMO_KPIS, DEMO_DAILY_DATA, DEMO_CUSTOMERS, DEMO_DRIVERS,
  DEMO_VEHICLES, DEMO_HUBS, DEMO_LIVE_ORDERS, DEMO_CITY_PERFORMANCE,
} from '../data/demoData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function KPICard({
  icon, label, value, sub, colour, trend, trendVal,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  colour: string; trend?: 'up' | 'down'; trendVal?: string;
}) {
  return (
    <div style={{
      background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: colour, opacity: 0.85 }}>{icon}</span>
        {trend && trendVal && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 12,
            background: trend === 'up' ? '#052e16' : '#1a0a0a',
            color: trend === 'up' ? '#34D399' : '#F87171',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {trend === 'up' ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {trendVal}
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: colour, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#334155' }}>{sub}</div>}
    </div>
  );
}

function Section({ title, action, onAction, children }: {
  title: string; action?: string; onAction?: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#CBD5E1', letterSpacing: 0.2 }}>{title}</h2>
        {action && (
          <button onClick={onAction} style={{
            fontSize: 11, color: '#6366F1', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {action} <ChevronRight size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  delivered:        { bg: '#052e16', color: '#34D399', icon: <CheckCircle2 size={11} /> },
  out_for_delivery: { bg: '#0c1a3a', color: '#60A5FA', icon: <Truck size={11} /> },
  in_transit:       { bg: '#1a1100', color: '#FBBF24', icon: <Package size={11} /> },
  pending:          { bg: '#1a1a1a', color: '#94A3B8', icon: <Clock size={11} /> },
  failed:           { bg: '#1a0a0a', color: '#F87171', icon: <XCircle size={11} /> },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DemoOverview() {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<'orders' | 'revenue' | 'ontime'>('orders');
  const k = DEMO_KPIS;

  const chartData = DEMO_DAILY_DATA.map(d => ({
    day:     d.dayLabel,
    orders:  d.ordersDelivered,
    revenue: Math.round(d.revenue / 1000),
    ontime:  d.onTimePct,
    failed:  d.ordersFailed,
    util:    d.fleetUtilizationPct,
  }));

  const vehicleStats = {
    onRoute:     DEMO_VEHICLES.filter(v => v.status === 'on-route').length,
    available:   DEMO_VEHICLES.filter(v => v.status === 'available').length,
    maintenance: DEMO_VEHICLES.filter(v => v.status === 'maintenance').length,
    charging:    DEMO_VEHICLES.filter(v => v.status === 'charging').length,
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1260, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
              borderRadius: 8, padding: '4px 12px',
              fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.5,
            }}>DEMO OVERVIEW</div>
            <span style={{ fontSize: 11, color: '#475569' }}>Last 30 days · 6 cities · 8 hubs</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#E2E8F0' }}>RouteSphere Control Tower</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#475569' }}>Enterprise Last-Mile Delivery Execution Platform</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#334155' }}>Demo period</div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
            {DEMO_DAILY_DATA[0].dayLabel} – {DEMO_DAILY_DATA[29].dayLabel}, 2026
          </div>
        </div>
      </div>

      {/* Top KPI grid */}
      <Section title="Key Performance Indicators (30-Day Summary)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
          <KPICard icon={<Package size={16} />}    label="Total Orders"         value={k.totalOrders.toLocaleString()}  colour="#818CF8" trend="up"   trendVal="+14.2%" sub={`${k.totalDelivered.toLocaleString()} delivered`} />
          <KPICard icon={<CheckCircle2 size={16}/>} label="Success Rate"         value={`${k.successRate}%`}             colour="#34D399" trend="up"   trendVal="+2.1%"  sub="vs prior 30 days" />
          <KPICard icon={<Clock size={16} />}       label="On-Time Delivery"     value={`${k.onTimeRate}%`}              colour="#60A5FA" trend="up"   trendVal="+3.7%"  sub={`Avg ${k.avgDeliveryMinutes} min delivery`} />
          <KPICard icon={<DollarSign size={16} />}  label="Revenue (30d)"        value={`₹${(k.totalRevenue/100000).toFixed(1)}L`} colour="#FBBF24" trend="up" trendVal={`+${k.revenueGrowthPct}%`} sub="vs prior period" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <KPICard icon={<Truck size={16} />}       label="Fleet Utilisation"    value={`${k.fleetUtilization}%`}        colour="#F59E0B" trend="up"   trendVal="+5.3%"  sub={`${vehicleStats.onRoute}/${k.totalVehicles} on route`} />
          <KPICard icon={<Users size={16} />}       label="Active Riders Today"  value={k.activeRidersToday.toString()}  colour="#A78BFA" sub={`${k.totalRiders} in fleet`} />
          <KPICard icon={<Star size={16} />}        label="Avg Rider Rating"     value={`${k.avgRiderRating} ★`}         colour="#F59E0B" trend="up"   trendVal="+0.2"   sub="across all riders" />
          <KPICard icon={<RefreshCw size={16} />}   label="Return Recovery Rate" value={`${k.returnRecoveryRate}%`}      colour="#10B981" sub={`${k.totalReturns} returns handled`} />
        </div>
      </Section>

      {/* Charts */}
      <Section title="30-Day Performance Trend">
        {/* Chart tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {([
            { id: 'orders', label: 'Deliveries' },
            { id: 'revenue', label: 'Revenue (₹K)' },
            { id: 'ontime', label: 'On-Time %' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 6,
                border: `1px solid ${activeChart === tab.id ? '#4F46E5' : '#1E293B'}`,
                cursor: 'pointer',
                background: activeChart === tab.id ? '#4F46E5' : '#0A0F1A',
                color:      activeChart === tab.id ? '#fff' : '#475569',
              } as React.CSSProperties}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, padding: '16px 8px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0F172A" />
              <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#334155', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94A3B8' }}
                itemStyle={{ color: '#818CF8' }}
              />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke="#4F46E5" strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Two-column: city performance + live orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 28 }}>
        {/* City Performance */}
        <Section title="City Performance" action="View All" onAction={() => navigate('/hubs')}>
          <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
            {DEMO_CITY_PERFORMANCE.map((c, i) => (
              <div key={c.city} style={{
                display: 'flex', alignItems: 'center', padding: '11px 14px',
                borderBottom: i < DEMO_CITY_PERFORMANCE.length - 1 ? '1px solid #0F172A' : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#475569', flexShrink: 0, marginRight: 10,
                }}>{c.city.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>{c.city}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{c.activeRiders} riders · {c.orders30d.toLocaleString()} orders</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>{c.onTimePct}%</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', fontSize: 9, marginTop: 1 }}>
                    {c.trend === 'up'
                      ? <><TrendingUp size={9} color="#34D399" /><span style={{ color: '#34D399' }}>Improving</span></>
                      : <><span style={{ color: '#475569' }}>Stable</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Live Orders sample */}
        <Section title="Live Orders (Today)" action="Full Tracking" onAction={() => navigate('/')}>
          <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px',
              padding: '8px 14px', borderBottom: '1px solid #0F172A',
              fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              <span>Order / Customer</span>
              <span>Driver</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Value</span>
            </div>
            {DEMO_LIVE_ORDERS.slice(0, 10).map(o => {
              const ss = STATUS_STYLE[o.status];
              return (
                <div key={o.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px',
                  padding: '9px 14px', borderBottom: '1px solid #050A14', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#CBD5E1' }}>{o.id}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{o.customer.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{o.driver.split(' ')[0]}</div>
                    <div style={{ fontSize: 10, color: '#334155' }}>{o.vehicle}</div>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                      background: ss.bg, color: ss.color, whiteSpace: 'nowrap',
                    }}>
                      {ss.icon}{o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8' }}>
                    ₹{o.value.toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div style={{ padding: '10px 14px', textAlign: 'center', borderTop: '1px solid #0F172A' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  fontSize: 11, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                View all {DEMO_LIVE_ORDERS.length} live orders <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </Section>
      </div>

      {/* Fleet summary + top drivers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Fleet */}
        <Section title="Fleet Status" action="Fleet Management" onAction={() => navigate('/riders')}>
          <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'On Route',     count: vehicleStats.onRoute,     colour: '#34D399', pct: Math.round(vehicleStats.onRoute / k.totalVehicles * 100) },
                { label: 'Available',    count: vehicleStats.available,    colour: '#60A5FA', pct: Math.round(vehicleStats.available / k.totalVehicles * 100) },
                { label: 'Maintenance',  count: vehicleStats.maintenance,  colour: '#F87171', pct: Math.round(vehicleStats.maintenance / k.totalVehicles * 100) },
                { label: 'Charging',     count: vehicleStats.charging,     colour: '#FBBF24', pct: Math.round(vehicleStats.charging / k.totalVehicles * 100) },
              ].map(s => (
                <div key={s.label} style={{ background: '#080E1C', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.colour }}>{s.count}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{s.label}</div>
                  <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: '#1E293B' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 2, background: s.colour }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #0F172A', paddingTop: 12 }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fleet Utilisation — 30-Day Trend</p>
              <ResponsiveContainer width="100%" height={70}>
                <BarChart data={chartData.slice(-14)} margin={{ left: -30, right: 0, top: 0, bottom: 0 }}>
                  <Bar dataKey="util" fill="#4F46E5" radius={[2,2,0,0]} />
                  <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 8 }} tickLine={false} interval={3} />
                  <Tooltip
                    contentStyle={{ background: '#0A0F1A', border: '1px solid #1E293B', fontSize: 10 }}
                    formatter={(v: number) => [`${v}%`, 'Utilisation']}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {/* Top Drivers */}
        <Section title="Top Performers This Month" action="Rider Intelligence" onAction={() => navigate('/rider-intelligence')}>
          <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
            {DEMO_DRIVERS.slice(0, 7).map((d, i) => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', padding: '10px 14px',
                borderBottom: i < 6 ? '1px solid #0A0F1A' : 'none',
                background: i === 0 ? '#0f0a1f' : 'transparent',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: i === 0 ? '#4F46E5' : '#1E293B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: i === 0 ? '#fff' : '#475569',
                  flexShrink: 0, marginRight: 10,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{d.hub} · {d.deliveriesMonth} deliveries</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>{d.rating} ★</div>
                  <div style={{ fontSize: 9, color: '#334155' }}>{d.onTimeRate}% OT</div>
                </div>
                <div style={{
                  marginLeft: 10, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                  background: d.badge === 'Elite Performer' ? '#1e1b4b' : '#0a1628',
                  color:      d.badge === 'Elite Performer' ? '#818CF8' : '#60A5FA',
                }}>
                  {d.badge}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Hub summary */}
      <Section title="Hub Network Overview" action="Hub Dashboard" onAction={() => navigate('/hubs')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {DEMO_HUBS.map(h => (
            <div key={h.id} style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{h.city}</div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#052e16', color: '#34D399' }}>
                  {h.utilizationPct}%
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 6 }}>
                <span>Riders</span>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>{h.activeRiders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 6 }}>
                <span>Pending</span>
                <span style={{ color: '#FBBF24', fontWeight: 600 }}>{h.pendingOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B' }}>
                <span>Completed</span>
                <span style={{ color: '#34D399', fontWeight: 600 }}>{h.completedToday}</span>
              </div>
              <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: '#1E293B' }}>
                <div style={{ width: `${h.utilizationPct}%`, height: '100%', borderRadius: 2, background: h.utilizationPct > 85 ? '#34D399' : '#4F46E5' }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick links to other dashboards */}
      <Section title="Explore More Dashboards">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { path: '/ai-command',        icon: <Cpu size={16} />,        label: 'AI Command Center',    desc: 'Risk, insights & forecasts', colour: '#818CF8' },
            { path: '/returns',           icon: <RefreshCw size={16} />,  label: 'Returns — Phase 10E',  desc: 'Reverse logistics tracking', colour: '#FBBF24' },
            { path: '/rider-intelligence',icon: <Users size={16} />,      label: 'Rider Intel — 10F',    desc: 'Earnings, ratings, badges',  colour: '#A78BFA' },
            { path: '/sla',               icon: <ShieldCheck size={16} />,label: 'SLA Dashboard',        desc: 'Delivery SLA performance',   colour: '#34D399' },
            { path: '/performance',       icon: <BarChart3 size={16} />,  label: 'Performance',          desc: 'Fleet & driver analytics',   colour: '#60A5FA' },
            { path: '/incentives',        icon: <DollarSign size={16} />, label: 'Incentive Engine',     desc: 'Earnings & bonus rules',     colour: '#F59E0B' },
            { path: '/hubs',              icon: <MapPin size={16} />,     label: 'Hub Dashboard',        desc: 'Hub throughput & status',    colour: '#10B981' },
            { path: '/routes',            icon: <TrendingUp size={16} />, label: 'Route Performance',    desc: 'Efficiency & optimisation',  colour: '#F87171' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 10,
                padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#4F46E5')}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#1E293B')}
            >
              <div style={{ color: item.colour, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Bottom padding for LiveEventFeed */}
      <div style={{ height: 60 }} />
    </div>
  );
}
