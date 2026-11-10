import React, { useState } from "react";

// ============================================================================
// PREMIUM ICONS
// ============================================================================

const Icons = {
    Dashboard: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
        </svg>
    ),
    Users: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
        </svg>
    ),
    HomeGroup: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
        </svg>
    ),
    BuildingOffice: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
        </svg>
    ),
    HandCoins: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
        </svg>
    ),
    UserCircle: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
        </svg>
    ),
    DocumentChart: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
        </svg>
    ),
    HandsPraying: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.5v-9m0 0l-3.5 3.5m3.5-3.5l3.5 3.5M6.5 13.5l-2 2m14-2l2 2M6.5 10.5l-2-2m14 2l2-2M4.5 9.75v9.75A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75"
            />
        </svg>
    ),
};

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "members", label: "Members", icon: Icons.Users },
    { id: "homegroups", label: "Home Groups", icon: Icons.HomeGroup },
    { id: "prayer-center", label: "Prayer Center", icon: Icons.HandsPraying },
    { id: "departments", label: "Departments", icon: Icons.BuildingOffice },
    { id: "partnership", label: "Partnership", icon: Icons.HandCoins },
    { id: "reports", label: "Reports", icon: Icons.DocumentChart },
    { id: "zone", label: "My Zone", icon: Icons.MapPin },
    { id: "idcard", label: "My ID Card", icon: Icons.Dashboard },
];

// ============================================================================
// PREMIUM SIDEBAR COMPONENT
// ============================================================================

const PastorsSidebar = ({
    activeItem,
    onItemClick,
    user,
    onLogout,
    isOpen = true,
    onClose,
    isMobile = false,
}) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const handleItemClick = (itemId) => {
        onItemClick(itemId);
        if (onClose) onClose();
    };

// Mobile Bottom Tab Navigation
    if (isMobile) {
        const remainingItems = menuItems.slice(5);

        return (
            <>
                {/* Mobile Bottom Tab Bar */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg lg:hidden safe-area-pb">
                    <div className="flex items-center justify-around px-2 py-2">
                        {menuItems.slice(0, 5).map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                                        isActive 
                                            ? "text-gold-600 bg-gold-50" 
                                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-gold-100" : ""}`}>
                                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                                        {isActive && (
                                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium mt-1 ${isActive ? "text-gold-600" : "text-gray-500"}`}>
                                        {item.label.split(' ')[0]}
                                    </span>
                                </button>
                            );
                        })}
                        {/* More button to show additional items */}
                        <button
                            onClick={() => handleItemClick('more')}
                            className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-1.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 mt-1">More</span>
                        </button>
                    </div>
                </nav>

                {/* More Menu Drawer */}
                {showMoreMenu && (
                    <div className="fixed inset-0 z-[60] lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowMoreMenu(false)}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 pb-20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">More Options</h3>
                                <button
                                    onClick={() => setShowMoreMenu(false)}
                                    className="p-1 rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {remainingItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeItem === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                handleItemClick(item.id);
                                                setShowMoreMenu(false);
                                            }}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                                                isActive 
                                                    ? "text-gold-600 bg-gold-50" 
                                                    : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-[10px] font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Desktop Sidebar
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-br from-gray-900 via-gray-900 to-sky-900/80 border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col overflow-hidden`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-sky-900/80"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src="/images/favicon.ico"
                                    alt="HIM Logo"
                                    className="w-14 h-14 object-contain"
                                />
                            </div>
                            <div>
                                {/* <p className="text-white font-bold text-lg">
                                    HIM
                                </p> */}
                                <p className="text-sky-300/80 text-xs font-medium">
                                    Pastoral Portal
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mx-4 mt-5 p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.MapPin className="w-4 h-4 text-gold-400" />
                            <p className="text-sky-200/80 text-xs font-semibold uppercase tracking-wider">
                                Active Zone
                            </p>
                        </div>
                        <p className="text-white font-bold text-lg">
                            {user?.zone?.name || user?.zoneName || "IOC"}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-1 flex-1 max-w-[60px] bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"></div>
                            <span className="text-xs text-white/40">
                                Zone Pastor
                            </span>
                        </div>
                    </div>
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-6">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onItemClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative hover:scale-[1.02] ${isActive ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-xl" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full"></div>
                                    )}
                                    <Icon
                                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gold-400"}`}
                                    />
                                    <span
                                        className={`font-medium transition-all duration-300 ${isActive ? "text-white" : "group-hover:text-white"}`}
                                    >
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg shadow-rose-500/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default PastorsSidebar;
