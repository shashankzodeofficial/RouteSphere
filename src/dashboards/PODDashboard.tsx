import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera, FileCheck, AlertCircle, Upload } from 'lucide-react';
import { useFilterStore, filterOrders } from '../store/filterStore';

export default function PODDashboard() {
  const f = useFilterStore();
  const orders = useMemo(() => filterOrders(f), [f.region, f.hub, f.city, f.deliveryPartner]);

  const delivered = orders.filter(o => o.status === 'delivered');
  const podCaptured = delivered.filter(o => o.podCaptured).length;
  const podMissing = delivered.length - podCaptured;
  const complianceRate = delivered.length > 0 ? ((podCaptured / delivered.length) * 100).toFixed(1) : '0.0';

  const byHub = orders.reduce<Record<string, { delivered: number; pod: number }>>((acc, o) => {
    if (o.status === 'delivered') {
      if (!acc[o.hub]) acc[o.hub] = { delivered: 0, pod: 0 };
      acc[o.hub].delivered++;
      if (o.podCaptured) acc[o.hub].pod++;
    }
    return acc;
  }, {});

  const hubData = Object.entries(byHub).map(([hub, v]) => ({
    hub: hub.replace('-Hub','').replace('-Central',''),
    compliance: v.delivered > 0 ? +((v.pod / v.delivered) * 100).toFixed(1) : 0,
    captured: v.pod,
    missing: v.delivered - v.pod,
  })).sort((a, b) => b.compliance - a.compliance);

  const pieData = [
    { name: 'POD Captured', value: podCaptured, color: '#059669' },
    { name: 'POD Missing', value: podMissing, color: '#FCA5A5' },
  ];

  // Last bucket absorbs rounding remainder so all three always sum to podCaptured
  const podPhotoSig = Math.floor(podCaptured * 0.55);
  const podPhoto    = Math.floor(podCaptured * 0.30);
  const podSig      = podCaptured - podPhotoSig - podPhoto;
  const podTypes = [
    { type: 'Photo + Signature', count: podPhotoSig, color: '#059669' },
    { type: 'Photo Only',        count: podPhoto,    color: '#2563EB' },
    { type: 'Signature Only',    count: podSig,      color: '#7C3AED' },
  ];

  return (
    <div>
      <div className="page-title">POD Dashboard</div>
      <div className="page-sub">Proof of Delivery capture compliance and status tracking</div>

      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'POD Compliance Rate', value: `${complianceRate}%`, icon: <FileCheck size={18} />, color: +complianceRate >= 90 ? '#059669' : '#D97706', bg: +complianceRate >= 90 ? '#ECFDF5' : '#FFFBEB' },
          { label: 'POD Captured', value: podCaptured, icon: <Camera size={18} />, color: '#059669', bg: '#ECFDF5' },
          { label: 'POD Missing', value: podMissing, icon: <AlertCircle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Total Deliveries', value: delivered.length, icon: <Upload size={18} />, color: '#2563EB', bg: '#EFF6FF' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: k.color }}>{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid chart-grid-3" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Hub Compliance Rate</div>
          <div className="chart-card-sub" style={{ marginBottom: 16 }}>% POD captured per hub</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hubData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hub" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="compliance" radius={[4,4,0,0]} name="Compliance">
                {hubData.map(h => (
                  <Cell key={h.hub} fill={h.compliance >= 90 ? '#059669' : h.compliance >= 75 ? '#D97706' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">POD Capture Status</div>
          <div style={{ marginBottom: 8 }} />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                {pieData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend" style={{ justifyContent: 'center', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {pieData.map(d => (
              <div className="legend-item" key={d.name} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="legend-dot" style={{ background: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">POD Type Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {podTypes.map(t => (
              <div key={t.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(t.count / podCaptured) * 100}%`, background: t.color }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload Success Rate</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#059669', marginTop: 2 }}>97.4%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title" style={{ marginBottom: 16 }}>Hub POD Compliance Table</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Hub</th><th>Deliveries</th><th>POD Captured</th><th>POD Missing</th><th>Compliance Rate</th><th>Status</th></tr>
            </thead>
            <tbody>
              {hubData.map(h => (
                <tr key={h.hub}>
                  <td style={{ fontWeight: 600 }}>{h.hub}</td>
                  <td>{h.captured + h.missing}</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>{h.captured}</td>
                  <td style={{ color: '#DC2626' }}>{h.missing}</td>
                  <td><span style={{ fontWeight: 700, color: h.compliance >= 90 ? '#059669' : h.compliance >= 75 ? '#D97706' : '#DC2626' }}>{h.compliance}%</span></td>
                  <td>
                    <span className={`badge ${h.compliance >= 90 ? 'badge-success' : h.compliance >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                      {h.compliance >= 90 ? 'Compliant' : h.compliance >= 75 ? 'At Risk' : 'Non-Compliant'}
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
