import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  Edit2,
  Save,
  X,
  Phone,
  Mail,
  Globe,
  Shield,
  Upload
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ReportToolbar } from '../common/ReportToolbar';

export const OfficeDetailsModule: React.FC = () => {
  const { officeDetails, updateOfficeDetails, currentUser } = useData();
  const isAdmin = currentUser?.role === 'Admin';
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(officeDetails);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only authorized Admin users can edit Office Details.');
      return;
    }
    updateOfficeDetails(formData);
    setIsEditing(false);
  };

  const reportHeaders = ['Parameter / Field Name', 'Corporate Detail / Value'];
  const reportRows = [
    ['Company Name', officeDetails.companyName],
    ['Company Owner Name', officeDetails.companyOwnerName],
    ['Owner Contact Number', officeDetails.ownerContactNumber],
    ['Office Contact Number', officeDetails.officeContactNumber],
    ['Office Registered Address', officeDetails.officeAddress],
    ['Corporate Email ID', officeDetails.companyEmail],
    ['Official Website URL', officeDetails.companyWebsiteUrl],
    ['External Freight Booking URL', officeDetails.bookingWebsiteUrl],
    ['GST Registration Number', officeDetails.gstNumber]
  ];

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1629] border border-[#1b2b48] rounded-xl p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-400" />
            <span>Corporate Office Details</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centrally propagated company credentials, registered RTO transport address, and external booking portal link.
          </p>
        </div>

        {/* Edit Button: ONLY visible and accessible to authorized Admin accounts */}
        {isAdmin && !isEditing && (
          <button
            onClick={() => {
              setFormData(officeDetails);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Office Details</span>
          </button>
        )}
      </div>

      {/* Global Report Toolbar */}
      <ReportToolbar
        moduleTitle="Corporate Office Details & Entity Information"
        dateFrom=""
        dateTo=""
        onDateFromChange={() => {}}
        onDateToChange={() => {}}
        onResetDates={() => {}}
        headers={reportHeaders}
        rows={reportRows}
      />

      {/* Main Content: View mode or Admin Edit mode */}
      {!isEditing ? (
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-5 sm:p-6 shadow-lg space-y-6">
          {/* Logo & Corporate Identity Lockup */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[#1b2b48]">
            {officeDetails.companyLogo && (
              <div className="p-3 bg-[#070c17] rounded-xl border border-[#1d2f50] shadow-md shrink-0">
                <img
                  src={officeDetails.companyLogo}
                  alt={officeDetails.companyName}
                  className="h-20 w-auto object-contain max-w-[200px]"
                />
              </div>
            )}
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {officeDetails.companyName}
              </h3>
              <p className="text-xs text-orange-400 font-semibold mt-1">
                GSTIN: <span className="font-mono text-slate-200">{officeDetails.gstNumber}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                {officeDetails.officeAddress}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 bg-[#070c17] rounded-lg border border-[#16233a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Company Owner</span>
              <strong className="text-sm text-slate-100 mt-1 block">{officeDetails.companyOwnerName}</strong>
            </div>

            <div className="p-3.5 bg-[#070c17] rounded-lg border border-[#16233a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                <Phone className="w-3 h-3 text-orange-400" />
                <span>Owner Contact Number</span>
              </span>
              <strong className="text-sm font-mono text-slate-100 mt-1 block">{officeDetails.ownerContactNumber}</strong>
            </div>

            <div className="p-3.5 bg-[#070c17] rounded-lg border border-[#16233a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                <Phone className="w-3 h-3 text-orange-400" />
                <span>Office Landline / Helpdesk</span>
              </span>
              <strong className="text-sm font-mono text-slate-100 mt-1 block">{officeDetails.officeContactNumber}</strong>
            </div>

            <div className="p-3.5 bg-[#070c17] rounded-lg border border-[#16233a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                <Mail className="w-3 h-3 text-orange-400" />
                <span>Official Email ID</span>
              </span>
              <strong className="text-sm text-slate-100 mt-1 block truncate">{officeDetails.companyEmail}</strong>
            </div>

            <div className="p-3.5 bg-[#070c17] rounded-lg border border-[#16233a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                <Globe className="w-3 h-3 text-orange-400" />
                <span>Official Website</span>
              </span>
              <a
                href={officeDetails.companyWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 hover:underline flex items-center gap-1 mt-1 font-semibold truncate"
              >
                <span>{officeDetails.companyWebsiteUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            {/* EXTERNAL BOOKING WEBSITE URL (Strict Rule: No booking system inside app, external link only!) */}
            <div className="p-3.5 bg-gradient-to-br from-[#121c33] to-[#1a1208] rounded-lg border border-orange-500/40">
              <span className="text-[10px] text-orange-400 uppercase font-bold block flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>External Booking Website URL</span>
              </span>
              <a
                href={officeDetails.bookingWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>Open External Booking Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[10px] text-slate-400 block mt-1">
                (External link • Freight booking handled on external platform)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN EDIT FORM */
        <div className="bg-[#0b1324] border border-[#1c2c47] rounded-xl p-5 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48] mb-4">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Admin Office Details Management</span>
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Logo upload */}
              <div className="sm:col-span-3 p-3 bg-[#070c17] rounded-lg border border-[#18263e] flex items-center gap-4">
                {formData.companyLogo && (
                  <img
                    src={formData.companyLogo}
                    alt="Logo"
                    className="h-12 w-auto object-contain bg-black p-1 rounded"
                  />
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Company Logo</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#142036] hover:bg-[#1b2b48] border border-[#203152] text-slate-300 rounded text-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
                    <span>Upload New Logo File</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Owner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyOwnerName}
                  onChange={e => setFormData({ ...formData, companyOwnerName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">GST Registration Number</label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Owner Contact Number</label>
                <input
                  type="text"
                  value={formData.ownerContactNumber}
                  onChange={e => setFormData({ ...formData, ownerContactNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Office Contact Number</label>
                <input
                  type="text"
                  value={formData.officeContactNumber}
                  onChange={e => setFormData({ ...formData, officeContactNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Email ID</label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={e => setFormData({ ...formData, companyEmail: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Website URL</label>
                <input
                  type="url"
                  value={formData.companyWebsiteUrl}
                  onChange={e => setFormData({ ...formData, companyWebsiteUrl: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>

              {/* Booking Website URL (External URL only!) */}
              <div className="sm:col-span-2">
                <label className="block text-orange-400 font-semibold mb-1">
                  External Booking Website URL (Link only, no internal booking workflow)
                </label>
                <input
                  type="url"
                  value={formData.bookingWebsiteUrl}
                  onChange={e => setFormData({ ...formData, bookingWebsiteUrl: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-orange-500/60 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">Office Address</label>
                <textarea
                  rows={2}
                  value={formData.officeAddress}
                  onChange={e => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#060a12] border border-[#1d2d4a] rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1a2b47]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142036] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Office Details</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
