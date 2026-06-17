import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';

export default function WeddingPackages() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Pricing Guide | Paradise Weddings Costa Rica';

    const setMeta = (name, content, prop) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const desc = 'Access our pricing guide for destination weddings and events in Costa Rica. Fill out your details below to gain instant access.';
    setMeta('description', desc);
    setMeta('og:title', 'Pricing Guide | Paradise Weddings Costa Rica', true);
    setMeta('og:description', desc, true);
    setMeta('og:url', 'https://www.paradiseweddingscostarica.com/pricing/', true);

    const script = document.createElement('script');
    script.src = 'https://api.delpriorehospitality.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f7f4' }}>

        <div style={{
          background: 'linear-gradient(160deg, #0b1120 0%, #12203a 60%, #0f172a 100%)',
          padding: 'clamp(48px, 7vw, 80px) clamp(24px, 5vw, 48px) clamp(40px, 6vw, 64px)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: GOLD_LIGHT, fontWeight: 700, marginBottom: '18px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Paradise Weddings Costa Rica
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: '#fff', lineHeight: 1.2, margin: '0 auto', maxWidth: '720px',
          }}>
            Fill out your information below to gain access to our pricing guide!
          </h1>
        </div>

        <div
          className="pricing-grid"
          style={{
            maxWidth: '1100px', margin: '0 auto',
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
            gap: 'clamp(32px, 4vw, 64px)',
            alignItems: 'start',
          }}
        >
          <div style={{ position: 'sticky', top: '104px' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
              <img
                src="/images/weddings/pricing-guide-cover.jpg"
                alt="Paradise Weddings Costa Rica — Pricing Guide"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

          <div>
            <div style={{
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              overflow: 'hidden', minHeight: '711px',
            }}>
              <iframe
                src="https://api.delpriorehospitality.com/widget/form/fPgo36siHGTrUhGcxGSf"
                style={{ width: '100%', height: '711px', border: 'none', display: 'block' }}
                id="inline-fPgo36siHGTrUhGcxGSf"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Tab Form - Website"
                data-height="711"
                data-layout-iframe-id="inline-fPgo36siHGTrUhGcxGSf"
                data-form-id="fPgo36siHGTrUhGcxGSf"
                title="Tab Form - Website"
              />
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
