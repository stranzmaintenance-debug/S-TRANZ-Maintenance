import {
  OfficeDetails,
  User,
  Vehicle,
  Driver,
  AttendanceRecord,
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

export const initialCompanyLogo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect x="5" y="10" width="80" height="100" rx="14" fill="url(#shieldGrad)" stroke="#ea580c" stroke-width="3"/>
  <path d="M 22 34 L 68 34 L 28 62 L 68 62 L 28 90 L 68 90" fill="none" stroke="url(#brandGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="105" y="52" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" letter-spacing="1.5">S-TRANZ</text>
  <text x="106" y="80" fill="#ea580c" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="20" letter-spacing="3">LOGISTIC</text>
  <text x="106" y="100" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="11" letter-spacing="1">FLEET MAINTENANCE &amp; OPERATIONS</text>
</svg>
`);

export const defaultOfficePhoto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="bldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bldGrad)"/>
  <!-- Modern transport terminal architectural facade -->
  <rect x="80" y="80" width="640" height="300" rx="10" fill="#142036" stroke="#233554" stroke-width="2"/>
  <!-- Glazed windows grid -->
  <g fill="#1d2e4d" opacity="0.8">
    <rect x="120" y="120" width="100" height="60" rx="4"/>
    <rect x="250" y="120" width="100" height="60" rx="4"/>
    <rect x="380" y="120" width="100" height="60" rx="4"/>
    <rect x="510" y="120" width="100" height="60" rx="4"/>
    <rect x="120" y="210" width="100" height="60" rx="4"/>
    <rect x="250" y="210" width="100" height="60" rx="4"/>
    <rect x="380" y="210" width="100" height="60" rx="4"/>
    <rect x="510" y="210" width="100" height="60" rx="4"/>
  </g>
  <!-- Main Entrance with orange canopy -->
  <polygon points="340,300 460,300 480,380 320,380" fill="#080e1c"/>
  <rect x="330" y="290" width="140" height="12" rx="3" fill="url(#accentGrad)"/>
  <!-- Company Brand Sign on building -->
  <rect x="260" y="55" width="280" height="45" rx="6" fill="#070c18" stroke="#ea580c" stroke-width="2"/>
  <text x="400" y="84" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="2">S-TRANZ LOGISTICS HUB</text>
  <!-- Foreground asphalt pavement -->
  <rect x="0" y="380" width="800" height="70" fill="#090e1a"/>
  <line x1="0" y1="415" x2="800" y2="415" stroke="#f59e0b" stroke-width="4" stroke-dasharray="25,20"/>
</svg>
`);

export const defaultLoginBg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#040711"/>
      <stop offset="50%" stop-color="#091122"/>
      <stop offset="100%" stop-color="#0d1830"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1020"/>
      <stop offset="100%" stop-color="#03060c"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#skyGrad)"/>
  <circle cx="960" cy="400" r="600" fill="#ea580c" opacity="0.04" filter="blur(80px)"/>
  <polygon points="0,550 250,520 400,550 700,510 950,560 1200,500 1500,540 1920,520 1920,700 0,700" fill="#0c152a" opacity="0.6"/>
  <line x1="300" y1="520" x2="300" y2="400" stroke="#1e293b" stroke-width="4"/>
  <line x1="250" y1="400" x2="380" y2="400" stroke="#ea580c" stroke-width="3" opacity="0.6"/>
  <polygon points="300,1080 880,620 1040,620 1620,1080" fill="url(#roadGrad)"/>
  <polygon points="760,1080 945,620 975,620 1160,1080" fill="#080d1a"/>
  <path d="M 880 620 L 300 1080" stroke="#ea580c" stroke-width="6" opacity="0.7"/>
  <path d="M 890 620 L 350 1080" stroke="#f97316" stroke-width="3" opacity="0.9"/>
  <path d="M 1030 620 L 1570 1080" stroke="#38bdf8" stroke-width="5" opacity="0.7"/>
  <path d="M 1040 620 L 1620 1080" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
  <line x1="960" y1="620" x2="960" y2="1080" stroke="#f59e0b" stroke-width="6" stroke-dasharray="35,30" opacity="0.8"/>
</svg>
`);

export const defaultDriverAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#avatarBg)"/>
  <circle cx="100" cy="75" r="38" fill="#cbd5e1"/>
  <path d="M 62 65 Q 100 45 138 65 L 148 70 L 52 70 Z" fill="#ea580c"/>
  <path d="M 52 70 Q 100 60 148 70 L 160 75 Q 100 68 40 75 Z" fill="#c2410c"/>
  <path d="M 35 185 C 35 130, 65 125, 100 125 C 135 125, 165 130, 165 185 Z" fill="#1e3a5f"/>
  <polygon points="90,125 110,125 105,185 95,185" fill="#ea580c"/>
</svg>
`);

