/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar, ModuleKey } from './components/layout/Sidebar';
import { MainDashboard } from './components/modules/MainDashboard';
import { VehicleRegister } from './components/modules/VehicleRegister';
import { DriverRegister } from './components/modules/DriverRegister';
import { DriverAttendance } from './components/modules/DriverAttendance';
import { TripRegister } from './components/modules/TripRegister';
import { VehicleComplaints } from './components/modules/VehicleComplaints';
import { FuelRegisters } from './components/modules/FuelRegisters';
import { TollExpense } from './components/modules/TollExpense';
import { VehicleMaintenanceExpense } from './components/modules/VehicleMaintenanceExpense';
import { VehicleDocumentExpense } from './components/modules/VehicleDocumentExpense';
import { DriverSalaryExpense } from './components/modules/DriverSalaryExpense';
import { TotalExpenses } from './components/modules/TotalExpenses';
import { DriverExitManagement } from './components/modules/DriverExitManagement';
import { OfficeDetailsModule } from './components/modules/OfficeDetailsModule';
import { BroadcastMessages } from './components/modules/BroadcastMessages';
import { AdminPortal } from './components/modules/AdminPortal';
import { PdfDownloadToast } from './components/common/PdfDownloadToast';
import { PublicVehicleDetailsPage } from './components/modules/PublicVehicleDetailsPage';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // QR CODE DIRECT SCAN ROUTE:
  // When a QR code is scanned via Google Camera / Google Lens / standard scanner,
  // the URL contains ?vehicleId=... or ?v=... or #vehicle=...
  // The user must immediately see the exact Vehicle Details page without login redirect.
  const [scannedVehicleId, setScannedVehicleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('vehicleId') || params.get('v');
      if (qId) return qId;
      const hash = window.location.hash;
      const hashMatch = hash.match(/vehicle[=/]([^&?]+)/i);
      if (hashMatch) return decodeURIComponent(hashMatch[1]);
    }
    return null;
  });

  // Listen for browser popstate or hashchange to dynamically respond to QR URLs
  React.useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('vehicleId') || params.get('v');
      if (qId) {
        setScannedVehicleId(qId);
        return;
      }
      const hashMatch = window.location.hash.match(/vehicle[=/]([^&?]+)/i);
      if (hashMatch) {
        setScannedVehicleId(decodeURIComponent(hashMatch[1]));
        return;
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // If a vehicle QR code was scanned, display only that vehicle's details page directly
  if (scannedVehicleId) {
    return (
      <PublicVehicleDetailsPage
        vehicleId={scannedVehicleId}
        onGoToPortal={() => {
          setScannedVehicleId(null);
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // RULE 1: When website is opened normally, Login Screen must be shown before authentication
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Module Title map for header breadcrumbs
  const moduleTitles: Record<ModuleKey, string> = {
    dashboard: 'Main Dashboard',
    vehicles: 'Vehicle Register',
    drivers: 'Driver Register',
    attendance: 'Driver Attendance',
    trips: 'Trip Register',
    complaints: 'Vehicle Complaints & Maintenance',
    diesel: 'Diesel Register',
    adblue: 'AdBlue Register',
    toll: 'Toll Expenses',
    maintenance_expenses: 'Vehicle Maintenance Expense',
    doc_expenses: 'Vehicle Document Expense',
    salary: 'Driver Salary Expense',
    total_expenses: 'Total Expense & Reports',
    exit_management: 'Driver Exit Register',
    office_details: 'Office Details',
    broadcasts: 'Broadcast Messages',
    admin_portal: 'Admin Section'
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <TopNavbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeModuleTitle={moduleTitles[activeModule]}
        onOpenBroadcasts={() => setActiveModule('broadcasts')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={key => setActiveModule(key)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070b12]">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && <MainDashboard onNavigateModule={setActiveModule} />}
            {activeModule === 'vehicles' && <VehicleRegister />}
            {activeModule === 'drivers' && <DriverRegister />}
            {activeModule === 'attendance' && <DriverAttendance />}
            {activeModule === 'trips' && <TripRegister />}
            {activeModule === 'complaints' && <VehicleComplaints />}
            {activeModule === 'diesel' && <FuelRegisters initialTab="diesel" />}
            {activeModule === 'adblue' && <FuelRegisters initialTab="adblue" />}
            {activeModule === 'toll' && <TollExpense />}
            {activeModule === 'maintenance_expenses' && <VehicleMaintenanceExpense />}
            {activeModule === 'doc_expenses' && <VehicleDocumentExpense />}
            {activeModule === 'salary' && <DriverSalaryExpense />}
            {activeModule === 'total_expenses' && <TotalExpenses />}
            {activeModule === 'exit_management' && <DriverExitManagement />}
            {activeModule === 'office_details' && <OfficeDetailsModule />}
            {activeModule === 'broadcasts' && <BroadcastMessages />}
            {activeModule === 'admin_portal' && <AdminPortal />}
          </div>
        </main>
      </div>

      {/* Global Real PDF Generation Status & Download Toast */}
      <PdfDownloadToast />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
