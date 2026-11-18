import React, { useRef, useState } from 'react';
import { labelOffset } from './geometry';

const SIDES = [
  ['top', '↑'],
  ['right', '→'],
  ['bottom', '↓'],
  ['left', '←'],
];

// Only reachable with /area?edit=1. Pins and flight lines are dragged on the picture; this panel sets which side the
// names sit on and hands over the finished layout as text.
export default function LayoutEditor({ places, layout, json, onSide, onReset, onExit }) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      textRef.current?.select();
    }
  };

  return (
    <aside className="area-editor" aria-label="Layout editor">
      <h2>Layout editor</h2>
      <p>
        Drag the pins, the name tags and the round play buttons on the picture. Pins that are close together: pull their name tags apart, a thin line
        then connects each tag to its pin. The arrows put a tag back next to its pin. Then copy the layout and send it over.
      </p>
      <ul>
        {places.map((place) => (
          <li key={place.id}>
            <span>{place.short}</span>
            <span className="area-editor__sides" role="group" aria-label={`Where the name of ${place.name} sits`}>
              {SIDES.map(([side, arrow]) => (
                <button key={side} type="button" aria-pressed={!labelOffset(layout.places[place.id] || {}) && layout.places[place.id]?.side === side} aria-label={`Put the name tag ${side} of the pin`} onClick={() => onSide(place.id, side)}>
                  {arrow}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="area-editor__row">
        <button type="button" className="area-btn area-btn--gold" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy layout'}
        </button>
        <button type="button" className="area-btn" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="area-btn" onClick={onExit}>
          Exit
        </button>
      </div>
      <details>
        <summary>Show the layout as text</summary>
        <textarea ref={textRef} readOnly value={json} rows={10} onFocus={(e) => e.target.select()} />
      </details>
    </aside>
  );
}
