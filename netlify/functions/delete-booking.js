import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const { id } = await req.json();
    const store = getStore('bookings');
    
    // Get existing bookings
    const bookingsData = await store.get('all-bookings');
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    
    // Remove booking
    const filteredBookings = bookings.filter(b => b.id !== id);
    
    // Save back to blob storage
    await store.set('all-bookings', JSON.stringify(filteredBookings));
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
