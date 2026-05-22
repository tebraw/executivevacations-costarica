import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Allow CORS for beacon requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ref = url.searchParams.get('ref');

    // Validate: only allow alphanumeric, hyphens, underscores, max 50 chars
    if (!ref || !/^[a-zA-Z0-9_-]{1,50}$/.test(ref)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing ref parameter' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const store = getStore('qr-stats');
    const existing = await store.get('all-stats');
    const stats = existing ? JSON.parse(existing) : {};

    const today = new Date().toISOString().split('T')[0];

    if (!stats[ref]) {
      stats[ref] = { total: 0, lastVisit: null, daily: {}, createdAt: new Date().toISOString() };
    }

    stats[ref].total += 1;
    stats[ref].lastVisit = new Date().toISOString();
    stats[ref].daily[today] = (stats[ref].daily[today] || 0) + 1;

    // Keep only last 90 days to prevent unbounded growth
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    for (const day of Object.keys(stats[ref].daily)) {
      if (day < cutoffStr) delete stats[ref].daily[day];
    }

    await store.set('all-stats', JSON.stringify(stats));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return new Response(JSON.stringify({ error: 'Failed to track visit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
