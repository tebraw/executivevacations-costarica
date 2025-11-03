import React, { useState, useEffect } from 'react';

const VillaDetailModal = ({ villa, isOpen, onClose, onContactClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Helper function to get correct image path for GitHub Pages
  const BASE_URL = import.meta.env.BASE_URL;
  const getImagePath = (path) => {
    return `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const images = villa?.detailImages || villa?.images || [];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      // Reset lightbox when modal opens
      setIsLightboxOpen(false);
      setCurrentImageIndex(0);
      setLightboxImageIndex(0);
    } else {
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

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setLightboxImageIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!isOpen || !villa) return null;
  
  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-start z-10">
            <div className="flex-1">
              <h2 className="heading-2 mb-2">{villa.name}</h2>
              <div className="flex items-center gap-4 text-gray">
                <span className="body-regular">★ {villa.rating} • {villa.location}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-light flex items-center justify-center text-2xl text-gray ml-4"
            >
              ×
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-4 md:p-6">
            {/* Image Gallery - Click to open lightbox */}
            <div className="lg:col-span-2">
              <div className="relative mb-4 cursor-pointer bg-gray-50 rounded-xl flex items-center justify-center" style={{ minHeight: '400px' }} onClick={() => openLightbox(currentImageIndex)}>
                <img 
                  src={getImagePath(images[currentImageIndex])} 
                  alt={`${villa.name} - ${currentImageIndex + 1}`}
                  className="w-full max-h-[500px] object-contain"
                />
                
                {/* Click to view full size indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-semibold">
                    Click to view full size
                  </div>
                </div>

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Gallery Thumbnail - Single image to open lightbox */}
              {images.length > 1 && (
                <button
                  onClick={() => openLightbox(0)}
                  className="relative w-20 h-16 rounded-lg overflow-hidden group hover:opacity-90 transition-opacity"
                >
                  <img 
                    src={getImagePath(images[1] || images[0])} 
                    alt="View Gallery"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay with icon */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                    <div className="text-center text-white">
                      {/* Gallery Icon */}
                      <svg className="w-6 h-6 mx-auto mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span className="text-[10px] font-semibold">+{images.length - 1}</span>
                    </div>
                  </div>
                </button>
              )}
            </div>

          {/* Villa Details - Immediately visible */}
          <div className="lg:col-span-1">
            {/* Key Information Box */}
            <div className="bg-light rounded-xl p-4 md:p-6 mb-6 sticky top-24">
              <h3 className="heading-3 mb-4">Villa Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray">Bedrooms</span>
                  <span className="text-dark font-semibold text-lg">{villa.bedrooms}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray">Bathrooms</span>
                  <span className="text-dark font-semibold text-lg">{villa.bathrooms}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray">Max Guests</span>
                  <span className="text-dark font-semibold text-lg">{villa.guests}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray">Property Size</span>
                  <span className="text-dark font-semibold text-lg">{villa.size || '2,500 m²'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray">Rating</span>
                  <span className="text-dark font-semibold text-lg">★ {villa.rating}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={onContactClick}
                  className="btn btn-luxury w-full mb-3"
                >
                  Contact for Availability
                </button>
                <button className="btn btn-secondary w-full">
                  Save to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* About Villa */}
            <div>
              <h3 className="heading-3 mb-4">About this Villa</h3>
              <p className="body-regular text-gray mb-6 leading-relaxed">
                {villa.detailedDescription || villa.description || "Experience luxury and comfort in this stunning villa, perfectly designed for an unforgettable Costa Rican getaway. Every detail has been carefully crafted to provide you with the ultimate vacation experience."}
              </p>

              {/* Amenities */}
              <h4 className="heading-4 mb-4">What this place offers</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(villa.allAmenities || villa.topAmenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 body-regular text-gray py-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    {typeof amenity === 'string' ? amenity : amenity.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Booking */}
            <div>
              <h4 className="heading-3 mb-4">Location & Contact</h4>
              <div className="bg-light rounded-xl p-4 md:p-6 mb-6">
                <div className="mb-4">
                  <span className="body-regular font-semibold text-dark">{villa.fullLocation || villa.location}</span>
                </div>
                <p className="body-regular text-gray mb-6">
                  {villa.locationDescription || "Located in one of Costa Rica's most prestigious areas, offering breathtaking views and easy access to pristine beaches, lush rainforests, and world-class amenities."}
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={onContactClick}
                    className="btn btn-luxury w-full"
                  >
                    Contact for Availability
                  </button>
                  <button className="btn btn-secondary w-full">
                    Request Virtual Tour
                  </button>
                  <button className="btn btn-secondary w-full">
                    Save to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Lightbox Modal - Full Screen Image Viewer - OUTSIDE modal overlay */}
    {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={closeLightbox}
        >
        {/* Close button */}
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 border border-white/20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Image counter */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10">
          {lightboxImageIndex + 1} / {images.length}
        </div>

        {/* Main image */}
        <img 
          src={getImagePath(images[lightboxImageIndex])} 
          alt={`${villa.name} - ${lightboxImageIndex + 1}`}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Navigation arrows - nur wenn mehr als 1 Bild */}
        {images.length > 1 && (
          <>
            {/* Left arrow */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                prevLightboxImage();
              }}
              className="w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 border border-white/20"
              style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            {/* Right arrow */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                nextLightboxImage();
              }}
              className="w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 border border-white/20"
              style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>
    )}
    </>
  );
};

export default VillaDetailModal;