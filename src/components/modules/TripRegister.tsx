import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Save,
  X,
  FileDown,
  Download,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TripRecord } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { printHtmlDocument } from '../../utils/exportUtils';
import { exportTripsPdf } from '../../utils/pdfModuleHelpers';

export const TripRegister: React.FC = () => {
  const { trips, addTrip, updateTrip, deleteTrip, vehicles, drivers, officeDetails } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Add / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  // Individual Trip PDF Modal State
  const [pdfTrip, setPdfTrip] = useState<TripRecord | null>(null);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);

  // Strictly only the 7 required fields:
  // 1. Trip Number, 2. Trip Date, 3. Vehicle Number, 4. Driver Name,
  // 5. Company / Customer Name, 6. Pickup Location, 7. Drop Location
  const [formData, setFormData] = useState<Omit<TripRecord, 'id'>>({
    tripNumber: '',
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: vehicles[0]?.vehicleNumber || '',
    driverName: drivers[0]?.driverName || '',
    customerName: '',
    pickupLocation: '',
    dropLocation: ''
  });

  const handleOpenAdd = () => {
    setEditingTripId(null);
    const newTripNum = `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      tripNumber: newTripNum,
      date: new Date().toISOString().split('T')[0],
      vehicleNumber: vehicles[0]?.vehicleNumber || '',
      driverName: drivers[0]?.driverName || '',
      customerName: '',
      pickupLocation: '',
      dropLocation: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: TripRecord) => {
    setEditingTripId(t.id);
    setFormData({
      tripNumber: t.tripNumber,
      date: t.date,
      vehicleNumber: t.vehicleNumber,
      driverName: t.driverName,
      customerName: t.customerName,
      pickupLocation: t.pickupLocation,
      dropLocation: t.dropLocation
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tripNumber || !formData.date || !formData.vehicleNumber || !formData.driverName || !formData.customerName || !formData.pickupLocation || !formData.dropLocation) {
      alert('All 7 trip fields are required.');
      return;
    }

    if (editingTripId) {
      updateTrip(editingTripId, formData);
    } else {
      addTrip(formData);
    }
    setIsFormOpen(false);
  };

  // Open PDF Modal for selected trip only
  const handleOpenTripPdf = (trip: TripRecord) => {
    setPdfTrip(trip);
    setIsPdfGenerated(false);
  };

  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);

  const toggleSelectTrip = (id: string) => {
    setSelectedTripIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTrips = () => {
    if (selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0) {
      setSelectedTripIds([]);
    } else {
      setSelectedTripIds(filteredTrips.map(t => t.id));
    }
  };

  const handleDownloadSelectedTripsPdf = async () => {
    const selected = filteredTrips.filter(t => selectedTripIds.includes(t.id));
    if (selected.length === 0) return;
    await exportTripsPdf(selected, officeDetails);
  };

  const handleDownloadAllTripsPdf = async () => {
    if (filteredTrips.length === 0) return;
    await exportTripsPdf(filteredTrips, officeDetails);
  };

  // Download PDF containing ONLY selected trip details
  const handleDownloadTripPdf = async (t: TripRecord) => {
    await exportTripsPdf(t, officeDetails);
    setIsPdfGenerated(true);
    return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Trip_${t.tripNumber}_Details</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; }
    .header { border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .company-name { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .title-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .trip-badge { background: #ea580c; color: #ffffff; padding: 5px 12px; font-size: 15px; font-weight: 900; border-radius: 4px; font-family: monospace; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11.5px; }
    .details-table td { padding: 9px 12px; border: 1px solid #cbd5e1; }
    .details-table td.label { background: #f1f5f9; font-weight: 800; width: 32%; color: #334155; }
    .details-table td.value { font-weight: 700; color: #0f172a; }
    .route-box { background: #f8fafc; border: 1.5px dashed #ea580c; border-radius: 8px; padding: 14px; margin-bottom: 24px; }
    .route-point { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 3px; shrink: 0; }
    .dot-green { background: #16a34a; }
    .dot-red { background: #dc2626; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 180px; border-top: 1px solid #475569; text-align: center; padding-top: 6px; font-size: 10px; font-weight: bold; }
    .footer { margin-top: 35px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-name">${officeDetails.companyName}</h1>
      <div style="font-size: 10.5px; color: #475569; margin-top: 3px;">
        ${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber} | GST: ${officeDetails.gstNumber}
      </div>
    </div>
    <div style="text-align: right; font-size: 10px; color: #64748b;">
      Official Trip Consignment Record<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div>
      <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Official Freight Manifest</span>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Single Trip Transportation Record
      </div>
    </div>
    <div>
      <span class="trip-badge">${t.tripNumber}</span>
    </div>
  </div>

  <table class="details-table">
    <tr>
      <td class="label">1. Trip Number</td>
      <td class="value font-mono"><strong style="color: #ea580c; font-size: 13px;">${t.tripNumber}</strong></td>
    </tr>
    <tr>
      <td class="label">2. Trip Date</td>
      <td class="value font-mono">${t.date}</td>
    </tr>
    <tr>
      <td class="label">3. Vehicle Number</td>
      <td class="value font-mono"><strong>${t.vehicleNumber}</strong></td>
    </tr>
    <tr>
      <td class="label">4. Driver Name</td>
      <td class="value">${t.driverName}</td>
    </tr>
    <tr>
      <td class="label">5. Company / Customer Name</td>
      <td class="value"><strong>${t.customerName}</strong></td>
    </tr>
  </table>

  <div class="route-box">
    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
      Transit Route Details
    </div>
    <div class="route-point">
      <div class="dot dot-green"></div>
      <div>
        <div style="font-size: 10px; color: #16a34a; font-weight: 800; text-transform: uppercase;">6. Pickup Location</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${t.pickupLocation}</div>
      </div>
    </div>
    <div style="border-left: 2px dashed #94a3b8; height: 18px; margin-left: 5px;"></div>
    <div class="route-point" style="margin-bottom: 0;">
      <div class="dot dot-red"></div>
      <div>
        <div style="font-size: 10px; color: #dc2626; font-weight: 800; text-transform: uppercase;">7. Drop Location</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${t.dropLocation}</div>
      </div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">Driver Signature</div>
    <div class="sig-line">Consignee Acknowledgment</div>
    <div class="sig-line">Authorized Dispatcher</div>
  </div>

  <div class="footer">
    ${officeDetails.companyName} • Confidential Official Transportation Record • Trip: ${t.tripNumber}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Trip_${t.tripNumber}_Details`, html);
  };

  // Filter trips
  const filteredTrips = trips.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.tripNumber.toLowerCase().includes(q) ||
      t.vehicleNumber.toLowerCase().includes(q) ||
      t.driverName.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.pickupLocation.toLowerCase().includes(q) ||
      t.dropLocation.toLowerCase().includes(q);

    let matchesDate = true;
    if (dateFrom && t.date < dateFrom) matchesDate = false;
    if (dateTo && t.date > dateTo) matchesDate = false;

    return matchesSearch && matchesDate;
  });

  const reportHeaders = [
    'Trip Number',
    'Trip Date',
    'Vehicle Number',
    'Driver Name',
    'Company / Customer Name',
    'Pickup Location',
    'Drop Location'
  ];

  const reportRows = filteredTrips.map(t => [
    t.tripNumber,
    t.date,
    t.vehicleNumber,
    t.driverName,
    t.customerName,
    t.pickupLocation,
    t.dropLocation
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-400" />
            <span>Trip Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trip records containing only essential fields (Trip Number, Trip Date, Vehicle Number, Driver Name, Customer Name, Pickup Location, Drop Location) with individual trip PDF downloads.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip Entry</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Trip Register Official Report"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onResetDates={() => {
          setDateFrom('');
          setDateTo('');
        }}
        headers={reportHeaders}
        rows={reportRows}
        totals={[
          { label: 'Total Trips Recorded', value: filteredTrips.length }
        ]}
        selectedCount={selectedTripIds.length}
        onDownloadSelectedPdf={handleDownloadSelectedTripsPdf}
        onDownloadAllPdf={handleDownloadAllTripsPdf}
      />

      {/* Search Bar */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Trip Number, Vehicle, Driver, Customer, Pickup or Drop Location..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTripIds.length === filteredTrips.length && filteredTrips.length > 0}
                    onChange={toggleSelectAllTrips}
                    className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                    title="Select All Trips for Combined PDF"
                  />
                </th>
                <th className="py-3 px-3">Trip Number</th>
                <th className="py-3 px-3">Trip Date</th>
                <th className="py-3 px-3">Vehicle Number</th>
                <th className="py-3 px-3">Driver Name</th>
                <th className="py-3 px-3">Company / Customer Name</th>
                <th className="py-3 px-3">Pickup Location</th>
                <th className="py-3 px-3">Drop Location</th>
                <th className="py-3 px-3 text-center">PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No trip records found.
                  </td>
                </tr>
              ) : (
                filteredTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTripIds.includes(trip.id)}
                        onChange={() => toggleSelectTrip(trip.id)}
                        className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                        title={`Select Trip ${trip.tripNumber} for combined PDF`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 whitespace-nowrap">
                      {trip.tripNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {trip.date}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-100 whitespace-nowrap">
                      {trip.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {trip.driverName}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {trip.customerName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {trip.pickupLocation}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {trip.dropLocation}
                    </td>
                    {/* Individual Trip PDF Button: Generate PDF -> Download PDF for this trip only */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenTripPdf(trip)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`Generate & Download PDF for Trip ${trip.tripNumber}`}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <ActionButtons
                        onEdit={() => handleOpenEdit(trip)}
                        onDelete={() => deleteTrip(trip.id)}
                        itemName={`Trip ${trip.tripNumber}`}
                        compact={true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL TRIP PDF GENERATION MODAL */}
      {pdfTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Trip PDF: {pdfTrip.tripNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfTrip(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#16233a] space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-[#142036]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Trip</span>
                    <h4 className="text-base font-black text-orange-400 font-mono">{pdfTrip.tripNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Trip Date</span>
                    <strong className="text-slate-200 font-mono">{pdfTrip.date}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehicle Number:</span>
                    <span className="text-slate-200 font-mono font-bold">{pdfTrip.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Name:</span>
                    <span className="text-slate-200 font-semibold">{pdfTrip.driverName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Company / Customer:</span>
                    <span className="text-slate-100 font-bold">{pdfTrip.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pickup Location:</span>
                    <span className="text-emerald-400 font-semibold">{pdfTrip.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Drop Location:</span>
                    <span className="text-red-400 font-semibold">{pdfTrip.dropLocation}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1324] rounded border border-[#1b2b48] text-[11px] text-slate-400">
                  <p>
                    PDF will be generated exclusively for <strong>{pdfTrip.tripNumber}</strong> using saved database records.
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Filename: Trip_{pdfTrip.tripNumber}_Details.pdf
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1a2b47] shrink-0">
              <span className="text-xs text-slate-400">
                {isPdfGenerated ? 'PDF ready for download' : 'Click Generate to prepare PDF'}
              </span>
              <div className="flex items-center gap-2">
                {!isPdfGenerated ? (
                  <button
                    type="button"
                    onClick={() => setIsPdfGenerated(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDownloadTripPdf(pdfTrip)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer animate-in fade-in duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF (Trip_{pdfTrip.tripNumber})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TRIP MODAL (Strictly 7 Fields only) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingTripId ? 'Edit Trip Record' : 'Create New Trip Record'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16233a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Trip Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">1. Trip Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.tripNumber}
                    onChange={e => setFormData({ ...formData, tripNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono font-bold text-orange-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 2. Trip Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">2. Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 3. Vehicle Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">3. Vehicle Number *</label>
                  <select
                    value={formData.vehicleNumber}
                    onChange={e => {
                      const selVeh = vehicles.find(v => v.vehicleNumber === e.target.value);
                      setFormData({
                        ...formData,
                        vehicleNumber: e.target.value,
                        driverName: selVeh?.assignedDriverName || formData.driverName
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.make})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Driver Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">4. Driver Name *</label>
                  <select
                    value={formData.driverName}
                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.driverName}>
                        {d.driverName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Company / Customer Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">5. Company / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Larsen & Toubro Logistics / Britannia Industries"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 6. Pickup Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">6. Pickup Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai Harbor Gate 2 / Sriperumbudur"
                    value={formData.pickupLocation}
                    onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 7. Drop Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">7. Drop Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore SIDCO / Bengaluru ICD"
                    value={formData.dropLocation}
                    onChange={e => setFormData({ ...formData, dropLocation: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a2a46] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-[#142036] hover:bg-[#1a2a46] text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Trip Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