export const initialOfficeDetails: OfficeDetails = {
  companyLogo: initialCompanyLogo,
  companyName: 'S TRANZ LOGISTIC MAINTENANCE',
  companyOwnerName: 'Mr. S. Sakthivel',
  ownerContactNumber: '+91 98421 28190',
  officeContactNumber: '+91 422 2456789',
  officeAddress: 'Plot No. 42/B, Transport Nagar, Avinashi Road, Coimbatore - 641014, Tamil Nadu',
  companyEmail: 'stranzmaintenance57@gmail.com',
  companyWebsiteUrl: 'https://stranzlogistics.com',
  bookingWebsiteUrl: 'https://booking.stranzlogistics.com',
  gstNumber: '33AABCS1234F1Z8',
  officePhoto: defaultOfficePhoto
};

// Pre-seeded reusable salary packages
export const initialSalaryPackages: SalaryPackage[] = [
  {
    id: 'pkg_1',
    name: 'Heavy Duty Multi-Axle (Senior)',
    basicSalary: 28000,
    dailyAllowance: 400,
    description: 'For 10/12-wheeler long-distance inter-state drivers with 10+ years experience.'
  },
  {
    id: 'pkg_2',
    name: 'Standard Container Carrier',
    basicSalary: 26000,
    dailyAllowance: 350,
    description: 'For commercial closed container operations across Southern corridors.'
  },
  {
    id: 'pkg_3',
    name: 'Regional Freight / Haulage',
    basicSalary: 25000,
    dailyAllowance: 350,
    description: 'For regional line-haul routes within Tamil Nadu, Karnataka & Kerala.'
  },
  {
    id: 'pkg_4',
    name: 'Junior Commercial Driver',
    basicSalary: 22000,
    dailyAllowance: 300,
    description: 'For newly joined commercial drivers during initial 6-month probation.'
  }
];

// Pre-seeded Terms & Conditions in English and Tamil
export const initialTermsAndConditions: TermsAndConditions = {
  english: `1. Duty Hours & Safety: Driver must strictly obey all highway speed regulations (max 65 km/h) and never drive under the influence of alcohol, medication, or fatigue.
2. Trip & Consignment Protection: Driver is entirely responsible for the security of loaded consignments, vehicle keys, FASTag, fuel cards, and vehicle original documents during transit.
3. Daily Odometer & Vehicle Check: Driver must perform daily pre-trip inspections (engine oil level, coolant, tyre pressure, brakes, DEF AdBlue level) and report any breakdown immediately.
4. Fuel & Toll Discipline: Fuel bills and toll receipts must be submitted promptly at the depot upon trip completion. Unaccounted fuel deficits will be recovered from monthly allowance.
5. Notice Period & Handover: A mandatory notice period of 30 days must be served prior to resignation. All company ID cards, uniforms, and vehicle assets must be surrendered.
6. Attendance & Discipline: Monthly attendance is recorded from the verified joining date. Unscheduled absent days without prior managerial consent will incur standard deduction.`,
  tamil: `1. ஓட்டுநர் கடமைகள் & பாதுகாப்பு: அனைத்து நெடுஞ்சாலை வேக வரம்புகளையும் (அதிகபட்சம் 65 கிமீ/மணி) கண்டிப்புடன் கடைபிடிக்க வேண்டும். மது அல்லது போதைப்பொருள் உட்கொண்டு வாகனம் ஓட்டக்கூடாது.
2. சரக்கு & ஆவணங்கள் பாதுகாப்பு: ஏற்றிச் செல்லப்படும் சரக்குகள், வாகன சாவி, அசல் ஆவணங்கள் (RC, Permit, Insurance), FASTag கார்டு ஆகியவற்றின் முழு பொறுப்பும் ஓட்டுநருடையதே.
3. தினசரி வாகன ஆய்வு: இன்ஜின் ஆயில், கூலண்ட், டயர் பிரஷர், பிரேக், AdBlue DEF அளவு ஆகியவற்றை புறப்படும் முன் சரிபார்க்க வேண்டும். ஏதேனும் பழுது இருப்பின் உடனே தெரிவிக்கவும்.
4. எரிபொருள் & சுங்கச்சாவடி ரசீதுகள்: டீசல் ரசீதுகள் மற்றும் டோல் ரசீதுகளை முறையாக அலுவலகத்தில் சமர்ப்பிக்க வேண்டும். கணக்கில் வராத எரிபொருள் இழப்பு அனுமதிக்கப்படாது.
5. ராஜினாமா அறிவிப்புக் காலம்: பணியை விட்டு விலக 30 நாட்கள் முன்னறிவிப்பு கட்டாயம். அனைத்து நிறுவன உடைமைகள் மற்றும் அடையாள அட்டை ஒப்படைக்கப்பட வேண்டும்.
6. வருகைப்பதிவு & ஒழுக்கம்: சரிபார்க்கப்பட்ட பணியில் சேர்ந்த தேதியிலிருந்து மட்டுமே வருகை கணக்கிடப்படும். அனுமதியின்றி விடுப்பு எடுக்கக் கூடாது.`
};

