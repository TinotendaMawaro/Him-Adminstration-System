import React, { useState, useEffect } from "react";
import { Icons } from "./MembersPortal";

const PastorDepartmentApproval = ({ user, onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/department-request/approvals", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch approval requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        setProcessing(requestId);
        setError("");
        try {
            const response = await fetch(`/api/department-request/${requestId}/approve`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                // Remove approved request from list
                setRequests(requests.filter((r) => r.id !== requestId));
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to approve request");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId) => {
        const notes = prompt("Reason for rejection (optional):");
        setProcessing(requestId);
        setError("");
        try {
            const response = await fetch(`/api/department-request/${requestId}/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
                body: JSON.stringify({ notes: notes || null }),
            });
            const data = await response.json();
            if (data.success) {
                // Remove rejected request from list
                setRequests(requests.filter((r) => r.id !== requestId));
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to reject request");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500"></div>
            </div>
        );
    }

    if (error && requests.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchPendingApprovals}
                    className="mt-4 text-gold-600 hover:text-gold-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Department Requests</h3>
                <p className="text-sm text-gray-500">Review and approve member requests</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Icons.Check className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No pending department requests</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">
                                        {(request.user && request.user.name && request.user.name.charAt(0)) || "M"}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">
                                        {request.user && request.user.name || "Member"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Requesting to join: <span className="font-medium text-gold-600">{(request.department && request.department.name) ? request.department.name : 'Unknown Department'}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Submitted: {new Date(request.requested_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {request.notes && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">{request.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(request.id)}
                                    disabled={processing === request.id}
                                    className="flex-1 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {processing === request.id ? "..." : "Approve"}
                                </button>
                                <button
                                    onClick={() => handleReject(request.id)}
                                    disabled={processing === request.id}
                                    className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {processing === request.id ? "..." : "Reject"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastorDepartmentApproval;
