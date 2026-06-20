/**
 * RouteSphere — Coaching Center sample data
 * Fully deterministic — no Math.random() at module level.
 * Riders sourced from performanceData and sample_data.sql UUIDs.
 */

import type {
  CoachingSession, ImprovementPlan, CoachingRiderSummary, CoachingActionItem,
} from '../types/coaching';

// ============================================================
// ACTION ITEMS (re-used across sessions)
// ============================================================

const makeAction = (
  id: string, sessionId: string, riderId: string, riderName: string,
  title: string, description: string,
  category: CoachingActionItem['category'],
  priority: CoachingActionItem['priority'],
  dueDate: string, status: CoachingActionItem['status'],
  completedNote?: string,
): CoachingActionItem => ({
  id, sessionId, riderId, riderName, title, description,
  category, priority, dueDate, status,
  ...(completedNote ? { completedAt: '2026-06-18T17:00:00Z', completedNote } : {}),
});

// ============================================================
// SESSIONS — Ajay Chauhan (at risk, D grade, Kolkata-Central)
// ============================================================

const ajayId  = 'a1000001-0000-0000-0000-000000000018';
const rituId  = 'a1000001-0000-0000-0000-000000000019';
const vijayId = 'a1000001-0000-0000-0000-000000000020';
const kpId    = 'a1000001-0000-0000-0000-000000000015';
const maId    = 'a1000001-0000-0000-0000-000000000016';
const ssId    = 'a1000001-0000-0000-0000-000000000017';

