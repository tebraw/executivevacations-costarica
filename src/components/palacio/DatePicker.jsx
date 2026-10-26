import React, { useState } from 'react';
import { GIFT_SLUGS, addDays, fmt, isBlockedIn, nightsBetween, spanBlockedIn } from './shared';

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function selectionText(sel) {
  const { s, e } = sel;
  if (!s) return 'Select check-in and check-out';
  if (!e) return `${fmt(s)} – now choose check-out`;
  const n = nightsBetween(s, e);
  return `${fmt(s)} – ${fmt(e)} · ${n} night${n > 1 ? 's' : ''}`;
}

// Complimentary catamaran cruise for stays of 7 nights (Palacio Musical and Palacio Tropical only).
export function GiftNote({ sel, slug, ranges, onExtend }) {
  const { s, e } = sel;
  if (!GIFT_SLUGS.includes(slug) || !s) return null;
  const t7 = addDays(s, 7);
  const n = e ? nightsBetween(s, e) : 0;

  if (e && n >= 7) {
    return (
      <div className="gift on">
        <span className="gi">★</span>
        <div>
          <b>Included with your stay: Private Sunset Catamaran Cruise</b>
          <span>A $1,200 value, complimentary with your {n}-night stay.</span>
        </div>
      </div>
    );
  }
  if (e) {
    const canExtend = !spanBlockedIn(ranges, s, t7);
    return (
      <div className="gift">
        <span className="gi">★</span>
        <div>
          <b>{7 - n} more night{7 - n > 1 ? 's' : ''} and a $1,200 cruise is our gift to you</b>
          <span>A private Sunset Catamaran Cruise, complimentary with 7 nights.</span>
          {canExtend && onExtend && (
            <button type="button" onClick={onExtend}>Extend to 7 nights · check-out {fmt(t7)}</button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="gift">
      <span className="gi">★</span>
      <div>
        <b>A $1,200 gift is waiting on night 7</b>
        <span>Check out on {fmt(t7)} and a private Sunset Catamaran Cruise is complimentary.</span>
      </div>
    </div>
  );
}

export default function DatePicker({ ranges, sel, onChange, slug }) {
  const [cur, setCur] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const today = new Date().setHours(0, 0, 0, 0);
  const gift = GIFT_SLUGS.includes(slug);
  const { s, e } = sel;

  const pick = (t) => {
    if (s && !e && t > s && !spanBlockedIn(ranges, s, t)) onChange({ s, e: t });
    else if (!isBlockedIn(ranges, t)) onChange({ s: t, e: null });
  };

  const shift = (n) =>
    setCur((c) => {
      const d = new Date(c);
      d.setMonth(d.getMonth() + n);
      return d;
    });

  const month = (base) => {
    const y = base.getFullYear();
    const m = base.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i += 1) cells.push(<div key={`b${i}`} />);
    for (let d = 1; d <= days; d += 1) {
      const t = new Date(y, m, d).getTime();
      let k = 'd';
      if (isBlockedIn(ranges, t)) k += ' b';
      if (t < today) k += ' p';
      if (s && e && t > s && t < e) k += ' in';
      if (t === s) k += ' st';
      if (t === e) k += ' en';
      if (gift && s && t === addDays(s, 7) && t !== e) k += ' gf';
      cells.push(
        <button key={d} type="button" className={k} disabled={t < today} onClick={() => pick(t)}>
          {d}
        </button>
      );
    }
    return (
      <div className="cmo" key={`${y}-${m}`}>
        <div className="cmt">{base.toLocaleString('en', { month: 'long', year: 'numeric' })}</div>
        <div className="cg">
          {DOW.map((d) => (
            <div className="dow" key={d}>{d}</div>
          ))}
          {cells}
        </div>
      </div>
    );
  };

  const next = new Date(cur);
  next.setMonth(next.getMonth() + 1);

  return (
    <>
      <div className="calh">
        <button type="button" aria-label="Previous month" onClick={() => shift(-1)}>‹</button>
        <button type="button" aria-label="Next month" onClick={() => shift(1)}>›</button>
      </div>
      <div className="cm2">{month(cur)}{month(next)}</div>
      <div className="legend">
        <span><i />Reserved</span>
        <span>{selectionText(sel)}</span>
      </div>
      <GiftNote sel={sel} slug={slug} ranges={ranges} onExtend={() => s && onChange({ s, e: addDays(s, 7) })} />
    </>
  );
}
