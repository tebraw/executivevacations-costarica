import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const body = await req.json();
    const { welcomeSms, welcomeEmail, followUpSms, followUpEmail, followUpDelayDays } = body;

    if (!welcomeSms || !welcomeEmail || !followUpSms || !followUpEmail) {
      return new Response(JSON.stringify({ error: 'All templates are required' }), { status: 400 });
    }

    const templates = {
      welcomeSms,
      welcomeEmail,
      followUpSms,
      followUpEmail,
      followUpDelayDays: followUpDelayDays || 3,
    };

    const store = getStore('site-settings');
    await store.set('message-templates', JSON.stringify(templates));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving message templates:', error);
    return new Response(JSON.stringify({ error: 'Failed to save templates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