const ajaySessions: CoachingSession[] = [
  {
    id: 'cs-001',
    riderId: ajayId, riderName: 'Ajay Chauhan',
    hub: 'Kolkata-Central', region: 'East',
    supervisorName: 'Ramesh Iyer',
    sessionType: 'alert_response', status: 'completed',
    triggerSource: 'alert', triggerAlertType: 'LOW_SUCCESS_RATE',
    scheduledAt: '2026-06-10T10:00:00Z', completedAt: '2026-06-10T11:05:00Z',
    durationMinutes: 65,
    scoreAtSession: 47.2, gradeAtSession: 'D',
    primaryIssues: [
      { metric: 'Success Rate',   rate: 43.2, target: 85, severity: 'critical', title: 'Critical: Success Rate 43.2%' },
      { metric: 'First Attempt',  rate: 38.5, target: 75, severity: 'critical', title: 'Critical: First Attempt Rate 38.5%' },
      { metric: 'Productivity',   rate: 41.0, target: 80, severity: 'high',     title: 'Below Threshold: Productivity 41%' },
    ],
    strengthsNoted: ['Punctual — arrives on time daily', 'Cooperative during session'],
    discussionNotes: 'Ajay confirmed he was not making pre-calls. Believed it was optional. Demonstrated the pre-call workflow on his device. He was receptive and understood the impact on re-attempts. GPS track review showed 3 unnecessary stops (15-min idle at tea stall mid-route).',
    outcomeNotes: 'Committed to pre-call for all stops starting immediately. Agreed to follow app route exactly. Will review GPS daily with supervisor.',
    outcome: 'stable',
    followUpRequired: true, followUpDate: '2026-06-17',
    actionItems: [
      makeAction('ai-001','cs-001',ajayId,'Ajay Chauhan',
        'Pre-call every stop — no exceptions',
        'Call customer 20 minutes before arrival for every stop in the route. Log call in app notes if customer does not answer.',
        'delivery','critical','2026-06-17','completed',
        'Observed during route check on 13 Jun — pre-calls made for 14/15 stops. One missed (dead battery).'),
      makeAction('ai-002','cs-001',ajayId,'Ajay Chauhan',
        'Follow app route order exactly',
        'No deviation from app-suggested stop sequence. Any deviation must be approved by supervisor in advance.',
        'delivery','high','2026-06-17','completed',
        'GPS track reviewed 11-15 Jun. Route order followed correctly on 4 of 5 days.'),
      makeAction('ai-003','cs-001',ajayId,'Ajay Chauhan',
        'Daily debrief with supervisor at EOD',
        'Review every failed delivery attempt at end of day — what happened, could it have been prevented.',
        'delivery','high','2026-06-17','completed',
        'Completed daily 10-17 Jun per Ramesh\'s log.'),
    ],
  },
  {
    id: 'cs-002',
    riderId: ajayId, riderName: 'Ajay Chauhan',
    hub: 'Kolkata-Central', region: 'East',
    supervisorName: 'Ramesh Iyer',
    sessionType: 'performance_review', status: 'completed',
    triggerSource: 'scheduled',
    scheduledAt: '2026-06-17T10:00:00Z', completedAt: '2026-06-17T10:50:00Z',
    durationMinutes: 50,
    scoreAtSession: 51.8, gradeAtSession: 'D', prevSessionScore: 47.2,
    primaryIssues: [
      { metric: 'Success Rate',  rate: 49.1, target: 85, severity: 'critical', title: 'Still Critical: Success Rate 49.1%' },
      { metric: 'First Attempt', rate: 44.2, target: 75, severity: 'critical', title: 'Still Critical: First Attempt 44.2%' },
    ],
    strengthsNoted: [
      'Pre-call habit improving — 90%+ compliance last 5 days',
      'Route adherence better — no idle stops detected',
      'Score improved +4.6 pts since last session',
    ],
    discussionNotes: 'Progress visible but insufficient. Success rate still critical. Discussed that even with pre-calls, 30% of customers are unavailable. Ajay needs to also improve timing — he is reaching customers at 3–4pm (post-office hours). Discussed rescheduling office area stops to 7–8am.',
    outcomeNotes: 'Improvement plan initiated. Focus on time-of-day optimisation for office-area customers. Weekly check-in continues.',
    outcome: 'improved',
    followUpRequired: true, followUpDate: '2026-06-24',
    actionItems: [
      makeAction('ai-004','cs-002',ajayId,'Ajay Chauhan',
        'Reschedule office-area stops to morning window (8–11am)',
        'Request hub manager to front-load corporate/office addresses in route for 8–11am delivery. Residential last.',
        'delivery','critical','2026-06-20','in_progress'),
      makeAction('ai-005','cs-002',ajayId,'Ajay Chauhan',
        'SMS fallback when call not answered',
        'If customer does not answer within 2 rings — immediately send SMS with arrival ETA. Record in app notes.',
        'delivery','high','2026-06-20','open'),
    ],
  },
  {
    id: 'cs-003',
    riderId: ajayId, riderName: 'Ajay Chauhan',
    hub: 'Kolkata-Central', region: 'East',
    supervisorName: 'Ramesh Iyer',
    sessionType: 'improvement_plan_review', status: 'scheduled',
    triggerSource: 'scheduled',
    scheduledAt: '2026-06-24T10:00:00Z',
    scoreAtSession: 0, gradeAtSession: 'D',
    primaryIssues: [],
    strengthsNoted: [], discussionNotes: '', outcomeNotes: '',
    followUpRequired: false,
    actionItems: [],
  },
];

const ajayPlan: ImprovementPlan = {
  id: 'ip-001',
  riderId: ajayId, riderName: 'Ajay Chauhan',
  hub: 'Kolkata-Central', supervisorName: 'Ramesh Iyer',
  planType: '30_day', status: 'active',
  startDate: '2026-06-10', endDate: '2026-07-10', reviewDate: '2026-06-24',
  baselineScore: 47.2, baselineGrade: 'D',
  targetScore: 67.0, currentScore: 51.8,
  focusMetrics: [
    { metric: 'Success Rate',  baseline: 43.2, target: 75, current: 49.1 },
    { metric: 'First Attempt', baseline: 38.5, target: 65, current: 44.2 },
    { metric: 'Productivity',  baseline: 41.0, target: 65, current: 43.5 },
  ],
  weeks: [
    { week: 1, label: 'Foundation', targetScore: 52.0, focus: 'Pre-call compliance + route adherence', checkInDate: '2026-06-17', status: 'completed', actualScore: 51.8, notes: 'Pre-calls improved to 90%+. Score +4.6 pts.' },
    { week: 2, label: 'Building',   targetScore: 57.0, focus: 'Time-of-day optimisation for office stops', checkInDate: '2026-06-24', status: 'pending',   actualScore: null, notes: '' },
    { week: 3, label: 'Consolidation', targetScore: 62.0, focus: 'Maintain gains; improve first attempt rate to 55%+', checkInDate: '2026-07-01', status: 'pending', actualScore: null, notes: '' },
    { week: 4, label: 'Assessment',    targetScore: 67.0, focus: 'Final review — exit plan or extend', checkInDate: '2026-07-10', status: 'pending', actualScore: null, notes: '' },
  ],
};

