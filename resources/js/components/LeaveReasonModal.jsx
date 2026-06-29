import React, { useState } from "react";

const LeaveReasonModal = ({ isOpen, onClose, onConfirm, title = "Leave Group", description = "Please provide a reason for leaving this group." }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError(true);
            return;
        }
        onConfirm(reason.trim());
        setReason("");
        setError(false);
    };

    const handleClose = () => {
        setReason("");
        setError(false);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
            <div className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-sm text-gray-600">{description}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter your reason..."
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 resize-none ${
                                error 
                                    ? "border-red-400 focus:ring-2 focus:ring-red-400/50" 
                                    : "border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/50"
                            }`}
                        />
                        {error && (
                            <p className="mt-1 text-xs text-red-600">Reason is required to leave.</p>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Confirm Leave
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </>
    );
};

export default LeaveReasonModal;