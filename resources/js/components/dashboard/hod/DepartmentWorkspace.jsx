// ============================================================================
// DEPARTMENT WORKSPACE - Default landing page for HODs
// Simple, Focused, Fast, Modern, Organized, Spiritual yet Professional
// ============================================================================

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HODIcons } from "./HODIcons";
import { HODStatCard, HODQuickAction, HODActivityItem, HODCard } from "./HODComponents";
import { HODActivityFeed } from "./HODActivityFeed";
import api from "../../../lib/api";

// ============================================================================
// SPIRITUAL VERSE COMPONENT - Adds spiritual yet professional feel
// ============================================================================

const SpiritualVerse = () => {
    const verses = [
        { text: "Shepherd the flock of God among you, serving as overseers...", reference: "1 Peter 5:2" },
        { text: "Let all things be done for building up.", reference: "1 Corinthians 14:26" },
        { text: "Be diligent to present yourself approved to God...", reference: "2 Timothy 2:15" },
        { text: "Whatever you do, work at it with all your heart...", reference: "Colossians 3:23" },
    ];
    
    const [verse, setVerse] = useState(verses[0]);
    
    useEffect(() => {
        // Rotate verse based on day
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        setVerse(verses[dayOfYear % verses.length]);
    }, []);
    
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <HODIcons.BookOpen className="w-4 h-4 text-white/70" />
            <span className="text-white/80 text-xs italic">"{verse.text}" - {verse.reference}</span>
        </div>
    );
};

// ============================================================================
// TIME-BASED GREETING COMPONENT
// ============================================================================

