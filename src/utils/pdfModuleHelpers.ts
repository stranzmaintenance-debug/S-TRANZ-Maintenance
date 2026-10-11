import {
  Vehicle,
  Driver,
  TripRecord,
  ComplaintMaintenanceRecord,
  DieselRecord,
  AdBlueRecord,
  TollExpenseRecord,
  VehicleDocumentExpenseRecord,
  DriverExitRecord,
  OfficeDetails,
  BroadcastMessage,
  User,
  SalaryPackage
} from '../types';
import {
  exportDossierPdf,
  DossierRecord,
  DossierSection,
  DossierField
} from '../services/pdfService';

const getToday = () => new Date().toISOString().split('T')[0];

// -------------------------------------------------------------------
// 1. VEHICLE REGISTRATION DOSSIER (Single, Selected, or All)
// -------------------------------------------------------------------
export async function exportVehiclesPdf(
  vehicles: Vehicle | Vehicle[],
  officeDetails: OfficeDetails,
  customTitle?: string
) {
  const list = Array.isArray(vehicles) ? vehicles : [vehicles];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(v => {
    const coreFields: DossierField[] = [
      { label: '1. Vehicle Number', value: v.vehicleNumber, highlight: true },
      { label: '2. Engine Number', value: v.engineNumber },
      { label: '3. Chassis Number', value: v.chassisNumber },
      { label: '4. Registered At RTO', value: v.registeredAtRto },
      { label: '5. Model Name', value: v.model },
      { label: '6. Unladen Weight', value: v.unladenWeight },
      { label: '7. Load Capacity', value: v.loadCapacity },
      { label: '8. Make / Manufacturer', value: v.make },
      { label: '9. Tyre Specification', value: v.tyre },
      { label: '10. Vehicle Fit', value: v.vehicleFit },
      { label: '11. Height', value: v.height },
      { label: '12. Width', value: v.width },
      { label: '13. Body Classification', value: v.closedBodyOrOpenBody },
      { label: '14. Registration Date', value: v.registrationDate },
      { label: 'Assigned Driver', value: v.assignedDriverName || 'Unassigned' },
      { label: 'Current Status', value: v.currentStatus }
    ];

    const validityFields: DossierField[] = [
      { label: '15. RC Card Certificate', value: v.rcCardDoc?.fileName || 'Logged on file' },
      { label: '16. Fitness Expiry Date', value: v.fitnessValidDate },
      { label: '17. Insurance Expiry Date', value: v.insuranceValidDate },
      { label: '18. Road Tax Expiry Date', value: v.taxValidDate },
      { label: '19. PUCC (Pollution) Expiry Date', value: v.puccValidDate },
      { label: '20. State Permit Expiry Date', value: v.permitValidDate },
      { label: '21. National Permit Expiry Date', value: v.nationalPermitValidDate }
    ];

    const sections: DossierSection[] = [
      { title: 'Commercial Vehicle Specifications (Fields 1 to 14)', fields: coreFields },
      { title: 'Statutory Document Validity Dates (Fields 15 to 21)', fields: validityFields }
    ];

    return {
      id: v.vehicleNumber,
      title: `Vehicle Registration: ${v.vehicleNumber} (${v.make} ${v.model})`,
      statusBadge: {
        text: v.currentStatus,
        isSuccess: v.currentStatus === 'Active',
        isWarning: v.currentStatus === 'Under Maintenance'
      },
      sections,
      notes: 'All statutory compliance and road fitness certificates are logged in the TMS registry.'
    };
  });

  const filename = isMulti
    ? `Vehicle_Fleet_Records_${list.length}_${today}.pdf`
    : `Vehicle_Record_${list[0].vehicleNumber.replace(/\s+/g, '_')}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: customTitle || (isMulti ? 'COMMERCIAL FLEET VEHICLES REGISTER' : 'VEHICLE SPECIFICATION & COMPLIANCE DOSSIER'),
    subtitle: isMulti ? `Exported ${list.length} fleet vehicles` : `Vehicle Reg: ${list[0].vehicleNumber}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 2. DRIVER PROFILE & EMPLOYEE DOSSIER (Single, Selected, or All)
// -------------------------------------------------------------------
export async function exportDriversPdf(
  drivers: Driver | Driver[],
  officeDetails: OfficeDetails,
  salaryPackages?: SalaryPackage[],
  customTitle?: string
) {
  const list = Array.isArray(drivers) ? drivers : [drivers];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(d => {
    const personalFields: DossierField[] = [
      { label: 'Driver ID', value: d.id, highlight: true },
      { label: 'Full Legal Name', value: d.driverName, highlight: true },
      { label: 'Primary Mobile', value: d.mobileNo },
      { label: 'Alternate Contact', value: d.alternateNo },
      { label: 'Date of Birth', value: d.dob },
      { label: 'Age', value: d.age ? `${d.age} Years` : '-' },
      { label: 'Blood Group', value: d.bloodGroup },
      { label: 'Marital Status', value: d.maritalStatus },
      { label: 'Father / Guardian Name', value: d.fatherName },
      { label: 'Qualification', value: d.qualification },
      { label: 'Date of Joining', value: d.dateOfJoining }
    ];

    const licenseFields: DossierField[] = [
      { label: 'Driving License No', value: d.licenseNo, highlight: true },
      { label: 'License Class', value: d.licenseType || 'Commercial HGV/HMV' },
      { label: 'License Expiry', value: d.licenseExpiryDate },
      { label: 'Commercial Badge No', value: d.badgeNo },
      { label: 'Aadhaar Card No', value: d.aadharNo },
      { label: 'PAN Card No', value: d.panNo },
      { label: 'Assigned Vehicle', value: d.assignedVehicleNumber || 'Unassigned / Relief Driver' },
      { label: 'Employment Status', value: d.status },
      { label: 'Notice Period', value: d.noticePeriod ? `${d.noticePeriod} Days` : '-' }
    ];

    const addressFields: DossierField[] = [
      { label: 'Local Address', value: d.localAddress },
      { label: 'Native / Permanent Address', value: d.nativeAddress },
      { label: 'Previous Driving History', value: d.previousHistory }
    ];

    const salaryFields: DossierField[] = [
      { label: 'Salary Package', value: d.packageName || 'Standard Fleet Package' },
      { label: 'Base Monthly Salary', value: `₹${(d.basicSalary || 0).toLocaleString('en-IN')}`, highlight: true },
      { label: 'Daily Allowance (Bata)', value: `₹${(d.dailyAllowance || 0).toLocaleString('en-IN')}` }
    ];

    const sections: DossierSection[] = [
      { title: 'Personal & Demographic Details', fields: personalFields },
      { title: 'Commercial Driving License & Statutory Records', fields: licenseFields },
      { title: 'Residential & Previous History Information', fields: addressFields },
      { title: 'Salary Package & Operational Allowances', fields: salaryFields }
    ];

    return {
      id: d.id,
      title: `Driver Dossier: ${d.driverName} (${d.assignedVehicleNumber || 'Fleet'})`,
      photoUrl: d.driverPhoto,
      statusBadge: {
        text: d.status,
        isSuccess: d.status === 'Active',
        isWarning: d.status.includes('Exit') || d.status.includes('Resign')
      },
      sections,
      notes: 'Official commercial driver employment record on file with S TRANZ LOGISTIC operations.'
    };
  });

  const filename = isMulti
    ? `Driver_Fleet_Records_${list.length}_${today}.pdf`
    : `Driver_Profile_${list[0].driverName.replace(/\s+/g, '_')}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: customTitle || (isMulti ? 'COMMERCIAL DRIVERS EMPLOYMENT REGISTER' : 'OFFICIAL DRIVER PROFILE & EMPLOYEE DOSSIER'),
    subtitle: isMulti ? `Exported ${list.length} driver files` : `Driver: ${list[0].driverName}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 3. TRIP CONSIGNMENT NOTE & FREIGHT RECORD
// -------------------------------------------------------------------
export async function exportTripsPdf(
  trips: TripRecord | TripRecord[],
  officeDetails: OfficeDetails,
  customTitle?: string
) {
  const list = Array.isArray(trips) ? trips : [trips];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(t => {
    const routeFields: DossierField[] = [
      { label: 'Trip / Consignment No', value: t.tripNumber, highlight: true },
      { label: 'Trip Date', value: t.date },
      { label: 'Vehicle Number', value: t.vehicleNumber },
      { label: 'Driver In-Charge', value: t.driverName },
      { label: 'Customer / Client', value: t.customerName },
      { label: 'Pickup Origin', value: t.pickupLocation, highlight: true },
      { label: 'Drop Destination', value: t.dropLocation, highlight: true }
    ];

    const sections: DossierSection[] = [
      { title: 'Freight Consignment & Transport Details', fields: routeFields }
    ];

    return {
      id: t.tripNumber,
      title: `Freight Trip: ${t.tripNumber} (${t.pickupLocation} -> ${t.dropLocation})`,
      statusBadge: {
        text: 'Dispatched',
        isSuccess: true,
        isWarning: false
      },
      sections,
      notes: 'Official Bilty & Trip Consignment logged into S TRANZ TMS platform.'
    };
  });

  const filename = isMulti
    ? `Transport_Trips_${list.length}_${today}.pdf`
    : `Trip_Consignment_${list[0].tripNumber}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: customTitle || (isMulti ? 'FREIGHT TRANSPORT TRIPS REGISTER' : 'OFFICIAL TRIP CONSIGNMENT NOTE & BILTY'),
    subtitle: isMulti ? `Exported ${list.length} trip entries` : `Trip: ${list[0].tripNumber}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 4. VEHICLE COMPLAINTS & MAINTENANCE JOB CARD
// -------------------------------------------------------------------
export async function exportComplaintsPdf(
  complaints: ComplaintMaintenanceRecord | ComplaintMaintenanceRecord[],
  officeDetails: OfficeDetails,
  customTitle?: string
) {
  const list = Array.isArray(complaints) ? complaints : [complaints];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(c => {
    const jobFields: DossierField[] = [
      { label: 'Job / Ticket ID', value: c.id, highlight: true },
      { label: 'Complaint Date', value: c.complaintDate },
      { label: 'Vehicle Number', value: c.vehicleNumber },
      { label: 'Reporting Driver', value: c.driverName },
      { label: 'KM Reading', value: `${(c.kilometersReading || 0).toLocaleString('en-IN')} KM` },
      { label: 'Job Status', value: c.status },
      { label: 'Reported Issue', value: c.complaintDetails, highlight: true }
    ];

    const workshopFields: DossierField[] = [
      { label: 'Workshop / Garage', value: c.workshopName },
      { label: 'Spare Parts Replaced', value: c.repairPartsUsed || 'None' },
      { label: 'Service Completion Date', value: c.completionDate || 'In Progress' }
    ];

    const costFields: DossierField[] = [
      { label: 'Spare Parts Cost', value: `₹${(c.partsCost || 0).toLocaleString('en-IN')}` },
      { label: 'Labor / Service Cost', value: `₹${(c.laborCost || 0).toLocaleString('en-IN')}` },
      { label: 'Total Maintenance Cost', value: `₹${(c.totalCost || 0).toLocaleString('en-IN')}`, highlight: true },
      { label: 'Payment Status', value: c.paymentStatus },
      { label: 'Payment Method', value: c.paymentMethod },
      { label: 'Paid Amount', value: `₹${(c.paidAmount || 0).toLocaleString('en-IN')}` },
      { label: 'Balance Due', value: `₹${(c.balanceAmount || 0).toLocaleString('en-IN')}` }
    ];

    const sections: DossierSection[] = [
      { title: 'Vehicle Defect & Job Identification', fields: jobFields },
      { title: 'Workshop & Garage Details', fields: workshopFields },
      { title: 'Spare Parts, Labor & Financial Settlement', fields: costFields }
    ];

    return {
      id: c.id,
      title: `Job Card: ${c.vehicleNumber} — ${c.complaintDetails}`,
      statusBadge: {
        text: c.status,
        isSuccess: c.status === 'Completed',
        isWarning: c.status === 'In-Progress'
      },
      sections,
      notes: 'Maintenance conducted in compliance with fleet safety standards.'
    };
  });

  const filename = isMulti
    ? `Vehicle_JobCards_${list.length}_${today}.pdf`
    : `Maintenance_JobCard_${list[0].vehicleNumber}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: customTitle || (isMulti ? 'FLEET VEHICLE MAINTENANCE REGISTER' : 'OFFICIAL WORKSHOP JOB CARD & MAINTENANCE SHEET'),
    subtitle: isMulti ? `Exported ${list.length} job cards` : `Vehicle: ${list[0].vehicleNumber}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 5. FUEL & ADBLUE REFUELING SLIP
// -------------------------------------------------------------------
export async function exportFuelSlipsPdf(
  recordsList: (DieselRecord | AdBlueRecord)[],
  fuelType: 'Diesel' | 'AdBlue',
  officeDetails: OfficeDetails
) {
  const isMulti = recordsList.length > 1;
  const today = getToday();

  const records: DossierRecord[] = recordsList.map(f => {
    const liters = 'dieselLiters' in f ? f.dieselLiters : f.adblueLiters;
    const rate = 'dieselRate' in f ? f.dieselRate : f.adblueRate;
    const fields: DossierField[] = [
      { label: 'Refuel Slip ID', value: f.id, highlight: true },
      { label: 'Refuel Date', value: f.date },
      { label: 'Vehicle Number', value: f.vehicleNumber },
      { label: 'Driver In-Charge', value: f.driverName },
      { label: 'Fuel Type', value: fuelType === 'Diesel' ? 'Diesel (HSD)' : 'AdBlue / DEF' },
      { label: 'Previous KM Reading', value: `${(f.oldKm || 0).toLocaleString('en-IN')} KM` },
      { label: 'Current KM Reading', value: `${(f.newKm || 0).toLocaleString('en-IN')} KM` },
      { label: 'Distance Covered', value: `${(f.totalKm || 0).toLocaleString('en-IN')} KM` },
      { label: 'Liters Dispensed', value: `${liters} Liters`, highlight: true },
      { label: 'Rate Per Liter', value: `₹${(rate || 0).toFixed(2)}` },
      { label: 'Total Billed Amount', value: `₹${(f.totalAmount || 0).toLocaleString('en-IN')}`, highlight: true },
      { label: 'Payment Method', value: f.paymentMethod }
    ];

    return {
      id: f.id,
      title: `${fuelType} Refuel: ${f.vehicleNumber} (${liters} L @ ₹${(f.totalAmount || 0).toLocaleString('en-IN')})`,
      sections: [{ title: `${fuelType} Dispensation Particulars`, fields }],
      notes: 'Authorized commercial fuel dispensation slip.'
    };
  });

  const filename = isMulti
    ? `${fuelType}_Expense_Records_${recordsList.length}_${today}.pdf`
    : `${fuelType}_Fuel_Slip_${recordsList[0].vehicleNumber}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: isMulti ? `${fuelType.toUpperCase()} REFUELING EXPENSES REGISTER` : `OFFICIAL ${fuelType.toUpperCase()} DISPENSATION VOUCHER`,
    subtitle: isMulti ? `Exported ${recordsList.length} fuel transactions` : `Vehicle: ${recordsList[0].vehicleNumber}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 6. DRIVER EXIT CLEARANCE & RELIEVING CERTIFICATE
// -------------------------------------------------------------------
export async function exportExitClearancePdf(
  exitRecords: DriverExitRecord | DriverExitRecord[],
  officeDetails: OfficeDetails
) {
  const list = Array.isArray(exitRecords) ? exitRecords : [exitRecords];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(rec => {
    const detailsFields: DossierField[] = [
      { label: 'Relieving Ref ID', value: rec.id, highlight: true },
      { label: 'Driver ID', value: rec.driverId, highlight: true },
      { label: 'Driver Full Name', value: rec.driverName },
      { label: 'Assigned Vehicle', value: rec.vehicleNumber || 'Unassigned' },
      { label: 'Date of Joining', value: rec.joiningDate },
      { label: 'Resignation Date', value: rec.resignationDate },
      { label: 'Final Working Date', value: rec.finalWorkingDate || rec.resignationDate },
      { label: 'Reason for Separation', value: rec.reasonForResignation || 'Personal / Relocation' },
      { label: 'Exit Workflow Status', value: rec.exitStatus }
    ];

    const financialFields: DossierField[] = [
      { label: 'Final Working Duty Days', value: `${rec.finalAttendanceDays || 0} Days` },
      { label: 'Net Final Settlement Amount', value: `₹${(rec.finalSalaryAmount || 0).toLocaleString('en-IN')}`, highlight: true },
      { label: 'Documents Clearance', value: rec.documentsVerified ? 'Verified & Completed' : 'Pending Verification' },
      { label: 'Company Assets Status', value: rec.companyAssetsReturned ? 'Returned & Cleared' : 'Pending Handover' }
    ];

    const sections: DossierSection[] = [
      { title: 'Employee Service & Exit Particulars', fields: detailsFields },
      { title: 'Final Accounts & Dues Settlement', fields: financialFields }
    ];

    const checklist = [
      { item: 'Company Identity Card Handed Over', checked: Boolean(rec.companyAssetsReturned) },
      { item: 'Vehicle Ignition & Cabin Keys Returned', checked: Boolean(rec.companyAssetsReturned) },
      { item: 'FASTag & Fleet Cards Settled', checked: Boolean(rec.companyAssetsReturned) },
      { item: 'Statutory Documents Returned to Driver', checked: Boolean(rec.documentsVerified) },
      { item: 'Final Salary & Accounts Fully Disbursed', checked: Boolean(rec.finalSalaryCalculated) }
    ];

    return {
      id: rec.driverId || rec.id,
      title: `Exit Clearance: ${rec.driverName} (${rec.driverId})`,
      statusBadge: {
        text: rec.exitStatus || 'RELIEVED',
        isSuccess: rec.exitStatus === 'Exit Completed' || rec.exitStatus === 'Resigned',
        isWarning: rec.exitStatus === 'Resignation Initiated'
      },
      sections,
      checklist,
      notes: rec.resignationRemarks || 'This certifies that the employee has completed all exit formalities and has no outstanding liabilities with S TRANZ LOGISTIC.',
      signatures: [
        { role: 'Relieving Employee Signature', name: rec.driverName },
        { role: 'Fleet & HR Operations In-Charge', name: 'Authorized Officer' },
        { role: 'Managing Director / Corporate Signatory', name: officeDetails.companyName }
      ]
    };
  });

  const filename = isMulti
    ? `Driver_Exit_Clearance_Records_${list.length}_${today}.pdf`
    : `Driver_Relieving_Certificate_${list[0].driverId}_${today}.pdf`;

  await exportDossierPdf({
    documentTitle: isMulti ? 'DRIVER EXIT & RELIEVING CLEARANCE REGISTER' : 'OFFICIAL RELIEVING CERTIFICATE & EXIT CLEARANCE',
    subtitle: isMulti ? `Exported ${list.length} exit files` : `Driver ID: ${list[0].driverId}`,
    filename,
    records,
    officeDetails
  });
}

// -------------------------------------------------------------------
// 7. DRIVER SALARY SLIP (Single, Selected, or All)
// -------------------------------------------------------------------
export interface SalarySlipData {
  driver: Driver;
  month: string;
  basicSalary: number;
  tripAllowance: number;
  bonus: number;
  totalEarnings: number;
  advanceDeduction: number;
  pfDeduction: number;
  esiDeduction: number;
  penaltyDeduction: number;
  totalDeductions: number;
  netPay: number;
  presentDays: number;
  totalDays: number;
  paymentMode: string;
  status: string;
}

export async function exportSalarySlipsPdf(
  slips: SalarySlipData | SalarySlipData[],
  officeDetails: OfficeDetails
) {
  const list = Array.isArray(slips) ? slips : [slips];
  const isMulti = list.length > 1;
  const today = getToday();

  const records: DossierRecord[] = list.map(s => {
    const empFields: DossierField[] = [
      { label: 'Driver ID', value: s.driver.id, highlight: true },
      { label: 'Driver Name', value: s.driver.driverName },
      { label: 'Salary Month & Year', value: s.month, highlight: true },
      { label: 'Assigned Vehicle', value: s.driver.assignedVehicleNumber || 'General Fleet' },
      { label: 'Mobile Number', value: s.driver.mobileNo || '-' },
      { label: 'Payment Mode', value: s.paymentMode },
      { label: 'Days in Month', value: `${s.totalDays} Days` },
      { label: 'Present / Duty Days', value: `${s.presentDays} Days`, highlight: true }
    ];

    const earningsFields: DossierField[] = [
      { label: 'Basic Salary', value: `₹${s.basicSalary.toLocaleString('en-IN')}` },
      { label: 'Trip Allowance / Bata', value: `₹${s.tripAllowance.toLocaleString('en-IN')}` },
      { label: 'Incentive & Bonus', value: `₹${s.bonus.toLocaleString('en-IN')}` },
      { label: 'Gross Total Earnings', value: `₹${s.totalEarnings.toLocaleString('en-IN')}`, highlight: true }
    ];

    const deductionsFields: DossierField[] = [
      { label: 'Trip Cash Advance Repayment', value: `₹${s.advanceDeduction.toLocaleString('en-IN')}` },
      { label: 'Provident Fund (PF)', value: `₹${s.pfDeduction.toLocaleString('en-IN')}` },
      { label: 'ESI Contribution', value: `₹${s.esiDeduction.toLocaleString('en-IN')}` },
      { label: 'Penalties / Challans', value: `₹${s.penaltyDeduction.toLocaleString('en-IN')}` },
      { label: 'Total Deductions', value: `₹${s.totalDeductions.toLocaleString('en-IN')}`, highlight: true }
    ];

    const netFields: DossierField[] = [
      { label: 'NET SALARY DISBURSED', value: `₹${s.netPay.toLocaleString('en-IN')}`, highlight: true },
      { label: 'Disbursement Status', value: s.status },
      { label: 'Disbursement Mode', value: s.paymentMode }
    ];

    const sections: DossierSection[] = [
      { title: 'Employee & Attendance Details', fields: empFields },
      { title: 'Earnings Breakdown (Credits)', fields: earningsFields },
      { title: 'Deductions Breakdown (Debits)', fields: deductionsFields },
      { title: 'Net Take-Home Salary Payable', fields: netFields }
    ];

    return {
      id: s.driver.id,
      title: `Salary Pay Slip: ${s.driver.driverName} (${s.month})`,
      statusBadge: {
        text: s.status,
        isSuccess: s.status === 'Paid',
        isWarning: s.status === 'Pending'
      },
      sections,
      notes: `Computer generated salary statement for ${s.month}. Authorized and processed by ${officeDetails.companyName}.`,
      signatures: [
        { role: 'Driver / Employee Signature', name: s.driver.driverName },
        { role: 'Accounts In-Charge', name: 'Accounts Officer' },
        { role: 'Authorized Corporate Signatory', name: officeDetails.companyName }
      ]
    };
  });

  const filename = isMulti
    ? `Driver_Salary_Slips_${list.length}_${today}.pdf`
    : `Salary_Slip_${list[0].driver.id}_${list[0].month.replace(/\s+/g, '_')}.pdf`;

  await exportDossierPdf({
    documentTitle: isMulti ? 'DRIVERS SALARY DISBURSEMENT REGISTER' : 'OFFICIAL DRIVER SALARY SLIP',
    subtitle: isMulti ? `Exported ${list.length} payslips` : `Employee: ${list[0].driver.driverName} (${list[0].month})`,
    filename,
    records,
    officeDetails
  });
}
