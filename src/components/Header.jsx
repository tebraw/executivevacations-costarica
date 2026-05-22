import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleContact = () => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#contact');
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '80px' }}>
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="heading-3 text-dark">Executive Vacations</h1>
            <span className="text-luxury ml-2">Costa Rica</span>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn btn-secondary"
              >
                Menu
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <a href="#contact" className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={handleContact}>
                    Contact
                  </a>
                  <Link to="/blog" className="block px-4 py-3 body-regular text-dark hover:bg-light" onClick={() => setIsMenuOpen(false)}>
                    Blog
                  </Link>
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