import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OfficeDetails } from '../types';
import { initialCompanyLogo } from '../data/initialData';

// Notification event helpers
export interface PdfNotificationEvent {
  status: 'generating' | 'success' | 'error';
  message: string;
  filename?: string;
}

export function notifyPdfStatus(detail: PdfNotificationEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pdf-status-change', { detail }));
  }
}

// Convert image/SVG data URL or URL to PNG base64 for jsPDF
async function getPngDataUrl(src: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!src) return null;

  // If already a PNG or JPEG base64, return directly
  if (src.startsWith('data:image/png;base64,') || src.startsWith('data:image/jpeg;base64,')) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ dataUrl: src, width: img.naturalWidth || 200, height: img.naturalHeight || 80 });
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // If SVG data URL or other URL, rasterize via HTML Canvas
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = 2; // High-res 2x
        const width = (img.naturalWidth || 400) * scale;
        const height = (img.naturalHeight || 120) * scale;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ dataUrl, width: img.naturalWidth || 400, height: img.naturalHeight || 120 });
      } catch (err) {
        console.warn('Canvas rasterization warning:', err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Color Palette Constants
const COLORS = {
  navyDark: [11, 19, 43] as [number, number, number], // #0B132B
  navyLight: [30, 41, 59] as [number, number, number], // #1E293B
  orangePrimary: [234, 88, 12] as [number, number, number], // #EA580C
  orangeSecondary: [217, 119, 6] as [number, number, number], // #D97706
  textDark: [15, 23, 42] as [number, number, number], // #0F172A
  textMuted: [100, 116, 139] as [number, number, number], // #64748B
  bgLight: [248, 250, 252] as [number, number, number], // #F8FAFC
  borderSubtle: [226, 232, 240] as [number, number, number], // #E2E8F0
  white: [255, 255, 255] as [number, number, number]
};

// Formats date & time string
export function getCurrentDateTimeFormatted(): { date: string; time: string } {
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return { date, time };
}

// Add Standard Corporate Header to PDF
async function addPdfHeader(
  doc: jsPDF,
  options: {
    officeDetails: OfficeDetails;
    documentTitle: string;
    subtitle?: string;
    recordId?: string;
    dateRangeText?: string;
  }
) {
  const { officeDetails, documentTitle, subtitle, recordId, dateRangeText } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const { date, time } = getCurrentDateTimeFormatted();

  // Try loading company logo
  const logoData = await getPngDataUrl(officeDetails.companyLogo || initialCompanyLogo);
  let logoWidth = 38;
  let logoHeight = 14;

  if (logoData) {
    const aspect = logoData.width / logoData.height;
    logoWidth = Math.min(42, 14 * aspect);
    logoHeight = logoWidth / aspect;
    try {
      doc.addImage(logoData.dataUrl, 'PNG', margin, 10, logoWidth, logoHeight);
    } catch {
      // Fallback vector badge
      doc.setFillColor(...COLORS.navyDark);
      doc.roundedRect(margin, 10, 16, 16, 2, 2, 'F');
      doc.setTextColor(...COLORS.orangePrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('S', margin + 8, 21, { align: 'center' });
      logoWidth = 18;
    }
  } else {
    // Vector badge
    doc.setFillColor(...COLORS.navyDark);
    doc.roundedRect(margin, 10, 16, 16, 2, 2, 'F');
    doc.setTextColor(...COLORS.orangePrimary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('S', margin + 8, 21, { align: 'center' });
    logoWidth = 18;
  }

  // Company Name & Official Details
  const companyStartX = margin + logoWidth + 4;
  doc.setTextColor(...COLORS.textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text((officeDetails.companyName || 'S TRANZ LOGISTIC').toUpperCase(), companyStartX, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textMuted);
  const addressLine = officeDetails.officeAddress || 'Transport Hub, Ring Road, Commercial Zone';
  doc.text(addressLine.substring(0, 90), companyStartX, 19.5);
  const contactLine = `Phone: ${officeDetails.officeContactNumber || '-'} | Email: ${officeDetails.companyEmail || '-'} | GSTIN: ${officeDetails.gstNumber || '-'}`;
  doc.text(contactLine, companyStartX, 23.5);

  // Top Right Info Box: Record ID / Date & Time
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.orangePrimary);
  doc.text(`DATE: ${date}`, rightX, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`TIME: ${time}`, rightX, 18.5, { align: 'right' });
  if (recordId) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.navyDark);
    doc.text(`ID: ${recordId}`, rightX, 23, { align: 'right' });
  }

  // Horizontal Accent Divider
  doc.setDrawColor(...COLORS.orangePrimary);
  doc.setLineWidth(0.8);
  doc.line(margin, 27, pageWidth - margin, 27);

  // Document Title Banner Box
  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.borderSubtle);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, 29, contentWidth, 12, 1.5, 1.5, 'FD');

  // Orange accent pill on left of banner
  doc.setFillColor(...COLORS.orangePrimary);
  doc.rect(margin, 29, 3, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navyDark);
  doc.text(documentTitle.toUpperCase(), margin + 6, 36.5);

  if (subtitle || dateRangeText) {
    const sub = subtitle || dateRangeText || '';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(sub, rightX - 4, 36.5, { align: 'right' });
  }

  return 44; // Y-coordinate where body content can start
}

