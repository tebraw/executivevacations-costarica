import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';

const PACKAGES = [
  {
    tier: 'Silver',
    tagline: 'Intimate Pacific Wedding',
    nights: 2,
    villas: ['Palacio Musical'],
    overnight: 16,
    ceremony: 30,
    priceLow: 17900,
    priceHigh: 20900,
    highlight: false,
    catamaran: false,
    inclusions: [
      '2 nights · Palacio Musical (up to 16 guests)',
      'Brunch + Dinner all 2 days',
      'Wine, beer & soft drinks included',
      'Cocktail hour on ceremony day',
      'Basic decoration (setup & teardown)',
      'Private chefs & full catering team',
      'Housekeeping daily',
      'Concierge & security on-site',
      'Beach ceremony setup',
    ],
  },
  {
    tier: 'Gold',
    tagline: 'Pacific Celebration',
    nights: 3,
    villas: ['Palacio Musical'],
    overnight: 16,
    ceremony: 50,
    priceLow: 26900,
    priceHigh: 30900,
    highlight: false,
    catamaran: false,
    inclusions: [
      '3 nights · Palacio Musical (up to 16 guests)',
      'Brunch + Dinner all 3 days',
      'Wine, beer & soft drinks included',
      'Cocktail hour on ceremony day',
      'Basic decoration (setup & teardown)',
      'Private chefs & full catering team',
      'Housekeeping daily',
      'Concierge & security on-site',
      'Beach ceremony setup',
    ],
  },
  {
    tier: 'Platinum',
    tagline: 'Full Estate Wedding',
    nights: 5,
    villas: ['Palacio Musical', 'Palacio Tropical'],
    overnight: 32,
    ceremony: 75,
    priceLow: 63900,
    priceHigh: 76900,
    highlight: true,
    catamaran: false,
    inclusions: [
      '5 nights · Palacio Musical + Palacio Tropical',
      'Up to 32 overnight guests across both estates',
      'Brunch + Dinner all 5 days',
      'Wine, beer & soft drinks included',
      'Cocktail hour on ceremony day',
      'Basic decoration (setup & teardown)',
      'Private chefs & full catering team',
      'Housekeeping daily',
      'Concierge & security on-site',
      'Beach ceremony setup',
    ],
  },
  {
    tier: 'Diamond',
    tagline: 'The Complete Experience',
    nights: 7,
    villas: ['Palacio Musical', 'Palacio Tropical', 'The View House'],
    overnight: 36,
    ceremony: 100,
    priceLow: 101900,
    priceHigh: 121900,
    highlight: false,
    catamaran: true,
    inclusions: [
      '7 nights · Palacio Musical + Palacio Tropical + The View House',
      'Up to 36 overnight guests across all 3 estates',
      'Brunch + Dinner all 7 days',
      'Wine, beer & soft drinks included',
      'Cocktail hour on ceremony day',
      'Basic decoration (setup & teardown)',
      'Private chefs & full catering team',
      'Housekeeping daily',
      'Concierge & security on-site',
      'Beach ceremony setup',
      'Private catamaran sunset cruise — 4h · 45 guests · open bar',
    ],
  },
];

const ADDONS = [
  { label: 'Extra ceremony guest', value: '+$61 / person', note: 'Dinner + drinks, ceremony day only' },
  { label: 'Extra overnight guest', value: '+$76 / person / day', note: 'Brunch, dinner & drinks' },
  { label: 'Extra night (Palacio Musical)', value: '+$3,200 / $4,200', note: 'Low / High season' },
  { label: 'Catamaran — 6h cruise', value: '+$2,300', note: 'Up to 25 guests · food & drinks · Silver, Gold, Platinum' },
  { label: 'Extra catamaran guest', value: '+$92 / person', note: 'Over 25 guests' },
  { label: 'Themed decoration upgrade', value: 'On request', note: 'Custom theme, colours, florals' },
];

function fmt(n) {
  return '$' + n.toLocaleString('en-US');
}

