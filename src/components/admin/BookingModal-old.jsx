import React, { useState, useEffect } from 'react';
import { getVillaPriceForDate, DEFAULT_ACTIVITY_PRICES } from '../../utils/invoiceGenerator';

const VILLAS = [
  { name: 'Palacio Tropical', color: '#f59e0b' },
  { name: 'Palacio Musical', color: '#8b5cf6' },
  { name: 'The View House', color: '#3b82f6' },
  { name: 'The Palms Villa Estate', color: '#10b981' }
];

const AVAILABLE_ACTIVITIES = [
  'ATV Tour',
  'Zipline Adventure',
  'Private Air Charter',
  'Surfing Lessons',
  'Fishing Tour',
  'Spa Treatment',
  'Private Chef',
  'Yoga Session'
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

  // Auto-calculate villa prices when dates or villas change
  useEffect(() => {
    if (formData.startDate && formData.villas.length > 0) {
      const newVillaPrices = {};
      formData.villas.forEach(villa => {
        // Only auto-calculate if not manually set
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

  const toggleVilla = (villaName) => {
    setFormData(prev => ({
      ...prev,
      villas: prev.villas.includes(villaName)
        ? prev.villas.filter(v => v !== villaName)
        : [...prev.villas, villaName]
    }));
  };

  const updateVillaPrice = (villa, price) => {
    setFormData(prev => ({
      ...prev,
      villaPrice: {
        ...prev.villaPrice,
        [villa]: parseFloat(price) || 0
      }
    }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: [
        ...prev.selectedActivities,
        {
          name: AVAILABLE_ACTIVITIES[0],
          pricePerPerson: DEFAULT_ACTIVITY_PRICES[AVAILABLE_ACTIVITIES[0]] || 0,
          numberOfPeople: 1
        }
      ]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.filter((_, i) => i !== index)
    }));
  };

  const updateActivity = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const handleActivityNameChange = (index, newName) => {
    const defaultPrice = DEFAULT_ACTIVITY_PRICES[newName] || 0;
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.map((activity, i) =>
        i === index
          ? { ...activity, name: newName, pricePerPerson: defaultPrice }
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
      id: editingBooking?.id || `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    onSave(bookingData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-luxury-gold to-amber-600 px-8 py-6 rounded-t-2xl shadow-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="heading-2 text-white">
              {editingBooking ? 'Edit Booking' : 'New Booking'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all hover:rotate-90 duration-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Check-in Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                required
              />
            </div>
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Check-out Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                required
              />
            </div>
          </div>

          {/* Villas Selection with Pricing */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-4">Select Villas *</label>
            <div className="space-y-3">
              {VILLAS.map((villa) => {
                const isSelected = formData.villas.includes(villa.name);
                return (
                  <div
                    key={villa.name}
                    className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-luxury-gold bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-lg transform scale-[1.01]'
                        : 'border-gray-300 bg-white hover:border-luxury-gold/50 hover:shadow-md hover:scale-[1.005]'
                    }`}
                    onClick={() => toggleVilla(villa.name)}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-4 right-4">
                      {isSelected ? (
                        <div className="w-7 h-7 bg-luxury-gold rounded-full flex items-center justify-center shadow-md">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-7 h-7 border-2 border-gray-300 rounded-full group-hover:border-luxury-gold transition-colors" />
                      )}
                    </div>

                    <div className="flex items-start justify-between pr-10">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-lg shadow-sm transition-all duration-200 ${
                            isSelected ? 'ring-4 ring-luxury-gold/30 scale-110' : ''
                          }`}
                          style={{ backgroundColor: villa.color }}
                        />
                        <div>
                          <span className={`text-xl font-bold block ${isSelected ? 'text-luxury-gold' : 'text-gray-800'}`}>
                            {villa.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-gray-500 font-medium">Click to deselect</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Price per Night:</label>
                          <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border-2 border-gray-200 focus-within:border-luxury-gold focus-within:ring-2 focus-within:ring-luxury-gold/20 transition-all">
                            <span className="text-lg font-bold text-gray-400 mr-2">$</span>
                            <input
                              type="number"
                              value={formData.villaPrice[villa.name] || ''}
                              onChange={(e) => updateVillaPrice(villa.name, e.target.value)}
                              className="flex-1 bg-transparent border-none focus:outline-none text-lg font-bold text-gray-800"
                              placeholder="Enter price"
                              step="100"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-bold text-gray-800">Activities</label>
              <button
                type="button"
                onClick={addActivity}
                className="px-6 py-3 bg-gradient-to-r from-luxury-gold to-amber-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-bold flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Activity
              </button>
            </div>
            
            {formData.selectedActivities.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                <svg className="mx-auto mb-4 text-gray-400" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <p className="text-gray-500 font-medium">No activities added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Activity" to include activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.selectedActivities.map((activity, index) => (
                  <div key={index} className="relative p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Activity Number Badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-luxury-gold text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      {index + 1}
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                      title="Remove activity"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="md:col-span-3 group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                          Activity Type
                        </label>
                        <select
                          value={activity.name}
                          onChange={(e) => handleActivityNameChange(index, e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer font-semibold text-gray-800"
                        >
                          {AVAILABLE_ACTIVITIES.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                          Price per Person
                        </label>
                        <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-luxury-gold focus-within:ring-2 focus-within:ring-luxury-gold/20 transition-all hover:shadow-md">
                          <span className="text-lg font-bold text-gray-400 mr-2">$</span>
                          <input
                            type="number"
                            value={activity.pricePerPerson}
                            onChange={(e) =>
                              updateActivity(index, 'pricePerPerson', parseFloat(e.target.value) || 0)
                            }
                            className="flex-1 bg-transparent border-none focus:outline-none font-bold text-gray-800"
                            min="0"
                            step="10"
                          />
                        </div>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                          Number of People
                        </label>
                        <input
                          type="number"
                          value={activity.numberOfPeople}
                          onChange={(e) =>
                            updateActivity(index, 'numberOfPeople', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md font-bold text-gray-800"
                          min="1"
                        />
                      </div>
                      
                      <div className="flex items-center justify-center bg-gradient-to-r from-luxury-gold/10 to-amber-100 rounded-xl px-4 py-3 border border-luxury-gold/20">
                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Total Cost</p>
                          <p className="text-2xl font-bold text-luxury-gold">
                            ${((activity.pricePerPerson || 0) * (activity.numberOfPeople || 1)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Activity Notes
              </label>
              <textarea
                value={formData.activityNotes}
                onChange={(e) => setFormData({ ...formData, activityNotes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                rows="4"
                placeholder="Special requests for activities..."
              />
            </div>
            <div className="group">
              <label className="block body-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-luxury-gold">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                rows="4"
                placeholder="General booking notes..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 body-semibold shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-luxury-gold to-amber-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 body-semibold hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingBooking ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
