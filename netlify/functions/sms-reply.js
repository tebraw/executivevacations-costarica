import { sendEmail } from './messaging-helpers.js';

// Twilio calls this webhook URL when someone replies to your SMS
// Set in Twilio Console: Phone Numbers → Your Number → Messaging → Webhook URL
// URL: https://your-site.netlify.app/.netlify/functions/sms-reply
export default async (req) => {
  try {
    // Twilio sends form-encoded data
    const text = await req.text();
    const params = new URLSearchParams(text);

    const from = params.get('From') || 'Unknown';
    const body = params.get('Body') || '';
    const to = params.get('To') || '';

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && body) {
      await sendEmail(
        adminEmail,
        `📱 SMS Reply from ${from}`,
        `You received a reply to your Executive Vacations CR SMS campaign.\n\nFrom: ${from}\nTo (your Twilio number): ${to}\n\nMessage:\n${body}\n\n---\nReply to this person directly by texting ${from}`,
        adminEmail
      );
    }

    // Return empty TwiML — don't auto-reply
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('SMS reply webhook error:', error);
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
};
