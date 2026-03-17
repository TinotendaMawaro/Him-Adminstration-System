import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserProvider, useUser } from "./context/UserContext.jsx";
import AuthPage        from "./components/AuthPage.jsx";
import ErrorBoundary   from "./components/ErrorBoundary.jsx";
import LoadingScreen   from "./components/onboarding/LoadingScreen.jsx";
import TermsModal      from "./components/onboarding/TermsModal.jsx";
import GuidedTour      from "./components/onboarding/GuidedTour.jsx";
import PastorsPortal   from "./components/PastorsPortal.jsx";
import HODPortal       from "./components/HODPortal.jsx";
import MembersPortal   from "./components/MembersPortal.jsx";
import PartnerPortal   from "./components/PartnerPortal.jsx";
import api             from "./lib/api.js";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// ─── Portal router — reads user from context internally ──────────────────────
function PortalRouter({ onLogout }) {
    const { user } = useUser();

    switch (user?.role) {
        case "pastor":  return <PastorsPortal  onLogout={onLogout} />;
        case "partner": return <PartnerPortal  onLogout={onLogout} />;
        case "member":  return <MembersPortal  onLogout={onLogout} />;
        case "hod":     return <HODPortal      onLogout={onLogout} />;
        default:
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h2>
                        <p className="text-gray-500 mb-4">Your account uses the admin panel.</p>
                        <a href="/admin" className="inline-block px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold">
                            Go to Admin Panel →
                        </a>
                    </div>
                </div>
            );
    }
}

// ─── Inner app — has access to UserContext ────────────────────────────────────
function AppInner() {
    const { user, updateUser, clearUser, refreshUser } = useUser();
    const [appState, setAppState] = useState("auth");

    // Restore session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("him_token");
        const savedUser  = localStorage.getItem("him_user");

        if (savedToken && savedUser) {
            const parsed = JSON.parse(savedUser);
            // UserProvider already called /me in background; just set the state
            if (!parsed.terms_accepted)  setAppState("terms");
            else if (!parsed.completed_tour) setAppState("tour");
            else setAppState("dashboard");
        }

        const onUnauth = () => handleLogout();
        window.addEventListener("him:unauthenticated", onUnauth);
        return () => window.removeEventListener("him:unauthenticated", onUnauth);
    }, []);

    // Advance from loading → next screen
    useEffect(() => {
        if (appState !== "loading") return;
        const timer = setTimeout(() => {
            if (!user?.terms_accepted)  setAppState("terms");
            else if (!user?.completed_tour) setAppState("tour");
            else setAppState("dashboard");
        }, 2200);
        return () => clearTimeout(timer);
    }, [appState, user]);

    const handleAuthenticated = (userData) => {
        // userData already saved to localStorage by AuthPage
        setAppState("loading");
    };

    const handleTermsAccept = () => {
        updateUser({ terms_accepted: true });
        // Also persist to backend
        api.post("/terms/accept").catch(() => {});
        setAppState("tour");
    };

    const handleTermsSkip = () => {
        updateUser({ terms_accepted: true, completed_tour: true });
        setAppState("dashboard");
    };

    const handleTourComplete = () => {
        updateUser({ completed_tour: true });
        api.post("/tour/complete").catch(() => {});
        setAppState("dashboard");
    };

    const handleLogout = () => {
        api.post("/logout").catch(() => {});
        localStorage.removeItem("him_user");
        localStorage.removeItem("him_token");
        queryClient.clear();
        clearUser();
        setAppState("auth");
    };

    switch (appState) {
        case "auth":
            return <AuthPage onLoginSuccess={handleAuthenticated} />;
        case "loading":
            return <LoadingScreen />;
        case "terms":
            return (
                <>
                    <LoadingScreen onComplete={() => {}} />
                    <TermsModal onAccept={handleTermsAccept} onSkip={handleTermsSkip} />
                </>
            );
        case "tour":
            return (
                <>
                    <PortalRouter onLogout={handleLogout} />
                    <GuidedTour onFinish={handleTourComplete} onSkip={handleTourComplete} />
                </>
            );
        case "dashboard":
            return <PortalRouter onLogout={handleLogout} />;
        default:
            return <AuthPage onLoginSuccess={handleAuthenticated} />;
    }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
    // Seed from localStorage so there's no flash on session restore
    const cachedUser  = JSON.parse(localStorage.getItem("him_user")  || "null");
    const cachedToken = localStorage.getItem("him_token");

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <UserProvider initialUser={cachedUser} token={cachedToken}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="*" element={<AppInner />} />
                        </Routes>
                    </BrowserRouter>
                </UserProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    );
}

const container = document.getElementById("react-app");
if (container) createRoot(container).render(<App />);
export default App;
