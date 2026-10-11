import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { PdfNotificationEvent } from '../../services/pdfService';

export const PdfDownloadToast: React.FC = () => {
  const [notification, setNotification] = useState<PdfNotificationEvent | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<PdfNotificationEvent>;
      if (customEvent.detail) {
        setNotification(customEvent.detail);

        if (customEvent.detail.status === 'success' || customEvent.detail.status === 'error') {
          clearTimeout(timer);
          timer = setTimeout(() => {
            setNotification(null);
          }, 4500);
        }
      }
    };

    window.addEventListener('pdf-status-change', handleStatusChange);
    return () => {
      window.removeEventListener('pdf-status-change', handleStatusChange);
      clearTimeout(timer);
    };
  }, []);

  if (!notification) return null;

  const isGenerating = notification.status === 'generating';
  const isSuccess = notification.status === 'success';
  const isError = notification.status === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-3.5 sm:p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 text-white backdrop-blur-md ${
          isGenerating
            ? 'bg-[#0b132b]/95 border-orange-500/80 shadow-orange-950/40'
            : isSuccess
            ? 'bg-[#091b15]/95 border-emerald-500/80 shadow-emerald-950/40'
            : 'bg-[#2b0d0d]/95 border-red-500/80 shadow-red-950/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isGenerating
                ? 'bg-orange-500/20 text-orange-400'
                : isSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSuccess && <CheckCircle2 className="w-5 h-5" />}
            {isError && <AlertCircle className="w-5 h-5" />}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>{isGenerating ? 'Exporting PDF Document' : isSuccess ? 'Download Complete' : 'Export Failed'}</span>
              {notification.filename && (
                <span className="text-[10px] text-slate-300 font-mono font-normal">
                  ({notification.filename})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug">{notification.message}</p>
          </div>
        </div>

        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
