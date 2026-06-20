/**
 * RouteSphere — Incentive Engine data
 * Fully deterministic. Payouts tied to rider performance tiers.
 */

export type IncentiveTierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type IncentiveStatus = 'on_track' | 'at_risk' | 'achieved' | 'missed';

export interface IncentiveTier {
  name: IncentiveTierName;
  minScore: number;
  maxScore: number;
  grade: string;
  color: string;
  bg: string;
  border: string;
  baseBonus: number;      // ₹
  deliveryTarget: number;
  deliveryRate: number;   // ₹ per delivery above target
  codRate: number;        // % of COD collected (if accuracy ≥ threshold)
  codAccuracyThreshold: number;
  attendanceBonus: number;
  podBonus: number;
  successRateBonus: number;
  monthlyMax: number;     // ₹ cap
}

export interface IncentiveComponent {
  label: string;
  amount: number;
  detail: string;
  achieved: boolean;
}

export interface RiderIncentive {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  tier: IncentiveTierName;
  currentScore: number;
  grade: string;
  ordersDelivered: number;
  codCollected: number;
  codAccuracy: number;
  successRate: number;
  attendancePct: number;
  podPct: number;
  components: IncentiveComponent[];
  totalPayout: number;
  targetAchieved: boolean;
  status: IncentiveStatus;
  prevMonthPayout: number;
  payoutChange: number;   // ₹ vs last month
}

export interface MonthlyIncentiveSummary {
  month: string;
  totalPayout: number;
  avgPayout: number;
  achievedCount: number;
  platinumCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  topEarner: string;
  topEarnerAmount: number;
}

// ============================================================
// TIER DEFINITIONS
// ============================================================

export const INCENTIVE_TIERS: IncentiveTier[] = [
  {
    name: 'Platinum', minScore: 90, maxScore: 100, grade: 'S',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    baseBonus: 4000, deliveryTarget: 380, deliveryRate: 25,
    codRate: 0.005, codAccuracyThreshold: 98, attendanceBonus: 800,
    podBonus: 500, successRateBonus: 500, monthlyMax: 12000,
  },
  {
    name: 'Gold', minScore: 80, maxScore: 89.9, grade: 'A',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    baseBonus: 2000, deliveryTarget: 320, deliveryRate: 20,
    codRate: 0.004, codAccuracyThreshold: 97, attendanceBonus: 500,
    podBonus: 300, successRateBonus: 300, monthlyMax: 7000,
  },
  {
    name: 'Silver', minScore: 70, maxScore: 79.9, grade: 'B',
    color: '#64748B', bg: '#F8FAFC', border: '#CBD5E1',
    baseBonus: 1000, deliveryTarget: 260, deliveryRate: 15,
    codRate: 0.003, codAccuracyThreshold: 96, attendanceBonus: 300,
    podBonus: 150, successRateBonus: 150, monthlyMax: 4000,
  },
  {
    name: 'Bronze', minScore: 60, maxScore: 69.9, grade: 'C',
    color: '#B45309', bg: '#FFFBEB', border: '#FDE68A',
    baseBonus: 500, deliveryTarget: 200, deliveryRate: 10,
    codRate: 0.002, codAccuracyThreshold: 95, attendanceBonus: 150,
    podBonus: 0, successRateBonus: 0, monthlyMax: 2000,
  },
];

function getTier(score: number): IncentiveTier {
  return INCENTIVE_TIERS.find(t => score >= t.minScore && score <= t.maxScore)
    ?? INCENTIVE_TIERS[INCENTIVE_TIERS.length - 1];
}

// ============================================================
// RAW RIDER STATS (deterministic, matches performanceData names)
// ============================================================

