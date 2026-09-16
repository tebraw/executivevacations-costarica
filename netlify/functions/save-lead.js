import { getStore } from '@netlify/blobs';
import { fillTemplate, sendSms, sendEmail, sendWhatsAppToAdmin, fetchPdfAsAttachment } from './messaging-helpers.js';
import { DEFAULT_TEMPLATES } from './default-templates.js';

const VILLA_PDF_MAP = {
  'All Villas': '/pdfs/All Villas - Pricing Guide _ Executive Vacations.pdf',
  'Palacio Musical': '/pdfs/Palacio Musical — Pricing Guide _ Executive Vacations.pdf',
  'Palacio Tropical': '/pdfs/Palacio Tropical — Pricing Guide _ Executive Vacations.pdf',
  'The View House': '/pdfs/The View House — Pricing Guide _ Executive Vacations.pdf',
};

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
      // Fall back to sensible defaults if the admin hasn't saved custom templates yet
      const templates = templatesRaw ? JSON.parse(templatesRaw) : DEFAULT_TEMPLATES;

      const vars = {
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        villaInterest: newLead.villaInterest,
        siteUrl: process.env.SITE_URL || 'https://executivevacations.netlify.app',
      };

      // Welcome SMS (isolated — a failure here must not block the welcome email)
      if (newLead.phone && templates?.welcomeSms) {
        try {
          await sendSms(newLead.phone, fillTemplate(templates.welcomeSms, vars));
        } catch (smsErr) {
          console.error('Welcome SMS failed (non-fatal):', smsErr);
        }
      }

      // Welcome Email (with pricing guide PDF attached)
      if (newLead.email && templates?.welcomeEmail) {
        const subj = fillTemplate(templates.welcomeEmail.subject, vars);
        const body = fillTemplate(templates.welcomeEmail.body, vars);

        let attachments;
        try {
          const pdfPath = VILLA_PDF_MAP[newLead.villaInterest] || VILLA_PDF_MAP['All Villas'];
          const filename = pdfPath.split('/').pop();
          attachments = [await fetchPdfAsAttachment(pdfPath, filename)];
        } catch (pdfErr) {
          console.error('Failed to attach pricing guide PDF (non-fatal):', pdfErr);
        }

        try {
          await sendEmail(newLead.email, subj, body, undefined, attachments);
          newLead.emailSentAt = new Date().toISOString();
        } catch (emailErr) {
          console.error('Welcome email failed:', emailErr);
        }
      }

      // WhatsApp notification to admin
      const welcomeTemplate = templates?.welcomeSms
        ? fillTemplate(templates.welcomeSms, vars)
        : `Hi ${newLead.firstName}! Thanks for your interest in ${newLead.villaInterest}.`;

      const adminMsg =
        `🌴 *New Pricing Lead!*\n\n` +
        `👤 ${newLead.firstName} ${newLead.lastName}\n` +
        `📱 ${newLead.phone}\n` +
        `✉️ ${newLead.email}\n` +
        `🏡 ${newLead.villaInterest}\n\n` +
        `--- Suggested welcome message ---\n${welcomeTemplate}`;

      try {
        await sendWhatsAppToAdmin(adminMsg);
      } catch (waErr) {
        console.error('WhatsApp admin notification failed (non-fatal):', waErr);
      }

      // Email notification to all admin addresses (never the customer's own address)
      const notificationEmails = [
        'grujicic.filip17@gmail.com',
        'propertieswithmeritt@yahoo.com',
        ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []),
      ]
        .filter((v, i, a) => v && a.indexOf(v) === i) // deduplicate
        .filter((v) => v.toLowerCase() !== newLead.email.toLowerCase()); // never notify the lead as if they were an admin

      const notifSubject = `🌴 New Pricing Lead — ${newLead.firstName} ${newLead.lastName}`;
      const notifBody =
        `New pricing guide request received!\n\n` +
        `Name: ${newLead.firstName} ${newLead.lastName}\n` +
        `Email: ${newLead.email}\n` +
        `Phone: ${newLead.phone}\n` +
        `Villa Interest: ${newLead.villaInterest}\n` +
        `Submitted: ${new Date(newLead.createdAt).toLocaleString('en-US')}\n\n` +
        `--- Suggested reply ---\n` +
        `Pura Vida ${newLead.firstName}! 🌴 I hope this email finds you well. My name is Wendy, and my husband and I own all the Villas at Executive Vacations Costa Rica. You'll be directly dealing with me, not through a third party.\n\n` +
        `I'm thrilled to hear about your interest in planning a trip to Costa Rica. I'm personally excited to help you create the perfect itinerary that combines luxury, relaxation, exploration, adventure, or a combination of all your preferences. With our 24/7 on-site concierge service, your dream vacation is just a few clicks away!\n\n` +
        `I'd like to schedule a quick call to walk you through everything and answer any questions you may have. Please let me know a couple of days and times that work for you. I'll give you a call as soon as possible. Alternatively, you can call me anytime on my cell phone.\n\n` +
        `I look forward to speaking with you soon!\n\nBest regards,\nWendy Meritt\nExecutive Vacations Costa Rica\n303-881-8588`;

      for (const recipient of notificationEmails) {
        try {
          await sendEmail(recipient, notifSubject, notifBody, newLead.email);
        } catch (notifErr) {
          console.error(`Admin notification email to ${recipient} failed (non-fatal):`, notifErr);
        }
      }

      // Persist emailSentAt (set above when the welcome email was sent)
      if (newLead.emailSentAt) {
        const idx = leads.findIndex(l => l.id === newLead.id);
        if (idx !== -1) {
          leads[idx] = newLead;
          await store.set('all-leads', JSON.stringify(leads));
        }
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
