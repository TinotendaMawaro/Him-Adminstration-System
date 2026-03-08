import { useEffect, useState } from "react";

// Animated Drawer Component - slides in from right with blur backdrop
export default function ZoneDrawer({ isOpen, onClose, title, children, size = "md" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow DOM to render before starting animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Don't render if not visible
  if (!isVisible) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur - fades in */}
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel - slides from right */}
      <div className="fixed inset-y-0 right-0 flex">
        <div
          className={`relative w-full ${sizeClasses[size]} transition-transform duration-300 ease-out ${
            isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* White card with shadow */}
          <div className="h-full bg-white/95 backdrop-blur-2xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center transition-all duration-200 group"
                aria-label="Close drawer"
              >
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