const RIDER_STATS = [
  { id:'R01', name:'Arjun Sharma',  hub:'Delhi-Central',     region:'North', score:94.2, grade:'S', deliveries:412, cod:185000, codAcc:99.6, sr:95.8, att:100, pod:99.2, prevPayout:6120 },
  { id:'R02', name:'Priya Patel',   hub:'Delhi-North',       region:'North', score:93.1, grade:'S', deliveries:398, cod:172000, codAcc:99.1, sr:94.3, att:100, pod:100,  prevPayout:5880 },
  { id:'R03', name:'Rahul Singh',   hub:'Gurgaon-Hub',       region:'North', score:91.8, grade:'S', deliveries:387, cod:165000, codAcc:98.8, sr:93.5, att:96,  pod:98.4, prevPayout:5640 },
  { id:'R04', name:'Neha Gupta',    hub:'Noida-Hub',         region:'North', score:84.5, grade:'A', deliveries:349, cod:142000, codAcc:97.8, sr:88.2, att:95,  pod:95.1, prevPayout:3820 },
  { id:'R05', name:'Vikas Yadav',   hub:'Bangalore-Central', region:'South', score:83.2, grade:'A', deliveries:335, cod:138000, codAcc:97.2, sr:87.1, att:92,  pod:94.3, prevPayout:3550 },
  { id:'R06', name:'Sunita Joshi',  hub:'Chennai-Hub',       region:'South', score:82.7, grade:'A', deliveries:328, cod:164000, codAcc:99.9, sr:86.4, att:96,  pod:93.8, prevPayout:3480 },
  { id:'R07', name:'Deepak Kumar',  hub:'Hyderabad-Hub',     region:'South', score:81.1, grade:'A', deliveries:318, cod:131000, codAcc:97.0, sr:85.0, att:91,  pod:92.5, prevPayout:3290 },
  { id:'R08', name:'Pooja Mishra',  hub:'Kolkata-Central',   region:'East',  score:80.6, grade:'A', deliveries:312, cod:128000, codAcc:96.8, sr:84.5, att:93,  pod:91.7, prevPayout:3150 },
  { id:'R09', name:'Amit Verma',    hub:'Mumbai-Central',    region:'West',  score:77.3, grade:'B', deliveries:285, cod:115000, codAcc:96.1, sr:80.2, att:90,  pod:89.3, prevPayout:2180 },
  { id:'R10', name:'Kavya Reddy',   hub:'Pune-Hub',          region:'West',  score:76.8, grade:'B', deliveries:278, cod:112000, codAcc:95.8, sr:79.4, att:88,  pod:88.7, prevPayout:2020 },
  { id:'R11', name:'Sanjay Nair',   hub:'Delhi-Central',     region:'North', score:75.4, grade:'B', deliveries:271, cod:108000, codAcc:95.5, sr:78.1, att:91,  pod:87.5, prevPayout:1920 },
  { id:'R12', name:'Divya Mehta',   hub:'Delhi-North',       region:'North', score:73.2, grade:'B', deliveries:265, cod:104000, codAcc:95.1, sr:76.3, att:89,  pod:86.1, prevPayout:1780 },
  { id:'R13', name:'Rohit Tiwari',  hub:'Gurgaon-Hub',       region:'North', score:72.5, grade:'B', deliveries:261, cod:101000, codAcc:94.8, sr:75.6, att:86,  pod:85.4, prevPayout:1650 },
  { id:'R14', name:'Anita Bose',    hub:'Noida-Hub',         region:'North', score:71.0, grade:'B', deliveries:255, cod:98000,  codAcc:94.5, sr:74.0, att:87,  pod:84.2, prevPayout:1520 },
  { id:'R15', name:'Kiran Pillai',  hub:'Bangalore-Central', region:'South', score:67.3, grade:'C', deliveries:232, cod:88000,  codAcc:93.2, sr:68.5, att:78,  pod:79.4, prevPayout:820  },
  { id:'R16', name:'Manoj Agarwal', hub:'Chennai-Hub',       region:'South', score:64.1, grade:'C', deliveries:220, cod:81000,  codAcc:92.1, sr:65.3, att:72,  pod:76.8, prevPayout:680  },
  { id:'R17', name:'Swati Saxena',  hub:'Hyderabad-Hub',     region:'South', score:66.4, grade:'C', deliveries:228, cod:85000,  codAcc:93.8, sr:67.1, att:75,  pod:78.0, prevPayout:750  },
  { id:'R18', name:'Ajay Chauhan',  hub:'Kolkata-Central',   region:'East',  score:52.3, grade:'D', deliveries:175, cod:62000,  codAcc:87.4, sr:51.0, att:64,  pod:68.5, prevPayout:0    },
  { id:'R19', name:'Ritu Bansal',   hub:'Mumbai-Central',    region:'West',  score:44.1, grade:'D', deliveries:148, cod:54000,  codAcc:84.2, sr:43.5, att:58,  pod:62.1, prevPayout:0    },
  { id:'R20', name:'Vijay Raj',     hub:'Pune-Hub',          region:'West',  score:46.2, grade:'D', deliveries:158, cod:57000,  codAcc:85.1, sr:45.2, att:60,  pod:64.3, prevPayout:0    },
];

