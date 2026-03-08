import { useState } from "react";

export default function CodeLogin({ onAuthenticated }) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (!code) {
            setError("Please enter your unique identifier code");
            return;
        }

        // Validate code format
        const validCode = /^R\d{4}[PH]\d{2}$/;
        if (!validCode.test(code.toUpperCase())) {
            setError("Invalid code format. Example: R0101P01");
            return;
        }

        setError("");
        setLoading(true);

        // Simulate authentication
        setTimeout(() => {
            setLoading(false);

            // Check if returning user
            const savedUser = localStorage.getItem("him_user");
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.code === code.toUpperCase()) {
                    // Returning user - check onboarding status
                    onAuthenticated({
                        code: code.toUpperCase(),
                        isReturning: true,
                        firstLogin: parsedUser.firstLogin,
                    });
                    return;
                }
            }

            // New user or new code - first login flow
            onAuthenticated({ firstLogin: true, code: code.toUpperCase() });
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 border-opacity-60 mx-auto mb-6"></div>
                    <p className="text-white/80 text-lg animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400 p-4">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-500 border border-white/10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">H</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Heartfelt International Ministry
                    </h1>
                    <p className="text-white/60 text-sm">
                        Enter your unique identifier code to access your portal
                    </p>
                </div>

                {/* Input */}
                <div className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Enter unique identifier code"
                            className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 text-center text-lg tracking-widest uppercase"
                            value={code}
                            onChange={(e) =>
                                setCode(e.target.value.toUpperCase())
                            }
                            onKeyPress={handleKeyPress}
                            maxLength={8}
                        />
                        <p className="text-white/40 text-xs mt-2 text-center">
                            Format: R0101P01 (Pastor) or R0101H01 (HOD)
                        </p>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/20 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold text-lg hover:scale-[1.02] hover:shadow-xl hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg"
                    >
                        Enter Portal
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-white/40 text-xs text-center mt-8">
                    Contact your administrator if you don't have a code
                </p>
            </div>
        </div>
    );
}
