import React from 'react';

// Line drawings for the categories on a 24px grid. They are drawn in the text colour, so CSS sets their colour.
const DRAWINGS = {
  waterfall: (
    <>
      <path d="M4 4h16" />
      <path d="M7.5 4v11M12 4v13M16.5 4v11" />
      <path d="M3 20c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
    </>
  ),
  restaurant: (
    <>
      <path d="M6 3v6a2.5 2.5 0 0 0 5 0V3" />
      <path d="M8.5 3v18" />
      <path d="M17 21V3c-2.5 1.8-3.2 4.6-3.2 7.5V14H17" />
    </>
  ),
  golf: (
    <>
      <path d="M9 21V3l8 3.8-8 3.7" />
      <path d="M4 21h10" />
      <circle cx="17.5" cy="19" r="1.8" />
    </>
  ),
  zipline: (
    <>
      <path d="M2.5 6.5l19 5" />
      <circle cx="12" cy="9" r="1.3" />
      <path d="M9.5 13 12 10.3 14.5 13" />
      <circle cx="12" cy="13.6" r="1.4" />
      <path d="M12 15v3.4M12 18.4l-2 2.8M12 18.4l2 2.8" />
    </>
  ),
  atv: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 14 9 9.5h5.5l1.7 2.5H19" />
      <path d="M14.5 9.5 16 6.5h2.5" />
      <path d="M9 17h6" />
    </>
  ),
  massage: (
    <>
      <ellipse cx="12" cy="18.5" rx="7.5" ry="2.7" />
      <ellipse cx="12" cy="13.5" rx="5.3" ry="2.3" />
      <ellipse cx="12" cy="9.3" rx="3.2" ry="1.9" />
    </>
  ),
  boat: (
    <>
      <path d="M12 3v13" />
      <path d="M12 4.5 18.5 15H12" />
      <path d="M10.5 7 5.5 15h5" />
      <path d="M3.5 18h17l-2.2 3H5.7z" />
    </>
  ),
  fishing: (
    <>
      <path d="M3 12c2.8-4.6 8.2-5.4 12-2l5.5-2.5v9L15 14c-3.8 3.4-9.2 2.6-12-2z" />
      <circle cx="7.5" cy="11" r=".7" fill="currentColor" />
    </>
  ),
  surf: (
    <g transform="rotate(40 12 12)">
      <path d="M12 1.5C14.6 4.2 16 8 16 12.5c0 4.2-1.5 8-4 8s-4-3.8-4-8C8 8 9.4 4.2 12 1.5z" />
      <path d="M12 5v12.5" />
    </g>
  ),
  palm: (
    <>
      <path d="M12.5 21c0-4 .3-7.2 1.4-10" />
      <path d="M13.9 11C13 7.6 9.8 5.8 5.5 6.8" />
      <path d="M13.9 11c.4-3.4 3-5.8 7-5.4" />
      <path d="M13.9 11C12 9.4 9 10 7.2 12.4" />
      <path d="M13.9 11c2-1.6 4.8-1 6.4 1.2" />
      <path d="M8.5 21h9" />
    </>
  ),
  basket: (
    <>
      <path d="M3.5 9.5h17l-1.7 9.2a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6z" />
      <path d="M8 9.5 11 4M16 9.5 13 4" />
      <path d="M9.5 13v4M12 13v4M14.5 13v4" />
    </>
  ),
};

const lineProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' };

export function CategoryIcon({ name }) {
  return <svg {...lineProps}>{DRAWINGS[name] || DRAWINGS.waterfall}</svg>;
}

export function PinIcon() {
  return (
    <svg {...lineProps}>
      <path d="M12 21s-6.2-5.4-6.2-10.4a6.2 6.2 0 0 1 12.4 0C18.2 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.4" r="2.3" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg {...lineProps}>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7C17.2 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4zm0 36c-3.1 0-6.1-.8-8.7-2.4l-.6-.4-6.2 1.6 1.7-6-.4-.6C8.2 29.8 7.3 27 7.3 24 7.3 14.8 14.8 7.3 24 7.3S40.7 14.8 40.7 24 33.2 40 24 40zm10.9-14.4c-.6-.3-3.5-1.7-4-1.9s-.9-.3-1.3.3-1.5 1.9-1.8 2.3-.7.4-1.3.1c-.6-.3-2.4-.9-4.6-2.8-1.7-1.5-2.8-3.4-3.2-3.9s0-.8.3-1.1l.9-1.1c.2-.3.3-.6.5-.9s.1-.6 0-.9c-.1-.3-1.3-3.1-1.8-4.3-.5-1.1-1-1-1.3-1h-1.1c-.4 0-1 .1-1.5.7s-2 2-2 4.8 2.1 5.6 2.4 6c.3.4 4.1 6.3 10 8.8 1.4.6 2.5 1 3.3 1.2 1.4.4 2.7.4 3.7.2 1.1-.2 3.5-1.4 4-2.8s.5-2.5.4-2.8c-.2-.3-.6-.4-1.2-.7z" />
    </svg>
  );
}
