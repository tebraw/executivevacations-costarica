import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Villa prices per night (in USD)
const VILLA_PRICES = {
  'Palacio Tropical': 850,
  'Palacio Musical': 750,
  'The View House': 650,
  'The Palms Villa Estate': 950
};

// Activity prices (in USD)
const ACTIVITY_PRICES = {
  'ATV Tour': 120,
  'Zipline Adventure': 95,
  'Private Air Charter': 2500,
  'Surfing Lessons': 80,
  'Fishing Tour': 350,
  'Spa Treatment': 150,
  'Private Chef': 200,
  'Yoga Session': 60
};

const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const generateInvoice = (booking) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Company Header
  doc.setFillColor(212, 175, 55); // Gold color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Vacations', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Costa Rica Luxury Villa Rentals', 20, 28);
  doc.text('propertieswithmeritt@gmail.com | 303-881-8588', 20, 34);
  
  // Invoice Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 55, { align: 'right' });
  
  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceNumber = `INV-${booking.id.substring(0, 8).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString('en-US');
  doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 20, 63, { align: 'right' });
  doc.text(`Date: ${invoiceDate}`, pageWidth - 20, 69, { align: 'right' });
  
  // Customer Information
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.customerName, 20, 63);
  if (booking.customerPhone) {
    doc.text(booking.customerPhone, 20, 69);
  }
  
  // Booking Details
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING DETAILS:', 20, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`Check-in: ${formatDate(booking.startDate)}`, 20, 93);
  doc.text(`Check-out: ${formatDate(booking.endDate)}`, 20, 99);
  
  const nights = calculateNights(booking.startDate, booking.endDate);
  doc.text(`Duration: ${nights} night${nights > 1 ? 's' : ''}`, 20, 105);
  
  // Calculate totals
  let villaSubtotal = 0;
  let activitiesSubtotal = 0;
  
  // Villa items
  const villaItems = booking.villas.map(villa => {
    const pricePerNight = VILLA_PRICES[villa] || 0;
    const total = pricePerNight * nights;
    villaSubtotal += total;
    return [villa, nights, `$${pricePerNight.toFixed(2)}`, `$${total.toFixed(2)}`];
  });
  
  // Activity items
  const activityItems = (booking.selectedActivities || []).map(activity => {
    const price = ACTIVITY_PRICES[activity] || 0;
    activitiesSubtotal += price;
    return [activity, 1, `$${price.toFixed(2)}`, `$${price.toFixed(2)}`];
  });
  
  // Items Table
  const tableData = [
    ...villaItems,
    ...activityItems
  ];
  
  doc.autoTable({
    startY: 115,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [212, 175, 55], // Gold color
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalX = pageWidth - 20;
  
  const subtotal = villaSubtotal + activitiesSubtotal;
  const tax = subtotal * 0.13; // 13% Costa Rica VAT
  const total = subtotal + tax;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalX - 50, finalY, { align: 'right' });
  doc.text(`$${subtotal.toFixed(2)}`, totalX, finalY, { align: 'right' });
  
  doc.text('Tax (13%):', totalX - 50, finalY + 8, { align: 'right' });
  doc.text(`$${tax.toFixed(2)}`, totalX, finalY + 8, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalX - 50, finalY + 18, { align: 'right' });
  doc.text(`$${total.toFixed(2)}`, totalX, finalY + 18, { align: 'right' });
  
  // Notes
  if (booking.additionalNotes || booking.activityNotes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 20, finalY + 35);
    doc.setFont('helvetica', 'normal');
    
    let notesY = finalY + 43;
    if (booking.activityNotes) {
      doc.text(`Activity Notes: ${booking.activityNotes}`, 20, notesY, { maxWidth: 170 });
      notesY += 10;
    }
    if (booking.additionalNotes) {
      doc.text(`Additional Notes: ${booking.additionalNotes}`, 20, notesY, { maxWidth: 170 });
    }
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for choosing Executive Vacations!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('We look forward to hosting you in beautiful Costa Rica.', pageWidth / 2, footerY + 4, { align: 'center' });
  
  // Save the PDF
  const fileName = `Invoice_${booking.customerName.replace(/\s+/g, '_')}_${invoiceNumber}.pdf`;
  doc.save(fileName);
};
