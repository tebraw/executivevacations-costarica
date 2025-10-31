import React from 'react';

const ActivityCard = ({ activity, isSelected, onToggle }) => {
  return (
    <div className={`activity-card ${isSelected ? 'selected' : ''}`}>
      {/* Activity Image */}
      <div 
        className="activity-card-image"
        style={{ backgroundImage: `url('${activity.image}')` }}
      >
        {/* Service Badge */}
        {activity.isService && (
          <div className="service-badge">
            ✈️ SERVICE
          </div>
        )}
        
        {activity.duration && (
          <div className="duration-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{activity.duration}</span>
          </div>
        )}
      </div>

      {/* Activity Content */}
      <div className="activity-card-content">
        <h3 className="activity-card-title">{activity.name}</h3>
        <p className="activity-card-description">{activity.description}</p>
        
        {activity.highlights && activity.highlights.length > 0 && (
          <ul className="activity-highlights">
            {activity.highlights.map((highlight, index) => (
              <li key={index}>• {highlight}</li>
            ))}
          </ul>
        )}

        <button 
          className={`add-activity-btn ${isSelected ? 'selected' : ''}`}
          onClick={() => onToggle(activity)}
        >
          {isSelected ? (
            <>
              <span className="checkmark">✓</span> Added
            </>
          ) : (
            '+ Add Activity'
          )}
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
