import React, { useEffect, useState } from 'react';

const InstructionModal = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto ${isAnimating ? 'active' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: isAnimating ? 'slideIn 0.4s ease-out' : 'none' }}
      >
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="instruction-modal-icon mb-4">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="url(#goldGradient)" opacity="0.2"/>
                <path d="M24 14L27.708 21.584L36 22.736L30 28.584L31.416 36.832L24 32.944L16.584 36.832L18 28.584L12 22.736L20.292 21.584L24 14Z" fill="url(#goldGradient)"/>
                <defs>
                  <linearGradient id="goldGradient" x1="24" y1="14" x2="24" y2="36.832" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F4E4C1"/>
                    <stop offset="1" stopColor="#D4AF37"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Plan Your Perfect Escape
            </h2>
            <p className="text-gray-600 text-lg">
              Your luxury Costa Rica experience begins with three simple steps
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">

        {/* Steps with enhanced styling */}
        <div className="instruction-steps">
          {/* Step 1 */}
          <div className="instruction-step" style={{ animationDelay: '0.1s' }}>
            <div className="instruction-step-number step-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="step-badge">1</span>
            </div>
            <div className="instruction-step-content">
              <h3 className="instruction-step-title">Choose Your Villa</h3>
              <p className="instruction-step-description">
                Select from our collection of exclusive luxury properties, each offering unique amenities and breathtaking views
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="instruction-step" style={{ animationDelay: '0.2s' }}>
            <div className="instruction-step-number step-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="step-badge">2</span>
            </div>
            <div className="instruction-step-content">
              <h3 className="instruction-step-title">Curate Your Activities</h3>
              <p className="instruction-step-description">
                Enhance your stay with handpicked experiences - adventure tours, wellness treatments, and culinary delights
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="instruction-step" style={{ animationDelay: '0.3s' }}>
            <div className="instruction-step-number step-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4018C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27097 2.11999 4.17997C2.095 3.90344 2.12787 3.62474 2.21649 3.3616C2.30512 3.09846 2.44756 2.85666 2.63476 2.6516C2.82196 2.44653 3.0498 2.28268 3.30379 2.1705C3.55777 2.05831 3.83233 2.00024 4.10999 1.99997H7.10999C7.5953 1.9952 8.06579 2.16705 8.43376 2.48351C8.80173 2.79996 9.04207 3.23942 9.10999 3.71997C9.23662 4.68004 9.47144 5.6227 9.80999 6.52997C9.94454 6.8879 9.97366 7.27689 9.8939 7.65086C9.81415 8.02482 9.62886 8.36809 9.35999 8.63998L8.08999 9.90997C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0554 17.47 14.19C18.3773 14.5285 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="step-badge">3</span>
            </div>
            <div className="instruction-step-content">
              <h3 className="instruction-step-title">Connect With Us</h3>
              <p className="instruction-step-description">
                Share your travel details and our concierge team will craft a personalized itinerary tailored to your preferences
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="10" cy="10" r="9" stroke="#1E40AF" strokeWidth="2"/>
            <path d="M10 14V10M10 6H10.01" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Flexible Planning:</strong> No payment required now. Simply explore, select, and let us handle the rest with personalized service.
          </p>
        </div>

        {/* CTA Button */}
        <button 
          onClick={onClose}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>Begin Your Journey</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
