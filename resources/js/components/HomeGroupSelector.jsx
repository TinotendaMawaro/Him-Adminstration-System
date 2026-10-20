import React, { useState, useEffect, useCallback } from "react";
import { Icons } from "./MembersPortal";

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[#d4af37] rounded-full animate-spin`}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

// ============================================================================
// HOME GROUP CARD SKELETON
// ============================================================================

const HomeGroupCardSkeleton = () => (
    <div className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-1 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

const HomeGroupSelector = ({ user, onClose, onRequestLeave }) => {
    const [homeGroups, setHomeGroups] = useState([]);
    const [myHomeGroup, setMyHomeGroup] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Simulate minimum loading time for better UX (max 2 seconds)
    const fetchWithMinLoading = useCallback(async (fetchFn) => {
        const startTime = Date.now();
        setInitialLoading(true);
        
        try {
            await fetchFn();
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsed);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
        } finally {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWithMinLoading(() => Promise.all([fetchHomeGroups(), fetchMyHomeGroup()]));
    }, [fetchWithMinLoading]);

    const fetchHomeGroups = async () => {
        try {
            const response = await fetch("/api/home-groups/available", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setHomeGroups(data.homegroups || []);
            }
        } catch (err) {
            console.error("Failed to fetch home groups:", err);
        }
    };

    const fetchMyHomeGroup = async () => {
        try {
            const response = await fetch("/api/home-group/my-request", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                if (data.member) {
                    setMyHomeGroup(data.member);
                } else if (data.pending) {
                    setPendingRequest(data.pending);
                }
            }
        } catch (err) {
            console.error("Failed to fetch my home group:", err);
        }
    };

    const handleRequestJoinHomeGroup = async () => {
        if (!selectedGroup) {
            setError("Please select a home group");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/home-group/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
                body: JSON.stringify({ home_group_id: selectedGroup }),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess("Your request to join the home group has been submitted!");
                fetchMyHomeGroup();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClick = () => {
        if (onRequestLeave) {
            onRequestLeave("homegroup");
        }
    };

    // Has pending request
    if (pendingRequest) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg mb-4">
                        <Icons.Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Request Pending</h3>
                    <p className="text-gray-500">
                        Your request to join {pendingRequest.homeGroup?.name} is being reviewed
                    </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-3">
                        <Icons.MapPin className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-sm text-gray-500">Requested Home Group</p>
                            <p className="font-semibold text-gray-900">{pendingRequest.homeGroup?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icons.Calendar className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-sm text-gray-500">Requested On</p>
                            <p className="font-semibold text-gray-900">
                                {pendingRequest.created_at
                                    ? new Date(pendingRequest.created_at).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        setLoading(true);
                        try {
                            const response = await fetch("/api/home-group/cancel-request", {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                                },
                            });
                            const data = await response.json();
                            if (data.success) {
                                setPendingRequest(null);
                                setSuccess("Request cancelled successfully.");
                            } else {
                                setError(data.message);
                            }
                        } catch (err) {
                            setError("Failed to cancel request.");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? "Cancelling..." : "Cancel Request"}
                </button>
            </div>
        );
    }

    // Already in a home group
    if (myHomeGroup) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
                        <Icons.Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{(myHomeGroup.home_group && myHomeGroup.home_group.name) ? myHomeGroup.home_group.name : 'Not Assigned'}</h3>
                    <p className="text-gray-500">
                        {myHomeGroup.role === "leader" ? "You are the leader" : "You are a member"}
                    </p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
                    {myHomeGroup.home_group && myHomeGroup.home_group.leader && (
                        <div className="flex items-center gap-3">
                            <Icons.User className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-sm text-gray-500">Leader</p>
                                <p className="font-semibold text-gray-900">{myHomeGroup.home_group.leader.name}</p>
                            </div>
                        </div>
                    )}
                    {myHomeGroup.home_group && myHomeGroup.home_group.lead_pastor && (
                        <div className="flex items-center gap-3">
                            <Icons.User className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-sm text-gray-500">Lead Pastor</p>
                                <p className="font-semibold text-gray-900">
                                    {myHomeGroup.home_group.lead_pastor.title} {myHomeGroup.home_group.lead_pastor.name}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Icons.MapPin className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-semibold text-gray-900">{myHomeGroup.home_group?.location || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icons.Calendar className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm text-gray-500">Meeting Time</p>
                            <p className="font-semibold text-gray-900">{myHomeGroup.home_group?.meeting_time || "Contact leader"}</p>
                        </div>
                    </div>
                </div>

                {myHomeGroup.role !== "leader" && (
                    <button
                        onClick={handleLeaveClick}
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

    // Show loading state during initial fetch
    if (initialLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <LoadingSpinner size="lg" />
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Loading Home Groups</h3>
                    <p className="text-sm text-gray-500">Fetching available groups in your zone...</p>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <HomeGroupCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

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
                            {group.lead_pastor && (
                                <p className="text-xs text-blue-600">
                                    Lead Pastor: {group.lead_pastor.name}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {homeGroups.length === 0 && !initialLoading && (
                <div className="text-center py-4">
                    <Icons.Home className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No home groups available in your zone.</p>
                    <p className="text-sm text-gray-400">Contact your pastor for assistance.</p>
                </div>
            )}

            <button
                onClick={handleRequestJoinHomeGroup}
                disabled={loading || !selectedGroup}
                className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Requesting..." : "Request to Join"}
            </button>
        </div>
    );
};

export default HomeGroupSelector;