// ============================================================
// SESSIONS — Ritu Bansal (GPS tampering, D grade, Mumbai-Central)
// ============================================================

const rituSessions: CoachingSession[] = [
  {
    id: 'cs-004',
    riderId: rituId, riderName: 'Ritu Bansal',
    hub: 'Mumbai-Central', region: 'West',
    supervisorName: 'Priya Menon',
    sessionType: 'formal_warning', status: 'completed',
    triggerSource: 'alert', triggerAlertType: 'GPS_TAMPERING',
    scheduledAt: '2026-06-15T09:00:00Z', completedAt: '2026-06-15T09:55:00Z',
    durationMinutes: 55,
    scoreAtSession: 44.1, gradeAtSession: 'D',
    primaryIssues: [
      { metric: 'GPS Discipline', rate: 28.0, target: 90, severity: 'critical', title: 'Critical: GPS Tampering Detected' },
      { metric: 'Success Rate',   rate: 52.3, target: 85, severity: 'critical', title: 'Critical: Success Rate 52.3%' },
    ],
    strengthsNoted: ['Good attendance record — present all 22 working days'],
    discussionNotes: 'Device inspection confirmed: mock location app "Fake GPS Location" installed. Ritu denied using it for delivery fraud — claims she installed it for a game. App was uninstalled during session. 4 geofence violations reviewed on map — all appear to be route deviations to personal addresses. Formal written warning issued and signed. Device will be monitored daily.',
    outcomeNotes: 'Formal written warning issued. Mock location removed. GPS to be checked daily by supervisor for 30 days. Any recurrence triggers termination proceedings.',
    outcome: 'stable',
    followUpRequired: true, followUpDate: '2026-06-22',
    escalatedTo: 'OPS_MANAGER',
    actionItems: [
      makeAction('ai-006','cs-004',rituId,'Ritu Bansal',
        'Device inspection daily for 30 days',
        'Hub manager to check device for mock location apps every morning before dispatch. Log results.',
        'gps','critical','2026-07-15','in_progress'),
      makeAction('ai-007','cs-004',rituId,'Ritu Bansal',
        'GPS compliance — no geofence violations',
        'Zero geofence violations for 30 consecutive days. Any violation triggers immediate review.',
        'gps','critical','2026-07-15','in_progress'),
      makeAction('ai-008','cs-004',rituId,'Ritu Bansal',
        'Pre-call compliance to improve success rate',
        'Pre-call all stops. Daily debrief on failed deliveries.',
        'delivery','high','2026-06-22','open'),
    ],
  },
  {
    id: 'cs-005',
    riderId: rituId, riderName: 'Ritu Bansal',
    hub: 'Mumbai-Central', region: 'West',
    supervisorName: 'Priya Menon',
    sessionType: 'performance_review', status: 'scheduled',
    triggerSource: 'scheduled',
    scheduledAt: '2026-06-22T09:00:00Z',
    scoreAtSession: 0, gradeAtSession: 'D',
    primaryIssues: [], strengthsNoted: [], discussionNotes: '', outcomeNotes: '',
    followUpRequired: false,
    actionItems: [],
  },
];

