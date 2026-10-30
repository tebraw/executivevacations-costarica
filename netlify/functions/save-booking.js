import { getStore } from '@netlify/blobs';
import { normalizeBooking } from './villa-names.js';
import { BOOKINGS_KEY, assertNothingLost, snapshotBeforeWrite, validateBooking } from './booking-utils.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req, context) => {
  try {
    const booking = normalizeBooking(await req.json());
    const invalid = validateBooking(booking);
    if (invalid) return json({ error: invalid }, 400);
    const store = getStore('bookings');
    
    // Get existing bookings
    const previousRaw = await store.get(BOOKINGS_KEY);
    const bookings = previousRaw ? JSON.parse(previousRaw) : [];
    
    // An update keeps every field the form does not send (created date, fields added later); a new booking is appended.
    const existingIndex = bookings.findIndex((b) => String(b.id) === String(booking.id));
    const next = bookings.slice();
    if (existingIndex >= 0) {
      next[existingIndex] = { ...bookings[existingIndex], ...booking };
    } else {
      next.push(booking);
    }
    
    // Nothing that is stored may disappear, and the previous list is copied before anything is overwritten.
    assertNothingLost(bookings, next);
    await snapshotBeforeWrite(store, previousRaw);
    await store.set(BOOKINGS_KEY, JSON.stringify(next));
    
    return json({ success: true, booking: next[existingIndex >= 0 ? existingIndex : next.length - 1], count: next.length });
  } catch (error) {
    console.error('Error saving booking:', error);
    return json({ error: 'Failed to save booking' }, 500);
  }
};
