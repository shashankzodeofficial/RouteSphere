/**
 * liveDataStore — simulates the WebSocket / polling layer that would connect
 * the RouteSphere backend to the Control Tower in production.
 *
 * Architecture:
 *   Delivery App  ──►  REST / WS  ──►  Backend  ──►  SSE / WS  ──►  Control Tower
 *
 * In this demo, a setInterval engine fires synthetic events at configurable
 * cadences and merges them into a shared Zustand store that every dashboard
 * subscribes to.  Swapping the interval for a real WebSocket client is a
 * one-line change (see `connectWebSocket` stub at the bottom).
 */

import { create } from 'zustand';

// ─── Event types ─────────────────────────────────────────────

export type EventType =
  | 'delivery_completed'
  | 'delivery_failed'
  | 'pickup_started'
  | 'return_picked_up'
  | 'return_hub_received'
  | 'return_reconciled'
  | 'incentive_triggered'
  | 'penalty_applied'
  | 'rating_received'
  | 'rider_status_change'
  | 'sos_alert'
  | 'shift_started'
  | 'shift_ended';

export interface LiveEvent {
  id: string;
  type: EventType;
  timestamp: string;
  rider: string;
  hub: string;
  region: string;
  payload: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
}

// ─── Aggregate counters (increment as events arrive) ─────────

export interface LiveKPIs {
  // Deliveries
  deliveriesToday: number;
  deliveriesFailed: number;
  deliveriesInTransit: number;
  successRateLive: number;

  // Returns
  returnsPickedUpToday: number;
  returnsAtHub: number;
  returnsReconciled: number;
  pickupFailuresToday: number;

  // Rider intelligence
  activeRiders: number;
  avgPerformanceScore: number;
  incentivesTotalToday: number;
  penaltiesTotalToday: number;
  ratingsReceivedToday: number;
  avgRatingToday: number;

  // Alerts
  openSosAlerts: number;
  shiftsActive: number;
}

// ─── Sync metadata ────────────────────────────────────────────

export interface SyncStatus {
  lastSyncAt: string | null;
  isConnected: boolean;
  pendingEvents: number;
  syncMode: 'websocket' | 'polling' | 'disconnected';
  pollIntervalMs: number;
  uptimeSeconds: number;
}

interface LiveDataState {
  events: LiveEvent[];
  kpis: LiveKPIs;
  sync: SyncStatus;
  tickCount: number;

  // Actions
  pushEvent: (event: LiveEvent) => void;
  setConnected: (v: boolean) => void;
  setPollInterval: (ms: number) => void;
  resetEvents: () => void;
  _tick: () => void;
}

// ─── Seed / initial KPIs ─────────────────────────────────────

const INITIAL_KPIS: LiveKPIs = {
  deliveriesToday: 1248,
  deliveriesFailed: 87,
  deliveriesInTransit: 342,
  successRateLive: 93.4,

  returnsPickedUpToday: 34,
  returnsAtHub: 18,
  returnsReconciled: 12,
  pickupFailuresToday: 3,

  activeRiders: 187,
  avgPerformanceScore: 82,
  incentivesTotalToday: 14800,
  penaltiesTotalToday: 2100,
  ratingsReceivedToday: 0,
  avgRatingToday: 4.4,

  openSosAlerts: 0,
  shiftsActive: 194,
};

// ─── Event generators ─────────────────────────────────────────

const RIDERS = ['Arjun Sharma','Priya Patel','Rahul Singh','Neha Gupta','Vikas Yadav','Deepak Kumar','Amit Verma','Kiran Pillai','Pooja Mishra','Kavya Reddy'];
const HUBS   = ['Delhi-Central','Bangalore-Central','Mumbai-Central','Chennai-Hub','Hyderabad-Hub','Kolkata-Central','Pune-Hub','Gurgaon-Hub'];
const REGION_MAP: Record<string,string> = {
  'Delhi-Central':'North','Gurgaon-Hub':'North',
  'Bangalore-Central':'South','Chennai-Hub':'South','Hyderabad-Hub':'South',
  'Kolkata-Central':'East','Mumbai-Central':'West','Pune-Hub':'West',
};
const TRACKING_PREFIXES = ['RS2024','RS2025','CT','DEL','MUM','BLR'];

