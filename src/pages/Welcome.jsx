import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import villas from '../data/villas';
import { SITE_URL } from '../utils/siteBrand';
import { ReviewCard, useApprovedReviews } from '../components/palacio/Reviews';
import { GIFT_SLUGS, fmt } from '../components/palacio/shared';
import { QuizProvider, useQuiz } from '../components/welcome/QuizContext';
import LeadQuiz from '../components/welcome/LeadQuiz';
import GuestSpotlight from '../components/welcome/GuestSpotlight';
import { MiniFooter, TopBar } from '../components/welcome/Chrome';
import { waLink } from '../components/welcome/contact';
import {
  openWindows,
  perGuest,
  periodStatus,
  reviewStats,
  seasonLabel,
  upcomingHolidays,
  useBookings,
} from '../components/welcome/availability';
import { captureAttribution, startMetaPixel, track } from '../utils/track';
import '../styles/palacio.css';
import '../styles/welcome.css';

const ACTIVE = villas.filter((v) => !v.isComingSoon);
const NAMES = ACTIVE.map((v) => v.name);
const BIG = ['Palacio Musical', 'Palacio Tropical'];
const SMALL = ['The View House', 'Palacio Las Palmas'];
const GROUP_OF = { 'Palacio Musical': '13-18', 'Palacio Tropical': '13-18', 'Palacio Las Palmas': '5-8', 'The View House': '5-8' };
const IMG = {
  'Palacio Musical': '/images/lp/musical.webp',
  'Palacio Tropical': '/images/lp/tropical.webp',
  'Palacio Las Palmas': '/images/lp/las-palmas.webp',
  'The View House': '/images/lp/view-house.webp',
};
const STATUS = { open: 'open', partial: 'partly booked', booked: 'booked' };
const EMPTY = { s: null, e: null };

const VARIANTS = {
  general: {
    key: 'general',
    occasion: '',
    eyebrow: 'Tambor & Atenas · Costa Rica',
    h1: 'Your whole group. One private estate in Costa Rica.',
    sub: 'Oceanfront estates for up to 20 guests, concierge team included. Tell us your dates and we reply personally within 24 hours.',
  },
  holiday: {
    key: 'holiday',
    occasion: '',
    holidayPicks: true,
    eyebrow: 'Christmas & New Year',
    h1: 'Spend the holidays on the Pacific.',
    sub: 'Private oceanfront estates, a personal concierge team and a complimentary sunset catamaran cruise with 7 nights at Palacio Musical or Palacio Tropical.',
  },
  reunion: {
    key: 'reunion',
    occasion: 'Family reunion',
    eyebrow: 'Family reunions & multi-generation trips',
    h1: 'One house for the whole family. One team to handle everything.',
    sub: 'Seven bedrooms, room for up to 20 guests and the Pacific at your doorstep. No one is left planning alone.',
  },
  celebrate: {
    key: 'celebrate',
    occasion: 'Milestone birthday',
    eyebrow: "Milestone birthdays & friends' getaways",
    h1: 'The big birthday deserves more than a restaurant table.',
    sub: 'Take over an entire oceanfront estate with your people: a whale-watching deck, a sunset catamaran and a team that arranges the rest.',
  },
};

const EXPERIENCES = [
  ['Private Chef', 'Your own chef, at your estate.', '/images/lp/chef.webp'],
  ['Sunset Catamaran', 'Sail the Pacific coastline.', '/images/lp/catamaran.webp'],
  ['ATV Adventure', 'Quad through the mountains.', '/images/lp/atv.webp'],
  ['Zip-lining', 'Fly through the jungle canopy.', '/images/lp/zipline.webp'],
];

const FAQ = [
  ['How does booking work?', 'Send a short request. We reply personally with availability and a tailored proposal. Nothing is booked until you confirm.'],
  [
    'What does the nightly rate include?',
    'The nightly rate includes the estate for your group, the personal concierge service of Mila & Filip, and housekeeping. Additional services such as a private chef, tours and activities are arranged on request and are booked separately.',
  ],
  [
    'How does the free sunset catamaran cruise work?',
    'Book 7 nights at Palacio Musical or Palacio Tropical and the cruise is our gift: a private sunset sail with snacks and drinks for up to 20 guests, a $1,200 value.',
  ],
  [
    'Is there a minimum stay?',
    "Christmas and New Year's (December 20 to January 4) require 7 nights. We confirm the exact terms for your dates when we reply.",
  ],
  [
    'Where are the estates?',
    'Palacio Musical, Palacio Tropical and The View House are in Tambor on the Nicoya Peninsula, and Musical and Tropical sit side by side. Palacio Las Palmas is in Atenas, in Costa Rica\'s Central Valley.',
  ],
];

