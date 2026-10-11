import React, { useRef, useState } from 'react';
import { Upload, Eye, Download, RefreshCw, FileText, CheckCircle2, X } from 'lucide-react';
import { DocumentAttachment } from '../../types';

interface DocumentUploaderProps {
  label: string;
  document?: DocumentAttachment;
  onUpload: (doc: DocumentAttachment) => void;
  onDelete?: () => void;
  required?: boolean;
  helpText?: string;
  accept?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  document,
  onUpload,
  onDelete,
  required = false,
  helpText,
  accept = 'image/*,.pdf'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload({
          fileName: file.name,
          fileUrl: reader.result as string,
          fileType: file.type,
          uploadDate: new Date().toISOString().split('T')[0]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const link = window.document.createElement('a');
    link.href = document.fileUrl || '#';
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0b1322] border border-[#1c2c47] rounded-lg p-3 text-slate-200">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-orange-400" />
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
        {document ? (
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Uploaded</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">Not Uploaded</span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {document ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-[#060a12] border border-[#172338] rounded-md mt-1">
          <div className="flex items-center gap-2 truncate pr-2">
            <div className="p-1 rounded bg-orange-950/40 text-orange-400 border border-orange-800/40 shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-slate-300 font-mono truncate" title={document.fileName}>
              {document.fileName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-2 py-1 text-[11px] font-medium text-slate-200 bg-[#142033] hover:bg-[#1a2b45] border border-[#223554] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="View Document"
            >
              <Eye className="w-3 h-3 text-slate-300" />
              <span>View</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-2 py-1 text-[11px] font-medium text-orange-300 bg-orange-950/40 hover:bg-orange-900/50 border border-orange-800/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Download Document"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-[11px] font-medium text-slate-300 bg-[#162238] hover:bg-[#1c2d4a] border border-[#223554] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Replace / Edit Document"
            >
              <RefreshCw className="w-3 h-3 text-orange-400" />
              <span>Replace</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-[#263a5e] hover:border-orange-500/70 bg-[#060a12]/60 hover:bg-[#0c1424] rounded-md text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-orange-400" />
          <span>Upload PDF / Photo</span>
        </button>
      )}

      {helpText && <p className="text-[10px] text-slate-500 mt-1">{helpText}</p>}

      {/* Preview Modal */}
      {isPreviewOpen && document && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#0d1527] border border-[#1e2d4d] rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b48]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-bold truncate max-w-md">{document.fileName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-md hover:bg-[#18263e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 flex-1 overflow-auto flex items-center justify-center bg-[#060a12] rounded-lg my-3 border border-[#17233a] p-4">
              {document.fileUrl && document.fileUrl.startsWith('data:image') ? (
                <img
                  src={document.fileUrl}
                  alt={document.fileName}
                  className="max-h-[60vh] max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-orange-950/40 border border-orange-800/40 text-orange-400 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-200">{document.fileName}</h5>
                  <p className="text-xs text-slate-400 mt-1">Official Document File</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Uploaded: {document.uploadDate || 'Active Record'}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Target: {label}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#162238] hover:bg-[#1c2d4a] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
