import React, { useState, useMemo } from 'react';
import { getVillaColor } from '../../utils/bookingStorage';

const BookingCalendar = ({ bookings, onBookingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper function to parse date string as local date (without timezone shift)
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  }), [currentDate]);

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const firstDayOfWeek = firstDay.getDay();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [year, month]);

  const bookingSpans = useMemo(() => {
    const spans = [];
    
    bookings.forEach(booking => {
      const start = parseLocalDate(booking.startDate);
      const end = parseLocalDate(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(0, 0, 0, 0);
      
      if (end >= monthStart && start <= monthEnd) {
        const effectiveStart = start < monthStart ? monthStart : start;
        const effectiveEnd = end > monthEnd ? monthEnd : end;
        
        let currentWeekStart = new Date(effectiveStart);
        
        while (currentWeekStart <= effectiveEnd) {
          const weekEndDay = 6 - currentWeekStart.getDay();
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + weekEndDay);
          
          const spanEnd = weekEnd > effectiveEnd ? effectiveEnd : weekEnd;
          
          const startIndex = daysInMonth.findIndex(d => 
            d && d.getDate() === currentWeekStart.getDate() && 
            d.getMonth() === currentWeekStart.getMonth()
          );
          
          if (startIndex >= 0) {
            const daysSpan = Math.floor((spanEnd - currentWeekStart) / (1000 * 60 * 60 * 24)) + 1;
            
            spans.push({
              booking,
              startIndex,
              daysSpan,
              isStart: currentWeekStart.getTime() === effectiveStart.getTime(),
              isEnd: spanEnd.getTime() === effectiveEnd.getTime()
            });
          }
          
          currentWeekStart = new Date(weekEnd);
          currentWeekStart.setDate(currentWeekStart.getDate() + 1);
        }
      }
    });
    
    return spans;
  }, [bookings, daysInMonth, year, month]);

  const getSpansForDay = (index) => {
    return bookingSpans.filter(span => span.startIndex === index);
  };

  const getBookingStyle = (booking) => {
    const villas = booking.villas || [];
    
    if (villas.length === 0) {
      const defaultColors = getVillaColor('');
      return {
        background: defaultColors.bg,
        borderColor: defaultColors.border,
        color: defaultColors.text
      };
    }
    
    if (villas.length === 1) {
      const colors = getVillaColor(villas[0]);
      return {
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text
      };
    }
    
    const villaColors = villas.map(villa => getVillaColor(villa));
    const gradientColors = villaColors.map(c => c.bg).join(', ');
    const borderColors = villaColors.map(c => c.border);
    
    return {
      background: `linear-gradient(135deg, ${gradientColors})`,
      borderColor: borderColors[0],
      color: '#1f2937'
    };
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '2px solid #d1d5db'
    }}>
      <div style={{
        background: 'linear-gradient(to right, #f59e0b, #d97706)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => setCurrentDate(new Date())}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Today
        </button>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          {monthName}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        backgroundColor: '#f3f4f6',
        borderBottom: '2px solid #d1d5db'
      }}>
        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day, index) => (
          <div
            key={day}
            style={{
              padding: '16px 8px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '13px',
              color: '#374151',
              borderRight: index < 6 ? '1px solid #d1d5db' : 'none'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0',
        position: 'relative'
      }}>
        {daysInMonth.map((date, index) => {
          const isTodayDate = isToday(date);
          const isWeekendDate = isWeekend(date);
          const col = index % 7;
          const spans = getSpansForDay(index);

          return (
            <div
              key={index}
              style={{
                minHeight: '140px',
                padding: '12px 4px 4px 4px',
                position: 'relative',
                backgroundColor: date 
                  ? (isTodayDate ? '#fef3c7' : (isWeekendDate ? '#eff6ff' : 'white'))
                  : '#f9fafb',
                borderRight: col < 6 ? '1px solid #d1d5db' : 'none',
                borderBottom: '1px solid #d1d5db'
              }}
            >
              {date && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: isTodayDate ? '#f59e0b' : 'transparent',
                    color: isTodayDate ? 'white' : '#374151',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    zIndex: 1
                  }}>
                    {date.getDate()}
                  </div>

                  <div style={{ marginTop: '32px', position: 'relative' }}>
                    {spans.map((span, spanIndex) => {
                      const bookingStyle = getBookingStyle(span.booking);
                      const cellWidth = 100;
                      const width = `calc(${span.daysSpan * cellWidth}% + ${(span.daysSpan - 1) * 1}px)`;
                      
                      return (
                        <div
                          key={`${span.booking.id}-${spanIndex}`}
                          onClick={() => onBookingClick(span.booking)}
                          style={{
                            position: 'absolute',
                            top: `${spanIndex * 22}px`,
                            left: '4px',
                            width: width,
                            height: '20px',
                            background: bookingStyle.background,
                            color: bookingStyle.color,
                            borderLeft: `3px solid ${bookingStyle.borderColor}`,
                            borderRadius: span.isStart && span.isEnd ? '4px' : 
                                         span.isStart ? '4px 0 0 4px' : 
                                         span.isEnd ? '0 4px 4px 0' : '0',
                            padding: '3px 6px',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            zIndex: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                          }}
                        >
                          {span.isStart && (
                            <>
                              <span style={{ 
                                fontSize: '10px',
                                fontWeight: '700',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: '1'
                              }}>
                                {span.booking.customerName}
                              </span>
                              <span style={{ 
                                fontSize: '9px',
                                fontWeight: '600',
                                opacity: 0.85,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '40%'
                              }}>
                                {span.booking.villas && span.booking.villas.length > 0 ? (
                                  span.booking.villas.length === 1 
                                    ? span.booking.villas[0]
                                    : `${span.booking.villas[0]} +${span.booking.villas.length - 1}`
                                ) : 'No Villa'}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderTop: '2px solid #d1d5db',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        {Object.entries({
          'Palacio Tropical': getVillaColor('Palacio Tropical'),
          'Palacio Musical': getVillaColor('Palacio Musical'),
          'The View House': getVillaColor('The View House'),
          'The Palms Villa Estate': getVillaColor('The Palms Villa Estate')
        }).map(([name, colors]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`
            }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingCalendar;
