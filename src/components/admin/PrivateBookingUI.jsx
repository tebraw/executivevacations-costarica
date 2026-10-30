import React from 'react';
import { formatRange } from '../../utils/bookingConflicts';

const TEAL = { dark: '#115e59', mid: '#0f766e', soft: '#ecfdf5' };

// Shown wherever a private (friends and family) booking is created, edited or opened.
export function PrivateBanner({ compact = false }) {
  return (
    <div
      role="note"
      style={{
        borderRadius: '16px',
        border: `2px dashed ${TEAL.mid}`,
        background: `repeating-linear-gradient(45deg, ${TEAL.soft} 0 14px, #ffffff 14px 28px)`,
        padding: compact ? '12px 14px' : '16px 18px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start'
      }}
    >
      <div style={{ fontSize: compact ? '22px' : '28px', lineHeight: 1 }}>🔒</div>
      <div>
        <div style={{ fontWeight: 900, color: TEAL.dark, letterSpacing: '0.04em', fontSize: compact ? '13px' : '14px' }}>
          PRIVATE BOOKING · FRIENDS &amp; FAMILY
        </div>
        <p style={{ margin: '6px 0 0', color: '#134e4a', fontSize: compact ? '13px' : '14px', lineHeight: 1.55 }}>
          This booking is visible <b>only here in the admin</b>. It does <b>not</b> appear on the website, in the availability search or in the
          iCal feeds, and it does <b>not</b> block these dates for real guests. If a real guest books the same dates you will see a ⚠ conflict,
          and your friends or family will have to leave.
        </p>
      </div>
    </div>
  );
}

const who = (c) => (
  <>
    <b>{c.other.customerName || 'Guest'}</b> · {c.villas.join(', ')} · {formatRange(c.from, c.to)}
  </>
);

// Lists what a booking collides with. A private booking on a real one is not allowed, the other cases are warnings.
export function ConflictBox({ conflicts }) {
  const blocked = conflicts.filter((c) => c.kind === 'private-on-real');
  const overPrivate = conflicts.filter((c) => c.kind === 'real-on-private');
  const overThis = conflicts.filter((c) => c.kind === 'real-on-this');
  const doubled = conflicts.filter((c) => c.kind === 'private-on-private');
  if (!conflicts.length) return null;
  const box = (bg, border, color) => ({ borderRadius: '14px', border: `2px solid ${border}`, background: bg, color, padding: '14px 16px', fontSize: '14px', lineHeight: 1.55 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {overThis.length > 0 && (
        <div style={box('#fef2f2', '#dc2626', '#7f1d1d')} role="alert">
          <b>⚠ CONFLICT: a real booking is on these dates.</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>{overThis.map((c, i) => <li key={i}>{who(c)}</li>)}</ul>
          <div style={{ marginTop: '6px' }}>
            Your Friends &amp; Family will have to leave. Nothing was deleted: this private booking stays in the calendar until you remove it yourself.
          </div>
        </div>
      )}
      {blocked.length > 0 && (
        <div style={box('#fef2f2', '#dc2626', '#7f1d1d')} role="alert">
          <b>⛔ Not possible: these dates are already booked by a real guest.</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>{blocked.map((c, i) => <li key={i}>{who(c)}</li>)}</ul>
          <div style={{ marginTop: '6px' }}>Friends &amp; Family can only be added on dates that are still free.</div>
        </div>
      )}
      {overPrivate.length > 0 && (
        <div style={box('#fffbeb', '#d97706', '#78350f')} role="alert">
          <b>⚠ Conflict with a private (Friends &amp; Family) booking.</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>{overPrivate.map((c, i) => <li key={i}>{who(c)}</li>)}</ul>
          <div style={{ marginTop: '6px' }}>
            A real booking takes priority, so these guests will have to leave. Nothing is deleted automatically: the private booking stays in the
            calendar until you remove it yourself.
          </div>
        </div>
      )}
      {doubled.length > 0 && (
        <div style={box('#f0f9ff', '#0284c7', '#0c4a6e')}>
          <b>ℹ This overlaps another Friends &amp; Family booking.</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>{doubled.map((c, i) => <li key={i}>{who(c)}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

// Stays on the Bookings tab after a booking was saved, until it is closed. It says in writing what was checked.
export function SaveNotice({ notice, onClose }) {
  if (!notice) return null;
  const tones = {
    success: { bg: '#f0fdf4', border: '#16a34a', title: '#14532d' },
    warning: { bg: '#fffbeb', border: '#d97706', title: '#78350f' },
    error: { bg: '#fef2f2', border: '#dc2626', title: '#7f1d1d' }
  };
  const t = tones[notice.tone] || tones.success;
  const mark = (ok) => (ok === true ? '✔' : ok === false ? '✖' : '•');
  const markColor = (ok) => (ok === true ? '#16a34a' : ok === false ? '#dc2626' : '#6b7280');
  return (
    <div
      role="status"
      data-testid="save-notice"
      style={{
        maxWidth: '56rem',
        margin: '0 auto 24px',
        borderRadius: '18px',
        border: `2px ${notice.private ? 'dashed' : 'solid'} ${t.border}`,
        background: notice.private ? `repeating-linear-gradient(45deg, ${t.bg} 0 14px, #ffffff 14px 28px)` : t.bg,
        padding: '18px 20px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '16px', color: t.title }}>{notice.title}</div>
          {notice.summary && <div style={{ marginTop: '4px', fontSize: '14px', color: '#374151', fontWeight: 600 }}>{notice.summary}</div>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close message"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#6b7280', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
      {notice.checks?.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {notice.checks.map((c, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#1f2937', display: 'flex', gap: '8px' }}>
              <span style={{ color: markColor(c.ok), fontWeight: 900 }}>{mark(c.ok)}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      )}
      {notice.conflicts?.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <ConflictBox conflicts={notice.conflicts} />
        </div>
      )}
    </div>
  );
}
