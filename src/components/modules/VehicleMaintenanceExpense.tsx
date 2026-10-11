import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  FileDown,
  Download,
  FileText,
  Truck,
  Wrench,
  Save,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ComplaintMaintenanceRecord } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { printHtmlDocument } from '../../utils/exportUtils';

export const VehicleMaintenanceExpense: React.FC = () => {
  const { complaints, updateComplaint, deleteComplaint, vehicles, officeDetails } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Vehicle-wise Records: maintain separately for each vehicle
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.vehicleNumber || 'All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<ComplaintMaintenanceRecord | null>(null);
  const [editPartsCost, setEditPartsCost] = useState(0);
  const [editLaborCost, setEditLaborCost] = useState(0);
  const [editDetails, setEditDetails] = useState('');
  const [editPartsUsed, setEditPartsUsed] = useState('');

  // 3. Individual Maintenance Record PDF State
  const [pdfRecord, setPdfRecord] = useState<ComplaintMaintenanceRecord | null>(null);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);

  // Automatic filter: ONLY completed maintenance with Paid payment status
  const completedMaintenanceExpenses = complaints.filter(
    c => c.status === 'Completed' && c.paymentStatus === 'Paid'
  );

  // Vehicle-wise records: filter by selected vehicle (no mixing between vehicles)
  const filteredList = completedMaintenanceExpenses.filter(item => {
    // Separate by vehicle
    if (selectedVehicle && selectedVehicle !== 'All' && item.vehicleNumber !== selectedVehicle) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.vehicleNumber.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      item.complaintDetails.toLowerCase().includes(q) ||
      item.repairPartsUsed.toLowerCase().includes(q) ||
      item.workshopName.toLowerCase().includes(q);

    let matchesDate = true;
    const effectiveDate = item.completionDate || item.complaintDate;
    if (dateFrom && effectiveDate < dateFrom) matchesDate = false;
    if (dateTo && effectiveDate > dateTo) matchesDate = false;

    return matchesSearch && matchesDate;
  });

  const totalMaintenanceExpenditure = filteredList.reduce((sum, c) => sum + c.totalCost, 0);

  const handleOpenEdit = (rec: ComplaintMaintenanceRecord) => {
    setEditingRecord(rec);
    setEditPartsCost(rec.partsCost);
    setEditLaborCost(rec.laborCost);
    setEditDetails(rec.complaintDetails);
    setEditPartsUsed(rec.repairPartsUsed);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const newTotal = (Number(editPartsCost) || 0) + (Number(editLaborCost) || 0);

    const updated = {
      ...editingRecord,
      partsCost: editPartsCost,
      laborCost: editLaborCost,
      totalCost: newTotal,
      paidAmount: newTotal, // Remains fully paid
      balanceAmount: 0,
      complaintDetails: editDetails,
      repairPartsUsed: editPartsUsed
    };

    updateComplaint(editingRecord.id, {
      partsCost: editPartsCost,
      laborCost: editLaborCost,
      totalCost: newTotal,
      paidAmount: newTotal,
      balanceAmount: 0,
      complaintDetails: editDetails,
      repairPartsUsed: editPartsUsed
    });

    setEditingRecord(null);
    // After updating, allow generating PDF for this updated record
    setPdfRecord(updated);
    setIsPdfGenerated(false);
  };

  // Open PDF Modal for selected vehicle record
  const handleOpenRecordPdf = (rec: ComplaintMaintenanceRecord) => {
    setPdfRecord(rec);
    setIsPdfGenerated(false);
  };

  // 3. Generate & Download PDF containing ONLY selected vehicle and record's saved information
  const handleDownloadRecordPdf = (rec: ComplaintMaintenanceRecord) => {
    const recDate = rec.completionDate || rec.complaintDate;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance_${rec.vehicleNumber}_${recDate}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; }
    .header { border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .company-name { font-size: 19px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .title-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #ea580c; color: white; padding: 4px 10px; font-size: 14px; font-weight: 900; border-radius: 4px; font-family: monospace; }
    .section-head { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; margin: 18px 0 10px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    table.data-table td { padding: 8px 10px; border: 1px solid #cbd5e1; }
    table.data-table td.label { background: #f1f5f9; font-weight: 700; width: 32%; color: #334155; }
    table.data-table td.val { font-weight: 600; color: #0f172a; }
    .expense-box { background: #f8fafc; border: 2px solid #ea580c; border-radius: 6px; padding: 14px; margin-top: 18px; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 180px; border-top: 1px solid #475569; text-align: center; padding-top: 6px; font-size: 10px; font-weight: bold; }
    .footer { margin-top: 35px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-name">${officeDetails.companyName}</h1>
      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
        ${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber} | GST: ${officeDetails.gstNumber}
      </div>
    </div>
    <div style="text-align: right; font-size: 10px; color: #64748b;">
      Vehicle Maintenance Expense Voucher<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div>
      <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">
        Individual Vehicle Maintenance Expense Record
      </span>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Vehicle: ${rec.vehicleNumber}
      </div>
    </div>
    <div>
      <span class="badge">${rec.vehicleNumber}</span>
    </div>
  </div>

  <div class="section-head">Vehicle & Repair Service Record</div>
  <table class="data-table">
    <tr>
      <td class="label">Vehicle Registration No</td>
      <td class="val font-mono"><strong>${rec.vehicleNumber}</strong></td>
      <td class="label">Completion Date</td>
      <td class="val font-mono"><strong>${recDate}</strong></td>
    </tr>
    <tr>
      <td class="label">Assigned Driver</td>
      <td class="val">${rec.driverName}</td>
      <td class="label">Odometer Reading</td>
      <td class="val font-mono">${rec.kilometersReading.toLocaleString('en-IN')} KM</td>
    </tr>
    <tr>
      <td class="label">Repair Workshop / Depot</td>
      <td class="val" colspan="3">${rec.workshopName || 'Internal Fleet Depot'}</td>
    </tr>
    <tr>
      <td class="label">Maintenance Complaint</td>
      <td class="val" colspan="3" style="font-weight: 500; color: #1e293b;">${rec.complaintDetails}</td>
    </tr>
    <tr>
      <td class="label">Work Completed & Parts Used</td>
      <td class="val" colspan="3" style="font-weight: 500; color: #1e293b;">${rec.repairPartsUsed || 'General Overhaul and Lubrication'}</td>
    </tr>
  </table>

  <div class="section-head">Cost Breakdown & Settlement</div>
  <table class="data-table">
    <tr>
      <td class="label">Spare Parts Cost</td>
      <td class="val font-mono">₹${rec.partsCost.toLocaleString('en-IN')}</td>
      <td class="label">Labor & Servicing Charges</td>
      <td class="val font-mono">₹${rec.laborCost.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td class="label">Work Status</td>
      <td class="val"><strong style="color: #15803d;">Completed</strong></td>
      <td class="label">Payment Status</td>
      <td class="val"><strong style="color: #15803d;">Paid in Full (${rec.paymentMethod})</strong></td>
    </tr>
  </table>

  <div class="expense-box">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">
          Total Vehicle Maintenance Expense
        </div>
        <div style="font-size: 10px; color: #475569; margin-top: 2px;">
          Parts: ₹${rec.partsCost.toLocaleString('en-IN')} + Labor: ₹${rec.laborCost.toLocaleString('en-IN')}
        </div>
      </div>
      <div style="font-size: 22px; font-weight: 900; color: #ea580c; font-family: monospace;">
        ₹${rec.totalCost.toLocaleString('en-IN')}
      </div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">Driver Acknowledgment</div>
    <div class="sig-line">Workshop Engineer</div>
    <div class="sig-line">Fleet Manager Approval</div>
  </div>

  <div class="footer">
    ${officeDetails.companyName} • Confidential Vehicle Maintenance Voucher • Record ID: ${rec.id}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Maintenance_${rec.vehicleNumber}_${recDate}`, html);
  };

  const reportHeaders = [
    'Completion Date',
    'Vehicle Number',
    'Driver Name',
    'Complaint Details',
    'Repair Work & Parts',
    'Parts Cost (₹)',
    'Labor Cost (₹)',
    'Total Maintenance Expense (₹)',
    'Work Status',
    'Payment Status'
  ];

  const reportRows = filteredList.map(item => [
    item.completionDate || item.complaintDate,
    item.vehicleNumber,
    item.driverName,
    item.complaintDetails,
    item.repairPartsUsed || 'General Repair',
    `₹${item.partsCost.toLocaleString('en-IN')}`,
    `₹${item.laborCost.toLocaleString('en-IN')}`,
    `₹${item.totalCost.toLocaleString('en-IN')}`,
    item.status,
    item.paymentStatus
  ]);

  return (
    <div className="space-y-5">
      {/* 1. Correct Module Heading: “Vehicle Maintenance Expense” */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-orange-400" />
            <span>Vehicle Maintenance Expense</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vehicle-wise maintenance expense tracking and individual record PDF generation. Synced automatically once work is completed and paid.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Vehicle-Wise Record Management</span>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle={`Vehicle Maintenance Expense Official Report (${selectedVehicle || 'All Trucks'})`}
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
          { label: 'Completed Jobs', value: filteredList.length },
          { label: 'Total Maintenance Expense', value: `₹${totalMaintenanceExpenditure.toLocaleString('en-IN')}` }
        ]}
      />

      {/* 2. Vehicle-wise Records Filter & Search Bar */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <Truck className="w-3.5 h-3.5 text-orange-400" />
            <span>Select Vehicle:</span>
          </div>
          <select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs font-mono font-bold text-orange-400 rounded-lg px-3 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Vehicles (Fleet-wide)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.vehicleNumber}>
                {v.vehicleNumber} ({v.make})
              </option>
            ))}
          </select>

          {selectedVehicle !== 'All' && (
            <span className="text-[11px] text-slate-400 font-medium">
              Showing records exclusively for <strong>{selectedVehicle}</strong>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-[200px] max-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by driver, parts, details..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Maintenance Expense Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vehicle Number</th>
                <th className="py-3 px-3">Driver Name</th>
                <th className="py-3 px-3">Complaint Details</th>
                <th className="py-3 px-3">Repair Work Details</th>
                <th className="py-3 px-3 font-mono">Parts Cost</th>
                <th className="py-3 px-3 font-mono">Labor Cost</th>
                <th className="py-3 px-3 font-mono text-orange-400 font-bold">Total Maintenance</th>
                <th className="py-3 px-3">Status</th>
                {/* 3. PDF Generation button for each record */}
                <th className="py-3 px-3 text-center">PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No maintenance expense records found for {selectedVehicle !== 'All' ? selectedVehicle : 'this selection'}.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {item.completionDate || item.complaintDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 whitespace-nowrap">
                      {item.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {item.driverName}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate" title={item.complaintDetails}>
                      {item.complaintDetails}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate text-slate-400" title={item.repairPartsUsed}>
                      {item.repairPartsUsed || 'General Overhaul'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      ₹{item.partsCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      ₹{item.laborCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 text-sm">
                      ₹{item.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        Paid ({item.paymentMethod})
                      </span>
                    </td>
                    {/* 3. Generate PDF button for each vehicle and individual record */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenRecordPdf(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`Generate & Download PDF for ${item.vehicleNumber} maintenance record`}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => deleteComplaint(item.id)}
                        itemName={`Maintenance expense for ${item.vehicleNumber}`}
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

      {/* 3. INDIVIDUAL MAINTENANCE EXPENSE PDF GENERATION MODAL */}
      {pdfRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Maintenance Expense PDF: {pdfRecord.vehicleNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#16233a] space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-[#142036]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Vehicle</span>
                    <h4 className="text-base font-black text-orange-400 font-mono">{pdfRecord.vehicleNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Service Date</span>
                    <strong className="text-slate-200 font-mono">{pdfRecord.completionDate || pdfRecord.complaintDate}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Name:</span>
                    <span className="text-slate-200 font-semibold">{pdfRecord.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Odometer:</span>
                    <span className="text-slate-200 font-mono">{pdfRecord.kilometersReading.toLocaleString('en-IN')} KM</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Complaint / Problem:</span>
                    <span className="text-slate-100">{pdfRecord.complaintDetails}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Repair / Parts:</span>
                    <span className="text-slate-300">{pdfRecord.repairPartsUsed || 'General Overhaul'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Workshop:</span>
                    <span className="text-slate-300">{pdfRecord.workshopName || 'Internal Fleet Depot'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Expense:</span>
                    <span className="text-orange-400 font-bold font-mono text-sm">₹{pdfRecord.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1324] rounded border border-[#1b2b48] text-[11px] text-slate-400">
                  <p>
                    Generates a PDF containing <strong>only {pdfRecord.vehicleNumber}</strong> maintenance expense information.
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Filename: Maintenance_{pdfRecord.vehicleNumber}_{pdfRecord.completionDate || pdfRecord.complaintDate}.pdf
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
                    onClick={() => handleDownloadRecordPdf(pdfRecord)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer animate-in fade-in duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MAINTENANCE EXPENSE MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Edit Maintenance Details ({editingRecord.vehicleNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16233a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3.5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Complaint Description</label>
                <textarea
                  rows={2}
                  value={editDetails}
                  onChange={e => setEditDetails(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Repair Work & Parts Used</label>
                <input
                  type="text"
                  value={editPartsUsed}
                  onChange={e => setEditPartsUsed(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    value={editPartsCost}
                    onChange={e => setEditPartsCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Labor Cost (₹)</label>
                  <input
                    type="number"
                    value={editLaborCost}
                    onChange={e => setEditLaborCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#070c17] rounded-lg border border-[#16233a] flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Updated Expense:</span>
                <span className="text-base font-mono font-black text-orange-400">
                  ₹{(Number(editPartsCost) + Number(editLaborCost)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2a46] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-[#142036] hover:bg-[#1a2a46] text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
