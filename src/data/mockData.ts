import type { Order, Rider, Hub, DailyMetric } from '../types';

export const REGIONS = ['All Regions', 'North', 'South', 'East', 'West'];
export const HUBS: Record<string, string[]> = {
  'All Regions': ['All Hubs'],
  North: ['All Hubs', 'Delhi-Central', 'Delhi-North', 'Gurgaon-Hub', 'Noida-Hub'],
  South: ['All Hubs', 'Bangalore-Central', 'Chennai-Hub', 'Hyderabad-Hub'],
  East: ['All Hubs', 'Kolkata-Central', 'Bhubaneswar-Hub', 'Patna-Hub'],
  West: ['All Hubs', 'Mumbai-Central', 'Pune-Hub', 'Ahmedabad-Hub'],
};
export const CITIES: Record<string, string[]> = {
  'All Hubs': ['All Cities'],
  'Delhi-Central': ['All Cities', 'Connaught Place', 'Karol Bagh', 'Lajpat Nagar'],
  'Delhi-North': ['All Cities', 'Rohini', 'Pitampura', 'Shalimar Bagh'],
  'Gurgaon-Hub': ['All Cities', 'DLF Phase 1', 'Sector 29', 'Golf Course Rd'],
  'Noida-Hub': ['All Cities', 'Sector 18', 'Sector 62', 'Greater Noida'],
  'Bangalore-Central': ['All Cities', 'Koramangala', 'Indiranagar', 'Whitefield'],
  'Chennai-Hub': ['All Cities', 'Anna Nagar', 'T. Nagar', 'Adyar'],
  'Hyderabad-Hub': ['All Cities', 'Banjara Hills', 'Jubilee Hills', 'Hitech City'],
  'Kolkata-Central': ['All Cities', 'Salt Lake', 'Park Street', 'New Town'],
  'Bhubaneswar-Hub': ['All Cities', 'Unit 4', 'Saheed Nagar'],
  'Patna-Hub': ['All Cities', 'Boring Road', 'Kankarbagh'],
  'Mumbai-Central': ['All Cities', 'Bandra', 'Andheri', 'Powai'],
  'Pune-Hub': ['All Cities', 'Koregaon Park', 'Viman Nagar', 'Hinjewadi'],
  'Ahmedabad-Hub': ['All Cities', 'Satellite', 'Navrangpura', 'SG Highway'],
};

const RIDER_NAMES = [
  'Arjun Sharma','Priya Patel','Rahul Singh','Neha Gupta','Vikas Yadav',
  'Sunita Joshi','Deepak Kumar','Pooja Mishra','Amit Verma','Kavya Reddy',
  'Sanjay Nair','Divya Mehta','Rohit Tiwari','Anita Bose','Kiran Pillai',
  'Manoj Agarwal','Swati Saxena','Ajay Chauhan','Ritu Bansal','Vijay Raj',
];

const EXCEPTION_TYPES = [
  'Customer Absent','Wrong Address','Refused Delivery','Damaged Package',
  'Incomplete Address','Customer Requested Reschedule','No Safe Place',
];

const COLORS = ['#2563EB','#059669','#D97706','#DC2626','#7C3AED','#0891B2','#DB2777'];

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const HUB_LIST = ['Delhi-Central','Delhi-North','Gurgaon-Hub','Noida-Hub','Bangalore-Central','Chennai-Hub','Hyderabad-Hub','Kolkata-Central','Mumbai-Central','Pune-Hub'];
const REGION_MAP: Record<string, string> = {
  'Delhi-Central':'North','Delhi-North':'North','Gurgaon-Hub':'North','Noida-Hub':'North',
  'Bangalore-Central':'South','Chennai-Hub':'South','Hyderabad-Hub':'South',
  'Kolkata-Central':'East',
  'Mumbai-Central':'West','Pune-Hub':'West',
};
const CITY_MAP: Record<string, string[]> = {
  'Delhi-Central':['Connaught Place','Karol Bagh','Lajpat Nagar'],
  'Delhi-North':['Rohini','Pitampura','Shalimar Bagh'],
  'Gurgaon-Hub':['DLF Phase 1','Sector 29','Golf Course Rd'],
  'Noida-Hub':['Sector 18','Sector 62','Greater Noida'],
  'Bangalore-Central':['Koramangala','Indiranagar','Whitefield'],
  'Chennai-Hub':['Anna Nagar','T. Nagar','Adyar'],
  'Hyderabad-Hub':['Banjara Hills','Jubilee Hills','Hitech City'],
  'Kolkata-Central':['Salt Lake','Park Street','New Town'],
  'Mumbai-Central':['Bandra','Andheri','Powai'],
  'Pune-Hub':['Koregaon Park','Viman Nagar','Hinjewadi'],
};