const TimeGreeting = () => {
    const [greeting, setGreeting] = useState({ text: "", Icon: HODIcons.Sun, isDay: true });
    
    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting({ text: "Good morning", Icon: HODIcons.Sun, isDay: true });
            } else if (hour >= 12 && hour < 17) {
                setGreeting({ text: "Good afternoon", Icon: HODIcons.Sun, isDay: true });
            } else if (hour >= 17 && hour < 21) {
                setGreeting({ text: "Good evening", Icon: HODIcons.Sun, isDay: true });
            } else {
                setGreeting({ text: "Good night", Icon: HODIcons.Moon, isDay: false });
            }
        };
        updateGreeting();
    }, []);

    const GreetingIcon = greeting.Icon;
    
    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                greeting.isDay 
                    ? "bg-gradient-to-br from-amber-400 to-orange-500" 
                    : "bg-gradient-to-br from-slate-600 to-slate-800"
            }`}>
                <GreetingIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium">{greeting.text}!</span>
        </div>
    );
};

// ============================================================================
// DEPARTMENT INFO BANNER
// ============================================================================

export const DepartmentBanner = ({ user, departmentName, departmentColor }) => {
    // Get current week info
    const getWeekInfo = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `Week ${week}, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${departmentColor} opacity-90`}></div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative px-4 md:px-6 py-4 md:py-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Time-based Greeting */}
                        <div className="mb-2">
                            <TimeGreeting />
                        </div>
                        <p className="text-white/70 text-sm font-medium">Department Workspace</p>
                        <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{departmentName} Department</h2>
                        <p className="text-white/70 text-sm mt-1">Head: {user?.name || "HOD Name"}</p>
                        {/* Spiritual Verse */}
                        <div className="mt-3">
                            <SpiritualVerse />
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/20 rounded-xl">
                        <HODIcons.Calendar className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">{getWeekInfo()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// DEPARTMENT STATS GRID
// ============================================================================

export const DepartmentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <HODStatCard 
                title="Total Members" 
                value={stats.members} 
                subtitle="Active members" 
                icon={HODIcons.Users} 
                color="from-violet-400 to-purple-600" 
                delay={0} 
            />
            <HODStatCard 
                title="Attendance" 
                value={stats.attendance} 
                subtitle="This week" 
                icon={HODIcons.CheckCircle} 
                color="from-emerald-400 to-emerald-600" 
                delay={50} 
            />
            <HODStatCard 
                title="New Converts" 
                value={stats.newConverts} 
                subtitle="This month" 
                icon={HODIcons.Heart} 
                color="from-amber-400 to-amber-600" 
                delay={100} 
            />
            <HODStatCard 
                title="Activities" 
                value={stats.thisWeek} 
                subtitle="This week" 
                icon={HODIcons.Calendar} 
                color="from-rose-400 to-rose-600" 
                delay={150} 
            />
        </div>
    );
};

// ============================================================================
// QUICK ACTIONS SECTION
// ============================================================================

export const DepartmentQuickActions = ({ onNavigate }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <HODQuickAction 
                    icon={HODIcons.DocumentChart} 
                    label="Submit Report" 
                    description="Weekly update" 
                    color="from-violet-400 to-purple-600" 
                    onClick={() => onNavigate("reports")} 
                    delay={200} 
                />
                <HODQuickAction 
                    icon={HODIcons.Users} 
                    label="Add Member" 
                    description="Register new" 
                    color="from-emerald-400 to-emerald-600" 
                    onClick={() => onNavigate("members")} 
                    delay={250} 
                />
                <HODQuickAction 
                    icon={HODIcons.Calendar} 
                    label="Schedule" 
                    description="Plan activity" 
                    color="from-amber-400 to-amber-600" 
                    onClick={() => {}} 
                    delay={300} 
                />
                <HODQuickAction 
                    icon={HODIcons.Trophy} 
                    label="Achievement" 
                    description="Log milestone" 
                    color="from-rose-400 to-rose-600" 
                    onClick={() => {}} 
                    delay={350} 
                />
            </div>
        </div>
    );
};

// ============================================================================
// RECENT ACTIVITY SECTION
// ============================================================================

export const DepartmentActivity = ({ activities }) => {
    return (
        <HODCard>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors">View All →</button>
            </div>
            <div className="divide-y divide-gray-100">
                {activities.map((activity, idx) => (
                    <HODActivityItem 
                        key={idx} 
                        {...activity} 
                        delay={400 + idx * 50} 
                    />
                ))}
            </div>
        </HODCard>
    );
};

// ============================================================================
// MAIN DEPARTMENT WORKSPACE COMPONENT
// ============================================================================

const DepartmentWorkspace = ({ user, onNavigate }) => {
    // Get department from user or use default
    const departmentName = user?.department?.name || "Youth";
    const departmentColor = user?.department?.color || "from-violet-400 to-purple-600";

    // Fetch HOD dashboard data
    const { data, isLoading, error } = useQuery({
        queryKey: ['hod-dashboard'],
        queryFn: async () => {
            const res = await api.get('/api/hod/dashboard');
            if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch dashboard');
            return res.data.data;
        },
        staleTime: 30000,
        cacheTime: 300000,
        refetchOnWindowFocus: true,
        retry: 1,
    });

    // Sample activities (static for now)
    const activities = [
        { icon: HODIcons.Users, title: "New Member Registered", description: "Tatenda Moyo joined the department", time: "2h ago", color: "from-violet-400 to-purple-600" },
        { icon: HODIcons.DocumentChart, title: "Weekly Report Submitted", description: "Week 12 statistics recorded", time: "5h ago", color: "from-emerald-400 to-emerald-600" },
        { icon: HODIcons.Calendar, title: "Department Meeting", description: "Scheduled for Saturday 2PM", time: "1d ago", color: "from-amber-400 to-amber-600" },
        { icon: HODIcons.CheckCircle, title: "Achievement Unlocked", description: "100% attendance milestone", time: "2d ago", color: "from-rose-400 to-rose-600" },
    ];

    return (
        <div className="space-y-6">
            <DepartmentBanner 
                user={user} 
                departmentName={departmentName} 
                departmentColor={departmentColor} 
            />
            
            {/* Dashboard Stats */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white/40 rounded-2xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                    Error loading dashboard statistics.
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <HODStatCard
                        title="Department Members"
                        value={data?.my_department_members ?? 0}
                        subtitle="Total members"
                        icon={HODIcons.Users}
                        color="from-violet-400 to-purple-600"
                        delay={0}
                    />
                    <HODStatCard
                        title="Active This Month"
                        value={data?.active_members_this_month ?? 0}
                        subtitle="Active members"
                        icon={HODIcons.CheckCircle}
                        color="from-emerald-400 to-emerald-600"
                        delay={50}
                    />
                    <HODStatCard
                        title="Pending Approvals"
                        value={data?.pending_approvals ?? 0}
                        subtitle="Requests"
                        icon={HODIcons.DocumentChart}
                        color="from-amber-400 to-amber-600"
                        delay={100}
                    />
                    <HODStatCard
                        title="Zone Groups"
                        value={data?.department_groups ?? 0}
                        subtitle="Home groups"
                        icon={HODIcons.BuildingOffice}
                        color="from-rose-400 to-rose-600"
                        delay={150}
                    />
                </div>
            )}
            
            <DepartmentQuickActions onNavigate={onNavigate} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DepartmentActivity activities={activities} />
                </div>
                <div className="lg:col-span-1">
                    <HODActivityFeed departmentId={user?.department?.id} />
                </div>
            </div>
        </div>
    );
};

export default DepartmentWorkspace;
