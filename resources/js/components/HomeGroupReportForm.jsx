import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const HomeGroupReportForm = ({ homeGroup, onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        report_date: new Date().toISOString().split('T')[0],
        attendance_count: 0,
        challenges: '',
        prayer_requests: '',
        testimonies: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing reports to check for duplicates
    const { data: existingReports = [] } = useQuery({
        queryKey: ['home-group-reports', homeGroup.id],
        queryFn: async () => {
            const response = await api.get(`/home-groups/${homeGroup.id}/reports`);
            if (response.data && response.data.success) {
                return response.data.reports || [];
            }
            throw new Error(response.data?.message || 'Failed to load reports');
        },
        staleTime: 30000,
    });

    const submitReportMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/home-groups/${homeGroup.id}/reports`, data);
            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to submit report');
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['home-group-reports', homeGroup.id] });
            onClose();
        },
        onError: (error) => {
            console.error('Failed to submit report:', error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for duplicate date
        const existingReport = existingReports.find(r =>
            r.report_date === formData.report_date
        );

        if (existingReport) {
            alert('A report already exists for this date. Please choose a different date.');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReportMutation.mutateAsync(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Submit Home Group Report</h2>
                    <p className="text-gray-500 text-sm mt-1">Report for {homeGroup.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                                placeholder="Weekly Report - [Date]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Date *</label>
                            <input
                                type="date"
                                name="report_date"
                                value={formData.report_date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Count *</label>
                        <input
                            type="number"
                            name="attendance_count"
                            value={formData.attendance_count}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            placeholder="Number of people present"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Content *</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            placeholder="Describe what happened during the home group meeting..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Challenges Faced</label>
                        <textarea
                            name="challenges"
                            value={formData.challenges}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            placeholder="Any challenges or difficulties encountered..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Requests</label>
                        <textarea
                            name="prayer_requests"
                            value={formData.prayer_requests}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            placeholder="Prayer requests from the meeting..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Testimonies</label>
                        <textarea
                            name="testimonies"
                            value={formData.testimonies}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                            placeholder="Any testimonies or praise reports..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold hover:from-gold-500 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HomeGroupReportForm;