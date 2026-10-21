import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserProvider, useUser } from "./context/UserContext.jsx";
import { GlobalStateProvider } from "./hooks/GlobalStateProvider.jsx";
import AuthPage        from "./components/AuthPage.jsx";
import ErrorBoundary   from "./components/ErrorBoundary.jsx";
import LoadingScreen   from "./components/onboarding/LoadingScreen.jsx";
import { MemberLoginSplash } from "./components/MemberSplash.jsx";
import TermsModal      from "./components/onboarding/TermsModal.jsx";
import GuidedTour      from "./components/onboarding/GuidedTour.jsx";
import PastorsPortal   from "./components/PastorsPortal.jsx";
import HODPortal       from "./components/HODPortal.jsx";
import MembersPortal   from "./components/MembersPortalWrapper.jsx";
import PartnerPortal   from "./components/PartnerPortal.jsx";
import PartnerEnrollmentPage from "./components/PartnerEnrollmentPage.jsx";
import GiveOnline      from "./components/GiveOnline.jsx";
import api             from "./lib/api.js";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// ─── Portal router — reads user from context internally ──────────────────────
function PortalRouter({ onLogout }) {
    const { user, loading } = useUser();

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
        </>
    );

    switch (user.role) {
        case "pastor":  return withGiving(<PastorsPortal  onLogout={onLogout} />);
        case "partner": return withGiving(<PartnerPortal  onLogout={onLogout} />);
        case "member":  return withGiving(<MembersPortal  onLogout={onLogout} />);
        case "hod":     return withGiving(<HODPortal      onLogout={onLogout} />);
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

        localStorage.removeItem("him_user");
        localStorage.removeItem("him_token");
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
                    <GuidedTour onFinish={handleTourComplete} onSkip={handleTourComplete} />
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
    const location = useLocation();
    const [showMemberSplash, setShowMemberSplash] = useState(false);
    const [loginDone, setLoginDone] = useState(false);

    // For non-member roles, redirect as before. Members use the splash flow.
    useEffect(() => {
        if (!showMemberSplash && user) {
            const params = new URLSearchParams(location.search);
            const intent = params.get('intent');
            if (intent === 'partner') {
                navigate(user.role === 'pastor' ? "/dashboard" : "/partner/enroll", { replace: true });
            } else if (user.role !== 'member') {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [user, navigate, location, showMemberSplash]);

    // Keep the splash visible until the member's data has been freshly fetched
    // (refreshUser resolves) and the user is ready to be routed to the dashboard.
    useEffect(() => {
        if (showMemberSplash && !userLoading && user && user.role === 'member') {
            setLoginDone(true);
        }
    }, [showMemberSplash, userLoading, user]);

    const handleLoginSuccess = (userData) => {
        updateUser(userData);
        const params = new URLSearchParams(location.search);
        const intent = params.get('intent');

        if (intent === 'partner' && userData.role === 'pastor') {
            navigate("/dashboard", { replace: true });
        } else if (intent === 'partner') {
            navigate("/partner/enroll", { replace: true });
        } else if (userData.role === 'member') {
            setShowMemberSplash(true);
            // Fetch the full, fresh member profile before clearing the splash.
            refreshUser();
        } else {
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <>
            {showMemberSplash && (
                <MemberLoginSplash
                    memberName={user?.name?.split(" ")[0]}
                    done={loginDone}
                    onComplete={() => navigate("/dashboard", { replace: true })}
                />
            )}
            <AuthPage onLoginSuccess={handleLoginSuccess} onPartnerEnroll={() => navigate("/partner/enroll", { replace: true })} />
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
                     <GlobalStateProvider>
                         <BrowserRouter>
                              <Routes>
                                  {/* Public routes */}
                                  <Route path="/" element={<RootRedirect />} />
                                  <Route path="/login" element={<LoginPage />} />

                                   {/* Protected routes */}
                                   <Route element={<RequireAuth />}>
                                       <Route path="/partner/enroll" element={<PartnerEnrollmentPage />} />
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
