import React from 'react';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  position = "right"
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const positionClasses = {
    right: "right-0",
    left: "left-0",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 bottom-0 ${positionClasses[position]} z-50 w-full ${sizeClasses[size]} bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 animate-slide-in-right`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .animate-slide-in-right {
            animation: slide-in-right 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
    </>
  );
};

export default Drawer;