const rituPlan: ImprovementPlan = {
  id: 'ip-002',
  riderId: rituId, riderName: 'Ritu Bansal',
  hub: 'Mumbai-Central', supervisorName: 'Priya Menon',
  planType: '30_day', status: 'active',
  startDate: '2026-06-15', endDate: '2026-07-15', reviewDate: '2026-06-29',
  baselineScore: 44.1, baselineGrade: 'D',
  targetScore: 62.0, currentScore: 44.1,
  focusMetrics: [
    { metric: 'GPS Discipline', baseline: 28.0, target: 85, current: 28.0 },
    { metric: 'Success Rate',   baseline: 52.3, target: 72, current: 52.3 },
    { metric: 'On-Time Rate',   baseline: 58.1, target: 72, current: 58.1 },
  ],
  weeks: [
    { week: 1, label: 'Foundation', targetScore: 50.0, focus: 'Zero GPS violations; daily device check', checkInDate: '2026-06-22', status: 'pending', actualScore: null, notes: '' },
    { week: 2, label: 'Building',   targetScore: 54.0, focus: 'Improve success rate with pre-calls; maintain GPS clean', checkInDate: '2026-06-29', status: 'pending', actualScore: null, notes: '' },
    { week: 3, label: 'Consolidation', targetScore: 58.0, focus: 'Sustain GPS + delivery improvements', checkInDate: '2026-07-06', status: 'pending', actualScore: null, notes: '' },
    { week: 4, label: 'Assessment',    targetScore: 62.0, focus: 'Final review — formal warning period ends', checkInDate: '2026-07-15', status: 'pending', actualScore: null, notes: '' },
  ],
};

// ============================================================
// SESSIONS — Vijay Raj (COD discrepancy, D grade, Pune-Hub)
// ============================================================

const vijaySessions: CoachingSession[] = [
  {
    id: 'cs-006',
    riderId: vijayId, riderName: 'Vijay Raj',
    hub: 'Pune-Hub', region: 'West',
    supervisorName: 'Anand Kulkarni',
    sessionType: 'alert_response', status: 'completed',
    triggerSource: 'alert', triggerAlertType: 'COD_DISCREPANCY',
    scheduledAt: '2026-06-12T14:00:00Z', completedAt: '2026-06-12T15:20:00Z',
    durationMinutes: 80,
    scoreAtSession: 46.3, gradeAtSession: 'D',
    primaryIssues: [
      { metric: 'COD Accuracy',  rate: 61.4, target: 98, severity: 'critical', title: 'Critical: COD Accuracy 61.4%' },
      { metric: 'Success Rate',  rate: 55.2, target: 85, severity: 'critical', title: 'Critical: Success Rate 55.2%' },
      { metric: 'POD Compliance', rate: 72.1, target: 95, severity: 'high', title: 'Below Threshold: POD 72.1%' },
    ],
    strengthsNoted: ['Good attendance — 20/22 days present', 'Responsive to feedback in session'],
    discussionNotes: 'EOD reconciliation review: Vijay was not completing digital reconciliation. Cash was handed to hub cashier informally without app confirmation — leading to discrepancies in system vs. actual. Total ₹12,450 gap over 7 days traced to 3 specific dates. Vijay believes cash was correct but app was not updated. Cashier logs confirm partial match. Protocol re-trained — EOD must be done in app before physical handover.',
    outcomeNotes: 'Root cause identified as process gap (app reconciliation skipped). Formal retraining on EOD process completed during session. ₹12,450 discrepancy under investigation with cashier.',
    outcome: 'improved',
    followUpRequired: true, followUpDate: '2026-06-19',
    actionItems: [
      makeAction('ai-009','cs-006',vijayId,'Vijay Raj',
        'Complete EOD reconciliation in app before cash handover',
        'Every day: reconcile in app → cashier verifies digital total → physical cash counted together. No handover without app confirmation.',
        'cod','critical','2026-06-19','completed',
        'Reconciliation completed in app every day since 13 Jun. Zero discrepancies this week.'),
      makeAction('ai-010','cs-006',vijayId,'Vijay Raj',
        'POD capture for 100% of deliveries',
        'Photo must show package + address. Signature for all COD and high-value deliveries.',
        'compliance','high','2026-06-19','in_progress'),
      makeAction('ai-011','cs-006',vijayId,'Vijay Raj',
        'Pre-call all customers — improve success rate',
        'Call 20 minutes before arrival. If no answer: SMS with ETA.',
        'delivery','high','2026-06-19','open'),
    ],
  },
  {
    id: 'cs-007',
    riderId: vijayId, riderName: 'Vijay Raj',
    hub: 'Pune-Hub', region: 'West',
    supervisorName: 'Anand Kulkarni',
    sessionType: 'performance_review', status: 'scheduled',
    triggerSource: 'scheduled',
    scheduledAt: '2026-06-23T14:00:00Z',
    scoreAtSession: 0, gradeAtSession: 'D',
    primaryIssues: [], strengthsNoted: [], discussionNotes: '', outcomeNotes: '',
    followUpRequired: false,
    actionItems: [],
  },
];

