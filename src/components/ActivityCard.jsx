import React from 'react';

const ActivityCard = ({ activity, isSelected, onToggle, isDisabled }) => {
  return (
    <div 
      className={`activity-card ${isSelected ? 'selected' : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Disabled Overlay */}
      {isDisabled && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div style={{ textAlign: 'center', padding: '20px', color: 'white' }}>
            <svg 
              style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 12px',
                opacity: 0.6 
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
              Currently not available<br />at this location
            </p>
          </div>
        </div>
      )}

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
          onClick={() => !isDisabled && onToggle(activity)}
          disabled={isDisabled}
          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        >
          {isSelected ? (
            <>
              <span className="checkmark">✓</span> Added
            </>
          ) : (
            activity.isService ? '+ Add Service' : '+ Add Activity'
          )}
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
