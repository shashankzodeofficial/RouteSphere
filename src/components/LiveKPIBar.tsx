import React from 'react';
import { useLiveDataStore } from '../store/liveDataStore';

interface Props { show: boolean; }

export default function LiveKPIBar({ show }: Props) {
  const { kpis, sync } = useLiveDataStore();

  if (!show) return null;

  const items = [
    { label: 'Delivered', value: kpis.deliveriesToday.toLocaleString(), color: '#10B981', dot: true },
    { label: 'In Transit', value: kpis.deliveriesInTransit.toLocaleString(), color: '#3B82F6', dot: false },
    { label: 'Failed', value: kpis.deliveriesFailed.toLocaleString(), color: '#EF4444', dot: false },
    { label: 'Success %', value: `${kpis.successRateLive}%`, color: kpis.successRateLive >= 90 ? '#10B981' : '#F59E0B', dot: false },
    { label: 'Returns↩', value: kpis.returnsPickedUpToday.toLocaleString(), color: '#F59E0B', dot: false },
    { label: 'At Hub', value: kpis.returnsAtHub.toLocaleString(), color: '#6366F1', dot: false },
    { label: 'Reconciled', value: kpis.returnsReconciled.toLocaleString(), color: '#059669', dot: false },
    { label: 'Active Riders', value: kpis.activeRiders.toLocaleString(), color: '#0891B2', dot: false },
    { label: 'Incentives', value: `₹${(kpis.incentivesTotalToday/1000).toFixed(1)}K`, color: '#7C3AED', dot: false },
    { label: 'Avg Rating', value: `${kpis.avgRatingToday}★`, color: '#F5A623', dot: false },
    ...(kpis.openSosAlerts > 0 ? [{ label: '🆘 SOS', value: String(kpis.openSosAlerts), color: '#EF4444', dot: false }] : []),
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0, background: '#060C18',
      borderBottom: '1px solid #1E293B', overflowX: 'auto', flexShrink: 0,
    }}>
      {/* Sync indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRight: '1px solid #1E293B', flexShrink: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: sync.isConnected ? '#10B981' : '#EF4444',
          boxShadow: sync.isConnected ? '0 0 6px #10B981aa' : undefined,
        }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: sync.isConnected ? '#10B981' : '#EF4444', letterSpacing: 0.5 }}>
          {sync.syncMode.toUpperCase()}
        </span>
        {sync.lastSyncAt && (
          <span style={{ fontSize: 9, color: '#334155' }}>
            {new Date(sync.lastSyncAt).toLocaleTimeString('en-IN', { hour12: false })}
          </span>
        )}
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '5px 12px', borderRight: '1px solid #1E293B', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: item.color, lineHeight: 1 }}>
            {item.value}
          </span>
          <span style={{ fontSize: 9, color: '#334155', marginTop: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
