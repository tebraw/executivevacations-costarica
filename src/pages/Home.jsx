import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import VillasSection from '../components/VillasSection'
import ActivitiesSection from '../components/ActivitiesSection'
import ContactFormSection from '../components/ContactFormSection'
import InstructionModal from '../components/InstructionModal'
import Footer from '../components/Footer'

function Home() {
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);

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
