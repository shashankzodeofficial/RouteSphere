/**
 * RouteSphere — Recognition Hub sample data
 * Fully deterministic. Derives live leaderboard rankings from performanceData at runtime.
 */

import type { RiderPerformance } from '../types/performance';

// ============================================================
// BADGE DEFINITIONS
// ============================================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type BadgeCategory = 'delivery' | 'compliance' | 'consistency' | 'achievement' | 'special';

export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criteria: string;
  color: string;      // badge background
  textColor: string;
}

export interface RiderBadge {
  badgeId: string;
  earnedOn: string;
  earnedPeriod: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Delivery Excellence
  { id: 'route_master',   emoji: '🏆', name: 'Route Master',       category: 'delivery',     rarity: 'rare',       color: '#FFFBEB', textColor: '#92400E', criteria: '100% success rate for a full week',             description: 'Every delivery attempted, every delivery completed. A perfect week on the road.' },
  { id: 'speed_demon',    emoji: '⚡', name: 'Speed Demon',         category: 'delivery',     rarity: 'uncommon',   color: '#EFF6FF', textColor: '#1E40AF', criteria: '30+ deliveries in a single day',                description: 'When the route is long and the clock is short — they get it done anyway.' },
  { id: 'sharpshooter',   emoji: '🎯', name: 'Sharpshooter',        category: 'delivery',     rarity: 'rare',       color: '#F5F3FF', textColor: '#5B21B6', criteria: '95%+ first attempt rate for 2 consecutive weeks', description: 'Arrives prepared. Customers are ready. First attempt always counts.' },
  { id: 'volume_king',    emoji: '📦', name: 'Volume King',          category: 'delivery',     rarity: 'uncommon',   color: '#ECFDF5', textColor: '#065F46', criteria: '300+ deliveries in a calendar month',           description: 'Month after month, carrying the load that keeps the hub moving.' },
  // Compliance
  { id: 'pod_perfect',    emoji: '📸', name: 'POD Perfectionist',   category: 'compliance',   rarity: 'uncommon',   color: '#ECFEFF', textColor: '#164E63', criteria: '100% POD compliance for 30 days',               description: 'Every delivery leaves a proof. No dispute left unanswered.' },
  { id: 'cod_guardian',   emoji: '💰', name: 'COD Guardian',         category: 'compliance',   rarity: 'rare',       color: '#F0FDF4', textColor: '#14532D', criteria: 'Zero COD discrepancy for 30 consecutive days',   description: 'Every rupee collected. Every rupee accounted for. No exceptions.' },
  { id: 'gps_sentinel',   emoji: '🛡️', name: 'GPS Sentinel',         category: 'compliance',   rarity: 'rare',       color: '#F0F9FF', textColor: '#0C4A6E', criteria: 'Zero GPS violations for 60 days',               description: 'Always where they should be. The route is transparent, every time.' },
  { id: 'rule_follower',  emoji: '✅', name: 'Rule Follower',         category: 'compliance',   rarity: 'common',     color: '#FAFAFA', textColor: '#374151', criteria: 'All compliance metrics above 90% for a month',   description: 'Compliance isn\'t a constraint — it\'s a standard they hold themselves to.' },
  // Consistency
  { id: 'streak_7',       emoji: '🔥', name: '7-Day Fire',           category: 'consistency',  rarity: 'common',     color: '#FFF7ED', textColor: '#9A3412', criteria: '7 consecutive days above 80% success rate',     description: 'Seven days. Seven wins. The habit is forming.' },
  { id: 'streak_30',      emoji: '🔥', name: '30-Day Blaze',         category: 'consistency',  rarity: 'rare',       color: '#FFF7ED', textColor: '#7C2D12', criteria: '30 consecutive days above 75% success rate',    description: 'A full month of showing up and delivering. This is who they are.' },
  { id: 'rising_star',    emoji: '📈', name: 'Rising Star',           category: 'consistency',  rarity: 'uncommon',   color: '#FFFBEB', textColor: '#78350F', criteria: 'Score improved by 15+ points in one month',     description: 'They took feedback seriously. The numbers prove it.' },
  { id: 'consistent',     emoji: '🌟', name: 'Steady Hand',           category: 'consistency',  rarity: 'uncommon',   color: '#F5F3FF', textColor: '#4C1D95', criteria: 'Grade B or above for 3 consecutive months',     description: 'Not a flash — a flame. Month after month, they deliver.' },
  // Achievement
  { id: 'elite',          emoji: '💎', name: 'Elite Achiever',        category: 'achievement',  rarity: 'legendary',  color: '#FAF5FF', textColor: '#6B21A8', criteria: 'Reached Grade S (90+ overall score)',           description: 'Less than 15% of riders reach Grade S. This is the top.' },
  { id: 'monthly_winner', emoji: '🥇', name: 'Rider of the Month',    category: 'achievement',  rarity: 'rare',       color: '#FFFBEB', textColor: '#92400E', criteria: 'Highest overall score in a calendar month',     description: 'The month belongs to them. Their name goes on the board.' },
  { id: 'top_3',          emoji: '🥈', name: 'Podium Finish',         category: 'achievement',  rarity: 'uncommon',   color: '#F8FAFC', textColor: '#334155', criteria: 'Top 3 in monthly hub leaderboard',             description: 'Standing on the podium, in sight of the top.' },
  { id: 'most_improved',  emoji: '🎖️', name: 'Most Improved',         category: 'achievement',  rarity: 'uncommon',   color: '#ECFDF5', textColor: '#065F46', criteria: 'Biggest score improvement in a period',         description: 'The hardest wins are the ones you earn from the bottom.' },
  // Special
  { id: 'rookie_star',    emoji: '🌱', name: 'Rookie Star',            category: 'special',      rarity: 'rare',       color: '#F0FDF4', textColor: '#14532D', criteria: 'Grade B+ in their first full month',           description: 'New to the road, old beyond their days. Watch this one.' },
  { id: 'hub_champion',   emoji: '🏅', name: 'Hub Champion',           category: 'special',      rarity: 'rare',       color: '#FEF3C7', textColor: '#78350F', criteria: '#1 in hub for 2+ consecutive months',         description: 'The hub knows their name. And so does every rider in it.' },
  { id: 'hall_of_famer',  emoji: '🌟', name: 'Hall of Famer',          category: 'special',      rarity: 'legendary',  color: '#FAF5FF', textColor: '#6B21A8', criteria: 'Monthly champion — inducted into the Hall of Fame', description: 'Their name is permanent now. The board never forgets.' },
  { id: 'century',        emoji: '💯', name: 'Century Club',           category: 'special',      rarity: 'legendary',  color: '#FFF7ED', textColor: '#7C2D12', criteria: '100+ deliveries in a single week',             description: 'A hundred deliveries in seven days. This week belongs to history.' },
];

