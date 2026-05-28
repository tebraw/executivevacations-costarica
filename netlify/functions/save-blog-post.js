import { getStore } from '@netlify/blobs';

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export default async (req, context) => {
  try {
    const body = await req.json();
    const { id, title, text, imageUrl, date, metaTitle, metaDesc, focusKeyword, site } = body;

    if (!title || !title.trim() || !text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Title and text are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitise inputs
    const safeTitle = title.trim().slice(0, 200);
    const safeText = text.trim().slice(0, 20000);
    const safeImageUrl = imageUrl && imageUrl.trim().startsWith('http') ? imageUrl.trim().slice(0, 2000) : '';
    const safeDate = date && !isNaN(Date.parse(date)) ? new Date(date).toISOString() : new Date().toISOString();
    const safeMetaTitle = (metaTitle || '').trim().slice(0, 60);
    const safeMetaDesc = (metaDesc || '').trim().slice(0, 155);
    const safeFocusKeyword = (focusKeyword || '').trim().slice(0, 100);
    const safeSite = ['villa', 'wedding', 'both'].includes(site) ? site : 'villa';

    const store = getStore('blog-posts');
    const existing = await store.get('all-posts');
    const posts = existing ? JSON.parse(existing) : [];

    if (id) {
      // Update existing post
      const idx = posts.findIndex(p => p.id === id);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: 'Post not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      posts[idx] = {
        ...posts[idx],
        title: safeTitle,
        slug: toSlug(safeTitle),
        text: safeText,
        imageUrl: safeImageUrl,
        date: safeDate,
        metaTitle: safeMetaTitle,
        metaDesc: safeMetaDesc,
        focusKeyword: safeFocusKeyword,
        site: safeSite,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new post
      const newPost = {
        id: Date.now().toString(),
        title: safeTitle,
        slug: toSlug(safeTitle),
        text: safeText,
        imageUrl: safeImageUrl,
        date: safeDate,
        metaTitle: safeMetaTitle,
        metaDesc: safeMetaDesc,
        focusKeyword: safeFocusKeyword,
        site: safeSite,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      posts.unshift(newPost);
    }

    await store.set('all-posts', JSON.stringify(posts));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving blog post:', error);
    return new Response(JSON.stringify({ error: 'Failed to save post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