// ============================================================
// BUILD INCENTIVE RECORDS
// ============================================================

function buildComponents(stats: typeof RIDER_STATS[0], tier: IncentiveTier): IncentiveComponent[] {
  const deliveryOver = Math.max(0, stats.deliveries - tier.deliveryTarget);
  const deliveryBonus = deliveryOver * tier.deliveryRate;
  const codEligible = stats.codAcc >= tier.codAccuracyThreshold;
  const codBonus = codEligible ? Math.round(stats.cod * tier.codRate) : 0;
  const attBonus = stats.att >= 95 ? tier.attendanceBonus : stats.att >= 90 ? Math.round(tier.attendanceBonus * 0.5) : 0;
  const podBonus = stats.pod >= 98 ? tier.podBonus : 0;
  const srBonus  = stats.sr  >= 90 ? tier.successRateBonus : 0;

  return [
    { label: 'Base Tier Bonus',     amount: tier.baseBonus,   detail: `${tier.name} tier`,  achieved: true },
    { label: 'Delivery Volume',     amount: deliveryBonus,    detail: `${deliveryOver} deliveries above ${tier.deliveryTarget} target × ₹${tier.deliveryRate}`, achieved: deliveryOver > 0 },
    { label: 'COD Accuracy Bonus',  amount: codBonus,         detail: codEligible ? `0.${(tier.codRate*1000).toFixed(0)}% of ₹${(stats.cod/1000).toFixed(0)}k collected` : `COD accuracy ${stats.codAcc.toFixed(1)}% below ${tier.codAccuracyThreshold}% threshold`, achieved: codEligible },
    { label: 'Attendance Bonus',    amount: attBonus,         detail: `${stats.att}% attendance`, achieved: stats.att >= 90 },
    { label: 'POD Excellence',      amount: podBonus,         detail: stats.pod >= 98 ? `${stats.pod.toFixed(1)}% POD compliance` : `POD ${stats.pod.toFixed(1)}% below 98% threshold`, achieved: stats.pod >= 98 },
    { label: 'Success Rate Star',   amount: srBonus,          detail: stats.sr  >= 90 ? `${stats.sr.toFixed(1)}% delivery success rate` : `SR ${stats.sr.toFixed(1)}% below 90% threshold`, achieved: stats.sr >= 90 },
  ];
}

function buildIncentive(stats: typeof RIDER_STATS[0]): RiderIncentive {
  const tier = getTier(stats.score);
  const components = buildComponents(stats, tier);
  const total = Math.min(
    components.reduce((s, c) => s + c.amount, 0),
    tier.monthlyMax,
  );
  const payoutChange = total - stats.prevPayout;

  return {
    riderId:         stats.id,
    riderName:       stats.name,
    hub:             stats.hub,
    region:          stats.region,
    tier:            tier.name,
    currentScore:    stats.score,
    grade:           stats.grade,
    ordersDelivered: stats.deliveries,
    codCollected:    stats.cod,
    codAccuracy:     stats.codAcc,
    successRate:     stats.sr,
    attendancePct:   stats.att,
    podPct:          stats.pod,
    components,
    totalPayout:     total,
    targetAchieved:  stats.deliveries >= tier.deliveryTarget,
    status: total >= tier.baseBonus * 1.5 ? 'achieved' : total >= tier.baseBonus ? 'on_track' : stats.score < 60 ? 'missed' : 'at_risk',
    prevMonthPayout: stats.prevPayout,
    payoutChange,
  };
}

