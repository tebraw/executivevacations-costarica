import { getStore } from '@netlify/blobs';
import { DEFAULT_TEMPLATES } from './default-templates.js';


export default async (req, context) => {
  try {
    const store = getStore('site-settings');
    const existing = await store.get('message-templates');
    const templates = existing ? JSON.parse(existing) : DEFAULT_TEMPLATES;

    return new Response(JSON.stringify(templates), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting message templates:', error);
    return new Response(JSON.stringify(DEFAULT_TEMPLATES), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
