import { getStore } from '@netlify/blobs';

export default async (req) => {
  try {
    // Get villa name from URL parameter
    const url = new URL(req.url);
    const villaName = url.searchParams.get('villa');
    
    if (!villaName) {
      return new Response('Missing villa parameter', { status: 400 });
    }

    const store = getStore('bookings');
    const allBookings = await store.get('all-bookings', { type: 'json' }) || [];

    console.log(`=== iCal Feed for ${villaName} ===`);
    console.log('Total bookings in storage:', allBookings.length);
    
    // Filter: Valid bookings AND contains this villa
    const validBookings = allBookings.filter(booking => {
      const startParts = booking.startDate.split('-').map(Number);
      const endParts = booking.endDate.split('-').map(Number);
      const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
      
      const isValid = end >= start;
      const hasVilla = booking.villas && booking.villas.includes(villaName);
      
      if (isValid && hasVilla) {
        console.log(`✅ INCLUDING: ${booking.customerName} - ${booking.startDate} to ${booking.endDate}`);
      }
      
      return isValid && hasVilla;
    });

    console.log(`Final count: ${validBookings.length} bookings for ${villaName}`);

    // Generate iCal content
    const ical = generateICalendar(validBookings, villaName);

    return new Response(ical, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${villaName.replace(/\s+/g, '-').toLowerCase()}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}"`
      }
    });
  } catch (error) {
    console.error('Error generating villa iCal feed:', error);
    return new Response('Error generating calendar feed', { status: 500 });
  }
};

function generateICalendar(bookings, villaName) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const sequence = Math.floor(now.getTime() / 1000);
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Executive Vacations//Costa Rica Villas//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${villaName} - Bookings`,
    'X-WR-TIMEZONE:America/Costa_Rica',
    `X-WR-CALDESC:Bookings for ${villaName}`,
    'X-PUBLISHED-TTL:PT1H',
    `SEQUENCE:${sequence}`
  ];

  bookings.forEach(booking => {
    const [startY, startM, startD] = booking.startDate.split('-').map(Number);
    const [endY, endM, endD] = booking.endDate.split('-').map(Number);
    
    const startDateIcal = `${startY}${String(startM).padStart(2, '0')}${String(startD).padStart(2, '0')}`;
    
    const endDate = new Date(endY, endM - 1, endD);
    endDate.setDate(endDate.getDate() + 1);
    const endDateIcal = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;
    
    const created = timestamp;
    const uid = `booking-${booking.id}@executivevacations.net-${villaName.replace(/\s+/g, '-')}`;

    const activities = getActivitiesSummary(booking.selectedActivities);
    const description = `Guest: ${booking.customerName}\\nPhone: ${booking.customerPhone || 'N/A'}\\nActivities: ${activities}\\nNotes: ${booking.additionalNotes || 'None'}`;
    
    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${created}`,
      `SEQUENCE:${sequence}`,
      `DTSTART;VALUE=DATE:${startDateIcal}`,
      `DTEND;VALUE=DATE:${endDateIcal}`,
      `SUMMARY:${booking.customerName || 'Guest'}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${getVillaLocation(villaName)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
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
