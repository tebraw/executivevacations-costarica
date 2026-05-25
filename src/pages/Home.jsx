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

function Home() {
  const location = useLocation();
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  // SEO meta tags
  useEffect(() => {
    const title = 'Executive Vacations Costa Rica — Luxury Villa Rentals';
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
