import React, { useState, useEffect } from 'react';
import { getVillaPriceForDate, DEFAULT_ACTIVITY_PRICES } from '../../utils/invoiceGenerator';

const VILLAS = [
  { name: 'Palacio Tropical', icon: '🏰', color: 'from-amber-400 to-yellow-500', accentColor: '#f59e0b' },
  { name: 'Palacio Musical', icon: '🎵', color: 'from-purple-400 to-pink-500', accentColor: '#8b5cf6' },
  { name: 'The View House', icon: '🏔️', color: 'from-blue-400 to-cyan-500', accentColor: '#3b82f6' },
  { name: 'The Palms Villa Estate', icon: '🌴', color: 'from-green-400 to-emerald-500', accentColor: '#10b981' }
];

const ACTIVITIES = [
  { name: 'ATV Tour', icon: '🏍️' },
  { name: 'Zipline Adventure', icon: '🪂' },
  { name: 'Private Air Charter', icon: '✈️' },
  { name: 'Surfing Lessons', icon: '🏄' },
  { name: 'Fishing Tour', icon: '🎣' },
  { name: 'Spa Treatment', icon: '💆' },
  { name: 'Private Chef', icon: '👨‍🍳' },
  { name: 'Yoga Session', icon: '🧘' }
];

const BookingModal = ({ isOpen, onClose, onSave, editingBooking }) => {
  const [formData, setFormData] = useState({
    villas: [],
    villaPrice: {},
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
        villaPrice: editingBooking.villaPrice || {},
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
        villaPrice: {},
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

  useEffect(() => {
    if (formData.startDate && formData.villas.length > 0) {
      const newVillaPrices = {};
      formData.villas.forEach(villa => {
        if (!formData.villaPrice[villa]) {
          newVillaPrices[villa] = getVillaPriceForDate(villa, formData.startDate);
        }
      });
      if (Object.keys(newVillaPrices).length > 0) {
        setFormData(prev => ({
          ...prev,
          villaPrice: { ...prev.villaPrice, ...newVillaPrices }
        }));
      }
    }
  }, [formData.startDate, formData.villas]);

  const handleVillaToggle = (villaName) => {
    setFormData(prev => {
      const isSelected = prev.villas.includes(villaName);
      const newVillas = isSelected
        ? prev.villas.filter(v => v !== villaName)
        : [...prev.villas, villaName];
      
      const newVillaPrice = { ...prev.villaPrice };
      if (isSelected) {
        delete newVillaPrice[villaName];
      } else {
        // Immer den Preis setzen, auch wenn kein Datum gewählt ist
        // Falls Datum vorhanden, verwende seasonalen Preis, sonst Standard-Preis
        const dateToUse = prev.startDate || new Date().toISOString().split('T')[0];
        newVillaPrice[villaName] = getVillaPriceForDate(villaName, dateToUse);
      }
      
      return { ...prev, villas: newVillas, villaPrice: newVillaPrice };
    });
  };

  const updateVillaPrice = (villaName, price) => {
    setFormData(prev => ({
      ...prev,
      villaPrice: { ...prev.villaPrice, [villaName]: parseFloat(price) || 0 }
    }));
  };

  const handleActivityToggle = (activityName) => {
    setFormData(prev => {
      const existingIndex = prev.selectedActivities.findIndex(a => a.name === activityName);
      if (existingIndex >= 0) {
        return {
          ...prev,
          selectedActivities: prev.selectedActivities.filter(a => a.name !== activityName)
        };
      } else {
        const defaultPrice = DEFAULT_ACTIVITY_PRICES[activityName] || 0;
        return {
          ...prev,
          selectedActivities: [...prev.selectedActivities, { 
            name: activityName, 
            pricePerPerson: defaultPrice,
            numberOfPeople: 1,
            date: '', 
            notes: '' 
          }]
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
  };  const handleSubmit = (e) => {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <div 
        className="bg-white w-full max-w-4xl overflow-hidden animate-slideUp rounded-t-[24px] sm:rounded-[32px]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxHeight: '95svh'
        }}
      >
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 'clamp(20px, 5vw, 48px)'
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
            <div className="flex items-center gap-3 sm:gap-6">
              <div 
                className="relative hidden sm:flex"
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
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
                <h2 className="text-xl sm:text-4xl font-black text-white tracking-tight">
                  {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                </h2>
                <p className="text-white/80 text-sm sm:text-lg mt-1 sm:mt-2 font-medium">
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
            maxHeight: 'calc(95svh - 160px)',
            padding: 'clamp(20px, 5vw, 48px)',
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
                  <div key={villa.name}>
                    <button
                      type="button"
                      onClick={() => handleVillaToggle(villa.name)}
                      className="group relative text-left transition-all duration-300 w-full"
                      style={{
                        padding: '24px',
                        borderRadius: '24px',
                        border: isSelected ? '3px solid ' + villa.accentColor : '2px solid #e5e7eb',
                        background: isSelected 
                          ? `linear-gradient(135deg, ${villa.accentColor}10 0%, ${villa.accentColor}05 100%)`
                          : 'white',
                        boxShadow: isSelected 
                          ? `0 8px 24px ${villa.accentColor}30`
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
                            border: isSelected ? `2px solid ${villa.accentColor}` : '2px solid #d1d5db',
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
                    
                    {isSelected && (
                      <div className="mt-4 px-6 py-4 rounded-2xl border-2 border-dashed" style={{ borderColor: villa.accentColor + '40', background: villa.accentColor + '08' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: villa.accentColor }}>
                          💰 Price per Night
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
                          <input
                            type="number"
                            value={formData.villaPrice[villa.name] || ''}
                            onChange={(e) => updateVillaPrice(villa.name, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="0.00"
                            style={{
                              width: '100%',
                              paddingLeft: '48px',
                              paddingRight: '24px',
                              paddingTop: '16px',
                              paddingBottom: '16px',
                              borderRadius: '14px',
                              border: `2px solid ${villa.accentColor}40`,
                              fontSize: '18px',
                              fontWeight: '700',
                              background: 'white',
                              color: '#1f2937'
                            }}
                            className="focus:ring-4 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                <span className="text-2xl">­ƒÄ»</span>
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
                            {activity.icon || '­ƒÄ»'}
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
                        <div className="grid grid-cols-3 gap-4">
                          {/* Price Per Person */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">
                              💰 Price/Person
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                value={selectedActivity.pricePerPerson || ''}
                                onChange={(e) => handleActivityDetailChange(activity.name, 'pricePerPerson', parseFloat(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="0"
                                style={{
                                  width: '100%',
                                  paddingLeft: '32px',
                                  paddingRight: '12px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#374151',
                                  background: 'white'
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Number of People */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">
                              👥 People
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={selectedActivity.numberOfPeople === '' ? '' : (selectedActivity.numberOfPeople ?? 1)}
                              onChange={(e) => handleActivityDetailChange(activity.name, 'numberOfPeople', e.target.value === '' ? '' : parseInt(e.target.value))}
                              onBlur={(e) => {
                                const v = parseInt(e.target.value);
                                if (!v || v < 1) handleActivityDetailChange(activity.name, 'numberOfPeople', 1);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="1"
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
                                value={selectedActivity.date || ''}
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
                            </div>
                          </div>
                        </div>

                        {/* Total Price Display */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600">Activity Total:</span>
                            <span className="text-xl font-black text-green-600">
                              ${((selectedActivity.pricePerPerson || 0) * (selectedActivity.numberOfPeople || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Notes for this specific activity */}
                        <div style={{ marginTop: '12px' }}>
                          <label className="block text-xs font-bold text-gray-600 mb-2">
                            ­ƒôØ Notes
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
            padding: 'clamp(14px, 3vw, 32px) clamp(20px, 5vw, 48px)',
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
                padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 32px)',
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
                padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 32px)',
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
