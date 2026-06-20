/**
 * RouteSphere — Attendance Dashboard data
 * Deterministic attendance records for 20 riders, June 2026.
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'holiday' | 'week_off';
export type LeaveType = 'sick' | 'casual' | 'earned';

export interface DayRecord {
  date: string;        // YYYY-MM-DD
  status: AttendanceStatus;
  loginTime?: string;  // HH:MM
  logoutTime?: string;
  lateMinutes: number;
  hoursWorked?: number;
  deliveries?: number;
}

export interface LeaveBalance {
  sick:   { total: number; used: number; };
  casual: { total: number; used: number; };
  earned: { total: number; used: number; };
}

export interface RiderAttendance {
  riderId: string;
  riderName: string;
  hub: string;
  region: string;
  workingDays: number;     // June 1–20 = 16 working days (ex weekends + 1 holiday)
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  attendancePct: number;
  avgLoginTime: string;
  avgLogoutTime: string;
  avgHoursWorked: number;
  lateAvgMinutes: number;
  leaveBalance: LeaveBalance;
  streak: number;          // current consecutive present days
  days: DayRecord[];
}

// ============================================================
// JUNE 2026 CALENDAR
// June 1 = Monday. Weekends: 6-7, 13-14, 20-21, 27-28
// Public holiday: June 3 (example: Eid-ul-Adha)
// Working days June 1–20: 1,2,4,5,9,10,11,12,16,17,18,19,20 = 13 working days
// ============================================================

const JUNE_DATES: Array<{ date: string; dayType: 'work' | 'weekend' | 'holiday' }> = [
  { date:'2026-06-01', dayType:'work'    },  // Mon
  { date:'2026-06-02', dayType:'work'    },  // Tue
  { date:'2026-06-03', dayType:'holiday' },  // Wed — Public Holiday
  { date:'2026-06-04', dayType:'work'    },  // Thu
  { date:'2026-06-05', dayType:'work'    },  // Fri
  { date:'2026-06-06', dayType:'weekend' },  // Sat
  { date:'2026-06-07', dayType:'weekend' },  // Sun
  { date:'2026-06-08', dayType:'work'    },  // Mon
  { date:'2026-06-09', dayType:'work'    },  // Tue
  { date:'2026-06-10', dayType:'work'    },  // Wed
  { date:'2026-06-11', dayType:'work'    },  // Thu
  { date:'2026-06-12', dayType:'work'    },  // Fri
  { date:'2026-06-13', dayType:'weekend' },  // Sat
  { date:'2026-06-14', dayType:'weekend' },  // Sun
  { date:'2026-06-15', dayType:'work'    },  // Mon
  { date:'2026-06-16', dayType:'work'    },  // Tue
  { date:'2026-06-17', dayType:'work'    },  // Wed
  { date:'2026-06-18', dayType:'work'    },  // Thu
  { date:'2026-06-19', dayType:'work'    },  // Fri
  { date:'2026-06-20', dayType:'work'    },  // Sat (working Sat for June)
];

// Working days in scope (June 1–20 where dayType === 'work')
const WORKING_DAYS = JUNE_DATES.filter(d => d.dayType === 'work');

// ============================================================
// ATTENDANCE PATTERNS PER RIDER
// 'P'=present, 'L'=late, 'A'=absent, 'S'=sick leave, 'C'=casual leave, 'H'=half day
// 14 slots (one per work day June 1–20)
// ============================================================

const PATTERNS: Record<string, string[]> = {
  R01: ['P','P','P','P','P','P','P','P','P','P','P','P','P','P'],  // 14/14
  R02: ['P','P','P','P','P','P','P','P','P','P','P','P','P','P'],
  R03: ['P','P','P','P','P','P','P','P','P','P','P','P','P','L'],
  R04: ['P','P','P','P','P','P','P','P','P','P','P','P','L','P'],
  R05: ['P','P','P','L','P','P','P','P','P','P','P','L','P','P'],
  R06: ['P','P','P','P','P','P','P','P','P','P','P','P','P','P'],
  R07: ['P','P','P','L','P','P','P','P','P','P','L','P','P','P'],
  R08: ['P','P','P','P','P','P','P','C','P','P','P','P','P','P'],
  R09: ['P','P','P','P','L','P','P','P','P','P','P','L','P','P'],
  R10: ['P','P','P','P','P','P','P','P','L','P','P','P','P','P'],
  R11: ['P','P','S','P','P','P','P','P','P','P','P','P','L','P'],
  R12: ['P','P','P','P','P','P','P','L','P','P','P','P','P','L'],
  R13: ['P','L','P','P','P','P','A','P','P','P','P','P','P','L'],
  R14: ['P','P','P','P','P','L','P','P','P','P','P','A','P','P'],
  R15: ['P','P','P','L','A','P','P','P','L','P','P','A','P','P'],
  R16: ['P','A','P','P','P','P','A','P','P','P','L','P','P','A'],
  R17: ['P','P','P','P','L','P','P','A','P','P','P','P','L','P'],
  R18: ['A','P','P','P','L','A','P','P','A','P','P','P','L','P'],
  R19: ['A','A','P','P','P','L','A','P','P','A','P','P','P','P'],
  R20: ['P','A','P','P','L','A','P','P','P','L','A','P','P','P'],
};

// Late rider login minutes by tier
const LATE_MINS_BY_PATTERN: Record<string, number> = {
  R01:12, R02:8,  R03:5,  R04:10, R05:15, R06:6,  R07:12, R08:0,
  R09:18, R10:10, R11:8,  R12:20, R13:25, R14:14, R15:28, R16:32,
  R17:22, R18:35, R19:42, R20:30,
};

const RIDER_INFO = [
  { id:'R01', name:'Arjun Sharma',  hub:'Delhi-Central',     region:'North' },
  { id:'R02', name:'Priya Patel',   hub:'Delhi-North',       region:'North' },
  { id:'R03', name:'Rahul Singh',   hub:'Gurgaon-Hub',       region:'North' },
  { id:'R04', name:'Neha Gupta',    hub:'Noida-Hub',         region:'North' },
  { id:'R05', name:'Vikas Yadav',   hub:'Bangalore-Central', region:'South' },
  { id:'R06', name:'Sunita Joshi',  hub:'Chennai-Hub',       region:'South' },
  { id:'R07', name:'Deepak Kumar',  hub:'Hyderabad-Hub',     region:'South' },
  { id:'R08', name:'Pooja Mishra',  hub:'Kolkata-Central',   region:'East'  },
  { id:'R09', name:'Amit Verma',    hub:'Mumbai-Central',    region:'West'  },
  { id:'R10', name:'Kavya Reddy',   hub:'Pune-Hub',          region:'West'  },
  { id:'R11', name:'Sanjay Nair',   hub:'Delhi-Central',     region:'North' },
  { id:'R12', name:'Divya Mehta',   hub:'Delhi-North',       region:'North' },
  { id:'R13', name:'Rohit Tiwari',  hub:'Gurgaon-Hub',       region:'North' },
  { id:'R14', name:'Anita Bose',    hub:'Noida-Hub',         region:'North' },
  { id:'R15', name:'Kiran Pillai',  hub:'Bangalore-Central', region:'South' },
  { id:'R16', name:'Manoj Agarwal', hub:'Chennai-Hub',       region:'South' },
  { id:'R17', name:'Swati Saxena',  hub:'Hyderabad-Hub',     region:'South' },
  { id:'R18', name:'Ajay Chauhan',  hub:'Kolkata-Central',   region:'East'  },
  { id:'R19', name:'Ritu Bansal',   hub:'Mumbai-Central',    region:'West'  },
  { id:'R20', name:'Vijay Raj',     hub:'Pune-Hub',          region:'West'  },
];

function padTime(h: number, m: number) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function buildDays(riderId: string): DayRecord[] {
  const pattern = PATTERNS[riderId] ?? [];
  const lateMins = LATE_MINS_BY_PATTERN[riderId] ?? 0;
  return JUNE_DATES.map((d, i) => {
    if (d.dayType === 'weekend') return { date: d.date, status: 'week_off', lateMinutes: 0 };
    if (d.dayType === 'holiday') return { date: d.date, status: 'holiday', lateMinutes: 0 };
    const wdIdx = WORKING_DAYS.findIndex(w => w.date === d.date);
    const code = pattern[wdIdx] ?? 'P';

    if (code === 'A') return { date: d.date, status: 'absent', lateMinutes: 0 };
    if (code === 'S') return { date: d.date, status: 'leave',  lateMinutes: 0 };
    if (code === 'C') return { date: d.date, status: 'leave',  lateMinutes: 0 };
    if (code === 'H') return { date: d.date, status: 'half_day', loginTime: '10:30', logoutTime:'14:00', lateMinutes: 90, hoursWorked: 3.5 };

    const isLate = code === 'L';
    const extraMins = isLate ? lateMins : 0;
    const baseH = 8; const baseM = 45;
    const lateH = Math.floor((baseH * 60 + baseM + extraMins) / 60);
    const lateM = (baseH * 60 + baseM + extraMins) % 60;
    const logoutH = 18 + (i % 3 === 0 ? 0 : 1);
    const logoutM = [0, 15, 30, 45][i % 4];

    return {
      date: d.date,
      status: isLate ? 'late' : 'present',
      loginTime: padTime(lateH, lateM),
      logoutTime: padTime(logoutH, logoutM),
      lateMinutes: isLate ? extraMins : 0,
      hoursWorked: parseFloat((logoutH - lateH + (logoutM - lateM) / 60).toFixed(1)),
      deliveries: Math.round(15 + (i % 5) * 3 + (isLate ? -3 : 0)),
    };
  });
}

function computeStreak(days: DayRecord[]): number {
  const workDays = [...days].reverse().filter(d => d.status !== 'week_off' && d.status !== 'holiday');
  let streak = 0;
  for (const d of workDays) {
    if (d.status === 'present' || d.status === 'late') streak++;
    else break;
  }
  return streak;
}

const LEAVE_BALANCES: Record<string, LeaveBalance> = {
  R01:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R02:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:1}},
  R03:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R04:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R05:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R06:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R07:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:1}},
  R08:{sick:{total:6,used:0},casual:{total:6,used:1},earned:{total:12,used:0}},
  R09:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R10:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R11:{sick:{total:6,used:1},casual:{total:6,used:0},earned:{total:12,used:0}},
  R12:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R13:{sick:{total:6,used:0},casual:{total:6,used:1},earned:{total:12,used:0}},
  R14:{sick:{total:6,used:0},casual:{total:6,used:0},earned:{total:12,used:0}},
  R15:{sick:{total:6,used:1},casual:{total:6,used:1},earned:{total:12,used:0}},
  R16:{sick:{total:6,used:1},casual:{total:6,used:1},earned:{total:12,used:1}},
  R17:{sick:{total:6,used:0},casual:{total:6,used:1},earned:{total:12,used:0}},
  R18:{sick:{total:6,used:2},casual:{total:6,used:2},earned:{total:12,used:0}},
  R19:{sick:{total:6,used:2},casual:{total:6,used:3},earned:{total:12,used:0}},
  R20:{sick:{total:6,used:1},casual:{total:6,used:2},earned:{total:12,used:0}},
};

export const RIDER_ATTENDANCE: RiderAttendance[] = RIDER_INFO.map(r => {
  const days   = buildDays(r.id);
  const wDays  = days.filter(d => d.status !== 'week_off' && d.status !== 'holiday');
  const present= wDays.filter(d => d.status === 'present').length;
  const late   = wDays.filter(d => d.status === 'late').length;
  const absent = wDays.filter(d => d.status === 'absent').length;
  const halfDay= wDays.filter(d => d.status === 'half_day').length;
  const leave  = wDays.filter(d => d.status === 'leave').length;
  const totalWD = wDays.length;
  const attPct  = Math.round(((present + late + halfDay*0.5) / totalWD) * 100);

  const lateRecords = wDays.filter(d => d.status === 'late');
  const avgLateMins = lateRecords.length > 0
    ? Math.round(lateRecords.reduce((s,d) => s + d.lateMinutes, 0) / lateRecords.length) : 0;

  return {
    riderId: r.id, riderName: r.name, hub: r.hub, region: r.region,
    workingDays: totalWD, present, absent, late, halfDay, onLeave: leave,
    attendancePct: attPct,
    avgLoginTime: LATE_MINS_BY_PATTERN[r.id] > 0 ? padTime(9, Math.min(LATE_MINS_BY_PATTERN[r.id], 59)) : '08:48',
    avgLogoutTime: '18:22', avgHoursWorked: 9.2,
    lateAvgMinutes: avgLateMins,
    leaveBalance: LEAVE_BALANCES[r.id] ?? { sick:{total:6,used:0}, casual:{total:6,used:0}, earned:{total:12,used:0} },
    streak: computeStreak(days),
    days,
  };
});

// ============================================================
// AGGREGATES
// ============================================================

export function getAttendanceStats() {
  const today = RIDER_ATTENDANCE.map(r => {
    const d = r.days.find(d => d.date === '2026-06-20');
    return d ? d.status : 'absent';
  });
  return {
    presentToday:  today.filter(s => s === 'present').length,
    lateToday:     today.filter(s => s === 'late').length,
    absentToday:   today.filter(s => s === 'absent').length,
    onLeaveToday:  today.filter(s => s === 'leave').length,
    avgAttendance: Math.round(RIDER_ATTENDANCE.reduce((s,r) => s + r.attendancePct, 0) / RIDER_ATTENDANCE.length),
    perfectAttendance: RIDER_ATTENDANCE.filter(r => r.absent === 0 && r.onLeave === 0).length,
    chronicAbsentees:  RIDER_ATTENDANCE.filter(r => r.absent >= 2).length,
  };
}

export function getHubAttendance() {
  const byHub: Record<string, { hub: string; riders: number; avgAtt: number; absent: number }> = {};
  RIDER_ATTENDANCE.forEach(r => {
    if (!byHub[r.hub]) byHub[r.hub] = { hub: r.hub, riders: 0, avgAtt: 0, absent: 0 };
    byHub[r.hub].riders++;
    byHub[r.hub].avgAtt += r.attendancePct;
    byHub[r.hub].absent += r.absent;
  });
  return Object.values(byHub).map(h => ({ ...h, avgAtt: Math.round(h.avgAtt / h.riders) }));
}

export const ATT_STATUS_COLOR: Record<AttendanceStatus, string> = {
  present: '#059669', late: '#D97706', absent: '#DC2626',
  half_day: '#7C3AED', leave: '#2563EB', holiday: '#64748B', week_off: '#E2E8F0',
};
