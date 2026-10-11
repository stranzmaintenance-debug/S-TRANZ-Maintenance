import React from 'react';
import { Truck, ShieldAlert, ArrowLeft, Building2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VehicleDetailsView } from './VehicleDetailsView';

interface PublicVehicleDetailsPageProps {
  vehicleId: string;
  onGoToPortal?: () => void;
}

export const PublicVehicleDetailsPage: React.FC<PublicVehicleDetailsPageProps> = ({
  vehicleId,
  onGoToPortal
}) => {
  const { vehicles, officeDetails, currentUser } = useData();

  // Security & Data Lookup: Connected to unique database record ID
  const matchedVehicle = vehicles.find(v => v.id === vehicleId);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Banner with Company Identity & Access Option */}
      <header className="bg-[#0b1324] border-b border-[#1b2b48] px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {officeDetails.companyLogo ? (
            <img
              src={officeDetails.companyLogo}
              alt={officeDetails.companyName}
              className="h-9 w-auto max-w-[120px] object-contain rounded bg-white/5 p-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-base">
              S
            </div>
          )}
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tight">
              {officeDetails.companyName || 'S TRANZ LOGISTIC'}
            </h1>
            <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
              Fleet Operations & Live Vehicle Verification
            </p>
          </div>
        </div>

        {onGoToPortal && (
          <button
            type="button"
            onClick={onGoToPortal}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#142036] hover:bg-[#1b2b48] border border-[#203152] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Back to Portal' : 'Fleet Staff Login'}</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {matchedVehicle ? (
          <VehicleDetailsView
            vehicle={matchedVehicle}
            officeDetails={officeDetails}
            isStandalone={true}
          />
        ) : (
          /* Exact requirement: If the vehicle record is deleted or the QR link is invalid, display: "Vehicle record not found." */
          <div className="my-16 max-w-lg mx-auto bg-[#0b1324] border border-red-900/60 rounded-2xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950/70 border border-red-800 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Vehicle record not found.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The requested vehicle record with ID <code className="font-mono text-orange-400">{vehicleId}</code> could not be found. It may have been deleted, archived, or the scanned QR link is no longer valid.
              </p>
            </div>

            <div className="pt-4 border-t border-[#182844] flex flex-col sm:flex-row items-center justify-center gap-3">
              {onGoToPortal && (
                <button
                  type="button"
                  onClick={onGoToPortal}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Return to Fleet Portal
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#152238] bg-[#070c17] py-4 text-center text-xs text-slate-500">
        <p>
          {officeDetails.companyName} • Official Transport Management & Compliance System
        </p>
      </footer>
    </div>
  );
};
