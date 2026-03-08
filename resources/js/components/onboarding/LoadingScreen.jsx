import { useState, useEffect } from "react";

export default function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">
            <div className="relative mb-8">
                {/* Outer ring */}
                <div className="w-32 h-32 rounded-full border-4 border-white/20 animate-pulse"></div>

                {/* Spinning ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin"></div>
                </div>

                {/* Inner content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">H</span>
                </div>

                {/* Progress ring SVG */}
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
                            <stop offset="0%" stopColor="#FACC15" />
                            <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
                Welcome to HIM
            </h2>
            <p className="text-white/60 mb-4">
                Preparing your personalized experience...
            </p>
            <p className="text-yellow-400 font-mono text-sm">{progress}%</p>
        </div>
    );
}
