import { getStore } from '@netlify/blobs';
import { BOOKINGS_KEY, assertNothingLost, snapshotBeforeWrite } from './booking-utils.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req, context) => {
  try {
    const { id } = await req.json();
    if (id === undefined || id === null || String(id).trim() === '') return json({ error: 'Booking id is required' }, 400);
    const store = getStore('bookings');
    
    // Get existing bookings
    const previousRaw = await store.get(BOOKINGS_KEY);
    const bookings = previousRaw ? JSON.parse(previousRaw) : [];
    
    // Remove booking
    const filteredBookings = bookings.filter((b) => String(b.id) !== String(id));
    if (filteredBookings.length === bookings.length) return json({ success: true, deleted: false, count: bookings.length });
    if (bookings.length - filteredBookings.length > 1) throw new Error('Refusing to delete more than one booking at once');
    
    // The previous list is copied first, and only the one booking may disappear.
    assertNothingLost(bookings, filteredBookings, id);
    await snapshotBeforeWrite(store, previousRaw);
    await store.set(BOOKINGS_KEY, JSON.stringify(filteredBookings));
    
    return json({ success: true, deleted: true, count: filteredBookings.length });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return json({ error: 'Failed to delete booking' }, 500);
  }
};
