import React from 'react';

const Hero = () => {
  return (
    <section className="relative" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}images/villas/palacio-tropical/palaciotropical-567.exterior.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container">
          <div className="max-w-3xl animate-fade-in-up mx-auto">
            {/* Hero Text Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 md:p-10 border border-white/20 mb-8">
              <h1 className="heading-1 text-white mb-6" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                Discover Luxury Villas in 
                <span className="block mt-2" style={{ color: '#D4AF37', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>Costa Rica</span>
              </h1>
              
              <p className="body-large mb-8" style={{ color: 'white', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>
                Exclusive vacation villas in tropical paradise. From private pools to breathtaking ocean views – 
                experience unforgettable moments in Costa Rica's most beautiful accommodations.
              </p>

              <div className="flex justify-center">
                <a href="#villas" className="btn btn-primary btn-large">
                  Explore Villas
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="px-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>4</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>Luxury Villas</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>5★</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>Rating</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>100+</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>Happy Guests</div>
                  </div>
                  <div>
                    <div className="heading-3 mb-2" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>24/7</div>
                    <div className="body-small" style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>Concierge Service</div>
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