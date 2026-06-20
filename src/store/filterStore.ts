import { create } from 'zustand';
import type { FilterState } from '../types';

interface FilterStore extends FilterState {
  setFilter: (key: keyof FilterState, value: string) => void;
  reset: () => void;
}

const today = new Date().toISOString().slice(0, 10);
const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

const defaults: FilterState = {
  region: 'All Regions',
  hub: 'All Hubs',
  city: 'All Cities',
  deliveryPartner: 'All Partners',
  dateFrom: sevenDaysAgo,
  dateTo: today,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaults,
  setFilter: (key, value) => set({ [key]: value }),
  reset: () => set(defaults),
}));

// Helper: filter orders by current filter state
import { orders, riders as allRiders, hubs as allHubs, dailyMetrics } from '../data/mockData';
import type { Order, Rider, Hub, DailyMetric } from '../types';

export function filterOrders(f: FilterState): Order[] {
  return orders.filter(o => {
    if (f.region !== 'All Regions' && o.region !== f.region) return false;
    if (f.hub !== 'All Hubs' && o.hub !== f.hub) return false;
    if (f.city !== 'All Cities' && o.city !== f.city) return false;
    if (f.deliveryPartner !== 'All Partners' && o.rider !== f.deliveryPartner) return false;
    return true;
  });
}

export function filterRiders(f: FilterState): Rider[] {
  return allRiders.filter(r => {
    if (f.region !== 'All Regions' && r.region !== f.region) return false;
    if (f.hub !== 'All Hubs' && r.hub !== f.hub) return false;
    if (f.city !== 'All Cities' && r.city !== f.city) return false;
    if (f.deliveryPartner !== 'All Partners' && r.name !== f.deliveryPartner) return false;
    return true;
  });
}

export function filterHubs(f: FilterState): Hub[] {
  return allHubs.filter(h => {
    if (f.region !== 'All Regions' && h.region !== f.region) return false;
    if (f.hub !== 'All Hubs' && h.name !== f.hub) return false;
    if (f.city !== 'All Cities' && h.city !== f.city) return false;
    return true;
  });
}

export function filterMetrics(f: FilterState): DailyMetric[] {
  return dailyMetrics.filter(d => d.date >= f.dateFrom && d.date <= f.dateTo);
}