// ============================================================
// BADGE ASSIGNMENTS — deterministic per rider name
// ============================================================

export interface RiderRecognition {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  badges: RiderBadge[];
  totalBadges: number;
  points: number;     // recognition points (badges × rarity weight)
  streakDays: number;
  monthlyRank: number;
  joinDate: string;
}

const RARITY_WEIGHT: Record<BadgeRarity, number> = { common:10, uncommon:25, rare:50, legendary:100 };

function makeBadge(id: string, on: string, period: string): RiderBadge {
  return { badgeId: id, earnedOn: on, earnedPeriod: period };
}

export const RIDER_RECOGNITIONS: Record<string, RiderBadge[]> = {
  'Arjun Sharma': [
    makeBadge('elite',         '2026-06-01', 'June 2026'),
    makeBadge('monthly_winner','2026-06-01', 'June 2026'),
    makeBadge('hall_of_famer', '2026-06-01', 'June 2026'),
    makeBadge('route_master',  '2026-05-28', 'Week 21 2026'),
    makeBadge('streak_30',     '2026-05-31', 'May 2026'),
    makeBadge('pod_perfect',   '2026-05-31', 'May 2026'),
    makeBadge('cod_guardian',  '2026-05-31', 'May 2026'),
    makeBadge('hub_champion',  '2026-06-01', 'May–Jun 2026'),
    makeBadge('volume_king',   '2026-05-31', 'May 2026'),
    makeBadge('consistent',    '2026-06-01', 'Q2 2026'),
    makeBadge('gps_sentinel',  '2026-06-01', 'Apr–Jun 2026'),
  ],
  'Priya Patel': [
    makeBadge('elite',         '2026-06-01', 'June 2026'),
    makeBadge('route_master',  '2026-06-14', 'Week 23 2026'),
    makeBadge('streak_30',     '2026-05-31', 'May 2026'),
    makeBadge('pod_perfect',   '2026-05-31', 'May 2026'),
    makeBadge('top_3',         '2026-06-01', 'June 2026'),
    makeBadge('consistent',    '2026-06-01', 'Q2 2026'),
    makeBadge('sharpshooter',  '2026-06-14', 'Jun 2026'),
    makeBadge('volume_king',   '2026-05-31', 'May 2026'),
  ],
  'Rahul Singh': [
    makeBadge('elite',         '2026-06-01', 'June 2026'),
    makeBadge('top_3',         '2026-06-01', 'June 2026'),
    makeBadge('cod_guardian',  '2026-05-31', 'May 2026'),
    makeBadge('speed_demon',   '2026-06-10', 'June 2026'),
    makeBadge('streak_30',     '2026-06-01', 'June 2026'),
    makeBadge('hub_champion',  '2026-06-01', 'June 2026'),
    makeBadge('consistent',    '2026-04-01', 'Q1 2026'),
    makeBadge('century',       '2026-06-07', 'W22 2026'),
  ],
  'Neha Gupta': [
    makeBadge('sharpshooter',  '2026-06-14', 'Jun 2026'),
    makeBadge('pod_perfect',   '2026-05-31', 'May 2026'),
    makeBadge('streak_7',      '2026-06-18', 'Jun 2026'),
    makeBadge('rising_star',   '2026-06-01', 'June 2026'),
    makeBadge('top_3',         '2026-06-01', 'June 2026'),
    makeBadge('rule_follower', '2026-06-01', 'June 2026'),
  ],
  'Vikas Yadav': [
    makeBadge('speed_demon',   '2026-06-15', 'Jun 2026'),
    makeBadge('volume_king',   '2026-06-01', 'June 2026'),
    makeBadge('streak_7',      '2026-06-18', 'Jun 2026'),
    makeBadge('rule_follower', '2026-06-01', 'June 2026'),
  ],
  'Sunita Joshi': [
    makeBadge('pod_perfect',   '2026-05-31', 'May 2026'),
    makeBadge('cod_guardian',  '2026-05-31', 'May 2026'),
    makeBadge('rule_follower', '2026-06-01', 'June 2026'),
    makeBadge('streak_7',      '2026-06-14', 'Jun 2026'),
  ],
  'Deepak Kumar': [
    makeBadge('speed_demon',   '2026-06-12', 'Jun 2026'),
    makeBadge('volume_king',   '2026-05-31', 'May 2026'),
    makeBadge('streak_7',      '2026-06-16', 'Jun 2026'),
    makeBadge('rule_follower', '2026-05-01', 'May 2026'),
  ],
  'Pooja Mishra': [
    makeBadge('sharpshooter',  '2026-06-07', 'Jun 2026'),
    makeBadge('streak_7',      '2026-06-18', 'Jun 2026'),
    makeBadge('rule_follower', '2026-06-01', 'June 2026'),
  ],
  'Amit Verma': [
    makeBadge('streak_7',      '2026-06-15', 'Jun 2026'),
    makeBadge('rule_follower', '2026-06-01', 'Jun 2026'),
  ],
  'Kavya Reddy': [
    makeBadge('pod_perfect',   '2026-06-01', 'Jun 2026'),
    makeBadge('streak_7',      '2026-06-12', 'Jun 2026'),
    makeBadge('rookie_star',   '2026-05-31', 'May 2026'),
  ],
  'Rohit Tiwari': [
    makeBadge('rising_star',   '2026-06-01', 'Jun 2026'),
    makeBadge('streak_7',      '2026-06-10', 'Jun 2026'),
  ],
  'Sanjay Nair': [
    makeBadge('most_improved', '2026-06-01', 'Jun 2026'),
    makeBadge('streak_7',      '2026-06-18', 'Jun 2026'),
  ],
};

