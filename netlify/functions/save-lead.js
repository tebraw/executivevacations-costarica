import { getStore } from '@netlify/blobs';
import { fillTemplate, sendSms, sendEmail } from './messaging-helpers.js';

export default async (req, context) => {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, villaInterest } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const store = getStore('leads');
    const existing = await store.get('all-leads');
    const leads = existing ? JSON.parse(existing) : [];

    const newLead = {
      id: Date.now().toString(),
      firstName: firstName.trim().slice(0, 100),
      lastName: lastName.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 200),
      phone: phone.trim().slice(0, 50),
      villaInterest: villaInterest?.trim().slice(0, 100) || 'Not specified',
      createdAt: new Date().toISOString(),
    };

    leads.unshift(newLead);
    await store.set('all-leads', JSON.stringify(leads));

    // Send welcome messages (fire and forget — don't fail the response if messaging fails)
    try {
      const settingsStore = getStore('site-settings');
      const templatesRaw = await settingsStore.get('message-templates');
      const templates = templatesRaw ? JSON.parse(templatesRaw) : null;

      const vars = {
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        villaInterest: newLead.villaInterest,
        siteUrl: process.env.SITE_URL || 'https://executivevacations.netlify.app',
      };

      // Welcome SMS
      if (newLead.phone && templates?.welcomeSms) {
        await sendSms(newLead.phone, fillTemplate(templates.welcomeSms, vars));
      }

      // Welcome Email
      if (newLead.email && templates?.welcomeEmail) {
        const subj = fillTemplate(templates.welcomeEmail.subject, vars);
        const body = fillTemplate(templates.welcomeEmail.body, vars);
        await sendEmail(newLead.email, subj, body);
      }
    } catch (msgErr) {
      console.error('Messaging error (non-fatal):', msgErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    return new Response(JSON.stringify({ error: 'Failed to save lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
