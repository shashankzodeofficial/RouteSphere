export interface FilterState {
  region: string;
  hub: string;
  city: string;
  deliveryPartner: string;
  dateFrom: string;
  dateTo: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon: string;
  color: string;
}

export interface Order {
  id: string;
  awb: string;
  customer: string;
  address: string;
  city: string;
  hub: string;
  region: string;
  rider: string;
  status: 'delivered' | 'out_for_delivery' | 'failed' | 'pending' | 'rto' | 'exception';
  attempt: number;
  cod: number;
  codCollected: boolean;
  podCaptured: boolean;
  slaBreach: boolean;
  deliveryTime?: string;
  scheduledTime?: string;
  exception?: string;
  routeId: string;
}

export interface Rider {
  id: string;
  name: string;
  hub: string;
  region: string;
  city: string;
  status: 'active' | 'idle' | 'offline';
  ordersAssigned: number;
  ordersDelivered: number;
  ordersAttempted: number;
  speed: number;
  distance: number;
  battery: number;
  lastSeen: string;
  color: string;
}

export interface Hub {
  id: string;
  name: string;
  city: string;
  region: string;
  capacity: number;
  currentVolume: number;
  dispatched: number;
  delivered: number;
  pending: number;
  failed: number;
  sortAccuracy: number;
}

export interface DailyMetric {
  date: string;
  delivered: number;
  attempted: number;
  failed: number;
  rto: number;
  cod: number;
  codCollected: number;
  exceptions: number;
  slaBreaches: number;
}
