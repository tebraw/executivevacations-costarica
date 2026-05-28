import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import VillasSection from '../components/VillasSection'
import ActivitiesSection from '../components/ActivitiesSection'
import ContactFormSection from '../components/ContactFormSection'
import InstructionModal from '../components/InstructionModal'
import Footer from '../components/Footer'
import villas from '../data/villas'
import { getSiteBrand } from '../utils/siteBrand'

function Home() {
  const location = useLocation();
  const brand = getSiteBrand();
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  // SEO meta tags
  useEffect(() => {
    const title = `Private Luxury Villas in Costa Rica — Beachfront, Pool & Concierge | ${brand.fullName}`;
    const desc = 'Discover 4 exclusive luxury villas in Costa Rica. Beachfront estates with private pools, stunning ocean views, and personalized concierge service. Book your dream vacation today.';
    document.title = title;
    const setMeta = (name, content, prop) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://executivevacations.net/', true);
    setMeta('og:image', 'https://executivevacations.net/images/hero-bg.webp', true);
  }, []);

  // Scroll to contact section when navigated with #contact hash
  useEffect(() => {
    if (location.hash === '#contact') {
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  // Auto-select villa when navigated back from VillaDetailPage
  useEffect(() => {
    if (location.state?.selectVilla) {
      const villa = villas.find((v) => v.id === location.state.selectVilla);
      if (villa) {
        setSelectedVilla(villa);
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const modalSeen = localStorage.getItem('instructionModalSeen');
    if (modalSeen) {
      setHasSeenModal(true);
    }

    const handleScroll = () => {
      if (hasSeenModal) return;
      
      const villasSection = document.getElementById('villas');
      if (villasSection) {
        const rect = villasSection.getBoundingClientRect();
        const sectionHeight = rect.height;
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const scrolledPercentage = (visibleHeight / sectionHeight) * 100;
        
        if (scrolledPercentage >= 30) {
          setShowInstructionModal(true);
          setHasSeenModal(true);
          localStorage.setItem('instructionModalSeen', 'true');
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };

    if (!hasSeenModal) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [hasSeenModal]);

  const handleActivitiesChange = (activities) => {
    setSelectedActivities(activities);
  };

  const handleVillaSelect = (villa) => {
    setSelectedVilla(villa);
  };

  return (
    <div className="min-h-screen" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Header />
      <Hero />
      
      {/* Cross-CTA Banner: Planning a Wedding? */}
      {brand.key === 'executive' && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: 'clamp(24px, 5vw, 48px)',
          borderTop: '2px solid #b8972e',
          borderBottom: '2px solid #b8972e',
        }}>
          <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              textAlign: 'center',
            }} className="md:flex-row md:text-left">
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
                  Something Special
                </p>
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                  color: '#fff',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                  Planning a Destination Wedding?
                </h3>
              </div>
              <a href={brand.weddingsHref}
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
                Explore Weddings →
              </a>
            </div>
          </div>
        </div>
      )}
      
      <VillasSection 
        selectedVilla={selectedVilla}
        onVillaSelect={handleVillaSelect}
      />
      <ActivitiesSection onActivitiesChange={handleActivitiesChange} selectedVilla={selectedVilla} />
      <ContactFormSection 
        selectedVilla={selectedVilla}
        selectedActivities={selectedActivities}
      />
      <Footer />
      
      <InstructionModal 
        isOpen={showInstructionModal}
        onClose={() => setShowInstructionModal(false)}
      />
    </div>
  )
}

export default Home
