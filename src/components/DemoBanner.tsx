import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, X, ExternalLink, Share2 } from 'lucide-react';
import { useDemoStore } from '../store/demoStore';

const FORCED = import.meta.env.VITE_DEMO_MODE === 'true';

export default function DemoBanner() {
  const { isDemoMode, disableDemo } = useDemoStore();
  if (!isDemoMode) return null;

  const demoUrl = 'https://routesphere-demo.vercel.app';

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 2000,
      background: 'linear-gradient(90deg,#1e1b4b,#312e81)',
      borderBottom: '1px solid #4338CA',
      padding: '7px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'inherit',
    }}>
      {/* Left — badge + message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#4F46E5', border: '1px solid #818CF8',
          borderRadius: 20, padding: '2px 10px',
        }}>
          <FlaskConical size={11} color="#A5B4FC" />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#A5B4FC', letterSpacing: 1, textTransform: 'uppercase' }}>Demo Mode</span>
        </div>
        <span style={{ fontSize: 11, color: '#C7D2FE' }}>
          You're viewing the RouteSphere Demo Environment — all data is synthetic.
        </span>
        <span style={{ fontSize: 10, color: '#6366F1', margin: '0 4px' }}>·</span>
        <span style={{ fontSize: 10, color: '#818CF8' }}>
          Login: <strong style={{ color: '#C7D2FE', fontWeight: 600 }}>demo@routesphere.io</strong>
          {' / '}
          <strong style={{ color: '#C7D2FE', fontWeight: 600 }}>demo2024</strong>
        </span>
      </div>

      {/* Right — share + exit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: '#818CF8', textDecoration: 'none',
            background: '#312e81', border: '1px solid #4338CA',
            borderRadius: 6, padding: '3px 9px',
          }}
        >
          <Share2 size={10} />
          Share Demo
          <ExternalLink size={9} />
        </a>

        {!FORCED && (
          <button
            onClick={disableDemo}
            title="Exit demo mode"
            style={{
              display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
              fontSize: 10, color: '#818CF8', background: 'transparent',
              border: '1px solid #4338CA', borderRadius: 6, padding: '3px 9px',
            }}
          >
            <X size={10} />
            Exit Demo
          </button>
        )}
      </div>
    </div>
  );
}
