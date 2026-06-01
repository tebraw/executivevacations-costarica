import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Pricing Data ─────────────────────────────────────────────
const PACKAGES = [
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Palacio Musical · 3 nights',
    nights: 3,
    overnightGuests: 18,
    ceremonyGuests: 30,
    priceLow: 27000,
    priceHigh: 30000,
    villas: ['Palacio Musical'],
    catamaran: false,
    color: '#6b7280',
    bg: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
    textColor: '#1f2937',
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Palacio Musical · 4 nights',
    nights: 4,
    overnightGuests: 18,
    ceremonyGuests: 50,
    priceLow: 39000,
    priceHigh: 43000,
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
    priceLow: 87000,
    priceHigh: 100000,
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
    priceLow: 140000,
    priceHigh: 160000,
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

const VILLA_DEFAULTS = [
  { key: 'palacioTropical', name: 'Palacio Tropical', pricing: { low: 2400, high: 3200 } },
  { key: 'palacioMusical', name: 'Palacio Musical', pricing: { low: 2700, high: 3500 } },
  { key: 'viewHouse', name: 'The View House', pricing: { low: 399, high: 500 } },
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

  // Villa rates — shown and editable for all packages; pre-filled on package selection
  const [villaRates, setVillaRates] = useState({ palacioTropical: '', palacioMusical: '', viewHouse: '' });
  // Custom package: which villas are selected
  const [selectedVillasCustom, setSelectedVillasCustom] = useState({ palacioTropical: false, palacioMusical: false, viewHouse: false });

  // Core line items (editable base price override)
  const [basePrice, setBasePrice] = useState('');

  // Add-ons
  const [ceremonyGuests, setCeremonyGuests] = useState('');
  const [overnightGuests, setOvernightGuests] = useState('');
  const [extraNights, setExtraNights] = useState('');
  const [catamaranAddon, setCatamaranAddon] = useState(false);
  const [catamaranGuests, setCatamaranGuests] = useState('');
  const [decoUpgrade, setDecoUpgrade] = useState('');

  // Custom line items
  const [customLines, setCustomLines] = useState([{ label: '', amount: '' }]);

  // Discount
  const [discount, setDiscount] = useState('');
  const [applyTax, setApplyTax] = useState(false);

  // ── Derived values ──────────────────────────────────────────
  const pkg = PACKAGES.find((p) => p.id === selectedPkg) || null;

  // When season changes for a standard package, recalculate the villa rates
  useEffect(() => {
    if (pkg && pkg.id !== 'custom' && basePrice === '') {
      const newRates = { palacioTropical: '', palacioMusical: '', viewHouse: '' };
      pkg.villas.forEach((villaName) => {
        const vd = VILLA_DEFAULTS.find((v) => v.name === villaName);
        if (vd) newRates[vd.key] = String(vd.pricing[season]);
      });
      setVillaRates(newRates);
    }
  }, [season, selectedPkg]);

  // Sum of per-night villa rates for the active package / custom selection
  const perNightRate = () => {
    if (pkg && pkg.id !== 'custom') {
      return pkg.villas.reduce((sum, villaName) => {
        const vd = VILLA_DEFAULTS.find((v) => v.name === villaName);
        if (!vd) return sum;
        return sum + (parseFloat(villaRates[vd.key]) || vd.pricing[season]);
      }, 0);
    }
    return VILLA_DEFAULTS.reduce((sum, v) => {
      if (!selectedVillasCustom[v.key]) return sum;
      return sum + (parseFloat(villaRates[v.key]) || v.pricing[season]);
    }, 0);
  };

  const resolvedBase = () => {
    if (basePrice !== '') return parseFloat(basePrice) || 0;
    if (pkg && pkg.id !== 'custom') return season === 'high' ? pkg.priceHigh : pkg.priceLow;
    // Custom: sum of selected villa rates × nights
    const nights = parseFloat(extraNights) || 0;
    return nights > 0 ? VILLA_DEFAULTS.reduce((sum, v) => {
      if (!selectedVillasCustom[v.key]) return sum;
      return sum + (parseFloat(villaRates[v.key]) || v.pricing[season]) * nights;
    }, 0) : 0;
  };

  const lineItems = useCallback(() => {
    const lines = [];

    // Base
    const base = resolvedBase();
    if (base > 0) {
      let label;
      if (pkg && pkg.id !== 'custom') {
        label = `${pkg.name} Package — ${pkg.nights} nights (${season === 'high' ? 'high' : 'low'} season)`;
      } else {
        const selectedVillaNames = VILLA_DEFAULTS.filter((v) => selectedVillasCustom[v.key]).map((v) => v.name);
        const nights = parseFloat(extraNights) || 0;
        label = selectedVillaNames.length > 0 && nights > 0
          ? `Custom Package — ${selectedVillaNames.join(' + ')} · ${nights} night${nights !== 1 ? 's' : ''}`
          : 'Custom Package — Base Price';
      }
      lines.push({ label, amount: base });
    }

    // Ceremony guests — charge only guests beyond what the package includes
    const totalCeremony = parseFloat(ceremonyGuests) || 0;
    const inclCeremony = (pkg && pkg.id !== 'custom' && pkg.ceremonyGuests) ? pkg.ceremonyGuests : 0;
    const eCerem = Math.max(0, totalCeremony - inclCeremony);
    if (eCerem > 0) lines.push({ label: `${inclCeremony > 0 ? 'Extra' : 'Total'} ceremony guests (${eCerem} × $120)`, amount: eCerem * 120 });

    // Overnight guests — charge only guests beyond what the package includes
    const totalOvernight = parseFloat(overnightGuests) || 0;
    const inclOvernight = (pkg && pkg.id !== 'custom' && pkg.overnightGuests) ? pkg.overnightGuests : 0;
    const eOver = Math.max(0, totalOvernight - inclOvernight);
    const totalNightsForOvernight = Math.max(1, parseFloat(extraNights) || 1);
    if (eOver > 0) lines.push({ label: `${inclOvernight > 0 ? 'Extra' : 'Total'} overnight guests (${eOver} × $180 × ${totalNightsForOvernight} night${totalNightsForOvernight !== 1 ? 's' : ''})`, amount: eOver * 180 * totalNightsForOvernight });

    // Extra nights beyond what the package includes
    const totalNights = parseFloat(extraNights) || 0;
    const inclNights = (pkg && pkg.id !== 'custom' && pkg.nights) ? pkg.nights : 0;
    const eNights = Math.max(0, totalNights - inclNights);
    const nightRate = perNightRate();
    if (eNights > 0 && nightRate > 0 && pkg?.id !== 'custom') lines.push({ label: `Extra nights (${eNights} × ${fmtUSD(nightRate)})`, amount: eNights * nightRate });

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
  }, [basePrice, pkg, season, ceremonyGuests, overnightGuests, extraNights, catamaranAddon, catamaranGuests, decoUpgrade, customLines, villaRates, selectedVillasCustom]);

  const subtotal = lineItems().reduce((s, l) => s + l.amount, 0);
  const discountAmt = parseFloat(discount) || 0;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = applyTax ? afterDiscount * 0.13 : 0;
  const total = afterDiscount + taxAmt;

  // ── Actions ─────────────────────────────────────────────────
  const handleSelectPackage = (pkgId) => {
    if (selectedPkg === pkgId) {
      // Deselect → clear everything
      setSelectedPkg(null);
      setBasePrice('');
      setCeremonyGuests('');
      setOvernightGuests('');
      setExtraNights('');
      setVillaRates({ palacioTropical: '', palacioMusical: '', viewHouse: '' });
      setSelectedVillasCustom({ palacioTropical: false, palacioMusical: false, viewHouse: false });
    } else {
      setSelectedPkg(pkgId);
      setBasePrice('');
      if (pkgId !== 'custom') {
        const p = PACKAGES.find((pk) => pk.id === pkgId);
        if (p) {
          setCeremonyGuests(String(p.ceremonyGuests));
          setOvernightGuests(String(p.overnightGuests));
          setExtraNights('');
          const newRates = { palacioTropical: '', palacioMusical: '', viewHouse: '' };
          p.villas.forEach((villaName) => {
            const vd = VILLA_DEFAULTS.find((v) => v.name === villaName);
            if (vd) newRates[vd.key] = String(vd.pricing[season]);
          });
          setVillaRates(newRates);
          setSelectedVillasCustom({ palacioTropical: false, palacioMusical: false, viewHouse: false });
        }
      } else {
        setCeremonyGuests('');
        setOvernightGuests('');
        setExtraNights('');
        setVillaRates({ palacioTropical: '', palacioMusical: '', viewHouse: '' });
        setSelectedVillasCustom({ palacioTropical: false, palacioMusical: false, viewHouse: false });
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
    setExtraNights('');
    setCatamaranAddon(false);
    setCatamaranGuests('');
    setDecoUpgrade('');
    setCustomLines([{ label: '', amount: '' }]);
    setDiscount('');
    setApplyTax(false);
    setVillaRates({ palacioTropical: '', palacioMusical: '', viewHouse: '' });
    setSelectedVillasCustom({ palacioTropical: false, palacioMusical: false, viewHouse: false });
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
    if (discountAmt > 0 || applyTax) {
      text += `Subtotal: ${fmtUSD(subtotal)}\n`;
    }
    if (discountAmt > 0) {
      text += `Discount: -${fmtUSD(discountAmt)}\n`;
    }
    if (applyTax) {
      text += `13% Sales Tax: ${fmtUSD(taxAmt)}\n`;
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
    if (discountAmt > 0 || applyTax) {
      tableData.push(['Subtotal', fmtUSD(subtotal)]);
    }
    if (discountAmt > 0) {
      tableData.push(['Discount', `-${fmtUSD(discountAmt)}`]);
    }
    if (applyTax) {
      tableData.push(['13% Sales Tax', fmtUSD(taxAmt)]);
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
      <style>{`
        @media (max-width: 768px) {
          .wqb-outer-grid { grid-template-columns: 1fr !important; }
          .wqb-2col { grid-template-columns: 1fr !important; }
          .wqb-sticky { position: static !important; }
        }
      `}</style>
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

      <div className="wqb-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '28px', alignItems: 'stretch' }}>

        {/* ── Left column: inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Client Info */}
          <Section title="1. Client Information" icon="👤">
            <div className="wqb-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

            {/* Villa rates — shown for all selected packages */}
            {selectedPkg && selectedPkg !== 'custom' && pkg && (
              <div style={{ background: '#f9fafb', borderRadius: '14px', border: '2px solid #e5e7eb', padding: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Included Villas & Rates</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>Real nightly rates — used to price extra nights</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  {pkg.villas.map((villaName) => {
                    const vd = VILLA_DEFAULTS.find((v) => v.name === villaName);
                    if (!vd) return null;
                    return (
                      <div key={vd.key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: '#fef9ec', border: `2px solid ${GOLD}` }}>
                        <span style={{ fontSize: '14px' }}>🏠</span>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>{villaName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#6b7280', fontWeight: 700, fontSize: '13px' }}>$</span>
                          <input
                            type="number"
                            min="0"
                            style={{ ...inputStyle, width: '110px', padding: '7px 10px', fontSize: '13px' }}
                            value={villaRates[vd.key] !== '' ? villaRates[vd.key] : String(vd.pricing[season])}
                            placeholder={String(vd.pricing[season])}
                            onChange={(e) => setVillaRates((prev) => ({ ...prev, [vd.key]: e.target.value }))}
                          />
                          <span style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>/night</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Field label={`Extra nights beyond ${pkg.nights} incl. (× ${fmtUSD(perNightRate())} total/night)`}>
                  <input type="number" min="0" style={inputStyle} value={extraNights} onChange={(e) => setExtraNights(e.target.value)} placeholder="0" />
                  {extraNights && parseInt(extraNights) > 0 && (
                    <p style={{ fontSize: '11px', color: '#b8972e', marginTop: '4px', fontWeight: 600 }}>
                      {parseInt(extraNights)} extra × {fmtUSD(perNightRate())} = {fmtUSD(parseInt(extraNights) * perNightRate())}
                    </p>
                  )}
                </Field>
              </div>
            )}
            {/* Custom package: villa selection */}
            {selectedPkg === 'custom' && (
              <div style={{ background: '#f9fafb', borderRadius: '14px', border: '2px solid #e5e7eb', padding: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Select Villas</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  {VILLA_DEFAULTS.map((v) => {
                    const isSelected = selectedVillasCustom[v.key];
                    const defaultRate = v.pricing[season];
                    return (
                      <div key={v.key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: isSelected ? '#fef9ec' : '#fff', border: isSelected ? `2px solid ${GOLD}` : '2px solid #e5e7eb', transition: 'all 0.2s' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => setSelectedVillasCustom((prev) => ({ ...prev, [v.key]: e.target.checked }))}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: GOLD }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>{v.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#6b7280', fontWeight: 700, fontSize: '13px' }}>$</span>
                          <input
                            type="number"
                            min="0"
                            style={{ ...inputStyle, width: '110px', padding: '7px 10px', fontSize: '13px', opacity: isSelected ? 1 : 0.4 }}
                            disabled={!isSelected}
                            value={villaRates[v.key] !== '' ? villaRates[v.key] : (isSelected ? String(defaultRate) : '')}
                            placeholder={String(defaultRate)}
                            onChange={(e) => setVillaRates((prev) => ({ ...prev, [v.key]: e.target.value }))}
                            onFocus={() => { if (villaRates[v.key] === '' && isSelected) setVillaRates((prev) => ({ ...prev, [v.key]: String(defaultRate) })); }}
                          />
                          <span style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>/night</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Field label="Number of nights">
                  <input type="number" min="1" style={inputStyle} value={extraNights} onChange={(e) => setExtraNights(e.target.value)} placeholder="e.g. 5" />
                </Field>
                {resolvedBase() > 0 && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#0b0f18', color: '#c9a96e', fontWeight: 800, fontSize: '15px', textAlign: 'center', marginTop: '4px' }}>
                    Villa base: {fmtUSD(resolvedBase())}
                  </div>
                )}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e5e7eb' }}>
                  <Field label="Manual override base price ($) — optional">
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                      <input type="number" style={{ ...inputStyle, paddingLeft: '28px' }} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Leave empty to use villa calculation" />
                    </div>
                  </Field>
                </div>
              </div>
            )}
          </Section>

          {/* 3. Add-ons */}
          <Section title="3. Add-ons & Extras" icon="➕">
            <div className="wqb-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label={pkg && pkg.id !== 'custom' ? `Total ceremony guests (${pkg.ceremonyGuests} incl.)` : 'Total ceremony guests'}>
                <input type="number" min="0" style={inputStyle} value={ceremonyGuests} onChange={(e) => setCeremonyGuests(e.target.value)} placeholder={pkg && pkg.id !== 'custom' ? String(pkg.ceremonyGuests) : '0 × $120'} />
                {pkg && pkg.id !== 'custom' && ceremonyGuests && parseInt(ceremonyGuests) > pkg.ceremonyGuests && (
                  <p style={{ fontSize: '11px', color: '#b8972e', marginTop: '4px', fontWeight: 600 }}>
                    {parseInt(ceremonyGuests) - pkg.ceremonyGuests} extra × $120 = {fmtUSD((parseInt(ceremonyGuests) - pkg.ceremonyGuests) * 120)}
                  </p>
                )}
              </Field>
              <Field label={pkg && pkg.id !== 'custom' ? `Total overnight guests (${pkg.overnightGuests} incl.)` : 'Total overnight guests'}>
                <input type="number" min="0" style={inputStyle} value={overnightGuests} onChange={(e) => setOvernightGuests(e.target.value)} placeholder={pkg && pkg.id !== 'custom' ? String(pkg.overnightGuests) : '0 × $180/night'} />
                {pkg && pkg.id !== 'custom' && overnightGuests && parseInt(overnightGuests) > pkg.overnightGuests && (
                  <p style={{ fontSize: '11px', color: '#b8972e', marginTop: '4px', fontWeight: 600 }}>
                    {parseInt(overnightGuests) - pkg.overnightGuests} extra × $180/night
                  </p>
                )}
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

          {/* 5. Discount & Tax */}
          <Section title="5. Discount & Tax" icon="🏷️">
            <Field label="Discount amount ($)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>$</span>
                <input type="number" min="0" style={{ ...inputStyle, paddingLeft: '28px' }} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              </div>
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px', padding: '12px 14px', borderRadius: '12px', border: applyTax ? '2px solid #b8972e' : '2px solid #e5e7eb', background: applyTax ? '#fef9ec' : '#fff', transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#b8972e', cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937' }}>Apply 13% Sales Tax</span>
                {applyTax && afterDiscount > 0 && (
                  <span style={{ fontSize: '12px', color: '#b8972e', marginLeft: '8px', fontWeight: 600 }}>+ {fmtUSD(taxAmt)}</span>
                )}
              </div>
            </label>
          </Section>
        </div>

        {/* ── Right column: live quote summary ── */}
        <div className="wqb-sticky" style={{ position: 'sticky', top: '104px' }}>
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
              {(discountAmt > 0 || applyTax) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{fmtUSD(subtotal)}</span>
                </div>
              )}
              {discountAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#16a34a' }}>Discount</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>-{fmtUSD(discountAmt)}</span>
                </div>
              )}
              {applyTax && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#b8972e' }}>13% Sales Tax</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#b8972e' }}>+{fmtUSD(taxAmt)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: (discountAmt > 0 || applyTax) ? '1px solid #e5e7eb' : 'none', marginTop: (discountAmt > 0 || applyTax) ? '6px' : 0 }}>
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
