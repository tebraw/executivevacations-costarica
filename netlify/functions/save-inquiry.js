import { getStore } from '@netlify/blobs';
import { sendEmail, sendWhatsAppToAdmin } from './messaging-helpers.js';

export default async (req, context) => {
  try {
    const body = await req.json();
    const { name, email, phone, checkIn, checkOut, numberOfPeople, message, villaSelected, activitiesSelected } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const inquiry = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 200),
      email: email.trim().toLowerCase().slice(0, 200),
      phone: phone.trim().slice(0, 50),
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      numberOfPeople: numberOfPeople || '',
      message: message.trim().slice(0, 2000),
      villaSelected: villaSelected || 'Not specified',
      activitiesSelected: activitiesSelected || 'None',
      createdAt: new Date().toISOString(),
    };

    // Store inquiry in Netlify Blobs
    const store = getStore('inquiries');
    const existing = await store.get('all-inquiries');
    const inquiries = existing ? JSON.parse(existing) : [];
    inquiries.unshift(inquiry);
    await store.set('all-inquiries', JSON.stringify(inquiries));

    // Send notifications (fire and forget)
    try {
      const notificationEmails = [
        'grujicic.filip17@gmail.com',
        'propertieswithmeritt@yahoo.com',
        ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []),
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      const notifSubject = `New Inquiry — ${inquiry.name}${inquiry.villaSelected !== 'Not specified' ? ` (${inquiry.villaSelected})` : ''}`;
      const notifBody =
        `New villa inquiry received!\n\n` +
        `Name: ${inquiry.name}\n` +
        `Email: ${inquiry.email}\n` +
        `Phone: ${inquiry.phone}\n` +
        `Villa: ${inquiry.villaSelected}\n` +
        `Check-in: ${inquiry.checkIn || 'Not specified'}\n` +
        `Check-out: ${inquiry.checkOut || 'Not specified'}\n` +
        `Guests: ${inquiry.numberOfPeople || 'Not specified'}\n` +
        `Activities: ${inquiry.activitiesSelected}\n` +
        `Message: ${inquiry.message}\n` +
        `Submitted: ${new Date(inquiry.createdAt).toLocaleString('en-US')}\n\n` +
        `--- Suggested reply ---\n` +
        `Pura Vida ${inquiry.name.split(' ')[0]}! 🌴 I hope this email finds you well. My name is Wendy, and my husband and I own all the Villas at Executive Vacations Costa Rica. You'll be directly dealing with me, not through a third party.\n\n` +
        `I'm thrilled to hear about your interest in planning a trip to Costa Rica. I'm personally excited to help you create the perfect itinerary that combines luxury, relaxation, exploration, adventure, or a combination of all your preferences. With our 24/7 on-site concierge service, your dream vacation is just a few clicks away!\n\n` +
        `I'd like to schedule a quick call to walk you through everything and answer any questions you may have. Please let me know a couple of days and times that work for you. I'll give you a call as soon as possible. Alternatively, you can call me anytime on my cell phone.\n\n` +
        `I look forward to speaking with you soon!\n\nBest regards,\nWendy Meritt\nExecutive Vacations Costa Rica\n303-881-8588`;

      for (const recipient of notificationEmails) {
        await sendEmail(recipient, notifSubject, notifBody, inquiry.email);
      }

      const whatsappMsg =
        `🌴 *New Villa Inquiry!*\n\n` +
        `👤 ${inquiry.name}\n` +
        `📱 ${inquiry.phone}\n` +
        `✉️ ${inquiry.email}\n` +
        `🏡 ${inquiry.villaSelected}\n` +
        `📅 ${inquiry.checkIn || 'TBD'} → ${inquiry.checkOut || 'TBD'}\n` +
        `👥 ${inquiry.numberOfPeople || 'Not specified'} guests\n\n` +
        `💬 "${inquiry.message.slice(0, 200)}${inquiry.message.length > 200 ? '...' : ''}"`;

      await sendWhatsAppToAdmin(whatsappMsg);
    } catch (msgErr) {
      console.error('Messaging error (non-fatal):', msgErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving inquiry:', error);
    return new Response(JSON.stringify({ error: 'Failed to save inquiry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
