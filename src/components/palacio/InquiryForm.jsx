import React, { useEffect, useRef, useState } from 'react';
import villas from '../../data/villas';
import DatePicker from './DatePicker';
import { fmt, holidayFor, isoDate, nightsBetween, useBookedRanges, GIFT_SLUGS } from './shared';

// Simple availability request. It posts to the existing Netlify form (`contact` on the home page,
// `villa-inquiry` on a villa page) with the same field names the admin and notifications already use.
export default function InquiryForm({ formName, villa, onVillaChange, sel, onSelChange }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [flexible, setFlexible] = useState(false);
  const boxRef = useRef(null);

  const chosen = villas.find((v) => v.name === villa) || null;
  const ranges = useBookedRanges(chosen && !chosen.isComingSoon ? chosen.name : null);
  const { s, e } = sel;
  const holiday = holidayFor(s, e);
  const gift = chosen && GIFT_SLUGS.includes(chosen.slug);

  useEffect(() => {
    const away = (ev) => {
      if (boxRef.current && !boxRef.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('click', away);
    return () => document.removeEventListener('click', away);
  }, []);

  useEffect(() => {
    if (s && e) setOpen(false);
  }, [s, e]);

  const datesText = s && e
    ? `${fmt(s)} – ${fmt(e)} (${nightsBetween(s, e)} nights)${gift && nightsBetween(s, e) >= 7 ? ' · Cruise included' : ''}`
    : s ? `${fmt(s)} – …` : '';

  const changeVilla = (name) => {
    onVillaChange(name);
    onSelChange({ s: null, e: null });
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (status === 'sending') return;
    const form = ev.target;
    const d = new URLSearchParams(new FormData(form));
    d.set('form-name', formName);
    d.set('villa-selected', villa || 'None');
    d.set('checkIn', s ? isoDate(s) : '');
    d.set('checkOut', s && e ? isoDate(e) : '');
    d.set('nights', s && e ? String(nightsBetween(s, e)) : '');
    d.set('flexible-dates', flexible ? 'Yes' : 'No');
    d.set('activities-selected', 'None');
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: d.toString(),
      });
      if (!res.ok) throw new Error(res.status);
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="form">
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-.02em', marginBottom: 10 }}>Thank you.</h3>
          <p style={{ color: 'var(--muted)', fontWeight: 300, maxWidth: 440, margin: 'auto' }}>
            Your request has been received. We will reply personally with availability and a tailored proposal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="form" name={formName} method="POST" onSubmit={submit}>
      <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
      <div>
        <label htmlFor="pf-villa">Preferred estate</label>
        <select id="pf-villa" value={villa || ''} onChange={(ev) => changeVilla(ev.target.value)}>
          {villas.map((v) => (
            <option key={v.slug} value={v.name}>
              {v.name}{v.isComingSoon ? ` (${v.availableFrom || 'soon'})` : ''}
            </option>
          ))}
          <option value="">Not sure yet</option>
        </select>
      </div>
      <div className="row">
        <div className="dtw" ref={boxRef}>
          <label htmlFor="pf-dates">Dates</label>
          <input
            id="pf-dates"
            className="dt"
            readOnly
            value={datesText}
            placeholder="Select check-in and check-out"
            onClick={() => setOpen((o) => !o)}
          />
          <label className="flex">
            <input type="checkbox" checked={flexible} onChange={(ev) => setFlexible(ev.target.checked)} /> My dates are flexible
          </label>
          <div className={`pop${open ? ' on' : ''}`}>
            <div className="pk">
              <DatePicker ranges={ranges} sel={sel} onChange={onSelChange} slug={chosen?.slug} />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="pf-guests">Guests</label>
          <input id="pf-guests" type="number" name="numberOfPeople" min="1" />
        </div>
      </div>
      {holiday && (
        <div className="hnote">
          <b>{holiday.name} holiday period.</b> A {holiday.minNights}-night minimum stay applies and special rates may apply. We confirm the exact rate when we reply.
        </div>
      )}
      <div className="row">
        <div>
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" type="text" name="name" required />
        </div>
        <div>
          <label htmlFor="pf-email">Email</label>
          <input id="pf-email" type="email" name="email" required />
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor="pf-phone">Phone or WhatsApp (optional)</label>
          <input id="pf-phone" type="tel" name="phone" />
        </div>
        <div>
          <label htmlFor="pf-msg">Anything we should know? (optional)</label>
          <input id="pf-msg" type="text" name="message" />
        </div>
      </div>
      {status === 'error' && (
        <div className="hnote" role="alert">Sorry, we could not send your request. Please try again in a moment.</div>
      )}
      <button className="btn btn-gold" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request Availability'}
      </button>
      <small>Free, no obligation. A real person replies personally.</small>
    </form>
  );
}
