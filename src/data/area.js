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
// "caption" (optional, any item) is a small label on the picture, for example 'Illustration' or 'Concept impression'.
// The helpers below (photo, sitePhoto, clip) build these items for the files in /images/area/photos and /videos/area.

// The drone shot. width and height are the real pixel size of the file. If you replace it with a sharper version of the
// same view, nothing else has to change: pins, name tags and flight lines are placed in percent of the picture.
export const AREA_IMAGE = {
  src: '/images/area/drone.webp',
  width: 1365,
  height: 768,
  alt: 'Aerial view of the coast with the Palacio villas, the golf course and the jungle',
  // True while a stand-in photo is used. Shows a small "placeholder" note on the page.
  isPlaceholder: false,
};

const villaOf = (slug) => villas.find((v) => v.slug === slug);

const PHOTOS = '/images/area/photos';
const THUMBS = `${PHOTOS}/thumbs`;

// Labels for pictures that are not photographs of what exists today.
const ILLUSTRATION = 'Illustration';

// A photo from /images/area/photos/<slug>.webp (its thumbnail has the same name in the thumbs folder).
const photo = (slug, alt, extra = {}) => ({ type: 'image', src: `${PHOTOS}/${slug}.webp`, thumb: `${THUMBS}/${slug}.webp`, alt, ...extra });

// A photo that is on the website already: the page uses that file in place.
const sitePhoto = (slug, src, alt, extra = {}) => ({ type: 'image', src, thumb: `${THUMBS}/${slug}.webp`, alt, ...extra });

// A video from /videos/area/<slug>.mp4 with its poster picture.
const clip = (slug, alt, extra = {}) => ({ type: 'video', src: `/videos/area/${slug}.mp4`, poster: `${PHOTOS}/${slug}-poster.webp`, thumb: `${THUMBS}/${slug}.webp`, alt, ...extra });

const factsOf = (slug) => {
  const v = villaOf(slug);
  return v ? `${v.bedrooms} bedrooms · up to ${v.guests} guests` : '';
};

