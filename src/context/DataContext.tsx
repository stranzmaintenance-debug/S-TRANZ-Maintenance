import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  OfficeDetails,
  Vehicle,
  Driver,
  AttendanceRecord,
  AttendanceStatus,
  TripRecord,
  ComplaintMaintenanceRecord,
  DieselRecord,
  AdBlueRecord,
  TollExpenseRecord,
  VehicleDocumentExpenseRecord,
  DriverAdvanceRecord,
  DriverCompanyExpenseRecord,
  DriverExitRecord,
  BroadcastMessage,
  AuditLog,
  SalaryPackage,
  TermsAndConditions
} from '../types';
import {
  initialOfficeDetails,
  defaultLoginBg,
  initialUsers,
  initialVehicles,
  initialDrivers,
  generateInitialAttendance,
  initialTrips,
  initialComplaints,
  initialDieselRecords,
  initialAdBlueRecords,
  initialTollExpenses,
  initialVehicleDocExpenses,
  initialDriverAdvances,
  initialDriverCompanyExpenses,
  initialExitRecords,
  initialBroadcastMessages,
  initialAuditLogs,
  initialSalaryPackages,
  initialTermsAndConditions
} from '../data/initialData';

interface DataContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  officeDetails: OfficeDetails;
  updateOfficeDetails: (details: Partial<OfficeDetails>) => void;
  loginBg: string;
  updateLoginBg: (bgUrl: string) => void;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  salaryPackages: SalaryPackage[];
  addSalaryPackage: (pkg: Omit<SalaryPackage, 'id'>) => void;
  updateSalaryPackage: (id: string, updates: Partial<SalaryPackage>) => void;
  deleteSalaryPackage: (id: string) => void;
  termsAndConditions: TermsAndConditions;
  updateTermsAndConditions: (terms: Partial<TermsAndConditions>) => void;
  attendance: AttendanceRecord[];
  markAttendance: (date: string, driverId: string, status: AttendanceStatus) => { success: boolean; message?: string };
  bulkMarkAttendance: (date: string, records: { driverId: string; status: AttendanceStatus }[]) => void;
  trips: TripRecord[];
  addTrip: (trip: Omit<TripRecord, 'id'>) => void;
  updateTrip: (id: string, updates: Partial<TripRecord>) => void;
  deleteTrip: (id: string) => void;
  complaints: ComplaintMaintenanceRecord[];
  addComplaint: (c: Omit<ComplaintMaintenanceRecord, 'id'>) => void;
  updateComplaint: (id: string, updates: Partial<ComplaintMaintenanceRecord>) => void;
  deleteComplaint: (id: string) => void;
  // Diesel Register
  dieselRecords: DieselRecord[];
  getLatestVehicleKm: (vehicleNumber: string, excludeRecordId?: string) => number | null;
  getPreviousDieselKm: (vehicleNumber: string, excludeRecordId?: string) => number | null;
  addDieselRecord: (record: Omit<DieselRecord, 'id' | 'totalKm'>) => void;
  updateDieselRecord: (id: string, updates: Partial<DieselRecord>) => void;
  deleteDieselRecord: (id: string) => void;
  // AdBlue Register
  adblueRecords: AdBlueRecord[];
  getPreviousAdBlueKm: (vehicleNumber: string, excludeRecordId?: string) => number | null;
  addAdBlueRecord: (record: Omit<AdBlueRecord, 'id' | 'totalKm'>) => void;
  updateAdBlueRecord: (id: string, updates: Partial<AdBlueRecord>) => void;
  deleteAdBlueRecord: (id: string) => void;
  // Toll Expenses
  tollExpenses: TollExpenseRecord[];
  addTollExpense: (t: Omit<TollExpenseRecord, 'id'>) => void;
  updateTollExpense: (id: string, updates: Partial<TollExpenseRecord>) => void;
  deleteTollExpense: (id: string) => void;
  // Vehicle Document Expenses
  vehicleDocExpenses: VehicleDocumentExpenseRecord[];
  addVehicleDocExpense: (v: Omit<VehicleDocumentExpenseRecord, 'id'>) => void;
  updateVehicleDocExpense: (id: string, updates: Partial<VehicleDocumentExpenseRecord>) => void;
  deleteVehicleDocExpense: (id: string) => void;
  // Driver Advances
  driverAdvances: DriverAdvanceRecord[];
  addDriverAdvance: (a: Omit<DriverAdvanceRecord, 'id'>) => void;
  updateDriverAdvance: (id: string, updates: Partial<DriverAdvanceRecord>) => void;
  deleteDriverAdvance: (id: string) => void;
  // Driver Company Expenses
  driverCompanyExpenses: DriverCompanyExpenseRecord[];
  addDriverCompanyExpense: (e: Omit<DriverCompanyExpenseRecord, 'id'>) => void;
  updateDriverCompanyExpense: (id: string, updates: Partial<DriverCompanyExpenseRecord>) => void;
  deleteDriverCompanyExpense: (id: string) => void;
  // Exit Management
  exitRecords: DriverExitRecord[];
  initiateResignation: (driverId: string, resignationDate: string, reason: string, remarks: string) => { success: boolean; message: string };
  saveDriverExit: (data: {
    driverId: string;
    exitDate: string;
    reason: string;
    remarks?: string;
    seatNumber?: string;
  }) => { success: boolean; message: string; record?: DriverExitRecord };
  updateExitRecord: (id: string, updates: Partial<DriverExitRecord>) => void;
  deleteExitRecord: (id: string) => void;
  // Broadcast Messaging
  broadcastMessages: BroadcastMessage[];
  sendBroadcastMessage: (title: string, message: string, priority: 'Normal' | 'High' | 'Urgent') => void;
  markMessageAsRead: (messageId: string) => void;
  unreadBroadcastCount: number;
  // Audit Logs
  auditLogs: AuditLog[];
}

