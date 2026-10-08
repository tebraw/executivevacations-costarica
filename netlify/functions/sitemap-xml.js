import { getStore } from '@netlify/blobs';

const BASE_URL = 'https://executivevacations.net';

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
];

const VILLA_SLUGS = [
  'palacio-tropical',
  'palacio-musical',
  'the-view-house',
  'the-palms-villa-estate',
];

export default async (req, context) => {
  try {
    // Load blog posts from Blob store
    let blogPosts = [];
    try {
      const store = getStore('blog-posts');
      const data = await store.get('all-posts');
      if (data) {
        blogPosts = JSON.parse(data);
      }
    } catch {
      // Blob store not available (local dev) — continue without blog posts
    }

    const today = new Date().toISOString().split('T')[0];

    const urls = [];

    // Static pages
    for (const page of STATIC_PAGES) {
      urls.push(`
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    // Villa pages
    for (const slug of VILLA_SLUGS) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/villa/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
    }

    // Blog post pages
    for (const post of blogPosts) {
      const postDate = post.date ? post.date.split('T')[0] : today;
      urls.push(`
  <url>
    <loc>${BASE_URL}/blog/${post.slug}-${post.id}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response('Error generating sitemap', { status: 500 });
  }
};
