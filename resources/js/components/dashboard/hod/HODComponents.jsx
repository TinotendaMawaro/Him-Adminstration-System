// ============================================================================
// HOD PORTAL DESIGN SYSTEM - Gold/Sky-Blue Glass Morphism Theme
// ============================================================================

import React from "react";
import { HODIcons } from "./HODIcons";

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const HODTheme = {
    // Colors
    colors: {
        primary: "from-amber-400 via-yellow-500 to-amber-600",
        primaryGlow: "shadow-amber-500/30",
        secondary: "from-sky-400 via-sky-500 to-sky-600",
        secondaryGlow: "shadow-sky-500/20",
        success: "from-emerald-400 to-emerald-600",
        danger: "from-red-400 to-red-600",
        warning: "from-amber-400 to-amber-600",
    },
    
    // Glass morphism classes
    glass: "bg-white/30 backdrop-blur-xl border-white/40 shadow-xl",
    glassHover: "hover:bg-white/50 hover:shadow-2xl",
    
    // Transitions
    transition: "transition-all duration-300 ease",
    
    // Border radius
    rounded: "rounded-2xl",
    roundedLg: "rounded-3xl",
    
    // Hover scale
    scale: "hover:scale-[1.03]",
};

// ============================================================================
// GOLD PRIMARY BUTTON
// ============================================================================

export const HODGoldButton = ({ children, icon: Icon, onClick, className = "", disabled, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white rounded-2xl overflow-hidden ${HODTheme.transition} ${className}`}
    >
        {/* Gold gradient background */}
        <span className={`absolute inset-0 bg-gradient-to-r ${HODTheme.colors.primary} group-hover:animate-pulse`}></span>
        
        {/* Glow effect */}
        <span className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></span>
        
        {/* Content */}
        <span className="relative flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </span>
    </button>
);

// ============================================================================
// SKY BLUE SECONDARY BUTTON
// ============================================================================

export const HODSkyButton = ({ children, icon: Icon, onClick, className = "", disabled, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium rounded-2xl ${HODTheme.transition} ${HODTheme.glass} ${HODTheme.glassHover} ${className}`}
    >
        {Icon && <Icon className="w-4 h-4 text-sky-600" />}
        {children}
    </button>
);

// ============================================================================
// GLASS CARD COMPONENT
// ============================================================================

