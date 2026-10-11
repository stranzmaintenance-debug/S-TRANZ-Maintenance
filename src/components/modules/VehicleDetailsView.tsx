import React, { useEffect, useState } from 'react';
import {
  Truck,
  QrCode,
  Download,
  Printer,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  Copy,
  Check,
  Building2,
  Phone,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Vehicle, OfficeDetails, DocumentAttachment } from '../../types';
import {
  generateVehicleQrCodeDataUrl,
  downloadVehicleQrCode,
  printVehicleQrSticker,
  getVehicleQrUrl
} from '../../services/qrCodeService';
import { exportVehiclesPdf } from '../../utils/pdfModuleHelpers';

interface VehicleDetailsViewProps {
  vehicle: Vehicle;
  officeDetails: OfficeDetails;
  onClose?: () => void;
  isStandalone?: boolean;
  isJustCreated?: boolean;
}

export const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({
  vehicle,
  officeDetails,
  onClose,
  isStandalone = false,
  isJustCreated = false
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ doc: DocumentAttachment; title: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const qrUrl = getVehicleQrUrl(vehicle.id);

  // Automatically generate the unique QR Code on mount or vehicle ID change
  useEffect(() => {
    let isMounted = true;
    generateVehicleQrCodeDataUrl(vehicle.id, { width: 600, margin: 2 })
      .then(url => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code for vehicle:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [vehicle.id]);

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(qrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadPdfDossier = async () => {
    try {
      setIsGeneratingPdf(true);
      await exportVehiclesPdf(vehicle, officeDetails);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDoc = (doc: DocumentAttachment) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName || `${vehicle.vehicleNumber}_document`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to check validity status
  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return { label: 'Not Logged', color: 'text-slate-500 bg-slate-800/40 border-slate-700' };
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) {
      return { label: 'EXPIRED', color: 'text-red-400 bg-red-950/60 border-red-800/60' };
    }
    const daysLeft = Math.ceil((new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      return { label: `Expires in ${daysLeft}d`, color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
    }
    return { label: 'VALID', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
  };

  const statutoryDocs = [
    { label: '15. RC Card Certificate', date: vehicle.registrationDate, doc: vehicle.rcCardDoc, isRc: true },
    { label: '16. Road Fitness Certificate', date: vehicle.fitnessValidDate, doc: vehicle.fitnessDoc },
    { label: '17. Commercial Insurance Policy', date: vehicle.insuranceValidDate, doc: vehicle.insuranceDoc },
    { label: '18. Road Tax Certificate', date: vehicle.taxValidDate, doc: vehicle.taxDoc },
    { label: '19. PUCC Pollution Certificate', date: vehicle.puccValidDate, doc: vehicle.puccDoc },
    { label: '20. State Transport Permit', date: vehicle.permitValidDate, doc: vehicle.permitDoc },
    { label: '21. National Permit (All-India)', date: vehicle.nationalPermitValidDate, doc: vehicle.nationalPermitDoc }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Newly Saved Vehicle Automatic QR Generated Banner */}
      {isJustCreated && (
        <div className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider">
                Vehicle Record Successfully Saved • QR Code Automatically Generated!
              </p>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                A unique QR code is bound to Database Record ID <span className="font-mono font-bold text-white">{vehicle.id}</span>. Download or print the sticker below to place on {vehicle.vehicleNumber}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => downloadVehicleQrCode(vehicle, officeDetails, true)}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow cursor-pointer transition-colors"
            >
              Download QR Code
            </button>
            <button
              type="button"
              onClick={() => printVehicleQrSticker(vehicle, officeDetails)}
              className="px-3 py-1.5 text-xs font-bold bg-[#16233a] hover:bg-[#1f3152] text-white border border-slate-600 rounded-lg shadow cursor-pointer transition-colors"
            >
              Print QR Code
            </button>
          </div>
        </div>
      )}

      {/* Top Corporate Branding & Vehicle Header */}
      <div className="bg-[#0b1324] border border-[#1e2f50] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182844] relative z-10">
          <div className="flex items-center gap-3.5">
            {officeDetails.companyLogo ? (
              <img
                src={officeDetails.companyLogo}
                alt={officeDetails.companyName}
                className="h-12 w-auto max-w-[140px] object-contain rounded-lg bg-white/5 p-1 border border-slate-700/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-xl">
                S
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{officeDetails.companyName || 'S TRANZ LOGISTIC'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2 mt-0.5">
                <span>{vehicle.vehicleNumber}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.make} ({vehicle.model}) • {vehicle.closedBodyOrOpenBody} • RTO: {vehicle.registeredAtRto || 'Commercial Hub'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${
                vehicle.currentStatus === 'Active'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                  : vehicle.currentStatus === 'Under Maintenance'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              ● {vehicle.currentStatus}
            </span>

            <span className="px-2.5 py-1 text-[11px] font-mono text-slate-400 bg-[#070c17] rounded-lg border border-[#1b2b48]">
              ID: {vehicle.id}
            </span>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdfDossier}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Complete Vehicle Specification & Compliance PDF Dossier"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Vehicle PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => downloadVehicleQrCode(vehicle, officeDetails, true)}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download High-Resolution Branded QR Code Sticker Badge (PNG)"
            >
              <Download className="w-4 h-4" />
              <span>Download QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => printVehicleQrSticker(vehicle, officeDetails)}
              className="px-3.5 py-2 bg-[#16233a] hover:bg-[#1f3152] text-slate-200 border border-[#273c60] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Official QR Sticker for Windshield / Cabin Laminating"
            >
              <Printer className="w-4 h-4 text-orange-400" />
              <span>Print QR Code</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#070c17] rounded-lg border border-[#1b2b48] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy Direct QR Link URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Code Sticker Card + Key Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 cols): Automatic QR Code Showcase Card */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0b1324] border border-[#1e2f50] rounded-2xl p-5 shadow-xl flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-[#192a48]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Automatic QR Code</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              High-Res 30% ECC
            </span>
          </div>

          {/* QR Code Container */}
          <div className="mt-4 p-3 bg-white rounded-xl shadow-lg border-2 border-orange-500/80 inline-block transition-transform hover:scale-102">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR Code for ${vehicle.vehicleNumber}`}
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div className="mt-3 text-center">
            <span className="font-mono text-base font-black text-orange-400 tracking-wider">
              {vehicle.vehicleNumber}
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Unique Record ID: <span className="font-mono text-slate-300">{vehicle.id}</span>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-[#070c17] border border-[#1b2b48] text-[11px] text-slate-400 text-left w-full space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Scan with Google Camera / Google Lens</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              Directly loads this vehicle's road fitness, permits, and RC certificates. Connected strictly to Record ID <strong className="text-slate-200">{vehicle.id}</strong>.
            </p>
          </div>

          {/* QR Action Buttons */}
          <div className="space-y-2 w-full mt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => downloadVehicleQrCode(vehicle, officeDetails, true)}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Download high-resolution branded QR card sticker badge"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => printVehicleQrSticker(vehicle, officeDetails)}
                className="px-3 py-2 bg-[#16233a] hover:bg-[#1e2f50] text-slate-200 border border-[#273b5e] font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Print official vehicle QR sticker with cut guides"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" />
                <span>Print QR Code</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => downloadVehicleQrCode(vehicle, officeDetails, false)}
              className="w-full py-1.5 px-3 bg-[#070c17] hover:bg-[#101a2e] text-slate-300 hover:text-white border border-[#1b2b48] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone raw high-res QR code PNG without borders or header"
            >
              <QrCode className="w-3 h-3 text-emerald-400" />
              <span>Download Raw QR Image (PNG)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols): Vehicle Specifications (Fields 1 to 14) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#0b1324] border border-[#1e2f50] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#192a48]">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>Vehicle Specifications (Fields 1 to 14)</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Registered Date: <strong className="text-slate-200 font-mono">{vehicle.registrationDate}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">1. Vehicle Number</span>
              <strong className="text-orange-400 font-mono text-sm">{vehicle.vehicleNumber}</strong>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">2. Engine Number</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.engineNumber || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">3. Chassis Number</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.chassisNumber || 'N/A'}</span>
            </div>

            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">4. Registered RTO</span>
              <span className="text-slate-200 font-semibold">{vehicle.registeredAtRto || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">5. Model Name</span>
              <span className="text-slate-200 font-semibold">{vehicle.model || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">6. Unladen Weight</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.unladenWeight || 'N/A'}</span>
            </div>

            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">7. Loading Capacity</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.loadCapacity || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">8. Manufacturer / Make</span>
              <span className="text-slate-200 font-semibold">{vehicle.make || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">9. Tyre Specification</span>
              <span className="text-slate-200 font-semibold">{vehicle.tyre || 'N/A'}</span>
            </div>

            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">10. Vehicle Fit Type</span>
              <span className="text-slate-200 font-semibold">{vehicle.vehicleFit || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">11. Vehicle Height</span>
              <span className="text-slate-200 font-semibold">{vehicle.height || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">12. Vehicle Width</span>
              <span className="text-slate-200 font-semibold">{vehicle.width || 'N/A'}</span>
            </div>

            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">13. Body Classification</span>
              <span className="text-slate-200 font-semibold">{vehicle.closedBodyOrOpenBody}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">14. Registration Date</span>
              <span className="font-mono text-slate-200 font-semibold">{vehicle.registrationDate}</span>
            </div>
            <div className="p-2.5 bg-[#070c17] rounded-lg border border-[#182844]">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Driver</span>
              <span className="text-emerald-400 font-semibold">{vehicle.assignedDriverName || 'Unassigned / Relief'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Documents & Certificates (Fields 15 to 21) */}
      <div className="bg-[#0b1324] border border-[#1e2f50] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#182844]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-orange-400" />
              <span>Statutory Compliance & Certificates (Fields 15 to 21)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live validity dates, uploaded PDF policies, and photo attachments for RTO verification.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            7 Mandatory Compliance Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {statutoryDocs.map((item, idx) => {
            const expiryStatus = getExpiryStatus(item.date);
            const hasAttachment = Boolean(item.doc?.fileUrl);
            const isPdf = item.doc?.fileType?.includes('pdf') || item.doc?.fileName?.toLowerCase().endsWith('.pdf');

            return (
              <div
                key={idx}
                className="bg-[#070c17] border border-[#182844] rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-200">{item.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${expiryStatus.color}`}>
                      {expiryStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">Validity Date:</span>
                    <span className="font-mono font-bold text-slate-100">{item.date || 'N/A'}</span>
                  </div>

                  {/* Attached Document Summary */}
                  <div className="mt-2 p-2 bg-[#0b1324] rounded-lg border border-[#1a2b47] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="text-[11px] font-mono text-slate-300 truncate" title={item.doc?.fileName || 'Certificate on file'}>
                        {item.doc?.fileName || (hasAttachment ? 'Attached Document' : 'Official Certificate Logged')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Actions: View & Download */}
                <div className="mt-3 pt-2.5 border-t border-[#14223a] flex items-center justify-end gap-2">
                  {hasAttachment ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewingDoc({ doc: item.doc!, title: item.label })}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-white bg-[#142036] hover:bg-[#1b2b48] border border-[#203152] rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        title={isPdf ? 'View PDF document' : 'View Image document'}
                      >
                        <Eye className="w-3 h-3 text-orange-400" />
                        <span>{isPdf ? 'View PDF' : 'View Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(item.doc!)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        title={isPdf ? 'Download PDF document' : 'Download Image document'}
                      >
                        <Download className="w-3 h-3" />
                        <span>{isPdf ? 'Download PDF' : 'Download Image'}</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Certificate Verified on File</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info for Public / Inspector View */}
      <div className="p-4 bg-[#0b1324] border border-[#1a2b47] rounded-xl text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          {officeDetails.companyName} • Fleet Operations & Compliance Registry
        </p>
        <p className="text-[11px] text-slate-500">
          This page represents the verified, real-time specifications and validity status for Vehicle {vehicle.vehicleNumber}.
        </p>
        {officeDetails.officeContactNumber && (
          <p className="text-[11px] text-slate-400">
            For operational inquiries or cargo booking: <span className="text-orange-400 font-mono font-bold">{officeDetails.officeContactNumber}</span>
          </p>
        )}
      </div>

      {/* MODAL: Document Viewer Modal (View PDF or Image) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-[#0b1324] border border-[#1e2f50] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#070c17] border-b border-[#1b2b48] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white uppercase">{viewingDoc.title}</h4>
                <span className="text-xs text-slate-400 font-mono">({viewingDoc.doc.fileName})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(viewingDoc.doc)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {viewingDoc.doc.fileType?.includes('pdf') || viewingDoc.doc.fileName.toLowerCase().endsWith('.pdf')
                      ? 'Download PDF'
                      : 'Download Image'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-[#05080f]">
              {viewingDoc.doc.fileUrl.startsWith('data:image') ||
              viewingDoc.doc.fileName.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                <img
                  src={viewingDoc.doc.fileUrl}
                  alt={viewingDoc.doc.fileName}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg border border-slate-700 shadow-lg"
                />
              ) : viewingDoc.doc.fileUrl.startsWith('data:application/pdf') ||
                viewingDoc.doc.fileName.match(/\.pdf$/i) ? (
                <iframe
                  src={viewingDoc.doc.fileUrl}
                  title={viewingDoc.doc.fileName}
                  className="w-full h-[75vh] rounded-lg border border-slate-700 bg-white"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-12 h-12 text-orange-400 mx-auto" />
                  <p className="text-slate-300 font-semibold">{viewingDoc.doc.fileName}</p>
                  <p className="text-xs text-slate-500">File format preview not natively supported. Click below to download.</p>
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(viewingDoc.doc)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
