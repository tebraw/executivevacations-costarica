import villas from './villas';
import layout from './area-layout.json';

// The hidden estate page (/area) is built from this file:
//   AREA_IMAGE  the wide drone shot in the background (set its real width and height, and isPlaceholder to false)
//   PLACES      the villas and the platform, with their photos and videos
//   FLIGHTS     the flight lines between places; each one opens one video
// Where the pins, name tags and flight lines sit on the picture is in area-layout.json. Open /area?edit=1, drag them
// into place (pull the name tags apart where pins are close together) and copy the layout into that file.
//
// A photo or video ("media item") looks like one of these:
//   { type: 'image',   src: '/images/area/musical/pool.webp', alt: 'The pool' }                          // alt describes the photo
//   { type: 'video',   src: '/videos/area/musical.mp4', poster: '/images/area/musical/poster.webp' }   // a file we host
//   { type: 'youtube', id: 'dQw4w9WgXcQ' }                                                              // unlisted YouTube video
//   { type: 'vimeo',   id: '76979871' }
// "thumb" (optional, any item) is a small picture for the strip under the viewer; videos use their "poster".

export const AREA_IMAGE = {
  src: '/images/villas/palacio-tropical/palaciotropical.dronephoto-03.webp',
  width: 1920,
  height: 1080,
  alt: 'Aerial view of the Costa Rican coast with the Palacio villas',
  // True while a stand-in photo is used. Shows a small "placeholder" note on the page.
  isPlaceholder: true,
};

const villaOf = (slug) => villas.find((v) => v.slug === slug);

// The first photos of a villa as they are on its page (the heavy PNG renders are skipped). Replace with your own list any time.
const photosOf = (slug, count = 6) => {
  const v = villaOf(slug);
  if (!v) return [];
  return [...new Set([...(v.images || []), ...(v.detailImages || [])])]
    .filter((src) => !/\.png$/i.test(src))
    .slice(0, count)
    .map((src, i) => ({ type: 'image', src, alt: `${v.name}, photo ${i + 1}` }));
};

const factsOf = (slug) => {
  const v = villaOf(slug);
  return v ? `${v.bedrooms} bedrooms · up to ${v.guests} guests` : '';
};

// status: 'live' (bookable), 'soon' (opening soon) or 'building' (under construction)
export const PLACES = [
  {
    id: 'musical',
    name: 'Palacio Musical',
    short: 'Musical',
    status: 'live',
    villa: 'palacio-musical',
    tagline: villaOf('palacio-musical')?.tagline,
    facts: factsOf('palacio-musical'),
    highlights: villaOf('palacio-musical')?.topAmenities || [],
    thumb: '/images/area/thumbs/musical.webp',
    geo: { lat: 9.686766467916819, lon: -85.02117266494965 },
    media: photosOf('palacio-musical'),
  },
  {
    id: 'ruins-platform',
    name: 'Platform at the Ruins Jungle',
    short: 'Ruins Platform',
    status: 'building',
    badge: 'Under construction',
    tagline: 'Our new platform in the jungle at the ruins, currently being built.',
    facts: 'In the jungle at the ruins',
    highlights: [],
    thumb: null,
    geo: { lat: 9.68739622234866, lon: -85.02098717622837 },
    media: [],
  },
  {
    id: 'tropical',
    name: 'Palacio Tropical',
    short: 'Tropical',
    status: 'live',
    villa: 'palacio-tropical',
    tagline: villaOf('palacio-tropical')?.tagline,
    facts: factsOf('palacio-tropical'),
    highlights: villaOf('palacio-tropical')?.topAmenities || [],
    thumb: '/images/area/thumbs/tropical.webp',
    geo: { lat: 9.686718754746876, lon: -85.02082456039091 },
    media: photosOf('palacio-tropical'),
  },
  {
    id: 'paradise',
    name: 'Palacio Paradise',
    short: 'Paradise',
    status: 'soon',
    badge: 'Opens winter 2026',
    tagline: 'Our newest estate, arriving winter 2026.',
    facts: '4 en-suite bedrooms · up to 8 guests',
    highlights: ['180° ocean views', 'Helicopter landing pad', 'Pool', 'Air conditioning'],
    thumb: '/images/area/thumbs/paradise.webp',
    geo: { lat: 9.689025726906946, lon: -85.01393186596479 },
    media: [
      { type: 'image', src: '/images/villas/palacio-paradise/palacio-paradise-helicopter.webp', alt: 'The helicopter landing pad at Palacio Paradise' },
      { type: 'image', src: '/images/villas/palacio-paradise/palacio-paradise-hero.webp', alt: 'Palacio Paradise with its landing pad and ocean view' },
    ],
  },
  {
    id: 'view-house',
    name: 'The View House',
    short: 'View House',
    status: 'live',
    villa: 'the-view-house',
    tagline: villaOf('the-view-house')?.tagline,
    facts: factsOf('the-view-house'),
    highlights: villaOf('the-view-house')?.topAmenities || [],
    thumb: '/images/area/thumbs/view-house.webp',
    geo: { lat: 9.691078309600051, lon: -85.01155836638172 },
    media: photosOf('the-view-house'),
  },
];

// One flight video per line. "bend" curves the line (a small positive or negative number), or drag it in /area?edit=1.
// Set "video" to a media item (see above) as soon as the footage is ready.
export const FLIGHTS = [
  { id: 'view-to-paradise', from: 'view-house', to: 'paradise', bend: -0.16, video: null },
  { id: 'paradise-to-musical', from: 'paradise', to: 'musical', bend: -0.09, video: null },
  { id: 'paradise-to-tropical', from: 'paradise', to: 'tropical', bend: 0.1, video: null },
];

export const LAYOUT = layout;

export const getPlace = (id) => PLACES.find((p) => p.id === id);
export const getFlight = (id) => FLIGHTS.find((f) => f.id === id);
