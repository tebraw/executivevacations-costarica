import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('bookings');
    const bookingsData = await store.get('all-bookings');
    
    if (!bookingsData) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(bookingsData, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    return new Response(JSON.stringify({ error: 'Failed to get bookings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/bookings'
};