// Up to three recent, readable reviews, from different estates where possible.
function pickReviews(all) {
  if (!all || !all.length) return [];
  const ok = all
    .filter((r) => r.text && r.text.length >= 90 && r.text.length <= 420)
    .sort((a, b) => (new Date(b.date || 0).getTime() || 0) - (new Date(a.date || 0).getTime() || 0));
  const out = [];
  const seen = new Set();
  ok.forEach((r) => {
    if (out.length < 3 && !seen.has(r.villa)) {
      out.push(r);
      seen.add(r.villa);
    }
  });
  ok.forEach((r) => {
    if (out.length < 3 && !out.includes(r)) out.push(r);
  });
  return out;
}

// Scrolls to the request form: the one in the hero, or the one at the bottom once the hero is behind the visitor.
function scrollToQuiz() {
  const h = document.getElementById('h-quiz');
  const f = document.getElementById('f-quiz');
  const past = h && h.getBoundingClientRect().bottom < 0;
  const el = (past ? f : h) || h || f;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function EstateCard({ v, state, holidays, stats, top, onPick }) {
  const ranges = state.status === 'ready' ? state.byVilla[v.name] || [] : null;
  const next = ranges ? openWindows(ranges, { nights: 7, count: 1 })[0] : null;
  const pg = perGuest(v);
  const gift = GIFT_SLUGS.includes(v.slug);
  return (
    <article className="ec">
      <div className="im">
        <img src={IMG[v.name]} alt={`${v.name}, ${v.location}`} loading="lazy" width="720" height="540" />
        <div className="tags">
          {top && <span className="tag2">Most reviewed</span>}
          {gift && <span className="tag2 gold">Sunset cruise gift</span>}
        </div>
      </div>
      <div className="bd">
        <span className="best">{v.bestFor}</span>
        <h3>{v.name}</h3>
        <p className="etag">{v.tagline}</p>
        <div className="facts">
          <span>{v.bedrooms} {v.useEnsuites ? 'en-suites' : 'bedrooms'}</span>
          <span>Up to {v.guests} guests</span>
          {v.size && <span>{v.size}</span>}
        </div>
        {stats && (
          <div className="erate"><i>★</i> {stats.avg.toFixed(1)} · {stats.count} {stats.count === 1 ? 'review' : 'reviews'}</div>
        )}
        <div className="price">
          <small>Starting at</small>
          <b>${v.startingPrice.toLocaleString('en-US')} <i>/ night</i></b>
          {pg ? <span className="pg">≈ ${pg} per guest / night</span> : null}
        </div>
        {ranges && (
          <div className="av">
            {holidays.map((p) => {
              const st = periodStatus(ranges, p);
              return (
                <span key={p.key} className={st}><b />{p.name}: {STATUS[st]}</span>
              );
            })}
            {next && <span className="nx">Next open week: {fmt(next.s)} – {fmt(next.e)}</span>}
          </div>
        )}
        <button type="button" className="btn btn-dark" onClick={() => onPick(v)}>Check these dates</button>
      </div>
    </article>
  );
}

function StickyCta() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const h = document.getElementById('h-quiz');
      const f = document.getElementById('f-quiz');
      const past = h ? h.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      const atEnd = f ? f.getBoundingClientRect().top < window.innerHeight : false;
      setOn(past && !atEnd);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className={`stk${on ? ' on' : ''}`} aria-hidden={!on}>
      <button type="button" className="btn btn-gold" tabIndex={on ? 0 : -1} onClick={scrollToQuiz}>
        Check my dates · free proposal
      </button>
    </div>
  );
}

