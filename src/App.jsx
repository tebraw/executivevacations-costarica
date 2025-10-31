import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import VillasSection from './components/VillasSection'
import ActivitiesSection from './components/ActivitiesSection'
import ContactFormSection from './components/ContactFormSection'
import InstructionModal from './components/InstructionModal'
import BookingCart from './components/BookingCart'
import Footer from './components/Footer'

function App() {
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const modalSeen = localStorage.getItem('instructionModalSeen');
    if (modalSeen) {
      setHasSeenModal(true);
    }

    // Show modal when user scrolls 30% into the villas section
    const handleScroll = () => {
      if (hasSeenModal) return;
      
      const villasSection = document.getElementById('villas');
      if (villasSection) {
        const rect = villasSection.getBoundingClientRect();
        const sectionHeight = rect.height;
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const scrolledPercentage = (visibleHeight / sectionHeight) * 100;
        
        // Show modal when user has scrolled 30% through the villas section
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

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <VillasSection 
        selectedVilla={selectedVilla}
        onVillaSelect={handleVillaSelect}
      />
      <ActivitiesSection onActivitiesChange={handleActivitiesChange} />
      <ContactFormSection 
        selectedVilla={selectedVilla}
        selectedActivities={selectedActivities}
      />
      <Footer />
      
      {/* Instruction Modal */}
      <InstructionModal 
        isOpen={showInstructionModal}
        onClose={() => setShowInstructionModal(false)}
      />
      
      {/* Floating Booking Cart */}
      <BookingCart 
        selectedVilla={selectedVilla}
        selectedActivities={selectedActivities}
        onOpenContact={scrollToContact}
      />
    </div>
  )
}

export default App
