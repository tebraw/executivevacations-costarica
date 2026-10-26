import { getStore } from '@netlify/blobs';
import { canonicalVillaName, reviewKeysFor } from './villa-names.js';

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const villa = url.searchParams.get('villa');
    if (!villa) {
      return new Response(JSON.stringify({ error: 'Missing villa param' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const showAll = url.searchParams.get('all') === '1';
    const store = getStore('reviews');
    const keys = reviewKeysFor(villa);
    const lists = await Promise.all(keys.map(async (key) => JSON.parse((await store.get(key)) || '[]')));
    const all = lists.flat().map((r) => (r.villa ? { ...r, villa: canonicalVillaName(r.villa) } : r));
    if (keys.length > 1) all.sort((a, b) => new Date(b.date) - new Date(a.date));
    const result = showAll ? all : all.filter(r => r.approved === true);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
