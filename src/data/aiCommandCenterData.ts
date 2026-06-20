/**
 * AI Command Center — rule-based intelligence engine
 *
 * Derives risk alerts, operational insights, optimization suggestions, and
 * forecasts from the live KPI store and event stream.  No ML model is needed
 * for prototype fidelity — deterministic rules over real-time counters produce
 * outputs that feel "AI-generated" while remaining 100% explainable.
 *
 * Production swap: replace each `compute*` function with an API call that
 * returns the same typed interface from a real inference service.
 */

import type { LiveKPIs, LiveEvent } from '../store/liveDataStore';

// ─── Shared types ─────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Priority  = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  category: 'delivery' | 'sla' | 'hub' | 'returns' | 'rider' | 'safety';
  title: string;
  reason: string;
  affectedArea: string;
  suggestedAction: string;
  confidence: number;   // 0-100
  timestamp: string;
}

export interface OperationalInsight {
  id: string;
  type: 'bottleneck' | 'underperformer' | 'delay_cluster' | 'return_hotspot' | 'capacity';
  title: string;
  summary: string;
  evidence: string;
  impact: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
  id: string;
  category: 'reallocation' | 'incentive' | 'route' | 'pickup' | 'scheduling';
  recommendation: string;
  expectedImpact: string;
  priority: Priority;
  affectedModule: string;
}

export interface Forecast {
  id: string;
  metric: 'delivery_load' | 'rider_demand' | 'return_rate' | 'peak_congestion';
  label: string;
  prediction: string;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;     // positive = increase
  confidence: number;   // 0-100
  regionImpact: string;
  timeframe: string;
}

