import React, { useState, useRef, useCallback, useEffect } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import AnimatedBackground from "./AnimatedBackground";
import "./authAnimations.css";
import api from "../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePassword = (v) => v.length >= 6;

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthPage({ onLoginSuccess = () => {} }) {
    const [mode, setMode]                   = useState("code");
    const [isLoading, setIsLoading]         = useState(false);
    const [errors, setErrors]               = useState({});
    const [touched, setTouched]             = useState({});
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
    const [registrationResult, setRegistrationResult] = useState(null);

    const [code, setCode]               = useState("");
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
            if (!formData.password || !validatePassword(formData.password)) e.password = "Password must be at least 6 characters";
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
                const formData = new URLSearchParams();
                formData.append('unique_code', code.trim());
                const { data } = await api.post("/login/code", formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                if (data.success) {
                    handleLoginResponse(data);
                } else {
                    setErrors({ submit: data.message || "Invalid code. Please try again." });
                }

            } else if (mode === "email") {
                const formData = new URLSearchParams();
                formData.append('email', emailLogin.email);
                formData.append('password', emailLogin.password);
                const { data } = await api.post("/login", formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                if (data.success) {
                    handleLoginResponse(data);
                } else {
                    setErrors({ submit: data.message || "Invalid credentials." });
                }

            } else if (mode === "register") {
                const payload = new URLSearchParams();
                payload.append('name', `${formData.firstName} ${formData.lastName}`);
                payload.append('email', formData.email);
                payload.append('password', formData.password);
                payload.append('password_confirmation', formData.confirmPassword);
                payload.append('phone', formData.phoneNumber);
                payload.append('address', formData.physicalAddress);
                payload.append('zone_code', formData.zoneCode);
                const { data } = await api.post("/register", payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (data.success) {
                    setShowRegisterSuccess(true);
                    setTimeout(() => handleLoginResponse(data), 1500);
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
            } else if (err.response?.status === 401) {
                setErrors({ submit: mode === "code" ? "Invalid code. Please check and try again." : "Invalid email or password." });
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
    const inputBase = "px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300";

    return (
        <div className="relative flex justify-center items-center min-h-screen font-sans bg-slate-900 overflow-hidden" role="main" aria-label="Authentication Page">
            <AnimatedBackground />

            <div className="relative w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl">

                {/* ── Left panel ────────────────────────────────────────────── */}
                <div className="w-2/3 p-4 flex flex-col justify-between backdrop-blur-md bg-white/10 border border-white/10 rounded-l-2xl shadow-2xl relative overflow-hidden h-[570px] md:h-[530px] transition-all duration-500">

                    {/* Header */}
                    <div className="text-center mb-3">
                        <img src="/images/logo.webp" alt="HIM Logo" className="h-16 mx-auto mb-2 object-contain animate-bounce" />
                        <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent tracking-wide"
                            style={{ fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif' }}>
                            Heartfelt International Ministry
                        </h1>
                        {mode !== "register" && (
                            <p className="font-bold text-base md:text-lg tracking-wide text-white/80 pt-4"
                               style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                                Welcome Back
                            </p>
                        )}
                        {mode === "register" && (
                            <p className="text-sm text-white/60 pt-2">Create your member account</p>
                        )}
                    </div>

                    {/* Forms */}
                    <div className="flex-1 flex flex-col justify-center overflow-y-auto">
                        <SwitchTransition mode="out-in">
                        <CSSTransition key={mode} nodeRef={transitionRef} timeout={300} classNames="fade" unmountOnExit>
                            <form ref={transitionRef} onSubmit={handleSubmit} className="flex flex-col space-y-2 px-1" noValidate>

                                    {/* Code */}
                                    {mode === "code" && (
                                        <>
                                            <p className="text-xs text-white/50 text-center">Pastors — Enter your unique code</p>
                                            <input
                                                ref={inputRef} type="text" placeholder="Enter unique identifier"
                                                value={code}
                                                onChange={(e) => { setCode(e.target.value.toUpperCase()); if (errors.code) setErrors((p) => ({ ...p, code: "" })); }}
                                                onBlur={() => handleBlur("code")}
                                                className={`${inputBase} text-center tracking-widest text-base font-mono ${errors.code ? "border-red-500" : code ? "border-yellow-500/50" : ""}`}
                                            />
                                            {errors.code && <p className="text-red-400 text-xs text-center" role="alert">{errors.code}</p>}
                                        </>
                                    )}

                                    {/* Email login */}
                                    {mode === "email" && (
                                        <>
                                            <p className="text-xs text-white/50 text-center">Members &amp; Partners — Sign in with email</p>
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
                                        </>
                                    )}

                                    {/* Register */}
                                    {mode === "register" && (
                                        <>
                                            {showRegisterSuccess && (
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
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || showRegisterSuccess}
                                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold py-1.5 px-3 rounded shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                                    >
                                        {isLoading && <LoadingSpinner />}
                                        {getSubmitText()}
                                    </button>
                                </form>
                            </CSSTransition>
                        </SwitchTransition>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-white/40 text-xs pt-2 border-t border-white/5">
                        <p className="text-[10px]">Email: <span className="text-white/60">support@heartfeltonline.org</span></p>
                        <p className="text-[10px]">© 2026 Heartfelt International Ministries — All rights reserved</p>
                    </div>
                </div>

                {/* ── Right panel ───────────────────────────────────────────── */}
                <div className="w-1/3 p-4 md:p-8 flex flex-col justify-center items-center backdrop-blur-md bg-white/10 border border-white/10 rounded-r-2xl shadow-2xl" role="navigation">
                    <h3 className="font-bold text-base md:text-lg mb-4 tracking-wide text-white/80">Quick Access</h3>
                    <div className="space-y-2 md:space-y-3 w-full">
                        {[
                            { key: "code",     label: "Login With Code",  sub: "Pastors" },
                            { key: "email",    label: "Login With Email", sub: "Members & Partners" },
                            { key: "register", label: "Register",         sub: "New Members" },
                        ].map(({ key, label, sub }) => (
                            <button
                                key={key}
                                onClick={() => { setMode(key); setErrors({}); setTouched({}); }}
                                aria-pressed={mode === key}
                                className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg
                                    ${mode === key
                                    ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-blue-600/30"
                                    : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"}`}
                            >
                                <div>{label}</div>
                                <div className="text-[10px] opacity-60 font-normal mt-0.5">{sub}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        {mode === "code"     && <p className="text-white/30 text-[10px] leading-relaxed">Your unique code was<br />provided by admin</p>}
                        {mode === "email"    && <p className="text-white/30 text-[10px] leading-relaxed">Use your registered<br />email and password</p>}
                        {mode === "register" && <p className="text-white/30 text-[10px] leading-relaxed">After registering you can<br />request to join a department</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
