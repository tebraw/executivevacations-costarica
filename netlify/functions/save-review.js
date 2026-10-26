import { getStore } from '@netlify/blobs';
import { canonicalVillaName, reviewKey } from './villa-names.js';

export default async (req, context) => {
  try {
    const review = await req.json();
    const { villa, name, rating, text } = review;

    if (!villa || !name || !rating || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be 1-5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore('reviews');
    const villaName = canonicalVillaName(villa);
    const key = reviewKey(villaName);

    const existing = await store.get(key);
    const reviews = existing ? JSON.parse(existing) : [];

    const newReview = {
      id: Date.now().toString(),
      villa: villaName,
      name: name.trim().slice(0, 100),
      rating: Number(rating),
      text: text.trim().slice(0, 1000),
      date: new Date().toISOString(),
      approved: false
    };

    reviews.unshift(newReview); // newest first
    await store.set(key, JSON.stringify(reviews));

    return new Response(JSON.stringify({ success: true, review: newReview }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving review:', error);
    return new Response(JSON.stringify({ error: 'Failed to save review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
