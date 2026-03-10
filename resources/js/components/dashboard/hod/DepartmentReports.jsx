// ============================================================================
// DEPARTMENT REPORTS PAGE - Submit weekly/monthly reports with due date indicators
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODInput, HODTextarea, HODButton, HODCard, HODBadge, HODDueDateIndicator } from "./HODComponents";

// ============================================================================
// GET CURRENT WEEK INFO
// ============================================================================

const getWeekInfo = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `Week ${week}, ${now.getFullYear()}`;
};

// ============================================================================
// GET DUE DATE FOR CURRENT WEEK
// ============================================================================

const getDueDate = () => {
    const now = new Date();
    // Due date is Sunday of current week
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + daysUntilSunday);
    return dueDate;
};

// ============================================================================
// REPORT SUBMISSION FORM
// ============================================================================

const ReportForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        attendance: "",
        converts: "",
        highlights: "",
        prayerPoints: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const dueDate = getDueDate();

    return (
        <HODCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{getWeekInfo()}</h3>
                <HODDueDateIndicator dueDate={dueDate} submitted={false} />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">Total Attendance</label>
                        <input
                            type="number"
                            value={formData.attendance}
                            onChange={(e) => setFormData({...formData, attendance: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all"
                            placeholder="Enter attendance count"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">New Converts</label>
                        <input
                            type="number"
                            value={formData.converts}
                            onChange={(e) => setFormData({...formData, converts: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all"
                            placeholder="Number of new converts"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-gray-600 text-sm font-medium mb-2">Highlights & Achievements</label>
                    <HODTextarea
                        rows={3}
                        value={formData.highlights}
                        onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                        placeholder="Share highlights, achievements, and success stories..."
                    />
                </div>

                <div>
                    <label className="block text-gray-600 text-sm font-medium mb-2">Prayer Points</label>
                    <HODTextarea
                        rows={2}
                        value={formData.prayerPoints}
                        onChange={(e) => setFormData({...formData, prayerPoints: e.target.value})}
                        placeholder="Enter prayer requests and concerns..."
                    />
                </div>
                
                <div className="flex gap-3">
                    <HODButton 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </HODButton>
                    <HODButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </HODButton>
                </div>
            </form>
        </HODCard>
    );
};

// ============================================================================
// REPORT SUBMITTED SUCCESS STATE
// ============================================================================

const ReportSubmitted = ({ onSubmitAnother }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
                <HODIcons.CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
            <p className="text-gray-500 mb-6">Your weekly report has been recorded successfully.</p>
            <HODButton onClick={onSubmitAnother}>Submit Another Report</HODButton>
        </div>
    );
};

// ============================================================================
// PREVIOUS REPORTS LIST
// ============================================================================

const PreviousReports = ({ reports }) => {
    return (
        <HODCard>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Reports</h3>
            <div className="space-y-3">
                {reports.map((report, idx) => (
                    <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-100">
                                <HODIcons.DocumentChart className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{report.week}</p>
                                <p className="text-gray-400 text-xs">
                                    Attendance: {report.attendance} | Converts: {report.converts}
                                </p>
                            </div>
                        </div>
                        <HODBadge variant={report.status === "submitted" ? "success" : "warning"}>
                            {report.status}
                        </HODBadge>
                    </div>
                ))}
            </div>
        </HODCard>
    );
};

// ============================================================================
// MONTHLY REPORT SECTION
// ============================================================================

const MonthlyReportSection = () => {
    const [expanded, setExpanded] = useState(false);
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[now.getMonth()];
    
    // Get last day of current month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dueDate = new Date(now.getFullYear(), now.getMonth(), lastDay.getDate());

    return (
        <HODCard className="mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Monthly Report</h3>
                    <p className="text-gray-500 text-sm">{currentMonth} Summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <HODDueDateIndicator dueDate={dueDate} submitted={false} />
                    <HODButton variant="secondary" onClick={() => setExpanded(!expanded)}>
                        {expanded ? "Hide" : "View"}
                    </HODButton>
                </div>
            </div>
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">Monthly report form would appear here.</p>
                </div>
            )}
        </HODCard>
    );
};

// ============================================================================
// MAIN DEPARTMENT REPORTS COMPONENT
// ============================================================================

const DepartmentReportsPage = ({ user }) => {
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (formData) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Submitting report:", formData);
            setReportSubmitted(true);
            setIsSubmitting(false);
        }, 1500);
    };

    // Sample previous reports
    const previousReports = [
        { week: "Week 11", attendance: 28, converts: 2, status: "submitted" },
        { week: "Week 10", attendance: 25, converts: 1, status: "submitted" },
        { week: "Week 9", attendance: 30, converts: 4, status: "submitted" },
        { week: "Week 8", attendance: 22, converts: 0, status: "submitted" },
    ];

    if (reportSubmitted) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Weekly Reports</h2>
                    <p className="text-gray-500 mt-1">Submit your department's weekly statistics</p>
                </div>
                <ReportSubmitted onSubmitAnother={() => setReportSubmitted(false)} />
                <PreviousReports reports={previousReports} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Weekly Reports</h2>
                <p className="text-gray-500 mt-1">Submit your department's weekly statistics</p>
            </div>

            <ReportForm 
                onSubmit={handleSubmit} 
                onCancel={() => {}}
                isSubmitting={isSubmitting}
            />

            <PreviousReports reports={previousReports} />

            <MonthlyReportSection />
        </div>
    );
};

export default DepartmentReportsPage;
