import React from 'react';
import {
  Bell,
  LogOut,
  ExternalLink,
  Shield,
  User as UserIcon,
  Menu,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  activeModuleTitle: string;
  onOpenBroadcasts: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  activeModuleTitle,
  onOpenBroadcasts
}) => {
  const { currentUser, logout, officeDetails, unreadBroadcastCount } = useData();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-2.5 bg-[#090f1d] border-b border-[#1b2b48] shadow-md">
      {/* Zone 1: Sidebar Toggle & Brand Title Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#142036] lg:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {officeDetails.companyLogo && (
            <img
              src={officeDetails.companyLogo}
              alt="Logo"
              className="h-7 w-auto object-contain hidden sm:block"
            />
          )}
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase truncate max-w-[230px] sm:max-w-none">
            {officeDetails.companyName}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-[#1e2f50]">
          <span className="text-slate-500">Operations</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-orange-400 font-semibold">{activeModuleTitle}</span>
        </div>
      </div>

      {/* Zone 2: External Booking Portal Link (NO booking process inside app, only external link as specified) */}
      <div className="hidden lg:flex items-center gap-3">
        <a
          href={officeDetails.bookingWebsiteUrl || 'https://booking.stranzlogistics.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-400 bg-orange-950/30 hover:bg-orange-950/60 border border-orange-800/40 rounded-lg transition-colors cursor-pointer"
          title="Open External Freight Booking Portal (Booking happens on external website)"
        >
          <span>External Booking Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Zone 3: Broadcast Notifications, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Broadcast Messages Inbox Notification */}
        <button
          type="button"
          onClick={onOpenBroadcasts}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-[#142036] rounded-lg transition-colors cursor-pointer"
          title="View In-Website Broadcast Messages & Announcements"
        >
          <Bell className="w-4 h-4" />
          {unreadBroadcastCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-orange-600 rounded-full animate-pulse">
              {unreadBroadcastCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#060a12] border border-[#1a2944] rounded-lg">
          <div className="p-1 rounded bg-[#152238] text-orange-400">
            {currentUser?.role === 'Admin' ? (
              <Shield className="w-3.5 h-3.5" />
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
              {currentUser?.name || 'Authorized Staff'}
            </div>
            <div className="text-[10px] font-semibold text-orange-400">
              {currentUser?.role}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors border border-transparent hover:border-red-900/40 cursor-pointer"
          title="Sign out of system"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
