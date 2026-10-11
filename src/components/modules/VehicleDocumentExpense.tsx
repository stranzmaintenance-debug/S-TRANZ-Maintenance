import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Save,
  X,
  Receipt,
  Download,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VehicleDocumentExpenseRecord, VehicleDocumentType } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { printHtmlDocument, renderPdfHeader } from '../../utils/exportUtils';

export const VehicleDocumentExpense: React.FC = () => {
  const {
    vehicles,
    vehicleDocExpenses,
    addVehicleDocExpense,
    updateVehicleDocExpense,
    deleteVehicleDocExpense,
    officeDetails
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterVehicle, setFilterVehicle] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // PDF Modal State for Registered Vehicle Document
  const [registeredDocForPdf, setRegisteredDocForPdf] = useState<VehicleDocumentExpenseRecord | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<VehicleDocumentExpenseRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: vehicles[0]?.vehicleNumber || '',
    amount: 5000,
    documentType: 'FC',
    otherDocumentName: '',
    fineAmount: 0,
    paymentMethod: 'UPI',
    paymentBillAmount: 5000,
    paymentBillUpload: undefined,
    documentUpload: undefined
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vehicleNumber: vehicles[0]?.vehicleNumber || '',
      amount: 4500,
      documentType: 'FC',
      otherDocumentName: '',
      fineAmount: 0,
      paymentMethod: 'UPI',
      paymentBillAmount: 4500,
      paymentBillUpload: undefined,
      documentUpload: undefined
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: VehicleDocumentExpenseRecord) => {
    setEditingId(rec.id);
    setFormData({
      date: rec.date,
      vehicleNumber: rec.vehicleNumber,
      amount: rec.amount,
      documentType: rec.documentType,
      otherDocumentName: rec.otherDocumentName || '',
      fineAmount: rec.fineAmount || 0,
      paymentMethod: rec.paymentMethod,
      paymentBillAmount: rec.paymentBillAmount,
      paymentBillUpload: rec.paymentBillUpload,
      documentUpload: rec.documentUpload
    });
    setIsFormOpen(true);
  };

  // Generate & Download PDF containing ONLY this particular vehicle document registration
  const handleDownloadDocPdf = (rec: VehicleDocumentExpenseRecord) => {
    const docTitle =
      rec.documentType === 'Other Document Expense'
        ? rec.otherDocumentName || 'Other Document Expense'
        : rec.documentType;

    const totalPayable = rec.amount + (rec.fineAmount || 0);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Vehicle_Doc_${rec.vehicleNumber}_${rec.documentType.replace(/\\s+/g, '_')}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; line-height: 1.4; }
    .title-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #ea580c; color: #ffffff; padding: 5px 12px; font-size: 14px; font-weight: 900; border-radius: 4px; font-family: monospace; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px; }
    .details-table td { padding: 9px 12px; border: 1px solid #cbd5e1; }
    .details-table td.label { background: #f1f5f9; font-weight: 800; width: 32%; color: #334155; }
    .details-table td.value { font-weight: 700; color: #0f172a; }
    .total-box { background: #0f172a; color: #ffffff; border-radius: 6px; padding: 14px 18px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 180px; border-top: 1px solid #475569; text-align: center; padding-top: 6px; font-size: 10px; font-weight: bold; }
    .footer { margin-top: 35px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  </style>
</head>
<body>
  ${renderPdfHeader(officeDetails, 'Vehicle Document Expense Certificate')}

  <div class="title-box">
    <div>
      <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Vehicle Document Registration Record</span>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Vehicle: ${rec.vehicleNumber} (${docTitle})
      </div>
    </div>
    <div class="badge">
      ${rec.vehicleNumber}
    </div>
  </div>

  <table class="details-table">
    <tr>
      <td class="label">Registration Date</td>
      <td class="value font-mono">${rec.date}</td>
      <td class="label">Vehicle Registration No</td>
      <td class="value font-mono" style="color: #ea580c; font-weight: 900;">${rec.vehicleNumber}</td>
    </tr>
    <tr>
      <td class="label">Document Category</td>
      <td class="value"><strong>${rec.documentType}</strong></td>
      <td class="label">Document Name / Specifics</td>
      <td class="value">${docTitle}</td>
    </tr>
    <tr>
      <td class="label">Document Fee / Premium</td>
      <td class="value font-mono">₹${rec.amount.toLocaleString('en-IN')}</td>
      <td class="label">Penalty / Fine Amount</td>
      <td class="value font-mono">${rec.fineAmount ? `₹${rec.fineAmount.toLocaleString('en-IN')}` : '₹0 (Nil)'}</td>
    </tr>
    <tr>
      <td class="label">Payment Mode</td>
      <td class="value">${rec.paymentMethod}</td>
      <td class="label">Paid Bill Amount</td>
      <td class="value font-mono">₹${rec.paymentBillAmount.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td class="label">Payment Receipt / Bill File</td>
      <td class="value font-mono">${rec.paymentBillUpload ? rec.paymentBillUpload.fileName : 'Physical Voucher on File'}</td>
      <td class="label">Registered Document Attachment</td>
      <td class="value font-mono">${rec.documentUpload ? rec.documentUpload.fileName : 'Physical Document in Office'}</td>
    </tr>
  </table>

  <div class="total-box">
    <div>
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #fdba74;">
        Total Document Expense Settled
      </div>
      <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
        Fee: ₹${rec.amount.toLocaleString('en-IN')} + Fine: ₹${(rec.fineAmount || 0).toLocaleString('en-IN')}
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 900; color: #ffffff; font-family: monospace;">
      ₹${totalPayable.toLocaleString('en-IN')}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">Prepared & Verified By<br/>(Fleet Administrator)</div>
    <div class="sig-line">Accounts Department<br/>(Payment Disbursed)</div>
    <div class="sig-line">Authorized Signatory<br/>(${officeDetails.companyName})</div>
  </div>

  <div class="footer">
    Official Vehicle Document Record of ${officeDetails.companyName} | System Record: DOC-${rec.vehicleNumber}-${rec.date}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Vehicle_Doc_${rec.vehicleNumber}_${rec.documentType.replace(/\\s+/g, '_')}`, html);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.amount) {
      alert('Vehicle Number and Amount are required.');
      return;
    }

    let savedRecord: VehicleDocumentExpenseRecord;
    if (editingId) {
      updateVehicleDocExpense(editingId, formData);
      savedRecord = { ...formData, id: editingId };
    } else {
      savedRecord = { ...formData, id: `DOC-${Date.now()}` };
      addVehicleDocExpense(formData);
    }

    // Step 2 & 3: After saving successfully, close form and automatically open PDF modal with clear Download PDF button
    setIsFormOpen(false);
    setRegisteredDocForPdf(savedRecord);
    setIsPdfModalOpen(true);
  };

  // Filter records
  const filteredList = vehicleDocExpenses.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.vehicleNumber.toLowerCase().includes(q) ||
      item.documentType.toLowerCase().includes(q) ||
      (item.otherDocumentName && item.otherDocumentName.toLowerCase().includes(q));

    const matchesType = filterType === 'All' || item.documentType === filterType;
    const matchesVeh = filterVehicle === 'All' || item.vehicleNumber === filterVehicle;

    let matchesDate = true;
    if (dateFrom && item.date < dateFrom) matchesDate = false;
    if (dateTo && item.date > dateTo) matchesDate = false;

    return matchesSearch && matchesType && matchesVeh && matchesDate;
  });

  const totalDocExpense = filteredList.reduce((sum, item) => sum + item.amount, 0);
  const totalFineAmount = filteredList.reduce((sum, item) => sum + (item.fineAmount || 0), 0);
  const grandTotal = totalDocExpense + totalFineAmount;

  const reportHeaders = [
    'Date',
    'Vehicle Number',
    'Document Type',
    'Doc Fee (₹)',
    'Fine Amount (₹)',
    'Total Payable (₹)',
    'Payment Method',
    'Payment Bill',
    'Actual Document'
  ];

  const reportRows = filteredList.map(item => [
    item.date,
    item.vehicleNumber,
    item.documentType === 'Other Document Expense' ? `Other (${item.otherDocumentName || ''})` : item.documentType,
    `₹${item.amount.toLocaleString('en-IN')}`,
    `₹${(item.fineAmount || 0).toLocaleString('en-IN')}`,
    `₹${(item.amount + (item.fineAmount || 0)).toLocaleString('en-IN')}`,
    item.paymentMethod,
    item.paymentBillUpload ? item.paymentBillUpload.fileName : 'No Bill',
    item.documentUpload ? item.documentUpload.fileName : 'No Doc'
  ]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-400" />
            <span>Vehicle Document Expense Module</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            FC, Insurance, Road Tax, Pollution, State Permit, National Permit, and penalty fine expense management with automatic PDF generation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Document Expense</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Vehicle Document & Regulatory Expenses Report"
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
          { label: 'Total Document Entries', value: filteredList.length },
          { label: 'Doc Fees Total', value: `₹${totalDocExpense.toLocaleString('en-IN')}` },
          { label: 'Penalty Fines Total', value: `₹${totalFineAmount.toLocaleString('en-IN')}` },
          { label: 'Grand Total Expenditure', value: `₹${grandTotal.toLocaleString('en-IN')}` }
        ]}
      />

      {/* Search & Filter Bar */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vehicle number or document..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Doc Type:</span>
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Document Types</option>
            <option value="FC">FC</option>
            <option value="Insurance">Insurance</option>
            <option value="Road Tax">Road Tax</option>
            <option value="Pollution">Pollution</option>
            <option value="State Permit">State Permit</option>
            <option value="National Permit">National Permit</option>
            <option value="Other Document Expense">Other Document Expense</option>
          </select>

          <select
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs font-mono text-orange-400 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.vehicleNumber}>
                {v.vehicleNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e172a] text-slate-400 uppercase font-bold text-[10.5px] border-b border-[#1b2b48]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vehicle Number</th>
                <th className="py-3 px-3">Document Type</th>
                <th className="py-3 px-3">Doc Fee (₹)</th>
                <th className="py-3 px-3">Fine (₹)</th>
                <th className="py-3 px-3">Total Payable</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Bill Receipt</th>
                <th className="py-3 px-3">Actual Doc</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No vehicle document expense records found.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">{item.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400">
                      {item.vehicleNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200">
                        {item.documentType === 'Other Document Expense'
                          ? `Other (${item.otherDocumentName || 'Expense'})`
                          : item.documentType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {item.fineAmount > 0 ? (
                        <span className="text-red-400 font-bold">₹{item.fineAmount}</span>
                      ) : (
                        <span className="text-slate-500">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 text-sm">
                      ₹{(item.amount + (item.fineAmount || 0)).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#142036] text-slate-300 border border-[#1e2f50]">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {item.paymentBillUpload ? (
                        <span className="text-[11px] font-mono text-orange-300 truncate max-w-[110px] block" title={item.paymentBillUpload.fileName}>
                          {item.paymentBillUpload.fileName}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Bill</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.documentUpload ? (
                        <span className="text-[11px] font-mono text-emerald-300 truncate max-w-[110px] block" title={item.documentUpload.fileName}>
                          {item.documentUpload.fileName}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Document</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PDF Download Button for this individual vehicle document */}
                        <button
                          onClick={() => {
                            setRegisteredDocForPdf(item);
                            setIsPdfModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-orange-600/15 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 transition-colors cursor-pointer"
                          title={`Download PDF for ${item.vehicleNumber} (${item.documentType})`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <ActionButtons
                          onEdit={() => handleOpenEdit(item)}
                          onDelete={() => deleteVehicleDocExpense(item.id)}
                          itemName={`Doc expense for ${item.vehicleNumber} (${item.documentType})`}
                          compact={true}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTOMATICALLY GENERATED PDF & DOWNLOAD MODAL */}
      {isPdfModalOpen && registeredDocForPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Vehicle Document Registered
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-4 bg-[#070c17] rounded-lg border border-[#18263f] space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#152238] pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Vehicle Number</span>
                  <span className="font-mono font-black text-orange-400 text-sm">
                    {registeredDocForPdf.vehicleNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="font-bold text-white">
                    {registeredDocForPdf.documentType === 'Other Document Expense'
                      ? `Other (${registeredDocForPdf.otherDocumentName || 'Expense'})`
                      : registeredDocForPdf.documentType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="font-mono text-slate-200">{registeredDocForPdf.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Fee Amount:</span>
                  <span className="font-mono text-slate-200">₹{registeredDocForPdf.amount.toLocaleString('en-IN')}</span>
                </div>
                {registeredDocForPdf.fineAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-400">Penalty Fine:</span>
                    <span className="font-mono font-bold text-red-400">₹{registeredDocForPdf.fineAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#152238]">
                  <span className="text-orange-400 font-bold uppercase">Total Payable Settled:</span>
                  <span className="font-mono font-black text-orange-400 text-base">
                    ₹{(registeredDocForPdf.amount + (registeredDocForPdf.fineAmount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>PDF has been generated using this vehicle's saved details. Click Download PDF below.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a2b47]">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDocPdf(registeredDocForPdf)}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT REGISTRATION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingId ? 'Edit Vehicle Document Expense' : 'Register Vehicle Document Expense'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">1. Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 2. Vehicle Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">2. Vehicle Number *</label>
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

                {/* 3. Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">3. Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => {
                      const a = Number(e.target.value);
                      setFormData({
                        ...formData,
                        amount: a,
                        paymentBillAmount: a + (formData.fineAmount || 0)
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* 4. Document Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">4. Document Type *</label>
                  <select
                    value={formData.documentType}
                    onChange={e => setFormData({ ...formData, documentType: e.target.value as VehicleDocumentType })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="FC">FC</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Road Tax">Road Tax</option>
                    <option value="Pollution">Pollution</option>
                    <option value="State Permit">State Permit</option>
                    <option value="National Permit">National Permit</option>
                    <option value="Other Document Expense">Other Document Expense</option>
                  </select>
                </div>

                {/* If Other Document Expense selected */}
                {formData.documentType === 'Other Document Expense' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-orange-400 mb-1">
                      Specify Document / Expense Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.otherDocumentName}
                      onChange={e => setFormData({ ...formData, otherDocumentName: e.target.value })}
                      placeholder="e.g. Weighbridge calibration certificate, Green Tax, High Security Plates"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-orange-500/70 rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Fine Amount (Separate field) */}
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-1">Fine Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.fineAmount}
                    onChange={e => {
                      const f = Number(e.target.value);
                      setFormData({
                        ...formData,
                        fineAmount: f,
                        paymentBillAmount: formData.amount + f
                      });
                    }}
                    placeholder="Penalty or late fine if any"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-red-500/40 rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
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
              </div>

              {/* SEPARATE SECTIONS FOR PAYMENT BILL AND ACTUAL VEHICLE DOCUMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#17253e]">
                {/* Section A: Payment Bill */}
                <div className="p-3 bg-[#070c17] rounded-lg border border-[#18263f] space-y-3">
                  <h4 className="text-xs font-bold text-orange-400 uppercase flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" />
                    <span>Payment Bill Section</span>
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Payment Bill Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.paymentBillAmount}
                      onChange={e => setFormData({ ...formData, paymentBillAmount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#0b1324] border border-[#1f3152] rounded-lg text-xs font-mono text-slate-100"
                    />
                  </div>
                  <DocumentUploader
                    label="Upload Payment Bill (Photo or PDF)"
                    document={formData.paymentBillUpload}
                    onUpload={doc => setFormData({ ...formData, paymentBillUpload: doc })}
                  />
                </div>

                {/* Section B: Document Upload (Actual Vehicle Doc) */}
                <div className="p-3 bg-[#070c17] rounded-lg border border-[#18263f] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Actual Vehicle Document Section</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Upload official Parivahan receipt, Fitness, Insurance certificate, or Permit sheet.
                  </p>
                  <DocumentUploader
                    label="Upload Vehicle Document (PDF / Photo)"
                    document={formData.documentUpload}
                    onUpload={doc => setFormData({ ...formData, documentUpload: doc })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save / Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
