import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  Receipt,
  Fuel,
  Wrench,
  FileText,
  BadgeIndianRupee
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ReportToolbar } from '../common/ReportToolbar';

export const TotalExpenses: React.FC = () => {
  const {
    complaints,
    dieselRecords,
    adblueRecords,
    tollExpenses,
    vehicleDocExpenses,
    driverAdvances,
    driverCompanyExpenses
  } = useData();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [monthlyBudgetTarget, setMonthlyBudgetTarget] = useState<number>(150000);

  // Date filtering helper
  const isWithinRange = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    return true;
  };

  // Compile Unified Expenses from all modules (No duplication!)
  interface ExpenseItem {
    id: string;
    category: 'Diesel Expense' | 'AdBlue / DEF Expense' | 'Toll Expense' | 'Maintenance Expense' | 'Document Expense' | 'Salary & Driver Advance';
    date: string;
    description: string;
    amount: number;
    reference: string;
    paymentMethod?: string;
  }

  const allItems: ExpenseItem[] = [
    // 1. Diesel Expenses
    ...dieselRecords.map(d => ({
      id: d.id,
      category: 'Diesel Expense' as const,
      date: d.date,
      description: `Diesel ${d.dieselLiters}L for ${d.vehicleNumber} (KM: ${d.totalKm})`,
      amount: d.totalAmount,
      reference: d.vehicleNumber,
      paymentMethod: 'Fuel Card / Account'
    })),
    // 2. AdBlue / DEF Expenses
    ...adblueRecords.map(a => ({
      id: a.id,
      category: 'AdBlue / DEF Expense' as const,
      date: a.date,
      description: `DEF ${a.adblueLiters}L for ${a.vehicleNumber} (KM: ${a.totalKm})`,
      amount: a.totalAmount,
      reference: a.vehicleNumber,
      paymentMethod: 'Account'
    })),
    // 3. Toll Expenses
    ...tollExpenses.map(t => ({
      id: t.id,
      category: 'Toll Expense' as const,
      date: t.date,
      description: `Toll: ${t.tollgateNameOrTrip}`,
      amount: t.amount,
      reference: t.transactionType,
      paymentMethod: t.transactionType
    })),
    // 4. Vehicle Maintenance Expenses (Completed & Paid jobs only)
    ...complaints
      .filter(c => c.status === 'Completed' && c.paymentStatus === 'Paid')
      .map(c => ({
        id: c.id,
        category: 'Maintenance Expense' as const,
        date: c.completionDate || c.complaintDate,
        description: `Repair for ${c.vehicleNumber}: ${c.complaintDetails} (${c.repairPartsUsed || 'Overhaul'})`,
        amount: c.totalCost,
        reference: c.workshopName,
        paymentMethod: c.paymentMethod
      })),
    // 5. Vehicle Document Expenses
    ...vehicleDocExpenses.map(v => ({
      id: v.id,
      category: 'Document Expense' as const,
      date: v.date,
      description: `${v.documentType} for ${v.vehicleNumber} (Fine: ₹${v.fineAmount || 0})`,
      amount: v.amount + (v.fineAmount || 0),
      reference: v.vehicleNumber,
      paymentMethod: v.paymentMethod
    })),
    // 6. Driver Advances
    ...driverAdvances.map(adv => ({
      id: adv.id,
      category: 'Salary & Driver Advance' as const,
      date: adv.date,
      description: `Advance to ${adv.driverName}: ${adv.remarks || 'Trip advance'}`,
      amount: adv.amount,
      reference: adv.driverName,
      paymentMethod: 'Cash / UPI'
    })),
    // 7. Driver Company Expenses
    ...driverCompanyExpenses.map(exp => ({
      id: exp.id,
      category: 'Salary & Driver Advance' as const,
      date: exp.date,
      description: `Staff expense for ${exp.driverName}: ${exp.details}`,
      amount: exp.amount,
      reference: exp.driverName,
      paymentMethod: 'Office Direct'
    }))
  ];

  // Apply filters
  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDate = isWithinRange(item.date);
    return matchesCategory && matchesDate;
  }).sort((a, b) => (a.date < b.date ? 1 : -1));

  // Category totals
  const dieselTotal = filteredItems.filter(i => i.category === 'Diesel Expense').reduce((s, i) => s + i.amount, 0);
  const adblueTotal = filteredItems.filter(i => i.category === 'AdBlue / DEF Expense').reduce((s, i) => s + i.amount, 0);
  const tollTotal = filteredItems.filter(i => i.category === 'Toll Expense').reduce((s, i) => s + i.amount, 0);
  const maintTotal = filteredItems.filter(i => i.category === 'Maintenance Expense').reduce((s, i) => s + i.amount, 0);
  const docTotal = filteredItems.filter(i => i.category === 'Document Expense').reduce((s, i) => s + i.amount, 0);
  const salaryTotal = filteredItems.filter(i => i.category === 'Salary & Driver Advance').reduce((s, i) => s + i.amount, 0);
  const grandTotal = dieselTotal + adblueTotal + tollTotal + maintTotal + docTotal + salaryTotal;

  // Budget Analysis
  const budgetVariance = monthlyBudgetTarget - grandTotal;
  const budgetUtilization = monthlyBudgetTarget > 0 ? Math.min(100, Math.round((grandTotal / monthlyBudgetTarget) * 100)) : 0;

  const reportHeaders = [
    'Date',
    'Category',
    'Description / Work Details',
    'Reference / Truck',
    'Payment Mode',
    'Amount (₹)'
  ];

  const reportRows = filteredItems.map(item => [
    item.date,
    item.category,
    item.description,
    item.reference,
    item.paymentMethod || 'Direct',
    `₹${item.amount.toLocaleString('en-IN')}`
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-orange-400" />
            <span>Complete Total Expense Tracking & Reporting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated financial consolidation across Salary, Document, Maintenance, Toll, Diesel, and AdBlue modules.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-[#070c17] border border-[#1e2f50] text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consolidated Grand Total</span>
          <span className="text-lg font-black text-orange-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="S TRANZ Total Operating Expenses Consolidated Audit Report"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onResetDates={() => {
          setDateFrom('');
          setDateTo('');
          setSelectedCategory('All');
        }}
        headers={reportHeaders}
        rows={reportRows}
        totals={[
          { label: 'Diesel Total', value: `₹${dieselTotal.toLocaleString('en-IN')}` },
          { label: 'Maintenance Total', value: `₹${maintTotal.toLocaleString('en-IN')}` },
          { label: 'Toll Total', value: `₹${tollTotal.toLocaleString('en-IN')}` },
          { label: 'Documents & Fines', value: `₹${docTotal.toLocaleString('en-IN')}` },
          { label: 'Driver Outflows', value: `₹${salaryTotal.toLocaleString('en-IN')}` },
          { label: 'GRAND TOTAL EXPENSE', value: `₹${grandTotal.toLocaleString('en-IN')}` }
        ]}
      />

      {/* Monthly Budget Analysis Dashboard Panel */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1b2b48] gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Monthly Operating Budget vs Actual Outflows
              </h3>
              <p className="text-[11px] text-slate-400">
                Fleet operations budget management and variance metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Budget Cap:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-mono">₹</span>
              <input
                type="number"
                step="5000"
                value={monthlyBudgetTarget}
                onChange={e => setMonthlyBudgetTarget(Number(e.target.value))}
                className="w-32 pl-6 pr-2 py-1 bg-[#060a12] border border-[#1f3152] rounded-lg text-xs font-mono font-bold text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-[#070c17] rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Monthly Budget</span>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              ₹{monthlyBudgetTarget.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 bg-[#070c17] rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Actual Spent</span>
            <div className="text-xl font-bold font-mono text-orange-400 mt-1">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 bg-[#070c17] rounded-lg border border-[#16233a]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Budget Balance / Variance</span>
            <div className={`text-xl font-bold font-mono mt-1 ${budgetVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {budgetVariance >= 0 ? `+₹${budgetVariance.toLocaleString('en-IN')}` : `-₹${Math.abs(budgetVariance).toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Budget Consumption: {budgetUtilization}%</span>
            <span className="font-mono text-slate-400">
              ₹{grandTotal.toLocaleString('en-IN')} / ₹{monthlyBudgetTarget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#070c17] rounded-full overflow-hidden border border-[#1b2b48]">
            <div
              className={`h-full transition-all duration-500 ${
                budgetUtilization > 90 ? 'bg-red-500' : budgetUtilization > 70 ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category-wise Breakdown Cards (6 Pillars) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Diesel */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'Diesel Expense' ? 'All' : 'Diesel Expense')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'Diesel Expense'
              ? 'bg-orange-950/40 border-orange-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Diesel</span>
            <Fuel className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{dieselTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>

        {/* AdBlue / DEF */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'AdBlue / DEF Expense' ? 'All' : 'AdBlue / DEF Expense')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'AdBlue / DEF Expense'
              ? 'bg-blue-950/40 border-blue-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">DEF / AdBlue</span>
            <Fuel className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{adblueTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>

        {/* Toll */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'Toll Expense' ? 'All' : 'Toll Expense')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'Toll Expense'
              ? 'bg-orange-950/40 border-orange-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Tollgate</span>
            <Receipt className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{tollTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>

        {/* Maintenance */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'Maintenance Expense' ? 'All' : 'Maintenance Expense')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'Maintenance Expense'
              ? 'bg-orange-950/40 border-orange-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Repairs</span>
            <Wrench className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{maintTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>

        {/* Documents */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'Document Expense' ? 'All' : 'Document Expense')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'Document Expense'
              ? 'bg-orange-950/40 border-orange-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Docs & Taxes</span>
            <FileText className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{docTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>

        {/* Salary Outflows */}
        <div
          onClick={() => setSelectedCategory(selectedCategory === 'Salary & Driver Advance' ? 'All' : 'Salary & Driver Advance')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'Salary & Driver Advance'
              ? 'bg-orange-950/40 border-orange-500 shadow-md'
              : 'bg-[#0b1324] border-[#1c2c47] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Driver Outflows</span>
            <BadgeIndianRupee className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            ₹{salaryTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Click to isolate</span>
        </div>
      </div>

      {/* Comprehensive Ledger Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="p-3 border-b border-[#1b2b48] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Consolidated Expense Ledger ({filteredItems.length} Transactions)
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-[11px] text-orange-400 hover:underline cursor-pointer"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Expense Category</th>
                <th className="py-3 px-3">Description & Line Items</th>
                <th className="py-3 px-3">Reference / Target</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 font-mono text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No expense records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={`${item.category}_${item.id}`} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142036] text-orange-300 border border-[#1e2f50]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {item.reference}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {item.paymentMethod || 'Direct'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 text-sm text-right">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
