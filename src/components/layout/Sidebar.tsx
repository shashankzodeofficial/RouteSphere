import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Map, Users, TrendingUp, RefreshCw, AlertTriangle,
  DollarSign, Camera, Warehouse, Clock, Route, Award, UserCheck, GraduationCap, Star,
  BookOpen, Banknote, ShieldAlert, CalendarCheck, RotateCcw, Brain, GitBranch,
} from 'lucide-react';

const NAV_OPERATIONS = [
  { to: '/', icon: Map, label: 'Live Delivery' },
  { to: '/riders', icon: Users, label: 'Rider Tracking' },
  { to: '/success-rate', icon: TrendingUp, label: 'Success Rate' },
  { to: '/attempt-rate', icon: RefreshCw, label: 'Attempt Rate' },
  { to: '/exceptions', icon: AlertTriangle, label: 'Exceptions' },
  { to: '/cod', icon: DollarSign, label: 'COD Collection' },
  { to: '/pod', icon: Camera, label: 'POD Dashboard' },
  { to: '/hubs', icon: Warehouse, label: 'Hub Dashboard' },
  { to: '/sla', icon: Clock, label: 'SLA Dashboard' },
  { to: '/routes', icon: Route, label: 'Route Performance' },
];

const NAV_PERFORMANCE = [
  { to: '/performance', icon: Award,          label: 'Performance' },
  { to: '/supervisor',  icon: UserCheck,      label: 'Supervisor View' },
  { to: '/coaching',    icon: GraduationCap,  label: 'Coaching Center' },
  { to: '/recognition', icon: Star,           label: 'Recognition Hub' },
];

const NAV_RIDER_DEV = [
  { to: '/learning',    icon: BookOpen,       label: 'Learning Center' },
  { to: '/incentives',  icon: Banknote,       label: 'Incentive Engine' },
  { to: '/safety',      icon: ShieldAlert,    label: 'Safety Dashboard' },
  { to: '/attendance',  icon: CalendarCheck,  label: 'Attendance' },
];

const NAV_NEW = [
  { to: '/returns',           icon: RotateCcw,   label: 'Returns — 10E' },
  { to: '/rider-intelligence',icon: Brain,       label: 'Rider Intel — 10F' },
  { to: '/data-flow',         icon: GitBranch,   label: 'Data Flow & Sync' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">RS</div>
          <div>
            <div className="logo-text">RouteSphere</div>
            <div className="logo-sub">Control Tower</div>
          </div>
        </div>
      </div>
      <div className="sidebar-section-label">Operations</div>
      <nav className="sidebar-nav">
        {NAV_OPERATIONS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-section-label" style={{ marginTop: 8 }}>Performance</div>
      <nav className="sidebar-nav">
        {NAV_PERFORMANCE.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-section-label" style={{ marginTop: 8 }}>Rider Development</div>
      <nav className="sidebar-nav">
        {NAV_RIDER_DEV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-section-label" style={{ marginTop: 8, color: '#F5A623' }}>New — Phase 10</div>
      <nav className="sidebar-nav">
        {NAV_NEW.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px', borderTop: '1px solid #1E293B' }}>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Version 1.0.0</div>
        <div style={{ fontSize: 11, color: '#334155' }}>© 2026 RouteSphere</div>
      </div>
    </aside>
  );
}
