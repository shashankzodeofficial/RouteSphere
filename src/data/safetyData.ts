/**
 * RouteSphere — Safety Dashboard data
 * Incidents derived from GPS compliance and performance tier.
 */

export type IncidentType = 'mock_location' | 'gps_off' | 'geofence_breach' | 'speeding' | 'accident' | 'near_miss' | 'route_deviation' | 'vehicle_inspection';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'under_review' | 'resolved' | 'escalated';

export interface SafetyIncident {
  id: string;
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  incidentDate: string;
  incidentTime: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
  resolvedAt?: string;
  resolvedNote?: string;
  escalatedTo?: string;
  fineAmount?: number;
}

export interface RiderSafetyProfile {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  safetyScore: number;
  gpsScore: number;
  incidentCount: number;
  criticalCount: number;
  lastIncidentDate?: string;
  openIncidents: number;
  vehicleInspectionStatus: 'valid' | 'due' | 'overdue';
  vehicleInspectionDate: string;
  helmetCompliance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  incidents: SafetyIncident[];
}

// ============================================================
// INCIDENTS (hardcoded, deterministic)
// ============================================================

export const SAFETY_INCIDENTS: SafetyIncident[] = [
  {
    id:'INC001', riderId:'R18', riderName:'Ajay Chauhan', hub:'Kolkata-Central', region:'East',
    incidentDate:'2026-06-19', incidentTime:'10:23', type:'mock_location', severity:'critical',
    description:'GPS spoofing app detected — RouteSphere Driver reported package delivered at customer address but GPS logs show device stationary at hub. 3 deliveries marked as delivered without movement.',
    status:'under_review', escalatedTo:'Hub Manager, Compliance Team',
  },
  {
    id:'INC002', riderId:'R19', riderName:'Ritu Bansal', hub:'Mumbai-Central', region:'West',
    incidentDate:'2026-06-18', incidentTime:'14:47', type:'gps_off', severity:'high',
    description:'GPS turned off for 47 minutes during active delivery window. Device came back online 6.2 km from last known location. 3 COD deliveries unverified during blackout period.',
    status:'open',
  },
  {
    id:'INC003', riderId:'R20', riderName:'Vijay Raj', hub:'Pune-Hub', region:'West',
    incidentDate:'2026-06-18', incidentTime:'09:15', type:'route_deviation', severity:'high',
    description:'Deviated 4.8 km from assigned route without approved reason. Delivered only 12 of 18 assigned stops. Unauthorized halt of 38 minutes in residential area not on route.',
    status:'open',
  },
  {
    id:'INC004', riderId:'R18', riderName:'Ajay Chauhan', hub:'Kolkata-Central', region:'East',
    incidentDate:'2026-06-17', incidentTime:'16:30', type:'geofence_breach', severity:'high',
    description:'Exited assigned delivery zone (South Kolkata perimeter) and entered restricted competitor zone. Vehicle tracked 3.2 km beyond zone boundary for 22 minutes.',
    status:'open',
  },
  {
    id:'INC005', riderId:'R15', riderName:'Kiran Pillai', hub:'Bangalore-Central', region:'South',
    incidentDate:'2026-06-17', incidentTime:'11:45', type:'gps_off', severity:'medium',
    description:'GPS disabled for 18 minutes. Rider claims phone battery died. However, 2 delivery scan events recorded during the blackout period — inconsistency under review.',
    status:'under_review',
  },
  {
    id:'INC006', riderId:'R16', riderName:'Manoj Agarwal', hub:'Chennai-Hub', region:'South',
    incidentDate:'2026-06-16', incidentTime:'13:20', type:'vehicle_inspection', severity:'medium',
    description:'Mandatory monthly vehicle inspection overdue by 12 days. Two-wheeler registration valid, but rear brake and left indicator found non-functional during spot check.',
    status:'open', fineAmount: 500,
  },
  {
    id:'INC007', riderId:'R19', riderName:'Ritu Bansal', hub:'Mumbai-Central', region:'West',
    incidentDate:'2026-06-15', incidentTime:'08:50', type:'near_miss', severity:'high',
    description:'Rider-reported near-miss: ran red light at Andheri junction. No collision but eyewitness complaint received. CCTV footage confirms infraction. Safety retraining mandated.',
    status:'escalated', escalatedTo:'Safety Officer', resolvedNote:'Mandatory safety retraining scheduled for 2026-06-22.',
  },
  {
    id:'INC008', riderId:'R17', riderName:'Swati Saxena', hub:'Hyderabad-Hub', region:'South',
    incidentDate:'2026-06-15', incidentTime:'15:10', type:'route_deviation', severity:'low',
    description:'Minor route deviation — 1.2 km off assigned route for approximately 9 minutes. Rider cited construction blockage. No deliveries missed. Acceptable under exception policy.',
    status:'resolved', resolvedAt:'2026-06-15', resolvedNote:'Construction diversion confirmed via city civic portal. Closed with no action.',
  },
  {
    id:'INC009', riderId:'R20', riderName:'Vijay Raj', hub:'Pune-Hub', region:'West',
    incidentDate:'2026-06-14', incidentTime:'10:05', type:'gps_off', severity:'medium',
    description:'GPS turned off for 24 minutes. Second occurrence this month. Rider unable to provide adequate explanation. Warning issued. Next occurrence will trigger formal performance action.',
    status:'resolved', resolvedAt:'2026-06-14', resolvedNote:'Warning letter issued. GPS compliance included in next coaching session.',
  },
  {
    id:'INC010', riderId:'R15', riderName:'Kiran Pillai', hub:'Bangalore-Central', region:'South',
    incidentDate:'2026-06-13', incidentTime:'17:40', type:'geofence_breach', severity:'medium',
    description:'Exited assigned Whitefield zone boundary. Entered HSR Layout zone (different hub\'s territory). 1 delivery made outside zone without cross-hub approval.',
    status:'resolved', resolvedAt:'2026-06-15', resolvedNote:'Customer requested delivery to alternate address at last minute. Policy clarification issued to rider.',
  },
  {
    id:'INC011', riderId:'R13', riderName:'Rohit Tiwari', hub:'Gurgaon-Hub', region:'North',
    incidentDate:'2026-06-12', incidentTime:'12:30', type:'route_deviation', severity:'low',
    description:'Route deviation of 0.8 km. Rider used a shorter route through a private colony not in navigation system. Arrived on time, all deliveries completed.',
    status:'resolved', resolvedAt:'2026-06-12', resolvedNote:'Route shortcut verified as valid and added to navigation system.',
  },
  {
    id:'INC012', riderId:'R18', riderName:'Ajay Chauhan', hub:'Kolkata-Central', region:'East',
    incidentDate:'2026-06-10', incidentTime:'09:00', type:'vehicle_inspection', severity:'high',
    description:'Vehicle inspection failed: tyre tread below minimum depth (2mm vs required 5mm), no rearview mirror on left side. Rider instructed not to operate vehicle until repaired.',
    status:'resolved', resolvedAt:'2026-06-12', resolvedNote:'Tyres replaced and mirror fitted. Re-inspection passed on 2026-06-12.',
  },
  {
    id:'INC013', riderId:'R16', riderName:'Manoj Agarwal', hub:'Chennai-Hub', region:'South',
    incidentDate:'2026-06-08', incidentTime:'16:20', type:'gps_off', severity:'medium',
    description:'GPS disabled for 31 minutes during afternoon delivery window. Rider marked 4 packages as delivered. Customer complaints received for 2 of those 4 packages.',
    status:'escalated', escalatedTo:'Hub Manager', fineAmount: 1000,
  },
  {
    id:'INC014', riderId:'R14', riderName:'Anita Bose', hub:'Noida-Hub', region:'North',
    incidentDate:'2026-06-05', incidentTime:'14:15', type:'near_miss', severity:'medium',
    description:'Minor collision with parked vehicle while reversing in narrow lane. Vehicle sustained minor scratches. No person injured. Rider self-reported the incident.',
    status:'resolved', resolvedAt:'2026-06-06', resolvedNote:'No major damage. Rider commended for self-reporting. Insurance filed. Safe riding refresher assigned.',
  },
  {
    id:'INC015', riderId:'R19', riderName:'Ritu Bansal', hub:'Mumbai-Central', region:'West',
    incidentDate:'2026-06-03', incidentTime:'11:30', type:'mock_location', severity:'critical',
    description:'Mock location app (Fake GPS Joystick v3.2) found installed on device during routine audit. GPS track shows 8 deliveries marked complete with no movement. COD of ₹6,800 unaccounted.',
    status:'escalated', escalatedTo:'Compliance Team, Finance', fineAmount: 5000,
  },
];

