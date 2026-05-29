import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Pricing Data ─────────────────────────────────────────────
const PACKAGES = [
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Palacio Musical · 2 nights',
    nights: 2,
    overnightGuests: 18,
    ceremonyGuests: 30,
    priceLow: 17900,
    priceHigh: 20900,
    villas: ['Palacio Musical'],
    catamaran: false,
    color: '#6b7280',
    bg: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
    textColor: '#1f2937',
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Palacio Musical · 3 nights',
    nights: 3,
    overnightGuests: 18,
    ceremonyGuests: 50,
    priceLow: 26900,
    priceHigh: 30900,
    villas: ['Palacio Musical'],
    catamaran: false,
    color: '#b8972e',
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    textColor: '#78350f',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'Palacio Musical + Palacio Tropical · 5 nights',
    nights: 5,
    overnightGuests: 36,
    ceremonyGuests: 75,
    priceLow: 63900,
    priceHigh: 76900,
    villas: ['Palacio Musical', 'Palacio Tropical'],
    catamaran: false,
    color: '#64748b',
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    textColor: '#0c4a6e',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    tagline: 'All 3 Estates + Free Catamaran · 7 nights',
    nights: 7,
    overnightGuests: 44,
    ceremonyGuests: 100,
    priceLow: 101900,
    priceHigh: 121900,
    villas: ['Palacio Musical', 'Palacio Tropical', 'The View House'],
    catamaran: true,
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
    textColor: '#4c1d95',
  },
  {
    id: 'custom',
    name: 'Custom',
    tagline: 'Own base price',
    nights: null,
    overnightGuests: 0,
    ceremonyGuests: 0,
    priceLow: 0,
    priceHigh: 0,
    villas: [],
    catamaran: false,
    color: '#6b7280',
    bg: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    textColor: '#374151',
  },
];

const GOLD = '#b8972e';
const GOLD_LIGHT = '#c9a96e';

const fmtUSD = (n) =>
  n == null || isNaN(n)
    ? '—'
    : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Small reusable input ──────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '2px solid #e5e7eb',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1f2937',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