export const RIDER_INCENTIVES: RiderIncentive[] = RIDER_STATS.map(buildIncentive);

// ============================================================
// AGGREGATE HELPERS
// ============================================================

export function getIncentiveStats() {
  const total = RIDER_INCENTIVES.reduce((s, r) => s + r.totalPayout, 0);
  const platinum = RIDER_INCENTIVES.filter(r => r.tier === 'Platinum');
  const gold     = RIDER_INCENTIVES.filter(r => r.tier === 'Gold');
  const silver   = RIDER_INCENTIVES.filter(r => r.tier === 'Silver');
  const bronze   = RIDER_INCENTIVES.filter(r => r.tier === 'Bronze');
  const below    = RIDER_INCENTIVES.filter(r => !['Platinum','Gold','Silver','Bronze'].includes(r.tier));
  const achieved = RIDER_INCENTIVES.filter(r => r.targetAchieved).length;
  const sorted   = [...RIDER_INCENTIVES].sort((a, b) => b.totalPayout - a.totalPayout);

  return {
    totalPayout: total,
    avgPayout: Math.round(total / RIDER_INCENTIVES.length),
    achievedCount: achieved,
    platinumCount: platinum.length,
    goldCount: gold.length,
    silverCount: silver.length,
    bronzeCount: bronze.length,
    belowBronzeCount: below.length,
    topEarner: sorted[0],
    atRiskCount: RIDER_INCENTIVES.filter(r => r.status === 'at_risk').length,
  };
}

export const MONTHLY_HISTORY: MonthlyIncentiveSummary[] = [
  { month:'Jan 2026', totalPayout:68400,  avgPayout:3420, achievedCount:12, platinumCount:2, goldCount:5, silverCount:5, bronzeCount:3, topEarner:'Arjun Sharma', topEarnerAmount:5800 },
  { month:'Feb 2026', totalPayout:72100,  avgPayout:3605, achievedCount:13, platinumCount:3, goldCount:5, silverCount:5, bronzeCount:2, topEarner:'Arjun Sharma', topEarnerAmount:6100 },
  { month:'Mar 2026', totalPayout:75800,  avgPayout:3790, achievedCount:14, platinumCount:3, goldCount:5, silverCount:6, bronzeCount:2, topEarner:'Arjun Sharma', topEarnerAmount:6320 },
  { month:'Apr 2026', totalPayout:71200,  avgPayout:3560, achievedCount:13, platinumCount:3, goldCount:4, silverCount:5, bronzeCount:3, topEarner:'Priya Patel',  topEarnerAmount:5920 },
  { month:'May 2026', totalPayout:77400,  avgPayout:3870, achievedCount:14, platinumCount:3, goldCount:5, silverCount:5, bronzeCount:2, topEarner:'Arjun Sharma', topEarnerAmount:6120 },
  { month:'Jun 2026', totalPayout: RIDER_INCENTIVES.reduce((s,r) => s+r.totalPayout, 0), avgPayout:Math.round(RIDER_INCENTIVES.reduce((s,r) => s+r.totalPayout, 0)/20), achievedCount:RIDER_INCENTIVES.filter(r=>r.targetAchieved).length, platinumCount:3, goldCount:5, silverCount:6, bronzeCount:3, topEarner:'Arjun Sharma', topEarnerAmount:RIDER_INCENTIVES[0].totalPayout },
];

export const TIER_COLORS: Record<IncentiveTierName, IncentiveTier> = Object.fromEntries(
  INCENTIVE_TIERS.map(t => [t.name, t])
) as Record<IncentiveTierName, IncentiveTier>;
