import React, { useEffect, useState } from 'react';
import { track } from '../../utils/track';

const POST = 'https://www.instagram.com/p/DcFJGf0j-IU/';

// Instagram's official embed markup. Instagram's own script (loaded only after a tap) replaces it with the player
// and sizes it to the available width. If the script is blocked, the link inside stays as a fallback.
const EMBED = `<blockquote class="instagram-media" data-instgrm-permalink="${POST}?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px;max-width:540px;min-width:326px;padding:0;width:99.375%;width:-webkit-calc(100% - 2px);width:calc(100% - 2px)"><a href="${POST}" target="_blank" rel="noopener noreferrer">View this post on Instagram</a></blockquote>`;

function loadInstagram() {
  const process = () => window.instgrm && window.instgrm.Embeds.process();
  if (window.instgrm) {
    process();
    return;
  }
  let s = document.getElementById('ig-embed-js');
  if (!s) {
    s = document.createElement('script');
    s.id = 'ig-embed-js';
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(s);
  }
  s.addEventListener('load', process);
}

// A guest's own Instagram post. Nothing from Instagram loads until the visitor taps play,
// so the page stays fast and no third-party cookies are set up front.
export default function GuestSpotlight() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (on) loadInstagram();
  }, [on]);

  const play = () => {
    track('SpotlightPlay', { post: 'carmit' });
    setOn(true);
  };

  return (
    <section className="spot" aria-labelledby="spot-t">
      <div className="wrap spotg">
        <div>
          <div className="eyebrow">A guest&apos;s story</div>
          <h2 className="title" id="spot-t">Don&apos;t just take our word for it.</h2>
          <p className="lead">
            Carmit, formerly of the Pussycat Dolls, was our invited guest. She shared her stay with her followers on Instagram on her own initiative.
          </p>
          {!on && (
            <button type="button" className="btn btn-gold" onClick={play}>Watch her video</button>
          )}
        </div>
        <div className="spotcol">
          <div className={`spotbox${on ? ' live' : ''}`}>
            {on ? (
              <div dangerouslySetInnerHTML={{ __html: EMBED }} />
            ) : (
              <button type="button" className="spotplay" onClick={play} aria-label="Play the Instagram video from our guest Carmit">
                <span className="spotico" aria-hidden="true">▶</span>
                <span>Guest video on Instagram</span>
              </button>
            )}
          </div>
          <p className="spotnote">Disclosure: Carmit stayed as our invited guest. The post and her opinions are her own, and we did not ask her to share it.</p>
        </div>
      </div>
    </section>
  );
}