export const HODGlassCard = ({ children, className = "", title, action, noPadding = false }) => (
    <div className={`relative ${HODTheme.glass} ${HODTheme.rounded} ${HODTheme.glassHover} ${HODTheme.scale} overflow-hidden ${className}`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
        
        {(title || action) && (
            <div className="relative px-5 py-4 border-b border-white/20 flex items-center justify-between">
                {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
        
        <div className={`relative ${noPadding ? "" : "p-5"}`}>
            {children}
        </div>
    </div>
);

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const HODInput = ({ icon: Icon, placeholder, value, onChange, type = "text", className = "", error }) => (
    <div className="relative">
        {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500">
                <Icon className="w-4 h-4" />
            </div>
        )}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full bg-white/40 backdrop-blur-sm rounded-2xl border ${
                error ? "border-red-400" : "border-white/40"
            } text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 ${HODTheme.transition} ${Icon ? "pl-11" : "px-4"} py-3 text-sm ${className}`}
        />
        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
);

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const HODTextarea = ({ placeholder, value, onChange, rows = 4, className = "" }) => (
    <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 text-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 ${HODTheme.transition} resize-none ${className}`}
        placeholder={placeholder}
    />
);

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export const HODBadge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-white/50 text-gray-600",
        success: "bg-emerald-100/50 text-emerald-700",
        warning: "bg-amber-100/50 text-amber-700",
        info: "bg-sky-100/50 text-sky-700",
        gold: "bg-amber-100/50 text-amber-700",
        danger: "bg-red-100/50 text-red-700",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// ============================================================================
// DRAWER COMPONENT - Slide from right
// ============================================================================

export const HODDrawer = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            
            {/* Drawer panel */}
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-white/40 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <HODIcons.XMark className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
            
            {/* Animation styles */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

// ============================================================================
// NOTIFICATION BELL WITH PULSE
// ============================================================================

export const HODNotificationBell = ({ count = 0, onClick }) => (
    <button 
        onClick={onClick}
        className="relative p-2 rounded-2xl bg-white/40 hover:bg-white/60 transition-all"
    >
        <HODIcons.Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
            <>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-ping opacity-75"></span>
            </>
        )}
    </button>
);

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

export const HODAvatar = ({ name, size = "md", className = "" }) => {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-lg",
        xl: "w-20 h-20 text-2xl",
    };
    
    return (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg ${className}`}>
            <span className="text-white font-semibold">{name?.charAt(0) || "U"}</span>
        </div>
    );
};

// ============================================================================
// STAT CARD
// ============================================================================

export const HODStatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => (
    <div 
        className={`relative group ${HODTheme.glass} ${HODTheme.rounded} ${HODTheme.glassHover} ${HODTheme.scale} overflow-hidden`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`}></div>
        <div className="relative p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                    {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// ACTIVITY TIMELINE ITEM
// ============================================================================

export const HODTimelineItem = ({ icon: Icon, title, description, time, color = "from-amber-400 to-amber-600" }) => (
    <div className="flex gap-4 relative">
        {/* Connector line */}
        <div className="absolute left-4 top-10 bottom-[-1rem] w-0.5 bg-gradient-to-b from-amber-300 to-transparent"></div>
        
        {/* Icon */}
        <div className={`relative z-10 p-2 rounded-2xl bg-gradient-to-br ${color} shadow-lg shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 pb-6">
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-gray-500 text-xs mt-0.5">{description}</p>
            <p className="text-amber-600 text-xs mt-1 font-medium">{time}</p>
        </div>
    </div>
);

// ============================================================================
// MEMBER TABLE ROW
// ============================================================================

export const HODMemberRow = ({ member, onView, onRemove }) => (
    <tr className="group hover:bg-white/40 transition-all duration-300">
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <HODAvatar name={member.name} size="sm" />
                <div>
                    <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                    <p className="text-gray-400 text-xs">{member.phone}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-gray-600 text-sm">{member.homegroup || "-"}</td>
        <td className="px-4 py-3">
            <HODBadge variant={member.status === "active" ? "success" : "default"}>
                {member.status}
            </HODBadge>
        </td>
        <td className="px-4 py-3">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onView?.(member)}
                    className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors"
                    title="View"
                >
                    <HODIcons.Eye className="w-4 h-4 text-sky-600" />
                </button>
                <button 
                    onClick={() => onRemove?.(member)}
                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                    title="Remove"
                >
                    <HODIcons.XMark className="w-4 h-4 text-red-600" />
                </button>
            </div>
        </td>
    </tr>
);

// ============================================================================
// ACTIVITY CARD
// ============================================================================

export const HODActivityCard = ({ activity, onClick }) => (
    <div 
        onClick={onClick}
        className={`${HODTheme.glass} ${HODTheme.rounded} ${HODTheme.glassHover} p-4 cursor-pointer`}
    >
        <div className="flex items-start justify-between">
            <div>
                <h4 className="font-semibold text-gray-800 text-sm">{activity.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{activity.date} • {activity.location}</p>
            </div>
            <HODBadge variant={activity.status === "upcoming" ? "info" : activity.status === "completed" ? "success" : "warning"}>
                {activity.status}
            </HODBadge>
        </div>
    </div>
);

// ============================================================================
// ACHIEVEMENT BADGE
// ============================================================================

export const HODAchievementBadge = ({ title, description, icon: Icon }) => (
    <div className={`${HODTheme.glass} ${HODTheme.rounded} ${HODTheme.glassHover} ${HODTheme.scale} p-4 text-center group`}>
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-white" />
        </div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
    </div>
);

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

export const HODMessageBubble = ({ message, isOwn, time }) => (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[75%] ${isOwn ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white" : "bg-white/50"} rounded-3xl px-4 py-2.5 shadow-sm`}>
            <p className="text-sm">{message}</p>
            <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}>{time}</p>
        </div>
    </div>
);

