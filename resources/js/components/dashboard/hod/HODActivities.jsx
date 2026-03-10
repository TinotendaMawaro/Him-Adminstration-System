// ============================================================================
// HOD ACTIVITIES PAGE - Department Activities & Events Management
// ============================================================================

import React, { useState, useEffect } from "react";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODInput, HODTextarea, HODBadge, HODActivityCard, HODDrawer } from "./HODComponents";

// ============================================================================
// ACTIVITY FORM DRAWER
// ============================================================================

const ActivityFormDrawer = ({ isOpen, onClose, onSubmit, activity, isSubmitting }) => {
    const [formData, setFormData] = useState({
        title: activity?.title || "",
        date: activity?.date || "",
        location: activity?.location || "",
        description: activity?.description || "",
        type: activity?.type || "activity",
        status: activity?.status || "draft",
    });

    useEffect(() => {
        if (activity) {
            setFormData({
                title: activity.title || "",
                date: activity.date || "",
                location: activity.location || "",
                description: activity.description || "",
                type: activity.type || "activity",
                status: activity.status || "draft",
            });
        } else {
            setFormData({
                title: "",
                date: "",
                location: "",
                description: "",
                type: "activity",
                status: "draft",
            });
        }
    }, [activity, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const typeOptions = [
        { value: "activity", label: "Department Activity" },
        { value: "event", label: "Ministry Event" },
        { value: "meeting", label: "Meeting" },
    ];

    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "upcoming", label: "Upcoming" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <HODDrawer isOpen={isOpen} onClose={onClose} title={activity ? "Edit Activity" : "Create Activity"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <HODInput
                    label="Activity Title"
                    placeholder="Enter activity title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    icon={HODIcons.Calendar}
                    required
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <HODInput
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        >
                            {typeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <HODInput
                    label="Location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    icon={HODIcons.MapPin}
                    required
                />
                
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                
                <HODTextarea
                    label="Description"
                    placeholder="Enter activity description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                />
                
                <div className="flex gap-3 pt-2">
                    <HODGoldButton type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : (activity ? "Update Activity" : "Create Activity")}
                    </HODGoldButton>
                    <HODSkyButton type="button" onClick={onClose}>Cancel</HODSkyButton>
                </div>
            </form>
        </HODDrawer>
    );
};

// ============================================================================
// ACTIVITY DETAIL DRAWER
// ============================================================================

const ActivityDetailDrawer = ({ isOpen, onClose, activity, onEdit, onDelete }) => {
    if (!activity) return null;

    const getStatusVariant = (status) => {
        switch (status) {
            case "upcoming": return "info";
            case "in_progress": return "warning";
            case "completed": return "success";
            case "cancelled": return "danger";
            default: return "default";
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "activity": return "Department Activity";
            case "event": return "Ministry Event";
            case "meeting": return "Meeting";
            default: return type;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <HODDrawer isOpen={isOpen} onClose={onClose} title="Activity Details">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{activity.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{getTypeLabel(activity.type)}</p>
                    </div>
                    <HODBadge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                    </HODBadge>
                </div>
                
                <div className="p-4 bg-white/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                        <HODIcons.Calendar className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-800">{formatDate(activity.date)}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <HODIcons.MapPin className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-800">{activity.location}</p>
                        </div>
                    </div>
                </div>
                
                {activity.description && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{activity.description}</p>
                    </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-white/20">
                    <HODGoldButton icon={HODIcons.Pencil} onClick={onEdit} className="flex-1">
                        Edit
                    </HODGoldButton>
                    <button
                        onClick={onDelete}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-2xl bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 transition-all"
                    >
                        <HODIcons.Trash className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </HODDrawer>
    );
};

// ============================================================================
// MAIN ACTIVITIES COMPONENT
// ============================================================================

const HODActivitiesPage = ({ departmentId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch activities from API
    const fetchActivities = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = departmentId 
                ? `/api/activities?department_id=${departmentId}` 
                : '/api/activities';
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            setActivities(data.activities || []);
        } catch (err) {
            setError(err.message);
            // Fallback to sample data if API fails
            setActivities([
                { id: 1, title: "Youth Fellowship Service", date: "2024-03-15", location: "Main Sanctuary", status: "upcoming", type: "activity" },
                { id: 2, title: "Outreach Program", date: "2024-03-10", location: "City Center", status: "completed", type: "event" },
                { id: 3, title: "Bible Study Group", date: "2024-03-18", location: "Room 101", status: "upcoming", type: "meeting" },
                { id: 4, title: "Prayer Meeting", date: "2024-03-20", location: "Prayer Tower", status: "draft", type: "activity" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [departmentId]);

    const handleCreateActivity = async (data) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    department_id: departmentId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create activity');
            }

            const result = await response.json();
            setActivities([...activities, result.activity]);
            setShowForm(false);
        } catch (err) {
            console.error('Error creating activity:', err);
            alert('Failed to create activity. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateActivity = async (data) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/activities/${selectedActivity.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update activity');
            }

            const result = await response.json();
            setActivities(activities.map(a => a.id === selectedActivity.id ? result.activity : a));
            setShowForm(false);
            setSelectedActivity(null);
            setShowDetail(false);
        } catch (err) {
            console.error('Error updating activity:', err);
            alert('Failed to update activity. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteActivity = async () => {
        if (!selectedActivity) return;
        
        if (!confirm('Are you sure you want to delete this activity?')) return;
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/activities/${selectedActivity.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete activity');
            }

            setActivities(activities.filter(a => a.id !== selectedActivity.id));
            setShowDetail(false);
            setSelectedActivity(null);
        } catch (err) {
            console.error('Error deleting activity:', err);
            alert('Failed to delete activity. Please try again.');
        }
    };

    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setShowDetail(true);
    };

    const handleEditFromDetail = () => {
        setShowDetail(false);
        setShowForm(true);
    };

    const handleSubmit = selectedActivity ? handleUpdateActivity : handleCreateActivity;

    // Group activities by status
    const upcomingActivities = activities.filter(a => a.status === 'upcoming' || a.status === 'in_progress');
    const completedActivities = activities.filter(a => a.status === 'completed');
    const draftActivities = activities.filter(a => a.status === 'draft');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Activities & Events</h2>
                    <p className="text-gray-500 mt-1">Manage department activities, ministry events, and meetings</p>
                </div>
                <HODGoldButton icon={HODIcons.Plus} onClick={() => {
                    setSelectedActivity(null);
                    setShowForm(true);
                }}>
                    Create Activity
                </HODGoldButton>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Upcoming Activities */}
            {!loading && upcomingActivities.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Activities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingActivities.map((activity) => (
                            <HODActivityCard
                                key={activity.id}
                                activity={activity}
                                onClick={() => handleActivityClick(activity)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Draft Activities */}
            {!loading && draftActivities.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Draft Activities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {draftActivities.map((activity) => (
                            <HODActivityCard
                                key={activity.id}
                                activity={activity}
                                onClick={() => handleActivityClick(activity)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Activities */}
            {!loading && completedActivities.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Completed Activities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedActivities.map((activity) => (
                            <HODActivityCard
                                key={activity.id}
                                activity={activity}
                                onClick={() => handleActivityClick(activity)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && activities.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <HODIcons.Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activities Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first activity to get started</p>
                    <HODGoldButton icon={HODIcons.Plus} onClick={() => setShowForm(true)}>
                        Create Activity
                    </HODGoldButton>
                </div>
            )}

            {/* Activity Form Drawer */}
            <ActivityFormDrawer
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedActivity(null);
                }}
                onSubmit={handleSubmit}
                activity={selectedActivity}
                isSubmitting={isSubmitting}
            />

            {/* Activity Detail Drawer */}
            <ActivityDetailDrawer
                isOpen={showDetail}
                onClose={() => {
                    setShowDetail(false);
                    setSelectedActivity(null);
                }}
                activity={selectedActivity}
                onEdit={handleEditFromDetail}
                onDelete={handleDeleteActivity}
            />
        </div>
    );
};

export default HODActivitiesPage;