// ============================================================
// RIDER SAFETY PROFILES
// ============================================================

const RIDER_SAFETY_RAW = [
  { id:'R01', name:'Arjun Sharma',  hub:'Delhi-Central',     region:'North', gps:99.8, score:99, incidents:[], vehicle:'valid',   vehicleDate:'2026-07-10', helmet:100 },
  { id:'R02', name:'Priya Patel',   hub:'Delhi-North',       region:'North', gps:99.2, score:98, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-28', helmet:100 },
  { id:'R03', name:'Rahul Singh',   hub:'Gurgaon-Hub',       region:'North', gps:98.5, score:96, incidents:[], vehicle:'valid',   vehicleDate:'2026-07-05', helmet:98  },
  { id:'R04', name:'Neha Gupta',    hub:'Noida-Hub',         region:'North', gps:97.1, score:95, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-25', helmet:100 },
  { id:'R05', name:'Vikas Yadav',   hub:'Bangalore-Central', region:'South', gps:96.8, score:94, incidents:[], vehicle:'valid',   vehicleDate:'2026-07-02', helmet:97  },
  { id:'R06', name:'Sunita Joshi',  hub:'Chennai-Hub',       region:'South', gps:98.3, score:97, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-30', helmet:100 },
  { id:'R07', name:'Deepak Kumar',  hub:'Hyderabad-Hub',     region:'South', gps:95.9, score:93, incidents:[], vehicle:'valid',   vehicleDate:'2026-07-08', helmet:96  },
  { id:'R08', name:'Pooja Mishra',  hub:'Kolkata-Central',   region:'East',  gps:95.3, score:92, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-22', helmet:98  },
  { id:'R09', name:'Amit Verma',    hub:'Mumbai-Central',    region:'West',  gps:93.2, score:88, incidents:[], vehicle:'valid',   vehicleDate:'2026-07-01', helmet:95  },
  { id:'R10', name:'Kavya Reddy',   hub:'Pune-Hub',          region:'West',  gps:92.8, score:87, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-27', helmet:97  },
  { id:'R11', name:'Sanjay Nair',   hub:'Delhi-Central',     region:'North', gps:91.5, score:86, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-24', helmet:94  },
  { id:'R12', name:'Divya Mehta',   hub:'Delhi-North',       region:'North', gps:90.8, score:85, incidents:[], vehicle:'valid',   vehicleDate:'2026-06-20', helmet:96  },
  { id:'R13', name:'Rohit Tiwari',  hub:'Gurgaon-Hub',       region:'North', gps:88.4, score:80, incidents:['INC011'], vehicle:'valid', vehicleDate:'2026-06-18', helmet:92 },
  { id:'R14', name:'Anita Bose',    hub:'Noida-Hub',         region:'North', gps:86.2, score:78, incidents:['INC014'], vehicle:'valid', vehicleDate:'2026-06-15', helmet:90 },
  { id:'R15', name:'Kiran Pillai',  hub:'Bangalore-Central', region:'South', gps:71.3, score:58, incidents:['INC005','INC010'], vehicle:'due',  vehicleDate:'2026-06-08', helmet:80 },
  { id:'R16', name:'Manoj Agarwal', hub:'Chennai-Hub',       region:'South', gps:68.9, score:52, incidents:['INC006','INC013'], vehicle:'overdue', vehicleDate:'2026-05-28', helmet:75 },
  { id:'R17', name:'Swati Saxena',  hub:'Hyderabad-Hub',     region:'South', gps:72.4, score:62, incidents:['INC008'], vehicle:'valid', vehicleDate:'2026-06-10', helmet:82 },
  { id:'R18', name:'Ajay Chauhan',  hub:'Kolkata-Central',   region:'East',  gps:52.1, score:28, incidents:['INC001','INC004','INC012'], vehicle:'due', vehicleDate:'2026-06-05', helmet:60 },
  { id:'R19', name:'Ritu Bansal',   hub:'Mumbai-Central',    region:'West',  gps:48.3, score:18, incidents:['INC002','INC007','INC015'], vehicle:'overdue', vehicleDate:'2026-05-20', helmet:55 },
  { id:'R20', name:'Vijay Raj',     hub:'Pune-Hub',          region:'West',  gps:56.8, score:34, incidents:['INC003','INC009'], vehicle:'due',  vehicleDate:'2026-06-01', helmet:65 },
];

export const RIDER_SAFETY_PROFILES: RiderSafetyProfile[] = RIDER_SAFETY_RAW.map(r => {
  const myIncidents = SAFETY_INCIDENTS.filter(i => r.incidents.includes(i.id));
  const openCount   = myIncidents.filter(i => ['open','under_review','escalated'].includes(i.status)).length;
  const critCount   = myIncidents.filter(i => i.severity === 'critical').length;
  const last        = myIncidents.length > 0 ? myIncidents.sort((a,b) => b.incidentDate.localeCompare(a.incidentDate))[0].incidentDate : undefined;
  const risk: RiderSafetyProfile['riskLevel'] =
    r.score < 30 ? 'critical' : r.score < 55 ? 'high' : r.score < 80 ? 'medium' : 'low';
  return {
    riderId: r.id, riderName: r.name, hub: r.hub, region: r.region,
    safetyScore: r.score, gpsScore: r.gps, incidentCount: myIncidents.length,
    criticalCount: critCount, lastIncidentDate: last, openIncidents: openCount,
    vehicleInspectionStatus: r.vehicle as RiderSafetyProfile['vehicleInspectionStatus'],
    vehicleInspectionDate: r.vehicleDate, helmetCompliance: r.helmet,
    riskLevel: risk, incidents: myIncidents,
  };
});

// ============================================================
// AGGREGATES
// ============================================================

export function getSafetyStats() {
  const total = SAFETY_INCIDENTS.length;
  const open = SAFETY_INCIDENTS.filter(i => ['open','under_review','escalated'].includes(i.status)).length;
  const critical = SAFETY_INCIDENTS.filter(i => i.severity === 'critical').length;
  const resolved = SAFETY_INCIDENTS.filter(i => i.status === 'resolved').length;
  const mockLoc = SAFETY_INCIDENTS.filter(i => i.type === 'mock_location').length;
  const highRisk = RIDER_SAFETY_PROFILES.filter(r => ['high','critical'].includes(r.riskLevel)).length;
  const avgScore = Math.round(RIDER_SAFETY_PROFILES.reduce((s, r) => s + r.safetyScore, 0) / RIDER_SAFETY_PROFILES.length);

  return { total, open, critical, resolved, mockLoc, highRisk, avgScore };
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  mock_location: 'GPS Spoofing', gps_off: 'GPS Disabled', geofence_breach: 'Geofence Breach',
  speeding: 'Speeding', accident: 'Accident', near_miss: 'Near Miss',
  route_deviation: 'Route Deviation', vehicle_inspection: 'Vehicle Issue',
};

export const SEVERITY_COLORS: Record<IncidentSeverity, { bg: string; text: string; border: string }> = {
  critical: { bg:'#FEF2F2', text:'#DC2626', border:'#FECACA' },
  high:     { bg:'#FFFBEB', text:'#D97706', border:'#FDE68A' },
  medium:   { bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE' },
  low:      { bg:'#F0FDF4', text:'#059669', border:'#A7F3D0' },
};

export const RISK_COLORS: Record<RiderSafetyProfile['riskLevel'], string> = {
  critical:'#DC2626', high:'#D97706', medium:'#2563EB', low:'#059669',
};
