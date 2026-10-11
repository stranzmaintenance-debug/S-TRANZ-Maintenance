import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Save,
  FileDown,
  Download,
  FileText,
  QrCode
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Vehicle } from '../../types';
import { ActionButtons } from '../common/ActionButtons';
import { ReportToolbar } from '../common/ReportToolbar';
import { DocumentUploader } from '../common/DocumentUploader';
import { exportVehiclesPdf } from '../../utils/pdfModuleHelpers';
import { VehicleDetailsView } from './VehicleDetailsView';

export const VehicleRegister: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, drivers, officeDetails } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // View Modal State
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [isJustCreated, setIsJustCreated] = useState(false);

  // Individual Vehicle PDF Generation Modal State
  const [pdfVehicle, setPdfVehicle] = useState<Vehicle | null>(null);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);

  // Form fields (1 to 21 exact)
  const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'createdAt'>>({
    vehicleNumber: '',
    engineNumber: '',
    chassisNumber: '',
    registeredAtRto: '',
    model: '',
    unladenWeight: '',
    loadCapacity: '',
    make: '',
    tyre: '',
    vehicleFit: '',
    height: '',
    width: '',
    closedBodyOrOpenBody: 'Closed Body',
    registrationDate: '',
    rcCardDoc: undefined,
    fitnessValidDate: '',
    fitnessDoc: undefined,
    insuranceValidDate: '',
    insuranceDoc: undefined,
    taxValidDate: '',
    taxDoc: undefined,
    puccValidDate: '',
    puccDoc: undefined,
    permitValidDate: '',
    permitDoc: undefined,
    nationalPermitValidDate: '',
    nationalPermitDoc: undefined,
    currentStatus: 'Active',
    assignedDriverId: '',
    assignedDriverName: ''
  });

  const handleOpenAdd = () => {
    setEditingVehicleId(null);
    setFormData({
      vehicleNumber: '',
      engineNumber: '',
      chassisNumber: '',
      registeredAtRto: '',
      model: '',
      unladenWeight: '',
      loadCapacity: '',
      make: '',
      tyre: '',
      vehicleFit: '',
      height: '',
      width: '',
      closedBodyOrOpenBody: 'Closed Body',
      registrationDate: new Date().toISOString().split('T')[0],
      rcCardDoc: undefined,
      fitnessValidDate: '',
      fitnessDoc: undefined,
      insuranceValidDate: '',
      insuranceDoc: undefined,
      taxValidDate: '',
      taxDoc: undefined,
      puccValidDate: '',
      puccDoc: undefined,
      permitValidDate: '',
      permitDoc: undefined,
      nationalPermitValidDate: '',
      nationalPermitDoc: undefined,
      currentStatus: 'Active',
      assignedDriverId: '',
      assignedDriverName: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setFormData({
      vehicleNumber: v.vehicleNumber,
      engineNumber: v.engineNumber,
      chassisNumber: v.chassisNumber,
      registeredAtRto: v.registeredAtRto,
      model: v.model,
      unladenWeight: v.unladenWeight,
      loadCapacity: v.loadCapacity,
      make: v.make,
      tyre: v.tyre,
      vehicleFit: v.vehicleFit,
      height: v.height,
      width: v.width,
      closedBodyOrOpenBody: v.closedBodyOrOpenBody,
      registrationDate: v.registrationDate,
      rcCardDoc: v.rcCardDoc,
      fitnessValidDate: v.fitnessValidDate,
      fitnessDoc: v.fitnessDoc,
      insuranceValidDate: v.insuranceValidDate,
      insuranceDoc: v.insuranceDoc,
      taxValidDate: v.taxValidDate,
      taxDoc: v.taxDoc,
      puccValidDate: v.puccValidDate,
      puccDoc: v.puccDoc,
      permitValidDate: v.permitValidDate,
      permitDoc: v.permitDoc,
      nationalPermitValidDate: v.nationalPermitValidDate,
      nationalPermitDoc: v.nationalPermitDoc,
      currentStatus: v.currentStatus,
      assignedDriverId: v.assignedDriverId || '',
      assignedDriverName: v.assignedDriverName || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber) {
      alert('Vehicle Number is required');
      return;
    }
    const assignedDriver = drivers.find(d => d.id === formData.assignedDriverId);
    const payload = {
      ...formData,
      assignedDriverName: assignedDriver ? assignedDriver.driverName : ''
    };

    if (editingVehicleId) {
      updateVehicle(editingVehicleId, payload);
      const existing = vehicles.find(v => v.id === editingVehicleId);
      if (existing) {
        setViewingVehicle({ ...existing, ...payload });
      }
      setIsJustCreated(false);
    } else {
      // Automatically save and generate unique QR code
      const newVehicle = addVehicle(payload);
      // Immediately display that vehicle's Vehicle Details page with QR code preview, download & print
      setViewingVehicle(newVehicle);
      setIsJustCreated(true);
    }
    setIsFormOpen(false);
  };

  // Open Individual Vehicle PDF Modal
  const handleOpenVehiclePdf = (v: Vehicle) => {
    setPdfVehicle(v);
    setIsPdfGenerated(false);
  };

  // Multi-record selection state for PDF download
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  const toggleSelectVehicle = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVehicles = () => {
    if (selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(filteredVehicles.map(v => v.id));
    }
  };

  // Download selected vehicles as one combined PDF
  const handleDownloadSelectedPdf = async () => {
    const selectedVehicles = filteredVehicles.filter(v => selectedVehicleIds.includes(v.id));
    if (selectedVehicles.length === 0) return;
    await exportVehiclesPdf(selectedVehicles, officeDetails);
  };

  // Download all filtered vehicles as one complete combined PDF
  const handleDownloadAllVehiclesPdf = async () => {
    if (filteredVehicles.length === 0) return;
    await exportVehiclesPdf(filteredVehicles, officeDetails);
  };

  // Generate & Download PDF for selected vehicle only
  const handleDownloadVehiclePdf = async (v: Vehicle) => {
    await exportVehiclesPdf(v, officeDetails);
    setIsPdfGenerated(true);
  };

  /*
  <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase;">${officeDetails.companyName}</h1>
      <div style="font-size: 10px; color: #475569; margin-top: 3px;">
        ${officeDetails.officeAddress} | Phone: ${officeDetails.officeContactNumber} | GST: ${officeDetails.gstNumber}
      </div>
    </div>
    <div style="text-align: right; font-size: 10px; color: #64748b;">
      Official Vehicle Register<br/>
      Generated: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="title-box">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Individual Vehicle Record</span>
        <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">
          ${v.make} ${v.model}
        </div>
      </div>
      <div>
        <span class="veh-badge">${v.vehicleNumber}</span>
      </div>
    </div>
  </div>

  <div class="section-title">Part 1: Vehicle Specifications (Fields 1 to 14)</div>
  <table class="spec-table">
    <tr>
      <td class="label">1. Vehicle Registration No</td>
      <td class="value"><strong>${v.vehicleNumber}</strong></td>
      <td class="label">2. Engine Number</td>
      <td class="value">${v.engineNumber || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">3. Chassis Number</td>
      <td class="value">${v.chassisNumber || 'N/A'}</td>
      <td class="label">4. Registered at RTO</td>
      <td class="value">${v.registeredAtRto || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">5. Model</td>
      <td class="value">${v.model || 'N/A'}</td>
      <td class="label">6. Unladen Weight</td>
      <td class="value">${v.unladenWeight || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">7. Load Capacity</td>
      <td class="value">${v.loadCapacity || 'N/A'}</td>
      <td class="label">8. Make / Manufacturer</td>
      <td class="value">${v.make || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">9. Tyre Specification</td>
      <td class="value">${v.tyre || 'N/A'}</td>
      <td class="label">10. Vehicle Fit / Body Style</td>
      <td class="value">${v.vehicleFit || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">11. Vehicle Height</td>
      <td class="value">${v.height || 'N/A'}</td>
      <td class="label">12. Vehicle Width</td>
      <td class="value">${v.width || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">13. Body Classification</td>
      <td class="value">${v.closedBodyOrOpenBody}</td>
      <td class="label">14. Registration Date</td>
      <td class="value">${v.registrationDate}</td>
    </tr>
    <tr>
      <td class="label">Operational Fleet Status</td>
      <td class="value">${v.currentStatus}</td>
      <td class="label">Assigned Driver</td>
      <td class="value">${v.assignedDriverName || 'Unassigned'}</td>
    </tr>
  </table>

  <div class="section-title">Part 2: Validity Certificates & Compliance (Fields 15 to 21)</div>
  <table class="spec-table">
    <tr>
      <td class="label">15. RC Card Status</td>
      <td class="value">${v.rcCardDoc?.fileName || 'Attached in system'}</td>
      <td class="label">16. Fitness Valid Date</td>
      <td class="value"><strong>${v.fitnessValidDate || 'N/A'}</strong> ${v.fitnessDoc ? '(Certificate on file)' : ''}</td>
    </tr>
    <tr>
      <td class="label">17. Insurance Valid Date</td>
      <td class="value"><strong>${v.insuranceValidDate || 'N/A'}</strong> ${v.insuranceDoc ? '(Policy on file)' : ''}</td>
      <td class="label">18. Road Tax Valid Date</td>
      <td class="value"><strong>${v.taxValidDate || 'N/A'}</strong> ${v.taxDoc ? '(Receipt on file)' : ''}</td>
    </tr>
    <tr>
      <td class="label">19. PUCC (Pollution) Valid Date</td>
      <td class="value"><strong>${v.puccValidDate || 'N/A'}</strong> ${v.puccDoc ? '(Valid)' : ''}</td>
      <td class="label">20. State Permit Valid Date</td>
      <td class="value"><strong>${v.permitValidDate || 'N/A'}</strong> ${v.permitDoc ? '(Permit on file)' : ''}</td>
    </tr>
    <tr>
      <td class="label">21. National Permit Valid Date</td>
      <td class="value" colspan="3"><strong>${v.nationalPermitValidDate || 'N/A'}</strong> ${v.nationalPermitDoc ? '(All-India Permit on file)' : ''}</td>
    </tr>
  </table>

  <div class="sign-box">
    <div class="sig-line">Fleet Inspector</div>
    <div class="sig-line">Maintenance Supervisor</div>
    <div class="sig-line">Authorized Signatory</div>
  </div>
</body>
</html>
*/

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q));

    const matchesBody = filterBodyType === 'All' || v.closedBodyOrOpenBody === filterBodyType;
    const matchesStatus = filterStatus === 'All' || v.currentStatus === filterStatus;

    let matchesDate = true;
    if (dateFrom && v.registrationDate < dateFrom) matchesDate = false;
    if (dateTo && v.registrationDate > dateTo) matchesDate = false;

    return matchesSearch && matchesBody && matchesStatus && matchesDate;
  });

  const reportHeaders = [
    'Vehicle No',
    'Make & Model',
    'Body Type',
    'RTO Registered',
    'Registration Date',
    'Fitness Expiry',
    'Insurance Expiry',
    'Tax Expiry',
    'Driver Assigned',
    'Status'
  ];

  const reportRows = filteredVehicles.map(v => [
    v.vehicleNumber,
    `${v.make} (${v.model})`,
    v.closedBodyOrOpenBody,
    v.registeredAtRto,
    v.registrationDate,
    v.fitnessValidDate || 'N/A',
    v.insuranceValidDate || 'N/A',
    v.taxValidDate || 'N/A',
    v.assignedDriverName || 'Unassigned',
    v.currentStatus
  ]);

  return (
    <div className="space-y-5">
      {/* Title & Add Vehicle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-orange-400" />
            <span>Vehicle Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle specifications, RTO documentation, and validity certificates (Fields 1 to 21).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Vehicle Register & Document Validity Report"
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
        selectedCount={selectedVehicleIds.length}
        onDownloadSelectedPdf={handleDownloadSelectedPdf}
        onDownloadAllPdf={handleDownloadAllVehiclesPdf}
      />

      {/* Search and Filters Bar */}
      <div className="bg-[#0b1324] border border-[#1b2b48] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Vehicle No, Make, Model, or Driver..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Body:</span>
          </div>
          <select
            value={filterBodyType}
            onChange={e => setFilterBodyType(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Body Types</option>
            <option value="Closed Body">Closed Body</option>
            <option value="Open Body">Open Body</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#060a12] border border-[#1d2d4a] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-orange-500 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Idle">Idle</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table with dedicated PDF action button per row */}
      <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070c17] text-slate-400 border-b border-[#1b2b48] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0}
                    onChange={toggleSelectAllVehicles}
                    className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                    title="Select All for PDF Download"
                  />
                </th>
                <th className="py-3 px-3">Vehicle Number</th>
                <th className="py-3 px-3">Make & Model</th>
                <th className="py-3 px-3">Details / Specs</th>
                <th className="py-3 px-3">Key Expiries</th>
                <th className="py-3 px-3">Assigned Driver</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Details</th>
                <th className="py-3 px-3 text-center">QR Code</th>
                <th className="py-3 px-3 text-center">PDF</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233a] text-slate-300">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No vehicles found matching search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-[#0f192e] transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(vehicle.id)}
                        onChange={() => toggleSelectVehicle(vehicle.id)}
                        className="rounded border-[#263756] bg-[#070c17] text-orange-600 focus:ring-0 cursor-pointer"
                        title={`Select ${vehicle.vehicleNumber} for combined PDF`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400 whitespace-nowrap">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{vehicle.make}</div>
                      <div className="text-[11px] text-slate-400">{vehicle.model}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{vehicle.closedBodyOrOpenBody}</div>
                      <div className="text-[10px] text-slate-500">Cap: {vehicle.loadCapacity}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>Fit: {vehicle.fitnessValidDate || 'N/A'}</div>
                      <div className="text-slate-400">Ins: {vehicle.insuranceValidDate || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3">
                      {vehicle.assignedDriverName ? (
                        <span className="font-medium text-slate-200">{vehicle.assignedDriverName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          vehicle.currentStatus === 'Active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : vehicle.currentStatus === 'Under Maintenance'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {vehicle.currentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setViewingVehicle(vehicle);
                          setIsJustCreated(false);
                        }}
                        className="p-1.5 rounded-md text-slate-300 hover:text-white bg-[#142036] hover:bg-[#1b2b48] border border-[#203152] transition-colors cursor-pointer"
                        title="View Full Vehicle Details & Documents"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    {/* Dedicated QR Code Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingVehicle(vehicle);
                          setIsJustCreated(false);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white bg-[#142036] hover:bg-[#1f3152] border border-[#273d62] rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`View, Download & Print QR Code for ${vehicle.vehicleNumber}`}
                      >
                        <QrCode className="w-3.5 h-3.5 text-orange-400" />
                        <span>QR</span>
                      </button>
                    </td>
                    {/* Individual Vehicle PDF Button as requested */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenVehiclePdf(vehicle)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md transition-colors shadow-sm cursor-pointer"
                        title={`Generate & Download PDF for ${vehicle.vehicleNumber}`}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <ActionButtons
                        onEdit={() => handleOpenEdit(vehicle)}
                        onDelete={() => deleteVehicle(vehicle.id)}
                        itemName={`Vehicle ${vehicle.vehicleNumber}`}
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

      {/* INDIVIDUAL VEHICLE PDF GENERATION MODAL */}
      {pdfVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  Vehicle PDF Report: {pdfVehicle.vehicleNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfVehicle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="bg-[#070c17] p-4 rounded-lg border border-[#16233a] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#142036]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Vehicle</span>
                    <h4 className="text-base font-black text-orange-400 font-mono">{pdfVehicle.vehicleNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Make & Model</span>
                    <strong className="text-slate-200">{pdfVehicle.make} ({pdfVehicle.model})</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">RTO Registration:</span>
                    <span className="text-slate-200">{pdfVehicle.registeredAtRto}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Chassis No:</span>
                    <span className="text-slate-200 font-mono">{pdfVehicle.chassisNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Engine No:</span>
                    <span className="text-slate-200 font-mono">{pdfVehicle.engineNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fitness Expiry:</span>
                    <span className="text-orange-400 font-mono font-bold">{pdfVehicle.fitnessValidDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Insurance Expiry:</span>
                    <span className="text-orange-400 font-mono font-bold">{pdfVehicle.insuranceValidDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Assigned Driver:</span>
                    <span className="text-slate-200">{pdfVehicle.assignedDriverName || 'None'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1324] rounded border border-[#1b2b48] text-[11px] text-slate-400">
                  <p>
                    System will generate a dedicated single-vehicle PDF containing only <strong>{pdfVehicle.vehicleNumber}</strong> specifications and compliance history.
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    Auto Filename: Vehicle_{pdfVehicle.vehicleNumber}_Record.pdf
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1a2b47] shrink-0">
              <span className="text-xs text-slate-400">
                {isPdfGenerated ? 'PDF generated and ready for download' : 'Click Generate to prepare PDF'}
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
                    onClick={() => handleDownloadVehiclePdf(pdfVehicle)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer animate-in fade-in duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF (Vehicle_{pdfVehicle.vehicleNumber})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPdfVehicle(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 bg-[#142036] hover:bg-[#1b2b48] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT COMPLETE VEHICLE FORM MODAL (Fields 1 to 21) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0b1324] border border-[#1e2f50] rounded-xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2a46] shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white uppercase">
                  {editingVehicleId ? 'Edit Vehicle Record' : 'Vehicle Register Form (Fields 1 to 21)'}
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

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              <div>
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider pb-2 border-b border-[#1b2c49] mb-3 flex items-center gap-1.5">
                  <span>Part 1: Vehicle Specifications (Fields 1 - 14)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      1. Vehicle Number <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleNumber}
                      onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. TN-38-BZ-4521"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">2. Engine Number</label>
                    <input
                      type="text"
                      value={formData.engineNumber}
                      onChange={e => setFormData({ ...formData, engineNumber: e.target.value })}
                      placeholder="e.g. ENG-OM906-88321"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">3. Chassis Number</label>
                    <input
                      type="text"
                      value={formData.chassisNumber}
                      onChange={e => setFormData({ ...formData, chassisNumber: e.target.value })}
                      placeholder="e.g. MBZ98765432104521"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs font-mono text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">4. Registered At RTO</label>
                    <input
                      type="text"
                      value={formData.registeredAtRto}
                      onChange={e => setFormData({ ...formData, registeredAtRto: e.target.value })}
                      placeholder="e.g. Coimbatore North (TN-38)"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">5. Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. 2023 Heavy Duty Multi-Axle"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">6. Unladen Weight</label>
                    <input
                      type="text"
                      value={formData.unladenWeight}
                      onChange={e => setFormData({ ...formData, unladenWeight: e.target.value })}
                      placeholder="e.g. 8,800 KG"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">7. Load Capacity</label>
                    <input
                      type="text"
                      value={formData.loadCapacity}
                      onChange={e => setFormData({ ...formData, loadCapacity: e.target.value })}
                      placeholder="e.g. 28,000 KG"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">8. Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={e => setFormData({ ...formData, make: e.target.value })}
                      placeholder="e.g. BharatBenz 2823R"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">9. Tyre</label>
                    <input
                      type="text"
                      value={formData.tyre}
                      onChange={e => setFormData({ ...formData, tyre: e.target.value })}
                      placeholder="e.g. 10 Wheeler Radial Tubeless"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">10. Vehicle Fit</label>
                    <input
                      type="text"
                      value={formData.vehicleFit}
                      onChange={e => setFormData({ ...formData, vehicleFit: e.target.value })}
                      placeholder="e.g. Container Carrier"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">11. Height</label>
                    <input
                      type="text"
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g. 12.8 FT"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">12. Width</label>
                    <input
                      type="text"
                      value={formData.width}
                      onChange={e => setFormData({ ...formData, width: e.target.value })}
                      placeholder="e.g. 8.4 FT"
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">13. Closed Body / Open Body</label>
                    <select
                      value={formData.closedBodyOrOpenBody}
                      onChange={e => setFormData({ ...formData, closedBodyOrOpenBody: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Closed Body">Closed Body</option>
                      <option value="Open Body">Open Body</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      14. Registration Date <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.registrationDate}
                      onChange={e => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fleet Operational Status</label>
                    <select
                      value={formData.currentStatus}
                      onChange={e => setFormData({ ...formData, currentStatus: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Idle">Idle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Assigned</label>
                    <select
                      value={formData.assignedDriverId}
                      onChange={e => {
                        const drv = drivers.find(d => d.id === e.target.value);
                        setFormData({
                          ...formData,
                          assignedDriverId: e.target.value,
                          assignedDriverName: drv ? drv.driverName : ''
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">-- No Driver Assigned --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.driverName} ({d.mobileNo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider pb-2 border-b border-[#1b2c49] mb-3 flex items-center gap-1.5">
                  <span>Part 2: Document / Validity Details & Certificate Uploads (Fields 15 - 21)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg">
                    <DocumentUploader
                      label="15. RC Card (PDF / Photo)"
                      document={formData.rcCardDoc}
                      onUpload={doc => setFormData({ ...formData, rcCardDoc: doc })}
                      helpText="Registration Certificate of vehicle"
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">16. Fitness Valid Date</label>
                      <input
                        type="date"
                        value={formData.fitnessValidDate}
                        onChange={e => setFormData({ ...formData, fitnessValidDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="Fitness Certificate Upload"
                      document={formData.fitnessDoc}
                      onUpload={doc => setFormData({ ...formData, fitnessDoc: doc })}
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">17. Insurance Valid Date</label>
                      <input
                        type="date"
                        value={formData.insuranceValidDate}
                        onChange={e => setFormData({ ...formData, insuranceValidDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="Insurance Policy Upload"
                      document={formData.insuranceDoc}
                      onUpload={doc => setFormData({ ...formData, insuranceDoc: doc })}
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">18. Tax Valid Date</label>
                      <input
                        type="date"
                        value={formData.taxValidDate}
                        onChange={e => setFormData({ ...formData, taxValidDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="Road Tax Receipt Upload"
                      document={formData.taxDoc}
                      onUpload={doc => setFormData({ ...formData, taxDoc: doc })}
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">19. PUCC Valid Date</label>
                      <input
                        type="date"
                        value={formData.puccValidDate}
                        onChange={e => setFormData({ ...formData, puccValidDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="Pollution Certificate (PUCC) Upload"
                      document={formData.puccDoc}
                      onUpload={doc => setFormData({ ...formData, puccDoc: doc })}
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">20. Permit Valid Date</label>
                      <input
                        type="date"
                        value={formData.permitValidDate}
                        onChange={e => setFormData({ ...formData, permitValidDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="State Goods Permit Upload"
                      document={formData.permitDoc}
                      onUpload={doc => setFormData({ ...formData, permitDoc: doc })}
                    />
                  </div>

                  <div className="p-3 bg-[#070c18] border border-[#18263e] rounded-lg space-y-2 md:col-span-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">21. National Permit Valid Date</label>
                      <input
                        type="date"
                        value={formData.nationalPermitValidDate}
                        onChange={e => setFormData({ ...formData, nationalPermitValidDate: e.target.value })}
                        className="w-full max-w-sm px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <DocumentUploader
                      label="National Permit (All India Permit) Upload"
                      document={formData.nationalPermitDoc}
                      onUpload={doc => setFormData({ ...formData, nationalPermitDoc: doc })}
                    />
                  </div>
                </div>
              </div>

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
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingVehicleId ? 'Update Vehicle' : 'Save Vehicle Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW VEHICLE DETAILS & AUTOMATIC QR CODE MODAL */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-5xl bg-[#070b12] border border-[#1e2f50] rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 max-h-[95vh] overflow-y-auto my-auto">
            <VehicleDetailsView
              vehicle={viewingVehicle}
              officeDetails={officeDetails}
              onClose={() => {
                setViewingVehicle(null);
                setIsJustCreated(false);
              }}
              isJustCreated={isJustCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};
