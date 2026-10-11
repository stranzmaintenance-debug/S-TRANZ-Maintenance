import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle?: string;
  deleteMessage?: string;
  itemName?: string;
  compact?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  deleteTitle = 'Confirm Delete',
  deleteMessage,
  itemName = 'this record',
  compact = false
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onDelete();
  };

  return (
    <>
      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onEdit}
          className={`flex items-center gap-1 font-semibold rounded-md transition-colors cursor-pointer ${
            compact
              ? 'p-1.5 text-xs text-orange-400 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/50'
              : 'px-2.5 py-1 text-xs text-orange-300 bg-orange-950/50 hover:bg-orange-900/70 border border-orange-800/60'
          }`}
          title="Edit Record"
        >
          <Pencil className="w-3.5 h-3.5" />
          {!compact && <span>Edit</span>}
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className={`flex items-center gap-1 font-semibold rounded-md transition-colors cursor-pointer ${
            compact
              ? 'p-1.5 text-xs text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50'
              : 'px-2.5 py-1 text-xs text-red-300 bg-red-950/50 hover:bg-red-900/70 border border-red-800/60'
          }`}
          title="Delete Record"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {!compact && <span>Delete</span>}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title={deleteTitle}
        message={deleteMessage || `Are you sure you want to delete ${itemName}? This operational action will permanently remove the record from the database.`}
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isDestructive={true}
      />
    </>
  );
};
