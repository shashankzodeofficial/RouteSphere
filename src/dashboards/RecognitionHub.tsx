import React, { useState, useMemo } from 'react';
import {
  Award, Star, TrendingUp, Trophy, Medal, Zap, Users, BarChart2,
  Camera, DollarSign, Target, Crown, Flame, ChevronRight,
  Calendar, MapPin, Package, Clock, type LucideIcon,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import { riderPerformanceData } from '../data/performanceData';
import {
  BADGE_DEFINITIONS, RIDER_RECOGNITIONS, DAILY_HEROES,
  WEEKLY_AWARDS, MONTHLY_AWARDS, HALL_OF_FAME,
  buildLeaderboard, getTopBadgeHolders, getBadgeHolders,
  getRiderBadges, getRiderPoints,
  type BadgeCategory, type BadgeRarity,
} from '../data/recognitionData';

// ============================================================
// AVATAR SYSTEM
// ============================================================

const AVATAR_GRADIENTS: [string, string][] = [
  ['#7C3AED', '#5B21B6'], ['#2563EB', '#1D4ED8'], ['#059669', '#047857'],
  ['#D97706', '#B45309'], ['#DC2626', '#B91C1C'], ['#0891B2', '#0E7490'],
  ['#7C3AED', '#6D28D9'], ['#EA580C', '#C2410C'], ['#0F766E', '#0D9488'],
  ['#6D28D9', '#7C3AED'], ['#BE185D', '#9D174D'], ['#1D4ED8', '#3B82F6'],
];

function getGradient(name: string): [string, string] {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function RiderAvatar({
  name, size = 48, ring = false, ringColor = '#FFD700',
}: {
  name: string; size?: number; ring?: boolean; ringColor?: string;
}) {
  const [from, to] = getGradient(name);
  const fs = Math.round(size * 0.38);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontWeight: 800, fontSize: fs, color: '#fff',
      letterSpacing: '0.02em',
      ...(ring ? { border: `3px solid ${ringColor}`, boxShadow: `0 0 0 2px ${ringColor}40, 0 4px 12px ${from}60` } : {}),
    }}>
      {getInitials(name)}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

const GRADE_COLOR: Record<string, string> = {
  S: '#7C3AED', A: '#059669', B: '#2563EB', C: '#D97706', D: '#DC2626',
};

const RARITY_LABEL: Record<BadgeRarity, string>  = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', legendary: 'Legendary' };
const RARITY_COLOR: Record<BadgeRarity, { bg: string; text: string; border: string }> = {
  common:    { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
  uncommon:  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  rare:      { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  legendary: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
};

const CAT_LABEL: Record<BadgeCategory, string> = {
  delivery: '📦 Delivery', compliance: '✅ Compliance', consistency: '🔥 Consistency',
  achievement: '🏆 Achievement', special: '⭐ Special',
};

function GradeBadge({ grade }: { grade: string }) {
  return (
    <div style={{ width: 26, height: 26, borderRadius: 6, background: GRADE_COLOR[grade] ?? '#64748B',
      color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0 }}>
      {grade}
    </div>
  );
}

function RecogPoints({ points }: { points: number }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: '#FFFBEB',
      padding: '2px 7px', borderRadius: 20, border: '1px solid #FDE68A' }}>
      ★ {points}
    </span>
  );
}

// ============================================================
// TAB: DAILY
// ============================================================