const DataContext = createContext<DataContextType | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`stranz_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`stranz_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStorage('current_user', null));
  const [officeDetails, setOfficeDetails] = useState<OfficeDetails>(() => loadStorage('office_details', initialOfficeDetails));
  const [loginBg, setLoginBg] = useState<string>(() => loadStorage('login_bg', defaultLoginBg));
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', initialUsers));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadStorage('vehicles', initialVehicles));
  const [drivers, setDrivers] = useState<Driver[]>(() => loadStorage('drivers', initialDrivers));
  const [salaryPackages, setSalaryPackages] = useState<SalaryPackage[]>(() => loadStorage('salary_packages', initialSalaryPackages));
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions>(() => loadStorage('terms_conditions', initialTermsAndConditions));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStorage('attendance', generateInitialAttendance()));
  const [trips, setTrips] = useState<TripRecord[]>(() => loadStorage('trips', initialTrips));
  const [complaints, setComplaints] = useState<ComplaintMaintenanceRecord[]>(() => loadStorage('complaints', initialComplaints));
  const [dieselRecords, setDieselRecords] = useState<DieselRecord[]>(() => loadStorage('diesel', initialDieselRecords));
  const [adblueRecords, setAdBlueRecords] = useState<AdBlueRecord[]>(() => loadStorage('adblue', initialAdBlueRecords));
  const [tollExpenses, setTollExpenses] = useState<TollExpenseRecord[]>(() => loadStorage('toll_expenses', initialTollExpenses));
  const [vehicleDocExpenses, setVehicleDocExpenses] = useState<VehicleDocumentExpenseRecord[]>(() => loadStorage('doc_expenses', initialVehicleDocExpenses));
  const [driverAdvances, setDriverAdvances] = useState<DriverAdvanceRecord[]>(() => loadStorage('advances', initialDriverAdvances));
  const [driverCompanyExpenses, setDriverCompanyExpenses] = useState<DriverCompanyExpenseRecord[]>(() => loadStorage('company_expenses', initialDriverCompanyExpenses));
  const [exitRecords, setExitRecords] = useState<DriverExitRecord[]>(() => loadStorage('exit_records', initialExitRecords));
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>(() => loadStorage('broadcast_messages', initialBroadcastMessages));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage('audit_logs', initialAuditLogs));

  // Sync to storage
  useEffect(() => saveStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveStorage('office_details', officeDetails), [officeDetails]);
  useEffect(() => saveStorage('login_bg', loginBg), [loginBg]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('vehicles', vehicles), [vehicles]);
  useEffect(() => saveStorage('drivers', drivers), [drivers]);
  useEffect(() => saveStorage('salary_packages', salaryPackages), [salaryPackages]);
  useEffect(() => saveStorage('terms_conditions', termsAndConditions), [termsAndConditions]);
  useEffect(() => saveStorage('attendance', attendance), [attendance]);
  useEffect(() => saveStorage('trips', trips), [trips]);
  useEffect(() => saveStorage('complaints', complaints), [complaints]);
  useEffect(() => saveStorage('diesel', dieselRecords), [dieselRecords]);
  useEffect(() => saveStorage('adblue', adblueRecords), [adblueRecords]);
  useEffect(() => saveStorage('toll_expenses', tollExpenses), [tollExpenses]);
  useEffect(() => saveStorage('doc_expenses', vehicleDocExpenses), [vehicleDocExpenses]);
  useEffect(() => saveStorage('advances', driverAdvances), [driverAdvances]);
  useEffect(() => saveStorage('company_expenses', driverCompanyExpenses), [driverCompanyExpenses]);
  useEffect(() => saveStorage('exit_records', exitRecords), [exitRecords]);
  useEffect(() => saveStorage('broadcast_messages', broadcastMessages), [broadcastMessages]);
  useEffect(() => saveStorage('audit_logs', auditLogs), [auditLogs]);

  const addAudit = (action: string, details: string, userOverride?: User) => {
    const user = userOverride || currentUser;
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'unauthenticated',
      userName: user?.name || 'Visitor',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Login handler
  const login = (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      addAudit('LOGIN_FAILED', `Failed login attempt for unknown email: ${email}`);
      return { success: false, message: 'Invalid email address or user not registered.' };
    }
    if (user.status !== 'Active') {
      addAudit('LOGIN_BLOCKED', `Blocked login attempt for deactivated user: ${email}`, user);
      return { success: false, message: 'Your account has been deactivated. Please contact Admin.' };
    }
    if (user.passwordHash !== pass) {
      addAudit('LOGIN_FAILED', `Incorrect password for user: ${email}`, user);
      return { success: false, message: 'Incorrect password. Please verify credentials.' };
    }

    const updatedUser = { ...user, lastLogin: new Date().toLocaleString() };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));
    addAudit('LOGIN_SUCCESS', `User ${user.name} (${user.role}) logged in successfully`, updatedUser);
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    if (currentUser) {
      addAudit('LOGOUT', `User ${currentUser.name} logged out`);
    }
    setCurrentUser(null);
  };

  const updateOfficeDetails = (details: Partial<OfficeDetails>) => {
    setOfficeDetails(prev => ({ ...prev, ...details }));
    addAudit('OFFICE_DETAILS_UPDATED', 'Office / Company details updated');
  };

  const updateLoginBg = (bgUrl: string) => {
    setLoginBg(bgUrl);
    addAudit('LOGIN_BG_UPDATED', 'Login background image updated by Admin');
  };

  // Salary Packages
  const addSalaryPackage = (pkg: Omit<SalaryPackage, 'id'>) => {
    const newPkg: SalaryPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`
    };
    setSalaryPackages(prev => [...prev, newPkg]);
    addAudit('SALARY_PACKAGE_ADDED', `New salary package created: ${newPkg.name}`);
  };

  const updateSalaryPackage = (id: string, updates: Partial<SalaryPackage>) => {
    setSalaryPackages(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    addAudit('SALARY_PACKAGE_UPDATED', `Salary package updated: ${id}`);
  };

  const deleteSalaryPackage = (id: string) => {
    setSalaryPackages(prev => prev.filter(p => p.id !== id));
    addAudit('SALARY_PACKAGE_DELETED', `Salary package removed: ${id}`);
  };

  // Terms & Conditions
  const updateTermsAndConditions = (terms: Partial<TermsAndConditions>) => {
    setTermsAndConditions(prev => ({ ...prev, ...terms }));
    addAudit('TERMS_CONDITIONS_UPDATED', 'Driver Joining Terms & Conditions updated');
  };

  // User management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    addAudit('USER_CREATED', `New user created: ${newUser.name} (${newUser.email}) - ${newUser.role}`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    addAudit('USER_UPDATED', `User record updated: ${id}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (
      target?.email === 'stranzmaintenance@gmail.com' ||
      target?.email === 'stranzmaintenance57@gmail.com' ||
      target?.email === 'info.stranz@gmail.com'
    ) {
      alert('Permanent Super Admin accounts cannot be deleted.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addAudit('USER_DELETED', `User removed: ${target?.name} (${target?.email})`);
  };

  // Vehicles
  const addVehicle = (v: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newV: Vehicle = {
      ...v,
      id: `veh_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVehicles(prev => [newV, ...prev]);
    addAudit('VEHICLE_ADDED', `Vehicle registered: ${newV.vehicleNumber}`);
    return newV;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    addAudit('VEHICLE_UPDATED', `Vehicle updated: ${id}`);
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    addAudit('VEHICLE_DELETED', `Vehicle deleted: ${target?.vehicleNumber}`);
  };

  // Drivers
  const addDriver = (d: Omit<Driver, 'id' | 'createdAt'>) => {
    const newD: Driver = {
      ...d,
      id: `drv_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDrivers(prev => [newD, ...prev]);
    addAudit('DRIVER_ADDED', `Driver joined: ${newD.driverName} (Joining Date: ${newD.dateOfJoining})`);
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    addAudit('DRIVER_UPDATED', `Driver updated: ${id}`);
  };

  const deleteDriver = (id: string) => {
    const target = drivers.find(d => d.id === id);
    setDrivers(prev => prev.filter(d => d.id !== id));
    addAudit('DRIVER_DELETED', `Driver deleted: ${target?.driverName}`);
  };

  // Attendance logic
  const markAttendance = (date: string, driverId: string, status: AttendanceStatus) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return { success: false, message: 'Driver not found' };

    // Rule: Attendance cannot be recorded before joining date!
    if (date < driver.dateOfJoining) {
      return {
        success: false,
        message: `Attendance cannot be marked before driver's joining date (${driver.dateOfJoining}).`
      };
    }

    // Rule: Attendance cannot be recorded after resignation date!
    if (driver.resignationDate && date > driver.resignationDate) {
      return {
        success: false,
        message: `Driver resigned on ${driver.resignationDate}. Attendance is strictly closed after this date.`
      };
    }

    setAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.date === date && a.driverId === driverId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], status };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `att_${date}_${driverId}`,
            date,
            driverId,
            driverName: driver.driverName,
            status
          }
        ];
      }
    });

    return { success: true };
  };

  const bulkMarkAttendance = (date: string, records: { driverId: string; status: AttendanceStatus }[]) => {
    records.forEach(r => markAttendance(date, r.driverId, r.status));
  };

  // Trips (Streamlined with only the 7 required fields)
  const addTrip = (t: Omit<TripRecord, 'id'>) => {
    const newTrip: TripRecord = { ...t, id: `trp_${Date.now()}` };
    setTrips(prev => [newTrip, ...prev]);
    addAudit('TRIP_ADDED', `Trip created: ${newTrip.tripNumber} for ${newTrip.vehicleNumber}`);
  };

  const updateTrip = (id: string, updates: Partial<TripRecord>) => {
    setTrips(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    addAudit('TRIP_UPDATED', `Trip updated: ${id}`);
  };

  const deleteTrip = (id: string) => {
    const target = trips.find(t => t.id === id);
    setTrips(prev => prev.filter(t => t.id !== id));
    addAudit('TRIP_DELETED', `Trip removed: ${target?.tripNumber}`);
  };

  // Complaints
  const addComplaint = (c: Omit<ComplaintMaintenanceRecord, 'id'>) => {
    const newC: ComplaintMaintenanceRecord = { ...c, id: `cmp_${Date.now()}` };
    setComplaints(prev => [newC, ...prev]);
    addAudit('COMPLAINT_ADDED', `Complaint logged: ${newC.vehicleNumber} (${newC.complaintDetails})`);
  };

  const updateComplaint = (id: string, updates: Partial<ComplaintMaintenanceRecord>) => {
    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addAudit('COMPLAINT_UPDATED', `Complaint status updated: ${id}`);
  };

  const deleteComplaint = (id: string) => {
    const target = complaints.find(c => c.id === id);
    setComplaints(prev => prev.filter(c => c.id !== id));
    addAudit('COMPLAINT_DELETED', `Complaint removed: ${target?.vehicleNumber}`);
  };

  // Diesel Register
  const getPreviousDieselKm = (vehicleNumber: string, excludeRecordId?: string): number | null => {
    const vehicleEntries = dieselRecords
      .filter(r => r.vehicleNumber === vehicleNumber && r.id !== excludeRecordId)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.newKm - a.newKm;
      });

    return vehicleEntries.length > 0 ? vehicleEntries[0].newKm : null;
  };

  const addDieselRecord = (record: Omit<DieselRecord, 'id' | 'totalKm'>) => {
    const oldKm = record.oldKm ?? getPreviousDieselKm(record.vehicleNumber) ?? 0;
    const totalKm = Math.max(0, record.newKm - oldKm);
    const newEntry: DieselRecord = {
      ...record,
      id: `dsl_${Date.now()}`,
      oldKm,
      totalKm
    };
    setDieselRecords(prev => [newEntry, ...prev]);
    addAudit('DIESEL_RECORD_ADDED', `Diesel logged for ${record.vehicleNumber}: ${record.dieselLiters}L, Total KM: ${totalKm}`);
  };

  const updateDieselRecord = (id: string, updates: Partial<DieselRecord>) => {
    setDieselRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          updated.totalKm = Math.max(0, updated.newKm - updated.oldKm);
          return updated;
        }
        return r;
      })
    );
    addAudit('DIESEL_RECORD_UPDATED', `Diesel record updated: ${id}`);
  };

  const deleteDieselRecord = (id: string) => {
    setDieselRecords(prev => prev.filter(r => r.id !== id));
    addAudit('DIESEL_RECORD_DELETED', `Diesel record removed: ${id}`);
  };

  // AdBlue Register
  const getPreviousAdBlueKm = (vehicleNumber: string, excludeRecordId?: string): number | null => {
    const vehicleEntries = adblueRecords
      .filter(r => r.vehicleNumber === vehicleNumber && r.id !== excludeRecordId)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.newKm - a.newKm;
      });

    return vehicleEntries.length > 0 ? vehicleEntries[0].newKm : null;
  };

  const addAdBlueRecord = (record: Omit<AdBlueRecord, 'id' | 'totalKm'>) => {
    const oldKm = record.oldKm ?? getPreviousAdBlueKm(record.vehicleNumber) ?? 0;
    const totalKm = Math.max(0, record.newKm - oldKm);
    const newEntry: AdBlueRecord = {
      ...record,
      id: `adb_${Date.now()}`,
      oldKm,
      totalKm
    };
    setAdBlueRecords(prev => [newEntry, ...prev]);
    addAudit('ADBLUE_RECORD_ADDED', `AdBlue logged for ${record.vehicleNumber}: ${record.adblueLiters}L, Total KM: ${totalKm}`);
  };

  const updateAdBlueRecord = (id: string, updates: Partial<AdBlueRecord>) => {
    setAdBlueRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          updated.totalKm = Math.max(0, updated.newKm - updated.oldKm);
          return updated;
        }
        return r;
      })
    );
    addAudit('ADBLUE_RECORD_UPDATED', `AdBlue record updated: ${id}`);
  };

  const deleteAdBlueRecord = (id: string) => {
    setAdBlueRecords(prev => prev.filter(r => r.id !== id));
    addAudit('ADBLUE_RECORD_DELETED', `AdBlue record removed: ${id}`);
  };

  // Toll Expenses
  const addTollExpense = (t: Omit<TollExpenseRecord, 'id'>) => {
    const newT: TollExpenseRecord = { ...t, id: `tol_${Date.now()}` };
    setTollExpenses(prev => [newT, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
    addAudit('TOLL_EXPENSE_ADDED', `Toll expense logged: ₹${newT.amount} (${newT.transactionType})`);
  };

  const updateTollExpense = (id: string, updates: Partial<TollExpenseRecord>) => {
    setTollExpenses(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t)).sort((a, b) => (a.date < b.date ? 1 : -1))
    );
    addAudit('TOLL_EXPENSE_UPDATED', `Toll expense updated: ${id}`);
  };

  const deleteTollExpense = (id: string) => {
    setTollExpenses(prev => prev.filter(t => t.id !== id));
    addAudit('TOLL_EXPENSE_DELETED', `Toll expense deleted: ${id}`);
  };

  // Vehicle Document Expenses
  const addVehicleDocExpense = (v: Omit<VehicleDocumentExpenseRecord, 'id'>) => {
    const newV: VehicleDocumentExpenseRecord = { ...v, id: `vde_${Date.now()}` };
    setVehicleDocExpenses(prev => [newV, ...prev]);
    addAudit('DOC_EXPENSE_ADDED', `Doc expense logged for ${newV.vehicleNumber}: ${newV.documentType} (₹${newV.amount})`);
  };

  const updateVehicleDocExpense = (id: string, updates: Partial<VehicleDocumentExpenseRecord>) => {
    setVehicleDocExpenses(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    addAudit('DOC_EXPENSE_UPDATED', `Doc expense updated: ${id}`);
  };

  const deleteVehicleDocExpense = (id: string) => {
    setVehicleDocExpenses(prev => prev.filter(v => v.id !== id));
    addAudit('DOC_EXPENSE_DELETED', `Doc expense deleted: ${id}`);
  };

  // Driver Advances
  const addDriverAdvance = (a: Omit<DriverAdvanceRecord, 'id'>) => {
    const newA: DriverAdvanceRecord = { ...a, id: `adv_${Date.now()}` };
    setDriverAdvances(prev => [newA, ...prev]);
    addAudit('DRIVER_ADVANCE_ADDED', `Advance granted: ₹${newA.amount} to ${newA.driverName}`);
  };

  const updateDriverAdvance = (id: string, updates: Partial<DriverAdvanceRecord>) => {
    setDriverAdvances(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    addAudit('DRIVER_ADVANCE_UPDATED', `Advance updated: ${id}`);
  };

  const deleteDriverAdvance = (id: string) => {
    setDriverAdvances(prev => prev.filter(a => a.id !== id));
    addAudit('DRIVER_ADVANCE_DELETED', `Advance removed: ${id}`);
  };

  // Driver Company Expenses
  const addDriverCompanyExpense = (e: Omit<DriverCompanyExpenseRecord, 'id'>) => {
    const newE: DriverCompanyExpenseRecord = { ...e, id: `dce_${Date.now()}` };
    setDriverCompanyExpenses(prev => [newE, ...prev]);
    addAudit('COMPANY_EXPENSE_ADDED', `Company expense for ${newE.driverName}: ₹${newE.amount} (${newE.details})`);
  };

  const updateDriverCompanyExpense = (id: string, updates: Partial<DriverCompanyExpenseRecord>) => {
    setDriverCompanyExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    addAudit('COMPANY_EXPENSE_UPDATED', `Company expense updated: ${id}`);
  };

  const deleteDriverCompanyExpense = (id: string) => {
    setDriverCompanyExpenses(prev => prev.filter(e => e.id !== id));
    addAudit('COMPANY_EXPENSE_DELETED', `Company expense removed: ${id}`);
  };

  // Exit Management
  const initiateResignation = (driverId: string, resignationDate: string, reason: string, remarks: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return { success: false, message: 'Driver not found' };

    const newExit: DriverExitRecord = {
      id: `exit_${Date.now()}`,
      driverId,
      driverName: driver.driverName,
      joiningDate: driver.dateOfJoining,
      resignationDate,
      reasonForResignation: reason,
      resignationRemarks: remarks,
      finalWorkingDate: resignationDate,
      requiredDocs: ['Aadhar Card', 'PAN Card', 'Commercial License', 'Company ID Card', 'Exit Handover Slip'],
      submittedDocs: ['Aadhar Card', 'PAN Card', 'Commercial License'],
      missingDocs: ['Company ID Card', 'Exit Handover Slip'],
      documentsVerified: false,
      finalSalaryCalculated: false,
      finalSalaryAmount: 0,
      finalAttendanceDays: 0,
      attendanceClosed: false,
      exitFormGenerated: false,
      companyAssetsReturned: false,
      exitStatus: 'Resignation Initiated',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setExitRecords(prev => [newExit, ...prev]);
    updateDriver(driverId, { status: 'Resigning / Exit Process', resignationDate });
    addAudit('RESIGNATION_INITIATED', `Resignation initiated for ${driver.driverName} effective ${resignationDate}`);
    return { success: true, message: 'Resignation workflow initiated successfully.' };
  };

  const updateExitRecord = (id: string, updates: Partial<DriverExitRecord>) => {
    setExitRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
          if (updated.exitStatus === 'Resigned' || updated.exitStatus === 'Exit Completed') {
            updateDriver(updated.driverId, { status: 'Resigned' });
          }
          return updated;
        }
        return r;
      })
    );
    addAudit('EXIT_RECORD_UPDATED', `Exit record progress updated: ${id}`);
  };

  const deleteExitRecord = (id: string) => {
    setExitRecords(prev => prev.filter(r => r.id !== id));
    addAudit('EXIT_RECORD_DELETED', `Exit record deleted: ${id}`);
  };

  // Broadcast messages
  const sendBroadcastMessage = (title: string, message: string, priority: 'Normal' | 'High' | 'Urgent') => {
    const newMsg: BroadcastMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id || 'admin',
      senderName: currentUser?.name || 'Authorized Admin',
      title,
      message,
      priority,
      sentAt: new Date().toLocaleString(),
      readByUsers: [currentUser?.id || 'admin']
    };
    setBroadcastMessages(prev => [newMsg, ...prev]);
    addAudit('BROADCAST_SENT', `Broadcast message sent to all users: "${title}"`);
  };

  const markMessageAsRead = (messageId: string) => {
    if (!currentUser) return;
    setBroadcastMessages(prev =>
      prev.map(m => {
        if (m.id === messageId && !m.readByUsers.includes(currentUser.id)) {
          return { ...m, readByUsers: [...m.readByUsers, currentUser.id] };
        }
        return m;
      })
    );
  };

  const getLatestVehicleKm = (vehicleNumber: string, excludeRecordId?: string): number | null => {
    const dKm = getPreviousDieselKm(vehicleNumber, excludeRecordId);
    const aKm = getPreviousAdBlueKm(vehicleNumber, excludeRecordId);
    if (dKm !== null && aKm !== null) return Math.max(dKm, aKm);
    return dKm ?? aKm ?? null;
  };

  const saveDriverExit = (data: {
    driverId: string;
    exitDate: string;
    reason: string;
    remarks?: string;
    seatNumber?: string;
  }) => {
    const res = initiateResignation(data.driverId, data.exitDate, data.reason, data.remarks || '');
    const rec = exitRecords.find(e => e.driverId === data.driverId);
    return { success: res.success, message: res.message, record: rec };
  };

  const unreadBroadcastCount = currentUser
    ? broadcastMessages.filter(m => !m.readByUsers.includes(currentUser.id)).length
    : 0;

  return (
    <DataContext.Provider
      value={{
        currentUser,
        login,
        logout,
        officeDetails,
        updateOfficeDetails,
        loginBg,
        updateLoginBg,
        users,
        addUser,
        updateUser,
        deleteUser,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        salaryPackages,
        addSalaryPackage,
        updateSalaryPackage,
        deleteSalaryPackage,
        termsAndConditions,
        updateTermsAndConditions,
        attendance,
        markAttendance,
        bulkMarkAttendance,
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
        complaints,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        dieselRecords,
        getLatestVehicleKm,
        getPreviousDieselKm,
        addDieselRecord,
        updateDieselRecord,
        deleteDieselRecord,
        adblueRecords,
        getPreviousAdBlueKm,
        addAdBlueRecord,
        updateAdBlueRecord,
        deleteAdBlueRecord,
        tollExpenses,
        addTollExpense,
        updateTollExpense,
        deleteTollExpense,
        vehicleDocExpenses,
        addVehicleDocExpense,
        updateVehicleDocExpense,
        deleteVehicleDocExpense,
        driverAdvances,
        addDriverAdvance,
        updateDriverAdvance,
        deleteDriverAdvance,
        driverCompanyExpenses,
        addDriverCompanyExpense,
        updateDriverCompanyExpense,
        deleteDriverCompanyExpense,
        exitRecords,
        initiateResignation,
        saveDriverExit,
        updateExitRecord,
        deleteExitRecord,
        broadcastMessages,
        sendBroadcastMessage,
        markMessageAsRead,
        unreadBroadcastCount,
        auditLogs
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
