import { getStore } from '@netlify/blobs';
import { fillTemplate, sendSms, sendEmail } from './messaging-helpers.js';

// Netlify Scheduled Function — runs daily at 10:00 AM UTC
export const config = {
  schedule: '0 10 * * *',
};

export default async (req) => {
  try {
    const leadsStore = getStore('leads');
    const settingsStore = getStore('site-settings');

    const [leadsRaw, templatesRaw] = await Promise.all([
      leadsStore.get('all-leads'),
      settingsStore.get('message-templates'),
    ]);

    if (!leadsRaw) {
      console.log('No leads found');
      return new Response('No leads', { status: 200 });
    }

    const leads = JSON.parse(leadsRaw);
    const templates = templatesRaw ? JSON.parse(templatesRaw) : null;

    if (!templates?.followUpSms && !templates?.followUpEmail) {
      console.log('No follow-up templates configured');
      return new Response('No templates', { status: 200 });
    }

    const delayDays = templates?.followUpDelayDays || 3;
    const now = new Date();
    const siteUrl = process.env.SITE_URL || 'https://executivevacations.netlify.app';

    let sentCount = 0;
    const updatedLeads = leads.map(lead => {
      // Skip if already followed up
      if (lead.followedUp) return lead;

      const createdAt = new Date(lead.createdAt);
      const daysSince = (now - createdAt) / (1000 * 60 * 60 * 24);

      // Only follow up after configured days (and within +1 day window to avoid double-sends)
      if (daysSince < delayDays || daysSince > delayDays + 1) return lead;

      const vars = {
        firstName: lead.firstName,
        lastName: lead.lastName,
        villaInterest: lead.villaInterest,
        siteUrl,
      };

      // Fire-and-forget messages
      (async () => {
        try {
          if (lead.phone && templates.followUpSms) {
            await sendSms(lead.phone, fillTemplate(templates.followUpSms, vars));
          }
          if (lead.email && templates.followUpEmail) {
            const subj = fillTemplate(templates.followUpEmail.subject, vars);
            const body = fillTemplate(templates.followUpEmail.body, vars);
            await sendEmail(lead.email, subj, body);
          }
          console.log(`Follow-up sent to ${lead.email} (${lead.firstName} ${lead.lastName})`);
        } catch (err) {
          console.error(`Failed to send follow-up to ${lead.email}:`, err);
        }
      })();

      sentCount++;
      return { ...lead, followedUp: true, followedUpAt: now.toISOString() };
    });

    // Save updated leads with followedUp flags
    await leadsStore.set('all-leads', JSON.stringify(updatedLeads));

    console.log(`Follow-up job complete. Sent: ${sentCount}`);
    return new Response(JSON.stringify({ ok: true, sent: sentCount }), { status: 200 });
  } catch (error) {
    console.error('Follow-up scheduler error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
