import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CATEGORIES, MILA_WHATSAPP } from '../data/thingstodo';
import { CategoryIcon, LinkIcon, PinIcon, WhatsAppIcon } from '../components/thingstodo/Icons';
import '../styles/thingstodo.css';

// A category counts as the current one once its top is above this line (px from the top of the screen).
const CURRENT_LINE = 120;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToCategory(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
  return true;
}

// Tiles and chips are plain #links that scroll smoothly; a new tab (ctrl or cmd click) keeps the normal link behaviour.
const jumpTo = (id) => (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (scrollToCategory(id)) e.preventDefault();
};

const countLabel = (n) => `${n} ${n === 1 ? 'place' : 'places'}`;

// A place with one link is a single tap target; with a map and a website it shows two buttons.
function Place({ place }) {
  const links = [
    place.maps && { href: place.maps, icon: <PinIcon />, label: 'Maps', action: 'open in Google Maps' },
    place.website && { href: place.website, icon: <LinkIcon />, label: 'Website', action: 'visit the website' },
  ].filter(Boolean);
  const text = (
    <span className="ttd-place__text">
      <span className="ttd-place__name">{place.name}</span>
      {place.note && <span className="ttd-place__note">{place.note}</span>}
    </span>
  );
  if (links.length === 1) {
    const [link] = links;
    return (
      <a className="ttd-place" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${place.name}, ${link.action}`}>
        {text}
        <span className="ttd-place__go">
          {link.icon}
          {link.label}
        </span>
      </a>
    );
  }
  return (
    <div className="ttd-place">
      {text}
      {links.length > 1 && (
        <span className="ttd-place__links">
          {links.map((link) => (
            <a key={link.label} className="ttd-place__go" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${place.name}, ${link.action}`}>
              {link.icon}
              {link.label}
            </a>
          ))}
        </span>
      )}
    </div>
  );
}

function Category({ category: c }) {
  return (
    <section className="ttd-section" id={c.id} aria-labelledby={`${c.id}-title`} tabIndex={-1}>
      <div className="ttd-section__head">
        <span className="ttd-icon ttd-icon--lg">
          <CategoryIcon name={c.icon} />
        </span>
        <h2 id={`${c.id}-title`}>{c.title}</h2>
      </div>

      {c.reserve ? (
        <div className="ttd-reserve">
          <p className="ttd-reserve__label">Reservations by Mila</p>
          <p className="ttd-reserve__text">{c.intro}</p>
          {c.details?.length > 0 && (
            <ul className="ttd-facts">
              {c.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <a className="ttd-wa" href={MILA_WHATSAPP} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Reserve with Mila on WhatsApp
          </a>
        </div>
      ) : (
        <p className="ttd-section__intro">{c.intro}</p>
      )}

      {c.items.length > 0 ? (
        <ul className="ttd-places">
          {c.items.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <Place place={p} />
            </li>
          ))}
        </ul>
      ) : (
        !c.reserve && <p className="ttd-empty">Our recommendations will be here soon.</p>
      )}
    </section>
  );
}

export default function ThingsToDo() {
  const tilesRef = useRef(null);
  const chipsRef = useRef(null);
  const [active, setActive] = useState('');
  const [barShown, setBarShown] = useState(false);

  // /thingstodo#restaurants opens the page at that category.
  useEffect(() => {
    let id = '';
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (id) scrollToCategory(id);
  }, []);

  // The category bar slides in once the tiles are scrolled away, and its current chip follows the scrolling.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tiles = tilesRef.current;
      setBarShown(!!tiles && tiles.getBoundingClientRect().bottom < 80);
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = '';
      for (const c of CATEGORIES) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= CURRENT_LINE) current = c.id;
      }
      setActive(atEnd && current ? CATEGORIES[CATEGORIES.length - 1].id : current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const list = chipsRef.current;
    const chip = list && list.querySelector('[aria-current="true"]');
    if (!chip) return;
    list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <div className="ttd">
      <Helmet>
        <title>Things to Do Nearby | The Palacio Collection</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="theme-color" content="#0e1a1c" />
      </Helmet>

      <nav className={`ttd-bar${barShown ? ' is-shown' : ''}`} aria-label="Categories">
        <ul className="ttd-bar__list" ref={chipsRef}>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <a className="ttd-chip" href={`#${c.id}`} onClick={jumpTo(c.id)} aria-current={active === c.id ? 'true' : undefined}>
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <header className="ttd-hero">
        <div className="ttd-wrap">
          <a className="ttd-logo" href="/" aria-label="The Palacio Collection, home">
            <img src="/images/area/logo-white.webp" alt="The Palacio Collection" width="300" height="191" />
          </a>
          <p className="ttd-eyebrow">Costa Rica</p>
          <h1>Things to do nearby</h1>
          <p className="ttd-lead">Our favorite places around the villas. For adventures and wellness, Mila arranges the reservation for you.</p>
        </div>
      </header>

      <main className="ttd-main">
        <div className="ttd-wrap">
          <ul className="ttd-tiles" ref={tilesRef} aria-label="Categories">
            {CATEGORIES.map((c) => (
              <li className="ttd-tile" key={c.id}>
                <a href={`#${c.id}`} onClick={jumpTo(c.id)}>
                  <span className="ttd-icon">
                    <CategoryIcon name={c.icon} />
                  </span>
                  <span className="ttd-tile__text">
                    <span className="ttd-tile__title">{c.title}</span>
                    {c.reserve ? (
                      <span className="ttd-tile__sub is-reserve">Reserve with Mila</span>
                    ) : (
                      c.items.length > 0 && <span className="ttd-tile__sub">{countLabel(c.items.length)}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {CATEGORIES.map((c) => (
            <Category key={c.id} category={c} />
          ))}
        </div>
      </main>

      <footer className="ttd-foot">
        <p>Enjoy your stay in Costa Rica.</p>
        <a href="/">The Palacio Collection</a>
      </footer>
    </div>
  );
}
