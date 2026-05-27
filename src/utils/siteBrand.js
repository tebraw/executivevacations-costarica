const WEDDING_HOSTS = new Set([
  'paradiseweddingscostarica.com',
  'www.paradiseweddingscostarica.com',
]);

function getHostname() {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.toLowerCase();
}

function getBrandOverride() {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams(window.location.search);
  const brand = (params.get('brand') || window.localStorage.getItem('brandOverride') || '').toLowerCase();
  if (brand === 'paradise' || brand === 'wedding') return 'wedding';
  if (brand === 'executive' || brand === 'villa') return 'executive';
  return '';
}

export function isWeddingDomain() {
  const override = getBrandOverride();
  if (override === 'wedding') return true;
  if (override === 'executive') return false;
  return WEDDING_HOSTS.has(getHostname());
}

export function getSiteBrand() {
  if (isWeddingDomain()) {
    return {
      key: 'wedding',
      name: 'Paradise Weddings',
      fullName: 'Paradise Weddings Costa Rica',
      shortName: 'Paradise Weddings',
      tagline: 'Destination Weddings in Costa Rica',
      pricingLabel: 'Wedding Pricing Guide',
      pricingPath: '/wedding-packages',
      footerText: 'Your exclusive wedding partner in Costa Rica. We create unforgettable destination weddings in the country\'s most beautiful villas.',
    };
  }

  return {
    key: 'executive',
    name: 'Executive Vacations',
    fullName: 'Executive Vacations Costa Rica',
    shortName: 'Executive Vacations',
    tagline: 'Luxury Villas in Costa Rica',
    pricingLabel: 'Pricing Guide',
    pricingPath: '/pricing',
    footerText: 'Your exclusive partner for luxury vacations in Costa Rica. We provide unforgettable experiences in the country\'s most beautiful villas.',
  };
}
