export const PHONE_DISPLAY = '303-881-8588';
export const PHONE_TEL = '+13038818588';
export const EMAIL = 'bookings@thepalaciocollection.com';

// WhatsApp chat with the team, optionally with a prefilled message.
export const waLink = (text) => `https://wa.me/13038818588${text ? `?text=${encodeURIComponent(text)}` : ''}`;
