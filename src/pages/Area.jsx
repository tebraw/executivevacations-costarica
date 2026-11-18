import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { AREA_IMAGE, FLIGHTS, LAYOUT, PLACES, getFlight, getPlace } from '../data/area';
import AreaStage from '../components/area/AreaStage';
import MediaViewer from '../components/area/MediaViewer';
import { FlightNav, PlaceRail } from '../components/area/PlaceRail';
import { anchorOf, flightControl, labelOffset, placeLayout } from '../components/area/geometry';
import '../styles/area.css';

const LayoutEditor = lazy(() => import('../components/area/LayoutEditor'));

const DRAFT_KEY = 'area-layout-draft';
const round1 = (n) => Math.round(n * 10) / 10;

// /area#musical opens the photos of a place, /area#flight-view-to-paradise opens a flight video.
function parseHash(hash) {
  let id = '';
  try {
    id = decodeURIComponent((hash || '').replace(/^#/, ''));
  } catch {
    return null;
  }
  if (id.startsWith('flight-')) {
    const flight = getFlight(id.slice('flight-'.length));
    return flight ? { kind: 'flight', id: flight.id } : null;
  }
  const place = getPlace(id);
  return place ? { kind: 'place', id: place.id } : null;
}

// The layout from area-layout.json. In the editor (?edit=1) the changes are kept in this browser, so a reload does not lose them.
function useLayout(editing) {
  const [layout, setLayout] = useState(() => {
    if (editing) {
      try {
        const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY));
        if (draft && draft.places) return { places: { ...LAYOUT.places, ...draft.places }, flights: { ...LAYOUT.flights, ...(draft.flights || {}) } };
      } catch {
        /* no saved draft */
      }
    }
    return LAYOUT;
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!editing || !dirty) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(layout));
    } catch {
      /* storage not available */
    }
  }, [editing, dirty, layout]);

  const movePlace = useCallback((id, pos) => {
    setDirty(true);
    setLayout((l) => ({ ...l, places: { ...l.places, [id]: { ...placeLayout(l, id), ...pos } } }));
  }, []);
  const moveFlight = useCallback((id, ctrl) => {
    setDirty(true);
    setLayout((l) => ({ ...l, flights: { ...l.flights, [id]: { ctrl: { x: round1(ctrl.x), y: round1(ctrl.y) } } } }));
  }, []);
  const reset = useCallback(() => {
    setDirty(false);
    setLayout(LAYOUT);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage not available */
    }
  }, []);

  return { layout, movePlace, moveFlight, reset };
}

export default function Area() {
  const location = useLocation();
  const navigate = useNavigate();
  const editing = useMemo(() => new URLSearchParams(location.search).get('edit') === '1', [location.search]);
  const { layout, movePlace, moveFlight, reset } = useLayout(editing);
  const [hoverKey, setHoverKey] = useState(null);

  const open = useMemo(() => (editing ? null : parseHash(location.hash)), [editing, location.hash]);
  const openKey = open ? `${open.kind}:${open.id}` : '';
  const pushedRef = useRef(false);
  useEffect(() => {
    if (!openKey) pushedRef.current = false;
  }, [openKey]);

  // The viewer lives in the address (#musical), so the browser's back button closes it and a link can open it directly.
  const openTarget = useCallback(
    (kind, id) => {
      const hash = kind === 'flight' ? `flight-${id}` : id;
      if (openKey) {
        navigate({ search: location.search, hash }, { replace: true });
      } else {
        pushedRef.current = true;
        navigate({ search: location.search, hash });
      }
    },
    [navigate, location.search, openKey]
  );
  const openPlace = useCallback((id) => openTarget('place', id), [openTarget]);
  const openFlight = useCallback((id) => openTarget('flight', id), [openTarget]);
  const closeViewer = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      navigate(-1);
    } else {
      navigate({ search: location.search, hash: '' }, { replace: true });
    }
  }, [navigate, location.search]);

  const shortOf = useCallback((id) => getPlace(id)?.short || id, []);
  const flightTitle = useCallback((f) => `${shortOf(f.from)} → ${shortOf(f.to)}`, [shortOf]);

  const aspect = AREA_IMAGE.width / AREA_IMAGE.height;
  const exported = useMemo(
    () =>
      JSON.stringify(
        {
          places: Object.fromEntries(
            PLACES.map((p) => {
              const l = placeLayout(layout, p.id);
              const entry = { x: l.x, y: l.y, side: l.side || 'right' };
              const offset = labelOffset(l);
              if (offset) entry.label = { dx: offset.dx, dy: offset.dy, anchor: anchorOf(offset) };
              return [p.id, entry];
            })
          ),
          flights: Object.fromEntries(
            FLIGHTS.map((f) => {
              const c = flightControl(layout, f, aspect);
              return [f.id, { ctrl: { x: round1(c.x), y: round1(c.y) } }];
            })
          ),
        },
        null,
        2
      ),
    [layout, aspect]
  );

  return (
    <div className={`area${editing ? ' is-editing' : ''}${AREA_IMAGE.isPlaceholder ? ' has-note' : ''}`}>
      <Helmet>
        <title>Explore the Area | The Palacio Collection</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <AreaStage
        image={AREA_IMAGE}
        places={PLACES}
        flights={FLIGHTS}
        layout={layout}
        hoverKey={hoverKey}
        onHover={setHoverKey}
        onOpenPlace={openPlace}
        onOpenFlight={openFlight}
        flightTitle={flightTitle}
        editable={editing}
        onMovePlace={movePlace}
        onMoveFlight={moveFlight}
      />
      <div className="area-shade" aria-hidden="true" />

      <header className="area-top">
        <div className="area-top__left">
          <a className="area-logo" href="/" aria-label="The Palacio Collection, home">
            <img src="/images/area/logo-white.webp" alt="The Palacio Collection" width="300" height="191" />
          </a>
          <div className="area-intro">
            <p className="area-eyebrow">Costa Rica</p>
            <h1>Explore the Area</h1>
            <p className="area-intro__text">Tap a villa to see photos and videos, or follow a flight path from house to house.</p>
          </div>
        </div>
      </header>

      <FlightNav flights={FLIGHTS} titleOf={flightTitle} hoverKey={hoverKey} onHover={setHoverKey} onOpen={openFlight} />
      <PlaceRail places={PLACES} image={AREA_IMAGE} layout={layout} hoverKey={hoverKey} onHover={setHoverKey} onOpen={openPlace} />

      {AREA_IMAGE.isPlaceholder && <p className="area-placeholder">Placeholder photo · the final drone shot follows</p>}

      {open && (
        <MediaViewer
          key={openKey}
          target={open}
          places={PLACES}
          flights={FLIGHTS}
          image={AREA_IMAGE}
          layout={layout}
          onClose={closeViewer}
          onOpenPlace={openPlace}
          onOpenFlight={openFlight}
        />
      )}

      {editing && (
        <Suspense fallback={null}>
          <LayoutEditor
            places={PLACES}
            layout={layout}
            json={exported}
            onSide={(id, side) => movePlace(id, { side, label: null })}
            onReset={reset}
            onExit={() => navigate({ pathname: location.pathname }, { replace: true })}
          />
        </Suspense>
      )}
    </div>
  );
}
