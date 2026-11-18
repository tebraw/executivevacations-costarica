import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cropStyle, distanceMeters, formatDistance, placeLayout } from './geometry';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, video[controls], iframe, [tabindex]:not([tabindex="-1"])';
const EMBED_ID = /^[\w-]{3,40}$/;

const kindOf = (item) => (item.type === 'image' ? 'photo' : 'video');
const thumbOf = (item) => item.thumb || (item.type === 'image' ? item.src : item.poster) || null;

// One photo or video. Files that cannot be loaded show a short note instead of a broken picture.
function Slide({ item }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p className="area-viewer__error">This {kindOf(item)} could not be loaded.</p>;
  if (item.type === 'image') {
    return <img src={item.src} alt={item.alt || ''} decoding="async" draggable="false" onError={() => setFailed(true)} />;
  }
  if (item.type === 'video') {
    return <video src={item.src} poster={item.poster} aria-label={item.alt || undefined} controls playsInline muted={!!item.autoPlay} preload="metadata" autoPlay={!!item.autoPlay} onError={() => setFailed(true)} />;
  }
  if ((item.type === 'youtube' || item.type === 'vimeo') && EMBED_ID.test(item.id || '')) {
    const auto = item.autoPlay ? 1 : 0;
    const src =
      item.type === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${item.id}?rel=0&modestbranding=1&playsinline=1&autoplay=${auto}`
        : `https://player.vimeo.com/video/${item.id}?dnt=1&title=0&byline=0&portrait=0&autoplay=${auto}`;
    return <iframe src={src} title={item.alt || 'Video'} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy" />;
  }
  return <p className="area-viewer__error">This {kindOf(item)} is not set up correctly.</p>;
}

