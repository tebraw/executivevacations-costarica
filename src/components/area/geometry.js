// Map positions are percentages of the background picture: x from the left edge, y from the top edge.

const EARTH_RADIUS_M = 6371008.8;
const rad = (deg) => (deg * Math.PI) / 180;

// Straight-line distance in metres between two { lat, lon } points.
export function distanceMeters(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  return meters < 950 ? `${Math.max(10, Math.round(meters / 10) * 10)} m` : `${(meters / 1000).toFixed(1)} km`;
}

// Control point of the curve between a and b. "bend" is the sideways push as a fraction of the distance:
// positive bends to the left of the direction of travel, negative to the right. "aspect" is width / height of the
// picture, so that "sideways" really is 90 degrees on the screen.
export function defaultControl(a, b, bend, aspect) {
  const ax = a.x * aspect;
  const dx = b.x * aspect - ax;
  const dy = b.y - a.y;
  return {
    x: ((ax + b.x * aspect) / 2 + dy * bend) / aspect,
    y: (a.y + b.y) / 2 - dx * bend,
  };
}

// Point on the quadratic curve a -> c -> b at t (0 to 1).
export function curvePoint(a, c, b, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

// The control point that makes the curve pass through m in its middle (used when the middle handle is dragged).
export function controlThrough(a, b, m) {
  return { x: 2 * m.x - (a.x + b.x) / 2, y: 2 * m.y - (a.y + b.y) / 2 };
}

// SVG path for the curve, in pixels, for a picture that is w x h pixels on the screen.
export function curvePath(a, c, b, w, h) {
  const px = (p) => `${((p.x / 100) * w).toFixed(1)} ${((p.y / 100) * h).toFixed(1)}`;
  return `M ${px(a)} Q ${px(c)} ${px(b)}`;
}

// CSS for a picture that shows a close-up of the background picture around a point. Used as the thumbnail of a place
// that has no photo of its own yet. "zoom" is how many times wider than the box the background picture is shown;
// "box" is the height of the box divided by its width (1 for a square).
export function cropStyle(image, pos, zoom = 9, box = 1) {
  const aspect = image.width / image.height;
  const scaleX = zoom;
  const scaleY = zoom / aspect;
  const x = ((0.5 - (pos.x / 100) * scaleX) / (1 - scaleX)) * 100;
  const y = ((0.5 * box - (pos.y / 100) * scaleY) / (box - scaleY)) * 100;
  return {
    backgroundImage: `url("${image.src}")`,
    backgroundSize: `${scaleX * 100}% auto`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

// Where the straight line from the middle of a pill-shaped tag (w x h pixels) towards a point that is (dx, dy)
// pixels away leaves the tag. Returns that spot as a fraction (0 to 1) of the way to the point, or null when the
// point lies inside the tag.
export function leaveCapsule(w, h, dx, dy) {
  const r = h / 2;
  const half = Math.max(0, w / 2 - r);
  const gap = (t) => {
    const x = dx * t;
    const y = dy * t;
    return Math.hypot(x - Math.max(-half, Math.min(half, x)), y);
  };
  if (gap(1) <= r) return null;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (gap(mid) <= r) lo = mid;
    else hi = mid;
  }
  return lo;
}

// Where a place sits on the picture (from area-layout.json, or the edited copy).
export const placeLayout = (layout, id) => layout.places?.[id] || { x: 50, y: 50, side: 'right' };

// The name tag of a place can be moved away from its pin ("label": { dx, dy } in percent of the picture). Returns
// that offset, or null when the tag simply sits on one side of the pin.
export const labelOffset = (pos) => (pos.label && Number.isFinite(pos.label.dx) && Number.isFinite(pos.label.dy) ? pos.label : null);

// The rectangle (in pixels of the picture) that holds a pin and its name tag. "box" is the size of the tag.
export function placeUnit(pos, box, size) {
  const px = (pos.x / 100) * size.w;
  const py = (pos.y / 100) * size.h;
  const offset = labelOffset(pos);
  let tag;
  if (offset) {
    const cx = ((pos.x + offset.dx) / 100) * size.w;
    const cy = ((pos.y + offset.dy) / 100) * size.h;
    tag = { left: cx - box.w / 2, right: cx + box.w / 2, top: cy - box.h / 2, bottom: cy + box.h / 2 };
  } else if (pos.side === 'left') {
    tag = { left: px - 22 - box.w, right: px - 22, top: py - box.h / 2, bottom: py + box.h / 2 };
  } else if (pos.side === 'top') {
    tag = { left: px - box.w / 2, right: px + box.w / 2, top: py - 20 - box.h, bottom: py - 20 };
  } else if (pos.side === 'bottom') {
    tag = { left: px - box.w / 2, right: px + box.w / 2, top: py + 20, bottom: py + 20 + box.h };
  } else {
    tag = { left: px + 22, right: px + 22 + box.w, top: py - box.h / 2, bottom: py + box.h / 2 };
  }
  return {
    left: Math.min(px - 16, tag.left),
    right: Math.max(px + 16, tag.right),
    top: Math.min(py - 16, tag.top),
    bottom: Math.max(py + 16, tag.bottom),
  };
}

// Control point of a flight line: the saved one, otherwise the curve from its "bend".
export function flightControl(layout, flight, aspect) {
  const saved = layout.flights?.[flight.id]?.ctrl;
  if (saved) return saved;
  return defaultControl(placeLayout(layout, flight.from), placeLayout(layout, flight.to), flight.bend || 0, aspect);
}
