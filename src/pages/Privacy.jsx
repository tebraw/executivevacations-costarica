import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SITE_URL } from '../utils/siteBrand';

const GOLD = '#b8972e';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#111', marginBottom: '0.75rem' }}>{title}</h2>
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#374151', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Helmet>
        <title>Privacy Policy | Executive Vacations Costa Rica</title>
        <meta name="description" content="Privacy Policy for Executive Vacations Costa Rica." />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Helmet>
      <Header />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '120px 24px 80px' }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>Legal</p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#111', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '3rem', fontFamily: "'DM Sans', sans-serif" }}>Last updated: October 29, 2026</p>

        <Section title="Who We Are">
          Executive Vacations Costa Rica ("we", "us", "our") operates the website {SITE_URL.replace('https://', '')}. We are a luxury villa rental company based in Costa Rica. Contact: <a href="mailto:propertieswithmeritt@yahoo.com" style={{ color: GOLD }}>propertieswithmeritt@yahoo.com</a>
        </Section>

        <Section title="Information We Collect">
          We collect personal information you provide directly, including:
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Name, email address, and phone number when you submit an inquiry or pricing guide request</li>
            <li>Travel dates, number of guests, and message content from contact forms</li>
            <li>Usage data collected automatically via Google Tag Manager (page views, clicks, session duration)</li>
            <li>On our advertising pages (for example after clicking an ad on Facebook or Instagram): the pages you view, the steps of our request form you complete, and device and browser information, collected through the Meta Pixel</li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>To respond to your inquiries and send requested pricing guides</li>
            <li>To send follow-up communications about your villa interest</li>
            <li>To improve our website and marketing using aggregated analytics</li>
            <li>We do not sell your personal information to third parties</li>
          </ul>
        </Section>

        <Section title="Third-Party Services">
          We use the following third-party services that may process your data:
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Netlify</strong> — website hosting and form processing</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Twilio</strong> — SMS messaging</li>
            <li><strong>Google Tag Manager / GA4</strong> — website analytics</li>
            <li><strong>Meta (WhatsApp)</strong> — admin notifications</li>
            <li><strong>Meta (Facebook and Instagram)</strong> — advertising and ad measurement through the Meta Pixel on our advertising pages</li>
          </ul>
        </Section>

        <Section title="Advertising and the Meta Pixel">
          On our advertising pages we use the Meta Pixel, a tool of Meta Platforms, Inc. It records which pages you view and which steps of our request form you complete, together with technical information about your device and browser, and it may set a cookie (_fbp, and _fbc when you arrive from an ad). Meta receives this information and may use it to measure and improve our ads, to show our ads to people who may be interested, and for its own purposes as described in Meta&apos;s Data Policy. Depending on our Pixel settings, Meta may also receive hashed contact details that you enter in our forms, such as your email address, to match visits to Meta accounts.
          <br /><br />
          You can control the ads you see on Meta&apos;s platforms in your <a href="https://www.facebook.com/adpreferences/" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>ad preferences</a> and opt out of interest-based advertising through the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Digital Advertising Alliance</a>. You can also block or delete cookies in your browser (see our <a href="/cookies" style={{ color: GOLD }}>Cookie Policy</a>).
        </Section>

        <Section title="Data Retention">
          We retain inquiry and lead data for up to 2 years or until you request deletion. You may request deletion of your personal data at any time by emailing <a href="mailto:propertieswithmeritt@yahoo.com" style={{ color: GOLD }}>propertieswithmeritt@yahoo.com</a>.
        </Section>

        <Section title="Cookies">
          We use cookies for analytics and advertising purposes. See our <a href="/cookies" style={{ color: GOLD }}>Cookie Policy</a> for details.
        </Section>

        <Section title="Your Rights">
          You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:propertieswithmeritt@yahoo.com" style={{ color: GOLD }}>propertieswithmeritt@yahoo.com</a> to exercise these rights.
        </Section>

        <Section title="Contact">
          Executive Vacations Costa Rica<br />
          Email: <a href="mailto:propertieswithmeritt@yahoo.com" style={{ color: GOLD }}>propertieswithmeritt@yahoo.com</a><br />
          Phone: <a href="tel:+13038818588" style={{ color: GOLD }}>303-881-8588</a>
        </Section>
      </div>
      <Footer />
    </div>
  );
}
