import { useEffect, useState } from 'react';
import { getBookings } from '../../utils/bookingStorage';

export const WEDDINGS_URL = 'https://www.paradiseweddingscostarica.com';

// The complimentary catamaran cruise applies to these estates only.
export const GIFT_SLUGS = ['palacio-tropical', 'palacio-musical'];

export const HOLIDAYS = [
  { name: 'Christmas', start: new Date(2026, 11, 20).getTime(), end: new Date(2026, 11, 27).getTime(), minNights: 7 },
  { name: "New Year's", start: new Date(2026, 11, 28).getTime(), end: new Date(2027, 0, 4).getTime(), minNights: 7 },
];

const DAY = 864e5;

export const label = (a) => (typeof a === 'string' ? a : a?.name || '');
export const fmt = (t) => new Date(t).toLocaleDateString('en', { month: 'short', day: 'numeric' });
export const nightsBetween = (s, e) => Math.round((e - s) / DAY);
export const isoDate = (t) => new Date(t).toLocaleDateString('en-CA');

export const addDays = (t, n) => {
  const d = new Date(t);
  d.setDate(d.getDate() + n);
  return d.getTime();
};

export const holidayFor = (s, e) => {
  if (!s) return null;
  const ref = e || s;
  return HOLIDAYS.find((p) => s < p.end && ref >= p.start) || null;
};

export const isBlockedIn = (ranges, t) => ranges.some((r) => t >= r.s && t < r.e);

export const spanBlockedIn = (ranges, s, e) => {
  for (const d = new Date(s); d.getTime() < e; d.setDate(d.getDate() + 1)) {
    if (isBlockedIn(ranges, d.getTime())) return true;
  }
  return false;
};

const parseDay = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

// One shared request for all components on the page.
let bookingsPromise = null;
const loadBookings = () => {
  if (!bookingsPromise) {
    bookingsPromise = getBookings()
      .then((all) => (Array.isArray(all) ? all : []))
      .catch(() => []);
  }
  return bookingsPromise;
};

// Reserved date ranges of one villa, from the same booking data the admin calendar writes.
export function useBookedRanges(villaName) {
  const [ranges, setRanges] = useState([]);
  useEffect(() => {
    let cancelled = false;
    if (!villaName) {
      setRanges([]);
      return undefined;
    }
    loadBookings().then((all) => {
      if (cancelled) return;
      setRanges(
        all
          .filter((b) => Array.isArray(b.villas) && b.villas.includes(villaName))
          .map((b) => ({ s: parseDay(b.startDate), e: parseDay(b.endDate) }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [villaName]);
  return ranges;
}

// Fades elements in once they scroll into view.
export function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const t = setTimeout(() => {
      document.querySelectorAll('.pc .card, .pc .bcard, .pc .pillar, .pc .ex, .pc .dsec, .pc .guide, .pc .faq details').forEach((el) => {
        el.classList.add('rv');
        io.observe(el);
      });
    }, 60);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
