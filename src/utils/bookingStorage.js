// LocalStorage-based booking management system

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

// Get all bookings from localStorage
export const getBookings = () => {
  try {
    const bookings = localStorage.getItem(STORAGE_KEY);
    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
};

// Save a new booking or update existing one
export const saveBooking = (bookingData) => {
  try {
    const bookings = getBookings();
    const now = new Date().toISOString();
    
    if (bookingData.id) {
      // Update existing booking
      const index = bookings.findIndex(b => b.id === bookingData.id);
      if (index !== -1) {
        bookings[index] = {
          ...bookingData,
          updatedAt: now
        };
      }
    } else {
      // Create new booking
      const newBooking = {
        ...bookingData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };
      bookings.push(newBooking);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error('Error saving booking:', error);
    return false;
  }
};

// Delete a booking by ID
export const deleteBooking = (bookingId) => {
  try {
    const bookings = getBookings();
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
