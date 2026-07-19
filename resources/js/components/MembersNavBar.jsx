import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../lib/api";

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

const NAV_ITEMS = [
    { id: "home", label: "Home", icon: "home" },
    { id: "zone", label: "Zone", icon: "mapPin" },
    { id: "homegroup", label: "Connect", icon: "users" },
    { id: "prayer-center", label: "Prayer", icon: "handsPraying" },
    { id: "events", label: "Events", icon: "calendar" },
    { id: "partnership", label: "Partnership", icon: "heart" },
];

// ============================================================================
// ICONS
// ============================================================================

const Icon = ({ name, className = "w-4 h-4" }) => {
    const paths = {
        home: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        ),
        mapPin: (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </>
        ),
        users: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        ),
        handsPraying: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5v-9m0 0l-3.5 3.5m3.5-3.5l3.5 3.5M6.5 13.5l-2 2m14-2l2 2M6.5 10.5l-2-2m14 2l2-2M4.5 9.75v9.75A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75" />
        ),
        calendar: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        ),
        heart: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.385.848-4.5 2.153-1.292-1.513-2.877-2.337-4.718-2.337C3.6 3.75 1.5 5.765 1.5 8.25c0 4.242 3.71 7.5 8.25 11.25 4.5-3.75 8.25-7 8.25-11.25z" />
        ),
        bell: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        ),
        logout: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        ),
        camera: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        ),
        user: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        ),
        trash: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        ),
        close: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ),
    };

    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            {paths[name]}
        </svg>
    );
};

// ============================================================================
// AVATAR
// ============================================================================

