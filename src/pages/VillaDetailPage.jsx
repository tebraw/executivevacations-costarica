import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import villas from '../data/villas';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BASE_URL = import.meta.env.BASE_URL;
const getImagePath = (path) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
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
  const [lbTouchStartX, setLbTouchStartX] = useState(null);

  const images = villa?.detailImages || villa?.images || [];

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

  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isLightboxOpen]);

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

  const handleSelectVilla = () => {
    navigate('/', { state: { selectVilla: villa.id } });
  };

  const amenities = villa.allAmenities || villa.topAmenities || [];

  return (
    <>
      <Header />

      <main className="min-h-screen" style={{ paddingTop: '80px', background: '#fafaf8' }}>

        {/* Back Button */}
        <div className="container py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors font-medium"
            style={{ color: '#6b7280', fontSize: '0.875rem', letterSpacing: '0.02em' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Villas
          </button>
        </div>

        {/* ── GALLERY ─────────────────────────────────────────────── */}
        <div className="container mb-8">
          <div className="-mx-4 sm:mx-0">
            {/* Main image */}
            <div
              className="relative overflow-hidden sm:rounded-2xl select-none cursor-pointer"
              style={{ aspectRatio: '4/3', maxHeight: '65vh' }}
              onClick={() => openLightbox(currentImageIndex)}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium tracking-wide pointer-events-none">
                {currentImageIndex + 1} / {images.length}
              </div>

              <div
                className="hidden md:flex absolute bottom-3 left-3 items-center gap-1.5 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#111' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                View all {images.length} photos
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center shadow-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.92)' }}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center shadow-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.92)' }}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}

              {images.length > 1 && (
                <>
                  <button className="md:hidden absolute left-0 top-0 h-full w-1/3 z-10" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); }} />
                  <button className="md:hidden absolute right-0 top-0 h-full w-1/3 z-10" aria-label="Next" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); }} />
                </>
              )}
            </div>

            {/* Thumbnails – desktop */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{ width: '72px', aspectRatio: '4/3', opacity: i === currentImageIndex ? 1 : 0.45, outline: i === currentImageIndex ? '2px solid #b8972e' : 'none', outlineOffset: '2px' }}
                  >
                    <img src={getImagePath(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Dots – mobile */}
            {images.length > 1 && (
              <div className="flex md:hidden justify-center gap-1.5 mt-2 px-4">
                {images.slice(0, 12).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="rounded-full transition-all"
                    style={{ background: i === currentImageIndex ? '#1F2937' : '#d1d5db', width: i === currentImageIndex ? '16px' : '6px', height: '6px' }}
                  />
                ))}
                {images.length > 12 && <span style={{ fontSize: '10px', color: '#9ca3af', alignSelf: 'center' }}>+{images.length - 12}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <div className="container pb-16">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 order-2 lg:order-1">

              {/* Badges + Title */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {villa.isPremium && (
                    <span style={{ background: 'linear-gradient(135deg, #c9a227, #e8c84e)', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', padding: '3px 10px', borderRadius: '4px' }}>
                      PREMIUM
                    </span>
                  )}
                  {villa.isComingSoon && (
                    <span style={{ background: '#9ca3af', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', padding: '3px 10px', borderRadius: '4px' }}>
                      AVAILABLE SOON
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, color: '#111', lineHeight: 1.1, marginBottom: '8px' }}>
                  {villa.name}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '12px' }}>{villa.type}</p>
                <div className="flex items-center gap-3 flex-wrap" style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                  <span style={{ color: '#b8972e', fontWeight: 600 }}>★ {villa.rating}</span>
                  <span style={{ color: '#d1d5db' }}>·</span>
                  <span>{villa.fullLocation || villa.location}</span>
                </div>
              </div>

              {/* Stats strip */}
              <div className="mb-8" style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                  {[
                    { value: villa.bedrooms, label: villa.useEnsuites ? 'En-suites' : 'Bedrooms' },
                    { value: villa.bathrooms, label: 'Bathrooms' },
                    { value: villa.guests, label: 'Max Guests' },
                    { value: villa.size || '—', label: 'Property Size', small: true },
                  ].map((stat, i, arr) => (
                    <div key={i} className="text-center" style={{ borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', padding: '0 16px' }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: stat.small ? '1.1rem' : '1.75rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special offer */}
              {villa.hasChristmasSpecial && (
                <div className="mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚢</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem' }}>Complimentary Catamaran Tour</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>Included with reservations of 7 nights or more</div>
                  </div>
                </div>
              )}
              {villa.hasSpecialOffer && (
                <div className="mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏍️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem' }}>Complimentary ATV Tour</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>Exclusive special offer included</div>
                  </div>
                </div>
              )}

              {/* About */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>About this Villa</h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <p style={{ color: '#4b5563', lineHeight: 1.85, fontSize: '0.95rem' }}>
                  {villa.detailedDescription || villa.description || "Experience luxury and comfort in this stunning villa."}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>What this place offers</h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b8972e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                        {typeof amenity === 'string' ? amenity : amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>Location</h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-start gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8972e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111', marginBottom: '8px', fontSize: '0.95rem' }}>{villa.fullLocation || villa.location}</div>
                      <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.875rem' }}>
                        {villa.locationDescription || "Located in one of Costa Rica's most prestigious areas."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – Dark luxury card */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div style={{
                  background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Gold top line */}
                  <div style={{ position: 'absolute', top: 0, left: '32px', right: '32px', height: '2px', background: 'linear-gradient(to right, transparent, #c9a227, transparent)' }} />

                  <div style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Executive Vacations
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px' }}>
                    {villa.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
                    <span style={{ color: '#c9a227', fontSize: '0.8rem' }}>★ {villa.rating}</span>
                    <span style={{ color: '#374151' }}>·</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{villa.location}</span>
                  </div>

                  {[
                    { label: villa.useEnsuites ? 'En-suites' : 'Bedrooms', value: villa.bedrooms },
                    { label: 'Bathrooms', value: villa.bathrooms },
                    { label: 'Max Guests', value: villa.guests },
                    { label: 'Property Size', value: villa.size || '—' },
                    { label: 'Rating', value: `★ ${villa.rating}` },
                  ].map((row, i, arr) => (
                    <div key={i} className="flex justify-between items-center" style={{ padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{row.label}</span>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{row.value}</span>
                    </div>
                  ))}

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />

                  {villa.virtualTour && (
                    <a
                      href={villa.virtualTour}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full"
                      style={{ border: '1px solid rgba(201,162,39,0.5)', borderRadius: '10px', padding: '12px', color: '#c9a227', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase', marginBottom: '12px', transition: 'all 0.2s' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      Virtual 3D Tour
                    </a>
                  )}

                  <button
                    onClick={handleSelectVilla}
                    className="w-full flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #c9a227, #e8c84e)', borderRadius: '10px', padding: '14px', color: '#111', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z"/>
                    </svg>
                    Inquire &amp; Reserve
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-5">
                    {['Instant Response', 'No Fees', 'Private'].map((badge) => (
                      <div key={badge} className="flex items-center gap-1" style={{ color: '#6b7280', fontSize: '10px' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* ── LIGHTBOX ─────────────────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.95)' }}
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={(e) => setLbTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (lbTouchStartX === null) return;
            const diff = lbTouchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
              if (diff > 0) setLightboxImageIndex((p) => (p + 1) % images.length);
              else setLightboxImageIndex((p) => (p - 1 + images.length) % images.length);
            }
            setLbTouchStartX(null);
          }}
        >
          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '5px 14px', borderRadius: '999px', fontSize: '13px', zIndex: 10 }}>
            {lightboxImageIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <div style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            {/* Mobile: 4:3 */}
            <img
              src={getImagePath(images[lightboxImageIndex])}
              alt={`${villa.name} - ${lightboxImageIndex + 1}`}
              className="block md:hidden rounded-xl"
              style={{ width: '90vw', aspectRatio: '4/3', objectFit: 'cover' }}
              draggable={false}
            />
            {/* Desktop: natural proportions */}
            <img
              src={getImagePath(images[lightboxImageIndex])}
              alt={`${villa.name} - ${lightboxImageIndex + 1}`}
              className="hidden md:block rounded-xl"
              style={{ maxWidth: '88vw', maxHeight: '88vh', width: 'auto', height: 'auto', objectFit: 'contain' }}
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImageIndex((p) => (p - 1 + images.length) % images.length); }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center"
                style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 10 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxImageIndex((p) => (p + 1) % images.length); }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center"
                style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 10 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VillaDetailPage;
