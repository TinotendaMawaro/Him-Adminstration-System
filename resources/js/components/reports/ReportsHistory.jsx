import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import Pagination from "../Pagination.jsx";

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    Download: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    Print: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    ArrowLeft: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    ChevronDown: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    Clock: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Warning: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    Refresh: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
};

// ============================================================================
// SERVICE TYPE BADGE
// ============================================================================

const ServiceBadge = ({ type }) => {
    const badges = {
        sunday_service: { label: 'Sunday Service', color: 'from-amber-400 to-orange-500', text: 'text-orange-700', bg: 'bg-orange-100' },
        midweek_service: { label: 'Midweek', color: 'from-sky-400 to-blue-500', text: 'text-sky-700', bg: 'bg-sky-100' },
        remote_service: { label: 'Remote', color: 'from-purple-400 to-violet-500', text: 'text-violet-700', bg: 'bg-violet-100' },
    };
    
    const badge = badges[type] || badges.sunday_service;
    
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
            {badge.label}
        </span>
    );
};

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge = ({ status }) => {
    const badges = {
        submitted: { label: 'Submitted', color: 'from-emerald-400 to-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-100' },
        approved: { label: 'Approved', color: 'from-sky-400 to-sky-600', text: 'text-sky-700', bg: 'bg-sky-100' },
        draft: { label: 'Draft', color: 'from-gray-400 to-gray-600', text: 'text-gray-700', bg: 'bg-gray-100' },
        late: { label: 'Late', color: 'from-rose-400 to-rose-600', text: 'text-rose-700', bg: 'bg-rose-100' },
    };
    
    const badge = badges[status] || badges.draft;
    
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${badge.color}`}></span>
            {badge.label}
        </span>
    );
};

// ============================================================================
// TIMELINE ITEM
// ============================================================================

const TimelineItem = ({ report, onDownload, onPrint }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const handleDownload = () => {
        setIsDownloading(true);
        setTimeout(() => {
            onDownload(report);
            setIsDownloading(false);
        }, 500);
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            onPrint(report);
            setIsPrinting(false);
        }, 500);
    };

    const totalAttendance = 
        (report.adults || 0) + 
        (report.children || 0) + 
        (report.men || 0) + 
        (report.women || 0) + 
        (report.boys || 0) + 
        (report.girls || 0) + 
        (report.toddlers || 0);

    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-gray-200 to-gray-100"></div>
            
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/30">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>

            {/* Report Card */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Card Header */}
                <div 
                    className="p-4 cursor-pointer hover:bg-white/40 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <ServiceBadge type={report.service_type} />
                                <StatusBadge status={report.is_late ? 'late' : report.status} />
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate">
                                Week {report.week_number}, {report.year}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Icons.Calendar className="w-4 h-4" />
                                    {formatDate(report.report_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {totalAttendance} attendees
                                </span>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(report.total_income)}</p>
                            <p className="text-xs text-gray-500">Total Income</p>
                        </div>

                        <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <Icons.ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                        {/* Financial Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 font-medium">Tithes</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.tithes)}</p>
                            </div>
                            <div className="p-3 bg-sky-50 rounded-xl">
                                <p className="text-xs text-sky-600 font-medium">Offerings</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.offerings)}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <p className="text-xs text-amber-600 font-medium">Building Fund</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.building_fund)}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <p className="text-xs text-purple-600 font-medium">Missions</p>
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.missions)}</p>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex flex-wrap gap-2">
                            {report.cash_collection > 0 && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                                    Cash: {formatCurrency(report.cash_collection)}
                                </span>
                            )}
                            {report.bank_deposit > 0 && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                                    Bank: {formatCurrency(report.bank_deposit)}
                                </span>
                            )}
                            {report.online_transfer > 0 && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                                    Online: {formatCurrency(report.online_transfer)}
                                </span>
                            )}
                        </div>

                        {/* Attendance Breakdown */}
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {[
                                { label: 'Adults', value: report.adults },
                                { label: 'Children', value: report.children },
                                { label: 'Men', value: report.men },
                                { label: 'Women', value: report.women },
                                { label: 'Boys', value: report.boys },
                                { label: 'Girls', value: report.girls },
                                { label: 'Toddlers', value: report.toddlers },
                            ].map((item, idx) => (
                                <div key={idx} className="text-center p-2 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{item.value || 0}</p>
                                </div>
                            ))}
                        </div>

                        {/* Remittance Status */}
                        {report.remittance_submitted && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                                <Icons.Check className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">Remittance Submitted</p>
                                    <p className="text-xs text-emerald-600">
                                        {formatCurrency(report.remittance_amount)} on {formatDate(report.remittance_date)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-medium rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 group"
                            >
                                {isDownloading ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        <Icons.Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                        <span className="text-sm">Download PDF</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={isPrinting}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 group"
                            >
                                {isPrinting ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        <Icons.Print className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        <span className="text-sm">Print</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ onNewReport }) => (
    <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icons.Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't submitted any weekly reports yet. Start by submitting your first report.
        </p>
        <button
            onClick={onNewReport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25"
        >
            <Icons.Refresh className="w-5 h-5" />
            Submit First Report
        </button>
    </div>
);

// ============================================================================
// MAIN REPORTS HISTORY COMPONENT
// ============================================================================

export default function ReportsHistory({ user, onBack, onNewReport }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const { data: reportsResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['reports-history', currentPage, perPage],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
            });
            const response = await api.get(`/reports/history?${params}`);
            if (response.data && response.data.success) {
                // Save to localStorage for persistence
                localStorage.setItem('reports-history-data', JSON.stringify(response.data));
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch reports');
        },
        staleTime: 60000,
        gcTime: 300000, // 5 minutes garbage collection
        refetchOnWindowFocus: true,
        retry: 1,
        keepPreviousData: true,
        initialData: () => {
            // Load from localStorage if available
            const cached = localStorage.getItem('reports-history-data');
            return cached ? JSON.parse(cached) : undefined;
        },
    });

    const reports = reportsResponse?.reports || [];
    const paginationMeta = reportsResponse?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Generate PDF content for download
    const handleDownload = (report) => {
        // Create a printable window
        const printWindow = window.open('', '_blank');
        
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(amount || 0);
        
        const serviceType = {
            sunday_service: 'Sunday Service',
            midweek_service: 'Midweek Service',
            remote_service: 'Remote/Online Service'
        }[report.service_type] || report.service_type;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Weekly Report - Week ${report.week_number}, ${report.year}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #1a1a1a; font-size: 24px; margin-bottom: 8px; }
                    h2 { color: #374151; font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #d4af37; padding-bottom: 8px; }
                    .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
                    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .card { background: #f9fafb; padding: 16px; border-radius: 8px; }
                    .card-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
                    .card-value { color: #1a1a1a; font-size: 18px; font-weight: bold; margin-top: 4px; }
                    .total { background: linear-gradient(135deg, #d4af37, #f4d03f); color: white; padding: 24px; border-radius: 12px; margin-top: 24px; }
                    .total-label { font-size: 14px; opacity: 0.9; }
                    .total-value { font-size: 32px; font-weight: bold; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>Weekly Report</h1>
                <div class="meta">
                    <strong>${serviceType}</strong> • Week ${report.week_number}, ${report.year}<br>
                    Date: ${formatDate(report.report_date)}<br>
                    Status: ${report.status} ${report.is_late ? '(Late)' : ''}
                </div>
                
                <h2>Financial Summary</h2>
                <div class="grid">
                    <div class="card">
                        <div class="card-label">Tithes</div>
                        <div class="card-value">${formatCurrency(report.tithes)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Offerings</div>
                        <div class="card-value">${formatCurrency(report.offerings)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Building Fund</div>
                        <div class="card-value">${formatCurrency(report.building_fund)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Missions</div>
                        <div class="card-value">${formatCurrency(report.missions)}</div>
                    </div>
                </div>
                
                <div class="total">
                    <div class="total-label">Total Income</div>
                    <div class="total-value">${formatCurrency(report.total_income)}</div>
                </div>
                
                <h2>Attendance</h2>
                <div class="grid">
                    <div class="card">
                        <div class="card-label">Adults</div>
                        <div class="card-value">${report.adults || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Children</div>
                        <div class="card-value">${report.children || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Men</div>
                        <div class="card-value">${report.men || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Women</div>
                        <div class="card-value">${report.women || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Boys</div>
                        <div class="card-value">${report.boys || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Girls</div>
                        <div class="card-value">${report.girls || 0}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Toddlers</div>
                        <div class="card-value">${report.toddlers || 0}</div>
                    </div>
                    <div class="card" style="background: #f3f4f6;">
                        <div class="card-label">Total</div>
                        <div class="card-value">${(report.adults||0)+(report.children||0)+(report.men||0)+(report.women||0)+(report.boys||0)+(report.girls||0)+(report.toddlers||0)}</div>
                    </div>
                </div>
                
                ${report.remittance_submitted ? `
                <h2>Remittance</h2>
                <div class="card">
                    <div class="card-label">Remittance Submitted</div>
                    <div class="card-value">${formatCurrency(report.remittance_amount)} on ${formatDate(report.remittance_date)}</div>
                </div>
                ` : ''}
                
                ${report.notes ? `
                <h2>Notes</h2>
                <p>${report.notes}</p>
                ` : ''}
                
                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString()} • Zone: ${user?.zone?.name || 'N/A'} • Pastor: ${user?.name || 'N/A'}</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    };

    // Print report - Enhanced version with print-specific styles
    const handlePrint = (report) => {
        const printWindow = window.open('', '_blank');
        
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(amount || 0);
        
        const serviceType = {
            sunday_service: 'Sunday Service',
            midweek_service: 'Midweek Service',
            remote_service: 'Remote/Online Service'
        }[report.service_type] || report.service_type;
        
        const totalAttendance = (report.adults || 0) + (report.children || 0) + 
            (report.men || 0) + (report.women || 0) + (report.boys || 0) + 
            (report.girls || 0) + (report.toddlers || 0);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Weekly Report - Week ${report.week_number}, ${report.year}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        padding: 40px; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        color: #1a1a1a;
                        line-height: 1.5;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        padding-bottom: 20px; 
                        border-bottom: 3px solid #d4af37;
                    }
                    .header h1 { 
                        color: #1a1a1a; 
                        font-size: 28px; 
                        margin-bottom: 8px; 
                    }
                    .meta { 
                        color: #6b7280; 
                        font-size: 14px; 
                        margin-bottom: 24px; 
                    }
                    .meta strong { color: #d4af37; }
                    .section { margin-bottom: 24px; }
                    .section-title { 
                        color: #374151; 
                        font-size: 16px; 
                        margin-bottom: 12px; 
                        border-bottom: 2px solid #d4af37; 
                        padding-bottom: 6px;
                    }
                    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
                    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .card { background: #f9fafb; padding: 12px; border-radius: 6px; }
                    .card-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .card-value { color: #1a1a1a; font-size: 16px; font-weight: bold; margin-top: 4px; }
                    .total { 
                        background: linear-gradient(135deg, #d4af37, #f4d03f); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin-top: 20px;
                        text-align: center;
                    }
                    .total-label { font-size: 14px; opacity: 0.9; }
                    .total-value { font-size: 28px; font-weight: bold; }
                    .remittance { 
                        background: #ecfdf5; 
                        border: 1px solid #10b981; 
                        padding: 12px; 
                        border-radius: 6px;
                        margin-top: 16px;
                    }
                    .remittance-label { color: #059669; font-size: 12px; font-weight: 600; }
                    .remittance-value { color: #047857; font-size: 14px; margin-top: 4px; }
                    .notes { 
                        background: #fef3c7; 
                        padding: 12px; 
                        border-radius: 6px; 
                        margin-top: 16px;
                    }
                    .notes-label { color: #92400e; font-size: 12px; font-weight: 600; }
                    .notes-value { color: #78350f; font-size: 14px; margin-top: 4px; }
                    .footer { 
                        margin-top: 30px; 
                        padding-top: 16px; 
                        border-top: 1px solid #e5e7eb; 
                        color: #9ca3af; 
                        font-size: 11px; 
                        text-align: center;
                    }
                    .status { 
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-top: 8px;
                    }
                    .status-submitted { background: #d1fae5; color: #065f46; }
                    .status-late { background: #fee2e2; color: #991b1b; }
                    
                    @media print { 
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                    
                    /* Print button styles */
                    .print-btn-container {
                        position: fixed;
                        bottom: 30px;
                        right: 30px;
                    }
                    @media print {
                        .print-btn-container { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📋 Weekly Report</h1>
                    <div class="meta">
                        <strong>${serviceType}</strong> • Week ${report.week_number}, ${report.year}<br>
                        Date: ${formatDate(report.report_date)}<br>
                        <span class="status ${report.is_late ? 'status-late' : 'status-submitted'}">
                            ${report.status} ${report.is_late ? '⚠️ Late' : '✓'}
                        </span>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">💰 Financial Summary</div>
                    <div class="grid">
                        <div class="card">
                            <div class="card-label">Tithes</div>
                            <div class="card-value">${formatCurrency(report.tithes)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Offerings</div>
                            <div class="card-value">${formatCurrency(report.offerings)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Building Fund</div>
                            <div class="card-value">${formatCurrency(report.building_fund)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Missions</div>
                            <div class="card-value">${formatCurrency(report.missions)}</div>
                        </div>
                    </div>
                    
                    <div class="grid-2" style="margin-top: 12px;">
                        <div class="card">
                            <div class="card-label">Cash Collection</div>
                            <div class="card-value">${formatCurrency(report.cash_collection)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Bank Deposit</div>
                            <div class="card-value">${formatCurrency(report.bank_deposit)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Online Transfer</div>
                            <div class="card-value">${formatCurrency(report.online_transfer)}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Other Income</div>
                            <div class="card-value">${formatCurrency(report.other_income)}</div>
                        </div>
                    </div>
                    
                    <div class="total">
                        <div class="total-label">Total Income</div>
                        <div class="total-value">${formatCurrency(report.total_income)}</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">👥 Attendance (${totalAttendance} total)</div>
                    <div class="grid">
                        <div class="card">
                            <div class="card-label">Adults</div>
                            <div class="card-value">${report.adults || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Children</div>
                            <div class="card-value">${report.children || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Men</div>
                            <div class="card-value">${report.men || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Women</div>
                            <div class="card-value">${report.women || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Boys</div>
                            <div class="card-value">${report.boys || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Girls</div>
                            <div class="card-value">${report.girls || 0}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Toddlers</div>
                            <div class="card-value">${report.toddlers || 0}</div>
                        </div>
                    </div>
                </div>
                
                ${report.remittance_submitted ? `
                <div class="section">
                    <div class="remittance">
                        <div class="remittance-label">✓ Remittance Submitted</div>
                        <div class="remittance-value">${formatCurrency(report.remittance_amount)} on ${formatDate(report.remittance_date)}</div>
                    </div>
                </div>
                ` : ''}
                
                ${report.notes ? `
                <div class="section">
                    <div class="notes">
                        <div class="notes-label">📝 Notes</div>
                        <div class="notes-value">${report.notes}</div>
                    </div>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString()}</p>
                    <p>Zone: ${user?.zone?.name || 'N/A'} • Pastor: ${user?.name || 'N/A'}</p>
                </div>
                
                <!-- Print Button -->
                <div class="print-btn-container">
                    <button onclick="window.print()" style="
                        background: linear-gradient(135deg, #d4af37, #f4d03f);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
                    ">
                        🖨️ Print Report
                    </button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    };

    // Filter reports by service type
    const [filterType, setFilterType] = useState('all');
    
    const filteredReports = filterType === 'all'
        ? reports
        : reports.filter(r => r.service_type === filterType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 lg:p-8">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                        >
                            <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports History</h1>
                            <p className="text-gray-500">View and manage your submitted reports</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        >
                            <option value="all">All Reports</option>
                            <option value="sunday_service">Sunday Service</option>
                            <option value="midweek_service">Midweek Service</option>
                            <option value="remote_service">Remote/Online</option>
                        </select>
                        
                        {/* New Report Button */}
                        <button
                            onClick={onNewReport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-medium rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="hidden sm:inline">New Report</span>
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <svg className="animate-spin h-10 w-10 text-gold-500 mx-auto mb-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-gray-500">Loading reports...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <Icons.Warning className="w-6 h-6 text-rose-500" />
                            <div>
                                <p className="font-medium text-rose-700">{error}</p>
                                <button 
                                    onClick={() => refetch()}
                                    className="text-sm text-rose-600 hover:text-rose-700 underline mt-1"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredReports.length === 0 && (
                    <EmptyState onNewReport={onNewReport} />
                )}

                {/* Reports List */}
                {!isLoading && !error && filteredReports.length > 0 && (
                    <div className="space-y-2">
                        {filteredReports.map((report, index) => (
                            <div 
                                key={report.id} 
                                className="animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TimelineItem 
                                    report={report} 
                                    onDownload={handleDownload}
                                    onPrint={handlePrint}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {paginationMeta.total > 0 && (
                    <Pagination
                        currentPage={paginationMeta.current_page}
                        totalPages={paginationMeta.last_page}
                        totalItems={paginationMeta.total}
                        itemsPerPage={paginationMeta.per_page}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}

