import React, { useState } from 'react';
import {
  BadgeIndianRupee,
  Plus,
  Users,
  Calendar,
  Share2,
  FileText,
  X,
  CreditCard,
  Briefcase,
  Download,
  ChevronDown,
  ChevronUp,
  Phone,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Driver } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { printHtmlDocument, renderPdfHeader } from '../../utils/exportUtils';

export const DriverSalaryExpense: React.FC = () => {
  const {
    drivers,
    attendance,
    driverAdvances,
    addDriverAdvance,
    updateDriverAdvance,
    deleteDriverAdvance,
    driverCompanyExpenses,
    addDriverCompanyExpense,
    updateDriverCompanyExpense,
    deleteDriverCompanyExpense,
    officeDetails
  } = useData();

  const [selectedMonth, setSelectedMonth] = useState('2026-10'); // YYYY-MM
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded driver row ID for viewing itemized details inline
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(drivers[0]?.id || null);

  // Salary Slip Modal State
  const [slipModalDriverId, setSlipModalDriverId] = useState<string | null>(null);

  // Modals for adding Advance & Company Expense
  const [targetDriverForAction, setTargetDriverForAction] = useState<Driver | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [editingAdvanceId, setEditingAdvanceId] = useState<string | null>(null);
  const [advanceForm, setAdvanceForm] = useState<{
    date: string;
    amount: number;
    remarks: string;
    receiptUpload?: any;
  }>({
    date: new Date().toISOString().split('T')[0],
    amount: 1000,
    remarks: 'Road transit advance',
    receiptUpload: undefined
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<{
    date: string;
    amount: number;
    details: string;
    receiptUpload?: any;
  }>({
    date: new Date().toISOString().split('T')[0],
    amount: 500,
    details: 'Company safety kit / medical',
    receiptUpload: undefined
  });

  // Calculate individual driver salary details for selected month
  const getDriverSalaryCalc = (driver: Driver) => {
    const monthPrefix = selectedMonth;
    const driverAttendance = attendance.filter(
      a => a.driverId === driver.id && a.date.startsWith(monthPrefix)
    );
    const presentDays = driverAttendance.filter(a => a.status === 'Present').length;
    const sundayDays = driverAttendance.filter(a => a.status === 'Sunday').length;
    const holidayDays = driverAttendance.filter(a => a.status === 'Government Holiday').length;
    const totalPaidDays = presentDays + sundayDays + holidayDays;
    const totalDaysInMonth = 30;

    const basicSalary = driver.basicSalary || 26000;
    const dailyAllowance = driver.dailyAllowance || 350;

    const earnedBasic = Math.round((basicSalary / totalDaysInMonth) * totalPaidDays);
    const earnedAllowance = dailyAllowance * presentDays;
    const grossSalary = earnedBasic + earnedAllowance;

    const monthlyAdvances = driverAdvances
      .filter(a => a.driverId === driver.id && a.date.startsWith(monthPrefix))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const totalAdvances = monthlyAdvances.reduce((sum, a) => sum + a.amount, 0);

    const monthlyCompanyExpenses = driverCompanyExpenses
      .filter(e => e.driverId === driver.id && e.date.startsWith(monthPrefix))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const totalCompanyExpenses = monthlyCompanyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const finalPayableSalary = Math.max(0, grossSalary - totalAdvances - totalCompanyExpenses);

    return {
      driver,
      presentDays,
      sundayDays,
      holidayDays,
      totalPaidDays,
      totalDaysInMonth,
      basicSalary,
      dailyAllowance,
      earnedBasic,
      earnedAllowance,
      grossSalary,
      monthlyAdvances,
      totalAdvances,
      monthlyCompanyExpenses,
      totalCompanyExpenses,
      finalPayableSalary
    };
  };

  // Generate Professional Salary Slip HTML for a specific driver
  const generateDriverSalarySlipHtml = (calc: ReturnType<typeof getDriverSalaryCalc>) => {
    const { driver } = calc;
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Salary_Slip_${driver.driverName.replace(/\\s+/g, '_')}_${selectedMonth}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; line-height: 1.4; }
    .header-box { border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .company-title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .meta-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .slip-badge { background: #ea580c; color: #ffffff; padding: 4px 10px; font-size: 13px; font-weight: 900; border-radius: 4px; text-transform: uppercase; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    .info-table td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .info-table td.label { background: #f1f5f9; font-weight: 700; width: 22%; color: #334155; }
    .info-table td.val { font-weight: 600; width: 28%; }
    .section-title { font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 14px 0 6px 0; border-left: 3px solid #ea580c; padding-left: 6px; }
    .calc-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
    .calc-table th { background: #1e293b; color: #ffffff; font-weight: 700; text-align: left; padding: 7px 10px; font-size: 10.5px; text-transform: uppercase; }
    .calc-table td { padding: 7px 10px; border: 1px solid #cbd5e1; }
    .calc-table tr:nth-child(even) { background: #f8fafc; }
    .total-highlight { background: #fff7ed !important; font-weight: 800; }
    .breakdown-box { background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
    .net-box { background: #0f172a; color: #ffffff; border-radius: 6px; padding: 14px 18px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .net-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #fdba74; }
    .net-amount { font-size: 24px; font-weight: 900; color: #ffffff; font-family: monospace; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-col { width: 200px; text-align: center; border-top: 1px solid #475569; padding-top: 6px; font-size: 10.5px; font-weight: 700; }
    .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  </style>
</head>
<body>
  ${renderPdfHeader(officeDetails, 'Driver Monthly Salary Slip')}

  <div class="meta-box">
    <div>
      <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Salary Disbursement Period</span>
      <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        Month: ${selectedMonth} (Calendar 30-Day Cycle)
      </div>
    </div>
    <div class="slip-badge">
      SALARY SLIP
    </div>
  </div>

  <div class="section-title">Driver Information</div>
  <table class="info-table">
    <tr>
      <td class="label">Driver Name</td>
      <td class="val"><strong>${driver.driverName}</strong></td>
      <td class="label">Driver ID</td>
      <td class="val font-mono">${driver.id}</td>
    </tr>
    <tr>
      <td class="label">Contact Mobile</td>
      <td class="val font-mono">${driver.mobileNo}</td>
      <td class="label">Assigned Truck</td>
      <td class="val font-mono" style="color: #ea580c; font-weight: 800;">${driver.assignedVehicleNumber || 'Float Driver'}</td>
    </tr>
    <tr>
      <td class="label">Date of Joining</td>
      <td class="val font-mono">${driver.dateOfJoining}</td>
      <td class="label">Designation / Role</td>
      <td class="val">Heavy Commercial Vehicle Driver</td>
    </tr>
  </table>

  <div class="section-title">Duty & Attendance Summary</div>
  <table class="info-table">
    <tr>
      <td class="label">Total Paid Days</td>
      <td class="val" style="color: #15803d; font-weight: 800;">${calc.totalPaidDays} / 30 Days</td>
      <td class="label">Duty Present Days</td>
      <td class="val font-mono">${calc.presentDays} Days</td>
    </tr>
    <tr>
      <td class="label">Sundays Credited</td>
      <td class="val font-mono">${calc.sundayDays} Days</td>
      <td class="label">Govt Holidays Credited</td>
      <td class="val font-mono">${calc.holidayDays} Days</td>
    </tr>
  </table>

  <div class="section-title">Salary Computations (Earnings & Deductions)</div>
  <table class="calc-table">
    <thead>
      <tr>
        <th style="width: 50%;">Earnings Component</th>
        <th style="width: 25%; text-align: right;">Rate / Base</th>
        <th style="width: 25%; text-align: right;">Earned Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basic Salary (Pro-rated for ${calc.totalPaidDays} paid days)</td>
        <td style="text-align: right; font-family: monospace;">₹${calc.basicSalary.toLocaleString('en-IN')} / mo</td>
        <td style="text-align: right; font-weight: 700; font-family: monospace;">₹${calc.earnedBasic.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Active Duty Running Allowance (${calc.presentDays} duty days)</td>
        <td style="text-align: right; font-family: monospace;">₹${calc.dailyAllowance} / day</td>
        <td style="text-align: right; font-weight: 700; font-family: monospace;">₹${calc.earnedAllowance.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="total-highlight">
        <td colspan="2"><strong>GROSS EARNED SALARY (A)</strong></td>
        <td style="text-align: right; font-weight: 900; font-family: monospace; color: #15803d;">₹${calc.grossSalary.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <table class="calc-table">
    <thead>
      <tr>
        <th style="width: 50%;">Deductions Component (Itemized Date-wise)</th>
        <th style="width: 25%; text-align: right;">Record Count</th>
        <th style="width: 25%; text-align: right;">Deduction Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Date-wise Driver Advances Deducted</td>
        <td style="text-align: right;">${calc.monthlyAdvances.length} Transaction(s)</td>
        <td style="text-align: right; font-weight: 700; font-family: monospace; color: #b91c1c;">- ₹${calc.totalAdvances.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Date-wise Company Operational Expenses Deducted</td>
        <td style="text-align: right;">${calc.monthlyCompanyExpenses.length} Transaction(s)</td>
        <td style="text-align: right; font-weight: 700; font-family: monospace; color: #b45309;">- ₹${calc.totalCompanyExpenses.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="total-highlight">
        <td colspan="2"><strong>TOTAL DEDUCTIONS (B)</strong></td>
        <td style="text-align: right; font-weight: 900; font-family: monospace; color: #b91c1c;">- ₹${(calc.totalAdvances + calc.totalCompanyExpenses).toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  ${calc.monthlyAdvances.length > 0 || calc.monthlyCompanyExpenses.length > 0 ? `
  <div class="breakdown-box">
    <div style="font-weight: 800; font-size: 10.5px; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
      Itemized Transaction Log (${selectedMonth})
    </div>
    <div style="display: flex; gap: 20px; font-size: 10px;">
      <div style="flex: 1;">
        <strong style="color: #b91c1c;">Driver Advances:</strong>
        ${calc.monthlyAdvances.length === 0 ? '<div style="color: #94a3b8;">None</div>' : `
          <ul style="margin: 4px 0; padding-left: 16px;">
            ${calc.monthlyAdvances.map(a => `<li>${a.date}: ₹${a.amount.toLocaleString('en-IN')} (${a.remarks || 'Advance'})</li>`).join('')}
          </ul>
        `}
      </div>
      <div style="flex: 1;">
        <strong style="color: #b45309;">Company Expenses:</strong>
        ${calc.monthlyCompanyExpenses.length === 0 ? '<div style="color: #94a3b8;">None</div>' : `
          <ul style="margin: 4px 0; padding-left: 16px;">
            ${calc.monthlyCompanyExpenses.map(e => `<li>${e.date}: ₹${e.amount.toLocaleString('en-IN')} (${e.details})</li>`).join('')}
          </ul>
        `}
      </div>
    </div>
  </div>
  ` : ''}

  <div class="net-box">
    <div>
      <div class="net-title">Net Payable Salary Amount (A - B)</div>
      <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
        Verified & Passed for Direct Bank Transfer / NEFT Disbursal
      </div>
    </div>
    <div class="net-amount">
      ₹${calc.finalPayableSalary.toLocaleString('en-IN')}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-col">
      Driver Signature<br/>
      (${driver.driverName})
    </div>
    <div class="sig-col">
      Checked & Verified by<br/>
      (Accounts Department)
    </div>
    <div class="sig-col">
      Authorized Signatory<br/>
      (${officeDetails.companyName})
    </div>
  </div>

  <div class="footer">
    This is an official system-generated salary slip of ${officeDetails.companyName}. Record ID: SLP-${driver.id}-${selectedMonth}.
  </div>
</body>
</html>
    `;
  };

  // Download Individual Driver Salary Slip PDF
  const handleDownloadDriverSalarySlipPdf = (calc: ReturnType<typeof getDriverSalaryCalc>) => {
    const html = generateDriverSalarySlipHtml(calc);
    printHtmlDocument(`Salary_Slip_${calc.driver.driverName.replace(/\\s+/g, '_')}_${selectedMonth}`, html);
  };

  // WhatsApp Share helper for individual driver
  const handleShareWhatsApp = (calc: ReturnType<typeof getDriverSalaryCalc>) => {
    const { driver } = calc;
    const phone = driver.mobileNo.replace(/\\D/g, '');
    const textMsg = encodeURIComponent(
      `*${officeDetails.companyName}*\n` +
      `*OFFICIAL SALARY SLIP - ${selectedMonth}*\n` +
      `--------------------------------\n` +
      `Driver: ${driver.driverName} (ID: ${driver.id})\n` +
      `Assigned Truck: ${driver.assignedVehicleNumber || 'Float'}\n` +
      `Paid Days: ${calc.totalPaidDays} / 30 Days\n` +
      `Basic Salary: ₹${calc.earnedBasic.toLocaleString('en-IN')}\n` +
      `Duty Allowance: ₹${calc.earnedAllowance.toLocaleString('en-IN')}\n` +
      `Gross Salary: ₹${calc.grossSalary.toLocaleString('en-IN')}\n` +
      `Total Advances: -₹${calc.totalAdvances.toLocaleString('en-IN')}\n` +
      `Total Company Expenses: -₹${calc.totalCompanyExpenses.toLocaleString('en-IN')}\n` +
      `--------------------------------\n` +
      `*NET PAYABLE SALARY: ₹${calc.finalPayableSalary.toLocaleString('en-IN')}*\n` +
      `Generated on: ${new Date().toLocaleDateString()}`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${textMsg}`, '_blank');
  };

  // Submit Advance
  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDriverForAction) return;

    if (editingAdvanceId) {
      updateDriverAdvance(editingAdvanceId, {
        date: advanceForm.date,
        amount: advanceForm.amount,
        remarks: advanceForm.remarks,
        receiptUpload: advanceForm.receiptUpload
      });
    } else {
      addDriverAdvance({
        date: advanceForm.date,
        driverId: targetDriverForAction.id,
        driverName: targetDriverForAction.driverName,
        amount: advanceForm.amount,
        remarks: advanceForm.remarks,
        receiptUpload: advanceForm.receiptUpload
      });
    }
    setIsAdvanceModalOpen(false);
  };

  // Submit Company Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDriverForAction) return;

    if (editingExpenseId) {
      updateDriverCompanyExpense(editingExpenseId, {
        date: expenseForm.date,
        amount: expenseForm.amount,
        details: expenseForm.details,
        receiptUpload: expenseForm.receiptUpload
      });
    } else {
      addDriverCompanyExpense({
        date: expenseForm.date,
        driverId: targetDriverForAction.id,
        driverName: targetDriverForAction.driverName,
        amount: expenseForm.amount,
        details: expenseForm.details,
        receiptUpload: expenseForm.receiptUpload
      });
    }
    setIsExpenseModalOpen(false);
  };

  // Filtered driver list
  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.driverName.toLowerCase().includes(q) ||
      d.mobileNo.includes(q) ||
      (d.assignedVehicleNumber && d.assignedVehicleNumber.toLowerCase().includes(q))
    );
  });

  // Calculate totals for all drivers in selected month
  const allCalcs = drivers.map(d => getDriverSalaryCalc(d));
  const totalGrossAll = allCalcs.reduce((sum, c) => sum + c.grossSalary, 0);
  const totalDeductionsAll = allCalcs.reduce((sum, c) => sum + c.totalAdvances + c.totalCompanyExpenses, 0);
  const totalNetAll = allCalcs.reduce((sum, c) => sum + c.finalPayableSalary, 0);

  // Report export rows for drivers summary in month
  const reportHeaders = [
    'S.No',
    'Driver Name',
    'Assigned Truck',
    'Month',
    'Paid Days',
    'Gross Salary (₹)',
    'Total Advance (₹)',
    'Total Company Exp (₹)',
    'Net Payable (₹)'
  ];

  const reportRows = drivers.map((d, idx) => {
    const calc = getDriverSalaryCalc(d);
    return [
      idx + 1,
      d.driverName,
      d.assignedVehicleNumber || 'Float',
      selectedMonth,
      `${calc.totalPaidDays} Days`,
      `₹${calc.grossSalary.toLocaleString('en-IN')}`,
      `₹${calc.totalAdvances.toLocaleString('en-IN')}`,
      `₹${calc.totalCompanyExpenses.toLocaleString('en-IN')}`,
      `₹${calc.finalPayableSalary.toLocaleString('en-IN')}`
    ];
  });

  // Slip modal driver calculation
  const modalDriver = drivers.find(d => d.id === slipModalDriverId) || null;
  const modalCalc = modalDriver ? getDriverSalaryCalc(modalDriver) : null;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <BadgeIndianRupee className="w-6 h-6 text-orange-400" />
            <span>Driver Salary Expense & Slips</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Driver-by-driver step-by-step salary registration with individual professional salary slip PDF generation.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-[#060a12] border border-[#1e2f50] rounded-lg px-3 py-1.5">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-slate-300">Salary Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-orange-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle={`Driver Salary Expenses Summary (${selectedMonth})`}
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
          { label: 'Total Drivers', value: drivers.length },
          { label: 'Total Gross', value: `₹${totalGrossAll.toLocaleString('en-IN')}` },
          { label: 'Total Deductions', value: `₹${totalDeductionsAll.toLocaleString('en-IN')}` },
          { label: 'Total Net Disbursed', value: `₹${totalNetAll.toLocaleString('en-IN')}` }
        ]}
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Drivers</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono-numbers">
            {drivers.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Registered for {selectedMonth} cycle
          </div>
        </div>

        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase">Total Gross Salary</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono-numbers">
            ₹{totalGrossAll.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Basic + Active duty allowances
          </div>
        </div>

        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase">Total Deductions</span>
            <Briefcase className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-400 font-mono-numbers">
            -₹{totalDeductionsAll.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Advances + Company expenses
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#131d33] to-[#1e1308] border border-orange-500/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-400 uppercase">Net Disbursable</span>
            <BadgeIndianRupee className="w-5 h-5 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-300 font-mono-numbers">
            ₹{totalNetAll.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[10px] text-orange-200/80">
            Total net payout for {selectedMonth}
          </div>
        </div>
      </div>

      {/* DRIVER-WISE SALARY SLIP REGISTRATION (SERIAL / LINE-BY-LINE ORDER) */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b48]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Driver-wise Salary Slip Registration
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered drivers displayed one below another in serial order. Each driver maintains their own individual salary expense record and downloadable salary slip PDF.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search driver name, truck, phone..."
              className="w-full px-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Drivers listed one below another in serial / line order */}
        <div className="space-y-3.5">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No registered drivers found matching your search.
            </div>
          ) : (
            filteredDrivers.map((driver, index) => {
              const calc = getDriverSalaryCalc(driver);
              const isExpanded = expandedDriverId === driver.id;

              return (
                <div
                  key={driver.id}
                  className={`border rounded-xl transition-all ${
                    isExpanded
                      ? 'bg-[#0e172a] border-orange-500/60 shadow-lg'
                      : 'bg-[#080d1a] border-[#18263f] hover:border-[#24375b]'
                  }`}
                >
                  {/* Step-by-Step Main Row */}
                  <div className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Driver Identity with Serial Number */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-mono font-black text-xs shrink-0">
                        #{index + 1}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-[#142036] border border-[#223555] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                        {driver.driverPhoto ? (
                          <img src={driver.driverPhoto} alt={driver.driverName} className="w-full h-full object-cover" />
                        ) : (
                          driver.driverName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="font-black text-white text-sm flex items-center gap-2">
                          <span>{driver.driverName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16233a] text-slate-400">
                            {driver.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-orange-400" />
                            <strong className="font-mono text-orange-400">{driver.assignedVehicleNumber || 'Float'}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-slate-300">{driver.mobileNo}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Salary Details Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 px-3 bg-[#060a14] rounded-lg border border-[#162338] text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold">1. Paid Days</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {calc.totalPaidDays} / 30 d
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold">2. Gross Salary</span>
                        <span className="font-mono font-bold text-white">
                          ₹{calc.grossSalary.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold">3. Deductions</span>
                        <span className="font-mono font-bold text-red-400">
                          -₹{(calc.totalAdvances + calc.totalCompanyExpenses).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-orange-400 text-[10px] block font-bold">4. Net Payable</span>
                        <span className="font-mono font-black text-orange-400 text-sm">
                          ₹{calc.finalPayableSalary.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Step 2 & 3 Action Buttons: Salary Details, Salary Slip, and Download PDF */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Step: Salary Details (Expand / Manage) */}
                      <button
                        onClick={() => setExpandedDriverId(isExpanded ? null : driver.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          isExpanded
                            ? 'bg-[#1a2946] text-orange-300 border-orange-500/50'
                            : 'bg-[#10192b] text-slate-300 border-[#1f2f4c] hover:bg-[#162238]'
                        }`}
                        title="View & manage itemized advances and company expenses"
                      >
                        <span>Salary Details</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      {/* Step: Salary Slip Preview Modal */}
                      <button
                        onClick={() => setSlipModalDriverId(driver.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#142036] hover:bg-[#1a2a46] border border-[#203254] text-slate-200 transition-colors cursor-pointer"
                        title="Preview official salary slip"
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-400" />
                        <span>Salary Slip</span>
                      </button>

                      {/* Step: Download PDF directly for this specific driver */}
                      <button
                        onClick={() => handleDownloadDriverSalarySlipPdf(calc)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-all cursor-pointer"
                        title={`Download salary slip PDF for ${driver.driverName} only`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      {/* WhatsApp Share */}
                      <button
                        onClick={() => handleShareWhatsApp(calc)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 rounded-lg transition-colors cursor-pointer"
                        title="Share slip to driver's WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* INLINE EXPANDED VIEW: Itemized Advances & Company Expenses for THIS driver */}
                  {isExpanded && (
                    <div className="border-t border-[#18263f] p-4 bg-[#070c17] rounded-b-xl space-y-4 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#142036]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-white uppercase text-[11px]">
                            {driver.driverName}'s Registered Details for {selectedMonth}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetDriverForAction(driver);
                              setEditingAdvanceId(null);
                              setAdvanceForm({
                                date: new Date().toISOString().split('T')[0],
                                amount: 1000,
                                remarks: 'Trip transit advance',
                                receiptUpload: undefined
                              });
                              setIsAdvanceModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Advance</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetDriverForAction(driver);
                              setEditingExpenseId(null);
                              setExpenseForm({
                                date: new Date().toISOString().split('T')[0],
                                amount: 500,
                                details: 'Driver medical / safety gear',
                                receiptUpload: undefined
                              });
                              setIsExpenseModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Company Exp</span>
                          </button>
                        </div>
                      </div>

                      {/* Split itemized tables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Date-wise Advances */}
                        <div className="bg-[#0b1324] border border-[#16233a] rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-red-400 uppercase flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" /> Date-Wise Advances
                            </span>
                            <span className="font-mono font-bold text-red-400">
                              Total: ₹{calc.totalAdvances.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {calc.monthlyAdvances.length === 0 ? (
                            <div className="py-4 text-center text-slate-500 text-[11px]">
                              No advances registered for {driver.driverName} in {selectedMonth}.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {calc.monthlyAdvances.map(adv => (
                                <div
                                  key={adv.id}
                                  className="flex items-center justify-between p-2 rounded bg-[#060a14] border border-[#162338] text-[11px]"
                                >
                                  <div>
                                    <span className="font-mono text-orange-400 font-bold mr-2">{adv.date}</span>
                                    <span className="text-slate-300">{adv.remarks || 'Advance'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-red-400">
                                      ₹{adv.amount.toLocaleString('en-IN')}
                                    </span>
                                    <ActionButtons
                                      onEdit={() => {
                                        setTargetDriverForAction(driver);
                                        setEditingAdvanceId(adv.id);
                                        setAdvanceForm({
                                          date: adv.date,
                                          amount: adv.amount,
                                          remarks: adv.remarks || '',
                                          receiptUpload: adv.receiptUpload
                                        });
                                        setIsAdvanceModalOpen(true);
                                      }}
                                      onDelete={() => deleteDriverAdvance(adv.id)}
                                      itemName={`Advance of ₹${adv.amount} for ${driver.driverName}`}
                                      compact={true}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 2. Date-wise Company Expenses */}
                        <div className="bg-[#0b1324] border border-[#16233a] rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-amber-400 uppercase flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" /> Date-Wise Company Expenses
                            </span>
                            <span className="font-mono font-bold text-amber-400">
                              Total: ₹{calc.totalCompanyExpenses.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {calc.monthlyCompanyExpenses.length === 0 ? (
                            <div className="py-4 text-center text-slate-500 text-[11px]">
                              No company expenses logged for {driver.driverName} in {selectedMonth}.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {calc.monthlyCompanyExpenses.map(exp => (
                                <div
                                  key={exp.id}
                                  className="flex items-center justify-between p-2 rounded bg-[#060a14] border border-[#162338] text-[11px]"
                                >
                                  <div>
                                    <span className="font-mono text-orange-400 font-bold mr-2">{exp.date}</span>
                                    <span className="text-slate-300">{exp.details}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-amber-400">
                                      ₹{exp.amount.toLocaleString('en-IN')}
                                    </span>
                                    <ActionButtons
                                      onEdit={() => {
                                        setTargetDriverForAction(driver);
                                        setEditingExpenseId(exp.id);
                                        setExpenseForm({
                                          date: exp.date,
                                          amount: exp.amount,
                                          details: exp.details,
                                          receiptUpload: exp.receiptUpload
                                        });
                                        setIsExpenseModalOpen(true);
                                      }}
                                      onDelete={() => deleteDriverCompanyExpense(exp.id)}
                                      itemName={`Company exp of ₹${exp.amount} for ${driver.driverName}`}
                                      compact={true}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SALARY SLIP PREVIEW & PDF DOWNLOAD MODAL FOR SELECTED DRIVER */}
      {modalDriver && modalCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Salary Slip: {modalDriver.driverName} ({selectedMonth})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSlipModalDriverId(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Paper Preview */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-sans">
              <div className="bg-[#070c17] p-5 rounded-lg border border-[#1a2a48] space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#1b2b48]">
                  <div className="flex items-center gap-3">
                    {officeDetails.companyLogo && (
                      <img
                        src={officeDetails.companyLogo}
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-extrabold text-white uppercase">{officeDetails.companyName}</h4>
                      <p className="text-[10px] text-slate-400">
                        {officeDetails.officeAddress} • GST: {officeDetails.gstNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <div className="font-bold text-orange-400 uppercase">OFFICIAL SALARY SLIP</div>
                    <div className="text-slate-400">{selectedMonth}</div>
                  </div>
                </div>

                {/* Driver Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-[#0b1324] rounded-md border border-[#16233a] text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Name</span>
                    <strong className="text-slate-200">{modalDriver.driverName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Joining Date</span>
                    <strong className="font-mono text-slate-200">{modalDriver.dateOfJoining}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Assigned Truck</span>
                    <strong className="font-mono text-orange-400">{modalDriver.assignedVehicleNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Paid Days</span>
                    <strong className="font-mono text-emerald-400">{modalCalc.totalPaidDays} / 30 Days</strong>
                  </div>
                </div>

                {/* Earnings & Deductions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Earnings */}
                  <div className="p-3 bg-[#0b1324] rounded-md border border-[#16233a] space-y-2">
                    <h5 className="font-bold text-emerald-400 text-xs uppercase border-b border-[#1b2b48] pb-1">
                      Earnings & Allowances
                    </h5>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Basic Salary (Pro-rated):</span>
                      <span className="font-mono font-bold text-slate-200">₹{modalCalc.earnedBasic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duty Allowance ({modalCalc.presentDays} days):</span>
                      <span className="font-mono font-bold text-slate-200">₹{modalCalc.earnedAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-[#1b2b48] flex justify-between font-bold">
                      <span className="text-white">Gross Salary:</span>
                      <span className="font-mono text-emerald-400">₹{modalCalc.grossSalary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="p-3 bg-[#0b1324] rounded-md border border-[#16233a] space-y-2">
                    <h5 className="font-bold text-red-400 text-xs uppercase border-b border-[#1b2b48] pb-1">
                      Deductions & Adjustments
                    </h5>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Date-wise Advances:</span>
                      <span className="font-mono font-bold text-red-400">-₹{modalCalc.totalAdvances.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Company Expenses:</span>
                      <span className="font-mono font-bold text-amber-400">-₹{modalCalc.totalCompanyExpenses.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-[#1b2b48] flex justify-between font-bold">
                      <span className="text-white">Total Deductions:</span>
                      <span className="font-mono text-red-400">-₹{(modalCalc.totalAdvances + modalCalc.totalCompanyExpenses).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Net Payable Highlight */}
                <div className="p-3 bg-[#131f38] border border-orange-500/60 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase block">Net Payable Salary Amount:</span>
                    <span className="text-[10px] text-slate-400">Transferred via Direct Bank NEFT / Cash</span>
                  </div>
                  <div className="text-xl font-black text-orange-400 font-mono">
                    ₹{modalCalc.finalPayableSalary.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1a2b47] shrink-0">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(modalCalc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Slip</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDriverSalarySlipPdf(modalCalc)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Salary Slip PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSlipModalDriverId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ADVANCE FOR TARGET DRIVER */}
      {isAdvanceModalOpen && targetDriverForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <h3 className="text-sm font-bold text-white uppercase">
                {editingAdvanceId ? 'Edit Driver Advance' : `Add Advance for ${targetDriverForAction.driverName}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvance} className="py-3 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advance Date *</label>
                <input
                  type="date"
                  required
                  value={advanceForm.date}
                  onChange={e => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advance Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={advanceForm.amount}
                  onChange={e => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  value={advanceForm.remarks}
                  onChange={e => setAdvanceForm({ ...advanceForm, remarks: e.target.value })}
                  placeholder="e.g. Fuel stop, trip food allowance, medical"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <DocumentUploader
                  label="Advance Voucher / Receipt (Photo or PDF)"
                  document={advanceForm.receiptUpload}
                  onUpload={doc => setAdvanceForm({ ...advanceForm, receiptUpload: doc })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm"
                >
                  Save Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COMPANY EXPENSE FOR TARGET DRIVER */}
      {isExpenseModalOpen && targetDriverForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <h3 className="text-sm font-bold text-white uppercase">
                {editingExpenseId ? 'Edit Company Expense' : `Add Company Expense for ${targetDriverForAction.driverName}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="py-3 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Details / Description *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.details}
                  onChange={e => setExpenseForm({ ...expenseForm, details: e.target.value })}
                  placeholder="e.g. Uniform, eye checkup, safety gear, driver insurance"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <DocumentUploader
                  label="Expense Invoice / Receipt (Photo or PDF)"
                  document={expenseForm.receiptUpload}
                  onUpload={doc => setExpenseForm({ ...expenseForm, receiptUpload: doc })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm"
                >
                  Save Company Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
