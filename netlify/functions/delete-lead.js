import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const store = getStore('leads');
    const existing = await store.get('all-leads');
    const leads = existing ? JSON.parse(existing) : [];
    const filtered = leads.filter(l => l.id !== id);

    await store.set('all-leads', JSON.stringify(filtered));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
