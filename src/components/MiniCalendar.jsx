import React, { useState } from 'react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toMidnight(d) { 
  const c = new Date(d); 
  c.setHours(0,0,0,0); 
  return c; 
}

function sameDay(a, b) { 
  return a && b && a.toDateString() === b.toDateString(); 
}

export default function MiniCalendar({ checkIn, checkOut, onChange, bookedRanges = [] }) {
  const today = toMidnight(new Date());
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());
  const [hov, setHov] = useState(null);
  const selecting = checkIn && !checkOut;

  function isBlocked(day) {
    return bookedRanges.some(r => day >= r.start && day < r.end);
  }

  function wallAfter(fromDay) {
    let min = null;
    for (const r of bookedRanges) {
      if (r.start > fromDay && (!min || r.start < min)) min = r.start;
    }
    return min;
  }

  function clickDay(day) {
    if (day < today) return;
    if (isBlocked(day)) return;
    if (!checkIn || checkOut) { onChange({ checkIn: day, checkOut: null }); return; }
    if (day <= checkIn) { onChange({ checkIn: day, checkOut: null }); return; }
    const wall = wallAfter(checkIn);
    if (wall && day > wall) { onChange({ checkIn, checkOut: wall }); return; }
    onChange({ checkIn, checkOut: day });
  }

  function prevM() { mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1); }
  function nextM() { mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1); }

  const dim = new Date(yr, mo + 1, 0).getDate();
  const firstDay = new Date(yr, mo, 1).getDay();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: dim }, (_, i) => new Date(yr, mo, i + 1))];
  const wall = selecting && checkIn ? wallAfter(checkIn) : null;
  const hovCapped = hov && wall && hov > wall ? wall : hov;
  const rangeEnd = selecting && hovCapped ? hovCapped : checkOut;
  const GOLD = '#b8972e';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <button onClick={prevM} style={{ background:'none', border:'none', cursor:'pointer', padding:'5px 8px', color:'#9ca3af', lineHeight:1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'0.88rem', fontWeight:600, color:'#111' }}>
          {MONTH_NAMES[mo]} {yr}
        </span>
        <button onClick={nextM} style={{ background:'none', border:'none', cursor:'pointer', padding:'5px 8px', color:'#9ca3af', lineHeight:1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'3px' }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'9px', fontWeight:700, color:'#9ca3af', letterSpacing:'0.04em', paddingBottom:'5px' }}>{d}</div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`b${i}`} />;
          const past = day < today;
          const booked = !past && isBlocked(day);
          const disabled = past || booked;
          const isStart = sameDay(day, checkIn);
          const isEnd = sameDay(day, checkOut);
          const inRange = checkIn && rangeEnd && rangeEnd > checkIn && day > checkIn && day < rangeEnd;
          const isToday = sameDay(day, today);
          let bg = 'transparent', col = disabled ? '#d1d5db' : '#1f2937', fw = 400, br = '50%';
          if (booked) { bg = '#fee2e2'; br = '4px'; }
          if (isStart || isEnd) { bg = GOLD; col = '#fff'; fw = 700; br = '50%'; }
          else if (inRange) { bg = 'rgba(184,151,46,0.13)'; br = '2px'; }
          return (
            <button key={i} disabled={disabled}
              onClick={() => clickDay(toMidnight(day))}
              onMouseEnter={() => selecting && !booked && setHov(toMidnight(day))}
              onMouseLeave={() => setHov(null)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                height:'31px', borderRadius: br,
                border: isToday && !isStart && !isEnd ? `1.5px solid ${GOLD}` : '1.5px solid transparent',
                background: bg, color: col, fontWeight: fw,
                fontSize:'0.76rem', cursor: disabled ? 'default' : 'pointer',
                textDecoration: booked ? 'line-through' : 'none',
                transition:'background 0.1s',
              }}>
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toMidnight, sameDay };
