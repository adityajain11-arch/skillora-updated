import { jsPDF } from 'jspdf';
import { Student, CertificateRecord, LORRecord, OfferLetterRecord } from '../types';
import { sanitizeFilename } from '../utils/idGenerators';
import { SKILLORA_LOGO_URL } from '../components/Logo';

async function loadLogoDataUrl(): Promise<{ dataUrl: string; ratio: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      const ratio = canvas.width / Math.max(1, canvas.height);
      resolve({ dataUrl: canvas.toDataURL('image/png'), ratio });
    };
    img.onerror = () => {
      resolve({ dataUrl: '', ratio: 2.8 });
    };
    img.src = SKILLORA_LOGO_URL;
  });
}

export async function downloadOfferLetterPdf(
  student: Student,
  offerLetter?: OfferLetterRecord
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { dataUrl, ratio } = await loadLogoDataUrl();

  const displayName = offerLetter?.studentName || student.fullName;
  const displayDomain = offerLetter?.domain || student.domain;
  const displayDate = offerLetter?.issueDate || student.offerLetterDate;
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;

  // Deep Navy Outer Background (#082A4D)
  doc.setFillColor(8, 42, 77);
  doc.rect(0, 0, 210, 297, 'F');

  // White Rounded Document Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(6, 6, 198, 273, 6, 6, 'F');

  // Centered Attached Logo
  if (dataUrl) {
    const logoH = 26;
    const logoW = logoH * ratio;
    doc.addImage(dataUrl, 'PNG', (210 - logoW) / 2, 16, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(8, 42, 77);
    doc.text('Skillora', 105, 30, { align: 'center' });
  }

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(87, 184, 178);
  doc.text('YOUR NEXT CHAPTER STARTS HERE', 105, 49, { align: 'center' });

  // Main Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(87, 184, 178);
  doc.text('INTERNSHIP OFFER LETTER', 105, 62, { align: 'center' });
  doc.setDrawColor(87, 184, 178);
  doc.setLineWidth(0.7);
  doc.line(58, 64.5, 152, 64.5);

  // Horizontal divider with teal center bar
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(20, 74, 190, 74);
  doc.setFillColor(87, 184, 178);
  doc.rect(90, 73.2, 30, 1.6, 'F');

  // Recipient & Issue Date light box (#EEF4FB)
  doc.setFillColor(238, 244, 251);
  doc.roundedRect(20, 82, 170, 22, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 184, 178);
  doc.text('RECIPIENT', 27, 90);
  doc.text('ISSUE DATE', 132, 90);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(8, 42, 77);
  doc.text(displayName.toUpperCase(), 27, 98);
  doc.text(displayDate.toUpperCase(), 132, 98);

  // Dear FirstName,
  let y = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(8, 42, 77);
  doc.text('Dear ', 22, y);
  const dearWidth = doc.getTextWidth('Dear ');
  doc.setTextColor(87, 184, 178);
  doc.text(`${firstName},`, 22 + dearWidth, y);

  // Exact Template Body Paragraphs
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const paragraphs = [
    `Congratulations! We are pleased to offer you a place in the ${displayDomain} Internship Program at Skillora.`,
    `This internship is designed to help you strengthen your technical knowledge, gain practical experience, and build skills for your future career. You will have the opportunity to learn by doing, stay curious, and work toward meaningful professional growth.`,
    `We are excited to welcome you to Skillora and hope this experience becomes a valuable step in your journey.`,
  ];

  for (const p of paragraphs) {
    const lines = doc.splitTextToSize(p, 166);
    doc.text(lines, 22, y);
    y += lines.length * 5.6 + 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(87, 184, 178);
  doc.text('Welcome to Skillora.', 22, y + 1);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(8, 42, 77);
  doc.text('Warm regards,', 22, y);

  // Signature block
  y += 18;
  doc.setFont('times', 'italic');
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text('A. Jain', 24, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(87, 184, 178);
  doc.text('Aditya Jain', 22, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(8, 42, 77);
  doc.text('Chief Executive Officer', 22, y + 5.5);
  doc.text('Skillora', 22, y + 11);

  // Contact lines
  y += 21;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(8, 42, 77);
  doc.text('Phone: 6394050860', 22, y);
  doc.text('Email: adityajain22112006@gmail.com', 22, y + 6.5);

  // Bottom Navy Footer Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'Issued by Skillora in association with Pashupati Electrical and Craft & Curve',
    105,
    288,
    { align: 'center' }
  );

  doc.save(`Skillora_Offer_Letter_${sanitizeFilename(displayName)}.pdf`);
}

export async function downloadCertificatePdf(cert: CertificateRecord): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const { dataUrl, ratio } = await loadLogoDataUrl();

  doc.setFillColor(255, 253, 248);
  doc.rect(0, 0, 297, 210, 'F');

  doc.setDrawColor(8, 42, 77);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(87, 184, 178);
  doc.setLineWidth(0.9);
  doc.rect(14, 14, 269, 182);

  if (dataUrl) {
    const logoH = 22;
    const logoW = logoH * ratio;
    doc.addImage(dataUrl, 'PNG', (297 - logoW) / 2, 21, logoW, logoH);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(87, 184, 178);
  doc.text('OFFICIAL INTERNSHIP CREDENTIAL', 148.5, 50, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(8, 42, 77);
  doc.text('CERTIFICATE OF COMPLETION', 148.5, 64, { align: 'center' });

  doc.setDrawColor(87, 184, 178);
  doc.setLineWidth(0.8);
  doc.line(95, 69, 202, 69);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 65, 75);
  doc.text('This is to proudly certify that', 148.5, 83, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(8, 42, 77);
  doc.text(cert.studentName, 148.5, 99, { align: 'center' });

  doc.setDrawColor(8, 42, 77);
  doc.setLineWidth(0.4);
  doc.line(78, 103, 219, 103);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(50, 55, 65);
  const bodyText = `bearing Student ID ${cert.studentId}, has successfully completed the structured virtual internship program and capstone project requirements in the domain of`;
  const bodyLines = doc.splitTextToSize(bodyText, 210);
  doc.text(bodyLines, 148.5, 114, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(87, 184, 178);
  doc.text(cert.domain.toUpperCase(), 148.5, 132, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 65, 75);
  doc.text(
    `Demonstrating dedication, analytical skill, and professional execution as evaluated by the Skillora Review Board.`,
    148.5,
    143,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 42, 77);
  doc.text(`Completion Date: ${cert.completionDate}`, 34, 168);
  doc.text(`Certificate ID: ${cert.certificateId}`, 34, 175);

  doc.setDrawColor(87, 184, 178);
  doc.setLineWidth(1);
  doc.circle(148.5, 170, 14);
  doc.setLineWidth(0.4);
  doc.circle(148.5, 170, 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(8, 42, 77);
  doc.text('SKILLORA', 148.5, 168.5, { align: 'center' });
  doc.text('VERIFIED', 148.5, 173, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(8, 42, 77);
  doc.text('A. Jain', 238, 165, { align: 'center' });
  doc.setDrawColor(8, 42, 77);
  doc.setLineWidth(0.4);
  doc.line(212, 168, 264, 168);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Aditya Jain', 238, 174, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 95, 105);
  doc.text('Chief Executive Officer, Skillora', 238, 179, { align: 'center' });

  doc.save(`Skillora_Certificate_${sanitizeFilename(cert.studentName)}.pdf`);
}

export async function downloadLORPdf(lor: LORRecord, college?: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { dataUrl, ratio } = await loadLogoDataUrl();

  doc.setDrawColor(8, 42, 77);
  doc.setLineWidth(0.7);
  doc.rect(12, 12, 186, 273);

  if (dataUrl) {
    const logoH = 18;
    const logoW = logoH * ratio;
    doc.addImage(dataUrl, 'PNG', 22, 19, logoW, logoH);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 90, 105);
  doc.text('Skillora Technologies & Career Academy', 188, 24, { align: 'right' });
  doc.text('Phone: 6394050860', 188, 28.5, { align: 'right' });
  doc.text('Email: adityajain22112006@gmail.com', 188, 33, { align: 'right' });

  doc.setDrawColor(8, 42, 77);
  doc.setLineWidth(0.5);
  doc.line(22, 42, 188, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(8, 42, 77);
  doc.text('LETTER OF RECOMMENDATION', 105, 55, { align: 'center' });
  doc.setDrawColor(87, 184, 178);
  doc.line(68, 57.5, 142, 57.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`LOR Ref: ${lor.lorId}`, 22, 69);
  doc.text(`Date: ${lor.completionDate}`, 188, 69, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TO WHOMSOEVER IT MAY CONCERN', 22, 83);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(35, 35, 35);

  const collegeClause = college ? ` of ${college}` : '';
  const paragraphs = [
    `It is with great pleasure that we recommend ${lor.studentName} (Student ID: ${lor.studentId})${collegeClause}, who successfully completed an intensive virtual internship in ${lor.domain} with Skillora, concluding on ${lor.completionDate}.`,
    `Throughout the internship program, ${lor.studentName} demonstrated strong technical aptitude, intellectual curiosity, and disciplined execution across all assigned domain tasks and the final capstone project. Every deliverable submitted met our engineering and quality benchmarks with minimal revision required.`,
    `${lor.studentName} exhibited an impressive ability to translate conceptual knowledge into practical, real-world project outcomes while adhering strictly to milestone timelines and mentor feedback.`,
    `Based on their consistent dedication, problem-solving mindset, and verified project performance, we wholeheartedly recommend ${lor.studentName} for future academic pursuits, domain engineering roles, and professional opportunities.`,
    `We wish ${lor.studentName} continued success in all future endeavors.`,
  ];

  let y = 95;
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, 166);
    doc.text(lines, 22, y);
    y += lines.length * 5.4 + 5;
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 42, 77);
  doc.text('Warm Regards,', 22, y);

  doc.setFont('times', 'italic');
  doc.setFontSize(15);
  doc.text('A. Jain', 24, y + 15);
  doc.setDrawColor(8, 42, 77);
  doc.line(22, y + 18, 72, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(87, 184, 178);
  doc.text('Aditya Jain', 22, y + 23.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(8, 42, 77);
  doc.text('Chief Executive Officer, Skillora', 22, y + 28.5);
  doc.text('Phone: 6394050860 | adityajain22112006@gmail.com', 22, y + 33.5);

  doc.setDrawColor(87, 184, 178);
  doc.setLineWidth(0.6);
  doc.circle(165, y + 16, 13);
  doc.circle(165, y + 16, 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(8, 42, 77);
  doc.text('SKILLORA', 165, y + 14.5, { align: 'center' });
  doc.text('ENDORSED', 165, y + 18.5, { align: 'center' });

  doc.save(`Skillora_LOR_${sanitizeFilename(lor.studentName)}.pdf`);
}
