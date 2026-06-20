import React, { useMemo } from 'react';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Route, Navigation, Gauge, Target } from 'lucide-react';
import { useFilterStore } from '../store/filterStore';
import { routePerformance } from '../data/mockData';

export default function RoutePerformance() {
  const f = useFilterStore();

  const routes = useMemo(() => {
    return routePerformance.filter(r => {
      if (f.hub !== 'All Hubs' && r.hub !== f.hub) return false;
      return true;
    });
  }, [f.hub]);

  const avgETA = routes.length ? (routes.reduce((s, r) => s + r.etaAccuracy, 0) / routes.length).toFixed(1) : 0;
  const avgKmPerDel = routes.length ? (routes.reduce((s, r) => s + r.kmCovered / r.delivered, 0) / routes.length).toFixed(1) : 0;
  const avgTimePerDel = routes.length ? Math.round(routes.reduce((s, r) => s + r.timeTaken / r.delivered, 0) / routes.length) : 0;
  const totalKm = routes.reduce((s, r) => s + r.kmCovered, 0);

  const effData = routes.map(r => ({
    route: r.route,
    hub: r.hub.replace('-Hub','').replace('-Central',''),
    efficiency: +(r.delivered / r.totalOrders * 100).toFixed(0),
    kmPerDel: +(r.kmCovered / r.delivered).toFixed(1),
    etaAccuracy: r.etaAccuracy,
    delivered: r.delivered,
    deviation: r.deviation,
  }));

  return (
    <div>
      <div className="page-title">Route Performance</div>
      <div className="page-sub">Route efficiency, ETA accuracy and delivery productivity analysis</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Avg ETA Accuracy', value: `${avgETA}%`, icon: <Target size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'Avg Km / Delivery', value: `${avgKmPerDel} km`, icon: <Navigation size={18} />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Avg Time / Delivery', value: `${avgTimePerDel} min`, icon: <Gauge size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Total Km Covered', value: `${totalKm.toLocaleString()} km`, icon: <Route size={18} />, color: '#D97706', bg: '#FFFBEB' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Route Efficiency (%)</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>Delivered / assigned ratio per route</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={effData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="route" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="efficiency" radius={[4,4,0,0]} name="Efficiency">
                {effData.map(r => <Cell key={r.route} fill={r.efficiency >= 85 ? '#059669' : r.efficiency >= 70 ? '#D97706' : '#DC2626'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">ETA Accuracy by Route</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>How accurately ETAs were met</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={effData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="route" tick={{ fontSize: 9 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="etaAccuracy" radius={[4,4,0,0]} name="ETA Accuracy">
                {effData.map(r => <Cell key={r.route} fill={r.etaAccuracy >= 85 ? '#059669' : r.etaAccuracy >= 75 ? '#D97706' : '#DC2626'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Route Performance Detail</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Route</th><th>Hub</th><th>Assigned</th><th>Delivered</th><th>Efficiency</th><th>Km Covered</th><th>Km/Delivery</th><th>ETA Accuracy</th><th>Deviation</th></tr>
            </thead>
            <tbody>
              {effData.map(r => (
                <tr key={r.route}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{r.route}</td>
                  <td>{r.hub}</td>
                  <td>{routePerformance.find(x => x.route === r.route)?.totalOrders}</td>
                  <td>{r.delivered}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: r.efficiency >= 85 ? '#059669' : r.efficiency >= 70 ? '#D97706' : '#DC2626' }}>
                      {r.efficiency}%
                    </span>
                  </td>
                  <td>{routePerformance.find(x => x.route === r.route)?.kmCovered} km</td>
                  <td>{r.kmPerDel} km</td>
                  <td>
                    <span style={{ fontWeight: 700, color: r.etaAccuracy >= 85 ? '#059669' : '#D97706' }}>
                      {r.etaAccuracy}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.deviation <= 3 ? 'badge-success' : r.deviation <= 6 ? 'badge-warning' : 'badge-danger'}`}>
                      {r.deviation} km
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
