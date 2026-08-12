import React, { useState, useEffect } from 'react';
import BookingCalendar from '../components/admin/BookingCalendar';
import BookingModal from '../components/admin/BookingModal';
import WeddingQuoteBuilder from '../components/admin/WeddingQuoteBuilder';
import { getBookings, saveBooking, deleteBooking } from '../utils/bookingStorage';
import { generateInvoice } from '../utils/invoiceGenerator';
import { downloadICalFile } from '../utils/icalGenerator';

const ADMIN_PASSWORD = '1947';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showICalModal, setShowICalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [qrStats, setQrStats] = useState({});
  const [qrStatsLoading, setQrStatsLoading] = useState(false);
  const [newQrRef, setNewQrRef] = useState('');

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogForm, setBlogForm] = useState({ id: '', title: '', text: '', imageUrl: '', date: new Date().toISOString().split('T')[0], metaTitle: '', metaDesc: '', focusKeyword: '', site: 'villa' });

  const BLOG_TEMPLATES = [
    { label: 'â€” Load a template â€”', value: '' },
    {
      label: 'Palacio Musical: Luxury villa with a professional recording studio',
      value: {
        title: 'Palacio Musical: The Only Luxury Beachfront Villa with a Professional Recording Studio in Costa Rica',
        metaTitle: 'Luxury Villa with Recording Studio Costa Rica | Executive Vacations',
        metaDesc: 'Palacio Musical offers a professional recording studio inside a 12,500 sq ft beachfront villa in Costa Rica. Perfect for artists, musicians & creative retreats.',
        focusKeyword: 'luxury villa recording studio Costa Rica',
        text: `Palacio Musical: The Only Luxury Beachfront Villa with a Professional Recording Studio in Costa Rica\n\nImagine waking up to the sound of the Pacific, stepping onto your private ocean-view deck with a coffee in hand â€” and then heading downstairs to record in a fully equipped professional studio. That's the reality at Palacio Musical, the most unique luxury villa in Costa Rica.\n\nA Villa Built for Creatives\n\nPalacio Musical is a 12,500 sq ft beachfront estate in Tambor, Puntarenas â€” one of Costa Rica's most pristine and private coastlines. With 7 en-suite bedrooms, three ocean-view decks, a whale watching observatory, and a Tiki Bar, it's already one of the finest private villas in Central America.\n\nBut its most remarkable feature is its professional music studio â€” a fully equipped recording space embedded within a luxury beach house. There is nowhere else in the world quite like it.\n\nWho Stays at Palacio Musical?\n\nPalacio Musical attracts a rare kind of guest:\n\nâ€¢ Recording artists and bands seeking an inspiring, private studio session\nâ€¢ Music producers looking to create away from city distractions\nâ€¢ Labels organizing artist residencies or album recording trips\nâ€¢ Music-focused content creators and influencers\nâ€¢ Corporate groups in the creative industry seeking an unforgettable retreat\n\nThe villa accommodates up to 18 overnight guests â€” ideal for a band plus their team, or a group of collaborators working together.\n\nThe Setting Makes the Music\n\nCreativity doesn't happen in a vacuum. Palacio Musical's setting â€” humpback whales breaching just offshore, howler monkeys calling at dawn, the Pacific turning gold at sunset â€” is genuinely unlike anywhere else.\n\nThe Villa at a Glance\n\nâ€¢ Size: 12,500 sq ft  â€¢ Bedrooms: 7 en-suite  â€¢ Guests: up to 18\nâ€¢ Professional Music Studio  â€¢ Three ocean-view decks\nâ€¢ Whale Watching Observatory with Tiki Bar  â€¢ Direct secluded beach access\nâ€¢ Full staff: chef, housekeeping, concierge  â€¢ Enhanced security\nâ€¢ Combinable with adjacent Palacio Tropical for groups up to 36\n\nLocation\n\nTambor, Nicoya Peninsula â€” 30-minute flight from San JosÃ©. Santa Teresa is just 35 minutes away.\n\nNightly rates from $2,700 in low season. Download our free Pricing Guide at executivevacations.net/pricing.`,
      },
    },
    {
      label: 'Costa Rica luxury villa rental for large groups',
      value: {
        title: 'Costa Rica Luxury Villa Rental for Large Groups: The Complete 2026 Guide',
        metaTitle: 'Costa Rica Luxury Villa Large Group Rental | Executive Vacations',
        metaDesc: 'Planning a group trip to Costa Rica? Discover the best luxury villa rentals for 10â€“36 guests â€” private pools, full staff, beachfront access & concierge service.',
        focusKeyword: 'Costa Rica luxury villa large group rental',
        text: `Costa Rica Luxury Villa Rental for Large Groups: The Complete 2026 Guide\n\nCosta Rica has become one of the world's top destinations for group travel â€” warm year-round weather, extraordinary biodiversity, world-class beaches, and some of the most spectacular private villa rentals on the planet.\n\nWhy a Private Villa Beats a Hotel for Groups\n\nAt a private villa, your group has the entire property to yourselves. Multiple living areas, a private pool, communal dining, and shared outdoor spaces create the kind of group experience that bonds people â€” and creates memories that last decades.\n\nOur Villas for Large Groups\n\nPalacio Tropical (up to 18 guests) â€” Our flagship 7-bedroom, 10,500 sq ft beachfront estate. Direct secluded beach access, resort-style pool, full staff, and VIP-grade security.\n\nPalacio Musical (up to 18 guests) â€” A 12,500 sq ft oceanfront villa with three panoramic decks, a whale watching observatory, and a professional recording studio.\n\nThe View House (up to 10 guests) â€” A beautifully designed 4-bedroom villa with spectacular Pacific ocean views. Intimate and modern.\n\nThe Palms Villa Estate (up to 10 guests) â€” A lush tropical estate surrounded by gardens with a large private pool.\n\nCombining Villas for Groups of 20â€“36\n\nAll four villas are located close together and can be booked in combination. Palacio Tropical and Palacio Musical together accommodate up to 36 overnight guests â€” perfect for large families, corporate incentive trips, or destination events.\n\nWhat's Included\n\nâ€¢ Private pool exclusive to your group\nâ€¢ Full staff: private chef, butler, housekeeping, security, concierge\nâ€¢ Airport transfer coordination  â€¢ Activity and excursion planning  â€¢ 24/7 concierge support\n\nBest Group Travel Ideas\n\nâ€¢ Multi-family vacation  â€¢ Corporate retreat  â€¢ Creative/music industry retreat\nâ€¢ Bachelor/bachelorette  â€¢ Milestone birthday celebrations\n\nDownload our free Pricing Guide at executivevacations.net/pricing for exact villa rates and seasonal availability.`,
      },
    },
    {
      label: 'Whale watching in Tambor, Costa Rica: the ultimate guide',
      value: {
        title: 'Whale Watching in Tambor, Costa Rica: The Ultimate Guide',
        metaTitle: 'Whale Watching Tambor Costa Rica | Executive Vacations',
        metaDesc: 'Humpback whales visit Tambor Bay every year. Discover the best season, locations & where to stay for the ultimate whale watching experience in Costa Rica.',
        focusKeyword: 'whale watching Tambor Costa Rica',
        text: `Whale Watching in Tambor, Costa Rica: The Ultimate Guide\n\nOn the sheltered shores of Tambor Bay on the Nicoya Peninsula, one of nature's most breathtaking spectacles unfolds every year: humpback whales arrive to breed and birth in the warm Pacific waters, often just metres from shore.\n\nWhen Do Whales Visit Tambor?\n\nâ€¢ North Pacific humpbacks: December through April\nâ€¢ South Pacific humpbacks: July through October\n\nThis gives Tambor one of the longest whale watching seasons anywhere in the world â€” up to 8 months per year. Peak months are August through October, when South Pacific humpbacks arrive in greatest numbers, often with their calves.\n\nWhat You'll See\n\nâ€¢ Full breaches â€” the whale launching completely out of the water\nâ€¢ Spy-hopping â€” the whale raising its head vertically out of the sea\nâ€¢ Tail-slapping and pectoral fin waving\nâ€¢ Mother and calf pairs swimming close to shore\n\nWatching From Your Villa\n\nHumpbacks regularly approach within a few hundred metres of the shoreline â€” close enough to watch from your private villa terrace.\n\nPalacio Musical's Whale Watching Observatory with Tiki Bar is specifically designed for this purpose â€” imagine watching a full breach while sipping a cocktail as the sun drops behind the Pacific horizon. Palacio Tropical's elevated terrace and beach access offer the same extraordinary front-row experience.\n\nWhale Watching Tours from Tambor\n\nâ€¢ Small-group catamaran tours (2â€“4 hours)\nâ€¢ Private boat charters via our concierge\nâ€¢ Kayaking tours during peak season\n\nOther Wildlife at Tambor\n\nBottlenose dolphins (year-round), sea turtles (Julyâ€“October), scarlet macaws, and howler monkeys are regular sightings for villa guests.\n\nWhere to Stay\n\nPalacio Tropical from $2,400/night. Palacio Musical from $2,700/night.\nDownload our free Pricing Guide at executivevacations.net/pricing for whale season availability.`,
      },
    },
    {
      label: "Tambor, Costa Rica: the Nicoya Peninsula's best-kept luxury secret",
      value: {
        title: "Tambor, Costa Rica: The Nicoya Peninsula's Best-Kept Luxury Secret",
        metaTitle: 'Tambor Costa Rica Luxury Travel Guide | Executive Vacations',
        metaDesc: "Tambor is Costa Rica's most exclusive luxury destination â€” pristine bay, humpback whales, private beachfront villas & 35 min from Santa Teresa. Discover why.",
        focusKeyword: 'Tambor Costa Rica luxury vacation',
        text: `Tambor, Costa Rica: The Nicoya Peninsula's Best-Kept Luxury Secret\n\nWhile Santa Teresa and Montezuma attract the crowds, a short drive south on the Nicoya Peninsula reveals something rarer: Tambor Bay â€” a pristine, sheltered crescent of coastline that offers everything Costa Rica promises, without the noise.\n\nThis is where discerning travellers, dignitaries, and those who truly understand luxury have been quietly escaping for years.\n\nWhat Makes Tambor Different\n\nâ€¢ A calm, sheltered bay with warm Pacific water year-round\nâ€¢ Humpback whales visiting from offshore, up to 8 months a year\nâ€¢ Scarlet macaws flying over white sand beach at sunrise\nâ€¢ Jungle-backed coastline with virtually no development\nâ€¢ Total privacy for families, groups, and those who require discretion\n\nGetting to Tambor\n\nâ€¢ By air: 30-minute flight from San JosÃ© (SJO) to Tambor (TMU)\nâ€¢ By road: scenic drive via the Puntarenas ferry (approx. 3 hours)\nâ€¢ By private transfer: we coordinate door-to-door service for all villa guests\n\nWhat to Do in Tambor\n\nNature & Wildlife: whale watching, CurÃº National Wildlife Refuge, sea turtle watching (Julyâ€“Oct), scarlet macaw walks.\n\nAdventure: ATV tours, zip-lining, horseback riding on the beach, sport fishing, catamaran tours to Isla Tortuga.\n\nRelaxation: private pool time, beach yoga, massage and wellness services, sunset cocktails from your ocean-view terrace.\n\nDay Trips: Santa Teresa (35 min) for world-class surf and dining; Montezuma (45 min) for its famous waterfall; Cabo Blanco Nature Reserve.\n\nStay in Tambor\n\nExecutive Vacations Costa Rica manages four exclusive private villas in Tambor â€” Palacio Tropical, Palacio Musical, The View House, and The Palms Villa Estate â€” accommodating up to 36 overnight guests combined.\n\nDownload our free Pricing Guide at executivevacations.net/pricing to check availability.`,
      },
    },
    {
      label: 'The View House: luxury ocean-view villa near Santa Teresa, Costa Rica',
      value: {
        title: 'The View House: A Luxury Ocean-View Villa Near Santa Teresa, Costa Rica',
        metaTitle: 'Luxury Villa Near Santa Teresa Costa Rica | Executive Vacations',
        metaDesc: 'The View House is a stunning 4-bedroom luxury villa with Pacific ocean views, just 35 min from Santa Teresa. Private pool, whale watching & modern design.',
        focusKeyword: 'luxury villa near Santa Teresa Costa Rica',
        text: `The View House: A Luxury Ocean-View Villa Near Santa Teresa, Costa Rica\n\nSanta Teresa has become Costa Rica's most celebrated destination â€” world-class surf, acclaimed restaurants, yoga retreats, and a vibrant creative scene that draws A-list travellers from around the world. But for those who want complete privacy, a private pool, and views that take your breath away, the answer is 35 minutes down the road.\n\nIntroducing The View House\n\nThe View House is a beautifully designed, newly constructed luxury villa perched above the Pacific with some of the most spectacular ocean views in Costa Rica. Part of the Executive Vacations portfolio in Tambor, it's close enough to Santa Teresa for a perfect day trip â€” and far enough away for complete serenity.\n\nThe Villa\n\nâ€¢ Size: 2,400 sq ft of contemporary design\nâ€¢ Bedrooms: 4, each thoughtfully designed\nâ€¢ Guests: up to 10\nâ€¢ Private swimming pool with Pacific ocean views\nâ€¢ Multiple terraces and outdoor living areas\nâ€¢ Whale watching opportunities from the property\nâ€¢ Fully equipped modern kitchen  â€¢ Air conditioning throughout\n\nThe Perfect Base for Exploring Santa Teresa\n\nSanta Teresa is just 35 minutes away:\nâ€¢ Surf world-class waves at Playa Santa Teresa or Playa Hermosa\nâ€¢ Take a sunrise yoga class on the beach\nâ€¢ Dine at some of Costa Rica's finest restaurants\nâ€¢ Explore boutiques, art galleries, and independent shops\n\nPart of the Executive Vacations Family\n\nThe View House is located just 5 minutes from Palacio Tropical and Palacio Musical. It can be booked alongside one or both flagship estates for larger groups (up to 46 guests combined). Our concierge team serves all properties â€” so View House guests enjoy the same 24/7 service, activity coordination, and airport transfers.\n\nDownload our free Pricing Guide at executivevacations.net/pricing for exact rates and seasonal availability.`,
      },
    },
  ];
  const WEDDING_BLOG_TEMPLATES = [
    { label: 'â€” Load a template â€”', value: '' },
    {
      label: 'Intimate destination wedding in Costa Rica: under 50 guests',
      value: {
        title: 'Intimate Destination Wedding in Costa Rica: The Complete Guide for Small Weddings',
        metaTitle: 'Intimate Destination Wedding Costa Rica | Executive Vacations',
        metaDesc: 'Planning an intimate destination wedding in Costa Rica? A private estate in Tambor delivers the perfect small wedding experience for 20â€“50 guests.',
        focusKeyword: 'intimate destination wedding Costa Rica',
        site: 'wedding',
        text: `Intimate Destination Wedding in Costa Rica: The Complete Guide for Small Weddings\n\nNot every couple dreams of a 150-person reception. For many, the vision is different: a small, deeply personal celebration in a breathtaking location, surrounded only by the people who matter most. If that sounds like you, an intimate destination wedding in Costa Rica might be exactly what you're looking for.\n\nWhy Small Weddings Work Beautifully in Costa Rica\n\nCosta Rica's private estate venues are uniquely suited to intimate weddings. Unlike hotels designed for large crowds, a private beachfront villa creates a naturally immersive atmosphere where every guest feels close to the couple.\n\nWith a smaller guest list:\nâ€¢ Choose more personal ceremony settings â€” barefoot on the beach at sunrise\nâ€¢ Invest more per guest in food, wine, and experiences\nâ€¢ Spend meaningful time with every single person present\nâ€¢ Create a cohesive, intimate atmosphere from arrival to departure\n\nOur Silver Package: Perfect for Intimate Weddings\n\nFrom $17,900 (low season):\nâ€¢ 2 nights exclusive use of Palacio Musical\nâ€¢ Ceremony for up to 30 guests\nâ€¢ Welcome cocktail hour  â€¢ Brunch each morning  â€¢ Sit-down wedding dinner\nâ€¢ Full villa staff: private chef, butler, housekeeping, security, concierge\nâ€¢ Ceremony setup and basic dÃ©cor\n\nFor up to 50 guests, our Gold Package (from $26,900) extends to 3 nights with all-inclusive food and beverages.\n\nThe Setting: Palacio Musical\n\nOur intimate wedding packages are hosted at Palacio Musical â€” a 12,500 sq ft beachfront estate with three ocean-view decks, a Tiki Bar, and direct secluded beach access in Tambor. The multiple terrace levels create a natural flow: ceremony on the beach, cocktail hour on the middle deck, dinner under the stars on the upper terrace.\n\nWhat Makes an Intimate Wedding Unforgettable\n\nWhen there are 25 people instead of 150, every detail lands differently. The first dance feels real. The speeches are heard. Add the backdrop of the Pacific, humpback whales potentially visible offshore, and a Costa Rican sunset that seems almost impossible â€” and you have a wedding that guests will talk about for the rest of their lives.\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see full inclusions and availability.`,
      },
    },
    {
      label: 'All-inclusive wedding package Costa Rica: what to look for',
      value: {
        title: 'All-Inclusive Wedding Package in Costa Rica: What to Look For (and What to Avoid)',
        metaTitle: 'All-Inclusive Wedding Package Costa Rica | Executive Vacations',
        metaDesc: "Not all all-inclusive wedding packages are equal. Here's exactly what a genuine Costa Rica wedding package should include â€” and the red flags to avoid.",
        focusKeyword: 'all-inclusive wedding package Costa Rica',
        site: 'wedding',
        text: `All-Inclusive Wedding Package in Costa Rica: What to Look For (and What to Avoid)\n\nThe phrase "all-inclusive" sounds reassuring. But not all packages are equal â€” and the difference between a genuinely comprehensive package and a misleading one can add tens of thousands of dollars to your final bill.\n\nWhat Should Be Included: The Full Checklist\n\nVenue: âœ“ Exclusive property use  âœ“ Ceremony space setup  âœ“ Reception and dining areas  âœ“ Pool and beach access  âœ“ Accommodation for overnight guests\n\nFood & Beverage: âœ“ Welcome cocktail hour  âœ“ Full brunch every morning  âœ“ Sit-down wedding dinner  âœ“ Wine, beer, and beverages throughout  âœ“ Dietary accommodations at no extra charge\n\nStaff & Service: âœ“ Private chef and catering team  âœ“ Butler service  âœ“ Daily housekeeping  âœ“ On-site security  âœ“ Dedicated concierge throughout\n\nRed Flags to Watch For\n\nðŸš© Per-person pricing that escalates rapidly\nðŸš© Venue fee charged separately from catering\nðŸš© Beverage package sold as an add-on\nðŸš© Staff fees listed separately\nðŸš© Setup fee for ceremony dÃ©cor\nðŸš© Minimum spend clauses not disclosed upfront\n\nHow Our Packages Are Structured\n\nSilver â€” From $17,900. 2 nights, up to 30 ceremony guests.\nGold â€” From $26,900. 3 nights, up to 50 ceremony guests.\nPlatinum â€” From $63,900. 5 nights, Palacio Musical + Palacio Tropical, up to 75 ceremony guests.\nDiamond â€” From $101,900. 7 nights, all four villas, up to 100 ceremony guests + private catamaran.\n\nWhen you read the price, you know the price. No hidden fees, no per-person surprises, no add-on charges.\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to compare all four packages and request your dates.`,
      },
    },
    {
      label: 'Getting married in Costa Rica: legal requirements explained',
      value: {
        title: 'Getting Married in Costa Rica: Legal Requirements Explained (And What Most Couples Actually Do)',
        metaTitle: 'Getting Married in Costa Rica Legal Requirements | Executive Vacations',
        metaDesc: 'Thinking of getting legally married in Costa Rica? Here are the real requirements â€” and why most destination wedding couples choose a simpler approach.',
        focusKeyword: 'getting married in Costa Rica requirements',
        site: 'wedding',
        text: `Getting Married in Costa Rica: Legal Requirements Explained (And What Most Couples Actually Do)\n\nOne of the first questions couples ask when planning a destination wedding in Costa Rica is: "Can we get legally married there?" The answer is yes. But there's also a very popular alternative worth understanding.\n\nOption 1: Legally Marry in Costa Rica\n\nCosta Rica fully recognizes civil and religious marriages performed by registered officiants. Both partners typically need:\n\nâ€¢ Valid passport\nâ€¢ Birth certificate (apostilled / certified for international use)\nâ€¢ If previously married: divorce decree or death certificate (apostilled)\nâ€¢ Legal name and personal details of two witnesses\nâ€¢ A locally registered officiant or civil registry notary\n\nDocuments in languages other than Spanish must be officially translated. Plan at least 2â€“3 months ahead.\n\nOption 2: Legal Ceremony at Home, Symbolic Ceremony in Costa Rica\n\nThis is by far the most popular approach for destination wedding couples.\n\nHow it works:\nâ€¢ A small legal ceremony at home before your Costa Rica trip\nâ€¢ Your Costa Rica wedding is a full, elaborate ceremony â€” vows, rings, officiant, speeches, celebration â€” simply without the legal paperwork\nâ€¢ Guests experience a complete, beautiful wedding\n\nMany couples find this liberating. You focus entirely on the experience â€” the ceremony on the beach, the celebration, the people â€” without any administrative stress during your stay.\n\nSame-Sex Marriage in Costa Rica\n\nCosta Rica legalized same-sex marriage in May 2020 â€” the first country in Central America to do so. All couples have identical legal rights and processes.\n\nThe Officiant\n\nWe work with experienced bilingual officiants who craft ceremonies that truly reflect your relationship â€” from traditional and religious to modern and deeply personal.\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages or contact us directly to discuss your vision.`,
      },
    },
    {
      label: 'Costa Rica wedding venue: private estate vs resort vs public beach',
      value: {
        title: 'Costa Rica Wedding Venue: Private Estate vs. Resort vs. Public Beach',
        metaTitle: 'Costa Rica Wedding Venue Comparison | Executive Vacations',
        metaDesc: 'Comparing Costa Rica wedding venues? We break down the real differences between private estates, resorts, and public beaches â€” privacy, cost, service & experience.',
        focusKeyword: 'Costa Rica wedding venue comparison',
        site: 'wedding',
        text: `Costa Rica Wedding Venue: Private Estate vs. Resort vs. Public Beach\n\nChoosing your venue is the single most important decision in destination wedding planning. In Costa Rica, three main options exist â€” and they offer genuinely different experiences.\n\nOption 1: Private Estate â€” The Gold Standard\n\nAt a private estate like Palacio Musical or Palacio Tropical, the entire property is exclusively yours.\n\nâœ“ Complete privacy â€” no hotel guests, no shared spaces\nâœ“ Guests sleep, eat, and celebrate in the same property\nâœ“ Private chef and fully personalized catering\nâœ“ Total flexibility on timing â€” no curfews or hotel restrictions\nâœ“ All-inclusive packages eliminate hidden costs\nâœ“ Multiple ceremony and reception settings within one property\n\nBest for: Couples who prioritize privacy, personalization, and a cohesive guest experience.\n\nOption 2: Resort or Hotel Venue\n\nâœ“ Established infrastructure for large events\n\nâœ— You share the property with all other hotel guests\nâœ— Another event may be happening on the same day\nâœ— Standardized catering menus â€” limited personalization\nâœ— Per-person pricing adds up quickly\nâœ— Hotel rules and curfews limit the celebration\n\nBest for: Very large weddings where raw capacity is the primary concern.\n\nOption 3: Public Beach\n\nâœ“ Maximum natural setting, lower headline cost\n\nâœ— Permits required from local authorities\nâœ— No facilities on-site: no toilets, catering infrastructure, or seating\nâœ— Public access cannot be restricted in Costa Rica\nâœ— All logistics must be brought in and removed\n\nBest for: Ultra-informal micro-ceremonies only.\n\nOur Recommendation\n\nFor most couples, a private estate delivers the best combination of experience, flexibility, privacy, and value. Our Tambor estates have hosted weddings for couples from across the world, consistently receiving the highest reviews for seamless luxury and personal service.\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see what's included and request your preferred dates.`,
      },
    },
    {
      label: "Your wedding guests will love Costa Rica â€” here's why",
      value: {
        title: "Your Wedding Guests Will Love Costa Rica â€” Here's Exactly Why",
        metaTitle: 'Why Wedding Guests Love Costa Rica | Executive Vacations',
        metaDesc: "Worried your guests won't travel to Costa Rica for your wedding? Here's why destination wedding guests consistently say it was the trip of their lives.",
        focusKeyword: 'destination wedding guest experience Costa Rica',
        site: 'wedding',
        text: `Your Wedding Guests Will Love Costa Rica â€” Here's Exactly Why\n\nWhen couples announce a destination wedding, the immediate internal question from guests is almost always: "Do I really have to travel all that way?" By the end of a Costa Rica destination wedding, those same guests are typically the loudest advocates â€” telling everyone they know they need to go.\n\n1. It's More Accessible Than They Think\n\nNon-stop flights from major US cities reach San JosÃ© (SJO) in 3â€“4 hours. From there, it's a 30-minute domestic flight to Tambor â€” or a scenic 3-hour drive via the Puntarenas ferry. We coordinate all guest transfers.\n\n2. The Setting Is Genuinely Extraordinary\n\nYour guests have probably been to weddings in hotels, barns, and country clubs. They have almost certainly never attended a wedding at a private beachfront estate with humpback whales visible offshore. The moment guests arrive at Palacio Tropical or Palacio Musical and step onto an ocean-view terrace is one of those moments people photograph and talk about for years.\n\n3. They Get a Full Vacation, Not Just a Wedding\n\nFor most guests, a destination wedding is an invitation to take a trip they wouldn't have taken on their own. Costa Rica delivers:\n\nâ€¢ World-class surfing (Santa Teresa is 35 minutes away)\nâ€¢ ATV tours, zip-lining, whale watching, yoga retreats\nâ€¢ Extraordinary wildlife â€” scarlet macaws, howler monkeys, sea turtles\nâ€¢ Acclaimed restaurants and vibrant beach culture\n\n4. They Stay in a Villa Together\n\nThe communal aspect of a private estate creates something hotels can't replicate: the experience of your entire group living together in a spectacular home. Morning coffee on the terrace, a group swim before lunch, late-night conversations on the beach â€” these shared moments are often what guests remember most.\n\n5. The Food Is Remarkable\n\nOur private chefs create bespoke menus from Costa Rica's exceptional fresh produce â€” Pacific seafood, tropical fruits, and local ingredients. The food is consistently one of the most praised highlights.\n\n6. They'll Try to Book Their Own Trip Before They Leave\n\nThis is perhaps the most consistent feedback we receive: guests requesting villa pricing before they've even departed. A Costa Rica destination wedding introduces people to a place they return to again and again.\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see how we create an experience your guests will spend years talking about.`,
      },
    },
  ];  const [blogEditMode, setBlogEditMode] = useState(false);
  const [blogDeleteConfirm, setBlogDeleteConfirm] = useState(null);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsDeleteConfirm, setLeadsDeleteConfirm] = useState(null);

  // Settings state (PDF URL etc.)
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUrlSaving, setPdfUrlSaving] = useState(false);
  const [pdfUrlSaved, setPdfUrlSaved] = useState(false);

  // Messages / templates state
  const [msgTemplates, setMsgTemplates] = useState(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSaving, setMsgSaving] = useState(false);
  const [msgSaved, setMsgSaved] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') loadAllReviews();
    if (activeTab === 'qr') loadQrStats();
    if (activeTab === 'blog') loadBlogPosts();
    if (activeTab === 'leads') { loadLeads(); loadPdfUrl(); }
    if (activeTab === 'messages') loadMsgTemplates();
  }, [activeTab]);

  const loadMsgTemplates = async () => {
    setMsgLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-message-templates');
      if (res.ok) setMsgTemplates(await res.json());
    } catch {}
    setMsgLoading(false);
  };

  const saveMsgTemplates = async () => {
    setMsgSaving(true);
    setMsgSaved(false);
    try {
      const res = await fetch('/.netlify/functions/save-message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgTemplates),
      });
      if (res.ok) { setMsgSaved(true); setTimeout(() => setMsgSaved(false), 3000); }
    } catch {}
    setMsgSaving(false);
  };

  const loadQrStats = async () => {
    setQrStatsLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-qr-stats');
      if (res.ok) {
        const data = await res.json();
        setQrStats(data);
      }
    } catch {
      setQrStats({});
    }
    setQrStatsLoading(false);
  };

  const loadBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-blog-posts');
      if (res.ok) setBlogPosts(await res.json());
    } catch { setBlogPosts([]); }
    setBlogLoading(false);
  };

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-leads');
      if (res.ok) setLeads(await res.json());
    } catch { setLeads([]); }
    setLeadsLoading(false);
  };

  const handleDeleteLead = async (id) => {
    try {
      const res = await fetch('/.netlify/functions/delete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setLeads(prev => prev.filter(l => l.id !== id)); setLeadsDeleteConfirm(null); }
      else alert('Failed to delete lead.');
    } catch { alert('Failed to delete lead.'); }
  };

  const loadPdfUrl = async () => {
    try {
      const res = await fetch('/.netlify/functions/get-settings');
      if (res.ok) { const data = await res.json(); if (data.pricingPdfUrl) setPdfUrl(data.pricingPdfUrl); }
    } catch (_) {}
  };

  const handleSavePdfUrl = async () => {
    setPdfUrlSaving(true);
    try {
      await fetch('/.netlify/functions/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingPdfUrl: pdfUrl }),
      });
      setPdfUrlSaved(true);
      setTimeout(() => setPdfUrlSaved(false), 2500);
    } catch (_) {}
    setPdfUrlSaving(false);
  };

  const exportLeadsCsv = () => {
    if (!leads.length) return;
    const headers = ['Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Villa Interest'];
    const rows = leads.map(l => [
      new Date(l.createdAt).toLocaleDateString('en-US'),
      l.firstName, l.lastName, l.email, l.phone, l.villaInterest,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetBlogForm = () => {
    setBlogForm({ id: '', title: '', text: '', imageUrl: '', date: new Date().toISOString().split('T')[0], metaTitle: '', metaDesc: '', focusKeyword: '', site: 'villa' });
    setBlogEditMode(false);
  };

  const handleBlogSave = async () => {
    if (!blogForm.title.trim() || !blogForm.text.trim()) return;
    setBlogSaving(true);
    try {
      const res = await fetch('/.netlify/functions/save-blog-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm),
      });
      if (res.ok) { await loadBlogPosts(); resetBlogForm(); }
      else alert('Failed to save post.');
    } catch { alert('Failed to save post.'); }
    setBlogSaving(false);
  };

  const handleBlogDelete = async (id) => {
    try {
      const res = await fetch('/.netlify/functions/delete-blog-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { await loadBlogPosts(); setBlogDeleteConfirm(null); }
      else alert('Failed to delete post.');
    } catch { alert('Failed to delete post.'); }
  };

  const handleBlogEdit = (post) => {
    setBlogForm({
      id: post.id,
      title: post.title,
      text: post.text,
      imageUrl: post.imageUrl || '',
      date: post.date ? post.date.split('T')[0] : new Date().toISOString().split('T')[0],
      metaTitle: post.metaTitle || '',
      metaDesc: post.metaDesc || '',
      focusKeyword: post.focusKeyword || '',
      site: post.site || 'villa',
    });
    setBlogEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadBookings = async () => {
    setLoading(true);
    const data = await getBookings();
    setBookings(data);
    setLoading(false);
  };

  const handleCreateBooking = async (bookingData) => {
    await saveBooking(bookingData);
    await loadBookings();
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    await deleteBooking(bookingId);
    await loadBookings();
    setShowDeleteConfirm(null);
    setEditingBooking(null);
    setIsModalOpen(false);
  };

  const handleBookingClick = (booking) => {
    setShowDeleteConfirm(booking);
  };

  const cleanupInvalidBookings = async () => {
    const invalidBookings = bookings.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return end < start;
    });

    if (invalidBookings.length === 0) {
      alert('No invalid bookings found!');
      return;
    }

    const confirmMsg = `Found ${invalidBookings.length} invalid booking(s):\n\n${invalidBookings.map(b => `- ${b.customerName} (${b.startDate} to ${b.endDate})`).join('\n')}\n\nDelete these bookings?`;
    
    if (window.confirm(confirmMsg)) {
      for (const booking of invalidBookings) {
        await deleteBooking(booking.id);
      }
      await loadBookings();
      alert(`Deleted ${invalidBookings.length} invalid booking(s)!`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Parse as local date to avoid timezone shift
    let date;
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const [year, month, day] = dateString.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const VILLA_NAMES = ['Palacio Tropical', 'Palacio Musical', 'The View House', 'The Palms Villa Estate'];

  const loadAllReviews = async () => {
    setReviewsLoading(true);
    try {
      const results = await Promise.all(
        VILLA_NAMES.map(async (villa) => {
          const res = await fetch(`/.netlify/functions/get-reviews?villa=${encodeURIComponent(villa)}&all=1`);
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data) ? data.map(r => ({ ...r, villaName: villa })) : [];
        })
      );
      setReviews(results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setReviews([]);
    }
    setReviewsLoading(false);
  };

  const handleDeleteReview = async (villa, id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch('/.netlify/functions/delete-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villa, id }),
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => !(r.villaName === villa && r.id === id)));
      } else {
        alert('Failed to delete review.');
      }
    } catch {
      alert('Failed to delete review.');
    }
  };

  const handleApproveReview = async (villa, id) => {
    try {
      const res = await fetch('/.netlify/functions/approve-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villa, id }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r =>
          r.villaName === villa && r.id === id ? { ...r, approved: true } : r
        ));
      } else {
        alert('Failed to approve review.');
      }
    } catch {
      alert('Failed to approve review.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #c9a96e, #a07040)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Passwort eingeben um fortzufahren</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                placeholder="Passwort"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.1)',
                  border: passwordError ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '4px'
                }}
              />
              {passwordError && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>Falsches Passwort</p>
              )}
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #c9a96e, #a07040)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.target.style.opacity='0.85'}
              onMouseOut={e => e.target.style.opacity='1'}
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-0 md:mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-luxury-gold rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h1 className="text-base md:text-2xl font-bold text-dark">Admin Dashboard</h1>
              </div>
              <p className="body-regular text-gray hidden md:block">Manage villa reservations and bookings</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={cleanupInvalidBookings}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cleanup
              </button>
              <button
                onClick={() => setShowICalModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                iCal Link
              </button>
              <button
                onClick={() => {
                  setEditingBooking(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-luxury flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 pb-24 md:pb-8">
        {/* Tab switcher */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'bookings'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'bookings' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'reviews'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'reviews' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            ⭐ Reviews
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'qr'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'qr' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            📱 QR Tracking
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'blog'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'blog' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            📝 Blog
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'leads'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'leads' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            📋 Leads
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'messages'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'messages' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            ✉️ Messages
          </button>
          <button
            onClick={() => setActiveTab('wedding')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'wedding'
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
            style={activeTab === 'wedding' ? { background: 'linear-gradient(135deg, #c9a96e, #a07040)' } : {}}
          >
            💍 Wedding Quote
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            {isModalOpen ? (
              <BookingModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setEditingBooking(null);
                }}
                onSave={handleCreateBooking}
                editingBooking={editingBooking}
              />
            ) : (
              <>
            {/* Mobile-only action bar */}
            <div className="md:hidden flex gap-2 mb-4">
              <button
                onClick={cleanupInvalidBookings}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold active:scale-95 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Cleanup
              </button>
              <button
                onClick={() => setShowICalModal(true)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-semibold active:scale-95 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                iCal Link
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{bookings.length}</div>
                    <div className="text-sm text-gray">Total Bookings</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">
                      {bookings.filter(b => new Date(b.endDate) >= new Date()).length}
                    </div>
                    <div className="text-sm text-gray">Active Bookings</div>
                  </div>
                </div>
              </div>
            </div>

            <BookingCalendar
              bookings={bookings}
              onBookingClick={handleBookingClick}
            />
          </>
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Guest Reviews</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} across all villas
                  {reviews.filter(r => !r.approved).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
                      {reviews.filter(r => !r.approved).length} pending
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={loadAllReviews}
                disabled={reviewsLoading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${reviewsLoading ? 'animate-spin' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {reviewsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {reviewsLoading && (
              <div className="text-center py-16 text-gray-400">Loading reviews…</div>
            )}

            {!reviewsLoading && reviews.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">⭐</div>
                <p className="text-gray-500 font-medium">No reviews yet</p>
              </div>
            )}

            {!reviewsLoading && reviews.length > 0 && (
              <>
                {/* Mobile: Card list */}
                <div className="md:hidden space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={`${review.villaName}-${review.id}-mob`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                      style={!review.approved ? { background: '#fffbeb', borderColor: '#fde68a' } : {}}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {review.approved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>✓ Live</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>⏳ Pending</span>
                          )}
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>{review.villaName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!review.approved && (
                            <button onClick={() => handleApproveReview(review.villaName, review.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          )}
                          <button onClick={() => handleDeleteReview(review.villaName, review.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{review.name}</div>
                      <div className="mb-2">
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                      {review.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      )}
                    </div>
                  ))}
                </div>
                {/* Desktop: Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Villa</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Guest</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Rating</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Review</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr
                        key={`${review.villaName}-${review.id}`}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        style={!review.approved ? { background: '#fffbeb' } : {}}
                      >
                        <td className="px-6 py-4">
                          {review.approved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: '#fef3c7', color: '#92400e' }}
                          >
                            {review.villaName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{review.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                          <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs">
                          <span title={review.text}>
                            {review.text.length > 80 ? review.text.slice(0, 80) + '…' : review.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {!review.approved && (
                              <button
                                onClick={() => handleApproveReview(review.villaName, review.id)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                title="Approve review"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(review.villaName, review.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete review"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">QR Code Tracking</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track how many visitors arrive via your printed QR codes
                </p>
              </div>
              <button
                onClick={loadQrStats}
                disabled={qrStatsLoading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${qrStatsLoading ? 'animate-spin' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {qrStatsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                How it works
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Point your QR code to a URL with a <code className="bg-blue-100 px-1 rounded">?ref=</code> parameter.
                Every scan is automatically counted here in the admin.
              </p>
              <p className="text-sm text-blue-700 font-mono break-all">
                {window.location.origin}/?ref=flyer
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can use any name after <code>ref=</code> — e.g. <em>flyer-may</em>, <em>hotel-lobby</em>, <em>magazine</em>
              </p>
            </div>

            {/* Generate new QR code */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Generate a QR Code</h3>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Reference name
                  </label>
                  <input
                    type="text"
                    value={newQrRef}
                    onChange={e => setNewQrRef(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50))}
                    placeholder="e.g. flyer, hotel-lobby"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
                <div className="text-sm text-gray-400 pb-2.5">→</div>
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Tracking URL
                  </label>
                  <div className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 font-mono break-all">
                    {newQrRef
                      ? `${window.location.origin}/?ref=${newQrRef}`
                      : <span className="text-gray-400 italic">Enter a name above</span>}
                  </div>
                </div>
              </div>

              {newQrRef && (
                <div className="mt-6 flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/?ref=' + newQrRef)}&margin=10`}
                      alt={`QR code for ref=${newQrRef}`}
                      className="rounded-xl border border-gray-200 shadow"
                      width={180}
                      height={180}
                    />
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(window.location.origin + '/?ref=' + newQrRef)}&margin=10`}
                      download={`qr-${newQrRef}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      ↓ Download high-res PNG
                    </a>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2 pt-1">
                    <p className="font-semibold text-gray-800">Ready to print!</p>
                    <p>Scan the QR code or print it on your flyer.</p>
                    <p>Every visit from this code will be counted under <strong>{newQrRef}</strong> in the table below.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats table */}
            {qrStatsLoading && (
              <div className="text-center py-16 text-gray-400">Loading stats…</div>
            )}

            {!qrStatsLoading && Object.keys(qrStats).length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">📱</div>
                <p className="text-gray-500 font-medium">No QR visits tracked yet</p>
                <p className="text-sm text-gray-400 mt-1">Scans will appear here automatically</p>
              </div>
            )}

            {!qrStatsLoading && Object.keys(qrStats).length > 0 && (
              <>
                {/* Mobile: QR Stats Cards */}
                <div className="md:hidden space-y-3">
                  {Object.entries(qrStats)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([ref, data]) => {
                      const today = new Date().toISOString().split('T')[0];
                      const todayCount = data.daily?.[today] || 0;
                      const last7 = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return data.daily?.[d.toISOString().split('T')[0]] || 0;
                      }).reduce((a, b) => a + b, 0);
                      const trackingUrl = `${window.location.origin}/?ref=${ref}`;
                      return (
                        <div key={ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>{ref}</span>
                            <span className="text-2xl font-bold text-gray-900">{data.total} <span className="text-sm font-normal text-gray-400">scans</span></span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className={`text-xl font-bold ${todayCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>{todayCount}</div>
                              <div className="text-xs text-gray-500">Today</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-xl font-bold text-gray-700">{last7}</div>
                              <div className="text-xs text-gray-500">Last 7 days</div>
                            </div>
                          </div>
                          {data.lastVisit && (
                            <p className="text-xs text-gray-400 mb-3">Last scan: {new Date(data.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-500 break-all flex-1">{trackingUrl}</code>
                            <button
                              onClick={() => navigator.clipboard.writeText(trackingUrl)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex-shrink-0"
                            >Copy</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Desktop: QR Stats Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">QR / Ref</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Total Scans</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Today</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Last 7 Days</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Last Scan</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Tracking URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(qrStats)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([ref, data]) => {
                        const today = new Date().toISOString().split('T')[0];
                        const todayCount = data.daily?.[today] || 0;
                        const last7 = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - i);
                          return data.daily?.[d.toISOString().split('T')[0]] || 0;
                        }).reduce((a, b) => a + b, 0);
                        const trackingUrl = `${window.location.origin}/?ref=${ref}`;
                        return (
                          <tr key={ref} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                                style={{ background: '#fef3c7', color: '#92400e' }}
                              >
                                {ref}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-2xl font-bold text-gray-900">{data.total}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${todayCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {todayCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-700">{last7}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                              {data.lastVisit
                                ? new Date(data.lastVisit).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })
                                : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-gray-500 break-all">{trackingUrl}</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {blogEditMode ? '✏️ Edit Post' : '✍️ New Blog Post'}
              </h2>
              <div className="space-y-4">
                {/* Template loader */}
                {!blogEditMode && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">📋 Load SEO Template</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 bg-white"
                      onChange={e => {
                        const templates = blogForm.site === 'wedding' ? WEDDING_BLOG_TEMPLATES : BLOG_TEMPLATES;
                        const tpl = templates.find(t => t.label === e.target.value);
                        if (tpl && tpl.value) setBlogForm(f => ({ ...f, ...tpl.value }));
                      }}
                    >
                      {(blogForm.site === 'wedding' ? WEDDING_BLOG_TEMPLATES : BLOG_TEMPLATES).map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Templates are pre-written and SEO-optimized — you can edit before publishing.</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title *</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Enter post title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      value={blogForm.date}
                      onChange={e => setBlogForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Image URL (optional)</label>
                    <input
                      type="url"
                      value={blogForm.imageUrl}
                      onChange={e => setBlogForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>
                </div>
                {blogForm.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-100" style={{ maxHeight: '200px' }}>
                    <img src={blogForm.imageUrl} alt="preview" className="w-full object-cover" style={{ maxHeight: '200px' }} />
                  </div>
                )}
                {/* Publish to */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">🌐 Publish to</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'villa', label: '🏡 Villa Site' },
                      { value: 'wedding', label: '💍 Wedding Site' },
                      { value: 'both', label: '✨ Both Sites' },
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${blogForm.site === opt.value ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="blogSite"
                          value={opt.value}
                          checked={blogForm.site === opt.value}
                          onChange={() => setBlogForm(f => ({ ...f, site: opt.value }))}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Text *</label>
                  <textarea
                    value={blogForm.text}
                    onChange={e => setBlogForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Write your post here… Use blank lines to separate paragraphs."
                    rows={10}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-y"
                  />
                </div>

                {/* SEO Fields */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">🔍 SEO Settings</p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Focus Keyword</label>
                    <input
                      type="text"
                      value={blogForm.focusKeyword}
                      onChange={e => setBlogForm(f => ({ ...f, focusKeyword: e.target.value }))}
                      placeholder="e.g. luxury villa Costa Rica cost"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Meta Title <span className="text-gray-400 font-normal">(shown in Google — max 60 chars)</span>
                    </label>
                    <input
                      type="text"
                      value={blogForm.metaTitle}
                      onChange={e => setBlogForm(f => ({ ...f, metaTitle: e.target.value }))}
                      placeholder="Leave empty to use post title"
                      maxLength={60}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                    />
                    <p className="text-xs text-gray-400 mt-1">{blogForm.metaTitle.length}/60 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Meta Description <span className="text-gray-400 font-normal">(shown in Google — max 155 chars)</span>
                    </label>
                    <textarea
                      value={blogForm.metaDesc}
                      onChange={e => setBlogForm(f => ({ ...f, metaDesc: e.target.value }))}
                      placeholder="A short description that appears in Google search results…"
                      rows={3}
                      maxLength={155}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-none"
                    />
                    <p className={`text-xs mt-1 ${blogForm.metaDesc.length > 140 ? 'text-orange-500' : 'text-gray-400'}`}>{blogForm.metaDesc.length}/155 characters</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  {blogEditMode && (
                    <button
                      onClick={resetBlogForm}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleBlogSave}
                    disabled={blogSaving || !blogForm.title.trim() || !blogForm.text.trim()}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #c9a96e, #a07040)' }}
                  >
                    {blogSaving ? 'Saving…' : blogEditMode ? 'Save Changes' : 'Publish Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Post list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Published Posts ({blogPosts.length})
                </h3>
                <button
                  onClick={loadBlogPosts}
                  disabled={blogLoading}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  <svg className={`w-3.5 h-3.5 ${blogLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {blogLoading && <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>}

              {!blogLoading && blogPosts.length === 0 && (
                <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-500 text-sm font-medium">No posts yet. Create your first one above!</p>
                </div>
              )}

              {!blogLoading && blogPosts.length > 0 && (
                <div className="space-y-3">
                  {blogPosts.map(post => {
                    const d = new Date(post.date);
                    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const excerpt = post.text.length > 120 ? post.text.slice(0, 120) + '…' : post.text;
                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-0"
                        style={{ minHeight: '96px' }}
                      >
                        {post.imageUrl && (
                          <div style={{ width: '100px', flexShrink: 0, overflow: 'hidden' }}>
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" style={{ height: '100%' }} />
                          </div>
                        )}
                        <div className="flex-1 px-5 py-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#b8972e' }}>{dateStr}</div>
                            <div className="font-bold text-gray-900 text-sm leading-snug mb-1">{post.title}</div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${post.site === 'wedding' ? 'bg-pink-100 text-pink-700' : post.site === 'both' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                {post.site === 'wedding' ? '💍 Wedding' : post.site === 'both' ? '✨ Both' : '🏡 Villa'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 leading-relaxed">{excerpt}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleBlogEdit(post)}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                              title="Edit post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {blogDeleteConfirm === post.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleBlogDelete(post.id)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setBlogDeleteConfirm(null)}
                                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-gray-400 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setBlogDeleteConfirm(post.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete post"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pricing Guide Leads</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Customers who requested the pricing brochure — {leads.length} total
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportLeadsCsv}
                  disabled={!leads.length}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={loadLeads}
                  disabled={leadsLoading}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  <svg className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* PDF URL Setting */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Pricing Guide PDF URL
              </h3>
              <p className="text-xs text-blue-700 mb-3">Upload your PDF to any hosting (e.g. Google Drive, Dropbox) and paste the direct download link here.</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={e => setPdfUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-blue-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleSavePdfUrl}
                  disabled={pdfUrlSaving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: pdfUrlSaved ? '#10b981' : 'linear-gradient(135deg, #c9a96e, #a07040)' }}
                >
                  {pdfUrlSaved ? '✓ Saved' : pdfUrlSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {/* Leads table */}
            {leadsLoading && <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>}

            {!leadsLoading && leads.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No leads yet</p>
                <p className="text-sm text-gray-400 mt-1">Submissions from the Pricing page will appear here</p>
              </div>
            )}

            {!leadsLoading && leads.length > 0 && (
              <>
                {/* Mobile: Leads Cards */}
                <div className="md:hidden space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{lead.firstName} {lead.lastName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>{lead.villaInterest}</span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            {lead.phone}
                          </a>
                        )}
                      </div>
                      <div className="flex justify-end">
                        {leadsDeleteConfirm === lead.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteLead(lead.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold">Delete</button>
                            <button onClick={() => setLeadsDeleteConfirm(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setLeadsDeleteConfirm(lead.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete lead">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop: Leads Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Phone</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Villa Interest</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="px-5 py-4">
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                          <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
                            {lead.villaInterest}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {leadsDeleteConfirm === lead.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteLead(lead.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all">Delete</button>
                              <button onClick={() => setLeadsDeleteConfirm(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-gray-400 transition-all">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setLeadsDeleteConfirm(lead.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete lead">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Message Templates</h2>
              <p className="text-sm text-gray-500 mt-1">Customize the SMS and email messages sent to leads. Use <code className="bg-gray-100 px-1 rounded">{'{firstName}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{villaInterest}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{siteUrl}'}</code> as placeholders.</p>
            </div>

            {msgLoading && <div className="text-center py-12 text-gray-400 text-sm">Loading templates…</div>}

            {!msgLoading && msgTemplates && (
              <div className="space-y-5">
                {/* Follow-up delay setting */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <label className="block text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">Follow-up delay (days after sign-up)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={msgTemplates.followUpDelayDays || 3}
                    onChange={e => setMsgTemplates(t => ({ ...t, followUpDelayDays: parseInt(e.target.value) || 3 }))}
                    className="w-20 border border-blue-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Welcome SMS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📱</span>
                    <h3 className="font-bold text-gray-900">Welcome SMS</h3>
                    <span className="ml-auto text-xs text-gray-400">Sent immediately after sign-up</span>
                  </div>
                  <textarea
                    rows={4}
                    value={msgTemplates.welcomeSms || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, welcomeSms: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-1">{(msgTemplates.welcomeSms || '').length} chars (keep under 160 for 1 SMS)</p>
                </div>

                {/* Welcome Email */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">✉️</span>
                    <h3 className="font-bold text-gray-900">Welcome Email</h3>
                    <span className="ml-auto text-xs text-gray-400">Sent immediately after sign-up</span>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    value={msgTemplates.welcomeEmail?.subject || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, welcomeEmail: { ...t.welcomeEmail, subject: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 mb-3"
                  />
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Body</label>
                  <textarea
                    rows={8}
                    value={msgTemplates.welcomeEmail?.body || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, welcomeEmail: { ...t.welcomeEmail, body: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-y"
                  />
                </div>

                {/* Follow-up SMS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📱</span>
                    <h3 className="font-bold text-gray-900">Follow-up SMS</h3>
                    <span className="ml-auto text-xs text-gray-400">Sent after {msgTemplates.followUpDelayDays || 3} days</span>
                  </div>
                  <textarea
                    rows={4}
                    value={msgTemplates.followUpSms || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, followUpSms: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-1">{(msgTemplates.followUpSms || '').length} chars (keep under 160 for 1 SMS)</p>
                </div>

                {/* Follow-up Email */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">✉️</span>
                    <h3 className="font-bold text-gray-900">Follow-up Email</h3>
                    <span className="ml-auto text-xs text-gray-400">Sent after {msgTemplates.followUpDelayDays || 3} days</span>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    value={msgTemplates.followUpEmail?.subject || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, followUpEmail: { ...t.followUpEmail, subject: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 mb-3"
                  />
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Body</label>
                  <textarea
                    rows={8}
                    value={msgTemplates.followUpEmail?.body || ''}
                    onChange={e => setMsgTemplates(t => ({ ...t, followUpEmail: { ...t.followUpEmail, body: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 resize-y"
                  />
                </div>

                {/* Webhook info box */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    SMS Reply Webhook (Twilio setup)
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">In your Twilio Console, set the Messaging webhook URL to:</p>
                  <code className="block text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 break-all">
                    {window.location.origin}/.netlify/functions/sms-reply
                  </code>
                  <p className="text-xs text-gray-500 mt-2">When a lead replies to your SMS, you'll receive a notification email at your ADMIN_EMAIL address.</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveMsgTemplates}
                    disabled={msgSaving}
                    className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: msgSaved ? '#10b981' : 'linear-gradient(135deg, #c9a96e, #a07040)' }}
                  >
                    {msgSaved ? '✓ Saved!' : msgSaving ? 'Saving…' : 'Save Templates'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wedding' && (
          <div style={{ paddingBottom: '32px' }}>
            <WeddingQuoteBuilder />
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="w-full max-w-4xl animate-slideUp"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px 20px',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)',
                pointerEvents: 'none'
              }}></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Booking Details</h3>
                    <p className="text-white/70 text-xs font-medium">Manage reservation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  className="hover:scale-110 hover:bg-white/30"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div 
              style={{ 
                padding: '16px',
                overflowY: 'auto',
                flexGrow: 1,
                flexShrink: 1
              }}
              className="custom-scrollbar"
            >
              
              {/* Customer & Dates Combined Row */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '12px', 
                  marginBottom: '12px' 
                }}
              >
                
                {/* Customer Info Card */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-15%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Customer</h4>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p className="text-white/60 text-xs font-semibold mb-1">Name</p>
                      <p className="text-white text-sm font-bold">{showDeleteConfirm.customerName}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-1">Phone</p>
                      <p className="text-white text-sm font-bold">{showDeleteConfirm.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-15%',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Dates</h4>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p className="text-white/60 text-xs font-semibold mb-1">Check-in</p>
                      <p className="text-white text-sm font-bold">{formatDate(showDeleteConfirm.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-semibold mb-1">Check-out</p>
                      <p className="text-white text-sm font-bold">{formatDate(showDeleteConfirm.endDate)}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Villas */}
              <div 
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-20%',
                  left: '-10%',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)',
                  borderRadius: '50%'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-black text-white">Villas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {showDeleteConfirm.villas.map(villa => (
                      <span 
                        key={villa}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: '#1f2937',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        {villa}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activities */}
              {showDeleteConfirm.selectedActivities?.length > 0 && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-25%',
                    left: '-10%',
                    width: '130px',
                    height: '130px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white">Activities</h4>
                    </div>
                    
                    {/* Activity Cards */}
                    <div className="grid grid-cols-1 gap-2">
                      {showDeleteConfirm.selectedActivities.map((activity, index) => {
                        // Handle both old format (string) and new format (object)
                        const activityName = typeof activity === 'string' ? activity : activity.name;
                        const numPeople = typeof activity === 'object' ? activity.numPeople : null;
                        const activityDate = typeof activity === 'object' ? activity.date : null;
                        const activityNotes = typeof activity === 'object' ? activity.notes : null;
                        
                        return (
                          <div
                            key={index}
                            style={{
                              background: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-black text-gray-900 text-sm mb-1">{activityName}</h5>
                                <div className="flex items-center gap-3 text-xs mb-2">
                                  {numPeople && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span>👥</span>
                                      <span className="font-semibold">{numPeople} {numPeople === '1' ? 'Person' : 'People'}</span>
                                    </div>
                                  )}
                                  {activityDate && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span>📅</span>
                                      <span className="font-semibold">{formatDate(activityDate)}</span>
                                    </div>
                                  )}
                                </div>
                                {activityNotes && (
                                  <div 
                                    style={{
                                      background: 'rgba(102, 126, 234, 0.06)',
                                      borderRadius: '8px',
                                      padding: '8px 10px',
                                      marginTop: '6px'
                                    }}
                                  >
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                      <span className="font-bold">📝 </span>{activityNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {(showDeleteConfirm.activityNotes || showDeleteConfirm.additionalNotes) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {showDeleteConfirm.activityNotes && (
                    <div 
                      style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.15)'
                      }}
                    >
                      <p className="text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Activity Notes</p>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium">{showDeleteConfirm.activityNotes}</p>
                    </div>
                  )}
                  {showDeleteConfirm.additionalNotes && (
                    <div 
                      style={{
                        background: 'rgba(240, 147, 251, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid rgba(240, 147, 251, 0.15)'
                      }}
                    >
                      <p className="text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Additional Notes</p>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium">{showDeleteConfirm.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div 
              style={{
                padding: '16px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(to top, #f9fafb 0%, #ffffff 100%)',
                flexShrink: 0
              }}
            >
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    generateInvoice(showDeleteConfirm);
                  }}
                  className="transition-all duration-300 hover:scale-105"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Invoice
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    handleEditBooking(showDeleteConfirm);
                  }}
                  className="transition-all duration-300 hover:scale-105"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this booking?')) {
                      handleDeleteBooking(showDeleteConfirm.id);
                    }
                  }}
                  className="transition-all duration-300 hover:scale-105"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iCal Modal */}
      {showICalModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowICalModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📅 iCal Calendar Feed</h2>
              <button
                onClick={() => setShowICalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Choose a calendar feed for all villas or individual villa calendars.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">🏡 All Villas (Combined)</h3>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm text-gray-700 break-all flex-1">
                      {window.location.origin}/.netlify/functions/ical
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/.netlify/functions/ical`);
                        alert('All Villas URL copied!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">🏘️ Individual Villas</h3>
                
                {['Palacio Tropical', 'Palacio Musical', 'The View House', 'The Palms Villa Estate'].map(villa => (
                  <div key={villa} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm mb-1">{villa}</div>
                        <code className="text-xs text-gray-600 break-all">
                          {window.location.origin}/.netlify/functions/ical-villa?villa={encodeURIComponent(villa)}
                        </code>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/.netlify/functions/ical-villa?villa=${encodeURIComponent(villa)}`);
                          alert(`${villa} URL copied!`);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📖 How to use:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Google Calendar:</strong> Settings → Add calendar → From URL</li>
                  <li>• <strong>Apple Calendar:</strong> File → New Calendar Subscription</li>
                  <li>• <strong>Outlook:</strong> Add calendar → Subscribe from web</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-900 mb-2">🔄 Auto-Sync:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Bookings sync automatically when you add/edit/delete them</li>
                  <li>• The feed updates in real-time (no manual refresh needed)</li>
                  <li>• Calendar apps check for updates every 1-24 hours automatically</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    downloadICalFile(bookings);
                    setShowICalModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download as File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { id: 'bookings', icon: '📅', label: 'Bookings' },
          { id: 'reviews', icon: '⭐', label: 'Reviews' },
          { id: 'qr', icon: '📱', label: 'QR' },
          { id: 'blog', icon: '📝', label: 'Blog' },
          { id: 'leads', icon: '📋', label: 'Leads' },
          { id: 'messages', icon: '✉️', label: 'Messages' },
          { id: 'wedding', icon: '💍', label: 'Wedding' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
            style={activeTab === tab.id ? { color: '#b8972e' } : { color: '#9ca3af' }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-semibold leading-none mt-0.5">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile FAB — New Booking */}
      {activeTab === 'bookings' && (
        <button
          className="fixed z-50 md:hidden flex items-center justify-center rounded-full shadow-xl"
          style={{ bottom: '76px', right: '16px', width: '56px', height: '56px', background: 'linear-gradient(135deg, #c9a96e, #a07040)' }}
          onClick={() => { setEditingBooking(null); setIsModalOpen(true); }}
          aria-label="New Booking"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
