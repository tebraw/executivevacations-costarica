// Bookings marked as private (friends and family) exist only in the admin. They must never reach the website,
// the availability checks or the public calendar feeds, and they never block dates for real guests.
export const BOOKINGS_KEY = 'all-bookings';

// Only a real boolean true counts, so a booking is never hidden by accident.
export const isPrivateBooking = (booking) => booking?.isPrivate === true;

export const withoutPrivate = (bookings) => bookings.filter((booking) => !isPrivateBooking(booking));

const DAY = /^\d{4}-\d{2}-\d{2}$/;

// Returns a message when a payload would corrupt the list (no id, no dates, no villa), otherwise null.
export function validateBooking(booking) {
  if (!booking || typeof booking !== 'object' || Array.isArray(booking)) return 'Booking must be an object';
  if (booking.id === undefined || booking.id === null || String(booking.id).trim() === '') return 'Booking id is required';
  if (!DAY.test(String(booking.startDate ?? '')) || !DAY.test(String(booking.endDate ?? ''))) return 'Valid start and end dates are required';
  if (!Array.isArray(booking.villas) || booking.villas.length === 0) return 'At least one villa is required';
  if ('isPrivate' in booking && typeof booking.isPrivate !== 'boolean') return 'isPrivate must be true or false';
  return null;
}

// Every stored booking must still be there after a change, except the one that is deleted on purpose.
export function assertNothingLost(before, after, removedId) {
  const isRemoved = (b) => removedId !== undefined && String(b?.id) === String(removedId);
  const kept = new Set(after.map((b) => String(b?.id)));
  const missing = before.filter((b) => !isRemoved(b) && !kept.has(String(b?.id)));
  if (missing.length) throw new Error(`Refusing to save: ${missing.length} stored booking(s) would be lost`);
  const expected = before.length - before.filter(isRemoved).length;
  if (after.length < expected) throw new Error('Refusing to save: the list would get shorter than expected');
}

// Before every change the previous list is copied. "snapshot-latest" holds the list as it was before the last
// change, "snapshot-YYYY-MM-DD" the list as it was before the first change of that day. If a copy cannot be
// written the change is not made either.
export async function snapshotBeforeWrite(store, previousRaw) {
  if (!previousRaw) return;
  await store.set('snapshot-latest', previousRaw);
  const dayKey = `snapshot-${new Date().toISOString().slice(0, 10)}`;
  if ((await store.get(dayKey)) === null) await store.set(dayKey, previousRaw);
}
