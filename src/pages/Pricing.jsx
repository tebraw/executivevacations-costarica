import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSiteBrand } from '../utils/siteBrand';

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';

const VILLAS = [
  'All Villas',
  'Palacio Musical',
  'Palacio Tropical',
  'The View House',
  'The Palms Villa Estate',
];

const VILLA_PDF_MAP = {
  'All Villas': '/pdfs/All Villas - Pricing Guide _ Executive Vacations.pdf',
  'Palacio Musical': '/pdfs/Palacio Musical — Pricing Guide _ Executive Vacations.pdf',
  'Palacio Tropical': '/pdfs/Palacio Tropical — Pricing Guide _ Executive Vacations.pdf',
  'The View House': '/pdfs/The View House — Pricing Guide _ Executive Vacations.pdf',
  'The Palms Villa Estate': '/pdfs/The Palms Villa Estate — Pricing Guide _ Executive Vacations.pdf',
};

const Field = ({ name, label, type = 'text', placeholder, as, form, setForm, errors }) => (
  <div>
    <label style={{
      display: 'block', fontSize: '0.8rem', fontWeight: 700,
      color: '#374151', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.02em',
    }}>
      {label} <span style={{ color: GOLD }}>*</span>
    </label>
    {as === 'select' ? (
      <select
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={{
          ...inputStyle,
          borderColor: errors[name] ? '#ef4444' : '#e5e7eb',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '40px',
        }}
      >
        <option value="">Select a villa…</option>
        {VILLAS.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: errors[name] ? '#ef4444' : '#e5e7eb' }}
        onFocus={e => e.target.style.borderColor = GOLD}
        onBlur={e => e.target.style.borderColor = errors[name] ? '#ef4444' : '#e5e7eb'}
      />
    )}
    {errors[name] && (
      <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>
        {errors[name]}
      </p>
    )}
  </div>
);

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

