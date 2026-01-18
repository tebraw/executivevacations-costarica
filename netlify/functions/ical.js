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
    
    // Filter: Only bookings where end >= start (valid bookings)
    const validBookings = allBookings.filter(booking => {
      const startParts = booking.startDate.split('-').map(Number);
      const endParts = booking.endDate.split('-').map(Number);
      const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
      
      const isValid = end >= start;
      
      if (!isValid) {
        console.log(`❌ EXCLUDING: ${booking.customerName} - ${booking.startDate} to ${booking.endDate} (invalid dates)`);
      } else {
        console.log(`✅ INCLUDING: ${booking.customerName} - ${booking.startDate} to ${booking.endDate}`);
      }
      
      return isValid;
    });

    console.log(`Final count: ${validBookings.length} valid bookings in iCal feed`);

    // Generate iCal content
    const ical = generateICalendar(validBookings);

    return new Response(ical, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="executive-vacations.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"` // Force refresh
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
  const sequence = Math.floor(now.getTime() / 1000);
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Executive Vacations//Costa Rica Villas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Executive Vacations - All Villas',
    'X-WR-TIMEZONE:America/Costa_Rica',
    'X-WR-CALDESC:Bookings for all 4 luxury villas in Costa Rica',
    `X-PUBLISHED-TTL:PT1H`,
    `SEQUENCE:${sequence}`
  ];

  bookings.forEach(booking => {
    // Parse dates properly
    const [startY, startM, startD] = booking.startDate.split('-').map(Number);
    const [endY, endM, endD] = booking.endDate.split('-').map(Number);
    
    // Format as YYYYMMDD
    const startDateIcal = `${startY}${String(startM).padStart(2, '0')}${String(startD).padStart(2, '0')}`;
    
    // For DTEND: Add 1 day because DTEND is EXCLUSIVE in iCal
    // If booking is Feb 2-9, we want DTSTART=20260202, DTEND=20260210
    const endDate = new Date(endY, endM - 1, endD);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day
    const endDateIcal = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;
    
    const created = timestamp;
    const uid = `booking-${booking.id}@executivevacations.net`;

    console.log(`  ${booking.customerName}:`);
    console.log(`    Original: ${booking.startDate} to ${booking.endDate}`);
    console.log(`    iCal: DTSTART=${startDateIcal}, DTEND=${endDateIcal}`);

    booking.villas.forEach(villa => {
      const activities = getActivitiesSummary(booking.selectedActivities);
      const description = `Villa: ${villa}\\nGuest: ${booking.customerName}\\nPhone: ${booking.customerPhone || 'N/A'}\\nActivities: ${activities}\\nNotes: ${booking.additionalNotes || 'None'}`;
      
      ical.push(
        'BEGIN:VEVENT',
        `UID:${uid}-${villa.replace(/\s+/g, '-')}`,
        `DTSTAMP:${created}`,
        `SEQUENCE:${sequence}`,
        `DTSTART;VALUE=DATE:${startDateIcal}`,
        `DTEND;VALUE=DATE:${endDateIcal}`,
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
