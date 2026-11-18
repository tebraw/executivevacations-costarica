import React from 'react';
import { cropStyle, placeLayout } from './geometry';

function Thumb({ place, image, layout }) {
  if (place.thumb) {
    return (
      <span className="area-card__thumb">
        <img src={place.thumb} alt="" width="62" height="62" loading="lazy" decoding="async" />
      </span>
    );
  }
  // No photo yet: a close-up of the drone shot around the pin.
  return <span className="area-card__thumb" style={cropStyle(image, placeLayout(layout, place.id))} aria-hidden="true" />;
}

// One card per place, along the bottom of the screen.
export function PlaceRail({ places, image, layout, hoverKey, onHover, onOpen }) {
  return (
    <nav className="area-rail" aria-label="Places">
      {places.map((place) => {
        const key = `place:${place.id}`;
        return (
          <button
            key={place.id}
            type="button"
            className={`area-card is-${place.status}${hoverKey === key ? ' is-active' : ''}`}
            onClick={() => onOpen(place.id)}
            onPointerEnter={() => onHover(key)}
            onPointerLeave={() => onHover(null)}
          >
            <Thumb place={place} image={image} layout={layout} />
            <span className="area-card__meta">
              <span className="area-card__name">
                <span className="area-card__full">{place.name}</span>
                <span className="area-card__short">{place.short}</span>
              </span>
              {place.facts && <span className="area-card__facts">{place.facts}</span>}
              <span className="area-card__cta">{place.media.length ? 'Photos & videos' : 'Coming soon'} →</span>
            </span>
            {place.badge && <span className="area-card__badge">{place.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}

// The flight lines as a list, so they can be found without hunting for them on the picture.
export function FlightNav({ flights, titleOf, hoverKey, onHover, onOpen }) {
  return (
    <nav className="area-flightnav" aria-label="Flight videos">
      <span className="area-flightnav__title">Flight videos</span>
      {flights.map((flight) => {
        const key = `flight:${flight.id}`;
        return (
          <button
            key={flight.id}
            type="button"
            className={hoverKey === key ? 'is-active' : ''}
            onClick={() => onOpen(flight.id)}
            onPointerEnter={() => onHover(key)}
            onPointerLeave={() => onHover(null)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 2.4v11.2L13.6 8z" />
            </svg>
            <span>{titleOf(flight)}</span>
          </button>
        );
      })}
    </nav>
  );
}
