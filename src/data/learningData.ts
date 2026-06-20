/**
 * RouteSphere — Learning Center data
 * Fully deterministic. Completion rates tied to rider performance tier.
 */

// Tier 0=S, 1=A, 2=B, 3=C, 4=D
const RIDERS = [
  { id:'R01', name:'Arjun Sharma',  hub:'Delhi-Central',     region:'North', tier:0 },
  { id:'R02', name:'Priya Patel',   hub:'Delhi-North',       region:'North', tier:0 },
  { id:'R03', name:'Rahul Singh',   hub:'Gurgaon-Hub',       region:'North', tier:0 },
  { id:'R04', name:'Neha Gupta',    hub:'Noida-Hub',         region:'North', tier:1 },
  { id:'R05', name:'Vikas Yadav',   hub:'Bangalore-Central', region:'South', tier:1 },
  { id:'R06', name:'Sunita Joshi',  hub:'Chennai-Hub',       region:'South', tier:1 },
  { id:'R07', name:'Deepak Kumar',  hub:'Hyderabad-Hub',     region:'South', tier:1 },
  { id:'R08', name:'Pooja Mishra',  hub:'Kolkata-Central',   region:'East',  tier:1 },
  { id:'R09', name:'Amit Verma',    hub:'Mumbai-Central',    region:'West',  tier:2 },
  { id:'R10', name:'Kavya Reddy',   hub:'Pune-Hub',          region:'West',  tier:2 },
  { id:'R11', name:'Sanjay Nair',   hub:'Delhi-Central',     region:'North', tier:2 },
  { id:'R12', name:'Divya Mehta',   hub:'Delhi-North',       region:'North', tier:2 },
  { id:'R13', name:'Rohit Tiwari',  hub:'Gurgaon-Hub',       region:'North', tier:2 },
  { id:'R14', name:'Anita Bose',    hub:'Noida-Hub',         region:'North', tier:2 },
  { id:'R15', name:'Kiran Pillai',  hub:'Bangalore-Central', region:'South', tier:3 },
  { id:'R16', name:'Manoj Agarwal', hub:'Chennai-Hub',       region:'South', tier:3 },
  { id:'R17', name:'Swati Saxena',  hub:'Hyderabad-Hub',     region:'South', tier:3 },
  { id:'R18', name:'Ajay Chauhan',  hub:'Kolkata-Central',   region:'East',  tier:4 },
  { id:'R19', name:'Ritu Bansal',   hub:'Mumbai-Central',    region:'West',  tier:4 },
  { id:'R20', name:'Vijay Raj',     hub:'Pune-Hub',          region:'West',  tier:4 },
];

export type CourseCategory = 'safety' | 'compliance' | 'delivery' | 'app' | 'customer' | 'new_rider';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'failed';
export type ModuleType = 'video' | 'quiz' | 'document' | 'practical';

export interface CourseModule {
  id: string;
  title: string;
  type: ModuleType;
  durationMinutes: number;
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  required: boolean;
  requiredByDate?: string;
  description: string;
  passingScore: number;
  modules: CourseModule[];
}

export interface RiderCourseProgress {
  riderId: string;
  riderName: string;
  hub: string;
  courseId: string;
  status: CourseStatus;
  progressPct: number;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  certificateId?: string;
  attempts: number;
}

export interface Certificate {
  id: string;
  riderId: string;
  riderName: string;
  hub: string;
  courseId: string;
  courseTitle: string;
  issuedOn: string;
  expiresOn?: string;
  score: number;
}

export interface RiderLearningProfile {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  totalCourses: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionPct: number;
  totalMinutesLearned: number;
  certificates: number;
  lastActivityDate: string;
  progress: RiderCourseProgress[];
}

// ============================================================
// COURSE CATALOG — 12 courses
// ============================================================