function calcPoints(badges: RiderBadge[]): number {
  return badges.reduce((s, b) => {
    const def = BADGE_DEFINITIONS.find(d => d.id === b.badgeId);
    return s + (def ? RARITY_WEIGHT[def.rarity] : 0);
  }, 0);
}

// ============================================================
// DAILY RECOGNITION
// ============================================================

export interface DailyHero {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  awardTitle: string;
  awardEmoji: string;
  awardReason: string;
  metricValue: string;
  score: number;
  grade: string;
}

export const DAILY_HEROES: DailyHero[] = [
  {
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    awardTitle: 'Highest Score Today', awardEmoji: '🏆',
    awardReason: 'Delivered 24 out of 24 assigned packages with 100% success rate',
    metricValue: '94.2 pts', score: 94.2, grade: 'S',
  },
  {
    riderId: 'a1000001-0000-0000-0000-000000000003',
    riderName: 'Rahul Singh', hub: 'Gurgaon-Hub', region: 'North',
    awardTitle: 'Most Deliveries Today', awardEmoji: '⚡',
    awardReason: 'Completed 31 deliveries — highest single-day volume this week',
    metricValue: '31 deliveries', score: 91.7, grade: 'S',
  },
  {
    riderId: 'a1000001-0000-0000-0000-000000000002',
    riderName: 'Priya Patel', hub: 'Delhi-North', region: 'North',
    awardTitle: 'Perfect POD Run', awardEmoji: '📸',
    awardReason: '28/28 deliveries with complete POD — photo + signature captured',
    metricValue: '100% POD', score: 92.8, grade: 'S',
  },
  {
    riderId: 'a1000001-0000-0000-0000-000000000004',
    riderName: 'Neha Gupta', hub: 'Noida-Hub', region: 'North',
    awardTitle: 'First Attempt Champion', awardEmoji: '🎯',
    awardReason: '96% first attempt success — only 1 re-attempt needed today',
    metricValue: '96% FAR', score: 84.3, grade: 'A',
  },
];

