import React from 'react';
import { getSiteBrand } from '../utils/siteBrand';

const Footer = () => {
  const brand = getSiteBrand();

  return (
    <footer style={{ backgroundColor: '#0F172A' }} className="text-white py-16">
      <div className="container">
        <div className="grid grid-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="heading-3 mb-2" style={{ color: '#D4AF37' }}>{brand.name}</h3>
              <span className="text-luxury">Costa Rica</span>
            </div>
            <p className="body-regular text-white/80 mb-6 leading-relaxed max-w-md">
              {brand.footerText}
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/paradisevillascostarica/" target="_blank" rel="noopener noreferrer" className="body-small text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white/50">
                Instagram  
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="heading-3 mb-4" style={{ color: '#D4AF37' }}>Explore</h4>
            <ul className="space-y-3">
              {brand.key === 'executive' ? (
                <>
                  <li><a href="#villas" className="body-regular text-white/80 hover:text-white transition-colors">Our Villas</a></li>
                  <li><a href="#experiences" className="body-regular text-white/80 hover:text-white transition-colors">Experiences</a></li>
                  <li><a href={brand.weddingsHref} className="body-regular text-white/80 hover:text-white transition-colors">Weddings</a></li>
                </>
              ) : (
                <>
                  <li><a href={brand.villasHref} className="body-regular text-white/80 hover:text-white transition-colors">Explore Villas</a></li>
                  <li><a href="#gallery" className="body-regular text-white/80 hover:text-white transition-colors">Gallery</a></li>
                  <li><a href="#pricing" className="body-regular text-white/80 hover:text-white transition-colors">Packages</a></li>
                </>
              )}
              <li><a href="#contact" className="body-regular text-white/80 hover:text-white transition-colors">Contact</a></li>
              <li><a href="/blog" className="body-regular text-white/80 hover:text-white transition-colors">Blog</a></li>
              <li><a href={brand.pricingHref} className="body-regular text-white/80 hover:text-white transition-colors">{brand.pricingLabel}</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="heading-3 mb-4" style={{ color: '#D4AF37' }}>Contact</h4>
            <div className="space-y-3">
              <div>
                <a href="mailto:propertieswithmeritt@yahoo.com" className="body-regular text-white/80 hover:text-white transition-colors">propertieswithmeritt@yahoo.com</a>
              </div>
              <div>
                <a href="tel:+13038818588" className="body-regular text-white/80 hover:text-white transition-colors">303-881-8588</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="body-small text-white/60">
              &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="body-small text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="body-small text-white/60 hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookies" className="body-small text-white/60 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;