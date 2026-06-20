import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { REGIONS, HUBS, CITIES, DELIVERY_PARTNERS } from '../../data/mockData';

export default function FilterBar() {
  const { region, hub, city, deliveryPartner, dateFrom, dateTo, setFilter, reset } = useFilterStore();

  const hubOptions = HUBS[region] ?? ['All Hubs'];
  const cityOptions = CITIES[hub] ?? ['All Cities'];

  const handleRegion = (v: string) => {
    setFilter('region', v);
    setFilter('hub', 'All Hubs');
    setFilter('city', 'All Cities');
  };
  const handleHub = (v: string) => {
    setFilter('hub', v);
    setFilter('city', 'All Cities');
  };

  return (
    <div className="filter-bar">
      <span className="filter-label">Filters</span>
      <div className="filter-group">
        <select className="filter-select" value={region} onChange={e => handleRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={hub} onChange={e => handleHub(e.target.value)}>
          {hubOptions.map(h => <option key={h}>{h}</option>)}
        </select>
        <select className="filter-select" value={city} onChange={e => setFilter('city', e.target.value)}>
          {cityOptions.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={deliveryPartner} onChange={e => setFilter('deliveryPartner', e.target.value)}>
          {DELIVERY_PARTNERS.map(p => <option key={p}>{p}</option>)}
        </select>
        <div className="date-range">
          <input type="date" className="date-input" value={dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} />
          <span className="date-sep">→</span>
          <input type="date" className="date-input" value={dateTo} onChange={e => setFilter('dateTo', e.target.value)} />
        </div>
      </div>
      <button className="btn-reset" onClick={reset}>
        <RotateCcw size={12} /> Reset
      </button>
    </div>
  );
}
