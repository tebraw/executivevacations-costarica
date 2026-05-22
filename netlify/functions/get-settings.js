import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('site-settings');
    const existing = await store.get('settings');
    const settings = existing ? JSON.parse(existing) : {};

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
