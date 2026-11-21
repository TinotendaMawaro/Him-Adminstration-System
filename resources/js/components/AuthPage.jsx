import React, { useState, useRef, useCallback, useEffect } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import AnimatedBackground from "./AnimatedBackground";
import "./authAnimations.css";
import api from "../lib/api";
import { DOWNLOAD_PATH, IS_APP } from "../lib/platform.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePassword = (v) => v.length >= 10 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthPage({ onLoginSuccess = () => {} }) {
    const [mode, setMode]                   = useState(IS_APP ? "email" : "code");
    const [isLoading, setIsLoading]         = useState(false);
    const [errors, setErrors]               = useState({});
    const [touched, setTouched]             = useState({});
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
    const [registrationResult, setRegistrationResult] = useState(null);
    const [partnerIntent, setPartnerIntent] = useState(false);
    const [showPartnerPrompt, setShowPartnerPrompt] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (IS_APP && params.get('intent') === 'partner') {
            setPartnerIntent(true);
            setMode('register');
        }
    }, []);

    const [code, setCode]               = useState("");
    const [pastorPassword, setPastorPassword] = useState("");
    const [pastorPasswordRequired, setPastorPasswordRequired] = useState(false);

    // Ask the server what the pastor sign-in needs (a code alone is a weak credential, so it can also require a password).
    useEffect(() => {
        let cancelled = false;
        api.get("/auth/policy").then(({ data }) => !cancelled && setPastorPasswordRequired(!!data?.data?.pastor_password_required)).catch(() => {});
        return () => { cancelled = true; };
    }, []);
    const [emailLogin, setEmailLogin]   = useState({ email: "", password: "" });
    const [formData, setFormData]       = useState({
        firstName: "", lastName: "", email: "",
        phoneNumber: "", physicalAddress: "",
        password: "", confirmPassword: "",
        zoneCode: "",
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [zoneLookup, setZoneLookup]   = useState(null);
    const [zoneChecking, setZoneChecking] = useState(false);
    const inputRef = useRef(null);

    // ─── Validation ───────────────────────────────────────────────────────────

    const getFieldClass = (fieldName, value) => {
        if (!touched[fieldName]) return "";
        if (errors[fieldName])   return "border-red-500 focus:ring-red-500/20";
        if (value?.length > 0)   return "border-emerald-500 focus:ring-emerald-500/20";
        return "";
    };

    const handleBlur = (field) => {
        setTouched((p) => ({ ...p, [field]: true }));
    };

    const validateForm = () => {
        const e = {};
        if (mode === "code") {
            if (!code.trim()) e.code = "Code is required";
            if (pastorPasswordRequired && !pastorPassword) e.pastorPassword = "Password is required";
        }
        if (mode === "email") {
            if (!emailLogin.email || !validateEmail(emailLogin.email)) e.emailLoginEmail = "Valid email is required";
            if (!emailLogin.password) e.emailLoginPassword = "Password is required";
        }
        if (mode === "register") {
            if (!formData.firstName) e.firstName = "First name is required";
            if (!formData.lastName)  e.lastName  = "Last name is required";
            if (!formData.email || !validateEmail(formData.email)) e.email = "Valid email is required";
            if (!formData.phoneNumber || formData.phoneNumber.length < 7) e.phoneNumber = "Valid phone number is required";
            if (!formData.physicalAddress) e.physicalAddress = "Physical address is required";
            if (!formData.zoneCode || !(/^\d{4}$/.test(formData.zoneCode) || /^R\d{4}$/.test(formData.zoneCode))) e.zoneCode = "Invalid Zone Code. Please contact your Zone Pastor or Administrator for assistance.";
            if (!formData.password || !validatePassword(formData.password)) e.password = "Use at least 10 characters with upper and lower case letters and a number";
            if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
            if (!acceptTerms) e.acceptTerms = "You must accept the terms and conditions";
        }
        setErrors(e);
        setTouched({ code:true, email:true, password:true, firstName:true, lastName:true, phoneNumber:true, physicalAddress:true, confirmPassword:true, acceptTerms:true, emailLoginEmail:true, emailLoginPassword:true });
        return Object.keys(e).length === 0;
    };

    // ─── Change handlers ──────────────────────────────────────────────────────

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    }, [errors]);

    const handleEmailLoginChange = useCallback((e) => {
        const { name, value } = e.target;
        setEmailLogin((p) => ({ ...p, [name]: value }));
        const k = name === "email" ? "emailLoginEmail" : "emailLoginPassword";
        if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    }, [errors]);

    useEffect(() => {
        const isValid = /^(R\d{4}|\d{4})$/.test(formData.zoneCode);
        if (!isValid) {
            setZoneLookup(null);
            return;
        }
        if (mode !== "register" || !formData.zoneCode) {
            if (mode !== "register") setZoneLookup(null);
            return;
        }
        const timer = setTimeout(async () => {
            setZoneChecking(true);
            try {
                const { data } = await api.get(`/zones/lookup?code=${encodeURIComponent(formData.zoneCode)}`);
                if (data.success) setZoneLookup(data.data);
                else setZoneLookup("invalid");
            } catch {
                setZoneLookup("invalid");
            }
            setZoneChecking(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [formData.zoneCode, mode]);

    // ─── Login response handler ───────────────────────────────────────────────

    const handleLoginResponse = (data) => {
        localStorage.setItem("him_token", data.token);
        localStorage.setItem("him_user",  JSON.stringify(data.user));
        onLoginSuccess(data.user);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors((p) => ({ ...p, submit: "" }));

        try {
            if (mode === "code") {
                const { data } = await api.post("/login/code", { unique_code: code.trim(), ...(pastorPassword ? { password: pastorPassword } : {}) });
                if (data.success) {
                    handleLoginResponse(data);
                } else {
                    setErrors({ submit: data.message || "Invalid code. Please try again." });
                }

            } else if (mode === "email") {
                const { data } = await api.post("/login", { 
                    email: emailLogin.email, 
                    password: emailLogin.password 
                });
                if (data.success) {
                    handleLoginResponse(data);
                } else {
                    setErrors({ submit: data.message || "Invalid credentials." });
                }

            } else if (mode === "register") {
                const { data } = await api.post("/register", {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                    phone: formData.phoneNumber,
                    address: formData.physicalAddress,
                    zone_code: formData.zoneCode,
                });

                if (data.success) {
                    if (partnerIntent) {
                        setShowPartnerPrompt(true);
                        setRegistrationResult(data);
                    } else {
                        setShowRegisterSuccess(true);
                        setTimeout(() => handleLoginResponse(data), 1500);
                    }
                } else {
                    if (data.errors) {
                        const mapped = {};
                        if (data.errors.email)          mapped.email    = data.errors.email[0];
                        if (data.errors.password)       mapped.password = data.errors.password[0];
                        if (data.errors.name)           mapped.firstName = data.errors.name[0];
                        if (data.errors.zone_code)      mapped.zoneCode = data.errors.zone_code[0];
                        setErrors(Object.keys(mapped).length ? mapped : { submit: data.message || "Registration failed." });
                    } else {
                        setErrors({ submit: data.message || "Registration failed." });
                    }
                }
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const apiErrors = err.response.data?.errors || {};
                const mapped = {};
                if (apiErrors.email)       mapped.email    = apiErrors.email[0];
                if (apiErrors.password)    mapped.password = apiErrors.password[0];
                if (apiErrors.name)        mapped.firstName = apiErrors.name[0];
                if (apiErrors.unique_code) mapped.code     = apiErrors.unique_code[0];
                setErrors(Object.keys(mapped).length ? mapped : { submit: err.response.data?.message || "Validation failed." });
            } else if (err.response?.data?.requires_password) {
                setPastorPasswordRequired(true);
                setErrors({ pastorPassword: "Please enter your password as well." });
            } else if (err.response?.data?.app_only) {
                setErrors({ submit: err.response.data.message, appLink: DOWNLOAD_PATH });
            } else if (err.response?.data?.staff) {
                setErrors({ submit: err.response.data.message, staffLink: err.response.data.redirect });
            } else if ([401, 403, 429].includes(err.response?.status)) {
                setErrors({ submit: err.response.data?.message || (mode === "code" ? "Invalid code. Please check and try again." : "Invalid email or password.") });
            } else {
                setErrors({ submit: "Unable to connect. Please check your connection and try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getSubmitText = () => {
        if (isLoading)            return "Signing in…";
        if (showRegisterSuccess)  return "Redirecting…";
        if (mode === "register")  return "REGISTER";
        return "LOGIN TO DASHBOARD";
    };

    // ─── JSX ──────────────────────────────────────────────────────────────────

    const transitionRef = useRef(null);
    const inputBase = "px-4 py-3 rounded-xl text-base md:text-sm w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300";

    // The app is for every church member, including partners, heads of department and group leaders (email + password, or join). The website is for pastors (code).
    const TABS = IS_APP
        ? [{ key: "email", label: "Sign in", sub: "Members & partners" }, { key: "register", label: "Join", sub: "New member" }]
        : [{ key: "code", label: "Pastors", sub: "Sign in with code" }, { key: "register", label: "Join", sub: "Get the app" }];
    const switchMode = (key) => {
        // Joining is done in the mobile app: the website sends people to download it.
        if (key === "register" && !IS_APP) { window.location.assign(DOWNLOAD_PATH); return; }
        setMode(key); setErrors({}); setTouched({});
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070f1d] font-sans text-white lg:grid lg:grid-cols-[1.05fr_1fr]" role="main" aria-label="Authentication Page">
            <AnimatedBackground />
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 50% at 15% 10%, rgba(47,107,255,.28), transparent 70%), radial-gradient(50% 45% at 90% 95%, rgba(201,168,76,.22), transparent 70%)" }} />

            {/* ── Brand panel (desktop) ─────────────────────────────────────── */}
            <aside className="relative z-10 hidden flex-col justify-between p-12 xl:p-16 lg:flex">
                <img src="/images/logo.webp" alt="Heartfelt International Ministries" className="logo-shake h-20 w-auto self-start object-contain" />
                <div className="max-w-xl">
                    <p className="mb-4 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">One family · one platform</p>
                    <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl" style={{ fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif' }}>
                        <span className="bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent">Heartfelt</span><br />International Ministries
                    </h1>
                    <p className="mt-5 max-w-md text-lg text-slate-300">Pastoral care, community, giving and events: everything the church family needs, in one place.</p>
                    <ul className="mt-9 grid max-w-lg grid-cols-2 gap-3 text-sm">
                        {[["Community", "Posts, channels, live services"], ["Care", "Home groups and prayer"], ["Giving", "Secure online payments"], ["Your ID card", "Scannable and downloadable"]].map(([t, d]) => (
                            <li key={t} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"><div className="font-bold text-white">{t}</div><div className="mt-0.5 text-slate-400">{d}</div></li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs text-slate-500">© 2026 Heartfelt International Ministries</p>
            </aside>

            {/* ── Sign-in card ──────────────────────────────────────────────── */}
            <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
                <div className="w-full max-w-[440px]">
                    <div className="mb-6 text-center lg:hidden">
                        <img src="/images/logo.webp" alt="Heartfelt International Ministries" className="logo-shake mx-auto h-24 w-auto object-contain" />
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
                        <div role="tablist" aria-label="Sign in method" className={`${TABS.length === 2 ? "grid-cols-2" : "grid-cols-3"} grid gap-1 rounded-2xl bg-black/25 p-1`}>
                            {TABS.map(({ key, label, sub }) => (
                                <button key={key} role="tab" aria-selected={mode === key} onClick={() => switchMode(key)}
                                    className={`min-h-[52px] rounded-xl px-1 text-center transition-all duration-200 ${mode === key ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-900/40" : "text-slate-300 hover:bg-white/10"}`}>
                                    <div className="text-sm font-bold">{label}</div>
                                    <div className={`text-[10px] ${mode === key ? "text-blue-100" : "text-slate-400"}`}>{sub}</div>
                                </button>
                            ))}
                        </div>

                        <div className="mb-5 mt-6 text-center">
                            <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
                            <p className="mt-1 text-sm text-slate-400">{mode === "code" ? "Pastors sign in with their unique code" : mode === "register" ? "Join the church family in a minute" : "Use the email and password you registered with"}</p>
                        </div>

                    <div className="flex-1 flex flex-col justify-center md:overflow-y-auto py-2">
                        <SwitchTransition mode="out-in">
                        <CSSTransition key={mode} nodeRef={transitionRef} timeout={300} classNames="fade" unmountOnExit>
                            <form ref={transitionRef} onSubmit={handleSubmit} className="flex flex-col space-y-3" noValidate>

                                    {/* Code */}
                                    {mode === "code" && (
                                        <>
                                            <input
                                                ref={inputRef} type="text" placeholder="Enter unique identifier"
                                                value={code}
                                                onChange={(e) => { setCode(e.target.value.toUpperCase()); if (errors.code) setErrors((p) => ({ ...p, code: "" })); }}
                                                onBlur={() => handleBlur("code")}
                                                className={`${inputBase} text-center tracking-widest text-base font-mono ${errors.code ? "border-red-500" : code ? "border-yellow-500/50" : ""}`}
                                            />
                                            {errors.code && <p className="text-red-400 text-xs text-center" role="alert">{errors.code}</p>}
                                            {pastorPasswordRequired && (
                                                <>
                                                    <input type="password" placeholder="Password" autoComplete="current-password" value={pastorPassword}
                                                           onChange={(e) => { setPastorPassword(e.target.value); if (errors.pastorPassword) setErrors((p) => ({ ...p, pastorPassword: "" })); }}
                                                           className={`${inputBase} ${errors.pastorPassword ? "border-red-500" : ""}`} />
                                                    {errors.pastorPassword && <p className="text-red-400 text-xs text-center" role="alert">{errors.pastorPassword}</p>}
                                                    <div className="text-right -mt-1">
                                                        <a href="/forgot-password" className="text-xs text-white/60 hover:text-white underline underline-offset-2">Forgot password?</a>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Email login */}
                                    {mode === "email" && (
                                        <>
                                            <div>
                                                <input type="email" name="email" placeholder="Email Address" value={emailLogin.email} onChange={handleEmailLoginChange} onBlur={() => handleBlur("emailLoginEmail")}
                                                       className={`${inputBase} ${errors.emailLoginEmail ? "border-red-500" : ""}`} />
                                                {errors.emailLoginEmail && <p className="text-red-400 text-xs mt-0.5" role="alert">{errors.emailLoginEmail}</p>}
                                            </div>
                                            <div>
                                                <input type="password" name="password" placeholder="Password" value={emailLogin.password} onChange={handleEmailLoginChange} onBlur={() => handleBlur("emailLoginPassword")}
                                                       className={`${inputBase} ${errors.emailLoginPassword ? "border-red-500" : ""}`} />
                                                {errors.emailLoginPassword && <p className="text-red-400 text-xs mt-0.5" role="alert">{errors.emailLoginPassword}</p>}
                                            </div>
                                            <div className="text-right -mt-1">
                                                <a href={`/forgot-password${emailLogin.email ? `?email=${encodeURIComponent(emailLogin.email)}` : ""}`}
                                                   className="text-xs text-white/60 hover:text-white underline underline-offset-2">
                                                    Forgot password?
                                                </a>
                                            </div>
                                        </>
                                    )}

                                    {/* Register */}
                                    {mode === "register" && (
                                        <>
                                            {showPartnerPrompt && registrationResult && (
                                                <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 text-center">
                                                    <p className="text-emerald-300 text-sm font-semibold mb-2">✓ Account created!</p>
                                                    <p className="text-white/80 text-xs mb-1">Congratulations! Your account has been created.</p>
                                                    {registrationResult.user?.zone && (
                                                        <div className="text-[10px] text-white/60 space-y-0.5 mb-3">
                                                            <p>Assigned Zone: <span className="text-white/80">{registrationResult.user.zone.name || registrationResult.user.zone.code}</span></p>
                                                            <p>Assigned Pastor: <span className="text-white/80">{registrationResult.user.zone?.pastor_name || '—'}</span></p>
                                                            <p>Assigned Region: <span className="text-white/80">{registrationResult.user.zone?.region?.name || '—'}</span></p>
                                                        </div>
                                                    )}
                                                    <p className="text-white/70 text-xs mb-3">Would you like to become a Partner?</p>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => { try { sessionStorage.setItem("hm-open-partnership", "1"); } catch { /* ignore */ } handleLoginResponse(registrationResult); }} className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-[#1e3a5f] font-bold rounded-lg text-xs">Partner Now</button>
                                                        <button type="button" onClick={() => { handleLoginResponse(registrationResult); }} className="flex-1 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs font-medium">Maybe Later</button>
                                                    </div>
                                                </div>
                                            )}
                                            {!showPartnerPrompt && showRegisterSuccess && (
                                                <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-3 text-center">
                                                    <p className="text-emerald-300 text-sm font-semibold">✓ Account created! Redirecting…</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} onBlur={() => handleBlur("firstName")}
                                                           className={`${inputBase} ${getFieldClass("firstName", formData.firstName)}`} />
                                                    {errors.firstName && <p className="text-red-400 text-xs mt-0.5">{errors.firstName}</p>}
                                                </div>
                                                <div>
                                                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} onBlur={() => handleBlur("lastName")}
                                                           className={`${inputBase} ${getFieldClass("lastName", formData.lastName)}`} />
                                                    {errors.lastName && <p className="text-red-400 text-xs mt-0.5">{errors.lastName}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur("email")}
                                                       className={`${inputBase} ${getFieldClass("email", formData.email)}`} />
                                                {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} onBlur={() => handleBlur("phoneNumber")}
                                                       className={`${inputBase} ${getFieldClass("phoneNumber", formData.phoneNumber)}`} />
                                                {errors.phoneNumber && <p className="text-red-400 text-xs mt-0.5">{errors.phoneNumber}</p>}
                                            </div>
                                            <div>
                                                <input type="text" name="physicalAddress" placeholder="Physical Address" value={formData.physicalAddress} onChange={handleInputChange} onBlur={() => handleBlur("physicalAddress")}
                                                       className={`${inputBase} ${getFieldClass("physicalAddress", formData.physicalAddress)}`} />
                                                {errors.physicalAddress && <p className="text-red-400 text-xs mt-0.5">{errors.physicalAddress}</p>}
                                            </div>
                                            <div>
                                                <input type="text" name="zoneCode" placeholder="zone code  xxxx or Rxxxx" value={formData.zoneCode}
                                                       onChange={(e) => {
                                                           const v = e.target.value.toUpperCase();
                                                           const cleaned = /^R\d{0,4}$/.test(v) ? v : (/^\d{0,4}$/.test(v) ? v : formData.zoneCode);
                                                           setFormData((p) => ({ ...p, zoneCode: cleaned }));
                                                           if (errors.zoneCode) setErrors((p) => ({ ...p, zoneCode: "" }));
                                                       }}
onBlur={() => {
                                                            const v = formData.zoneCode;
                                                            // Normalize: add R prefix if zone code is 4 digits without it
                                                            if (/^\d{4}$/.test(v)) {
                                                                setFormData((p) => ({ ...p, zoneCode: "R" + v }));
                                                            }
                                                            handleBlur("zoneCode");
                                                        }}
                                                       className={`${inputBase} ${getFieldClass("zoneCode", formData.zoneCode)} tracking-wider uppercase`} />
                                                {zoneChecking && <span className="text-xs text-white/40 mt-0.5">Checking…</span>}
                                                {zoneLookup === "invalid" && <span className="text-xs text-red-400 mt-0.5">Invalid Zone Code. Please contact your Zone Pastor or Administrator for assistance.</span>}
                                                {zoneLookup && typeof zoneLookup === "object" && (
                                                    <span className="text-xs text-emerald-400 mt-0.5">
                                                         ✓ {zoneLookup.name}
                                                         {zoneLookup.pastor ? ` · Pastor: ${zoneLookup.pastor.title ?? ""} ${zoneLookup.pastor.name}` : " · No pastor assigned"}
                                                    </span>
                                                )}
                                                {errors.zoneCode && <p className="text-red-400 text-xs mt-0.5">{errors.zoneCode}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} onBlur={() => handleBlur("password")}
                                                           className={`${inputBase} ${getFieldClass("password", formData.password)}`} />
                                                    {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
                                                </div>
                                                <div>
                                                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} onBlur={() => handleBlur("confirmPassword")}
                                                           className={`${inputBase} ${getFieldClass("confirmPassword", formData.confirmPassword)}`} />
                                                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-0.5">{errors.confirmPassword}</p>}
                                                </div>
                                            </div>

                                            {/* Terms */}
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="acceptTerms" className="relative flex items-center cursor-pointer group">
                                                    <input id="acceptTerms" type="checkbox" checked={acceptTerms}
                                                           onChange={(e) => { setAcceptTerms(e.target.checked); if (errors.acceptTerms) setErrors((p) => ({ ...p, acceptTerms: "" })); }}
                                                           className="peer sr-only" />
                                                    <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center
                                                        ${acceptTerms ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-blue-600" : "bg-white/10 border-white/30 group-hover:border-white/50"}`}>
                                                        {acceptTerms && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </label>
                                                <span className="text-sm text-white/70">
                                                    I accept the <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">Terms and Conditions</a>
                                                </span>
                                            </div>
                                            {errors.acceptTerms && <p className="text-red-400 text-xs" role="alert">{errors.acceptTerms}</p>}
                                        </>
                                    )}

                                    {/* Submit error */}
                                    {errors.submit && (
                                        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-2">
                                            <p className="text-red-300 text-xs text-center" role="alert">{errors.submit}</p>
                                            {errors.appLink && (
                                                <p className="text-center mt-1"><a href={errors.appLink} className="text-amber-300 text-xs font-semibold underline">Download the app →</a></p>
                                            )}
                                            {errors.staffLink && (
                                                <p className="text-center mt-1"><a href={errors.staffLink} className="text-amber-300 text-xs font-semibold underline">Go to the staff portal →</a></p>
                                            )}
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || showRegisterSuccess || showPartnerPrompt}
                                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm tracking-wide shadow-lg shadow-blue-900/40 md:hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                                    >
                                        {isLoading && <LoadingSpinner />}
                                        {getSubmitText()}
                                    </button>
                                </form>
                            </CSSTransition>
                        </SwitchTransition>
                    </div>


                    </div>

                    {!IS_APP && (<div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md" aria-label="Staff portals">
                        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Staff portals</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ href: "/admin/login", label: "Master" }, { href: "/finance/login", label: "Finance" }, { href: "/events/login", label: "Events" }].map(({ href, label }) => (
                                <a key={href} href={href} className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 text-xs font-semibold text-slate-200 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{label}</a>
                            ))}
                        </div>
                    </div>)}

                    <p className="mt-5 text-center text-[11px] text-slate-500">Need help? <span className="text-slate-300">support@heartfeltonline.org</span><br className="sm:hidden" /><span className="hidden sm:inline"> · </span>© 2026 Heartfelt International Ministries</p>
                </div>
            </section>
        </div>
    );
}

