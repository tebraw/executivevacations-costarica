import React, { useEffect, useState } from 'react';
import { fetchReviews, ReviewModal } from '../ReviewSection';

const Stars = ({ n }) => <div className="st">{'★'.repeat(Math.max(1, Math.round(n || 5)))}</div>;

export const ReviewCard = ({ r, clamp }) => (
  <div className={`rev${clamp ? ' clamp' : ''}`}>
    <Stars n={r.rating} />
    <p>“{r.text}”</p>
    <span>{r.name || 'Guest'} · {r.villa}</span>
  </div>
);

// Approved reviews of one or more villas, read from the same data the admin approves.
export function useApprovedReviews(villaNames) {
  const [reviews, setReviews] = useState(null);
  const key = villaNames.join('|');
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      villaNames.map((name) =>
        fetchReviews(name).then((list) =>
          (Array.isArray(list) ? list : []).filter((r) => r.approved === true).map((r) => ({ ...r, villa: name }))
        )
      )
    ).then((lists) => {
      if (!cancelled) setReviews(lists.flat());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return reviews;
}

// Review list for one villa with the existing "write a review" flow (new reviews wait for admin approval).
export function VillaReviews({ villa }) {
  const reviews = useApprovedReviews([villa.name]);
  const [modal, setModal] = useState(false);
  const [thanks, setThanks] = useState(false);

  return (
    <>
      {reviews && reviews.length > 0 && (
        <div className="revgrid" style={{ marginTop: 10 }}>
          {reviews.slice(0, 6).map((r) => <ReviewCard key={r.id} r={r} />)}
        </div>
      )}
      {reviews && reviews.length === 0 && (
        <p className="revnote">{villa.isComingSoon ? 'Reviews will appear once guests have stayed.' : `Be the first to share your experience at ${villa.name}.`}</p>
      )}
      {!villa.isComingSoon && (
        <div style={{ marginTop: 22 }}>
          <button type="button" className="btn btn-line" onClick={() => setModal(true)}>Write a review</button>
          {thanks && <p className="revnote">Thank you! Your review will appear once it has been approved.</p>}
        </div>
      )}
      {modal && (
        <ReviewModal
          villaName={villa.name}
          onClose={() => setModal(false)}
          onSubmitted={() => { setModal(false); setThanks(true); setTimeout(() => setThanks(false), 6000); }}
        />
      )}
    </>
  );
}
