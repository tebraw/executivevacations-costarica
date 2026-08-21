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

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <Helmet>
        <title>Terms of Service | Executive Vacations Costa Rica</title>
        <meta name="description" content="Terms of Service for Executive Vacations Costa Rica." />
        <link rel="canonical" href="https://executivevacations.net/terms" />
      </Helmet>
      <Header />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '120px 24px 80px' }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>Legal</p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#111', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '3rem', fontFamily: "'DM Sans', sans-serif" }}>Last updated: August 21, 2026</p>

        <Section title="Agreement to Terms">
          By accessing executivevacations.net you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.
        </Section>

        <Section title="Use of Website">
          This website is provided for the purpose of inquiring about and booking luxury villa rentals in Costa Rica. You agree not to use the website for any unlawful purpose or in a way that could damage or impair the site.
        </Section>

        <Section title="Reservations and Payments">
          All villa reservations are subject to availability confirmation by Executive Vacations Costa Rica. Final booking terms, deposit requirements, cancellation policies, and payment schedules will be provided directly by our team and agreed upon in a separate rental agreement.
        </Section>

        <Section title="Cancellation Policy">
          Cancellation terms vary by property and booking period. Specific cancellation and refund policies will be outlined in your individual rental agreement. Please review these carefully before confirming your reservation.
        </Section>

        <Section title="Accuracy of Information">
          We strive to keep villa descriptions, pricing, and availability information accurate. However, we reserve the right to correct errors and update information at any time. Confirmed prices are those agreed upon in your signed rental agreement.
        </Section>

        <Section title="Limitation of Liability">
          Executive Vacations Costa Rica is not liable for any indirect, incidental, or consequential damages arising from the use of this website or from your stay at our properties beyond what is covered in your rental agreement.
        </Section>

        <Section title="Intellectual Property">
          All content on this website including text, images, and design is the property of Executive Vacations Costa Rica and may not be reproduced without written permission.
        </Section>

        <Section title="Governing Law">
          These terms are governed by the laws of Costa Rica. Any disputes will be resolved in the jurisdiction of Costa Rica.
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
