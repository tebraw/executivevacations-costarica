import { Resend } from 'resend';


/**
 * Replace template variables: {firstName}, {villaInterest}, {siteUrl}
 */
export function fillTemplate(template, vars) {
  return template
    .replace(/\{firstName\}/g, vars.firstName || '')
    .replace(/\{lastName\}/g, vars.lastName || '')
    .replace(/\{villaInterest\}/g, vars.villaInterest || '')
    .replace(/\{siteUrl\}/g, vars.siteUrl || 'https://executivevacations.cr');
}

/**
 * Send a WhatsApp message via Meta Cloud API
 * Business number → admin's personal number (notification)
 */
export async function sendWhatsAppToAdmin(message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminWa = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. 491701234567 (no + sign)

  if (!token || !phoneNumberId || !adminWa) {
    console.warn('WhatsApp env vars not set — skipping WhatsApp notification');
    return;
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminWa,
      type: 'text',
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
}

/**
 * Send an SMS via Twilio
 */
export async function sendSms(toPhone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio env vars not set — skipping SMS');
    return;
  }

  const { default: twilio } = await import('twilio');
  const client = twilio(accountSid, authToken);
  await client.messages.create({
    body: message,
    from: fromNumber,
    to: toPhone,
  });
}

/**
 * Send an email via Resend
 */
export async function sendEmail(toEmail, subject, bodyText, replyTo) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@executivevacations.cr';
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return;
  }

  const resend = new Resend(apiKey);

  // Convert plain text body to simple HTML
  const htmlBody = `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <div style="background: linear-gradient(135deg, #c9a96e, #a07040); padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Executive Vacations Costa Rica</h1>
    </div>
    <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
      ${bodyText.split('\n').map(line => line.trim() ? `<p style="margin: 0 0 12px; color: #374151; line-height: 1.6;">${line}</p>` : '<br>').join('')}
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">© Executive Vacations Costa Rica</p>
  </div>`;

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    text: bodyText,
    html: htmlBody,
    reply_to: replyTo || adminEmail,
  });
}
