// ============================================================================
// DEPARTMENT WORKSPACE - Default landing page for HODs
// Shows department info, stats, quick actions, and recent activity
// ============================================================================

import React, { useState, useEffect } from "react";
import { HODIcons } from "./HODIcons";
import { HODStatCard, HODQuickAction, HODActivityItem, HODCard } from "./HODComponents";

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
            <div className="relative px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        {/* Time-based Greeting */}
                        <div className="mb-2">
                            <TimeGreeting />
                        </div>
                        <p className="text-white/70 text-sm font-medium">Department Workspace</p>
                        <h2 className="text-2xl font-bold text-white mt-1">{departmentName} Department</h2>
                        <p className="text-white/70 text-sm mt-1">Head: {user?.name || "HOD Name"} (HOD)</p>
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
    
    // Sample stats - in real app, these would come from API
    const stats = {
        members: 45,
        attendance: 32,
        newConverts: 3,
        thisWeek: 5,
    };

    // Sample activities
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
            
            <DepartmentStats stats={stats} />
            
            <DepartmentQuickActions onNavigate={onNavigate} />
            
            <DepartmentActivity activities={activities} />
        </div>
    );
};

export default DepartmentWorkspace;
