import React from 'react';
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, waLink } from './contact';
import { track } from '../../utils/track';

// Minimal frame for the ad pages: no navigation to other parts of the site, only ways to reach the team.
export function TopBar() {
  return (
    <header className="top">
      <div className="wrap">
        <img src="/images/lp/logo.webp" alt="The Palacio Collection" height="40" />
        <div className="call">
          <a href={`tel:${PHONE_TEL}`} onClick={() => track('Contact', { channel: 'phone' })}>{PHONE_DISPLAY}</a>
          <a
            className="wa"
            href={waLink("Hi! I'd like to check availability at The Palacio Collection.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('Contact', { channel: 'whatsapp' })}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

export function MiniFooter() {
  return (
    <footer className="lpf">
      <div className="wrap">
        <span>© {new Date().getFullYear()} The Palacio Collection</span>
        <span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </span>
      </div>
    </footer>
  );
}
