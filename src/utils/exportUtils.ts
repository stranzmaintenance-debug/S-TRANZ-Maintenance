import { OfficeDetails } from '../types';
import { initialCompanyLogo } from '../data/initialData';

export function renderPdfHeader(officeDetails: OfficeDetails, subtitle?: string): string {
  const logo = officeDetails.companyLogo || initialCompanyLogo;
  return `
    <div style="border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${logo}" style="max-height: 52px; max-width: 170px; object-fit: contain;" alt="${officeDetails.companyName} Logo" />
        <div>
          <h1 style="margin: 0; font-size: 19px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${officeDetails.companyName}</h1>
          <div style="font-size: 10px; color: #475569; margin-top: 3px; line-height: 1.35;">
            ${officeDetails.officeAddress} <br/>
            Phone: ${officeDetails.officeContactNumber} | Email: ${officeDetails.companyEmail} | GST: <strong>${officeDetails.gstNumber}</strong>
          </div>
        </div>
      </div>
      <div style="text-align: right; font-size: 9.5px; color: #64748b;">
        ${subtitle ? `<strong style="color: #ea580c; text-transform: uppercase; font-size: 10px;">${subtitle}</strong><br/>` : ''}
        Date: ${new Date().toLocaleDateString()}<br/>
        Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  `;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(','))
  ].join('\r\n');

  // Include UTF-8 BOM so Excel opens without special character issues
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printHtmlDocument(title: string, html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Print error', e);
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 400);
  }
}

export function printFormattedReport(options: {
  title: string;
  subtitle?: string;
  dateRangeText?: string;
  officeDetails: OfficeDetails;
  headers: string[];
  rows: (string | number)[][];
  totals?: { label: string; value: string | number }[];
  footerNote?: string;
}) {
  const { title, subtitle, dateRangeText, officeDetails, headers, rows, totals, footerNote } = options;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - ${officeDetails.companyName}</title>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 11px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .logo-img {
      max-height: 55px;
      max-width: 140px;
      object-fit: contain;
    }
    .company-name {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .company-details {
      font-size: 10px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }
    .report-title-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .date-badge {
      font-size: 10px;
      background: #ea580c;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 10px;
    }
    table.data-table th {
      background-color: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #334155;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    table.data-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .totals-box {
      margin-top: 14px;
      border-top: 1.5px solid #0f172a;
      padding-top: 8px;
      display: flex;
      justify-content: flex-end;
      gap: 20px;
    }
    .total-item {
      text-align: right;
    }
    .total-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .total-value {
      font-size: 14px;
      font-weight: 800;
      color: #ea580c;
      font-family: monospace;
    }
    .signature-area {
      margin-top: 35px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-line {
      width: 160px;
      border-top: 1px solid #64748b;
      text-align: center;
      padding-top: 5px;
      font-size: 10px;
      color: #475569;
      font-weight: 600;
    }
    .footer {
      margin-top: 18px;
      font-size: 8px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 18%; vertical-align: middle;">
        <img src="${officeDetails.companyLogo || initialCompanyLogo}" class="logo-img" alt="${officeDetails.companyName} Logo" />
      </td>
      <td style="width: 57%; vertical-align: middle; padding-left: 10px;">
        <h1 class="company-name">${officeDetails.companyName}</h1>
        <div class="company-details">
          ${officeDetails.officeAddress} <br />
          Phone: ${officeDetails.officeContactNumber} | Owner: ${officeDetails.ownerContactNumber} | Email: ${officeDetails.companyEmail} <br />
          GST No: <strong>${officeDetails.gstNumber}</strong>
        </div>
      </td>
      <td style="width: 25%; text-align: right; vertical-align: top;">
        <div style="font-size: 9px; color: #64748b;">
          Generated: ${new Date().toLocaleString()}<br />
          System: S TRANZ TMS
        </div>
      </td>
    </tr>
  </table>

  <div class="report-title-box">
    <div>
      <h2 class="report-title">${title}</h2>
      ${subtitle ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${subtitle}</div>` : ''}
    </div>
    ${dateRangeText ? `<div class="date-badge">${dateRangeText}</div>` : ''}
  </div>

  <table class="data-table">
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.length === 0 ? `<tr><td colspan="${headers.length}" style="text-align:center; padding: 16px; color:#94a3b8;">No records found for the selected period.</td></tr>` : ''}
      ${rows.map(row => `
        <tr>
          ${row.map(cell => `<td>${cell !== undefined && cell !== null ? cell : '-'}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${totals && totals.length > 0 ? `
    <div class="totals-box">
      ${totals.map(t => `
        <div class="total-item">
          <div class="total-label">${t.label}</div>
          <div class="total-value">${t.value}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="signature-area">
    <div class="sig-line">Prepared By (Staff)</div>
    <div class="sig-line">Verified By (Manager)</div>
    <div class="sig-line">Authorized Signatory</div>
  </div>

  <div class="footer">
    ${footerNote || `${officeDetails.companyName} - Official Operational Record - Confidential`} | Page 1 of 1
  </div>
</body>
</html>
  `;

  printHtmlDocument(title, html);
}
