import { getStore } from '@netlify/blobs';

const BASE_URL = 'https://executivevacations.net';
const DEFAULT_IMAGE = `${BASE_URL}/images/hero-bg.webp`;

export default async (request, context) => {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').filter(Boolean).pop();

  // Extract numeric post ID from end of slug (e.g. "my-post-title-1748123456789")
  const postId = slug ? slug.split('-').pop() : null;
  if (!postId || isNaN(Number(postId))) {
    return context.next();
  }

  // Load post from Blob store
  let post = null;
  try {
    const store = getStore('blog-posts');
    const data = await store.get('all-posts');
    if (data) {
      const posts = JSON.parse(data);
      post = posts.find(p => String(p.id) === String(postId));
    }
  } catch {
    return context.next();
  }

  if (!post) return context.next();

  // Get the SPA index.html
  const response = await context.next();
  const html = await response.text();

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const metaTitle = post.metaTitle || (post.title + ' | Executive Vacations Costa Rica');
  const rawDesc = post.metaDesc || post.text.slice(0, 155).trim() + '…';
  const ogImage = post.imageUrl || DEFAULT_IMAGE;
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}-${post.id}`;

  const ogTags = `<title>${esc(metaTitle)}</title>
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(metaTitle)}" />
    <meta property="og:description" content="${esc(rawDesc)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="Executive Vacations Costa Rica" />
    <meta property="article:published_time" content="${post.date}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(metaTitle)}" />
    <meta name="twitter:description" content="${esc(rawDesc)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${canonicalUrl}" />`;

  // Remove old <title> and inject before </head> (handles minified or formatted HTML)
  const modified = html
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace(/<\/head>/i, `  ${ogTags}\n  </head>`);

  return new Response(modified, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
};

export const config = { path: '/blog/*' };
