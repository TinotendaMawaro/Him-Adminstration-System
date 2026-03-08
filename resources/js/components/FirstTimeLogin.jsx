import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";

// Loading Animation Component
const LoadingAnimation = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-32 h-32 mb-8">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin border-t-yellow-400"></div>

                {/* Inner circle with cross */}
                <div className="absolute inset-4 flex items-center justify-center">
                    <div className="text-center">
                        <svg
                            className="w-12 h-12 mx-auto text-yellow-400 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </div>
                </div>

                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        strokeDasharray={`${progress * 3.64} 364`}
                        strokeLinecap="round"
                        className="transition-all duration-75"
                    />
                    <defs>
                        <linearGradient
                            id="progressGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#FBBF24" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
                Welcome to HIM
            </h2>
            <p className="text-white/60 text-center max-w-xs">
                Preparing your personalized experience...
            </p>
            <p className="text-yellow-400/80 text-sm mt-4 font-mono">
                {progress}%
            </p>
        </div>
    );
};

// Terms and Conditions Component
const TermsAndConditions = ({ onAccept, onDecline }) => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const contentRef = React.useRef(null);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                contentRef.current;
            const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollProgress(Math.min(progress, 100));
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Terms & Conditions
                </h2>
                <p className="text-white/60 text-sm">
                    Please read our terms and conditions carefully
                </p>
            </div>

            {/* Scroll progress bar */}
            <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Terms content */}
            <div
                ref={contentRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-white/5 rounded-lg p-4 mb-4 text-white/80 text-sm space-y-4 scrollbar-hide"
                style={{ maxHeight: "200px" }}
            >
                <h3 className="font-bold text-white">1. Acceptance of Terms</h3>
                <p>
                    By accessing and using the Heartfelt International Ministry
                    Administration System, you accept and agree to be bound by
                    the terms and provision of this agreement.
                </p>

                <h3 className="font-bold text-white">2. Privacy Policy</h3>
                <p>
                    We are committed to protecting your privacy. Your personal
                    information will be used solely for church administration
                    purposes and will not be shared with third parties.
                </p>

                <h3 className="font-bold text-white">
                    3. User Responsibilities
                </h3>
                <p>
                    As a user of this system, you agree to:
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>
                            Maintain the confidentiality of your login
                            credentials
                        </li>
                        <li>
                            Use the system only for legitimate church purposes
                        </li>
                        <li>Report any suspicious activities immediately</li>
                        <li>Respect the privacy of other members</li>
                    </ul>
                </p>

                <h3 className="font-bold text-white">4. Data Accuracy</h3>
                <p>
                    You are responsible for ensuring the accuracy of all data
                    you enter into the system. Any false or misleading
                    information may result in account termination.
                </p>

                <h3 className="font-bold text-white">
                    5. System Usage Guidelines
                </h3>
                <p>
                    The system is intended for authorized personnel only.
                    Unauthorized access or misuse of the system may result in
                    legal action.
                </p>

                <h3 className="font-bold text-white">6. Liability</h3>
                <p>
                    Heartfelt International Ministry shall not be liable for any
                    damages arising from the use or inability to use this
                    system.
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onDecline}
                    className="flex-1 py-3 px-4 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-300 font-semibold"
                >
                    Decline
                </button>
                <button
                    onClick={onAccept}
                    disabled={scrollProgress < 80}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        scrollProgress < 80
                            ? "bg-white/20 text-white/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-400 hover:to-amber-400 shadow-lg"
                    }`}
                >
                    Accept & Continue
                </button>
            </div>
        </div>
    );
};

// Tour Component
const Tour = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Your Portal",
            description:
                "This is your personalized dashboard where you can manage all your church responsibilities.",
            icon: (
                <svg
                    className="w-16 h-16 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
        },
        {
            title: "Stay Connected",
            description:
                "Receive instant notifications about important updates, events, and reminders.",
            icon: (
                <svg
                    className="w-16 h-16 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
            ),
        },
        {
            title: "Manage Reports",
            description:
                "Submit weekly finance and stats reports, track attendance, and monitor growth.",
            icon: (
                <svg
                    className="w-16 h-16 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
        {
            title: "Leadership Management",
            description:
                "Appoint and manage HODs and home group leaders within your zone.",
            icon: (
                <svg
                    className="w-16 h-16 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
                <CSSTransition
                    key={currentStep}
                    timeout={300}
                    classNames="fade"
                >
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            {steps[currentStep].icon}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-white/70 text-center max-w-sm mx-auto">
                            {steps[currentStep].description}
                        </p>
                    </div>
                </CSSTransition>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentStep
                                ? "w-8 bg-gradient-to-r from-yellow-400 to-amber-500"
                                : "w-2 bg-white/20"
                        }`}
                    />
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onSkip}
                    className="flex-1 py-3 px-4 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-all duration-300 font-semibold"
                >
                    Skip Tour
                </button>
                <button
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-lg"
                >
                    {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
    );
};

// Main FirstTimeLogin Component
export default function FirstTimeLogin({ onComplete }) {
    const [stage, setStage] = useState("loading"); // loading, terms, tour

    const handleLoadingComplete = () => {
        setStage("terms");
    };

    const handleTermsAccepted = () => {
        // API call to accept terms would go here
        setStage("tour");
    };

    const handleTermsDeclined = () => {
        // User declined - stay on terms
    };

    const handleTourComplete = () => {
        onComplete();
    };

    const handleTourSkipped = () => {
        onComplete();
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col p-8">
            {stage === "loading" && (
                <LoadingAnimation onComplete={handleLoadingComplete} />
            )}

            {stage === "terms" && (
                <TermsAndConditions
                    onAccept={handleTermsAccepted}
                    onDecline={handleTermsDeclined}
                />
            )}

            {stage === "tour" && (
                <Tour
                    onComplete={handleTourComplete}
                    onSkip={handleTourSkipped}
                />
            )}
        </div>
    );
}
