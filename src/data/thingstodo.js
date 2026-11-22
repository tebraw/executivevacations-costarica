// The guest page /thingstodo is built from this file. A QR code in each villa opens it; the page is not linked on the website.
//
// To add a place, add a line to the "items" of its category:
//   { name: 'Name of the place', maps: 'https://maps.app.goo.gl/xxxx' },
//   { name: 'Name of the place', maps: 'https://maps.app.goo.gl/xxxx', note: 'About 10 minutes by car' },   // "note" is optional
//   { name: 'Name of the place', website: 'https://example.com' },   // a website button; a place can have both a map and a website
// In Google Maps: open the place, tap Share, then Copy link. The order here is the order on the page.
//
// A category with "reserve: true" shows its "intro" in a card with the WhatsApp button for Mila. Optional "details" are short
// facts that appear as small tags in that card, for example ['About 3 hours', 'From $75 per person'].
// /thingstodo#restaurants opens the page at that category ("id" below), so a QR code can point straight to one.

// Mila's WhatsApp (the link of her WhatsApp Business QR code).
export const MILA_WHATSAPP = 'https://wa.me/qr/NBERXLCMIZFFA1';

// "icon" picks the drawing in components/thingstodo/Icons.jsx.
export const CATEGORIES = [
  {
    id: 'waterfalls',
    title: 'Waterfalls',
    icon: 'waterfall',
    intro: 'Cool off at the jungle waterfalls nearby.',
    items: [
      { name: 'Montezuma Waterfalls', note: 'Trailhead and parking lot', maps: 'https://maps.app.goo.gl/HRXqbXyLQFUtaEQy7' },
      { name: 'Florida Waterfalls', maps: 'https://maps.app.goo.gl/x2EsiVaNomKWSAHY8' },
      { name: 'Catarata El Chorro', maps: 'https://maps.app.goo.gl/9ZTdPjEF2vGPZv7b8' },
      { name: 'Catarata El Salto', maps: 'https://maps.app.goo.gl/5BKJud7gHXo6jQoA7' },
    ],
  },
  {
    id: 'restaurants',
    title: 'Restaurants',
    icon: 'restaurant',
    intro: 'Our favorite places to eat nearby.',
    items: [
      { name: 'Rancho Grill El Pirata', note: 'Tango Mar Beachfront Boutique Hotel & Villas', maps: 'https://maps.app.goo.gl/mRVh7cmjskkrSuy38' },
      { name: 'Restaurante Cristobal', maps: 'https://maps.app.goo.gl/YS4zUibwj31UNjGX9' },
      { name: 'Mariscos Tambor', maps: 'https://maps.app.goo.gl/ZhAVYk91XrnQo9Un6' },
      { name: 'Pepez Seafood and Grill', maps: 'https://maps.app.goo.gl/7btqYBzzvmMxbp8M8' },
      { name: 'Nani Nana', maps: 'https://maps.app.goo.gl/vUg5e3czs3bKNohu8' },
      { name: 'Restaurante, Pizzeria y Parrilla Chelo', maps: 'https://maps.app.goo.gl/7UYdo7GrGtVcUP896' },
      { name: 'Restaurante La Fortuna', maps: 'https://maps.app.goo.gl/1xC8gPH5jJGSyhau6' },
    ],
  },
  {
    id: 'golf-tennis',
    title: 'Golf & Tennis',
    icon: 'golf',
    intro: 'Golf courses and tennis courts nearby.',
    items: [{ name: 'Delfines Golf Club', note: 'Golf course in Tambor', website: 'https://delfines.com/' }],
  },
  {
    id: 'ziplining',
    title: 'Ziplining',
    icon: 'zipline',
    intro: 'Fly through the jungle canopy on a zipline adventure.',
    reserve: true,
    details: [],
    items: [],
  },
  {
    id: 'atv-tour',
    title: 'ATV Tour',
    icon: 'atv',
    intro: 'Quad through the mountains and along jungle trails.',
    reserve: true,
    details: [],
    items: [],
  },
  {
    id: 'massages',
    title: 'Massages',
    icon: 'massage',
    intro: 'Treatments in your own villa, so you can simply relax.',
    reserve: true,
    details: [],
    items: [],
  },
  {
    id: 'catamaran-boat-tour',
    title: 'Catamaran & Boat Tour',
    icon: 'boat',
    intro: 'Sail the Pacific coastline on a catamaran or boat tour.',
    reserve: true,
    details: [],
    items: [],
  },
  {
    id: 'fishing',
    title: 'Fishing',
    icon: 'fishing',
    intro: 'Head out on the Pacific for a day of fishing.',
    reserve: true,
    details: [],
    items: [],
  },
  {
    id: 'santa-teresa',
    title: 'Santa Teresa',
    icon: 'surf',
    intro: "Costa Rica's iconic surf and wellness town, about 35 minutes from the villas.",
    items: [{ name: 'Santa Teresa', maps: 'https://maps.app.goo.gl/PKv3rVhPv8w5X5ij8' }],
  },
  {
    id: 'montezuma',
    title: 'Montezuma',
    icon: 'palm',
    intro: 'A laid-back beach town with cafés and shops.',
    items: [{ name: 'Montezuma', maps: 'https://maps.app.goo.gl/FhsM6jNeG1VZB4rM6' }],
  },
  {
    id: 'groceries',
    title: 'Groceries',
    icon: 'basket',
    intro: 'Supermarkets and fresh produce nearby.',
    items: [{ name: 'Mega Súper', note: 'Cóbano', maps: 'https://maps.app.goo.gl/a6VdbdjgXq94Krpr7' }],
  },
];
