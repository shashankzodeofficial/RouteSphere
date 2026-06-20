/**
 * demoData — deterministic 30-day historical dataset for the RouteSphere Demo Environment.
 *
 * All data is synthetic. No real customers, drivers, or orders.
 * Designed to impress recruiters, investors, and customers with realistic metrics.
 */

// ─── Customers ────────────────────────────────────────────────────────────────

export interface DemoCustomer {
  id: string;
  name: string;
  segment: 'enterprise' | 'mid-market' | 'smb';
  city: string;
  ordersThisMonth: number;
  revenueThisMonth: number;
  onTimeRate: number;
}

export const DEMO_CUSTOMERS: DemoCustomer[] = [
  { id: 'C001', name: 'FreshMart Supermarkets',    segment: 'enterprise',  city: 'Mumbai',    ordersThisMonth: 487, revenueThisMonth: 243500, onTimeRate: 94.1 },
  { id: 'C002', name: 'MediQuick Pharmacy Chain',  segment: 'enterprise',  city: 'Delhi',     ordersThisMonth: 362, revenueThisMonth: 181000, onTimeRate: 97.2 },
  { id: 'C003', name: 'TechZone Electronics',      segment: 'enterprise',  city: 'Bangalore', ordersThisMonth: 298, revenueThisMonth: 596000, onTimeRate: 91.6 },
  { id: 'C004', name: 'StyleHub Fashion',          segment: 'mid-market',  city: 'Hyderabad', ordersThisMonth: 214, revenueThisMonth: 107000, onTimeRate: 88.3 },
  { id: 'C005', name: 'HomeNest Furniture',        segment: 'mid-market',  city: 'Pune',      ordersThisMonth: 143, revenueThisMonth: 357500, onTimeRate: 85.7 },
  { id: 'C006', name: 'QuickBite Cloud Kitchen',   segment: 'enterprise',  city: 'Mumbai',    ordersThisMonth: 521, revenueThisMonth: 130250, onTimeRate: 92.4 },
  { id: 'C007', name: 'BookWorld Publishers',      segment: 'smb',         city: 'Chennai',   ordersThisMonth: 89,  revenueThisMonth: 22250, onTimeRate: 96.6 },
  { id: 'C008', name: 'PharmaPlus Distributors',   segment: 'enterprise',  city: 'Delhi',     ordersThisMonth: 411, revenueThisMonth: 205500, onTimeRate: 98.1 },
  { id: 'C009', name: 'GadgetWorld Online',        segment: 'mid-market',  city: 'Bangalore', ordersThisMonth: 176, revenueThisMonth: 440000, onTimeRate: 89.2 },
  { id: 'C010', name: 'OrganicBasket',             segment: 'smb',         city: 'Pune',      ordersThisMonth: 94,  revenueThisMonth: 23500, onTimeRate: 93.6 },
  { id: 'C011', name: 'AutoParts Express',         segment: 'mid-market',  city: 'Hyderabad', ordersThisMonth: 167, revenueThisMonth: 334000, onTimeRate: 86.8 },
  { id: 'C012', name: 'DailyNeeds FMCG',          segment: 'enterprise',  city: 'Mumbai',    ordersThisMonth: 633, revenueThisMonth: 158250, onTimeRate: 91.1 },
  { id: 'C013', name: 'KidZone Toys',              segment: 'smb',         city: 'Jaipur',    ordersThisMonth: 72,  revenueThisMonth: 36000, onTimeRate: 90.3 },
  { id: 'C014', name: 'SportsFit Equipment',       segment: 'mid-market',  city: 'Bangalore', ordersThisMonth: 128, revenueThisMonth: 384000, onTimeRate: 87.5 },
  { id: 'C015', name: 'BakeBest Confectionery',    segment: 'smb',         city: 'Chennai',   ordersThisMonth: 58,  revenueThisMonth: 14500, onTimeRate: 94.8 },
];

// ─── Drivers ──────────────────────────────────────────────────────────────────