function Empty({ image, pos, zoom, title, text }) {
  return (
    <div className="area-viewer__empty" style={cropStyle(image, pos, zoom, 0.7)}>
      <div>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7a2 2 0 0 1 2-2h2.2l1.2-1.6h5.2L15.8 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm8 9.2a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4z" />
        </svg>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

// Photos and videos of a place, or the video of a flight, in a window over the map.
// "target" is { kind: 'place' | 'flight', id }. The parent gives this a key, so it starts fresh for every target.
export default function MediaViewer({ target, places, flights, image, layout, onClose, onOpenPlace, onOpenFlight }) {
  const isFlight = target.kind === 'flight';
  const place = isFlight ? null : places.find((p) => p.id === target.id);
  const flight = isFlight ? flights.find((f) => f.id === target.id) : null;
  const from = flight ? places.find((p) => p.id === flight.from) : null;
  const to = flight ? places.find((p) => p.id === flight.to) : null;

  const media = useMemo(() => {
    if (place) return place.media || [];
    if (flight && flight.video) return [{ ...flight.video, autoPlay: true }];
    return [];
  }, [place, flight]);

  const [index, setIndex] = useState(0);
  const count = media.length;
  const current = media[index];
  const go = useCallback((step) => setIndex((i) => (count ? (i + step + count) % count : 0)), [count]);

  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const swipeRef = useRef(null);

  // Focus goes into the window and comes back to the pin or card that opened it.
  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!panelRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      const onMedia = ['VIDEO', 'IFRAME', 'INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && count > 1 && !onMedia) {
        e.preventDefault();
        go(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, go, count]);

  // The next and the previous photo are loaded ahead of time.
  useEffect(() => {
    if (count < 2) return;
    [1, -1].forEach((step) => {
      const item = media[(index + step + count) % count];
      if (item && item.type === 'image') new Image().src = item.src;
    });
  }, [index, count, media]);

  const swipe = {
    onPointerDown: (e) => {
      swipeRef.current = current && current.type === 'image' ? { x: e.clientX, y: e.clientY } : null;
    },
    onPointerUp: (e) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || count < 2) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    },
  };

  const title = isFlight ? `${from.name} → ${to.name}` : place.name;
  const flightsOfPlace = place ? flights.filter((f) => f.from === place.id || f.to === place.id) : [];
  const metersBetween = isFlight && from.geo && to.geo ? distanceMeters(from.geo, to.geo) : null;
  const emptyPos = isFlight
    ? (() => {
        const a = placeLayout(layout, from.id);
        const b = placeLayout(layout, to.id);
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      })()
    : place && placeLayout(layout, place.id);

  return (
    <div className="area-viewer" role="dialog" aria-modal="true" aria-labelledby="area-viewer-title">
      <div className="area-viewer__backdrop" onClick={onClose} />
      <div className="area-viewer__panel" ref={panelRef}>
        <button ref={closeRef} type="button" className="area-viewer__close" onClick={onClose} aria-label="Close and go back to the map">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="area-viewer__media" {...swipe}>
          {current ? (
            <>
              <Slide key={index} item={current} />
              {current.caption && <p className="area-viewer__caption">{current.caption}</p>}
            </>
          ) : isFlight ? (
            <Empty image={image} pos={emptyPos} zoom={2.4} title="Flight video coming soon" text={`The flight from ${from.short} to ${to.short} is being prepared.`} />
          ) : (
            <Empty
              image={image}
              pos={emptyPos}
              zoom={4}
              title="Photos and videos coming soon"
              text={place.status === 'building' ? 'We are still building here. The first photos and videos will follow.' : 'We are adding photos and videos for this place.'}
            />
          )}
          {count > 1 && (
            <>
              <button type="button" className="area-viewer__nav area-viewer__nav--prev" onClick={() => go(-1)} aria-label="Previous">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10 2.5L4.5 8 10 13.5" />
                </svg>
              </button>
              <button type="button" className="area-viewer__nav area-viewer__nav--next" onClick={() => go(1)} aria-label="Next">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 2.5L11.5 8 6 13.5" />
                </svg>
              </button>
              <p className="area-viewer__count" aria-live="polite">
                {index + 1} / {count}
              </p>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="area-viewer__thumbs">
            {media.map((item, i) => {
              const src = thumbOf(item);
              return (
                <button key={i} type="button" className="area-viewer__thumb" aria-current={i === index} aria-label={`Show ${kindOf(item)} ${i + 1} of ${count}`} onClick={() => setIndex(i)}>
                  {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : null}
                  {item.type !== 'image' && (
                    <span className="area-viewer__thumb-play" aria-hidden="true">
                      <svg viewBox="0 0 16 16">
                        <path d="M4.5 2.4v11.2L13.6 8z" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <aside className="area-viewer__info">
          <p className="area-viewer__eyebrow">{isFlight ? 'Flight video' : place.badge || 'Explore'}</p>
          <h2 id="area-viewer-title">{title}</h2>
          {isFlight ? (
            <p className="area-viewer__lead">
              A drone flight from {from.name} to {to.name}
              {metersBetween ? `, about ${formatDistance(metersBetween)} as the crow flies` : ''}.
            </p>
          ) : (
            <>
              {place.tagline && <p className="area-viewer__lead">{place.tagline}</p>}
              {place.facts && <p className="area-viewer__facts">{place.facts}</p>}
              {place.highlights?.length > 0 && (
                <ul className="area-viewer__chips">
                  {place.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="area-viewer__actions">
            {!isFlight && place.villa && (
              <a className="area-btn area-btn--gold" href={`/villa/${place.villa}`} target="_blank" rel="noopener noreferrer">
                View villa page
              </a>
            )}
          </div>

          {isFlight && (
            <div className="area-viewer__links">
              <p>Explore</p>
              {[from, to].map((p) => (
                <button key={p.id} type="button" onClick={() => onOpenPlace(p.id)}>
                  {p.name} <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          )}

          {!isFlight && flightsOfPlace.length > 0 && (
            <div className="area-viewer__links">
              <p>Flight videos</p>
              {flightsOfPlace.map((f) => {
                const a = places.find((p) => p.id === f.from);
                const b = places.find((p) => p.id === f.to);
                return (
                  <button key={f.id} type="button" onClick={() => onOpenFlight(f.id)}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4.5 2.4v11.2L13.6 8z" />
                    </svg>
                    {a.short} → {b.short}
                  </button>
                );
              })}
            </div>
          )}

          <button type="button" className="area-viewer__back" onClick={onClose}>
            ← Back to the map
          </button>
        </aside>
      </div>
    </div>
  );
}
