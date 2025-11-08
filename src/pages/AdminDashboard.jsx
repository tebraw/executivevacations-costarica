import React, { useState, useEffect } from 'react';
import BookingCalendar from '../components/admin/BookingCalendar';
import BookingModal from '../components/admin/BookingModal';
import { getBookings, saveBooking, deleteBooking } from '../utils/bookingStorage';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setBookings(getBookings());
  };

  const handleCreateBooking = (bookingData) => {
    saveBooking(bookingData);
    loadBookings();
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (bookingId) => {
    deleteBooking(bookingId);
    loadBookings();
    setShowDeleteConfirm(null);
    setEditingBooking(null);
    setIsModalOpen(false);
  };

  const handleBookingClick = (booking) => {
    setShowDeleteConfirm(booking);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-luxury-gold rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h1 className="heading-2 text-dark">Booking Calendar</h1>
              </div>
              <p className="body-regular text-gray">Manage villa reservations and bookings</p>
            </div>
            <button
              onClick={() => {
                setEditingBooking(null);
                setIsModalOpen(true);
              }}
              className="btn btn-luxury flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Booking
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-dark">{bookings.length}</div>
                <div className="text-sm text-gray">Total Bookings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-dark">
                  {bookings.filter(b => new Date(b.endDate) >= new Date()).length}
                </div>
                <div className="text-sm text-gray">Active Bookings</div>
              </div>
            </div>
          </div>
        </div>

        <BookingCalendar 
          bookings={bookings} 
          onBookingClick={handleBookingClick}
        />
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleCreateBooking}
        editingBooking={editingBooking}
      />
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="w-full max-w-4xl animate-slideUp"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px 20px',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)',
                pointerEvents: 'none'
              }}></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Booking Details</h3>
                    <p className="text-white/70 text-xs font-medium">Manage reservation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  className="hover:scale-110 hover:bg-white/30"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div 
              style={{ 
                padding: '16px',
                overflowY: 'auto',
                flexGrow: 1,
                flexShrink: 1
              }}
              className="custom-scrollbar"
            >
              
              {/* Customer & Dates Combined Row */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '12px', 
                  marginBottom: '12px' 
                }}
              >
                
                {/* Customer Info Card */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-15%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Customer</h4>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p className="text-white/60 text-xs font-semibold mb-1">Name</p>
                      <p className="text-white text-sm font-bold">{showDeleteConfirm.customerName}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-1">Phone</p>
                      <p className="text-white text-sm font-bold">{showDeleteConfirm.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-15%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Dates</h4>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p className="text-white/60 text-xs font-semibold mb-1">Check-in</p>
                      <p className="text-white text-sm font-bold">{formatDate(showDeleteConfirm.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-1">Check-out</p>
                      <p className="text-white text-sm font-bold">{formatDate(showDeleteConfirm.endDate)}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Villas */}
              <div 
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-20%',
                  left: '-10%',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)',
                  borderRadius: '50%'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-black text-white">Villas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {showDeleteConfirm.villas.map(villa => (
                      <span 
                        key={villa}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: '#1f2937',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        {villa}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activities */}
              {showDeleteConfirm.selectedActivities?.length > 0 && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-25%',
                    left: '-10%',
                    width: '130px',
                    height: '130px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Activities</h4>
                    </div>
                    
                    {/* Activity Cards */}
                    <div className="grid grid-cols-1 gap-2">
                      {showDeleteConfirm.selectedActivities.map((activity, index) => {
                        // Handle both old format (string) and new format (object)
                        const activityName = typeof activity === 'string' ? activity : activity.name;
                        const numPeople = typeof activity === 'object' ? activity.numPeople : null;
                        const activityDate = typeof activity === 'object' ? activity.date : null;
                        const activityNotes = typeof activity === 'object' ? activity.notes : null;
                        
                        return (
                          <div
                            key={index}
                            style={{
                              background: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-black text-gray-900 text-sm mb-1">{activityName}</h5>
                                <div className="flex items-center gap-3 text-xs mb-2">
                                  {numPeople && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span>👥</span>
                                      <span className="font-semibold">{numPeople} {numPeople === '1' ? 'Person' : 'People'}</span>
                                    </div>
                                  )}
                                  {activityDate && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span>📅</span>
                                      <span className="font-semibold">{formatDate(activityDate)}</span>
                                    </div>
                                  )}
                                </div>
                                {activityNotes && (
                                  <div 
                                    style={{
                                      background: 'rgba(102, 126, 234, 0.06)',
                                      borderRadius: '8px',
                                      padding: '8px 10px',
                                      marginTop: '6px'
                                    }}
                                  >
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                      <span className="font-bold">📝 </span>{activityNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {(showDeleteConfirm.activityNotes || showDeleteConfirm.additionalNotes) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {showDeleteConfirm.activityNotes && (
                    <div 
                      style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.15)'
                      }}
                    >
                      <p className="text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Activity Notes</p>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium">{showDeleteConfirm.activityNotes}</p>
                    </div>
                  )}
                  {showDeleteConfirm.additionalNotes && (
                    <div 
                      style={{
                        background: 'rgba(240, 147, 251, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(240, 147, 251, 0.15)'
                      }}
                    >
                      <p className="text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Additional Notes</p>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium">{showDeleteConfirm.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div 
              style={{
                padding: '16px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(to top, #f9fafb 0%, #ffffff 100%)',
                flexShrink: 0
              }}
            >
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    handleEditBooking(showDeleteConfirm);
                  }}
                  className="transition-all duration-300 hover:scale-105"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this booking?')) {
                      handleDeleteBooking(showDeleteConfirm.id);
                    }
                  }}
                  className="transition-all duration-300 hover:scale-105"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
