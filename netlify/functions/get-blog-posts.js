import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('blog-posts');
    const existing = await store.get('all-posts');
    const posts = existing ? JSON.parse(existing) : [];

    // Sort newest first by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to get posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