// status: 'live' (bookable), 'soon' (opening soon), 'building' (under construction) or 'amenity' (not a villa)
// tag: the text on the picture (default: name). short: the text on small screens and in the flight titles.
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
    media: [
      photo('musical-roofs-aerial', 'Aerial view of the villa, its pools and the palm trees by the sea'),
      sitePhoto('musical-balcony-view', '/images/villas/palacio-musical/image (19).webp', 'View from the balcony over the pools towards the sea'),
      sitePhoto('musical-villas-aerial', '/images/villas/palacio-musical/palacio-musical-bedroom-3.webp', 'Aerial view of the villas between the palm trees'),
      sitePhoto('musical-ocean-deck', '/images/villas/palacio-musical/palacio-musical-kitchen-dining.webp', 'Wooden deck with a view of the turquoise sea'),
      photo('coast-aerial', 'Aerial view of the coastline, the surf and the jungle'),
      photo('musical-terrace-measured', 'The restaurant terrace from above, with its measurements'),
      sitePhoto('musical-night-view', '/images/villas/palacio-musical/palacio-musical-ocean-panorama.jpg', 'The villa lit up at night', { caption: ILLUSTRATION }),
    ],
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
    media: [
      sitePhoto('tropical-exterior-dusk', '/images/villas/palacio-tropical/palaciotropical-455.exterior_1.webp', 'The villa and its garden at dusk'),
      sitePhoto('tropical-pool', '/images/villas/palacio-tropical/palaciotropical-518.exterior.webp', 'The pool with sun loungers under the palm trees'),
      photo('tropical-roofs-aerial', 'Aerial view of the villa roofs and the pools by the sea'),
      sitePhoto('tropical-beach-aerial', '/images/villas/palacio-tropical/palaciotropical.dronephoto-08.webp', 'Aerial view of the villa, the beach and the rocks'),
      photo('coast-aerial', 'Aerial view of the coastline, the surf and the jungle'),
      sitePhoto('tropical-living-room', '/images/villas/palacio-tropical/palaciotropical-014.mainfloor.webp', 'The living room on the main floor'),
      photo('tropical-night-front', 'The villa and its pool lit up at night', { caption: ILLUSTRATION }),
      photo('tropical-night-aerial', 'The villas on the hillside lit up at night', { caption: ILLUSTRATION }),
    ],
  },
  {
    id: 'paradise',
    name: 'Palacio Paradise',
    short: 'Paradise',
    status: 'soon',
    tagline: 'Our newest estate on the cliff above the ocean.',
    facts: '4 en-suite bedrooms · up to 8 guests',
    highlights: ['180° ocean views', 'Helicopter landing pad', 'Pool', 'Air conditioning'],
    thumb: '/images/area/thumbs/paradise.webp',
    geo: { lat: 9.689025726906946, lon: -85.01393186596479 },
    media: [
      clip('paradise-property', 'Video tour of the Palacio Paradise property'),
      sitePhoto('paradise-helipad', '/images/villas/palacio-paradise/palacio-paradise-hero.webp', 'The villa with its helicopter landing pad and the ocean view'),
      photo('paradise-aerial-front', 'Aerial view of the villa, its pool and the gardens'),
      photo('paradise-aerial-lawn', 'The villa and the lawn along the cliff, seen from the air'),
      sitePhoto('paradise-sunset-beach', '/images/villas/palacio-paradise/palacio-paradise-sunset-beach.jpg', 'Sunset at the beach'),
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
    media: [
      clip('view-house', 'Video of The View House'),
      photo('viewhouse-pool-terrace', 'The pool terrace of The View House with a view of the ocean'),
      photo('viewhouse-jungle-view', 'The corner of the pool and the view over the jungle to the ocean'),
      sitePhoto('viewhouse-kitchen-wide', '/images/villas/the-view-house/3c3b16b7-77de-4fdb-97e7-cd4e5d2f533d.avif', 'The open kitchen and living area'),
      sitePhoto('viewhouse-kitchen-island', '/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif', 'The kitchen with its island and bar stools'),
    ],
  },
  {
    id: 'ruins-platform',
    name: 'Platform at the Ruins Jungle',
    tag: 'Ruins / Platform',
    short: 'Ruins Platform',
    status: 'building',
    tagline: 'A new platform in the jungle at the ruins.',
    facts: 'In the jungle at the ruins',
    highlights: [],
    enquiry: 'the platform at the ruins',
    thumb: '/images/area/thumbs/ruins-platform.webp',
    geo: { lat: 9.68739622234866, lon: -85.02098717622837 },
    media: [
      clip('ruins-platform', 'Video of the ruins in the jungle'),
      photo('platform-clearing', 'Illustration of the platform that is being built', { caption: 'Not a real photo: this platform is being built' }),
    ],
  },
  {
    id: 'tennis-court',
    name: 'Tennis Court',
    short: 'Tennis Court',
    status: 'amenity',
    tagline: 'The tennis court at Tango Mar.',
    enquiry: 'the tennis court at Tango Mar',
    facts: '',
    highlights: [],
    thumb: '/images/area/thumbs/tennis-court.webp',
    media: [photo('tennis-court', 'The tennis court with its canopy')],
  },
];

// One flight video per line. "bend" curves the line (a small positive or negative number), or drag it in /area?edit=1.
export const FLIGHTS = [
  { id: 'view-to-paradise', from: 'view-house', to: 'paradise', bend: 0.14, video: clip('view-house-to-paradise', 'Drone flight from The View House to Palacio Paradise') },
  { id: 'paradise-to-musical', from: 'paradise', to: 'musical', bend: 0.09, video: clip('paradise-to-musical', 'Drone flight from Palacio Paradise to Palacio Musical') },
];

export const LAYOUT = layout;

export const getPlace = (id) => PLACES.find((p) => p.id === id);
export const getFlight = (id) => FLIGHTS.find((f) => f.id === id);