export const COURSES: Course[] = [
  {
    id: 'C001', title: 'Safe Riding Fundamentals',
    category: 'safety', level: 'beginner', durationMinutes: 60,
    required: true, requiredByDate: '2026-06-30',
    description: 'Essential road safety rules, helmet usage, vehicle inspection, and accident prevention for delivery riders.',
    passingScore: 80,
    modules: [
      { id:'C001-M1', title:'Road Safety Rules', type:'video', durationMinutes:20 },
      { id:'C001-M2', title:'Vehicle Pre-Trip Inspection', type:'video', durationMinutes:15 },
      { id:'C001-M3', title:'Accident Prevention', type:'document', durationMinutes:10 },
      { id:'C001-M4', title:'Safety Assessment', type:'quiz', durationMinutes:15 },
    ],
  },
  {
    id: 'C002', title: 'RouteSphere Driver App — Complete Guide',
    category: 'app', level: 'beginner', durationMinutes: 45,
    required: true, requiredByDate: '2026-06-15',
    description: 'Master every feature of the RouteSphere Driver app — route navigation, POD capture, OTP delivery, exceptions, and EOD reconciliation.',
    passingScore: 75,
    modules: [
      { id:'C002-M1', title:'Navigation & Route Following', type:'video', durationMinutes:12 },
      { id:'C002-M2', title:'POD Photo & Signature Capture', type:'video', durationMinutes:10 },
      { id:'C002-M3', title:'OTP Delivery Workflow', type:'video', durationMinutes:8 },
      { id:'C002-M4', title:'Exception Management', type:'video', durationMinutes:8 },
      { id:'C002-M5', title:'App Proficiency Quiz', type:'quiz', durationMinutes:7 },
    ],
  },
  {
    id: 'C003', title: 'COD Collection & Reconciliation',
    category: 'compliance', level: 'beginner', durationMinutes: 40,
    required: true, requiredByDate: '2026-06-20',
    description: 'Cash collection protocol, change management, fraud prevention, and end-of-day reconciliation procedures.',
    passingScore: 85,
    modules: [
      { id:'C003-M1', title:'COD Collection Protocol', type:'video', durationMinutes:12 },
      { id:'C003-M2', title:'Change Management', type:'video', durationMinutes:10 },
      { id:'C003-M3', title:'EOD Reconciliation Steps', type:'practical', durationMinutes:12 },
      { id:'C003-M4', title:'COD Compliance Quiz', type:'quiz', durationMinutes:6 },
    ],
  },
  {
    id: 'C004', title: 'Customer Communication Excellence',
    category: 'customer', level: 'beginner', durationMinutes: 35,
    required: false,
    description: 'Pre-delivery calls, handling customer complaints, escalation protocol, and building positive customer experiences.',
    passingScore: 70,
    modules: [
      { id:'C004-M1', title:'Pre-Call Best Practices', type:'video', durationMinutes:12 },
      { id:'C004-M2', title:'Handling Difficult Situations', type:'video', durationMinutes:13 },
      { id:'C004-M3', title:'Communication Quiz', type:'quiz', durationMinutes:10 },
    ],
  },
  {
    id: 'C005', title: 'Route Optimisation Techniques',
    category: 'delivery', level: 'intermediate', durationMinutes: 50,
    required: false,
    description: 'Advanced route planning, traffic-aware scheduling, stop sequencing, and productivity maximisation.',
    passingScore: 75,
    modules: [
      { id:'C005-M1', title:'Route Planning Principles', type:'video', durationMinutes:18 },
      { id:'C005-M2', title:'Traffic Management', type:'document', durationMinutes:12 },
      { id:'C005-M3', title:'Productivity Benchmarks', type:'video', durationMinutes:12 },
      { id:'C005-M4', title:'Route Optimisation Quiz', type:'quiz', durationMinutes:8 },
    ],
  },
  {
    id: 'C006', title: 'GPS Compliance & Device Usage',
    category: 'compliance', level: 'beginner', durationMinutes: 30,
    required: true, requiredByDate: '2026-07-01',
    description: 'GPS policy, prohibited apps (mock location), geofence compliance, and device care during delivery.',
    passingScore: 90,
    modules: [
      { id:'C006-M1', title:'GPS Policy & Rules', type:'video', durationMinutes:10 },
      { id:'C006-M2', title:'Prohibited Apps & Consequences', type:'document', durationMinutes:8 },
      { id:'C006-M3', title:'Device Care Guide', type:'document', durationMinutes:5 },
      { id:'C006-M4', title:'GPS Compliance Quiz', type:'quiz', durationMinutes:7 },
    ],
  },
  {
    id: 'C007', title: 'High-Rise & Apartment Delivery Tactics',
    category: 'delivery', level: 'intermediate', durationMinutes: 40,
    required: false,
    description: 'Strategies for apartment complexes, guard protocols, intercom systems, and reducing failed attempts in dense residential areas.',
    passingScore: 70,
    modules: [
      { id:'C007-M1', title:'Apartment Complex Navigation', type:'video', durationMinutes:15 },
      { id:'C007-M2', title:'Security & Guard Protocols', type:'video', durationMinutes:12 },
      { id:'C007-M3', title:'Reducing First-Attempt Failures', type:'practical', durationMinutes:13 },
    ],
  },
  {
    id: 'C008', title: 'Heat & Monsoon Riding Safety',
    category: 'safety', level: 'beginner', durationMinutes: 25,
    required: false,
    description: 'Riding safely in extreme Indian weather — summer heat management, monsoon visibility, waterlogged roads, and health protocols.',
    passingScore: 70,
    modules: [
      { id:'C008-M1', title:'Heat Management for Riders', type:'video', durationMinutes:10 },
      { id:'C008-M2', title:'Monsoon Riding Guidelines', type:'video', durationMinutes:10 },
      { id:'C008-M3', title:'Weather Safety Quiz', type:'quiz', durationMinutes:5 },
    ],
  },
  {
    id: 'C009', title: 'Handling Exceptions & Re-Deliveries',
    category: 'delivery', level: 'intermediate', durationMinutes: 35,
    required: false,
    description: 'Exception categorisation, documentation, return protocol, and maximising first-attempt conversion.',
    passingScore: 75,
    modules: [
      { id:'C009-M1', title:'Exception Types & When to Use', type:'video', durationMinutes:12 },
      { id:'C009-M2', title:'Documentation Requirements', type:'video', durationMinutes:10 },
      { id:'C009-M3', title:'Re-Delivery Scheduling', type:'practical', durationMinutes:13 },
    ],
  },
  {
    id: 'C010', title: 'Advanced POD Compliance',
    category: 'compliance', level: 'advanced', durationMinutes: 45,
    required: false,
    description: 'Photo quality standards, signature pad usage, handling POD disputes, and edge cases in POD collection.',
    passingScore: 85,
    modules: [
      { id:'C010-M1', title:'POD Photo Standards', type:'video', durationMinutes:15 },
      { id:'C010-M2', title:'Signature Collection', type:'video', durationMinutes:10 },
      { id:'C010-M3', title:'Dispute Prevention', type:'document', durationMinutes:10 },
      { id:'C010-M4', title:'POD Assessment', type:'quiz', durationMinutes:10 },
    ],
  },
  {
    id: 'C011', title: 'New Rider Orientation',
    category: 'new_rider', level: 'beginner', durationMinutes: 90,
    required: false,
    description: 'Complete onboarding: RouteSphere policies, hub procedures, safety basics, app setup, and first-week expectations.',
    passingScore: 70,
    modules: [
      { id:'C011-M1', title:'Welcome to RouteSphere', type:'video', durationMinutes:15 },
      { id:'C011-M2', title:'Hub Procedures & Rules', type:'document', durationMinutes:20 },
      { id:'C011-M3', title:'App Setup & First Login', type:'practical', durationMinutes:25 },
      { id:'C011-M4', title:'First Week Expectations', type:'video', durationMinutes:20 },
      { id:'C011-M5', title:'Orientation Quiz', type:'quiz', durationMinutes:10 },
    ],
  },
  {
    id: 'C012', title: 'Building Customer Loyalty',
    category: 'customer', level: 'advanced', durationMinutes: 55,
    required: false,
    description: 'Advanced customer experience — creating delight moments, handling escalations, NPS impact of delivery quality.',
    passingScore: 75,
    modules: [
      { id:'C012-M1', title:'The Last-Mile Experience', type:'video', durationMinutes:15 },
      { id:'C012-M2', title:'Creating Delight Moments', type:'video', durationMinutes:15 },
      { id:'C012-M3', title:'Handling Escalations', type:'video', durationMinutes:15 },
      { id:'C012-M4', title:'Customer Loyalty Quiz', type:'quiz', durationMinutes:10 },
    ],
  },
];

