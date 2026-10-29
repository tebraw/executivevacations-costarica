import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import villas from '../../data/villas';
import { WEDDINGS_URL } from './shared';
import '../../styles/palacio.css';

// Scrolls to a section of the current page, or opens the home page at that section.
export function HashLink({ id, children, className }) {
  const navigate = useNavigate();
  const go = (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else navigate({ pathname: '/', hash: `#${id}` });
  };
  return (
    <a href={`/#${id}`} className={className} onClick={go}>
      {children}
    </a>
  );
}

export function PalacioNav() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const on = () => setSmall(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <nav id="nav" className={small ? 'small' : ''}>
      <div className="wrap">
        <Link className="logo" to="/">
          <img src="/brand/logo-main.png" alt="The Palacio Collection" />
        </Link>
        <div className="links">
          <HashLink id="estates">Estates</HashLink>
          <HashLink id="concierge">Concierge</HashLink>
          <HashLink id="reviews">Reviews</HashLink>
          <HashLink id="experiences">Experiences</HashLink>
          <Link to="/blog">Blog</Link>
          <a href={WEDDINGS_URL} target="_blank" rel="noopener noreferrer">Weddings ↗</a>
          <HashLink id="inquire" className="btn btn-gold">Plan Your Stay</HashLink>
        </div>
      </div>
    </nav>
  );
}

export function PalacioFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <img className="flogo" src="/brand/logo-white.png" alt="The Palacio Collection" />
            <p style={{ marginTop: 16, maxWidth: 300 }}>
              Extraordinary private estates. Personalized hospitality. Unforgettable experiences.
            </p>
          </div>
          <div>
            <h5>Estates</h5>
            <div>
              {villas.map((v) => (
                <Link key={v.slug} to={`/villa/${v.slug}`}>{v.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <HashLink id="concierge">Concierge</HashLink>
            <HashLink id="reviews">Reviews</HashLink>
            <HashLink id="experiences">Experiences</HashLink>
            <Link to="/blog">Blog</Link>
            <a href={WEDDINGS_URL} target="_blank" rel="noopener noreferrer">Weddings ↗</a>
            <Link to="/pricing">Pricing Guide</Link>
            <HashLink id="inquire">Plan Your Stay</HashLink>
          </div>
          <div>
            <h5>Contact</h5>
            <a href="mailto:bookings@thepalaciocollection.com">bookings@thepalaciocollection.com</a>
            <a href="tel:+13038818588">303-881-8588</a>
            <a href="https://www.instagram.com/paradisevillascostarica/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <div className="copy">
          <div>© {new Date().getFullYear()} The Palacio Collection. All rights reserved.</div>
          <div className="legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Page frame of the new design: navigation, content, footer and the mobile call-to-action.
export default function PalacioLayout({ children }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 100);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return (
    <div className="pc">
      <PalacioNav />
      <main>{children}</main>
      <PalacioFooter />
      <div className="sticky">
        <HashLink id="inquire" className="btn btn-gold">Plan Your Stay</HashLink>
      </div>
    </div>
  );
}
