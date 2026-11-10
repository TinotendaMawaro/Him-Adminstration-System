import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserProvider, useUser } from "./context/UserContext.jsx";
import { GlobalStateProvider } from "./hooks/GlobalStateProvider.jsx";
import AuthPage        from "./components/AuthPage.jsx";
import ErrorBoundary   from "./components/ErrorBoundary.jsx";
import LoadingScreen   from "./components/onboarding/LoadingScreen.jsx";
import { GoodbyeHost, SessionSplash, sayGoodbye } from "./components/SessionSplash.jsx";
import AppTour from "./mobile/AppTour.jsx";
import TermsModal      from "./components/onboarding/TermsModal.jsx";
import GuidedTour      from "./components/onboarding/GuidedTour.jsx";
import PastorsPortal   from "./components/PastorsPortal.jsx";
import HODPortal       from "./components/HODPortal.jsx";
import GiveOnline      from "./components/GiveOnline.jsx";
import MobileApp        from "./mobile/MobileApp.jsx";
import ProfilePhotoGate from "./components/ProfilePhotoGate.jsx";
import api             from "./lib/api.js";

const queryClient = new QueryClient({
    // 30s of freshness: switching tabs re-uses what was just loaded instead of hitting the server again.
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30 * 1000 } },
});

// ─── Idle time-out: web portals sign out after 30 minutes without activity ──────
function useIdleLogout(enabled, onLogout, minutes = 30) {
    useEffect(() => {
        if (!enabled) return undefined;
        let timer;
        const arm = () => {
            clearTimeout(timer);
            timer = setTimeout(() => { sayGoodbye({ reason: `You were signed out after ${minutes} minutes of inactivity, to keep your account safe.` }); onLogout(); }, minutes * 60 * 1000);
        };
        const events = ["pointerdown", "keydown", "scroll", "touchstart"];
        events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
        arm();
        return () => { clearTimeout(timer); events.forEach((e) => window.removeEventListener(e, arm)); };
    }, [enabled, onLogout, minutes]);
}

// ─── Portal router — reads user from context internally ──────────────────────
function PortalRouter({ onLogout }) {
    const { user, loading } = useUser();
    useIdleLogout(!!user && ["pastor", "hod"].includes(user.role), onLogout);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Fetching user data</h2>
                    <p className="text-gray-500">Please wait while we restore your session.</p>
                </div>
            </div>
        );
    }

    // Online giving (ClicknPay PayMe) is offered from every portal.
    const withGiving = (portal) => (
        <>
            {portal}
            <GiveOnline />
            <ProfilePhotoGate />
        </>
    );

    // Members and partners use the mobile community app (the old members portal is gone). Everyone else keeps their own portal.
    const memberApp = <><MobileApp onLogout={onLogout} /><GiveOnline hideLauncher /></>;

    switch (user.role) {
        case "pastor":  return withGiving(<PastorsPortal  onLogout={onLogout} />);
        case "partner":
        case "member":  return memberApp;
        case "hod":     return withGiving(<HODPortal      onLogout={onLogout} />);
        default:
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h2>
                        <p className="text-gray-500 mb-4">Your account uses the staff portal.</p>
                        <a href={{ master: "/admin", finance: "/finance", event: "/events" }[user.role] || "/admin"} className="inline-block px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold">
                            Go to {{ master: "the Master console", finance: "the Finance portal", event: "the Events portal" }[user.role] || "the staff portal"} →
                        </a>
                    </div>
                </div>
            );
    }
}

