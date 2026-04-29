import React, { useState, useEffect } from "react";
import { Icons } from "./MembersPortal";

const HomeGroupSelector = ({ user, onClose }) => {
    const [homeGroups, setHomeGroups] = useState([]);
    const [myHomeGroup, setMyHomeGroup] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchHomeGroups();
        fetchMyHomeGroup();
    }, []);

     const fetchHomeGroups = async () => {
         try {
             const response = await fetch("/api/home-groups/available", {
                 headers: {
                     Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                 },
             });
            const data = await response.json();
            if (data.success) {
                setHomeGroups(data.home_groups);
            }
        } catch (err) {
            console.error("Failed to fetch home groups:", err);
        }
    };

     const fetchMyHomeGroup = async () => {
         try {
             const response = await fetch("/api/home-group/my", {
                 headers: {
                     Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                 },
             });
            const data = await response.json();
            if (data.success && data.member) {
                setMyHomeGroup(data.member);
            }
        } catch (err) {
            console.error("Failed to fetch my home group:", err);
        }
    };

    const handleJoinHomeGroup = async () => {
        if (!selectedGroup) {
            setError("Please select a home group");
            return;
        }

        setLoading(true);
        setError("");

         try {
             const response = await fetch("/api/home-group/join", {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                 },
                 body: JSON.stringify({ home_group_id: selectedGroup }),
             });
            const data = await response.json();

            if (data.success) {
                setSuccess("You have joined the home group!");
                fetchMyHomeGroup();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to join home group. Please try again.");
        } finally {
            setLoading(false);
        }
    };

     const handleLeaveHomeGroup = async () => {
         setLoading(true);
         try {
             const response = await fetch("/api/home-group/leave", {
                 method: "DELETE",
                 headers: {
                     Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                 },
             });
            const data = await response.json();
            if (data.success) {
                setMyHomeGroup(null);
                setSuccess("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to leave home group.");
        } finally {
            setLoading(false);
        }
    };

    // Already in a home group
    if (myHomeGroup) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
                        <Icons.Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{myHomeGroup.home_group?.name}</h3>
                    <p className="text-gray-500">
                        {myHomeGroup.role === "leader" ? "You are the leader" : "You are a member"}
                    </p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
                    {myHomeGroup.home_group?.leader && (
                        <div className="flex items-center gap-3">
                            <Icons.User className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-sm text-gray-500">Leader</p>
                                <p className="font-semibold text-gray-900">{myHomeGroup.home_group.leader.name}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Icons.MapPin className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-semibold text-gray-900">{myHomeGroup.home_group.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icons.Calendar className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm text-gray-500">Meeting Time</p>
                            <p className="font-semibold text-gray-900">{myHomeGroup.home_group.meeting_time || "Contact leader"}</p>
                        </div>
                    </div>
                </div>

                {myHomeGroup.role !== "leader" && (
                    <button
                        onClick={handleLeaveHomeGroup}
                        disabled={loading}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                        Leave Home Group
                    </button>
                )}

                {myHomeGroup.role === "leader" && (
                    <p className="text-sm text-gray-500 text-center">
                        As a leader, please contact your pastor to transfer leadership before leaving.
                    </p>
                )}
            </div>
        );
    }

    // No home group - show selection form
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Join a Home Group</h3>
                <p className="text-sm text-gray-500">Select a home group in your zone</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm">
                    {success}
                </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
                {homeGroups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => setSelectedGroup(group.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                            selectedGroup === group.id
                                ? "border-gold-500 bg-gold-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedGroup === group.id
                                ? "bg-gradient-to-r from-gold-400 to-amber-500"
                                : "bg-gray-100"
                        }`}>
                            <Icons.Users className={`w-5 h-5 ${
                                selectedGroup === group.id ? "text-white" : "text-gray-500"
                            }`} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-semibold text-gray-900">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.location}</p>
                            {group.leader && (
                                <p className="text-xs text-gold-600">Leader: {group.leader.name}</p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {homeGroups.length === 0 && (
                <div className="text-center py-4">
                    <p className="text-gray-500">No home groups available in your zone.</p>
                    <p className="text-sm text-gray-400">Contact your pastor for assistance.</p>
                </div>
            )}

            <button
                onClick={handleJoinHomeGroup}
                disabled={loading || !selectedGroup}
                className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Joining..." : "Join Home Group"}
            </button>
        </div>
    );
};

export default HomeGroupSelector;
