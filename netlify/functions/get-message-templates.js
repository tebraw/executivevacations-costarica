import { getStore } from '@netlify/blobs';

const DEFAULT_TEMPLATES = {
  welcomeSms: `Hi {firstName}! 🌴 Thanks for your interest in Executive Vacations Costa Rica. We'll send you our exclusive pricing guide shortly. Questions? Reply anytime! — Executive Vacations CR`,
  welcomeEmail: {
    subject: `Your Exclusive Pricing Guide — Executive Vacations Costa Rica`,
    body: `Hi {firstName},

Thank you for your interest in {villaInterest} at Executive Vacations Costa Rica!

We're thrilled you're considering a luxury stay with us. Your exclusive pricing guide is attached.

Our villas offer world-class amenities in the heart of Costa Rica's stunning landscape. We'd love to help you plan the perfect getaway.

Feel free to reply to this email or visit our website at {siteUrl} to learn more.

Pura Vida,
The Executive Vacations Costa Rica Team`,
  },
  followUpSms: `Hi {firstName}! 🌺 Just checking in — did you get a chance to review our Costa Rica villa pricing? We'd love to answer any questions. Reply here or visit {siteUrl} — Executive Vacations CR`,
  followUpEmail: {
    subject: `Still dreaming of Costa Rica? ✈️ — Executive Vacations`,
    body: `Hi {firstName},

We wanted to follow up on your interest in {villaInterest}.

Our luxury villas in Costa Rica book up quickly, especially during peak season. We'd hate for you to miss out on your dream vacation!

A few things to know:
• Private pool and stunning views at every villa
• Concierge service for activities and dining
• Flexible booking options

Ready to take the next step? Simply reply to this email or visit {siteUrl} and we'll get you set up.

Pura Vida,
The Executive Vacations Costa Rica Team`,
  },
};

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
