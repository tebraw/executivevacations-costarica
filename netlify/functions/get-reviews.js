import { getStore } from '@netlify/blobs';

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
    const key = `reviews-${villa.toLowerCase().replace(/\s+/g, '-')}`;
    const data = await store.get(key);
    const all = JSON.parse(data || '[]');
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
