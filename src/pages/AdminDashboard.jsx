import React, { useState, useEffect } from 'react';
import BookingCalendar from '../components/admin/BookingCalendar';
import BookingModal from '../components/admin/BookingModal';
import WeddingQuoteBuilder from '../components/admin/WeddingQuoteBuilder';
import { getBookings, saveBooking, deleteBooking } from '../utils/bookingStorage';
import { generateInvoice } from '../utils/invoiceGenerator';
import { downloadICalFile } from '../utils/icalGenerator';

const AdminDashboard = () => {
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
    { label: '— Load a template —', value: '' },
    {
      label: 'How much does a luxury villa in Costa Rica cost?',
      value: {
        title: 'How Much Does a Luxury Villa in Costa Rica Cost? (2026 Guide)',
        metaTitle: 'Luxury Villa Cost in Costa Rica 2026 | Executive Vacations',
        metaDesc: 'Wondering what a luxury villa in Costa Rica costs? Discover exact rates for private villas with pools, ocean views & concierge service. Get your free pricing guide.',
        focusKeyword: 'luxury villa Costa Rica cost',
        text: `How Much Does a Luxury Villa in Costa Rica Cost? (2026 Guide)\n\nCosta Rica has become one of the world\'s most sought-after luxury travel destinations — and private villa rentals are at the heart of that experience. But what does it actually cost to stay in a luxury villa in Costa Rica? In this guide, we break down everything you need to know.\n\nWhat Affects the Price of a Luxury Villa in Costa Rica?\n\nSeveral factors influence the nightly or weekly rate of a private villa:\n\n• Size and number of bedrooms (our villas range from 5 to 7+ bedrooms)\n• Location — beachfront properties like Palacio Tropical command a premium\n• Season — peak season (December–April) rates are higher than low season\n• Included services — full staff, concierge, private chef, and security\n• Amenities — infinity pools, home theatres, gym, and ocean views\n\nOur Villa Rates at Executive Vacations Costa Rica\n\nWe manage four exclusive luxury villas in Costa Rica, each offering a unique experience:\n\nPalacio Tropical — Our flagship beachfront villa in Tambor, Puntarenas. With 7 bedrooms, direct secluded beach access, and full staff, this is the ultimate Costa Rica escape. Rates from $2,400/night in low season.\n\nPalacio Musical — A stunning private estate with panoramic views and a resort-style pool. Perfect for groups and families. Rates from $1,500/night.\n\nThe View House — Perched above the jungle with breathtaking ocean views. An intimate luxury retreat for smaller groups. Rates from $1,200/night.\n\nThe Palms Villa Estate — A spacious villa surrounded by lush tropical gardens with a large private pool. Rates from $1,100/night.\n\nIs a Luxury Villa in Costa Rica Worth It?\n\nAbsolutely. When you divide the cost among your group, a private villa often works out cheaper than booking multiple hotel rooms — and offers an infinitely better experience. You get complete privacy, your own pool, a full kitchen, and personalized service that no hotel can match.\n\nHow to Get Our Exact Pricing\n\nOur rates vary by season, villa, and group size. The best way to get accurate pricing is to download our free Pricing Guide — it includes exact rates, availability calendars, and everything you need to plan your trip.\n\nDownload your free Pricing Guide at executivevacations.net/pricing and let our team help you plan the perfect Costa Rica getaway.`,
      },
    },
    {
      label: 'Best time to visit Costa Rica for a villa vacation',
      value: {
        title: 'Best Time to Visit Costa Rica for a Luxury Villa Vacation',
        metaTitle: 'Best Time to Visit Costa Rica for a Villa Vacation | Executive Vacations',
        metaDesc: 'Planning a luxury villa vacation in Costa Rica? Discover the best months to visit, weather patterns, and how to get the best rates at private villas.',
        focusKeyword: 'best time to visit Costa Rica luxury villa',
        text: `Best Time to Visit Costa Rica for a Luxury Villa Vacation\n\nCosta Rica is a year-round destination — but the timing of your trip can make a big difference in your experience and your budget. Here\'s everything you need to know about the best time to visit Costa Rica for a luxury villa vacation.\n\nDry Season (December – April): Peak Luxury Travel\n\nThe dry season is the most popular time to visit Costa Rica, and for good reason. You can expect:\n\n• Sunny skies and low humidity\n• Perfect beach conditions\n• Vibrant wildlife activity\n• Ideal conditions for outdoor dining and pool time\n\nThis is peak season, so villa rates are at their highest and availability is limited. We recommend booking at least 3–4 months in advance for December and January stays.\n\nGreen Season (May – November): The Hidden Gem\n\nCosta Rica\'s green season is one of the best-kept secrets in luxury travel. While there is more rainfall, it typically comes in afternoon showers that leave mornings bright and evenings dramatic. The benefits are compelling:\n\n• Lower villa rates (up to 25% savings)\n• Lush, vibrant landscapes at their most beautiful\n• Fewer tourists — complete privacy and tranquility\n• Excellent surf conditions\n• Spectacular sunsets\n\nFor travellers who value privacy and value, the green season offers the ultimate luxury villa experience.\n\nOur Villa Availability\n\nAt Executive Vacations Costa Rica, our four luxury villas — Palacio Tropical, Palacio Musical, The View House, and The Palms Villa Estate — are available year-round. Each villa includes a private pool, concierge service, and full amenities regardless of season.\n\nReady to Plan Your Trip?\n\nDownload our free Pricing Guide at executivevacations.net/pricing to see exact rates by season and check availability for your preferred dates.`,
      },
    },
    {
      label: '7 reasons to choose a private villa over a hotel in Costa Rica',
      value: {
        title: '7 Reasons to Choose a Private Villa Over a Hotel in Costa Rica',
        metaTitle: 'Private Villa vs Hotel in Costa Rica | Executive Vacations',
        metaDesc: '7 compelling reasons why a private luxury villa in Costa Rica beats any hotel. Privacy, value, service, and an unforgettable experience await.',
        focusKeyword: 'private villa vs hotel Costa Rica',
        text: `7 Reasons to Choose a Private Villa Over a Hotel in Costa Rica\n\nWhen planning a luxury trip to Costa Rica, the choice between a hotel and a private villa can define your entire experience. Here are seven compelling reasons why discerning travellers choose a private villa every time.\n\n1. Complete Privacy\n\nA private villa is yours — entirely. No crowded lobbies, no shared pools, no strangers at the next table. Just you, your group, and paradise.\n\n2. Your Own Private Pool\n\nEvery villa in our collection features a private infinity pool or resort-style pool. Swim at midnight, have breakfast poolside, or host a sunset cocktail hour — on your schedule.\n\n3. Better Value for Groups\n\nWhen you divide a villa rate among 8–18 guests, the per-person cost is often less than a luxury hotel room — with a dramatically better experience included.\n\n4. Personalized Concierge Service\n\nOur team handles everything: airport transfers, chef bookings, activity arrangements, grocery stocking, and more. It\'s five-star service tailored entirely to you.\n\n5. Space to Breathe\n\nOur villas range from 5,000 to 10,500 sq ft. Multiple living areas, dining spaces, and outdoor terraces mean everyone has room to relax, gather, or find their own corner of paradise.\n\n6. Immersive Local Experience\n\nStaying in a private villa means living like a local — in a stunning home, in a real neighbourhood, with access to the Costa Rica that most tourists never see.\n\n7. Unforgettable Memories\n\nHotels are forgettable. A private villa in Costa Rica is a story you\'ll tell for the rest of your life. The sunsets, the wildlife, the laughter by the pool — it\'s irreplaceable.\n\nExplore Our Villas\n\nExecutive Vacations Costa Rica manages four exclusive private villas — Palacio Tropical, Palacio Musical, The View House, and The Palms Villa Estate. Download our free Pricing Guide at executivevacations.net/pricing to discover rates and availability.`,
      },
    },
    {
      label: 'What to do in Tambor, Costa Rica',
      value: {
        title: 'What to Do in Tambor, Costa Rica: The Ultimate Luxury Travel Guide',
        metaTitle: 'What to Do in Tambor Costa Rica | Executive Vacations',
        metaDesc: 'Discover the best activities and experiences in Tambor, Costa Rica. From beach adventures to wildlife tours — the ultimate guide for luxury villa guests.',
        focusKeyword: 'what to do in Tambor Costa Rica',
        text: `What to Do in Tambor, Costa Rica: The Ultimate Luxury Travel Guide\n\nTambor is one of Costa Rica\'s most beautiful and unspoiled destinations — a tranquil bay on the Nicoya Peninsula with pristine beaches, abundant wildlife, and world-class luxury. If you\'re staying at Palacio Tropical or exploring the area, here\'s your ultimate guide to Tambor.\n\nBeach & Water Activities\n\nTambor Bay is famous for its calm, warm waters and long stretches of sand. Popular activities include:\n\n• Swimming and snorkelling in the bay\n• Sport fishing for marlin, dorado, and tuna\n• Kayaking and paddleboarding\n• Sunset sailing tours\n• Whale watching (humpback whales visit from August to October)\n\nAdventure & Nature\n\nCosta Rica\'s famous biodiversity is on full display in and around Tambor:\n\n• ATV tours through jungle trails and to hidden beaches\n• Zip-lining through the rainforest canopy\n• Horseback riding on the beach\n• Wildlife watching — scarlet macaws, howler monkeys, and sea turtles\n• Curu National Wildlife Refuge — one of Costa Rica\'s most pristine protected areas\n\nGolf & Wellness\n\nThe Tango Mar resort neighbouring Palacio Tropical offers access to a 9-hole golf course and spa facilities for our villa guests.\n\nDay Trips\n\n• Montezuma — a bohemian beach town with a famous waterfall, 45 minutes away\n• Cabo Blanco Nature Reserve — Costa Rica\'s first protected area\n• Isla Tortuga — a stunning island reached by boat with white sand beaches\n\nStay at Palacio Tropical\n\nPalacio Tropical is our flagship beachfront villa in Tambor — a 7-bedroom luxury estate with direct secluded beach access, infinity pool, and full staff. It\'s the perfect base for exploring everything Tambor has to offer.\n\nDownload our free Pricing Guide at executivevacations.net/pricing to discover availability and rates.`,
      },
    },
    {
      label: 'Palacio Tropical — Costa Rica\'s finest beachfront villa',
      value: {
        title: 'Palacio Tropical: Costa Rica\'s Most Exclusive Beachfront Villa',
        metaTitle: 'Palacio Tropical Beachfront Villa Costa Rica | Executive Vacations',
        metaDesc: 'Discover Palacio Tropical — Costa Rica\'s most exclusive 7-bedroom beachfront villa in Tambor. Direct secluded beach access, full staff, infinity pool & concierge service.',
        focusKeyword: 'Palacio Tropical beachfront villa Costa Rica',
        text: `Palacio Tropical: Costa Rica\'s Most Exclusive Beachfront Villa\n\nNestled on the shores of Tambor Bay on the Nicoya Peninsula, Palacio Tropical is the crown jewel of Executive Vacations Costa Rica — a 7-bedroom, 9.5-bathroom beachfront estate that redefines luxury in Central America.\n\nThe Villa\n\nSpanning 10,500 square feet, Palacio Tropical was designed to be a destination in itself. Every detail — from the hand-crafted furnishings to the panoramic ocean views — reflects an uncompromising commitment to luxury.\n\n• 7 bedrooms, each with its own en-suite bathroom\n• Direct secluded beachfront access on Tambor Bay\n• Resort-style infinity pool overlooking the Pacific\n• Fully equipped gourmet kitchen\n• Multiple indoor and outdoor living areas\n• Home theatre, gym, and game room\n• Lush tropical gardens\n\nThe Staff\n\nPalacio Tropical comes with a full complement of professional staff:\n\n• Private chef\n• Butler service\n• Housekeeping\n• Security\n• Concierge\n\nEverything is taken care of so you can simply enjoy your stay.\n\nThe Location\n\nTambor is one of Costa Rica\'s most beautiful and peaceful bays — sheltered, calm, and surrounded by jungle. Yet it\'s remarkably accessible: around a 30-minute flight from San Jose or Liberia to Cabano (ACO) or Tambor (TMU), or a scenic 3-hour drive via ferry from the capital.\n\nPerfect For\n\nPalacio Tropical accommodates up to 18 guests and is ideal for:\n\n• Multi-family vacations\n• Corporate retreats and incentive trips\n• Milestone celebrations (birthdays, anniversaries, weddings)\n• Executive getaways\n\nBook Palacio Tropical\n\nAvailability for Palacio Tropical is limited, especially during peak season (December–April). Download our free Pricing Guide at executivevacations.net/pricing to check availability and get exact rates.`,
      },
    },
  ];
  const WEDDING_BLOG_TEMPLATES = [
    { label: '— Load a template —', value: '' },
    {
      label: 'How much does a destination wedding in Costa Rica cost?',
      value: {
        title: 'How Much Does a Destination Wedding in Costa Rica Cost? (2026 Guide)',
        metaTitle: 'Destination Wedding Costa Rica Cost 2026 | Executive Vacations',
        metaDesc: 'Discover the real cost of a destination wedding in Costa Rica. Venue, catering, décor & full packages — everything you need to budget your dream wedding.',
        focusKeyword: 'destination wedding Costa Rica cost',
        site: 'wedding',
        text: `How Much Does a Destination Wedding in Costa Rica Cost? (2026 Guide)\n\nCosta Rica has become one of the world's most sought-after destination wedding locations — stunning beaches, lush jungle, and world-class private estates. But what does it actually cost to get married here? In this guide, we break down all the key expenses so you can plan with confidence.\n\nWhat Affects the Cost of a Destination Wedding in Costa Rica?\n\nSeveral factors determine the overall price of your Costa Rica wedding:\n\n• Venue type — private beachfront estate vs. hotel vs. public beach\n• Guest count — more guests means higher catering, seating, and logistics costs\n• High vs. low season — December through April (dry season) carries premium pricing\n• Package inclusions — venues that include catering, décor, and staff offer better overall value\n• Ceremony style — beach ceremony, garden ceremony, cliff-top, or indoor\n\nTypical Cost Ranges for a Destination Wedding in Costa Rica\n\nBudget wedding (20–30 guests): $15,000–$25,000\nMid-range wedding (30–60 guests): $25,000–$60,000\nLuxury wedding (60–100+ guests): $60,000–$130,000+\n\nThese ranges vary significantly based on inclusions. At Executive Vacations Costa Rica, our all-inclusive wedding packages cover the venue, catering, staff, décor, and more — eliminating the hidden costs that catch many couples off guard.\n\nOur Wedding Packages\n\nWe offer four exclusive wedding packages at our private beachfront estates in Tambor, Costa Rica:\n\nSilver Package — From $17,900 (low season). Includes 2 nights at Palacio Musical, ceremony for up to 30 guests, brunch and dinner, cocktail hour, and full staff.\n\nGold Package — From $26,900 (low season). 3 nights, up to 50 ceremony guests, all-inclusive food and beverages.\n\nPlatinum Package — From $63,900 (low season). 5 nights at both Palacio Musical and Palacio Tropical, up to 75 guests, full event services.\n\nDiamond Package — From $101,900 (low season). 7 nights across all three estates plus a private catamaran, up to 100 ceremony guests.\n\nIs a Destination Wedding in Costa Rica Worth It?\n\nAbsolutely. When you compare the all-in cost to a traditional hotel wedding at home — and factor in the once-in-a-lifetime setting, privacy, and personalized service — a destination wedding in Costa Rica delivers exceptional value.\n\nGet the Full Pricing Guide\n\nDownload our free Wedding Packages & Pricing Guide to see exact rates, package inclusions, and seasonal pricing. Visit executivevacations.net/wedding-packages to get started.`,
      },
    },
    {
      label: 'Why Costa Rica is the best destination wedding location',
      value: {
        title: 'Why Costa Rica Is the Best Destination Wedding Location in the World',
        metaTitle: 'Why Get Married in Costa Rica | Executive Vacations',
        metaDesc: 'Discover why Costa Rica is the world\'s top destination wedding location — stunning scenery, private villas, perfect weather & all-inclusive luxury packages.',
        focusKeyword: 'best destination wedding location Costa Rica',
        site: 'wedding',
        text: `Why Costa Rica Is the Best Destination Wedding Location in the World\n\nChoosing where to get married is one of the most important decisions you'll make. More and more couples are discovering that Costa Rica offers everything a dream wedding requires — and then some. Here are the reasons Costa Rica consistently tops destination wedding lists.\n\n1. Breathtaking Natural Beauty\n\nFew places on earth offer scenery as dramatic and diverse as Costa Rica. From pristine Pacific beaches to lush jungle backdrops, volcanic peaks to turquoise bays — every ceremony setting is a natural masterpiece. No venue dressing needed when the landscape is this extraordinary.\n\n2. Perfect Weather\n\nTambor Bay, where our estates are located, enjoys one of the most consistent climates in Costa Rica. The dry season (December through April) delivers sunshine and warmth — perfect for outdoor beach ceremonies. Even during the green season, mornings are typically bright and evenings brilliantly dramatic.\n\n3. Complete Privacy\n\nOur private beachfront estates are exclusively yours for your stay. No hotel guests, no strangers, no shared spaces. Your wedding unfolds in a setting that feels entirely personal and intimate — even for larger celebrations.\n\n4. All-Inclusive Luxury\n\nOur wedding packages include the venue, private chef, catering team, housekeeping, concierge, and basic décor — so you arrive and celebrate, rather than coordinate.\n\n5. World-Class Cuisine\n\nCoast Rica's fresh tropical ingredients — seafood, exotic fruits, and locally sourced produce — translate into extraordinary wedding menus. Our private chefs create custom menus tailored to your preferences.\n\n6. Adventurous Pre & Post-Wedding Experiences\n\nYour guests won't run out of things to do. Zip-lining, whale watching, ATV tours, snorkelling, catamaran sunset cruises — Costa Rica ensures your wedding week is an adventure from start to finish.\n\n7. Accessible & Well-Connected\n\nTambor is around 30 minutes by light aircraft from San José or Liberia international airports. Regular international flights connect to North America, Europe, and beyond — making travel easy for guests worldwide.\n\nStart Planning Your Costa Rica Wedding\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages and let our team help you create the wedding of a lifetime.`,
      },
    },
    {
      label: 'How to plan a destination wedding in Costa Rica: complete guide',
      value: {
        title: 'How to Plan a Destination Wedding in Costa Rica: The Complete Guide',
        metaTitle: 'How to Plan a Destination Wedding in Costa Rica | Executive Vacations',
        metaDesc: 'Step-by-step guide to planning your destination wedding in Costa Rica. Time frames, budgets, vendor tips, and how to choose the perfect venue.',
        focusKeyword: 'how to plan destination wedding Costa Rica',
        site: 'wedding',
        text: `How to Plan a Destination Wedding in Costa Rica: The Complete Guide\n\nPlanning a destination wedding in Costa Rica might feel overwhelming at first — a foreign country, unfamiliar vendors, and all the usual wedding logistics. The good news? With the right venue and support team, a Costa Rica destination wedding can actually be simpler and less stressful than a traditional wedding at home. Here's everything you need to know.\n\nStep 1: Set Your Budget and Guest Count\n\nStart with two numbers: how much you want to spend, and how many guests you want to invite. These two factors will determine your venue options, package tier, and overall logistics. Our packages range from intimate ceremonies of 30 guests to grand celebrations of 100+.\n\nStep 2: Choose Your Season\n\nCosta Rica has two primary seasons. The dry season (December–April) offers the most reliable weather and is peak season — rates are higher and availability books up fast. The green season (May–November) offers significant savings, lush landscapes, and a more private experience — many couples find it their preferred choice.\n\nStep 3: Select Your Venue\n\nThis is the most important decision. For a truly private, luxury wedding experience, a private estate is unmatched. Our venues in Tambor, Puntarenas offer direct beach access, full staff, all-inclusive packages, and total exclusivity.\n\nStep 4: Book Early\n\nPopular wedding dates — especially in December, January, and February — book 12–18 months in advance. If you have a specific date in mind, contact us early to check availability.\n\nStep 5: Sort Out the Legal Requirements\n\nGetting legally married in Costa Rica requires basic documentation (passport, birth certificate, and more). Many couples choose to handle the legal ceremony at home before or after the trip, and have their symbolic ceremony in Costa Rica — this is actually very common and completely valid.\n\nStep 6: Plan Guest Travel & Accommodation\n\nTambor is accessible via a 30-minute charter flight from San José or Liberia, or a scenic 3-hour drive and ferry from the capital. Our estates accommodate all your guests on-property — no hotel logistics required.\n\nStep 7: Plan Your Wedding Week\n\nA destination wedding is more than one day. Plan a welcome dinner, adventure activities for guests, a day-after brunch, and maybe a catamaran sunset cruise. Costa Rica makes it easy to fill every day with extraordinary experiences.\n\nStart With Our Pricing Guide\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see all our packages, inclusions, and seasonal rates.`,
      },
    },
    {
      label: 'Costa Rica beach wedding: everything you need to know',
      value: {
        title: 'Costa Rica Beach Wedding: Everything You Need to Know',
        metaTitle: 'Costa Rica Beach Wedding Guide | Executive Vacations',
        metaDesc: 'Everything you need to know about a Costa Rica beach wedding — venues, permits, timing, décor, and what makes a private estate the best choice.',
        focusKeyword: 'Costa Rica beach wedding',
        site: 'wedding',
        text: `Costa Rica Beach Wedding: Everything You Need to Know\n\nA beach wedding in Costa Rica is one of the most romantic and spectacular experiences imaginable. Warm sand beneath your feet, turquoise water stretching to the horizon, tropical breezes, and a sky that seems to blush during golden hour. If you're dreaming of a beach wedding, Costa Rica might be your perfect destination. Here's everything you need to know.\n\nWhy Costa Rica Beach Weddings Are So Special\n\nCosta Rica's Pacific coast offers a combination of features that's almost impossible to find elsewhere: calm, warm waters; dramatic jungle-meets-beach scenery; incredible biodiversity; and a culture that genuinely embraces celebration. Add world-class private villas with direct beach access, and you have a wedding setting unlike anything else.\n\nPalacio Tropical: The Ultimate Private Beach Wedding Venue\n\nOur flagship property, Palacio Tropical, sits directly on a secluded stretch of Tambor Bay with private beach access. The estate's multiple outdoor terraces, large pool deck, and beach front create multiple ceremony and reception settings — all completely private and exclusively yours.\n\nPublic Beach vs. Private Beach Venue\n\nMany couples dream of a beach ceremony but don't realise the logistical challenges of public beaches — permits, public access, no onsite facilities, no catering infrastructure. A private estate with direct beach access solves all of these issues: complete privacy, professional staff, catering teams on-site, and all facilities within metres.\n\nBest Time of Year for a Costa Rica Beach Wedding\n\nThe dry season (December–April) is the most popular for beach weddings — guaranteed sunshine and low humidity. However, the green season (May–November) offers dramatic skies for breathtaking photos, fewer tourists, and lower rates. The famous Tambor sunsets are stunning year-round.\n\nCeremony Styles for a Beach Wedding\n\n• Barefoot sand ceremony at the water's edge\n• Elevated terrace ceremony overlooking the beach\n• Pool deck ceremony with the ocean as backdrop\n• Garden ceremony surrounded by tropical foliage\n\nAt our estates, you choose the setting — our team takes care of the rest.\n\nLogistics and What's Included\n\nOur beach wedding packages include: private venue, ceremony setup, private chef, catering team, brunch and dinner, wine, beer and soft drinks, housekeeping, concierge, and security. Everything is handled so you can simply be present.\n\nDownload the Pricing Guide\n\nVisit executivevacations.net/wedding-packages to download our free Wedding Packages & Pricing Guide with full inclusions and seasonal rates.`,
      },
    },
    {
      label: "Palacio Tropical wedding venue — Costa Rica's finest",
      value: {
        title: 'Palacio Tropical: Costa Rica\'s Most Exclusive Private Wedding Venue',
        metaTitle: 'Palacio Tropical Wedding Venue Costa Rica | Executive Vacations',
        metaDesc: 'Palacio Tropical is Costa Rica\'s most exclusive private wedding venue — beachfront, fully staffed, accommodating up to 75 guests. Discover our luxury wedding packages.',
        focusKeyword: 'Palacio Tropical wedding venue Costa Rica',
        site: 'wedding',
        text: `Palacio Tropical: Costa Rica's Most Exclusive Private Wedding Venue\n\nNestled on the shores of Tambor Bay, Palacio Tropical is the centrepiece of our most popular wedding packages — a stunning 7-bedroom, 10,500 sq ft beachfront estate that transforms into a truly extraordinary wedding venue.\n\nThe Venue\n\nPalacio Tropical was designed with grand entertaining in mind. Multiple indoor and outdoor living areas, a large resort-style pool, a grand dining room, and direct access to a secluded private beach create a naturally versatile wedding setting.\n\nCeremony Spaces:\n• Beachfront ceremony at the water's edge\n• Pool terrace ceremony with ocean views\n• Garden terrace for an intimate tropical backdrop\n• Grand indoor salon for elegant seated ceremonies\n\nReception Spaces:\n• Pool deck — the perfect outdoor reception venue\n• Grand dining room seating up to 18 guests formally\n• Multiple lounge and bar areas for cocktail hours\n• Beach — for late-night dancing under the stars\n\nCapacity\n• Overnight guests: up to 18 (exclusive use of the estate)\n• Ceremony guests: up to 75 (combined with Palacio Musical)\n\nThe Staff\n\nPalacio Tropical is fully staffed for weddings: private chef, catering team, butler, housekeeping, security, and concierge. Your guests are looked after from the moment they arrive until the moment they depart.\n\nCombining Palacio Tropical with Palacio Musical\n\nFor larger weddings, Palacio Tropical sits directly next to Palacio Musical — our other flagship estate. Combined, both properties accommodate up to 36 overnight guests and up to 75 ceremony guests. Our Platinum Package covers both estates for a 5-night experience.\n\nThe Diamond Experience\n\nFor the ultimate wedding, our Diamond Package adds The View House and a private catamaran for a 7-night celebration accommodating up to 44 overnight guests and 100 ceremony guests.\n\nPlan Your Wedding at Palacio Tropical\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see full inclusions, seasonal rates, and availability.`,
      },
    },
    {
      label: '7 reasons to have your wedding at a private villa in Costa Rica',
      value: {
        title: '7 Reasons to Have Your Wedding at a Private Villa in Costa Rica',
        metaTitle: '7 Reasons for a Private Villa Wedding in Costa Rica | Executive Vacations',
        metaDesc: '7 compelling reasons to choose a private villa over a hotel for your Costa Rica destination wedding. Privacy, all-inclusive service, and unmatched luxury.',
        focusKeyword: 'private villa wedding Costa Rica',
        site: 'wedding',
        text: `7 Reasons to Have Your Wedding at a Private Villa in Costa Rica\n\nWhen couples begin planning their Costa Rica destination wedding, many initially consider hotels or resort venues. But increasingly, the most discerning couples are choosing private villas — and for very good reasons. Here's why a private estate wedding beats a hotel wedding every time.\n\n1. Complete Exclusivity\n\nAt a private villa, the entire property is yours. No hotel guests wandering through your ceremony, no strangers at the pool, no background noise from other events. Your wedding feels exactly as it should — intimate, personal, and entirely yours.\n\n2. Stays for All Your Guests\n\nAt a private estate like Palacio Tropical and Palacio Musical, your guests sleep, eat, and celebrate together in the same property. That shared experience — morning coffee by the pool, late-night conversations on the terrace — creates the kind of memories a hotel simply can't.\n\n3. Your Own Private Chef\n\nForget hotel banquet menus. Our private chefs create bespoke wedding menus — fresh seafood, tropical fruits, and local Costa Rican ingredients — tailored entirely to your preferences and dietary needs.\n\n4. Total Flexibility\n\nHotels operate on schedules. A private villa operates on yours. Ceremony at sunrise? Late-night dancing until 3am? Barefoot cocktail hour on the beach? You decide.\n\n5. Better Value for Larger Groups\n\nWhen you divide the villa cost among your overnight guests, a private estate often comes out cheaper per person than equivalent hotel rooms — with a dramatically richer experience included.\n\n6. Breathtaking Natural Settings\n\nOur Tambor estates sit on the Pacific coast with direct beach access, ocean views, and tropical gardens. No venue dressing needed — the setting is the statement.\n\n7. A Story Worth Telling\n\nYour guests will talk about a private villa wedding for decades. A hotel is forgettable. Arriving at Palacio Tropical, swimming in the ocean before the ceremony, dancing under the stars on the beach — these are the moments that define a life.\n\nSee Our Wedding Packages\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages and discover how to make your dream wedding a reality.`,
      },
    },
    {
      label: 'What to include in your destination wedding package',
      value: {
        title: 'What to Include in Your Destination Wedding Package: The Complete Checklist',
        metaTitle: 'Destination Wedding Package Inclusions Checklist | Executive Vacations',
        metaDesc: 'What should your destination wedding package include? Use our complete checklist to make sure nothing is left out — venue, catering, décor, staff & more.',
        focusKeyword: 'destination wedding package inclusions',
        site: 'wedding',
        text: `What to Include in Your Destination Wedding Package: The Complete Checklist\n\nOne of the most common mistakes couples make when booking a destination wedding is underestimating what's included — and what isn't. A low headline price can quickly balloon with add-ons once you start reading the fine print. Use this checklist to make sure your package covers everything you need.\n\nThe Venue\n\n✓ Exclusive use of the entire property (not shared with other guests)\n✓ Indoor and outdoor ceremony spaces\n✓ Reception and dining areas\n✓ Pool and beach access\n✓ Accommodation for all overnight guests\n\nCatering & Beverages\n\n✓ Welcome dinner or cocktail hour\n✓ Brunch included for each day of your stay\n✓ Dinner included for each night\n✓ Wine, beer, and soft drinks throughout\n✓ Custom wedding cake or dessert arrangements\n✓ Dietary accommodations (vegetarian, vegan, allergies)\n\nStaff & Service\n\n✓ Private chef and catering team\n✓ Butler service\n✓ Daily housekeeping\n✓ On-site security\n✓ Concierge service for activities and excursions\n\nCeremony Essentials\n\n✓ Ceremony setup (chairs, aisle, altar or arch)\n✓ Basic floral décor\n✓ Sound system for music and vows\n✓ Option to add officiant\n\nActivities & Extras\n\n✓ Airport transfers\n✓ Access to water activities\n✓ Catamaran sunset cruise (Diamond Package)\n✓ Local activity coordination\n\nWhat Our Packages Include\n\nAt Executive Vacations Costa Rica, our wedding packages are designed to be genuinely all-inclusive. From the Silver Package (2 nights, up to 30 ceremony guests) to the Diamond Package (7 nights, up to 100 ceremony guests across all three estates), every package includes: venue, catering, beverages, full staff, ceremony setup, and basic décor.\n\nNo hidden fees. No per-person surprise charges. Just a complete, luxury wedding experience from the moment you arrive.\n\nGet the Full Breakdown\n\nDownload our free Wedding Packages & Pricing Guide at executivevacations.net/wedding-packages to see exactly what each package includes and the seasonal rates.`,
      },
    },
  ];
  const [blogEditMode, setBlogEditMode] = useState(false);
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
