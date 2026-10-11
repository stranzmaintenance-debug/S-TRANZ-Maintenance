import React, { useState } from 'react';
import {
  Truck,
  Users,
  AlertCircle,
  Wrench,
  Fuel,
  Receipt,
  BadgeIndianRupee,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  FileWarning
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ReportToolbar } from '../common/ReportToolbar';
import { ModuleKey } from '../layout/Sidebar';

interface MainDashboardProps {
  onNavigateModule: (key: ModuleKey) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigateModule }) => {
  const {
    vehicles,
    drivers,
    attendance,
    complaints,
    dieselRecords,
    adblueRecords,
    tollExpenses,
    driverAdvances,
    driverCompanyExpenses,
    vehicleDocExpenses,
    trips
  } = useData();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Date filtering helper
  const isWithinRange = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    return true;
  };

  // 1. Vehicle counts
  const totalVehiclesCount = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.currentStatus === 'Active').length;
  const underMaintVehiclesCount = vehicles.filter(v => v.currentStatus === 'Under Maintenance').length;

  // 2. Active drivers count
  const activeDriversCount = drivers.filter(d => d.status === 'Active').length;

  // 3. Today's attendance
  const today = '2026-10-05';
  const todayAttendance = attendance.filter(a => a.date === today);
  const todayPresentCount = todayAttendance.filter(a => a.status === 'Present').length;
  const todayAbsentCount = todayAttendance.filter(a => a.status === 'Absent').length;

  // 4. Pending complaints
  const filteredComplaints = complaints.filter(c => isWithinRange(c.complaintDate));
  const pendingComplaintsCount = filteredComplaints.filter(c => c.status !== 'Completed').length;

  // 5. Maintenance Expenses (only completed & paid maintenance)
  const maintenanceExpensesTotal = filteredComplaints
    .filter(c => c.status === 'Completed' && c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + c.totalCost, 0);

  // 6. Diesel & AdBlue Expenses
  const filteredDiesel = dieselRecords.filter(d => isWithinRange(d.date));
  const dieselExpensesTotal = filteredDiesel.reduce((sum, d) => sum + d.totalAmount, 0);

  const filteredAdBlue = adblueRecords.filter(a => isWithinRange(a.date));
  const adblueExpensesTotal = filteredAdBlue.reduce((sum, a) => sum + a.totalAmount, 0);

  const fuelTotal = dieselExpensesTotal + adblueExpensesTotal;

  // 7. Tollgate expenses
  const filteredToll = tollExpenses.filter(t => isWithinRange(t.date));
  const tollExpensesTotal = filteredToll.reduce((sum, t) => sum + t.amount, 0);

  // 8. Vehicle Document expenses
  const filteredDocExp = vehicleDocExpenses.filter(v => isWithinRange(v.date));
  const docExpensesTotal = filteredDocExp.reduce((sum, v) => sum + v.amount + (v.fineAmount || 0), 0);

  // 9. Driver Salary / Advances & Company expenses
  const filteredAdvances = driverAdvances.filter(a => isWithinRange(a.date));
  const filteredCompanyExp = driverCompanyExpenses.filter(e => isWithinRange(e.date));
  const totalAdvances = filteredAdvances.reduce((sum, a) => sum + a.amount, 0);
  const totalDriverCompanyExp = filteredCompanyExp.reduce((sum, e) => sum + e.amount, 0);

  // 10. Grand Total Expenses
  const grandTotalExpenses =
    maintenanceExpensesTotal +
    dieselExpensesTotal +
    adblueExpensesTotal +
    tollExpensesTotal +
    docExpensesTotal +
    totalAdvances +
    totalDriverCompanyExp;

  // Document Validity Expiry Warnings (under 60 days)
  const expiringDocs: { vehicleNumber: string; docType: string; expiryDate: string }[] = [];
  const expiryCutoff = '2026-12-31';

  vehicles.forEach(v => {
    if (v.insuranceValidDate && v.insuranceValidDate <= expiryCutoff) {
      expiringDocs.push({ vehicleNumber: v.vehicleNumber, docType: 'Insurance', expiryDate: v.insuranceValidDate });
    }
    if (v.fitnessValidDate && v.fitnessValidDate <= expiryCutoff) {
      expiringDocs.push({ vehicleNumber: v.vehicleNumber, docType: 'Fitness', expiryDate: v.fitnessValidDate });
    }
    if (v.taxValidDate && v.taxValidDate <= expiryCutoff) {
      expiringDocs.push({ vehicleNumber: v.vehicleNumber, docType: 'Road Tax', expiryDate: v.taxValidDate });
    }
    if (v.puccValidDate && v.puccValidDate <= expiryCutoff) {
      expiringDocs.push({ vehicleNumber: v.vehicleNumber, docType: 'PUCC', expiryDate: v.puccValidDate });
    }
  });

  // Table data for report export
  const reportHeaders = ['Metric / Expense Category', 'Count / Quantity', 'Recorded Total Amount'];
  const reportRows: (string | number)[][] = [
    ['Total Registered Fleet Vehicles', `${totalVehiclesCount} (${activeVehiclesCount} Active)`, '-'],
    ['Active Transport Drivers', `${activeDriversCount} Drivers`, '-'],
    ["Today's Attendance", `${todayPresentCount} Present / ${todayAbsentCount} Absent`, '-'],
    ['Pending Vehicle Complaints', `${pendingComplaintsCount} Pending/In-Progress`, '-'],
    ['Vehicle Maintenance Expense', `${filteredComplaints.filter(c => c.status === 'Completed').length} Completed Jobs`, `₹${maintenanceExpensesTotal.toLocaleString('en-IN')}`],
    ['Diesel Fuel Expense', `${filteredDiesel.length} Refuels`, `₹${dieselExpensesTotal.toLocaleString('en-IN')}`],
    ['AdBlue / DEF Expense', `${filteredAdBlue.length} Refuels`, `₹${adblueExpensesTotal.toLocaleString('en-IN')}`],
    ['Tollgate Expressway Expense', `${filteredToll.length} Transactions`, `₹${tollExpensesTotal.toLocaleString('en-IN')}`],
    ['Vehicle Document / Permit / Tax Expense', `${filteredDocExp.length} Entries`, `₹${docExpensesTotal.toLocaleString('en-IN')}`],
    ['Driver Advances & Operational Expenses', `${filteredAdvances.length + filteredCompanyExp.length} Entries`, `₹${(totalAdvances + totalDriverCompanyExp).toLocaleString('en-IN')}`],
    ['GRAND TOTAL OPERATING EXPENSES', 'All Operational Categories', `₹${grandTotalExpenses.toLocaleString('en-IN')}`]
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Fleet Operations & Maintenance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of commercial vehicles, drivers, fuel logs, and operating expenditures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#070c17] border border-[#1e2f50] text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Today's Date</div>
            <div className="text-xs font-bold text-orange-400 font-mono">05-OCT-2026</div>
          </div>
        </div>
      </div>

      {/* Global Report & Date Filter Toolbar */}
      <ReportToolbar
        moduleTitle="Dashboard Overview & Expenses Summary"
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
          { label: 'Total Recorded Expenses', value: `₹${grandTotalExpenses.toLocaleString('en-IN')}` }
        ]}
      />

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Vehicles Card */}
        <div
          onClick={() => onNavigateModule('vehicles')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Vehicles</span>
            <div className="p-2 rounded-lg bg-[#142036] text-orange-400 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono-numbers">{totalVehiclesCount}</span>
            <span className="text-xs text-emerald-400 font-medium">({activeVehiclesCount} Active)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Maintenance: {underMaintVehiclesCount}</span>
            <span className="text-orange-400 flex items-center gap-0.5 font-medium group-hover:underline">
              View Register <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div
          onClick={() => onNavigateModule('drivers')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Drivers</span>
            <div className="p-2 rounded-lg bg-[#142036] text-orange-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono-numbers">{activeDriversCount}</span>
            <span className="text-xs text-slate-400">Total: {drivers.length}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified HGV Licenses</span>
            <span className="text-orange-400 flex items-center gap-0.5 font-medium group-hover:underline">
              Manage <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pending Vehicle Complaints */}
        <div
          onClick={() => onNavigateModule('complaints')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Complaints</span>
            <div className="p-2 rounded-lg bg-[#142036] text-amber-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono-numbers">{pendingComplaintsCount}</span>
            <span className="text-xs text-slate-400">Total: {filteredComplaints.length}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Requires Workshop Attention</span>
            <span className="text-orange-400 flex items-center gap-0.5 font-medium group-hover:underline">
              Track <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Expense KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Vehicle Maintenance Expenses */}
        <div
          onClick={() => onNavigateModule('maintenance_expenses')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Maintenance</span>
            <Wrench className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono-numbers">
            ₹{maintenanceExpensesTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Completed & Paid Jobs</p>
        </div>

        {/* Diesel & AdBlue Expenses */}
        <div
          onClick={() => onNavigateModule('diesel')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Diesel & AdBlue</span>
            <Fuel className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono-numbers">
            ₹{fuelTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Diesel: ₹{dieselExpensesTotal.toLocaleString('en-IN')} | DEF: ₹{adblueExpensesTotal.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Tollgate Expenses */}
        <div
          onClick={() => onNavigateModule('toll')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Tollgate FASTag</span>
            <Receipt className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono-numbers">
            ₹{tollExpensesTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Plaza Debits & Recharges</p>
        </div>

        {/* Driver Salary & Advances */}
        <div
          onClick={() => onNavigateModule('salary')}
          className="bg-[#0b1324] border border-[#1c2c47] hover:border-orange-500/60 rounded-xl p-4 shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Driver Advances</span>
            <BadgeIndianRupee className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono-numbers">
            ₹{(totalAdvances + totalDriverCompanyExp).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Advances + Company Ops</p>
        </div>

        {/* Grand Total Expenses */}
        <div
          onClick={() => onNavigateModule('total_expenses')}
          className="bg-gradient-to-br from-[#121c33] to-[#1e130c] border border-orange-500/50 rounded-xl p-4 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-orange-400 uppercase">Total Expenses</span>
            <PieChart className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-300 font-mono-numbers">
            ₹{grandTotalExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-orange-200/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-orange-400" /> All Operational Outflows
          </p>
        </div>
      </div>

      {/* Split Section: Validity Expiry Alerts & Active Fleet Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Validity Alerts Card */}
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Upcoming Document Validity Expiries
              </h3>
            </div>
            <button
              onClick={() => onNavigateModule('vehicles')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {expiringDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                All vehicle documents (Fitness, Insurance, RC, Tax, Permit) are up to date.
              </p>
            ) : (
              expiringDocs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#060a12] border border-[#1b2c49] rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-orange-400" />
                    <span className="font-bold text-slate-100 font-mono">{item.vehicleNumber}</span>
                    <span className="text-slate-400 font-medium">• {item.docType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono text-[11px] font-semibold">
                      Due: {item.expiryDate}
                    </span>
                    <button
                      onClick={() => onNavigateModule('vehicles')}
                      className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold underline"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Active Freight Trips */}
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Transport Trips
              </h3>
            </div>
            <button
              onClick={() => onNavigateModule('trips')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Trip Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {trips.slice(0, 3).map(trip => (
              <div
                key={trip.id}
                className="p-2.5 bg-[#060a12] border border-[#1b2c49] rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-orange-400 font-bold">{trip.tripNumber}</span>
                    <span className="text-slate-400">({trip.vehicleNumber})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#132038] text-slate-300 border border-[#1f3256]">
                    {trip.date}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium flex items-center justify-between">
                  <span className="truncate max-w-[260px]">
                    {trip.pickupLocation} → {trip.dropLocation}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Driver: {trip.driverName} • Client: {trip.customerName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
