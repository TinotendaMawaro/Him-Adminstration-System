import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icons } from "./MembersPortal";

const DepartmentRequest = ({ user, onClose, onLeave, onRequestLeave }) => {
    const queryClient = useQueryClient();
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [myRequest, setMyRequest] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [viewMode, setViewMode] = useState("browse");
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const startTime = Date.now();
        const MIN_LOADING_MS = 320;

        Promise.all([fetchDepartments(), fetchMyRequest()]).then(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
            setTimeout(() => {
                if (!cancelled) setInitialLoading(false);
            }, remaining);
        }).catch(() => {
            if (!cancelled) setInitialLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await fetch("/api/departments", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setDepartments(data.departments || []);
            }
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    const fetchMyRequest = async () => {
        try {
            const response = await fetch("/api/department-request/my", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                if (data.member) {
                    setMyRequest({ type: "member", ...data.member });
                } else if (data.pending) {
                    setMyRequest({ type: "pending", ...data.pending });
                } else if (data.rejected) {
                    setMyRequest({ type: "rejected", ...data.rejected });
                }
            }
        } catch (err) {
            console.error("Failed to fetch my request:", err);
        }
    };

    const handleSubmitRequest = async () => {
        if (!selectedDept) {
            setError("Please select a department");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/department-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
                body: JSON.stringify({
                    department_id: selectedDept,
                    notes: notes,
                }),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess("Request submitted! Your pastor will review it.");
                setViewMode("browse");
                setSelectedDept(null);
                setNotes("");
                fetchMyRequest();
                queryClient.invalidateQueries({ queryKey: ["department-requests"] });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/department-request/cancel", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setMyRequest(null);
                setSuccess("");
                setViewMode("browse");
            }
        } catch (err) {
            setError("Failed to cancel request.");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClick = () => {
        if (onRequestLeave) {
            onRequestLeave("department");
        }
    };

    const handleBrowseRequest = (deptId) => {
        setSelectedDept(deptId);
        setViewMode("request");
        setError("");
        setSuccess("");
    };

    const handleBackToBrowse = () => {
        setViewMode("browse");
        setSelectedDept(null);
        setError("");
        setSuccess("");
    };

    const selectedDepartment = departments.find((d) => d.id === selectedDept);

    if (initialLoading) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-center py-6">
                    <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded-lg w-3/4 mx-auto animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Already a member of a department
    if (myRequest && myRequest.type === "member") {
        const isHod = myRequest.department?.hod?.id === user?.id;

        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
                        <Icons.Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Department Member</h3>
                    <p className="text-gray-500">You are a member of a department</p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-3">
                        <Icons.BuildingOffice className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {(myRequest.department && myRequest.department.name) ? myRequest.department.name : "Unknown Department"}
                            </p>
                            <p className="text-sm text-gray-500">Member since: {new Date(myRequest.member_since).toLocaleDateString()}</p>
                            {isHod && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mt-1">
                                    <Icons.Star className="w-3 h-3" />
                                    Head of Department
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <Icons.ChatBubble className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="font-semibold text-gray-900">Department Community</p>
                            <p className="text-sm text-gray-500">Chats, updates, and announcements</p>
                        </div>
                    </div>
                    <button
                        onClick={() => alert("Department community coming soon!")}
                        className="mt-3 w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm"
                    >
                        Enter Department Community
                    </button>
                </div>

                {!isHod && (
                    <button
                        onClick={handleLeaveClick}
                        disabled={loading}
                        className="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all duration-300"
                    >
                        Leave Department
                    </button>
                )}

                {isHod && (
                    <p className="text-sm text-gray-500 text-center">
                        As HOD, please contact your pastor to transfer leadership before leaving.
                    </p>
                )}
            </div>
        );
    }

    // Pending request
    if (myRequest && myRequest.type === "pending") {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg mb-4 animate-pulse">
                        <Icons.Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Request Pending</h3>
                    <p className="text-gray-500">Waiting for pastoral approval</p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">
                        Your request to join{" "}
                        <strong>
                            {(myRequest.department && myRequest.department.name) ? myRequest.department.name : "Unknown Department"}
                        </strong>{" "}
                        is being reviewed by your pastor.
                    </p>
                </div>

                <button
                    onClick={handleCancelRequest}
                    disabled={loading}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                    {loading ? "Cancelling..." : "Cancel Request"}
                </button>
            </div>
        );
    }

    // Rejected request
    if (myRequest && myRequest.type === "rejected") {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg mb-4">
                        <Icons.XMark className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Request Declined</h3>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-red-800">
                        Your request to join{" "}
                        <strong>
                            {(myRequest.department && myRequest.department.name) ? myRequest.department.name : "Unknown Department"}
                        </strong>{" "}
                        was not approved.
                    </p>
                    {myRequest.notes && (
                        <p className="text-sm text-red-600 mt-2">Reason: {myRequest.notes}</p>
                    )}
                </div>

                <button
                    onClick={handleBackToBrowse}
                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-300"
                >
                    Browse Other Departments
                </button>
            </div>
        );
    }

    // Browse mode - show list of departments
    if (viewMode === "browse") {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Browse Departments</h3>
                    <p className="text-sm text-gray-500">Select a department to request membership</p>
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

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Icons.BuildingOffice className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">{dept.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{dept.description || "Department"}</p>
                                    {dept.hod && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            HOD: {dept.hod.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleBrowseRequest(dept.id)}
                                className="mt-3 w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 text-sm"
                            >
                                Request to Join
                            </button>
                        </div>
                    ))}
                </div>

                {departments.length === 0 && (
                    <div className="text-center py-8">
                        <Icons.BuildingOffice className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No departments available at this time.</p>
                        <p className="text-sm text-gray-400">Contact your pastor for assistance.</p>
                    </div>
                )}
            </div>
        );
    }

    // Request mode - show request form for selected department
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={handleBackToBrowse}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Icons.ChevronDown className="w-5 h-5 text-gray-500 rotate-90" />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Request to Join</h3>
                    <p className="text-sm text-gray-500">
                        {selectedDepartment ? selectedDepartment.name : "Department"}
                    </p>
                </div>
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why do you want to join this department?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
                    rows={3}
                />
            </div>

            <button
                onClick={handleSubmitRequest}
                disabled={loading || !selectedDept}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Submitting..." : "Submit Request"}
            </button>

            <p className="text-xs text-gray-500 text-center">
                Your request will be reviewed by your zone pastor. Once approved, you will be managed by the HOD and gain access to the department community.
            </p>
        </div>
    );
};

export default DepartmentRequest;
