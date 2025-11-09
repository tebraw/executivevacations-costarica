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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-luxury-gold to-amber-600 px-6 py-4 rounded-t-2xl">
          <h2 className="heading-2 text-white">
            {editingBooking ? 'Edit Booking' : 'New Booking'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block body-semibold text-gray mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block body-semibold text-gray mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block body-semibold text-gray mb-2">Check-in Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block body-semibold text-gray mb-2">Check-out Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Villas Selection with Pricing */}
          <div>
            <label className="block body-semibold text-gray mb-3">Select Villas *</label>
            <div className="space-y-3">
              {VILLAS.map((villa) => (
                <div
                  key={villa.name}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.villas.includes(villa.name)
                      ? 'border-luxury-gold bg-amber-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => toggleVilla(villa.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: villa.color }}
                      />
                      <span className="body-semibold">{villa.name}</span>
                    </div>
                    {formData.villas.includes(villa.name) && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm text-gray">Price/Night:</span>
                        <div className="flex items-center">
                          <span className="text-sm mr-1">$</span>
                          <input
                            type="number"
                            value={formData.villaPrice[villa.name] || ''}
                            onChange={(e) => updateVillaPrice(villa.name, e.target.value)}
                            className="w-24 px-2 py-1 border-2 border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                            placeholder="0"
                            step="100"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block body-semibold text-gray">Activities</label>
              <button
                type="button"
                onClick={addActivity}
                className="px-4 py-2 bg-luxury-gold text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
              >
                + Add Activity
              </button>
            </div>
            <div className="space-y-3">
              {formData.selectedActivities.map((activity, index) => (
                <div key={index} className="p-4 border-2 border-gray-300 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray mb-1">Activity</label>
                      <select
                        value={activity.name}
                        onChange={(e) => handleActivityNameChange(index, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                      >
                        {AVAILABLE_ACTIVITIES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray mb-1">Price/Person ($)</label>
                      <input
                        type="number"
                        value={activity.pricePerPerson}
                        onChange={(e) =>
                          updateActivity(index, 'pricePerPerson', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                        min="0"
                        step="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray mb-1">People</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={activity.numberOfPeople}
                          onChange={(e) =>
                            updateActivity(index, 'numberOfPeople', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Remove activity"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block body-semibold text-gray mb-2">Activity Notes</label>
              <textarea
                value={formData.activityNotes}
                onChange={(e) => setFormData({ ...formData, activityNotes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
                rows="3"
                placeholder="Special requests for activities..."
              />
            </div>
            <div>
              <label className="block body-semibold text-gray mb-2">Additional Notes</label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-luxury-gold focus:outline-none"
                rows="3"
                placeholder="General booking notes..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray rounded-xl hover:bg-gray-50 transition-colors body-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-luxury-gold text-white rounded-xl hover:bg-amber-600 transition-colors body-semibold"
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
