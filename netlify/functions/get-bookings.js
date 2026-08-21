import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const token = req.headers.get('x-admin-token');
  const isAdmin = adminSecret && token === adminSecret;

  try {
    const store = getStore('bookings');
    const bookingsData = await store.get('all-bookings');

    if (!bookingsData) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bookings = JSON.parse(bookingsData);

    // Public requests get only the fields needed for availability checking (no PII)
    const payload = isAdmin
      ? bookings
      : bookings.map(({ id, startDate, endDate, villas, status }) => ({ id, startDate, endDate, villas, status }));

    return new Response(JSON.stringify(payload), {
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
