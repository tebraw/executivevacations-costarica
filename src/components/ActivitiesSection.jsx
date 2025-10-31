import React, { useState } from 'react';
import ActivityCard from './ActivityCard';

const ActivitiesSection = ({ onActivitiesChange }) => {
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Activity data
  const activities = [
    {
      id: 'atv-rainbow',
      name: 'ATV Rainbow Mountain Adventure',
      description: 'Embark on a thrilling ATV ride through pristine mountains and lush rainforest. Experience breathtaking views and an adrenaline rush like no other.',
      duration: '4-5 hours',
      image: '/images/activities/ATVTourRainbowMountain.jpg',
      price: 120,
      highlights: ['Professional guide included', 'All safety equipment provided', 'Refreshments included']
    },
    {
      id: 'private-yoga',
      name: 'Private Yoga Session',
      description: 'Enjoy a personalized yoga experience with stunning ocean views. Perfect for all skill levels, from beginners to advanced practitioners.',
      duration: '60 minutes',
      image: '/images/activities/yoga.jpg',
      price: 80,
      highlights: ['Certified instructor', 'Ocean view setting', 'Equipment provided']
    },
    {
      id: 'couples-massage',
      name: 'Couples Massage',
      description: 'Indulge in a relaxing in-villa couples massage. Professional therapists bring the spa experience directly to your accommodation.',
      duration: '90 minutes',
      image: '/images/activities/massage.jpg',
      price: 200,
      highlights: ['In-villa service', 'Premium oils & lotions', 'Relaxing atmosphere']
    },
    {
      id: 'sunset-catamaran',
      name: 'Sunset Catamaran Tour',
      description: 'Sail along the stunning Costa Rican coast during golden hour. Includes snorkeling, drinks, and unforgettable sunset views.',
      duration: '3 hours',
      image: '/images/activities/catamaran.jpg',
      price: 150,
      highlights: ['Open bar included', 'Snorkeling gear provided', 'Light snacks served']
    },
    {
      id: 'surf-lessons',
      name: 'Surf Lessons',
      description: 'Learn to surf or improve your skills with professional instruction. All levels welcome, from first-timers to experienced surfers.',
      duration: '2 hours',
      image: '/images/activities/surfing.jpg',
      price: 75,
      highlights: ['Expert instructors', 'Board rental included', 'Small group sizes']
    },
    {
      id: 'zipline-adventure',
      name: 'Zip-lining Adventure',
      description: 'Soar through the rainforest canopy on an exhilarating zip-line tour. Experience Costa Rica\'s natural beauty from a unique perspective.',
      duration: '3 hours',
      image: '/images/activities/zipline.jpg',
      price: 95,
      highlights: ['Multiple zip-lines', 'Safety certified', 'Transportation included']
    }
  ];

  const handleToggleActivity = (activity) => {
    setSelectedActivities(prev => {
      const isSelected = prev.some(a => a.id === activity.id);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(a => a.id !== activity.id);
      } else {
        newSelection = [...prev, activity];
      }
      
      // Notify parent component of changes
      if (onActivitiesChange) {
        onActivitiesChange(newSelection);
      }
      
      return newSelection;
    });
  };

  const handleRemoveActivity = (activityId) => {
    setSelectedActivities(prev => {
      const newSelection = prev.filter(a => a.id !== activityId);
      if (onActivitiesChange) {
        onActivitiesChange(newSelection);
      }
      return newSelection;
    });
  };

  return (
    <section id="activities" className="py-20 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-dark mb-4">
            Enhance Your Experience
          </h2>
          <p className="body-large text-gray max-w-3xl mx-auto mb-8">
            Add unforgettable activities to your Costa Rica vacation. Select the experiences that interest you, 
            and our team will contact you to arrange all the details.
          </p>
          
          {/* Important Note */}
          <div className="activity-note-box max-w-2xl mx-auto">
            <div className="note-icon">ℹ️</div>
            <div className="note-content">
              <h4 className="note-title">How it works</h4>
              <p className="note-text">
                Simply select activities that interest you. Our concierge team will reach out to discuss 
                quantities, participants, preferred dates, and personalize every detail to your preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="activities-layout">
          {/* Activity Cards Grid */}
          <div className="activities-grid">
            {activities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={selectedActivities.some(a => a.id === activity.id)}
                onToggle={handleToggleActivity}
              />
            ))}
          </div>

          {/* Selected Activities Sidebar */}
          {selectedActivities.length > 0 && (
            <div className="activities-sidebar">
              <div className="sidebar-sticky">
                <h3 className="sidebar-title">
                  Selected Activities ({selectedActivities.length})
                </h3>
                
                <div className="selected-activities-list">
                  {selectedActivities.map(activity => (
                    <div key={activity.id} className="selected-activity-item">
                      <div 
                        className="selected-activity-image"
                        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}${activity.image.startsWith('/') ? activity.image.slice(1) : activity.image}')` }}
                      ></div>
                      <div className="selected-activity-info">
                        <h4 className="selected-activity-name">{activity.name}</h4>
                        <p className="selected-activity-duration">{activity.duration}</p>
                      </div>
                      <button 
                        className="remove-activity-btn"
                        onClick={() => handleRemoveActivity(activity.id)}
                        aria-label="Remove activity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sidebar-footer">
                  <p className="sidebar-note">
                    Our team will contact you to finalize details and pricing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