export const initialUsers: User[] = [
  {
    id: 'usr_admin_owner',
    name: 'S. Sakthivel (Chief Admin)',
    email: 'stranzmaintenance57@gmail.com',
    role: 'Admin',
    username: 'stranz_admin57',
    mobile: '9842128190',
    status: 'Active',
    passwordHash: 'Stranz@2819',
    lastLogin: '2026-10-05 08:30 AM',
    createdAt: '2025-01-01'
  },
  {
    id: 'usr_admin_1',
    name: 'Chief Admin (Maintenance)',
    email: 'stranzmaintenance@gmail.com',
    role: 'Admin',
    username: 'stranz_admin1',
    mobile: '9842128190',
    status: 'Active',
    passwordHash: 'Stranz@2819',
    lastLogin: '2026-10-05 08:30 AM',
    createdAt: '2025-01-01'
  },
  {
    id: 'usr_admin_2',
    name: 'Director Admin',
    email: 'info.stranz@gmail.com',
    role: 'Admin',
    username: 'stranz_director',
    mobile: '9443212819',
    status: 'Active',
    passwordHash: 'Sam10kmr',
    lastLogin: '2026-10-04 05:45 PM',
    createdAt: '2025-01-01'
  },
  {
    id: 'usr_staff_1',
    name: 'Suresh Kumar',
    email: 'staff@stranz.com',
    role: 'Office Staff',
    username: 'suresh_ops',
    mobile: '9876543210',
    status: 'Active',
    passwordHash: 'Staff@1234',
    lastLogin: '2026-10-05 09:15 AM',
    createdAt: '2025-02-15'
  },
  {
    id: 'usr_manager_1',
    name: 'K. Balaji',
    email: 'manager@stranz.com',
    role: 'Manager',
    username: 'balaji_mgr',
    mobile: '9842155443',
    status: 'Active',
    passwordHash: 'Manager@1234',
    lastLogin: '2026-10-05 07:50 AM',
    createdAt: '2025-01-20'
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh_1',
    vehicleNumber: 'TN-38-BZ-4521',
    engineNumber: 'ENG-OM906-88321',
    chassisNumber: 'MBZ98765432104521',
    registeredAtRto: 'Coimbatore North (TN-38)',
    model: '2023 Heavy Duty Multi-Axle Carrier',
    unladenWeight: '8,800 KG',
    loadCapacity: '28,000 KG',
    make: 'BharatBenz 2823R',
    tyre: '10 Wheeler Radial Tubeless',
    vehicleFit: 'Closed Heavy Container Carrier',
    height: '12.8 FT',
    width: '8.4 FT',
    closedBodyOrOpenBody: 'Closed Body',
    registrationDate: '2023-04-12',
    rcCardDoc: { fileName: 'RC_TN38BZ4521.pdf', fileUrl: '#' },
    fitnessValidDate: '2027-04-10',
    fitnessDoc: { fileName: 'Fitness_TN38BZ4521.pdf', fileUrl: '#' },
    insuranceValidDate: '2027-05-15',
    insuranceDoc: { fileName: 'Insurance_TN38BZ4521.pdf', fileUrl: '#' },
    taxValidDate: '2027-03-31',
    taxDoc: { fileName: 'RoadTax_TN38BZ4521.pdf', fileUrl: '#' },
    puccValidDate: '2027-02-18',
    puccDoc: { fileName: 'PUCC_TN38BZ4521.pdf', fileUrl: '#' },
    permitValidDate: '2028-04-01',
    permitDoc: { fileName: 'StatePermit_TN38BZ4521.pdf', fileUrl: '#' },
    nationalPermitValidDate: '2028-04-01',
    nationalPermitDoc: { fileName: 'NationalPermit_TN38BZ4521.pdf', fileUrl: '#' },
    currentStatus: 'Active',
    assignedDriverId: 'drv_1',
    assignedDriverName: 'K. Murugan',
    createdAt: '2025-01-01'
  },
  {
    id: 'veh_2',
    vehicleNumber: 'TN-38-CD-8910',
    engineNumber: 'ENG-EICHER-6028',
    chassisNumber: 'ECH78291038298910',
    registeredAtRto: 'Coimbatore South (TN-38)',
    model: '2024 Pro 6028 Cargo Container',
    unladenWeight: '7,900 KG',
    loadCapacity: '25,000 KG',
    make: 'Eicher Pro 6028',
    tyre: '10 Wheeler',
    vehicleFit: 'High Cube Container Body',
    height: '12.5 FT',
    width: '8.2 FT',
    closedBodyOrOpenBody: 'Closed Body',
    registrationDate: '2024-01-18',
    rcCardDoc: { fileName: 'RC_TN38CD8910.pdf', fileUrl: '#' },
    fitnessValidDate: '2027-01-15',
    fitnessDoc: { fileName: 'Fitness_TN38CD8910.pdf', fileUrl: '#' },
    insuranceValidDate: '2027-02-20',
    insuranceDoc: { fileName: 'Insurance_TN38CD8910.pdf', fileUrl: '#' },
    taxValidDate: '2027-01-31',
    taxDoc: { fileName: 'RoadTax_TN38CD8910.pdf', fileUrl: '#' },
    puccValidDate: '2026-12-10',
    puccDoc: { fileName: 'PUCC_TN38CD8910.pdf', fileUrl: '#' },
    permitValidDate: '2028-01-15',
    permitDoc: { fileName: 'StatePermit_TN38CD8910.pdf', fileUrl: '#' },
    nationalPermitValidDate: '2028-01-15',
    nationalPermitDoc: { fileName: 'NationalPermit_TN38CD8910.pdf', fileUrl: '#' },
    currentStatus: 'Active',
    assignedDriverId: 'drv_2',
    assignedDriverName: 'R. Selvam',
    createdAt: '2025-01-15'
  },
  {
    id: 'veh_3',
    vehicleNumber: 'TN-37-EF-1234',
    engineNumber: 'ENG-TATA-3118-TC',
    chassisNumber: 'TAT90283746191234',
    registeredAtRto: 'Coimbatore Central (TN-37)',
    model: '2022 Signa 3118.T Logistics',
    unladenWeight: '9,200 KG',
    loadCapacity: '31,000 KG',
    make: 'Tata Signa 3118.T',
    tyre: '12 Wheeler Radial',
    vehicleFit: 'Open Platform High Bed',
    height: '11.0 FT',
    width: '8.5 FT',
    closedBodyOrOpenBody: 'Open Body',
    registrationDate: '2022-09-05',
    rcCardDoc: { fileName: 'RC_TN37EF1234.pdf', fileUrl: '#' },
    fitnessValidDate: '2026-11-20',
    fitnessDoc: { fileName: 'Fitness_TN37EF1234.pdf', fileUrl: '#' },
    insuranceValidDate: '2026-10-30',
    insuranceDoc: { fileName: 'Insurance_TN37EF1234.pdf', fileUrl: '#' },
    taxValidDate: '2026-12-31',
    taxDoc: { fileName: 'RoadTax_TN37EF1234.pdf', fileUrl: '#' },
    puccValidDate: '2026-11-15',
    puccDoc: { fileName: 'PUCC_TN37EF1234.pdf', fileUrl: '#' },
    permitValidDate: '2027-09-01',
    permitDoc: { fileName: 'StatePermit_TN37EF1234.pdf', fileUrl: '#' },
    nationalPermitValidDate: '2027-09-01',
    nationalPermitDoc: { fileName: 'NationalPermit_TN37EF1234.pdf', fileUrl: '#' },
    currentStatus: 'Under Maintenance',
    assignedDriverId: 'drv_3',
    assignedDriverName: 'P. Suresh',
    createdAt: '2025-02-01'
  },
  {
    id: 'veh_4',
    vehicleNumber: 'TN-38-AK-9922',
    engineNumber: 'ENG-ASHOK-2820',
    chassisNumber: 'AL2820981726359922',
    registeredAtRto: 'Coimbatore North (TN-38)',
    model: '2023 AVTR 2820 HG Haulage',
    unladenWeight: '8,400 KG',
    loadCapacity: '28,000 KG',
    make: 'Ashok Leyland 2820',
    tyre: '10 Wheeler',
    vehicleFit: 'Closed Freight Box',
    height: '12.0 FT',
    width: '8.3 FT',
    closedBodyOrOpenBody: 'Closed Body',
    registrationDate: '2023-11-10',
    rcCardDoc: { fileName: 'RC_TN38AK9922.pdf', fileUrl: '#' },
    fitnessValidDate: '2027-11-05',
    fitnessDoc: { fileName: 'Fitness_TN38AK9922.pdf', fileUrl: '#' },
    insuranceValidDate: '2027-11-20',
    insuranceDoc: { fileName: 'Insurance_TN38AK9922.pdf', fileUrl: '#' },
    taxValidDate: '2027-10-31',
    taxDoc: { fileName: 'RoadTax_TN38AK9922.pdf', fileUrl: '#' },
    puccValidDate: '2027-05-10',
    puccDoc: { fileName: 'PUCC_TN38AK9922.pdf', fileUrl: '#' },
    permitValidDate: '2028-11-01',
    permitDoc: { fileName: 'StatePermit_TN38AK9922.pdf', fileUrl: '#' },
    nationalPermitValidDate: '2028-11-01',
    nationalPermitDoc: { fileName: 'NationalPermit_TN38AK9922.pdf', fileUrl: '#' },
    currentStatus: 'Active',
    assignedDriverId: 'drv_4',
    assignedDriverName: 'V. Prakash',
    createdAt: '2025-02-10'
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'drv_1',
    driverName: 'K. Murugan',
    fatherName: 'M. Karuppasamy',
    dob: '1984-06-15',
    age: 42,
    maritalStatus: 'Married',
    bloodGroup: 'O+',
    qualification: '10th Standard Passed',
    mobileNo: '9842188345',
    alternateNo: '9443219082',
    localAddress: '14, Nehru Nagar, Singanallur, Coimbatore - 641005',
    nativeAddress: '3/45, South Street, Kovilpatti, Thoothukudi - 628501',
    dateOfJoining: '2025-01-10',
    licenseNo: 'TN3820060004521',
    licenseType: 'Heavy Commercial Vehicle (HGV/TRANS)',
    badgeNo: 'BDG-TN-9821',
    licenseExpiryDate: '2028-06-14',
    previousHistory: '15 years heavy commercial inter-state container experience across TN, Kerala, Karnataka.',
    aadharNo: '4821 9023 1184',
    panNo: 'AKPM9821R',
    noticePeriod: 30,
    selectedPackageId: 'pkg_1',
    packageName: 'Heavy Duty Multi-Axle (Senior)',
    basicSalary: 28000,
    dailyAllowance: 400,
    driverPhoto: defaultDriverAvatar,
    status: 'Active',
    assignedVehicleNumber: 'TN-38-BZ-4521',
    createdAt: '2025-01-10'
  },
  {
    id: 'drv_2',
    driverName: 'R. Selvam',
    fatherName: 'P. Ramanathan',
    dob: '1988-09-22',
    age: 38,
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    qualification: '12th Standard Passed',
    mobileNo: '9789123456',
    alternateNo: '9655123456',
    localAddress: '88, Trichy Road, Sulur, Coimbatore - 641402',
    nativeAddress: '12, Mettupalayam Main Road, Karur - 639002',
    dateOfJoining: '2025-03-01',
    licenseNo: 'TN4720100007812',
    licenseType: 'Heavy Commercial Vehicle (HGV/TRANS)',
    badgeNo: 'BDG-TN-4530',
    licenseExpiryDate: '2029-09-21',
    previousHistory: '11 years multi-axle cargo fleet transport. Clean record.',
    aadharNo: '8392 1029 4819',
    panNo: 'BPRS4521L',
    noticePeriod: 30,
    selectedPackageId: 'pkg_2',
    packageName: 'Standard Container Carrier',
    basicSalary: 26000,
    dailyAllowance: 350,
    driverPhoto: defaultDriverAvatar,
    status: 'Active',
    assignedVehicleNumber: 'TN-38-CD-8910',
    createdAt: '2025-03-01'
  },
  {
    id: 'drv_3',
    driverName: 'P. Suresh',
    fatherName: 'K. Palanisamy',
    dob: '1990-12-05',
    age: 35,
    maritalStatus: 'Married',
    bloodGroup: 'A+',
    qualification: 'ITI Mechanical',
    mobileNo: '9443198765',
    alternateNo: '9944198765',
    localAddress: '23, Anna Nagar, Gandhipuram, Coimbatore - 641012',
    nativeAddress: '4/12, Chettipalayam Road, Palladam, Tirupur - 641664',
    dateOfJoining: '2025-06-15',
    licenseNo: 'TN3720120009384',
    licenseType: 'Heavy Goods Vehicle (HGV)',
    badgeNo: 'BDG-TN-8723',
    licenseExpiryDate: '2027-12-04',
    previousHistory: '8 years logistics operations. Proficient in maintenance diagnostics.',
    aadharNo: '7482 9102 3847',
    panNo: 'CPRS9012K',
    noticePeriod: 30,
    selectedPackageId: 'pkg_3',
    packageName: 'Regional Freight / Haulage',
    basicSalary: 25000,
    dailyAllowance: 350,
    driverPhoto: defaultDriverAvatar,
    status: 'Active',
    assignedVehicleNumber: 'TN-37-EF-1234',
    createdAt: '2025-06-15'
  },
  {
    id: 'drv_4',
    driverName: 'V. Prakash',
    fatherName: 'S. Veerappan',
    dob: '1992-04-18',
    age: 34,
    maritalStatus: 'Single',
    bloodGroup: 'AB+',
    qualification: '10th Standard Passed',
    mobileNo: '9629876543',
    alternateNo: '9500123456',
    localAddress: '56, Sathy Road, Saravanampatti, Coimbatore - 641035',
    nativeAddress: '2/89, Gandhi Street, Bhavani, Erode - 638301',
    dateOfJoining: '2025-08-01',
    licenseNo: 'TN3320140003921',
    licenseType: 'Heavy Commercial Vehicle (HGV)',
    badgeNo: 'BDG-TN-1192',
    licenseExpiryDate: '2029-04-17',
    previousHistory: '7 years container trailer driver. Excellent safety score.',
    aadharNo: '9182 3746 5019',
    panNo: 'EVPK8392M',
    noticePeriod: 30,
    selectedPackageId: 'pkg_3',
    packageName: 'Regional Freight / Haulage',
    basicSalary: 25000,
    dailyAllowance: 350,
    driverPhoto: defaultDriverAvatar,
    status: 'Active',
    assignedVehicleNumber: 'TN-38-AK-9922',
    createdAt: '2025-08-01'
  },
  {
    id: 'drv_5_resigned',
    driverName: 'M. Anandhan',
    fatherName: 'C. Muthu',
    dob: '1982-01-10',
    age: 44,
    maritalStatus: 'Married',
    bloodGroup: 'O+',
    qualification: '8th Standard',
    mobileNo: '9442019283',
    alternateNo: '9843029384',
    localAddress: '7, Podanur Main Road, Coimbatore',
    nativeAddress: 'Madurai East, Madurai',
    dateOfJoining: '2025-02-01',
    licenseNo: 'TN5820040001294',
    licenseType: 'Heavy Vehicle',
    badgeNo: 'BDG-MD-9012',
    licenseExpiryDate: '2027-01-09',
    previousHistory: '18 years senior driver.',
    aadharNo: '3029 4910 2938',
    panNo: 'AMTM3920P',
    noticePeriod: 30,
    selectedPackageId: 'pkg_1',
    packageName: 'Heavy Duty Multi-Axle (Senior)',
    basicSalary: 27000,
    dailyAllowance: 400,
    driverPhoto: defaultDriverAvatar,
    status: 'Resigned',
    resignationDate: '2026-09-15',
    createdAt: '2025-02-01'
  }
];

