import { getStore } from '@netlify/blobs';

exports.handler = async (event, context) => {
  try {
    const { id } = JSON.parse(event.body);
    const store = getStore('bookings');
    
    // Get existing bookings
    const bookingsData = await store.get('all-bookings');
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    
    // Remove booking
    const filteredBookings = bookings.filter(b => b.id !== id);
    
    // Save back to blob storage
    await store.set('all-bookings', JSON.stringify(filteredBookings));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to delete booking' })
    };
  }
};