export default function Pricing() {
  const brand = getSiteBrand();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    villaInterest: searchParams.get('villa') || 'All Villas',
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selectedPdfUrl = VILLA_PDF_MAP[form.villaInterest] || VILLA_PDF_MAP['All Villas'];

  useEffect(() => {
    window.scrollTo(0, 0);
    const title = `Free Pricing Guide — Luxury Villas Costa Rica | ${brand.fullName}`;
    const desc = 'Download your free pricing guide for luxury villa rentals in Costa Rica. Get rates for Palacio Tropical, Palacio Musical, The View House, and The Palms Villa Estate.';
    document.title = title;
    const setMeta = (name, content, prop) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', desc);
    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', 'https://executivevacations.net/pricing', true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
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
          villaInterest: form.villaInterest || 'Not specified',
        }),
      });
    } catch (_) {}

    // Also submit to Netlify Forms so email notifications fire automatically
    try {
      const firstName = form.firstName.trim();
      const welcomeMessage = `Hi ${firstName}! 🌴 This is Wendy from Executive Vacations Costa Rica!\n\nThank you so much for your interest — I'm personally excited to help you plan the perfect trip.\n\nI'd love to give you a quick call to walk you through everything and answer any questions you might have. When would be a good time for you? Just let me know a couple of days and times that work, and I'll give you a ring!\n\nLooking forward to speaking with you soon! 😊\n\n— Wendy\nExecutive Vacations Costa Rica`;
      const formData = new URLSearchParams();
      formData.append('form-name', 'pricing-lead');
      formData.append('firstName', firstName);
      formData.append('lastName', form.lastName.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('villaInterest', form.villaInterest || 'Not specified');
      formData.append('welcomeMessage', welcomeMessage);
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (_) {}
    setSubmitting(false);
    setSubmitted(true);

    // Trigger PDF download for selected villa from public/pdfs mapping
    const villaPdf = selectedPdfUrl;
    if (villaPdf) {
      const a = document.createElement('a');
      a.href = villaPdf;
      a.download = `Executive-Vacations-Pricing-Guide-${(form.villaInterest || 'General').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };



  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Helmet>
        <link rel="canonical" href="https://executivevacations.net/pricing" />
      </Helmet>
      <Header />

      {/* Hero */}
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
            Access Our Pricing Guide
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '1rem',
            color: 'rgba(255,255,255,0.55)', maxWidth: '480px',
            margin: '0 auto 48px', lineHeight: 1.7, textAlign: 'center',
          }}>
            Fill in your details below and instantly receive our exclusive villa pricing brochure.
          </p>
        </div>
      </div>

      {/* Main card */}
      <div style={{ maxWidth: '1000px', margin: '-2px auto 80px', padding: '0 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
        }}
          className="pricing-grid"
        >
          {/* Left — Brochure Cover */}
          <div style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 60%, #0f172a 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '56px 40px', position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative circles */}
            <div style={{
              position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
              border: `1px solid rgba(201,169,110,0.15)`, top: '-60px', left: '-60px',
            }} />
            <div style={{
              position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
              border: `1px solid rgba(201,169,110,0.1)`, bottom: '-40px', right: '-40px',
            }} />

            {/* Cover card */}
            <div style={{
              width: '100%', maxWidth: '260px',
              background: 'rgba(255,255,255,0.04)',
              border: `2px solid ${GOLD_LIGHT}`,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              position: 'relative', zIndex: 1,
            }}>
              {/* Villa image */}
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src="/images/villas/palacio-musical/ChatGPT Image May 23, 2026, 07_14_19 PM.png"
                  alt="Executive Vacations Pricing Guide"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }}
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
                  Executive Vacations
                </p>
                <div style={{
                  width: '40px', height: '2px',
                  background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
                  margin: '0 auto 16px',
                }} />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  fontSize: '1.6rem', color: '#fff', lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}>
                  PRICING<br />GUIDE
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)', marginTop: '12px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Luxury Villas · Costa Rica
                </p>
              </div>
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)', marginTop: '28px',
              textAlign: 'center', lineHeight: 1.6,
              position: 'relative', zIndex: 1, maxWidth: '220px',
            }}>
              Exclusive rates &amp; availability for all four luxury villas
            </p>
          </div>

          {/* Right — Form */}
          <div style={{ padding: '48px 44px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  fontSize: '1.5rem', color: '#111', marginBottom: '12px',
                }}>
                  Thank you!
                </h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", color: '#6b7280',
                  fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px',
                }}>
                  {'Your pricing guide has been downloaded. Our team will be in touch with you soon!'}
                </p>
                {selectedPdfUrl && (
                  <a
                    href={selectedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '14px 28px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
                      color: '#fff', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Again
                  </a>
                )}
              </div>
            ) : (
              <>
                <h2 style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  fontSize: '1.4rem', color: '#111', marginBottom: '6px',
                }}>
                  Fill out your information
                </h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
                  color: '#9ca3af', marginBottom: '28px', lineHeight: 1.6,
                }}>
                  Gain instant access to our exclusive pricing guide.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Field name="firstName" label="First Name" placeholder="Jane" form={form} setForm={setForm} errors={errors} />
                      <Field name="lastName" label="Last Name" placeholder="Smith" form={form} setForm={setForm} errors={errors} />
                    </div>
                    <Field name="email" label="Email" type="email" placeholder="jane@example.com" form={form} setForm={setForm} errors={errors} />
                    <Field name="phone" label="Phone" type="tel" placeholder="+1 (555) 000-0000" form={form} setForm={setForm} errors={errors} />
                    <Field name="villaInterest" label="Villa of Interest" as="select" form={form} setForm={setForm} errors={errors} />

                    {/* Checkbox */}
                    <div>
                      <label style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        cursor: 'pointer',
                      }}>
                        <div
                          onClick={() => setForm(f => ({ ...f, agreed: !f.agreed }))}
                          style={{
                            width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                            border: `2px solid ${form.agreed ? GOLD : errors.agreed ? '#ef4444' : '#d1d5db'}`,
                            background: form.agreed ? `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)` : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: '1px', transition: 'all 0.15s', cursor: 'pointer',
                          }}
                        >
                          {form.agreed && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem',
                          color: '#6b7280', lineHeight: 1.5,
                        }}>
                          I agree to receive communications from Executive Vacations and consent to the processing of my information.
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
                        width: '100%', padding: '16px',
                        borderRadius: '12px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                        background: submitting ? '#d1d5db' : `linear-gradient(135deg, ${GOLD_LIGHT}, #a07040)`,
                        color: '#fff', fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700, fontSize: '0.95rem',
                        transition: 'opacity 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      }}
                    >
                      {submitting ? 'Sending…' : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download the Pricing Guide
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive fix */}
      <style>{`
        @media (max-width: 700px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
