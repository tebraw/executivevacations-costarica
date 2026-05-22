import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const updates = await req.json();

    const store = getStore('site-settings');
    const existing = await store.get('settings');
    const current = existing ? JSON.parse(existing) : {};

    const merged = { ...current, ...updates };
    await store.set('settings', JSON.stringify(merged));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