function DailyTab() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Date banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', borderRadius: 10, color: '#fff' }}>
        <Calendar size={16} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Today's Recognition — {today}</span>
        <div style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(255,255,255,0.2)',
          padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>Live</div>
      </div>

      {/* Featured hero — today's top performer */}
      <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#4F46E5 100%)',
        borderRadius: 16, padding: 28, color: '#fff', display: 'flex', gap: 24, alignItems: 'center',
        boxShadow: '0 8px 32px rgba(79,70,229,0.3)' }}>
        <RiderAvatar name={DAILY_HEROES[0].riderName} size={96} ring ringColor="#FFD700" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 6 }}>⭐ Today's Top Performer</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', marginBottom: 4 }}>
            {DAILY_HEROES[0].riderName}
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 12 }}>
            {DAILY_HEROES[0].hub} · {DAILY_HEROES[0].region}
          </div>
          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
            {DAILY_HEROES[0].awardReason}
          </div>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '16px 24px' }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase' }}>Score</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>
            {DAILY_HEROES[0].score.toFixed(0)}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Grade S</div>
        </div>
      </div>

      {/* 3 daily award cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {DAILY_HEROES.slice(1).map(hero => (
          <div key={hero.riderId} style={{ background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{hero.awardEmoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 8 }}>{hero.awardTitle}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <RiderAvatar name={hero.riderName} size={40} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{hero.riderName}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{hero.hub}</div>
              </div>
              <GradeBadge grade={hero.grade} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: GRADE_COLOR[hero.grade] ?? '#0F172A' }}>
              {hero.metricValue}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5 }}>
              {hero.awardReason}
            </div>
          </div>
        ))}
      </div>

      {/* Today's achievement feed */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex',
          alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="#D97706" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Today's Achievement Feed</span>
        </div>
        {[
          { name: 'Arjun Sharma',  hub: 'Delhi-Central', action: 'earned badge',    detail: '🔥 30-Day Blaze — 30 consecutive days above 75% success rate',  time: '7 min ago' },
          { name: 'Priya Patel',   hub: 'Delhi-North',   action: 'hit milestone',   detail: '📸 28th perfect POD day in a row. Approaching the POD Perfectionist badge!', time: '34 min ago' },
          { name: 'Rahul Singh',   hub: 'Gurgaon-Hub',   action: 'hit milestone',   detail: '⚡ Reached 31 deliveries today — highest single-day volume this week', time: '52 min ago' },
          { name: 'Neha Gupta',    hub: 'Noida-Hub',     action: 'streak extended', detail: '🔥 Day 7 of their 7-day delivery success streak!',              time: '1h 10m ago' },
          { name: 'Sunita Joshi',  hub: 'Chennai-Hub',   action: 'hit milestone',   detail: '💰 Week 4 of zero COD discrepancy. COD Guardian badge next week!', time: '1h 45m ago' },
          { name: 'Kavya Reddy',   hub: 'Chennai-Hub',   action: 'earned badge',    detail: '🌱 Rookie Star badge earned — Grade B in only their second month!', time: '2h 20m ago' },
        ].map((ev, i) => (
          <div key={i} style={{ padding: '12px 18px', borderBottom: i < 5 ? '1px solid #F8FAFC' : 'none',
            display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <RiderAvatar name={ev.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#0F172A', lineHeight: 1.5 }}>
                <strong>{ev.name}</strong>
                <span style={{ color: '#64748B' }}> ({ev.hub}) {ev.action}</span>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{ev.detail}</div>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{ev.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB: WEEKLY
// ============================================================

function WeeklyTab() {
  const podium = WEEKLY_AWARDS.filter(a => ['top_score','second','third'].includes(a.category));
  const special = WEEKLY_AWARDS.filter(a => !['top_score','second','third'].includes(a.category));

  const PODIUM_STYLE = [
    { order: 1, height: 100, bg: 'linear-gradient(135deg,#F59E0B,#B45309)', label: '1st', medal: '🥇' },
    { order: 0, height: 70,  bg: 'linear-gradient(135deg,#94A3B8,#64748B)', label: '2nd', medal: '🥈' },
    { order: 2, height: 55,  bg: 'linear-gradient(135deg,#D97706,#92400E)', label: '3rd', medal: '🥉' },
  ];

  const podiumOrdered = [podium[1], podium[0], podium[2]]; // 2nd | 1st | 3rd

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        background: 'linear-gradient(135deg,#D97706,#92400E)', borderRadius: 10, color: '#fff' }}>
        <Trophy size={16} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Week of 16–22 June 2026 — Recognition Board</span>
      </div>

      {/* Podium */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16,
        padding: '28px 24px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 20, textAlign: 'center' }}>
          Weekly Leaderboard Podium
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0 }}>
          {podiumOrdered.map((award, i) => {
            if (!award) return null;
            const ps = PODIUM_STYLE[i];
            return (
              <div key={award.riderId} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 10, maxWidth: 200 }}>
                {/* Rider card */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <RiderAvatar name={award.riderName} size={ps.order === 1 ? 72 : 56}
                    ring={ps.order === 1} ringColor="#FFD700" />
                  <div style={{ fontSize: ps.order === 1 ? 16 : 13, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>
                    {award.riderName}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{award.hub}</div>
                  <div style={{ fontSize: ps.order === 1 ? 24 : 18, fontWeight: 800,
                    color: GRADE_COLOR[award.grade], marginTop: 4 }}>
                    {award.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{award.valueLabel}</div>
                </div>
                {/* Podium block */}
                <div style={{ width: '100%', height: ps.height, background: ps.bg, borderRadius: '8px 8px 0 0',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                  <span style={{ fontSize: ps.order === 1 ? 28 : 22 }}>{ps.medal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly descriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {podium.map((a, i) => (
          <div key={a.riderId} style={{ background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{a.description}</div>
          </div>
        ))}
      </div>

      {/* Special weekly awards */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Special Weekly Awards</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {special.map(a => (
          <div key={a.category} style={{ background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{a.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 8 }}>{a.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <RiderAvatar name={a.riderName} size={40} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{a.riderName}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{a.hub}</div>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: GRADE_COLOR[a.grade] ?? '#0F172A' }}>
              {a.value}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{a.valueLabel}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 8, lineHeight: 1.5 }}>
              {a.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB: MONTHLY
// ============================================================

function MonthlyTab() {
  const champion = MONTHLY_AWARDS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', borderRadius: 10, color: '#fff' }}>
        <Crown size={16} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>June 2026 — Monthly Recognition Awards</span>
      </div>

      {/* Champion card */}
      <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(245,158,11,0.25)' }}>
        <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#78350F 100%)',
          padding: 32, display: 'flex', gap: 28, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <RiderAvatar name={champion.riderName} size={104} ring ringColor="#FFD700" />
            <div style={{ fontSize: 32, marginTop: -18, position: 'relative', zIndex: 1 }}>🏆</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 6 }}>🏆 {champion.title}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{champion.subtitle}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#F1F5F9', marginBottom: 4 }}>
              {champion.riderName}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 14 }}>
              <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
              {champion.hub} · {champion.region} Region
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 400 }}>
              {champion.stats.map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FFD700' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,215,0,0.1)',
            border: '2px solid #FFD70040', borderRadius: 16, padding: '20px 28px' }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase' }}>Overall Score</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>
              {champion.score.toFixed(0)}
            </div>
            <div style={{ fontSize: 13, color: '#A78BFA', marginTop: 4, fontWeight: 700 }}>Grade S</div>
          </div>
        </div>
        <div style={{ padding: '14px 32px', background: 'rgba(255,215,0,0.05)',
          borderTop: '1px solid #FFD70020' }}>
          <div style={{ fontSize: 13, color: '#CBD5E1', fontStyle: 'italic', lineHeight: 1.7 }}>
            "{champion.quote}"
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>— Supervisor recognition note</div>
        </div>
      </div>

      {/* Other monthly awards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {MONTHLY_AWARDS.slice(1).map(award => (
          <div key={award.id} style={{ background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Card header */}
            <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,#0F172A,#1E293B)',
              display: 'flex', gap: 12, alignItems: 'center' }}>
              <RiderAvatar name={award.riderName} size={52} ring={award.grade === 'S'} ringColor="#FFD700" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#FFD700', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: 2 }}>{award.emoji} {award.title}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>{award.riderName}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{award.hub}</div>
              </div>
              <GradeBadge grade={award.grade} />
            </div>
            {/* Stats */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {award.stats.slice(0, 4).map(s => (
                  <div key={s.label} style={{ background: '#F8FAFC', borderRadius: 6, padding: '7px 10px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{award.quote}"
              </div>
              {award.badgeEarned && (
                <div style={{ marginTop: 10, padding: '6px 10px', background: '#FFFBEB',
                  borderRadius: 6, fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                  🏅 Badge earned: {BADGE_DEFINITIONS.find(b => b.id === award.badgeEarned)?.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB: LEADERBOARDS
// ============================================================

function LeaderboardsTab() {
  const [period, setPeriod] = useState<'monthly'>('monthly');
  const [metric, setMetric] = useState<'overall' | 'deliveries' | 'successRate' | 'onTime' | 'pod'>('overall');

  const sorted = useMemo(() => {
    const data = buildLeaderboard(riderPerformanceData);
    if (metric === 'deliveries') return [...data].sort((a,b) => b.ordersDelivered - a.ordersDelivered);
    if (metric === 'successRate') return [...data].sort((a,b) => b.successRate - a.successRate);
    if (metric === 'onTime')  return [...data].sort((a,b) => b.onTimeRate - a.onTimeRate);
    if (metric === 'pod')     return [...data].sort((a,b) => b.podCompliance - a.podCompliance);
    return data;
  }, [metric]);

  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  const metricVal = (r: typeof sorted[0]) => {
    if (metric === 'deliveries') return `${r.ordersDelivered}`;
    if (metric === 'successRate') return `${r.successRate.toFixed(1)}%`;
    if (metric === 'onTime')  return `${r.onTimeRate.toFixed(1)}%`;
    if (metric === 'pod')     return `${r.podCompliance.toFixed(1)}%`;
    return r.overallScore.toFixed(1);
  };

  const metricLabel = { overall: 'Score', deliveries: 'Deliveries', successRate: 'Success Rate', onTime: 'On-Time Rate', pod: 'POD Compliance' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Sort by:</div>
        {Object.entries(metricLabel).map(([key, label]) => (
          <button key={key} onClick={() => setMetric(key as typeof metric)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: metric === key ? '#2563EB' : '#E2E8F0',
              background: metric === key ? '#2563EB' : '#fff',
              color: metric === key ? '#fff' : '#475569',
              fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 spotlight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {sorted.slice(0, 3).map((r, i) => (
          <div key={r.riderId} style={{ background: i === 0
            ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' : '#fff',
            border: `1px solid ${i === 0 ? '#FDE68A' : '#E2E8F0'}`,
            borderRadius: 12, padding: 16, textAlign: 'center',
            boxShadow: i === 0 ? '0 4px 16px rgba(245,158,11,0.2)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{MEDAL[i+1]}</div>
            <RiderAvatar name={r.riderName} size={56} ring={i===0} ringColor="#FFD700" />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{r.riderName}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>{r.hub}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: GRADE_COLOR[r.grade] ?? '#0F172A' }}>
              {metricVal(r)}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{metricLabel[metric]}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <GradeBadge grade={r.grade} />
              {r.recognitionPoints > 0 && <RecogPoints points={r.recognitionPoints} />}
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>Rank</th>
                <th>Rider</th>
                <th>Hub</th>
                <th style={{ textAlign: 'right' }}>{metricLabel[metric]}</th>
                <th style={{ textAlign: 'right' }}>Score</th>
                <th style={{ textAlign: 'right' }}>Deliveries</th>
                <th>Trend</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.riderId}>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: i < 3 ? '#B45309' : '#64748B', fontSize: i < 3 ? 16 : 13 }}>
                      {MEDAL[i+1] ?? i+1}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <RiderAvatar name={r.riderName} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{r.riderName}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.region}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#475569' }}>{r.hub}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: GRADE_COLOR[r.grade] ?? '#0F172A' }}>
                    {metricVal(r)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <GradeBadge grade={r.grade} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.overallScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{r.ordersDelivered}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600,
                      color: r.trendDirection === 'up' ? '#059669' : r.trendDirection === 'down' ? '#DC2626' : '#94A3B8' }}>
                      {r.trendDirection === 'up' ? '▲' : r.trendDirection === 'down' ? '▼' : '—'}
                      {r.scoreChange !== null ? ` ${Math.abs(r.scoreChange).toFixed(1)}` : ''}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.badges.slice(0, 4).map(b => {
                        const def = BADGE_DEFINITIONS.find(d => d.id === b.badgeId);
                        return def ? (
                          <span key={b.badgeId} title={def.name} style={{ fontSize: 14, cursor: 'default' }}>
                            {def.emoji}
                          </span>
                        ) : null;
                      })}
                      {r.badges.length > 4 && (
                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>+{r.badges.length - 4}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: BADGES
// ============================================================

function BadgesTab() {
  const [selectedCat, setSelectedCat] = useState<BadgeCategory | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const CATS: Array<{ key: BadgeCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All Badges' },
    { key: 'delivery',    label: '📦 Delivery' },
    { key: 'compliance',  label: '✅ Compliance' },
    { key: 'consistency', label: '🔥 Consistency' },
    { key: 'achievement', label: '🏆 Achievement' },
    { key: 'special',     label: '⭐ Special' },
  ];

  const filtered = selectedCat === 'all' ? BADGE_DEFINITIONS
    : BADGE_DEFINITIONS.filter(b => b.category === selectedCat);

  const detail = selectedBadge ? BADGE_DEFINITIONS.find(b => b.id === selectedBadge) : null;
  const holders = detail ? getBadgeHolders(detail.id, riderPerformanceData) : [];

  const badgeCounts = BADGE_DEFINITIONS.reduce((acc, bd) => {
    acc[bd.id] = getBadgeHolders(bd.id, riderPerformanceData).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 0 }}>
      {/* Left: badge gallery */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATS.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCat(cat.key)}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid',
                borderColor: selectedCat === cat.key ? '#2563EB' : '#E2E8F0',
                background: selectedCat === cat.key ? '#2563EB' : '#fff',
                color: selectedCat === cat.key ? '#fff' : '#475569',
                fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {filtered.map(badge => {
            const rc = RARITY_COLOR[badge.rarity];
            const count = badgeCounts[badge.id] ?? 0;
            const isSelected = selectedBadge === badge.id;
            return (
              <div key={badge.id}
                onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
                style={{ background: isSelected ? badge.color : '#fff',
                  border: `2px solid ${isSelected ? rc.border : '#E2E8F0'}`,
                  borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: isSelected ? `0 4px 12px ${rc.border}` : '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{badge.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  {badge.name}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.text,
                    padding: '2px 7px', borderRadius: 20, border: `1px solid ${rc.border}` }}>
                    {RARITY_LABEL[badge.rarity]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 8 }}>
                  {badge.criteria}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? '#059669' : '#94A3B8' }}>
                  {count > 0 ? `${count} holder${count > 1 ? 's' : ''}` : 'Not yet earned'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: badge detail */}
      {detail && (
        <div style={{ width: 260, flexShrink: 0, background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 12, padding: 20, height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 56 }}>{detail.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>{detail.name}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700,
                background: RARITY_COLOR[detail.rarity].bg,
                color: RARITY_COLOR[detail.rarity].text,
                padding: '2px 10px', borderRadius: 20,
                border: `1px solid ${RARITY_COLOR[detail.rarity].border}` }}>
                {RARITY_LABEL[detail.rarity]}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{CAT_LABEL[detail.category]}</div>
          </div>

          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, marginBottom: 14,
            padding: '10px 12px', background: '#F8FAFC', borderRadius: 8 }}>
            {detail.description}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 6 }}>Criteria</div>
            <div style={{ fontSize: 12, color: '#334155' }}>{detail.criteria}</div>
          </div>

          {holders.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 10 }}>
                Holders ({holders.length})
              </div>
              {holders.map(name => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <RiderAvatar name={name} size={28} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{name}</span>
                </div>
              ))}
            </div>
          )}
          {holders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#94A3B8', fontSize: 12 }}>
              No riders have earned this badge yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: HALL OF FAME
// ============================================================

function HallOfFameTab() {
  const monthly = HALL_OF_FAME.filter(e => e.type === 'monthly');
  const quarterly = HALL_OF_FAME.filter(e => e.type === 'quarterly');

  const Entry = ({ entry, featured = false }: { entry: typeof HALL_OF_FAME[0]; featured?: boolean }) => (
    <div style={{
      background: featured
        ? 'linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#78350F 100%)'
        : '#fff',
      border: `1px solid ${featured ? '#FFD70030' : '#E2E8F0'}`,
      borderRadius: featured ? 16 : 12,
      padding: featured ? 28 : 16,
      boxShadow: featured ? '0 8px 32px rgba(245,158,11,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', gap: featured ? 24 : 14, alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <RiderAvatar name={entry.riderName} size={featured ? 80 : 48}
          ring={featured} ringColor="#FFD700" />
        {entry.type === 'quarterly' && (
          <div style={{ fontSize: 20, marginTop: -10, position: 'relative', zIndex: 1 }}>🏆</div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: featured ? 10 : 9, fontWeight: 700,
          color: featured ? '#FFD700' : '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
          {entry.type === 'quarterly' ? '🏆 Quarterly Champion' : '🥇 Monthly Champion'}
        </div>
        <div style={{ fontSize: featured ? 14 : 11, color: featured ? '#94A3B8' : '#64748B', marginBottom: 2 }}>
          {entry.periodLabel}
        </div>
        <div style={{ fontSize: featured ? 26 : 16, fontWeight: 800,
          color: featured ? '#F1F5F9' : '#0F172A' }}>
          {entry.riderName}
        </div>
        <div style={{ fontSize: featured ? 13 : 11, color: featured ? '#94A3B8' : '#64748B', marginBottom: 4 }}>
          {entry.hub} · {entry.region}
        </div>
        <div style={{ fontSize: featured ? 12 : 11, color: featured ? '#CBD5E1' : '#475569',
          lineHeight: 1.6, fontStyle: 'italic' }}>
          "{entry.highlight}"
        </div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: featured ? 36 : 22, fontWeight: 900,
          color: featured ? '#FFD700' : GRADE_COLOR[entry.grade] }}>
          {entry.score.toFixed(1)}
        </div>
        <div style={{ fontSize: featured ? 11 : 10, color: featured ? '#94A3B8' : '#64748B' }}>
          Grade {entry.grade}
        </div>
        <div style={{ fontSize: featured ? 14 : 12, fontWeight: 700, color: featured ? '#A78BFA' : '#64748B', marginTop: 2 }}>
          {entry.deliveries} del
        </div>
        <div style={{ fontSize: 10, color: featured ? '#64748B' : '#94A3B8' }}>
          {entry.successRate}% SR
        </div>
      </div>
    </div>
  );

  // Stats
  const uniqRiders = new Set(HALL_OF_FAME.map(e => e.riderName)).size;
  const totalBadgesAwarded = Object.values(RIDER_RECOGNITIONS).reduce((s, b) => s + b.length, 0);
  const avgScore = (HALL_OF_FAME.reduce((s, e) => s + e.score, 0) / HALL_OF_FAME.length).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>Hall of Fame</div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Riders whose excellence became part of RouteSphere history
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { emoji: '🏆', label: 'Champions Inducted', value: HALL_OF_FAME.length },
          { emoji: '👤', label: 'Unique Hall of Famers', value: uniqRiders },
          { emoji: '🎖️', label: 'Total Badges Awarded', value: totalBadgesAwarded },
          { emoji: '📊', label: 'Avg Champion Score', value: avgScore },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0',
            borderRadius: 10, padding: '14px 16px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quarterly champion */}
      {quarterly.length > 0 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#B45309', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} /> Quarterly Champions
          </div>
          {quarterly.map(e => <Entry key={e.period} entry={e} featured />)}
        </>
      )}

      {/* Monthly champions */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Medal size={16} /> Monthly Champions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {monthly.map((e, i) => <Entry key={e.period} entry={e} featured={i === 0} />)}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

type TabKey = 'daily' | 'weekly' | 'monthly' | 'leaderboards' | 'badges' | 'halloffame';

const TABS: Array<{ key: TabKey; label: string; icon: LucideIcon; color: string }> = [
  { key: 'daily',       label: 'Daily',       icon: Zap,      color: '#7C3AED' },
  { key: 'weekly',      label: 'Weekly',      icon: Star,     color: '#D97706' },
  { key: 'monthly',     label: 'Monthly',     icon: Crown,    color: '#DC2626' },
  { key: 'leaderboards',label: 'Leaderboards',icon: BarChart2,color: '#2563EB' },
  { key: 'badges',      label: 'Badges',      icon: Award,    color: '#059669' },
  { key: 'halloffame',  label: 'Hall of Fame', icon: Trophy,   color: '#B45309' },
];

export default function RecognitionHub() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');

  const leaderboard = useMemo(() => buildLeaderboard(riderPerformanceData), []);
  const topHolder   = useMemo(() => getTopBadgeHolders(riderPerformanceData)[0], []);
  const totalBadges = Object.values(RIDER_RECOGNITIONS).reduce((s, b) => s + b.length, 0);
  const gradeS      = riderPerformanceData.filter(r => r.grade === 'S').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Recognition Hub</h1>
        <p className="page-sub">Celebrate excellence, reward consistency, and build a culture of achievement</p>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 0 }}>
          {[
            { emoji: '🏆', label: 'Rider of the Month', value: 'Arjun Sharma', sub: 'Grade S · 94.2 pts',         color: '#D97706' },
            { emoji: '💎', label: 'Grade S Riders',      value: gradeS,          sub: `of ${riderPerformanceData.length} total`, color: '#7C3AED' },
            { emoji: '🎖️', label: 'Badges Awarded',       value: totalBadges,     sub: 'All time',                  color: '#2563EB' },
            { emoji: '🌟', label: 'Hall of Famers',        value: HALL_OF_FAME.length, sub: '7 inductions',         color: '#B45309' },
            { emoji: '🔥', label: 'Active Streaks',        value: 8,               sub: 'Riders on 7-day+ streak', color: '#DC2626' },
            { emoji: '📈', label: 'Most Improved',         value: '+15.3 pts',     sub: 'Rohit Tiwari, Jun 2026',  color: '#059669' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{kpi.emoji}</div>
              <div style={{ fontSize: typeof kpi.value === 'string' && kpi.value.length > 6 ? 13 : 22,
                fontWeight: 800, color: kpi.color, lineHeight: 1.2 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: '#0F172A', fontWeight: 600, marginTop: 3 }}>{kpi.label}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #E2E8F0',
        borderRadius: 12, overflow: 'hidden', marginBottom: 20, flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
              borderBottom: `3px solid ${activeTab === tab.key ? tab.color : 'transparent'}`,
              background: activeTab === tab.key ? `${tab.color}0A` : 'transparent',
              color: activeTab === tab.key ? tab.color : '#64748B',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'daily'        && <DailyTab />}
        {activeTab === 'weekly'       && <WeeklyTab />}
        {activeTab === 'monthly'      && <MonthlyTab />}
        {activeTab === 'leaderboards' && <LeaderboardsTab />}
        {activeTab === 'badges'       && <BadgesTab />}
        {activeTab === 'halloffame'   && <HallOfFameTab />}
      </div>
    </div>
  );
}
