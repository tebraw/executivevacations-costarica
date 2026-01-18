import { getStore } from '@netlify/blobs';

exports.handler = async (event, context) => {
  try {
    const store = getStore('bookings');
    const bookingsData = await store.get('all-bookings');
    
    if (!bookingsData) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: bookingsData
    };
  } catch (error) {
    console.error('Error getting bookings:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get bookings' })
    };
  }
};
