import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WeddingContactFormSection from '../components/WeddingContactFormSection';
import { getSiteBrand } from '../utils/siteBrand';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';
const BRAND_BLUE = '#12203a';
const HERO_BAR_WIDTH = 'clamp(360px, 46vw, 680px)';

// Image paths - just drop files in public/images/weddings/ with these names
const IMG = {
  hero:        '/images/weddings/hero.jpg',
  ceremony:    '/images/weddings/ceremony.jpg',
  dinner:      '/images/weddings/dinner.jpg',
  catamaran:   '/images/weddings/catamaran.jpg',
  aerial:      '/images/weddings/estate-aerial.jpg',
  venue: [
    '/images/weddings/venue-1.jpg',
    '/images/weddings/venue-2.jpg',
    '/images/weddings/venue-3.jpg',
    '/images/weddings/venue-4.jpg',
    '/images/weddings/venue-5.jpg',
    '/images/weddings/venue-6.jpg',
    '/images/weddings/venue-7.jpg',
  ],
  gallery: [
    '/images/weddings/gallery-1.jpg',
    '/images/weddings/gallery-2.jpg',
    '/images/weddings/gallery-3.jpg',
    '/images/weddings/gallery-4.jpg',
    '/images/weddings/gallery-5.jpg',
    '/images/weddings/gallery-6.jpg',
    '/images/weddings/gallery-7.jpg',
    '/images/weddings/gallery-8.jpg',
    '/images/weddings/gallery-9.jpg',
    '/images/weddings/gallery-10.jpg',
    '/images/weddings/gallery-11.jpg',
    '/images/weddings/gallery-12.jpg',
    '/images/weddings/gallery-13.jpg',
    '/images/weddings/gallery-16.jpg',
    '/images/weddings/gallery-17.jpg',
    '/images/weddings/gallery-18.jpg',
    '/images/weddings/gallery-19.jpg',
    '/images/weddings/gallery-20.jpg',
    '/images/weddings/gallery-21.jpg',
    '/images/weddings/gallery-22.jpg',
    '/images/weddings/gallery-23.jpg',
    '/images/weddings/gallery-24.jpg',
    '/images/weddings/gallery-25.jpg',
    '/images/weddings/gallery-26.jpg',
  ],
};

// Fallback gradient colours when an image isn't there yet
const FALLBACKS = {
  hero:      'linear-gradient(160deg, #0b1120 0%, #12203a 55%, #1a2e1a 100%)',
  ceremony:  'linear-gradient(135deg, #1a2e1a, #0f172a)',
  dinner:    'linear-gradient(135deg, #0f172a, #1e1a0f)',
  catamaran: 'linear-gradient(135deg, #0b2030, #0f1b2e)',
  aerial:    'linear-gradient(135deg, #111827, #1a2e1a)',
};

