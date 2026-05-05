import React, { useState, useEffect } from 'react';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#e8c84e';

// ── Helpers ────────────────────────────────────────────────────
const REVIEWS_KEY = (villa) => `ev_reviews_${villa}`;

async function fetchReviews(villaName) {
  try {
    const res = await fetch(`/.netlify/functions/get-reviews?villa=${encodeURIComponent(villaName)}`);
    if (res.ok) return await res.json();
  } catch (_) {}
  // localStorage fallback (local dev)
  try {
    const raw = localStorage.getItem(REVIEWS_KEY(villaName));
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

async function postReview(payload) {
  try {
    const res = await fetch('/.netlify/functions/save-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const { review } = await res.json();
      return { ok: true, review };
    }
  } catch (_) {}
  // localStorage fallback (local dev)
  const review = { ...payload, id: Date.now().toString(), date: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(REVIEWS_KEY(payload.villa));
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(review);
    localStorage.setItem(REVIEWS_KEY(payload.villa), JSON.stringify(existing));
  } catch (_) {}
  return { ok: true, review };
}

// ── StarPicker ─────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            fontSize: '2rem', lineHeight: 1,
            color: n <= (hover || value) ? GOLD_LIGHT : '#d1d5db',
            transition: 'color 0.12s, transform 0.1s',
            transform: n <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
          }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── StarDisplay ────────────────────────────────────────────────
function StarDisplay({ rating, size = '1rem' }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size, color: n <= rating ? GOLD_LIGHT : '#d1d5db', lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

// ── Avatar initials ────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
  const colors = ['#c9a227', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.03em',
    }}>
      {initials}
    </div>
  );
}

// ── ReviewCard ────────────────────────────────────────────────
function ReviewCard({ review }) {
  const date = new Date(review.date);
  const month = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid #f0ece4', transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        <Avatar name={review.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>
            {review.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <StarDisplay rating={review.rating} size="0.95rem" />
            <span style={{ color: '#9ca3af', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif" }}>{month}</span>
          </div>
        </div>
        {/* Quote icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill={GOLD} opacity="0.18" style={{ flexShrink: 0 }}>
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
      </div>
      <p style={{
        color: '#374151', lineHeight: 1.65, fontSize: '0.92rem',
        fontFamily: "'DM Sans', sans-serif", margin: 0,
      }}>
        {review.text}
      </p>
    </div>
  );
}

// ── ReviewModal ───────────────────────────────────────────────
function ReviewModal({ villaName, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError('Please choose a star rating.'); return; }
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!text.trim()) { setError('Please write a short review.'); return; }
    setError('');
    setSubmitting(true);
    const { ok, review } = await postReview({ villa: villaName, name: name.trim(), rating, text: text.trim() });
    setSubmitting(false);
    if (ok) { onSubmitted(review); }
    else { setError('Something went wrong. Please try again.'); }
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fieldStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
    color: '#111', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden',
        animation: 'slideUp 0.25s ease-out',
      }}>
        {/* Header */}
        <div style={{ height: '4px', background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#111', margin: 0 }}>
                Leave a Review
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#9ca3af', margin: '4px 0 0' }}>
                {villaName}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', lineHeight: 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Stars */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '10px' }}>
              Your Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: GOLD, fontWeight: 600, marginTop: '6px' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah M."
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = GOLD)}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              style={fieldStyle}
            />
          </div>

          {/* Review text */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>
              Your Review
            </label>
            <textarea
              placeholder="What made your stay special?"
              value={text}
              maxLength={1000}
              rows={4}
              onChange={(e) => setText(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = GOLD)}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '100px' }}
            />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
              {text.length}/1000
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#b91c1c', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#e5e7eb' : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: submitting ? '#9ca3af' : '#111',
              border: 'none', borderRadius: '12px', padding: '14px',
              fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── ReviewSection (main export) ───────────────────────────────
export default function ReviewSection({ villa }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!villa?.name) return;
    setLoading(true);
    fetchReviews(villa.name).then((data) => {
      setReviews(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [villa?.name]);

  function handleSubmitted(review) {
    setReviews((prev) => [review, ...prev]);
    setModalOpen(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <section style={{ background: '#faf9f7', borderTop: '1px solid #f0ece4', padding: '64px 0' }}>
      <div className="container">

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, marginBottom: '8px' }}>
              Guest Experiences
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#111', margin: 0, lineHeight: 1.15 }}>
              Reviews
            </h2>
            {avg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <StarDisplay rating={Math.round(avg)} size="1.1rem" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#111' }}>{avg}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#9ca3af' }}>
                  · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: '#111', border: 'none', borderRadius: '12px',
              padding: '13px 22px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(185,151,46,0.25)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(185,151,46,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(185,151,46,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Leave a Review
          </button>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px solid #6ee7b7', borderRadius: '12px',
            padding: '14px 20px', marginBottom: '28px',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#065f46', fontWeight: 600,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Thank you for your review! It's now live on the page.
          </div>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{ width: '36px', height: '36px', border: `3px solid #f0ece4`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: '#6b7280', marginBottom: '6px', fontWeight: 600 }}>
              No reviews yet
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: '#9ca3af' }}>
              Be the first to share your experience at {villa.name}.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>

      {/* Spinner keyframe — injected inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {modalOpen && (
        <ReviewModal
          villaName={villa.name}
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  );
}