// ============================================================
// WEEKLY RECOGNITION
// ============================================================

export interface WeeklyAward {
  category: string;
  emoji: string;
  title: string;
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  value: string;
  valueLabel: string;
  description: string;
  score: number;
  grade: string;
}

export const WEEKLY_AWARDS: WeeklyAward[] = [
  {
    category: 'top_score', emoji: '🥇', title: 'Weekly #1 — Rider of the Week',
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    value: '94.2', valueLabel: 'Overall Score', score: 94.2, grade: 'S',
    description: 'Topped the leaderboard for the second consecutive week. 148 deliveries, zero discrepancies.',
  },
  {
    category: 'second', emoji: '🥈', title: 'Weekly #2',
    riderId: 'a1000001-0000-0000-0000-000000000002',
    riderName: 'Priya Patel', hub: 'Delhi-North', region: 'North',
    value: '92.8', valueLabel: 'Overall Score', score: 92.8, grade: 'S',
    description: 'Perfect POD compliance all 5 days. 142 deliveries with 97.2% success rate.',
  },
  {
    category: 'third', emoji: '🥉', title: 'Weekly #3',
    riderId: 'a1000001-0000-0000-0000-000000000003',
    riderName: 'Rahul Singh', hub: 'Gurgaon-Hub', region: 'North',
    value: '91.7', valueLabel: 'Overall Score', score: 91.7, grade: 'S',
    description: 'Highest single-day volume (31) and 100-delivery week. COD perfect all week.',
  },
  {
    category: 'most_improved', emoji: '📈', title: 'Most Improved This Week',
    riderId: 'a1000001-0000-0000-0000-000000000012',
    riderName: 'Sanjay Nair', hub: 'Delhi-Central', region: 'North',
    value: '+8.3', valueLabel: 'pts vs last week', score: 75.4, grade: 'B',
    description: 'Implemented pre-call habit — success rate jumped from 68% to 81% in one week.',
  },
  {
    category: 'cod_star', emoji: '💰', title: 'COD Star of the Week',
    riderId: 'a1000001-0000-0000-0000-000000000006',
    riderName: 'Sunita Joshi', hub: 'Chennai-Hub', region: 'South',
    value: '₹1,24,850', valueLabel: 'Collected — 100% accuracy', score: 82.1, grade: 'A',
    description: 'Week 4 of zero COD discrepancy. Every rupee collected and accounted for.',
  },
  {
    category: 'pod_champ', emoji: '📸', title: 'POD Champion of the Week',
    riderId: 'a1000001-0000-0000-0000-000000000004',
    riderName: 'Neha Gupta', hub: 'Noida-Hub', region: 'North',
    value: '100%', valueLabel: 'POD Compliance', score: 84.3, grade: 'A',
    description: 'All 127 deliveries this week have photo + signature POD. Setting the benchmark.',
  },
];