// Wrapper that falls back gracefully if the image file doesn't exist yet
function BgImage({ src, fallback, style, children, className }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    const img = new Image();
    img.onload  = () => setLoaded(true);
    img.onerror = () => setErrored(true);
    img.src = src;
  }, [src]);

  const bg = loaded && !errored
    ? `url("${src}")`
    : fallback;

  return (
    <div
      className={className}
      style={{
        backgroundImage: bg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Single gallery tile — Instagram-style square with hover overlay
function GalleryTile({ src, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', aspectRatio: '1 / 1', cursor: 'pointer', overflow: 'hidden', background: '#0f172a' }}
    >
      <img
        src={src}
        alt={`Wedding photo ${index + 1}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      </div>
    </div>
  );
}

export default function Weddings() {
  const brand = getSiteBrand();
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${brand.tagline} | ${brand.fullName}`;
    const setMeta = (name, content, prop) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Host your dream destination wedding in Costa Rica. Secluded beachfront estates with private access to the beach, ceremony on the sand, private chefs, full staff, and a free catamaran tour included.');
    setMeta('og:title', `${brand.tagline} | ${brand.fullName}`, true);
    setMeta('og:url', 'https://executivevacations.net/weddings', true);
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => i !== null ? Math.min(i + 1, IMG.gallery.length - 1) : i);
      if (e.key === 'ArrowLeft')  setLightboxIdx(i => i !== null ? Math.max(i - 1, 0) : i);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ background: '#0b0f18', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <Header />
      {/* Cross-CTA Banner: Looking for a Vacation? */}
      {false && brand.key === 'wedding' && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: 'clamp(24px, 5vw, 48px)',
          borderTop: '2px solid #b8972e',
          borderBottom: '2px solid #b8972e',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              textAlign: 'center',
            }}>
              <div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#b8972e',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>
                  Explore More
                </p>
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                  color: '#fff',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                  Looking for a Luxury Vacation?
                </h3>
              </div>
              <a href={brand.villasHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
                  background: 'linear-gradient(135deg, #c9a96e, #a07040)',
                  color: '#fff',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(184,151,46,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,151,46,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,151,46,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Explore Villas →
              </a>
            </div>
          </div>
        </div>
      )}
      {/* ── FULL-SCREEN HERO ─────────────────────────────────── */}
      <BgImage
        src={IMG.hero}
        fallback={FALLBACKS.hero}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundPosition: '-260px center',
          backgroundSize: 'cover',
        }}
      >
        {/* dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)',
        }} />
        {/* full-height right brand bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: HERO_BAR_WIDTH,
          background: BRAND_BLUE,
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: HERO_BAR_WIDTH,
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            textAlign: 'left',
            padding: '0 clamp(24px, 3vw, 44px) clamp(100px, 10vh, 140px) clamp(22px, 2.8vw, 36px)',
            borderLeft: `4px solid ${GOLD_LIGHT}`,
          }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
              {brand.fullName}
            </p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(2.2rem, 4.4vw, 5.1rem)', color: '#fff', lineHeight: 1.0, marginBottom: '24px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              Your Wedding.<br />
              <span style={{ color: GOLD_LIGHT, fontStyle: 'italic' }}>Your Way.</span><br />
              On the Pacific.
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.84)', lineHeight: 1.75, margin: '0 0 34px 0', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              Secluded beachfront estates with private access to the beach. Ceremony on the sand.
              Full staff, private chefs &mdash; everything your planner needs in one place.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            <a href="#venue" style={{
              display: 'inline-block', padding: '16px 38px',
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
              borderRadius: '50px', color: '#fff', fontWeight: 700,
              fontSize: '0.95rem', textDecoration: 'none',
              boxShadow: '0 6px 28px rgba(184,151,46,0.4)',
              letterSpacing: '0.02em',
            }}>
              Explore the Venue
            </a>
            <a href={brand.pricingHref} style={{
              display: 'inline-block', padding: '16px 38px',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50px', color: '#fff', fontWeight: 600,
              fontSize: '0.95rem', textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              {brand.pricingLabel}
            </a>
            </div>
          </div>
        </div>
      </BgImage>

      {/* Cross-CTA Banner: Looking for a Vacation? */}
      {brand.key === 'wedding' && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: 'clamp(24px, 5vw, 48px)',
          borderTop: '2px solid #b8972e',
          borderBottom: '2px solid #b8972e',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              textAlign: 'center',
            }}>
              <div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#b8972e',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}>
                  Explore More
                </p>
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                  color: '#fff',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                  Looking for a Luxury Vacation?
                </h3>
              </div>
              <a href={brand.villasHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
                  background: 'linear-gradient(135deg, #c9a96e, #a07040)',
                  color: '#fff',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(184,151,46,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,151,46,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,151,46,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Explore Villas →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── SCROLL INDICATOR ─────────────────────────────────── */}
      <div style={{ background: '#0b0f18', padding: '0' }}>

      {/* ── SPLIT: CEREMONY ──────────────────────────────────── */}
      <div id="venue" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', minHeight: '560px' }}>
        <BgImage
          src={IMG.ceremony}
          fallback={FALLBACKS.ceremony}
          style={{ minHeight: '420px' }}
        >
          <div style={{ width: '100%', height: '100%', minHeight: '420px', background: 'rgba(0,0,0,0.2)' }} />
        </BgImage>
        <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', padding: 'clamp(48px,6vw,80px) clamp(32px,5vw,72px)' }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
              The Ceremony
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#fff', lineHeight: 1.15, marginBottom: '20px' }}>
              Vows on the Sand.<br />Ocean in Front of You.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.85, marginBottom: '28px' }}>
              Exchange your vows directly on the beach with the Pacific stretching to the horizon. Completely open-air, highly secluded, and unforgettable. No ballroom. A natural oceanfront setting for you and your guests.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Up to 150 ceremony guests', 'Open-air beach setting', 'Fully private & secure'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD_LIGHT, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SPLIT: DINNER (reversed) ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', minHeight: '560px' }}>
        <div style={{ background: '#111827', display: 'flex', alignItems: 'center', padding: 'clamp(48px,6vw,80px) clamp(32px,5vw,72px)', order: 0 }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
              The Reception
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#fff', lineHeight: 1.15, marginBottom: '20px' }}>
              Dinner on the Decks.<br />Under the Stars.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.85, marginBottom: '28px' }}>
              After the ceremony, move straight onto the ocean-view decks of Palacio Musical. Our private chefs serve a multi-course dinner while the sun sets over the Pacific. Up to 150 seated guests. Every detail is handled by our team.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Up to 150 seated dinner guests', 'Private chefs & full catering', 'Three ocean-view decks'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD_LIGHT, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BgImage
          src={IMG.dinner}
          fallback={FALLBACKS.dinner}
          style={{ minHeight: '420px', order: 1 }}
        >
          <div style={{ width: '100%', height: '100%', minHeight: '420px', background: 'rgba(0,0,0,0.15)' }} />
        </BgImage>
      </div>

      {/* ── SPLIT: CATAMARAN ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', minHeight: '560px' }}>
        <BgImage
          src={IMG.catamaran}
          fallback={FALLBACKS.catamaran}
          style={{ minHeight: '420px' }}
        >
          <div style={{ width: '100%', height: '100%', minHeight: '420px', background: 'rgba(0,0,0,0.15)' }} />
        </BgImage>
        <div style={{ background: '#0b1120', display: 'flex', alignItems: 'center', padding: 'clamp(48px,6vw,80px) clamp(32px,5vw,72px)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD_LIGHT }} />
              <span style={{ color: GOLD_LIGHT, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Included Free</span>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#fff', lineHeight: 1.15, marginBottom: '20px' }}>
              Private Catamaran.<br />On Us.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.85, marginBottom: '28px' }}>
              Book any villa for 7 nights or more and a private catamaran tour is included at no charge. Sail to Playa Muertos, snorkel, enjoy cocktails on deck and return at sunset. The perfect rehearsal dinner &mdash; or just a day for your guests to remember.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Private catamaran, fully crewed', 'Snorkeling at Playa Muertos', 'Free with 7+ night booking'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD_LIGHT, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>{/* end dark bg */}

      {/* ── VENUE SHOWCASE ───────────────────────────────────── */}
      <div style={{ background: '#0b0f18' }}>

        {/* Top: 3-image row */}
        <div className="wdg-venue-top">
          {IMG.venue.slice(0, 3).map((src, i) => (
            <BgImage key={i} src={src} fallback="linear-gradient(135deg,#0f172a,#1a2e1a)" style={{ minHeight: '400px' }}>
              <div style={{ width: '100%', height: '100%', minHeight: '400px', background: 'rgba(0,0,0,0.08)' }} />
            </BgImage>
          ))}
        </div>
        {/* Bottom: 4-image row */}
        <div className="wdg-venue-bot">
          {IMG.venue.slice(3, 7).map((src, i) => (
            <BgImage key={i} src={src} fallback="linear-gradient(135deg,#1a2e1a,#0f172a)" style={{ minHeight: '300px' }}>
              <div style={{ width: '100%', height: '100%', minHeight: '300px', background: 'rgba(0,0,0,0.08)' }} />
            </BgImage>
          ))}
        </div>

        {/* Text block below the images */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: '64px', alignItems: 'start' }}>

            {/* Left: headline + description */}
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
                The Estate
              </p>
              <h2 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: '#fff', lineHeight: 1.1, marginBottom: '24px' }}>
                Palacio Musical.
                <br />
                <span style={{ color: GOLD_LIGHT, fontStyle: 'italic' }}>Where It All Happens.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.85, marginBottom: '20px' }}>
                12,500 sq ft of secluded beachfront estate with private access to the beach directly on Costa Rica's Tango Mar coast. Three ocean-view decks, a professional music studio, a whale watching observatory, and a natural beach ceremony area steps below the property.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.85 }}>
                The main estate sleeps 18 guests in 7 en-suite bedrooms -- but your wedding doesn't stop there. Right next door sits Palacio Tropical, and together they form one of the most exclusive private venues on the Pacific coast.
              </p>
            </div>

            {/* Right: capacity cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '6px' }}>
                Your Guest List, Fully Accommodated
              </p>
              {[
                { name: 'Palacio Musical',  detail: '7 en-suites &bull; 18 overnight guests', primary: true },
                { name: 'Palacio Tropical', detail: '7 en-suites &bull; 18 overnight guests', primary: false },
                { name: 'Casa Oceano',      detail: 'Oceanfront villa &bull; 14 guests', primary: false },
                { name: 'The View House',   detail: '4 bedrooms &bull; 8 guests',  primary: false },
                { name: '+ Partner Villas', detail: 'Extended network &bull; up to 150 total overnight guests', partner: true },
              ].map(({ name, detail, primary, partner }, i) => (
                <div key={i} style={{
                  background: primary ? 'linear-gradient(135deg, rgba(184,151,46,0.12), rgba(184,151,46,0.06))'
                    : partner ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.05)',
                  border: primary ? '1px solid rgba(201,169,110,0.35)'
                    : partner ? '1px dashed rgba(255,255,255,0.15)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {primary && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD_LIGHT, flexShrink: 0 }} />}
                    {partner && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />}
                    {!primary && !partner && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
                    <span style={{ color: primary ? '#fff' : partner ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)', fontWeight: primary ? 700 : 600, fontSize: '0.95rem' }}>
                      {name}
                    </span>
                  </div>
                  <span style={{ color: partner ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }} dangerouslySetInnerHTML={{ __html: detail }} />
                </div>
              ))}
              <div style={{ marginTop: '8px', padding: '16px 20px', background: `linear-gradient(135deg, ${GOLD}, #a07040)`, borderRadius: '14px', textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 4px' }}>Up to 150 Overnight Guests</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', margin: 0 }}>Across all estates, Boutique Hotel &amp; partner villas combined</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FACT STRIP ───────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #a07040 100%)`, padding: '48px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { num: '150', label: 'Ceremony guests' },
            { num: '150', label: 'Dinner guests' },
            { num: '150', label: 'Overnight guests' },
            { num: '1',   label: 'Free catamaran' },
          ].map(({ num, label }, i) => (
            <div key={i}>
              <p style={{ fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3rem)', color: '#fff', lineHeight: 1, margin: '0 0 6px' }}>{num}</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PHOTO GALLERY ────────────────────────────────────── */}
      <div style={{ background: '#0b0f18', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '14px' }}>
              The Experience
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: '#fff', lineHeight: 1.1 }}>
              See It for Yourself
            </h2>
          </div>

          <div className="wdg-gallery-grid">
            {IMG.gallery.map((src, i) => (
              <GalleryTile key={i} src={src} index={i} onClick={setLightboxIdx} />
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT WE PROVIDE ──────────────────────────────────── */}
      <div style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '14px' }}>
              Everything Included
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111', lineHeight: 1.15, marginBottom: '14px' }}>
              Nothing Standing in the Way.
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
              Most venues hand you a room and a list of rules.
              We hand you a private estate, a full team, and the freedom to create whatever you envision.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: SVGHome,     title: 'Venue + Overnight Stays',     desc: 'Your guests stay at the venue. Up to 150 overnight guests across our estates and partner villas. No hotel shuttles. No separation.' },
              { icon: SVGBeach,    title: 'Beach Ceremony',               desc: "Exchange vows on the sand with the Pacific in front of you. Open-air, naturally secluded, and unforgettable." },
              { icon: SVGChef,     title: 'Private Chefs & Full Staff',   desc: 'Private chefs, concierge, housekeeping, and security -- all included. Every meal, every day handled.' },
              { icon: SVGPlanner,  title: 'Any Planner, Any Vision',      desc: 'Bring your own planner or use ours. We work with any vendor, any setup. Tell us what you need -- we make it happen.' },
              { icon: SVGBoat,     title: 'Free Catamaran Tour',          desc: 'Included free with any 7-night booking. Private boat to Playa Muertos -- the perfect rehearsal dinner.' },
              { icon: SVGLock,     title: 'Fully Private & Secure',       desc: 'Private estate setting with on-site security. Beach access is secluded and primarily used by your group. Your wedding stays intimate and exclusive.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} style={{
                background: '#fafaf8', borderRadius: '20px', padding: '28px',
                border: '1px solid #f0ece4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
              >
                <div style={{ marginBottom: '16px' }}><Icon /></div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THE THREE ESTATES ────────────────────────────────── */}
      <div style={{ background: '#f5f3ef', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '14px' }}>
              The Properties
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111', lineHeight: 1.15 }}>
              Three Estates. One Wedding Week.
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '520px', margin: '16px auto 0' }}>
              Your guests don't travel to a venue -- they live inside it.
              Book all three together and take over the entire property.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { name: 'Palacio Musical',  badge: 'Main Event Estate',  dark: true,  slug: 'palacio-musical',
                specs: ['12,500 sq ft','7 en-suite bedrooms','Up to 18 overnight guests','Three ocean-view decks','Professional music studio','Beach ceremony venue'] },
              { name: 'Palacio Tropical', badge: 'Guest Estate',        dark: false, slug: 'palacio-tropical',
                specs: ['10,500 sq ft','7 en-suite bedrooms','Up to 18 overnight guests','Secluded beachfront pool','Grand dining room (14 seated)','Outside bar & dining'] },
              { name: 'The View House',   badge: 'Family & Bridal Party', dark: false, slug: 'the-view-house',
                specs: ['2,400 sq ft','4 bedrooms','Up to 8 overnight guests','Panoramic Pacific views','Custom infinity pool','5 min from main estate'] },
            ].map(({ name, badge, dark, slug, specs }, i) => (
              <div key={i} style={{ borderRadius: '22px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: '#fff' }}>
                <div style={{ background: dark ? 'linear-gradient(135deg, #0f172a, #1a2e1a)' : 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '28px 28px 24px' }}>
                  <span style={{
                    display: 'inline-block', marginBottom: '10px',
                    background: dark ? `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)` : 'rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: '0.62rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '50px',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {badge}
                  </span>
                  <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', margin: 0 }}>{name}</h3>
                </div>
                <div style={{ padding: '24px 28px 28px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {specs.map((s, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#374151' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/villa/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: GOLD, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                    View Property
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <div style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '14px' }}>
              Simple Process
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111' }}>
              From First Call to First Dance
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { step: '01', title: 'Reach Out & Tell Us Your Vision',   desc: "Get in touch with your dates, guest count, and what you're imagining. We confirm availability and answer every question." },
              { step: '02', title: 'Your Planner Meets Our Team',        desc: "Bring your own planner or work with ours. We sit down together and map out every detail -- catering, setup, timeline." },
              { step: '03', title: 'We Set Everything Up',               desc: "Our staff prepares the estates, chefs plan your menus, decor goes up, and the catamaran is booked. You arrive to a venue that's ready." },
              { step: '04', title: 'You Celebrate -- We Handle the Rest', desc: "From the first welcome drink to the last breakfast, our team is on-site around the clock. You focus on your guests." },
            ].map(({ step, title, desc }, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: '24px', position: 'relative', paddingBottom: i < arr.length - 1 ? '40px' : '0' }}>
                {i < arr.length - 1 && (
                  <div style={{ position: 'absolute', left: '25px', top: '52px', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #f0ece4, transparent)' }} />
                )}
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, background: 'linear-gradient(135deg, #0f172a, #1a2e1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_LIGHT, fontWeight: 900, fontSize: '0.82rem', letterSpacing: '0.05em', zIndex: 1 }}>
                  {step}
                </div>
                <div style={{ paddingTop: '10px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', marginBottom: '8px' }}>{title}</h3>
                  <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.8, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH AERIAL / CTA ───────────────────────────── */}
      <BgImage
        src={IMG.aerial}
        fallback="linear-gradient(160deg, #0b1120 0%, #12203a 60%, #1a2e1a 100%)"
        style={{ position: 'relative', padding: '0' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
            Let's Start Planning
          </p>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', lineHeight: 1.1, marginBottom: '20px' }}>
            Tell Us What You're Dreaming Of
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '44px', maxWidth: '500px', margin: '0 auto 44px' }}>
            Every wedding here looks different &mdash; and that's exactly the point.
            Reach out with your dates and we'll take it from there.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={brand.pricingHref} style={{
              display: 'inline-block', padding: '18px 42px',
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
              borderRadius: '50px', color: '#fff', fontWeight: 700,
              fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 6px 28px rgba(184,151,46,0.5)',
            }}>
              {brand.pricingLabel}
            </a>
            <a href="/#wedding-contact" style={{
              display: 'inline-block', padding: '18px 42px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '50px', color: '#fff', fontWeight: 600,
              fontSize: '1rem', textDecoration: 'none',
            }}>
              Contact Us
            </a>
          </div>
        </div>
      </BgImage>

      <WeddingContactFormSection />

      <Footer />

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (dx > 50)  setLightboxIdx(i => Math.max(i - 1, 0));
            if (dx < -50) setLightboxIdx(i => Math.min(i + 1, IMG.gallery.length - 1));
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <img
            src={IMG.gallery[lightboxIdx]}
            alt={`Wedding photo ${lightboxIdx + 1}`}
            style={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 20px 80px rgba(0,0,0,0.8)', userSelect: 'none' }}
            onClick={e => e.stopPropagation()}
          />

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i - 1); }}
              style={{
                position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', width: '52px', height: '52px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >&#8249;</button>
          )}

          {/* Next */}
          {lightboxIdx < IMG.gallery.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i + 1); }}
              style={{
                position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', width: '52px', height: '52px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >&#8250;</button>
          )}

          {/* Counter */}
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', letterSpacing: '0.15em', userSelect: 'none' }}>
            {lightboxIdx + 1} / {IMG.gallery.length}
          </div>

          {/* Close */}
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'fixed', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

// ── SVG Icons ────────────────────────────────────────────────
function SVGHome() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function SVGBeach() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 2v2M12 16v6M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function SVGChef() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
      <line x1="6" y1="17" x2="18" y2="17"/>
    </svg>
  );
}
function SVGPlanner() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function SVGBoat() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
      <path d="M19 13V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6"/>
      <polyline points="12 2 12 9"/>
    </svg>
  );
}
function SVGLock() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
