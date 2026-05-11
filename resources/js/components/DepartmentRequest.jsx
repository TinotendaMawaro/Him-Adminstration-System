import React, { useState, useEffect } from "react";
import { Icons } from "./MembersPortal";

const DepartmentRequest = ({ user, onClose }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [myRequest, setMyRequest] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch departments and my request status
    useEffect(() => {
        fetchDepartments();
        fetchMyRequest();
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
                setDepartments(data.departments);
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
                fetchMyRequest();
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
            }
        } catch (err) {
            setError("Failed to cancel request.");
        } finally {
            setLoading(false);
        }
    };

    // Already a member of a department
    if (myRequest && myRequest.type === "member") {
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
                            <p className="font-semibold text-gray-900">{(myRequest.department && myRequest.department.name) ? myRequest.department.name : 'Unknown Department'}</p>
                            <p className="text-sm text-gray-500">Member since: {new Date(myRequest.member_since).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                    Contact your pastor if you want to change departments.
                </p>
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
                        Your request to join <strong>{(myRequest.department && myRequest.department.name) ? myRequest.department.name : 'Unknown Department'}</strong> is being reviewed by your pastor.
                    </p>
                </div>

                <button
                    onClick={handleCancelRequest}
                    disabled={loading}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                    Cancel Request
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
                        Your request to join <strong>{(myRequest.department && myRequest.department.name) ? myRequest.department.name : 'Unknown Department'}</strong> was not approved.
                    </p>
                    {myRequest.notes && (
                        <p className="text-sm text-red-600 mt-2">Reason: {myRequest.notes}</p>
                    )}
                </div>

                <p className="text-sm text-gray-500 text-center">
                    You can try applying to a different department.
                </p>
            </div>
        );
    }

    // No department - show request form
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Join a Department</h3>
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

            <div className="space-y-3">
                {departments.map((dept) => (
                    <button
                        key={dept.id}
                        onClick={() => setSelectedDept(dept.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                            selectedDept === dept.id
                                ? "border-gold-500 bg-gold-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedDept === dept.id
                                ? "bg-gradient-to-r from-gold-400 to-amber-500"
                                : "bg-gray-100"
                        }`}>
                            <Icons.BuildingOffice className={`w-5 h-5 ${
                                selectedDept === dept.id ? "text-white" : "text-gray-500"
                            }`} />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">{dept.name}</p>
                            <p className="text-xs text-gray-500">{dept.description || "Department"}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why do you want to join this department?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 resize-none"
                    rows={3}
                />
            </div>

            <button
                onClick={handleSubmitRequest}
                disabled={loading || !selectedDept}
                className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Submitting..." : "Submit Request"}
            </button>

            <p className="text-xs text-gray-500 text-center">
                Your request will be reviewed by your zone pastor. Once approved, you'll be managed by the HOD.
            </p>
        </div>
    );
};

export default DepartmentRequest;