// ============================================================
// MONTHLY RECOGNITION
// ============================================================

export interface MonthlyAward {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  score: number;
  grade: string;
  stats: Array<{ label: string; value: string }>;
  quote: string;
  badgeEarned?: string;
}

export const MONTHLY_AWARDS: MonthlyAward[] = [
  {
    id: 'rider_of_month', emoji: '🏆', title: 'Rider of the Month',
    subtitle: 'June 2026 — RouteSphere North Region',
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    score: 94.2, grade: 'S',
    stats: [
      { label: 'Deliveries', value: '412' }, { label: 'Success Rate', value: '95.3%' },
      { label: 'On-Time', value: '91.2%' }, { label: 'POD', value: '99.1%' },
      { label: 'COD Accuracy', value: '100%' }, { label: 'GPS Score', value: '100' },
    ],
    quote: 'Arjun has set the standard for what Grade S looks like in our region. His pre-call discipline and route adherence are exemplary.',
    badgeEarned: 'monthly_winner',
  },
  {
    id: 'most_improved_month', emoji: '📈', title: 'Most Improved — June 2026',
    subtitle: 'Biggest performance turnaround of the month',
    riderId: 'a1000001-0000-0000-0000-000000000013',
    riderName: 'Rohit Tiwari', hub: 'Gurgaon-Hub', region: 'North',
    score: 72.4, grade: 'B',
    stats: [
      { label: 'Previous Score', value: '57.1' }, { label: 'Current Score', value: '72.4' },
      { label: 'Score Jump', value: '+15.3 pts' }, { label: 'Grade', value: 'D → B' },
      { label: 'Success Rate', value: '76.2%' }, { label: 'Sessions', value: '3 coaching' },
    ],
    quote: 'Rohit turned things around completely after committing to the pre-call habit. Three coaching sessions, three weeks of consistent improvement.',
    badgeEarned: 'rising_star',
  },
  {
    id: 'rookie_month', emoji: '🌱', title: 'Rookie of the Month',
    subtitle: 'Best performance by a rider in their first 3 months',
    riderId: 'a1000001-0000-0000-0000-000000000010',
    riderName: 'Kavya Reddy', hub: 'Chennai-Hub', region: 'South',
    score: 79.8, grade: 'B',
    stats: [
      { label: 'Month on Road', value: '2nd' }, { label: 'Deliveries', value: '318' },
      { label: 'Success Rate', value: '82.1%' }, { label: 'POD', value: '100%' },
      { label: 'First Attempt', value: '74.3%' }, { label: 'GPS', value: '100' },
    ],
    quote: 'Kavya joined 6 weeks ago and immediately impressed with 100% POD from day one. A natural for this role.',
    badgeEarned: 'rookie_star',
  },
  {
    id: 'hub_mvp', emoji: '🏅', title: 'Hub MVP — Bangalore-Central',
    subtitle: 'Most valuable rider — hub performance anchor',
    riderId: 'a1000001-0000-0000-0000-000000000009',
    riderName: 'Amit Verma', hub: 'Bangalore-Central', region: 'South',
    score: 77.6, grade: 'B',
    stats: [
      { label: 'Hub Rank', value: '#1' }, { label: 'Deliveries', value: '364' },
      { label: 'Consecutive Rank', value: '2 months' }, { label: 'Mentored', value: '2 riders' },
      { label: 'Success Rate', value: '80.3%' }, { label: 'Attendance', value: '100%' },
    ],
    quote: 'Amit has held the top spot in Bangalore for two months and has informally mentored two new riders. A true hub anchor.',
    badgeEarned: 'hub_champion',
  },
];

// ============================================================
// HALL OF FAME — Historical monthly champions
// ============================================================

