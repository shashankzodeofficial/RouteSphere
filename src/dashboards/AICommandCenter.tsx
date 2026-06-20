import React, { useMemo, useState } from 'react';
import { Brain, AlertTriangle, Lightbulb, Zap, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, RefreshCw, ShieldAlert, BarChart3, Settings2, Cpu } from 'lucide-react';
import { useLiveDataStore } from '../store/liveDataStore';
import { computeAIState } from '../data/aiCommandCenterData';
import type { RiskAlert, OperationalInsight, OptimizationSuggestion, Forecast, RiskLevel, Priority } from '../data/aiCommandCenterData';

// ─── Colour maps ──────────────────────────────────────────────────────────────

const RISK_COLOUR: Record<RiskLevel, { bg: string; text: string; border: string; badge: string }> = {
  low:      { bg: '#0F2A1A', text: '#34D399', border: '#064E3B', badge: '#064E3B' },
  medium:   { bg: '#2A1F06', text: '#FBBF24', border: '#78350F', badge: '#78350F' },
  high:     { bg: '#2A0F0F', text: '#F87171', border: '#7F1D1D', badge: '#7F1D1D' },
  critical: { bg: '#1A0A0A', text: '#EF4444', border: '#991B1B', badge: '#991B1B' },
};

const PRIORITY_COLOUR: Record<Priority, { dot: string; label: string }> = {
  low:      { dot: '#34D399', label: 'Low' },
  medium:   { dot: '#FBBF24', label: 'Medium' },
  high:     { dot: '#F87171', label: 'High' },
  critical: { dot: '#EF4444', label: 'Critical' },
};

const SEVERITY_COLOUR: Record<string, { dot: string }> = {
  low:    { dot: '#34D399' },
  medium: { dot: '#FBBF24' },
  high:   { dot: '#F87171' },
};

const OVERALL_BANNER: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low:      { bg: 'linear-gradient(135deg,#052e16,#064e3b)', text: '#34D399', label: 'LOW RISK — Operations Normal' },
  medium:   { bg: 'linear-gradient(135deg,#1c1100,#78350f)', text: '#FBBF24', label: 'MEDIUM RISK — Monitor Closely' },
  high:     { bg: 'linear-gradient(135deg,#1a0a0a,#7f1d1d)', text: '#F87171', label: 'HIGH RISK — Action Required' },
  critical: { bg: 'linear-gradient(135deg,#0d0000,#991b1b)', text: '#EF4444', label: 'CRITICAL — Immediate Response Needed' },
};

// ─── Small components ─────────────────────────────────────────────────────────

function Badge({ level }: { level: RiskLevel }) {
  const c = RISK_COLOUR[level];
  return (
    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: '2px 8px', borderRadius: 4, background: c.badge, color: c.text, textTransform: 'uppercase' }}>
      {level}
    </span>
  );
}

