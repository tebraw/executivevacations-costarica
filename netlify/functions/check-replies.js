import { getStore } from '@netlify/blobs';
import { hasGmailReplyFrom } from './messaging-helpers.js';

// Netlify Scheduled Function — runs hourly to check Gmail for lead replies
export const config = {
  schedule: '0 * * * *',
};

// Only bother checking leads that received a welcome email within this window.
// Older, never-replied leads stop being checked to limit Gmail API calls.
const MAX_CHECK_WINDOW_DAYS = 30;

export default async (req) => {
  try {
    const leadsStore = getStore('leads');
    const leadsRaw = await leadsStore.get('all-leads');

    if (!leadsRaw) {
      console.log('No leads found');
      return new Response('No leads', { status: 200 });
    }

    const leads = JSON.parse(leadsRaw);
    const now = new Date();

    let checkedCount = 0;
    let repliedCount = 0;

    const updatedLeads = await Promise.all(
      leads.map(async (lead) => {
        // Already know they replied, or we never sent them a welcome email
        if (lead.replied || !lead.emailSentAt || !lead.email) return lead;

        const sentAt = new Date(lead.emailSentAt);
        const daysSinceSent = (now - sentAt) / (1000 * 60 * 60 * 24);
        if (daysSinceSent > MAX_CHECK_WINDOW_DAYS) return lead;

        checkedCount++;
        try {
          const replied = await hasGmailReplyFrom(lead.email, sentAt);
          if (replied) {
            repliedCount++;
            console.log(`Reply detected from ${lead.email}`);
            return { ...lead, replied: true, repliedAt: now.toISOString() };
          }
        } catch (err) {
          console.error(`Gmail check failed for ${lead.email}:`, err);
        }
        return lead;
      })
    );

    if (repliedCount > 0) {
      await leadsStore.set('all-leads', JSON.stringify(updatedLeads));
    }

    console.log(`Reply check complete. Checked: ${checkedCount}, replied: ${repliedCount}`);
    return new Response(JSON.stringify({ ok: true, checked: checkedCount, replied: repliedCount }), { status: 200 });
  } catch (error) {
    console.error('Check-replies scheduler error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