export interface DemoDriver {
  id: string;
  name: string;
  hub: string;
  city: string;
  rating: number;
  deliveriesToday: number;
  deliveriesMonth: number;
  onTimeRate: number;
  status: 'active' | 'idle' | 'offline';
  vehicle: string;
  experience: string;
  badge: string;
}

export const DEMO_DRIVERS: DemoDriver[] = [
  { id: 'D001', name: 'Rahul Sharma',     hub: 'Andheri Hub',     city: 'Mumbai',    rating: 4.9, deliveriesToday: 18, deliveriesMonth: 487, onTimeRate: 97.3, status: 'active',  vehicle: 'MH-02-AB-1234', experience: '3.2 yrs', badge: 'Elite Performer' },
  { id: 'D002', name: 'Priya Verma',      hub: 'Connaught Hub',   city: 'Delhi',     rating: 4.8, deliveriesToday: 21, deliveriesMonth: 512, onTimeRate: 95.7, status: 'active',  vehicle: 'DL-05-CD-5678', experience: '2.8 yrs', badge: 'Star Rider' },
  { id: 'D003', name: 'Arun Kumar',       hub: 'Koramangala Hub', city: 'Bangalore', rating: 4.7, deliveriesToday: 15, deliveriesMonth: 398, onTimeRate: 93.4, status: 'active',  vehicle: 'KA-01-EF-9012', experience: '1.9 yrs', badge: 'Rising Star' },
  { id: 'D004', name: 'Sneha Patil',      hub: 'Baner Hub',       city: 'Pune',      rating: 4.8, deliveriesToday: 19, deliveriesMonth: 441, onTimeRate: 96.2, status: 'active',  vehicle: 'MH-12-GH-3456', experience: '2.4 yrs', badge: 'Star Rider' },
  { id: 'D005', name: 'Mohammed Irfan',   hub: 'Hitec City Hub',  city: 'Hyderabad', rating: 4.6, deliveriesToday: 14, deliveriesMonth: 356, onTimeRate: 91.8, status: 'active',  vehicle: 'TS-09-IJ-7890', experience: '1.5 yrs', badge: 'Consistent' },
  { id: 'D006', name: 'Kavitha Rajan',    hub: 'Anna Nagar Hub',  city: 'Chennai',   rating: 4.9, deliveriesToday: 22, deliveriesMonth: 534, onTimeRate: 98.1, status: 'active',  vehicle: 'TN-22-KL-1234', experience: '4.1 yrs', badge: 'Elite Performer' },
  { id: 'D007', name: 'Vikram Singh',     hub: 'Andheri Hub',     city: 'Mumbai',    rating: 4.5, deliveriesToday: 13, deliveriesMonth: 312, onTimeRate: 88.6, status: 'idle',    vehicle: 'MH-04-MN-5678', experience: '1.1 yrs', badge: 'On Track' },
  { id: 'D008', name: 'Deepa Nair',       hub: 'Whitefield Hub',  city: 'Bangalore', rating: 4.7, deliveriesToday: 17, deliveriesMonth: 423, onTimeRate: 94.9, status: 'active',  vehicle: 'KA-53-OP-9012', experience: '2.1 yrs', badge: 'Star Rider' },
  { id: 'D009', name: 'Suresh Yadav',     hub: 'Connaught Hub',   city: 'Delhi',     rating: 4.4, deliveriesToday: 11, deliveriesMonth: 287, onTimeRate: 86.3, status: 'active',  vehicle: 'DL-08-QR-3456', experience: '0.9 yrs', badge: 'Growing' },
  { id: 'D010', name: 'Ananya Das',       hub: 'Baner Hub',       city: 'Pune',      rating: 4.8, deliveriesToday: 20, deliveriesMonth: 468, onTimeRate: 96.8, status: 'active',  vehicle: 'MH-14-ST-7890', experience: '2.7 yrs', badge: 'Star Rider' },
  { id: 'D011', name: 'Ravi Teja',        hub: 'Hitec City Hub',  city: 'Hyderabad', rating: 4.6, deliveriesToday: 16, deliveriesMonth: 378, onTimeRate: 92.5, status: 'active',  vehicle: 'TS-11-UV-1234', experience: '1.7 yrs', badge: 'Consistent' },
  { id: 'D012', name: 'Meera Krishnan',   hub: 'Anna Nagar Hub',  city: 'Chennai',   rating: 4.7, deliveriesToday: 18, deliveriesMonth: 445, onTimeRate: 95.1, status: 'active',  vehicle: 'TN-11-WX-5678', experience: '2.3 yrs', badge: 'Star Rider' },
  { id: 'D013', name: 'Amit Joshi',       hub: 'Andheri Hub',     city: 'Mumbai',    rating: 4.3, deliveriesToday: 10, deliveriesMonth: 267, onTimeRate: 84.1, status: 'offline', vehicle: 'MH-01-YZ-9012', experience: '0.7 yrs', badge: 'Developing' },
  { id: 'D014', name: 'Pooja Mehta',      hub: 'Koramangala Hub', city: 'Bangalore', rating: 4.9, deliveriesToday: 23, deliveriesMonth: 556, onTimeRate: 97.8, status: 'active',  vehicle: 'KA-04-AA-3456', experience: '3.8 yrs', badge: 'Elite Performer' },
  { id: 'D015', name: 'Sanjay Gupta',     hub: 'Connaught Hub',   city: 'Delhi',     rating: 4.5, deliveriesToday: 14, deliveriesMonth: 334, onTimeRate: 89.5, status: 'active',  vehicle: 'DL-12-BB-7890', experience: '1.3 yrs', badge: 'On Track' },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export interface DemoVehicle {
  id: string;
  plate: string;
  type: 'two-wheeler' | 'three-wheeler' | 'van' | 'mini-truck';
  fuel: 'petrol' | 'electric' | 'cng' | 'diesel';
  capacity: number;
  hub: string;
  city: string;
  status: 'on-route' | 'available' | 'maintenance' | 'charging';
  utilizationPct: number;
  kmThisMonth: number;
  driver: string;
}

export const DEMO_VEHICLES: DemoVehicle[] = [
  { id: 'V001', plate: 'MH-02-AB-1234', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Andheri Hub',     city: 'Mumbai',    status: 'on-route',    utilizationPct: 92, kmThisMonth: 2840, driver: 'Rahul Sharma' },
  { id: 'V002', plate: 'DL-05-CD-5678', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Connaught Hub',   city: 'Delhi',     status: 'on-route',    utilizationPct: 88, kmThisMonth: 2610, driver: 'Priya Verma' },
  { id: 'V003', plate: 'KA-01-EF-9012', type: 'two-wheeler',   fuel: 'petrol',   capacity: 15,  hub: 'Koramangala Hub', city: 'Bangalore', status: 'on-route',    utilizationPct: 79, kmThisMonth: 2240, driver: 'Arun Kumar' },
  { id: 'V004', plate: 'MH-12-GH-3456', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Baner Hub',       city: 'Pune',      status: 'on-route',    utilizationPct: 85, kmThisMonth: 2480, driver: 'Sneha Patil' },
  { id: 'V005', plate: 'TS-09-IJ-7890', type: 'two-wheeler',   fuel: 'petrol',   capacity: 15,  hub: 'Hitec City Hub',  city: 'Hyderabad', status: 'on-route',    utilizationPct: 74, kmThisMonth: 2090, driver: 'Mohammed Irfan' },
  { id: 'V006', plate: 'TN-22-KL-1234', type: 'three-wheeler', fuel: 'cng',      capacity: 100, hub: 'Anna Nagar Hub',  city: 'Chennai',   status: 'on-route',    utilizationPct: 95, kmThisMonth: 3120, driver: 'Kavitha Rajan' },
  { id: 'V007', plate: 'MH-04-MN-5678', type: 'two-wheeler',   fuel: 'petrol',   capacity: 15,  hub: 'Andheri Hub',     city: 'Mumbai',    status: 'available',   utilizationPct: 67, kmThisMonth: 1840, driver: 'Vikram Singh' },
  { id: 'V008', plate: 'KA-53-OP-9012', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Whitefield Hub',  city: 'Bangalore', status: 'on-route',    utilizationPct: 81, kmThisMonth: 2310, driver: 'Deepa Nair' },
  { id: 'V009', plate: 'DL-08-QR-3456', type: 'three-wheeler', fuel: 'electric', capacity: 120, hub: 'Connaught Hub',   city: 'Delhi',     status: 'on-route',    utilizationPct: 71, kmThisMonth: 2080, driver: 'Suresh Yadav' },
  { id: 'V010', plate: 'MH-14-ST-7890', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Baner Hub',       city: 'Pune',      status: 'on-route',    utilizationPct: 89, kmThisMonth: 2560, driver: 'Ananya Das' },
  { id: 'V011', plate: 'TS-11-UV-1234', type: 'two-wheeler',   fuel: 'petrol',   capacity: 15,  hub: 'Hitec City Hub',  city: 'Hyderabad', status: 'available',   utilizationPct: 76, kmThisMonth: 2130, driver: 'Ravi Teja' },
  { id: 'V012', plate: 'TN-11-WX-5678', type: 'van',           fuel: 'diesel',   capacity: 500, hub: 'Anna Nagar Hub',  city: 'Chennai',   status: 'on-route',    utilizationPct: 83, kmThisMonth: 3280, driver: 'Meera Krishnan' },
  { id: 'V013', plate: 'MH-01-YZ-9012', type: 'two-wheeler',   fuel: 'petrol',   capacity: 15,  hub: 'Andheri Hub',     city: 'Mumbai',    status: 'maintenance', utilizationPct: 58, kmThisMonth: 1620, driver: 'Amit Joshi' },
  { id: 'V014', plate: 'KA-04-AA-3456', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Koramangala Hub', city: 'Bangalore', status: 'on-route',    utilizationPct: 94, kmThisMonth: 2780, driver: 'Pooja Mehta' },
  { id: 'V015', plate: 'DL-12-BB-7890', type: 'three-wheeler', fuel: 'cng',      capacity: 100, hub: 'Connaught Hub',   city: 'Delhi',     status: 'on-route',    utilizationPct: 78, kmThisMonth: 2190, driver: 'Sanjay Gupta' },
  { id: 'V016', plate: 'MH-03-CC-1111', type: 'van',           fuel: 'diesel',   capacity: 500, hub: 'Andheri Hub',     city: 'Mumbai',    status: 'available',   utilizationPct: 62, kmThisMonth: 1980, driver: '—' },
  { id: 'V017', plate: 'KA-02-DD-2222', type: 'mini-truck',    fuel: 'diesel',   capacity: 1000,hub: 'Whitefield Hub',  city: 'Bangalore', status: 'on-route',    utilizationPct: 87, kmThisMonth: 4210, driver: '—' },
  { id: 'V018', plate: 'DL-04-EE-3333', type: 'two-wheeler',   fuel: 'electric', capacity: 20,  hub: 'Rohini Hub',      city: 'Delhi',     status: 'charging',    utilizationPct: 45, kmThisMonth: 1340, driver: '—' },
];

// ─── Hubs ─────────────────────────────────────────────────────────────────────

export interface DemoHub {
  id: string;
  name: string;
  city: string;
  activeRiders: number;
  pendingOrders: number;
  completedToday: number;
  utilizationPct: number;
}

export const DEMO_HUBS: DemoHub[] = [
  { id: 'H001', name: 'Andheri Hub',      city: 'Mumbai',    activeRiders: 42, pendingOrders: 87,  completedToday: 213, utilizationPct: 89 },
  { id: 'H002', name: 'Connaught Hub',    city: 'Delhi',     activeRiders: 38, pendingOrders: 74,  completedToday: 198, utilizationPct: 83 },
  { id: 'H003', name: 'Koramangala Hub',  city: 'Bangalore', activeRiders: 35, pendingOrders: 61,  completedToday: 174, utilizationPct: 78 },
  { id: 'H004', name: 'Baner Hub',        city: 'Pune',      activeRiders: 28, pendingOrders: 52,  completedToday: 141, utilizationPct: 74 },
  { id: 'H005', name: 'Hitec City Hub',   city: 'Hyderabad', activeRiders: 31, pendingOrders: 58,  completedToday: 156, utilizationPct: 76 },
  { id: 'H006', name: 'Anna Nagar Hub',   city: 'Chennai',   activeRiders: 33, pendingOrders: 65,  completedToday: 167, utilizationPct: 81 },
  { id: 'H007', name: 'Whitefield Hub',   city: 'Bangalore', activeRiders: 26, pendingOrders: 44,  completedToday: 128, utilizationPct: 69 },
  { id: 'H008', name: 'Rohini Hub',       city: 'Delhi',     activeRiders: 29, pendingOrders: 56,  completedToday: 143, utilizationPct: 72 },
];

// ─── 30-Day Historical Data ───────────────────────────────────────────────────

export interface DailyMetric {
  date: string;            // YYYY-MM-DD
  dayLabel: string;        // 'Jun 1'
  ordersPlaced: number;
  ordersDelivered: number;
  ordersFailed: number;
  ordersInTransit: number;
  onTimePct: number;
  podCompliancePct: number;
  revenue: number;
  avgDeliveryMinutes: number;
  activeRiders: number;
  fleetUtilizationPct: number;
  returnsCreated: number;
  returnsResolved: number;
  newCustomers: number;
}

function generateDailyData(): DailyMetric[] {
  const days: DailyMetric[] = [];
  const baseDate = new Date('2026-05-21');

  // Seed values that grow over 30 days with realistic weekend dips and weekly peaks
  const baseOrders    = 980;
  const growthPerDay  = 8.4;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dow = d.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const isFriday  = dow === 5;

    // Volume: weekends -18%, friday +12%, gradual growth
    const volumeMultiplier = isWeekend ? 0.82 : isFriday ? 1.12 : 1.0;
    const orders = Math.round((baseOrders + growthPerDay * i) * volumeMultiplier);

    // Success rate improves slightly over time (ops improvement narrative)
    const onTimePct = Math.min(96.5, 84.2 + i * 0.41 + (isWeekend ? -1.2 : 0));
    const failRate  = Math.max(0.04, 0.102 - i * 0.0018);

    const delivered   = Math.round(orders * (1 - failRate) * 0.91);
    const failed      = Math.round(orders * failRate);
    const inTransit   = orders - delivered - failed;
    const revenue     = delivered * (182 + i * 1.4);          // avg order value grows
    const avgMinutes  = Math.max(28, 44 - i * 0.42 + (isWeekend ? 3 : 0));
    const riders      = Math.round(180 + i * 2.2 * volumeMultiplier);
    const utilPct     = Math.min(94, 71 + i * 0.6 - (isWeekend ? 5 : 0));
    const returns     = Math.round(orders * 0.062);
    const resolved    = Math.round(returns * 0.84);
    const newCust     = isWeekend ? Math.round(2 + Math.random() * 2) : Math.round(4 + Math.random() * 4);

    const dateStr  = d.toISOString().split('T')[0];
    const dayLabel = `${MONTHS[d.getMonth()]} ${d.getDate()}`;

    days.push({
      date: dateStr,
      dayLabel,
      ordersPlaced:         orders,
      ordersDelivered:      delivered,
      ordersFailed:         failed,
      ordersInTransit:      Math.max(0, inTransit),
      onTimePct:            Math.round(onTimePct * 10) / 10,
      podCompliancePct:     Math.min(99.1, 90.4 + i * 0.28),
      revenue:              Math.round(revenue),
      avgDeliveryMinutes:   Math.round(avgMinutes),
      activeRiders:         riders,
      fleetUtilizationPct:  Math.round(utilPct * 10) / 10,
      returnsCreated:       returns,
      returnsResolved:      resolved,
      newCustomers:         newCust,
    });
  }
  return days;
}

export const DEMO_DAILY_DATA: DailyMetric[] = generateDailyData();

// ─── Aggregated 30-Day KPIs ───────────────────────────────────────────────────

export interface DemoKPIs {
  totalOrders:          number;
  totalDelivered:       number;
  totalFailed:          number;
  successRate:          number;
  onTimeRate:           number;
  podCompliance:        number;
  totalRevenue:         number;
  revenueGrowthPct:     number;   // vs prior 30 days
  avgDeliveryMinutes:   number;
  totalRiders:          number;
  activeRidersToday:    number;
  fleetUtilization:     number;
  totalVehicles:        number;
  vehiclesOnRoute:      number;
  totalReturns:         number;
  returnRecoveryRate:   number;
  totalCustomers:       number;
  newCustomers30d:      number;
  hubCount:             number;
  citiesCovered:        number;
  avgRiderRating:       number;
  totalIncentivesPaid:  number;
  costPerDelivery:      number;
}

function computeKPIs(): DemoKPIs {
  const d = DEMO_DAILY_DATA;
  const totalOrders    = d.reduce((s, r) => s + r.ordersPlaced,    0);
  const totalDelivered = d.reduce((s, r) => s + r.ordersDelivered, 0);
  const totalFailed    = d.reduce((s, r) => s + r.ordersFailed,    0);
  const totalRevenue   = d.reduce((s, r) => s + r.revenue,         0);
  const totalReturns   = d.reduce((s, r) => s + r.returnsCreated,  0);
  const totalResolved  = d.reduce((s, r) => s + r.returnsResolved, 0);
  const avgOnTime      = d.reduce((s, r) => s + r.onTimePct,       0) / d.length;
  const avgPOD         = d.reduce((s, r) => s + r.podCompliancePct,0) / d.length;
  const avgMins        = d.reduce((s, r) => s + r.avgDeliveryMinutes, 0) / d.length;
  const avgUtil        = d.reduce((s, r) => s + r.fleetUtilizationPct, 0) / d.length;
  const newCust        = d.reduce((s, r) => s + r.newCustomers,    0);

  // First 15 vs last 15 days for growth
  const firstHalf  = d.slice(0, 15).reduce((s, r) => s + r.revenue, 0);
  const secondHalf = d.slice(15).reduce((s, r) => s + r.revenue,    0);
  const growth     = ((secondHalf - firstHalf) / firstHalf) * 100;

  return {
    totalOrders,
    totalDelivered,
    totalFailed,
    successRate:         Math.round((totalDelivered / totalOrders) * 1000) / 10,
    onTimeRate:          Math.round(avgOnTime * 10) / 10,
    podCompliance:       Math.round(avgPOD * 10) / 10,
    totalRevenue,
    revenueGrowthPct:    Math.round(growth * 10) / 10,
    avgDeliveryMinutes:  Math.round(avgMins),
    totalRiders:         847,
    activeRidersToday:   187,
    fleetUtilization:    Math.round(avgUtil * 10) / 10,
    totalVehicles:       DEMO_VEHICLES.length,
    vehiclesOnRoute:     DEMO_VEHICLES.filter(v => v.status === 'on-route').length,
    totalReturns,
    returnRecoveryRate:  Math.round((totalResolved / totalReturns) * 1000) / 10,
    totalCustomers:      DEMO_CUSTOMERS.length,
    newCustomers30d:     newCust,
    hubCount:            DEMO_HUBS.length,
    citiesCovered:       23,
    avgRiderRating:      4.72,
    totalIncentivesPaid: Math.round(totalDelivered * 12.4),
    costPerDelivery:     38,
  };
}

export const DEMO_KPIS: DemoKPIs = computeKPIs();

// ─── Live Orders (today) ──────────────────────────────────────────────────────

export interface DemoOrder {
  id: string;
  awb: string;
  customer: string;
  recipient: string;
  origin: string;
  destination: string;
  status: 'delivered' | 'in_transit' | 'failed' | 'pending' | 'out_for_delivery';
  driver: string;
  vehicle: string;
  dispatchTime: string;
  deliveredTime: string | null;
  eta: string;
  weight: number;
  value: number;
  podCaptured: boolean;
}

const STATUS_OPTIONS: DemoOrder['status'][] = [
  'delivered','delivered','delivered','delivered','delivered','delivered','delivered',
  'out_for_delivery','out_for_delivery','out_for_delivery',
  'in_transit','in_transit',
  'pending',
  'failed',
];

function pickFrom<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

const RECIPIENTS = [
  'Rajesh Kumar','Sunita Sharma','Amit Patel','Priya Singh','Vikash Gupta',
  'Meena Reddy','Suresh Nair','Anita Joshi','Deepak Mehta','Rekha Yadav',
  'Mohan Das','Lata Iyer','Vinod Tiwari','Kavya Pillai','Arjun Nambiar',
];

const AREAS = [
  'Andheri West','Bandra East','Koramangala 5th Block','Indiranagar','Baner Road',
  'Hitec City','Anna Nagar','Rohini Sector 14','Whitefield','Connaught Place',
  'Juhu','Powai','HSR Layout','Viman Nagar','Madhapur',
];

export const DEMO_LIVE_ORDERS: DemoOrder[] = Array.from({ length: 40 }, (_, i) => {
  const status = pickFrom(STATUS_OPTIONS, i * 7 + 3);
  const driver = pickFrom(DEMO_DRIVERS, i).name;
  const vehicle = pickFrom(DEMO_VEHICLES, i).plate;
  const customer = pickFrom(DEMO_CUSTOMERS, i).name;
  const dispatchH = 7 + (i % 10);
  const dispatchM = (i * 13) % 60;
  return {
    id:           `ORD-2026-${(10000 + i).toString()}`,
    awb:          `RS${(100000000 + i * 7919).toString().slice(0, 9)}`,
    customer,
    recipient:    pickFrom(RECIPIENTS, i),
    origin:       pickFrom(DEMO_HUBS, i).name,
    destination:  `${pickFrom(AREAS, i + 5)}, ${pickFrom(DEMO_HUBS, i).city}`,
    status,
    driver,
    vehicle,
    dispatchTime: `${dispatchH.toString().padStart(2,'0')}:${dispatchM.toString().padStart(2,'0')}`,
    deliveredTime: status === 'delivered' ? `${(dispatchH + 1 + (i % 2)).toString().padStart(2,'0')}:${((dispatchM + 27) % 60).toString().padStart(2,'0')}` : null,
    eta:          `${(dispatchH + 2).toString().padStart(2,'0')}:${((dispatchM + 15) % 60).toString().padStart(2,'0')}`,
    weight:       Math.round((0.3 + (i % 15) * 0.8) * 10) / 10,
    value:        150 + (i * 137) % 4850,
    podCaptured:  status === 'delivered' && i % 11 !== 0,
  };
});

// ─── City performance summary ─────────────────────────────────────────────────

export interface CityPerformance {
  city: string;
  orders30d: number;
  onTimePct: number;
  activeRiders: number;
  revenue30d: number;
  trend: 'up' | 'down' | 'stable';
}

export const DEMO_CITY_PERFORMANCE: CityPerformance[] = [
  { city: 'Mumbai',    orders30d: 12840, onTimePct: 92.4, activeRiders: 248, revenue30d: 2568000, trend: 'up' },
  { city: 'Delhi',     orders30d: 10720, onTimePct: 89.7, activeRiders: 197, revenue30d: 2144000, trend: 'up' },
  { city: 'Bangalore', orders30d: 9480,  onTimePct: 91.2, activeRiders: 174, revenue30d: 1896000, trend: 'stable' },
  { city: 'Pune',      orders30d: 6340,  onTimePct: 93.8, activeRiders: 116, revenue30d: 1268000, trend: 'up' },
  { city: 'Hyderabad', orders30d: 7210,  onTimePct: 88.4, activeRiders: 132, revenue30d: 1442000, trend: 'stable' },
  { city: 'Chennai',   orders30d: 8120,  onTimePct: 94.6, activeRiders: 149, revenue30d: 1624000, trend: 'up' },
];
