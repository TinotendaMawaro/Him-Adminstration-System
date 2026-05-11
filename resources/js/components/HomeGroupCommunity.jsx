import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import HomeGroupReportForm from "./HomeGroupReportForm";

const HomeGroupCommunity = ({ isOpen, onClose, homeGroup }) => {
    if (!isOpen || !homeGroup) return null;
    const [showPostForm, setShowPostForm] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [postForm, setPostForm] = useState({
        title: '',
        content: '',
        type: 'general',
        is_pinned: false
    });

    // Fetch home group members
    const { data: members = [], isLoading: membersLoading } = useQuery({
        queryKey: ['home-group-members', homeGroup.id],
        queryFn: async () => {
            const response = await api.get(`/home-group/${homeGroup.id}/members`);
            if (response.data && response.data.success) {
                return response.data.members || [];
            }
            throw new Error(response.data?.message || 'Failed to load members');
        },
        staleTime: 30000,
    });

    // Fetch home group updates
    const { data: updates = [], isLoading: updatesLoading, refetch: refetchUpdates } = useQuery({
        queryKey: ['home-group-updates', homeGroup.id],
        queryFn: async () => {
            const response = await api.get(`/home-groups/${homeGroup.id}/updates`);
            if (response.data && response.data.success) {
                return response.data.updates || [];
            }
            throw new Error(response.data?.message || 'Failed to load updates');
        },
        staleTime: 30000,
    });

    const handlePostUpdate = async () => {
        if (!postForm.title.trim() || !postForm.content.trim()) return;

        try {
            const response = await api.post(`/home-groups/${homeGroup.id}/updates`, postForm);
            if (response.data && response.data.success) {
                setPostForm({ title: '', content: '', type: 'general', is_pinned: false });
                setShowPostForm(false);
                refetchUpdates();
            }
        } catch (error) {
            console.error('Failed to post update:', error);
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            announcement: 'bg-blue-100 text-blue-800',
            prayer_request: 'bg-purple-100 text-purple-800',
            event: 'bg-green-100 text-green-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.general;
    };

    const getTypeIcon = (type) => {
        const icons = {
            announcement: '📢',
            prayer_request: '🙏',
            event: '📅',
            general: '💬'
        };
        return icons[type] || icons.general;
    };

     return (
         <div className="space-y-6">
             {/* Header */}
             <div className="flex items-center justify-between">
                 <div>
                     <h2 className="text-2xl font-bold text-gray-900">{homeGroup.name} Community</h2>
                     <p className="text-gray-500 mt-1">Connect with your home group members</p>
                 </div>
                 <div className="flex items-center gap-3">
                     {homeGroup.is_leader && (
                         <>
                             <button
                                 onClick={() => setShowPostForm(true)}
                                 className="bg-gradient-to-r from-gold-400 to-gold-500 text-white px-4 py-2 rounded-lg hover:from-gold-500 hover:to-gold-600 transition-all duration-300"
                             >
                                 Post Update
                             </button>
                             <button
                                 onClick={() => setShowReportForm(true)}
                                 className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
                             >
                                 Submit Report
                             </button>
                         </>
                     )}
                     <button
                         onClick={onClose}
                         className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                     >
                         <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                     </button>
                 </div>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Members List */}
                <div className="lg:col-span-1">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members ({members.length})</h3>
                        {membersLoading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.pivot_role === 'hod' ? 'Leader' : 'Member'}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            member.pivot_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {member.pivot_status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Updates Feed */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        {updatesLoading ? (
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ) : updates.length === 0 ? (
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-8 text-center">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Updates Yet</h3>
                                <p className="text-gray-500">Updates from your leader will appear here.</p>
                            </div>
                        ) : (
                            updates.map(update => (
                                <div key={update.id} className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 ${update.is_pinned ? 'ring-2 ring-gold-400' : ''}`}>
                                    {update.is_pinned && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5L10 14.3 4.1 17l.9-5.5L2 7.8 7.5 7z"/>
                                            </svg>
                                            <span className="text-sm font-medium text-gold-600">Pinned</span>
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white font-bold text-sm">
                                                {update.author.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{update.author.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(update.published_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(update.type)}`}>
                                            {getTypeIcon(update.type)} {update.type.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{update.title}</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Post Update Modal */}
            {showPostForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowPostForm(false)} />
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Post Update</h2>
                            <p className="text-gray-500 text-sm mt-1">Share an update with your home group</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={postForm.title}
                                    onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                                    placeholder="Update title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={postForm.type}
                                    onChange={(e) => setPostForm({...postForm, type: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                                >
                                    <option value="general">General Update</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="prayer_request">Prayer Request</option>
                                    <option value="event">Event</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={postForm.content}
                                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                                    placeholder="Share your update..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={postForm.is_pinned}
                                    onChange={(e) => setPostForm({...postForm, is_pinned: e.target.checked})}
                                    className="rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                                />
                                <label htmlFor="pinned" className="text-sm text-gray-700">Pin this update</label>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPostForm(false)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostUpdate}
                                disabled={!postForm.title.trim() || !postForm.content.trim()}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold hover:from-gold-500 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Post Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Form Modal */}
            {showReportForm && (
                <HomeGroupReportForm
                    homeGroup={homeGroup}
                    onClose={() => setShowReportForm(false)}
                />
            )}
        </div>
    );
};

export default HomeGroupCommunity;