export default function WeddingPackages() {
  const [season, setSeason] = useState('low');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Wedding Packages & Pricing | Executive Vacations Costa Rica';
  }, []);

  return (
    <div style={{ background: '#0b0f18', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #0b1120 0%, #12203a 55%, #1a2e1a 100%)',
        padding: 'clamp(100px, 14vw, 160px) 24px clamp(64px, 8vw, 96px)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px' }}>
          Executive Vacations &mdash; Costa Rica
        </p>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: '#fff', lineHeight: 1.05, marginBottom: '20px' }}>
          Wedding Packages &amp; Pricing
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 40px' }}>
          Everything included. One price. No surprises.
          Your venue, your team, your catering — all in the package.
        </p>

        {/* Season toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.07)', borderRadius: '50px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {[['low', 'Low Season', 'May – Nov'], ['high', 'High Season', 'Jan – Apr · Nov – Dec']].map(([val, label, dates]) => (
            <button
              key={val}
              onClick={() => setSeason(val)}
              style={{
                padding: '10px 28px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
                background: season === val ? `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)` : 'transparent',
                color: season === val ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 400, opacity: 0.75, marginTop: '1px' }}>{dates}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PACKAGES ─────────────────────────────────────────── */}
      <div style={{ background: '#0d1117', padding: 'clamp(48px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}>
            {PACKAGES.map((pkg) => {
              const price = season === 'low' ? pkg.priceLow : pkg.priceHigh;
              return (
                <div key={pkg.tier} style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: pkg.highlight
                    ? `2px solid rgba(201,169,110,0.5)`
                    : '1px solid rgba(255,255,255,0.08)',
                  background: pkg.highlight
                    ? 'linear-gradient(180deg, #16222e 0%, #0f1923 100%)'
                    : '#111827',
                  position: 'relative',
                }}>
                  {pkg.highlight && (
                    <div style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
                      color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      padding: '5px 18px', borderRadius: '0 0 12px 12px',
                    }}>Most Popular</div>
                  )}

                  {/* Card header */}
                  <div style={{ padding: '32px 28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '8px' }}>
                      {pkg.tier}
                    </p>
                    <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#fff', marginBottom: '6px' }}>
                      {pkg.tagline}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '0 0 20px' }}>
                      {pkg.villas.join(' + ')}
                    </p>

                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#fff', lineHeight: 1 }}>
                        {fmt(price)}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: '20px' }}>
                      {season === 'low' ? 'Low season · May – Nov' : 'High season · Jan – Apr, Nov – Dec'}
                    </p>

                    {/* Key stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        [`${pkg.nights} nights`, 'Duration'],
                        [`Up to ${pkg.overnight}`, 'Overnight guests'],
                        [`Up to ${pkg.ceremony}`, 'Ceremony guests'],
                        [pkg.catamaran ? 'Included' : 'Add-on', 'Catamaran'],
                      ].map(([val, lbl]) => (
                        <div key={lbl} style={{
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 2px' }}>{val}</p>
                          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lbl}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div style={{ padding: '20px 28px 28px' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: '14px' }}>
                      What's included
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      {pkg.inclusions.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          <svg style={{ flexShrink: 0, marginTop: '2px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_LIGHT} strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {item}
                          {item.includes('catamaran') && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', color: GOLD_LIGHT, textTransform: 'uppercase', background: 'rgba(184,151,46,0.12)', border: `1px solid rgba(201,169,110,0.25)`, borderRadius: '6px', padding: '2px 7px', flexShrink: 0 }}>Free</span>
                          )}
                        </li>
                      ))}

                      {/* Catamaran add-on note for non-Diamond */}
                      {!pkg.catamaran && (
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                          <svg style={{ flexShrink: 0, marginTop: '2px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Catamaran cruise bookable from +$2,300
                        </li>
                      )}
                    </ul>

                    <a href="/#contact" style={{
                      display: 'block', textAlign: 'center',
                      padding: '14px 20px',
                      background: pkg.highlight
                        ? `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`
                        : 'rgba(255,255,255,0.07)',
                      border: pkg.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '50px',
                      color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}>
                      Inquire about {pkg.tier}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ADD-ONS ───────────────────────────────────────────── */}
      <div style={{ background: '#0b0f18', padding: 'clamp(64px,8vw,96px) 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD_LIGHT, fontWeight: 700, marginBottom: '14px' }}>
              Flexible
            </p>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', lineHeight: 1.1 }}>
              Add-Ons &amp; Extras
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ADDONS.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px',
                background: '#111827', borderRadius: '16px', padding: '18px 24px',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 3px' }}>{a.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: 0 }}>{a.note}</p>
                </div>
                <span style={{
                  color: GOLD_LIGHT, fontWeight: 800, fontSize: '0.95rem',
                  background: 'rgba(184,151,46,0.1)', border: `1px solid rgba(201,169,110,0.2)`,
                  borderRadius: '10px', padding: '6px 16px', whiteSpace: 'nowrap',
                }}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NOT INCLUDED ─────────────────────────────────────── */}
      <div style={{ background: '#111827', padding: 'clamp(48px,6vw,72px) 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: '20px' }}>
            Not included in any package
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            {['Officiant / Priest', 'Photographer', 'Videographer', 'Wedding Planner', 'DJ / Live Music', 'Florals beyond basic'].map((item, i) => (
              <span key={i} style={{
                color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50px', padding: '7px 18px',
              }}>{item}</span>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: '20px', lineHeight: 1.7 }}>
            Our concierge can recommend trusted local vendors for any of the above.
          </p>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${GOLD} 0%, #a07040 100%)`,
        padding: 'clamp(64px,8vw,96px) 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: '18px' }}>
          Ready to Start?
        </p>
        <h2 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
          Tell Us Your Date &amp; Vision
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 40px' }}>
          We'll confirm availability, answer every question, and put together a custom quote within 24 hours.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/#contact" style={{
            display: 'inline-block', padding: '18px 44px',
            background: '#fff', borderRadius: '50px',
            color: GOLD, fontWeight: 800, fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 6px 28px rgba(0,0,0,0.2)',
          }}>
            Contact Us
          </a>
          <Link to="/weddings" style={{
            display: 'inline-block', padding: '18px 44px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: '50px', color: '#fff', fontWeight: 600,
            fontSize: '1rem', textDecoration: 'none',
          }}>
            Back to Weddings
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
