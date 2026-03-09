import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LoadingScreen from "./components/onboarding/LoadingScreen.jsx";
import TermsModal from "./components/onboarding/TermsModal.jsx";
import GuidedTour from "./components/onboarding/GuidedTour.jsx";
import PastorsPortal from "./components/PastorsPortal.jsx";
import HODPortal from "./components/HODPortal.jsx";

// App States:
// 1. auth - Original login page
// 2. loading - Loading animation after login
// 3. terms - Terms and conditions modal
// 4. tour - Guided tour overlay
// 5. dashboard - Main dashboard

function App() {
    const [appState, setAppState] = useState("auth");
    const [user, setUser] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("him_user");
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            // Check if needs onboarding
            if (!parsedUser.firstLogin) {
                setAppState("dashboard");
            } else if (!parsedUser.termsAccepted) {
                setAppState("terms");
            } else if (!parsedUser.tourCompleted) {
                setAppState("tour");
            } else {
                setAppState("dashboard");
            }
        }
    }, []);

    // Handle successful authentication from AuthPage
    const handleAuthenticated = (userData) => {
        setUser(userData);
        setAppState("loading");
    };

    // Handle loading complete
    useEffect(() => {
        if (appState === "loading") {
            const timer = setTimeout(() => {
                // Check if first time user
                if (user?.firstLogin) {
                    setAppState("terms");
                } else {
                    setAppState("dashboard");
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [appState, user]);

    // Handle terms acceptance
    const handleTermsAccept = () => {
        const updatedUser = { ...user, termsAccepted: true };
        setUser(updatedUser);
        localStorage.setItem("him_user", JSON.stringify(updatedUser));
        setAppState("tour");
    };

    // Handle terms skip
    const handleTermsSkip = () => {
        const updatedUser = {
            ...user,
            termsAccepted: true,
            tourCompleted: true,
            firstLogin: false,
        };
        setUser(updatedUser);
        localStorage.setItem("him_user", JSON.stringify(updatedUser));
        setAppState("dashboard");
    };

    // Handle tour complete
    const handleTourComplete = () => {
        const updatedUser = { ...user, tourCompleted: true, firstLogin: false };
        setUser(updatedUser);
        localStorage.setItem("him_user", JSON.stringify(updatedUser));
        setAppState("dashboard");
    };

    // Handle tour skip
    const handleTourSkip = () => {
        const updatedUser = { ...user, tourCompleted: true, firstLogin: false };
        setUser(updatedUser);
        localStorage.setItem("him_user", JSON.stringify(updatedUser));
        setAppState("dashboard");
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("him_user");
        localStorage.removeItem("him_token");
        setUser(null);
        setAppState("auth");
    };

    // Render the appropriate portal based on user role
    const renderPortal = (portalUser, onLogout) => {
        console.log("[DEBUG] Rendering portal for user role:", portalUser?.role);
        
        if (portalUser?.role === 'hod') {
            console.log("[DEBUG] Routing to HODPortal");
            return <HODPortal user={portalUser} onLogout={onLogout} />;
        }
        
        if (portalUser?.role === 'pastor') {
            console.log("[DEBUG] Routing to PastorsPortal (pastor)");
            return <PastorsPortal user={portalUser} onLogout={onLogout} />;
        }
        
        // Default to PastorsPortal for other roles
        console.log("[DEBUG] Routing to PastorsPortal (default)");
        return <PastorsPortal user={portalUser} onLogout={onLogout} />;
    };

    // Render based on app state
    const renderContent = () => {
        switch (appState) {
            case "auth":
                return <AuthPage onLoginSuccess={handleAuthenticated} />;

            case "loading":
                return <LoadingScreen />;

            case "terms":
                return (
                    <>
                        <LoadingScreen onComplete={() => {}} />
                        <TermsModal
                            onAccept={handleTermsAccept}
                            onSkip={handleTermsSkip}
                        />
                    </>
                );

            case "tour":
                return (
                    <>
                        {renderPortal(user, handleLogout)}
                        <GuidedTour
                            onFinish={handleTourComplete}
                            onSkip={handleTourSkip}
                        />
                    </>
                );

            case "dashboard":
                return renderPortal(user, handleLogout);

            default:
                return <AuthPage onLoginSuccess={handleAuthenticated} />;
        }
    };

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={renderContent()} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

const container = document.getElementById("react-app");
if (container) {
    createRoot(container).render(<App />);
}

export default App;
