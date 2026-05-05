import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import villas from '../data/villas';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BASE_URL = import.meta.env.BASE_URL;
// Use absolute path: on nested routes like /villa/:slug, relative BASE_URL (./)
// would resolve incorrectly, so we always use an absolute path here.
const getImagePath = (path) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  // If BASE_URL is an absolute path (e.g. '/subdir/') use it, otherwise use root
  if (BASE_URL && BASE_URL !== './' && BASE_URL !== '.') {
    return `${BASE_URL.replace(/\/$/, '')}${clean}`;
  }
  return clean;
};

const VillaDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const villa = villas.find((v) => v.slug === slug);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentImageIndex((p) => (p + 1) % images.length);
      else setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);
    }
    setTouchStartX(null);
  };

  const images = villa?.detailImages || villa?.images || [];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setLightboxImageIndex((p) => (p + 1) % images.length);
      if (e.key === 'ArrowLeft') setLightboxImageIndex((p) => (p - 1 + images.length) % images.length);
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!villa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="heading-3 text-gray mb-4">Villa not found.</p>
        <Link to="/" className="btn btn-luxury">Back to Home</Link>
      </div>
    );
  }

  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleSelectVilla = () => {
    // Navigate home and scroll to contact/booking section
    navigate('/', { state: { selectVilla: villa.id } });
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white" style={{ paddingTop: '80px' }}>
        {/* Back Button */}
        <div className="container py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray hover:text-dark transition-colors font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Villas
          </button>
        </div>

        {/* Hero Image Gallery */}
        <div className="container mb-6">
          <div className="-mx-4 sm:mx-0">
          {/* Main image — 4:3 on mobile (edge-to-edge), capped on desktop */}
          <div
            className="relative overflow-hidden sm:rounded-2xl select-none"
            style={{ aspectRatio: '4/3', maxHeight: '62vh' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={currentImageIndex}
              src={getImagePath(images[currentImageIndex])}
              alt={`${villa.name} - photo ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              draggable={false}
            />

            {/* Subtle bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Counter pill */}
            <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium tracking-wide">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* View all photos — desktop only */}
            <button
              onClick={() => openLightbox(currentImageIndex)}
              className="hidden md:flex absolute bottom-3 left-3 bg-white/90 hover:bg-white text-dark px-3 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 transition-all shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              View all photos
            </button>

            {/* Desktop prev/next arrows — only show on desktop */}
            {images.length > 1 && (
              <>
                <button
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-105"
                  onClick={() => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-105"
                  onClick={() => setCurrentImageIndex((p) => (p + 1) % images.length)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}

            {/* Mobile tap zones (invisible) for prev/next */}
            {images.length > 1 && (
              <>
                <button
                  className="md:hidden absolute left-0 top-0 h-full w-1/3"
                  aria-label="Previous"
                  onClick={() => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)}
                />
                <button
                  className="md:hidden absolute right-0 top-0 h-full w-1/3"
                  aria-label="Next"
                  onClick={() => setCurrentImageIndex((p) => (p + 1) % images.length)}
                />
              </>
            )}
          </div>

          {/* Thumbnail strip — desktop only */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-2 mt-3 overflow-x-auto pb-1 px-0" style={{ scrollbarWidth: 'thin' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`flex-shrink-0 w-20 rounded-lg overflow-hidden transition-all ${
                    i === currentImageIndex
                      ? 'ring-2 ring-offset-1 ring-luxury-gold opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{ aspectRatio: '4/3' }}
                >
                  <img src={getImagePath(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Mobile dot indicators */}
          {images.length > 1 && (
            <div className="flex md:hidden justify-center gap-1.5 mt-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-dark w-4 h-1.5' : 'bg-gray-300 w-1.5 h-1.5'
                  }`}
                />
              ))}
            </div>
          )}
          </div>{/* end -mx-4 sm:mx-0 */}
        </div>{/* end container */}

        {/* Main Content */}
        <div className="container pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Main Info */}
            <div className="lg:col-span-2">
              {/* Title & Rating */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {villa.isPremium && (
                    <span className="bg-luxury-gold text-white px-2 py-0.5 rounded text-xs font-semibold">PREMIUM</span>
                  )}
                  {villa.isComingSoon && (
                    <span className="bg-gray-400 text-white px-2 py-0.5 rounded text-xs font-semibold">AVAILABLE SOON</span>
                  )}
                </div>
                <h1 className="heading-1 text-dark mb-1">{villa.name}</h1>
                <p className="body-large text-gray mb-2">{villa.type}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-dark">
                    ★ {villa.rating}
                  </span>
                  <span className="text-gray">·</span>
                  <span className="text-gray">{villa.fullLocation || villa.location}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="bg-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-dark">{villa.bedrooms}</div>
                  <div className="body-small text-gray">{villa.useEnsuites ? 'En-suites' : 'Bedrooms'}</div>
                </div>
                <div className="bg-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-dark">{villa.bathrooms}</div>
                  <div className="body-small text-gray">Bathrooms</div>
                </div>
                <div className="bg-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-dark">{villa.guests}</div>
                  <div className="body-small text-gray">Guests</div>
                </div>
                <div className="bg-light rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-dark">{villa.size || '—'}</div>
                  <div className="body-small text-gray">Size</div>
                </div>
              </div>

              {/* Special offer banners */}
              {villa.hasChristmasSpecial && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <span className="text-2xl">🚢</span>
                  <div>
                    <div className="font-semibold text-dark">FREE Catamaran Tour</div>
                    <div className="body-small text-gray">Included with 7+ night bookings</div>
                  </div>
                </div>
              )}
              {villa.hasSpecialOffer && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <span className="text-2xl">🏍️</span>
                  <div>
                    <div className="font-semibold text-dark">FREE ATV Tour</div>
                    <div className="body-small text-gray">Special offer included</div>
                  </div>
                </div>
              )}

              {/* About this villa */}
              <div className="mb-8">
                <h2 className="heading-3 text-dark mb-3">About this Villa</h2>
                <p className="body-regular text-gray leading-relaxed">
                  {villa.detailedDescription || villa.description || "Experience luxury and comfort in this stunning villa."}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="heading-3 text-dark mb-4">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(villa.allAmenities || villa.topAmenities || []).map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                      <span className="body-regular text-gray">
                        {typeof amenity === 'string' ? amenity : amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h2 className="heading-3 text-dark mb-3">Location</h2>
                <div className="bg-light rounded-xl p-4 md:p-6">
                  <p className="font-semibold text-dark mb-2">{villa.fullLocation || villa.location}</p>
                  <p className="body-regular text-gray leading-relaxed">
                    {villa.locationDescription || "Located in one of Costa Rica's most prestigious areas."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-lg lg:sticky lg:top-24">
                <h3 className="heading-3 mb-4">Villa Details</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray">{villa.useEnsuites ? 'En-suites' : 'Bedrooms'}</span>
                    <span className="text-dark font-semibold">{villa.bedrooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray">Bathrooms</span>
                    <span className="text-dark font-semibold">{villa.bathrooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray">Max Guests</span>
                    <span className="text-dark font-semibold">{villa.guests}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray">Size</span>
                    <span className="text-dark font-semibold">{villa.size || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray">Rating</span>
                    <span className="text-dark font-semibold">★ {villa.rating}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {villa.virtualTour && (
                    <a
                      href={villa.virtualTour}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      Virtual 3D Tour
                    </a>
                  )}
                  <button onClick={handleSelectVilla} className="btn btn-luxury w-full">
                    Select Villa & Inquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm">
            {lightboxImageIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <img
            src={getImagePath(images[lightboxImageIndex])}
            alt={`${villa.name} - ${lightboxImageIndex + 1}`}
            style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
            className="object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImageIndex((p) => (p - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImageIndex((p) => (p + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white border border-white/20 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VillaDetailPage;
