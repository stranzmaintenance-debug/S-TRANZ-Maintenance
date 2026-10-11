export type UserRole = 'Admin' | 'Manager' | 'Office Staff' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  username: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  passwordHash?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface OfficeDetails {
  companyLogo: string;
  companyName: string;
  companyOwnerName: string;
  ownerContactNumber: string;
  officeContactNumber: string;
  officeAddress: string;
  companyEmail: string;
  companyWebsiteUrl: string;
  bookingWebsiteUrl: string;
  gstNumber: string;
  officePhoto?: string;
}

export interface DocumentAttachment {
  fileUrl: string;
  fileName: string;
  fileType?: string;
  uploadDate?: string;
}

export interface Vehicle {
  id: string;
  // Vehicle Details 1 to 14
  vehicleNumber: string;
  engineNumber: string;
  chassisNumber: string;
  registeredAtRto: string;
  model: string;
  unladenWeight: string; // e.g. "8,800 KG"
  loadCapacity: string; // e.g. "28,000 KG"
  make: string; // e.g. "BharatBenz 2823R"
  tyre: string; // e.g. "10 Wheeler"
  vehicleFit: string; // e.g. "Container Carrier"
  height: string; // e.g. "12.8 FT"
  width: string; // e.g. "8.4 FT"
  closedBodyOrOpenBody: 'Closed Body' | 'Open Body';
  registrationDate: string; // YYYY-MM-DD

  // Validity Details 15 to 21
  rcCardDoc?: DocumentAttachment;
  fitnessValidDate: string;
  fitnessDoc?: DocumentAttachment;
  insuranceValidDate: string;
  insuranceDoc?: DocumentAttachment;
  taxValidDate: string;
  taxDoc?: DocumentAttachment;
  puccValidDate: string;
  puccDoc?: DocumentAttachment;
  permitValidDate: string;
  permitDoc?: DocumentAttachment;
  nationalPermitValidDate: string;
  nationalPermitDoc?: DocumentAttachment;

  // System metadata
  currentStatus: 'Active' | 'Under Maintenance' | 'Idle';
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
}

export interface SalaryPackage {
  id: string;
  name: string;
  basicSalary: number;
  dailyAllowance: number;
  description?: string;
}

export interface TermsAndConditions {
  english: string;
  tamil: string;
}

export interface Driver {
  id: string;
  // SECTION 1: PERSONAL DETAILS
  driverName: string;
  fatherName: string;
  dob: string;
  age: number;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  qualification: string;
  mobileNo: string;
  alternateNo: string;
  localAddress: string;
  nativeAddress: string;
  dateOfJoining: string; // YYYY-MM-DD

  // SECTION 2: LICENSE AND IDENTIFICATION DETAILS
  licenseNo: string;
  licenseType: string;
  badgeNo: string;
  licenseExpiryDate: string;
  previousHistory: string;
  aadharNo: string;
  panNo: string;
  noticePeriod: number; // in days

  // Salary structure linked to application
  selectedPackageId?: string;
  packageName?: string;
  basicSalary: number;
  dailyAllowance: number;

  driverPhoto?: string;
  seatNumber?: string;
  status: 'Active' | 'EXITED / INACTIVE' | 'Resigning / Exit Process' | 'Resigned';
  assignedVehicleNumber?: string;
  documents?: {
    aadharDoc?: DocumentAttachment;
    panDoc?: DocumentAttachment;
    licenseDoc?: DocumentAttachment;
  };
  resignationDate?: string;
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Sunday' | 'Government Holiday';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  driverId: string;
  driverName: string;
  status: AttendanceStatus;
}

// Streamlined Trip Record - ONLY the 7 required fields
export interface TripRecord {
  id: string;
  tripNumber: string;
  date: string;
  vehicleNumber: string;
  driverName: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
}

export interface ComplaintMaintenanceRecord {
  id: string;
  complaintDate: string;
  vehicleNumber: string;
  driverName: string;
  complaintDetails: string;
  kilometersReading: number;
  workshopName: string;
  status: 'Open' | 'In-Progress' | 'Completed';
  repairPartsUsed: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  billUpload?: DocumentAttachment;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  paidAmount: number;
  balanceAmount: number;
  completionDate?: string;
}

