import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../utils/siteBrand';
import { MiniFooter, TopBar } from '../components/welcome/Chrome';
import { EMAIL, waLink } from '../components/welcome/contact';
import { startMetaPixel, track } from '../utils/track';
import '../styles/palacio.css';
import '../styles/welcome.css';

const SHARE_TEXT = `Take a look at these private estates in Costa Rica for our trip: ${SITE_URL}/welcome`;

// Shown after a request is sent. The Lead event itself was already sent when the form was submitted.
export default function WelcomeThanks() {
  const lead = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pc_lead') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    // A fresh load starts the Pixel (which sends PageView itself); inside the app we send it ourselves.
    if (!startMetaPixel()) track('PageView');
  }, []);

  const wa = waLink(
    lead
      ? `Hi! I just sent a request${lead.villa ? ` for ${lead.villa}` : ''}${lead.when ? ` (${lead.when})` : ''}. Looking forward to hearing from you!`
      : 'Hi! I just sent a request on your website.'
  );

  return (
    <div className="pc lp">
      <Helmet>
        <title>Request received | The Palacio Collection</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <TopBar />
      <main className="thx">
        <div className="wrap thxw">
          <div className="eyebrow">Request received</div>
          <h1>Thank you{lead && lead.first ? `, ${lead.first}` : ''}. Your request is in.</h1>
          <p className="lead">We are already looking at availability for your group.</p>

          {lead && (lead.villa || lead.when) && (
            <div className="thxsum">
              {lead.villa && <div><small>Estate</small><b>{lead.villa}</b></div>}
              {lead.when && <div><small>Dates</small><b>{lead.when}</b></div>}
              {lead.group && <div><small>Guests</small><b>{lead.group}</b></div>}
            </div>
          )}

          <h2 className="thxh">What happens next</h2>
          <ol className="steps thxsteps">
            <li><b>1</b><h3>Today</h3><p>We check live availability for your dates.</p></li>
            <li><b>2</b><h3>Within 24 hours</h3><p>You receive a personal proposal by email from {EMAIL}.</p></li>
            <li><b>3</b><h3>When you are ready</h3><p>Confirm if you love it. Nothing is booked until you say yes.</p></li>
          </ol>

          <div className="thxtip">
            <b>Tip:</b> add <a href={`mailto:${EMAIL}`}>{EMAIL}</a> to your contacts, so our reply never lands in your spam folder.
          </div>

          <div className="thxact">
            <a className="btn btn-gold" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => track('Contact', { channel: 'whatsapp-thanks' })}>
              Want a faster answer? Message us on WhatsApp
            </a>
          </div>

          <div className="thxshare">
            <h2>Planning with others?</h2>
            <p>Send this page to your group, so everyone can see the estates.</p>
            <a
              className="btn btn-line"
              href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('Share', { channel: 'whatsapp' })}
            >
              Share via WhatsApp
            </a>
          </div>

          <p className="thxgift">
            <i>★</i> Reminder: with 7 nights at Palacio Musical or Palacio Tropical, a private sunset catamaran cruise is our gift.
          </p>
        </div>
      </main>
      <MiniFooter />
    </div>
  );
}
