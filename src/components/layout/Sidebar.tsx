import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  CalendarCheck,
  MapPin,
  Wrench,
  Fuel,
  Receipt,
  FileCheck,
  FileText,
  BadgeIndianRupee,
  PieChart,
  UserX,
  Building2,
  Megaphone,
  ShieldAlert,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export type ModuleKey =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'attendance'
  | 'trips'
  | 'complaints'
  | 'diesel'
  | 'adblue'
  | 'toll'
  | 'maintenance_expenses'
  | 'doc_expenses'
  | 'salary'
  | 'total_expenses'
  | 'exit_management'
  | 'office_details'
  | 'broadcasts'
  | 'admin_portal';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onClose
}) => {
  const { currentUser, unreadBroadcastCount } = useData();
  const isAdmin = currentUser?.role === 'Admin';

  const operationalNavItems = [
    { key: 'dashboard' as ModuleKey, label: 'Main Dashboard', icon: LayoutDashboard },
    { key: 'vehicles' as ModuleKey, label: 'Vehicle Register', icon: Truck },
    { key: 'drivers' as ModuleKey, label: 'Driver Register', icon: Users },
    { key: 'attendance' as ModuleKey, label: 'Driver Attendance', icon: CalendarCheck },
    { key: 'trips' as ModuleKey, label: 'Trip Register', icon: MapPin },
    { key: 'complaints' as ModuleKey, label: 'Vehicle Complaints', icon: Wrench },
    { key: 'diesel' as ModuleKey, label: 'Diesel & AdBlue Register', icon: Fuel },
    { key: 'toll' as ModuleKey, label: 'Toll Expenses', icon: Receipt },
    { key: 'maintenance_expenses' as ModuleKey, label: 'Vehicle Maintenance Exp.', icon: FileCheck },
    { key: 'doc_expenses' as ModuleKey, label: 'Vehicle Document Exp.', icon: FileText },
    { key: 'salary' as ModuleKey, label: 'Driver Salary Expense', icon: BadgeIndianRupee },
    { key: 'total_expenses' as ModuleKey, label: 'Total Expense & Reports', icon: PieChart },
    { key: 'exit_management' as ModuleKey, label: 'Driver Exit Register', icon: UserX },
    { key: 'office_details' as ModuleKey, label: 'Office Details', icon: Building2 },
    { key: 'broadcasts' as ModuleKey, label: 'Broadcast Messages', icon: Megaphone, badge: unreadBroadcastCount }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0a101f] border-r border-[#192742] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#17253e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-base shadow-sm">
              S
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white uppercase">
                S TRANZ FLEET
              </div>
              <div className="text-[10px] text-orange-400 font-semibold tracking-wide">
                LOGISTICS OPS
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Operational Modules
          </div>

          {operationalNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectModule(item.key);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#131d33]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* ADMIN ONLY SECTION - Completely hidden from Normal Users */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-[#17253e]">
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Section</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectModule('admin_portal');
                  onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeModule === 'admin_portal'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-orange-300 hover:text-white hover:bg-[#1b2640]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Admin Control & Users</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-[#17253e] bg-[#070b15] text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>System State</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            User: {currentUser?.name}
          </div>
        </div>
      </aside>
    </>
  );
};
