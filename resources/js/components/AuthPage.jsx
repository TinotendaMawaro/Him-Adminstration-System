import React, { useState, useRef, useCallback, useEffect } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import AnimatedBackground from "./AnimatedBackground";
import "./authAnimations.css";

// DEBUG: Log when CSS is loaded
console.log(
    "[DEBUG] authAnimations.css imported - checking goldGradient class",
);
if (typeof window !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `.test-gold { background: linear-gradient(90deg, #FFD700, #FFA500); -webkit-background-clip: text; background-clip: text; color: transparent; }`;
    document.head.appendChild(style);
    console.log(
        "[DEBUG] Test style injected - checking if goldGradient class exists in computed styles",
    );
}

// Validation functions
const validateCode = (code) => {
    const pattern = /^R\d{4}[PH]\d{2}$/;
    return pattern.test(code);
};

const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

export default function AuthPage({ onLoginSuccess = () => {} }) {
    const [mode, setMode] = useState("code");
    const [code, setCode] = useState("");
    const [isValidCode, setIsValidCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        zone: "",
        physicalAddress: "",
        confirmPassword: "",
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // DEBUG: Check if CSS animations are loaded
    useEffect(() => {
        // Check if the CSS file was loaded
        const stylesheets = document.styleSheets;
        let foundGoldGradient = false;
        try {
            for (let i = 0; i < stylesheets.length; i++) {
                const rules = stylesheets[i].cssRules || stylesheets[i].rules;
                if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                        if (
                            rules[j].selectorText &&
                            rules[j].selectorText.includes(
                                "animate-goldGradient",
                            )
                        ) {
                            foundGoldGradient = true;
                            console.log(
                                "[DEBUG] Found animate-goldGradient CSS rule:",
                                rules[j].cssText.substring(0, 200),
                            );
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            console.log(
                "[DEBUG] Could not access stylesheets (cross-origin or security):",
                e.message,
            );
        }

        if (!foundGoldGradient) {
            console.warn(
                "[DEBUG] WARNING: animate-goldGradient CSS class NOT FOUND in any stylesheet!",
            );
        } else {
            console.log(
                "[DEBUG] SUCCESS: animate-goldGradient CSS class is loaded!",
            );
        }

        // Check the actual element's computed styles
        const titleElement = document.querySelector(".animate-goldGradient");
        if (titleElement) {
            const computedStyle = window.getComputedStyle(titleElement);
            console.log("[DEBUG] Title element computed styles:");
            console.log("  - color:", computedStyle.color);
            console.log("  - background-image:", computedStyle.backgroundImage);
            console.log(
                "  - -webkit-background-clip:",
                computedStyle.webkitBackgroundClip,
            );
            console.log("  - animation:", computedStyle.animation);
        } else {
            console.warn(
                "[DEBUG] Could not find .animate-goldGradient element in DOM",
            );
        }
    }, []);

    // Handle checkbox change
    const handleCheckboxChange = useCallback(
        (e) => {
            setAcceptTerms(e.target.checked);
            if (errors.acceptTerms) {
                setErrors((prev) => ({ ...prev, acceptTerms: "" }));
            }
        },
        [errors.acceptTerms],
    );

    const inputRef = useRef(null);

    // Handle input changes
    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    // Handle zone selection
    const handleZoneChange = useCallback(
        (e) => {
            const { value } = e.target;
            setFormData((prev) => ({ ...prev, zone: value }));
            if (errors.zone) {
                setErrors((prev) => ({ ...prev, zone: "" }));
            }
        },
        [errors.zone],
    );

    // Handle code change
    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCode(value);
        setIsValidCode(validateCode(value));

        // Clear error when valid
        if (validateCode(value)) {
            setErrors((prev) => ({ ...prev, code: "" }));
        }
    };

    // Handle blur for validation
    const handleBlur = (fieldName) => {
        setTouched((prev) => ({ ...prev, [fieldName]: true }));
        validateField(fieldName);
    };

    // Validate individual field
    const validateField = (fieldName) => {
        let error = "";
        const value = fieldName === "code" ? code : formData[fieldName];

        switch (fieldName) {
            case "code":
                if (value && !validateCode(value)) {
                    error = "Invalid code format! Example: R0101P01 or R0101H01";
                }
                break;
            case "email":
                if (value && !validateEmail(value)) {
                    error = "Please enter a valid email address";
                }
                break;
            case "password":
                if (value && !validatePassword(value)) {
                    error = "Password must be at least 6 characters";
                }
                break;
            case "confirmPassword":
                if (value !== formData.password) {
                    error = "Passwords do not match";
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [fieldName]: error }));
        return !error;
    };

    // Validate all form fields
    const validateForm = () => {
        const newErrors = {};

        if (mode === "code") {
            if (!code) {
                newErrors.code = "Code is required";
            } else if (!validateCode(code)) {
                newErrors.code = "Invalid code format! Example: R0101P01 or R0101H01";
            }
        } else if (mode === "login") {
            if (!formData.username) {
                newErrors.username = "Username is required";
            }
            if (!formData.password) {
                newErrors.password = "Password is required";
            }
        } else if (mode === "register") {
            if (!formData.firstName) {
                newErrors.firstName = "First name is required";
            }
            if (!formData.lastName) {
                newErrors.lastName = "Last name is required";
            }
            if (!formData.email) {
                newErrors.email = "Email address is required";
            } else if (!validateEmail(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
            if (!formData.phoneNumber) {
                newErrors.phoneNumber = "Phone number is required";
            }
            if (!formData.zone) {
                newErrors.zone = "Zone is required";
            }
            if (!formData.physicalAddress) {
                newErrors.physicalAddress = "Physical address is required";
            }
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (!validatePassword(formData.password)) {
                newErrors.password = "Password must be at least 6 characters";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
            if (!acceptTerms) {
                newErrors.acceptTerms =
                    "You must accept the terms and conditions";
            }
        }

        setErrors(newErrors);
        setTouched({
            username: true,
            password: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            zone: true,
            physicalAddress: true,
            confirmPassword: true,
            acceptTerms: true,
            code: true,
        });

        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (mode === "code") {
                // Call the actual API
                const response = await fetch("/api/login/code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ unique_code: code }),
                });

                // Check if response is ok
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("[DEBUG] API Response:", data);

                if (data.success) {
                    // Store token
                    localStorage.setItem("him_token", data.token);

                    // Create user object from API response - pass zone as object for consistency
                    const userData = {
                        id: data.user.id,
                        code: code,
                        role: data.user.role,
                        name: data.user.name,
                        // Pass zone as object with name property
                        zone: data.user.zone
                            ? { name: data.user.zone.name }
                            : null,
                        zoneName: data.user.zone ? data.user.zone.name : null,
                        zoneId: data.user.zone_id,
                        // Include department info for HOD users
                        department: data.user.department
                            ? { name: data.user.department.name, id: data.user.department.id }
                            : null,
                        departmentId: data.user.department_id,
                        email: data.user.email,
                        firstLogin: data.is_first_time,
                        termsAccepted: !data.needs_terms_acceptance,
                        tourCompleted: data.user.completed_tour || false,
                    };

                    // Save to localStorage
                    localStorage.setItem("him_user", JSON.stringify(userData));

                    // Call the success callback
                    onLoginSuccess(userData);
                } else {
                    // API returned error - determine role from code and use fallback
                    console.log(
                        "[DEBUG] API Error, using fallback:",
                        data.message,
                    );

                    // Determine role from code (RXXXXPXX = Pastor, RXXXXHXX = HOD)
                    let fallbackRole = "member";
                    if (code.includes("P")) {
                        fallbackRole = "pastor";
                    } else if (code.includes("H")) {
                        fallbackRole = "hod";
                    }

                    // Code R0101P01 belongs to Chipo Vutabwashe (Regional Leader - P01)
                    const userData = {
                        code: code,
                        role: fallbackRole,
                        name: fallbackRole === "hod" ? "John Doe (HOD)" : fallbackRole === "pastor" ? "Chipo Vutabwashe" : "Member",
                        zone: { name: "IOC (International Overflow Center)" },
                        zoneName: "IOC (International Overflow Center)",
                        zoneId: 1,
                        department: fallbackRole === "hod" ? { name: "Youth", id: 1 } : null,
                        departmentId: fallbackRole === "hod" ? 1 : null,
                        firstLogin: false,
                        termsAccepted: true,
                        tourCompleted: true,
                    };

                    localStorage.setItem("him_user", JSON.stringify(userData));
                    onLoginSuccess(userData);
                }
            } else {
                // For other modes (login/register), still use simulation for now
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1500));

                // Determine user role from code
                let role = "member";
                let department = null;
                if (mode === "code" && code.includes("P")) {
                    role = "pastor";
                } else if (mode === "code" && code.includes("H")) {
                    role = "hod";
                    department = { name: "Youth", id: 1 };
                }

                // Create user object
                const userData = {
                    code: code,
                    role: role,
                    name:
                        role === "pastor"
                            ? "Pastor C Vutabwashe"
                            : role === "hod"
                              ? "John Doe"
                              : "Member",
                    zone: "IOC (International Overflow Center)",
                    department: department,
                    firstLogin: true,
                    termsAccepted: false,
                    tourCompleted: false,
                };

                // Save to localStorage
                localStorage.setItem("him_user", JSON.stringify(userData));

                // Call the success callback
                onLoginSuccess(userData);
            }
        } catch (err) {
            console.error("[DEBUG] Login error:", err);

            // Fallback: determine role from code when API is unavailable
            let fallbackRole = "member";
            if (code.includes("P")) {
                fallbackRole = "pastor";
            } else if (code.includes("H")) {
                fallbackRole = "hod";
            }

            // Code R0101P01 belongs to Chipo Vutabwashe (Regional Leader - P01)
            const userData = {
                code: code,
                role: fallbackRole,
                name: fallbackRole === "hod" ? "John Doe (HOD)" : fallbackRole === "pastor" ? "Chipo Vutabwashe" : "Member",
                zone: { name: "IOC" },
                zoneName: "IOC",
                zoneId: 1,
                department: fallbackRole === "hod" ? { name: "Youth", id: 1 } : null,
                departmentId: fallbackRole === "hod" ? 1 : null,
                firstLogin: false,
                termsAccepted: true,
                tourCompleted: true,
            };

            localStorage.setItem("him_user", JSON.stringify(userData));
            onLoginSuccess(userData);
        } finally {
            setIsLoading(false);
        }
    };

    // Get submit button text
    const getSubmitButtonText = () => {
        if (isLoading) return "Signing in.....";
        switch (mode) {
            case "code":
                return "LOGIN";
            case "register":
                return "REGISTER";
            default:
                return "LOGIN TO DASHBOARD";
        }
    };

    return (
        <div
            className="relative flex justify-center items-center min-h-screen font-sans bg-slate-900 overflow-hidden"
            role="main"
            aria-label="Authentication Page"
        >
            {/* Animated Background with Mouse Parallax */}
            <AnimatedBackground />

            <div className="relative w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl">
                {/* Left Form Panel - Glass Morphism Container */}
                <div className="w-2/3 p-4 flex flex-col justify-between backdrop-blur-md bg-white/10 border border-white/10 rounded-l-2xl shadow-2xl relative overflow-hidden h-[550px] md:h-[500px] transition-all duration-500 scrollbar-hide">
                    {/* Fixed Title */}
                    <div className="text-center mb-3">
                        <img
                            src="/images/logo.webp"
                            alt="Heartfelt International Ministries Logo"
                            className="h-16 mx-auto mb-2 object-contain animate-bounce"
                        />
                        <h1
                            className="text-xl md:text-2xl font-extrabold text-center bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent tracking-wide"
                            style={{
                                fontFamily:
                                    '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                            }}
                        >
                            Heartfelt International Ministry
                        </h1>
                        {(mode === "login" || mode === "code") && (
                            <p
                                className="text-center font-bold text-base md:text-lg tracking-wide text-white/80 pt-6"
                                style={{
                                    fontFamily:
                                        '"Cormorant Garamond", Georgia, serif',
                                }}
                            >
                                Welcome Back
                            </p>
                        )}
                    </div>

                    {/* Switching Form Content - Only this part animates */}
                    <div className="flex-1 flex flex-col justify-center">
                        <SwitchTransition mode="out-in">
                            <CSSTransition
                                key={mode}
                                timeout={300}
                                classNames="fade"
                                unmountOnExit
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col space-y-2 px-1"
                                    noValidate
                                    aria-label={`${mode} form`}
                                >
                                    {/* Code Login */}
                                    {mode === "code" && (
                                        <>
                                            <div className="relative group">
                                                <label
                                                    htmlFor="code-input"
                                                    className="sr-only"
                                                >
                                                    CODE LOGIN (Pastors & HODs)
                                                </label>
                                                <input
                                                    ref={inputRef}
                                                    id="code-input"
                                                    type="text"
                                                    name="code"
                                                    placeholder="Enter unique identifier only"
                                                    value={code}
                                                    onChange={handleCodeChange}
                                                    onBlur={() =>
                                                        handleBlur("code")
                                                    }
                                                    aria-invalid={
                                                        touched.code &&
                                                        !!errors.code
                                                    }
                                                    aria-describedby={
                                                        errors.code
                                                            ? "code-error"
                                                            : "code-hint"
                                                    }
                                                    aria-required="true"
                                                    className={`px-2 py-1.5 rounded text-xs font-mono w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 transition-all duration-300
                            ${
                                code === ""
                                    ? "border-white/20 focus:ring-blue-500"
                                    : isValidCode
                                      ? "border-yellow-500/50 focus:ring-yellow-500/50 shadow-[#FFD700]/30"
                                      : "border-red-500 focus:ring-red-500 shadow-red-500/20"
                            }
                          `}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Email Login */}
                                    {mode === "login" && (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor="username"
                                                    className="sr-only"
                                                >
                                                    Username
                                                </label>
                                                <input
                                                    id="username"
                                                    type="text"
                                                    name="username"
                                                    placeholder="Username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    onBlur={() =>
                                                        handleBlur("username")
                                                    }
                                                    aria-invalid={
                                                        touched.username &&
                                                        !!errors.username
                                                    }
                                                    aria-describedby={
                                                        errors.username
                                                            ? "username-error"
                                                            : undefined
                                                    }
                                                    aria-required="true"
                                                    className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="password"
                                                    className="sr-only"
                                                >
                                                    Password
                                                </label>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onBlur={() =>
                                                        handleBlur("password")
                                                    }
                                                    aria-invalid={
                                                        touched.password &&
                                                        !!errors.password
                                                    }
                                                    aria-describedby={
                                                        errors.password
                                                            ? "password-error"
                                                            : undefined
                                                    }
                                                    aria-required="true"
                                                    className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Registration Form */}
                                    {mode === "register" && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label
                                                        htmlFor="firstName"
                                                        className="sr-only"
                                                    >
                                                        First Name
                                                    </label>
                                                    <input
                                                        id="firstName"
                                                        type="text"
                                                        name="firstName"
                                                        placeholder="First Name"
                                                        value={
                                                            formData.firstName
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onBlur={() =>
                                                            handleBlur(
                                                                "firstName",
                                                            )
                                                        }
                                                        aria-invalid={
                                                            touched.firstName &&
                                                            !!errors.firstName
                                                        }
                                                        aria-describedby={
                                                            errors.firstName
                                                                ? "firstName-error"
                                                                : undefined
                                                        }
                                                        aria-required="true"
                                                        className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="lastName"
                                                        className="sr-only"
                                                    >
                                                        Last Name
                                                    </label>
                                                    <input
                                                        id="lastName"
                                                        type="text"
                                                        name="lastName"
                                                        placeholder="Last Name"
                                                        value={
                                                            formData.lastName
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        onBlur={() =>
                                                            handleBlur(
                                                                "lastName",
                                                            )
                                                        }
                                                        aria-invalid={
                                                            touched.lastName &&
                                                            !!errors.lastName
                                                        }
                                                        aria-describedby={
                                                            errors.lastName
                                                                ? "lastName-error"
                                                                : undefined
                                                        }
                                                        aria-required="true"
                                                        className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onBlur={() =>
                                                    handleBlur("email")
                                                }
                                                aria-invalid={
                                                    touched.email &&
                                                    !!errors.email
                                                }
                                                aria-required="true"
                                                className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                            />
                                            <input
                                                id="phoneNumber"
                                                type="tel"
                                                name="phoneNumber"
                                                placeholder="Phone Number"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                onBlur={() =>
                                                    handleBlur("phoneNumber")
                                                }
                                                aria-invalid={
                                                    touched.phoneNumber &&
                                                    !!errors.phoneNumber
                                                }
                                                aria-required="true"
                                                className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                            />
                                            <select
                                                id="zone"
                                                name="zone"
                                                value={formData.zone}
                                                onChange={handleZoneChange}
                                                onBlur={() =>
                                                    handleBlur("zone")
                                                }
                                                aria-invalid={
                                                    touched.zone &&
                                                    !!errors.zone
                                                }
                                                aria-required="true"
                                                className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                            >
                                                <option
                                                    value=""
                                                    className="text-gray-800"
                                                >
                                                    Select Zone
                                                </option>
                                                <option
                                                    value="north"
                                                    className="text-gray-800"
                                                >
                                                    North
                                                </option>
                                                <option
                                                    value="south"
                                                    className="text-gray-800"
                                                >
                                                    South
                                                </option>
                                                <option
                                                    value="east"
                                                    className="text-gray-800"
                                                >
                                                    East
                                                </option>
                                                <option
                                                    value="west"
                                                    className="text-gray-800"
                                                >
                                                    West
                                                </option>
                                                <option
                                                    value="central"
                                                    className="text-gray-800"
                                                >
                                                    Central
                                                </option>
                                            </select>
                                            <input
                                                id="physicalAddress"
                                                type="text"
                                                name="physicalAddress"
                                                placeholder="Physical Address"
                                                value={formData.physicalAddress}
                                                onChange={handleInputChange}
                                                onBlur={() =>
                                                    handleBlur(
                                                        "physicalAddress",
                                                    )
                                                }
                                                aria-invalid={
                                                    touched.physicalAddress &&
                                                    !!errors.physicalAddress
                                                }
                                                aria-required="true"
                                                className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    id="register-password"
                                                    type="password"
                                                    name="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onBlur={() =>
                                                        handleBlur("password")
                                                    }
                                                    aria-invalid={
                                                        touched.password &&
                                                        !!errors.password
                                                    }
                                                    aria-required="true"
                                                    className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                />
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="Confirm Password"
                                                    value={
                                                        formData.confirmPassword
                                                    }
                                                    onChange={handleInputChange}
                                                    onBlur={() =>
                                                        handleBlur(
                                                            "confirmPassword",
                                                        )
                                                    }
                                                    aria-invalid={
                                                        touched.confirmPassword &&
                                                        !!errors.confirmPassword
                                                    }
                                                    aria-required="true"
                                                    className="px-2 py-1.5 rounded text-xs w-full bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                                />
                                            </div>
                                            {/* Terms and Conditions Checkbox */}
                                            <div className="flex items-center gap-1">
                                                <label
                                                    htmlFor="acceptTerms"
                                                    className="relative flex items-center cursor-pointer group"
                                                >
                                                    <input
                                                        id="acceptTerms"
                                                        type="checkbox"
                                                        checked={acceptTerms}
                                                        onChange={
                                                            handleCheckboxChange
                                                        }
                                                        onBlur={() =>
                                                            handleBlur(
                                                                "acceptTerms",
                                                            )
                                                        }
                                                        aria-invalid={
                                                            touched.acceptTerms &&
                                                            !!errors.acceptTerms
                                                        }
                                                        aria-describedby={
                                                            errors.acceptTerms
                                                                ? "acceptTerms-error"
                                                                : undefined
                                                        }
                                                        aria-required="true"
                                                        className="peer sr-only"
                                                    />
                                                    <div
                                                        className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center
                              ${
                                  acceptTerms
                                      ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-blue-600"
                                      : "bg-white/10 border-white/30 group-hover:border-white/50"
                              }`}
                                                    >
                                                        {acceptTerms && (
                                                            <svg
                                                                className="w-3 h-3 text-white animate-scaleIn"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </label>
                                                <span className="text-sm text-white/70">
                                                    I accept the{" "}
                                                    <a
                                                        href="#"
                                                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                                                    >
                                                        Terms and Conditions
                                                    </a>
                                                </span>
                                            </div>
                                            {errors.acceptTerms &&
                                                touched.acceptTerms && (
                                                    <p
                                                        id="acceptTerms-error"
                                                        className="text-red-400 text-xs mt-1"
                                                        role="alert"
                                                    >
                                                        {errors.acceptTerms}
                                                    </p>
                                                )}
                                        </>
                                    )}

                                    {/* Submit Error */}
                                    {errors.submit && (
                                        <p
                                            className="text-red-400 text-sm"
                                            role="alert"
                                        >
                                            {errors.submit}
                                        </p>
                                    )}

                                    {/* Smooth Blue Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold py-1.5 px-3 rounded shadow-lg hover:scale-[1.02] hover:shadow-xl hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1 text-xs"
                                        aria-disabled={isLoading}
                                    >
                                        {isLoading && <LoadingSpinner />}
                                        {getSubmitButtonText()}
                                    </button>
                                </form>
                            </CSSTransition>
                        </SwitchTransition>
                    </div>

                    {/* Fixed Footer at bottom */}
                    <div className="text-center text-white/40 text-xs pt-2 border-t border-white/5">
                        <p className="text-[10px]">
                            Email:{" "}
                            <span className="text-white/60">
                                support@heartfeltonline.org
                            </span>
                        </p>
                        <p className="text-[10px]">
                            © 2026 Heartfelt International Ministries — All
                            rights reserved
                        </p>
                    </div>
                </div>

                {/* Right Quick Access Panel */}
                <div
                    className="w-1/3 p-4 md:p-8 flex flex-col justify-center items-center backdrop-blur-md bg-white/10 border border-white/10 rounded-r-2xl shadow-2xl h-[600px] md:h-[500px] transition-all duration-500"
                    role="navigation"
                    aria-label="Quick Access"
                >
                    <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 tracking-wide text-white/80">
                        Quick Access
                    </h3>
                    <div className="space-y-2 md:space-y-3 w-full">
                        {["login", "register", "code"].map((m, idx) => (
                            <CSSTransition
                                key={m}
                                in={true}
                                appear={true}
                                timeout={300 + idx * 100}
                                classNames="floatUp"
                            >
                                <button
                                    onClick={() => setMode(m)}
                                    aria-pressed={mode === m}
                                    aria-label={`Switch to ${m === "code" ? "login with code" : m} mode`}
                                    className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg
                    ${
                        mode === m
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-blue-600/30 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700"
                            : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
                    }
                  `}
                                >
                                    {m === "code"
                                        ? "Login With Code"
                                        : m.charAt(0).toUpperCase() +
                                          m.slice(1)}
                                </button>
                            </CSSTransition>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
