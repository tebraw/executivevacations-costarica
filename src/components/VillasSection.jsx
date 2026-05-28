import React from 'react';
import { useNavigate } from 'react-router-dom';
import villas from '../data/villas';

// ── Set to true to re-enable price display ──
const SHOW_PRICES = false;

// Get the base URL from Vite config for proper GitHub Pages paths
const BASE_URL = import.meta.env.BASE_URL;
const getImagePath = (path) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

const VillaCard = ({ villa, isSelected, onSelect, onViewDetails }) => {
  const navigate = useNavigate();
  return (
    <div className={`card group ${isSelected ? 'ring-2 ring-luxury-gold' : ''} ${villa.isComingSoon ? 'coming-soon-card' : ''}`}>
      {villa.isComingSoon && (
        <div className="coming-soon-overlay">
          <div className="coming-soon-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="coming-soon-text">Available Soon</span>
            <p className="coming-soon-subtext">Currently undergoing final preparations</p>
          </div>
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={getImagePath(villa.images[0])} 
          alt={`${villa.name} - ${villa.type} in ${villa.location}, Costa Rica`}
          className="card-image" loading="lazy"
        />

        {isSelected && (
          <div className="absolute top-3 left-3 bg-luxury-gold text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span></span> SELECTED
          </div>
        )}

        {villa.hasChristmasSpecial && !isSelected && (
          <div className="christmas-special-badge">
            <div className="christmas-badge-offer">
              <span className="offer-text">FREE</span>
              <span className="offer-details">Catamaran Tour (7+ nights)</span>
            </div>
          </div>
        )}
        {villa.hasSpecialOffer && !isSelected && (
          <div className="christmas-special-badge">
            <div className="christmas-badge-header">SPECIAL OFFER</div>
            <div className="christmas-badge-divider"></div>
            <div className="christmas-badge-offer">
              <span className="offer-text">FREE</span>
              <span className="offer-details">ATV Tour</span>
            </div>
          </div>
        )}

        {villa.isPremium && !isSelected && !villa.hasChristmasSpecial && !villa.hasSpecialOffer && (
          <div className="absolute top-3 left-3 bg-luxury-gold text-white px-2 py-1 rounded text-xs font-semibold">
            PREMIUM
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="body-regular text-dark font-medium">{villa.location}</span>
          <div className="rating">
            <span className="body-small">{villa.rating}</span>
          </div>
        </div>

        <h3 className="heading-3 text-dark mb-2">{villa.name}</h3>
        <p className="body-regular text-gray mb-4">{villa.type}</p>

        <div className="flex items-center text-gray mb-4">
          <span className="body-small">{villa.bedrooms} {villa.useEnsuites ? "en-suites" : "bedrooms"}</span>
          <div className="detail-separator"></div>
          <span className="body-small">{villa.bathrooms} bathrooms</span>
          <div className="detail-separator"></div>
          <span className="body-small">{villa.guests} guests</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {villa.topAmenities.map((amenity, index) => (
            <span key={index} className="bg-light text-dark px-2 py-1 rounded body-small">
              {amenity}
            </span>
          ))}
        </div>

        {SHOW_PRICES && villa.pricePerNight && (
          <div className="flex items-baseline gap-1 mb-4">
            <span style={{ fontSize:'0.72rem', fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {villa.pricing?.low === villa.pricing?.high ? '' : 'From '}
            </span>
            <span style={{ fontSize:'1.35rem', fontWeight:700, color:'#111' }}>
              ${villa.pricePerNight.toLocaleString()}
            </span>
            <span style={{ fontSize:'0.8rem', color:'#9ca3af' }}>/night</span>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => onViewDetails(villa)}
            className="btn btn-secondary flex-1"
          >
            View Details
          </button>
          <button 
            onClick={() => onSelect(isSelected ? null : villa)}
            className={`btn flex-1 ${isSelected ? 'btn-success' : 'btn-luxury'}`}
          >
            {isSelected ? '✓ Selected' : 'Select Villa'}
          </button>
        </div>
        <button
          onClick={() => navigate(`/pricing?villa=${encodeURIComponent(villa.name)}`)}
          className="btn btn-secondary w-full mt-2"
          style={{ fontSize: '0.78rem', letterSpacing: '0.06em' }}
        >
          Pricing Guide
        </button>
      </div>
    </div>
  );
};

const VillasSection = ({ selectedVilla, onVillaSelect }) => {
  const navigate = useNavigate();
  const handleViewDetails = (villa) => navigate(`/villa/${villa.slug}`);

  return (
    <section id="villas" className="py-20 bg-light">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="heading-2 text-dark mb-4">
            Discover Our Exclusive Villas
          </h2>
          <p className="body-large text-gray max-w-3xl mx-auto mb-8">
            Hand-selected luxury villas in Costa Rica's most beautiful regions. 
            Each villa offers unique experiences and the highest level of comfort.
          </p>
        </div>
        
        <div className="grid grid-1 lg:grid-2 gap-6">
          {villas.map((villa) => (
            <VillaCard 
              key={villa.id} 
              villa={villa} 
              isSelected={selectedVilla?.id === villa.id}
              onSelect={onVillaSelect}
              onViewDetails={handleViewDetails} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VillasSection;