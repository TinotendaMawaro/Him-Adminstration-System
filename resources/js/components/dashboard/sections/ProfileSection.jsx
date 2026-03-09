import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    User: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    Mail: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    Phone: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    Shield: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
    ),
    Clock: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Cog: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Upload: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    Camera: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
    ),
    X: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    ChevronRight: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    ),
    Edit: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
};

// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================

const RoleBadge = ({ role }) => {
    const roleConfig = {
        pastor: {
            bg: "from-violet-500 to-violet-700",
            text: "violet",
            label: "Zone Pastor",
            icon: Icons.Shield,
        },
        hod: {
            bg: "from-amber-500 to-amber-700",
            text: "amber",
            label: "Head of Department",
            icon: Icons.User,
        },
        admin: {
            bg: "from-rose-500 to-rose-700",
            text: "rose",
            label: "Administrator",
            icon: Icons.Shield,
        },
        member: {
            bg: "from-sky-500 to-sky-700",
            text: "sky",
            label: "Member",
            icon: Icons.User,
        },
        partner: {
            bg: "from-emerald-500 to-emerald-700",
            text: "emerald",
            label: "Partner",
            icon: Icons.User,
        },
    };

    const config = roleConfig[role] || roleConfig.member;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.bg} text-white shadow-lg shadow-${config.text}-500/30`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-semibold">{config.label}</span>
        </div>
    );
};

// ============================================================================
// ACTIVITY TIMELINE ITEM
// ============================================================================

const ActivityItem = ({ activity, index }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'report': return Icons.Mail;
            case 'achievement': return Icons.Shield;
            case 'member': return Icons.User;
            case 'zone': return Icons.MapPin;
            default: return Icons.Clock;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'report': return 'from-sky-400 to-sky-600';
            case 'achievement': return 'from-gold-400 to-gold-600';
            case 'member': return 'from-emerald-400 to-emerald-600';
            case 'zone': return 'from-violet-400 to-violet-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const Icon = getIcon(activity.type);

    return (
        <div 
            className="relative flex gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="relative z-10 flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(activity.type)} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="flex-1 pb-6">
                <div className="p-4 rounded-2xl bg-white/60 hover:bg-white/80 border border-gray-100/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{activity.time}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ZONE HISTORY TIMELINE
// ============================================================================

const ZoneHistoryItem = ({ history, index, isCurrent }) => {
    return (
        <div 
            className="relative flex gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="relative z-10 flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isCurrent ? 'bg-gradient-to-br from-gold-400 to-gold-600' : 'bg-gradient-to-br from-slate-400 to-slate-600'}`}>
                    <Icons.MapPin className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="flex-1 pb-6">
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${isCurrent ? 'bg-white/80 border-gold-200/50' : 'bg-white/60 border-gray-100/50'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{history.zoneName}</h4>
                                {isCurrent && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-700">
                                        Current
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {history.startDate} {history.endDate ? ` - ${history.endDate}` : ' - Present'}
                            </p>
                            {history.notes && (
                                <p className="text-xs text-gray-400 mt-2">{history.notes}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// PROFILE PHOTO UPLOAD COMPONENT
// ============================================================================

const ProfilePhotoUpload = ({ 
    currentPhoto, 
    name, 
    onUpload, 
    onUseAvatar,
    isUploading 
}) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [showOptions, setShowOptions] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        const file = fileInputRef.current?.files[0];
        if (file) {
            onUpload(file);
            setShowOptions(false);
        }
    };

    const displayPhoto = preview || currentPhoto;
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="relative">
            {/* Avatar/Photo Display */}
            <div className="relative inline-block">
                {/* Glow Effect */}
                <div className="absolute -inset-3 bg-gradient-to-r from-gold-400 via-sky-400 to-violet-400 rounded-full opacity-60 blur-xl animate-pulse"></div>
                
                {/* Photo Container */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                    {displayPhoto ? (
                        <img 
                            src={displayPhoto} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">{initials}</span>
                        </div>
                    )}
                </div>

                {/* Camera Overlay on Hover */}
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                >
                    <Icons.Camera className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Options Dropdown */}
            {showOptions && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 min-w-[200px] z-50 animate-fade-in">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Icons.Upload className="w-5 h-5 text-sky-500" />
                        <span className="font-medium">
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            onUseAvatar();
                            setShowOptions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Icons.User className="w-5 h-5 text-violet-500" />
                        <span className="font-medium">Use Avatar</span>
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Save Button (when preview is ready) */}
            {preview && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                        {isUploading ? 'Saving...' : 'Save Photo'}
                    </button>
                    <button
                        onClick={() => {
                            setPreview(null);
                            setShowOptions(false);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => {
    const isActive = activeTab === id;
    
    return (
        <button
            onClick={() => onClick(id)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-gold-500' : ''}`} />
            <span>{label}</span>
            {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-gold-400 to-sky-400 rounded-full"></div>
            )}
        </button>
    );
};

// ============================================================================
// CONTACT DETAILS TAB
// ============================================================================

const ContactDetailsTab = ({ user, onUpdate, isSaving }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        location: user?.location || '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                        isEditing 
                            ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white hover:shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {isEditing ? (
                        <>
                            <Icons.Check className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </>
                    ) : (
                        <>
                            <Icons.Edit className="w-4 h-4" />
                            Edit
                        </>
                    )}
                </button>
            </div>

            <div className="grid gap-4">
                {/* Name */}
                <div className="p-4 rounded-2xl bg-white/60 border border-gray-100/50">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                    <div className="mt-1">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-transparent text-lg font-semibold text-gray-900 border-b-2 border-gold-400 focus:outline-none py-1"
                            />
                        ) : (
                            <p className="text-lg font-semibold text-gray-900">{user?.name || 'Not set'}</p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="p-4 rounded-2xl bg-white/60 border border-gray-100/50">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="mt-1 flex items-center gap-2">
                        <Icons.Mail className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-gray-900 border-b-2 border-gold-400 focus:outline-none py-1"
                            />
                        ) : (
                            <p className="text-gray-900">{user?.email || 'Not set'}</p>
                        )}
                    </div>
                </div>

                {/* Phone */}
                <div className="p-4 rounded-2xl bg-white/60 border border-gray-100/50">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <div className="mt-1 flex items-center gap-2">
                        <Icons.Phone className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-gray-900 border-b-2 border-gold-400 focus:outline-none py-1"
                            />
                        ) : (
                            <p className="text-gray-900">{user?.phone || 'Not set'}</p>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div className="p-4 rounded-2xl bg-white/60 border border-gray-100/50">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                    <div className="mt-1 flex items-center gap-2">
                        <Icons.MapPin className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="flex-1 bg-transparent text-gray-900 border-b-2 border-gold-400 focus:outline-none py-1 resize-none"
                            />
                        ) : (
                            <p className="text-gray-900">{user?.address || 'Not set'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ZONE ASSIGNED TAB
// ============================================================================

const ZoneAssignedTab = ({ user, zoneHistory = [] }) => {
    // Sample zone history if empty
    const history = zoneHistory.length > 0 ? zoneHistory : [
        { id: 1, zoneName: user?.zone?.name || 'IOC Zone', startDate: 'Jan 2024', endDate: null, notes: 'Currently serving as Zone Pastor', isCurrent: true },
        { id: 2, zoneName: 'South Zone', startDate: 'Jun 2022', endDate: 'Dec 2023', notes: 'Completed tenure as Zone Pastor', isCurrent: false },
        { id: 3, zoneName: 'East Zone', startDate: 'Jan 2020', endDate: 'May 2022', notes: 'First zonal assignment', isCurrent: false },
    ];

    const currentZone = history.find(h => h.isCurrent) || history[0];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Current Zone Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-400/20 to-sky-400/20 border border-gold-200/50">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-gold-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl"></div>
                <div className="relative p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                            <Icons.MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Currently Assigned Zone</p>
                            <h3 className="text-2xl font-bold text-gray-900">{currentZone?.zoneName || 'Not Assigned'}</h3>
                            <p className="text-sm text-gray-500 mt-1">Since {currentZone?.startDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone History Timeline */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Assignment History</h3>
                <div className="relative">
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-sky-400 to-gray-200"></div>
                    <div className="space-y-2">
                        {history.map((item, idx) => (
                            <ZoneHistoryItem 
                                key={item.id} 
                                history={item} 
                                index={idx} 
                                isCurrent={item.isCurrent} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ROLE LEVEL TAB
// ============================================================================

const RoleLevelTab = ({ user }) => {
    const getRoleInfo = (role) => {
        const roles = {
            pastor: {
                level: 1,
                title: 'Zone Pastor',
                description: 'Full responsibility over a zone',
                color: 'from-violet-500 to-violet-700',
                permissions: ['Manage Zone', 'Appoint HODs', 'Submit Reports', 'Manage Members'],
            },
            hod: {
                level: 2,
                title: 'Head of Department',
                description: 'Leadership over a department',
                color: 'from-amber-500 to-amber-700',
                permissions: ['Manage Department', 'Submit Reports', 'Track Members'],
            },
            admin: {
                level: 3,
                title: 'Administrator',
                description: 'System administration',
                color: 'from-rose-500 to-rose-700',
                permissions: ['Full Access', 'Manage Users', 'View All Reports'],
            },
        };
        return roles[role] || roles.admin;
    };

    const roleInfo = getRoleInfo(user?.role);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Current Role Card */}
            <div className="p-6 rounded-2xl bg-white/60 border border-gray-100/50">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center shadow-lg`}>
                        <Icons.Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <RoleBadge role={user?.role} />
                        <p className="text-sm text-gray-500 mt-1">{roleInfo.description}</p>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions & Access</h3>
                <div className="grid gap-3">
                    {roleInfo.permissions.map((permission, idx) => (
                        <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100/50"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                <Icons.Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700">{permission}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Info */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-gray-100/50">
                        <span className="text-gray-500">User ID</span>
                        <span className="font-mono text-sm text-gray-900">#{user?.id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-gray-100/50">
                        <span className="text-gray-500">Unique Code</span>
                        <span className="font-mono text-sm text-gray-900">{user?.unique_code || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-gray-100/50">
                        <span className="text-gray-500">Account Status</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ACTIVITY HISTORY TAB
// ============================================================================

const ActivityHistoryTab = ({ user }) => {
    const activities = [
        { id: 1, type: 'report', title: 'Weekly Report Submitted', description: 'Week 12 statistics recorded for IOC Zone', time: '2 hours ago' },
        { id: 2, type: 'achievement', title: 'Achievement Recorded', description: 'Youth Service milestone achieved', time: '1 day ago' },
        { id: 3, type: 'member', title: 'New Member Registered', description: 'Sarah Johnson added to North A Home Group', time: '2 days ago' },
        { id: 4, type: 'zone', title: 'Zone Visit Completed', description: 'Visited 3 home groups in Eastern Region', time: '3 days ago' },
        { id: 5, type: 'report', title: 'Monthly Report Approved', description: 'February report reviewed by Regional Pastor', time: '1 week ago' },
        { id: 6, type: 'member', title: 'Member Transferred', description: 'John Doe transferred from South Zone', time: '2 weeks ago' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                    {activities.length} activities
                </span>
            </div>

            <div className="relative">
                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-sky-400 to-gray-200"></div>
                <div className="space-y-2">
                    {activities.map((activity, idx) => (
                        <ActivityItem key={activity.id} activity={activity} index={idx} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// SETTINGS TAB
// ============================================================================

const SettingsTab = ({ user, onUpdate, isSaving }) => {
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: true,
        weeklyDigest: false,
        memberReminders: true,
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>

            {/* Notification Settings */}
            <div className="p-4 rounded-2xl bg-white/60 border border-gray-100/50">
                <h4 className="font-medium text-gray-900 mb-4">Notifications</h4>
                <div className="space-y-3">
                    {Object.entries(settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                                onClick={() => toggleSetting(key)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    value ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-gray-200'
                                }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                    value ? 'translate-x-7' : 'translate-x-1'
                                }`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/50">
                <h4 className="font-medium text-rose-700 mb-4">Danger Zone</h4>
                <div className="space-y-3">
                    <button className="w-full py-2 px-4 rounded-xl bg-white border border-rose-200 text-rose-600 font-medium hover:bg-rose-50 transition-colors">
                        Change Password
                    </button>
                    <button className="w-full py-2 px-4 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PROFILE SECTION COMPONENT
// ============================================================================

export default function ProfileSection({ user, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('contact');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const tabs = [
        { id: 'contact', label: 'Contact', icon: Icons.User },
        { id: 'zone', label: 'Zone', icon: Icons.MapPin },
        { id: 'role', label: 'Role', icon: Icons.Shield },
        { id: 'activity', label: 'Activity', icon: Icons.Clock },
        { id: 'settings', label: 'Settings', icon: Icons.Cog },
    ];

    const handleProfileUpdate = async (data) => {
        setIsSaving(true);
        try {
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onUpdate?.(data);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (file) => {
        setIsUploading(true);
        try {
            // Simulate upload - replace with actual upload logic
            await new Promise(resolve => setTimeout(resolve, 1500));
            const photoUrl = URL.createObjectURL(file);
            onUpdate?.({ profile_photo: photoUrl });
        } catch (error) {
            console.error('Failed to upload photo:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUseAvatar = () => {
        onUpdate?.({ profile_photo: null });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'contact':
                return <ContactDetailsTab user={user} onUpdate={handleProfileUpdate} isSaving={isSaving} />;
            case 'zone':
                return <ZoneAssignedTab user={user} />;
            case 'role':
                return <RoleLevelTab user={user} />;
            case 'activity':
                return <ActivityHistoryTab user={user} />;
            case 'settings':
                return <SettingsTab user={user} onUpdate={handleProfileUpdate} isSaving={isSaving} />;
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-full">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-sky-400/5 to-violet-400/5"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl"></div>

            <div className="relative p-6 lg:p-8">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-gray-500 mt-1">Manage your personal information</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Icons.X className="w-6 h-6 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Glass Profile Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative p-6 lg:p-8 bg-gradient-to-br from-white/80 to-white/40">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            {/* Photo Upload */}
                            <ProfilePhotoUpload
                                currentPhoto={user?.profile_photo}
                                name={user?.name}
                                onUpload={handlePhotoUpload}
                                onUseAvatar={handleUseAvatar}
                                isUploading={isUploading}
                            />

                            {/* User Info */}
                            <div className="text-center lg:text-left flex-1">
                                <h3 className="text-2xl font-bold text-gray-900">{user?.name || 'User Name'}</h3>
                                <p className="text-gray-500 mt-1">{user?.email || 'email@example.com'}</p>
                                <div className="mt-3">
                                    <RoleBadge role={user?.role} />
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                <div className="text-center p-3 rounded-xl bg-white/60 border border-gray-100/50">
                                    <p className="text-2xl font-bold text-gray-900">245</p>
                                    <p className="text-xs text-gray-500">Members</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/60 border border-gray-100/50">
                                    <p className="text-2xl font-bold text-gray-900">12</p>
                                    <p className="text-xs text-gray-500">Home Groups</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/60 border border-gray-100/50">
                                    <p className="text-2xl font-bold text-gray-900">8</p>
                                    <p className="text-xs text-gray-500">Depts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="px-4 lg:px-6 border-b border-gray-100/50">
                        <div className="flex overflow-x-auto gap-1 pb-0 scrollbar-hide">
                            {tabs.map((tab) => (
                                <TabButton
                                    key={tab.id}
                                    {...tab}
                                    activeTab={activeTab}
                                    onClick={setActiveTab}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 lg:p-8">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