// ============================================================
// SESSIONS — Kiran Pillai (score drop, C grade, Bangalore-Central)
// ============================================================

const kpSessions: CoachingSession[] = [
  {
    id: 'cs-008',
    riderId: kpId, riderName: 'Kiran Pillai',
    hub: 'Bangalore-Central', region: 'South',
    supervisorName: 'Sundar Rajan',
    sessionType: 'alert_response', status: 'completed',
    triggerSource: 'score_drop',
    scheduledAt: '2026-06-14T11:00:00Z', completedAt: '2026-06-14T11:45:00Z',
    durationMinutes: 45,
    scoreAtSession: 67.1, gradeAtSession: 'C',
    primaryIssues: [
      { metric: 'On-Time Rate',    rate: 61.2, target: 80, severity: 'high', title: 'Below Threshold: On-Time Rate 61.2%' },
      { metric: 'First Attempt',   rate: 58.4, target: 75, severity: 'high', title: 'Below Threshold: First Attempt 58.4%' },
      { metric: 'Success Rate',    rate: 72.1, target: 85, severity: 'moderate', title: 'Below Target: Success Rate 72.1%' },
    ],
    strengthsNoted: [
      'POD compliance still strong at 93%',
      'Attendance excellent — 21/22 days',
      'Was Grade B last period — capable rider going through a rough patch',
    ],
    discussionNotes: 'Kiran mentioned traffic congestion on new route assignment (Indiranagar area) is significantly longer than previous route. Route was changed 3 weeks ago. Supervisor confirmed no route review was done after reassignment. This appears to be a route workload issue more than a behaviour issue.',
    outcomeNotes: 'Route review requested with operations. Meanwhile, Kiran to follow app navigation (live traffic). Daily check-in for 2 weeks.',
    outcome: 'improved',
    followUpRequired: true, followUpDate: '2026-06-21',
    actionItems: [
      makeAction('ai-012','cs-008',kpId,'Kiran Pillai',
        'Route review — raise workload concern to operations',
        'Supervisor to escalate Indiranagar route timing issue to OpsManager. Request route rebalance.',
        'delivery','high','2026-06-17','completed',
        'Route reviewed. 4 stops shifted to adjacent rider. Kiran\'s daily volume reduced from 24 to 20.'),
      makeAction('ai-013','cs-008',kpId,'Kiran Pillai',
        'Use live navigation — do not rely on memory',
        'Follow app turn-by-turn for all new route area. Do not use shortcut routes that aren\'t in the app.',
        'delivery','medium','2026-06-21','in_progress'),
    ],
  },
];

// ============================================================
// SESSIONS — Manoj Agarwal (POD compliance, C grade, Chennai-Hub)
// ============================================================

