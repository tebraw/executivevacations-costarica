import React, { useState } from 'react';

const VillaDetailModal = ({ villa, isOpen, onClose, onContactClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !villa) return null;

  // Helper function to get correct image path for GitHub Pages
  const BASE_URL = import.meta.env.BASE_URL;
  const getImagePath = (path) => {
    return `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const images = villa.detailImages || villa.images || [];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-4 md:p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
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

        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Image Gallery - Larger and with navigation */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl mb-4">
              <img 
                src={getImagePath(images[currentImageIndex])} 
                alt={`${villa.name} - ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all text-xl font-bold"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all text-xl font-bold"
                  >
                    →
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={getImagePath(image)} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Villa Details - Immediately visible */}
          <div className="lg:col-span-1">
            {/* Key Information Box */}
            <div className="bg-light rounded-xl p-6 mb-6 sticky top-24">
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
        <div className="px-6 pb-6">
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
              <div className="bg-light rounded-xl p-6 mb-6">
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
  );
};

export default VillaDetailModal;