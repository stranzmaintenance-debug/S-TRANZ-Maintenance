import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Save,
  X,
  CheckCircle2,
  FileDown,
  Download,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ComplaintMaintenanceRecord } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { printHtmlDocument } from '../../utils/exportUtils';
import { exportComplaintsPdf } from '../../utils/pdfModuleHelpers';

export const VehicleComplaints: React.FC = () => {
  const { complaints, addComplaint, updateComplaint, deleteComplaint, vehicles, drivers, officeDetails } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Individual Complaint PDF Generation State
  const [pdfComplaint, setPdfComplaint] = useState<ComplaintMaintenanceRecord | null>(null);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);

  const [formData, setFormData] = useState<Omit<ComplaintMaintenanceRecord, 'id'>>({
    complaintDate: new Date().toISOString().split('T')[0],
    vehicleNumber: vehicles[0]?.vehicleNumber || '',
    driverName: drivers[0]?.driverName || '',
    complaintDetails: '',
    kilometersReading: 100000,
    workshopName: '',
    status: 'Open',
    repairPartsUsed: '',
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    billUpload: undefined,
    paymentMethod: 'UPI',
    paymentStatus: 'Unpaid',
    paidAmount: 0,
    balanceAmount: 0,
    completionDate: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      complaintDate: new Date().toISOString().split('T')[0],
      vehicleNumber: vehicles[0]?.vehicleNumber || '',
      driverName: drivers[0]?.driverName || '',
      complaintDetails: '',
      kilometersReading: 100000,
      workshopName: '',
      status: 'Open',
      repairPartsUsed: '',
      laborCost: 1500,
      partsCost: 4500,
      totalCost: 6000,
      billUpload: undefined,
      paymentMethod: 'UPI',
      paymentStatus: 'Unpaid',
      paidAmount: 0,
      balanceAmount: 6000,
      completionDate: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: ComplaintMaintenanceRecord) => {
    setEditingId(c.id);
    setFormData({
      complaintDate: c.complaintDate,
      vehicleNumber: c.vehicleNumber,
      driverName: c.driverName,
      complaintDetails: c.complaintDetails,
      kilometersReading: c.kilometersReading,
      workshopName: c.workshopName,
      status: c.status,
      repairPartsUsed: c.repairPartsUsed,
      laborCost: c.laborCost,
      partsCost: c.partsCost,
      totalCost: c.totalCost,
      billUpload: c.billUpload,
      paymentMethod: c.paymentMethod,
      paymentStatus: c.paymentStatus,
      paidAmount: c.paidAmount,
      balanceAmount: c.balanceAmount,
      completionDate: c.completionDate || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.complaintDetails) {
      alert('Vehicle Number and Complaint Details are mandatory.');
      return;
    }
    const total = (Number(formData.partsCost) || 0) + (Number(formData.laborCost) || 0);
    const paid = Number(formData.paidAmount) || 0;
    const balance = Math.max(0, total - paid);
    let completionDate = formData.completionDate;
    if (formData.status === 'Completed' && !completionDate) {
      completionDate = new Date().toISOString().split('T')[0];
    }

    const payload = {
      ...formData,
      totalCost: total,
      paidAmount: paid,
      balanceAmount: balance,
      completionDate
    };

    if (editingId) {
      updateComplaint(editingId, payload);
    } else {
      addComplaint(payload);
    }
    setIsFormOpen(false);
  };

  const handleOpenComplaintPdf = (c: ComplaintMaintenanceRecord) => {
    setPdfComplaint(c);
    setIsPdfGenerated(false);
  };

  const [selectedComplaintIds, setSelectedComplaintIds] = useState<string[]>([]);

  const toggleSelectComplaint = (id: string) => {
    setSelectedComplaintIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllComplaints = () => {
    if (selectedComplaintIds.length === filteredComplaints.length && filteredComplaints.length > 0) {
      setSelectedComplaintIds([]);
    } else {
      setSelectedComplaintIds(filteredComplaints.map(c => c.id));
    }
  };

  const handleDownloadSelectedComplaintsPdf = async () => {
    const selected = filteredComplaints.filter(c => selectedComplaintIds.includes(c.id));
    if (selected.length === 0) return;
    await exportComplaintsPdf(selected, officeDetails);
  };

  const handleDownloadAllComplaintsPdf = async () => {
    if (filteredComplaints.length === 0) return;
    await exportComplaintsPdf(filteredComplaints, officeDetails);
  };

  const handleDownloadComplaintPdf = async (c: ComplaintMaintenanceRecord) => {
    await exportComplaintsPdf(c, officeDetails);
    setIsPdfGenerated(true);
    return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Complaint_${c.vehicleNumber}_${c.complaintDate}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; }
    .header { border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .company-name { font-size: 19px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .title-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #ea580c; color: white; padding: 4px 10px; font-size: 14px; font-weight: 900; border-radius: 4px; font-family: monospace; }
    .section-head { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; margin: 18px 0 10px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    table.data-table td { padding: 7px 10px; border: 1px solid #cbd5e1; }
    table.data-table td.label { background: #f1f5f9; font-weight: 700; width: 30%; color: #334155; }
    table.data-table td.val { font-weight: 600; color: #0f172a; }
    .cost-box { background: #f8fafc; border: 1.5px solid #ea580c; border-radius: 6px; padding: 12px 14px; margin-top: 14px; }
    .sig-area { margin-top: 45px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 170px; border-top: 1px solid #475569; text-align: center; padding-top: 5px; font-size: 10px; font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
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
      Vehicle Maintenance Register<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div>
      <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Vehicle Maintenance & Repair Complaint Voucher</span>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Vehicle: ${c.vehicleNumber}
      </div>
    </div>
    <div>
      <span class="badge">${c.vehicleNumber}</span>
    </div>
  </div>

  <div class="section-head">Complaint & Vehicle Identification</div>
  <table class="data-table">
    <tr>
      <td class="label">Complaint Date</td>
      <td class="val font-mono"><strong>${c.complaintDate}</strong></td>
      <td class="label">Vehicle Registration No</td>
      <td class="val font-mono"><strong>${c.vehicleNumber}</strong></td>
    </tr>
    <tr>
      <td class="label">Driver Name</td>
      <td class="val">${c.driverName}</td>
      <td class="label">Odometer Reading</td>
      <td class="val font-mono">${c.kilometersReading.toLocaleString('en-IN')} KM</td>
    </tr>
    <tr>
      <td class="label">Service Workshop</td>
      <td class="val" colspan="3">${c.workshopName || 'Internal Depot Workshop'}</td>
    </tr>
    <tr>
      <td class="label">Complaint Description</td>
      <td class="val" colspan="3" style="font-weight: 500; color: #1e293b;">${c.complaintDetails}</td>
    </tr>
    <tr>
      <td class="label">Repair Work & Parts Used</td>
      <td class="val" colspan="3" style="font-weight: 500; color: #1e293b;">${c.repairPartsUsed || 'General Maintenance / Service Overhaul'}</td>
    </tr>
  </table>

  <div class="section-head">Expenditure & Settlement Summary</div>
  <div class="cost-box">
    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <tr>
        <td style="padding: 4px; color: #475569;">Parts Cost:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; font-family: monospace;">₹${c.partsCost.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 4px; color: #475569;">Labor & Service Charges:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; font-family: monospace;">₹${c.laborCost.toLocaleString('en-IN')}</td>
      </tr>
      <tr style="border-top: 1.5px solid #cbd5e1;">
        <td style="padding: 6px 4px; font-weight: 900; font-size: 13px; color: #0f172a;">Total Job Cost:</td>
        <td style="padding: 6px 4px; text-align: right; font-weight: 900; font-size: 14px; color: #ea580c; font-family: monospace;">₹${c.totalCost.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 4px; color: #475569;">Payment Method & Status:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; color: #0f172a;">${c.paymentMethod} (${c.paymentStatus})</td>
      </tr>
      <tr>
        <td style="padding: 4px; color: #475569;">Paid Amount:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; color: #15803d; font-family: monospace;">₹${c.paidAmount.toLocaleString('en-IN')}</td>
      </tr>
      ${c.balanceAmount > 0 ? `
      <tr>
        <td style="padding: 4px; color: #dc2626; font-weight: bold;">Outstanding Balance:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; color: #dc2626; font-family: monospace;">₹${c.balanceAmount.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 4px; color: #475569;">Work Status:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold; color: #0f172a;">${c.status}${c.completionDate ? ` (Completed: ${c.completionDate})` : ''}</td>
      </tr>
    </table>
  </div>

  <div class="sig-area">
    <div class="sig-line">Driver Signature</div>
    <div class="sig-line">Workshop In-Charge</div>
    <div class="sig-line">Fleet Manager Approval</div>
  </div>

  <div class="footer">
    ${officeDetails.companyName} • Confidential Maintenance Voucher • Complaint Date: ${c.complaintDate}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Complaint_${c.vehicleNumber}_${c.complaintDate}`, html);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.vehicleNumber.toLowerCase().includes(q) ||
      c.driverName.toLowerCase().includes(q) ||
      c.complaintDetails.toLowerCase().includes(q) ||
      c.workshopName.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesPayment = filterPayment === 'All' || c.paymentStatus === filterPayment;

    let matchesDate = true;
    if (dateFrom && c.complaintDate < dateFrom) matchesDate = false;
    if (dateTo && c.complaintDate > dateTo) matchesDate = false;

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const reportHeaders = [
    'Date',
    'Vehicle No',
    'Driver Name',
    'Complaint Details',
    'Workshop Name',
    'Parts Cost',
    'Labor Cost',
    'Total Cost',
    'Status',
    'Payment Method',
    'Payment Status',
    'Balance Amount'
  ];

  const reportRows = filteredComplaints.map(c => [
    c.complaintDate,
    c.vehicleNumber,
    c.driverName,
    c.complaintDetails,
    c.workshopName,
    `₹${c.partsCost.toLocaleString('en-IN')}`,
    `₹${c.laborCost.toLocaleString('en-IN')}`,
    `₹${c.totalCost.toLocaleString('en-IN')}`,
    c.status,
    c.paymentMethod,
    c.paymentStatus,
    `₹${c.balanceAmount.toLocaleString('en-IN')}`
  ]);

  const totalCostSum = filteredComplaints.reduce((sum, c) => sum + c.totalCost, 0);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-400" />
            <span>Vehicle Complaint & Maintenance Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log driver repair issues, workshop estimates, bill attachments, and payments. Completed & Paid jobs automatically link to Maintenance Expenses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Complaint</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Vehicle Complaint & Maintenance Register Report"
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
          { label: 'Total Complaints', value: filteredComplaints.length },
          { label: 'Total Repair Expenditure', value: `₹${totalCostSum.toLocaleString('en-IN')}` }
        ]}
        selectedCount={selectedComplaintIds.length}
        onDownloadSelectedPdf={handleDownloadSelectedComplaintsPdf}
        onDownloadAllPdf={handleDownloadAllComplaintsPdf}
      />

      {/* Search & Filters */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Vehicle, Driver, Complaint, Workshop..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <span>Payment:</span>
          </div>
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedComplaintIds.length === filteredComplaints.length && filteredComplaints.length > 0}
                    onChange={toggleSelectAllComplaints}
                    className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                    title="Select All Complaints for Combined PDF"
                  />
                </th>
                <th className="py-3 px-3">Date & Vehicle</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Complaint Description</th>
                <th className="py-3 px-3">Workshop</th>
                <th className="py-3 px-3 font-mono">Cost (Parts + Labor)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-center">PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No complaint or maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(item => {
                  const isEligibleForExpense = item.status === 'Completed' && item.paymentStatus === 'Paid';
                  return (
                    <tr key={item.id} className="hover:bg-[#0f192e] transition-colors">
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedComplaintIds.includes(item.id)}
                          onChange={() => toggleSelectComplaint(item.id)}
                          className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                          title={`Select Complaint ${item.vehicleNumber} for combined PDF`}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-orange-400">{item.vehicleNumber}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.complaintDate}</div>
                        <div className="text-[10px] text-slate-400 font-mono">KM: {item.kilometersReading}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {item.driverName}
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="text-slate-200 font-medium truncate" title={item.complaintDetails}>
                          {item.complaintDetails}
                        </div>
                        {item.repairPartsUsed && (
                          <div className="text-[10px] text-slate-400 truncate" title={item.repairPartsUsed}>
                            Parts: {item.repairPartsUsed}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] truncate max-w-[150px]">
                        {item.workshopName || 'Internal Depot'}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-100">₹{item.totalCost.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-500">
                          P: ₹{item.partsCost} | L: ₹{item.laborCost}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Completed'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : item.status === 'In-Progress'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {item.status}
                        </span>
                        {isEligibleForExpense && (
                          <div className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Auto-synced to Expense
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.paymentStatus === 'Paid'
                                ? 'bg-emerald-900/50 text-emerald-300'
                                : item.paymentStatus === 'Partial'
                                ? 'bg-amber-900/50 text-amber-300'
                                : 'bg-red-900/50 text-red-300'
                            }`}
                          >
                            {item.paymentStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({item.paymentMethod})</span>
                        </div>
                        {item.balanceAmount > 0 && (
                          <div className="text-[10px] text-red-400 font-mono">
                            Bal: ₹{item.balanceAmount}
                          </div>
                        )}
                      </td>
                      {/* Individual Complaint PDF button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenComplaintPdf(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                          title={`Generate & Download PDF for Complaint (${item.vehicleNumber})`}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ActionButtons
                          onEdit={() => handleOpenEdit(item)}
                          onDelete={() => deleteComplaint(item.id)}
                          itemName={`Complaint for ${item.vehicleNumber}`}
                          compact={true}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL COMPLAINT PDF GENERATION MODAL */}
      {pdfComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Complaint PDF: {pdfComplaint.vehicleNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfComplaint(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#16233a] space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-[#142036]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vehicle Registration</span>
                    <h4 className="text-base font-black text-orange-400 font-mono">{pdfComplaint.vehicleNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Complaint Date</span>
                    <strong className="text-slate-200 font-mono">{pdfComplaint.complaintDate}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Name:</span>
                    <span className="text-slate-200 font-semibold">{pdfComplaint.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Odometer:</span>
                    <span className="text-slate-200 font-mono">{pdfComplaint.kilometersReading.toLocaleString('en-IN')} KM</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Complaint Details:</span>
                    <span className="text-slate-100">{pdfComplaint.complaintDetails}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Repair / Parts:</span>
                    <span className="text-slate-300">{pdfComplaint.repairPartsUsed || 'General Maintenance'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Workshop:</span>
                    <span className="text-slate-300">{pdfComplaint.workshopName || 'Internal Depot'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Cost:</span>
                    <span className="text-orange-400 font-bold font-mono text-sm">₹{pdfComplaint.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1324] rounded border border-[#1b2b48] text-[11px] text-slate-400">
                  <p>
                    System will generate a dedicated single-complaint PDF containing only <strong>{pdfComplaint.vehicleNumber}</strong> complaint details.
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Filename: Complaint_{pdfComplaint.vehicleNumber}_{pdfComplaint.complaintDate}.pdf
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
                    onClick={() => handleDownloadComplaintPdf(pdfComplaint)}
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

      {/* ADD / EDIT COMPLAINT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingId ? 'Edit Vehicle Complaint' : 'Register Vehicle Complaint & Maintenance'}
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
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Complaint Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.complaintDate}
                    onChange={e => setFormData({ ...formData, complaintDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Number *</label>
                  <select
                    value={formData.vehicleNumber}
                    onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.make})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Name *</label>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Odometer KM Reading</label>
                  <input
                    type="number"
                    value={formData.kilometersReading}
                    onChange={e => setFormData({ ...formData, kilometersReading: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Complaint Details *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.complaintDetails}
                    onChange={e => setFormData({ ...formData, complaintDetails: e.target.value })}
                    placeholder="Describe breakdown, fault, leaks, abnormal noises, etc."
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Workshop / Service Provider</label>
                  <input
                    type="text"
                    value={formData.workshopName}
                    onChange={e => setFormData({ ...formData, workshopName: e.target.value })}
                    placeholder="e.g. Shree Balaji Diesel & Pneumatic Works, Avinashi Rd"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repair Parts Used</label>
                  <input
                    type="text"
                    value={formData.repairPartsUsed}
                    onChange={e => setFormData({ ...formData, repairPartsUsed: e.target.value })}
                    placeholder="e.g. WABCO Quick Release Valve + Front Brake Shoe Set"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.partsCost}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        partsCost: p,
                        totalCost: p + formData.laborCost,
                        balanceAmount: p + formData.laborCost - formData.paidAmount
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Labor Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.laborCost}
                    onChange={e => {
                      const l = Number(e.target.value);
                      setFormData({
                        ...formData,
                        laborCost: l,
                        totalCost: formData.partsCost + l,
                        balanceAmount: formData.partsCost + l - formData.paidAmount
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Maintenance Cost (₹)</label>
                  <input
                    type="text"
                    readOnly
                    value={`₹${formData.partsCost + formData.laborCost}`}
                    className="w-full px-2.5 py-1.5 bg-[#080d19] border border-[#192742] rounded-lg text-xs font-mono font-bold text-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Complaint Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={e => {
                      const stat = e.target.value as any;
                      const tot = formData.partsCost + formData.laborCost;
                      const paid = stat === 'Paid' ? tot : stat === 'Unpaid' ? 0 : formData.paidAmount;
                      setFormData({
                        ...formData,
                        paymentStatus: stat,
                        paidAmount: paid,
                        balanceAmount: tot - paid
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={e => {
                      const p = Number(e.target.value);
                      const tot = formData.partsCost + formData.laborCost;
                      setFormData({
                        ...formData,
                        paidAmount: p,
                        balanceAmount: Math.max(0, tot - p)
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Balance Due (₹)</label>
                  <input
                    type="text"
                    readOnly
                    value={`₹${formData.partsCost + formData.laborCost - formData.paidAmount}`}
                    className="w-full px-2.5 py-1.5 bg-[#080d19] border border-[#192742] rounded-lg text-xs font-mono font-bold text-red-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <DocumentUploader
                    label="Workshop Bill / Invoice Upload (Photo or PDF)"
                    document={formData.billUpload}
                    onUpload={doc => setFormData({ ...formData, billUpload: doc })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Update Complaint' : 'Save Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