// Add Standard Corporate Footer with Page Numbers to all pages
function addPdfFooters(doc: jsPDF, officeDetails: OfficeDetails) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.borderSubtle);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `${officeDetails.companyName || 'S TRANZ LOGISTIC'} • Confidential Operational Document • Generated from Fleet Maintenance System`,
      margin,
      pageHeight - 8
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }
}

// -------------------------------------------------------------
// 1. TABLE REPORT PDF EXPORT (All Records, Selected Records, Reports)
// -------------------------------------------------------------
export interface ExportTablePdfOptions {
  title: string;
  subtitle?: string;
  recordId?: string;
  filename: string;
  headers: string[];
  rows: (string | number | undefined | null)[][];
  totals?: { label: string; value: string | number }[];
  footerNote?: string;
  officeDetails: OfficeDetails;
  orientation?: 'portrait' | 'landscape';
}

export async function exportTableToPdf(options: ExportTablePdfOptions): Promise<void> {
  const { title, subtitle, recordId, filename, headers, rows, totals, officeDetails } = options;

  // Decide orientation: if more than 6 columns, landscape is vastly superior
  const orientation = options.orientation || (headers.length > 6 ? 'landscape' : 'portrait');
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  notifyPdfStatus({
    status: 'generating',
    message: `Generating PDF: ${safeFilename}...`,
    filename: safeFilename
  });

  try {
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const startY = await addPdfHeader(doc, {
      officeDetails,
      documentTitle: title,
      subtitle,
      recordId
    });

    // AutoTable generation
    const sanitizedRows = rows.map(r =>
      r.map(c => (c !== undefined && c !== null && c !== '' ? String(c) : '-'))
    );

    autoTable(doc, {
      startY,
      head: [headers],
      body: sanitizedRows.length > 0 ? sanitizedRows : [['No matching records found.']],
      theme: 'grid',
      styles: {
        fontSize: headers.length > 8 ? 6.5 : 8,
        cellPadding: 2,
        textColor: COLORS.textDark,
        lineColor: COLORS.borderSubtle,
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: COLORS.navyDark,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: headers.length > 8 ? 7 : 8.5
      },
      alternateRowStyles: {
        fillColor: COLORS.bgLight
      },
      margin: { left: 14, right: 14, bottom: 26 },
      didDrawPage: () => {
        // Redraw compact header on subsequent pages if multi-page
        if (doc.getCurrentPageInfo().pageNumber > 1) {
          doc.setFillColor(...COLORS.navyDark);
          doc.rect(14, 8, doc.internal.pageSize.getWidth() - 28, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.white);
          doc.text(
            `${officeDetails.companyName.toUpperCase()} — ${title.toUpperCase()} (Continued)`,
            17,
            12.5
          );
        }
      }
    });

    // If totals exist, render clean summary box
    if (totals && totals.length > 0) {
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || startY + 20;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Check if space left on page, else add page
      let boxY = finalY + 6;
      if (boxY + 20 > doc.internal.pageSize.getHeight() - 26) {
        doc.addPage();
        boxY = 16;
      }

      doc.setFillColor(...COLORS.bgLight);
      doc.setDrawColor(...COLORS.orangePrimary);
      doc.setLineWidth(0.4);
      const boxWidth = Math.min(120, pageWidth - 28);
      const boxX = pageWidth - 14 - boxWidth;
      doc.roundedRect(boxX, boxY, boxWidth, 7 + totals.length * 5, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.navyDark);
      doc.text('FINANCIAL & COUNT TOTALS', boxX + 4, boxY + 5);

      totals.forEach((t, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.textMuted);
        doc.text(t.label, boxX + 4, boxY + 10 + idx * 5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.orangePrimary);
        doc.text(String(t.value), boxX + boxWidth - 4, boxY + 10 + idx * 5, { align: 'right' });
      });
    }

    // Add Signatory Block
    const finalPageY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 100;
    const pageHeight = doc.internal.pageSize.getHeight();
    const sigY = pageHeight - 32;

    if (finalPageY < sigY - 10) {
      const pageWidth = doc.internal.pageSize.getWidth();
      const colWidth = (pageWidth - 28) / 3;
      const labels = ['Prepared By (Operations)', 'Verified By (Fleet Manager)', 'Authorized Signatory'];

      labels.forEach((lbl, i) => {
        const x = 14 + i * colWidth + 5;
        doc.setDrawColor(...COLORS.textMuted);
        doc.setLineWidth(0.3);
        doc.line(x, sigY, x + colWidth - 10, sigY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.textMuted);
        doc.text(lbl, x + (colWidth - 10) / 2, sigY + 3.5, { align: 'center' });
      });
    }

    // Finalize footers on every page
    addPdfFooters(doc, officeDetails);

    // Save and download actual PDF file
    doc.save(safeFilename);

    notifyPdfStatus({
      status: 'success',
      message: `PDF downloaded successfully: ${safeFilename}`,
      filename: safeFilename
    });
  } catch (err) {
    console.error('Error generating table PDF:', err);
    notifyPdfStatus({
      status: 'error',
      message: `Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`
    });
    throw err;
  }
}

