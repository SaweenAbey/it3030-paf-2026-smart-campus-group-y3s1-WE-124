import { jsPDF } from 'jspdf';

export const generateBookingReceipt = (booking, resource, user) => {
  const doc = new jsPDF();
  const primaryColor = '#0f172a'; // Slate 900
  const secondaryColor = '#38bdf8'; // Sky 400

  // Header Background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Logo / Title
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('UNI360', 20, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SMART CAMPUS OPERATIONS HUB', 20, 32);

  // Receipt Label
  doc.setFillColor(secondaryColor);
  doc.rect(140, 15, 50, 10, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECEIPT', 145, 21.5);

  // Content Start
  doc.setTextColor(primaryColor);
  doc.setFontSize(18);
  doc.text('Reservation Details', 20, 60);
  doc.setDrawColor(secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 65, 60, 65);

  // Details Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  const drawRow = (label, value, y) => {
    doc.setTextColor('#64748b'); // Slate 500
    doc.text(label, 20, y);
    doc.setTextColor(primaryColor);
    doc.text(String(value), 70, y);
  };

  let currentY = 80;
  drawRow('Booking Reference:', `#BK-${booking.id || 'PENDING'}`, currentY);
  currentY += 10;
  drawRow('Resource Name:', resource.name, currentY);
  currentY += 10;
  drawRow('Facility Type:', resource.type?.replace(/_/g, ' ') || 'Facility', currentY);
  currentY += 10;
  drawRow('Location:', resource.location, currentY);
  currentY += 15;

  // Date/Time Section
  doc.setFillColor('#f8fafc');
  doc.rect(15, currentY - 5, 180, 25, 'F');
  
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  
  drawRow('Booking Date:', startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), currentY + 5);
  currentY += 10;
  drawRow('Time Slot:', `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, currentY + 5);
  currentY += 25;

  // User Info
  doc.setFontSize(14);
  doc.text('User Information', 20, currentY);
  doc.line(20, currentY + 2, 50, currentY + 2);
  currentY += 12;

  doc.setFontSize(11);
  drawRow('Reserved By:', user.name || user.username, currentY);
  currentY += 8;
  drawRow('Email Address:', user.email, currentY);
  currentY += 8;
  drawRow('Role:', user.role, currentY);
  currentY += 20;

  // Footer / Verification
  doc.setFontSize(9);
  doc.setTextColor('#94a3b8');
  doc.text('This is a computer-generated receipt for the UNI360 Smart Campus Operations Hub.', 20, 270);
  doc.text('Valid for entry and resource access during the specified time slot only.', 20, 275);
  
  // Verification Box
  doc.setDrawColor('#e2e8f0');
  doc.rect(150, 255, 40, 30);
  doc.text('VERIFIED', 160, 265);
  doc.setFontSize(7);
  doc.text(new Date().toLocaleString(), 152, 280);

  // Save PDF
  doc.save(`Booking_Receipt_${booking.id || 'Request'}.pdf`);
};
