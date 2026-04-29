import React, { useState, useRef } from 'react';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    Calendar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    Upload: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    X: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Plus: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    Trash: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    ArrowLeft: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    Sparkles: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
};

// ============================================================================
// FORM INPUT COMPONENTS
// ============================================================================

const InputField = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                className={`w-full bg-white/60 backdrop-blur-sm rounded-xl border ${error ? 'border-rose-400' : 'border-gray-200/60'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all duration-300 ${Icon ? 'pl-11' : 'px-4'} py-3`}
                {...props}
            />
        </div>
        {error && <p className="text-rose-500 text-xs">{error}</p>}
    </div>
);

const SelectField = ({ label, icon: Icon, error, children, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <select
                className={`w-full bg-white/60 backdrop-blur-sm rounded-xl border ${error ? 'border-rose-400' : 'border-gray-200/60'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all duration-300 ${Icon ? 'pl-11' : 'px-4'} py-3 appearance-none cursor-pointer`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
        {error && <p className="text-rose-500 text-xs">{error}</p>}
    </div>
);

const NumberInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</div>
            <input
                type="number"
                min="0"
                step="0.01"
                className={`w-full bg-white/60 backdrop-blur-sm rounded-xl border ${error ? 'border-rose-400' : 'border-gray-200/60'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all duration-300 pl-14 pr-4 py-3`}
                {...props}
            />
        </div>
        {error && <p className="text-rose-500 text-xs">{error}</p>}
    </div>
);

// ============================================================================
// FILE UPLOAD DRAG AND DROP GLASS BOX
// ============================================================================

const FileUploadBox = ({ files, onFilesChange, label }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const newFiles = Array.from(e.dataTransfer.files);
        onFilesChange([...files, ...newFiles]);
    };

    const handleFileSelect = (e) => {
        const newFiles = Array.from(e.target.files);
        onFilesChange([...files, ...newFiles]);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
            <div
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    isDragging 
                        ? 'border-gold-400 bg-gold-50/50' 
                        : 'border-gray-200/60 hover:border-gold-300 bg-white/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div 
                    className="p-8 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                        isDragging 
                            ? 'bg-gold-400 text-white scale-110' 
                            : 'bg-gray-100 text-gray-400'
                    }`}>
                        <Icons.Upload className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 font-medium">
                        {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                    <p className="text-gray-300 text-xs mt-2">Supports: JPG, PNG, PDF (max 5MB)</p>
                </div>
            </div>
            
            {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white/60 rounded-xl border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
                                <Icons.Upload className="w-4 h-4 text-gold-600" />
                            </div>
                            <span className="text-xs text-gray-600 truncate flex-1">{file.name}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                                <Icons.X className="w-4 h-4 text-rose-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// EQUIPMENT PLEDGED SECTION
// ============================================================================

const EquipmentPledge = ({ pledges, onChange }) => {
    const addPledge = () => {
        onChange([...pledges, { item: '', quantity: 1, pledged_by: '' }]);
    };

    const updatePledge = (index, field, value) => {
        const updated = [...pledges];
        updated[index][field] = value;
        onChange(updated);
    };

    const removePledge = (index) => {
        onChange(pledges.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Equipment Pledged (Optional)</label>
                <button
                    type="button"
                    onClick={addPledge}
                    className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
                >
                    <Icons.Plus className="w-4 h-4" /> Add Item
                </button>
            </div>
            
            {pledges.map((pledge, index) => (
                <div key={index} className="p-4 bg-white/40 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Item #{index + 1}</span>
                        <button
                            type="button"
                            onClick={() => removePledge(index)}
                            className="p-1 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                            <Icons.Trash className="w-4 h-4 text-rose-500" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Item name"
                            value={pledge.item}
                            onChange={(e) => updatePledge(index, 'item', e.target.value)}
                            className="bg-white/60 rounded-xl border border-gray-200/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            min="1"
                            value={pledge.quantity}
                            onChange={(e) => updatePledge(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="bg-white/60 rounded-xl border border-gray-200/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        />
                        <input
                            type="text"
                            placeholder="Pledged by"
                            value={pledge.pledged_by}
                            onChange={(e) => updatePledge(index, 'pledged_by', e.target.value)}
                            className="bg-white/60 rounded-xl border border-gray-200/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// SUCCESS MODAL
// ============================================================================

const SuccessModal = ({ isOpen, onClose, reportId }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto animate-scaleIn">
                    <style>{`
                        @keyframes scaleIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        @keyframes successPulse {
                            0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
                            50% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); }
                        }
                        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
                        .animate-successPulse { animation: successPulse 2s ease-in-out infinite; }
                    `}</style>
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/30 animate-successPulse">
                            <Icons.Check className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                        <p className="text-gray-500 mb-6">Your weekly report has been successfully submitted.</p>
                        <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                            <p className="text-xs text-gray-400 mb-1">Report ID</p>
                            <p className="text-sm font-mono text-gray-600">{reportId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ============================================================================
// MAIN WEEKLY REPORT FORM
// ============================================================================

export default function WeeklyReportForm({ user, onBack, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedReportId, setSubmittedReportId] = useState('');
    const [errors, setErrors] = useState({});
    const [attachments, setAttachments] = useState([]);

    // Get current week info
    const getWeekInfo = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return {
            weekNumber,
            year: now.getFullYear(),
            date: now.toISOString().split('T')[0]
        };
    };

    const weekInfo = getWeekInfo();

    const [formData, setFormData] = useState({
        type: 'weekly_stats',
        service_type: 'sunday_service',
        report_date: weekInfo.date,
        week_number: weekInfo.weekNumber,
        year: weekInfo.year,
        
        // Financial
        cash_collection: '',
        bank_deposit: '',
        online_transfer: '',
        other_income: '',
        tithes: '',
        offerings: '',
        building_fund: '',
        missions: '',
        other_designations: '',
        
        // Attendance
        adults: '',
        children: '',
        men: '',
        women: '',
        boys: '',
        girls: '',
        toddlers: '',
        
        // Equipment
        equipment_pledged: [],
        
        // Remittance
        remittance_submitted: false,
        remittance_date: '',
        remittance_amount: '',
        
        // Notes
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field is updated
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.service_type) newErrors.service_type = 'Service type is required';
        if (!formData.report_date) newErrors.report_date = 'Date is required';
        
        // At least one attendance field should be filled
        const hasAttendance = formData.adults || formData.children || formData.men || formData.women || formData.boys || formData.girls || formData.toddlers;
        if (!hasAttendance) {
            newErrors.attendance = 'At least one attendance field is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const him_token = localStorage.getItem('him_token');
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${him_token}`,
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSubmittedReportId(data.report.id);
                setShowSuccess(true);
                if (onSuccess) onSuccess(data.report);
            } else {
                setErrors(data.errors || { submit: data.message });
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            setErrors({ submit: 'Failed to submit report. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalIncome = 
        (parseFloat(formData.cash_collection) || 0) +
        (parseFloat(formData.bank_deposit) || 0) +
        (parseFloat(formData.online_transfer) || 0) +
        (parseFloat(formData.other_income) || 0);

    const totalAttendance = 
        (parseInt(formData.adults) || 0) +
        (parseInt(formData.children) || 0) +
        (parseInt(formData.men) || 0) +
        (parseInt(formData.women) || 0) +
        (parseInt(formData.boys) || 0) +
        (parseInt(formData.girls) || 0) +
        (parseInt(formData.toddlers) || 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 lg:p-8">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
                @keyframes goldGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6), 0 0 50px rgba(212, 175, 55, 0.3); }
                }
                .gold-glow:hover {
                    animation: goldGlow 2s ease-in-out infinite;
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                    >
                        <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Weekly Report</h1>
                        <p className="text-gray-500">Submit your zone's weekly statistics and finance report</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Service Details Section */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                                <Icons.Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
                                <p className="text-sm text-gray-500">Select the service type and date</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <SelectField
                                label="Service Type"
                                name="service_type"
                                value={formData.service_type}
                                onChange={handleChange}
                                error={errors.service_type}
                            >
                                <option value="sunday_service">Sunday Service</option>
                                <option value="midweek_service">Midweek Service</option>
                                <option value="remote_service">Remote/Online</option>
                            </SelectField>

                            <InputField
                                label="Date"
                                name="report_date"
                                type="date"
                                value={formData.report_date}
                                onChange={handleChange}
                                error={errors.report_date}
                            />

                            <InputField
                                label="Week Number"
                                name="week_number"
                                type="number"
                                min="1"
                                max="53"
                                value={formData.week_number}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Year"
                                name="year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={formData.year}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Financial Section */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Financial Report</h2>
                                <p className="text-sm text-gray-500">Enter collection details</p>
                            </div>
                        </div>

                        {/* Collection Breakdown */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Collection Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <NumberInput
                                    label="Tithes"
                                    name="tithes"
                                    value={formData.tithes}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Offerings"
                                    name="offerings"
                                    value={formData.offerings}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Building Fund"
                                    name="building_fund"
                                    value={formData.building_fund}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Missions"
                                    name="missions"
                                    value={formData.missions}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Other"
                                    name="other_designations"
                                    value={formData.other_designations}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <NumberInput
                                    label="Cash Collection"
                                    name="cash_collection"
                                    value={formData.cash_collection}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Bank Deposit"
                                    name="bank_deposit"
                                    value={formData.bank_deposit}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <NumberInput
                                    label="Online Transfer"
                                    name="online_transfer"
                                    value={formData.online_transfer}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-gold-50 to-emerald-50 rounded-2xl border border-gold-100">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Total Income</span>
                                <span className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Section */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
                                <p className="text-sm text-gray-500">Record attendance by category</p>
                            </div>
                        </div>

                        {errors.attendance && (
                            <p className="text-rose-500 text-sm mb-4">{errors.attendance}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <InputField
                                label="Adults"
                                name="adults"
                                type="number"
                                min="0"
                                value={formData.adults}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Children"
                                name="children"
                                type="number"
                                min="0"
                                value={formData.children}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Men"
                                name="men"
                                type="number"
                                min="0"
                                value={formData.men}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Women"
                                name="women"
                                type="number"
                                min="0"
                                value={formData.women}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Boys"
                                name="boys"
                                type="number"
                                min="0"
                                value={formData.boys}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Girls"
                                name="girls"
                                type="number"
                                min="0"
                                value={formData.girls}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <InputField
                                label="Toddlers"
                                name="toddlers"
                                type="number"
                                min="0"
                                value={formData.toddlers}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        {/* Total Attendance */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-purple-50 rounded-2xl border border-sky-100">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Total Attendance</span>
                                <span className="text-2xl font-bold text-gray-900">{totalAttendance}</span>
                            </div>
                        </div>
                    </div>

                    {/* Equipment Pledged */}
                    <EquipmentPledge
                        pledges={formData.equipment_pledged}
                        onChange={(pledges) => setFormData(prev => ({ ...prev, equipment_pledged: pledges }))}
                    />

                    {/* Remittance Section */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <Icons.Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Remittance</h2>
                                <p className="text-sm text-gray-500">Submit remittance for every Sunday service</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="remittance_submitted"
                                name="remittance_submitted"
                                checked={formData.remittance_submitted}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
                            />
                            <label htmlFor="remittance_submitted" className="text-sm text-gray-700">
                                Remittance has been submitted
                            </label>
                        </div>

                        {formData.remittance_submitted && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <InputField
                                    label="Remittance Date"
                                    name="remittance_date"
                                    type="date"
                                    value={formData.remittance_date}
                                    onChange={handleChange}
                                />
                                <NumberInput
                                    label="Remittance Amount"
                                    name="remittance_amount"
                                    value={formData.remittance_amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    {/* File Upload */}
                    <FileUploadBox
                        label="Attachments (Optional)"
                        files={attachments}
                        onFilesChange={setAttachments}
                    />

                    {/* Notes */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 lg:p-8">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Add any additional information..."
                                className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all duration-300 px-4 py-3"
                            />
                        </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                            <p className="text-rose-600 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 gold-glow ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Report'
                        )}
                    </button>
                </form>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                reportId={submittedReportId}
            />
        </div>
    );
}

