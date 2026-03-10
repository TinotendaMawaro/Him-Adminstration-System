import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ============================================================================
// FLOATING PARTICLES BACKGROUND COMPONENT
// ============================================================================

const FloatingParticles = () => {
    const containerRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 80;
            const y = (e.clientY - innerHeight / 2) / 80;
            setOffset({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            size: 3 + Math.random() * 5,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 18 + Math.random() * 15,
            delay: Math.random() * 12,
            opacity: 0.1 + Math.random() * 0.2,
            color: Math.random() > 0.5 ? "gold" : "sky",
        }));
    }, []);

    const keyframesStyle = `
        @keyframes floatUp {
            0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
            10% { opacity: var(--particle-opacity); }
            90% { opacity: var(--particle-opacity); }
            100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
        }
        @keyframes gentlePulse {
            0%, 100% { transform: scale(1); opacity: var(--particle-opacity); }
            50% { transform: scale(1.3); opacity: calc(var(--particle-opacity) * 0.6); }
        }
    `;

    return (
        <>
            <style>{keyframesStyle}</style>
            <div
                ref={containerRef}
                className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #fffbeb 50%, #f0f9ff 75%, #ffffff 100%)",
                }}
            >
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            backgroundColor: particle.color === "gold"
                                ? `rgba(212, 175, 55, ${particle.opacity})`
                                : `rgba(14, 165, 233, ${particle.opacity})`,
                            boxShadow: particle.color === "gold"
                                ? `0 0 ${particle.size * 3}px rgba(212, 175, 55, ${particle.opacity * 0.8})`
                                : `0 0 ${particle.size * 3}px rgba(14, 165, 233, ${particle.opacity * 0.8})`,
                            animation: `floatUp ${particle.duration}s linear infinite, gentlePulse ${particle.duration * 0.6}s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s, ${particle.delay}s`,
                            "--particle-opacity": particle.opacity,
                        }}
                    />
                ))}
                <div className="absolute rounded-full" style={{
                    width: "500px", height: "500px", left: "-100px", top: "20%",
                    background: "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
                    filter: "blur(60px)", animation: "gentlePulse 10s ease-in-out infinite"
                }} />
                <div className="absolute rounded-full" style={{
                    width: "600px", height: "600px", right: "-150px", bottom: "10%",
                    background: "radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)",
                    filter: "blur(80px)", animation: "gentlePulse 14s ease-in-out infinite reverse"
                }} />
            </div>
        </>
    );
};

// ============================================================================
// PREMIUM ICONS
// ============================================================================

const Icons = {
    Home: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
    User: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    Users: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    ),
    Bell: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    Plus: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    BuildingOffice: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
    ),
    Heart: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    Megaphone: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.41.816 1.035.816 1.73 0 .695-.32 1.32-.816 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
    ),
    ClipboardDocumentList: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    ArrowRightOnRectangle: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
    ),
    XMark: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
};

// ============================================================================
// MENU ITEMS
// ============================================================================

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Home },
    { id: "profile", label: "My Profile", icon: Icons.User },
    { id: "homegroup", label: "My Homegroup", icon: Icons.Users },
    { id: "events", label: "Events", icon: Icons.Calendar },
    { id: "announcements", label: "Announcements", icon: Icons.Megaphone },
    { id: "prayer", label: "Prayer Requests", icon: Icons.Heart },
];

// ============================================================================
// FROSTED GLASS CARD COMPONENT
// ============================================================================

const GlassCard = ({ children, className = "", hoverEffect = true }) => (
    <div className={`relative ${hoverEffect ? 'group' : ''} rounded-2xl transition-all duration-300 ${hoverEffect ? 'hover:scale-[1.03] hover:shadow-2xl' : ''}`}>
        {hoverEffect && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400/20 to-sky-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300" />
        )}
        <div className={`relative bg-sky-200/20 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl ${className}`}>
            {children}
        </div>
    </div>
);

// ============================================================================
// WELCOME CARD COMPONENT
// ============================================================================

