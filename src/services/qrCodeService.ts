import QRCode from 'qrcode';
import { Vehicle, OfficeDetails } from '../types';

/**
 * Construct the direct standalone URL for a vehicle by unique ID.
 * When scanned with standard phone camera, Google Lens, etc.,
 * it directly opens the standalone Vehicle Details page.
 */
export function getVehicleQrUrl(vehicleId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Keep pathname so nested deployment paths work smoothly
    const pathname = window.location.pathname;
    return `${origin}${pathname}?vehicleId=${encodeURIComponent(vehicleId)}`;
  }
  return `/?vehicleId=${encodeURIComponent(vehicleId)}`;
}

/**
 * Generate a standalone high-resolution QR code data URL (PNG).
 * Uses High (H) error correction level (30% redundancy) for maximum durability
 * on physical stickers/cards even if scratched or smudged.
 */
export async function generateVehicleQrCodeDataUrl(
  vehicleId: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const url = getVehicleQrUrl(vehicleId);
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: options?.width || 800,
    margin: options?.margin ?? 2,
    color: {
      dark: '#0B132B', // Midnight navy
      light: '#FFFFFF'
    }
  });
}

/**
 * Generate a ready-to-print high-res sticker card badge (PNG) via HTML Canvas.
 * Contains Company Name, Logo badge, Vehicle Number, QR Code, and verification instructions.
 */
export async function generateBrandedVehicleQrCard(
  vehicle: Vehicle,
  officeDetails: OfficeDetails
): Promise<string> {
  const qrDataUrl = await generateVehicleQrCodeDataUrl(vehicle.id, { width: 600, margin: 1 });

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1050;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    // Background - Clean crisp white card with subtle rounded border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Decorative Header Band (Navy & Orange)
    ctx.fillStyle = '#0B132B'; // Navy
    ctx.fillRect(0, 0, width, 140);

    ctx.fillStyle = '#EA580C'; // Orange stripe
    ctx.fillRect(0, 140, width, 12);

    // Header Text: Company Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    const compName = (officeDetails.companyName || 'S TRANZ LOGISTIC').toUpperCase();
    ctx.fillText(compName, width / 2, 60);

    // Header Subtitle
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('COMMERCIAL FLEET VEHICLE VERIFICATION BADGE', width / 2, 95);

    ctx.fillStyle = '#EA580C';
    ctx.font = '16px monospace';
    ctx.fillText(officeDetails.gstNumber ? `GST: ${officeDetails.gstNumber}` : 'OFFICIAL FLEET REGISTER', width / 2, 122);

    // Vehicle Registration Banner Box
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(40, 180, width - 80, 130);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 180, width - 80, 130);

    // Vehicle Number Badge
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(60, 200, width - 120, 60);

    ctx.fillStyle = '#F97316'; // Bright orange
    ctx.font = '900 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(vehicle.vehicleNumber.toUpperCase(), width / 2, 245);

    // Make & Model line
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 20px Arial, sans-serif';
    const makeModelText = `${vehicle.make || ''} ${vehicle.model || ''} • ${vehicle.closedBodyOrOpenBody || 'Commercial Truck'}`.trim();
    ctx.fillText(makeModelText, width / 2, 292);

    // QR Code Image
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 460;
      const qrX = (width - qrSize) / 2;
      const qrY = 340;

      // QR border box
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 4;
      ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Instruction Box below QR
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 22px Arial, sans-serif';
      ctx.fillText('SCAN WITH GOOGLE CAMERA / GOOGLE LENS', width / 2, 855);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('Direct Live Access to Statutory Documents & Fleet Road Fitness', width / 2, 885);

      // Unique Record ID for Security Verification
      ctx.fillStyle = '#0B132B';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`DATABASE RECORD ID: ${vehicle.id}`, width / 2, 930);

      // Card Footer Band
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 960, width, 90);
      ctx.fillStyle = '#475569';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(`Official Property of ${officeDetails.companyName} • Helpline: ${officeDetails.officeContactNumber || '-'}`, width / 2, 1000);
      ctx.fillText(`Issued Date: ${vehicle.registrationDate || new Date().toISOString().split('T')[0]} • System Verified`, width / 2, 1025);

      resolve(canvas.toDataURL('image/png'));
    };

    qrImg.onerror = (err) => {
      console.warn('QR image load error in canvas generator', err);
      resolve(qrDataUrl);
    };

    qrImg.src = qrDataUrl;
  });
}

/**
 * Trigger browser download of high-quality QR Sticker PNG
 */
export async function downloadVehicleQrCode(
  vehicle: Vehicle,
  officeDetails: OfficeDetails,
  brandedCard: boolean = true
): Promise<void> {
  const dataUrl = brandedCard
    ? await generateBrandedVehicleQrCard(vehicle, officeDetails)
    : await generateVehicleQrCodeDataUrl(vehicle.id, { width: 1024, margin: 2 });

  const safeNum = vehicle.vehicleNumber.replace(/\s+/g, '_');
  const filename = brandedCard
    ? `Vehicle_QR_Sticker_${safeNum}_${vehicle.id}.png`
    : `Vehicle_QR_Code_${safeNum}_${vehicle.id}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Open a dedicated printable sticker window/iframe for vehicle windshield / card laminating
 */
export async function printVehicleQrSticker(
  vehicle: Vehicle,
  officeDetails: OfficeDetails
): Promise<void> {
  const cardDataUrl = await generateBrandedVehicleQrCard(vehicle, officeDetails);
  const directUrl = getVehicleQrUrl(vehicle.id);

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    // If popup blocked, create hidden iframe and trigger print
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
      doc.write(getPrintHtml(vehicle, officeDetails, cardDataUrl, directUrl));
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(getPrintHtml(vehicle, officeDetails, cardDataUrl, directUrl));
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

function getPrintHtml(
  vehicle: Vehicle,
  officeDetails: OfficeDetails,
  cardDataUrl: string,
  directUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Vehicle_QR_Sticker_${vehicle.vehicleNumber.replace(/\s+/g, '_')}</title>
  <meta charset="utf-8" />
  <style>
    @page {
      size: auto;
      margin: 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      color: #0f172a;
    }
    .print-card-container {
      max-width: 500px;
      margin: 20px auto;
      background: white;
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    .sticker-img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
    }
    .cut-guide {
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
      font-weight: bold;
    }
    .url-text {
      font-family: monospace;
      font-size: 9px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 4px;
    }
    @media print {
      body {
        background: white;
      }
      .print-card-container {
        box-shadow: none;
        border: 1px dashed #cbd5e1;
        margin: 0;
        max-width: 100%;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="print-card-container">
    <img src="${cardDataUrl}" class="sticker-img" alt="Vehicle QR Code Sticker" />
    <div class="cut-guide">✂ CUT ALONG DASHED LINE • VEHICLE WINDSHIELD / CABIN STICKER</div>
    <div class="url-text">${directUrl}</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;
}
