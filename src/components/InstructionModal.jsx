import React, { useEffect, useState } from 'react';

const InstructionModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="heading-2 text-dark mb-3">
            Welcome to Your Dream Vacation
          </h2>
          <p className="body-regular text-gray">
            Plan your perfect Costa Rica getaway in 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-8">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-blue">1</span>
            </div>
            <div className="flex-1">
              <h3 className="heading-4 text-dark mb-2">Choose Your Villa</h3>
              <p className="body-small text-gray">
                Browse our luxury villas and click "Add to Selection" on your favorite property
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: 'var(--luxury-gold)' }}>2</span>
            </div>
            <div className="flex-1">
              <h3 className="heading-4 text-dark mb-2">Select Activities</h3>
              <p className="body-small text-gray">
                Add exciting experiences to enhance your vacation - from ATV adventures to private chef services
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-green-600">3</span>
            </div>
            <div className="flex-1">
              <h3 className="heading-4 text-dark mb-2">Complete Your Inquiry</h3>
              <p className="body-small text-gray">
                Fill out the contact form and our team will reach out to discuss details, pricing, and availability
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-light rounded-xl p-4 mb-6">
          <p className="body-small text-gray text-center">
            <strong className="text-dark">No commitment required!</strong> Simply select what interests you, 
            and we'll personalize everything to your preferences.
          </p>
        </div>

        {/* Button */}
        <button 
          onClick={onClose}
          className="btn btn-luxury w-full"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default InstructionModal;
