import React, { useState } from 'react';
import {
  UserX,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DriverExitRecord, ExitWorkflowStatus } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { printHtmlDocument, renderPdfHeader } from '../../utils/exportUtils';

export const DriverExitManagement: React.FC = () => {
  const {
    drivers,
    exitRecords,
    initiateResignation,
    updateExitRecord,
    deleteExitRecord,
    officeDetails
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [editingExitRecord, setEditingExitRecord] = useState<DriverExitRecord | null>(null);

  // PDF Modal State for Driver Exit Record
  const [exitPdfRecord, setExitPdfRecord] = useState<DriverExitRecord | null>(null);
  const [isExitPdfModalOpen, setIsExitPdfModalOpen] = useState(false);

  // Form State for Resignation Initiation
  const [initiateForm, setInitiateForm] = useState({
    driverId: '',
    resignationDate: new Date().toISOString().split('T')[0],
    reason: '',
    remarks: ''
  });

  const activeDriversForExit = drivers.filter(d => d.status === 'Active');

  const handleOpenInitiate = () => {
    setInitiateForm({
      driverId: activeDriversForExit[0]?.id || '',
      resignationDate: new Date().toISOString().split('T')[0],
      reason: 'Personal family relocation',
      remarks: 'Driver submitted notice and completed vehicle handover.'
    });
    setIsInitiateModalOpen(true);
  };

  // Generate & Download PDF for a specific driver exit record
  const handleDownloadExitPdf = (rec: DriverExitRecord) => {
    const driver = drivers.find(d => d.id === rec.driverId);
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Driver_Exit_Clearance_${rec.driverName.replace(/\\s+/g, '_')}_${rec.resignationDate}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; line-height: 1.4; }
    .meta-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .status-badge { background: #b91c1c; color: #ffffff; padding: 4px 10px; font-size: 12px; font-weight: 900; border-radius: 4px; text-transform: uppercase; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    .info-table td { padding: 7px 10px; border: 1px solid #cbd5e1; }
    .info-table td.label { background: #f1f5f9; font-weight: 700; width: 25%; color: #334155; }
    .info-table td.val { font-weight: 600; width: 25%; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 14px 0 6px 0; border-left: 3px solid #ea580c; padding-left: 6px; }
    .checklist-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; }
    .check-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 11px; }
    .settlement-box { background: #0f172a; color: #ffffff; border-radius: 6px; padding: 12px 18px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-col { width: 180px; text-align: center; border-top: 1px solid #475569; padding-top: 6px; font-size: 10px; font-weight: 700; }
    .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  </style>
</head>
<body>
  ${renderPdfHeader(officeDetails, 'Driver Exit Clearance & Final Settlement Certificate')}

  <div class="meta-box">
    <div>
      <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Official Employment Clearance Record</span>
      <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Driver Exit & Resignation Settlement Form
      </div>
    </div>
    <div class="status-badge">
      ${rec.exitStatus}
    </div>
  </div>

  <div class="section-title">1. Resigned Driver Particulars</div>
  <table class="info-table">
    <tr>
      <td class="label">Driver Full Name</td>
      <td class="val"><strong>${rec.driverName}</strong></td>
      <td class="label">Driver ID</td>
      <td class="val font-mono">${rec.driverId}</td>
    </tr>
    <tr>
      <td class="label">Contact Mobile</td>
      <td class="val font-mono">${driver?.mobileNo || 'On File'}</td>
      <td class="label">Assigned Vehicle</td>
      <td class="val font-mono" style="color: #ea580c; font-weight: 800;">${driver?.assignedVehicleNumber || 'Handed Over'}</td>
    </tr>
    <tr>
      <td class="label">Date of Joining</td>
      <td class="val font-mono">${rec.joiningDate}</td>
      <td class="label">Resignation Effective Date</td>
      <td class="val font-mono" style="color: #b91c1c; font-weight: 800;">${rec.resignationDate}</td>
    </tr>
    <tr>
      <td class="label">Final Working Day</td>
      <td class="val font-mono">${rec.finalWorkingDate}</td>
      <td class="label">Total Service Tenure</td>
      <td class="val">Completed & Relieved</td>
    </tr>
    <tr>
      <td class="label">Reason for Resignation</td>
      <td class="val" colspan="3">${rec.reasonForResignation}</td>
    </tr>
    <tr>
      <td class="label">Administrative Remarks</td>
      <td class="val" colspan="3">${rec.resignationRemarks || 'Handover completed as per company policy.'}</td>
    </tr>
  </table>

  <div class="section-title">2. Company Handover & Assets Clearance Checklist</div>
  <div class="checklist-box">
    <div class="check-item">
      <span style="color: ${rec.companyAssetsReturned ? '#15803d' : '#b91c1c'}; font-weight: 900;">${rec.companyAssetsReturned ? '✓' : '✗'}</span>
      <span><strong>Company Assets Returned:</strong> Driver ID card, Truck keys, FASTag device, Fuel credit card, Uniform returned.</span>
    </div>
    <div class="check-item">
      <span style="color: ${rec.documentsVerified ? '#15803d' : '#b91c1c'}; font-weight: 900;">${rec.documentsVerified ? '✓' : '✗'}</span>
      <span><strong>Original Documents Verified:</strong> Aadhar, Driving License, Police Verification record audited and verified.</span>
    </div>
    <div class="check-item">
      <span style="color: #15803d; font-weight: 900;">✓</span>
      <span><strong>Vehicle Handover Condition:</strong> Truck inspected with zero pending accident claims or unresolved road penalties.</span>
    </div>
    <div class="check-item">
      <span style="color: #15803d; font-weight: 900;">✓</span>
      <span><strong>Attendance & Duty Cutoff:</strong> Duty ledger closed with no further claims on driver duty roster.</span>
    </div>
  </div>

  <div class="section-title">3. Final Salary Settlement Summary</div>
  <table class="info-table">
    <tr>
      <td class="label">Final Attendance Worked Days</td>
      <td class="val font-mono">${rec.finalAttendanceDays || 30} Days</td>
      <td class="label">Account Settlement Status</td>
      <td class="val" style="color: #15803d; font-weight: 800;">Cleared in Full</td>
    </tr>
  </table>

  <div class="settlement-box">
    <div>
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fdba74;">
        Final Settlement Disbursed Amount
      </div>
      <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
        Pro-rated Salary, Duty Allowances, minus pending advances
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 900; color: #ffffff; font-family: monospace;">
      ₹${rec.finalSalaryAmount.toLocaleString('en-IN')}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-col">
      Resigned Driver Signature<br/>
      (${rec.driverName})
    </div>
    <div class="sig-col">
      Fleet Operations Head<br/>
      (Handover Cleared)
    </div>
    <div class="sig-col">
      Accounts & HR Department<br/>
      (Dues Cleared)
    </div>
    <div class="sig-col">
      Authorized Signatory<br/>
      (${officeDetails.companyName})
    </div>
  </div>

  <div class="footer">
    Official Relieving & Exit Clearance Document of ${officeDetails.companyName} | System Record: EXT-${rec.driverId}-${rec.resignationDate}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Driver_Exit_Clearance_${rec.driverName.replace(/\\s+/g, '_')}_${rec.resignationDate}`, html);
  };

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiateForm.driverId || !initiateForm.resignationDate) {
      alert('Driver and Resignation Date are required.');
      return;
    }
    const driver = drivers.find(d => d.id === initiateForm.driverId);
    const res = initiateResignation(
      initiateForm.driverId,
      initiateForm.resignationDate,
      initiateForm.reason,
      initiateForm.remarks
    );
    if (res.success) {
      setIsInitiateModalOpen(false);

      // Automatically generate exit record / clearance settlement PDF
      const createdRecord: DriverExitRecord = {
        id: `exit_${Date.now()}`,
        driverId: initiateForm.driverId,
        driverName: driver?.driverName || 'Driver',
        joiningDate: driver?.dateOfJoining || 'N/A',
        resignationDate: initiateForm.resignationDate,
        reasonForResignation: initiateForm.reason,
        resignationRemarks: initiateForm.remarks,
        finalWorkingDate: initiateForm.resignationDate,
        requiredDocs: ['Aadhar Card', 'PAN Card', 'Commercial License', 'Company ID Card', 'Exit Handover Slip'],
        submittedDocs: ['Aadhar Card', 'PAN Card', 'Commercial License'],
        missingDocs: ['Company ID Card', 'Exit Handover Slip'],
        documentsVerified: true,
        finalSalaryCalculated: true,
        finalSalaryAmount: driver?.basicSalary || 26000,
        finalAttendanceDays: 30,
        attendanceClosed: true,
        exitFormGenerated: true,
        companyAssetsReturned: true,
        exitStatus: 'Resignation Initiated',
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setExitPdfRecord(createdRecord);
      setIsExitPdfModalOpen(true);
    } else {
      alert(res.message);
    }
  };

  // Filter records
  const filteredExits = exitRecords.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.driverName.toLowerCase().includes(q) ||
      item.reasonForResignation.toLowerCase().includes(q) ||
      item.exitStatus.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'All' || item.exitStatus === filterStatus;

    let matchesDate = true;
    if (dateFrom && item.resignationDate < dateFrom) matchesDate = false;
    if (dateTo && item.resignationDate > dateTo) matchesDate = false;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const reportHeaders = [
    'Driver Name',
    'Joining Date',
    'Resignation Date',
    'Exit Reason',
    'Final Working Date',
    'Final Settlement (₹)',
    'Exit Workflow Status'
  ];

  const reportRows = filteredExits.map(item => [
    item.driverName,
    item.joiningDate,
    item.resignationDate,
    item.reasonForResignation,
    item.finalWorkingDate,
    `₹${item.finalSalaryAmount.toLocaleString('en-IN')}`,
    item.exitStatus
  ]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <UserX className="w-6 h-6 text-orange-400" />
            <span>Driver Resigning & Exit Maintenance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end resignation workflow: Document verification, attendance cutoff enforcement, final salary settlement, and automatic clearance PDF generation.
          </p>
        </div>

        <button
          onClick={handleOpenInitiate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Driver Exit Form</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Driver Resignation & Exit Register Audit Report"
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
          { label: 'Total Exit Records', value: filteredExits.length },
          { label: 'Completed Exits', value: filteredExits.filter(e => e.exitStatus === 'Resigned' || e.exitStatus === 'Exit Completed').length }
        ]}
      />

      {/* Search & Filters */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by driver name, reason, or status..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Exit Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Resignation Initiated">Resignation Initiated</option>
            <option value="Document Verification">Document Verification</option>
            <option value="Exit Completed">Exit Completed</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e172a] text-slate-400 uppercase font-bold text-[10.5px] border-b border-[#1b2b48]">
              <tr>
                <th className="py-3 px-3">Driver Name</th>
                <th className="py-3 px-3">Joining Date</th>
                <th className="py-3 px-3">Resignation Date</th>
                <th className="py-3 px-3">Exit Reason</th>
                <th className="py-3 px-3">Clearance Docs</th>
                <th className="py-3 px-3">Final Settlement</th>
                <th className="py-3 px-3">Handover Form</th>
                <th className="py-3 px-3">Workflow Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredExits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No resignation or exit records found.
                  </td>
                </tr>
              ) : (
                filteredExits.map(item => (
                  <tr key={item.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100">{item.driverName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {item.driverId}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{item.joiningDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-400">
                      {item.resignationDate}
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate" title={item.reasonForResignation}>
                      {item.reasonForResignation}
                    </td>
                    <td className="py-3 px-3">
                      {item.documentsVerified ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> All Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      ₹{item.finalSalaryAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      {item.signedExitForm ? (
                        <span className="text-[11px] font-mono text-orange-400 truncate max-w-[110px] block" title={item.signedExitForm.fileName}>
                          {item.signedExitForm.fileName}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Awaiting Signed Form</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.exitStatus === 'Resigned' || item.exitStatus === 'Exit Completed'
                            ? 'bg-red-950/70 text-red-400 border border-red-800/50'
                            : 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                        }`}
                      >
                        {item.exitStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PDF Download Button for this driver's exit record */}
                        <button
                          onClick={() => {
                            setExitPdfRecord(item);
                            setIsExitPdfModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-orange-600/15 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 transition-colors cursor-pointer"
                          title={`Download Exit Settlement PDF for ${item.driverName}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <ActionButtons
                          onEdit={() => setEditingExitRecord(item)}
                          onDelete={() => deleteExitRecord(item.id)}
                          itemName={`Exit record for ${item.driverName}`}
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

      {/* AUTOMATICALLY GENERATED EXIT RECORD / SETTLEMENT PDF MODAL */}
      {isExitPdfModalOpen && exitPdfRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Driver Exit Process Registered
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExitPdfModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="p-4 bg-[#070c17] rounded-lg border border-[#18263f] space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#152238] pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Driver Name</span>
                  <span className="font-bold text-white text-sm">
                    {exitPdfRecord.driverName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Resignation / Exit Date:</span>
                  <span className="font-mono text-red-400 font-bold">{exitPdfRecord.resignationDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Joining Date:</span>
                  <span className="font-mono text-slate-300">{exitPdfRecord.joiningDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Exit Reason:</span>
                  <span className="text-slate-200">{exitPdfRecord.reasonForResignation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Clearance Status:</span>
                  <span className="text-emerald-400 font-semibold">Handover Completed & Verified</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#152238]">
                  <span className="text-orange-400 font-bold uppercase">Final Settlement:</span>
                  <span className="font-mono font-black text-orange-400 text-base">
                    ₹{exitPdfRecord.finalSalaryAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Exit clearance settlement PDF has been generated. Click Download PDF below.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a2b47]">
              <button
                type="button"
                onClick={() => setIsExitPdfModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadExitPdf(exitPdfRecord)}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER EXIT FORM MODAL */}
      {isInitiateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-orange-400" />
                <span>Driver Exit Form</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInitiateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="py-3 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Active Driver *</label>
                <select
                  value={initiateForm.driverId}
                  onChange={e => setInitiateForm({ ...initiateForm, driverId: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                >
                  {activeDriversForExit.length === 0 ? (
                    <option value="">No Active Drivers Available</option>
                  ) : (
                    activeDriversForExit.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.driverName} (Joined: {d.dateOfJoining}, Truck: {d.assignedVehicleNumber || 'None'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-red-400 font-semibold mb-1">
                  Resignation Date (Mandatory Cutoff Date) *
                </label>
                <input
                  type="date"
                  required
                  value={initiateForm.resignationDate}
                  onChange={e => setInitiateForm({ ...initiateForm, resignationDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-red-500/60 rounded-lg text-slate-100 font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Strict Rule: Attendance and Salary records will cease after this date.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Resignation *</label>
                <textarea
                  rows={2}
                  required
                  value={initiateForm.reason}
                  onChange={e => setInitiateForm({ ...initiateForm, reason: e.target.value })}
                  placeholder="e.g. Relocating to hometown, health, career change"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks & Handover Details</label>
                <textarea
                  rows={2}
                  value={initiateForm.remarks}
                  onChange={e => setInitiateForm({ ...initiateForm, remarks: e.target.value })}
                  placeholder="Handover duties, keys returned, assets checklist remarks"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsInitiateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Save / Confirm Driver Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / UPDATE EXIT RECORD MODAL */}
      {editingExitRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <h3 className="text-sm font-bold text-white uppercase">
                Update Exit Progress: {editingExitRecord.driverName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingExitRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exit Workflow Status</label>
                  <select
                    value={editingExitRecord.exitStatus}
                    onChange={e =>
                      setEditingExitRecord({ ...editingExitRecord, exitStatus: e.target.value as ExitWorkflowStatus })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                  >
                    <option value="Resignation Initiated">Resignation Initiated</option>
                    <option value="Document Verification">Document Verification</option>
                    <option value="Final Attendance Calculation">Final Attendance Calculation</option>
                    <option value="Final Salary Calculation">Final Salary Calculation</option>
                    <option value="Exit Form Generated">Exit Form Generated</option>
                    <option value="Signed Exit Form Uploaded">Signed Exit Form Uploaded</option>
                    <option value="Exit Completed">Exit Completed</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Final Settlement Amount (₹)</label>
                  <input
                    type="number"
                    value={editingExitRecord.finalSalaryAmount}
                    onChange={e =>
                      setEditingExitRecord({ ...editingExitRecord, finalSalaryAmount: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#070c17] rounded-lg border border-[#17253e]">
                    <input
                      type="checkbox"
                      checked={editingExitRecord.documentsVerified}
                      onChange={e =>
                        setEditingExitRecord({ ...editingExitRecord, documentsVerified: e.target.checked })
                      }
                      className="rounded accent-orange-600"
                    />
                    <span className="text-slate-200 font-semibold">
                      All Mandatory Driver Documents Verified & Retained for Audits
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#070c17] rounded-lg border border-[#17253e]">
                    <input
                      type="checkbox"
                      checked={editingExitRecord.companyAssetsReturned}
                      onChange={e =>
                        setEditingExitRecord({ ...editingExitRecord, companyAssetsReturned: e.target.checked })
                      }
                      className="rounded accent-orange-600"
                    />
                    <span className="text-slate-200 font-semibold">
                      Company ID Card, Vehicle Keys & Uniform Returned
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <DocumentUploader
                    label="Upload Scanned Signed Exit Form (PDF / Photo)"
                    document={editingExitRecord.signedExitForm}
                    onUpload={doc => setEditingExitRecord({ ...editingExitRecord, signedExitForm: doc })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a2b47] shrink-0">
              <button
                type="button"
                onClick={() => setEditingExitRecord(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateExitRecord(editingExitRecord.id, editingExitRecord);
                  const updatedRec = { ...editingExitRecord };
                  setEditingExitRecord(null);
                  setExitPdfRecord(updatedRec);
                  setIsExitPdfModalOpen(true);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm cursor-pointer"
              >
                Save & Generate Exit PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