const maSessions: CoachingSession[] = [
  {
    id: 'cs-009',
    riderId: maId, riderName: 'Manoj Agarwal',
    hub: 'Chennai-Hub', region: 'South',
    supervisorName: 'Kavitha Nair',
    sessionType: 'performance_review', status: 'completed',
    triggerSource: 'alert', triggerAlertType: 'POD_NON_COMPLIANCE',
    scheduledAt: '2026-06-13T09:30:00Z', completedAt: '2026-06-13T10:10:00Z',
    durationMinutes: 40,
    scoreAtSession: 63.5, gradeAtSession: 'C',
    primaryIssues: [
      { metric: 'POD Compliance', rate: 68.3, target: 95, severity: 'critical', title: 'Critical: POD Compliance 68.3%' },
    ],
    strengthsNoted: ['Success rate at 78% — near target', 'Good COD accuracy at 96%', 'Cooperative in session'],
    discussionNotes: 'Device inspection: camera app crash due to full device storage (32GB phone, only 400MB free). Photos were being attempted but failing silently. Manoj was marking deliveries complete assuming photos saved. Root cause: device storage. Secondary: Manoj did not check if photos were actually saved before proceeding.',
    outcomeNotes: 'Device storage cleared during session (deleted old photo/video files — non-work). Now 8GB free. Shown how to verify photo saved in delivery app before proceeding.',
    outcome: 'improved',
    followUpRequired: true, followUpDate: '2026-06-20',
    actionItems: [
      makeAction('ai-014','cs-009',maId,'Manoj Agarwal',
        'Verify photo saved before marking delivery complete',
        'After taking POD photo: check it appears in the delivery record before proceeding to next stop.',
        'compliance','critical','2026-06-20','in_progress'),
      makeAction('ai-015','cs-009',maId,'Manoj Agarwal',
        'Monthly device storage check',
        'First day of every month: clear camera roll/downloads. Minimum 5GB free at all times.',
        'compliance','medium','2026-07-01','open'),
    ],
  },
];

// ============================================================
// SESSIONS — Swati Saxena (attendance, C grade, Hyderabad-Hub)
// ============================================================

const ssSessions: CoachingSession[] = [
  {
    id: 'cs-010',
    riderId: ssId, riderName: 'Swati Saxena',
    hub: 'Hyderabad-Hub', region: 'South',
    supervisorName: 'Venkat Rao',
    sessionType: 'welfare_check', status: 'completed',
    triggerSource: 'alert', triggerAlertType: 'ATTENDANCE_ISSUE',
    scheduledAt: '2026-06-11T10:00:00Z', completedAt: '2026-06-11T10:35:00Z',
    durationMinutes: 35,
    scoreAtSession: 65.8, gradeAtSession: 'C',
    primaryIssues: [
      { metric: 'Attendance', rate: 63.6, target: 95, severity: 'critical', title: 'Critical: Attendance 63.6% — 8 absences' },
    ],
    strengthsNoted: [
      'Strong POD compliance at 97% on days present',
      'High success rate on days present: 83%',
      'Customer feedback positive when she works',
    ],
    discussionNotes: 'Swati shared that she has been caring for her mother following a health incident (3 weeks ago). Absences are due to taking her mother for medical appointments. No HR support previously offered. Confidential welfare discussion — HR notified for compassionate leave options.',
    outcomeNotes: 'HR compassionate leave option offered and explained. Swati will apply for 5 flexible days per month. Supervisor will accommodate appointment scheduling where possible. Performance coaching deferred until personal situation stabilises (2 weeks).',
    outcome: 'stable',
    followUpRequired: true, followUpDate: '2026-06-25',
    actionItems: [
      makeAction('ai-016','cs-010',ssId,'Swati Saxena',
        'HR compassionate leave application',
        'HR to process flexible leave application within 3 working days. Swati notified of outcome.',
        'attendance','high','2026-06-15','completed',
        'Compassionate leave approved — 5 flexible days per month for 3 months.'),
      makeAction('ai-017','cs-010',ssId,'Swati Saxena',
        'Advance notice of appointments — minimum 24 hours',
        'Swati to notify supervisor at least 24 hours before planned medical appointment absences.',
        'attendance','medium','2026-07-11','in_progress'),
    ],
  },
];

// ============================================================
// BUILD RIDER SUMMARIES
// ============================================================

function urgencyScore(score: number, grade: string, openAlerts: number, lastSessionDays: number | undefined): number {
  let u = 0;
  if (grade === 'D') u += 40;
  else if (grade === 'C') u += 20;
  u += openAlerts * 10;
  if (score < 50) u += 15;
  if (lastSessionDays !== undefined && lastSessionDays > 14) u += 10;
  return u;
}