export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = [
    '2026-10-01',
    '2026-10-02',
    '2026-10-03',
    '2026-10-04', // Sunday
    '2026-10-05'  // Today
  ];

  const activeDrivers = [
    { id: 'drv_1', name: 'K. Murugan' },
    { id: 'drv_2', name: 'R. Selvam' },
    { id: 'drv_3', name: 'P. Suresh' },
    { id: 'drv_4', name: 'V. Prakash' }
  ];

  dates.forEach(date => {
    const isSunday = date === '2026-10-04';
    activeDrivers.forEach((drv, index) => {
      let status: 'Present' | 'Absent' | 'Sunday' | 'Government Holiday' = 'Present';
      if (isSunday) {
        status = 'Sunday';
      } else if (date === '2026-10-02') {
        status = 'Government Holiday'; // Gandhi Jayanti
      } else if (index === 2 && date === '2026-10-03') {
        status = 'Absent';
      }
      records.push({
        id: `att_${date}_${drv.id}`,
        date,
        driverId: drv.id,
        driverName: drv.name,
        status
      });
    });
  });

  return records;
}

// Streamlined Trip Records (only the 7 required fields)
export const initialTrips: TripRecord[] = [
  {
    id: 'trp_101',
    tripNumber: 'TRP-2026-8812',
    date: '2026-10-04',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    customerName: 'TVS Supply Chain Solutions',
    pickupLocation: 'Coimbatore Hub (TN)',
    dropLocation: 'Sriperumbudur Auto SEZ (Chennai)'
  },
  {
    id: 'trp_102',
    tripNumber: 'TRP-2026-8813',
    date: '2026-10-05',
    vehicleNumber: 'TN-38-CD-8910',
    driverName: 'R. Selvam',
    customerName: 'ITC Paperboards & Specialty Papers',
    pickupLocation: 'Mettupalayam Mill',
    dropLocation: 'Bangalore Whitefield Depot'
  },
  {
    id: 'trp_103',
    tripNumber: 'TRP-2026-8814',
    date: '2026-10-03',
    vehicleNumber: 'TN-38-AK-9922',
    driverName: 'V. Prakash',
    customerName: 'Bosch Automotive Components',
    pickupLocation: 'Coimbatore Foundry Unit',
    dropLocation: 'Kochi Vallarpadam Container Terminal'
  }
];