// ── Main Component ────────────────────────────────────────────
export default function WeddingQuoteBuilder() {
  // Customer info
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', weddingDate: '', notes: '' });

  // Package selection: null = custom, else package id
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [season, setSeason] = useState('low'); // 'low' | 'high'

  // Core line items (editable base price)
  const [basePrice, setBasePrice] = useState('');

  // Add-ons
  const [ceremonyGuests, setCeremonyGuests] = useState('');
  const [overnightGuests, setOvernightGuests] = useState('');
  const [extraOvernightDays, setExtraOvernightDays] = useState('');
  const [extraNights, setExtraNights] = useState('');
  const [extraNightPrice, setExtraNightPrice] = useState('');
  const [catamaranAddon, setCatamaranAddon] = useState(false);
  const [catamaranGuests, setCatamaranGuests] = useState('');
  const [decoUpgrade, setDecoUpgrade] = useState('');

  // Custom line items
  const [customLines, setCustomLines] = useState([{ label: '', amount: '' }]);

  // Discount
  const [discount, setDiscount] = useState('');

  // ── Derived values ──────────────────────────────────────────
  const pkg = PACKAGES.find((p) => p.id === selectedPkg) || null;

  const resolvedBase = () => {
    if (basePrice !== '') return parseFloat(basePrice) || 0;
    if (pkg) return season === 'high' ? pkg.priceHigh : pkg.priceLow;
    return 0;
  };

  const lineItems = useCallback(() => {
    const lines = [];

    // Base
    const base = resolvedBase();
    if (base > 0) {
      const label = pkg && pkg.id !== 'custom'
        ? `${pkg.name} Package — ${pkg.nights} nights (${season === 'high' ? 'high' : 'low'} season)`
        : 'Custom Package — Base Price';
      lines.push({ label, amount: base });
    }

    // Ceremony guests — charge only guests beyond what the package includes
    const totalCeremony = parseFloat(ceremonyGuests) || 0;
    const inclCeremony = (pkg && pkg.id !== 'custom' && pkg.ceremonyGuests) ? pkg.ceremonyGuests : 0;
    const eCerem = Math.max(0, totalCeremony - inclCeremony);
    if (eCerem > 0) lines.push({ label: `Extra ceremony guests (${eCerem} × $61)`, amount: eCerem * 61 });

    // Overnight guests — charge only guests beyond what the package includes
    const totalOvernight = parseFloat(overnightGuests) || 0;
    const inclOvernight = (pkg && pkg.id !== 'custom' && pkg.overnightGuests) ? pkg.overnightGuests : 0;
    const eOver = Math.max(0, totalOvernight - inclOvernight);
    const eOverDays = parseFloat(extraOvernightDays) || 1;
    if (eOver > 0) lines.push({ label: `Extra overnight guests (${eOver} × $76 × ${eOverDays} day${eOverDays !== 1 ? 's' : ''})`, amount: eOver * 76 * eOverDays });

    // Extra nights
    const eNights = parseFloat(extraNights) || 0;
    const eNightPrice = parseFloat(extraNightPrice) || (season === 'high' ? 4200 : 3200);
    if (eNights > 0) lines.push({ label: `Extra nights (${eNights} × ${fmtUSD(eNightPrice)})`, amount: eNights * eNightPrice });

    // Catamaran add-on (not for Diamond which already includes it)
    const catamaranIncluded = pkg?.catamaran;
    if (catamaranAddon && !catamaranIncluded) {
      lines.push({ label: 'Private catamaran cruise — 6h (up to 25 guests)', amount: 2300 });
      const eCatGuests = parseFloat(catamaranGuests) || 0;
      if (eCatGuests > 0) lines.push({ label: `Extra catamaran guests (${eCatGuests} × $92)`, amount: eCatGuests * 92 });
    }

    // Decoration upgrade
    const deco = parseFloat(decoUpgrade) || 0;
    if (deco > 0) lines.push({ label: 'Themed decoration upgrade', amount: deco });

    // Custom lines
    customLines.forEach((cl) => {
      const amt = parseFloat(cl.amount) || 0;
      if (cl.label.trim() && amt !== 0) lines.push({ label: cl.label.trim(), amount: amt });
    });

    return lines;
  }, [basePrice, pkg, season, ceremonyGuests, overnightGuests, extraOvernightDays, extraNights, extraNightPrice, catamaranAddon, catamaranGuests, decoUpgrade, customLines]);

  const subtotal = lineItems().reduce((s, l) => s + l.amount, 0);
  const discountAmt = parseFloat(discount) || 0;
  const total = subtotal - discountAmt;

  // ── Actions ─────────────────────────────────────────────────
  const handleSelectPackage = (pkgId) => {
    if (selectedPkg === pkgId) {
      // Deselect → clear everything
      setSelectedPkg(null);
      setBasePrice('');
      setCeremonyGuests('');
      setOvernightGuests('');
    } else {
      setSelectedPkg(pkgId);
      setBasePrice('');
      if (pkgId !== 'custom') {
        const p = PACKAGES.find((pk) => pk.id === pkgId);
        if (p) {
          setCeremonyGuests(String(p.ceremonyGuests));
          setOvernightGuests(String(p.overnightGuests));
        }
      } else {
        setCeremonyGuests('');
        setOvernightGuests('');
      }
    }
  };

  const addCustomLine = () => setCustomLines((prev) => [...prev, { label: '', amount: '' }]);
  const removeCustomLine = (i) => setCustomLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateCustomLine = (i, field, value) =>
    setCustomLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const handleReset = () => {
    setCustomer({ name: '', email: '', phone: '', weddingDate: '', notes: '' });
    setSelectedPkg(null);
    setSeason('low');
    setBasePrice('');
    setCeremonyGuests('');
    setOvernightGuests('');
    setExtraOvernightDays('');
    setExtraNights('');
    setExtraNightPrice('');
    setCatamaranAddon(false);
    setCatamaranGuests('');
    setDecoUpgrade('');
    setCustomLines([{ label: '', amount: '' }]);
    setDiscount('');
  };

  const copyToClipboard = () => {
    const items = lineItems();
    const dateStr = customer.weddingDate ? new Date(customer.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    let text = `💍 WEDDING QUOTE — Executive Vacations Costa Rica\n`;
    text += `${'─'.repeat(45)}\n`;
    if (customer.name) text += `Client: ${customer.name}\n`;
    if (customer.weddingDate) text += `Wedding date: ${dateStr}\n`;
    text += `\n📋 QUOTE BREAKDOWN\n`;
    items.forEach((l) => { text += `  ${l.label}: ${fmtUSD(l.amount)}\n`; });
    text += `${'─'.repeat(45)}\n`;
    if (discountAmt > 0) {
      text += `Subtotal: ${fmtUSD(subtotal)}\n`;
      text += `Discount: -${fmtUSD(discountAmt)}\n`;
    }
    text += `TOTAL: ${fmtUSD(total)}\n`;
    if (customer.notes) text += `\nNotes: ${customer.notes}\n`;
    text += `\n✅ Price includes: venue, private chefs, catering, housekeeping, concierge & security.`;
    navigator.clipboard.writeText(text).then(() => alert('Quote copied to clipboard!')).catch(() => alert('Copy failed — please copy manually.'));
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const dateStr = customer.weddingDate ? new Date(customer.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(11, 15, 24);
    doc.rect(0, 0, pageW, 45, 'F');

    // Gold accent line
    doc.setFillColor(184, 151, 46);
    doc.rect(0, 42, pageW, 3, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Wedding Quote', 20, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(201, 169, 110);
    doc.text('Executive Vacations Costa Rica', 20, 26);
    doc.text(`Generated: ${today}`, 20, 33);

    // Client info box
    let y = 55;
    if (customer.name || customer.weddingDate || customer.email || customer.phone) {
      doc.setFillColor(248, 246, 242);
      doc.setDrawColor(201, 169, 110);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, y, pageW - 30, 30, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(184, 151, 46);
      doc.text('CLIENT DETAILS', 20, y + 7);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      if (customer.name) doc.text(`Client: ${customer.name}`, 20, y + 15);
      if (customer.weddingDate) doc.text(`Wedding Date: ${dateStr}`, 20, y + 22);
      if (customer.email) doc.text(`Email: ${customer.email}`, pageW / 2, y + 15);
      if (customer.phone) doc.text(`Phone: ${customer.phone}`, pageW / 2, y + 22);
      y += 38;
    }

    // Line items table
    const items = lineItems();
    const tableData = items.map((l) => [l.label, fmtUSD(l.amount)]);
    if (discountAmt > 0) {
      tableData.push(['Subtotal', fmtUSD(subtotal)]);
      tableData.push(['Discount', `-${fmtUSD(discountAmt)}`]);
    }

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount']],
      body: tableData,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [11, 15, 24], textColor: [201, 169, 110], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: [249, 247, 244] },
      margin: { left: 15, right: 15 },
    });

    // Total row
    const finalY = doc.lastAutoTable.finalY + 5;
    doc.setFillColor(11, 15, 24);
    doc.roundedRect(15, finalY, pageW - 30, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL', 20, finalY + 9.5);
    doc.setTextColor(201, 169, 110);
    doc.text(fmtUSD(total), pageW - 20, finalY + 9.5, { align: 'right' });

    // Notes
    if (customer.notes) {
      const notesY = finalY + 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(184, 151, 46);
      doc.text('NOTES', 15, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(customer.notes, 15, notesY + 6, { maxWidth: pageW - 30 });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFillColor(11, 15, 24);
    doc.rect(0, footerY, pageW, 20, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 140, 120);
    doc.text('Price includes: venue, private chefs, catering, housekeeping, concierge & security.', pageW / 2, footerY + 7, { align: 'center' });
    doc.text('executivevacations.net | paradiseweddingscostarica.com', pageW / 2, footerY + 13, { align: 'center' });

    const filename = `Wedding-Quote${customer.name ? '-' + customer.name.replace(/\s+/g, '-') : ''}.pdf`;
    doc.save(filename);
  };

  // ── Render ──────────────────────────────────────────────────
  const items = lineItems();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b0f18', margin: 0 }}>💍 Wedding Quote Builder</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Build a price quote live during a client call</p>
        </div>
        <button onClick={handleReset} style={{ padding: '8px 18px', borderRadius: '10px', border: '2px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          ↺ Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '28px', alignItems: 'start' }}>

        {/* ── Left column: inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Client Info */}
          <Section title="1. Client Information" icon="👤">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Name">
                <input style={inputStyle} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Jane & John Smith" />
              </Field>
              <Field label="Wedding Date">
                <input type="date" style={inputStyle} value={customer.weddingDate} onChange={(e) => setCustomer({ ...customer, weddingDate: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" style={inputStyle} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="email@example.com" />
              </Field>
              <Field label="Phone">
                <input type="tel" style={inputStyle} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+1 234 567 8900" />
              </Field>
            </div>
            <Field label="Internal Notes">
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} placeholder="Notes from the call…" />
            </Field>
          </Section>

          {/* 2. Package Selection */}
          <Section title="2. Package / Base Price" icon="📦">
            {/* Season toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['low', 'high'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  style={{
                    padding: '7px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
                    background: season === s ? GOLD : '#f3f4f6',
                    color: season === s ? '#fff' : '#6b7280',
                    boxShadow: season === s ? '0 2px 8px rgba(184,151,46,0.3)' : 'none',
                  }}
                >
                  {s === 'low' ? '🌿 Low Season' : '☀️ High Season'}
                </button>
              ))}
            </div>

            {/* Package cards (Silver / Gold / Platinum / Diamond / Custom) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {PACKAGES.map((p) => {
                const active = selectedPkg === p.id;
                if (p.id === 'custom') {
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPackage(p.id)}
                      style={{
                        padding: '14px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                        border: active ? '2px solid #6b7280' : '2px dashed #d1d5db',
                        background: active ? '#f3f4f6' : '#fafafa',
                        boxShadow: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#374151', marginBottom: '2px' }}>Custom</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', opacity: 0.9, marginBottom: '6px' }}>Own base price</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#6b7280' }}>
                        {active && basePrice ? fmtUSD(parseFloat(basePrice)) : '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>flexible</div>
                      {active && <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#6b7280', fontWeight: 700 }}>✓ Selected</div>}
                    </button>
                  );
                }
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPackage(p.id)}
                    style={{
                      padding: '14px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                      border: active ? `2px solid ${p.color}` : '2px solid #e5e7eb',
                      background: active ? p.bg : '#fafafa',
                      boxShadow: active ? `0 4px 16px ${p.color}30` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: p.textColor, marginBottom: '2px' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: p.textColor, opacity: 0.7, marginBottom: '6px' }}>{p.tagline}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: p.color }}>
                      {fmtUSD(season === 'high' ? p.priceHigh : p.priceLow)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                      {p.nights}n · {p.overnightGuests} overnight · {p.ceremonyGuests} ceremony
                    </div>
                    {active && <div style={{ marginTop: '6px', fontSize: '0.7rem', color: p.color, fontWeight: 700 }}>✓ Selected</div>}
                  </button>
                );
              })}
            </div>

            {/* Custom base price input — only visible when Custom card is selected */}
            {selectedPkg === 'custom' && (
              <Field label="Custom Base Price ($)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    style={{ ...inputStyle, paddingLeft: '28px' }}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="e.g. 45000"
                    autoFocus
                  />
                </div>
              </Field>
            )}
          </Section>

          {/* 3. Add-ons */}
          <Section title="3. Add-ons & Extras" icon="➕">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {selectedPkg && selectedPkg !== 'custom' ? (
                <>
                  <Field label={`Ceremony guests (${pkg.ceremonyGuests} incl.)`}>
                    <input type="number" min="0" style={inputStyle} value={ceremonyGuests} onChange={(e) => setCeremonyGuests(e.target.value)} placeholder={String(pkg.ceremonyGuests)} />
                    {ceremonyGuests && parseInt(ceremonyGuests) > pkg.ceremonyGuests && (
                      <p style={{ fontSize: '11px', color: '#b8972e', marginTop: '4px', fontWeight: 600 }}>
                        {parseInt(ceremonyGuests) - pkg.ceremonyGuests} extra × $61 = {fmtUSD((parseInt(ceremonyGuests) - pkg.ceremonyGuests) * 61)}
                      </p>
                    )}
                  </Field>
                  <div>
                    <Field label={`Overnight guests (${pkg.overnightGuests} incl.)`}>
                      <input type="number" min="0" style={inputStyle} value={overnightGuests} onChange={(e) => setOvernightGuests(e.target.value)} placeholder={String(pkg.overnightGuests)} />
                      {overnightGuests && parseInt(overnightGuests) > pkg.overnightGuests && (
                        <p style={{ fontSize: '11px', color: '#b8972e', marginTop: '4px', fontWeight: 600 }}>
                          {parseInt(overnightGuests) - pkg.overnightGuests} extra × $76/day
                        </p>
                      )}
                    </Field>
                    <Field label="  ↳ for how many days">
                      <input type="number" min="1" style={inputStyle} value={extraOvernightDays} onChange={(e) => setExtraOvernightDays(e.target.value)} placeholder="1" />
                    </Field>
                  </div>
                </>
              ) : selectedPkg === 'custom' ? (
                <div style={{ gridColumn: '1 / -1', padding: '12px 14px', borderRadius: '10px', background: '#f9fafb', border: '1px dashed #d1d5db', fontSize: '13px', color: '#6b7280' }}>
                  💡 Custom package — use <strong>Section 4</strong> below to add guest charges or any other line items manually.
                </div>
              ) : null}

              <Field label="Extra nights">
                <input type="number" min="0" style={inputStyle} value={extraNights} onChange={(e) => setExtraNights(e.target.value)} placeholder={`0 nights × ${season === 'high' ? '$4,200' : '$3,200'}`} />
              </Field>
              <Field label="Extra night price ($ / night)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                  <input type="number" min="0" style={{ ...inputStyle, paddingLeft: '28px' }} value={extraNightPrice} onChange={(e) => setExtraNightPrice(e.target.value)} placeholder={season === 'high' ? '4200' : '3200'} />
                </div>
              </Field>
            </div>

            {/* Catamaran */}
            {!pkg?.catamaran && (
              <div style={{ marginTop: '4px', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', background: catamaranAddon ? '#f0fdf4' : '#fafafa' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>
                  <input type="checkbox" checked={catamaranAddon} onChange={(e) => setCatamaranAddon(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  ⛵ Catamaran cruise +$2,300 (up to 25 guests)
                </label>
                {catamaranAddon && (
                  <div style={{ marginTop: '10px', paddingLeft: '28px' }}>
                    <Field label="Extra catamaran guests over 25 (× $92)">
                      <input type="number" min="0" style={inputStyle} value={catamaranGuests} onChange={(e) => setCatamaranGuests(e.target.value)} placeholder="0" />
                    </Field>
                  </div>
                )}
              </div>
            )}
            {pkg?.catamaran && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                ✓ Catamaran cruise included in Diamond package
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <Field label="Themed decoration upgrade ($)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                  <input type="number" min="0" style={{ ...inputStyle, paddingLeft: '28px' }} value={decoUpgrade} onChange={(e) => setDecoUpgrade(e.target.value)} placeholder="0" />
                </div>
              </Field>
            </div>
          </Section>

          {/* 4. Custom Line Items */}
          <Section title="4. Custom Line Items" icon="✏️">
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>Add any bespoke items, transfers, photography, DJ, etc.</p>
            {customLines.map((cl, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, marginBottom: 0 }}
                  value={cl.label}
                  onChange={(e) => updateCustomLine(i, 'label', e.target.value)}
                  placeholder="Description (e.g. Photography package)"
                />
                <div style={{ position: 'relative', width: '130px' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700, fontSize: '14px' }}>$</span>
                  <input
                    type="number"
                    style={{ ...inputStyle, paddingLeft: '24px', marginBottom: 0, width: '130px' }}
                    value={cl.amount}
                    onChange={(e) => updateCustomLine(i, 'amount', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <button onClick={() => removeCustomLine(i)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '2px solid #fee2e2', background: '#fff', color: '#ef4444', fontWeight: 900, fontSize: '16px', cursor: 'pointer', flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button
              onClick={addCustomLine}
              style={{ marginTop: '4px', padding: '8px 16px', borderRadius: '10px', border: `2px dashed ${GOLD_LIGHT}`, background: 'transparent', color: GOLD, fontWeight: 700, fontSize: '13px', cursor: 'pointer', width: '100%' }}
            >
              + Add Line Item
            </button>
          </Section>

          {/* 5. Discount */}
          <Section title="5. Discount" icon="🏷️">
            <Field label="Discount amount ($)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                <input type="number" min="0" style={{ ...inputStyle, paddingLeft: '28px' }} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              </div>
            </Field>
          </Section>
        </div>

        {/* ── Right column: live quote summary ── */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(184,151,46,0.2)' }}>
            {/* Summary Header */}
            <div style={{ background: 'linear-gradient(135deg, #0b0f18 0%, #1a2744 100%)', padding: '20px 22px' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: GOLD_LIGHT, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>Live Quote</p>
              <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', margin: 0 }}>
                {customer.name || 'Client Name'}
              </h3>
              {customer.weddingDate && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                  {new Date(customer.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              {pkg && (
                <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(184,151,46,0.2)', border: '1px solid rgba(184,151,46,0.4)', color: GOLD_LIGHT, fontSize: '0.75rem', fontWeight: 700 }}>
                  {pkg.name} Package · {season === 'high' ? 'High' : 'Low'} Season
                </div>
              )}
            </div>

            {/* Line items */}
            <div style={{ background: '#fff', padding: '16px 22px' }}>
              {items.length === 0 ? (
                <p style={{ color: '#d1d5db', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>Select a package or enter a base price to start</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '13px', color: '#374151', flex: 1, lineHeight: 1.4 }}>{l.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', whiteSpace: 'nowrap' }}>{fmtUSD(l.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ background: '#f9fafb', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
              {discountAmt > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{fmtUSD(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#16a34a' }}>Discount</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>-{fmtUSD(discountAmt)}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: discountAmt > 0 ? '1px solid #e5e7eb' : 'none', marginTop: discountAmt > 0 ? '6px' : 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0b0f18' }}>TOTAL</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: GOLD }}>{fmtUSD(total)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ background: '#fff', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={generatePDF}
                disabled={items.length === 0}
                style={{
                  padding: '12px', borderRadius: '12px', border: 'none', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                  background: items.length === 0 ? '#e5e7eb' : `linear-gradient(135deg, ${GOLD}, #a07040)`,
                  color: items.length === 0 ? '#9ca3af' : '#fff', fontWeight: 800, fontSize: '14px',
                  boxShadow: items.length === 0 ? 'none' : '0 4px 16px rgba(184,151,46,0.35)',
                }}
              >
                📄 Download PDF Quote
              </button>
              <button
                onClick={copyToClipboard}
                disabled={items.length === 0}
                style={{
                  padding: '12px', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                  background: '#fff', color: items.length === 0 ? '#9ca3af' : '#374151', fontWeight: 700, fontSize: '14px',
                }}
              >
                📋 Copy for WhatsApp / Email
              </button>
            </div>

            {/* Included note */}
            <div style={{ background: '#f8f6f2', padding: '12px 22px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                ✓ All packages include: venue access, private chefs &amp; catering team, daily housekeeping, concierge, and on-site security.<br />
                ✗ Not included: photographer, videographer, DJ / live music, flights &amp; transfers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <h4 style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0b0f18', margin: 0 }}>{title}</h4>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}
