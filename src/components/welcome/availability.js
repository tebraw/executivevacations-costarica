import { useEffect, useState } from 'react';

const DAY = 864e5;

export const COMBO = 'Palacio Musical + Palacio Tropical';
export const comboParts = (name) => (name === COMBO ? ['Palacio Musical', 'Palacio Tropical'] : [name]);

// Which estates suit which group size (capacity: Musical 20 guests, Tropical 18, the other two 8).
// A group of 19 or more can take Palacio Musical alone (up to 20) or both estates side by side.
export const GROUPS = [
  { id: '2-4', label: '2–4', estates: ['The View House', 'Palacio Las Palmas'] },
  { id: '5-8', label: '5–8', estates: ['The View House', 'Palacio Las Palmas'] },
  { id: '9-12', label: '9–12', estates: ['Palacio Tropical', 'Palacio Musical'] },
  { id: '13-18', label: '13–18', estates: ['Palacio Musical', 'Palacio Tropical'] },
  { id: '19+', label: '19+', estates: [COMBO, 'Palacio Musical'] },
];

export const OCCASIONS = ['Family reunion', 'Milestone birthday', "Friends' getaway", 'Wedding or celebration', 'Retreat or team trip'];

export const startOfToday = () => new Date().setHours(0, 0, 0, 0);

export const addDay = (t, n) => {
  const d = new Date(t);
  d.setDate(d.getDate() + n);
  return d.getTime();
};

const parseDay = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

export const isBooked = (ranges, t) => ranges.some((r) => t >= r.s && t < r.e);

export const unionRanges = (byVilla, name) => comboParts(name).flatMap((n) => byVilla[n] || []);

// Booking data is read strictly. If it cannot be loaded the page shows no availability claims at all,
// instead of treating a failed request as "everything is free".
let pending = null;
function loadStrict() {
  if (!pending) {
    pending = fetch('/.netlify/functions/get-bookings')
      .then((r) => {
        if (!r.ok) throw new Error(`bookings ${r.status}`);
        return r.json();
      })
      .then((all) => {
        if (!Array.isArray(all)) throw new Error('bookings shape');
        return all;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

// Reserved date ranges per estate, from the same booking data the admin calendar writes.
export function useBookings(names) {
  const [state, setState] = useState({ status: 'loading', byVilla: {} });
  const key = names.join('|');
  useEffect(() => {
    let off = false;
    loadStrict().then(
      (all) => {
        if (off) return;
        const byVilla = {};
        names.forEach((n) => {
          byVilla[n] = all
            .filter((b) => Array.isArray(b.villas) && b.villas.includes(n))
            .map((b) => ({ s: parseDay(b.startDate), e: parseDay(b.endDate) }));
        });
        setState({ status: 'ready', byVilla });
      },
      () => {
        if (!off) setState({ status: 'error', byVilla: {} });
      }
    );
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

// The next Christmas and New Year's periods that have not ended yet (same dates as the booking form's holiday notice).
export function upcomingHolidays(now = Date.now()) {
  const d = new Date(now);
  const y = d.getMonth() === 0 && d.getDate() <= 4 ? d.getFullYear() - 1 : d.getFullYear();
  const t0 = new Date(now).setHours(0, 0, 0, 0);
  return [
    { key: 'christmas', name: 'Christmas', start: new Date(y, 11, 20).getTime(), end: new Date(y, 11, 27).getTime() },
    { key: 'newyear', name: "New Year's", start: new Date(y, 11, 28).getTime(), end: new Date(y + 1, 0, 4).getTime() },
  ].filter((p) => p.end > t0);
}

export const seasonLabel = (periods) => {
  if (!periods.length) return '';
  const y = new Date(periods[0].start).getFullYear();
  return `${y}/${String(y + 1).slice(2)}`;
};

// 'open' = every night free, 'partial' = some nights taken, 'booked' = every night taken.
export function periodStatus(ranges, p) {
  let total = 0;
  let taken = 0;
  for (let t = p.start; t < p.end; t = addDay(t, 1)) {
    total += 1;
    if (isBooked(ranges, t)) taken += 1;
  }
  if (taken === 0) return 'open';
  return taken >= total ? 'booked' : 'partial';
}

// Next free stretches of a given length, starting a week from today.
export function openWindows(ranges, { nights = 7, from = addDay(startOfToday(), 7), days = 200, count = 3 } = {}) {
  const out = [];
  const last = addDay(from, days);
  for (let s = from; s < last && out.length < count; s = addDay(s, 1)) {
    const e = addDay(s, nights);
    let free = true;
    for (let t = s; t < e; t = addDay(t, 1)) {
      if (isBooked(ranges, t)) {
        free = false;
        break;
      }
    }
    if (free) {
      out.push({ s, e });
      s = addDay(e, -1);
    }
  }
  return out;
}

export const perGuest = (v) => (v.guests && v.startingPrice ? Math.round(v.startingPrice / v.guests) : null);

export const reviewStats = (reviews) => {
  const rated = (reviews || []).map((r) => Number(r.rating)).filter((n) => n > 0);
  if (!rated.length) return null;
  return { count: rated.length, avg: rated.reduce((a, b) => a + b, 0) / rated.length };
};