export const initialComplaints: ComplaintMaintenanceRecord[] = [
  {
    id: 'cmp_201',
    complaintDate: '2026-09-28',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    complaintDetails: 'Air brake valve pressure leak and front left brake shoe wear.',
    kilometersReading: 112100,
    workshopName: 'Shree Balaji Diesel & Pneumatic Works, Avinashi Rd',
    status: 'Completed',
    repairPartsUsed: 'WABCO Quick Release Valve + Front Brake Shoe Set + Air Hose',
    partsCost: 8500,
    laborCost: 2200,
    totalCost: 10700,
    billUpload: { fileName: 'Brake_Invoice_Balaji_10700.pdf', fileUrl: '#' },
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    paidAmount: 10700,
    balanceAmount: 0,
    completionDate: '2026-09-29'
  },
  {
    id: 'cmp_202',
    complaintDate: '2026-10-02',
    vehicleNumber: 'TN-37-EF-1234',
    driverName: 'P. Suresh',
    complaintDetails: 'Clutch plate slipping under heavy load and booster pedal hardness.',
    kilometersReading: 95400,
    workshopName: 'Tata Authorized Commercial Service, Neelambur',
    status: 'In-Progress',
    repairPartsUsed: 'Clutch Disc 380mm + Release Bearing + Master Cylinder Kit',
    partsCost: 16800,
    laborCost: 4500,
    totalCost: 21300,
    billUpload: { fileName: 'Tata_Estimate_21300.pdf', fileUrl: '#' },
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Partial',
    paidAmount: 10000,
    balanceAmount: 11300
  },
  {
    id: 'cmp_203',
    complaintDate: '2026-10-04',
    vehicleNumber: 'TN-38-CD-8910',
    driverName: 'R. Selvam',
    complaintDetails: 'Engine oil service, fuel filter replacement, and DEF injector cleaning.',
    kilometersReading: 84100,
    workshopName: 'Eicher Genuine Fleet Workshop, Karumathampatti',
    status: 'Completed',
    repairPartsUsed: 'Mobil Delvac 15W40 18L + Eicher Genuine Spin-on Fuel Filters',
    partsCost: 11200,
    laborCost: 1800,
    totalCost: 13000,
    billUpload: { fileName: 'Eicher_Invoice_13000.pdf', fileUrl: '#' },
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    paidAmount: 13000,
    balanceAmount: 0,
    completionDate: '2026-10-04'
  }
];

