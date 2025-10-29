import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0F172A' }} className="text-white py-16">
      <div className="container">
        <div className="grid grid-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="heading-3 mb-2">Executive Vacations</h3>
              <span className="text-luxury">Costa Rica</span>
            </div>
            <p className="body-regular text-white/80 mb-6 leading-relaxed max-w-md">
              Your exclusive partner for luxury vacations in Costa Rica. We provide unforgettable 
              experiences in the country's most beautiful villas.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="body-small text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white/50">
                Facebook
              </a>
              <a href="#" className="body-small text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white/50">
                Instagram  
              </a>
              <a href="#" className="body-small text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white/50">
                LinkedIn
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="heading-3 mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><a href="#villas" className="body-regular text-white/80 hover:text-white transition-colors">Our Villas</a></li>
              <li><a href="#experiences" className="body-regular text-white/80 hover:text-white transition-colors">Experiences</a></li>
              <li><a href="#about" className="body-regular text-white/80 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#testimonials" className="body-regular text-white/80 hover:text-white transition-colors">Reviews</a></li>
              <li><a href="#contact" className="body-regular text-white/80 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="heading-3 mb-4">Contact</h4>
            <div className="space-y-3">
              <div>
                <span className="body-regular text-white/80">luxury@executive-vacations.com</span>
              </div>
              <div>
                <span className="body-regular text-white/80">+506 2645 1234</span>
              </div>
              <div>
                <span className="body-regular text-white/80">Peninsula Papagayo<br />Guanacaste, Costa Rica</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="heading-3 mb-2">Stay Updated</h4>
              <p className="body-regular text-white/80">Subscribe to our newsletter for exclusive offers and villa updates.</p>
            </div>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-blue-500"
              />
              <button className="btn btn-luxury">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="body-small text-white/60">
              &copy; 2024 Executive Vacations. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="body-small text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="body-small text-white/60 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="body-small text-white/60 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;