export interface HallOfFameEntry {
  period: string;
  periodLabel: string;
  type: 'monthly' | 'quarterly';
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  score: number;
  grade: string;
  deliveries: number;
  successRate: number;
  inductedOn: string;
  highlight: string;
}

export const HALL_OF_FAME: HallOfFameEntry[] = [
  {
    period: '2026-06', periodLabel: 'June 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    score: 94.2, grade: 'S', deliveries: 412, successRate: 95.3,
    inductedOn: '2026-06-20',
    highlight: 'Back-to-back month wins. 11 badges. Zero GPS violations all year.',
  },
  {
    period: '2026-05', periodLabel: 'May 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    score: 91.8, grade: 'S', deliveries: 398, successRate: 94.1,
    inductedOn: '2026-05-31',
    highlight: 'First Grade S rider in Delhi-Central history. Set hub records for POD and COD.',
  },
  {
    period: '2026-04', periodLabel: 'April 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000002',
    riderName: 'Priya Patel', hub: 'Delhi-North', region: 'North',
    score: 89.4, grade: 'A', deliveries: 376, successRate: 92.7,
    inductedOn: '2026-04-30',
    highlight: '30 days, 30 perfect POD days. Set the benchmark for compliance that the whole hub now follows.',
  },
  {
    period: '2026-03', periodLabel: 'March 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000003',
    riderName: 'Rahul Singh', hub: 'Gurgaon-Hub', region: 'North',
    score: 88.2, grade: 'A', deliveries: 421, successRate: 91.8,
    inductedOn: '2026-03-31',
    highlight: 'Highest single-month delivery volume: 421. First rider to clear 400 deliveries in the North region.',
  },
  {
    period: '2026-Q1', periodLabel: 'Q1 2026 Champion', type: 'quarterly',
    riderId: 'a1000001-0000-0000-0000-000000000001',
    riderName: 'Arjun Sharma', hub: 'Delhi-Central', region: 'North',
    score: 90.6, grade: 'S', deliveries: 1187, successRate: 93.8,
    inductedOn: '2026-04-01',
    highlight: 'Q1 2026 Champion — 1,187 deliveries across 3 months. Average score 90.6 across all quarters.',
  },
  {
    period: '2026-02', periodLabel: 'February 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000009',
    riderName: 'Amit Verma', hub: 'Bangalore-Central', region: 'South',
    score: 82.1, grade: 'A', deliveries: 334, successRate: 87.3,
    inductedOn: '2026-02-28',
    highlight: 'First South region rider to win Rider of the Month. Put Bangalore-Central on the map.',
  },
  {
    period: '2026-01', periodLabel: 'January 2026', type: 'monthly',
    riderId: 'a1000001-0000-0000-0000-000000000007',
    riderName: 'Deepak Kumar', hub: 'Hyderabad-Hub', region: 'South',
    score: 81.7, grade: 'A', deliveries: 389, successRate: 88.9,
    inductedOn: '2026-01-31',
    highlight: 'Highest productivity score ever recorded: 97.2. Averaged 2.9 deliveries per active hour in January.',
  },
];

// ============================================================
// HELPERS for live data integration
// ============================================================

export function getRiderBadges(name: string): RiderBadge[] {
  return RIDER_RECOGNITIONS[name] ?? [];
}

export function getRiderPoints(name: string): number {
  return calcPoints(getRiderBadges(name));
}

export function buildLeaderboard(data: RiderPerformance[]) {
  return [...data]
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((r, idx) => ({
      ...r,
      rank: idx + 1,
      badges: getRiderBadges(r.riderName),
      recognitionPoints: getRiderPoints(r.riderName),
    }));
}

export function getTopBadgeHolders(data: RiderPerformance[]) {
  return data
    .map(r => ({ name: r.riderName, hub: r.hub, points: getRiderPoints(r.riderName), badges: getRiderBadges(r.riderName), score: r.overallScore, grade: r.grade }))
    .filter(r => r.badges.length > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}

export function getBadgeHolders(badgeId: string, data: RiderPerformance[]): string[] {
  return data
    .filter(r => getRiderBadges(r.riderName).some(b => b.badgeId === badgeId))
    .map(r => r.riderName);
}
