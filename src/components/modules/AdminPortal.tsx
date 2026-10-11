import React, { useState } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Image,
  ScrollText,
  Upload,
  Search,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { User, UserRole } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    users,
    addUser,
    updateUser,
    deleteUser,
    auditLogs,
    loginBg,
    updateLoginBg
  } = useData();

  // Enforce backend/RBAC guard
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="p-8 bg-red-950/40 border border-red-800 rounded-xl text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-white uppercase">403 Access Forbidden</h3>
        <p className="text-xs text-red-300 max-w-md mx-auto">
          Security Exception: The Admin Section is restricted exclusively to authorized Admin accounts. Normal users and staff do not have authorization to view or access this administrative control panel.
        </p>
      </div>
    );
  }

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'background' | 'audit'>('users');
  const [searchUser, setSearchUser] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // User form
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    username: string;
    mobile: string;
    status: 'Active' | 'Inactive';
    passwordHash: string;
  }>({
    name: '',
    email: '',
    role: 'Office Staff',
    username: '',
    mobile: '',
    status: 'Active',
    passwordHash: ''
  });

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      role: 'Office Staff',
      username: '',
      mobile: '',
      status: 'Active',
      passwordHash: 'Pass@1234'
    });
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserForm({
      name: u.name,
      email: u.email,
      role: u.role,
      username: u.username,
      mobile: u.mobile,
      status: u.status,
      passwordHash: u.passwordHash || 'Pass@1234'
    });
    setIsAddUserOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      alert('Name and Email are required.');
      return;
    }
    if (editingUserId) {
      updateUser(editingUserId, userForm);
    } else {
      addUser(userForm);
    }
    setIsAddUserOpen(false);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLoginBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const q = searchUser.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const userReportHeaders = ['Name', 'Email Address', 'Role', 'Username', 'Mobile No', 'Status', 'Last Login'];
  const userReportRows = filteredUsers.map(u => [
    u.name,
    u.email,
    u.role,
    u.username,
    u.mobile,
    u.status,
    u.lastLogin || 'Never'
  ]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
            <span>Admin Control Panel & System Governance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorized Admin management only. Configure users, RBAC permissions, audit trails, and portal aesthetics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#060a12] border border-[#1d2d4a] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            User Management
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('background')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeAdminTab === 'background'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Login Background
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeAdminTab === 'audit'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Report Toolbar */}
          <ReportToolbar
            moduleTitle="Registered System Users & Access Roster Report"
            dateFrom=""
            dateTo=""
            onDateFromChange={() => {}}
            onDateToChange={() => {}}
            onResetDates={() => {}}
            headers={userReportHeaders}
            rows={userReportRows}
            extraButtons={
              <button
                onClick={handleOpenAddUser}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-colors cursor-pointer mr-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New User</span>
              </button>
            }
          />

          {/* Search bar */}
          <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Search registered staff by name, email, role..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Name & Username</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Assigned Role</th>
                    <th className="py-3 px-3 font-mono">Mobile</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3">Last Login</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16233a] text-slate-300">
                  {filteredUsers.map(user => {
                    const isPermanentAdmin =
                      user.email === 'stranzmaintenance@gmail.com' ||
                      user.email === 'stranzmaintenance57@gmail.com' ||
                      user.email === 'info.stranz@gmail.com';
                    return (
                      <tr key={user.id} className="hover:bg-[#0f192e] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">@{user.username}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{user.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.role === 'Admin'
                                ? 'bg-orange-950/70 text-orange-400 border border-orange-800/50'
                                : user.role === 'Manager'
                                ? 'bg-blue-950/70 text-blue-400 border border-blue-800/50'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">{user.mobile || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            disabled={isPermanentAdmin}
                            onClick={() =>
                              updateUser(user.id, {
                                status: user.status === 'Active' ? 'Inactive' : 'Active'
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              user.status === 'Active'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60'
                                : 'bg-red-950/60 text-red-400 border border-red-800/40 hover:bg-red-900/60'
                            } ${isPermanentAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            title={isPermanentAdmin ? 'Super admin status cannot be changed' : 'Click to toggle status'}
                          >
                            {user.status}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                          {user.lastLogin || 'Never logged in'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {/* Consistent Action Buttons: Edit and Delete only */}
                          <ActionButtons
                            onEdit={() => handleOpenEditUser(user)}
                            onDelete={() => deleteUser(user.id)}
                            itemName={`User ${user.name}`}
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

      {/* TAB 2: LOGIN BACKGROUND MANAGEMENT (Admin Only) */}
      {activeAdminTab === 'background' && (
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-400" />
                <span>Portal Login Background Image Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Admin setting: Upload, preview, replace, or restore the login background image.
              </p>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Background</span>
              <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
            </label>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-[#1e2f50] max-h-[380px] bg-black">
            <img
              src={loginBg}
              alt="Login Background Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-xs text-white">
                <span className="font-bold">Active Login Screen Background Preview</span>
                <span className="text-slate-400 block text-[10px]">
                  Applied to initial login landing screen with high-contrast legibility scrim.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeAdminTab === 'audit' && (
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48]">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                System Security & Administrative Audit Trail
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Total Log Entries: <strong className="font-mono text-orange-400">{auditLogs.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070c17] text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Details / Audit Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16233a] text-slate-300">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#0f192e]">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.userEmail}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#142036] text-orange-300 border border-[#1e2f50]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-400" />
                <span>{editingUserId ? 'Edit User Record' : 'Register New System User'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="py-3 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email ID (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. ramesh@stranz.com"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                  >
                    <option value="Office Staff">Office Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={userForm.status}
                    onChange={e => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username Handle</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="e.g. ramesh_ops"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={userForm.mobile}
                    onChange={e => setUserForm({ ...userForm, mobile: e.target.value })}
                    placeholder="10-digit phone"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  value={userForm.passwordHash}
                  onChange={e => setUserForm({ ...userForm, passwordHash: e.target.value })}
                  placeholder="Password"
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm"
                >
                  Save User Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