const WelcomeCard = ({ user }) => {
    // Get time-based greeting
    const now = new Date();
    const africaOffset = 2;
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const africaTime = new Date(utcTime + 3600000 * africaOffset);
    const hour = africaTime.getHours();
    const isDay = hour >= 6 && hour < 18;
    const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

    const spiritualMessages = [
        "May God bless you abundantly today!",
        "Your presence lights up our community!",
        "Welcome to your spiritual home!",
        "We're glad you're here!",
        "God loves you and so do we!",
    ];
    const randomMessage = spiritualMessages[Math.floor(Math.random() * spiritualMessages.length)];

    return (
        <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${isDay ? 'bg-gradient-to-br from-amber-300 to-orange-400' : 'bg-gradient-to-br from-slate-600 to-slate-800'} shadow-lg`}>
                            {isDay ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Good {greeting}, {user?.name?.split(' ')[0] || 'Beloved'}!
                        </h2>
                    </div>
                    <p className="text-gray-600 text-lg mb-4">{randomMessage}</p>
                    
                    {/* Member Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Zone</p>
                            <p className="font-semibold text-gray-900">{user?.zoneName || user?.zone?.name || 'IOC'}</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Homegroup</p>
                            <p className="font-semibold text-gray-900">{user?.homegroup?.name || 'Not Assigned'}</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Department</p>
                            <p className="font-semibold text-gray-900">{user?.department?.name || 'None'}</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Pastor</p>
                            <p className="font-semibold text-gray-900">Pastor in Charge</p>
                        </div>
                    </div>
                </div>
                
                {/* Avatar with Gold Glow */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/30">
                        <span className="text-white font-bold text-4xl">
                            {user?.name?.charAt(0) || 'M'}
                        </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Icons.Heart className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

const QuickActions = ({ onAction }) => {
    const actions = [
        { id: 'join-department', icon: Icons.BuildingOffice, label: 'Join Department', description: 'Serve in a ministry', color: 'from-purple-400 to-purple-600' },
        { id: 'view-events', icon: Icons.Calendar, label: 'View Events', description: 'Upcoming activities', color: 'from-sky-400 to-sky-600' },
        { id: 'join-homegroup', icon: Icons.Users, label: 'Join Homegroup', description: 'Connect with others', color: 'from-emerald-400 to-emerald-600' },
        { id: 'prayer-request', icon: Icons.Heart, label: 'Prayer Request', description: 'Share your burdens', color: 'from-pink-400 to-pink-600' },
        { id: 'announcements', icon: Icons.Megaphone, label: 'Announcements', description: 'Stay informed', color: 'from-amber-400 to-amber-600' },
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {actions.map((action, idx) => (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.id)}
                        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.color} rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition-all duration-300`} />
                        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                            <p className="text-gray-500 text-xs mt-1">{action.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// HOMEGROUP SECTION COMPONENT
// ============================================================================

const HomegroupSection = ({ user, onViewHomegroup }) => {
    // Sample homegroup data - in production this would come from API
    const homegroup = user?.homegroup || {
        name: "North A Home Group",
        leader: "John Doe",
        location: "123 Main Street, North Area",
        nextMeeting: "Sunday, 2:00 PM",
        members: 15,
        membersList: [
            { name: "Jane Smith", role: "Member" },
            { name: "Mike Johnson", role: "Member" },
            { name: "Sarah Williams", role: "Member" },
            { name: "David Brown", role: "Member" },
            { name: "Emily Davis", role: "Member" },
        ]
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Homegroup</h3>
                <button 
                    onClick={onViewHomegroup}
                    className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors"
                >
                    View All →
                </button>
            </div>
            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Icons.Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{homegroup.name}</h4>
                                <p className="text-gray-500 text-sm">Active Group</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Icons.User className="w-5 h-5 text-emerald-500" />
                                <span>Leader: <strong>{homegroup.leader}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Icons.MapPin className="w-5 h-5 text-emerald-500" />
                                <span>{homegroup.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Icons.Calendar className="w-5 h-5 text-emerald-500" />
                                <span>Next Meeting: <strong>{homegroup.nextMeeting}</strong></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:w-64">
                        <p className="text-sm font-medium text-gray-700 mb-3">Members ({homegroup.members})</p>
                        <div className="space-y-2">
                            {homegroup.membersList.slice(0, 4).map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/50">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs">{member.name.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm text-gray-700">{member.name}</span>
                                </div>
                            ))}
                            {homegroup.members > 4 && (
                                <p className="text-sm text-gray-500 text-center">+{homegroup.members - 4} more members</p>
                            )}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

// ============================================================================
// EVENTS SECTION COMPONENT
// ============================================================================

const EventsSection = ({ onRSVP }) => {
    const events = [
        {
            id: 1,
            title: "Sunday Service",
            date: "March 23, 2026",
            time: "9:00 AM",
            location: "Main Sanctuary",
            department: "General",
            color: "from-gold-400 to-amber-500"
        },
        {
            id: 2,
            title: "Youth Fellowship",
            date: "March 24, 2026",
            time: "6:00 PM",
            location: "Youth Center",
            department: "Youth",
            color: "from-purple-400 to-purple-600"
        },
        {
            id: 3,
            title: "Prayer Meeting",
            date: "March 25, 2026",
            time: "7:00 PM",
            location: "Prayer Room",
            department: "Prayer Team",
            color: "from-sky-400 to-sky-600"
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <button className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors">
                    View All →
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                    <GlassCard key={event.id} className="p-5">
                        <div className={`h-1 bg-gradient-to-r ${event.color} rounded-full mb-4`} />
                        <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Icons.Calendar className="w-4 h-4 text-gray-400" />
                                <span>{event.date} at {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icons.MapPin className="w-4 h-4 text-gray-400" />
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icons.BuildingOffice className="w-4 h-4 text-gray-400" />
                                <span>{event.department}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onRSVP(event.id)}
                                className="flex-1 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
                            >
                                RSVP
                            </button>
                            <button className="px-4 py-2 bg-white/60 text-gray-700 font-semibold rounded-xl hover:bg-white transition-all duration-300 text-sm border border-white/50">
                                +Cal
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// ANNOUNCEMENTS SECTION COMPONENT
// ============================================================================

const AnnouncementsSection = () => {
    const announcements = [
        {
            id: 1,
            title: "Easter Service Preparation",
            message: "We need volunteers for the upcoming Easter service. Please sign up at the welcome desk.",
            type: "Pastor",
            author: "Pastor Chipo Vutabwashe",
            date: "2 hours ago",
            isNew: true,
        },
        {
            id: 2,
            title: "Youth Department Camp",
            message: "The youth department camp registration is now open. Register by March 30th.",
            type: "Department",
            author: "Youth Department",
            date: "1 day ago",
            isNew: true,
        },
        {
            id: 3,
            title: "Facility Maintenance Notice",
            message: "The parking lot will be under maintenance this Saturday. Please use alternative parking.",
            type: "General",
            author: "Church Administration",
            date: "3 days ago",
            isNew: false,
        },
    ];

    const typeColors = {
        Pastor: "from-gold-400 to-amber-500",
        Department: "from-purple-400 to-purple-600",
        General: "from-sky-400 to-sky-600",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
                <span className="bg-gold-100 text-gold-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {announcements.filter(a => a.isNew).length} New
                </span>
            </div>
            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <div 
                        key={announcement.id} 
                        className={`relative rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            announcement.isNew 
                                ? 'bg-gradient-to-r from-gold-50/80 to-white border border-gold-200/50' 
                                : 'bg-white/60 backdrop-blur-xl border border-white/40'
                        }`}
                    >
                        {announcement.isNew && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-400 to-amber-500 rounded-l-2xl" />
                        )}
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${typeColors[announcement.type]}`}>
                                        {announcement.type}
                                    </span>
                                    {announcement.isNew && (
                                        <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                                <span className="text-gray-400 text-xs">{announcement.date}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">{announcement.title}</h4>
                            <p className="text-gray-600 text-sm">{announcement.message}</p>
                            <p className="text-gray-400 text-xs mt-3">Posted by {announcement.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// PRAYER REQUEST MODAL COMPONENT
// ============================================================================

const PrayerRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        isAnonymous: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        setTimeout(() => {
            onSubmit(formData);
            setFormData({ title: '', message: '', isAnonymous: false });
            setIsSubmitted(false);
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-scale">
                {/* Header */}
                <div className="bg-gradient-to-r from-gold-400 to-amber-500 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Icons.Heart className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Prayer Request</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                            <Icons.XMark className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm mt-2">Share your burdens with us. We believe in the power of prayer!</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Icons.Check className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Prayer Sent!</h3>
                            <p className="text-gray-600">Our prayer team will lift you up in prayer.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Brief title for your request"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prayer Request</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Share what you'd like us to pray for..."
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 resize-none"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isAnonymous}
                                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
                                />
                                <span className="text-sm text-gray-600">Submit anonymously</span>
                            </label>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-bold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Icons.Heart className="w-5 h-5" />
                                        Submit Prayer Request
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out; }
            `}</style>
        </div>
    );
};

// ============================================================================
// PROFILE DRAWER COMPONENT
// ============================================================================

const ProfileDrawer = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave({ ...user, ...formData });
            setIsSaving(false);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
                        <Icons.XMark className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/30">
                                <span className="text-white font-bold text-4xl">
                                    {formData.name?.charAt(0) || 'M'}
                                </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-gold-400 to-amber-500 rounded-full border-4 border-white flex items-center justify-center">
                                <Icons.Check className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className="mt-4 text-lg font-semibold">{formData.name}</p>
                        <p className="text-gray-500">Church Member</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 resize-none"
                            />
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-sky-100/50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Zone</p>
                            <p className="font-semibold text-gray-900">{user?.zoneName || 'IOC'}</p>
                        </div>
                        <div className="bg-gold-100/50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Homegroup</p>
                            <p className="font-semibold text-gray-900">{user?.homegroup?.name || 'Not Assigned'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 disabled:opacity-50 transition-all duration-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </>
    );
};

// ============================================================================
// MAIN MEMBERS PORTAL COMPONENT
// ============================================================================

export default function MembersPortal({ user: initialUser, onLogout }) {
    const [activeItem, setActiveItem] = useState("dashboard");
    const [user, setUser] = useState(initialUser);
    const [showProfile, setShowProfile] = useState(false);
    const [showPrayerModal, setShowPrayerModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAction = (actionId) => {
        switch (actionId) {
            case 'prayer-request':
                setShowPrayerModal(true);
                break;
            case 'announcements':
                setActiveItem('announcements');
                break;
            case 'view-events':
                setActiveItem('events');
                break;
            case 'join-homegroup':
            case 'join-department':
                // These would open modals or navigate to signup forms
                alert('This feature is coming soon!');
                break;
            default:
                break;
        }
    };

    const handleRSVP = (eventId) => {
        alert(`RSVP confirmed for event ${eventId}!`);
    };

    const handleViewHomegroup = () => {
        setActiveItem('homegroup');
    };

    const getPageContent = () => {
        switch (activeItem) {
            case "dashboard":
                return (
                    <div className="space-y-8">
                        <WelcomeCard user={user} />
                        <QuickActions onAction={handleAction} />
                        <HomegroupSection user={user} onViewHomegroup={handleViewHomegroup} />
                        <EventsSection onRSVP={handleRSVP} />
                        <AnnouncementsSection />
                    </div>
                );
            case "profile":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
                        <GlassCard className="p-6 max-w-2xl">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/30 mb-4">
                                    <span className="text-white font-bold text-5xl">
                                        {user?.name?.charAt(0) || 'M'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-500">Church Member</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900">{user?.email || 'Not set'}</p>
                                </div>
                                <div className="bg-white/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                                    <p className="font-semibold text-gray-900">{user?.phone || 'Not set'}</p>
                                </div>
                                <div className="bg-white/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Zone</p>
                                    <p className="font-semibold text-gray-900">{user?.zoneName || 'IOC'}</p>
                                </div>
                                <div className="bg-white/50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Homegroup</p>
                                    <p className="font-semibold text-gray-900">{user?.homegroup?.name || 'Not Assigned'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowProfile(true)}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300"
                            >
                                Edit Profile
                            </button>
                        </GlassCard>
                    </div>
                );
            case "homegroup":
                return (
                    <div className="p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Homegroup</h2>
                        <HomegroupSection user={user} onViewHomegroup={() => {}} />
                    </div>
                );
            case "events":
                return (
                    <div className="p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Church Events</h2>
                        <EventsSection onRSVP={handleRSVP} />
                    </div>
                );
            case "announcements":
                return (
                    <div className="p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
                        <AnnouncementsSection />
                    </div>
                );
            case "prayer":
                return (
                    <div className="p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Prayer Requests</h2>
                        <GlassCard className="p-6 max-w-2xl">
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Icons.Heart className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Burdens</h3>
                                <p className="text-gray-600 mb-6">We believe in the power of prayer. Submit your prayer request and our prayer team will lift you up.</p>
                                <button 
                                    onClick={() => setShowPrayerModal(true)}
                                    className="py-3 px-6 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Submit Prayer Request
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-screen">
            <FloatingParticles />
            
            {/* Mobile Header */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                <span className="text-white font-bold">H</span>
                            </div>
                            <span className="font-bold text-gray-900">HIM Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl hover:bg-gray-100 relative">
                                <Icons.Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
                            </button>
                            <button 
                                onClick={() => setShowProfile(true)}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"
                            >
                                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0) || 'M'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Layout */}
            <div className="flex">
                {/* Sidebar - Desktop */}
                <aside className={`hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 fixed h-full shadow-lg z-30`}>
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg shadow-gold-500/20">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold">HIM</p>
                                <p className="text-gray-400 text-xs">Members Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Zone Info */}
                    <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-100">
                        <p className="text-gray-400 text-xs mb-1">My Zone</p>
                        <p className="text-gray-900 font-semibold">{user?.zoneName || user?.zone?.name || 'IOC'}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveItem(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                                    activeItem === item.id
                                        ? "bg-gradient-to-r from-gold-500/10 to-amber-500/10 text-gold-600 border border-gold-200"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeItem === item.id ? 'text-gold-500' : 'text-gray-400'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-100 space-y-1">
                        <button
                            onClick={() => setShowProfile(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Icons.User className="w-5 h-5" />
                            <span className="font-medium">Profile</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Icons.ArrowRightOnRectangle className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={`flex-1 ${isMobile ? 'pt-20' : 'md:ml-64'} min-h-screen`}>
                    {/* Header - Desktop */}
                    {!isMobile && (
                        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-20">
                            <div>
                                <h2 className="text-gray-900 font-semibold capitalize">{activeItem.replace('-', ' ')}</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 rounded-xl hover:bg-gray-100 relative">
                                    <Icons.Bell className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full animate-pulse"></span>
                                </button>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <button 
                                        onClick={() => setShowProfile(true)}
                                        className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-1 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-md shadow-gold-500/20">
                                            <span className="text-white font-semibold text-sm">{user?.name?.charAt(0) || 'M'}</span>
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-gray-900 text-sm font-medium">{user?.name || 'Member'}</p>
                                            <p className="text-gray-400 text-xs">Church Member</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </header>
                    )}

                    {/* Page Content */}
                    <main className="p-4 md:p-8">
                        {getPageContent()}
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-2 z-30">
                    <div className="flex items-center justify-around">
                        {menuItems.slice(0, 5).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveItem(item.id)}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                                    activeItem === item.id
                                        ? 'text-gold-600'
                                        : 'text-gray-400'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            <PrayerRequestModal 
                isOpen={showPrayerModal} 
                onClose={() => setShowPrayerModal(false)} 
                onSubmit={(data) => console.log('Prayer request submitted:', data)}
            />
            <ProfileDrawer 
                user={user} 
                isOpen={showProfile} 
                onClose={() => setShowProfile(false)}
                onSave={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    );
}

