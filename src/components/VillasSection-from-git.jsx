import React, { useState } from 'react';
import VillaDetailModal from './VillaDetailModal';

// Christmas + New Year Special Badge enabled
// Get the base URL from Vite config for proper GitHub Pages paths
const BASE_URL = import.meta.env.BASE_URL;
const getImagePath = (path) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

const VillaCard = ({ villa, isSelected, onSelect, onViewDetails }) => {

  return (
    <div className={`card group ${isSelected ? 'ring-2 ring-luxury-gold' : ''} ${villa.isComingSoon ? 'coming-soon-card' : ''}`}>
      {/* Coming Soon Overlay - Set villa.isComingSoon to false to remove */}
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
      
      {/* Single Display Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={getImagePath(villa.images[0])} 
          alt={villa.name}
          className="card-image"
        />
        
        

        

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-luxury-gold text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span>Ô£ô</span> SELECTED
          </div>
        )}

        {/* Christmas Special Badge */}
        {villa.hasChristmasSpecial && !isSelected && (
          <div className="christmas-special-badge">
            <div className="christmas-badge-header">CHRISTMAS + NEW YEAR SPECIAL</div>
            <div className="christmas-badge-divider"></div>
            <div className="christmas-badge-offer">
              <span className="offer-text">FREE</span>
              <span className="offer-details">ATV + Catamaran Tours (7+ nights)</span>
            </div>
          </div>
        )}

        {/* Premium Badge */}
        {villa.isPremium && !isSelected && !villa.hasChristmasSpecial && (
          <div className="absolute top-3 left-3 bg-luxury-gold text-white px-2 py-1 rounded text-xs font-semibold">
            PREMIUM
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location and Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="body-regular text-dark font-medium">{villa.location}</span>
          <div className="rating">
            <span className="body-small">Ôÿà {villa.rating}</span>
          </div>
        </div>

        {/* Villa Name */}
        <h3 className="heading-3 text-dark mb-2">{villa.name}</h3>

        {/* Villa Type */}
        <p className="body-regular text-gray mb-4">{villa.type}</p>

        {/* Villa Details */}
        <div className="flex items-center text-gray mb-4">
          <span className="body-small">{villa.bedrooms} bedrooms</span>
          <div className="detail-separator"></div>
          <span className="body-small">{villa.bathrooms} bathrooms</span>
          <div className="detail-separator"></div>
          <span className="body-small">{villa.guests} guests</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {villa.topAmenities.map((amenity, index) => (
            <span 
              key={index}
              className="bg-light text-dark px-2 py-1 rounded body-small"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => onViewDetails(villa)}
            className="btn btn-secondary flex-1"
          >
            View Details
          </button>
          <button 
            onClick={() => onSelect(villa)}
            className={`btn flex-1 ${isSelected ? 'btn-success' : 'btn-luxury'}`}
          >
            {isSelected ? 'Ô£ô Selected' : 'Select Villa'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VillasSection = ({ selectedVilla, onVillaSelect }) => {
  const [detailVilla, setDetailVilla] = useState(null);
  
  const villas = [
    {
      id: 2,
      name: "Palacio Tropical",
      type: "Ultra-Luxury Oceanfront Villa",
      location: "Tambor, Puntarenas - Tango Mar",
      fullLocation: "Tambor, Puntarenas - Tango Mar, Costa Rica",
      rating: 4.98,
      bedrooms: 7,
      bathrooms: 10,
      guests: 18,
      size: "10,500 sq ft",
      isPremium: true,
      hasChristmasSpecial: true,
      images: [
        "/images/villas/palacio-tropical/palaciotropical-469.exterior_1.jpg",
        "/images/villas/palacio-tropical/palaciotropical.dronephoto-03.jpg",
        "/images/villas/palacio-tropical/palaciotropical-518.exterior.jpg"
      ],
      detailImages: ["/images/villas/palacio-tropical/palaciotropical.dronephoto-03.jpg", "/images/villas/palacio-tropical/palaciotropical.dronephoto-08.jpg", "/images/villas/palacio-tropical/palaciotropical-008.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-014.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-021.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-049.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-056.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-063.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-1.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-105.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-167.mainfloor.jpg", "/images/villas/palacio-tropical/palaciotropical-201.floor2.jpg", "/images/villas/palacio-tropical/palaciotropical-236.floor2.jpg", "/images/villas/palacio-tropical/palaciotropical-250.floor2.jpg", "/images/villas/palacio-tropical/palaciotropical-320.floor2.jpg", "/images/villas/palacio-tropical/palaciotropical-327.floor3.jpg", "/images/villas/palacio-tropical/palaciotropical-386.basement (1).jpg", "/images/villas/palacio-tropical/palaciotropical-393.basement.jpg", "/images/villas/palacio-tropical/palaciotropical-435.basement.jpg", "/images/villas/palacio-tropical/palaciotropical-455.exterior_1.jpg", "/images/villas/palacio-tropical/palaciotropical-469.exterior_1.jpg", "/images/villas/palacio-tropical/palaciotropical-518.exterior.jpg", "/images/villas/palacio-tropical/palaciotropical-532.exterior.jpg", "/images/villas/palacio-tropical/palaciotropical-567.exterior.jpg", "/images/villas/palacio-tropical/palaciotropical-580.exterior.jpg"],
      topAmenities: ["Private Beach", "Full Staff", "Security", "Ocean Views"],
      allAmenities: [
        { name: "Private Oceanfront Beach", icon: "fa-umbrella-beach" },
        { name: "Full Staff Available", icon: "fa-concierge-bell" },
        { name: "Enhanced Security", icon: "fa-shield-alt" },
        { name: "Ocean Views", icon: "fa-water" },
        { name: "7 En-suite Bedrooms", icon: "fa-bed" },
        { name: "Grand Dining Room (14 seats)", icon: "fa-utensils" },
        { name: "Outside Bar & Dining", icon: "fa-glass-cheers" },
        { name: "Large Swimming Pool", icon: "fa-swimming-pool" },
        { name: "Airport Pickup Service", icon: "fa-plane" },
        { name: "Concierge Services", icon: "fa-phone" },
        { name: "VIP Privacy Protection", icon: "fa-user-shield" },
        { name: "Separate Security Quarters", icon: "fa-home" }
      ],
      detailedDescription: "Experience private luxury throughout this stunning 10,500 sq ft oceanfront villa. Featuring 7 en-suites, each with private bath and A/C, plus a grand dining room seating 14. Multiple large gathering areas open to an outside bar, dining area, and large pool. Safe and private for traveling dignitaries, officials, and politicians. The house can be fully staffed with cooks, housekeeping, and concierge service for outings and excursions. Located directly next to Palacio Musical, both properties can be booked together for larger events and groups. Palacio Tropical offers an unforgettable oceanfront experience with complete privacy and security.",
      locationDescription: "Located in an isolated and pristine area of Tambor, Costa Rica. Perfect for privacy and safety for public officials, dignitaries, and those requiring discretion. The grounds and private beach allow you to enjoy family and guests without unwanted attention from media or paparazzi. Situated directly next to Palacio Musical - both villas can be combined for ultimate luxury accommodation.",
      specialFeatures: [
        { name: "VIP Privacy & Security", icon: "fa-user-shield" },
        { name: "Full Staff Service", icon: "fa-concierge-bell" },
        { name: "Airport Transfer Service", icon: "fa-plane" }
      ]
    },
    {
      id: 4,
      name: "Palacio Musical",
      type: "Exclusive Beachfront Villa",
      location: "Tambor, Puntarenas - Tango Mar",
      fullLocation: "Tambor, Puntarenas - Tango Mar, Costa Rica",
      rating: 4.97,
      bedrooms: 7,
      bathrooms: 6,
      guests: 18,
      size: "12,500 sq ft",
      isPremium: true,
      hasChristmasSpecial: true,
      isComingSoon: false, // Set to false when available for booking
      images: ["/images/villas/Palacio-musical/98986715.jpg"],
      detailImages: ["/images/villas/Palacio-musical/+Cuarto 3 DSC_3345.jpg", "/images/villas/Palacio-musical/+Pacifica_DSC_4756 (1).jpg", "/images/villas/Palacio-musical/198134112.jpg", "/images/villas/Palacio-musical/98984225.jpg", "/images/villas/Palacio-musical/98986715.jpg", "/images/villas/Palacio-musical/98990146.jpg", "/images/villas/Palacio-musical/99010031.jpg", "/images/villas/Palacio-musical/99498420.jpg", "/images/villas/Palacio-musical/Pacifica_DSC_4188.JPG"],
      topAmenities: ["Music Studio", "Newly Renovated", "Ocean Views", "Full Staff"],
      allAmenities: [
        { name: "Professional Music Studio", icon: "fa-music" },
        { name: "Newly Renovated", icon: "fa-tools" },
        { name: "Ocean Views", icon: "fa-water" },
        { name: "Full Staff Available", icon: "fa-concierge-bell" },
        { name: "Similar Size to Tropical", icon: "fa-home" },
        { name: "Modern Amenities", icon: "fa-star" },
        { name: "Private Beach Access", icon: "fa-umbrella-beach" },
        { name: "Enhanced Security", icon: "fa-shield-alt" },
        { name: "Next to Palacio Tropical", icon: "fa-map-marker-alt" },
        { name: "Combinable Booking", icon: "fa-link" }
      ],
      detailedDescription: "Experience the ultimate beachfront luxury in this spectacular 12,500 sq ft villa featuring three magnificent decks, each offering breathtaking ocean views. The property includes a unique whale watching observatory - perfect for spotting humpback whales during migration season. With its stunning architecture and expansive outdoor spaces, this villa is ideal for weddings, celebrations, and special events. The three-level deck system provides versatile entertainment areas, from intimate gatherings to grand celebrations. Located directly next to Palacio Tropical, both villas can be combined for the ultimate luxury experience, accommodating large groups and multi-family vacations.",
      locationDescription: "Situated directly next to Palacio Tropical in the pristine area of Tambor, Costa Rica. Both properties can be combined for the ultimate luxury experience, offering unparalleled privacy and space.",
      specialFeatures: [
        { name: "Professional Music Studio", icon: "fa-music" },
        { name: "Newly Renovated", icon: "fa-tools" },
        { name: "Combinable with Palacio Tropical", icon: "fa-link" }
      ]
    },
    {
      id: 3,
      name: "The View House",
      type: "Newly Built Pacific Ocean Villa",
      location: "Tambor, Puntarenas - Tango Mar",
      fullLocation: "Tambor, Puntarenas - Tango Mar, Costa Rica",
      rating: 4.96,
      bedrooms: 4,
      bathrooms: 2,
      guests: 8,
      size: "2,400 sq ft",
      isPremium: true,
      images: ["/images/villas/the-view-house/d9555571cd99-3bbc-41d2-900f-8372442d68a9.avif"],
      detailImages: ["/images/villas/the-view-house/25d56bc7-19f0-4a97-b056-f39312120697.avif", "/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif", "/images/villas/the-view-house/3c3b16b7-77de-4fdb-97e7-cd4e5d2f533d.avif", "/images/villas/the-view-house/9bcd8e7b-6d80-4b65-b878-68835b7b243b.avif", "/images/villas/the-view-house/caee2b00-03a2-438e-981c-8d98e57f6d43.avif", "/images/villas/the-view-house/d9555571cd99-3bbc-41d2-900f-8372442d68a9.avif", "/images/villas/the-view-house/d971cd99-3bbc-41d2-900f-8372442d68a9.avif", "/images/villas/the-view-house/f24aa4e9-2615-4491-b70c-90c87f804686.avif"],
      topAmenities: ["Pacific Views", "Custom Pool", "New Construction", "Peaceful Setting"],
      allAmenities: [
        { name: "Pacific Ocean Views", icon: "fa-water" },
        { name: "Custom Designed Pool", icon: "fa-swimming-pool" },
        { name: "Newly Built Villa", icon: "fa-home" },
        { name: "Peaceful & Stylish", icon: "fa-leaf" },
        { name: "4 Comfortable Bedrooms", icon: "fa-bed" },
        { name: "Modern Amenities", icon: "fa-star" },
        { name: "5 Min to Palacio Villas", icon: "fa-map-marker-alt" },
        { name: "Group Booking Available", icon: "fa-users" }
      ],
      detailedDescription: "Lean back and relax in this peaceful, stylish accommodation with magnificent Pacific Ocean views and a beautiful, custom-designed swimming pool. This newly constructed 2,400 sq ft villa offers modern luxury and comfort in a tranquil setting, with spectacular opportunities for whale watching from your private terrace. Witness humpback whales during migration season while enjoying panoramic ocean vistas. With 4 bedrooms and contemporary amenities, it's perfect for families or nature lovers seeking a serene getaway. Located just 5 minutes from Palacio Tropical and Palacio Musical, it can be booked together with these properties for larger groups or events.",
      locationDescription: "Located in Puntarenas Province with stunning Pacific Ocean views. Just 5 minutes from Palacio Tropical and Palacio Musical villas, perfect for combined bookings and group events.",
      specialFeatures: [
        { name: "Newly Constructed", icon: "fa-hammer" },
        { name: "Custom Pool Design", icon: "fa-swimming-pool" },
        { name: "Combinable with Palacio Villas", icon: "fa-link" }
      ]
    },
    {
      id: 1,
      name: "The Palms Villa Estate",
      type: "Mountain Villa Retreat",
      location: "Atenas",
      fullLocation: "Santa Eulalia, Atenas, Costa Rica",
      rating: 4.95,
      bedrooms: 4,
      bathrooms: 3.5,
      guests: 8,
      size: "4,700 sq ft",
      isPremium: true,
      images: ["/images/villas/the-palms-villa-estate/5c47af67-d690-42e8-ae02-7e8011fc52ed.avif"],
      detailImages: ["/images/villas/the-palms-villa-estate/12438d67-cf43-4bfe-bf7d-07244f3301dc.webp", "/images/villas/the-palms-villa-estate/2eedf0e6-1325-4143-bfc6-a6abae26f1ef.avif", "/images/villas/the-palms-villa-estate/3010682d-f127-4ff9-b647-099323082072.jpeg", "/images/villas/the-palms-villa-estate/30e39a33-4457-4f91-be63-2c9c0fcdb863.jpeg", "/images/villas/the-palms-villa-estate/31f4ba1b-839f-4f90-83ff-9c6dfe7e0c8b.avif", "/images/villas/the-palms-villa-estate/4.Aerial-4.jpeg", "/images/villas/the-palms-villa-estate/4e674d32-d726-4169-84ae-555f037c13b0.jpeg", "/images/villas/the-palms-villa-estate/56.Aerial-9.jpeg", "/images/villas/the-palms-villa-estate/573860c1-ba80-4638-a8b4-bf0375b57abf.avif", "/images/villas/the-palms-villa-estate/5c47af67-d690-42e8-ae02-7e8011fc52ed.avif", "/images/villas/the-palms-villa-estate/6.Aerial-5.jpeg", "/images/villas/the-palms-villa-estate/910cba2e-cbaf-41f4-a725-57ddbebf7ac1.jpeg", "/images/villas/the-palms-villa-estate/c2de55f9-02b9-464b-9966-ae056fcee665.avif", "/images/villas/the-palms-villa-estate/f9aafc09-ec54-4b03-a21b-a4d799f059c1.jpeg", "/images/villas/the-palms-villa-estate/IMG_0194.jpeg", "/images/villas/the-palms-villa-estate/IMG_0224.jpeg", "/images/villas/the-palms-villa-estate/IMG_1718.jpeg", "/images/villas/the-palms-villa-estate/IMG_7170.jpeg", "/images/villas/the-palms-villa-estate/IMG_9888.jpeg", "/images/villas/the-palms-villa-estate/IMG_9951.jpeg"],
      topAmenities: ["Private Pool", "Mountain Views", "Full-time Caretaker", "Air Conditioning"],
      allAmenities: [
        { name: "Private Tennis Court", icon: "fa-table-tennis" },
        { name: "Private Pool", icon: "fa-swimming-pool" },
        { name: "Mountain Views", icon: "fa-mountain" },
        { name: "Full-time Caretaker", icon: "fa-user-tie" },
        { name: "Air Conditioning", icon: "fa-snowflake" },
        { name: "Resort-style Grounds", icon: "fa-tree" },
        { name: "Peaceful Setting", icon: "fa-leaf" },
        { name: "32 Miles to Beach", icon: "fa-umbrella-beach" },
        { name: "Cultural Experience", icon: "fa-heart" },
        { name: "Family Friendly", icon: "fa-home" },
        { name: "Event Hosting", icon: "fa-calendar" }
      ],
      detailedDescription: "This beautiful mountain villa is nestled in the hills of Atenas, Costa Rica. Atenas offers a wonderful opportunity to experience authentic Costa Rican culture, known as a local favorite. The property provides a tranquil, peaceful, and quiet environment perfect for family vacations, intimate weddings, reunions, or personal and business retreats. With 4 bedrooms (3 upstairs with full AC, 1 downstairs), the villa accommodates up to 8 guests comfortably. Additional sleeping options include a queen pull-out sofa and futon.",
      locationDescription: "Located in the hills of Atenas, just 32 miles from the nearest beach and marina on the Pacific coast. Experience authentic Costa Rican culture while staying close to all the adventures Costa Rica offers.",
      specialFeatures: [
        { name: "Full-time Caretaker (Don Manuel)", icon: "fa-user-tie" },
        { name: "Resort-style Grounds", icon: "fa-tree" },
        { name: "Perfect for Events", icon: "fa-calendar" }
      ]
    }
  ];

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
              onViewDetails={setDetailVilla} 
            />
          ))}
        </div>

        {/* Villa Detail Modal */}
        <VillaDetailModal 
          villa={detailVilla}
          isOpen={!!detailVilla}
          onClose={() => setDetailVilla(null)}
          onContactClick={() => {
            setDetailVilla(null);
          }}
        />
      </div>
    </section>
  );
};

export default VillasSection;
