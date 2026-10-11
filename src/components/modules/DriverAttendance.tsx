import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Users,
  Sun,
  Flag,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AttendanceStatus } from '../../types';
import { ReportToolbar } from '../common/ReportToolbar';
import { ActionButtons } from '../common/ActionButtons';
import { printHtmlDocument } from '../../utils/exportUtils';

export const DriverAttendance: React.FC = () => {
  const { drivers, attendance, markAttendance, officeDetails } = useData();

  // Mode: Daily Attendance or Monthly Calendar / School Register
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');

  // Daily Mode State
  const [selectedDailyDate, setSelectedDailyDate] = useState('2026-10-05');

  // Monthly Mode State
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState('2026-10'); // YYYY-MM

  // Date range for reports
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Active drivers only (resigned drivers excluded from new attendance)
  const activeDrivers = drivers.filter(d => d.status === 'Active' || d.status === 'Resigning / Exit Process');
  const allDriversForLedger = drivers;
  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  // Helper to get status of a driver on a date
  const getAttendanceStatus = (date: string, driverId: string): AttendanceStatus | null => {
    const record = attendance.find(a => a.date === date && a.driverId === driverId);
    return record ? record.status : null;
  };

  const handleMarkDaily = (driverId: string, status: AttendanceStatus) => {
    const res = markAttendance(selectedDailyDate, driverId, status);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const handleMarkBulkSpecial = (status: 'Sunday' | 'Government Holiday') => {
    activeDrivers.forEach(d => {
      markAttendance(selectedDailyDate, d.id, status);
    });
  };

  // Generate days in month for calendar & school register
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateFormatted = `${yearStr}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, dayNum);
    const dayOfWeek = dateObj.getDay();
    const isSunday = dayOfWeek === 0;
    const dayAbbr = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek];
    return {
      dayNum,
      date: dateFormatted,
      isSunday,
      dayAbbr
    };
  });

  // Calculate monthly stats for selected driver
  const driverMonthlyRecords = attendance.filter(
    a => a.driverId === selectedDriverId && a.date.startsWith(selectedMonth)
  );
  const presentDaysCount = driverMonthlyRecords.filter(a => a.status === 'Present').length;
  const absentDaysCount = driverMonthlyRecords.filter(a => a.status === 'Absent').length;
  const sundayDaysCount = driverMonthlyRecords.filter(a => a.status === 'Sunday').length;
  const holidayDaysCount = driverMonthlyRecords.filter(a => a.status === 'Government Holiday').length;

  // Filtered attendance for report export
  const filteredAttendance = attendance.filter(a => {
    if (dateFrom && a.date < dateFrom) return false;
    if (dateTo && a.date > dateTo) return false;
    if (selectedDriverId && viewMode === 'monthly' && a.driverId !== selectedDriverId) return false;
    return true;
  });

  const reportHeaders = ['Date', 'Driver Name', 'Status'];
  const reportRows = filteredAttendance.map(a => [
    a.date,
    a.driverName,
    a.status
  ]);

  // Compute school register driver rows
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Print School Attendance Register PDF
  const handlePrintSchoolRegister = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>School_Register_Attendance_${selectedMonth}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 10px; font-size: 9.5px; }
    .header { border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .title-box { text-align: center; margin-bottom: 10px; }
    .title { font-size: 15px; font-weight: 900; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 11px; color: #475569; font-weight: bold; margin-top: 2px; }
    .legend { display: flex; justify-content: center; gap: 15px; font-size: 9px; margin-bottom: 8px; font-weight: bold; }
    .leg-item { display: inline-flex; align-items: center; gap: 3px; }
    table.register-table { width: 100%; border-collapse: collapse; font-size: 8.5px; table-layout: fixed; }
    table.register-table th, table.register-table td { border: 1px solid #475569; padding: 3px 2px; text-align: center; overflow: hidden; }
    table.register-table th { background-color: #0f172a; color: #ffffff; font-weight: 800; font-size: 8px; }
    table.register-table th.sunday-head { background-color: #b45309; }
    table.register-table td.driver-col { text-align: left; padding-left: 5px; font-weight: bold; white-space: nowrap; }
    .status-p { color: #15803d; font-weight: 900; }
    .status-a { color: #b91c1c; font-weight: 900; background: #fee2e2; }
    .status-s { color: #b45309; font-weight: 700; background: #fef3c7; }
    .status-h { color: #1d4ed8; font-weight: 700; background: #dbeafe; }
    .status-dash { color: #94a3b8; }
    .tot-head { background: #1e293b !important; }
    .summary-row td { font-weight: 800; background: #f1f5f9; }
    .footer-signs { margin-top: 25px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sign-line { width: 180px; border-top: 1px solid #334155; text-align: center; padding-top: 4px; font-size: 9px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin: 0; font-size: 16px; font-weight: 900; text-transform: uppercase;">${officeDetails.companyName}</h1>
      <div style="font-size: 9px; color: #475569;">${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber}</div>
    </div>
    <div style="text-align: right; font-size: 9px; color: #64748b;">
      School Attendance Register Format<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div class="title">MONTHLY DRIVER ATTENDANCE REGISTER - ${monthName.toUpperCase()}</div>
    <div class="subtitle">Fleet Operations Roster (Month-wise School Register Ledger)</div>
  </div>

  <div class="legend">
    <span class="leg-item"><strong class="status-p">P</strong> = Present</span>
    <span class="leg-item"><strong class="status-a">A</strong> = Absent</span>
    <span class="leg-item"><strong class="status-s">S</strong> = Sunday</span>
    <span class="leg-item"><strong class="status-h">H</strong> = Govt Holiday</span>
    <span class="leg-item"><strong class="status-dash">-</strong> = Pre-Joining / Resigned</span>
  </div>

  <table class="register-table">
    <thead>
      <tr>
        <th style="width: 25px;">S.No</th>
        <th style="width: 110px; text-align: left; padding-left: 5px;">Driver Name</th>
        <th style="width: 65px;">Vehicle No</th>
        ${calendarDays.map(d => `<th class="${d.isSunday ? 'sunday-head' : ''}">${d.dayNum}<br/>${d.dayAbbr}</th>`).join('')}
        <th class="tot-head" style="width: 24px;">P</th>
        <th class="tot-head" style="width: 24px;">A</th>
        <th class="tot-head" style="width: 24px;">S</th>
        <th class="tot-head" style="width: 24px;">H</th>
        <th class="tot-head" style="width: 32px;">% Att</th>
      </tr>
    </thead>
    <tbody>
      ${allDriversForLedger.map((d, idx) => {
        let pCount = 0;
        let aCount = 0;
        let sCount = 0;
        let hCount = 0;

        const dayCells = calendarDays.map(cd => {
          const isBeforeJoining = cd.date < d.dateOfJoining;
          const isAfterResignation = d.resignationDate && cd.date > d.resignationDate;

          if (isBeforeJoining || isAfterResignation) {
            return `<td class="status-dash">-</td>`;
          }

          const status = getAttendanceStatus(cd.date, d.id);
          if (status === 'Present') {
            pCount++;
            return `<td class="status-p">P</td>`;
          } else if (status === 'Absent') {
            aCount++;
            return `<td class="status-a">A</td>`;
          } else if (status === 'Sunday') {
            sCount++;
            return `<td class="status-s">S</td>`;
          } else if (status === 'Government Holiday') {
            hCount++;
            return `<td class="status-h">H</td>`;
          } else {
            // Default Sunday or unset
            if (cd.isSunday) {
              sCount++;
              return `<td class="status-s">S</td>`;
            }
            return `<td class="status-dash">-</td>`;
          }
        }).join('');

        const totalMarkedDays = pCount + aCount;
        const attPct = totalMarkedDays > 0 ? Math.round((pCount / totalMarkedDays) * 100) : 0;

        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="driver-col">${d.driverName}</td>
            <td>${d.assignedVehicleNumber || 'Float'}</td>
            ${dayCells}
            <td style="font-weight: bold; color: #15803d;">${pCount}</td>
            <td style="font-weight: bold; color: #b91c1c;">${aCount}</td>
            <td style="font-weight: bold; color: #b45309;">${sCount}</td>
            <td style="font-weight: bold; color: #1d4ed8;">${hCount}</td>
            <td style="font-weight: bold;">${attPct}%</td>
          </tr>
        `;
      }).join('')}

      <tr class="summary-row">
        <td colspan="3" style="text-align: right; padding-right: 6px;">Daily Total Present:</td>
        ${calendarDays.map(cd => {
          const dailyPresentCount = allDriversForLedger.filter(d => {
            if (cd.date < d.dateOfJoining) return false;
            if (d.resignationDate && cd.date > d.resignationDate) return false;
            return getAttendanceStatus(cd.date, d.id) === 'Present';
          }).length;
          return `<td style="color: #15803d; font-weight: 800;">${dailyPresentCount || (cd.isSunday ? '-' : 0)}</td>`;
        }).join('')}
        <td colspan="5">-</td>
      </tr>

      <tr class="summary-row">
        <td colspan="3" style="text-align: right; padding-right: 6px;">Daily Total Absent:</td>
        ${calendarDays.map(cd => {
          const dailyAbsentCount = allDriversForLedger.filter(d => {
            if (cd.date < d.dateOfJoining) return false;
            if (d.resignationDate && cd.date > d.resignationDate) return false;
            return getAttendanceStatus(cd.date, d.id) === 'Absent';
          }).length;
          return `<td style="color: #b91c1c; font-weight: 800;">${dailyAbsentCount || 0}</td>`;
        }).join('')}
        <td colspan="5">-</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-signs">
    <div class="sign-line">Register In-Charge / Staff</div>
    <div class="sign-line">Fleet Transport Manager</div>
    <div class="sign-line">Authorized Signatory</div>
  </div>