export const coachingRiders: CoachingRiderSummary[] = [
  {
    riderId: ajayId, riderName: 'Ajay Chauhan',
    hub: 'Kolkata-Central', region: 'East',
    overallScore: 51.8, grade: 'D',
    urgencyScore: urgencyScore(51.8, 'D', 2, 3),
    urgencyReason: 'At Risk — Active Improvement Plan (Week 2 of 4)',
    openAlerts: 2,
    lastSessionDate: '2026-06-17',
    daysSinceSession: 3,
    activePlan: true,
    sessions: ajaySessions,
    plan: ajayPlan,
  },
  {
    riderId: rituId, riderName: 'Ritu Bansal',
    hub: 'Mumbai-Central', region: 'West',
    overallScore: 44.1, grade: 'D',
    urgencyScore: urgencyScore(44.1, 'D', 3, 5),
    urgencyReason: 'At Risk — Formal Warning Active + GPS Tampering',
    openAlerts: 3,
    lastSessionDate: '2026-06-15',
    daysSinceSession: 5,
    activePlan: true,
    sessions: rituSessions,
    plan: rituPlan,
  },
  {
    riderId: vijayId, riderName: 'Vijay Raj',
    hub: 'Pune-Hub', region: 'West',
    overallScore: 46.3, grade: 'D',
    urgencyScore: urgencyScore(46.3, 'D', 2, 8),
    urgencyReason: 'At Risk — COD Discrepancy Investigation Ongoing',
    openAlerts: 2,
    lastSessionDate: '2026-06-12',
    daysSinceSession: 8,
    activePlan: false,
    sessions: vijaySessions,
  },
  {
    riderId: ssId, riderName: 'Swati Saxena',
    hub: 'Hyderabad-Hub', region: 'South',
    overallScore: 65.8, grade: 'C',
    urgencyScore: urgencyScore(65.8, 'C', 1, 9),
    urgencyReason: 'Welfare Support Active — Coaching Paused',
    openAlerts: 1,
    lastSessionDate: '2026-06-11',
    daysSinceSession: 9,
    activePlan: false,
    sessions: ssSessions,
  },
  {
    riderId: maId, riderName: 'Manoj Agarwal',
    hub: 'Chennai-Hub', region: 'South',
    overallScore: 63.5, grade: 'C',
    urgencyScore: urgencyScore(63.5, 'C', 1, 7),
    urgencyReason: 'Needs Improvement — POD Compliance Critical',
    openAlerts: 1,
    lastSessionDate: '2026-06-13',
    daysSinceSession: 7,
    activePlan: false,
    sessions: maSessions,
  },
  {
    riderId: kpId, riderName: 'Kiran Pillai',
    hub: 'Bangalore-Central', region: 'South',
    overallScore: 67.1, grade: 'C',
    urgencyScore: urgencyScore(67.1, 'C', 1, 6),
    urgencyReason: 'Score Drop — Route Workload Issue Being Addressed',
    openAlerts: 1,
    lastSessionDate: '2026-06-14',
    daysSinceSession: 6,
    activePlan: false,
    sessions: kpSessions,
  },
].sort((a, b) => b.urgencyScore - a.urgencyScore);

// ============================================================
// HELPERS
// ============================================================

export function getCoachingRider(riderId: string): CoachingRiderSummary | undefined {
  return coachingRiders.find(r => r.riderId === riderId);
}

export function getCoachingStats() {
  const total      = coachingRiders.length;
  const critical   = coachingRiders.filter(r => r.grade === 'D').length;
  const activePlans = coachingRiders.filter(r => r.activePlan).length;
  const scheduled  = coachingRiders.flatMap(r => r.sessions).filter(s => s.status === 'scheduled').length;
  const completed  = coachingRiders.flatMap(r => r.sessions).filter(s => s.status === 'completed').length;
  const openActions = coachingRiders.flatMap(r => r.sessions.flatMap(s => s.actionItems))
    .filter(a => a.status === 'open' || a.status === 'in_progress' || a.status === 'overdue').length;

  return { total, critical, activePlans, scheduled, completed, openActions };
}