// ============================================================================
// SEARCH INPUT
// ============================================================================

export const HODSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <HODIcons.MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder || "Search..."}
            className="w-full bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 pl-11 pr-4 py-2.5 text-sm transition-all duration-300"
        />
    </div>
);

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

export const HODQuickAction = ({ icon: Icon, label, onClick, color = "from-amber-400 to-amber-600" }) => (
    <button
        onClick={onClick}
        className={`relative overflow-hidden group p-4 rounded-2xl bg-gradient-to-br ${color} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
    >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col items-center gap-2">
            <Icon className="w-6 h-6 text-white" />
            <span className="text-xs font-medium text-white text-center">{label}</span>
        </div>
    </button>
);

// ============================================================================
// ACTIVITY ITEM
// ============================================================================

export const HODActivityItem = ({ icon: Icon, title, description, time }) => (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-white/30 transition-all duration-300">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
            <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-400">{time}</div>
    </div>
);

// ============================================================================
// CARD (Simple wrapper)
// ============================================================================

export const HODCard = ({ children, className = "" }) => (
    <div className={`${HODTheme.glass} ${HODTheme.rounded} p-5 ${className}`}>
        {children}
    </div>
);

// ============================================================================
// BUTTON (Generic)
// ============================================================================

export const HODButton = ({ children, variant = "primary", onClick, className = "", disabled, type = "button" }) => {
    const variants = {
        primary: "bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white",
        secondary: "bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white",
        outline: "border-2 border-amber-400 text-amber-600 hover:bg-amber-50",
    };
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// ============================================================================
// PROFILE FIELD
// ============================================================================

export const HODProfileField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40">
        {Icon && <Icon className="w-5 h-5 text-amber-600" />}
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value || "N/A"}</p>
        </div>
    </div>
);

// ============================================================================
// DUE DATE INDICATOR
// ============================================================================

export const HODDueDateIndicator = ({ dueDate, className = "" }) => {
    const getStatus = () => {
        if (!dueDate) return { color: "text-gray-400", label: "No due date" };
        
        const due = new Date(dueDate);
        const now = new Date();
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { color: "text-red-600", label: `Overdue by ${Math.abs(diffDays)} days` };
        if (diffDays === 0) return { color: "text-amber-600", label: "Due today" };
        if (diffDays <= 3) return { color: "text-amber-500", label: `Due in ${diffDays} days` };
        return { color: "text-green-600", label: `Due in ${diffDays} days` };
    };
    
    const status = getStatus();
    
    return (
        <span className={`text-xs font-medium ${status.color} ${className}`}>
            {status.label}
        </span>
    );
};

// ============================================================================
// DEPARTMENT AVATAR
// ============================================================================

export const HODDepartmentAvatar = ({ name, size = "md", color = "from-amber-400 to-amber-600" }) => {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-16 h-16 text-base",
    };
    
    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";
    
    return (
        <div className={` rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold ${sizes[size]}`}>
            {initials}
        </div>
    );
};

export default {
    HODTheme,
    HODGoldButton,
    HODSkyButton,
    HODGlassCard,
    HODInput,
    HODTextarea,
    HODBadge,
    HODDrawer,
    HODNotificationBell,
    HODAvatar,
    HODStatCard,
    HODTimelineItem,
    HODMemberRow,
    HODActivityCard,
    HODAchievementBadge,
    HODMessageBubble,
    HODSearchInput,
    HODQuickAction,
    HODActivityItem,
    HODCard,
    HODButton,
    HODProfileField,
    HODDueDateIndicator,
    HODDepartmentAvatar,
};