let _uid = 1;
function uid() { return `EVT-${String(_uid++).padStart(5,'0')}`; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function ts() { return new Date().toISOString(); }

const EVENT_TEMPLATES: { type: EventType; weight: number; severity: LiveEvent['severity']; mkPayload: () => Record<string,unknown> }[] = [
  {
    type: 'delivery_completed', weight: 35, severity: 'info',
    mkPayload: () => ({ tracking: `${pick(TRACKING_PREFIXES)}${rnd(10000,99999)}`, cod: Math.random() > 0.4 ? rnd(200,2000) : 0, pod: pick(['photo','otp','signature']) }),
  },
  {
    type: 'delivery_failed', weight: 8, severity: 'warning',
    mkPayload: () => ({ tracking: `${pick(TRACKING_PREFIXES)}${rnd(10000,99999)}`, reason: pick(['customer_absent','wrong_address','refused','rescheduled']) }),
  },
  {
    type: 'pickup_started', weight: 12, severity: 'info',
    mkPayload: () => ({ returnId: `RET-${rnd(1000,9999)}`, customer: pick(['Ravi Mehta','Sunita Roy','Arun Kumar','Pooja Sharma']) }),
  },
  {
    type: 'return_picked_up', weight: 10, severity: 'info',
    mkPayload: () => ({ returnId: `RET-${rnd(1000,9999)}`, photos: rnd(1,3) }),
  },
  {
    type: 'return_hub_received', weight: 6, severity: 'info',
    mkPayload: () => ({ returnId: `RET-${rnd(1000,9999)}`, condition: pick(['good','damaged','wrong_item']) }),
  },
  {
    type: 'return_reconciled', weight: 5, severity: 'info',
    mkPayload: () => ({ returnId: `RET-${rnd(1000,9999)}`, decision: pick(['refund','replacement','rejection']), amount: rnd(200,3000) }),
  },
  {
    type: 'incentive_triggered', weight: 8, severity: 'info',
    mkPayload: () => ({ rule: pick(['On-Time Bonus','Perfect Day','7-Day Streak','Return Pickup Bonus']), amount: pick([80,100,150,200]) }),
  },
  {
    type: 'penalty_applied', weight: 3, severity: 'warning',
    mkPayload: () => ({ reason: pick(['missed_pickup','late_delivery','pod_missing']), amount: rnd(30,100) }),
  },
  {
    type: 'rating_received', weight: 8, severity: 'info',
    mkPayload: () => ({ stars: pick([5,5,5,4,4,3]), source: pick(['customer','hub','ops']), comment: Math.random() > 0.6 ? pick(['Great service!','Polite and fast','On time']) : undefined }),
  },
  {
    type: 'rider_status_change', weight: 4, severity: 'info',
    mkPayload: () => ({ from: pick(['idle','active']), to: pick(['active','idle','offline']), batteryPct: rnd(15,100) }),
  },
  {
    type: 'sos_alert', weight: 0.5, severity: 'critical',
    mkPayload: () => ({ lat: 12.9716 + (Math.random() - 0.5) * 0.1, lng: 77.5946 + (Math.random() - 0.5) * 0.1, message: 'SOS activated by rider' }),
  },
  {
    type: 'shift_started', weight: 0.5, severity: 'info',
    mkPayload: () => ({ shiftId: `SHF-${rnd(1000,9999)}` }),
  },
  {
    type: 'shift_ended', weight: 0.5, severity: 'info',
    mkPayload: () => ({ shiftId: `SHF-${rnd(1000,9999)}`, totalDeliveries: rnd(8,22), hoursWorked: rnd(5,10) }),
  },
];

const TOTAL_WEIGHT = EVENT_TEMPLATES.reduce((s, t) => s + t.weight, 0);

function generateEvent(): LiveEvent {
  let r = Math.random() * TOTAL_WEIGHT;
  let template = EVENT_TEMPLATES[0];
  for (const t of EVENT_TEMPLATES) {
    r -= t.weight;
    if (r <= 0) { template = t; break; }
  }
  const hub = pick(HUBS);
  return {
    id: uid(),
    type: template.type,
    timestamp: ts(),
    rider: pick(RIDERS),
    hub,
    region: REGION_MAP[hub] ?? 'North',
    payload: template.mkPayload(),
    severity: template.severity,
  };
}

// ─── KPI updater ──────────────────────────────────────────────

function applyEventToKPIs(kpis: LiveKPIs, event: LiveEvent): LiveKPIs {
  const k = { ...kpis };
  switch (event.type) {
    case 'delivery_completed':
      k.deliveriesToday++;
      k.deliveriesInTransit = Math.max(0, k.deliveriesInTransit - 1);
      k.successRateLive = parseFloat(((k.deliveriesToday / (k.deliveriesToday + k.deliveriesFailed)) * 100).toFixed(1));
      break;
    case 'delivery_failed':
      k.deliveriesFailed++;
      k.deliveriesInTransit = Math.max(0, k.deliveriesInTransit - 1);
      k.successRateLive = parseFloat(((k.deliveriesToday / (k.deliveriesToday + k.deliveriesFailed)) * 100).toFixed(1));
      break;
    case 'pickup_started':
      k.deliveriesInTransit++;
      break;
    case 'return_picked_up':
      k.returnsPickedUpToday++;
      break;
    case 'return_hub_received':
      k.returnsAtHub++;
      break;
    case 'return_reconciled':
      k.returnsReconciled++;
      k.returnsAtHub = Math.max(0, k.returnsAtHub - 1);
      break;
    case 'incentive_triggered':
      k.incentivesTotalToday += (event.payload.amount as number) ?? 100;
      break;
    case 'penalty_applied':
      k.penaltiesTotalToday += (event.payload.amount as number) ?? 50;
      break;
    case 'rating_received':
      k.ratingsReceivedToday++;
      // rolling avg approximation
      k.avgRatingToday = parseFloat(((k.avgRatingToday * (k.ratingsReceivedToday - 1) + ((event.payload.stars as number) ?? 4)) / k.ratingsReceivedToday).toFixed(1));
      break;
    case 'rider_status_change':
      if ((event.payload.to as string) === 'active') k.activeRiders++;
      else if ((event.payload.from as string) === 'active') k.activeRiders = Math.max(0, k.activeRiders - 1);
      break;
    case 'sos_alert':
      k.openSosAlerts++;
      break;
    case 'shift_started':
      k.shiftsActive++;
      break;
    case 'shift_ended':
      k.shiftsActive = Math.max(0, k.shiftsActive - 1);
      break;
  }
  return k;
}

// ─── Zustand store ────────────────────────────────────────────

const MAX_EVENTS = 200;

export const useLiveDataStore = create<LiveDataState>((set, get) => ({
  events: [],
  kpis: { ...INITIAL_KPIS },
  sync: {
    lastSyncAt: null,
    isConnected: true,
    pendingEvents: 0,
    syncMode: 'polling',
    pollIntervalMs: 3000,
    uptimeSeconds: 0,
  },
  tickCount: 0,

  pushEvent: (event) => set(s => ({
    events: [event, ...s.events].slice(0, MAX_EVENTS),
    kpis: applyEventToKPIs(s.kpis, event),
    sync: { ...s.sync, lastSyncAt: event.timestamp },
  })),

  setConnected: (v) => set(s => ({ sync: { ...s.sync, isConnected: v, syncMode: v ? 'polling' : 'disconnected' } })),

  setPollInterval: (ms) => set(s => ({ sync: { ...s.sync, pollIntervalMs: ms } })),

  resetEvents: () => set({ events: [] }),

  _tick: () => {
    const { pushEvent } = get();
    // Generate 1–3 events per tick to simulate burst traffic
    const count = Math.random() < 0.3 ? rnd(2, 3) : 1;
    for (let i = 0; i < count; i++) pushEvent(generateEvent());
    set(s => ({
      tickCount: s.tickCount + 1,
      sync: { ...s.sync, uptimeSeconds: s.sync.uptimeSeconds + Math.round(s.sync.pollIntervalMs / 1000) },
    }));
  },
}));

// ─── Engine bootstrap (call once from App.tsx) ────────────────

let _engineHandle: ReturnType<typeof setInterval> | null = null;

export function startLiveEngine() {
  if (_engineHandle) return;
  const { _tick, sync } = useLiveDataStore.getState();
  _engineHandle = setInterval(() => {
    useLiveDataStore.getState()._tick();
  }, sync.pollIntervalMs);
}

export function stopLiveEngine() {
  if (_engineHandle) { clearInterval(_engineHandle); _engineHandle = null; }
}

export function restartLiveEngine(intervalMs: number) {
  stopLiveEngine();
  useLiveDataStore.getState().setPollInterval(intervalMs);
  _engineHandle = setInterval(() => {
    useLiveDataStore.getState()._tick();
  }, intervalMs);
}

/**
 * Production stub — swap the setInterval engine for a real WebSocket:
 *
 * export function connectWebSocket(url: string) {
 *   const ws = new WebSocket(url);
 *   ws.onmessage = (msg) => {
 *     const event: LiveEvent = JSON.parse(msg.data);
 *     useLiveDataStore.getState().pushEvent(event);
 *   };
 *   ws.onopen  = () => useLiveDataStore.getState().setConnected(true);
 *   ws.onclose = () => useLiveDataStore.getState().setConnected(false);
 * }
 */
