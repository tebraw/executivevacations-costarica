import React, { useState } from 'react';
import { track } from '../../utils/track';

const POST = 'https://www.instagram.com/p/DcFJGf0j-IU/';

// A guest's own Instagram post. Nothing from Instagram loads until the visitor taps play,
// so the page stays fast and no third-party cookies are set up front.
export default function GuestSpotlight() {
  const [on, setOn] = useState(false);

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
            Carmit, formerly of the Pussycat Dolls, stayed with us and shared the experience with her followers on Instagram.
          </p>
          {!on && (
            <button type="button" className="btn btn-gold" onClick={play}>Watch her video</button>
          )}
        </div>
        <div className="spotbox">
          {on ? (
            <>
              <iframe
                src={`${POST}embed/`}
                title="Instagram video from our guest Carmit"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                scrolling="no"
                loading="lazy"
              />
              <a className="spotlink" href={POST} target="_blank" rel="noopener noreferrer">Open on Instagram</a>
            </>
          ) : (
            <button type="button" className="spotplay" onClick={play} aria-label="Play the Instagram video from our guest Carmit">
              <span className="spotico" aria-hidden="true">▶</span>
              <span>Guest video on Instagram</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
