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
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} bodyText
 * @param {string} [replyTo]
 * @param {Array<{filename: string, content: string}>} [attachments] - content must be base64-encoded
 */
export async function sendEmail(toEmail, subject, bodyText, replyTo, attachments) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'wendy@executivevacations.net';
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
    ...(attachments && attachments.length ? { attachments } : {}),
  });
}

/**
 * Fetch a PDF from the deployed site and return it as a base64 string,
 * ready to attach to a Resend email.
 */
export async function fetchPdfAsAttachment(pdfPath, filename) {
  const siteUrl = process.env.SITE_URL || 'https://executivevacations.netlify.app';
  const url = pdfPath.startsWith('http') ? pdfPath : `${siteUrl}${pdfPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch PDF at ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  return {
    filename,
    content: Buffer.from(buf).toString('base64'),
  };
}

/**
 * Get a fresh Gmail API access token using a stored OAuth refresh token
 * (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN env vars).
 */
async function getGmailAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Gmail OAuth env vars not set — skipping reply check');
    return null;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail token refresh failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Check whether a message from `fromEmail` exists in the Gmail inbox
 * on or after `afterDate` (JS Date). Returns true/false.
 * Requires GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN.
 */
export async function hasGmailReplyFrom(fromEmail, afterDate) {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) return false;

  const afterSeconds = Math.floor(new Date(afterDate).getTime() / 1000);
  const q = `from:${fromEmail} after:${afterSeconds}`;
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail search failed: ${err}`);
  }

  const data = await res.json();
  return Array.isArray(data.messages) && data.messages.length > 0;
}
