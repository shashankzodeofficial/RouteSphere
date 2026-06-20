import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, BarChart3, MapPin, Users, RefreshCw, TrendingUp,
  ShieldAlert, Eye, EyeOff, ArrowRight, CheckCircle2, Star,
  Package, Truck, Brain,
} from 'lucide-react';
import { useDemoStore } from '../store/demoStore';
import { DEMO_KPIS } from '../data/demoData';

const FEATURES = [
  { icon: <BarChart3 size={16} />,  label: 'Executive KPI Dashboard',        desc: '30-day performance trends, revenue & delivery analytics' },
  { icon: <MapPin size={16} />,     label: 'Live Delivery Tracking',          desc: 'Real-time order status across 23 cities, 8 hubs' },
  { icon: <RefreshCw size={16} />,  label: 'Reverse Logistics (Phase 10E)',   desc: 'Returns, pickup management, hub reconciliation' },
  { icon: <Users size={16} />,      label: 'Rider Intelligence (Phase 10F)',  desc: 'Performance scores, incentives, ratings & coaching' },
  { icon: <Brain size={16} />,      label: 'AI Command Center',               desc: 'Risk detection, insights, optimization & forecasts' },
  { icon: <TrendingUp size={16} />, label: 'Route & SLA Analytics',           desc: 'On-time delivery, exception management, COD tracking' },
];

const TESTIMONIALS = [
  { quote: 'Reduced failed deliveries by 23% in the first quarter.', name: 'VP Logistics, FreshMart Supermarkets' },
  { quote: 'The AI Command Center flagged a return spike before our ops team noticed.', name: 'Head of E-commerce, TechZone Electronics' },
  { quote: 'Best-in-class rider intelligence — our fleet utilization jumped to 91%.', name: 'Fleet Manager, QuickBite Cloud Kitchen' },
];

export default function DemoLogin() {
  const navigate    = useNavigate();
  const { enableDemo } = useDemoStore();
  const [email,    setEmail]    = useState('demo@routesphere.io');
  const [password, setPassword] = useState('demo2024');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== 'demo@routesphere.io' || password !== 'demo2024') {
      setError('Use demo@routesphere.io / demo2024 to enter the demo.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      enableDemo();
      navigate('/demo-overview');
    }, 900);
  };

  const k = DEMO_KPIS;

  return (
    <div style={{
      minHeight: '100vh', background: '#020617',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid #0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>RS</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>RouteSphere</span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1,
            color: '#818CF8', background: '#1e1b4b', border: '1px solid #4338CA',
            borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase',
          }}>Demo</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Features','Dashboards','Pricing'].map(l => (
            <span key={l} style={{ fontSize: 13, color: '#64748B', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </nav>

      {/* Hero + Login */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60,
        padding: '60px 40px 40px', maxWidth: 1140, margin: '0 auto', width: '100%',
      }}>
        {/* Left — Hero */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 20, padding: '4px 14px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 11, color: '#64748B' }}>Live Demo Environment — No sign-up required</span>
          </div>

          <h1 style={{
            fontSize: 44, fontWeight: 800, color: '#F1F5F9', lineHeight: 1.1,
            margin: '0 0 16px',
          }}>
            Enterprise Last-Mile<br />
            <span style={{ background: 'linear-gradient(90deg,#818CF8,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Delivery Control Tower
            </span>
          </h1>

          <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 540 }}>
            RouteSphere gives logistics teams complete visibility over deliveries,
            riders, returns, and revenue — powered by real-time data and AI-driven intelligence.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 36 }}>
            {[
              { label: 'Deliveries (30d)',   value: k.totalOrders.toLocaleString() },
              { label: 'On-Time Rate',       value: `${k.onTimeRate}%` },
              { label: 'Fleet Utilisation',  value: `${k.fleetUtilization}%` },
              { label: 'Revenue (30d)',       value: `₹${(k.totalRevenue/100000).toFixed(1)}L` },
              { label: 'Avg Rating',         value: `${k.avgRiderRating} ★` },
              { label: 'Cities Covered',     value: `${k.citiesCovered}` },
            ].map(s => (
              <div key={s.label} style={{
                background: '#0A0F1A', border: '1px solid #1E293B',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#818CF8' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 36 }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: '#1e1b4b', border: '1px solid #312e81',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818CF8', flexShrink: 0,
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 1 }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#0A0F1A', border: '1px solid #1E293B',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <div style={{ color: '#F59E0B', flexShrink: 0, paddingTop: 1 }}>
                  {[0,1,2,3,4].map(s => <Star key={s} size={9} fill="#F59E0B" />)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>"{t.quote}"</p>
                  <p style={{ margin: '3px 0 0', fontSize: 10, color: '#475569' }}>— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login card */}
        <div style={{ paddingTop: 20 }}>
          <div style={{
            background: '#0A0F1A', border: '1px solid #1E293B',
            borderRadius: 16, padding: '32px 28px',
            position: 'sticky', top: 24,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Cpu size={22} color="#fff" />
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>Enter Demo</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>No account needed — use the demo credentials below</p>
            </div>

            {/* Demo credentials hint */}
            <div style={{
              background: '#0f172a', border: '1px dashed #312e81',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#6366F1', letterSpacing: 0.5 }}>DEMO CREDENTIALS</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748B' }}>Email</span>
                <code style={{ color: '#818CF8' }}>demo@routesphere.io</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                <span style={{ color: '#64748B' }}>Password</span>
                <code style={{ color: '#818CF8' }}>demo2024</code>
              </div>
            </div>

            <form onSubmit={handleEnter} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', background: '#020617', border: '1px solid #1E293B',
                    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#E2E8F0',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748B', marginBottom: 6, fontWeight: 600 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%', background: '#020617', border: '1px solid #1E293B',
                      borderRadius: 8, padding: '10px 36px 10px 12px', fontSize: 13, color: '#E2E8F0',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#475569',
                    }}
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: 11, color: '#F87171', background: '#1A0A0A', border: '1px solid #7F1D1D', borderRadius: 6, padding: '8px 12px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#312e81' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                  border: 'none', borderRadius: 8, padding: '12px',
                  fontSize: 14, fontWeight: 700, color: '#fff', cursor: loading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid #818CF8', borderTopColor: '#fff',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }} />
                    Loading demo…
                  </>
                ) : (
                  <>View Live Demo <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* What you get */}
            <div style={{ marginTop: 20, borderTop: '1px solid #1E293B', paddingTop: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Included in this demo</p>
              {[
                '23 interactive dashboards',
                '30-day historical analytics',
                'AI Command Center (risk, insights, forecast)',
                'Live real-time event simulation',
                'Rider intelligence & incentives',
                'Returns & reverse logistics module',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <CheckCircle2 size={11} color="#10B981" />
                  <span style={{ fontSize: 11, color: '#64748B' }}>{item}</span>
                </div>
              ))}
            </div>

            <p style={{ margin: '16px 0 0', fontSize: 10, color: '#334155', textAlign: 'center', lineHeight: 1.5 }}>
              All data is synthetic. No account creation required.
              This demo is suitable for sharing with investors, recruiters, and customers.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
