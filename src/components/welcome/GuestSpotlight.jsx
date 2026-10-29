import React, { memo, useEffect, useRef } from 'react';
import { track } from '../../utils/track';

const POST = 'https://www.instagram.com/p/DcFJGf0j-IU/';

// Instagram's official embed markup. Instagram's own script replaces it with the player and sizes it to the
// available width. The link inside is what shows until then, and it stays as the fallback if the script is blocked.
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

// A guest's own Instagram post, visible without a tap. Instagram's script is requested a moment after the page
// has finished loading, so it never competes with the hero image or the quiz, and the post is usually ready by
// the time a visitor scrolls down to it.
function GuestSpotlight({ onCta }) {
  const box = useRef(null);

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(loadInstagram, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    const el = box.current;
    let seen;
    if (el && 'IntersectionObserver' in window) {
      seen = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        seen.disconnect();
        track('SpotlightView', { post: 'carmit' });
      }, { threshold: 0.3 });
      seen.observe(el);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', schedule);
      if (seen) seen.disconnect();
    };
  }, []);

  return (
    <section className="spot" aria-labelledby="spot-t">
      <div className="wrap spotg">
        <div>
          <div className="eyebrow">A guest&apos;s story</div>
          <h2 className="title" id="spot-t">Don&apos;t just take our word for it.</h2>
          <p className="lead">
            Carmit, formerly of the Pussycat Dolls, was our invited guest. She shared her stay with her followers on Instagram on her own initiative.
          </p>
        </div>
        <div className="spotcol">
          <div className="spotbox" ref={box} dangerouslySetInnerHTML={{ __html: EMBED }} />
          <p className="spotnote">Disclosure: Carmit stayed as our invited guest. The post and her opinions are her own, and we did not ask her to share it.</p>
        </div>
        {onCta && (
          <div className="spotcta">
            <button type="button" className="btn btn-gold" onClick={onCta}>Check my dates</button>
          </div>
        )}
      </div>
    </section>
  );
}

// Instagram rewrites the markup inside the box, so the component must never re-render it.
export default memo(GuestSpotlight);
