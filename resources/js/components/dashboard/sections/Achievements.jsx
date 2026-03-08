import { useState, useEffect } from "react";

// Animated Achievement Badge Component
function AchievementBadge({ achievement, index }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Staggered animation on mount
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, index * 100);
        return () => clearTimeout(timer);
    }, [index]);

    const getBadgeColor = (tier) => {
        switch (tier) {
            case "platinum":
                return {
                    bg: "from-slate-300 to-slate-500",
                    border: "border-slate-400",
                    glow: "shadow-slate-400/30",
                    icon: "text-white",
                };
            case "gold":
                return {
                    bg: "from-yellow-300 to-yellow-500",
                    border: "border-yellow-400",
                    glow: "shadow-yellow-400/30",
                    icon: "text-white",
                };
            case "silver":
                return {
                    bg: "from-gray-300 to-gray-400",
                    border: "border-gray-400",
                    glow: "shadow-gray-400/30",
                    icon: "text-white",
                };
            case "bronze":
                return {
                    bg: "from-orange-300 to-orange-500",
                    border: "border-orange-400",
                    glow: "shadow-orange-400/30",
                    icon: "text-white",
                };
            default:
                return {
                    bg: "from-sky-300 to-sky-500",
                    border: "border-sky-400",
                    glow: "shadow-sky-400/30",
                    icon: "text-white",
                };
        }
    };

    const colors = getBadgeColor(achievement.tier || "gold");

    return (
        <div
            className={`relative transition-all duration-500 transform ${
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow effect on hover */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} rounded-3xl blur-lg opacity-0 transition-opacity duration-300 ${
                    isHovered ? "opacity-50" : ""
                }`}
            />

            {/* Badge card */}
            <div
                className={`relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border-2 ${colors.border} transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden`}
            >
                {/* Shimmer effect */}
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full transition-transform duration-1000 ${
                        isHovered ? "translate-x-full" : ""
                    }`}
                />

                {/* Content */}
                <div className="relative flex flex-col items-center text-center">
                    {/* Icon */}
                    <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow} mb-3 transition-transform duration-300 ${
                            isHovered ? "scale-110" : ""
                        }`}
                    >
                        {achievement.icon ? (
                            <span className="text-2xl">{achievement.icon}</span>
                        ) : (
                            <svg
                                className={`w-7 h-7 ${colors.icon}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {achievement.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-gray-500 mb-2">
                        {achievement.description}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-400">{achievement.date}</p>

                    {/* Tier badge */}
                    <div
                        className={`mt-3 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r ${colors.bg} ${colors.icon}`}
                    >
                        {achievement.tier || "Gold"}
                    </div>
                </div>

                {/* Locked state overlay */}
                {achievement.locked && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main Achievements Section
export default function Achievements({ achievements = [] }) {
    const [filter, setFilter] = useState("all");
    const [showLocked, setShowLocked] = useState(false);

    // Sample achievements if none provided
    const sampleAchievements =
        achievements.length > 0
            ? achievements
            : [
                  {
                      id: 1,
                      title: "Membership Milestone",
                      description: "Reached 250 active members",
                      date: "Dec 2024",
                      tier: "platinum",
                      icon: "👥",
                      unlocked: true,
                  },
                  {
                      id: 2,
                      title: "Home Group Champion",
                      description: "Established 20+ home groups",
                      date: "Nov 2024",
                      tier: "gold",
                      icon: "🏠",
                      unlocked: true,
                  },
                  {
                      id: 3,
                      title: "Spiritual Growth",
                      description: "50 new believers baptized",
                      date: "Oct 2024",
                      tier: "gold",
                      icon: "🕊️",
                      unlocked: true,
                  },
                  {
                      id: 4,
                      title: "Department Excellence",
                      description: "All departments fully operational",
                      date: "Sep 2024",
                      tier: "silver",
                      icon: "🏆",
                      unlocked: true,
                  },
                  {
                      id: 5,
                      title: "Community Impact",
                      description: "500+ community hours served",
                      date: "Aug 2024",
                      tier: "silver",
                      icon: "🤝",
                      unlocked: true,
                  },
                  {
                      id: 6,
                      title: "Youth Revival",
                      description: "Youth attendance doubled",
                      date: "Jul 2024",
                      tier: "bronze",
                      icon: "🔥",
                      unlocked: true,
                  },
                  {
                      id: 7,
                      title: "Worship Excellence",
                      description: "Launched worship team",
                      date: "Jun 2024",
                      tier: "bronze",
                      icon: "🎵",
                      unlocked: true,
                  },
                  {
                      id: 8,
                      title: "Zone Pioneer",
                      description:
                          "First zone to reach 100% home group coverage",
                      tier: "gold",
                      icon: "🌟",
                      locked: true,
                  },
                  {
                      id: 9,
                      title: "Mentorship Master",
                      description: "Train 50 cell group leaders",
                      tier: "silver",
                      icon: "📚",
                      locked: true,
                  },
                  {
                      id: 10,
                      title: "Outreach Champion",
                      description: "Conduct 100 evangelism sessions",
                      tier: "platinum",
                      icon: "📢",
                      locked: true,
                  },
                  {
                      id: 11,
                      title: "Unity Award",
                      description: "Zone unity score above 95%",
                      tier: "gold",
                      icon: "💫",
                      locked: true,
                  },
                  {
                      id: 12,
                      title: "Heritage Builder",
                      description: "Establish 10 generational ministries",
                      tier: "platinum",
                      icon: "🏛️",
                      locked: true,
                  },
              ];

    // Filter achievements
    const filteredAchievements = sampleAchievements.filter((a) => {
        if (!showLocked && a.locked) return false;
        if (filter === "all") return true;
        if (filter === "unlocked") return !a.locked;
        if (filter === "locked") return a.locked;
        return a.tier === filter;
    });

    // Calculate stats
    const totalAchievements = sampleAchievements.length;
    const unlockedCount = sampleAchievements.filter((a) => !a.locked).length;
    const progress = Math.round((unlockedCount / totalAchievements) * 100);

    const tierCounts = {
        platinum: sampleAchievements.filter(
            (a) => a.tier === "platinum" && !a.locked,
        ).length,
        gold: sampleAchievements.filter((a) => a.tier === "gold" && !a.locked)
            .length,
        silver: sampleAchievements.filter(
            (a) => a.tier === "silver" && !a.locked,
        ).length,
        bronze: sampleAchievements.filter(
            (a) => a.tier === "bronze" && !a.locked,
        ).length,
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Achievements
                        </h3>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                            {unlockedCount}/{totalAchievements}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-500" />
                            <span className="text-xs font-medium text-gray-600">
                                {tierCounts.platinum} Platinum
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
                            <span className="text-xs font-medium text-gray-600">
                                {tierCounts.gold} Gold
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
                            <span className="text-xs font-medium text-gray-600">
                                {tierCounts.silver} Silver
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-300 to-orange-500" />
                            <span className="text-xs font-medium text-gray-600">
                                {tierCounts.bronze} Bronze
                            </span>
                        </div>
                    </div>

                    {/* Toggle locked */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showLocked}
                            onChange={(e) => setShowLocked(e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                                showLocked ? "bg-gold-400" : "bg-gray-200"
                            }`}
                        >
                            <div
                                className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                                    showLocked
                                        ? "translate-x-5"
                                        : "translate-x-0.5"
                                }`}
                            />
                        </div>
                        <span className="text-xs text-gray-500">
                            Show locked
                        </span>
                    </label>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="px-6 py-3 border-b border-gray-100/50">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {[
                        "all",
                        "unlocked",
                        "platinum",
                        "gold",
                        "silver",
                        "bronze",
                    ].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                filter === f
                                    ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg shadow-gold-500/25"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAchievements.map((achievement, idx) => (
                        <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            index={idx}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {filteredAchievements.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500">
                            No achievements to display
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