export interface AICommandCenterState {
  risks: RiskAlert[];
  insights: OperationalInsight[];
  suggestions: OptimizationSuggestion[];
  forecasts: Forecast[];
  overallRiskLevel: RiskLevel;
  generatedAt: string;
  tickCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
let _seq = 0;
const uid = (prefix: string) => `${prefix}_${Date.now()}_${_seq++}`;

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

/** Recent events of a given type in the last N entries */
function countRecent(events: LiveEvent[], type: LiveEvent['type'], window = 30) {
  return events.slice(0, window).filter(e => e.type === type).length;
}

/** Most active hub in recent events */
function topHub(events: LiveEvent[], window = 20): string {
  const freq: Record<string, number> = {};
  events.slice(0, window).forEach(e => { freq[e.hub] = (freq[e.hub] ?? 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown Hub';
}

function topRegion(events: LiveEvent[], window = 20): string {
  const freq: Record<string, number> = {};
  events.slice(0, window).forEach(e => { freq[e.region] = (freq[e.region] ?? 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown Region';
}

// ─── Risk Intelligence ────────────────────────────────────────────────────────

export function computeRisks(kpis: LiveKPIs, events: LiveEvent[]): RiskAlert[] {
  const risks: RiskAlert[] = [];
  const failureRate = kpis.deliveriesToday > 0
    ? kpis.deliveriesFailed / kpis.deliveriesToday
    : 0;

  // Delivery failure rate
  if (failureRate > 0.15) {
    risks.push({
      id: uid('risk'),
      level: failureRate > 0.25 ? 'critical' : 'high',
      category: 'delivery',
      title: 'Elevated Delivery Failure Rate',
      reason: `${(failureRate * 100).toFixed(1)}% of deliveries today have failed — ${failureRate > 0.25 ? 'well above' : 'above'} the 15% SLA threshold.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Audit last-mile address quality and contact riders with ≥3 consecutive failures.',
      confidence: clamp(60 + (failureRate * 100), 60, 95),
      timestamp: now(),
    });
  } else if (failureRate > 0.08) {
    risks.push({
      id: uid('risk'),
      level: 'medium',
      category: 'delivery',
      title: 'Delivery Failure Rate Trending Up',
      reason: `Failure rate at ${(failureRate * 100).toFixed(1)}% — approaching SLA ceiling.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Monitor closely. Brief field supervisors on common failure reasons.',
      confidence: 72,
      timestamp: now(),
    });
  }

  // SOS / safety
  if (kpis.openSosAlerts > 0) {
    risks.push({
      id: uid('risk'),
      level: 'critical',
      category: 'safety',
      title: `${kpis.openSosAlerts} Open SOS Alert${kpis.openSosAlerts > 1 ? 's' : ''}`,
      reason: `${kpis.openSosAlerts} rider${kpis.openSosAlerts > 1 ? 's have' : ' has'} triggered SOS — requires immediate dispatch team response.`,
      affectedArea: topHub(events),
      suggestedAction: 'Contact riders immediately. Dispatch support team. Log incident report.',
      confidence: 99,
      timestamp: now(),
    });
  }

  // Return spike
  const recentReturns = countRecent(events, 'return_picked_up', 20);
  if (recentReturns >= 5) {
    risks.push({
      id: uid('risk'),
      level: recentReturns >= 8 ? 'high' : 'medium',
      category: 'returns',
      title: 'Return Volume Spike Detected',
      reason: `${recentReturns} return pickups in last 20 events — abnormal concentration suggests address data quality issue or customer dissatisfaction cluster.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Review return reason codes. Flag high-return postcodes for address validation.',
      confidence: 78,
      timestamp: now(),
    });
  }

  // SLA breach probability based on in-transit
  if (kpis.deliveriesInTransit > 80 && kpis.activeRiders < 150) {
    risks.push({
      id: uid('risk'),
      level: 'high',
      category: 'sla',
      title: 'SLA Breach Risk — Rider Capacity Constraint',
      reason: `${kpis.deliveriesInTransit} orders in transit but only ${kpis.activeRiders} active riders — capacity ratio is critical.`,
      affectedArea: 'All regions',
      suggestedAction: 'Activate standby riders. Redistribute load from congested hubs.',
      confidence: 83,
      timestamp: now(),
    });
  }

  // Hub congestion
  const hubEvents = countRecent(events, 'return_hub_received', 15);
  if (hubEvents >= 4) {
    risks.push({
      id: uid('risk'),
      level: 'medium',
      category: 'hub',
      title: 'Hub Congestion — Return Processing Backlog',
      reason: `${hubEvents} returns received at hub in last 15 events. Processing backlog may delay reconciliation.`,
      affectedArea: topHub(events),
      suggestedAction: 'Increase scanning staff at hub. Prioritise aged returns for reconciliation.',
      confidence: 74,
      timestamp: now(),
    });
  }

  // Low rider rating
  if (kpis.avgRatingToday < 3.5 && kpis.ratingsReceivedToday > 10) {
    risks.push({
      id: uid('risk'),
      level: kpis.avgRatingToday < 3.0 ? 'high' : 'medium',
      category: 'rider',
      title: 'Customer Satisfaction Decline',
      reason: `Average rating today is ${kpis.avgRatingToday.toFixed(1)} ★ across ${kpis.ratingsReceivedToday} ratings — below the 4.0 target.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Identify bottom-decile riders. Trigger coaching workflow and temporary route simplification.',
      confidence: 81,
      timestamp: now(),
    });
  }

  // Penalty spike
  const recentPenalties = countRecent(events, 'penalty_applied', 20);
  if (recentPenalties >= 4) {
    risks.push({
      id: uid('risk'),
      level: 'medium',
      category: 'rider',
      title: 'Penalty Volume Above Norm',
      reason: `${recentPenalties} penalties applied in last 20 events — may indicate policy confusion or systemic operational issue.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Review penalty reason breakdown. Check for erroneous auto-flagging.',
      confidence: 68,
      timestamp: now(),
    });
  }

  // Pickup failures
  if (kpis.pickupFailuresToday > 20) {
    risks.push({
      id: uid('risk'),
      level: 'medium',
      category: 'returns',
      title: 'Reverse Pickup Failure Rate Elevated',
      reason: `${kpis.pickupFailuresToday} failed return pickups today. Customers may have availability or access issues.`,
      affectedArea: topRegion(events),
      suggestedAction: 'Contact failed-pickup customers to reschedule. Review address/timeslot data.',
      confidence: 76,
      timestamp: now(),
    });
  }

  return risks;
}

// ─── Operational Insights ─────────────────────────────────────────────────────

export function computeInsights(kpis: LiveKPIs, events: LiveEvent[]): OperationalInsight[] {
  const insights: OperationalInsight[] = [];

  // Bottleneck hub
  const hub = topHub(events);
  const hubCount = events.slice(0, 20).filter(e => e.hub === hub).length;
  if (hubCount >= 6) {
    insights.push({
      id: uid('ins'),
      type: 'bottleneck',
      title: `Hub Bottleneck — ${hub}`,
      summary: `${hub} is handling ${hubCount} of the last 20 events — disproportionate load concentration.`,
      evidence: `${hubCount}/20 recent events originated from this hub. Return and delivery events both concentrated here.`,
      impact: 'Risk of delayed processing, increased error rate, and SLA breach for hub-assigned riders.',
      severity: hubCount >= 9 ? 'high' : 'medium',
    });
  }

  // Rider performance gap
  if (kpis.avgPerformanceScore < 72) {
    insights.push({
      id: uid('ins'),
      type: 'underperformer',
      title: 'Rider Performance Score Below Target',
      summary: `Fleet average performance score is ${kpis.avgPerformanceScore}% — below the 75% operational target.`,
      evidence: `${kpis.activeRiders} active riders tracked. Score composite: delivery success rate, punctuality, return compliance, customer rating.`,
      impact: 'Below-target performance correlates with 23% higher SLA breach probability based on historical data.',
      severity: kpis.avgPerformanceScore < 65 ? 'high' : 'medium',
    });
  }

  // Delivery delay cluster
  const failedRecent = countRecent(events, 'delivery_failed', 20);
  const region = topRegion(events);
  if (failedRecent >= 4) {
    insights.push({
      id: uid('ins'),
      type: 'delay_cluster',
      title: `Delivery Failure Cluster — ${region}`,
      summary: `${failedRecent} failed deliveries in last 20 events concentrated in ${region}.`,
      evidence: `Failure cluster exceeds statistical baseline (expected ≤2/20). Possible causes: traffic event, weather, address batch issue.`,
      impact: `Customer CSAT exposure across ${failedRecent} orders. Re-attempt cost: ₹${(failedRecent * 45).toFixed(0)} per reattempt.`,
      severity: failedRecent >= 7 ? 'high' : 'medium',
    });
  }

  // Return hotspot
  if (kpis.returnsPickedUpToday > kpis.returnsReconciled * 2) {
    insights.push({
      id: uid('ins'),
      type: 'return_hotspot',
      title: 'Return Reconciliation Gap Widening',
      summary: `${kpis.returnsPickedUpToday} returns picked up vs only ${kpis.returnsReconciled} reconciled — backlog is growing.`,
      evidence: `Pickup-to-reconciliation ratio: ${kpis.returnsPickedUpToday > 0 ? (kpis.returnsPickedUpToday / Math.max(kpis.returnsReconciled, 1)).toFixed(1) : '—'}x. Hub processing capacity may be insufficient.`,
      impact: 'Extended reconciliation delays reduce vendor credit cycle time and inflate open-return inventory.',
      severity: 'medium',
    });
  }

  // Shift capacity
  if (kpis.shiftsActive < 30) {
    insights.push({
      id: uid('ins'),
      type: 'capacity',
      title: 'Low Active Shift Count',
      summary: `Only ${kpis.shiftsActive} rider shifts active — may be insufficient for current order volume.`,
      evidence: `${kpis.deliveriesInTransit} orders in transit with ${kpis.shiftsActive} active shifts. Ratio: ${(kpis.deliveriesInTransit / Math.max(kpis.shiftsActive, 1)).toFixed(1)} orders/shift.`,
      impact: 'High order-to-rider ratio increases late delivery probability by an estimated 18%.',
      severity: kpis.shiftsActive < 20 ? 'high' : 'low',
    });
  }

  // Incentive effectiveness
  const incentiveRate = kpis.incentivesTotalToday > 0
    ? kpis.incentivesTotalToday / Math.max(kpis.deliveriesToday, 1)
    : 0;
  if (incentiveRate > 150) {
    insights.push({
      id: uid('ins'),
      type: 'capacity',
      title: 'Incentive Cost Per Delivery Elevated',
      summary: `Avg incentive spend is ₹${incentiveRate.toFixed(0)} per delivery — above the ₹150 efficiency benchmark.`,
      evidence: `Total incentives today: ₹${kpis.incentivesTotalToday.toLocaleString()}. Deliveries: ${kpis.deliveriesToday}.`,
      impact: 'Unchecked incentive spend erodes per-delivery margin. Review trigger thresholds.',
      severity: incentiveRate > 220 ? 'high' : 'medium',
    });
  }

  return insights;
}

// ─── Optimization Suggestions ─────────────────────────────────────────────────

export function computeSuggestions(kpis: LiveKPIs, events: LiveEvent[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Rider reallocation
  if (kpis.deliveriesInTransit > 60 && kpis.activeRiders < 160) {
    suggestions.push({
      id: uid('sug'),
      category: 'reallocation',
      recommendation: `Reallocate ${Math.min(15, kpis.activeRiders)} riders from low-density zones to ${topRegion(events)} where in-transit order pressure is highest.`,
      expectedImpact: `Estimated 12–18% reduction in average delivery time. SLA breach probability drops from ~${Math.round(30 + kpis.deliveriesInTransit * 0.1)}% to ~${Math.round(14 + kpis.deliveriesInTransit * 0.05)}%.`,
      priority: 'high',
      affectedModule: 'Rider Intelligence (Phase 10F)',
    });
  }

  // Incentive calibration
  if (kpis.avgRatingToday < 4.0 && kpis.incentivesTotalToday < 30000) {
    suggestions.push({
      id: uid('sug'),
      category: 'incentive',
      recommendation: `Activate bonus incentive tier for riders who achieve ≥4.2 ★ rating today. Current avg is ${kpis.avgRatingToday.toFixed(1)} ★ — a targeted ₹50 bonus per high-rating delivery could lift fleet average.`,
      expectedImpact: 'Historical data shows 0.3★ average rating improvement when quality bonuses are active. Customer retention impact: +6% repeat orders.',
      priority: 'medium',
      affectedModule: 'Rider Intelligence — Earnings & Incentives (Phase 10F)',
    });
  }

  // Route optimisation
  const failedCluster = countRecent(events, 'delivery_failed', 15);
  if (failedCluster >= 3) {
    suggestions.push({
      id: uid('sug'),
      category: 'route',
      recommendation: `Reroute ${topRegion(events)} deliveries via alternate waypoints. Cluster of ${failedCluster} recent failures suggests a road/access blockage or congestion event on primary routes.`,
      expectedImpact: 'Rerouting typically recovers 60–70% of at-risk deliveries within the same shift window.',
      priority: 'high',
      affectedModule: 'Live Delivery Tracking',
    });
  }

  // Pickup scheduling
  if (kpis.pickupFailuresToday > 15) {
    suggestions.push({
      id: uid('sug'),
      category: 'pickup',
      recommendation: `Reschedule ${kpis.pickupFailuresToday} failed return pickups to evening slots (6–9 PM). Analysis of return pickup failures shows 68% of customers are available in evening windows.`,
      expectedImpact: 'Projected recovery of 60–65% failed pickups without additional rider cost. Reduces re-attempt SLA breach exposure.',
      priority: 'medium',
      affectedModule: 'Returns Dashboard (Phase 10E)',
    });
  }

  // Penalty review
  const penalties = countRecent(events, 'penalty_applied', 20);
  if (penalties >= 3) {
    suggestions.push({
      id: uid('sug'),
      category: 'scheduling',
      recommendation: `Audit ${penalties} recent penalty events for false positives before batch processing. Auto-penalty rules may be over-triggering on late-delivery codes that qualify for force-majeure exemption.`,
      expectedImpact: 'Reducing erroneous penalties improves rider trust scores and reduces grievance resolution workload by an estimated 25%.',
      priority: 'medium',
      affectedModule: 'Rider Intelligence — Penalties (Phase 10F)',
    });
  }

  // Shift stagger
  if (kpis.shiftsActive < 25) {
    suggestions.push({
      id: uid('sug'),
      category: 'scheduling',
      recommendation: `Trigger early shift starts for ${Math.ceil((30 - kpis.shiftsActive) * 1.2)} riders in high-demand zones. Only ${kpis.shiftsActive} shifts are currently active against projected peak demand.`,
      expectedImpact: 'Staggered early-start shifts reduce mid-day capacity gap by ~35% without overtime cost.',
      priority: kpis.shiftsActive < 20 ? 'high' : 'low',
      affectedModule: 'Rider Intelligence — Shift Management (Phase 10F)',
    });
  }

  // Reconciliation acceleration
  if (kpis.returnsAtHub > kpis.returnsReconciled * 1.5) {
    suggestions.push({
      id: uid('sug'),
      category: 'scheduling',
      recommendation: `Deploy additional QC scanning staff at ${topHub(events)} to clear the return processing backlog. ${kpis.returnsAtHub} items at hub, only ${kpis.returnsReconciled} reconciled today.`,
      expectedImpact: 'Clearing backlog within shift accelerates vendor credit cycle by 1–2 days and frees hub floor space for incoming volumes.',
      priority: 'medium',
      affectedModule: 'Returns Dashboard — Hub Reconciliation (Phase 10E)',
    });
  }

  return suggestions;
}

// ─── Forecasts ────────────────────────────────────────────────────────────────

export function computeForecasts(kpis: LiveKPIs, tickCount: number): Forecast[] {
  // Use tickCount as a pseudo-time dimension to vary predictions slightly
  const hourOfDay = new Date().getHours();
  const isEveningPeak = hourOfDay >= 17 && hourOfDay <= 20;
  const isMorningPeak = hourOfDay >= 9 && hourOfDay <= 12;

  const deliveryVelocity = kpis.deliveriesToday / Math.max(hourOfDay || 1, 1);
  const projectedEODDeliveries = Math.round(deliveryVelocity * 24);
  const projectedTrend = projectedEODDeliveries > 1300 ? 'up' : projectedEODDeliveries < 1100 ? 'down' : 'stable';

  const returnRate = kpis.deliveriesToday > 0
    ? (kpis.returnsPickedUpToday / kpis.deliveriesToday) * 100
    : 0;
  const projectedReturnRate = returnRate * (1 + (tickCount % 10) * 0.01);

  return [
    {
      id: uid('fcst'),
      metric: 'delivery_load',
      label: 'Next-Day Delivery Load',
      prediction: `Projected ${Math.round(projectedEODDeliveries * 1.05).toLocaleString()} deliveries tomorrow based on current velocity and day-of-week pattern.`,
      trend: projectedTrend,
      trendPct: projectedTrend === 'up' ? 5 : projectedTrend === 'down' ? -7 : 1,
      confidence: 81,
      regionImpact: 'All regions — highest load expected in South and West zones.',
      timeframe: 'Tomorrow (next 24h)',
    },
    {
      id: uid('fcst'),
      metric: 'rider_demand',
      label: 'Rider Demand Forecast',
      prediction: `${Math.round(kpis.activeRiders * 1.08)} riders needed tomorrow — 8% above today's active fleet to meet forecast delivery volume without SLA risk.`,
      trend: 'up',
      trendPct: 8,
      confidence: 76,
      regionImpact: `${topMultipleRegions()} will have highest demand density.`,
      timeframe: 'Tomorrow peak window (10 AM – 7 PM)',
    },
    {
      id: uid('fcst'),
      metric: 'return_rate',
      label: 'Return Rate Forecast',
      prediction: `Return rate expected to reach ${clamp(projectedReturnRate, 4, 18).toFixed(1)}% of deliveries — ${projectedReturnRate > 12 ? 'above seasonal norm, prep hub capacity' : 'within seasonal norm'}.`,
      trend: projectedReturnRate > 10 ? 'up' : 'stable',
      trendPct: projectedReturnRate > 10 ? 12 : 2,
      confidence: 69,
      regionImpact: 'North zone showing highest return propensity based on postcode clustering.',
      timeframe: 'Next 48h',
    },
    {
      id: uid('fcst'),
      metric: 'peak_congestion',
      label: 'Peak Hour Congestion',
      prediction: isEveningPeak
        ? 'Currently in evening peak. Congestion expected to clear by 21:00. Recommend holding non-urgent deliveries for morning slot.'
        : isMorningPeak
          ? 'Mid-morning surge underway. Hub throughput at 85% capacity. Expect congestion to peak between 12–14:00.'
          : 'Next congestion peak predicted 17:00–20:00 based on historical traffic patterns and current order volume.',
      trend: isEveningPeak || isMorningPeak ? 'up' : 'stable',
      trendPct: isEveningPeak ? 22 : isMorningPeak ? 15 : 0,
      confidence: 84,
      regionImpact: 'Urban corridors — East and Central zones most affected.',
      timeframe: isEveningPeak ? 'Next 3h' : isMorningPeak ? 'Next 2h' : 'Today 17:00–20:00',
    },
  ];
}

function topMultipleRegions(): string {
  return 'South Zone, West Zone, Central';
}

// ─── Master compute function ───────────────────────────────────────────────────

export function computeAIState(
  kpis: LiveKPIs,
  events: LiveEvent[],
  tickCount: number,
): AICommandCenterState {
  const risks = computeRisks(kpis, events);
  const insights = computeInsights(kpis, events);
  const suggestions = computeSuggestions(kpis, events);
  const forecasts = computeForecasts(kpis, tickCount);

  const criticalCount = risks.filter(r => r.level === 'critical').length;
  const highCount     = risks.filter(r => r.level === 'high').length;
  const overallRiskLevel: RiskLevel =
    criticalCount > 0 ? 'critical' :
    highCount > 1     ? 'high' :
    highCount === 1   ? 'medium' :
    risks.length > 0  ? 'low' : 'low';

  return { risks, insights, suggestions, forecasts, overallRiskLevel, generatedAt: now(), tickCount };
}
