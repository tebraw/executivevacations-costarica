// Villas that were renamed. Data already stored in Netlify Blobs may still use the old
// name, so reads map old names to the current one and new data is saved under the current one.
const LEGACY_VILLA_NAMES = {
  'the palms villa estate': 'Palacio Las Palmas',
};

export const canonicalVillaName = (name) =>
  LEGACY_VILLA_NAMES[String(name ?? '').trim().toLowerCase()] ?? name;

export const normalizeBooking = (booking) =>
  Array.isArray(booking?.villas)
    ? { ...booking, villas: [...new Set(booking.villas.map(canonicalVillaName))] }
    : booking;

export const normalizeBookings = (bookings) => bookings.map(normalizeBooking);

export const reviewKey = (villa) => `reviews-${villa.toLowerCase().replace(/\s+/g, '-')}`;

// Every blob key that can hold reviews for a villa: current name first, then legacy names.
export const reviewKeysFor = (villa) => {
  const current = canonicalVillaName(villa);
  const legacyNames = Object.entries(LEGACY_VILLA_NAMES)
    .filter(([, value]) => value === current)
    .map(([legacy]) => legacy);
  return [...new Set([reviewKey(current), ...legacyNames.map(reviewKey)])];
};
