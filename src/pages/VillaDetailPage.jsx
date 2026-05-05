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

// ─── Calendar helpers ──────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toMidnight(d) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
function sameDay(a, b) { return a && b && a.toDateString() === b.toDateString(); }
function fmtShort(d) { return d ? `${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}` : '—'; }

// ─── MiniCalendar ─────────────────────────────────────────────
function MiniCalendar({ checkIn, checkOut, onChange }) {
  const today = toMidnight(new Date());
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());
  const [hov, setHov] = useState(null);
  const selecting = checkIn && !checkOut;

  function clickDay(day) {
    if (day < today) return;
    if (!checkIn || checkOut) { onChange({ checkIn: day, checkOut: null }); return; }
    if (day <= checkIn) { onChange({ checkIn: day, checkOut: null }); }
    else { onChange({ checkIn, checkOut: day }); }
  }

  function prevM() { mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1); }
  function nextM() { mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1); }

  const dim = new Date(yr, mo + 1, 0).getDate();
  const firstDay = new Date(yr, mo, 1).getDay();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: dim }, (_, i) => new Date(yr, mo, i + 1))];
  const rangeEnd = selecting && hov ? hov : checkOut;
  const GOLD = '#b8972e';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <button onClick={prevM} style={{ background:'none', border:'none', cursor:'pointer', padding:'5px 8px', color:'#9ca3af', lineHeight:1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'0.88rem', fontWeight:600, color:'#111' }}>
          {MONTH_NAMES[mo]} {yr}
        </span>
        <button onClick={nextM} style={{ background:'none', border:'none', cursor:'pointer', padding:'5px 8px', color:'#9ca3af', lineHeight:1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'3px' }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'9px', fontWeight:700, color:'#9ca3af', letterSpacing:'0.04em', paddingBottom:'5px' }}>{d}</div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`b${i}`} />;
          const past = day < today;
          const isStart = sameDay(day, checkIn);
          const isEnd = sameDay(day, checkOut);
          const inRange = checkIn && rangeEnd && rangeEnd > checkIn && day > checkIn && day < rangeEnd;
          const isToday = sameDay(day, today);
          let bg = 'transparent', col = past ? '#d1d5db' : '#1f2937', fw = 400, br = '50%';
          if (isStart || isEnd) { bg = GOLD; col = '#fff'; fw = 700; }
          else if (inRange) { bg = 'rgba(184,151,46,0.13)'; br = '2px'; }
          return (
            <button key={i} disabled={past}
              onClick={() => clickDay(toMidnight(day))}
              onMouseEnter={() => selecting && setHov(toMidnight(day))}
              onMouseLeave={() => setHov(null)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                height:'31px', borderRadius: br,
                border: isToday && !isStart && !isEnd ? `1.5px solid ${GOLD}` : '1.5px solid transparent',
                background: bg, color: col, fontWeight: fw,
                fontSize:'0.76rem', cursor: past ? 'default' : 'pointer',
                transition:'background 0.1s',
              }}>
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── VillaDetailPage ──────────────────────────────────────────
const VillaDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const villa = villas.find((v) => v.slug === slug);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [lbTouchStartX, setLbTouchStartX] = useState(null);
  const [dates, setDates] = useState({ checkIn: null, checkOut: null });

  const images = villa?.detailImages || villa?.images || [];
  const { checkIn, checkOut } = dates;
  const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / 86400000) : 0;

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

  const openLightbox = (idx) => { setLightboxImageIndex(idx); setIsLightboxOpen(true); };

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isLightboxOpen]);
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setLightboxImageIndex((p) => (p + 1) % images.length);
      if (e.key === 'ArrowLeft') setLightboxImageIndex((p) => (p - 1 + images.length) % images.length);
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen, images.length]);

  if (!villa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p style={{ color:'#6b7280', marginBottom:'1rem' }}>Villa not found.</p>
        <Link to="/" className="btn btn-luxury">Back to Home</Link>
      </div>
    );
  }

  const handleInquire = () => navigate('/', { state: { selectVilla: villa.id } });
  const amenities = villa.allAmenities || villa.topAmenities || [];

  const GOLD = '#b8972e';
  const WRAP = { maxWidth:'1380px', margin:'0 auto', padding:'0 2rem' };
  const SEC = { fontFamily:"'Playfair Display', serif", fontSize:'1.4rem', fontWeight:600, color:'#111', whiteSpace:'nowrap' };

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ paddingTop:'80px', background:'#f8f7f4' }}>

        {/* ── Back ─────────────────────────────────── */}
        <div style={WRAP} className="py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2"
            style={{ color:'#6b7280', fontSize:'0.85rem' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Villas
          </button>
        </div>

        {/* ── Gallery ──────────────────────────────── */}
        <div style={WRAP} className="mb-10">

          {/* Desktop: Airbnb-style mosaic */}
          <div className="hidden md:block" style={{ position:'relative', height:'520px', borderRadius:'20px', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'60% calc(40% - 4px)', gridTemplateRows:'1fr 1fr', height:'100%', gap:'4px' }}>
              {/* Large main image — spans 2 rows */}
              <div onClick={() => openLightbox(0)}
                style={{ gridRow:'span 2 / span 2', position:'relative', cursor:'pointer', overflow:'hidden' }}
                onMouseEnter={e => e.currentTarget.querySelector('img').style.transform='scale(1.03)'}
                onMouseLeave={e => e.currentTarget.querySelector('img').style.transform='scale(1)'}>
                <img src={getImagePath(images[0])} alt={villa.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.7s ease', display:'block' }} />
              </div>
              {/* Top-right */}
              {images[1] && (
                <div onClick={() => openLightbox(1)}
                  style={{ position:'relative', cursor:'pointer', overflow:'hidden' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform='scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform='scale(1)'}>
                  <img src={getImagePath(images[1])} alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.7s ease', display:'block' }} />
                </div>
              )}
              {/* Bottom-right */}
              {images[2] && (
                <div onClick={() => openLightbox(2)}
                  style={{ position:'relative', cursor:'pointer', overflow:'hidden' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform='scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform='scale(1)'}>
                  <img src={getImagePath(images[2])} alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.7s ease', display:'block' }} />
                </div>
              )}
            </div>
            {/* Show all photos */}
            <button onClick={() => openLightbox(0)} style={{
              position:'absolute', bottom:'16px', right:'16px',
              background:'rgba(255,255,255,0.96)', backdropFilter:'blur(6px)',
              border:'1.5px solid rgba(0,0,0,0.12)', borderRadius:'10px', padding:'9px 18px',
              cursor:'pointer', display:'flex', alignItems:'center', gap:'7px',
              fontSize:'0.78rem', fontWeight:700, fontFamily:"'Montserrat', sans-serif",
              boxShadow:'0 2px 12px rgba(0,0,0,0.12)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Show all {images.length} photos
            </button>
          </div>

          {/* Mobile: carousel */}
          <div className="md:hidden">
            <div className="relative overflow-hidden rounded-2xl select-none cursor-pointer"
              style={{ aspectRatio:'4/3' }}
              onClick={() => openLightbox(currentImageIndex)}
              onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <img src={getImagePath(images[currentImageIndex])} alt={villa.name}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                loading="eager" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
              {images.length > 1 && (
                <>
                  <button className="absolute left-0 top-0 h-full w-1/3 z-10"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(p => (p - 1 + images.length) % images.length); }} />
                  <button className="absolute right-0 top-0 h-full w-1/3 z-10"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(p => (p + 1) % images.length); }} />
                </>
              )}
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
              {images.slice(0, 10).map((_, i) => (
                <button key={i} onClick={() => setCurrentImageIndex(i)} className="rounded-full transition-all"
                  style={{ background: i === currentImageIndex ? '#1F2937' : '#d1d5db', width: i === currentImageIndex ? '16px' : '6px', height:'6px' }} />
              ))}
              {images.length > 10 && <span style={{ fontSize:'10px', color:'#9ca3af', alignSelf:'center' }}>+{images.length - 10}</span>}
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────── */}
        <div style={WRAP} className="pb-20">
          {/* Flex: left grows, right 400px fixed */}
          <div className="flex flex-col lg:flex-row gap-10" style={{ alignItems:'start' }}>

            {/* ── LEFT ─────────────────────────────── */}
            <div style={{ flex:1, minWidth:0 }}>

              {/* Title block */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {villa.isPremium && (
                    <span style={{ background:'linear-gradient(135deg,#c9a227,#e8c84e)', color:'#fff', fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', padding:'3px 10px', borderRadius:'4px' }}>PREMIUM</span>
                  )}
                  {villa.isComingSoon && (
                    <span style={{ background:'#9ca3af', color:'#fff', fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', padding:'3px 10px', borderRadius:'4px' }}>AVAILABLE SOON</span>
                  )}
                </div>
                <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, color:'#111', lineHeight:1.1, marginBottom:'6px' }}>
                  {villa.name}
                </h1>
                <p style={{ color:'#6b7280', fontSize:'0.95rem', marginBottom:'10px' }}>{villa.type}</p>
                <div className="flex items-center gap-3 flex-wrap" style={{ fontSize:'0.88rem' }}>
                  <span style={{ color:GOLD, fontWeight:700 }}>★ {villa.rating}</span>
                  <span style={{ color:'#d1d5db' }}>·</span>
                  <span style={{ color:'#4b5563' }}>{villa.fullLocation || villa.location}</span>
                </div>
              </div>

              {/* Stats strip */}
              <div className="mb-8" style={{ borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb', padding:'18px 0' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                  {[
                    { v: villa.bedrooms, l: villa.useEnsuites ? 'En-suites' : 'Bedrooms' },
                    { v: villa.bathrooms, l: 'Bathrooms' },
                    { v: villa.guests, l: 'Max Guests' },
                    { v: villa.size || '—', l: 'Property Size', sm: true },
                  ].map((s, i, arr) => (
                    <div key={i} className="text-center" style={{ borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', padding:'0 12px' }}>
                      <div style={{ fontFamily:"'Playfair Display', serif", fontSize: s.sm ? '1rem' : '1.7rem', fontWeight:700, color:'#111', lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:'9px', color:'#9ca3af', marginTop:'5px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile booking card */}
              <div className="lg:hidden mb-8">
                <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e9e4da', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', overflow:'hidden' }}>
                  <div style={{ height:'3px', background:'linear-gradient(to right,#c9a227,#e8c84e,#c9a227)' }} />
                  <div style={{ padding:'18px 20px' }}>
                    {villa.pricePerNight && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'2rem', fontWeight:700, color:'#111', lineHeight:1 }}>
                          ${villa.pricePerNight.toLocaleString()}
                        </span>
                        <span style={{ color:'#9ca3af', fontSize:'0.82rem' }}>/night</span>
                        <span style={{ marginLeft:'auto', fontSize:'10px', color:GOLD, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>Starting from</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-4" style={{ color:'#9ca3af', fontSize:'0.8rem' }}>
                      <span style={{ color:GOLD, fontWeight:600 }}>★ {villa.rating}</span>
                      <span>·</span>
                      <span>{villa.location}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {villa.virtualTour && (
                        <a href={villa.virtualTour} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full"
                          style={{ border:'1.5px solid '+GOLD, borderRadius:'10px', padding:'12px', color:GOLD, fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', textDecoration:'none', textTransform:'uppercase', fontFamily:"'Montserrat', sans-serif" }}>
                          Virtual 3D Tour
                        </a>
                      )}
                      <button onClick={handleInquire} className="w-full flex items-center justify-center gap-2"
                        style={{ background:'linear-gradient(135deg,#c9a227,#e8c84e)', borderRadius:'10px', padding:'14px', color:'#111', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', border:'none', cursor:'pointer', fontFamily:"'Montserrat', sans-serif" }}>
                        Inquire &amp; Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special offers */}
              {villa.hasChristmasSpecial && (
                <div className="mb-5 flex items-center gap-4" style={{ background:'linear-gradient(135deg,#fefce8,#fef9c3)', border:'1px solid #fbbf24', borderRadius:'12px', padding:'14px 18px' }}>
                  <span style={{ fontSize:'1.4rem' }}>🚢</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#111', fontSize:'0.9rem' }}>Complimentary Catamaran Tour</div>
                    <div style={{ color:'#6b7280', fontSize:'0.78rem', marginTop:'2px' }}>Included with reservations of 7 nights or more</div>
                  </div>
                </div>
              )}
              {villa.hasSpecialOffer && (
                <div className="mb-5 flex items-center gap-4" style={{ background:'linear-gradient(135deg,#fefce8,#fef9c3)', border:'1px solid #fbbf24', borderRadius:'12px', padding:'14px 18px' }}>
                  <span style={{ fontSize:'1.4rem' }}>🏍️</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#111', fontSize:'0.9rem' }}>Complimentary ATV Tour</div>
                    <div style={{ color:'#6b7280', fontSize:'0.78rem', marginTop:'2px' }}>Exclusive special offer included</div>
                  </div>
                </div>
              )}

              {/* About */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={SEC}>About this Villa</h2>
                  <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <p style={{ color:'#4b5563', lineHeight:1.85, fontSize:'0.93rem' }}>
                  {villa.detailedDescription || villa.description || 'Experience luxury and comfort in this stunning villa.'}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={SEC}>What this place offers</h2>
                  <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" style={{ flexShrink:0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ color:'#374151', fontSize:'0.875rem' }}>{typeof a === 'string' ? a : a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 style={SEC}>Location</h2>
                  <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, #e5e7eb, transparent)' }} />
                </div>
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ flexShrink:0, marginTop:'2px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div style={{ fontWeight:600, color:'#111', marginBottom:'6px', fontSize:'0.9rem' }}>{villa.fullLocation || villa.location}</div>
                      <p style={{ color:'#6b7280', lineHeight:1.7, fontSize:'0.85rem' }}>
                        {villa.locationDescription || "Located in one of Costa Rica's most prestigious areas."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT — Booking Card ─────────────── */}
            <div className="hidden lg:block" style={{ width:'400px', flexShrink:0 }}>
              <div style={{ position:'sticky', top:'100px' }}>
                <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #e9e4da', boxShadow:'0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>

                  {/* Gold accent top */}
                  <div style={{ height:'3px', background:'linear-gradient(to right, #c9a227, #e8c84e, #c9a227)' }} />

                  {/* Price header */}
                  <div style={{ padding:'22px 24px 0' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:GOLD, marginBottom:'2px', fontFamily:"'Montserrat', sans-serif" }}>
                      Starting from
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      {villa.pricePerNight ? (
                        <>
                          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'2.4rem', fontWeight:700, color:'#111', lineHeight:1 }}>
                            ${villa.pricePerNight.toLocaleString()}
                          </span>
                          <span style={{ color:'#9ca3af', fontSize:'0.85rem' }}>/night</span>
                        </>
                      ) : (
                        <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'1.4rem', fontWeight:700, color:'#111' }}>Contact for Pricing</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-5">
                      <span style={{ color:GOLD, fontSize:'0.82rem', fontWeight:600 }}>★ {villa.rating}</span>
                      <span style={{ color:'#e5e7eb' }}>·</span>
                      <span style={{ color:'#9ca3af', fontSize:'0.82rem' }}>{villa.location}</span>
                    </div>

                    {/* Check-in / Check-out */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:'1.5px solid #e5e7eb', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }}>
                      <div style={{ padding:'11px 14px', borderRight:'1px solid #e5e7eb' }}>
                        <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9ca3af', marginBottom:'3px', fontFamily:"'Montserrat', sans-serif" }}>Check-in</div>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color: checkIn ? '#111' : '#9ca3af' }}>
                          {checkIn ? fmtShort(checkIn) : 'Add date'}
                        </div>
                      </div>
                      <div style={{ padding:'11px 14px' }}>
                        <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9ca3af', marginBottom:'3px', fontFamily:"'Montserrat', sans-serif" }}>Check-out</div>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color: checkOut ? '#111' : '#9ca3af' }}>
                          {checkOut ? fmtShort(checkOut) : 'Add date'}
                        </div>
                      </div>
                    </div>

                    {/* Calendar */}
                    <div style={{ border:'1.5px solid #f0ece4', borderRadius:'12px', padding:'14px', background:'#faf9f6', marginBottom: checkIn && !checkOut ? '8px' : '16px' }}>
                      <MiniCalendar checkIn={checkIn} checkOut={checkOut}
                        onChange={({ checkIn: ci, checkOut: co }) => setDates({ checkIn: ci, checkOut: co })} />
                    </div>

                    {/* Hint text */}
                    {checkIn && !checkOut && (
                      <div style={{ fontSize:'0.72rem', color:'#9ca3af', textAlign:'center', marginBottom:'12px' }}>
                        Select your check-out date
                      </div>
                    )}

                    {/* Clear dates */}
                    {(checkIn || checkOut) && (
                      <button onClick={() => setDates({ checkIn: null, checkOut: null })}
                        style={{ display:'block', margin:'0 auto 12px', background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'#9ca3af', textDecoration:'underline' }}>
                        Clear dates
                      </button>
                    )}

                    {/* Nights summary */}
                    {nights > 0 && (
                      <div style={{ background:'linear-gradient(135deg,#fefce8,#fef9c3)', border:'1px solid #fbbf24', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'0.8rem', color:'#6b7280' }}>
                          {villa.pricePerNight ? `$${villa.pricePerNight.toLocaleString()} × ` : ''}{nights} nights
                        </span>
                        {villa.pricePerNight && (
                          <span style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:'#111', fontSize:'1rem' }}>
                            ${(villa.pricePerNight * nights).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div style={{ padding:'0 24px 22px' }}>
                    <div style={{ height:'1px', background:'#f3f4f6', marginBottom:'14px' }} />

                    {/* Quick stats */}
                    {[
                      { label: villa.useEnsuites ? 'En-suites' : 'Bedrooms', value: villa.bedrooms },
                      { label: 'Bathrooms', value: villa.bathrooms },
                      { label: 'Max Guests', value: villa.guests },
                      { label: 'Property Size', value: villa.size || '—' },
                    ].map((r, i, arr) => (
                      <div key={i} className="flex justify-between" style={{ padding:'7px 0', borderBottom: i < arr.length - 1 ? '1px solid #f9f9f7' : 'none' }}>
                        <span style={{ color:'#9ca3af', fontSize:'0.8rem' }}>{r.label}</span>
                        <span style={{ fontFamily:"'Playfair Display', serif", color:'#111', fontWeight:700, fontSize:'0.85rem' }}>{r.value}</span>
                      </div>
                    ))}

                    <div style={{ height:'1px', background:'#f3f4f6', margin:'14px 0' }} />

                    {villa.virtualTour && (
                      <a href={villa.virtualTour} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full"
                        style={{ border:'1.5px solid '+GOLD, borderRadius:'10px', padding:'11px', color:GOLD, fontSize:'0.74rem', fontWeight:700, letterSpacing:'0.08em', textDecoration:'none', textTransform:'uppercase', marginBottom:'8px', display:'flex', fontFamily:"'Montserrat', sans-serif" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                        Virtual 3D Tour
                      </a>
                    )}

                    <button onClick={handleInquire} className="w-full flex items-center justify-center gap-2"
                      style={{ background:'linear-gradient(135deg,#c9a227,#e8c84e)', borderRadius:'10px', padding:'14px', color:'#111', fontWeight:700, fontSize:'0.76rem', letterSpacing:'0.1em', textTransform:'uppercase', border:'none', cursor:'pointer', fontFamily:"'Montserrat', sans-serif" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z"/>
                      </svg>
                      Inquire &amp; Reserve
                    </button>

                    <div className="flex items-center justify-center gap-4 mt-4">
                      {['Instant Response', 'No Hidden Fees', 'Full Privacy'].map(b => (
                        <div key={b} className="flex items-center gap-1" style={{ color:'#9ca3af', fontSize:'9px' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* ── Lightbox ─────────────────────────────── */}
      {isLightboxOpen && (
        <div className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex:9999, background:'rgba(0,0,0,0.95)' }}
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={(e) => setLbTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (lbTouchStartX === null) return;
            const diff = lbTouchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
              if (diff > 0) setLightboxImageIndex(p => (p + 1) % images.length);
              else setLightboxImageIndex(p => (p - 1 + images.length) % images.length);
            }
            setLbTouchStartX(null);
          }}>

          <button onClick={() => setIsLightboxOpen(false)}
            style={{ position:'absolute', top:'16px', right:'16px', width:'40px', height:'40px', background:'rgba(255,255,255,0.1)', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div style={{ position:'absolute', top:'16px', left:'50%', transform:'translateX(-50%)', background:'rgba(255,255,255,0.1)', color:'#fff', padding:'5px 14px', borderRadius:'999px', fontSize:'13px', zIndex:10 }}>
            {lightboxImageIndex + 1} / {images.length}
          </div>

          <img src={getImagePath(images[lightboxImageIndex])} alt={`${villa.name} ${lightboxImageIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ display:'block', maxWidth:'95vw', maxHeight:'90vh', width:'auto', height:'auto', borderRadius:'8px', cursor:'default' }}
            draggable={false} />

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(p => (p - 1 + images.length) % images.length); }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center"
                style={{ width:'48px', height:'48px', background:'rgba(255,255,255,0.1)', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', zIndex:10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxImageIndex(p => (p + 1) % images.length); }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center"
                style={{ width:'48px', height:'48px', background:'rgba(255,255,255,0.1)', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', zIndex:10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VillaDetailPage;
