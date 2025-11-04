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
              <a href="https://www.instagram.com/executive_vacations_cr/" target="_blank" rel="noopener noreferrer" className="body-small text-white/80 hover:text-white transition-colors border-b border-transparent hover:border-white/50">
                Instagram  
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="heading-3 mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><a href="#villas" className="body-regular text-white/80 hover:text-white transition-colors">Our Villas</a></li>
              <li><a href="#experiences" className="body-regular text-white/80 hover:text-white transition-colors">Experiences</a></li>
              <li><a href="#contact" className="body-regular text-white/80 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="heading-3 mb-4">Contact</h4>
            <div className="space-y-3">
              <div>
                <span className="body-regular text-white/80">propertieswithmeritt@gmail.com</span>
              </div>
              <div>
                <span className="body-regular text-white/80">303-881-8588</span>
              </div>
              <div>
                <span className="body-regular text-white/80">Peninsula Papagayo<br />Guanacaste, Costa Rica</span>
              </div>
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