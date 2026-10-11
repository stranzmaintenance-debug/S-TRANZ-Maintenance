import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  BadgeIndianRupee,
  Save,
  Camera,
  FileDown,
  Contact,
  ScrollText,
  Download
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Driver } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { printHtmlDocument } from '../../utils/exportUtils';
import { exportDriversPdf } from '../../utils/pdfModuleHelpers';

export const DriverRegister: React.FC = () => {
  const {
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    vehicles,
    salaryPackages,
    addSalaryPackage,
    updateSalaryPackage,
    termsAndConditions,
    updateTermsAndConditions,
    officeDetails
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  // Salary Package Management Modal State
  const [isSalaryPkgModalOpen, setIsSalaryPkgModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    basicSalary: 25000,
    dailyAllowance: 350,
    description: ''
  });

  // Terms & Conditions Modal State
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsForm, setTermsForm] = useState({
    english: termsAndConditions.english,
    tamil: termsAndConditions.tamil
  });
  const [termsLangTab, setTermsLangTab] = useState<'english' | 'tamil'>('english');

  // Driver ID Card Modal State
  const [idCardDriver, setIdCardDriver] = useState<Driver | null>(null);

  // Application PDF Modal State
  const [appPdfDriver, setAppPdfDriver] = useState<Driver | null>(null);
  const [pdfLang, setPdfLang] = useState<'english' | 'tamil'>('english');

  // Form fields exact 1 to 20
  const [formData, setFormData] = useState<Omit<Driver, 'id' | 'createdAt'>>({
    driverName: '',
    fatherName: '',
    dob: '',
    age: 35,
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    qualification: '',
    mobileNo: '',
    alternateNo: '',
    localAddress: '',
    nativeAddress: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    licenseNo: '',
    licenseType: 'Heavy Commercial Vehicle (HGV/TRANS)',
    badgeNo: '',
    licenseExpiryDate: '',
    previousHistory: '',
    aadharNo: '',
    panNo: '',
    noticePeriod: 30,
    selectedPackageId: salaryPackages[0]?.id || '',
    packageName: salaryPackages[0]?.name || '',
    basicSalary: salaryPackages[0]?.basicSalary || 26000,
    dailyAllowance: salaryPackages[0]?.dailyAllowance || 350,
    assignedVehicleNumber: '',
    driverPhoto: '',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setEditingDriverId(null);
    const defaultPkg = salaryPackages[0];
    setFormData({
      driverName: '',
      fatherName: '',
      dob: '1990-01-01',
      age: 36,
      maritalStatus: 'Married',
      bloodGroup: 'B+',
      qualification: '10th Standard',
      mobileNo: '',
      alternateNo: '',
      localAddress: '',
      nativeAddress: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      licenseNo: '',
      licenseType: 'Heavy Commercial Vehicle (HGV/TRANS)',
      badgeNo: '',
      licenseExpiryDate: '',
      previousHistory: '',
      aadharNo: '',
      panNo: '',
      noticePeriod: 30,
      selectedPackageId: defaultPkg?.id || '',
      packageName: defaultPkg?.name || '',
      basicSalary: defaultPkg?.basicSalary || 26000,
      dailyAllowance: defaultPkg?.dailyAllowance || 350,
      assignedVehicleNumber: '',
      driverPhoto: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriverId(d.id);
    setFormData({
      driverName: d.driverName,
      fatherName: d.fatherName,
      dob: d.dob,
      age: d.age,
      maritalStatus: d.maritalStatus,
      bloodGroup: d.bloodGroup,
      qualification: d.qualification,
      mobileNo: d.mobileNo,
      alternateNo: d.alternateNo,
      localAddress: d.localAddress,
      nativeAddress: d.nativeAddress,
      dateOfJoining: d.dateOfJoining,
      licenseNo: d.licenseNo,
      licenseType: d.licenseType,
      badgeNo: d.badgeNo,
      licenseExpiryDate: d.licenseExpiryDate,
      previousHistory: d.previousHistory,
      aadharNo: d.aadharNo,
      panNo: d.panNo,
      noticePeriod: d.noticePeriod,
      selectedPackageId: d.selectedPackageId || '',
      packageName: d.packageName || '',
      basicSalary: d.basicSalary,
      dailyAllowance: d.dailyAllowance,
      assignedVehicleNumber: d.assignedVehicleNumber || '',
      driverPhoto: d.driverPhoto || '',
      status: d.status
    });
    setIsFormOpen(true);
  };

  const handlePackageSelect = (pkgId: string) => {
    const pkg = salaryPackages.find(p => p.id === pkgId);
    if (pkg) {
      setFormData(prev => ({
        ...prev,
        selectedPackageId: pkg.id,
        packageName: pkg.name,
        basicSalary: pkg.basicSalary,
        dailyAllowance: pkg.dailyAllowance
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, driverPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverName || !formData.dateOfJoining) {
      alert('Driver Name and Date of Joining are mandatory fields.');
      return;
    }

    if (editingDriverId) {
      updateDriver(editingDriverId, formData);
    } else {
      addDriver(formData);
    }
    setIsFormOpen(false);
  };

  // Salary Package management
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name) {
      alert('Package Name is required');
      return;
    }
    if (editingPkgId) {
      updateSalaryPackage(editingPkgId, pkgForm);
    } else {
      addSalaryPackage(pkgForm);
    }
    setEditingPkgId(null);
    setPkgForm({ name: '', basicSalary: 25000, dailyAllowance: 350, description: '' });
  };

  // Terms and Conditions save
  const handleSaveTerms = (e: React.FormEvent) => {
    e.preventDefault();
    updateTermsAndConditions(termsForm);
    setIsTermsModalOpen(false);
    alert('Terms & Conditions updated and saved successfully.');
  };

  // Print / Download Driver ID Card
  const handlePrintIdCard = (driver: Driver) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Driver_ID_Card_${driver.driverName.replace(/\s+/g, '_')}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 20px; }
    .card-sheet { display: flex; gap: 30px; justify-content: center; align-items: flex-start; margin-top: 30px; }
    .id-card { width: 320px; height: 500px; border-radius: 12px; border: 2px solid #ea580c; position: relative; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; flex-direction: column; background: #ffffff; }
    .header-band { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 14px; text-align: center; border-bottom: 3px solid #ea580c; }
    .company-title { color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
    .logo-img { max-height: 38px; max-width: 140px; margin-bottom: 4px; object-fit: contain; }
    .card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; align-items: center; }
    .photo-frame { width: 110px; height: 125px; border-radius: 8px; border: 2px solid #ea580c; object-fit: cover; margin-bottom: 12px; background: #e2e8f0; }
    .driver-name { font-size: 17px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 2px; text-align: center; }
    .designation { font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
    .info-table td { padding: 4px 6px; }
    .info-table td.label { font-weight: 700; color: #475569; width: 45%; }
    .info-table td.value { font-weight: 700; color: #0f172a; }
    .back-body { padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; }
    .back-title { font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; }
    .footer-band { background: #0f172a; color: #94a3b8; font-size: 8px; text-align: center; padding: 6px; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0; color: #0f172a; text-transform: uppercase;">Official Driver Identification Card</h2>
    <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${officeDetails.companyName} • Print & Laminate</p>
  </div>
  <div class="card-sheet">
    <!-- FRONT SIDE -->
    <div class="id-card">
      <div class="header-band">
        ${officeDetails.companyLogo ? `<img src="${officeDetails.companyLogo}" class="logo-img" alt="Logo" />` : ''}
        <div class="company-title">${officeDetails.companyName}</div>
      </div>
      <div class="card-body">
        <img src="${driver.driverPhoto || 'https://via.placeholder.com/150'}" class="photo-frame" alt="${driver.driverName}" />
        <div class="driver-name">${driver.driverName}</div>
        <div class="designation">Commercial Fleet Driver</div>
        <table class="info-table">
          <tr><td class="label">Driver ID:</td><td class="value">${driver.id}</td></tr>
          <tr><td class="label">Date of Birth:</td><td class="value">${driver.dob}</td></tr>
          <tr><td class="label">Blood Group:</td><td class="value" style="color: #dc2626;">${driver.bloodGroup}</td></tr>
          <tr><td class="label">Phone Number:</td><td class="value">${driver.mobileNo}</td></tr>
          <tr><td class="label">License No:</td><td class="value">${driver.licenseNo}</td></tr>
        </table>
      </div>
      <div class="footer-band">AUTHORIZED LOGISTICS CREW • S-TRANZ</div>
    </div>

    <!-- BACK SIDE -->
    <div class="id-card">
      <div class="header-band">
        <div class="company-title">Emergency & Terms</div>
      </div>
      <div class="back-body">
        <div>
          <div class="back-title">Emergency Contact</div>
          <p style="margin: 2px 0 10px 0; font-weight: bold; color: #dc2626; font-size: 13px;">${driver.alternateNo || officeDetails.ownerContactNumber}</p>

          <div class="back-title">Driver Address</div>
          <p style="margin: 2px 0 12px 0; color: #1e293b; line-height: 1.4;">
            ${driver.localAddress || driver.nativeAddress || 'Not Provided'}
          </p>

          <div class="back-title">Company Operating Address</div>
          <p style="margin: 2px 0 12px 0; color: #1e293b; line-height: 1.4;">
            ${officeDetails.officeAddress}<br/>
            Landline: ${officeDetails.officeContactNumber}
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #cbd5e1; padding-top: 10px;">
          ${officeDetails.companyLogo ? `<img src="${officeDetails.companyLogo}" style="max-height: 28px; max-width: 110px;" alt="Logo" />` : ''}
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
            If found, please return to the corporate address above.
          </div>
        </div>
      </div>
      <div class="footer-band">PROPERTY OF ${officeDetails.companyName}</div>
    </div>
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Driver_ID_Card_${driver.driverName.replace(/\s+/g, '_')}`, html);
  };

  // Print / Download Driver Joining Application Form PDF
  const handlePrintApplication = (driver: Driver, lang: 'english' | 'tamil') => {
    const termsText = lang === 'tamil' ? termsAndConditions.tamil : termsAndConditions.english;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Driver_Application_${driver.driverName.replace(/\s+/g, '_')}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; }
    .header { border-bottom: 2.5px solid #ea580c; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .app-title-box { background: #f8fafc; border: 1.5px solid #0f172a; padding: 8px 12px; text-align: center; margin-bottom: 14px; border-radius: 4px; }
    .section-head { background: #0f172a; color: white; padding: 4px 8px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-top: 12px; margin-bottom: 8px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10.5px; }
    table.data-table td { padding: 5px 8px; border: 1px solid #e2e8f0; }
    table.data-table td.label { background: #f1f5f9; font-weight: bold; width: 30%; color: #334155; }
    table.data-table td.val { font-weight: 600; color: #0f172a; }
    .terms-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 9.5px; line-height: 1.5; white-space: pre-line; margin-top: 10px; color: #334155; }
    .photo-box { width: 95px; height: 115px; border: 2px solid #0f172a; object-fit: cover; }
    .sign-area { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 160px; border-top: 1px solid #334155; text-align: center; padding-top: 5px; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0; font-size: 18px; font-weight: 900; text-transform: uppercase;">${officeDetails.companyName}</h1>
      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
        ${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber} | GST: ${officeDetails.gstNumber}
      </div>
    </div>
    <div>
      <img src="${driver.driverPhoto || 'https://via.placeholder.com/100'}" class="photo-box" alt="Driver Photo" />
    </div>
  </div>

  <div class="app-title-box">
    <h2 style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase;">
      ${lang === 'tamil' ? 'ஓட்டுநர் விண்ணப்பப் படிவம் (DRIVER JOINING APPLICATION)' : 'COMMERCIAL FLEET DRIVER JOINING APPLICATION FORM'}
    </h2>
    <div style="font-size: 10px; color: #ea580c; font-weight: bold; margin-top: 2px;">
      Driver ID: ${driver.id} | Date of Joining: ${driver.dateOfJoining}
    </div>
  </div>

  <div class="section-head">Section 1: Personal Details (Fields 1 to 12)</div>
  <table class="data-table">
    <tr>
      <td class="label">1. Driver Full Name</td>
      <td class="val">${driver.driverName}</td>
      <td class="label">2. Father's Name</td>
      <td class="val">${driver.fatherName || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">3. Date of Birth</td>
      <td class="val">${driver.dob} (Age: ${driver.age} Years)</td>
      <td class="label">5. Marital Status</td>
      <td class="val">${driver.maritalStatus}</td>
    </tr>
    <tr>
      <td class="label">6. Blood Group</td>
      <td class="val" style="color: #dc2626; font-weight: 800;">${driver.bloodGroup}</td>
      <td class="label">7. Qualification</td>
      <td class="val">${driver.qualification || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">8. Primary Mobile No</td>
      <td class="val"><strong>${driver.mobileNo}</strong></td>
      <td class="label">9. Alternate Contact</td>
      <td class="val">${driver.alternateNo || 'None'}</td>
    </tr>
    <tr>
      <td class="label">10. Local Address</td>
      <td class="val" colspan="3">${driver.localAddress || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">11. Native Address</td>
      <td class="val" colspan="3">${driver.nativeAddress || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">12. Official Joining Date</td>
      <td class="val" colspan="3"><strong>${driver.dateOfJoining}</strong> (Attendance cycle anchored from this date)</td>
    </tr>
  </table>

  <div class="section-head">Section 2: License and Identification Details (Fields 13 to 20)</div>
  <table class="data-table">
    <tr>
      <td class="label">13. Driving License No</td>
      <td class="val" style="color: #ea580c; font-weight: 800;">${driver.licenseNo}</td>
      <td class="label">14. License Type</td>
      <td class="val">${driver.licenseType}</td>
    </tr>
    <tr>
      <td class="label">15. Badge Number</td>
      <td class="val">${driver.badgeNo || 'N/A'}</td>
      <td class="label">16. License Expiry Date</td>
      <td class="val"><strong>${driver.licenseExpiryDate}</strong></td>
    </tr>
    <tr>
      <td class="label">18. Aadhar Card Number</td>
      <td class="val">${driver.aadharNo || 'N/A'}</td>
      <td class="label">19. PAN Card Number</td>
      <td class="val">${driver.panNo || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">20. Notice Period</td>
      <td class="val">${driver.noticePeriod} Days</td>
      <td class="label">Assigned Vehicle</td>
      <td class="val">${driver.assignedVehicleNumber || 'Unassigned'}</td>
    </tr>
    <tr>
      <td class="label">17. Previous Experience</td>
      <td class="val" colspan="3">${driver.previousHistory || 'Verified commercial container transport history.'}</td>
    </tr>
  </table>

  <div class="section-head">Agreed Salary Package Structure</div>
  <table class="data-table">
    <tr>
      <td class="label">Selected Salary Package</td>
      <td class="val"><strong>${driver.packageName || 'Standard Transport Package'}</strong></td>
      <td class="label">Monthly Basic Salary</td>
      <td class="val" style="color: #059669; font-weight: 800;">₹${driver.basicSalary.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td class="label">Daily Running Allowance</td>
      <td class="val">₹${driver.dailyAllowance} / day on duty</td>
      <td class="label">Payment Mode</td>
      <td class="val">Direct NEFT Bank Transfer / Cash</td>
    </tr>
  </table>

  <div class="section-head">
    ${lang === 'tamil' ? 'விதிமுறைகள் & நிபந்தனைகள் (Terms & Conditions - Tamil)' : 'Employment Terms & Conditions (English)'}
  </div>
  <div class="terms-box">
${termsText}
  </div>

  <div class="sign-area">
    <div class="sig-line">Driver Signature / LTI</div>
    <div class="sig-line">Verified By HR / Staff</div>
    <div class="sig-line">Authorized Signatory</div>
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Driver_Application_${driver.driverName.replace(/\s+/g, '_')}_${lang}`, html);
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.driverName.toLowerCase().includes(q) ||
      d.mobileNo.toLowerCase().includes(q) ||
      d.licenseNo.toLowerCase().includes(q) ||
      (d.assignedVehicleNumber && d.assignedVehicleNumber.toLowerCase().includes(q));

    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    const matchesBlood = filterBloodGroup === 'All' || d.bloodGroup === filterBloodGroup;

    let matchesDate = true;
    if (dateFrom && d.dateOfJoining < dateFrom) matchesDate = false;
    if (dateTo && d.dateOfJoining > dateTo) matchesDate = false;

    return matchesSearch && matchesStatus && matchesBlood && matchesDate;
  });

  // Multi-driver selection for combined PDF download
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);

  const toggleSelectDriver = (id: string) => {
    setSelectedDriverIds(prev =>
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllDrivers = () => {
    if (selectedDriverIds.length === filteredDrivers.length && filteredDrivers.length > 0) {
      setSelectedDriverIds([]);
    } else {
      setSelectedDriverIds(filteredDrivers.map(d => d.id));
    }
  };

  const handleDownloadSelectedDriversPdf = async () => {
    const selected = filteredDrivers.filter(d => selectedDriverIds.includes(d.id));
    if (selected.length === 0) return;
    await exportDriversPdf(selected, officeDetails, salaryPackages);
  };

  const handleDownloadAllDriversPdf = async () => {
    if (filteredDrivers.length === 0) return;
    await exportDriversPdf(filteredDrivers, officeDetails, salaryPackages);
  };

  const handleDownloadSingleDriverPdf = async (d: Driver) => {
    await exportDriversPdf(d, officeDetails, salaryPackages);
  };

  const reportHeaders = [
    'Driver Name',
    'Joining Date',
    'Mobile No',
    'License No',
    'Package',
    'Basic Salary',
    'Allowance',
    'Status'
  ];

  const reportRows = filteredDrivers.map(d => [
    d.driverName,
    d.dateOfJoining,
    d.mobileNo,
    d.licenseNo,
    d.packageName || 'Standard',
    `₹${d.basicSalary.toLocaleString('en-IN')}`,
    `₹${d.dailyAllowance}/day`,
    d.status
  ]);

  return (
    <div className="space-y-5">
      {/* Title & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            <span>Driver Register & Joining Application</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete driver onboarding profile, reusable salary package management, bilingual terms, and dual-sided ID cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Salary Package Management Button */}
          <button
            type="button"
            onClick={() => setIsSalaryPkgModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-lg transition-colors cursor-pointer"
          >
            <BadgeIndianRupee className="w-3.5 h-3.5 text-orange-400" />
            <span>Salary Packages ({salaryPackages.length})</span>
          </button>

          {/* Terms & Conditions Button */}
          <button
            type="button"
            onClick={() => {
              setTermsForm({ english: termsAndConditions.english, tamil: termsAndConditions.tamil });
              setIsTermsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-lg transition-colors cursor-pointer"
          >
            <ScrollText className="w-3.5 h-3.5 text-orange-400" />
            <span>Terms & Conditions (Tamil / Eng)</span>
          </button>

          {/* New Driver Join Application Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Driver Join Application</span>
          </button>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Driver Register & Roster Report"
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
        selectedCount={selectedDriverIds.length}
        onDownloadSelectedPdf={handleDownloadSelectedDriversPdf}
        onDownloadAllPdf={handleDownloadAllDriversPdf}
      />

      {/* Search and Filters */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Driver Name, Mobile, License, or Vehicle..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Resigning / Exit Process">Resigning</option>
            <option value="Resigned">Resigned</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-400 ml-2">
            <span>Blood:</span>
          </div>
          <select
            value={filterBloodGroup}
            onChange={e => setFilterBloodGroup(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="O+">O+</option>
            <option value="AB+">AB+</option>
            <option value="A-">A-</option>
            <option value="B-">B-</option>
            <option value="O-">O-</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Driver Table */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedDriverIds.length === filteredDrivers.length && filteredDrivers.length > 0}
                    onChange={toggleSelectAllDrivers}
                    className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                    title="Select All Drivers for Combined PDF"
                  />
                </th>
                <th className="py-3 px-3">Driver Name & ID</th>
                <th className="py-3 px-3">Joining Date</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">License & Expiry</th>
                <th className="py-3 px-3">Salary Package</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">ID Card</th>
                <th className="py-3 px-3 text-center">Dossier PDF</th>
                <th className="py-3 px-3 text-center">Application PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDriverIds.includes(driver.id)}
                        onChange={() => toggleSelectDriver(driver.id)}
                        className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                        title={`Select ${driver.driverName} for combined PDF`}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {driver.driverPhoto ? (
                          <img
                            src={driver.driverPhoto}
                            alt={driver.driverName}
                            className="w-8 h-8 rounded-full object-cover border border-orange-500/50"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#16233a] text-orange-400 flex items-center justify-center font-bold text-xs">
                            {driver.driverName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-100">{driver.driverName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {driver.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-orange-400">
                      {driver.dateOfJoining}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{driver.mobileNo}</div>
                      <div className="text-[10px] text-slate-500">{driver.bloodGroup} • Age {driver.age}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="text-slate-200">{driver.licenseNo}</div>
                      <div className="text-[10px] text-slate-500">Exp: {driver.licenseExpiryDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{driver.packageName || 'Standard Package'}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        ₹{driver.basicSalary.toLocaleString('en-IN')} + ₹{driver.dailyAllowance}/d
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          driver.status === 'Active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : driver.status === 'Resigning / Exit Process'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : 'bg-red-950/60 text-red-400 border border-red-800/40'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    {/* ID Card Front & Back Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setIdCardDriver(driver)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-md transition-colors cursor-pointer"
                        title="Generate Driver ID Card (Front & Back)"
                      >
                        <Contact className="w-3.5 h-3.5 text-orange-400" />
                        <span>ID Card</span>
                      </button>
                    </td>
                    {/* Direct Real PDF Dossier Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleDriverPdf(driver)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`Download Full PDF Profile for ${driver.driverName}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Dossier PDF</span>
                      </button>
                    </td>
                    {/* Application PDF Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAppPdfDriver(driver);
                          setPdfLang('english');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-200 bg-[#162238] hover:bg-[#1d2d4a] border border-[#24375b] rounded-md transition-colors shadow-sm cursor-pointer"
                        title="Download Joining Application PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-orange-400" />
                        <span>Application</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <ActionButtons
                        onEdit={() => handleOpenEdit(driver)}
                        onDelete={() => deleteDriver(driver.id)}
                        itemName={`Driver ${driver.driverName}`}
                        compact={true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIVER APPLICATION FORM MODAL (Fields 1 - 20) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingDriverId ? 'Edit Driver Application' : 'Driver Join Application Form (Fields 1 - 20)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              {/* SECTION 1: PERSONAL DETAILS (1 to 12) */}
              <div>
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider pb-2 border-b border-[#1b2c49] mb-3 flex items-center justify-between">
                  <span>Section 1: Personal Details (Fields 1 to 12)</span>
                  <label className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Driver Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      1. Driver Name <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.driverName}
                      onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="e.g. K. Murugan"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">2. Father Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="e.g. M. Karuppasamy"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">3. Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">4. Age</label>
                    <input
                      type="number"
                      min={18}
                      max={70}
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">5. Marital Status</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Married">Married</option>
                      <option value="Single">Single</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">6. Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="O-">O-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">7. Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. 10th Passed"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      8. Mobile No. <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileNo}
                      onChange={e => setFormData({ ...formData, mobileNo: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">9. Alternate No.</label>
                    <input
                      type="tel"
                      value={formData.alternateNo}
                      onChange={e => setFormData({ ...formData, alternateNo: e.target.value })}
                      placeholder="Emergency contact"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-orange-400 mb-1">
                      12. Date of Joining <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfJoining}
                      onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-orange-500/60 rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500">Attendance starts from this date</span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">10. Local Address</label>
                    <textarea
                      rows={2}
                      value={formData.localAddress}
                      onChange={e => setFormData({ ...formData, localAddress: e.target.value })}
                      placeholder="Current address"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">11. Native Address</label>
                    <textarea
                      rows={2}
                      value={formData.nativeAddress}
                      onChange={e => setFormData({ ...formData, nativeAddress: e.target.value })}
                      placeholder="Permanent native village / hometown address"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LICENSE AND IDENTIFICATION DETAILS (13 to 20) */}
              <div>
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider pb-2 border-b border-[#1b2c49] mb-3">
                  Section 2: License and Identification Details (Fields 13 to 20)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      13. License No. <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNo}
                      onChange={e => setFormData({ ...formData, licenseNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. TN3820060004521"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">14. License Type</label>
                    <select
                      value={formData.licenseType}
                      onChange={e => setFormData({ ...formData, licenseType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Heavy Commercial Vehicle (HGV/TRANS)">Heavy Commercial Vehicle (HGV/TRANS)</option>
                      <option value="Heavy Goods Vehicle (HGV)">Heavy Goods Vehicle (HGV)</option>
                      <option value="Medium Goods Vehicle (MGV)">Medium Goods Vehicle (MGV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">15. Badge No.</label>
                    <input
                      type="text"
                      value={formData.badgeNo}
                      onChange={e => setFormData({ ...formData, badgeNo: e.target.value })}
                      placeholder="Badge No."
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">16. License Expiry Date</label>
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={e => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">18. Aadhar No.</label>
                    <input
                      type="text"
                      value={formData.aadharNo}
                      onChange={e => setFormData({ ...formData, aadharNo: e.target.value })}
                      placeholder="12-digit UID"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">19. PAN No.</label>
                    <input
                      type="text"
                      value={formData.panNo}
                      onChange={e => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                      placeholder="PAN Number"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">20. Notice Period (Days)</label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={formData.noticePeriod}
                      onChange={e => setFormData({ ...formData, noticePeriod: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">17. Previous History</label>
                    <textarea
                      rows={2}
                      value={formData.previousHistory}
                      onChange={e => setFormData({ ...formData, previousHistory: e.target.value })}
                      placeholder="Route experience, previous fleet company"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SALARY PACKAGE SELECTION (Reusable Packages) */}
              <div>
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider pb-2 border-b border-[#1b2c49] mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BadgeIndianRupee className="w-4 h-4" />
                    <span>Reusable Salary Package & Fleet Assignment</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSalaryPkgModalOpen(true)}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Packages</span>
                  </button>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Choose Salary Package
                    </label>
                    <select
                      value={formData.selectedPackageId}
                      onChange={e => handlePackageSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      {salaryPackages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} (₹{pkg.basicSalary} + ₹{pkg.dailyAllowance}/d)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Allowance (₹/day)</label>
                    <input
                      type="number"
                      value={formData.dailyAllowance}
                      onChange={e => setFormData({ ...formData, dailyAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Vehicle Number</label>
                    <select
                      value={formData.assignedVehicleNumber}
                      onChange={e => setFormData({ ...formData, assignedVehicleNumber: e.target.value })}
                      className="w-full max-w-sm px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100"
                    >
                      <option value="">-- No Vehicle Assigned --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.vehicleNumber}>
                          {v.vehicleNumber} ({v.make})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDriverId ? 'Save Changes' : 'Save Driver Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALARY PACKAGE MANAGEMENT MODAL */}
      {isSalaryPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">Salary Package Management</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSalaryPkgModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
              {/* Add / Edit Package Sub-form */}
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#17243c]">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
                  {editingPkgId ? 'Edit Salary Package' : 'Add New Salary Package'}
                </h4>
                <form onSubmit={handleSavePackage} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-slate-300 font-semibold mb-1">Package Title / Category *</label>
                    <input
                      type="text"
                      required
                      value={pkgForm.name}
                      onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })}
                      placeholder="e.g. Express Long-Haul Package"
                      className="w-full px-2.5 py-1.5 bg-[#0b1324] border border-[#1d2d4a] rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Basic Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      value={pkgForm.basicSalary}
                      onChange={e => setPkgForm({ ...pkgForm, basicSalary: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#0b1324] border border-[#1d2d4a] rounded-lg font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Daily Allowance (₹/day) *</label>
                    <input
                      type="number"
                      required
                      value={pkgForm.dailyAllowance}
                      onChange={e => setPkgForm({ ...pkgForm, dailyAllowance: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-[#0b1324] border border-[#1d2d4a] rounded-lg font-mono text-slate-100"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-sm"
                    >
                      {editingPkgId ? 'Update Package' : 'Save New Package'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Reusable Packages Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Configured Salary Packages (Reusable)</h4>
                <div className="overflow-x-auto border border-[#1b2b48] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070c17] text-slate-400">
                      <tr>
                        <th className="p-2.5">Package Name</th>
                        <th className="p-2.5 font-mono">Basic Salary</th>
                        <th className="p-2.5 font-mono">Daily Allowance</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#17243c]">
                      {salaryPackages.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-[#0f192e]">
                          <td className="p-2.5 font-bold text-slate-100">{pkg.name}</td>
                          <td className="p-2.5 font-mono text-emerald-400">₹{pkg.basicSalary.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-mono text-slate-300">₹{pkg.dailyAllowance}/day</td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPkgId(pkg.id);
                                setPkgForm({
                                  name: pkg.name,
                                  basicSalary: pkg.basicSalary,
                                  dailyAllowance: pkg.dailyAllowance,
                                  description: pkg.description || ''
                                });
                              }}
                              className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 bg-orange-950/40 rounded border border-orange-800/40 mr-1"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1a2b47]">
              <button
                type="button"
                onClick={() => setIsSalaryPkgModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS (TAMIL & ENGLISH) MODAL */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Driver Joining Terms & Conditions (Tamil & English)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTermsLangTab('english')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md ${
                  termsLangTab === 'english' ? 'bg-orange-600 text-white' : 'bg-[#142036] text-slate-400'
                }`}
              >
                English Version
              </button>
              <button
                type="button"
                onClick={() => setTermsLangTab('tamil')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md ${
                  termsLangTab === 'tamil' ? 'bg-orange-600 text-white' : 'bg-[#142036] text-slate-400'
                }`}
              >
                தமிழ் வடிவம் (Tamil Version)
              </button>
            </div>

            <form onSubmit={handleSaveTerms} className="flex-1 overflow-y-auto py-3 space-y-3">
              {termsLangTab === 'english' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    English Terms & Conditions (Appears in English Application PDF)
                  </label>
                  <textarea
                    rows={12}
                    value={termsForm.english}
                    onChange={e => setTermsForm({ ...termsForm, english: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 leading-relaxed font-sans"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    தமிழ் விதிமுறைகள் & நிபந்தனைகள் (Tamil Terms & Conditions)
                  </label>
                  <textarea
                    rows={12}
                    value={termsForm.tamil}
                    onChange={e => setTermsForm({ ...termsForm, tamil: e.target.value })}
                    className="w-full px-3 py-2 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 leading-relaxed font-sans"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a2b47]">
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Terms & Conditions</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER ID CARD (FRONT & BACK) MODAL */}
      {idCardDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <Contact className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Driver Identity Card (Front & Back): {idCardDriver.driverName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIdCardDriver(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5">
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                {/* FRONT SIDE PREVIEW */}
                <div className="w-64 h-96 rounded-xl border-2 border-orange-500/80 bg-gradient-to-b from-[#0f172a] via-[#091122] to-[#040711] shadow-2xl overflow-hidden flex flex-col justify-between text-center relative">
                  <div className="p-3 bg-[#0a1122] border-b border-orange-500/50">
                    {officeDetails.companyLogo && (
                      <img src={officeDetails.companyLogo} alt="Logo" className="h-7 mx-auto object-contain mb-1" />
                    )}
                    <div className="text-[11px] font-black uppercase text-white tracking-wider truncate">
                      {officeDetails.companyName}
                    </div>
                  </div>

                  <div className="px-3 py-2 flex flex-col items-center">
                    <img
                      src={idCardDriver.driverPhoto || 'https://via.placeholder.com/150'}
                      alt={idCardDriver.driverName}
                      className="w-20 h-24 rounded-lg object-cover border-2 border-orange-500 mb-2 bg-slate-800"
                    />
                    <div className="text-sm font-extrabold text-white uppercase truncate max-w-full">
                      {idCardDriver.driverName}
                    </div>
                    <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                      Fleet Driver • ID: {idCardDriver.id}
                    </div>

                    <div className="w-full mt-2 pt-2 border-t border-[#182744] text-[10px] space-y-1 text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-400">DOB:</span>
                        <span className="font-mono text-slate-200">{idCardDriver.dob}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="font-bold text-red-400">{idCardDriver.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-slate-200">{idCardDriver.mobileNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5 bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider">
                    Official Crew ID • S-TRANZ
                  </div>
                </div>

                {/* BACK SIDE PREVIEW */}
                <div className="w-64 h-96 rounded-xl border-2 border-orange-500/80 bg-gradient-to-b from-[#0f172a] via-[#091122] to-[#040711] shadow-2xl overflow-hidden flex flex-col justify-between text-left p-4 relative">
                  <div>
                    <div className="text-[11px] font-bold text-orange-400 uppercase border-b border-[#1f3154] pb-1 mb-2">
                      Emergency Information
                    </div>
                    <div className="text-[10px] space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Emergency Contact:</span>
                        <strong className="text-red-400 font-mono text-xs">{idCardDriver.alternateNo || officeDetails.ownerContactNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Driver Address:</span>
                        <p className="text-slate-200 text-[10px] line-clamp-3">
                          {idCardDriver.localAddress || idCardDriver.nativeAddress || 'Not Provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Company Address:</span>
                        <p className="text-slate-200 text-[10px] line-clamp-3">
                          {officeDetails.officeAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1a2b47] text-center">
                    {officeDetails.companyLogo && (
                      <img src={officeDetails.companyLogo} alt="Logo" className="h-6 mx-auto object-contain mb-1" />
                    )}
                    <span className="text-[9px] text-slate-500 block">
                      If found, return to {officeDetails.companyName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1a2b47] shrink-0">
              <span className="text-xs text-slate-400">Dual-sided standard PVC card template</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintIdCard(idCardDriver)}
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Contact className="w-4 h-4" />
                  <span>Download / Print ID Card (Front & Back)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIdCardDriver(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER APPLICATION PDF MODAL (Language Selection + Download PDF) */}
      {appPdfDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Driver Joining Application PDF Format
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAppPdfDriver(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-[#070c17] rounded-lg border border-[#16233a] flex items-center gap-3">
                <img
                  src={appPdfDriver.driverPhoto || 'https://via.placeholder.com/100'}
                  alt={appPdfDriver.driverName}
                  className="w-12 h-14 rounded object-cover border border-orange-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{appPdfDriver.driverName}</h4>
                  <div className="text-[11px] text-orange-400 font-mono">Joining Date: {appPdfDriver.dateOfJoining}</div>
                  <div className="text-[10px] text-slate-400">License: {appPdfDriver.licenseNo}</div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Select Terms & Conditions Language for Application:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPdfLang('english')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      pdfLang === 'english'
                        ? 'border-orange-500 bg-orange-950/40 text-white font-bold'
                        : 'border-[#1b2b48] bg-[#070c17] text-slate-400'
                    }`}
                  >
                    <div className="text-xs">English Version</div>
                    <div className="text-[10px] text-slate-500">Standard English terms & signatory lines</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfLang('tamil')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      pdfLang === 'tamil'
                        ? 'border-orange-500 bg-orange-950/40 text-white font-bold'
                        : 'border-[#1b2b48] bg-[#070c17] text-slate-400'
                    }`}
                  >
                    <div className="text-xs">தமிழ் வடிவம் (Tamil)</div>
                    <div className="text-[10px] text-slate-500">தமிழ் விதிமுறைகள் & ஒப்புதல் கையெழுத்து</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a2b47]">
              <button
                type="button"
                onClick={() => setAppPdfDriver(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePrintApplication(appPdfDriver, pdfLang)}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Application PDF ({pdfLang === 'tamil' ? 'Tamil' : 'English'})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
