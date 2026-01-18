// Client-side iCal generator
// Generates iCal feed directly from the same data source as the calendar

export const generateICalFromBookings = (bookings) => {
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
    'X-PUBLISHED-TTL:PT1H',
    `SEQUENCE:${sequence}`
  ];

  // Filter valid bookings only
  const validBookings = bookings.filter(booking => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return end >= start;
  });

  validBookings.forEach(booking => {
    // Parse dates
    const [startY, startM, startD] = booking.startDate.split('-').map(Number);
    const [endY, endM, endD] = booking.endDate.split('-').map(Number);
    
    // Format as YYYYMMDD
    const startDateIcal = `${startY}${String(startM).padStart(2, '0')}${String(startD).padStart(2, '0')}`;
    
    // For DTEND: Add 1 day because DTEND is EXCLUSIVE in iCal
    const endDate = new Date(endY, endM - 1, endD);
    endDate.setDate(endDate.getDate() + 1);
    const endDateIcal = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}`;
    
    const created = timestamp;
    const uid = `booking-${booking.id}@executivevacations.net`;

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
};

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

// Download iCal file
export const downloadICalFile = (bookings) => {
  const icalContent = generateICalFromBookings(bookings);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'executive-vacations.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Create data URL for direct subscription
export const createICalDataUrl = (bookings) => {
  const icalContent = generateICalFromBookings(bookings);
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icalContent);
};