// Diesel Register Initial Records with paymentMethod
export const initialDieselRecords: DieselRecord[] = [
  {
    id: 'dsl_1',
    date: '2026-09-25',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    oldKm: 111800,
    newKm: 112100,
    totalKm: 300,
    dieselLiters: 80,
    dieselRate: 94.50,
    totalAmount: 7560,
    paymentMethod: 'UPI',
    billUpload: { fileName: 'HPCL_Diesel_Bill_7560.pdf', fileUrl: '#' }
  },
  {
    id: 'dsl_2',
    date: '2026-10-01',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    oldKm: 112100,
    newKm: 112500,
    totalKm: 400,
    dieselLiters: 110,
    dieselRate: 94.50,
    totalAmount: 10395,
    paymentMethod: 'Bank Transfer',
    billUpload: { fileName: 'BPCL_Highway_10395.pdf', fileUrl: '#' }
  },
  {
    id: 'dsl_3',
    date: '2026-09-29',
    vehicleNumber: 'TN-38-CD-8910',
    driverName: 'R. Selvam',
    oldKm: 83700,
    newKm: 84100,
    totalKm: 400,
    dieselLiters: 105,
    dieselRate: 94.50,
    totalAmount: 9922.50,
    paymentMethod: 'UPI',
    billUpload: { fileName: 'IOCL_Bill_9922.pdf', fileUrl: '#' }
  },
  {
    id: 'dsl_4',
    date: '2026-10-04',
    vehicleNumber: 'TN-38-AK-9922',
    driverName: 'V. Prakash',
    oldKm: 64700,
    newKm: 65100,
    totalKm: 400,
    dieselLiters: 98,
    dieselRate: 94.50,
    totalAmount: 9261,
    paymentMethod: 'Bank Transfer',
    billUpload: { fileName: 'Reliance_Diesel_9261.pdf', fileUrl: '#' }
  }
];

