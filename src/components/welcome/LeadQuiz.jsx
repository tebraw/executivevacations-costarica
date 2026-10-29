import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import villas from '../../data/villas';
import DatePicker from '../palacio/DatePicker';
import { GIFT_SLUGS, fmt, isoDate, nightsBetween, spanBlockedIn } from '../palacio/shared';
import { GROUPS, OCCASIONS, comboParts, openWindows, periodStatus, startOfToday, unionRanges } from './availability';
import { useQuiz } from './QuizContext';
import { getAttribution, metaIds, newEventId, track } from '../../utils/track';

const WINDOWS = ['Within 3 months', '3–6 months', '6–12 months', 'Just exploring'];
const EMPTY = { s: null, e: null };

// The four-step request: two taps (occasion, guests), dates with the live calendar, then contact details.
// It posts to the Netlify form "welcome-lead", so the team is notified exactly like for the other forms.
export default function LeadQuiz({ idp, book, cfg, holidays, calendarStart }) {
  const { q, set } = useQuiz();
  const navigate = useNavigate();
  const headRef = useRef(null);
  const [errors, setErrors] = useState({});

  const group = GROUPS.find((g) => g.id === q.group) || null;
  const ready = book.status === 'ready';
  const ranges = ready && q.villa ? unionRanges(book.byVilla, q.villa) : [];
  const giftSlug = useMemo(() => {
    const v = villas.find((x) => x.name === comboParts(q.villa)[0]);
    return v && GIFT_SLUGS.includes(v.slug) ? v.slug : undefined;
  }, [q.villa]);
  const nights = q.sel.s && q.sel.e ? nightsBetween(q.sel.s, q.sel.e) : 0;
  const when = nights
    ? `${fmt(q.sel.s)} – ${fmt(q.sel.e)} · ${nights} nights`
    : q.flexible && q.window
      ? `Flexible (${q.window})`
      : 'Dates to be confirmed';

  // Keyboard and screen-reader users land on the question of the new step.
  useEffect(() => {
    if (q.touched && q.from === idp && headRef.current) headRef.current.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.step]);

  const choose = (patch) => {
    if (!q.touched) track('QuizStart', { variant: cfg.key });
    set(patch, idp);
  };

  // One-tap dates that are really free for the chosen estate: holiday weeks first, then the next open weeks.
  const quick = useMemo(() => {
    if (!ready || !q.villa) return [];
    const r = unionRanges(book.byVilla, q.villa);
    const out = [];
    if (cfg.holidayPicks) {
      holidays.forEach((p) => {
        if (p.start >= startOfToday() && periodStatus(r, p) === 'open') {
          out.push({ label: `${p.name} week · ${fmt(p.start)} – ${fmt(p.end)}`, s: p.start, e: p.end });
        }
      });
    }
    openWindows(r, { nights: 7, count: 3 }).forEach((w) => {
      if (!out.some((x) => x.s === w.s)) out.push({ label: `${fmt(w.s)} – ${fmt(w.e)}`, s: w.s, e: w.e });
    });
    return out.slice(0, 4);
  }, [ready, q.villa, book.byVilla, cfg.holidayPicks, holidays]);

  const pickOccasion = (o) => {
    track('QuizStep', { step: 1, occasion: o });
    choose({ occasion: o, step: 2 });
  };

  const pickGroup = (g) => {
    track('QuizStep', { step: 2, group: g.id });
    const keep = g.estates.includes(q.villa);
    choose({ group: g.id, villa: keep ? q.villa : g.estates[0], sel: keep ? q.sel : EMPTY, step: 3 });
  };

  const pickVilla = (name) => {
    const r = ready ? unionRanges(book.byVilla, name) : [];
    const clash = q.sel.s && q.sel.e && spanBlockedIn(r, q.sel.s, q.sel.e);
    choose({ villa: name, sel: clash ? EMPTY : q.sel });
  };

  const canContinue = nights > 0 || (q.flexible && q.window);

  const toContact = () => {
    track('QuizStep', { step: 3, villa: q.villa, nights });
    choose({ step: 4 });
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (q.status === 'sending') return;
    const name = q.name.trim();
    const email = q.email.trim();
    const err = {};
    if (name.length < 2) err.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Please enter a valid email address.';
    setErrors(err);
    if (Object.keys(err).length) return;

    set({ status: 'sending' }, idp);
    const eventId = newEventId();
    const attr = getAttribution();
    const ids = metaIds();
    const d = new URLSearchParams(new FormData(ev.target));
    d.set('form-name', 'welcome-lead');
    d.set('subject', `Ad lead: ${name} · ${q.villa || 'any estate'} · ${when}`);
    d.set('name', name);
    d.set('email', email);
    d.set('phone', q.phone.trim());
    d.set('occasion', q.occasion);
    d.set('group-size', group ? group.label : '');
    d.set('villa-selected', q.villa);
    d.set('checkIn', q.sel.s ? isoDate(q.sel.s) : '');
    d.set('checkOut', q.sel.e ? isoDate(q.sel.e) : '');
    d.set('nights', nights ? String(nights) : '');
    d.set('flexible-dates', q.flexible ? 'Yes' : 'No');
    d.set('travel-window', q.window);
    d.set('landing-variant', cfg.key);
    d.set('landing-path', window.location.pathname);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => d.set(k, attr[k] || ''));
    d.set('fbp', ids.fbp);
    d.set('fbc', ids.fbc);
    d.set('referrer', attr.referrer || '');
    d.set('event-id', eventId);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: d.toString(),
      });
      if (!res.ok) throw new Error(res.status);
      track('Lead', { content_name: cfg.key, villa: q.villa, group: group ? group.label : '', nights }, eventId);
      try {
        sessionStorage.setItem(
          'pc_lead',
          JSON.stringify({ first: name.split(' ')[0], villa: q.villa, when, group: group ? group.label : '' })
        );
      } catch {
        /* storage can be blocked in in-app browsers */
      }
      navigate('/welcome/thanks');
    } catch {
      set({ status: 'error' }, idp);
    }
  };

  return (
    <div className="qz" id={`${idp}-quiz`}>
      <div className="qz-top">
        <span>Step {q.step} of 4</span>
        {q.step > 1 && (
          <button type="button" className="qz-back" onClick={() => choose({ step: q.step - 1 })}>
            ‹ Back
          </button>
        )}
      </div>
      <div className="qz-bar" role="progressbar" aria-label="Progress" aria-valuemin="1" aria-valuemax="4" aria-valuenow={q.step}>
        <i style={{ width: `${q.step * 25}%` }} />
      </div>

      {q.step === 1 && (
        <div>
          <h3 className="qz-q" tabIndex={-1} ref={headRef}>What&apos;s the occasion?</h3>
          <div className="chips">
            {OCCASIONS.map((o) => (
              <button key={o} type="button" className="chip" aria-pressed={q.occasion === o} onClick={() => pickOccasion(o)}>
                {o}
              </button>
            ))}
          </div>
          <p className="qz-fine">Takes about 60 seconds. Free, no obligation.</p>
        </div>
      )}

      {q.step === 2 && (
        <div>
          <h3 className="qz-q" tabIndex={-1} ref={headRef}>How many guests?</h3>
          <div className="chips chips-5">
            {GROUPS.map((g) => (
              <button key={g.id} type="button" className="chip chip-c" aria-pressed={q.group === g.id} onClick={() => pickGroup(g)}>
                {g.label}
              </button>
            ))}
          </div>
          <p className="qz-fine">{q.occasion ? `${q.occasion}. ` : ''}We match you with the right estate.</p>
        </div>
      )}

      {q.step === 3 && (
        <div>
          <h3 className="qz-q" tabIndex={-1} ref={headRef}>When would you like to go?</h3>
          {group && group.estates.length > 1 && (
            <>
              <div className="qz-lab">Estate</div>
              <div className="chips chips-row">
                {group.estates.map((n) => (
                  <button key={n} type="button" className="chip chip-s" aria-pressed={q.villa === n} onClick={() => pickVilla(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
          {group && group.estates.length === 1 && (
            <p className="qz-note">Palacio Musical and Palacio Tropical sit side by side and can be booked together.</p>
          )}
          {book.status === 'loading' && <p className="qz-note">Loading live availability…</p>}
          {book.status === 'error' && (
            <p className="qz-note">Live availability is not available right now. Pick your preferred dates and we confirm them personally.</p>
          )}
          {quick.length > 0 && (
            <>
              <div className="qz-lab">Open right now</div>
              <div className="chips chips-row">
                {quick.map((w) => (
                  <button
                    key={w.s}
                    type="button"
                    className="chip chip-s"
                    aria-pressed={q.sel.s === w.s && q.sel.e === w.e}
                    onClick={() => choose({ sel: { s: w.s, e: w.e }, flexible: false, window: '' })}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {book.status !== 'loading' && (
            <div className="pk">
              <DatePicker
                ranges={ranges}
                sel={q.sel}
                onChange={(sel) => choose({ sel, flexible: false, window: '' })}
                slug={giftSlug}
                initialMonth={calendarStart}
              />
            </div>
          )}
          <label className="qz-flex">
            <input
              type="checkbox"
              checked={q.flexible}
              onChange={(e) => choose({ flexible: e.target.checked, ...(e.target.checked ? {} : { window: '' }) })}
            />
            My dates are flexible
          </label>
          {q.flexible && nights === 0 && (
            <select aria-label="Roughly when would you like to travel?" value={q.window} onChange={(e) => choose({ window: e.target.value })}>
              <option value="">Roughly when?</option>
              {WINDOWS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
          <button type="button" className="btn btn-gold btn-lg" disabled={!canContinue} onClick={toContact}>
            Continue
          </button>
        </div>
      )}

      {q.step === 4 && (
        <form onSubmit={submit} noValidate>
          <h3 className="qz-q" tabIndex={-1} ref={headRef}>Where should we send your proposal?</h3>
          <p className="qz-sum">
            <b>{q.villa || 'Your estate'}</b> · {when}
            {group ? ` · ${group.label} guests` : ''}
          </p>
          {giftSlug && nights >= 7 && <p className="qz-gift">★ Includes your complimentary sunset catamaran cruise</p>}
          <input className="hp" type="text" name="bot-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="qz-f">
            <label htmlFor={`${idp}-name`}>Your name</label>
            <input
              id={`${idp}-name`}
              name="name"
              type="text"
              autoComplete="name"
              value={q.name}
              aria-invalid={!!errors.name}
              onChange={(e) => set({ name: e.target.value }, idp)}
            />
            {errors.name && <span className="qz-err" role="alert">{errors.name}</span>}
          </div>
          <div className="qz-f">
            <label htmlFor={`${idp}-email`}>Email</label>
            <input
              id={`${idp}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={q.email}
              aria-invalid={!!errors.email}
              onChange={(e) => set({ email: e.target.value }, idp)}
            />
            {errors.email && <span className="qz-err" role="alert">{errors.email}</span>}
          </div>
          <div className="qz-f">
            <label htmlFor={`${idp}-phone`}>Mobile or WhatsApp <em>(optional, for the fastest reply)</em></label>
            <input
              id={`${idp}-phone`}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={q.phone}
              onChange={(e) => set({ phone: e.target.value }, idp)}
            />
          </div>
          <p className="qz-fine qz-consent">
            By sending this request you agree that we may contact you by email, and by text or WhatsApp if you add your number, about your trip.
            Message and data rates may apply. We never sell your data.{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </p>
          {q.status === 'error' && (
            <div className="hnote" role="alert">Sorry, we could not send your request. Please try again in a moment, or message us on WhatsApp.</div>
          )}
          <button type="submit" className="btn btn-gold btn-lg" disabled={q.status === 'sending'}>
            {q.status === 'sending' ? 'Sending…' : 'Send my personal proposal'}
          </button>
          <p className="qz-assure">Free · No obligation · Personal reply within 24 hours</p>
        </form>
      )}
    </div>
  );
}
