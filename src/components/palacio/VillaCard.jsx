import React from 'react';
import { Link } from 'react-router-dom';
import { label } from './shared';

export const CHIPS = [
  ['all', 'All estates'],
  ['celebrations', 'Weddings & celebrations'],
  ['oceanfront', 'Oceanfront'],
  ['families', 'Families & friends'],
  ['retreats', 'Retreats & reunions'],
];

const cardFacts = (v) =>
  [
    `${v.bedrooms} ${v.useEnsuites ? 'en-suites' : 'bedrooms'}`,
    v.guests ? `Up to ${v.guests} guests` : null,
    ...(v.topAmenities || []).slice(0, 2).map(label),
  ].filter(Boolean);

export function PriceBlock({ v }) {
  if (v.isComingSoon) {
    return (
      <div className="price">
        <small>Opening</small>
        <b>{v.availableFrom || 'Soon'}</b>
      </div>
    );
  }
  if (!v.startingPrice) return null;
  return (
    <div className="price">
      <small>Starting at</small>
      <b>${v.startingPrice.toLocaleString('en-US')} <i>/ night</i></b>
      {v.guests ? <span className="pg">≈ ${Math.round(v.startingPrice / v.guests)} per guest / night</span> : null}
    </div>
  );
}

export default function VillaCard({ v, hidden, onAsk }) {
  const soon = v.isComingSoon;
  const ask = (e) => {
    e.preventDefault();
    onAsk(v.name);
  };
  return (
    <article className={`card${hidden ? ' hide' : ''}`}>
      <Link className="img" to={`/villa/${v.slug}`}>
        <img src={encodeURI(v.images[0])} alt={v.name} loading="lazy" />
        {soon && <span className="badge soon">{v.isPlanned ? 'Opening' : 'Available'} {v.availableFrom || 'soon'}</span>}
        {v.imageNote && <span className="imgnote">{v.imageNote}</span>}
      </Link>
      <div className="body">
        <span className="best">{v.bestFor}</span>
        <div className="loc">
          {v.location}
          {v.rating ? <span className="rt"><i>★</i> {v.rating}</span> : null}
        </div>
        <h3>{v.name}</h3>
        <div className="tag">{v.tagline}</div>
        <div className="facts">
          {cardFacts(v).map((f) => <span key={f}>{f}</span>)}
        </div>
        <div className="foot">
          <PriceBlock v={v} />
          <div className="btns">
            {soon ? (
              <>
                <span className="btn btn-line off">Details soon</span>
                <a className="btn btn-gold" href="/#inquire" onClick={ask}>Early List</a>
              </>
            ) : (
              <>
                <Link className="btn btn-line" to={`/villa/${v.slug}`}>View Estate</Link>
                <a className="btn btn-dark" href="/#inquire" onClick={ask}>Availability</a>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
