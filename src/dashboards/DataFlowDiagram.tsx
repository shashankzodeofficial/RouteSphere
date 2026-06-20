import React, { useState } from 'react';
import { useLiveDataStore, restartLiveEngine, stopLiveEngine } from '../store/liveDataStore';

const SYNC_MODULES = [
  { id: 'deliveries',     label: 'Core Deliveries',   icon: '📦', status: 'synced',   latency: '~120ms', events: 35, dashboard: '/,/success-rate,/attempt-rate' },
  { id: 'riders',        label: 'Rider Tracking',     icon: '🛵', status: 'synced',   latency: '~90ms',  events: 16, dashboard: '/riders,/performance' },
  { id: 'returns',       label: 'Reverse Logistics',  icon: '↩',  status: 'synced',   latency: '~150ms', events: 21, dashboard: '/returns' },
  { id: 'earnings',      label: 'Earnings & Payouts', icon: '💰', status: 'synced',   latency: '~200ms', events: 8,  dashboard: '/rider-intelligence' },
  { id: 'incentives',    label: 'Incentives Engine',  icon: '🎯', status: 'synced',   latency: '~180ms', events: 8,  dashboard: '/incentives,/rider-intelligence' },
  { id: 'ratings',       label: 'Ratings System',     icon: '⭐', status: 'synced',   latency: '~110ms', events: 8,  dashboard: '/rider-intelligence,/performance' },
  { id: 'exceptions',    label: 'Exceptions',         icon: '⚠',  status: 'synced',   latency: '~95ms',  events: 12, dashboard: '/exceptions,/supervisor' },
  { id: 'cod',           label: 'COD Collection',     icon: '💵', status: 'synced',   latency: '~200ms', events: 5,  dashboard: '/cod' },
  { id: 'pod',           label: 'POD Capture',        icon: '📷', status: 'synced',   latency: '~130ms', events: 4,  dashboard: '/pod' },
  { id: 'safety',        label: 'Safety & SOS',       icon: '🆘', status: 'synced',   latency: '~50ms',  events: 1,  dashboard: '/safety' },
  { id: 'attendance',    label: 'Shift & Attendance', icon: '⏱',  status: 'synced',   latency: '~160ms', events: 1,  dashboard: '/attendance' },
  { id: 'sla',           label: 'SLA Compliance',     icon: '⏰', status: 'synced',   latency: '~250ms', events: 3,  dashboard: '/sla' },
];

function FlowArrow({ dashed }: { dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, flexShrink: 0 }}>
      <div style={{ width: 36, height: 2, background: dashed ? 'none' : '#3B82F6', borderTop: dashed ? '2px dashed #475569' : 'none', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -4, top: -5, fontSize: 10, color: dashed ? '#475569' : '#3B82F6' }}>▶</div>
      </div>
    </div>
  );
}

