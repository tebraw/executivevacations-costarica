import React, { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import VillasSection from './components/VillasSection'
import ActivitiesSection from './components/ActivitiesSection'
import Footer from './components/Footer'

function App() {
  const [selectedActivities, setSelectedActivities] = useState([]);

  const handleActivitiesChange = (activities) => {
    setSelectedActivities(activities);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <VillasSection selectedActivities={selectedActivities} />
      <ActivitiesSection onActivitiesChange={handleActivitiesChange} />
      <Footer />
    </div>
  )
}

export default App
