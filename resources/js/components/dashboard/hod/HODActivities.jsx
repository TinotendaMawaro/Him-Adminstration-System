// ============================================================================
// HOD ACTIVITIES PAGE - Department Activities & Events Management
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODInput, HODTextarea, HODBadge, HODActivityCard, HODDrawer } from "./HODComponents";

// ============================================================================
// ACTIVITY FORM DRAWER
// ============================================================================

const ActivityFormDrawer = ({ isOpen, onClose, onSubmit, activity }) => {
    const [formData, setFormData] = useState({
        title: activity?.title || "",
        date: activity?.date || "",
        location: activity?.location || "",
        description: activity?.description || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <HODDrawer isOpen={isOpen} onClose={onClose} title={activity ? "Edit Activity" : "Create Activity"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <HODInput
                    placeholder="Activity Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    icon={HODIcons.Calendar}
                />
                <HODInput
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <HODInput
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <HODTextarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                />
                <div className="flex gap-3 pt-2">
                    <HODGoldButton type="submit" className="flex-1">
                        {activity ? "Update" : "Create"} Activity
                    </HODGoldButton>
                    <HODSkyButton type="button" onClick={onClose}>Cancel</HODSkyButton>
                </div>
            </form>
        </HODDrawer>
    );
};

// ============================================================================
// MAIN ACTIVITIES COMPONENT
// ============================================================================

const HODActivitiesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Sample activities
    const activities = [
        { id: 1, title: "Youth Fellowship Service", date: "2024-03-15", location: "Main Sanctuary", status: "upcoming" },
        { id: 2, title: "Outreach Program", date: "2024-03-10", location: "City Center", status: "completed" },
        { id: 3, title: "Bible Study Group", date: "2024-03-18", location: "Room 101", status: "upcoming" },
        { id: 4, title: "Prayer Meeting", date: "2024-03-20", location: "Prayer Tower", status: "draft" },
    ];

    const handleCreateActivity = (data) => {
        console.log("Creating activity:", data);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Activities & Events</h2>
                    <p className="text-gray-500 mt-1">Manage department activities and ministry events</p>
                </div>
                <HODGoldButton icon={HODIcons.Plus} onClick={() => setShowForm(true)}>
                    Create Activity
                </HODGoldButton>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity) => (
                    <HODActivityCard
                        key={activity.id}
                        activity={activity}
                        onClick={() => setSelectedActivity(activity)}
                    />
                ))}
            </div>

            {/* Activity Form Drawer */}
            <ActivityFormDrawer
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateActivity}
                activity={selectedActivity}
            />
        </div>
    );
};

export default HODActivitiesPage;
