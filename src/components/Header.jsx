import React, { useState } from 'react';
import BecomeHostModal from './BecomeHostModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

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
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <a href="#host" className="body-regular text-dark hover:text-blue transition-colors font-semibold">
                Become a Host
              </a>
              <button className="body-small text-dark hover:text-blue transition-colors">
                EN
              </button>
            </div>

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
                  <button 
                    onClick={() => {
                      setIsHostModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 body-regular text-dark hover:bg-light"
                  >
                    Become a Host
                  </button>
                  <a href="#footer" className="block px-4 py-3 body-regular text-dark hover:bg-light">
                    Contact
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Become a Host Modal */}
      <BecomeHostModal 
        isOpen={isHostModalOpen} 
        onClose={() => setIsHostModalOpen(false)} 
      />
    </header>
  );
};

export default Header;