export type FuelPaymentMethod = 'Bank Transfer' | 'UPI';

export interface DieselRecord {
  id: string;
  date: string;
  vehicleNumber: string;
  driverName: string;
  oldKm: number;
  newKm: number;
  totalKm: number;
  dieselLiters: number;
  dieselRate: number;
  totalAmount: number;
  paymentMethod: FuelPaymentMethod;
  billUpload?: DocumentAttachment;
}

export interface AdBlueRecord {
  id: string;
  date: string;
  vehicleNumber: string;
  driverName: string;
  oldKm: number;
  newKm: number;
  totalKm: number;
  adblueLiters: number;
  adblueRate: number;
  totalAmount: number;
  paymentMethod: FuelPaymentMethod;
  billUpload?: DocumentAttachment;
}

export interface TollExpenseRecord {
  id: string;
  date: string;
  amount: number;
  transactionType: 'FASTag Auto-Debit' | 'FASTag Manual Recharge' | 'Cash' | 'UPI';
  tollgateNameOrTrip: string;
  billUpload?: DocumentAttachment;
}

export type VehicleDocumentType =
  | 'FC'
  | 'Insurance'
  | 'Road Tax'
  | 'Pollution'
  | 'State Permit'
  | 'National Permit'
  | 'Other Document Expense';

export interface VehicleDocumentExpenseRecord {
  id: string;
  date: string;
  vehicleNumber: string;
  amount: number;
  documentType: VehicleDocumentType;
  otherDocumentName?: string;
  fineAmount: number;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash';
  paymentBillAmount: number;
  paymentBillUpload?: DocumentAttachment;
  documentUpload?: DocumentAttachment;
}

export interface DriverAdvanceRecord {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  amount: number;
  remarks?: string;
  receiptUpload?: DocumentAttachment;
}

export interface DriverCompanyExpenseRecord {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  amount: number;
  details: string;
  receiptUpload?: DocumentAttachment;
}

export interface DriverSalaryRecord {
  id: string;
  month: string; // YYYY-MM
  driverId: string;
  driverName: string;
  basicSalary: number;
  dailyAllowance: number;
  workedDays: number;
  totalDaysInMonth: number;
  earnedBasic: number;
  earnedAllowance: number;
  grossSalary: number;
  totalAdvance: number;
  totalCompanyExpense: number;
  otherDeductions: number;
  netPayableSalary: number;
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  paymentDate?: string;
  isExitSalary?: boolean;
}

export type ExitWorkflowStatus =
  | 'Active'
  | 'Resignation Initiated'
  | 'Document Verification'
  | 'Final Attendance Calculation'
  | 'Final Salary Calculation'
  | 'Exit Form Generated'
  | 'Signed Exit Form Uploaded'
  | 'Exit Completed'
  | 'Resigned';

export interface DriverExitRecord {
  id: string;
  driverId: string;
  driverName: string;
  fatherName?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  contactNumber?: string;
  alternateNumber?: string;
  address?: string;
  nativeAddress?: string;
  licenseNo?: string;
  licenseType?: string;
  badgeNo?: string;
  licenseExpiryDate?: string;
  aadharNo?: string;
  panNo?: string;
  packageName?: string;
  basicSalary?: number;
  dailyAllowance?: number;
  driverPhoto?: string;
  vehicleNumber?: string;
  seatNumber?: string;
  joiningDate: string;
  resignationDate: string; // Exit Date (Strict Cutoff)
  reasonForResignation: string;
  resignationRemarks: string;
  finalWorkingDate: string;
  requiredDocs: string[];
  submittedDocs: string[];
  missingDocs: string[];
  documentsVerified: boolean;
  finalSalaryCalculated: boolean;
  finalSalaryAmount: number;
  finalAttendanceDays: number;
  attendanceClosed: boolean;
  exitFormGenerated: boolean;
  signedExitForm?: DocumentAttachment;
  companyAssetsReturned: boolean;
  exitStatus: ExitWorkflowStatus | 'EXITED / INACTIVE';
  updatedAt: string;
}

export interface BroadcastMessage {
  id: string;
  senderId: string;
  senderName: string;
  title: string;
  message: string;
  priority: 'Normal' | 'High' | 'Urgent';
  sentAt: string;
  readByUsers: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
}
