import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';
const WEDDING_GUIDE_URL = '/pdfs/Wedding Packages & Pricing Guide — Executive Vacations Costa Rica.pdf';

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  fontSize: '0.95rem',
  fontFamily: "'DM Sans', sans-serif",
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  transition: 'border-color 0.15s',
};

const Field = ({ name, label, type = 'text', placeholder, form, setForm, errors }) => (
  <div>
    <label style={{
      display: 'block', fontSize: '0.8rem', fontWeight: 700,
      color: '#374151', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.02em',
    }}>
      {label} <span style={{ color: GOLD }}>*</span>
    </label>
    <input
      type={type}
      value={form[name]}
      onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: errors[name] ? '#ef4444' : '#e5e7eb' }}
      onFocus={e => { e.target.style.borderColor = GOLD; }}
      onBlur={e => { e.target.style.borderColor = errors[name] ? '#ef4444' : '#e5e7eb'; }}
    />
    {errors[name] && (
      <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>
        {errors[name]}
      </p>
    )}
  </div>
);

export default function WeddingPackages() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = 'Wedding Pricing Guide | Executive Vacations Costa Rica';
    const desc = 'Access our wedding pricing guide for destination weddings in Costa Rica. Explore package pricing, inclusions, and next steps.';
    document.title = title;

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

    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', 'https://executivevacations.net/wedding-packages', true);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.agreed) e.agreed = 'Please agree to continue';
    return e;
  };

  const openGuide = () => {
    const a = document.createElement('a');
    a.href = WEDDING_GUIDE_URL;
    a.download = 'Executive-Vacations-Wedding-Pricing-Guide.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await fetch('/.netlify/functions/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          villaInterest: 'Wedding Request',
        }),
      });
    } catch (_) {}

    // Keep Netlify form flow consistent with the regular pricing form
    try {
      const formData = new URLSearchParams();
      formData.append('form-name', 'pricing-lead');
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('villaInterest', 'Wedding Request');
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (_) {}

    setSubmitting(false);
    setSubmitted(true);
    openGuide();
  };

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Header />

      <div style={{
        paddingTop: '80px',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        paddingBottom: '0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 24px 0' }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: GOLD, marginBottom: '10px', fontWeight: 600, textAlign: 'center',
          }}>
            Executive Vacations · Costa Rica
          </p>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff',
            lineHeight: 1.15, marginBottom: '12px', textAlign: 'center',
          }}>
            Access Our Wedding Pricing Guide
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '1rem',
            color: 'rgba(255,255,255,0.55)', maxWidth: '560px',
            margin: '0 auto 48px', lineHeight: 1.7, textAlign: 'center',
          }}>
            Enter your details to open the Wedding Pricing Guide with package rates,
            inclusions, and planning details.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-2px auto 80px', padding: '0 24px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
          }}
          className="wedding-pricing-grid"
        >
          <div style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 60%, #0f172a 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '56px 40px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
              border: `1px solid rgba(201,169,110,0.15)`, top: '-60px', left: '-60px',
            }} />
            <div style={{
              position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
              border: `1px solid rgba(201,169,110,0.1)`, bottom: '-40px', right: '-40px',
            }} />

            <div style={{
              width: '100%', maxWidth: '260px',
              background: 'rgba(255,255,255,0.04)',
              border: `2px solid ${GOLD_LIGHT}`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src="/images/weddings/hero.jpg"
                  alt="Wedding Pricing Guide"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.7) 100%)',
                }} />
              </div>
              <div style={{ padding: '28px 24px 32px', textAlign: 'center' }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: GOLD_LIGHT, marginBottom: '8px', fontWeight: 600,
                }}>
                  Executive Weddings
                </p>
                <div style={{
                  width: '40px', height: '2px',
                  background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
                  margin: '0 auto 16px',
                }} />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  fontSize: '1.4rem', color: '#fff', lineHeight: 1.15,
                }}>
                  WEDDING<br />PRICING GUIDE
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)', marginTop: '12px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Costa Rica Destination Weddings
                </p>
              </div>
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)', marginTop: '28px',
              textAlign: 'center', lineHeight: 1.6,
              position: 'relative', zIndex: 1, maxWidth: '250px',
            }}>
              Package rates, inclusions, guest upgrades, and seasonal pricing in one guide.
            </p>
          </div>

          <div style={{ padding: '48px 44px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800,
                  color: '#111827', marginBottom: '8px',
                }}>
                  Guide Opened Successfully
                </h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", color: '#6b7280', lineHeight: 1.65,
                  maxWidth: '380px', margin: '0 auto 22px',
                }}>
                  The Wedding Pricing Guide download should start automatically. If not, click below.
                </p>
                <a
                  href={WEDDING_GUIDE_URL}
                  download="Executive-Vacations-Wedding-Pricing-Guide.pdf"
                  style={{
                    display: 'inline-block',
                    background: `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Open Guide Again
                </a>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '26px' }}>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '1.7rem',
                    color: '#111827', lineHeight: 1.15, marginBottom: '8px',
                  }}>
                    Get Wedding Pricing Instantly
                  </h2>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", color: '#6b7280',
                    fontSize: '0.95rem', lineHeight: 1.7, margin: 0,
                  }}>
                    Share your details and access the complete Wedding Pricing Guide immediately.
                  </p>
                </div>

                <form onSubmit={handleSubmit} name="pricing-lead" data-netlify="true">
                  <input type="hidden" name="form-name" value="pricing-lead" />
                  <input type="hidden" name="villaInterest" value="Wedding Request" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Field name="firstName" label="First Name" placeholder="Jane" form={form} setForm={setForm} errors={errors} />
                    <Field name="lastName" label="Last Name" placeholder="Smith" form={form} setForm={setForm} errors={errors} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Field name="email" label="Email" type="email" placeholder="you@example.com" form={form} setForm={setForm} errors={errors} />
                    <Field name="phone" label="Phone" placeholder="+1 234 567 890" form={form} setForm={setForm} errors={errors} />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.agreed}
                        onChange={e => setForm(f => ({ ...f, agreed: e.target.checked }))}
                        style={{ marginTop: '2px' }}
                      />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.55 }}>
                        I agree to be contacted by Executive Vacations regarding wedding availability and pricing.
                      </span>
                    </label>
                    {errors.agreed && (
                      <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                        {errors.agreed}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      background: submitting ? '#d1d5db' : `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
                      color: '#fff',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      transition: 'opacity 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Open Wedding Pricing Guide'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .wedding-pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