// ============================================================
// COMPLETION DATA — deterministic per rider tier
// ============================================================

// For each tier, which courses are completed (by index into COURSES)
const COMPLETED_BY_TIER: Record<number, number[]> = {
  0: [0,1,2,3,4,5,6,7,8,9,10,11],           // S: all 12
  1: [0,1,2,3,4,5,7,8,10],                   // A: 9
  2: [0,1,2,5,10,7],                          // B: 6
  3: [0,1,10],                                // C: 3
  4: [10],                                    // D: 1 (only orientation)
};

const IN_PROGRESS_BY_TIER: Record<number, number[]> = {
  0: [],
  1: [6,11],
  2: [3,4,9],
  3: [5,1],
  4: [0,5],
};

const SCORES_BY_TIER: Record<number, number[]> = {
  0: [96,95,98,93,91,97,89,90,88,92,94,88],
  1: [88,90,92,85,87,86,0,84,88,0,83,0],
  2: [82,84,86,0,0,80,0,79,0,0,80,0],
  3: [75,0,78,0,0,0,0,0,0,0,72,0],
  4: [0,0,0,0,0,0,0,0,0,0,68,0],
};

const COMPLETION_DATES = [
  '2026-05-05','2026-04-20','2026-03-10','2026-05-15','2026-04-08',
  '2026-06-01','2026-05-20','2026-04-25','2026-03-18','2026-06-05',
  '2026-03-01','2026-05-28',
];