// -------------------------------------------------------------
// 2. DETAILED RECORD DOSSIER PDF EXPORT (Single Record or Combined Multi-Records)
// -------------------------------------------------------------
export interface DossierField {
  label: string;
  value: string | number | undefined | null;
  highlight?: boolean;
}

export interface DossierSection {
  title: string;
  fields: DossierField[];
  subTable?: {
    headers: string[];
    rows: (string | number | undefined | null)[][];
  };
}

export interface DossierRecord {
  id: string;
  title: string;
  statusBadge?: { text: string; isWarning?: boolean; isSuccess?: boolean };
  sections: DossierSection[];
  photoUrl?: string;
  notes?: string;
  checklist?: { item: string; checked: boolean }[];
  signatures?: { role: string; name?: string; date?: string }[];
}

export interface ExportDossierPdfOptions {
  documentTitle: string;
  subtitle?: string;
  filename: string;
  records: DossierRecord[];
  officeDetails: OfficeDetails;
}

export async function exportDossierPdf(options: ExportDossierPdfOptions): Promise<void> {
  const { documentTitle, subtitle, filename, records, officeDetails } = options;
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  if (records.length === 0) {
    notifyPdfStatus({
      status: 'error',
      message: 'No records selected to export.'
    });
    return;
  }

  notifyPdfStatus({
    status: 'generating',
    message: `Generating PDF for ${records.length} record(s)...`,
    filename: safeFilename
  });

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    for (let rIdx = 0; rIdx < records.length; rIdx++) {
      const rec = records[rIdx];

      if (rIdx > 0) {
        doc.addPage();
      }

      // Add Corporate Header on record top
      let currentY = await addPdfHeader(doc, {
        officeDetails,
        documentTitle,
        subtitle: subtitle || (records.length > 1 ? `Record ${rIdx + 1} of ${records.length}` : undefined),
        recordId: rec.id
      });

      // Record Headline Bar (ID + Name/Title + Status)
      doc.setFillColor(...COLORS.navyDark);
      doc.roundedRect(margin, currentY, contentWidth, 9, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.white);
      doc.text(rec.title.toUpperCase(), margin + 4, currentY + 6);

      if (rec.statusBadge) {
        const badgeText = rec.statusBadge.text.toUpperCase();
        doc.setFontSize(7.5);
        if (rec.statusBadge.isSuccess) {
          doc.setFillColor(16, 185, 129); // emerald
        } else if (rec.statusBadge.isWarning) {
          doc.setFillColor(245, 158, 11); // amber
        } else {
          doc.setFillColor(...COLORS.orangePrimary);
        }
        const bWidth = doc.getTextWidth(badgeText) + 6;
        const bX = pageWidth - margin - bWidth - 3;
        doc.roundedRect(bX, currentY + 1.5, bWidth, 6, 1, 1, 'F');
        doc.setTextColor(...COLORS.white);
        doc.text(badgeText, bX + 3, currentY + 5.5);
      }

      currentY += 13;

      // Photo block if present (e.g. Driver profile photo)
      if (rec.photoUrl) {
        const photoInfo = await getPngDataUrl(rec.photoUrl);
        if (photoInfo) {
          try {
            const pWidth = 26;
            const pHeight = 32;
            const pX = pageWidth - margin - pWidth;
            doc.setDrawColor(...COLORS.orangePrimary);
            doc.setLineWidth(0.4);
            doc.roundedRect(pX - 1, currentY - 1, pWidth + 2, pHeight + 2, 1, 1, 'D');
            doc.addImage(photoInfo.dataUrl, 'PNG', pX, currentY, pWidth, pHeight);
          } catch (e) {
            console.warn('Photo attachment embed error:', e);
          }
        }
      }

      // Render each Section
      for (const sec of rec.sections) {
        // Section Header
        if (currentY + 18 > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(...COLORS.bgLight);
        doc.setDrawColor(...COLORS.borderSubtle);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, contentWidth, 6.5, 1, 1, 'FD');

        doc.setFillColor(...COLORS.orangePrimary);
        doc.rect(margin, currentY, 2.5, 6.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.navyDark);
        doc.text(sec.title.toUpperCase(), margin + 5, currentY + 4.5);

        currentY += 8.5;

        // Render Field Grid (2-column paired layout)
        if (sec.fields && sec.fields.length > 0) {
          const rowData: string[][] = [];
          for (let i = 0; i < sec.fields.length; i += 2) {
            const f1 = sec.fields[i];
            const f2 = sec.fields[i + 1];

            const col1 = `${f1.label}: ${f1.value !== undefined && f1.value !== null && f1.value !== '' ? String(f1.value) : '-'}`;
            const col2 = f2
              ? `${f2.label}: ${f2.value !== undefined && f2.value !== null && f2.value !== '' ? String(f2.value) : '-'}`
              : '';
            rowData.push([col1, col2]);
          }

          autoTable(doc, {
            startY: currentY,
            body: rowData,
            theme: 'plain',
            styles: {
              fontSize: 8,
              cellPadding: 1.8,
              textColor: COLORS.textDark,
              lineColor: COLORS.borderSubtle,
              lineWidth: 0.1
            },
            alternateRowStyles: {
              fillColor: COLORS.bgLight
            },
            margin: { left: margin, right: margin }
          });

          currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
        }

        // SubTable inside Section if present
        if (sec.subTable && sec.subTable.rows.length > 0) {
          autoTable(doc, {
            startY: currentY,
            head: [sec.subTable.headers],
            body: sec.subTable.rows.map(r => r.map(c => (c !== undefined && c !== null ? String(c) : '-'))),
            theme: 'grid',
            styles: {
              fontSize: 7.5,
              cellPadding: 1.8,
              textColor: COLORS.textDark,
              lineColor: COLORS.borderSubtle,
              lineWidth: 0.15
            },
            headStyles: {
              fillColor: COLORS.navyLight,
              textColor: COLORS.white,
              fontStyle: 'bold',
              fontSize: 8
            },
            margin: { left: margin, right: margin }
          });
          currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
        }
      }

      // Checklists if present (e.g. Driver exit assets handover)
      if (rec.checklist && rec.checklist.length > 0) {
        if (currentY + 20 > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.navyDark);
        doc.text('HANDOVER & VERIFICATION CHECKLIST:', margin, currentY);
        currentY += 4;

        rec.checklist.forEach(chk => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...(chk.checked ? COLORS.textDark : COLORS.textMuted));
          doc.text(`[ ${chk.checked ? 'X' : '  '} ]  ${chk.item}`, margin + 3, currentY);
          currentY += 4;
        });
        currentY += 2;
      }

      // Notes block if present
      if (rec.notes) {
        if (currentY + 16 > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(...COLORS.bgLight);
        doc.setDrawColor(...COLORS.borderSubtle);
        doc.roundedRect(margin, currentY, contentWidth, 12, 1, 1, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.navyDark);
        doc.text('OFFICIAL REMARKS & NOTES:', margin + 3, currentY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.textDark);
        doc.text(doc.splitTextToSize(rec.notes, contentWidth - 6), margin + 3, currentY + 8);
        currentY += 15;
      }

      // Signature Block at Bottom of Record
      const sigBlockY = Math.max(currentY + 4, pageHeight - 34);
      if (sigBlockY + 18 > pageHeight - 12) {
        doc.addPage();
      }

      const sigY = pageHeight - 30;
      const sigs = rec.signatures || [
        { role: 'Staff Prepared By', name: '' },
        { role: 'Operations Verified By', name: '' },
        { role: 'Authorized Signatory', name: officeDetails.companyName }
      ];

      const colW = contentWidth / sigs.length;
      sigs.forEach((s, idx) => {
        const x = margin + idx * colW + 4;
        doc.setDrawColor(...COLORS.textMuted);
        doc.setLineWidth(0.3);
        doc.line(x, sigY, x + colW - 8, sigY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.navyDark);
        doc.text(s.role, x + (colW - 8) / 2, sigY + 3.5, { align: 'center' });
        if (s.name) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.textMuted);
          doc.text(s.name, x + (colW - 8) / 2, sigY + 6.5, { align: 'center' });
        }
      });
    }

    // Add footers on every page
    addPdfFooters(doc, officeDetails);

    // Save and download actual PDF file
    doc.save(safeFilename);

    notifyPdfStatus({
      status: 'success',
      message: `PDF downloaded successfully: ${safeFilename}`,
      filename: safeFilename
    });
  } catch (err) {
    console.error('Error generating dossier PDF:', err);
    notifyPdfStatus({
      status: 'error',
      message: `Failed to download PDF: ${err instanceof Error ? err.message : 'Unknown error'}`
    });
    throw err;
  }
}