// ─── Inner app — has access to UserContext ────────────────────────────────────
function AppInner() {
    const { user, updateUser, clearUser, refreshUser } = useUser();

    // Compute initial app state from localStorage to avoid flash of wrong screen
    const getInitialAppState = () => {
        const savedToken = localStorage.getItem("him_token");
        const savedUser  = localStorage.getItem("him_user");
        if (savedToken && savedUser) {
            const parsed = JSON.parse(savedUser);
            if (!parsed.terms_accepted)  return "terms";
            else if (!parsed.completed_tour) return "tour";
            else return "dashboard";
        }
        return "auth";
    };
    const [appState, setAppState] = useState(getInitialAppState);

    // Listen for global logout events (e.g., from other tabs)
    useEffect(() => {
        const onUnauth = () => handleLogout({ shouldLogoutApi: false });
        window.addEventListener("him:unauthenticated", onUnauth);
        return () => window.removeEventListener("him:unauthenticated", onUnauth);
    }, []);

    // Advance from loading → next screen (used if we ever set loading manually)
    useEffect(() => {
        if (appState !== "loading") return;
        const timer = setTimeout(() => {
            if (!user) {
                // If for some reason user is not ready yet, fallback to auth.
                setAppState("auth");
                return;
            }
            if (!user.terms_accepted)  setAppState("terms");
            else if (!user.completed_tour) setAppState("tour");
            else setAppState("dashboard");
        }, 2200);
        return () => clearTimeout(timer);
    }, [appState, user]);

    const handleTermsAccept = async () => {
        updateUser({ terms_accepted: true });

        try {
            await api.post("/terms/accept");
        } catch (error) {
            console.warn("Terms acceptance API failed:", error);
        }

        setAppState("tour");
    };

    const handleTermsSkip = async () => {
        updateUser({ terms_accepted: true, completed_tour: true });

        try {
            await api.post("/terms/accept");
            await api.post("/tour/complete");
        } catch (error) {
            console.warn("Skipping terms/tour API failed:", error);
        }

        setAppState("dashboard");
    };

    const handleTourComplete = () => {
        updateUser({ completed_tour: true });
        api.post("/tour/complete").catch(() => {});
        setAppState("dashboard");
    };

    const handleLogout = async ({ shouldLogoutApi = true } = {}) => {
        if (shouldLogoutApi) {
            const token = localStorage.getItem("him_token");
            if (token) {
                try {
                    await api.post("/logout");
                } catch (error) {
                    // 401 is expected if the token is already invalid; avoid cascading logout events
                    if (error.response?.status !== 401) {
                        console.warn("Logout request failed:", error);
                    }
                }
            }
        }

        // The friendly goodbye (shown by <GoodbyeHost/>, which outlives the page change below).
        if (shouldLogoutApi) sayGoodbye({ name: user?.name?.split(" ")[0] });

        // Leave nothing of this person behind on a shared browser: tokens, cached lists (members, departments,
        // reports...) and any per-user UI state all go.
        try { localStorage.clear(); sessionStorage.clear(); } catch { /* storage unavailable (private mode) */ }
        queryClient.clear();
        clearUser();
        // No need to set appState; component will unmount via RequireAuth redirect
    };

    switch (appState) {
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
                    {["member", "partner"].includes(user?.role)
                        ? <AppTour onFinish={handleTourComplete} />
                        : <GuidedTour onFinish={handleTourComplete} onSkip={handleTourComplete} />}
                </>
            );
        case "dashboard":
            return <PortalRouter onLogout={handleLogout} />;
        default:
            return null;
    }
}

// ─── Public route: root redirect ───────────────────────────────────────────────
function RootRedirect() {
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/login", { replace: true });
            }
        }
    }, [user, loading, navigate]);

    // While checking auth, show a loading indicator
    if (loading) return <LoadingScreen />;
    return null;
}

// ─── Login page wrapper ────────────────────────────────────────────────────────
function LoginPage() {
    const navigate = useNavigate();
    const { user, updateUser, refreshUser, loading: userLoading } = useUser();
    const [showSplash, setShowSplash] = useState(false);
    const [ready, setReady] = useState(false);

    // Already signed in (and not in the middle of the welcome): go straight to the dashboard.
    useEffect(() => {
        if (!showSplash && user) navigate("/dashboard", { replace: true });
    }, [user, navigate, showSplash]);

    const handleLoginSuccess = (userData) => {
        setShowSplash(true);
        updateUser(userData);
        // Load the fresh profile while the welcome plays, so the dashboard opens with current data.
        Promise.resolve(refreshUser()).catch(() => {}).finally(() => setReady(true));
    };

    const subtitle = [user?.role_label, user?.zone?.name].filter(Boolean).join(" · ");

    return (
        <>
            {showSplash && (
                <SessionSplash
                    name={user?.name?.split(" ")[0]}
                    subtitle={subtitle}
                    done={ready && !userLoading}
                    onDone={() => navigate("/dashboard", { replace: true })}
                />
            )}
            <AuthPage onLoginSuccess={handleLoginSuccess} />
        </>
    );
}

// ─── Protected route guard ─────────────────────────────────────────────────────
function RequireAuth() {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
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
                     <GoodbyeHost />
                     <GlobalStateProvider>
                         <BrowserRouter>
                              <Routes>
                                  {/* Public routes */}
                                  <Route path="/" element={<RootRedirect />} />
                                  <Route path="/login" element={<LoginPage />} />

                                   {/* Protected routes */}
                                   <Route element={<RequireAuth />}>
                                       <Route path="*" element={<AppInner />} />
                                   </Route>
                              </Routes>
                         </BrowserRouter>
                     </GlobalStateProvider>
                </UserProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    );
}

const container = document.getElementById("react-app");
if (container) {
    if (!window.__HIM_ADMIN_ROOT__) {
        window.__HIM_ADMIN_ROOT__ = createRoot(container);
    }
    window.__HIM_ADMIN_ROOT__.render(<App />);
}
export default App;
