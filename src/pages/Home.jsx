import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import villas from '../data/villas';
import { SITE_URL } from '../utils/siteBrand';
import PalacioLayout from '../components/palacio/PalacioLayout';
import VillaCard, { CHIPS } from '../components/palacio/VillaCard';
import InquiryForm from '../components/palacio/InquiryForm';
import { ReviewCard, useApprovedReviews } from '../components/palacio/Reviews';
import { WEDDINGS_URL, useReveal } from '../components/palacio/shared';

const U = (id) => `https://images.unsplash.com/${id}?w=800&h=1000&fit=crop`;

const EXPERIENCES = [
  ['Private Chef', 'Your own chef, at your estate.', '/images/weddings/dinner.jpg'],
  ['Catamaran Tour', 'Sail the Pacific coastline.', '/images/weddings/catamaran.jpg'],
  ['ATV Adventure', 'Quad through the mountains.', '/images/activities/ATVTourRainbowMountain.webp'],
  ['Zip-lining', 'Fly through the jungle canopy.', '/images/activities/zipline.avif'],
  ['Private Air Charter', 'Arrive in style.', '/images/activities/privateaircharter.webp'],
  ['Spa & Massage', 'Treatments in your own villa.', U('photo-1600334129128-685c5582fd35')],
  ['Private Yoga', 'Sunrise sessions at the estate.', U('photo-1544367567-0f2fcb009e0b')],
  ['Surf Lessons', 'Learn on a beautiful coast.', U('photo-1502933691298-84fc14542831')],
  ['Horseback Riding', 'Explore on horseback.', U('photo-1553284965-83fd3e82fa5a')],
  ['Golf', 'Tee times arranged for you.', U('photo-1535131749006-b7f58c99034b')],
  ['Private Workout', 'Personal training at the estate.', U('photo-1517836357463-d25dfeac3438')],
  ['Babysitting', 'Trusted care, so you can relax.', U('photo-1503454537195-1dcabb73ffb9')],
];

const PILLARS = [
  ['Absolute privacy', 'Entire estates for your group alone, away from crowds and shared spaces.'],
  ['Extraordinary settings', 'Ocean views, whale observatory decks and architecture worth coming home to.'],
  ['Personal attention', 'A local team you speak to before, during and after your stay.'],
  ['Moments that last', 'Family gatherings, celebrations and weddings, effortlessly hosted.'],
];

const SERVICES = [
  'Private chefs & dining', 'Restaurant reservations', 'Airport & private transfers', 'Catamaran & fishing trips',
  'Massage & wellness', 'Tours & adventures', 'Celebrations & weddings', 'Anything else you wish for',
];

