// ============================================================================
// HOD ACHIEVEMENTS PAGE - Department Achievements & Milestones
// Gold/Sky-Blue Glass Morphism Design System
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODBadge, HODDrawer, HODAchievementBadge } from "./HODComponents";

// ============================================================================
// SAMPLE ACHIEVEMENTS DATA
// ============================================================================

const sampleAchievements = [
    {
        id: 1,
        title: "First Outreach",
        description: "Completed first community outreach program",
        date: "2024-01-15",
        tier: "bronze",
        icon: "Trophy",
        earned: true,
    },
    {
        id: 2,
        title: "100 Members Milestone",
        description: "Department reached 100 active members",
        date: "2024-03-20",
        tier: "silver",
        icon: "Users",
        earned: true,
    },
    {
        id: 3,
        title: "Annual Event Success",
        description: "Successfully organized annual department conference",
        date: "2024-06-10",
        tier: "gold",
        icon: "Calendar",
        earned: true,
    },
    {
        id: 4,
        title: "5 Star Rating",
        description: "Received 5-star rating from pastor evaluation",
        date: "2024-08-15",
        tier: "platinum",
        icon: "Star",
        earned: true,
    },
    {
        id: 5,
        title: "Community Impact",
        description: "Impacted 500+ community members",
        date: null,
        tier: "gold",
        icon: "Heart",
        earned: false,
        progress: 75,
    },
    {
        id: 6,
        title: "Youth Growth",
        description: "Grow youth membership to 50",
        date: null,
        tier: "silver",
        icon: "UserGroup",
        earned: false,
        progress: 60,
    },
];

// ============================================================================
// ACHIEVEMENT BADGE COMPONENT
// ============================================================================

const AchievementBadge = ({ achievement, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getTierStyles = (tier) => {
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

    const getIcon = (iconName) => {
        const icons = {
            Trophy: HODIcons.Trophy,
            Users: HODIcons.Users,
            Calendar: HODIcons.Calendar,
            Star: HODIcons.Star,
            Heart: HODIcons.Heart,
            UserGroup: HODIcons.UserGroup,
        };
        return icons[iconName] || HODIcons.Trophy;
    };

    const Icon = getIcon(achievement.icon);
    const styles = getTierStyles(achievement.tier);

    return (
        <div
            className={`relative transition-all duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick && onClick(achievement)}
        >
            {/* Glow effect on hover */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${styles.bg} rounded-3xl blur-lg opacity-0 transition-opacity duration-300 ${
                    isHovered ? "opacity-50" : ""
                }`}
            />

            {/* Badge card */}
            <div
                className={`relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border-2 ${styles.border} transition-all duration-300 overflow-hidden ${
                    !achievement.earned ? "opacity-60" : ""
                }`}
            >
                {/* Shimmer effect */}
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${
                        isHovered ? "animate-shimmer" : ""
                    }`}
                />

                <div className="relative flex flex-col items-center gap-3">
                    {/* Icon */}
                    <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${styles.bg} flex items-center justify-center shadow-lg ${styles.glow}`}
                    >
                        <Icon className={`w-7 h-7 ${styles.icon}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-800 text-center">
                        {achievement.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 text-center line-clamp-2">
                        {achievement.description}
                    </p>

                    {/* Status */}
                    {achievement.earned ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <HODIcons.CheckCircle className="w-4 h-4" />
                            <span>Earned</span>
                        </div>
                    ) : achievement.progress ? (
                        <div className="w-full mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>In Progress</span>
                                <span>{achievement.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`bg-gradient-to-r ${styles.bg} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${achievement.progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <HODIcons.Lock className="w-3 h-3" />
                            <span>Locked</span>
                        </div>
                    )}

                    {/* Date */}
                    {achievement.date && (
                        <span className="text-xs text-gray-400">
                            {new Date(achievement.date).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN ACHIEVEMENTS PAGE
// ============================================================================

export default function HODAchievementsPage() {
    const [filter, setFilter] = useState("all");
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filters = [
        { id: "all", label: "All" },
        { id: "earned", label: "Earned" },
        { id: "in_progress", label: "In Progress" },
        { id: "locked", label: "Locked" },
    ];

    const filteredAchievements = sampleAchievements.filter((a) => {
        if (filter === "all") return true;
        if (filter === "earned") return a.earned;
        if (filter === "in_progress") return !a.earned && a.progress;
        if (filter === "locked") return !a.earned && !a.progress;
        return true;
    });

    const stats = {
        total: sampleAchievements.length,
        earned: sampleAchievements.filter((a) => a.earned).length,
        inProgress: sampleAchievements.filter((a) => !a.earned && a.progress).length,
    };

    const handleAchievementClick = (achievement) => {
        setSelectedAchievement(achievement);
        setIsDetailOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent animate-pulse">
                    Department Achievements
                </h1>
                <p className="text-gray-500 mt-1">
                    Track milestones and celebrate department successes
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <HODGlassCard className="text-center">
                    <div className="text-3xl font-bold text-amber-600">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total Achievements</div>
                </HODGlassCard>
                <HODGlassCard className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.earned}</div>
                    <div className="text-sm text-gray-500">Earned</div>
                </HODGlassCard>
                <HODGlassCard className="text-center">
                    <div className="text-3xl font-bold text-sky-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-500">In Progress</div>
                </HODGlassCard>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            filter === f.id
                                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/30"
                                : "bg-white/40 text-gray-600 hover:bg-white/60"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAchievements.map((achievement, index) => (
                    <div
                        key={achievement.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <AchievementBadge
                            achievement={achievement}
                            onClick={handleAchievementClick}
                        />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                    <HODIcons.Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">No achievements found</h3>
                    <p className="text-gray-400">Try changing the filter</p>
                </div>
            )}

            {/* Achievement Detail Drawer */}
            <HODDrawer
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedAchievement?.title || "Achievement Details"}
            >
                {selectedAchievement && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <AchievementBadge achievement={selectedAchievement} />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">{selectedAchievement.description}</p>
                            {selectedAchievement.date && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Earned on: {new Date(selectedAchievement.date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        {!selectedAchievement.earned && (
                            <div className="pt-4">
                                <HODGoldButton className="w-full">
                                    Start Working on This
                                </HODGoldButton>
                            </div>
                        )}
                    </div>
                )}
            </HODDrawer>
        </div>
    );
}
