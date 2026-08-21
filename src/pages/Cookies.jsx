import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GOLD = '#b8972e';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#111', marginBottom: '0.75rem' }}>{title}</h2>
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#374151', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Cookies() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Helmet>
        <title>Cookie Policy | Executive Vacations Costa Rica</title>
        <meta name="description" content="Cookie Policy for Executive Vacations Costa Rica." />
        <link rel="canonical" href="https://executivevacations.net/cookies" />
      </Helmet>
      <Header />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '120px 24px 80px' }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>Legal</p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#111', marginBottom: '8px' }}>Cookie Policy</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '3rem', fontFamily: "'DM Sans', sans-serif" }}>Last updated: August 21, 2026</p>

        <Section title="What Are Cookies">
          Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and understand how visitors use the site.
        </Section>

        <Section title="Cookies We Use">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#111' }}>Cookie</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#111' }}>Provider</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#111' }}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0' }}>_ga, _ga_*</td>
                <td style={{ padding: '10px 0' }}>Google Analytics</td>
                <td style={{ padding: '10px 0' }}>Track page views and user behaviour (analytics)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0' }}>_fbp</td>
                <td style={{ padding: '10px 0' }}>Meta (Facebook)</td>
                <td style={{ padding: '10px 0' }}>Ad conversion tracking and retargeting</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0' }}>GTM-*</td>
                <td style={{ padding: '10px 0' }}>Google Tag Manager</td>
                <td style={{ padding: '10px 0' }}>Tag management container</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="Analytics Cookies">
          We use Google Analytics 4 via Google Tag Manager to understand how visitors interact with our website. This data is aggregated and anonymous. It helps us improve content and user experience. Google's privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>policies.google.com/privacy</a>
        </Section>

        <Section title="How to Control Cookies">
          You can control and delete cookies through your browser settings:
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/en-us/105082" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>Safari</a></li>
          </ul>
          Disabling cookies may affect the functionality of some parts of the website.
        </Section>

        <Section title="Contact">
          Questions about our cookie use? Contact us at <a href="mailto:propertieswithmeritt@yahoo.com" style={{ color: GOLD }}>propertieswithmeritt@yahoo.com</a>
        </Section>
      </div>
      <Footer />
    </div>
  );
}
