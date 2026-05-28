import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getSiteBrand } from '../utils/siteBrand';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const brand = getSiteBrand();
  const contactSectionId = brand.key === 'wedding' ? 'wedding-contact' : 'contact';

  const handleContact = () => {
    setIsMenuOpen(false);
    const target = document.getElementById(contactSectionId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      const homeWithHash = `${brand.homeHref}#${contactSectionId}`;

      if (brand.homeHref.startsWith('http')) {
        window.location.href = homeWithHash;
      } else {
        navigate(homeWithHash);
      }
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container">
        <div className="flex items-center justify-between header-top-row" style={{ height: '80px' }}>
          {/* Logo */}
          <a href={brand.homeHref} className="flex items-center header-logo" style={{ textDecoration: 'none' }}>
            <h1 className="heading-3 text-dark">{brand.name}</h1>
            <span className="text-luxury ml-2 header-logo-location">Costa Rica</span>
          </a>

          {/* Right Menu */}
          <div className="flex items-center gap-4 header-actions">
            {/* Pricing Guide Button */}
            <a
              href={brand.pricingHref}
              className="btn btn-luxury header-pricing-btn"
              style={{ fontSize: '0.8rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
            >
              <span className="header-pricing-full">{brand.pricingLabel}</span>
              <span className="header-pricing-short">Pricing</span>
            </a>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn btn-secondary header-menu-btn"
              >
                Menu
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <a href={`#${contactSectionId}`} className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={handleContact}>
                    Contact
                  </a>
                  <Link to="/blog" className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={() => setIsMenuOpen(false)}>
                    Blog
                  </Link>
                  <a href={brand.key === 'wedding' ? brand.villasHref : brand.weddingsHref} className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={() => setIsMenuOpen(false)}>
                    {brand.key === 'wedding' ? 'Explore our Villas' : 'Weddings'}
                  </a>
                  <a href={brand.pricingHref} className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={() => setIsMenuOpen(false)}>
                    {brand.pricingLabel}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;