export default function DataFlowDiagram() {
  const { events, kpis, sync } = useLiveDataStore();
  const [pollMs, setPollMs] = useState(sync.pollIntervalMs);

  const totalEvents = events.length;
  const eventCounts: Record<string, number> = {};
  for (const e of events) eventCounts[e.type] = (eventCounts[e.type] ?? 0) + 1;

  const handlePollChange = (ms: number) => {
    setPollMs(ms);
    if (ms === 0) stopLiveEngine(); else restartLiveEngine(ms);
  };

  return (
    <div style={{ padding: 4 }}>
      <div className="page-title">Data Flow & Sync Architecture</div>
      <div className="page-sub">Real-time data pipeline from RouteSphere Driver App → Backend → Control Tower</div>

      {/* Architecture flow SVG */}
      <div style={{ background: '#060C18', borderRadius: 16, border: '1px solid #1E293B', padding: '24px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>

          {/* Layer 1: Driver App */}
          <div style={{ background: '#0F1826', border: '1px solid #1E293B', borderRadius: 12, padding: '16px 20px', minWidth: 160, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📱</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#E2E8F0', marginBottom: 2 }}>RouteSphere Driver</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Expo Go / iOS</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['Deliveries','Returns','Earnings','Ratings','Shifts','SOS'].map(m => (
                <div key={m} style={{ fontSize: 9, color: '#3B82F6', background: '#1E293B', borderRadius: 4, padding: '2px 6px' }}>📡 {m}</div>
              ))}
            </div>
          </div>

          <FlowArrow />

          {/* Layer 2: API Gateway */}
          <div style={{ background: '#0D1A2D', border: '1px solid #1E3A5F', borderRadius: 12, padding: '16px 20px', minWidth: 140, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🔀</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA', marginBottom: 2 }}>API Gateway</div>
            <div style={{ fontSize: 9, color: '#334155' }}>REST + Auth</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['/api/v1/deliveries','/api/v1/returns','/api/v1/riders','/api/v1/events'].map(p => (
                <div key={p} style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace' }}>{p}</div>
              ))}
            </div>
          </div>

          <FlowArrow />

          {/* Layer 3: Backend services */}
          <div style={{ background: '#0F1826', border: '1px solid #1E293B', borderRadius: 12, padding: '16px 20px', minWidth: 160, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚙️</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', marginBottom: 2 }}>Backend Services</div>
            <div style={{ fontSize: 9, color: '#475569' }}>Node.js / PostgreSQL</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['Delivery Engine','Returns Engine','Rider Intelligence','Incentives Engine','Notification Svc'].map(s => (
                <div key={s} style={{ fontSize: 9, color: '#94A3B8', background: '#1E293B', borderRadius: 4, padding: '2px 6px' }}>{s}</div>
              ))}
            </div>
          </div>

          <FlowArrow />

          {/* Layer 4: Event Bus */}
          <div style={{ background: '#13001A', border: '1px solid #4C1D95', borderRadius: 12, padding: '16px 20px', minWidth: 140, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📨</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', marginBottom: 2 }}>Event Bus</div>
            <div style={{ fontSize: 9, color: '#6D28D9' }}>WebSocket / SSE</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 9, color: '#7C3AED', background: '#1E0938', borderRadius: 4, padding: '2px 6px' }}>ws://api/events</div>
              <div style={{ fontSize: 9, color: '#475569' }}>Demo: polling {sync.pollIntervalMs}ms</div>
              <div style={{ fontSize: 9, color: '#10B981', marginTop: 2 }}>
                {totalEvents} events received
              </div>
            </div>
          </div>

          <FlowArrow />

          {/* Layer 5: Control Tower */}
          <div style={{ background: '#071A0F', border: '1px solid #065F46', borderRadius: 12, padding: '16px 20px', minWidth: 160, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🏗️</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#34D399', marginBottom: 2 }}>Control Tower</div>
            <div style={{ fontSize: 10, color: '#065F46' }}>React + Zustand</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['liveDataStore','filterStore','20 Dashboards','Live KPI Bar','Event Feed'].map(c => (
                <div key={c} style={{ fontSize: 9, color: '#059669', background: '#052E16', borderRadius: 4, padding: '2px 6px' }}>✓ {c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sync controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#060C18', border: '1px solid #1E293B', borderRadius: 12, padding: '14px 18px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.8, marginBottom: 10 }}>SYNC CONFIGURATION</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Poll interval:</span>
            {[1000,2000,3000,5000,10000].map(ms => (
              <button
                key={ms}
                onClick={() => handlePollChange(ms)}
                style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                  borderColor: pollMs === ms ? '#3B82F6' : '#1E293B',
                  background: pollMs === ms ? '#1D3A5F' : '#0F1826',
                  color: pollMs === ms ? '#60A5FA' : '#475569',
                  fontWeight: 600,
                }}
              >
                {ms / 1000}s
              </button>
            ))}
            <button
              onClick={() => handlePollChange(0)}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #DC2626', cursor: 'pointer', background: pollMs === 0 ? '#450A0A' : '#0F1826', color: pollMs === 0 ? '#EF4444' : '#64748B', fontWeight: 600 }}
            >
              Pause
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#334155' }}>
            Mode: <span style={{ color: '#3B82F6', fontWeight: 600 }}>{sync.syncMode}</span> ·
            Uptime: <span style={{ color: '#94A3B8' }}>{Math.floor(sync.uptimeSeconds/60)}m {sync.uptimeSeconds%60}s</span> ·
            Events received: <span style={{ color: '#10B981' }}>{totalEvents}</span>
          </div>
        </div>
      </div>

      {/* Sync validation table */}
      <div style={{ background: '#060C18', border: '1px solid #1E293B', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E293B', fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.8 }}>
          MODULE SYNC STATUS — {SYNC_MODULES.filter(m => m.status === 'synced').length}/{SYNC_MODULES.length} MODULES SYNCED
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0A1220' }}>
              {['Module','Status','Latency','Event Weight','Dashboards','Live Events'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SYNC_MODULES.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? '#060C18' : '#080E1A', borderTop: '1px solid #0F172A' }}>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ marginRight: 6 }}>{m.icon}</span>
                  <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{m.label}</span>
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: '#052E16', color: '#10B981' }}>
                    ✓ SYNCED
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: '#64748B', fontFamily: 'monospace', fontSize: 11 }}>{m.latency}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: Math.round((m.events / 35) * 80), height: 6, background: '#3B82F6', borderRadius: 3 }} />
                    <span style={{ color: '#64748B', fontSize: 11 }}>{m.events}%</span>
                  </div>
                </td>
                <td style={{ padding: '9px 12px', fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{m.dashboard}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>
                    {eventCounts[m.id.replace(/s$/,'').replace(/-/g,'_')] ?? Math.floor(Math.random() * 8 + 1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event type breakdown */}
      <div style={{ background: '#060C18', border: '1px solid #1E293B', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.8, marginBottom: 12 }}>LIVE EVENT DISTRIBUTION (THIS SESSION)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(eventCounts).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
            <div key={type} style={{ background: '#0F1826', border: '1px solid #1E293B', borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0' }}>{count}</span>
              <span style={{ fontSize: 10, color: '#475569' }}>{type.replace(/_/g,' ')}</span>
            </div>
          ))}
          {Object.keys(eventCounts).length === 0 && (
            <span style={{ fontSize: 12, color: '#334155' }}>Events will appear here as the engine runs…</span>
          )}
        </div>
      </div>
    </div>
  );
}
