import { META_PIXEL_ID } from '../config/meta';

const ATTR_KEY = 'pc_attr';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
  } catch {
    return {};
  }
};

// Remembers where a visitor came from (campaign, ad, click id) for the whole session.
export function captureAttribution() {
  const cur = read();
  try {
    const q = new URLSearchParams(window.location.search);
    PARAMS.forEach((p) => {
      const v = q.get(p);
      if (v) cur[p] = v.slice(0, 200);
    });
    if (!cur.landing) {
      cur.landing = window.location.pathname;
      cur.referrer = (document.referrer || '').slice(0, 200);
    }
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(cur));
  } catch {
    /* storage can be blocked in in-app browsers */
  }
  return cur;
}

export const getAttribution = read;

const cookie = (name) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
};

// Meta's browser and click ids. The click id cookie is built from fbclid when the Pixel has not set it yet.
export function metaIds() {
  const attr = read();
  let fbc = cookie('_fbc');
  if (!fbc && attr.fbclid) fbc = `fb.1.${Date.now()}.${attr.fbclid}`;
  return { fbp: cookie('_fbp'), fbc };
}

export const newEventId = () =>
  window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

let pixelStarted = false;

// Returns true when it just started the Pixel (which sends the first PageView itself).
export function startMetaPixel() {
  if (!META_PIXEL_ID || pixelStarted || typeof window === 'undefined') return false;
  pixelStarted = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  return true;
}

const STANDARD = new Set(['Lead', 'Contact', 'ViewContent', 'PageView']);

// One call feeds Google Tag Manager (dataLayer) and, once the Pixel runs, Meta. The event id lets Meta
// match this browser event with a server-side event for the same lead later on.
export function track(name, params = {}, eventId) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `pc_${name.toLowerCase()}`, ...params, ...(eventId ? { event_id: eventId } : {}) });
    if (typeof window.fbq === 'function') {
      const kind = STANDARD.has(name) ? 'track' : 'trackCustom';
      if (eventId) window.fbq(kind, name, params, { eventID: eventId });
      else window.fbq(kind, name, params);
    }
  } catch {
    /* tracking must never break the page */
  }
}
