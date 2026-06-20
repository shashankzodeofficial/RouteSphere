// Phase 10E – Reverse Logistics data for Control Tower

export type ReturnStatus =
  | 'requested' | 'approved' | 'rejected_request'
  | 'pickup_scheduled' | 'pickup_failed' | 'picked_up'
  | 'in_transit' | 'hub_received' | 'verified' | 'completed';

export type ReturnReason =
  | 'product_issue' | 'wrong_item_delivered' | 'damaged_in_transit'
  | 'customer_changed_mind' | 'delayed_delivery' | 'missing_item' | 'other';

export type ReconciliationDecision = 'refund' | 'replacement' | 'rejection';

export interface ReturnRecord {
  id: string;
  tracking: string;
  customer: string;
  hub: string;
  region: string;
  status: ReturnStatus;
  reason: ReturnReason;
  type: 'return' | 'exchange';
  driver: string;
  requestedAt: string;
  scheduledAt?: string;
  pickedUpAt?: string;
  reconciliation?: ReconciliationDecision;
  refundAmount?: number;
  daysOpen: number;
}

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0];

const HUBS = ['Delhi-Central','Bangalore-Central','Mumbai-Central','Chennai-Hub','Hyderabad-Hub','Kolkata-Central','Pune-Hub','Gurgaon-Hub'];
const REGION_MAP: Record<string,string> = {
  'Delhi-Central':'North','Gurgaon-Hub':'North',
  'Bangalore-Central':'South','Chennai-Hub':'South','Hyderabad-Hub':'South',
  'Kolkata-Central':'East','Mumbai-Central':'West','Pune-Hub':'West',
};
const REASONS: ReturnReason[] = ['product_issue','wrong_item_delivered','damaged_in_transit','customer_changed_mind','delayed_delivery','missing_item','other'];
const STATUSES: ReturnStatus[] = ['requested','approved','pickup_scheduled','pickup_failed','picked_up','in_transit','hub_received','verified','completed'];
const DRIVERS = ['Arjun Sharma','Priya Patel','Rahul Singh','Neha Gupta','Vikas Yadav','Deepak Kumar','Amit Verma','Kiran Pillai'];
const CUSTOMERS = ['Ravi Mehta','Sunita Roy','Arun Kumar','Pooja Sharma','Manoj Joshi','Divya Nair','Suresh Pillai','Aarti Singh','Vikram Das','Priya Reddy'];

export const RETURNS_RAW: ReturnRecord[] = Array.from({ length: 120 }, (_, i) => {
  const hub = pick(HUBS);
  const status = pick(STATUSES);
  const daysOpen = rnd(0, 14);
  return {
    id: `RET-${String(i + 1).padStart(4, '0')}`,
    tracking: `RS2024${String(10000 + i)}`,
    customer: pick(CUSTOMERS),
    hub,
    region: REGION_MAP[hub] ?? 'North',
    status,
    reason: pick(REASONS),
    type: Math.random() > 0.3 ? 'return' : 'exchange',
    driver: pick(DRIVERS),
    requestedAt: d(daysOpen),
    scheduledAt: status !== 'requested' ? d(daysOpen - 1) : undefined,
    pickedUpAt: ['picked_up','in_transit','hub_received','verified','completed'].includes(status) ? d(daysOpen - 2) : undefined,
    reconciliation: status === 'completed' ? pick(['refund','replacement','rejection'] as ReconciliationDecision[]) : undefined,
    refundAmount: status === 'completed' ? rnd(200, 3000) : undefined,
    daysOpen,
  };
});

// ─── Aggregated KPIs ──────────────────────────────────────────

export function getReturnsKPIs() {
  const total = RETURNS_RAW.length;
  const pending = RETURNS_RAW.filter(r => ['requested','approved','pickup_scheduled'].includes(r.status)).length;
  const pickupFailed = RETURNS_RAW.filter(r => r.status === 'pickup_failed').length;
  const completed = RETURNS_RAW.filter(r => r.status === 'completed').length;
  const refunded = RETURNS_RAW.filter(r => r.reconciliation === 'refund').length;
  const totalRefundValue = RETURNS_RAW.filter(r => r.refundAmount).reduce((s, r) => s + (r.refundAmount ?? 0), 0);
  const pickupRate = Math.round(((total - pickupFailed - pending) / total) * 100);
  return { total, pending, pickupFailed, completed, refunded, totalRefundValue, pickupRate };
}

export function getReturnsByStatus() {
  const map: Record<string, number> = {};
  for (const r of RETURNS_RAW) map[r.status] = (map[r.status] ?? 0) + 1;
  return Object.entries(map).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
}

export function getReturnsByReason() {
  const LABELS: Record<string, string> = {
    product_issue: 'Product Issue',
    wrong_item_delivered: 'Wrong Item',
    damaged_in_transit: 'Damaged',
    customer_changed_mind: 'Changed Mind',
    delayed_delivery: 'Late Delivery',
    missing_item: 'Missing Item',
    other: 'Other',
  };
  const map: Record<string, number> = {};
  for (const r of RETURNS_RAW) map[r.reason] = (map[r.reason] ?? 0) + 1;
  return Object.entries(map).map(([reason, count]) => ({ reason: LABELS[reason] ?? reason, count })).sort((a, b) => b.count - a.count);
}

export function getReturnsByHub() {
  const map: Record<string, { total: number; completed: number; failed: number }> = {};
  for (const r of RETURNS_RAW) {
    if (!map[r.hub]) map[r.hub] = { total: 0, completed: 0, failed: 0 };
    map[r.hub].total++;
    if (r.status === 'completed') map[r.hub].completed++;
    if (r.status === 'pickup_failed') map[r.hub].failed++;
  }
  return Object.entries(map).map(([hub, v]) => ({
    hub,
    total: v.total,
    completed: v.completed,
    failed: v.failed,
    pickupSuccessRate: Math.round(((v.total - v.failed) / v.total) * 100),
  })).sort((a, b) => b.total - a.total);
}

export function getReturnsDailyTrend() {
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date(Date.now() - (13 - i) * 86400000);
    return {
      date: `${day.getDate()}/${day.getMonth() + 1}`,
      requests: Math.floor(6 + Math.random() * 8),
      pickups: Math.floor(4 + Math.random() * 6),
      completed: Math.floor(2 + Math.random() * 5),
    };
  });
}

export function getReconciliationBreakdown() {
  const done = RETURNS_RAW.filter(r => r.reconciliation);
  const map: Record<string, number> = {};
  for (const r of done) map[r.reconciliation!] = (map[r.reconciliation!] ?? 0) + 1;
  return Object.entries(map).map(([decision, count]) => ({ decision, count }));
}
