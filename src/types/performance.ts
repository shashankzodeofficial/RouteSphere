export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ScoreBreakdown {
  metric: string;
  score: number;
  rate: number;
  weight: number;
  target: number;
}

export interface PerformanceAlert {
  type: string;
  severity: AlertSeverity;
  message: string;
  metricValue: number;
  threshold: number;
}

export interface DailyScore {
  date: string;
  score: number;
  grade: PerformanceGrade;
  delivered: number;
}

export interface RiderPerformance {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  phoneNumber: string;
  joinDate: string;
  vehicleType: string;

  // Current period scores
  overallScore: number;
  grade: PerformanceGrade;
  rankInHub: number;
  rankOverall: number;

  // Rate metrics (0–100)
  successRate: number;
  onTimeRate: number;
  firstAttemptRate: number;
  podCompliance: number;
  codAccuracy: number;
  gpsScore: number;
  attendanceScore: number;
  productivityScore: number;

  // Component scores (0–100 after formula)
  scoreBreakdown: ScoreBreakdown[];

  // Trend
  prevScore: number | null;
  scoreChange: number | null;
  trendDirection: 'up' | 'down' | 'stable';

  // Volume
  ordersAssigned: number;
  ordersDelivered: number;
  ordersAttempted: number;
  ordersException: number;
  workingDays: number;
  daysPresent: number;
  totalKm: number;
  avgDeliveriesPerDay: number;
  codCollected: number;

  // Alerts
  alerts: PerformanceAlert[];

  // 30-day trend
  dailyScores: DailyScore[];

  // Recommendations
  recommendations: string[];
}

export interface TeamPerformanceSummary {
  avgScore: number;
  topGrade: PerformanceGrade;
  totalRiders: number;
  eliteCount: number;
  highPerformerCount: number;
  goodCount: number;
  needsImprovementCount: number;
  atRiskCount: number;
  openAlerts: number;
  avgSuccessRate: number;
  avgOnTimeRate: number;
  avgPodCompliance: number;
}
