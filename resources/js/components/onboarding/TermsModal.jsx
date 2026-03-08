import { useState, useRef, useEffect } from "react";

export default function TermsModal({ onAccept, onSkip }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll);
      return () => contentRef.current.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            Terms & Conditions
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Please read carefully before continuing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="p-6 h-64 overflow-y-auto"
        >
          <div className="space-y-4 text-gray-600 text-sm">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using the Heartfelt International Ministry Administration System, 
                you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">2. Privacy Policy</h3>
              <p>
                We are committed to protecting your privacy. Your personal information will be 
                used solely for church administration purposes and will not be shared with third parties.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">3. User Responsibilities</h3>
              <p>
                As a user of this system, you agree to:
              </p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Use the system only for legitimate church purposes</li>
                <li>Report any suspicious activities immediately</li>
                <li>Respect the privacy of other members</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">4. Data Accuracy</h3>
              <p>
                You are responsible for ensuring the accuracy of all data you enter into the system.
                Any false or misleading information may result in account termination.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">5. System Usage Guidelines</h3>
              <p>
                The system is intended for authorized personnel only. Unauthorized access or 
                misuse of the system may result in legal action.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">6. Liability</h3>
              <p>
                Heartfelt International Ministry shall not be liable for any damages arising 
                from the use or inability to use this system.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-gray-50 flex justify-between gap-4">
          <button
            onClick={onSkip}
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            Skip Tour
          </button>

          <button
            onClick={onAccept}
            disabled={scrollProgress < 70}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              scrollProgress < 70
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-300 hover:to-amber-400 shadow-lg hover:shadow-xl"
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
