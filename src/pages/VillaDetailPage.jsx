import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import villas from '../data/villas';
import { SITE_URL } from '../utils/siteBrand';
import PalacioLayout from '../components/palacio/PalacioLayout';
import DatePicker, { GiftNote, selectionText } from '../components/palacio/DatePicker';
import InquiryForm from '../components/palacio/InquiryForm';
import { PriceBlock } from '../components/palacio/VillaCard';
import { VillaReviews } from '../components/palacio/Reviews';
import { addDays, label, useBookedRanges, useReveal } from '../components/palacio/shared';

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

const goInquire = () => document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' });

export default function VillaDetailPage() {
  const { slug } = useParams();
  const villa = villas.find((v) => v.slug === slug);
  const [sel, setSel] = useState({ s: null, e: null });
  const [formVilla, setFormVilla] = useState(villa?.name || '');
  const [lb, setLb] = useState(-1);
  const soon = !!villa?.isComingSoon;
  const ranges = useBookedRanges(villa && !soon ? villa.name : null);

  const images = villa
    ? [...new Set(villa.detailImages?.length ? villa.detailImages : villa.images)].filter((p) => !/\.(mp4|pdf)$/i.test(p))
    : [];

  useEffect(() => {
    setSel({ s: null, e: null });
    setFormVilla(villa?.name || '');
    setLb(-1);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useReveal([slug]);

  // SEO meta tags and structured data per villa (copy comes from the villa data).
  useEffect(() => {
    if (!villa) return undefined;
    const title = villa.seoTitle || `${villa.name} — Luxury Villa in Costa Rica | The Palacio Collection`;
    const rawDesc = villa.detailedDescription || villa.description || '';
    const desc = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}…` : rawDesc;
    const image = villa.images?.[0] ? `${SITE_URL}${villa.images[0]}` : `${SITE_URL}/images/hero-bg.webp`;
    document.title = title;
    setMeta('description', villa.seoDescription || desc);
    setMeta('og:title', title, true);
    setMeta('og:description', villa.seoDescription || desc, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', `${SITE_URL}/villa/${villa.slug}`, true);
    setMeta('og:image', image, true);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: villa.name,
      description: villa.detailedDescription || villa.description || '',
      url: `${SITE_URL}/villa/${villa.slug}`,
      image,
      address: { '@type': 'PostalAddress', addressLocality: villa.location, addressCountry: 'CR' },
      numberOfRooms: villa.bedrooms,
      amenityFeature: (villa.allAmenities || []).map((a) => ({ '@type': 'LocationFeatureSpecification', name: a.name, value: true })),
      ...(villa.rating
        ? {
            starRating: { '@type': 'Rating', ratingValue: villa.rating, bestRating: 5 },
            aggregateRating: { '@type': 'AggregateRating', ratingValue: villa.rating, bestRating: 5, reviewCount: 10 },
          }
        : {}),
      priceRange: villa.pricing ? `$${villa.pricing.low}–$${villa.pricing.high} per night` : '',
      telephone: '+1-800-EXEC-VACA',
    };
    let schemaEl = document.getElementById('schema-villa');
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.id = 'schema-villa';
      schemaEl.type = 'application/ld+json';
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify(schema);
    return () => schemaEl.remove();
  }, [villa]);

  useEffect(() => {
    if (lb < 0) return undefined;
    const step = (d) => setLb((i) => (i + d + images.length) % images.length);
    const onKey = (e) => {
      if (e.key === 'Escape') setLb(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lb, images.length]);

  if (!villa) {
    return (
      <PalacioLayout>
        <section className="estates">
          <div className="wrap center">
            <h2 className="title">Villa not found</h2>
            <Link className="btn btn-gold" to="/">Back to Home</Link>
          </div>
        </section>
      </PalacioLayout>
    );
  }

  const amenities = (villa.allAmenities || []).map(label).filter(Boolean);
  const features = (villa.specialFeatures || []).map(label).filter(Boolean);
  const others = villas.filter((v) => v.slug !== villa.slug);
  const bestIsBestFor = /^Best for/.test(villa.bestFor || '');
  const step = (d) => setLb((i) => (i + d + images.length) % images.length);
  const extend7 = () => sel.s && setSel({ s: sel.s, e: addDays(sel.s, 7) });

  return (
    <PalacioLayout>
      <Helmet>
        <link rel="canonical" href={`${SITE_URL}/villa/${villa.slug}`} />
      </Helmet>

      <div className="wrap dgw">
        <div className="dg">
          {images.slice(0, 5).map((p, i) => (
            <figure key={p} onClick={() => setLb(i)}>
              <img src={encodeURI(p)} alt={villa.name} loading={i ? 'lazy' : undefined} />
              {i === Math.min(4, images.length - 1) && images.length > 1 && (
                <button type="button" className="all" onClick={(e) => { e.stopPropagation(); setLb(0); }}>
                  Show all {images.length} photos
                </button>
              )}
            </figure>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="dcard">
          <div className="crumb"><Link to="/">The Collection</Link> &nbsp;/&nbsp; {villa.name}</div>
          <div className="dtop">
            <div>
              <div className="eyebrow">{villa.type} · {villa.location}</div>
              <h1>{villa.name}</h1>
              <div className="tag">{villa.tagline}</div>
            </div>
            {!soon && <PriceBlock v={villa} />}
          </div>
          <div className="fbar">
            <div><b>{villa.bedrooms}</b><span>{villa.useEnsuites ? 'En-suites' : 'Bedrooms'}</span></div>
            {villa.bathrooms ? <div><b>{villa.bathrooms}</b><span>Bathrooms</span></div> : null}
            {villa.guests ? <div><b>{villa.guests}</b><span>Guests</span></div> : null}
            {villa.size ? <div><b>{villa.size}</b><span>Size</span></div> : null}
            {villa.rating ? <div><b>★ {villa.rating}</b><span>Guest rating</span></div> : null}
          </div>
        </div>

        <div className="dgrid">
          <div>
            <div className="dsec">
              <div className="hl">
                <div>
                  <small>{bestIsBestFor ? 'Best for' : 'Status'}</small>
                  {(villa.bestFor || '').replace(/^Best for /, '')}
                </div>
                {(villa.topAmenities || []).slice(0, 3).map((a) => (
                  <div key={label(a)}><small>Highlight</small>{label(a)}</div>
                ))}
              </div>
              <h2>The estate</h2>
              <p>{villa.detailedDescription}</p>
              {features.length > 0 && (
                <ul className="am" style={{ marginTop: 20 }}>{features.map((a) => <li key={a}>{a}</li>)}</ul>
              )}
            </div>
            <div className="dsec">
              <h2>Amenities</h2>
              <ul className="am">{amenities.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
            <div className="dsec">
              <h2>Location</h2>
              <p><strong style={{ fontWeight: 500 }}>{villa.fullLocation || villa.location}</strong>{'\n'}{villa.locationDescription}</p>
            </div>
            <div className="dsec" id="availability">
              <h2>Availability</h2>
              {soon ? (
                <p>
                  {villa.isPlanned
                    ? `This estate is currently under construction and opens in ${villa.availableFrom}.`
                    : `This estate opens in ${villa.availableFrom || 'the near future'}.`}{' '}
                  Join the early list and we will contact you personally when dates are released.
                </p>
              ) : (
                <>
                  <div className="cal">
                    <DatePicker ranges={ranges} sel={sel} onChange={setSel} slug={villa.slug} />
                  </div>
                  <p className="calnote">Choose your check-in and check-out. Crossed-out dates are already reserved. Free dates are not yet a confirmed booking – send your request and we confirm personally.</p>
                </>
              )}
            </div>
            <div className="dsec">
              <h2>Guest reviews</h2>
              <VillaReviews villa={villa} />
            </div>
          </div>

          <aside className="side">
            <div className="eyebrow">{soon ? `Opening ${villa.availableFrom || 'soon'}` : 'Reserve'}</div>
            {!soon && (
              <>
                <div className="urg">Peak-season dates fill early. Ask for availability today.</div>
                <div className="urg" style={{ color: 'var(--char)' }}>✓ Personal concierge included</div>
              </>
            )}
            <h3>{villa.name}</h3>
            {!soon && <PriceBlock v={villa} />}
            {!soon && (
              <>
                <div className="sidesum">{sel.s ? selectionText(sel) : 'Pick your dates in the calendar'}</div>
                <div className="sidegift"><GiftNote sel={sel} slug={villa.slug} ranges={ranges} onExtend={extend7} /></div>
              </>
            )}
            {soon ? (
              <button type="button" className="btn btn-gold" onClick={goInquire}>Join the Early List</button>
            ) : (
              <>
                <button type="button" className="btn btn-gold" onClick={goInquire}>Request Availability</button>
                <Link className="btn btn-line" to={`/pricing?villa=${encodeURIComponent(villa.name)}`}>View Pricing Guide</Link>
                {villa.virtualTour && (
                  <a className="btn btn-line" href={villa.virtualTour} target="_blank" rel="noopener noreferrer">Take the Virtual Tour</a>
                )}
              </>
            )}
            <small>Personal reply from our local team · no obligation</small>
          </aside>
        </div>
      </div>

      <section className="estates">
        <div className="wrap">
          <div className="center">
            <div className="eyebrow">Continue Exploring</div>
            <h2 className="title">More from the Collection</h2>
          </div>
          <div className="other">
            {others.map((o) => (
              <Link key={o.slug} to={`/villa/${o.slug}`}>
                <img src={encodeURI(o.images[0])} alt="" loading="lazy" />
                <div className="loc">{o.location}</div>
                <b>{o.name}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="inquire">
        <div className="wrap inq">
          <div>
            <div className="eyebrow">Plan Your Stay</div>
            <h2 className="title">Request availability for {villa.name}</h2>
            <p className="lead">A short request is all we need. We reply personally.</p>
          </div>
          <InquiryForm key={villa.slug} formName="villa-inquiry" villa={formVilla} onVillaChange={setFormVilla} sel={sel} onSelChange={setSel} />
        </div>
      </section>

      <div className={`lb${lb >= 0 ? ' on' : ''}`} onClick={() => setLb(-1)}>
        <button type="button" className="lbn l" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
        {lb >= 0 && <img src={encodeURI(images[lb])} alt="" onClick={(e) => { e.stopPropagation(); step(1); }} />}
        <button type="button" className="lbn r" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
        <div className="lbc">{images.length > 1 && lb >= 0 ? `${lb + 1} / ${images.length}` : ''}</div>
      </div>
    </PalacioLayout>
  );
}