// AdBlue Register Initial Records with paymentMethod
export const initialAdBlueRecords: AdBlueRecord[] = [
  {
    id: 'adb_1',
    date: '2026-09-22',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    oldKm: 110000,
    newKm: 111500,
    totalKm: 1500,
    adblueLiters: 30,
    adblueRate: 65.00,
    totalAmount: 1950,
    paymentMethod: 'UPI',
    billUpload: { fileName: 'DEF_AdBlue_1950.pdf', fileUrl: '#' }
  },
  {
    id: 'adb_2',
    date: '2026-10-02',
    vehicleNumber: 'TN-38-BZ-4521',
    driverName: 'K. Murugan',
    oldKm: 111500,
    newKm: 112500,
    totalKm: 1000,
    adblueLiters: 20,
    adblueRate: 65.00,
    totalAmount: 1300,
    paymentMethod: 'Bank Transfer',
    billUpload: { fileName: 'IOCL_DEF_1300.pdf', fileUrl: '#' }
  },
  {
    id: 'adb_3',
    date: '2026-09-28',
    vehicleNumber: 'TN-38-CD-8910',
    driverName: 'R. Selvam',
    oldKm: 82500,
    newKm: 84000,
    totalKm: 1500,
    adblueLiters: 25,
    adblueRate: 65.00,
    totalAmount: 1625,
    paymentMethod: 'UPI',
    billUpload: { fileName: 'Eicher_DEF_1625.pdf', fileUrl: '#' }
  }
];

export const initialTollExpenses: TollExpenseRecord[] = [
  {
    id: 'tol_1',
    date: '2026-10-04',
    amount: 1450,
    transactionType: 'FASTag Auto-Debit',
    tollgateNameOrTrip: 'Coimbatore - Salem - Attur FASTag Plaza',
    billUpload: { fileName: 'FASTag_Oct4_1450.pdf', fileUrl: '#' }
  },
  {
    id: 'tol_2',
    date: '2026-10-03',
    amount: 680,
    transactionType: 'FASTag Auto-Debit',
    tollgateNameOrTrip: 'Walayar Checkpost & Palakkad Bypass Plaza',
    billUpload: { fileName: 'FASTag_Oct3_680.pdf', fileUrl: '#' }
  },
  {
    id: 'tol_3',
    date: '2026-09-30',
    amount: 3000,
    transactionType: 'FASTag Manual Recharge',
    tollgateNameOrTrip: 'ICICI FASTag Commercial Fleet Wallet Topup',
    billUpload: { fileName: 'FASTag_Wallet_3000.pdf', fileUrl: '#' }
  }
];

export const initialVehicleDocExpenses: VehicleDocumentExpenseRecord[] = [
  {
    id: 'vde_1',
    date: '2026-09-20',
    vehicleNumber: 'TN-38-BZ-4521',
    amount: 5200,
    documentType: 'State Permit',
    fineAmount: 0,
    paymentMethod: 'Bank Transfer',
    paymentBillAmount: 5200,
    paymentBillUpload: { fileName: 'Parivahan_PermitChallan_5200.pdf', fileUrl: '#' },
    documentUpload: { fileName: 'StatePermit_TN38BZ4521_2028.pdf', fileUrl: '#' }
  },
  {
    id: 'vde_2',
    date: '2026-09-25',
    vehicleNumber: 'TN-38-CD-8910',
    amount: 1850,
    documentType: 'Pollution',
    fineAmount: 250,
    paymentMethod: 'UPI',
    paymentBillAmount: 2100,
    paymentBillUpload: { fileName: 'PUCC_Challan_2100.pdf', fileUrl: '#' },
    documentUpload: { fileName: 'PUCC_Certificate_TN38CD8910.pdf', fileUrl: '#' }
  },
  {
    id: 'vde_3',
    date: '2026-09-12',
    vehicleNumber: 'TN-37-EF-1234',
    amount: 14200,
    documentType: 'Road Tax',
    fineAmount: 0,
    paymentMethod: 'Bank Transfer',
    paymentBillAmount: 14200,
    paymentBillUpload: { fileName: 'TN_TaxReceipt_14200.pdf', fileUrl: '#' },
    documentUpload: { fileName: 'QuarterlyTax_TN37EF1234.pdf', fileUrl: '#' }
  }
];