function buildProgress(rider: typeof RIDERS[0]): RiderCourseProgress[] {
  const completedIds = new Set(COMPLETED_BY_TIER[rider.tier]);
  const inProgressIds = new Set(IN_PROGRESS_BY_TIER[rider.tier]);
  const scores = SCORES_BY_TIER[rider.tier];

  return COURSES.map((course, idx) => {
    const completed = completedIds.has(idx);
    const inProgress = !completed && inProgressIds.has(idx);
    const required = course.required;
    const score = scores[idx] ?? 0;

    let status: CourseStatus = 'not_started';
    if (completed) status = 'completed';
    else if (inProgress) status = 'in_progress';
    else if (required && course.requiredByDate && new Date(course.requiredByDate) < new Date('2026-06-20')) {
      status = rider.tier >= 3 ? 'overdue' : 'not_started';
    }

    const progressPct = completed ? 100 : inProgress ? [65, 40, 80, 30, 50][idx % 5] : 0;
    const certId = completed && score >= course.passingScore ? `CERT-${rider.id}-${course.id}` : undefined;

    return {
      riderId: rider.id,
      riderName: rider.name,
      hub: rider.hub,
      courseId: course.id,
      status,
      progressPct,
      startedAt: completed || inProgress ? '2026-04-01' : undefined,
      completedAt: completed ? COMPLETION_DATES[idx % COMPLETION_DATES.length] : undefined,
      score: completed ? score : undefined,
      certificateId: certId,
      attempts: completed && score < course.passingScore ? 2 : 1,
    };
  });
}

function buildProfile(rider: typeof RIDERS[0]): RiderLearningProfile {
  const progress = buildProgress(rider);
  const completed = progress.filter(p => p.status === 'completed').length;
  const inProgress = progress.filter(p => p.status === 'in_progress').length;
  const overdue = progress.filter(p => p.status === 'overdue').length;
  const totalMinutes = progress
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + (COURSES.find(c => c.id === p.courseId)?.durationMinutes ?? 0), 0);
  const certs = progress.filter(p => p.certificateId).length;

  return {
    riderId: rider.id,
    riderName: rider.name,
    hub: rider.hub,
    region: rider.region,
    totalCourses: COURSES.length,
    completed,
    inProgress,
    overdue,
    completionPct: Math.round((completed / COURSES.length) * 100),
    totalMinutesLearned: totalMinutes,
    certificates: certs,
    lastActivityDate: completed > 0 ? '2026-06-18' : inProgress > 0 ? '2026-06-15' : '2026-05-01',
    progress,
  };
}

export const RIDER_LEARNING_PROFILES: RiderLearningProfile[] = RIDERS.map(buildProfile);

export const ALL_CERTIFICATES: Certificate[] = RIDER_LEARNING_PROFILES.flatMap(profile =>
  profile.progress
    .filter(p => p.certificateId)
    .map(p => {
      const course = COURSES.find(c => c.id === p.courseId)!;
      return {
        id: p.certificateId!,
        riderId: p.riderId,
        riderName: p.riderName,
        hub: p.hub,
        courseId: p.courseId,
        courseTitle: course.title,
        issuedOn: p.completedAt!,
        expiresOn: course.category === 'safety' ? '2027-06-01' : undefined,
        score: p.score!,
      };
    })
);

export function getHubSummary() {
  const byHub: Record<string, { hub: string; total: number; completed: number; overdue: number }> = {};
  RIDER_LEARNING_PROFILES.forEach(p => {
    if (!byHub[p.hub]) byHub[p.hub] = { hub: p.hub, total: 0, completed: 0, overdue: 0 };
    byHub[p.hub].total += p.totalCourses;
    byHub[p.hub].completed += p.completed;
    byHub[p.hub].overdue += p.overdue;
  });
  return Object.values(byHub).map(h => ({ ...h, completionPct: Math.round(h.completed/h.total*100) }));
}

export const CATEGORY_COLORS: Record<CourseCategory, { bg: string; text: string; border: string }> = {
  safety:     { bg:'#FEF2F2', text:'#DC2626', border:'#FECACA' },
  compliance: { bg:'#FFFBEB', text:'#D97706', border:'#FDE68A' },
  delivery:   { bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE' },
  app:        { bg:'#F5F3FF', text:'#7C3AED', border:'#DDD6FE' },
  customer:   { bg:'#ECFDF5', text:'#059669', border:'#A7F3D0' },
  new_rider:  { bg:'#F0F9FF', text:'#0891B2', border:'#BAE6FD' },
};

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  safety:'Safety', compliance:'Compliance', delivery:'Delivery', app:'App Usage', customer:'Customer', new_rider:'Onboarding',
};
