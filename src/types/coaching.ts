export type SessionType =
  | 'alert_response'
  | 'performance_review'
  | 'improvement_plan_review'
  | 'commendation'
  | 'formal_warning'
  | 'welfare_check';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PlanStatus   = 'draft' | 'active' | 'completed' | 'failed' | 'extended';
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'overdue' | 'waived';
export type IssueSeverity = 'critical' | 'high' | 'moderate';

export interface CoachingActionItem {
  id: string;
  sessionId: string;
  riderId: string;
  riderName: string;
  title: string;
  description: string;
  category: 'delivery' | 'compliance' | 'attendance' | 'gps' | 'cod' | 'productivity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  status: ActionStatus;
  completedAt?: string;
  completedNote?: string;
  verifiedByName?: string;
}

export interface CoachingSession {
  id: string;
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  supervisorName: string;

  sessionType: SessionType;
  status: SessionStatus;
  triggerSource: 'alert' | 'scheduled' | 'manual' | 'score_drop';
  triggerAlertType?: string;

  scheduledAt: string;
  completedAt?: string;
  durationMinutes?: number;

  scoreAtSession: number;
  gradeAtSession: string;
  prevSessionScore?: number;

  primaryIssues: Array<{
    metric: string;
    rate: number;
    target: number;
    severity: IssueSeverity;
    title: string;
  }>;
  strengthsNoted: string[];
  discussionNotes: string;
  outcomeNotes: string;

  outcome?: 'improved' | 'stable' | 'declined' | 'escalated';
  followUpRequired: boolean;
  followUpDate?: string;
  escalatedTo?: string;

  actionItems: CoachingActionItem[];
}

export interface WeeklyMilestone {
  week: number;
  label: string;
  targetScore: number;
  focus: string;
  checkInDate: string;
  status: 'pending' | 'on_track' | 'off_track' | 'completed';
  actualScore: number | null;
  notes: string;
}

export interface ImprovementPlan {
  id: string;
  riderId: string;
  riderName: string;
  hub: string;
  supervisorName: string;
  planType: '30_day' | '60_day' | '90_day';
  status: PlanStatus;

  startDate: string;
  endDate: string;
  reviewDate: string;

  baselineScore: number;
  baselineGrade: string;
  targetScore: number;
  currentScore: number;
  exitScore?: number;

  focusMetrics: Array<{
    metric: string;
    baseline: number;
    target: number;
    current: number;
  }>;

  weeks: WeeklyMilestone[];

  outcome?: string;
  outcomeNotes?: string;
  recommendedAction?: 'close' | 'extend' | 'escalate_hr' | 'commend';
}

export interface CoachingRiderSummary {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  overallScore: number;
  grade: string;
  urgencyScore: number;
  urgencyReason: string;
  openAlerts: number;
  lastSessionDate?: string;
  daysSinceSession?: number;
  activePlan: boolean;
  sessions: CoachingSession[];
  plan?: ImprovementPlan;
}
