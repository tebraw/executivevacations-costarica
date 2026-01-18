import { getStore } from '@netlify/blobs';

exports.handler = async (event, context) => {
  try {
    const booking = JSON.parse(event.body);
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
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, booking })
    };
  } catch (error) {
    console.error('Error saving booking:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to save booking' })
    };
  }
};
