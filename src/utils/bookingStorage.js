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
  'The Palms Villa Estate': {
    bg: '#d1fae5',
    border: '#10b981',
    text: '#065f46'
  }
};

// Get all bookings from API (or localStorage as fallback)
export const getBookings = async () => {
  try {
    const response = await fetch('/.netlify/functions/get-bookings');
    if (response.ok) {
      return await response.json();
    }
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

// Save a new booking or update existing one
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
    
    const response = await fetch('/.netlify/functions/save-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback to localStorage if API fails
    const bookings = await getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      bookings[index] = booking;
    } else {
      bookings.push(booking);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error('Error saving booking:', error);
    return false;
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
