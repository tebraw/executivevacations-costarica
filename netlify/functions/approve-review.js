import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const { villa, id } = await req.json();
    if (!villa || !id) {
      return new Response(JSON.stringify({ error: 'Missing villa or id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore('reviews');
    const key = `reviews-${villa.toLowerCase().replace(/\s+/g, '-')}`;

    const existing = await store.get(key);
    const reviews = existing ? JSON.parse(existing) : [];
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    await store.set(key, JSON.stringify(updated));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error approving review:', error);
    return new Response(JSON.stringify({ error: 'Failed to approve review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
