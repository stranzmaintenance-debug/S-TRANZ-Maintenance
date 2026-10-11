import React, { useState } from 'react';
import { Receipt, Plus, Search, Filter, Save, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TollExpenseRecord } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';

export const TollExpense: React.FC = () => {
  const { tollExpenses, addTollExpense, updateTollExpense, deleteTollExpense } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<TollExpenseRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 1200,
    transactionType: 'FASTag Auto-Debit',
    tollgateNameOrTrip: '',
    billUpload: undefined
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 1200,
      transactionType: 'FASTag Auto-Debit',
      tollgateNameOrTrip: '',
      billUpload: undefined
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: TollExpenseRecord) => {
    setEditingId(t.id);
    setFormData({
      date: t.date,
      amount: t.amount,
      transactionType: t.transactionType,
      tollgateNameOrTrip: t.tollgateNameOrTrip,
      billUpload: t.billUpload
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      alert('Toll Amount is required');
      return;
    }
    if (editingId) {
      updateTollExpense(editingId, formData);
    } else {
      addTollExpense(formData);
    }
    setIsFormOpen(false);
  };

  // Filter and sort by date descending
  const filteredTolls = tollExpenses
    .filter(t => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.tollgateNameOrTrip.toLowerCase().includes(q) ||
        t.transactionType.toLowerCase().includes(q);
      const matchesType = filterType === 'All' || t.transactionType === filterType;

      let matchesDate = true;
      if (dateFrom && t.date < dateFrom) matchesDate = false;
      if (dateTo && t.date > dateTo) matchesDate = false;

      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const totalTollAmount = filteredTolls.reduce((sum, t) => sum + t.amount, 0);

  const reportHeaders = ['Date', 'Amount (₹)', 'Transaction Type', 'Toll Plaza / Description', 'Receipt Attachment'];
  const reportRows = filteredTolls.map(t => [
    t.date,
    `₹${t.amount.toLocaleString('en-IN')}`,
    t.transactionType,
    t.tollgateNameOrTrip,
    t.billUpload ? t.billUpload.fileName : 'None'
  ]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-400" />
            <span>Toll Expense Module</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Expressway plaza fees, FASTag recharges, and receipts sorted chronologically.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Toll Entry</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Toll Expenses Audit Report"
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
          { label: 'Total Toll Entries', value: filteredTolls.length },
          { label: 'Total Amount Spent', value: `₹${totalTollAmount.toLocaleString('en-IN')}` }
        ]}
      />

      {/* Search & Type Filter */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search toll plazas, FASTag, recharge descriptions..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Type:</span>
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="FASTag Auto-Debit">FASTag Auto-Debit</option>
            <option value="FASTag Manual Recharge">FASTag Manual Recharge</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Toll Table (Sorted by date) */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 font-mono">Amount (₹)</th>
                <th className="py-3 px-3">Transaction Type</th>
                <th className="py-3 px-3">Toll Plaza / Details</th>
                <th className="py-3 px-3">Bill Receipt</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredTolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No toll expense records found.
                  </td>
                </tr>
              ) : (
                filteredTolls.map(toll => (
                  <tr key={toll.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-orange-400">
                      {toll.date}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      ₹{toll.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#142036] text-slate-200 border border-[#1e2f50]">
                        {toll.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {toll.tollgateNameOrTrip}
                    </td>
                    <td className="py-3 px-3">
                      {toll.billUpload ? (
                        <span className="text-[11px] font-mono text-orange-300 truncate max-w-[130px] block" title={toll.billUpload.fileName}>
                          {toll.billUpload.fileName}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Bill</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {/* Consistent Action Buttons: Edit and Delete only */}
                      <ActionButtons
                        onEdit={() => handleOpenEdit(toll)}
                        onDelete={() => deleteTollExpense(toll.id)}
                        itemName={`Toll payment on ${toll.date} (₹${toll.amount})`}
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

      {/* ADD / EDIT TOLL MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingId ? 'Edit Toll Expense' : 'Log Toll Expense'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Toll Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Type</label>
                <select
                  value={formData.transactionType}
                  onChange={e => setFormData({ ...formData, transactionType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                >
                  <option value="FASTag Auto-Debit">FASTag Auto-Debit</option>
                  <option value="FASTag Manual Recharge">FASTag Manual Recharge</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Toll Plaza / Trip Reference</label>
                <input
                  type="text"
                  value={formData.tollgateNameOrTrip}
                  onChange={e => setFormData({ ...formData, tollgateNameOrTrip: e.target.value })}
                  placeholder="e.g. Coimbatore - Salem Toll Plaza"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <DocumentUploader
                  label="Bill Upload (Photo or PDF)"
                  document={formData.billUpload}
                  onUpload={doc => setFormData({ ...formData, billUpload: doc })}
                />
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
                  <span>{editingId ? 'Update Entry' : 'Save Toll Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