function PriorityDot({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLOUR[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: c.dot, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {c.label.toUpperCase()} PRIORITY
    </span>
  );
}

function Confidence({ value }: { value: number }) {
  const colour = value >= 80 ? '#34D399' : value >= 65 ? '#FBBF24' : '#94A3B8';
  return (
    <span style={{ fontSize: 9, color: colour, fontWeight: 600 }}>
      {value}% confidence
    </span>
  );
}

function TrendIcon({ trend, pct }: { trend: 'up' | 'down' | 'stable'; pct: number }) {
  if (trend === 'up')   return <span style={{ color: '#F87171', fontSize: 12 }}><TrendingUp size={12} style={{ display: 'inline', verticalAlign: -2 }} /> +{pct}%</span>;
  if (trend === 'down') return <span style={{ color: '#34D399', fontSize: 12 }}><TrendingDown size={12} style={{ display: 'inline', verticalAlign: -2 }} /> {pct}%</span>;
  return <span style={{ color: '#94A3B8', fontSize: 12 }}><Minus size={12} style={{ display: 'inline', verticalAlign: -2 }} /> Stable</span>;
}

function SectionHeader({ icon, title, count, colour }: { icon: React.ReactNode; title: string; count: number; colour: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: colour + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colour }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#E2E8F0', letterSpacing: 0.3 }}>{title}</h3>
        <span style={{ fontSize: 10, color: '#475569' }}>{count} item{count !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ─── Card components ──────────────────────────────────────────────────────────

function RiskCard({ risk }: { risk: RiskAlert }) {
  const [expanded, setExpanded] = useState(false);
  const c = RISK_COLOUR[risk.level];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge level={risk.level} />
            <span style={{ fontSize: 9, color: '#475569' }}>{new Date(risk.timestamp).toLocaleTimeString()}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.text }}>{risk.title}</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{risk.affectedArea}</p>
        </div>
        <span style={{ color: '#475569', marginLeft: 8, paddingTop: 2 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Reason: </span>{risk.reason}
          </p>
          <div style={{ background: '#0F172A', borderRadius: 6, padding: '8px 10px', marginTop: 6 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 3 }}>SUGGESTED ACTION</p>
            <p style={{ margin: 0, fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>{risk.suggestedAction}</p>
          </div>
          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <Confidence value={risk.confidence} />
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: OperationalInsight }) {
  const [expanded, setExpanded] = useState(false);
  const dot = SEVERITY_COLOUR[insight.severity].dot;
  return (
    <div style={{ background: '#0A1628', border: '1px solid #1E293B', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{insight.type.replace(/_/g, ' ')}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>{insight.title}</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{insight.summary}</p>
        </div>
        <span style={{ color: '#475569', marginLeft: 8, paddingTop: 2 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1E293B' }}>
          <div style={{ marginBottom: 6 }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#475569', fontWeight: 600 }}>DATA EVIDENCE</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{insight.evidence}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#475569', fontWeight: 600 }}>OPERATIONAL IMPACT</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{insight.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: OptimizationSuggestion }) {
  const [expanded, setExpanded] = useState(false);
  const CATEGORY_LABEL: Record<string, string> = {
    reallocation: 'Rider Reallocation',
    incentive:    'Incentive Adjustment',
    route:        'Route Optimization',
    pickup:       'Pickup Scheduling',
    scheduling:   'Scheduling',
  };
  return (
    <div style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderLeft: `3px solid ${PRIORITY_COLOUR[suggestion.priority].dot}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <PriorityDot priority={suggestion.priority} />
            <span style={{ fontSize: 9, color: '#475569', background: '#1E293B', padding: '1px 6px', borderRadius: 4 }}>
              {CATEGORY_LABEL[suggestion.category]}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>{suggestion.recommendation}</p>
        </div>
        <span style={{ color: '#475569', marginLeft: 8, paddingTop: 2 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1E293B' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: '#475569', fontWeight: 600 }}>EXPECTED IMPACT</p>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{suggestion.expectedImpact}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#334155' }}>Module: {suggestion.affectedModule}</p>
        </div>
      )}
    </div>
  );
}

function ForecastCard({ forecast }: { forecast: Forecast }) {
  const METRIC_ICON: Record<string, React.ReactNode> = {
    delivery_load:    <BarChart3 size={14} />,
    rider_demand:     <Settings2 size={14} />,
    return_rate:      <RefreshCw size={14} />,
    peak_congestion:  <AlertTriangle size={14} />,
  };
  return (
    <div style={{ background: '#080E1C', border: '1px solid #1E293B', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#6366F1' }}>{METRIC_ICON[forecast.metric]}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC' }}>{forecast.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendIcon trend={forecast.trend} pct={forecast.trendPct} />
          <Confidence value={forecast.confidence} />
        </div>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>{forecast.prediction}</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#475569' }}>📍 {forecast.regionImpact}</span>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#334155' }}>⏱ {forecast.timeframe}</span>
      </div>
    </div>
  );
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

type TabId = 'risk' | 'insights' | 'suggestions' | 'forecast';
const TABS: { id: TabId; label: string; icon: React.ReactNode; colour: string }[] = [
  { id: 'risk',        label: 'Risk Intelligence',   icon: <ShieldAlert size={14} />, colour: '#EF4444' },
  { id: 'insights',    label: 'Operational Insights', icon: <Lightbulb size={14} />,  colour: '#F59E0B' },
  { id: 'suggestions', label: 'Optimization',         icon: <Zap size={14} />,        colour: '#6366F1' },
  { id: 'forecast',    label: 'Forecast',             icon: <TrendingUp size={14} />, colour: '#10B981' },
];

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function AICommandCenter() {
  const { kpis, events, tickCount } = useLiveDataStore();
  const [activeTab, setActiveTab] = useState<TabId>('risk');

  const ai = useMemo(
    () => computeAIState(kpis, events, tickCount),
    // Re-compute every 5 ticks to avoid per-event thrash
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Math.floor(tickCount / 5), kpis.openSosAlerts, kpis.deliveriesFailed, kpis.activeRiders],
  );

  const banner = OVERALL_BANNER[ai.overallRiskLevel];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={20} color="#818CF8" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#E2E8F0' }}>AI Command Center</h1>
            <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>
              Operational intelligence derived from live delivery, returns & rider data
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#334155' }}>Last analysed</div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{new Date(ai.generatedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Overall risk banner */}
      <div style={{
        background: banner.bg,
        border: `1px solid ${RISK_COLOUR[ai.overallRiskLevel].border}`,
        borderRadius: 10,
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color={banner.text} />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: banner.text, letterSpacing: 0.5 }}>{banner.label}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
              {ai.risks.length} risk{ai.risks.length !== 1 ? 's' : ''} · {ai.insights.length} insight{ai.insights.length !== 1 ? 's' : ''} · {ai.suggestions.length} suggestion{ai.suggestions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['critical','high','medium','low'] as RiskLevel[]).map(lvl => {
            const count = ai.risks.filter(r => r.level === lvl).length;
            if (!count) return null;
            return (
              <div key={lvl} style={{ textAlign: 'center', background: RISK_COLOUR[lvl].bg, border: `1px solid ${RISK_COLOUR[lvl].border}`, borderRadius: 6, padding: '4px 10px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: RISK_COLOUR[lvl].text }}>{count}</div>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{lvl}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Risk Alerts',      value: ai.risks.length,       colour: '#EF4444', icon: <ShieldAlert size={14} /> },
          { label: 'Insights',         value: ai.insights.length,    colour: '#F59E0B', icon: <Lightbulb size={14} /> },
          { label: 'Optimizations',    value: ai.suggestions.length, colour: '#6366F1', icon: <Zap size={14} /> },
          { label: 'Forecast Signals', value: ai.forecasts.length,   colour: '#10B981', icon: <TrendingUp size={14} /> },
        ].map(k => (
          <div key={k.label} style={{ background: '#0A0F1A', border: '1px solid #1E293B', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: k.colour }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.colour }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* AI Notice */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, padding: '8px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Brain size={13} color="#6366F1" />
        <span style={{ fontSize: 10, color: '#475569' }}>
          AI outputs are advisory only. The AI Command Center cannot modify orders, payouts, or system state. All recommendations require human approval.
        </span>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#0A0F1A', padding: 4, borderRadius: 8, border: '1px solid #1E293B' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: activeTab === tab.id ? tab.colour + '22' : 'transparent',
              color:      activeTab === tab.id ? tab.colour : '#475569',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ color: activeTab === tab.id ? tab.colour : '#334155' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'risk' && (
          <>
            <SectionHeader icon={<ShieldAlert size={16} />} title="Risk Intelligence" count={ai.risks.length} colour="#EF4444" />
            {ai.risks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: 12 }}>
                ✅ No active risk signals detected. System operating normally.
              </div>
            ) : (
              ai.risks
                .sort((a, b) => ['critical','high','medium','low'].indexOf(a.level) - ['critical','high','medium','low'].indexOf(b.level))
                .map(r => <RiskCard key={r.id} risk={r} />)
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <SectionHeader icon={<Lightbulb size={16} />} title="Operational Insights" count={ai.insights.length} colour="#F59E0B" />
            {ai.insights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: 12 }}>
                No operational anomalies detected in current data window.
              </div>
            ) : (
              ai.insights
                .sort((a, b) => ['high','medium','low'].indexOf(a.severity) - ['high','medium','low'].indexOf(b.severity))
                .map(i => <InsightCard key={i.id} insight={i} />)
            )}
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            <SectionHeader icon={<Zap size={16} />} title="Optimization Suggestions" count={ai.suggestions.length} colour="#6366F1" />
            {ai.suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: 12 }}>
                No optimization opportunities identified at current operating levels.
              </div>
            ) : (
              ai.suggestions
                .sort((a, b) => ['critical','high','medium','low'].indexOf(a.priority) - ['critical','high','medium','low'].indexOf(b.priority))
                .map(s => <SuggestionCard key={s.id} suggestion={s} />)
            )}
          </>
        )}

        {activeTab === 'forecast' && (
          <>
            <SectionHeader icon={<TrendingUp size={16} />} title="Predictive Forecast" count={ai.forecasts.length} colour="#10B981" />
            {ai.forecasts.map(f => <ForecastCard key={f.id} forecast={f} />)}
          </>
        )}
      </div>

      {/* Bottom padding for LiveEventFeed */}
      <div style={{ height: 60 }} />
    </div>
  );
}