</body>
</html>
    `;
    printHtmlDocument(`School_Register_Attendance_${selectedMonth}`, html);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-orange-400" />
            <span>Driver Attendance Maintenance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Month-wise attendance maintained in official <strong>School Attendance Register format</strong>. Anchored strictly to driver joining dates.
          </p>
        </div>

        {/* View Mode Toggle: Monthly (School Register) vs Daily */}
        <div className="flex items-center gap-1.5 p-1 bg-[#060a12] border border-[#1d2d4a] rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'monthly'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Monthly Attendance Chart (School Format)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Daily Roster
          </button>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle={`Driver Attendance Report (${viewMode === 'monthly' ? 'Monthly School Register' : 'Daily Roster'})`}
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
          { label: 'Total Records Exported', value: filteredAttendance.length }
        ]}
      />

      {/* VIEW 1: MONTHLY ATTENDANCE CHART (SCHOOL REGISTER FORMAT) */}
      {viewMode === 'monthly' && (
        <div className="space-y-4">
          {/* Month Selector & Register Header Bar */}
          <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Attendance Month:</span>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-[#060a12] border border-[#1e2f50] text-xs font-mono font-bold text-slate-100 rounded-lg px-3 py-1.5 focus:border-orange-500 focus:outline-none"
              />
              <span className="text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2.5 py-1 rounded-md uppercase">
                {monthName}
              </span>
            </div>

            {/* School Format Legend & Print Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 text-[11px] bg-[#070c17] px-3 py-1 rounded-lg border border-[#16233a]">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px]">P</span>
                  <span>Present</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-red-400">
                  <span className="w-3.5 h-3.5 rounded bg-red-600 text-white flex items-center justify-center text-[9px]">A</span>
                  <span>Absent</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <span className="w-3.5 h-3.5 rounded bg-amber-600 text-white flex items-center justify-center text-[9px]">S</span>
                  <span>Sunday</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-blue-400">
                  <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white flex items-center justify-center text-[9px]">H</span>
                  <span>Holiday</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrintSchoolRegister}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Print or Download Monthly Attendance Chart in School Register format"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print School Register</span>
              </button>
            </div>
          </div>

          {/* SCHOOL ATTENDANCE REGISTER TABLE */}
          <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-[#080d1a] border-b border-[#17253e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                  Monthly Attendance Chart (School Register Format)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any day cell to cycle status (Present → Absent → Sunday → Holiday)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead className="bg-[#070c17] text-slate-300 border-b border-[#1b2b48]">
                  <tr>
                    <th className="py-2.5 px-2 text-left sticky left-0 z-20 bg-[#070c17] border-r border-[#1a2944] min-w-[150px]">
                      Driver Name
                    </th>
                    <th className="py-2.5 px-1.5 text-center border-r border-[#1a2944] min-w-[75px] font-mono text-[10px]">
                      Vehicle
                    </th>
                    {calendarDays.map(cd => (
                      <th
                        key={cd.date}
                        className={`py-1.5 px-1 min-w-[28px] border-r border-[#16233a] font-mono ${
                          cd.isSunday ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{cd.dayNum}</div>
                        <div className="text-[9px] opacity-75">{cd.dayAbbr}</div>
                      </th>
                    ))}
                    <th className="py-2 px-1.5 bg-[#0f192e] text-emerald-400 font-bold border-l border-[#1d2d4a] min-w-[32px]">
                      P
                    </th>
                    <th className="py-2 px-1.5 bg-[#0f192e] text-red-400 font-bold min-w-[32px]">
                      A
                    </th>
                    <th className="py-2 px-1.5 bg-[#0f192e] text-amber-400 font-bold min-w-[32px]">
                      S
                    </th>
                    <th className="py-2 px-1.5 bg-[#0f192e] text-blue-400 font-bold min-w-[32px]">
                      H
                    </th>
                    <th className="py-2 px-2 bg-[#0f192e] text-slate-200 font-bold min-w-[45px]">
                      % Att
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#142036] text-slate-200">
                  {allDriversForLedger.map((driver, dIdx) => {
                    let dPresent = 0;
                    let dAbsent = 0;
                    let dSunday = 0;
                    let dHoliday = 0;

                    return (
                      <tr key={driver.id} className="hover:bg-[#0f1b32] transition-colors">
                        {/* Driver Name (Frozen Left) */}
                        <td className="py-2 px-2 text-left sticky left-0 z-10 bg-[#0b1324] border-r border-[#1a2944] font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-mono w-4">{dIdx + 1}.</span>
                            <span className="text-slate-100">{driver.driverName}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 pl-5">Joined: {driver.dateOfJoining}</div>
                        </td>

                        {/* Vehicle Number */}
                        <td className="py-2 px-1 border-r border-[#1a2944] font-mono text-[10px] text-slate-400">
                          {driver.assignedVehicleNumber || 'Float'}
                        </td>

                        {/* Days 1 to 31 */}
                        {calendarDays.map(cd => {
                          const isBeforeJoining = cd.date < driver.dateOfJoining;
                          const isAfterResignation = driver.resignationDate && cd.date > driver.resignationDate;
                          const status = getAttendanceStatus(cd.date, driver.id);

                          if (!isBeforeJoining && !isAfterResignation) {
                            if (status === 'Present') dPresent++;
                            else if (status === 'Absent') dAbsent++;
                            else if (status === 'Sunday') dSunday++;
                            else if (status === 'Government Holiday') dHoliday++;
                            else if (cd.isSunday) dSunday++;
                          }

                          const cycleCellStatus = () => {
                            if (isBeforeJoining) {
                              alert(`Attendance cannot start before driver joining date (${driver.dateOfJoining}).`);
                              return;
                            }
                            if (isAfterResignation) {
                              alert(`Driver resigned on ${driver.resignationDate}. Attendance closed.`);
                              return;
                            }
                            let next: AttendanceStatus = 'Present';
                            if (status === 'Present') next = 'Absent';
                            else if (status === 'Absent') next = 'Sunday';
                            else if (status === 'Sunday') next = 'Government Holiday';
                            else if (status === 'Government Holiday') next = 'Present';
                            markAttendance(cd.date, driver.id, next);
                          };

                          return (
                            <td
                              key={cd.date}
                              onClick={cycleCellStatus}
                              title={`${driver.driverName} - ${cd.date}: ${status || (cd.isSunday ? 'Sunday' : 'Not marked')}`}
                              className={`py-1 px-0.5 border-r border-[#16233a] cursor-pointer transition-all select-none ${
                                isBeforeJoining || isAfterResignation
                                  ? 'bg-[#060a12] opacity-35 cursor-not-allowed'
                                  : cd.isSunday
                                  ? 'bg-amber-950/20 hover:bg-amber-900/30'
                                  : 'hover:bg-slate-800'
                              }`}
                            >
                              {isBeforeJoining || isAfterResignation ? (
                                <span className="text-slate-600 text-[10px] font-mono">-</span>
                              ) : status === 'Present' ? (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                                  P
                                </span>
                              ) : status === 'Absent' ? (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-black bg-red-600 text-white shadow-xs">
                                  A
                                </span>
                              ) : status === 'Sunday' || (!status && cd.isSunday) ? (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-amber-600/80 text-white">
                                  S
                                </span>
                              ) : status === 'Government Holiday' ? (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-blue-600 text-white">
                                  H
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[10px] font-mono">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Driver Totals */}
                        <td className="py-2 px-1 font-mono font-bold text-emerald-400 bg-[#0c1629] border-l border-[#1d2d4a]">
                          {dPresent}
                        </td>
                        <td className="py-2 px-1 font-mono font-bold text-red-400 bg-[#0c1629]">
                          {dAbsent}
                        </td>
                        <td className="py-2 px-1 font-mono font-bold text-amber-400 bg-[#0c1629]">
                          {dSunday}
                        </td>
                        <td className="py-2 px-1 font-mono font-bold text-blue-400 bg-[#0c1629]">
                          {dHoliday}
                        </td>
                        <td className="py-2 px-1 font-mono font-bold text-slate-100 bg-[#0c1629]">
                          {dPresent + dAbsent > 0 ? `${Math.round((dPresent / (dPresent + dAbsent)) * 100)}%` : '0%'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* BOTTOM SUMMARY ROW 1: DAILY PRESENT */}
                  <tr className="bg-[#070c17] text-slate-300 font-bold text-[10px] border-t-2 border-[#1e2f50]">
                    <td className="py-2 px-2 text-left sticky left-0 z-10 bg-[#070c17] border-r border-[#1a2944] text-emerald-400">
                      Total Present
                    </td>
                    <td className="border-r border-[#1a2944]">-</td>
                    {calendarDays.map(cd => {
                      const dayPresentTotal = allDriversForLedger.filter(d => {
                        if (cd.date < d.dateOfJoining) return false;
                        if (d.resignationDate && cd.date > d.resignationDate) return false;
                        return getAttendanceStatus(cd.date, d.id) === 'Present';
                      }).length;
                      return (
                        <td key={cd.date} className="py-1 px-0.5 border-r border-[#16233a] font-mono text-emerald-400">
                          {dayPresentTotal > 0 ? dayPresentTotal : cd.isSunday ? '-' : 0}
                        </td>
                      );
                    })}
                    <td colSpan={5} className="bg-[#0a1222] text-slate-400">-</td>
                  </tr>

                  {/* BOTTOM SUMMARY ROW 2: DAILY ABSENT */}
                  <tr className="bg-[#070c17] text-slate-300 font-bold text-[10px]">
                    <td className="py-2 px-2 text-left sticky left-0 z-10 bg-[#070c17] border-r border-[#1a2944] text-red-400">
                      Total Absent
                    </td>
                    <td className="border-r border-[#1a2944]">-</td>
                    {calendarDays.map(cd => {
                      const dayAbsentTotal = allDriversForLedger.filter(d => {
                        if (cd.date < d.dateOfJoining) return false;
                        if (d.resignationDate && cd.date > d.resignationDate) return false;
                        return getAttendanceStatus(cd.date, d.id) === 'Absent';
                      }).length;
                      return (
                        <td key={cd.date} className="py-1 px-0.5 border-r border-[#16233a] font-mono text-red-400">
                          {dayAbsentTotal > 0 ? dayAbsentTotal : 0}
                        </td>
                      );
                    })}
                    <td colSpan={5} className="bg-[#0a1222] text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INDIVIDUAL DRIVER CALENDAR DRILLDOWN */}
          <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#17253e]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white uppercase">Individual Driver Monthly Calendar View:</span>
                <select
                  value={selectedDriverId}
                  onChange={e => setSelectedDriverId(e.target.value)}
                  className="bg-[#060a12] border border-[#1e2f50] text-xs font-semibold text-slate-100 rounded-lg px-2.5 py-1 focus:border-orange-500 focus:outline-none"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.driverName} (Joined: {d.dateOfJoining})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold font-mono">
                  Present: {presentDaysCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-400 font-bold font-mono">
                  Absent: {absentDaysCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400 font-bold font-mono">
                  Sundays: {sundayDaysCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-400 font-bold font-mono">
                  Govt Holidays: {holidayDaysCount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {calendarDays.map(item => {
                const status = selectedDriver ? getAttendanceStatus(item.date, selectedDriver.id) : null;
                const isBeforeJoining = selectedDriver && item.date < selectedDriver.dateOfJoining;
                const isAfterResignation =
                  selectedDriver?.resignationDate && item.date > selectedDriver.resignationDate;

                const cycleStatus = () => {
                  if (isBeforeJoining) {
                    alert(`Attendance cannot start before driver joining date (${selectedDriver?.dateOfJoining}).`);
                    return;
                  }
                  if (isAfterResignation) {
                    alert(`Driver resigned on ${selectedDriver?.resignationDate}. Attendance closed.`);
                    return;
                  }
                  let next: AttendanceStatus = 'Present';
                  if (status === 'Present') next = 'Absent';
                  else if (status === 'Absent') next = 'Sunday';
                  else if (status === 'Sunday') next = 'Government Holiday';
                  else if (status === 'Government Holiday') next = 'Present';
                  if (selectedDriver) markAttendance(item.date, selectedDriver.id, next);
                };

                return (
                  <div
                    key={item.date}
                    onClick={cycleStatus}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[70px] ${
                      isBeforeJoining
                        ? 'bg-[#080d17]/50 border-[#141e30] opacity-40 cursor-not-allowed'
                        : isAfterResignation
                        ? 'bg-red-950/20 border-red-900/30 opacity-50 cursor-not-allowed'
                        : item.isSunday
                        ? 'bg-[#121927] border-amber-600/40 hover:border-amber-500'
                        : 'bg-[#070c17] border-[#1d2d4a] hover:border-orange-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-300">Day {item.dayNum}</span>
                      {item.isSunday && (
                        <span className="text-[10px] text-amber-400 font-bold">SUN</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      {isBeforeJoining ? (
                        <span className="text-[10px] text-slate-500 block">Pre-Joining</span>
                      ) : isAfterResignation ? (
                        <span className="text-[10px] text-red-400 block">Resigned</span>
                      ) : status ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : status === 'Absent'
                              ? 'bg-red-600 text-white'
                              : status === 'Sunday'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block">- Not Set -</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY ATTENDANCE */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Daily Controls Bar */}
          <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <label className="text-xs font-bold text-slate-300">Daily Attendance Date:</label>
              <input
                type="date"
                value={selectedDailyDate}
                onChange={e => setSelectedDailyDate(e.target.value)}
                className="bg-[#060a12] border border-[#1e2f50] text-xs font-mono text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Quick Bulk Special Status Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkBulkSpecial('Sunday')}
                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Mark All Sunday</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkBulkSpecial('Government Holiday')}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 text-blue-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Mark All Govt Holiday</span>
              </button>
            </div>
          </div>

          {/* Daily Roster Table */}
          <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Driver Name</th>
                    <th className="py-3 px-3">Joining Date</th>
                    <th className="py-3 px-3">Assigned Vehicle</th>
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-3 text-center">Mark Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16233a] text-slate-300">
                  {drivers.map(driver => {
                    const currentStatus = getAttendanceStatus(selectedDailyDate, driver.id);
                    const isBeforeJoining = selectedDailyDate < driver.dateOfJoining;
                    const isAfterResignation =
                      driver.resignationDate && selectedDailyDate > driver.resignationDate;

                    return (
                      <tr key={driver.id} className="hover:bg-[#0f192e] transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-100">
                          {driver.driverName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {driver.dateOfJoining}
                        </td>
                        <td className="py-3 px-3 font-mono text-orange-400">
                          {driver.assignedVehicleNumber || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3">
                          {isBeforeJoining ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              Before Joining Date
                            </span>
                          ) : isAfterResignation ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                              Resigned ({driver.resignationDate})
                            </span>
                          ) : currentStatus ? (
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                  : currentStatus === 'Absent'
                                  ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                                  : currentStatus === 'Sunday'
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                                  : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                              }`}
                            >
                              {currentStatus}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">Not Marked</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={isBeforeJoining || Boolean(isAfterResignation)}
                              onClick={() => handleMarkDaily(driver.id, 'Present')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              disabled={isBeforeJoining || Boolean(isAfterResignation)}
                              onClick={() => handleMarkDaily(driver.id, 'Absent')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                currentStatus === 'Absent'
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/40'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ActionButtons
                            onEdit={() => {
                              const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
                              handleMarkDaily(driver.id, newStatus);
                            }}
                            onDelete={() => {
                              markAttendance(selectedDailyDate, driver.id, 'Absent');
                            }}
                            itemName={`attendance record for ${driver.driverName} on ${selectedDailyDate}`}
                            compact={true}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
