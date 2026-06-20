import React from 'react';
import { FlaskConical, X, Share2 } from 'lucide-react';
import { useDemoStore } from '../store/demoStore';

const FORCED = import.meta.env.VITE_DEMO_MODE === 'true';

export default function DemoBanner() {
  const { isDemoMode, disableDemo } = useDemoStore();
  if (!isDemoMode) return null;

  const demoUrl = 'https://routesphere-demo.vercel.app';

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 3000,
      display: 'flex', flexDirection: 'column', gap: 6,
      fontFamily: 'inherit',
    }}>
      {/* Main chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
        border: '1px solid #4338CA',
        borderRadius: 20, padding: '5px 12px 5px 8px',
        boxShadow: '0 2px 12px rgba(79,70,229,0.35)',
      }}>
        <FlaskConical size={12} color="#A5B4FC" />
        <span style={{ fontSize: 10, fontWeight: 800, color: '#A5B4FC', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Demo Mode
        </span>
        <span style={{ fontSize: 9, color: '#6366F1', margin: '0 1px' }}>·</span>
        <span style={{ fontSize: 10, color: '#818CF8' }}>All data is synthetic</span>

        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share demo link"
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, color: '#818CF8', textDecoration: 'none',
            background: '#312e81', border: '1px solid #4338CA',
            borderRadius: 12, padding: '2px 8px', marginLeft: 4,
          }}
        >
          <Share2 size={9} />
          Share
        </a>

        {!FORCED && (
          <button
            onClick={disableDemo}
            title="Exit demo mode"
            style={{
              display: 'flex', alignItems: 'center', cursor: 'pointer',
              background: 'transparent', border: 'none', padding: 2,
              color: '#6366F1', marginLeft: 2,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
