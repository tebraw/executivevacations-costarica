// API-based booking management system with Netlify Blobs backend

const STORAGE_KEY = 'executivevacations_bookings';

// Villa color schemes for calendar display
export const VILLA_COLORS = {
  'Palacio Tropical': {
    bg: '#fef3c7',
    border: '#f59e0b',
    text: '#92400e'
  },
  'Palacio Musical': {
    bg: '#ddd6fe',
    border: '#8b5cf6',
    text: '#5b21b6'
  },
  'The View House': {
    bg: '#bfdbfe',
    border: '#3b82f6',
    text: '#1e40af'
  },
  'Palacio Las Palmas': {
    bg: '#d1fae5',
    border: '#10b981',
    text: '#065f46'
  }
};

// Get all bookings from API (or localStorage as fallback)
// Pass adminToken to receive full booking data; omit for public/sanitized data.
export const getBookings = async (adminToken = null) => {
  try {
    console.log('Fetching bookings from Netlify Blobs...');
    const headers = adminToken ? { 'x-admin-token': adminToken } : {};
    const response = await fetch('/.netlify/functions/get-bookings', { headers });
    console.log('Response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Bookings loaded from API:', data);
      return data;
    }
    console.warn('API failed, using localStorage fallback');
    // Fallback to localStorage if API fails
    const bookings = localStorage.getItem(STORAGE_KEY);
    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.error('Error reading bookings:', error);
    // Fallback to localStorage
    const bookings = localStorage.getItem(STORAGE_KEY);
    return bookings ? JSON.parse(bookings) : [];
  }
};

// The Netlify functions answer with { error } when they refuse or fail.
async function responseError(response) {
  try {
    const data = await response.json();
    if (data && data.error) {
      const message = `The booking was NOT saved: ${data.error}`;
      return /[.!?]$/.test(message) ? message : `${message}.`;
    }
  } catch {
    /* not JSON */
  }
  return `The booking was NOT saved (the server answered ${response.status}).`;
}

// After saving, the list is read back from the server. This shows whether the booking really is stored, and
// whether the website can see it (a private booking must not be visible there, a real one must). No cache, so
// the answers are fresh.
async function verifySaved(booking) {
  const adminToken = import.meta.env.VITE_ADMIN_SECRET;
  const isPrivate = booking.isPrivate === true;
  const result = { storedInAdmin: false, onWebsite: null, total: null };
  const read = async (headers) => {
    const response = await fetch('/.netlify/functions/get-bookings', { headers, cache: 'no-store' });
    if (!response.ok) throw new Error(`read ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('unexpected answer');
    return data;
  };
  try {
    const all = await read(adminToken ? { 'x-admin-token': adminToken } : {});
    const found = all.find((b) => String(b.id) === String(booking.id));
    result.storedInAdmin =
      !!found && found.startDate === booking.startDate && found.endDate === booking.endDate && (found.isPrivate === true) === isPrivate;
    result.total = all.length;
  } catch (error) {
    console.error('Could not read the bookings back (admin):', error);
  }
  try {
    const website = await read({});
    result.onWebsite = website.some((b) => String(b.id) === String(booking.id));
  } catch (error) {
    console.error('Could not read the bookings back (website):', error);
  }
  return result;
}

// Save a new booking or update an existing one. Returns { ok, booking, verification } or { ok: false, error }.
// Unlike before, a failed save is reported instead of being kept in the browser and called a success.
export const saveBooking = async (bookingData) => {
  try {
    const now = new Date().toISOString();
    
    const booking = bookingData.id ? {
      ...bookingData,
      updatedAt: now
    } : {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    console.log('Saving booking to Netlify Blobs:', booking);
    const response = await fetch('/.netlify/functions/save-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    
    console.log('Save response status:', response.status);
    if (response.ok) {
      console.log('Booking saved successfully to Netlify Blobs!');
      return { ok: true, booking, verification: await verifySaved(booking) };
    }
    
    // Without the Netlify functions (plain `vite` development) the booking is kept in the browser only.
    if (!import.meta.env.DEV) return { ok: false, error: await responseError(response) };
    console.warn('API save failed, using localStorage fallback');
    // Fallback to localStorage if API fails
    const bookings = await getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      bookings[index] = booking;
    } else {
      bookings.push(booking);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    console.log('Booking saved to localStorage as fallback');
    return { ok: true, booking, verification: null };
  } catch (error) {
    console.error('Error saving booking:', error);
    return { ok: false, error: 'Network error. The booking was NOT saved.' };
  }
};

// Delete a booking by ID
export const deleteBooking = async (bookingId) => {
  try {
    const response = await fetch('/.netlify/functions/delete-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bookingId })
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback to localStorage if API fails
    const bookings = await getBookings();
    const filtered = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    return false;
  }
};

// Get bookings within a date range
export const getBookingsInRange = (startDate, endDate) => {
  const bookings = getBookings();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return bookings.filter(booking => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    return bookingStart <= end && bookingEnd >= start;
  });
};

// Get color scheme for a villa
export const getVillaColor = (villaName) => {
  return VILLA_COLORS[villaName] || {
    bg: '#f3f4f6',
    border: '#9ca3af',
    text: '#374151'
  };
};
