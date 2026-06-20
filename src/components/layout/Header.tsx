import React, { useState, useEffect } from 'react';
import { Bell, Settings } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';

const DASHBOARD_TITLES: Record<string, { title: string; badge: string }> = {
  '/': { title: 'Live Delivery Tracking', badge: 'Real-time' },
  '/riders': { title: 'Rider Tracking', badge: 'Live' },
  '/success-rate': { title: 'Success Rate Dashboard', badge: 'Analytics' },
  '/attempt-rate': { title: 'Attempt Rate Analysis', badge: 'Analytics' },
  '/exceptions': { title: 'Exception Dashboard', badge: 'Alerts' },
  '/cod': { title: 'COD Collection Dashboard', badge: 'Finance' },
  '/pod': { title: 'POD Dashboard', badge: 'Compliance' },
  '/hubs': { title: 'Hub Dashboard', badge: 'Operations' },
  '/sla': { title: 'SLA Dashboard', badge: 'Performance' },
  '/routes': { title: 'Route Performance', badge: 'Analytics' },
};

interface Props { pathname: string; }

export default function Header({ pathname }: Props) {
  const [time, setTime] = useState(new Date());
  const { region, hub } = useFilterStore();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const info = DASHBOARD_TITLES[pathname] ?? { title: 'Dashboard', badge: '' };

  return (
    <header className="header">
      <div className="header-left">
        <div className="live-dot" />
        <div className="header-title">{info.title}</div>
        {info.badge && <span className="header-badge">{info.badge}</span>}
        {region !== 'All Regions' && (
          <span className="header-badge" style={{ background: '#F5F3FF', color: '#7C3AED' }}>{region}</span>
        )}
        {hub !== 'All Hubs' && (
          <span className="header-badge" style={{ background: '#ECFDF5', color: '#059669' }}>{hub}</span>
        )}
      </div>
      <div className="header-right">
        <span className="header-time">{time.toLocaleTimeString('en-IN', { hour12: true })}</span>
        <Bell size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
        <Settings size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
        <div className="avatar">OP</div>
      </div>
    </header>
  );
}
