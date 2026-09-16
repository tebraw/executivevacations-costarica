import { getStore } from '@netlify/blobs';

// Fields the admin dashboard is allowed to update on a lead
const ALLOWED_FIELDS = ['replied', 'stage'];

const VALID_STAGES = ['new', 'contacted', 'quoted', 'booked', 'lost'];

export default async (req) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const token = req.headers.get('x-admin-token');

  if (!adminSecret || token !== adminSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { id, updates } = await req.json();

    if (!id || !updates || typeof updates !== 'object') {
      return new Response(JSON.stringify({ error: 'id and updates are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (updates.stage !== undefined && !VALID_STAGES.includes(updates.stage)) {
      return new Response(JSON.stringify({ error: 'Invalid stage value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const store = getStore('leads');
    const existing = await store.get('all-leads');
    const leads = existing ? JSON.parse(existing) : [];

    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const safeUpdates = {};
    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) safeUpdates[field] = updates[field];
    }

    if (safeUpdates.replied === true && !leads[idx].repliedAt) {
      safeUpdates.repliedAt = new Date().toISOString();
    }
    if (safeUpdates.replied === false) {
      safeUpdates.repliedAt = null;
    }

    leads[idx] = { ...leads[idx], ...safeUpdates };
    await store.set('all-leads', JSON.stringify(leads));

    return new Response(JSON.stringify({ success: true, lead: leads[idx] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return new Response(JSON.stringify({ error: 'Failed to update lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
