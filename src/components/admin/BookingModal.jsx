import React, { useState, useEffect } from 'react';

const VILLAS = [
  { name: 'Palacio Tropical', icon: '', color: 'from-amber-400 to-yellow-500', accentColor: '#f59e0b' },
  { name: 'Palacio Musical', icon: '', color: 'from-purple-400 to-pink-500', accentColor: '#8b5cf6' },
  { name: 'The View House', icon: '', color: 'from-blue-400 to-cyan-500', accentColor: '#3b82f6' },
  { name: 'The Palms Villa Estate', icon: '', color: 'from-green-400 to-emerald-500', accentColor: '#10b981' }
];


const ACTIVITIES = [
  { name: 'ATV Tour', icon: '' },
  { name: 'Zip Line Adventure', icon: '' },
  { name: 'Private Air Charter', icon: '' },
  { name: 'Spa Services', icon: '' },
  { name: 'Massages', icon: '' },
  { name: 'Yacht Charter', icon: '' },
  { name: 'Fishing', icon: '' },
  { name: 'Surfing Lessons', icon: '' },
  { name: 'Cooking Class', icon: '' },
  { name: 'Guided Tour', icon: '' }
];

const BookingModal = ({ isOpen, onClose, onSave, editingBooking }) => {
  const [formData, setFormData] = useState({
    villas: [],
    startDate: '',
    endDate: '',
    customerName: '',
    customerPhone: '',
    selectedActivities: [],
    activityNotes: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (editingBooking) {
      setFormData({
        villas: editingBooking.villas || [],
        startDate: editingBooking.startDate || '',
        endDate: editingBooking.endDate || '',
        customerName: editingBooking.customerName || '',
        customerPhone: editingBooking.customerPhone || '',
        selectedActivities: editingBooking.selectedActivities || [],
        activityNotes: editingBooking.activityNotes || '',
        additionalNotes: editingBooking.additionalNotes || ''
      });
    } else {
      setFormData({
        villas: [],
        startDate: '',
        endDate: '',
        customerName: '',
        customerPhone: '',
        selectedActivities: [],
        activityNotes: '',
        additionalNotes: ''
      });
    }
  }, [editingBooking, isOpen]);

  const handleVillaToggle = (villaName) => {
    setFormData(prev => ({
      ...prev,
      villas: prev.villas.includes(villaName)
        ? prev.villas.filter(v => v !== villaName)
        : [...prev.villas, villaName]
    }));
  };

  const handleActivityToggle = (activityName) => {
    setFormData(prev => {
      const existingIndex = prev.selectedActivities.findIndex(a => a.name === activityName);
      if (existingIndex >= 0) {
        // Remove activity
        return {
          ...prev,
          selectedActivities: prev.selectedActivities.filter(a => a.name !== activityName)
        };
      } else {
        // Add activity with default values
        return {
          ...prev,
          selectedActivities: [...prev.selectedActivities, { name: activityName, numPeople: '', date: '', notes: '' }]
        };
      }
    });
  };

  const handleActivityDetailChange = (activityName, field, value) => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.map(activity =>
        activity.name === activityName
          ? { ...activity, [field]: value }
          : activity
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.villas.length === 0) {
      alert('Please select at least one villa');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert('Please select start and end dates');
      return;
    }
    
    if (!formData.customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    const bookingData = {
      ...formData,
      id: editingBooking?.id
    };
    
    onSave(bookingData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div 
        className="bg-white w-full max-w-4xl overflow-hidden animate-slideUp"
        style={{
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxHeight: '95vh'
        }}
      >
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '48px'
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '48px 48px'
            }}></div>
          </div>
          
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)'
          }}></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div 
                className="relative"
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tight">
                  {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                </h2>
                <p className="text-white/80 text-lg mt-2 font-medium">
                  Manage your luxury villa reservations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="relative group"
              style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5"
                strokeLinecap="round"
                className="group-hover:rotate-90 transition-transform duration-300"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="overflow-y-auto custom-scrollbar"
          style={{
            maxHeight: 'calc(95vh - 260px)',
            padding: '48px',
            background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)'
          }}
        >
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)'
              }}>
                <span className="text-2xl"></span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Select Villas</h3>
                <p className="text-gray-500 font-medium">Choose one or more luxury properties</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VILLAS.map((villa) => {
                const isSelected = formData.villas.includes(villa.name);
                return (
                  <button
                    key={villa.name}
                    type="button"
                    onClick={() => handleVillaToggle(villa.name)}
                    className="group relative text-left transition-all duration-300"
                    style={{
                      padding: '24px',
                      borderRadius: '24px',
                      border: isSelected ? '3px solid ' + villa.accentColor : '2px solid #e5e7eb',
                      background: isSelected 
                        ? `linear-gradient(135deg, $content{villa.accentColor}10 0%, $content{villa.accentColor}05 100%)`
                        : 'white',
                      boxShadow: isSelected 
                        ? `0 8px 24px $content{villa.accentColor}30`
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="text-4xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                          filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none'
                        }}
                      >
                        {villa.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">{villa.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Luxury villa property</p>
                      </div>
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid $content{villa.accentColor}` : '2px solid #d1d5db',
                          background: isSelected ? villa.accentColor : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSelected && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Booking Period</h3>
                <p className="text-gray-500 font-medium">Select check-in and check-out dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    required
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      paddingRight: '56px',
                      borderRadius: '16px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      cursor: 'pointer',
                      colorScheme: 'light'
                    }}
                    className="focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#3b82f6'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Check-out Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    required
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      paddingRight: '56px',
                      borderRadius: '16px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      cursor: 'pointer',
                      colorScheme: 'light'
                    }}
                    className="focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#3b82f6'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Guest Information</h3>
                <p className="text-gray-500 font-medium">Contact details for this reservation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                  className="focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                  className="focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Activities & Experiences</h3>
                <p className="text-gray-500 font-medium">Optional add-ons for your stay</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACTIVITIES.map((activity) => {
                const selectedActivity = formData.selectedActivities.find(a => a.name === activity.name);
                const isSelected = !!selectedActivity;
                
                return (
                  <div
                    key={activity.name}
                    className="transition-all duration-300"
                    style={{
                      borderRadius: '20px',
                      border: isSelected ? '2px solid #10b981' : '2px solid #e5e7eb',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
                        : 'white',
                      boxShadow: isSelected 
                        ? '0 8px 20px rgba(16, 185, 129, 0.15)'
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Activity Header - Clickable */}
                    <button
                      type="button"
                      onClick={() => handleActivityToggle(activity.name)}
                      className="w-full text-left transition-all duration-300 hover:bg-gray-50"
                      style={{
                        padding: '18px 24px',
                        borderBottom: isSelected ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: isSelected 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            {activity.icon || '🎯'}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-base">{activity.name}</h4>
                          </div>
                        </div>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #10b981' : '2px solid #d1d5db',
                          background: isSelected ? '#10b981' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Activity Details - Only shown when selected */}
                    {isSelected && (
                      <div style={{ padding: '20px 24px' }}>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Number of People */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">
                              👥 Number of People
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={selectedActivity.numPeople}
                              onChange={(e) => handleActivityDetailChange(activity.name, 'numPeople', e.target.value)}
                              placeholder="e.g., 4"
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                background: 'white'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">
                              📅 Date
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={selectedActivity.date}
                                onChange={(e) => handleActivityDetailChange(activity.name, 'date', e.target.value)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.showPicker?.();
                                }}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#374151',
                                  background: 'white',
                                  cursor: 'pointer'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: '#9ca3af'
                              }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes for this specific activity */}
                        <div style={{ marginTop: '12px' }}>
                          <label className="block text-xs font-bold text-gray-600 mb-2">
                            📝 Notes
                          </label>
                          <textarea
                            value={selectedActivity.notes || ''}
                            onChange={(e) => handleActivityDetailChange(activity.name, 'notes', e.target.value)}
                            placeholder="Special requests or details for this activity..."
                            rows="2"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#374151',
                              background: 'white',
                              resize: 'vertical',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <span className="mr-2"></span>
                  Activity Notes
                </label>
                <textarea
                  value={formData.activityNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityNotes: e.target.value }))}
                  placeholder="Special requests or details about activities..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    resize: 'none'
                  }}
                  className="focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <span className="mr-2"></span>
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any other important information..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    resize: 'none'
                  }}
                  className="focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                />
              </div>
            </div>
          </div>
        </form>

        <div 
          style={{
            padding: '32px 48px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(to top, #f9fafb 0%, #ffffff 100%)'
          }}
        >
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="group transition-all duration-300"
              style={{
                flex: '1',
                padding: '18px 32px',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                fontWeight: '800',
                fontSize: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancel
              </span>
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="group transition-all duration-300 hover:scale-105"
              style={{
                flex: '2',
                padding: '18px 32px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
              }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{editingBooking ? 'Update Booking' : 'Create Booking'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