const Avatar = ({ user, size = 36, ring = true }) => {
    const initial = (user?.name || "M").charAt(0).toUpperCase();
    const img = user?.profile_photo || user?.profile_picture;
    const dimension = {
        wrapper: { width: size, height: size, fontSize: size * 0.4 },
    };
    return (
        <div
            className={
                "relative rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 select-none " +
                (ring
                    ? "ring-2 ring-white/15 shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                    : "")
            }
            style={{
                width: dimension.wrapper.width,
                height: dimension.wrapper.height,
                background: img
                    ? "transparent"
                    : "linear-gradient(135deg, #d4af37, #f59e0b)",
            }}
        >
            {img ? (
                <img src={img} alt={user?.name || "Member"} className="w-full h-full object-cover" />
            ) : (
                <span
                    className="font-bold text-white tracking-tight"
                    style={{ fontSize: dimension.wrapper.fontSize }}
                >
                    {initial}
                </span>
            )}
            <span
                className="absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-[#0A192F]"
                style={{ width: size * 0.26, height: size * 0.26 }}
            />
        </div>
    );
};

// ============================================================================
// PROFILE PICTURE MODAL
// ============================================================================

export const ProfilePictureModal = ({ user, onClose, onUpdate, onError }) => {
    const [preview, setPreview] = useState(user?.profile_photo || user?.profile_picture || null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const readFile = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        setSuccess(false);
        try {
            const formData = new FormData();
            formData.append("profile_picture", file);
            const response = await api.post("/user/profile-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = response.data?.profile_pic || response.data?.profile_picture || response.data?.url;
            if (!url) throw new Error("No URL returned");
            onUpdate(url);
            setSuccess(true);
            setTimeout(() => onClose(), 900);
        } catch (err) {
            console.error("Upload error:", err);
            onError?.(err?.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        readFile(e.dataTransfer.files?.[0]);
    };

    const removePicture = async () => {
        try {
            await api.delete("/user/profile-picture");
        } catch (_) {
            /* best effort */
        }
        onUpdate(null);
        setPreview(null);
    };

    return (
        <div className="mpm-overlay" onClick={onClose}>
            <div className="mpm-modal" onClick={(e) => e.stopPropagation()}>
                <button className="mpm-close" onClick={onClose} aria-label="Close">
                    <Icon name="close" className="w-4 h-4" />
                </button>

                <div className="text-center mb-5">
                    <h3 className="mpm-title">Profile Picture</h3>
                    <p className="mpm-subtitle">
                        Upload a photo so the community can recognise you.
                    </p>
                </div>

                <div
                    className={"mpm-dropzone" + (dragging ? " is-dragging" : "") + (uploading ? " is-busy" : "")}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="mpm-preview-ring">
                        {preview ? (
                            <img src={preview} alt="Preview" className="mpm-preview-img" />
                        ) : (
                            <div className="mpm-preview-placeholder">
                                <Icon name="camera" className="w-7 h-7" />
                            </div>
                        )}
                    </div>

                    {success ? (
                        <p className="mpm-status mpm-status--ok">Saved successfully</p>
                    ) : uploading ? (
                        <p className="mpm-status">Uploading…</p>
                    ) : (
                        <p className="mpm-status">
                            {preview ? "Click or drop to replace" : "Click or drop an image"}
                        </p>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => readFile(e.target.files?.[0])}
                    />
                </div>

                <div className="mpm-actions">
                    <button
                        className="mpm-btn mpm-btn--primary"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? "Change photo" : "Upload photo"}
                    </button>
                    {preview && (
                        <button
                            className="mpm-btn mpm-btn--ghost"
                            disabled={uploading}
                            onClick={removePicture}
                        >
                            <Icon name="trash" className="w-4 h-4" />
                            Remove
                        </button>
                    )}
                </div>

                <p className="mpm-hint">JPG, PNG or GIF · up to 4 MB</p>
            </div>
        </div>
    );
};

// ============================================================================
// PROFILE MENU (avatar + dropdown)
// ============================================================================

const ProfileMenu = ({ user, alertCount, onAlerts, onNavigate, onLogout, onOpenUpload, onProfile }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const name = user?.name || "Member";
    const email = user?.email || "";

    return (
        <div className="relative" ref={ref}>
            <button
                className="mpm-avatar-btn"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Avatar user={user} size={38} />
                <span className="hidden lg:flex flex-col items-start leading-tight mr-1">
                    <span className="mpm-avatar-name">{name}</span>
                    <span className="mpm-avatar-role">Member</span>
                </span>
                <svg className={"mpm-chevron" + (open ? " is-open" : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {open && (
                <div className="mpm-dropdown" role="menu">
                    <div className="mpm-dropdown-head">
                        <Avatar user={user} size={48} />
                        <div className="min-w-0">
                            <p className="mpm-dropdown-name">{name}</p>
                            <p className="mpm-dropdown-email truncate">{email}</p>
                        </div>
                    </div>

                    <button
                        className="mpm-menu-item"
                        onClick={() => { setOpen(false); onOpenUpload(); }}
                    >
                        <span className="mpm-menu-icon mpm-menu-icon--gold">
                            <Icon name="camera" className="w-4 h-4" />
                        </span>
                        <span className="flex-1 text-left">Change profile picture</span>
                    </button>

                    <button
                        className="mpm-menu-item"
                        onClick={() => { setOpen(false); onProfile?.(); }}
                    >
                        <span className="mpm-menu-icon">
                            <Icon name="user" className="w-4 h-4" />
                        </span>
                        <span className="flex-1 text-left">View profile</span>
                    </button>

                    <button
                        className="mpm-menu-item"
                        onClick={() => { setOpen(false); onAlerts?.(); }}
                    >
                        <span className="mpm-menu-icon">
                            <Icon name="bell" className="w-4 h-4" />
                        </span>
                        <span className="flex-1 text-left">Notifications</span>
                        {alertCount > 0 && <span className="mpm-count">{alertCount}</span>}
                    </button>

                    <div className="mpm-divider" />

                    <button
                        className="mpm-menu-item mpm-menu-item--danger"
                        onClick={() => { setOpen(false); onLogout?.(); }}
                    >
                        <span className="mpm-menu-icon mpm-menu-icon--danger">
                            <Icon name="logout" className="w-4 h-4" />
                        </span>
                        <span className="flex-1 text-left">Sign out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN NAVBAR
// ============================================================================

export default function MembersNavBar({ user, activeTab, onNavigate, alertCount, onAlerts, onLogout, onProfile, onUpload }) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleUploadUpdate = (url) => {
        onUpload?.(url);
        setError(null);
    };

    return (
        <>
            <nav className="mpm-nav">
                <div className="mpm-nav-inner">
                    <div className="mpm-brand">
                        <img src="/images/logo.webp" alt="HIM" className="mpm-logo" />
                    </div>

                    <div className="mpm-tabs">
                        {NAV_ITEMS.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={"mpm-tab" + (active ? " is-active" : "")}
                                >
                                    <Icon name={item.icon} className="mpm-tab-icon" />
                                    <span className="mpm-tab-label">{item.label}</span>
                                    <span className="mpm-tab-indicator" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="mpm-right">
                        <button
                            className="mpm-icon-btn"
                            onClick={onAlerts}
                            title="Alerts"
                            aria-label="Alerts"
                        >
                            <Icon name="bell" className="w-[18px] h-[18px]" />
                            {alertCount > 0 && <span className="mpm-badge">{alertCount}</span>}
                        </button>

                        <ProfileMenu
                            user={user}
                            alertCount={alertCount}
                            onAlerts={onAlerts}
                            onNavigate={onNavigate}
                            onLogout={onLogout}
                            onProfile={onProfile}
                            onOpenUpload={() => setUploadOpen(true)}
                        />
                    </div>
                </div>
            </nav>

            {uploadOpen && (
                <ProfilePictureModal
                    user={user}
                    onClose={() => setUploadOpen(false)}
                    onUpdate={handleUploadUpdate}
                    onError={setError}
                />
            )}

            {error && (
                <div className="mpm-toast" onClick={() => setError(null)}>
                    {error}
                </div>
            )}
        </>
    );
}

// ============================================================================
// STYLES
// ============================================================================

export const membersNavStyles = `
.mpm-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(10, 25, 47, 0.72);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}
.mpm-nav-inner {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1rem;
    height: 4rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

/* Brand */
.mpm-brand { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.mpm-logo { height: 3.5rem; width: auto; }
.mpm-brand-text {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-weight: 700;
    letter-spacing: 0.18em;
    font-size: 0.85rem;
    background: linear-gradient(135deg, #d4af37, #f59e0b);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Tabs */
.mpm-tabs {
    display: none;
    align-items: center;
    gap: 0.15rem;
    margin-left: 0.5rem;
}
@media (min-width: 1024px) {
    .mpm-tabs { display: flex; }
}
.mpm-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.85rem;
    border: none;
    background: transparent;
    border-radius: 0.7rem;
    color: #9ca3af;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: color 0.25s ease, background 0.25s ease, transform 0.2s ease;
}
.mpm-tab:hover {
    color: #f3f4f6;
    background: rgba(255, 255, 255, 0.06);
}
.mpm-tab.is-active { color: #ffffff; background: rgba(212, 175, 55, 0.12); }
.mpm-tab-icon { width: 1.05rem; height: 1.05rem; transition: transform 0.25s ease; }
.mpm-tab:hover .mpm-tab-icon { transform: translateY(-1px); }
.mpm-tab-label { white-space: nowrap; }
.mpm-tab-indicator {
    position: absolute;
    left: 50%;
    bottom: -1px;
    height: 2px;
    width: 0;
    transform: translateX(-50%);
    border-radius: 2px;
    background: linear-gradient(90deg, #d4af37, #f59e0b);
    transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.mpm-tab.is-active .mpm-tab-indicator { width: 60%; }
.mpm-tab.is-active .mpm-tab-icon { color: #f0c66b; }

/* Right cluster */
.mpm-right { margin-left: auto; display: flex; align-items: center; gap: 0.4rem; }

.mpm-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    border-radius: 0.8rem;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.25s ease;
}
.mpm-icon-btn:hover {
    color: #ffffff;
    background: rgba(212, 175, 55, 0.15);
    border-color: rgba(212, 175, 55, 0.35);
    transform: translateY(-1px);
}
.mpm-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ef4444, #e11d48);
    color: #fff;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 999px;
    box-shadow: 0 0 0 2px rgba(10, 25, 47, 1);
}

/* Avatar button + dropdown */
.mpm-avatar-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem 0.3rem 0.3rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    border-radius: 0.9rem;
    cursor: pointer;
    transition: all 0.25s ease;
}
.mpm-avatar-btn:hover {
    border-color: rgba(212, 175, 55, 0.4);
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-1px);
}
.mpm-avatar-name { font-size: 0.78rem; font-weight: 600; color: #f3f4f6; }
.mpm-avatar-role { font-size: 0.65rem; color: #94a3b8; letter-spacing: 0.03em; }
.mpm-chevron { width: 0.85rem; height: 0.85rem; color: #94a3b8; transition: transform 0.25s ease; }
.mpm-chevron.is-open { transform: rotate(180deg); }

.mpm-dropdown {
    position: absolute;
    top: calc(100% + 0.6rem);
    right: 0;
    width: 17rem;
    padding: 0.6rem;
    background: rgba(17, 36, 64, 0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.1rem;
    box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.6);
    animation: mpm-drop 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: top right;
}
@keyframes mpm-drop {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.mpm-dropdown-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    margin-bottom: 0.4rem;
}
.mpm-dropdown-name { font-size: 0.9rem; font-weight: 700; color: #fff; }
.mpm-dropdown-email { font-size: 0.72rem; color: #94a3b8; }
.mpm-menu-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.6rem 0.6rem;
    border: none;
    background: transparent;
    border-radius: 0.7rem;
    color: #e2e8f0;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}
.mpm-menu-item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.mpm-menu-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.6rem;
    background: rgba(255, 255, 255, 0.06);
    color: #cbd5e1;
    transition: all 0.2s ease;
}
.mpm-menu-icon--gold { background: rgba(212, 175, 55, 0.15); color: #f0c66b; }
.mpm-menu-item:hover .mpm-menu-icon { transform: scale(1.05); }
.mpm-menu-item--danger { color: #fca5a5; }
.mpm-menu-item--danger:hover { background: rgba(239, 68, 68, 0.12); color: #fecaca; }
.mpm-menu-icon--danger { background: rgba(239, 68, 68, 0.12); color: #fca5a5; }
.mpm-count {
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ef4444, #e11d48);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    border-radius: 999px;
}
.mpm-divider { height: 1px; background: rgba(255, 255, 255, 0.07); margin: 0.4rem 0.2rem; }

/* Upload modal */
.mpm-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(5, 12, 24, 0.72);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: mpm-fade 0.2s ease;
}
@keyframes mpm-fade { from { opacity: 0; } to { opacity: 1; } }
.mpm-modal {
    position: relative;
    width: 100%;
    max-width: 24rem;
    padding: 1.75rem;
    background: linear-gradient(180deg, rgba(23, 42, 72, 0.98), rgba(13, 26, 46, 0.98));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7);
    animation: mpm-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes mpm-pop {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.mpm-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    color: #cbd5e1;
    border-radius: 0.6rem;
    cursor: pointer;
    transition: all 0.2s ease;
}
.mpm-close:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
.mpm-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.01em;
}
.mpm-subtitle { font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem; }
.mpm-dropzone {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    padding: 1.5rem;
    border: 1.5px dashed rgba(255, 255, 255, 0.16);
    border-radius: 1.1rem;
    cursor: pointer;
    transition: all 0.25s ease;
    background: rgba(255, 255, 255, 0.02);
}
.mpm-dropzone:hover, .mpm-dropzone.is-dragging {
    border-color: rgba(212, 175, 55, 0.6);
    background: rgba(212, 175, 55, 0.06);
}
.mpm-dropzone.is-busy { cursor: progress; opacity: 0.85; }
.mpm-preview-ring {
    width: 6.5rem;
    height: 6.5rem;
    border-radius: 1.6rem;
    padding: 3px;
    background: linear-gradient(135deg, #d4af37, #0ea5e9);
}
.mpm-preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 1.35rem; }
.mpm-preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: #d4af37;
}
.mpm-status { font-size: 0.76rem; color: #cbd5e1; font-weight: 500; }
.mpm-status--ok { color: #34d399; font-weight: 600; }
.mpm-actions { display: flex; gap: 0.6rem; margin-top: 1.25rem; }
.mpm-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.65rem 1rem;
    border: none;
    border-radius: 0.8rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
}
.mpm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.mpm-btn--primary {
    background: linear-gradient(135deg, #d4af37, #f59e0b);
    color: #1a1206;
    box-shadow: 0 8px 20px -8px rgba(212, 175, 55, 0.6);
}
.mpm-btn--primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
.mpm-btn--ghost {
    flex: 0 0 auto;
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
}
.mpm-btn--ghost:hover:not(:disabled) { background: rgba(239, 68, 68, 0.18); }
.mpm-hint { text-align: center; font-size: 0.68rem; color: #64748b; margin-top: 1rem; }

/* Toast */
.mpm-toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
    padding: 0.7rem 1.2rem;
    background: rgba(239, 68, 68, 0.92);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 0.8rem;
    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    animation: mpm-drop 0.2s ease;
}
`;
