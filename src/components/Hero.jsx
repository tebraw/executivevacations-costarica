import React from 'react';

const Hero = () => {
  return (
    <section className="relative" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="heading-1 text-white mb-6">
              Discover Luxury Villas in 
              <span className="block mt-2" style={{ color: '#D4AF37' }}>Costa Rica</span>
            </h1>
            
            <p className="body-large mb-8 max-w-2xl" style={{ color: 'white' }}>
              Exclusive vacation villas in tropical paradise. From private pools to breathtaking ocean views – 
              experience unforgettable moments in Costa Rica's most beautiful accommodations.
            </p>

            <div className="flex justify-center">
              <a href="#villas" className="btn btn-primary btn-large">
                Explore Villas
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white' }}>4</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Luxury Villas</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white' }}>5★</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Rating</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white' }}>100+</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Happy Guests</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white' }}>24/7</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Concierge Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center text-white/70 animate-bounce">
          <span className="body-small mb-2 hidden md:block">Scroll down</span>
          <div className="text-white text-lg">↓</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;