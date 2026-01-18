import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const store = getStore('bookings');
    const allBookings = await store.get('all-bookings', { type: 'json' }) || [];

    console.log('=== iCal Feed Generation ===');
    console.log('Total bookings in storage:', allBookings.length);
    
    // Filter out invalid bookings (where end date is before start date)
    const validBookings = allBookings.filter(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const isValid = end >= start;
      if (!isValid) {
        console.log(`❌ SKIPPING invalid booking: ${booking.customerName} (${booking.startDate} to ${booking.endDate}) - End before start`);
      } else {
        console.log(`✅ VALID booking: ${booking.customerName} (${booking.startDate} to ${booking.endDate})`);
      }
      return isValid;
    });

    console.log(`Including ${validBookings.length} valid bookings in iCal feed`);

    // Generate iCal content with timestamp for cache busting
    const ical = generateICalendar(validBookings);

    return new Response(ical, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="executive-vacations.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString()
      }
    });
  } catch (error) {
    console.error('Error generating iCal feed:', error);
    return new Response('Error generating calendar feed', { status: 500 });
  }
};

function generateICalendar(bookings) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const sequence = Math.floor(now.getTime() / 1000); // Unix timestamp as sequence
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Executive Vacations//Costa Rica Villas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Executive Vacations - All Villas',
    'X-WR-TIMEZONE:America/Costa_Rica',
    'X-WR-CALDESC:Bookings for all 4 luxury villas in Costa Rica',
    `X-PUBLISHED-TTL:PT1H`, // Tell clients to refresh every hour
    `SEQUENCE:${sequence}` // Increment on each generation
  ];

  bookings.forEach(booking => {
    const startDate = formatICalDate(booking.startDate);
    // DTEND is exclusive, so add one day to include the checkout day
    const endDate = formatICalDate(booking.endDate, true); // true = add one day
    const created = timestamp;
    const uid = `booking-${booking.id}@executivevacations.net`;

    // Create event for each villa in the booking
    booking.villas.forEach(villa => {
      const activities = getActivitiesSummary(booking.selectedActivities);
      const description = `Villa: ${villa}\\nGuest: ${booking.customerName}\\nPhone: ${booking.customerPhone || 'N/A'}\\nActivities: ${activities}\\nNotes: ${booking.additionalNotes || 'None'}`;
      
      ical.push(
        'BEGIN:VEVENT',
        `UID:${uid}-${villa.replace(/\s+/g, '-')}`,
        `DTSTAMP:${created}`,
        `SEQUENCE:${sequence}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${endDate}`,
        `SUMMARY:${villa} - ${booking.customerName || 'Guest'}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${getVillaLocation(villa)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });
  });

  ical.push('END:VCALENDAR');
  return ical.join('\r\n');
}

function formatICalDate(dateString, addOneDay = false) {
  // Parse YYYY-MM-DD and ensure we're in local time, not UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Month is 0-indexed
  
  if (addOneDay) {
    // Add one day for DTEND (which is exclusive in iCal)
    date.setDate(date.getDate() + 1);
  }
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getActivitiesSummary(activities) {
  if (!activities || activities.length === 0) return 'None';
  return activities.map(a => a.name || a).join(', ');
}

function getVillaLocation(villaName) {
  const locations = {
    'Palacio Tropical': 'Playa Flamingo, Guanacaste, Costa Rica',
    'Palacio Musical': 'Playa Flamingo, Guanacaste, Costa Rica',
    'The View House': 'Playa Flamingo, Guanacaste, Costa Rica',
    'The Palms Villa Estate': 'Playa Flamingo, Guanacaste, Costa Rica'
  };
  return locations[villaName] || 'Costa Rica';
}
