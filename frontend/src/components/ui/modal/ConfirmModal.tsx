import React from "react";

const ConfirmModal: React.FC<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count: number;
}> = ({ open, onConfirm, onCancel, count }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="mb-6">
          Are you sure you want to delete <b>{count}</b> selected URL
          {count > 1 ? "s" : ""}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
