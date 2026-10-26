import { getStore } from '@netlify/blobs';
import { reviewKeysFor } from './villa-names.js';

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
    for (const key of reviewKeysFor(villa)) {
      const existing = await store.get(key);
      if (!existing) continue;
      const reviews = JSON.parse(existing);
      if (!reviews.some(r => r.id === id)) continue;
      await store.set(key, JSON.stringify(reviews.filter(r => r.id !== id)));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
