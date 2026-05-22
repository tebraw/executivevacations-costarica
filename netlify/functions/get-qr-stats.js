import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('qr-stats');
    const existing = await store.get('all-stats');
    const stats = existing ? JSON.parse(existing) : {};

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting QR stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
