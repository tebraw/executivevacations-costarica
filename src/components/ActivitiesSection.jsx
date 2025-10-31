import React, { useState } from 'react';
import ActivityCard from './ActivityCard';

const ActivitiesSection = ({ onActivitiesChange }) => {
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Helper function to get correct image path for GitHub Pages
  const BASE_URL = import.meta.env.BASE_URL;
  const getImagePath = (path) => {
    return `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  };

  // Activity data
  const activities = [
    {
      id: 'atv-rainbow',
      name: 'ATV Rainbow Mountain Adventure',
      description: 'Embark on a thrilling ATV ride through pristine mountains and lush rainforest. Experience breathtaking views and an adrenaline rush like no other.',
      duration: '4-5 hours',
      image: getImagePath('images/activities/ATVTourRainbowMountain.jpg'),
      highlights: ['Professional guide included', 'All safety equipment provided', 'Refreshments included']
    },
    {
      id: 'private-yoga',
      name: 'Private Yoga Session',
      description: 'Enjoy a personalized yoga experience with stunning ocean views. Perfect for all skill levels, from beginners to advanced practitioners.',
      duration: '60 minutes',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
      highlights: ['Certified instructor', 'Ocean view setting', 'Equipment provided']
    },
    {
      id: 'couples-massage',
      name: 'Couples Massage',
      description: 'Indulge in a relaxing in-villa couples massage. Professional therapists bring the spa experience directly to your accommodation.',
      duration: '90 minutes',
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=600&fit=crop&auto=format',
      highlights: ['In-villa service', 'Premium oils & lotions', 'Relaxing atmosphere']
    },
    {
      id: 'sunset-catamaran',
      name: 'Private Catamaran Tour',
      description: 'Sail along the stunning Costa Rican coast during golden hour. Includes snorkeling, drinks, and unforgettable sunset views.',
      duration: '3 hours',
      image: getImagePath('images/activities/Design ohne Titel (56).png'),
      highlights: ['Open bar included', 'Snorkeling gear provided', 'Light snacks served']
    },
    {
      id: 'surf-lessons',
      name: 'Surf Lessons',
      description: 'Learn to surf or improve your skills with professional instruction. All levels welcome, from first-timers to experienced surfers.',
      duration: '2 hours',
      image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&h=600&fit=crop',
      highlights: ['Expert instructors', 'Board rental included', 'Small group sizes']
    },
    {
      id: 'zipline-adventure',
      name: 'Zip-lining Adventure',
      description: 'Soar through the rainforest canopy on an exhilarating zip-line tour. Experience Costa Rica\'s natural beauty from a unique perspective.',
      duration: '3 hours',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&auto=format',
      highlights: ['Multiple zip-lines', 'Safety certified', 'Transportation included']
    },
    {
      id: 'private-chef',
      name: 'Private Chef Experience',
      description: 'Enjoy a gourmet dining experience in the comfort of your villa. Our professional chefs prepare exquisite meals using fresh, local ingredients.',
      duration: 'Flexible',
      image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&h=600&fit=crop',
      highlights: ['Customized menu', 'Local & fresh ingredients', 'Full service included']
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

          {/* Selected Activities Sidebar - DEACTIVATED (too large for mobile) */}
          {/* {selectedActivities.length > 0 && (
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
                        style={{ backgroundImage: `url('${activity.image}')` }}
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
          )} */}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
