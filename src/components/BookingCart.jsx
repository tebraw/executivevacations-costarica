import React, { useState } from 'react';

const BookingCart = ({ selectedVilla, selectedActivities, onOpenContact }) => {
  if (!selectedVilla && selectedActivities.length === 0) return null;

  return (
    <div className="booking-cart">
      <div className="booking-cart-content">
        <h3 className="booking-cart-title">Your Selection</h3>
        
        {/* Selected Villa */}
        {selectedVilla && (
          <div className="booking-item">
            <div className="booking-item-header">
              <span className="booking-item-icon">🏠</span>
              <span className="booking-item-label">Villa</span>
            </div>
            <p className="booking-item-name">{selectedVilla.name}</p>
          </div>
        )}

        {/* Selected Activities */}
        {selectedActivities.length > 0 && (
          <div className="booking-item">
            <div className="booking-item-header">
              <span className="booking-item-icon">✨</span>
              <span className="booking-item-label">Activities ({selectedActivities.length})</span>
            </div>
            <ul className="booking-activities-list">
              {selectedActivities.map(activity => (
                <li key={activity.id}>{activity.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={onOpenContact}
          className="btn btn-luxury w-full"
        >
          Continue to Contact Form
        </button>
      </div>
    </div>
  );
};

export default BookingCart;
