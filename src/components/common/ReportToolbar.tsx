import React from 'react';
import { Calendar, Download, Printer, FileSpreadsheet, RotateCcw, CheckSquare, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { downloadCsv, printFormattedReport } from '../../utils/exportUtils';
import { exportTableToPdf } from '../../services/pdfService';

interface ReportToolbarProps {
  moduleTitle: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onResetDates: () => void;
  headers: string[];
  rows: (string | number)[][];
  totals?: { label: string; value: string | number }[];
  extraButtons?: React.ReactNode;
  selectedCount?: number;
  onDownloadSelectedPdf?: () => void;
  onDownloadAllPdf?: () => void;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  moduleTitle,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onResetDates,
  headers,
  rows,
  totals,
  extraButtons,
  selectedCount = 0,
  onDownloadSelectedPdf,
  onDownloadAllPdf
}) => {
  const { officeDetails } = useData();

  const handleDownloadCsv = () => {
    downloadCsv(`${moduleTitle}_Report`, headers, rows);
  };

  const handlePrint = () => {
    const dateRangeText = dateFrom || dateTo
      ? `Filtered Period: ${dateFrom || 'Earliest'} to ${dateTo || 'Latest'}`
      : 'Complete Records (All Dates)';

    printFormattedReport({
      title: `${moduleTitle} - Official Audit Report`,
      subtitle: `Exported from S TRANZ LOGISTIC MAINTENANCE System | Total Records: ${rows.length}`,
      dateRangeText,
      officeDetails,
      headers,
      rows,
      totals
    });
  };

  const handleDownloadPdf = async () => {
    const dateRangeText = dateFrom || dateTo
      ? `Period: ${dateFrom || 'Earliest'} to ${dateTo || 'Latest'}`
      : undefined;

    const safeTitle = moduleTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    const filename = `${safeTitle}_Report_${today}.pdf`;

    await exportTableToPdf({
      title: `${moduleTitle} - Official Audit Report`,
      subtitle: dateRangeText || `Total Records: ${rows.length}`,
      filename,
      headers,
      rows,
      totals,
      officeDetails
    });
  };

  const hasActiveFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3 sm:p-4 mb-5 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-1">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={e => onDateFromChange(e.target.value)}
                className="bg-[#070c17] border border-[#203152] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
                placeholder="From Date"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">From Date</span>
            </div>

            <span className="text-slate-500 text-xs font-mono">to</span>

            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={e => onDateToChange(e.target.value)}
                className="bg-[#070c17] border border-[#203152] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
                placeholder="To Date"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">To Date</span>
            </div>
          </div>

          {hasActiveFilter && (
            <button
              onClick={onResetDates}
              className="flex items-center gap-1 text-[11px] font-medium text-orange-400 hover:text-orange-300 bg-orange-950/40 hover:bg-orange-950/70 border border-orange-800/60 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Show all records without date filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}

          <div className="hidden sm:block text-xs text-slate-400 pl-2 border-l border-[#1e2d4d]">
            Showing <strong className="text-slate-200 font-mono">{rows.length}</strong> records
          </div>
        </div>

        {/* Action Buttons: PDF Download Options, Print / Save as PDF, Excel Download */}
        <div className="flex flex-wrap items-center gap-2">
          {extraButtons}

          {/* Option: Download Selected Records (Multi-select) */}
          {onDownloadSelectedPdf && selectedCount > 0 && (
            <button
              onClick={onDownloadSelectedPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all shadow-md cursor-pointer animate-pulse"
              title={`Download ${selectedCount} selected records as one combined PDF`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedCount}) PDF</span>
            </button>
          )}

          {/* Option: Download All Records (Complete Dossier/Combined PDF) */}
          {onDownloadAllPdf && (
            <button
              onClick={onDownloadAllPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-lg transition-colors cursor-pointer"
              title="Download all detailed records as one complete combined PDF dossier"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Download All Records (PDF)</span>
            </button>
          )}

          {/* Option: Download Current Table Report as Real PDF */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors shadow-sm cursor-pointer"
            title="Download real, valid PDF report with company header & totals"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-lg transition-colors cursor-pointer"
            title="Print or Save as PDF for A4 sheets"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
            title="Export clean data to Microsoft Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