function Page({ cfgBase, variant }) {
  const { set } = useQuiz();
  const holidays = useMemo(() => upcomingHolidays(), []);
  const lead = holidays[0];
  const book = useBookings(NAMES);
  const reviews = useApprovedReviews(NAMES);
  const stats = reviewStats(reviews);
  const perVilla = useMemo(
    () => Object.fromEntries(NAMES.map((n) => [n, reviewStats((reviews || []).filter((r) => r.villa === n))])),
    [reviews]
  );
  const topName = useMemo(() => {
    const best = NAMES.reduce((a, b) => ((perVilla[b]?.count || 0) > (perVilla[a]?.count || 0) ? b : a), NAMES[0]);
    return (perVilla[best]?.count || 0) >= 5 ? best : null;
  }, [perVilla]);
  const picked = useMemo(() => pickReviews(reviews), [reviews]);
  const guestPrices = ACTIVE.map(perGuest).filter(Boolean);

  // The holiday page states how many estates are really open, computed from the live calendar.
  const cfg = useMemo(() => {
    if (variant !== 'holiday' || !lead) return cfgBase;
    const season = seasonLabel(holidays);
    const names = holidays.map((p) => p.name).join(' & ');
    const open =
      book.status === 'ready'
        ? NAMES.filter((n) => periodStatus(book.byVilla[n] || [], lead) === 'open').length
        : null;
    return {
      ...cfgBase,
      eyebrow: `${names} ${season}`,
      sub:
        open
          ? `${open} of ${NAMES.length} estates are still open for ${lead.name} week. Stay 7 nights at Palacio Musical or Palacio Tropical and a private sunset catamaran cruise is our gift.`
          : cfgBase.sub,
    };
  }, [cfgBase, variant, lead, holidays, book]);

  useEffect(() => {
    captureAttribution();
    startMetaPixel();
    track('ViewContent', { content_name: cfgBase.key });
    window.scrollTo(0, 0);
  }, [cfgBase.key]);

  const calendarStart = variant === 'holiday' && lead ? lead.start : undefined;

  const pickEstate = (v) => {
    track('EstatePick', { villa: v.name });
    set({ group: GROUP_OF[v.name], villa: v.name, sel: EMPTY, flexible: false, window: '', step: 3 }, 'card');
    scrollToQuiz();
  };

  const quizProps = { book, cfg, holidays, calendarStart };

  return (
    <>
      <TopBar />

      <main>
        <section className="hero2">
          <picture>
            <source media="(max-width: 720px)" srcSet="/images/lp/hero-720.webp" />
            <img className="bg" src="/images/lp/hero-1280.webp" alt="" fetchpriority="high" decoding="async" />
          </picture>
          <div className="wrap">
            <div className="hcopy">
              <div className="eyebrow">{cfg.eyebrow}</div>
              <h1>{cfg.h1}</h1>
              <p className="sub">{cfg.sub}</p>
              <div className="rate" aria-live="polite">
                {stats && (
                  <>
                    <span className="stars" aria-hidden="true">★★★★★</span>
                    <b>{stats.avg.toFixed(1)}</b>
                    <span>from {stats.count} guest reviews</span>
                  </>
                )}
              </div>
              <p className="giftpill">
                <i>★</i>
                <span className="gl"><b>Our gift:</b> a private sunset catamaran cruise with every 7-night stay at Palacio Musical or Palacio Tropical.</span>
                <span className="gs"><b>Our gift:</b> a free sunset catamaran cruise with 7 nights</span>
              </p>
            </div>
            <LeadQuiz idp="h" {...quizProps} />
          </div>
        </section>

        <div className="trust">
          <div className="wrap">
            <span><b>Concierge included</b> in every stay</span>
            <span><b>Book directly</b> with our local team</span>
            <span><b>Nothing is booked</b> until you confirm</span>
            <span><b>Tambor · Atenas</b> Costa Rica</span>
          </div>
        </div>

        {picked.length > 0 && (
          <section className="proof">
            <div className="wrap">
              <div className="center">
                <div className="eyebrow">Guest reviews</div>
                <h2 className="title">{stats ? `${stats.avg.toFixed(1)} out of 5, from ${stats.count} guests` : 'What our guests say'}</h2>
              </div>
              <div className="revgrid">
                {picked.map((r) => <ReviewCard key={r.id} r={r} clamp />)}
              </div>
            </div>
          </section>
        )}

        <GuestSpotlight onCta={scrollToQuiz} />

        <section className="why">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">Why groups choose Palacio</div>
              <h2 className="title">Everyone together, nothing to organize.</h2>
            </div>
            <div className="whyg">
              <div><h3>One house, one team</h3><p>Your group stays together under one roof. Our concierge team arranges transfers, chefs, tours and restaurant tables, so nobody has to organize alone.</p></div>
              <div><h3>Private by design</h3><p>Entire estates for your group alone: no shared spaces, no strangers. Ocean-view decks and direct beach access at our oceanfront estates.</p></div>
              <div><h3>Priced per estate, not per room</h3><p>From about ${Math.min(...guestPrices)} to ${Math.max(...guestPrices)} per guest per night at full capacity, concierge included. See each estate&apos;s rate below.</p></div>
              <div><h3>Made for celebrations</h3><p>Birthdays, reunions, weddings: a whale-watching deck with tiki bar, a full music studio and space for everyone to gather.</p></div>
            </div>
          </div>
        </section>

        <section className="estates" id="estates">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">Our private estates</div>
              <h2 className="title">Which estate fits your group?</h2>
              <p className="lead">Tap an estate to check its dates. We confirm every detail personally.</p>
            </div>
            <div className="egroup">
              <h3>For 9 to 20 guests</h3>
              <p className="egnote">Palacio Musical and Palacio Tropical sit side by side and can be booked together for very large groups.</p>
              <div className="egrid">
                {BIG.map((n) => {
                  const v = ACTIVE.find((x) => x.name === n);
                  return <EstateCard key={n} v={v} state={book} holidays={holidays} stats={perVilla[n]} top={topName === n} onPick={pickEstate} />;
                })}
              </div>
            </div>
            <div className="egroup">
              <h3>For up to 8 guests</h3>
              <div className="egrid">
                {SMALL.map((n) => {
                  const v = ACTIVE.find((x) => x.name === n);
                  return <EstateCard key={n} v={v} state={book} holidays={holidays} stats={perVilla[n]} top={topName === n} onPick={pickEstate} />;
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="how">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">How it works</div>
              <h2 className="title">Three steps. No pressure.</h2>
            </div>
            <ol className="steps">
              <li><b>1</b><h3>Tell us your dates</h3><p>Four quick questions. It takes about 60 seconds.</p></li>
              <li><b>2</b><h3>Get your personal proposal</h3><p>We check live availability and reply personally within 24 hours, with a proposal tailored to your group.</p></li>
              <li><b>3</b><h3>Confirm only if you love it</h3><p>Nothing is booked until you say yes. No obligation.</p></li>
            </ol>
          </div>
        </section>

        <section className="inc">
          <div className="wrap incg">
            <div>
              <div className="eyebrow">Included with every stay</div>
              <h2 className="title">Everything that makes the week effortless.</h2>
              <ul className="checks">
                <li>The entire estate, just for your group</li>
                <li>Your personal concierge team, before and during your stay</li>
                <li>Housekeeping</li>
              </ul>
              <p className="incnote">Arranged on request and booked separately: private chef, tours and adventures, airport transfers, spa and wellness.</p>
            </div>
            <div className="giftbox">
              <span className="gstar" aria-hidden="true">★</span>
              <h3>Our gift with 7 nights</h3>
              <p>A private sunset catamaran cruise with snacks and drinks for up to 20 guests, a $1,200 value. Included at Palacio Musical and Palacio Tropical.</p>
              <button type="button" className="btn btn-gold" onClick={scrollToQuiz}>Check my dates</button>
            </div>
          </div>
        </section>

        <section className="concierge">
          <div className="wrap conc">
            <img src="/images/lp/hosts.webp" alt="Mila and Filip, your Palacio concierge team" loading="lazy" width="640" height="800" />
            <div>
              <div className="incl">✓ Included in every booking</div>
              <h2 className="title">Meet Mila &amp; Filip, your personal concierge team.</h2>
              <p className="lead">From your first message to your last farewell, Mila and Filip are with you. They organize everything, so you never have to ask twice and nothing is left to chance.</p>
              <p className="slogan">Come as guests.<em>Leave as family.</em></p>
              <p className="promise">Our promise: no wish left unanswered.</p>
              <div style={{ marginTop: 28 }}>
                <button type="button" className="btn btn-gold" onClick={scrollToQuiz}>Check my dates</button>
              </div>
            </div>
          </div>
        </section>

        <section className="exp">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">Experiences</div>
              <h2 className="title">Everything Costa Rica has to offer, arranged for you.</h2>
            </div>
            <div className="expgrid">
              {EXPERIENCES.map(([t, d, src]) => (
                <div className="ex" key={t}>
                  <img src={src} alt={t} loading="lazy" width="560" height="740" />
                  <div><h4>{t}</h4><p>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="exp wh" id="faq">
          <div className="wrap">
            <div className="center">
              <div className="eyebrow">Good to know</div>
              <h2 className="title">Questions before you ask</h2>
            </div>
            <div className="faq">
              {FAQ.map(([qq, a]) => (
                <details key={qq}><summary>{qq}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="finalq">
          <div className="wrap fq">
            <div className="fqcopy">
              <div className="eyebrow">The Palacio Collection</div>
              <h2 className="title">Your Palacio is waiting.</h2>
              <p className="lead">Tell us when you would like to arrive. We take care of the rest.</p>
              <p className="alt">
                Prefer to chat?{' '}
                <a
                  href={waLink("Hi! I'd like to check availability at The Palacio Collection.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('Contact', { channel: 'whatsapp' })}
                >
                  Message us on WhatsApp
                </a>
              </p>
            </div>
            <LeadQuiz idp="f" {...quizProps} />
          </div>
        </section>
      </main>

      <MiniFooter />

      <StickyCta />
    </>
  );
}

export default function Welcome() {
  const { variant } = useParams();
  const cfgBase = VARIANTS[variant] || VARIANTS.general;
  return (
    <div className="pc lp">
      <Helmet>
        <title>Private Costa Rica Estates for Your Group | The Palacio Collection</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${SITE_URL}/welcome`} />
      </Helmet>
      <QuizProvider key={cfgBase.key} preset={{ occasion: cfgBase.occasion }}>
        <Page cfgBase={cfgBase} variant={cfgBase.key} />
      </QuizProvider>
    </div>
  );
}
