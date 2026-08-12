import { getStore } from '@netlify/blobs';

const DEFAULT_TEMPLATES = {
  welcomeSms: `Hi {firstName}! 🌴 Thanks for your interest in Executive Vacations Costa Rica. We'll send you our exclusive pricing guide shortly. Questions? Reply anytime! — Executive Vacations CR`,
  welcomeEmail: {
    subject: `Your Exclusive Pricing Guide — Executive Vacations Costa Rica`,
    body: `Pura Vida {firstName}! 🌴 I hope this email finds you well. My name is Wendy, and my husband and I own all the Villas at Executive Vacations Costa Rica. You'll be directly dealing with me, not through a third party.

I'm thrilled to hear about your interest in planning a trip to Costa Rica. I'm personally excited to help you create the perfect itinerary that combines luxury, relaxation, exploration, adventure, or a combination of all your preferences. With our 24/7 on-site concierge service, your dream vacation is just a few clicks away!

I'd like to schedule a quick call to walk you through everything and answer any questions you may have. Please let me know a couple of days and times that work for you. I'll give you a call as soon as possible. Alternatively, you can call me anytime on my cell phone.

I look forward to speaking with you soon!

Best regards,

Wendy Meritt

Executive Vacations Costa Rica

303-881-8588`,
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