export const initialDriverAdvances: DriverAdvanceRecord[] = [
  {
    id: 'adv_1',
    date: '2026-10-01',
    driverId: 'drv_1',
    driverName: 'K. Murugan',
    amount: 2500,
    remarks: 'Trip emergency food and road allowance advance',
    receiptUpload: { fileName: 'Advance_Voucher_2500.pdf', fileUrl: '#' }
  },
  {
    id: 'adv_2',
    date: '2026-10-03',
    driverId: 'drv_1',
    driverName: 'K. Murugan',
    amount: 1500,
    remarks: 'Family personal medical advance',
    receiptUpload: { fileName: 'Advance_Slip_1500.pdf', fileUrl: '#' }
  },
  {
    id: 'adv_3',
    date: '2026-10-02',
    driverId: 'drv_2',
    driverName: 'R. Selvam',
    amount: 2000,
    remarks: 'Monthly mid-advance',
    receiptUpload: { fileName: 'Advance_Selvam_2000.pdf', fileUrl: '#' }
  }
];

export const initialDriverCompanyExpenses: DriverCompanyExpenseRecord[] = [
  {
    id: 'dce_1',
    date: '2026-10-02',
    driverId: 'drv_1',
    driverName: 'K. Murugan',
    amount: 850,
    details: 'Company safety shoes and high-visibility uniform pair',
    receiptUpload: { fileName: 'SafetyKit_Bill_850.pdf', fileUrl: '#' }
  },
  {
    id: 'dce_2',
    date: '2026-10-04',
    driverId: 'drv_2',
    driverName: 'R. Selvam',
    amount: 450,
    details: 'Annual driver eye-testing and health checkup clinic bill',
    receiptUpload: { fileName: 'EyeClinic_Bill_450.pdf', fileUrl: '#' }
  }
];

export const initialExitRecords: DriverExitRecord[] = [
  {
    id: 'exit_1',
    driverId: 'drv_5_resigned',
    driverName: 'M. Anandhan',
    joiningDate: '2025-02-01',
    resignationDate: '2026-09-15',
    reasonForResignation: 'Relocation to native hometown (Madurai) due to family agriculture.',
    resignationRemarks: 'All handover duties and vehicle check completed with satisfaction.',
    finalWorkingDate: '2026-09-15',
    requiredDocs: ['Aadhar Card', 'PAN Card', 'Commercial License', 'Company ID Card', 'Exit Handover Slip'],
    submittedDocs: ['Aadhar Card', 'PAN Card', 'Commercial License', 'Company ID Card', 'Exit Handover Slip'],
    missingDocs: [],
    documentsVerified: true,
    finalSalaryCalculated: true,
    finalSalaryAmount: 18450,
    finalAttendanceDays: 14,
    attendanceClosed: true,
    exitFormGenerated: true,
    signedExitForm: { fileName: 'Signed_ExitForm_M_Anandhan.pdf', fileUrl: '#' },
    companyAssetsReturned: true,
    exitStatus: 'Resigned',
    updatedAt: '2026-09-18'
  }
];

export const initialBroadcastMessages: BroadcastMessage[] = [
  {
    id: 'msg_1',
    senderId: 'usr_admin_1',
    senderName: 'Chief Admin',
    title: 'Highway Speed Limit & FastTag Balance Alert',
    message: 'All drivers must ensure FASTag balance is above ₹1,500 before starting inter-state trips. Highway night speed must strictly remain below 65 km/h.',
    priority: 'High',
    sentAt: '2026-10-04 10:30 AM',
    readByUsers: ['usr_admin_1']
  },
  {
    id: 'msg_2',
    senderId: 'usr_admin_2',
    senderName: 'Director Admin',
    title: 'Monthly Maintenance Schedule - Oct 2026',
    message: 'Vehicles due for quarterly fitness and grease lubrication inspection must report to Avinashi depot on or before 10th October.',
    priority: 'Normal',
    sentAt: '2026-10-02 02:15 PM',
    readByUsers: ['usr_admin_1', 'usr_admin_2']
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-10-05 08:30:12 AM',
    userId: 'usr_admin_1',
    userEmail: 'stranzmaintenance57@gmail.com',
    userName: 'Chief Admin',
    action: 'LOGIN_SUCCESS',
    details: 'User logged in successfully from Admin Portal.'
  },
  {
    id: 'log_2',
    timestamp: '2026-10-04 05:45:00 PM',
    userId: 'usr_admin_2',
    userEmail: 'info.stranz@gmail.com',
    userName: 'Director Admin',
    action: 'BROADCAST_SENT',
    details: 'Broadcast message "Highway Speed Limit" sent to all users.'
  }
];
