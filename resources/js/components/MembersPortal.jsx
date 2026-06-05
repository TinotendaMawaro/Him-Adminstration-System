import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../context/UserContext";
import api from "../lib/api";
import InvitationsManager from "./InvitationsManager";
import HomeGroupCommunity from "./HomeGroupCommunity";
import NotificationBell from "./notifications/NotificationBell";

// ============================================================================
// FLOATING PARTICLES BACKGROUND COMPONENT
// ============================================================================

const FloatingParticles = () => {
    const containerRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return;
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
// ICONS (unchanged)
// ============================================================================

const Icons = {
    Home: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>),
    User: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
    Users: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>),
    Calendar: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
    MapPin: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
    Bell: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>),
    BuildingOffice: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>),
    Heart: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>),
    Megaphone: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.41.816 1.035.816 1.73 0 .695-.32 1.32-.816 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>),
    DocumentText: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>),
    ArrowRightOnRectangle: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>),
    XMark: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
    ChatBubbleLeftRight: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>),
    Envelope: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>),
    Phone: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>),
    Star: ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>),
};

// ============================================================================
// FEATURE DRAWER
// ============================================================================

const FeatureDrawer = ({ isOpen, onClose, title, icon: Icon, children }) => {
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:cursor-pointer" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full md:max-w-md bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
                <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 flex items-center justify-center shadow-lg">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Icons.XMark className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 md:p-6">{children}</div>
            </div>
            <style>{`
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </>
    );
};

// ============================================================================
// ZONE INFO DRAWER — reads real API shape: user.zone.name
// ============================================================================

const ZoneInfoDrawer = ({ isOpen, onClose, user }) => {
    const zoneName    = user && user.zone && user.zone.name            || '—';
    const pastorName  = user && user.pastor && user.pastor.user && user.pastor.user.name    || 'Not Assigned';
    const address     = user && user.member && user.member.address       || (user && user.address) || '—';

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="My Zone" icon={Icons.MapPin}>
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-xl shadow-gold-500/30 mb-4">
                        <span className="text-white font-bold text-3xl">{zoneName.charAt(0)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{zoneName}</h3>
                </div>

                <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-2xl p-4 border border-gold-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Icons.User className="w-5 h-5 text-gold-600" />
                        <span className="font-semibold text-gray-900">Zone Pastor</span>
                    </div>
                    <p className="text-gray-700 pl-8">{pastorName}</p>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <Icons.MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{address}</span>
                </div>
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// PASTOR & HOD INFO DRAWER — reads real API shape
// ============================================================================

const PastorHODDrawer = ({ isOpen, onClose, user }) => {
    const pastorName  = (user && user.pastor && user.pastor.user && user.pastor.user.name) || 'Not Assigned';
    const pastorPhone = (user && user.pastor && user.pastor.user && user.pastor.user.phone) || '—';
    const pastorEmail = (user && user.pastor && user.pastor.user && user.pastor.user.email) || '—';

    // HOD info lives inside the member relationship if your API exposes it
    const hodName  = (user && user.member && user.member.hod_name) || 'Not Assigned';
    const hodDept  = (user && user.department && user.department.name) || '—';

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="Pastor & HOD Info" icon={Icons.Users}>
            <div className="space-y-6">
                {/* Pastor */}
                <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-2xl p-5 border border-gold-100">
                    <span className="px-2 py-1 bg-gold-500 text-white text-xs font-semibold rounded-lg">PASTOR</span>
                    <div className="flex items-center gap-4 mt-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{pastorName.charAt(0)}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{pastorName}</h4>
                            <p className="text-gold-600 text-sm">Zone Pastor</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600"><Icons.Phone className="w-4 h-4 text-gray-400" /><span>{pastorPhone}</span></div>
                        <div className="flex items-center gap-2 text-gray-600"><Icons.Envelope className="w-4 h-4 text-gray-400" /><span>{pastorEmail}</span></div>
                    </div>
                </div>

                {/* HOD */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-lg">HOD</span>
                    <div className="flex items-center gap-4 mt-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{hodName.charAt(0)}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{hodName}</h4>
                            <p className="text-purple-600 text-sm">{hodDept}</p>
                        </div>
                    </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Icons.ChatBubbleLeftRight className="w-5 h-5 inline-block mr-2" />
                    Send Message
                </button>
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// REPORTS DRAWER
// ============================================================================

const ReportsDrawer = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('prayer');
    const reportTypes = [
        { id: 'prayer',   label: 'Prayer Request', icon: Icons.Heart,               color: 'from-pink-400 to-pink-600' },
        { id: 'absence',  label: 'Report Absence', icon: Icons.Calendar,            color: 'from-red-400 to-red-600' },
        { id: 'feedback', label: 'Give Feedback',  icon: Icons.ChatBubbleLeftRight, color: 'from-sky-400 to-sky-600' },
    ];

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="Submit Report/Request" icon={Icons.DocumentText}>
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                    {reportTypes.map((type) => (
                        <button key={type.id} onClick={() => setReportType(type.id)}
                                className={`p-3 rounded-xl text-center transition-all duration-300 ${reportType === type.id ? 'bg-gradient-to-r ' + type.color + ' text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <type.icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs font-medium">{type.label}</span>
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input type="text" placeholder="Brief description" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                        <textarea placeholder="Share more details..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 resize-none" />
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Submit Request
                    </button>
                </div>
                <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Requests</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Prayer for my family - Submitted</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Absence report - Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// NOTIFICATIONS PANEL
// ============================================================================

const NotificationsPanel = ({ isOpen, onClose }) => {
    const notifications = [
        { id: 1, title: 'New Event',       message: 'Sunday Service tomorrow at 9 AM',    type: 'event',      isRead: false, time: '1h ago' },
        { id: 2, title: 'Pastor Update',   message: 'Pastor shared a new message',         type: 'pastor',     isRead: false, time: '3h ago' },
        { id: 3, title: 'Department News', message: 'Youth camp registration open',         type: 'department', isRead: true,  time: '1d ago' },
        { id: 4, title: 'Announcement',    message: 'Facility maintenance notice',          type: 'general',    isRead: true,  time: '2d ago' },
    ];
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const typeColors  = { event: 'from-sky-400 to-sky-600', pastor: 'from-gold-400 to-amber-500', department: 'from-purple-400 to-purple-600', general: 'from-gray-400 to-gray-600' };
    const typeIcons   = { event: Icons.Calendar, pastor: Icons.User, department: Icons.BuildingOffice, general: Icons.Megaphone };

    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                        {unreadCount > 0 && <span className="px-2 py-0.5 bg-gold-500 text-white text-xs font-semibold rounded-full animate-pulse">{unreadCount} new</span>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Icons.XMark className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-2 space-y-2">
                    {notifications.map((n) => {
                        const NIcon = typeIcons[n.type];
                        return (
                            <div key={n.id} className={`p-4 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md ${n.isRead ? 'bg-white border border-gray-100' : 'bg-gradient-to-r from-gold-50/50 to-white border border-gold-200/50'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${typeColors[n.type]} flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <NIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                                            {!n.isRead && <span className="w-2 h-2 bg-gold-500 rounded-full"></span>}
                                        </div>
                                        <p className="text-gray-600 text-sm truncate">{n.message}</p>
                                        <p className="text-gray-400 text-xs mt-1">{n.time}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

// ============================================================================
// GLASS CARD
// ============================================================================

const GlassCard = ({ children, className = "", hoverEffect = true }) => (
    <div className={`relative ${hoverEffect ? 'group' : ''} rounded-2xl transition-all duration-300 ${hoverEffect ? 'hover:scale-[1.03] hover:shadow-2xl' : ''}`}>
        {hoverEffect && <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400/20 to-sky-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300" />}
        <div className={`relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl ${className}`}>{children}</div>
    </div>
);

// ============================================================================
// WELCOME CARD — uses real UserResource fields
// ============================================================================

// ============================================================================
// MINISTRY INFO CARD — displays full membership information
// ============================================================================

const MinistryInfoCard = ({ user, memberData }) => {
    const zone = user && user.zone;
    const member = user && user.member;
    const pastorName = zone?.pastor_title && zone?.pastor_name
        ? `${zone.pastor_title} ${zone.pastor_name}`
        : (zone?.pastor_name || "Not Assigned");
    const regionName = zone?.region?.name || "—";
    const zoneName = zone?.name || "—";
    const zoneCode = zone?.code || user?.zone_id || "—";
    const memberCode = member?.member_code || "—";
    const registrationDate = member?.membership_date || memberData?.member_since || "—";

    return (
        <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg`}>
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900">My Ministry Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-xl p-4 border border-gold-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Membership Code</p>
                            <p className="text-lg font-bold text-gray-900 font-mono tracking-wide">{memberCode}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-sky-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Zone</p>
                            <p className="text-lg font-bold text-gray-900 truncate">{zoneName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Code: {zoneCode}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-purple-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Region</p>
                            <p className="text-lg font-bold text-gray-900">{regionName}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Pastor</p>
                            <p className="text-lg font-bold text-gray-900 truncate">{pastorName}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-amber-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Registration Date</p>
                            <p className="text-lg font-bold text-gray-900">{registrationDate}</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Member Number</p>
                            <p className="text-lg font-bold text-gray-900 font-mono">{member?.member_number || "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/30 overflow-hidden">
                        {user && user.profile_photo
                            ? <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                            : <span className="text-white font-bold text-4xl">{(user && user.name && user.name.charAt(0)) || 'M'}</span>
                        }
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// ============================================================================
// REGISTRATION CONFIRMATION BANNER
// ============================================================================

const RegistrationConfirmation = ({ user }) => {
    if (!user) return null;
    const zone = user.zone;
    const member = user.member;
    const pastorName = zone?.pastor_title && zone?.pastor_name
        ? `${zone.pastor_title} ${zone.pastor_name}`
        : (zone?.pastor_name || "Not Assigned");

    return (
        <div className="mb-8 bg-gradient-to-r from-emerald-50 via-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">Welcome to HIM, {(user.name || "").split(" ")[0]}!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Your membership has been registered successfully. You are now part of <strong>{zone?.name || "your zone"}</strong>.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Membership Code</p>
                            <p className="text-sm font-bold text-gray-900 font-mono">{member?.member_code || "—"}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Zone</p>
                            <p className="text-sm font-bold text-gray-900">{zone?.name || "—"}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Region</p>
                            <p className="text-sm font-bold text-gray-900">{zone?.region?.name || "—"}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Pastor</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{pastorName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// WELCOME CARD (legacy — kept for backward compat)
// ============================================================================

const WelcomeCard = ({ user }) => {
    const now        = new Date();
    const africaTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3600000 * 2);
    const hour       = africaTime.getHours();
    const isDay      = hour >= 6 && hour < 18;
    const greeting   = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    const messages   = ["May God bless you abundantly today!", "Your presence lights up our community!", "Welcome to your spiritual home!", "We're glad you're here!", "God loves you and so do we!"];
    const msg        = messages[Math.floor(Math.random() * messages.length)];

    return (
        <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${isDay ? 'bg-gradient-to-br from-amber-300 to-orange-400' : 'bg-gradient-to-br from-slate-600 to-slate-800'} shadow-lg`}>
                            {isDay
                                ? <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" /></svg>
                                : <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                            }
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Good {greeting}, {(user && user.name && user.name.split(' ')[0]) || 'Beloved'}!
                        </h2>
                    </div>
                    <p className="text-gray-600 text-lg mb-4">{msg}</p>

                    {/* Stats grid — uses exact UserResource keys */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Zone</p>
                            <p className="font-semibold text-gray-900 truncate">{(user && user.zone && user.zone.name) || '—'}</p>
                            {(user && user.zone && user.zone.pastor_name) && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    Pastor: {(user.zone.pastor_title ?? "") + " " + user.zone.pastor_name}
                                </p>
                            )}
                            {(user && user.zone && user.zone.pastor_name) && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                    Code: {user.zone.pastor_name ? (user.zone.code ?? user.zone.id ?? "—") : "—"}
                                </p>
                            )}

                            <p className="font-semibold text-gray-900 truncate mt-2">{(user && user.home_group && user.home_group.name) || 'Not Assigned'}</p>

                            <p className="font-semibold text-gray-900 truncate mt-2">{(user && user.department && user.department.name) || 'None'}</p>

                            <p className="font-semibold text-gray-900 truncate mt-2">{(user && user.role_label) || (user && user.role) || '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/30 overflow-hidden">
                        {user && user.profile_photo
                            ? <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                            : <span className="text-white font-bold text-4xl">{(user && user.name && user.name.charAt(0)) || 'M'}</span>
                        }
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
// QUICK ACTIONS
// ============================================================================

const QuickActions = ({ onAction, pendingInvitations = 0 }) => {
  const actions = [
      { id: 'view-invitations', icon: Icons.Envelope, label: 'Invitations', description: 'Accept or decline homegroup invites', color: 'from-rose-400 to-red-500', badge: pendingInvitations },
      { id: 'view-zone',       icon: Icons.MapPin,    label: 'View My Zone',   description: 'Zone details & info',          color: 'from-gold-400 to-amber-500' },
      { id: 'view-pastor-hod', icon: Icons.Users,      label: 'Pastor & HOD',   description: 'Contact leadership',           color: 'from-purple-400 to-purple-600' },
      { id: 'view-events',     icon: Icons.Calendar,   label: 'Upcoming Events',description: 'Church activities',            color: 'from-sky-400 to-sky-600' },
      { id: 'submit-reports',  icon: Icons.DocumentText,label: 'Submit Reports', description: 'Requests & reports',           color: 'from-emerald-400 to-emerald-600' },
      { id: 'feedback',        icon: Icons.Star,       label: 'Feedback',       description: 'Rate & review the app',        color: 'from-orange-400 to-red-500' },
  ];
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {actions.map((action) => (
                    <button key={action.id} onClick={() => onAction(action.id)} className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.color} rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition-all duration-300`} />
                        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-3 md:p-4 transition-all duration-300 hover:bg-white/80">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${action.color} shadow-md flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300 relative`}>
                                <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                {action.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[14px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                                        {action.badge > 9 ? '9+' : action.badge}
                                    </span>
                                )}
                            </div>
                            <p className="font-semibold text-gray-900 text-xs md:text-sm">{action.label}</p>
                            <p className="text-gray-500 text-xs mt-1 hidden md:block">{action.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// HOMEGROUP SECTION — uses user.home_group from UserResource
// ============================================================================

const HomegroupSection = ({ user, onViewHomegroup, onLeaveHomegroup }) => {
    const hg = user && user.home_group;
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Homegroup</h3>
                <button onClick={onViewHomegroup} className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors">View All →</button>
            </div>
            <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Icons.Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{hg && hg.name ? hg.name : 'Not Assigned'}</h4>
                        <p className="text-gray-500 text-sm">{hg ? 'Active Group' : 'You have not been assigned a homegroup yet'}</p>
                    </div>
                </div>
                {hg && (
                    <div className="flex gap-2">
                        <button
                            onClick={onLeaveHomegroup}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                            Leave Group
                        </button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// ============================================================================
// DEPARTMENTS SECTION — shows user's department and allows viewing all
// ============================================================================

const DepartmentsSection = ({ user, onViewDepartments, onLeaveDepartment }) => {
    const dept = user && user.department;
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Department</h3>
                <button onClick={onViewDepartments} className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors">View All →</button>
            </div>
            <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                        <Icons.BuildingOffice className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{dept && dept.name ? dept.name : 'Not Assigned'}</h4>
                        <p className="text-gray-500 text-sm">{dept ? 'Active Department' : 'You have not been assigned to a department yet'}</p>
                    </div>
                </div>
                {dept && (
                    <div className="flex gap-2">
                        <button
                            onClick={onLeaveDepartment}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                            Leave Department
                        </button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// ============================================================================
// EVENTS SECTION (static placeholder — replace with useEvents hook later)
// ============================================================================

const EventsSection = ({ onRSVP }) => {
    const events = [
        { id: 1, title: "Sunday Service",   date: "March 23, 2026", time: "9:00 AM", location: "Main Sanctuary", color: "from-gold-400 to-amber-500" },
        { id: 2, title: "Youth Fellowship", date: "March 24, 2026", time: "6:00 PM", location: "Youth Center",   color: "from-purple-400 to-purple-600" },
    ];
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                    <GlassCard key={event.id} className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <Icons.Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                                <p className="text-sm text-gray-400 mt-1">{event.location}</p>
                            </div>
                        </div>
                        <button onClick={() => onRSVP(event.id)} className="mt-3 w-full py-2 bg-gold-500 text-white text-sm font-medium rounded-lg hover:bg-gold-600 transition-colors">
                            RSVP
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// HOME GROUPS BROWSER — shows all home groups and allows requesting to join
// ============================================================================

const HomeGroupsBrowser = ({ isOpen, onClose, user }) => {
    const { data: homeGroups = [], isLoading, error } = useQuery({
        queryKey: ['home-groups-available'],
        queryFn: async () => {
            const response = await api.get('/home-groups/available');
            if (response.data && response.data.success) {
                return response.data.home_groups || [];
            }
            throw new Error(response.data?.message || 'Failed to load home groups');
        },
        staleTime: 30000,
        refetchOnWindowFocus: true,
        retry: 1,
        enabled: isOpen, // Only fetch when drawer is open
    });

    const handleRequestJoin = async (homeGroupId) => {
        try {
            const response = await api.post('/home-group/request', {
                home_group_id: homeGroupId
            });

            if (response.data && response.data.success) {
                alert('Request submitted successfully! Please wait for approval.');
            } else {
                alert(response.data?.message || 'Failed to submit request');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request');
        }
    };

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="All Home Groups" icon={Icons.Users}>
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                    Browse all home groups in your zone and request to join.
                </p>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        {error.message}
                    </div>
                ) : homeGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Icons.Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        No home groups available
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {homeGroups.map(homeGroup => {
                            const isCurrentHG = user?.home_group?.id === homeGroup.id;

                            return (
                                <div key={homeGroup.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:bg-white/80 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{homeGroup.name}</h4>
                                            {homeGroup.location && (
                                                <p className="text-sm text-gray-600 mt-1">{homeGroup.location}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                {homeGroup.meeting_day && homeGroup.meeting_time && (
                                                    <span className="text-xs text-gray-500">
                                                        {homeGroup.meeting_day} at {homeGroup.meeting_time}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isCurrentHG && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-sm text-gray-500">
                                            {homeGroup.leader && `Led by ${homeGroup.leader.name}`}
                                        </div>

                                        {!isCurrentHG && (
                                            <button
                                                onClick={() => handleRequestJoin(homeGroup.id)}
                                                className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                                            >
                                                Request to Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// DEPARTMENTS DRAWER — shows all departments and allows requesting to join
// ============================================================================

const DepartmentsDrawer = ({ isOpen, onClose, user }) => {
    const { data: departments = [], isLoading, error } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await api.get('/departments');
            if (response.data && response.data.success) {
                return response.data.departments || [];
            }
            throw new Error(response.data?.message || 'Failed to load departments');
        },
        staleTime: 30000,
        refetchOnWindowFocus: true,
        retry: 1,
        enabled: isOpen, // Only fetch when drawer is open
    });

    const handleRequestJoin = async (departmentId) => {
        try {
            const response = await api.post('/department-request', {
                department_id: departmentId
            });

            if (response.data && response.data.success) {
                alert('Request submitted successfully! Please wait for approval.');
            } else {
                alert(response.data?.message || 'Failed to submit request');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request');
        }
    };

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="Departments" icon={Icons.BuildingOffice}>
            <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                    View all departments in your zone and request to join.
                </p>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        {error.message}
                    </div>
                ) : departments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Icons.BuildingOffice className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        No departments available
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {departments.map(department => {
                            const isCurrentDept = user?.department?.id === department.id;
                            const hasHod = department.hod;

                            return (
                                <div key={department.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 hover:bg-white/80 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{department.name}</h4>
                                            {department.description && (
                                                <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                                            )}
                                        </div>
                                        {isCurrentDept && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-sm text-gray-500">
                                            {department.members_count || 0} members
                                            {hasHod && ` • Led by ${department.hod.name}`}
                                        </div>

                                        {!isCurrentDept && (
                                            <button
                                                onClick={() => handleRequestJoin(department.id)}
                                                className="px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
                                            >
                                                Request to Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// LEAVE GROUP DRAWER — allows leaving home group or department with reason
// ============================================================================

const LeaveGroupDrawer = ({ isOpen, onClose, user, type }) => {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLeave = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for leaving.');
            return;
        }

        setIsSubmitting(true);
        try {
            let endpoint, data;
            if (type === 'homegroup') {
                endpoint = '/home-group/leave';
                data = { reason };
            } else {
                endpoint = '/department-request/cancel';
                data = { reason };
            }

            const response = await api.delete(endpoint, { data });

            if (response.data && response.data.success) {
                alert(`${type === 'homegroup' ? 'Home group' : 'Department'} left successfully.`);
                onClose();
                // Refresh user data
                window.location.reload();
            } else {
                alert(response.data?.message || 'Failed to leave');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to leave');
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = type === 'homegroup' ? 'Leave Home Group' : 'Leave Department';
    const currentGroup = type === 'homegroup' ? user?.home_group : user?.department;

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title={title} icon={Icons.ArrowLeft}>
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Leaving</h3>
                    <p className="text-gray-600">
                        Are you sure you want to leave <strong>{currentGroup?.name}</strong>?
                        This action cannot be undone.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for leaving (required)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={`Please explain why you want to leave this ${type}...`}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLeave}
                        disabled={isSubmitting || !reason.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Leaving...' : `Leave ${type === 'homegroup' ? 'Group' : 'Department'}`}
                    </button>
                </div>
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// FEEDBACK DRAWER — allows rating and leaving feedback for the app
// ============================================================================

const FeedbackDrawer = ({ isOpen, onClose, user }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [category, setCategory] = useState("general");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please provide a rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            // For now, just show success. In production, this would send to backend
            alert(`Thank you for your feedback! Rating: ${rating} stars\nFeedback submitted successfully.`);
            onClose();
            setRating(0);
            setFeedback("");
            setCategory("general");
        } catch (err) {
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FeatureDrawer isOpen={isOpen} onClose={onClose} title="Share Feedback" icon={Icons.Star}>
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Icons.Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate Your Experience</h3>
                    <p className="text-gray-600">
                        Help us improve by sharing your feedback about the {user?.role === 'pastor' ? 'Pastor' : user?.role === 'hod' ? 'HOD' : 'Member'} portal.
                    </p>
                </div>

                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Overall Rating
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1"
                            >
                                <svg
                                    className={`w-8 h-8 ${
                                        star <= (hoverRating || rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                    } transition-colors`}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                        </span>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                    >
                        <option value="general">General Experience</option>
                        <option value="features">Features & Functionality</option>
                        <option value="design">Design & Usability</option>
                        <option value="performance">Performance & Speed</option>
                        <option value="support">Support & Help</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Feedback Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Feedback (optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you think, what we can improve, or any suggestions..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </div>
        </FeatureDrawer>
    );
};

// ============================================================================
// MAIN MEMBERS PORTAL COMPONENT
// ============================================================================

export default function MembersPortal({ onLogout }) {
    const user = useCurrentUser();

  // Fetch member dashboard data
  const { data: memberData, isLoading: memberLoading, error: memberError } = useQuery({
      queryKey: ['member-dashboard'],
      queryFn: async () => {
          const res = await api.get('/member/dashboard');
          if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch member dashboard');
          return res.data.data;
      },
      staleTime: 30000,
      cacheTime: 300000,
      refetchOnWindowFocus: true,
      retry: 1,
  });

  // Fetch pending invitations count for badge
  const { data: invitationsData } = useQuery({
      queryKey: ['homegroup-invitations-count'],
      queryFn: async () => {
          const res = await api.get('/homegroup-invitations');
          if (!res.data.success) throw new Error();
          return res.data.invitations || [];
      },
      staleTime: 15000,
      refetchInterval: 30000,
  });

   const pendingInvitationsCount = (invitationsData && invitationsData.filter ? invitationsData.filter(inv => inv.status === 'pending').length : 0) || 0;

    const [activeDrawer,       setActiveDrawer]       = useState(null);
    const [notificationsOpen,  setNotificationsOpen]  = useState(false);

    const handleAction = (id) => setActiveDrawer(id);
    const closeDrawer  = ()   => setActiveDrawer(null);

    return (
        <div className="min-h-screen relative">
            <FloatingParticles />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/30 overflow-hidden bg-white">
                            <img src="/images/favicon.ico" alt="Heartfelt Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Members Portal</h1>
                            <p className="text-gray-500">Welcome to your spiritual home</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell userId={user?.id} />
                        <button onClick={onLogout} className="p-3 rounded-xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Icons.ArrowRightOnRectangle className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </div>

<RegistrationConfirmation user={user} />
                 <MinistryInfoCard user={user} memberData={memberData} />

                 <div className="mt-8"><QuickActions onAction={handleAction} pendingInvitations={pendingInvitationsCount} /></div>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HomegroupSection
                        user={user}
                        onViewHomegroup={() => handleAction('homegroups')}
                        onLeaveHomegroup={() => handleAction('leave-homegroup')}
                    />
                    <DepartmentsSection
                        user={user}
                        onViewDepartments={() => handleAction('departments')}
                        onLeaveDepartment={() => handleAction('leave-department')}
                    />
                </div>
                <div className="mt-8"><EventsSection onRSVP={(id) => console.log('RSVP:', id)} /></div>
            </div>

            <ZoneInfoDrawer       isOpen={activeDrawer === 'view-zone'}         onClose={closeDrawer} user={user} />
            <PastorHODDrawer      isOpen={activeDrawer === 'view-pastor-hod'}  onClose={closeDrawer} user={user} />
            <ReportsDrawer        isOpen={activeDrawer === 'submit-reports'}    onClose={closeDrawer} />
            <InvitationsManager   isOpen={activeDrawer === 'view-invitations'} onClose={closeDrawer} userId={(user && user.id) || 0} />
            <HomeGroupsBrowser     isOpen={activeDrawer === 'homegroups'}       onClose={closeDrawer} user={user} />
            <HomeGroupCommunity   isOpen={activeDrawer === 'homegroup'}        onClose={closeDrawer} homeGroup={user?.home_group} />
            <DepartmentsDrawer    isOpen={activeDrawer === 'departments'}     onClose={closeDrawer} user={user} />
            <LeaveGroupDrawer     isOpen={activeDrawer === 'leave-homegroup'} onClose={closeDrawer} user={user} type="homegroup" />
            <LeaveGroupDrawer     isOpen={activeDrawer === 'leave-department'} onClose={closeDrawer} user={user} type="department" />
            <FeedbackDrawer       isOpen={activeDrawer === 'feedback'}         onClose={closeDrawer} user={user} />
            <NotificationsPanel  isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>
    );
}
