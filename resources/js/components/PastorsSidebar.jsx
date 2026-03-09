import React from "react";

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
    Achievements: ({ className }) => (
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
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
};

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "members", label: "Members", icon: Icons.Users },
    { id: "homegroups", label: "Home Groups", icon: Icons.HomeGroup },
    { id: "departments", label: "Departments", icon: Icons.BuildingOffice },
    { id: "achievements", label: "Achievements", icon: Icons.Achievements },
    { id: "reports", label: "Reports", icon: Icons.DocumentChart },
    { id: "zone", label: "My Zone", icon: Icons.MapPin },
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
}) => {
    const handleItemClick = (itemId) => {
        onItemClick(itemId);
        if (onClose) onClose();
    };
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
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-xl" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
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
