/**
 * RouteSphere — Rider Performance Engine — Sample Data
 * Mirrors the output of the scoring engine for 20 riders over 30 days.
 * Used by the Control Tower Performance & Supervisor dashboards.
 */

import type { RiderPerformance, DailyScore, PerformanceGrade, ScoreBreakdown } from '../types/performance';

// Re-import rider names/hubs to stay consistent with existing mock data
import { riders as baseRiders } from './mockData';

// ============================================================
// HELPERS
// ============================================================

function rnd(min: number, max: number, dp = 0): number {
  const v = Math.random() * (max - min) + min;
  return dp > 0 ? +v.toFixed(dp) : Math.floor(v);
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function toGrade(score: number): PerformanceGrade {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function componentScore(rate: number, floor: number, ceiling: number): number {
  if (rate >= ceiling) return 100;
  if (rate <= floor)   return 0;
  return clamp(((rate - floor) / (ceiling - floor)) * 100, 0, 100);
}

function buildBreakdown(
  sr: number, ot: number, fa: number, pod: number, cod: number, gps: number, att: number, prod: number
): ScoreBreakdown[] {
  return [
    { metric: 'Success Rate',   score: componentScore(sr,  50, 97), rate: sr,   weight: 25, target: 85 },
    { metric: 'On-Time',        score: componentScore(ot,  50, 97), rate: ot,   weight: 20, target: 80 },
    { metric: 'First Attempt',  score: componentScore(fa,  50, 97), rate: fa,   weight: 15, target: 75 },
    { metric: 'POD Compliance', score: componentScore(pod, 70,100), rate: pod,  weight: 15, target: 95 },
    { metric: 'COD Accuracy',   score: componentScore(cod, 80,100), rate: cod,  weight: 10, target: 98 },
    { metric: 'GPS Discipline', score: gps,                          rate: gps,  weight:  5, target: 90 },
    { metric: 'Attendance',     score: componentScore(att, 70,100), rate: att,  weight:  5, target: 95 },
    { metric: 'Productivity',   score: componentScore(prod,40,100), rate: prod, weight:  5, target: 80 },
  ];
}

function overallFromBreakdown(bd: ScoreBreakdown[]): number {
  const total = bd.reduce((s, d) => s + d.score * (d.weight / 100), 0);
  return +total.toFixed(2);
}

function genDailyScores(baseScore: number, days = 30): DailyScore[] {
  const result: DailyScore[] = [];
  let current = baseScore + rnd(-10, 10, 1);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    current = clamp(current + rnd(-5, 5, 1), 30, 100);
    result.push({
      date: d.toISOString().slice(0, 10),
      score: +current.toFixed(1),
      grade: toGrade(current),
      delivered: rnd(10, 28),
    });
  }
  return result;
}

// ============================================================
// VEHICLE TYPES
// ============================================================

const VEHICLES = ['Bicycle', 'Electric Scooter', 'Motorbike', 'Motorbike', 'Motorbike', 'Cargo Bike'];

// ============================================================
// RIDER PERFORMANCE PROFILES
// Each rider has a "personality" that determines their metric ranges
// ============================================================

type Profile = {
  srRange: [number, number];
  otRange: [number, number];
  faRange: [number, number];
  podRange: [number, number];
  codRange: [number, number];
  gpsRange: [number, number];
  attRange: [number, number];
  prodRange: [number, number];
};

const PROFILES: Profile[] = [
  // Elite performers (0–3)
  { srRange:[92,97], otRange:[88,96], faRange:[85,95], podRange:[97,100], codRange:[99,100], gpsRange:[95,100], attRange:[98,100], prodRange:[85,95] },
  { srRange:[90,96], otRange:[85,94], faRange:[82,92], podRange:[95,100], codRange:[98,100], gpsRange:[90,100], attRange:[95,100], prodRange:[80,92] },
  { srRange:[89,95], otRange:[83,93], faRange:[80,90], podRange:[95,100], codRange:[97,100], gpsRange:[88,100], attRange:[93,100], prodRange:[78,90] },
  { srRange:[88,94], otRange:[82,92], faRange:[79,89], podRange:[94,100], codRange:[96,100], gpsRange:[85,100], attRange:[90,100], prodRange:[75,88] },
  // High performers (4–8)
  { srRange:[83,91], otRange:[78,88], faRange:[74,84], podRange:[90,97],  codRange:[95,99],  gpsRange:[80,95],  attRange:[85,98],  prodRange:[70,84] },
  { srRange:[81,89], otRange:[76,86], faRange:[72,82], podRange:[88,96],  codRange:[94,99],  gpsRange:[78,93],  attRange:[83,96],  prodRange:[68,82] },
  { srRange:[80,88], otRange:[75,85], faRange:[71,81], podRange:[87,95],  codRange:[93,98],  gpsRange:[76,92],  attRange:[82,95],  prodRange:[66,80] },
  { srRange:[79,87], otRange:[74,84], faRange:[70,80], podRange:[86,94],  codRange:[92,98],  gpsRange:[74,90],  attRange:[80,94],  prodRange:[65,79] },
  { srRange:[78,86], otRange:[73,83], faRange:[69,79], podRange:[85,93],  codRange:[91,97],  gpsRange:[72,88],  attRange:[78,93],  prodRange:[63,78] },
  // Good performers (9–13)
  { srRange:[73,82], otRange:[68,78], faRange:[64,74], podRange:[80,90],  codRange:[88,95],  gpsRange:[65,85],  attRange:[75,90],  prodRange:[58,74] },
  { srRange:[71,80], otRange:[66,76], faRange:[62,72], podRange:[78,88],  codRange:[86,94],  gpsRange:[62,83],  attRange:[73,88],  prodRange:[56,72] },
  { srRange:[70,79], otRange:[65,75], faRange:[61,71], podRange:[76,86],  codRange:[84,93],  gpsRange:[60,82],  attRange:[71,87],  prodRange:[54,70] },
  { srRange:[69,78], otRange:[64,74], faRange:[60,70], podRange:[75,85],  codRange:[83,92],  gpsRange:[58,80],  attRange:[70,86],  prodRange:[52,68] },
  { srRange:[68,77], otRange:[63,73], faRange:[59,69], podRange:[74,84],  codRange:[82,91],  gpsRange:[56,78],  attRange:[68,85],  prodRange:[50,66] },
  // Needs improvement (14–16)
  { srRange:[60,72], otRange:[55,68], faRange:[52,65], podRange:[65,80],  codRange:[75,88],  gpsRange:[45,72],  attRange:[60,80],  prodRange:[40,62] },
  { srRange:[58,70], otRange:[53,66], faRange:[50,63], podRange:[63,78],  codRange:[73,86],  gpsRange:[40,70],  attRange:[58,78],  prodRange:[38,60] },
  { srRange:[56,68], otRange:[51,64], faRange:[48,61], podRange:[60,75],  codRange:[70,84],  gpsRange:[35,68],  attRange:[55,75],  prodRange:[35,58] },
  // At risk (17–19)
  { srRange:[45,62], otRange:[40,58], faRange:[38,56], podRange:[50,70],  codRange:[60,80],  gpsRange:[20,60],  attRange:[45,70],  prodRange:[25,50] },
  { srRange:[42,60], otRange:[38,56], faRange:[35,54], podRange:[48,68],  codRange:[58,78],  gpsRange:[15,55],  attRange:[42,68],  prodRange:[22,48] },
  { srRange:[38,58], otRange:[35,54], faRange:[32,52], podRange:[45,65],  codRange:[55,75],  gpsRange:[10,50],  attRange:[38,65],  prodRange:[18,45] },
];

// ============================================================
// GENERATE RIDER PERFORMANCE DATA
// ============================================================

function makeAlerts(sr: number, pod: number, cod: number, gps: number, att: number, fa: number, name: string) {
  const alerts: RiderPerformance['alerts'] = [];
  if (sr < 70) alerts.push({ type: 'LOW_SUCCESS_RATE', severity: sr < 55 ? 'critical' : 'warning',
    message: `Success rate ${sr.toFixed(1)}% below 70% threshold`, metricValue: sr, threshold: 70 });
  if (pod < 85) alerts.push({ type: 'POD_NON_COMPLIANCE', severity: pod < 70 ? 'critical' : 'warning',
    message: `POD compliance ${pod.toFixed(1)}% below 85% target`, metricValue: pod, threshold: 85 });
  if (cod < 95) alerts.push({ type: 'COD_DISCREPANCY', severity: cod < 85 ? 'critical' : 'warning',
    message: `COD accuracy ${cod.toFixed(1)}% below 95% threshold`, metricValue: cod, threshold: 95 });
  if (gps < 70) alerts.push({ type: 'GPS_TAMPERING', severity: 'critical',
    message: `GPS score ${gps.toFixed(0)} — location anomalies detected`, metricValue: gps, threshold: 70 });
  if (att < 80) alerts.push({ type: 'ATTENDANCE_ISSUE', severity: 'warning',
    message: `Attendance ${att.toFixed(1)}% below 80% expectation`, metricValue: att, threshold: 80 });
  if (fa < 60) alerts.push({ type: 'HIGH_EXCEPTION_RATE', severity: 'warning',
    message: `First-attempt rate ${fa.toFixed(1)}% below 60%`, metricValue: fa, threshold: 60 });
  return alerts;
}

function makeRecommendations(sr: number, ot: number, fa: number, pod: number, cod: number, gps: number, att: number, prod: number, grade: PerformanceGrade): string[] {
  const r: string[] = [];
  if (sr < 80)  r.push('Conduct daily debrief on failed deliveries to identify root causes');
  if (ot < 75)  r.push('Review route planning — check idle time via Route Performance dashboard');
  if (fa < 70)  r.push('Call customers 15 minutes before arrival to ensure availability');
  if (pod < 90) r.push('All deliveries must capture both photo and signature in the Driver App');
  if (cod < 98) r.push('COD reconciliation gap — ensure exact change handling and verify EOD report');
  if (gps < 80) r.push('GPS anomalies detected — device must be inspected; check for mock location apps');
  if (att < 90) r.push('Schedule one-on-one meeting to discuss attendance and punctuality');
  if (prod < 60) r.push('Low delivery throughput — optimise stop clustering to reduce travel time');
  if (grade === 'S') r.push('Outstanding performance — recommend for Rider of the Month recognition');
  if (grade === 'A') r.push('Strong performer — focus on GPS and attendance to achieve S grade');
  return r.length > 0 ? r : ['Performance is on track. Maintain consistency and mentor junior riders.'];
}

export const riderPerformanceData: RiderPerformance[] = baseRiders.map((rider, i) => {
  const p = PROFILES[i % PROFILES.length];

  const sr   = rnd(p.srRange[0],   p.srRange[1],   1);
  const ot   = rnd(p.otRange[0],   p.otRange[1],   1);
  const fa   = rnd(p.faRange[0],   p.faRange[1],   1);
  const pod  = rnd(p.podRange[0],  p.podRange[1],  1);
  const cod  = rnd(p.codRange[0],  p.codRange[1],  1);
  const gps  = rnd(p.gpsRange[0],  p.gpsRange[1],  1);
  const att  = rnd(p.attRange[0],  p.attRange[1],  1);
  const prod = rnd(p.prodRange[0], p.prodRange[1], 1);

  const bd    = buildBreakdown(sr, ot, fa, pod, cod, gps, att, prod);
  const score = overallFromBreakdown(bd);
  const grade = toGrade(score);

  const prevScore    = +(score + rnd(-8, 8, 1)).toFixed(2);
  const scoreChange  = +(score - prevScore).toFixed(2);
  const trend        = scoreChange > 1 ? 'up' : scoreChange < -1 ? 'down' : 'stable';

  const assigned   = rnd(380, 520);
  const delivered  = Math.round(assigned * (sr / 100));
  const attempted  = Math.round(assigned * rnd(85, 98, 0) / 100);
  const exceptions = assigned - delivered - rnd(5, 20);

  return {
    riderId:    rider.id,
    riderName:  rider.name,
    hub:        rider.hub,
    region:     rider.region,
    phoneNumber: `+91 98${rnd(10000000, 99999999)}`,
    joinDate:   `202${rnd(2,5)}-${String(rnd(1,12)).padStart(2,'0')}-${String(rnd(1,28)).padStart(2,'0')}`,
    vehicleType: VEHICLES[i % VEHICLES.length],

    overallScore: score,
    grade,
    rankInHub:    0,
    rankOverall:  0,

    successRate:      sr,
    onTimeRate:       ot,
    firstAttemptRate: fa,
    podCompliance:    pod,
    codAccuracy:      cod,
    gpsScore:         gps,
    attendanceScore:  att,
    productivityScore:prod,

    scoreBreakdown: bd,

    prevScore,
    scoreChange,
    trendDirection: trend,

    ordersAssigned:    assigned,
    ordersDelivered:   delivered,
    ordersAttempted:   attempted,
    ordersException:   Math.max(0, exceptions),
    workingDays:       26,
    daysPresent:       Math.round(26 * (att / 100)),
    totalKm:           rnd(800, 1800),
    avgDeliveriesPerDay: +(delivered / 26).toFixed(1),
    codCollected:      rnd(80000, 250000),

    alerts: makeAlerts(sr, pod, cod, gps, att, fa, rider.name),
    dailyScores: genDailyScores(score),
    recommendations: makeRecommendations(sr, ot, fa, pod, cod, gps, att, prod, grade),
  };
});

// Assign ranks
const sorted = [...riderPerformanceData].sort((a, b) => b.overallScore - a.overallScore);
sorted.forEach((r, i) => { r.rankOverall = i + 1; });

// Hub ranks
const byHub: Record<string, RiderPerformance[]> = {};
riderPerformanceData.forEach(r => { (byHub[r.hub] ??= []).push(r); });
Object.values(byHub).forEach(hubRiders => {
  hubRiders.sort((a, b) => b.overallScore - a.overallScore)
    .forEach((r, i) => { r.rankInHub = i + 1; });
});

// ============================================================
// AGGREGATED TEAM SUMMARY
// ============================================================

export function getTeamSummary(riders: RiderPerformance[]) {
  if (!riders.length) return null;
  const avg = (key: keyof RiderPerformance) =>
    +(riders.reduce((s, r) => s + (r[key] as number), 0) / riders.length).toFixed(1);

  return {
    avgScore:             avg('overallScore'),
    totalRiders:          riders.length,
    eliteCount:           riders.filter(r => r.grade === 'S').length,
    highPerformerCount:   riders.filter(r => r.grade === 'A').length,
    goodCount:            riders.filter(r => r.grade === 'B').length,
    needsImprovementCount:riders.filter(r => r.grade === 'C').length,
    atRiskCount:          riders.filter(r => r.grade === 'D').length,
    openAlerts:           riders.reduce((s, r) => s + r.alerts.length, 0),
    avgSuccessRate:       avg('successRate'),
    avgOnTimeRate:        avg('onTimeRate'),
    avgPodCompliance:     avg('podCompliance'),
    avgCodAccuracy:       avg('codAccuracy'),
    avgGpsScore:          avg('gpsScore'),
  };
}

// ============================================================
// SAMPLE PERIOD DATA FOR "30-day team trend" chart
// ============================================================

export const teamTrend30d = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date:  d.toISOString().slice(0, 10),
    avg:   +(72 + Math.sin(i / 5) * 6 + i * 0.2 + (Math.random() * 3 - 1.5)).toFixed(1),
    elite: rnd(3, 6),
    atRisk:rnd(1, 4),
  };
});

// ============================================================
// FILTER HELPER
// ============================================================

export function filterPerformance(
  data: RiderPerformance[],
  region: string,
  hub: string,
  grade?: PerformanceGrade | 'All',
): RiderPerformance[] {
  return data.filter(r => {
    if (region !== 'All Regions' && r.region !== region) return false;
    if (hub    !== 'All Hubs'    && r.hub    !== hub)    return false;
    if (grade  && grade !== 'All' && r.grade  !== grade) return false;
    return true;
  });
}