function setMeta(name, content, prop) {
  const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(prop ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Home() {
  const location = useLocation();
  const [filter, setFilter] = useState('all');
  const [villa, setVilla] = useState('');
  const [sel, setSel] = useState({ s: null, e: null });
  const track = useRef(null);
  const visibleCount = villas.filter((v) => !v.isPlanned).length;

  const reviews = useApprovedReviews(villas.filter((v) => !v.isComingSoon).map((v) => v.name));
  useReveal([reviews?.length]);

  useEffect(() => {
    const title = 'Private Luxury Villas in Costa Rica — Beachfront, Pool & Concierge | The Palacio Collection';
    const desc = `Discover ${visibleCount} exclusive luxury villas in Costa Rica. Beachfront estates with private pools, stunning ocean views, and personalized concierge service. Book your dream vacation today.`;
    document.title = title;
    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', `${SITE_URL}/`, true);
    setMeta('og:image', `${SITE_URL}/images/hero-bg.webp`, true);
  }, [visibleCount]);

  // A villa page or card can open the home page with a villa preselected in the request form.
  useEffect(() => {
    const byName = location.state?.villa;
    const byId = location.state?.selectVilla;
    const target = byName || villas.find((v) => v.id === byId)?.name;
    if (target) {
      setVilla(target);
      setSel({ s: null, e: null });
      setTimeout(() => document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [location.state]);

  const ask = (name) => {
    setVilla(name);
    setSel({ s: null, e: null });
    document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' });
  };

  const shown = reviews
    ? villas.filter((v) => !v.isComingSoon).flatMap((v) => reviews.filter((r) => r.villa === v.name).slice(0, 2)).slice(0, 6)
    : [];

  return (
    <PalacioLayout>
      <Helmet>
        <link rel="canonical" href={`${SITE_URL}/`} />
      </Helmet>

      <header className="hero" style={{ backgroundImage: "url('/images/hero-bg.webp')" }}>
        <div className="wrap">
          <h1 className="lockup" aria-label="The Palacio Collection – Ultra-Luxury Villas in Costa Rica">
            <span className="l1" aria-hidden="true"><span className="the">The</span><span className="pal">Palacio</span></span>
            <span className="col" aria-hidden="true">Collection</span>
            <span className="sub" aria-hidden="true">Ultra-Luxury Villas in Costa Rica</span>
          </h1>
          <div className="cta">
            <a className="btn btn-gold" href="/#inquire" onClick={(e) => { e.preventDefault(); ask(''); }}>Check Availability</a>
            <a className="btn btn-out" href="/#estates" onClick={(e) => { e.preventDefault(); document.getElementById('estates')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore the Collection</a>
          </div>
        </div>
      </header>

      <div className="trust">
        <div className="wrap">
          <span><b>{visibleCount}</b> private estates</span>
          <span><b>Personal</b> reply from our local team</span>
          <span><b>Concierge included</b> in every booking</span>
          <span><b>Tambor · Atenas</b> Pacific coast &amp; Central Valley</span>
        </div>
      </div>

      <section>
        <div className="wrap intro">
          <div>
            <div className="eyebrow">The Collection</div>
            <h2 className="title">Extraordinary private estates. Personalized hospitality.</h2>
            <p className="lead">The Palacio Collection is not a listing platform. It is a small, curated group of private estates, each with its own character, supported by a dedicated local team who looks after every detail of your stay.</p>
            <div className="stats">
              <div><b>{visibleCount}</b><span>Private estates</span></div>
              <div><b>1</b><span>Local concierge team</span></div>
              <div><b>Pacific</b><span>Coast of Costa Rica</span></div>
            </div>
          </div>
          <img src="/images/intro-night.jpg" alt="Palacio estate at night" loading="lazy" />
        </div>
      </section>

      <section className="estates" id="estates">
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">Our Private Estates</div>
            <h2 className="title">Find the estate that fits your story</h2>
            <p className="lead">Each estate is individually curated. Explore the details, then request availability and we will respond personally.</p>
          </div>
          <div className="chips" role="group" aria-label="Filter estates">
            {CHIPS.map(([key, text]) => (
              <button key={key} type="button" className={`chip${filter === key ? ' on' : ''}`} onClick={() => setFilter(key)}>{text}</button>
            ))}
          </div>
          <div className="grid" id="grid">
            {villas.map((v) => (
              <VillaCard key={v.slug} v={v} onAsk={ask} hidden={filter !== 'all' && !(v.fit || []).includes(filter)} />
            ))}
          </div>
          <div className="guide">
            <div>
              <div className="eyebrow" style={{ color: '#f0bd5a' }}>Free · No sign-up</div>
              <h3>See every rate before you ask.</h3>
              <p>Our Pricing Guide shows seasonal rates for each estate, so you can plan with confidence.</p>
            </div>
            <Link className="btn btn-gold" to="/pricing">Open the Pricing Guide</Link>
          </div>
        </div>
      </section>

      <section className="exp wh" id="experiences">
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">Curated Experiences</div>
            <h2 className="title">Everything Costa Rica has to offer, arranged for you</h2>
            <p className="lead">Tell Mila &amp; Filip what you dream of. We organize it, from adventure to complete relaxation.</p>
          </div>
          <div className="sl">
            <button type="button" className="sa" aria-label="Previous" onClick={() => track.current?.scrollBy({ left: -320, behavior: 'smooth' })}>‹</button>
            <button type="button" className="sa r" aria-label="Next" onClick={() => track.current?.scrollBy({ left: 320, behavior: 'smooth' })}>›</button>
            <div className="track" ref={track}>
              {EXPERIENCES.map(([name, text, img]) => (
                <div className="ex" key={name}>
                  <img src={img} alt={name} loading="lazy" />
                  <div><h4>{name}</h4><p>{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="wed" id="weddings">
        <div className="wrap wedg">
          <div>
            <div className="eyebrow">Destination Weddings</div>
            <h2 className="title">Planning a wedding in Costa Rica?</h2>
            <p className="lead">Say “I do” with the Pacific as your backdrop. Our dedicated wedding website shows the beach ceremony setting, receptions on the ocean-view decks of Palacio Musical, and everything we arrange for you.</p>
            <ul className="wedf">
              <li>Open-air beach ceremony for up to 150 guests</li>
              <li>Private chefs and full staff</li>
              <li>Catamaran tour included</li>
            </ul>
            <a className="btn btn-gold" href={WEDDINGS_URL} target="_blank" rel="noopener noreferrer">Visit Paradise Weddings Costa Rica ↗</a>
          </div>
          <img src="/images/weddings/ceremony.jpg" alt="A couple exchanging vows on the Costa Rica coast" loading="lazy" />
        </div>
      </section>

      <section id="reviews">
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">Guest Experiences</div>
            <h2 className="title">In our guests' words</h2>
            <p className="lead">Real reviews from guests who stayed with us.</p>
          </div>
          {shown.length > 0 && (
            <div className="revgrid">
              {shown.map((r) => <ReviewCard key={`${r.villa}-${r.id}`} r={r} clamp />)}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">The Palacio Experience</div>
            <h2 className="title">What makes a Palacio stay exceptional</h2>
          </div>
          <div className="pillars">
            {PILLARS.map(([title, text], i) => (
              <div className="pillar" key={title}>
                <div className="n">{`0${i + 1}`}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="concierge" id="concierge">
        <div className="wrap conc">
          <img src="/brand/concierge-team.jpg" alt="Mila and Filip, your Palacio concierge team" loading="lazy" />
          <div>
            <div className="incl">✓ Included in every booking</div>
            <h2 className="title">Meet Mila &amp; Filip, your personal concierge team.</h2>
            <p className="lead">From your first message to your last farewell, Mila and Filip are with you. They organize everything, so you never have to ask twice and nothing is left to chance.</p>
            <div className="story">
              <h3>Hello, we are Mila &amp; Filip.</h3>
              <p>For us, a booking is not a transaction. It is the start of a friendship. We get to know you before you arrive, learn what makes your trip special, and shape every day around it.</p>
              <p>Nothing makes us happier than a guest who leaves with a full heart, and comes back as a friend. That is why we are with you the whole way.</p>
            </div>
            <p className="slogan">Come as guests.<em>Leave as family.</em></p>
            <ul className="svc">{SERVICES.map((s) => <li key={s}>{s}</li>)}</ul>
            <p className="promise">Our promise: no wish left unanswered.</p>
            <div className="who"><div><b>Mila &amp; Filip</b>Your local hosts in Costa Rica</div></div>
            <div style={{ marginTop: 28 }}>
              <a className="btn btn-gold" href="/#inquire" onClick={(e) => { e.preventDefault(); ask(''); }}>Speak with Mila &amp; Filip</a>
            </div>
          </div>
        </div>
      </section>

      <section id="inquire">
        <div className="wrap inq">
          <div>
            <div className="eyebrow">Plan Your Stay</div>
            <h2 className="title">Tell us about your trip</h2>
            <p className="lead">A short request is all we need. We reply personally with availability and a tailored proposal.</p>
            <div className="cl">
              <div><b>Response</b>Personal reply from our local team</div>
              <div><b>Pricing Guide</b>Prefer to browse first? <Link to="/pricing" style={{ textDecoration: 'underline' }}>Request the Pricing Guide</Link> and we send it to you.</div>
            </div>
          </div>
          <InquiryForm formName="contact" villa={villa} onVillaChange={setVilla} sel={sel} onSelChange={setSel} />
        </div>
      </section>

      <section className="exp" id="faq">
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">Good to know</div>
            <h2 className="title">Questions before you ask</h2>
          </div>
          <div className="faq">
            <details><summary>How does booking work?</summary><p>Send a short request. We reply personally with availability and a tailored proposal. Nothing is booked until you confirm.</p></details>
            <details><summary>What does the nightly rate include?</summary><p>The nightly rate includes the estate for your group, the personal concierge service of Mila &amp; Filip, and housekeeping. Additional services such as a private chef, tours and activities are arranged on request and are booked separately.</p></details>
            <details><summary>Can I see all rates first?</summary><p>Yes. The Pricing Guide shows seasonal rates for every estate.</p></details>
            <details><summary>Do you host weddings and celebrations?</summary><p>Yes. Palacio Musical was designed for larger gatherings, with a beach ceremony setting and ocean-view decks. Explore weddings at <a href={WEDDINGS_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-d)', textDecoration: 'underline' }}>Paradise Weddings Costa Rica</a>, or tell us your plans and we will advise.</p></details>
          </div>
        </div>
      </section>

      <section className="final" style={{ backgroundImage: "url('/images/hero-bg.webp')" }}>
        <div className="wrap">
          <div className="eyebrow" style={{ color: '#f0bd5a' }}>The Palacio Collection</div>
          <h2>Your Palacio is waiting.</h2>
          <p>Tell us when you would like to arrive. We take care of the rest.</p>
          <a className="btn btn-gold" href="/#inquire" onClick={(e) => { e.preventDefault(); ask(''); }}>Check Availability</a>
        </div>
      </section>
    </PalacioLayout>
  );
}
