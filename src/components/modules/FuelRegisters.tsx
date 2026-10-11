import React, { useState } from 'react';
import {
  Fuel,
  Droplet,
  Plus,
  Search,
  Filter,
  Save,
  X,
  FileDown,
  Download,
  FileText,
  CreditCard
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DieselRecord, AdBlueRecord, FuelPaymentMethod } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { printHtmlDocument } from '../../utils/exportUtils';
import { exportDossierPdf } from '../../services/pdfService';

interface FuelRegistersProps {
  initialTab?: 'diesel' | 'adblue';
}

interface CombinedFuelRecord {
  id: string;
  type: 'Diesel' | 'AdBlue/DEF';
  date: string;
  vehicleNumber: string;
  driverName: string;
  oldKm: number;
  newKm: number;
  totalKm: number;
  liters: number;
  rate: number;
  expense: number; // Combined "Fuel & AdBlue/DEF Expense"
  paymentMethod: FuelPaymentMethod;
  billUpload?: any;
}

export const FuelRegisters: React.FC<FuelRegistersProps> = ({ initialTab = 'diesel' }) => {
  const {
    vehicles,
    drivers,
    dieselRecords,
    getPreviousDieselKm,
    getLatestVehicleKm,
    addDieselRecord,
    updateDieselRecord,
    deleteDieselRecord,
    adblueRecords,
    getPreviousAdBlueKm,
    addAdBlueRecord,
    updateAdBlueRecord,
    deleteAdBlueRecord,
    officeDetails
  } = useData();

  // Helper to retrieve the latest successfully saved New KM from the database for the selected vehicle
  // Rule: vehicle-by-vehicle retrieval; one vehicle's KM is never mixed with another.
  const getLatestSavedNewKmForVehicle = (vehNum: string, type: 'Diesel' | 'AdBlue/DEF'): number | null => {
    // 1. Retrieve the latest saved entry from this specific register for the vehicle
    const regKm = type === 'Diesel'
      ? getPreviousDieselKm(vehNum)
      : getPreviousAdBlueKm(vehNum);
    if (regKm !== null) return regKm;

    // 2. If no entries exist yet in this register for this vehicle, check overall latest for this vehicle
    const fallbackKm = getLatestVehicleKm(vehNum);
    return fallbackKm !== null ? fallbackKm : null;
  };

  // Tab: Diesel or AdBlue, or All combined
  const [filterType, setFilterType] = useState<'All' | 'Diesel' | 'AdBlue/DEF'>(
    initialTab === 'diesel' ? 'Diesel' : 'AdBlue/DEF'
  );

  // Individual Vehicle Data: select specific vehicle to view its own records
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.vehicleNumber || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CombinedFuelRecord | null>(null);

  // Individual Process PDF Modal State
  const [pdfRecord, setPdfRecord] = useState<CombinedFuelRecord | null>(null);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);

  // Form fields: oldKm and newKm allow '' so newKm is always BLANK when starting
  const [formType, setFormType] = useState<'Diesel' | 'AdBlue/DEF'>(
    filterType === 'AdBlue/DEF' ? 'AdBlue/DEF' : 'Diesel'
  );

  const [formData, setFormData] = useState<{
    date: string;
    vehicleNumber: string;
    driverName: string;
    oldKm: number | '';
    newKm: number | '';
    liters: number;
    rate: number;
    expense: number; // Fuel & AdBlue/DEF Expense
    paymentMethod: FuelPaymentMethod;
    billUpload?: any;
  }>({
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: vehicles[0]?.vehicleNumber || '',
    driverName: drivers[0]?.driverName || '',
    oldKm: '',
    newKm: '',
    liters: 100,
    rate: 94.50,
    expense: 9450,
    paymentMethod: 'Bank Transfer',
    billUpload: undefined
  });

  // Build combined record list with common "Fuel & AdBlue/DEF Expense" column
  const combinedList: CombinedFuelRecord[] = [
    ...dieselRecords.map(d => ({
      id: d.id,
      type: 'Diesel' as const,
      date: d.date,
      vehicleNumber: d.vehicleNumber,
      driverName: d.driverName,
      oldKm: d.oldKm,
      newKm: d.newKm,
      totalKm: d.totalKm,
      liters: d.dieselLiters,
      rate: d.dieselRate,
      expense: d.totalAmount, // Fuel & AdBlue/DEF Expense
      paymentMethod: d.paymentMethod || 'Bank Transfer',
      billUpload: d.billUpload
    })),
    ...adblueRecords.map(a => ({
      id: a.id,
      type: 'AdBlue/DEF' as const,
      date: a.date,
      vehicleNumber: a.vehicleNumber,
      driverName: a.driverName,
      oldKm: a.oldKm,
      newKm: a.newKm,
      totalKm: a.totalKm,
      liters: a.adblueLiters,
      rate: a.adblueRate,
      expense: a.totalAmount, // Fuel & AdBlue/DEF Expense
      paymentMethod: a.paymentMethod || 'UPI',
      billUpload: a.billUpload
    }))
  ].sort((a, b) => (b.date > a.date ? 1 : -1));

  // Individual vehicle data filtering - each vehicle maintains its own records
  const filteredRecords = combinedList.filter(r => {
    // Individual vehicle filter
    if (selectedVehicle && selectedVehicle !== 'All' && r.vehicleNumber !== selectedVehicle) {
      return false;
    }
    if (filterType !== 'All' && r.type !== filterType) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.vehicleNumber.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q);

    let matchesDate = true;
    if (dateFrom && r.date < dateFrom) matchesDate = false;
    if (dateTo && r.date > dateTo) matchesDate = false;

    return matchesSearch && matchesDate;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const targetVeh = (selectedVehicle && selectedVehicle !== 'All') ? selectedVehicle : (vehicles[0]?.vehicleNumber || '');
    const vehObj = vehicles.find(v => v.vehicleNumber === targetVeh);
    const assignedDriver = vehObj?.assignedDriverName || drivers[0]?.driverName || '';
    const currentFormType = filterType === 'AdBlue/DEF' ? 'AdBlue/DEF' : 'Diesel';
    setFormType(currentFormType);

    // Retrieve latest successfully saved New KM from the database for this vehicle
    const prevSavedNewKm = getLatestSavedNewKmForVehicle(targetVeh, currentFormType);
    const defaultRate = currentFormType === 'Diesel' ? 94.50 : 65.00;
    const defaultLiters = currentFormType === 'Diesel' ? 100 : 25;

    setFormData({
      date: new Date().toISOString().split('T')[0],
      vehicleNumber: targetVeh,
      driverName: assignedDriver,
      // Previous saved New KM -> automatically filled into Old KM
      // If no previous record exists for this vehicle, keep Old KM blank ('')
      oldKm: prevSavedNewKm !== null ? prevSavedNewKm : '',
      // New KM must ALWAYS be BLANK when starting a new entry!
      newKm: '',
      liters: defaultLiters,
      rate: defaultRate,
      expense: defaultLiters * defaultRate,
      paymentMethod: currentFormType === 'Diesel' ? 'Bank Transfer' : 'UPI',
      billUpload: undefined
    });
    setIsFormOpen(true);
  };

  const handleVehicleChangeInForm = (vehNum: string, type: 'Diesel' | 'AdBlue/DEF') => {
    const veh = vehicles.find(v => v.vehicleNumber === vehNum);
    const assignedDriver = veh?.assignedDriverName || drivers[0]?.driverName || '';
    // Retrieve latest successfully saved New KM for this specific selected vehicle
    const prevSavedNewKm = getLatestSavedNewKmForVehicle(vehNum, type);

    setFormData(prev => ({
      ...prev,
      vehicleNumber: vehNum,
      driverName: assignedDriver,
      // Automatically filled from this vehicle's previous saved New KM, or blank if none
      oldKm: prevSavedNewKm !== null ? prevSavedNewKm : '',
      // New KM must ALWAYS remain blank so the admin enters the new reading manually
      newKm: ''
    }));
  };

  const handleTypeChangeInForm = (newType: 'Diesel' | 'AdBlue/DEF') => {
    setFormType(newType);
    // Retrieve latest successfully saved New KM for this vehicle in the selected fuel register
    const prevSavedNewKm = getLatestSavedNewKmForVehicle(formData.vehicleNumber, newType);
    const defaultRate = newType === 'Diesel' ? 94.50 : 65.00;
    const defaultLiters = newType === 'Diesel' ? 100 : 25;

    setFormData(prev => ({
      ...prev,
      oldKm: prevSavedNewKm !== null ? prevSavedNewKm : '',
      // New KM must ALWAYS remain blank when switching types
      newKm: '',
      rate: defaultRate,
      liters: defaultLiters,
      expense: defaultLiters * defaultRate,
      paymentMethod: newType === 'Diesel' ? 'Bank Transfer' : 'UPI'
    }));
  };

  const handleOpenEdit = (record: CombinedFuelRecord) => {
    setEditingRecord(record);
    setFormType(record.type);
    setFormData({
      date: record.date,
      vehicleNumber: record.vehicleNumber,
      driverName: record.driverName,
      oldKm: record.oldKm,
      newKm: record.newKm,
      liters: record.liters,
      rate: record.rate,
      expense: record.expense,
      paymentMethod: record.paymentMethod,
      billUpload: record.billUpload
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber) {
      alert('Vehicle Number is required.');
      return;
    }
    if (formData.oldKm === '' || isNaN(Number(formData.oldKm))) {
      alert('Please enter a valid Old Kilometer reading.');
      return;
    }
    if (formData.newKm === '' || isNaN(Number(formData.newKm))) {
      alert('Please enter the current New Kilometer reading.');
      return;
    }

    const oldKmNum = Number(formData.oldKm);
    const newKmNum = Number(formData.newKm);

    if (oldKmNum < 0 || newKmNum < 0) {
      alert('Kilometer readings cannot be negative.');
      return;
    }

    // Strict validation: New KM must not be less than Old KM
    if (newKmNum < oldKmNum) {
      alert(
        `Validation Error: New KM (${newKmNum.toLocaleString('en-IN')}) cannot be less than Old KM (${oldKmNum.toLocaleString('en-IN')}).\n\n` +
        `KM Covered cannot be negative. Please enter a valid current odometer reading.`
      );
      return;
    }

    const kmCovered = newKmNum - oldKmNum;
    const litersNum = Number(formData.liters) || 0;
    const rateNum = Number(formData.rate) || 0;

    if (litersNum <= 0 || rateNum <= 0) {
      alert('Liters filled and Rate per Liter must be greater than 0.');
      return;
    }

    const totalExp = Math.round(litersNum * rateNum * 100) / 100;

    if (formType === 'Diesel') {
      const payload = {
        date: formData.date,
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        oldKm: oldKmNum,
        newKm: newKmNum,
        dieselLiters: litersNum,
        dieselRate: rateNum,
        totalAmount: totalExp,
        paymentMethod: formData.paymentMethod,
        billUpload: formData.billUpload
      };
      if (editingRecord && editingRecord.type === 'Diesel') {
        updateDieselRecord(editingRecord.id, payload);
      } else {
        addDieselRecord(payload);
      }
    } else {
      const payload = {
        date: formData.date,
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        oldKm: oldKmNum,
        newKm: newKmNum,
        adblueLiters: litersNum,
        adblueRate: rateNum,
        totalAmount: totalExp,
        paymentMethod: formData.paymentMethod,
        billUpload: formData.billUpload
      };
      if (editingRecord && editingRecord.type === 'AdBlue/DEF') {
        updateAdBlueRecord(editingRecord.id, payload);
      } else {
        addAdBlueRecord(payload);
      }
    }

    setIsFormOpen(false);
  };

  // Open Individual Process PDF Modal
  const handleOpenProcessPdf = (rec: CombinedFuelRecord) => {
    setPdfRecord(rec);
    setIsPdfGenerated(false);
  };

  const [selectedFuelIds, setSelectedFuelIds] = useState<string[]>([]);

  const toggleSelectFuel = (id: string) => {
    setSelectedFuelIds(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFuel = () => {
    if (selectedFuelIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedFuelIds([]);
    } else {
      setSelectedFuelIds(filteredRecords.map(f => f.id));
    }
  };

  const handleDownloadSelectedFuelPdf = async () => {
    const selected = filteredRecords.filter(r => selectedFuelIds.includes(r.id));
    if (selected.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    await exportDossierPdf({
      documentTitle: 'FUEL & ADBLUE/DEF TRANSACTIONS DOSSIER',
      subtitle: `Exported ${selected.length} fuel vouchers`,
      filename: `Fuel_Records_Selected_${selected.length}_${today}.pdf`,
      records: selected.map(rec => ({
        id: rec.id,
        title: `${rec.type}: ${rec.vehicleNumber} (${rec.liters} L @ ₹${rec.expense.toLocaleString('en-IN')})`,
        statusBadge: { text: rec.paymentMethod, isSuccess: true },
        sections: [{
          title: 'Refueling Particulars & Odometer Log',
          fields: [
            { label: 'Date', value: rec.date },
            { label: 'Vehicle Number', value: rec.vehicleNumber, highlight: true },
            { label: 'Driver Name', value: rec.driverName },
            { label: 'Fuel Type', value: rec.type },
            { label: 'Payment Method', value: rec.paymentMethod },
            { label: 'Previous Odometer', value: `${rec.oldKm.toLocaleString('en-IN')} KM` },
            { label: 'Current Odometer', value: `${rec.newKm.toLocaleString('en-IN')} KM` },
            { label: 'Distance Covered', value: `${rec.totalKm.toLocaleString('en-IN')} KM` },
            { label: 'Quantity Dispensed', value: `${rec.liters} Liters`, highlight: true },
            { label: 'Rate Per Liter', value: `₹${rec.rate.toFixed(2)}` },
            { label: 'Total Billed Expense', value: `₹${rec.expense.toLocaleString('en-IN')}`, highlight: true }
          ]
        }]
      })),
      officeDetails
    });
  };

  const handleDownloadAllFuelPdf = async () => {
    if (filteredRecords.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    await exportDossierPdf({
      documentTitle: 'COMPLETE FUEL & ADBLUE/DEF LOGS DOSSIER',
      subtitle: `Exported ${filteredRecords.length} fuel vouchers`,
      filename: `Fuel_Records_All_${filteredRecords.length}_${today}.pdf`,
      records: filteredRecords.map(rec => ({
        id: rec.id,
        title: `${rec.type}: ${rec.vehicleNumber} (${rec.liters} L @ ₹${rec.expense.toLocaleString('en-IN')})`,
        statusBadge: { text: rec.paymentMethod, isSuccess: true },
        sections: [{
          title: 'Refueling Particulars & Odometer Log',
          fields: [
            { label: 'Date', value: rec.date },
            { label: 'Vehicle Number', value: rec.vehicleNumber, highlight: true },
            { label: 'Driver Name', value: rec.driverName },
            { label: 'Fuel Type', value: rec.type },
            { label: 'Payment Method', value: rec.paymentMethod },
            { label: 'Previous Odometer', value: `${rec.oldKm.toLocaleString('en-IN')} KM` },
            { label: 'Current Odometer', value: `${rec.newKm.toLocaleString('en-IN')} KM` },
            { label: 'Distance Covered', value: `${rec.totalKm.toLocaleString('en-IN')} KM` },
            { label: 'Quantity Dispensed', value: `${rec.liters} Liters`, highlight: true },
            { label: 'Rate Per Liter', value: `₹${rec.rate.toFixed(2)}` },
            { label: 'Total Billed Expense', value: `₹${rec.expense.toLocaleString('en-IN')}`, highlight: true }
          ]
        }]
      })),
      officeDetails
    });
  };

  // Download PDF for selected individual record only
  const handleDownloadProcessPdf = async (rec: CombinedFuelRecord) => {
    const today = new Date().toISOString().split('T')[0];
    await exportDossierPdf({
      documentTitle: `OFFICIAL ${rec.type.toUpperCase()} DISPENSATION VOUCHER`,
      subtitle: `Vehicle: ${rec.vehicleNumber}`,
      filename: `Fuel_Voucher_${rec.vehicleNumber}_${rec.date}_${today}.pdf`,
      records: [{
        id: rec.id,
        title: `${rec.type} Refuel: ${rec.vehicleNumber} (${rec.liters} L @ ₹${rec.expense.toLocaleString('en-IN')})`,
        statusBadge: { text: rec.paymentMethod, isSuccess: true },
        sections: [{
          title: 'Refueling Particulars & Odometer Log',
          fields: [
            { label: 'Slip ID', value: rec.id, highlight: true },
            { label: 'Date', value: rec.date },
            { label: 'Vehicle Number', value: rec.vehicleNumber, highlight: true },
            { label: 'Driver Name', value: rec.driverName },
            { label: 'Fuel Type', value: rec.type },
            { label: 'Payment Method', value: rec.paymentMethod },
            { label: 'Previous Odometer', value: `${rec.oldKm.toLocaleString('en-IN')} KM` },
            { label: 'Current Odometer', value: `${rec.newKm.toLocaleString('en-IN')} KM`, highlight: true },
            { label: 'Distance Covered', value: `${rec.totalKm.toLocaleString('en-IN')} KM` },
            { label: 'Quantity Dispensed', value: `${rec.liters} Liters`, highlight: true },
            { label: 'Rate Per Liter', value: `₹${rec.rate.toFixed(2)}` },
            { label: 'Total Billed Expense', value: `₹${rec.expense.toLocaleString('en-IN')}`, highlight: true }
          ]
        }],
        notes: `Authorized commercial ${rec.type} entry logged into S TRANZ LOGISTIC fleet operations system.`
      }],
      officeDetails
    });
    setIsPdfGenerated(true);
    return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Fuel_${rec.vehicleNumber}_${rec.date}</title>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 15px; font-size: 11px; }
    .header { border-bottom: 2.5px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .company-name { font-size: 19px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .title-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #ea580c; color: white; padding: 4px 10px; font-size: 14px; font-weight: 900; border-radius: 4px; font-family: monospace; }
    .section-head { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; margin: 18px 0 10px 0; }
    table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    table.data-table td { padding: 8px 10px; border: 1px solid #cbd5e1; }
    table.data-table td.label { background: #f1f5f9; font-weight: 700; width: 32%; color: #334155; }
    table.data-table td.val { font-weight: 600; color: #0f172a; }
    .expense-highlight { background: #f8fafc; border: 2px solid #ea580c; border-radius: 6px; padding: 14px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 180px; border-top: 1px solid #475569; text-align: center; padding-top: 6px; font-size: 10px; font-weight: bold; }
    .footer { margin-top: 35px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-name">${officeDetails.companyName}</h1>
      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
        ${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber} | GST: ${officeDetails.gstNumber}
      </div>
    </div>
    <div style="text-align: right; font-size: 10px; color: #64748b;">
      ${rec.type} Fuel & DEF Voucher<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div>
      <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Single Transaction Voucher</span>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
        ${rec.type} Filling Record: ${rec.vehicleNumber}
      </div>
    </div>
    <div>
      <span class="badge">${rec.vehicleNumber}</span>
    </div>
  </div>

  <div class="section-head">Vehicle & Transaction Details</div>
  <table class="data-table">
    <tr>
      <td class="label">Transaction Date</td>
      <td class="val font-mono"><strong>${rec.date}</strong></td>
      <td class="label">Vehicle Registration</td>
      <td class="val font-mono"><strong>${rec.vehicleNumber}</strong></td>
    </tr>
    <tr>
      <td class="label">Driver Name</td>
      <td class="val">${rec.driverName}</td>
      <td class="label">Fuel / Fluid Type</td>
      <td class="val" style="color: #ea580c; font-weight: 800;">${rec.type}</td>
    </tr>
    <tr>
      <td class="label">Previous (Old) Odometer</td>
      <td class="val font-mono">${rec.oldKm.toLocaleString('en-IN')} KM</td>
      <td class="label">Current (New) Odometer</td>
      <td class="val font-mono font-bold">${rec.newKm.toLocaleString('en-IN')} KM</td>
    </tr>
    <tr>
      <td class="label">Distance Traveled (Total KM)</td>
      <td class="val font-mono font-bold" style="color: #15803d;">${rec.totalKm.toLocaleString('en-IN')} KM</td>
      <td class="label">Quantity Filled</td>
      <td class="val font-mono"><strong>${rec.liters} Liters</strong></td>
    </tr>
    <tr>
      <td class="label">Unit Price / Rate</td>
      <td class="val font-mono">₹${rec.rate} / Liter</td>
      <td class="label">Payment Method</td>
      <td class="val font-bold" style="color: #0f172a;">${rec.paymentMethod}</td>
    </tr>
  </table>

  <div class="expense-highlight">
    <div>
      <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">
        Fuel & AdBlue/DEF Expense
      </div>
      <div style="font-size: 10px; color: #475569; margin-top: 2px;">
        Method: <strong>${rec.paymentMethod}</strong> • Billed Quantity: ${rec.liters} L @ ₹${rec.rate}
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 900; color: #ea580c; font-family: monospace;">
      ₹${rec.expense.toLocaleString('en-IN')}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">Driver Signature</div>
    <div class="sig-line">Depot Fuel In-Charge</div>
    <div class="sig-line">Accountant / Signatory</div>
  </div>

  <div class="footer">
    ${officeDetails.companyName} • Confidential Single Process Document • Record: ${rec.id}
  </div>
</body>
</html>
    `;
    printHtmlDocument(`Fuel_${rec.vehicleNumber}_${rec.date}`, html);
  };

  const totalExpenseSum = filteredRecords.reduce((sum, r) => sum + r.expense, 0);

  const reportHeaders = [
    'Date',
    'Vehicle No',
    'Driver Name',
    'Type',
    'Old KM',
    'New KM',
    'Total KM',
    'Liters',
    'Rate (₹/L)',
    'Fuel & AdBlue/DEF Expense (₹)',
    'Payment Method'
  ];

  const reportRows = filteredRecords.map(r => [
    r.date,
    r.vehicleNumber,
    r.driverName,
    r.type,
    r.oldKm,
    r.newKm,
    r.totalKm,
    `${r.liters} L`,
    `₹${r.rate}`,
    `₹${r.expense.toLocaleString('en-IN')}`,
    r.paymentMethod
  ]);

  return (
    <div className="space-y-5">
      {/* Header with Vehicle Selector and Combined Module Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Fuel className="w-6 h-6 text-orange-400" />
            <span>Diesel & AdBlue/DEF Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Diesel and AdBlue/DEF entries consolidated under one common <strong>Fuel & AdBlue/DEF Expense</strong> column with Payment Method (Bank Transfer / UPI) and individual process PDF downloads.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fuel / AdBlue Entry</span>
          </button>
        </div>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle={`Fuel & AdBlue/DEF Register Report (${selectedVehicle || 'All Trucks'})`}
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
          { label: 'Total Entries', value: filteredRecords.length },
          { label: 'Total Fuel & AdBlue/DEF Expense', value: `₹${totalExpenseSum.toLocaleString('en-IN')}` }
        ]}
        selectedCount={selectedFuelIds.length}
        onDownloadSelectedPdf={handleDownloadSelectedFuelPdf}
        onDownloadAllPdf={handleDownloadAllFuelPdf}
      />

      {/* Search, Individual Vehicle Selector & Type Filter Bar */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Individual Vehicle Data: Each vehicle maintains its own records without mixing */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Vehicle:</span>
          </div>
          <select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs font-mono font-bold text-orange-400 rounded-lg px-3 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.vehicleNumber}>
                {v.vehicleNumber} ({v.make})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#060a12] border border-[#1d2d4a] rounded-lg ml-2">
            <button
              type="button"
              onClick={() => setFilterType('All')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                filterType === 'All' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setFilterType('Diesel')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'Diesel' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Fuel className="w-3 h-3" />
              <span>Diesel</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('AdBlue/DEF')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'AdBlue/DEF' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Droplet className="w-3 h-3" />
              <span>AdBlue/DEF</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px] max-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by driver or payment..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Fuel & AdBlue/DEF Table with ONE Combined Expense Column */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedFuelIds.length === filteredRecords.length && filteredRecords.length > 0}
                    onChange={toggleSelectAllFuel}
                    className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                    title="Select All Fuel Entries for Combined PDF"
                  />
                </th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vehicle Number</th>
                <th className="py-3 px-3">Driver Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 font-mono">Old KM</th>
                <th className="py-3 px-3 font-mono">New KM</th>
                <th className="py-3 px-3 font-mono">Total KM</th>
                <th className="py-3 px-3">Quantity & Rate</th>
                {/* 1. Combined Diesel & AdBlue/DEF into One Expense Column */}
                <th className="py-3 px-3 font-mono text-orange-400 font-bold">
                  Fuel & AdBlue/DEF Expense
                </th>
                {/* 7. Payment Method */}
                <th className="py-3 px-3">Payment Method</th>
                {/* 3. Individual Process PDF */}
                <th className="py-3 px-3 text-center">PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">
                    No fuel or AdBlue/DEF entries recorded for {selectedVehicle !== 'All' ? selectedVehicle : 'this selection'}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedFuelIds.includes(item.id)}
                        onChange={() => toggleSelectFuel(item.id)}
                        className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                        title={`Select Fuel Entry ${item.vehicleNumber} for combined PDF`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 whitespace-nowrap">
                      {item.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {item.driverName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'Diesel'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {item.oldKm.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200 font-semibold">
                      {item.newKm.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {item.totalKm.toLocaleString('en-IN')} KM
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div>{item.liters} Liters</div>
                      <div className="text-[10px] text-slate-500">@ ₹{item.rate}/L</div>
                    </td>
                    {/* Combined Expense Column */}
                    <td className="py-3 px-3 font-mono font-black text-slate-100 text-sm">
                      ₹{item.expense.toLocaleString('en-IN')}
                    </td>
                    {/* Payment Method (Bank Transfer / UPI) */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-[#142036] px-2 py-0.5 rounded border border-[#203152]">
                        <CreditCard className="w-3 h-3 text-orange-400" />
                        <span>{item.paymentMethod}</span>
                      </span>
                    </td>
                    {/* Individual Process PDF button */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenProcessPdf(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`Generate & Download PDF for ${item.type} record (${item.vehicleNumber})`}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => {
                          if (item.type === 'Diesel') deleteDieselRecord(item.id);
                          else deleteAdBlueRecord(item.id);
                        }}
                        itemName={`${item.type} entry for ${item.vehicleNumber}`}
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

      {/* INDIVIDUAL PROCESS PDF GENERATION MODAL */}
      {pdfRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {pdfRecord.type} Process PDF: {pdfRecord.vehicleNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#16233a] space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-[#142036]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vehicle Registration</span>
                    <h4 className="text-base font-black text-orange-400 font-mono">{pdfRecord.vehicleNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Filling Date</span>
                    <strong className="text-slate-200 font-mono">{pdfRecord.date}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Type:</span>
                    <span className="text-slate-100 font-bold">{pdfRecord.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Driver Name:</span>
                    <span className="text-slate-200 font-semibold">{pdfRecord.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Quantity:</span>
                    <span className="text-slate-200 font-mono font-bold">{pdfRecord.liters} Liters @ ₹{pdfRecord.rate}/L</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Distance Covered:</span>
                    <span className="text-emerald-400 font-mono font-bold">{pdfRecord.totalKm} KM</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Expense:</span>
                    <span className="text-orange-400 font-bold font-mono text-sm">₹{pdfRecord.expense.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Payment Method:</span>
                    <span className="text-slate-100 font-bold">{pdfRecord.paymentMethod}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1324] rounded border border-[#1b2b48] text-[11px] text-slate-400">
                  <p>
                    System will generate a dedicated single-process PDF containing only <strong>{pdfRecord.vehicleNumber}</strong> {pdfRecord.type} transaction data.
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Filename: Fuel_{pdfRecord.vehicleNumber}_{pdfRecord.date}.pdf
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1a2b47] shrink-0">
              <span className="text-xs text-slate-400">
                {isPdfGenerated ? 'PDF ready for download' : 'Click Generate to prepare PDF'}
              </span>
              <div className="flex items-center gap-2">
                {!isPdfGenerated ? (
                  <button
                    type="button"
                    onClick={() => setIsPdfGenerated(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDownloadProcessPdf(pdfRecord)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer animate-in fade-in duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FUEL ENTRY MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                {formType === 'Diesel' ? (
                  <Fuel className="w-5 h-5 text-orange-400" />
                ) : (
                  <Droplet className="w-5 h-5 text-blue-400" />
                )}
                <h3 className="text-base font-bold text-white uppercase">
                  {editingRecord ? `Edit ${formType} Entry` : `Add ${formType} Entry`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16233a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Type Switcher in Form */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#142036]">
                <label className="text-xs font-semibold text-slate-300">Transaction Type:</label>
                <div className="flex items-center gap-1.5 p-1 bg-[#060a12] border border-[#1d2d4a] rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInForm('Diesel')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      formType === 'Diesel' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Diesel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChangeInForm('AdBlue/DEF')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      formType === 'AdBlue/DEF' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AdBlue/DEF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Number *</label>
                  <select
                    value={formData.vehicleNumber}
                    onChange={e => handleVehicleChangeInForm(e.target.value, formType)}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.make})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Name *</label>
                  <select
                    value={formData.driverName}
                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.driverName}>
                        {d.driverName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method - Requirement 7: Bank Transfer | UPI */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as FuelPaymentMethod })}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-semibold text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Old KM *</span>
                    {formData.oldKm !== '' ? (
                      <span className="text-[10px] text-orange-400 font-normal">
                        (Auto-filled from previous saved New KM)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Enter starting KM)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.oldKm}
                    onChange={e => setFormData({ ...formData, oldKm: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Enter starting / previous KM"
                    className="w-full px-2.5 py-1.5 bg-[#080e1b] border border-[#1d2d4a] rounded-lg text-xs font-mono font-bold text-slate-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>New KM *</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Manual entry required)
                    </span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.newKm}
                    onChange={e => setFormData({ ...formData, newKm: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Enter current KM reading"
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono font-bold text-slate-100 focus:border-orange-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-1 text-[11px] font-mono">
                    {formData.newKm === '' ? (
                      <span className="text-slate-500">KM Covered: — (Awaiting New KM entry)</span>
                    ) : Number(formData.newKm) < Number(formData.oldKm) ? (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        ⚠️ New KM cannot be less than Old KM ({Number(formData.newKm) - Number(formData.oldKm)} KM)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        KM Covered: {(Number(formData.newKm) - Number(formData.oldKm)).toLocaleString('en-IN')} KM
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Liters Filled *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.liters}
                    onChange={e => {
                      const l = Number(e.target.value);
                      setFormData({
                        ...formData,
                        liters: l,
                        expense: l * formData.rate
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rate per Liter (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.rate}
                    onChange={e => {
                      const r = Number(e.target.value);
                      setFormData({
                        ...formData,
                        rate: r,
                        expense: formData.liters * r
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Combined Expense Column Display */}
                <div className="sm:col-span-2 p-3 bg-[#070c17] rounded-lg border border-[#16233a] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Fuel & AdBlue/DEF Expense
                    </span>
                    <span className="text-xs text-slate-400">
                      Calculated as {formData.liters} L × ₹{formData.rate}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-black text-orange-400">
                    ₹{(formData.liters * formData.rate).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Bill Receipt Upload */}
                <div className="sm:col-span-2">
                  <DocumentUploader
                    label="Fuel / DEF Bill Receipt"
                    document={formData.billUpload}
                    onUpload={doc => setFormData({ ...formData, billUpload: doc })}
                    onDelete={() => setFormData({ ...formData, billUpload: undefined })}
                    accept="image/*,application/pdf"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a2a46] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-[#142036] hover:bg-[#1a2a46] text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
