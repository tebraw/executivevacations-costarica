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

  // ── Derived summary values ──────────────────────────────────
  const nights = (() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const d = (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000;
    return d > 0 ? d : 0;
  })();
  const villaTotal = formData.villas.reduce((s, v) => s + (parseFloat(formData.villaPrice[v]) || 0) * nights, 0);
  const activityTotal = formData.selectedActivities.reduce((s, a) => s + (a.pricePerPerson || 0) * (a.numberOfPeople || 1), 0);
  const grandTotal = villaTotal + activityTotal;
  const fmtUSD = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .bm-outer-grid { grid-template-columns: 1fr !important; }
          .bm-sticky { position: static !important; }
        }
      `}</style>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b0f18', margin: 0 }}>
            📅 {editingBooking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Manage your luxury villa reservations</p>
        </div>
        <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: '10px', border: '2px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          ✕ Cancel
        </button>
      </div>

      <div className="bm-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: '28px', alignItems: 'start' }}>

        {/* ── Left: form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <BookingSection title="1. Select Villas" icon="🏰">
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
          </BookingSection>

          <BookingSection title="2. Booking Period" icon="📅">
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
          </BookingSection>

          <BookingSection title="3. Guest Information" icon="👤">
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
          </BookingSection>

          <BookingSection title="4. Activities & Experiences" icon="🎯">
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
          </BookingSection>

          <BookingSection title="5. Notes" icon="📝">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Activity Notes</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-3">Additional Notes</label>
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
          </BookingSection>
        </form>

        {/* ── Right: live summary ── */}
        <div className="bm-sticky" style={{ position: 'sticky', top: '104px' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(102,126,234,0.2)' }}>
            {/* Summary header */}
            <div style={{ background: 'linear-gradient(135deg, #0b0f18 0%, #1a2744 100%)', padding: '20px 22px' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#c9a96e', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>Live Summary</p>
              <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>
                {formData.customerName || 'Guest Name'}
              </h3>
              {formData.startDate && formData.endDate && (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(formData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {nights} night{nights !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Line items */}
            <div style={{ background: '#fff', padding: '16px 22px' }}>
              {formData.villas.length === 0 && formData.selectedActivities.length === 0 ? (
                <p style={{ color: '#d1d5db', textAlign: 'center', padding: '16px 0', fontSize: '13px' }}>Select a villa to start</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.villas.map((v) => (
                    <div key={v} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '13px', color: '#374151', flex: 1, lineHeight: 1.4 }}>{v} × {nights}n</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', whiteSpace: 'nowrap' }}>{fmtUSD((parseFloat(formData.villaPrice[v]) || 0) * nights)}</span>
                    </div>
                  ))}
                  {formData.selectedActivities.map((a) => (
                    <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '13px', color: '#374151', flex: 1, lineHeight: 1.4 }}>{a.name} × {a.numberOfPeople || 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', whiteSpace: 'nowrap' }}>{fmtUSD((a.pricePerPerson || 0) * (a.numberOfPeople || 1))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{ background: '#f9fafb', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0b0f18' }}>TOTAL</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b8972e' }}>{fmtUSD(grandTotal)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ background: '#fff', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f3f4f6' }}>
              <button
                type="submit"
                onClick={handleSubmit}
                style={{ padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 16px rgba(102,126,234,0.35)' }}
              >
                ✓ {editingBooking ? 'Update Booking' : 'Create Booking'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '14px' }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

// ── Section wrapper (same style as WeddingQuoteBuilder) ───────
function BookingSection({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0b0f18', margin: 0 }}>{title}</h4>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}
