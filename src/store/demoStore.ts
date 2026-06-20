/**
 * demoStore — controls Demo Mode across the entire Control Tower.
 *
 * When isDemoMode is true:
 *  - DemoBanner renders at the top of every page
 *  - DemoOverview is the landing dashboard
 *  - Demo KPIs override live seed values
 *  - No real data is read or written
 *
 * Persisted to localStorage so the demo session survives page refresh.
 * On the demo Vercel deployment, VITE_DEMO_MODE=true forces it on permanently.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DemoState {
  isDemoMode: boolean;
  demoEnteredAt: string | null;
  enableDemo: () => void;
  disableDemo: () => void;
  toggleDemo: () => void;
}

const FORCED = import.meta.env.VITE_DEMO_MODE === 'true';

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      isDemoMode: FORCED,
      demoEnteredAt: null,

      enableDemo: () => set({ isDemoMode: true, demoEnteredAt: new Date().toISOString() }),
      disableDemo: () => {
        if (FORCED) return; // cannot disable on the dedicated demo deployment
        set({ isDemoMode: false, demoEnteredAt: null });
      },
      toggleDemo: () => {
        if (get().isDemoMode) get().disableDemo();
        else get().enableDemo();
      },
    }),
    {
      name: 'routesphere-demo-mode',
      partialize: (s) => ({ isDemoMode: FORCED ? true : s.isDemoMode, demoEnteredAt: s.demoEnteredAt }),
    },
  ),
);
