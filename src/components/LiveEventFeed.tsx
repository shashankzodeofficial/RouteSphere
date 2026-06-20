import React, { useEffect, useRef, useState } from 'react';
import { useLiveDataStore, restartLiveEngine, type EventType } from '../store/liveDataStore';

const EVENT_ICONS: Record<EventType, string> = {
  delivery_completed:  '✅',
  delivery_failed:     '❌',
  pickup_started:      '🚚',
  return_picked_up:    '↩',
  return_hub_received: '🏭',
  return_reconciled:   '💰',
  incentive_triggered: '🎯',
  penalty_applied:     '⚠',
  rating_received:     '⭐',
  rider_status_change: '👤',
  sos_alert:           '🆘',
  shift_started:       '▶',
  shift_ended:         '⏹',
};

const EVENT_COLORS: Record<string, string> = {
  info:     '#3B82F6',
  warning:  '#F59E0B',
  critical: '#EF4444',
};

const EVENT_LABELS: Record<EventType, string> = {
  delivery_completed:  'Delivery Completed',
  delivery_failed:     'Delivery Failed',
  pickup_started:      'Pickup Started',
  return_picked_up:    'Return Picked Up',
  return_hub_received: 'At Hub',
  return_reconciled:   'Reconciled',
  incentive_triggered: 'Incentive',
  penalty_applied:     'Penalty',
  rating_received:     'Rating',
  rider_status_change: 'Status Change',
  sos_alert:           'SOS ALERT',
  shift_started:       'Shift Started',
  shift_ended:         'Shift Ended',
};

const INTERVAL_OPTIONS = [
  { label: '1s',  ms: 1000 },
  { label: '3s',  ms: 3000 },
  { label: '5s',  ms: 5000 },
  { label: '10s', ms: 10000 },
  { label: 'Pause', ms: 0 },
];

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

export default function LiveEventFeed() {
  const { events, sync, kpis } = useLiveDataStore();
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [intervalMs, setIntervalMs] = useState(sync.pollIntervalMs);
  const feedRef = useRef<HTMLDivElement>(null);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
  const criticalCount = events.filter(e => e.severity === 'critical').length;

  const handleIntervalChange = (ms: number) => {
    setIntervalMs(ms);
    if (ms === 0) {
      // pause
      import('../store/liveDataStore').then(m => m.stopLiveEngine());
    } else {
      restartLiveEngine(ms);
    }
  };

  // Auto-scroll to top (newest event)
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [events.length]);

  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 0, width: collapsed ? 220 : 380,
      background: '#0A0F1A', borderTop: '1px solid #1E293B', borderLeft: '1px solid #1E293B',
      zIndex: 1000, fontFamily: 'inherit', transition: 'width 0.2s',
    }}>
      {/* Header bar */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid #1E293B', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: sync.isConnected ? '#10B981' : '#EF4444',
            boxShadow: sync.isConnected ? '0 0 6px #10B981' : undefined, animation: sync.isConnected ? 'pulse 1.5s infinite' : undefined,
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0', letterSpacing: 0.5 }}>LIVE FEED</span>
          <span style={{ fontSize: 10, color: '#475569' }}>{filtered.length} events</span>
          {criticalCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#EF4444', padding: '1px 6px', borderRadius: 4 }}>
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#475569' }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <>
          {/* Sync status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid #1E293B', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: '#475569' }}>Mode:</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase' }}>{sync.syncMode}</span>
            <span style={{ fontSize: 10, color: '#334155' }}>·</span>
            <span style={{ fontSize: 10, color: '#475569' }}>Last sync:</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{sync.lastSyncAt ? fmtTime(sync.lastSyncAt) : '—'}</span>
            <span style={{ fontSize: 10, color: '#334155' }}>·</span>
            <span style={{ fontSize: 10, color: '#475569' }}>Uptime:</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{Math.floor(sync.uptimeSeconds / 60)}m {sync.uptimeSeconds % 60}s</span>
          </div>

          {/* Speed control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderBottom: '1px solid #1E293B' }}>
            <span style={{ fontSize: 10, color: '#475569', marginRight: 4 }}>Refresh:</span>
            {INTERVAL_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleIntervalChange(opt.ms)}
                style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: (intervalMs === opt.ms && opt.ms !== 0) || (opt.ms === 0 && intervalMs === 0) ? '#3B82F6' : '#1E293B',
                  color: (intervalMs === opt.ms) || (opt.ms === 0 && intervalMs === 0) ? '#fff' : '#64748B',
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Mini KPI strip */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1E293B' }}>
            {[
              { label: 'Delivered', value: kpis.deliveriesToday, color: '#10B981' },
              { label: 'Returns', value: kpis.returnsPickedUpToday, color: '#F59E0B' },
              { label: 'Incentives', value: `₹${(kpis.incentivesTotalToday/1000).toFixed(1)}K`, color: '#6366F1' },
            ].map((k, i) => (
              <div key={i} style={{ flex: 1, padding: '6px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid #1E293B' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 4, padding: '6px 14px', borderBottom: '1px solid #1E293B', overflowX: 'auto' }}>
            {(['all','delivery_completed','delivery_failed','return_picked_up','incentive_triggered','sos_alert'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: filter === f ? '#F5A623' : '#1E293B',
                  color: filter === f ? '#000' : '#64748B',
                  fontWeight: 600,
                }}
              >
                {f === 'all' ? 'All' : EVENT_LABELS[f as EventType]}
              </button>
            ))}
          </div>

          {/* Events list */}
          <div ref={feedRef} style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filtered.slice(0, 50).map(evt => (
              <div
                key={evt.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 14px',
                  borderBottom: '1px solid #0D1624',
                  borderLeft: `3px solid ${EVENT_COLORS[evt.severity]}`,
                  background: evt.severity === 'critical' ? '#1A0A0A' : 'transparent',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <span style={{ fontSize: 14, width: 18, flexShrink: 0 }}>{EVENT_ICONS[evt.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: EVENT_COLORS[evt.severity] }}>
                      {EVENT_LABELS[evt.type]}
                    </span>
                    <span style={{ fontSize: 9, color: '#334155' }}>{fmtTime(evt.timestamp)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {evt.rider} · {evt.hub}
                    {evt.payload.tracking && ` · ${evt.payload.tracking}`}
                    {evt.payload.amount && ` · ₹${evt.payload.amount}`}
                    {evt.payload.stars && ` · ${evt.payload.stars}★`}
                    {evt.payload.decision && ` · ${evt.payload.decision}`}
                    {evt.payload.rule && ` · ${evt.payload.rule}`}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: '#334155' }}>No events yet</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
