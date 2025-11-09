import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const booking = await req.json();
    const store = getStore('bookings');
    
    // Get existing bookings
    const bookingsData = await store.get('all-bookings');
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    
    // Add or update booking
    const existingIndex = bookings.findIndex(b => b.id === booking.id);
    if (existingIndex >= 0) {
      bookings[existingIndex] = booking;
    } else {
      bookings.push(booking);
    }
    
    // Save back to blob storage
    await store.set('all-bookings', JSON.stringify(bookings));
    
    return new Response(JSON.stringify({ success: true, booking }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to save booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
