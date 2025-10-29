import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '80px' }}>
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="heading-3 text-dark">Executive Vacations</h1>
            <span className="text-luxury ml-2">Costa Rica</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center bg-light rounded-xl p-1 shadow-md" style={{ minWidth: '400px' }}>
            <div className="flex-1 px-4 py-2 cursor-pointer hover:bg-white rounded-lg transition-colors">
              <div className="body-small text-dark font-semibold">Where</div>
              <div className="body-small text-gray">Search destinations</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex-1 px-4 py-2 cursor-pointer hover:bg-white rounded-lg transition-colors">
              <div className="body-small text-dark font-semibold">Check-in</div>
              <div className="body-small text-gray">Add dates</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex-1 px-4 py-2 cursor-pointer hover:bg-white rounded-lg transition-colors">
              <div className="body-small text-dark font-semibold">Guests</div>
              <div className="body-small text-gray">Add guests</div>
            </div>
            <button className="btn btn-primary">
              Search
            </button>
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
                  <a href="#signup" className="block px-4 py-3 body-regular text-dark hover:bg-light">
                    Sign up
                  </a>
                  <a href="#login" className="block px-4 py-3 body-regular text-dark hover:bg-light">
                    Log in
                  </a>
                  <hr className="my-2" />
                  <a href="#host" className="block px-4 py-3 body-regular text-dark hover:bg-light">
                    Become a Host
                  </a>
                  <a href="#help" className="block px-4 py-3 body-regular text-dark hover:bg-light">
                    Help Center
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden btn btn-primary btn-small">
              Search
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;