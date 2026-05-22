import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('leads');
    const existing = await store.get('all-leads');
    const leads = existing ? JSON.parse(existing) : [];

    return new Response(JSON.stringify(leads), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    return new Response(JSON.stringify({ error: 'Failed to get leads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