export const riders: Rider[] = RIDER_NAMES.map((name, i) => {
  const hub = HUB_LIST[i % HUB_LIST.length];
  const assigned = rnd(8, 25);
  const delivered = rnd(Math.floor(assigned * 0.5), Math.floor(assigned * 0.9));
  return {
    id: `R${String(i+1).padStart(3,'0')}`,
    name, hub,
    region: REGION_MAP[hub],
    city: pick(CITY_MAP[hub]),
    status: i < 14 ? (i % 5 === 0 ? 'idle' : 'active') : 'offline',
    ordersAssigned: assigned,
    ordersDelivered: delivered,
    ordersAttempted: Math.min(assigned, delivered + rnd(0, 3)),
    speed: i < 14 ? rnd(18, 42) : 0,
    distance: rnd(12, 58),
    battery: rnd(20, 98),
    lastSeen: `${rnd(0, 59)}m ago`,
    color: COLORS[i % COLORS.length],
  };
});

const STATUSES: Order['status'][] = ['delivered','delivered','delivered','delivered','delivered','out_for_delivery','out_for_delivery','failed','pending','exception'];
const CUSTOMER_NAMES = ['Riya Kapoor','Arun Menon','Sneha Das','Mohan Lal','Geeta Singh','Tariq Khan','Preethi Iyer','Vinod Rao'];

export const orders: Order[] = Array.from({ length: 320 }, (_, i) => {
  const hub = pick(HUB_LIST);
  const status = STATUSES[i % STATUSES.length];
  const cod = rnd(0,1) === 1 ? rnd(150, 4500) : 0;
  return {
    id: `ORD${String(i+1).padStart(5,'0')}`,
    awb: `RS${rnd(1000000000,9999999999)}`,
    customer: pick(CUSTOMER_NAMES),
    address: `${rnd(1,999)}, Sample Street`,
    city: pick(CITY_MAP[hub]),
    hub, region: REGION_MAP[hub],
    rider: pick(riders.filter(r => r.hub === hub))?.name ?? riders[0].name,
    status,
    attempt: rnd(1, 3),
    cod,
    codCollected: status === 'delivered' && cod > 0 ? rnd(0,1) === 1 : false,
    podCaptured: status === 'delivered' ? rnd(0,10) > 1 : false,
    slaBreach: rnd(0,10) < 2,
    deliveryTime: status === 'delivered' ? `${rnd(9,18)}:${rnd(0,5)}${rnd(0,9)}` : undefined,
    scheduledTime: `${rnd(9,18)}:00`,
    exception: status === 'exception' ? pick(EXCEPTION_TYPES) : undefined,
    routeId: `ROUTE-${hub.slice(0,3).toUpperCase()}-${rnd(1,12)}`,
  };
});

export const hubs: Hub[] = HUB_LIST.map((name, i) => {
  const capacity = rnd(200, 500);
  const volume = rnd(Math.floor(capacity * 0.6), capacity);
  const dispatched = Math.floor(volume * 0.9);
  const delivered = Math.floor(dispatched * rnd(70, 92) / 100);
  return {
    id: `HUB${i+1}`,
    name, city: CITY_MAP[name][0],
    region: REGION_MAP[name],
    capacity, currentVolume: volume,
    dispatched, delivered,
    pending: dispatched - delivered - rnd(5, 20),
    failed: rnd(5, 25),
    sortAccuracy: rnd(94, 99) + Math.random(),
  };
});

export const dailyMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const attempted = rnd(180, 320);
  const delivered = Math.floor(attempted * rnd(72, 90) / 100);
  const cod = rnd(80000, 180000);
  return {
    date: date.toISOString().slice(0, 10),
    delivered,
    attempted,
    failed: attempted - delivered,
    rto: rnd(10, 40),
    cod,
    codCollected: Math.floor(cod * rnd(88, 97) / 100),
    exceptions: rnd(8, 30),
    slaBreaches: rnd(5, 25),
  };
});

export const hourlyDeliveries = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i + 8}:00`,
  delivered: rnd(8, 42),
  failed: rnd(1, 8),
  out: rnd(5, 20),
}));

export const exceptionBreakdown = EXCEPTION_TYPES.map(type => ({
  type, count: rnd(10, 80), resolved: rnd(5, 60),
}));

export const routePerformance = Array.from({ length: 12 }, (_, i) => ({
  route: `ROUTE-${String(i+1).padStart(2,'0')}`,
  hub: pick(HUB_LIST),
  totalOrders: rnd(15, 35),
  delivered: rnd(10, 30),
  kmCovered: rnd(18, 75),
  timeTaken: rnd(240, 480),
  etaAccuracy: rnd(72, 96),
  deviation: rnd(0, 8),
}));

export const DELIVERY_PARTNERS = [
  'All Partners',
  ...Array.from(new Set(riders.map(r => r.name))).slice(0, 10),
];
