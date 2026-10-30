// Private (friends and family) bookings exist only in the admin. These helpers tell them apart from real bookings
// and find where the two collide. A stay covers its nights: it starts on startDate and ends on endDate, so a stay
// that ends on the day another one starts does not overlap it (the same rule the website uses).
export const isPrivateBooking = (booking) => booking?.isPrivate === true;

export const toDay = (value) => {
  const [y, m, d] = String(value || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
};

const formatDay = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const formatRange = (from, to) => `${formatDay(from)} – ${formatDay(to)}`;

// Overlapping nights of two bookings on the villas they share, or null.
export function overlapOf(a, b) {
  const villas = (a.villas || []).filter((v) => (b.villas || []).includes(v));
  if (!villas.length) return null;
  const from = Math.max(toDay(a.startDate), toDay(b.startDate));
  const to = Math.min(toDay(a.endDate), toDay(b.endDate));
  return from < to ? { villas, from, to } : null;
}

// What a booking (saved or not) collides with. kind tells how serious it is:
//   'private-on-real'     a private booking on dates a real guest already holds (not allowed)
//   'real-on-private'     a real booking on dates a private booking holds (allowed, the private guests must leave)
//   'private-on-private'  two private bookings on the same dates (only a hint)
// Two real bookings are not checked here.
export function conflictsFor(candidate, bookings) {
  const candidatePrivate = isPrivateBooking(candidate);
  return bookings
    .filter((other) => String(other.id) !== String(candidate.id))
    .map((other) => {
      const overlap = overlapOf(candidate, other);
      if (!overlap) return null;
      const otherPrivate = isPrivateBooking(other);
      if (candidatePrivate && !otherPrivate) return { kind: 'private-on-real', other, ...overlap };
      if (!candidatePrivate && otherPrivate) return { kind: 'real-on-private', other, ...overlap };
      if (candidatePrivate && otherPrivate) return { kind: 'private-on-private', other, ...overlap };
      return null;
    })
    .filter(Boolean);
}

// Conflicts as the details view of a stored booking shows them. For a private booking a real booking on its dates
// is not a refusal any more but a fact: kind 'real-on-this' (the private guests have to leave).
export function conflictsForDetails(booking, bookings) {
  const list = conflictsFor(booking, bookings);
  if (!isPrivateBooking(booking)) return list.filter((c) => c.kind === 'real-on-private');
  return list.map((c) => (c.kind === 'private-on-real' ? { ...c, kind: 'real-on-this' } : c));
}

// Private and real bookings that overlap, keyed by booking id (for the calendar and the details view).
export function conflictMap(bookings) {
  const map = new Map();
  const add = (id, entry) => map.set(id, [...(map.get(id) || []), entry]);
  const privates = bookings.filter(isPrivateBooking);
  const reals = bookings.filter((b) => !isPrivateBooking(b));
  privates.forEach((p) => reals.forEach((r) => {
    const overlap = overlapOf(p, r);
    if (!overlap) return;
    add(p.id, { other: r, ...overlap });
    add(r.id, { other: p, ...overlap });
  }));
  return map;
}
