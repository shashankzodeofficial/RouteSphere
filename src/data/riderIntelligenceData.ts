// Phase 10F – Rider Intelligence data for Control Tower

export interface RiderIntelligenceRecord {
  id: string;
  name: string;
  hub: string;
  region: string;
  performanceScore: number;
  deliveriesToday: number;
  deliveriesWeek: number;
  deliveriesMonth: number;
  earningsToday: number;
  earningsWeek: number;
  earningsMonth: number;
  onTimeRate: number;
  successRate: number;
  avgRating: number;
  totalRatings: number;
  streakDays: number;
  badgesEarned: number;
  incentivesThisMonth: number;
  penaltiesThisMonth: number;
  trainingCompleted: number;
  trainingTotal: number;
  docsExpiringSoon: number;
  rank: number;
  status: 'active' | 'idle' | 'offline' | 'on_leave';
}

export interface EarningsBreakdown {
  rider: string;
  hub: string;
  deliveryEarnings: number;
  returnEarnings: number;
  incentives: number;
  penalties: number;
  net: number;
}

function rnd(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.floor(v);
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const HUBS = ['Delhi-Central','Bangalore-Central','Mumbai-Central','Chennai-Hub','Hyderabad-Hub','Kolkata-Central','Pune-Hub','Gurgaon-Hub'];
const REGION_MAP: Record<string,string> = {
  'Delhi-Central':'North','Gurgaon-Hub':'North',
  'Bangalore-Central':'South','Chennai-Hub':'South','Hyderabad-Hub':'South',
  'Kolkata-Central':'East','Mumbai-Central':'West','Pune-Hub':'West',
};

const NAMES = [
  'Arjun Sharma','Priya Patel','Rahul Singh','Neha Gupta','Vikas Yadav',
  'Sunita Joshi','Deepak Kumar','Pooja Mishra','Amit Verma','Kavya Reddy',
  'Sanjay Nair','Divya Mehta','Rohit Tiwari','Anita Bose','Kiran Pillai',
  'Manoj Agarwal','Swati Saxena','Ajay Chauhan','Ritu Bansal','Vijay Raj',
  'Anil Dubey','Meena Singh','Ramesh Yadav','Lata Kumar','Suresh Pillai',
  'Pradeep Sharma','Geetha Nair','Vinod Tiwari','Seema Joshi','Naresh Reddy',
];

export const RIDER_INTELLIGENCE: RiderIntelligenceRecord[] = NAMES.map((name, i) => {
  const hub = pick(HUBS);
  const score = rnd(55, 98);
  return {
    id: `DRV-${String(i + 1).padStart(3, '0')}`,
    name,
    hub,
    region: REGION_MAP[hub] ?? 'North',
    performanceScore: score,
    deliveriesToday: rnd(4, 18),
    deliveriesWeek: rnd(25, 90),
    deliveriesMonth: rnd(90, 380),
    earningsToday: rnd(300, 1500),
    earningsWeek: rnd(2000, 8000),
    earningsMonth: rnd(8000, 32000),
    onTimeRate: rnd(72, 99, 1),
    successRate: rnd(78, 99, 1),
    avgRating: rnd(35, 50, 1) / 10,
    totalRatings: rnd(10, 150),
    streakDays: rnd(0, 30),
    badgesEarned: rnd(1, 12),
    incentivesThisMonth: rnd(200, 2000),
    penaltiesThisMonth: rnd(0, 300),
    trainingCompleted: rnd(2, 6),
    trainingTotal: 6,
    docsExpiringSoon: rnd(0, 2),
    rank: i + 1,
    status: pick(['active','active','active','idle','offline'] as RiderIntelligenceRecord['status'][]),
  };
}).sort((a, b) => b.performanceScore - a.performanceScore).map((r, i) => ({ ...r, rank: i + 1 }));

export function getRiderKPIs() {
  const active = RIDER_INTELLIGENCE.filter(r => r.status === 'active').length;
  const total = RIDER_INTELLIGENCE.length;
  const avgScore = Math.round(RIDER_INTELLIGENCE.reduce((s, r) => s + r.performanceScore, 0) / total);
  const totalEarningsMonth = RIDER_INTELLIGENCE.reduce((s, r) => s + r.earningsMonth, 0);
  const totalIncentivesMonth = RIDER_INTELLIGENCE.reduce((s, r) => s + r.incentivesThisMonth, 0);
  const totalPenaltiesMonth = RIDER_INTELLIGENCE.reduce((s, r) => s + r.penaltiesThisMonth, 0);
  const avgRating = parseFloat((RIDER_INTELLIGENCE.reduce((s, r) => s + r.avgRating, 0) / total).toFixed(1));
  const docsAlert = RIDER_INTELLIGENCE.filter(r => r.docsExpiringSoon > 0).length;
  const trainingAlert = RIDER_INTELLIGENCE.filter(r => r.trainingCompleted < r.trainingTotal).length;
  return { active, total, avgScore, totalEarningsMonth, totalIncentivesMonth, totalPenaltiesMonth, avgRating, docsAlert, trainingAlert };
}

export function getScoreDistribution() {
  const bands = [
    { label: '90–100', min: 90, max: 100 },
    { label: '80–89',  min: 80, max: 89 },
    { label: '70–79',  min: 70, max: 79 },
    { label: '60–69',  min: 60, max: 69 },
    { label: '<60',    min: 0,  max: 59 },
  ];
  return bands.map(b => ({
    label: b.label,
    count: RIDER_INTELLIGENCE.filter(r => r.performanceScore >= b.min && r.performanceScore <= b.max).length,
  }));
}

export function getEarningsBreakdownByHub() {
  const map: Record<string, { delivery: number; returns: number; incentives: number; penalties: number }> = {};
  for (const r of RIDER_INTELLIGENCE) {
    if (!map[r.hub]) map[r.hub] = { delivery: 0, returns: 0, incentives: 0, penalties: 0 };
    map[r.hub].delivery += r.earningsMonth * 0.7;
    map[r.hub].returns += r.earningsMonth * 0.1;
    map[r.hub].incentives += r.incentivesThisMonth;
    map[r.hub].penalties += r.penaltiesThisMonth;
  }
  return Object.entries(map).map(([hub, v]) => ({
    hub,
    delivery: Math.round(v.delivery),
    returns: Math.round(v.returns),
    incentives: Math.round(v.incentives),
    penalties: Math.round(v.penalties),
    net: Math.round(v.delivery + v.returns + v.incentives - v.penalties),
  })).sort((a, b) => b.net - a.net);
}

export function getEarningsTrend() {
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(Date.now() - (13 - i) * 86400000);
    return {
      date: `${day.getDate()}/${day.getMonth() + 1}`,
      deliveryEarnings: rnd(180000, 280000),
      incentives: rnd(15000, 45000),
      penalties: rnd(1000, 8000),
    };
  });
}

export function getRatingDistribution() {
  const dist = [5, 4, 3, 2, 1].map(s => ({
    stars: `${s}★`,
    count: RIDER_INTELLIGENCE.filter(r => Math.round(r.avgRating) === s).length,
  }));
  return dist;
}

export function getTopPerformers(n = 10) {
  return RIDER_INTELLIGENCE.slice(0, n);
}

export function getBadgeSummary() {
  const BADGE_NAMES = ['First Mile','Reliable Rider','Century Club','Week Warrior','Perfect Score','Top Earner','Return Champion','Speed Demon','Veteran'];
  return BADGE_NAMES.map(name => ({
    badge: name,
    earned: rnd(5, 28),
  }));
}
