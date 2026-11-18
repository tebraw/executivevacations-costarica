import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { anchorOf, chipRect, controlThrough, curvePath, curvePoint, flightControl, labelOffset, leaveCapsule, placeLayout, placeUnit } from './geometry';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const round1 = (n) => Math.round(n * 10) / 10;
const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The drone shot with everything on it. The picture is as large as needed to cover the screen; on narrow screens it
// is wider than the screen and can be dragged sideways. Pins and flight lines are placed in percent of the picture,
// so they stay on the right spot at every size.
export default function AreaStage({
  image,
  places,
  flights,
  layout,
  hoverKey,
  onHover,
  onOpenPlace,
  onOpenFlight,
  flightTitle,
  editable,
  onMovePlace,
  onMoveFlight,
}) {
  const scrollerRef = useRef(null);
  const canvasRef = useRef(null);
  const touchedRef = useRef(false);
  const draggingRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [canPan, setCanPan] = useState(false);
  const [hintOn, setHintOn] = useState(true);
  const aspect = image.width / image.height;
  const motion = useMemo(() => !reducedMotion(), []);
  const touchScreen = useMemo(() => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches, []);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const read = () => {
      const r = el.getBoundingClientRect();
      setSize((s) => (Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The name tags are measured: the thin line from a moved tag to its pin ends exactly at the tag's edge, and the
  // first view is centred on the pins together with their tags.
  const chipRefs = useRef(new Map());
  const [chipBox, setChipBox] = useState({});
  const measureChips = useCallback(() => {
    const next = {};
    chipRefs.current.forEach((el, id) => {
      if (el) next[id] = { w: el.offsetWidth, h: el.offsetHeight };
    });
    setChipBox((prev) => {
      const same = Object.keys(next).length === Object.keys(prev).length && Object.keys(next).every((id) => prev[id] && prev[id].w === next[id].w && prev[id].h === next[id].h);
      return same ? prev : next;
    });
  }, []);
  useLayoutEffect(() => {
    measureChips();
  }, [measureChips, size.w, size.h, places]);
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChips);
  }, [measureChips]);

  // Start with the places in view, until the visitor moves the picture. Where the picture is wider than the screen,
  // that is the stretch with the most places in it (so a phone opens on a group of villas, not on empty jungle).
  // Vertically they are centred in the free space between the header and the cards at the bottom.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !size.w) return;
    setCanPan(scroller.scrollWidth - scroller.clientWidth > 40);
    if (touchedRef.current) return;
    const units = places.map((p) => placeUnit(placeLayout(layout, p.id), chipBox[p.id] || { w: 150, h: 36 }, size));
    const room = scroller.clientWidth - 24;
    const span = (list) => Math.max(...list.map((u) => u.right)) - Math.min(...list.map((u) => u.left));
    let group = units;
    if (span(units) > room) {
      group = units.reduce((best, u) => {
        const inView = units.filter((o) => o.left >= u.left && o.right <= u.left + room);
        return inView.length > best.length ? inView : best;
      }, []);
    }
    const left = Math.min(...group.map((u) => u.left));
    const right = Math.max(...group.map((u) => u.right));
    const top = Math.min(...group.map((u) => u.top));
    const bottom = Math.max(...group.map((u) => u.bottom));
    const root = scroller.closest('.area');
    const below = [root && root.querySelector('.area-rail'), root && root.querySelector('.area-flightnav')]
      .filter((el) => el && el.getBoundingClientRect().height > 0)
      .map((el) => el.getBoundingClientRect().top);
    const header = root && root.querySelector('.area-top');
    const bandTop = header ? header.getBoundingClientRect().bottom : 0;
    const bandBottom = below.length ? Math.min(...below) : scroller.clientHeight;
    scroller.scrollLeft = (left + right) / 2 - scroller.clientWidth / 2;
    scroller.scrollTop = (top + bottom) / 2 - (bandTop + bandBottom) / 2;
    // Only when the size changes, not while pins are being dragged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, chipBox]);

  const flightGeo = useMemo(
    () =>
      flights.map((flight) => {
        const a = placeLayout(layout, flight.from);
        const b = placeLayout(layout, flight.to);
        const c = flightControl(layout, flight, aspect);
        return { flight, a, b, c, mid: curvePoint(a, c, b, 0.5) };
      }),
    [flights, layout, aspect]
  );

  const leaders = useMemo(() => {
    if (!size.w) return [];
    const out = [];
    places.forEach((place) => {
      const pos = placeLayout(layout, place.id);
      const box = chipBox[place.id];
      if (!labelOffset(pos) || !box) return;
      const pin = { x: (pos.x / 100) * size.w, y: (pos.y / 100) * size.h };
      const rect = chipRect(pos, box, size);
      const centre = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
      const dx = pin.x - centre.x;
      const dy = pin.y - centre.y;
      const t = leaveCapsule(box.w, box.h, dx, dy);
      if (!Math.hypot(dx, dy) || t === null) return;
      const edge = { x: centre.x + dx * t, y: centre.y + dy * t };
      const run = Math.hypot(pin.x - edge.x, pin.y - edge.y);
      const dot = 12;
      if (run <= dot + 2) return;
      out.push({ id: place.id, x1: edge.x, y1: edge.y, x2: pin.x - ((pin.x - edge.x) / run) * dot, y2: pin.y - ((pin.y - edge.y) / run) * dot });
    });
    return out;
  }, [places, layout, chipBox, size]);

  // Dragging in the layout editor: the position is read from the pointer, relative to the picture. "current" is where
  // the dragged thing sits now (percent of the picture); the spot where it was grabbed is kept, so nothing jumps.
  const drag = (onMove, current) =>
    editable
      ? {
          onPointerDown: (e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            const r = canvasRef.current.getBoundingClientRect();
            draggingRef.current = {
              id: e.pointerId,
              gx: current ? ((e.clientX - r.left) / r.width) * 100 - current.x : 0,
              gy: current ? ((e.clientY - r.top) / r.height) * 100 - current.y : 0,
            };
          },
          onPointerMove: (e) => {
            const grab = draggingRef.current;
            if (!grab || grab.id !== e.pointerId) return;
            const r = canvasRef.current.getBoundingClientRect();
            onMove({
              x: round1(clamp(((e.clientX - r.left) / r.width) * 100 - grab.gx, 0, 100)),
              y: round1(clamp(((e.clientY - r.top) / r.height) * 100 - grab.gy, 0, 100)),
            });
          },
          onPointerUp: (e) => {
            if (!draggingRef.current || draggingRef.current.id !== e.pointerId) return;
            draggingRef.current = null;
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {
              /* already released */
            }
          },
        }
      : {};

  // Highlighting follows the mouse only; on a touch screen it would stay lit after a tap.
  const hover = (key) => ({
    onPointerEnter: (e) => e.pointerType === 'mouse' && onHover(key),
    onPointerLeave: (e) => e.pointerType === 'mouse' && onHover(null),
  });
  const touch = () => {
    touchedRef.current = true;
  };

  return (
    <div className="area-stage">
      <div
        className="area-scroller"
        ref={scrollerRef}
        role="region"
        aria-label="Aerial view of the area with the villas and flight paths"
        onPointerDown={touch}
        onWheel={touch}
        onScroll={() => touchedRef.current && setHintOn(false)}
      >
        <div className="area-canvas" ref={canvasRef} style={{ '--ar': aspect }}>
          <img className="area-bg" src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" fetchpriority="high" draggable="false" />

          {size.w > 0 && (
            <svg className="area-flights" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true" focusable="false">
              {leaders.map((l) => (
                <line key={l.id} className="area-leader" x1={l.x1.toFixed(1)} y1={l.y1.toFixed(1)} x2={l.x2.toFixed(1)} y2={l.y2.toFixed(1)} data-place={l.id} />
              ))}
              {flightGeo.map(({ flight, a, b, c }) => {
                const d = curvePath(a, c, b, size.w, size.h);
                const key = `flight:${flight.id}`;
                const chord = Math.hypot(((b.x - a.x) / 100) * size.w, ((b.y - a.y) / 100) * size.h);
                return (
                  <g key={flight.id} className={`area-flight${hoverKey === key ? ' is-active' : ''}`}>
                    <path className="area-flight__line" d={d} />
                    {motion && (
                      <circle className="area-flight__dot" r="4.5">
                        <animateMotion dur={`${clamp(chord / 130, 4, 12).toFixed(1)}s`} repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                    <path className="area-flight__hit" d={d} onClick={() => !editable && onOpenFlight(flight.id)} {...hover(key)} />
                  </g>
                );
              })}
            </svg>
          )}

          {flightGeo.map(({ flight, a, b, c, mid }) => {
            const key = `flight:${flight.id}`;
            const title = flightTitle(flight);
            return (
              <button
                key={flight.id}
                type="button"
                className={`area-play${hoverKey === key ? ' is-active' : ''}`}
                style={{ left: `${mid.x}%`, top: `${mid.y}%` }}
                aria-label={editable ? `Bend the flight path: ${title}` : `Play flight video: ${title}`}
                onClick={() => !editable && onOpenFlight(flight.id)}
                {...hover(key)}
                {...drag((m) => onMoveFlight(flight.id, controlThrough(a, b, m)), mid)}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4.5 2.4v11.2L13.6 8z" />
                </svg>
                <span className="area-play__label">{title}</span>
              </button>
            );
          })}

          {places.map((place) => {
            const pos = placeLayout(layout, place.id);
            const offset = labelOffset(pos);
            const anchor = anchorOf(offset);
            const key = `place:${place.id}`;
            const state = `is-${place.status}${hoverKey === key ? ' is-active' : ''}`;
            // The name tag is a separate button next to the pin: it can be moved freely in the layout editor. For
            // keyboard and screen reader users the pin does the same job, so the tag is skipped there.
            return (
              <Fragment key={place.id}>
                <button
                  type="button"
                  className={`area-pin ${state}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  data-place={place.id}
                  aria-label={editable ? `Move ${place.name}` : `${place.name}: view photos and videos`}
                  onClick={() => !editable && onOpenPlace(place.id)}
                  {...hover(key)}
                  {...drag((p) => onMovePlace(place.id, p), pos)}
                >
                  <span className="area-pin__dot" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) chipRefs.current.set(place.id, el);
                    else chipRefs.current.delete(place.id);
                  }}
                  className={`area-chip ${offset ? `is-free anchor-${anchor}` : `side-${pos.side || 'right'}`} ${state}`}
                  style={offset ? { left: `${pos.x + offset.dx}%`, top: `${pos.y + offset.dy}%` } : { left: `${pos.x}%`, top: `${pos.y}%` }}
                  data-place={place.id}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => !editable && onOpenPlace(place.id)}
                  {...hover(key)}
                  {...drag(
                    (p) => onMovePlace(place.id, { label: { dx: round1(p.x - pos.x), dy: round1(p.y - pos.y), anchor } }),
                    offset ? { x: pos.x + offset.dx, y: pos.y + offset.dy } : null
                  )}
                >
                  <span className="area-chip__name">
                    <span className="area-chip__full">{place.tag || place.name}</span>
                    <span className="area-chip__short">{place.short}</span>
                  </span>
                  {place.badge && <span className="area-chip__badge">{place.badge}</span>}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
      {canPan && hintOn && touchScreen && !editable && (
        <div className="area-hint" aria-hidden="true">
          <span>←</span> Drag to explore <span>→</span>
        </div>
      )}
    </div>
  );
}
