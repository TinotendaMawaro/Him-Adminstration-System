import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Icons } from "./MembersPortal";

const LeaderPromotionConsent = ({ user, onLogout }) => {
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null); // { success: boolean, message: string, newRole?: string }
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["my-leader-promotion"],
        queryFn: async () => {
            const res = await api.get("/home-group/my-promotion");
            if (!res.data.success) throw new Error();
            return res.data.promotion;
        },
        staleTime: 0,
        refetchInterval: 15000,
        enabled: !!user && user.role === "member",
    });

    const respondMutation = useMutation({
        mutationFn: async ({ action }) => {
            const res = await api.post(`/home-group/promotion/${data.id}/respond`, { action });
            if (!res.data.success) throw new Error(res.data.message || "Failed to respond");
            return res.data;
        },
        onSuccess: (res) => {
            if (res.new_role === "hod") {
                setResult({
                    success: true,
                    message: "You are now a Homegroup Leader.",
                    newRole: "hod",
                });
                // Immediately logout — backend invalidated all Sanctum tokens,
                // so any further query/refetch will 401 and flood the console.
                setTimeout(() => {
                    onLogout();
                }, 800);
            } else {
                setResult({ success: true, message: "Promotion request declined." });
            }
        },
        onError: (err) => {
            setResult({
                success: false,
                message: err.response?.data?.message || err.message || "Something went wrong.",
            });
        },
    });

    const handleAccept = () => {
        setProcessing(true);
        setResult(null);
        respondMutation.mutate({ action: "accept" });
    };

    const handleDecline = () => {
        setProcessing(true);
        setResult(null);
        respondMutation.mutate({ action: "decline" });
    };

    if (isLoading || !data) return null;

    const homeGroupName = data.home_group?.name || "your home group";
    const pastorName = data.pastor?.name || "your pastor";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0d1a2e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-8">
                    {!result ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center shadow-lg mb-4">
                                    <Icons.Star className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Leader Promotion</h2>
                                <p className="text-sm text-gray-400">
                                    {pastorName} has nominated you to become a{" "}
                                    <span className="text-[#d4af37] font-semibold">Homegroup Leader</span>{" "}
                                    for {homeGroupName}.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Icons.MapPin className="w-5 h-5 text-[#d4af37]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Home Group</p>
                                        <p className="text-sm font-semibold text-white">{homeGroupName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Icons.User className="w-5 h-5 text-[#d4af37]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Nominated By</p>
                                        <p className="text-sm font-semibold text-white">{pastorName}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 text-center mb-6">
                                By accepting, you will be redirected to the HOD Portal with full
                                administrative access to your homegroup. You will be logged out
                                and required to sign in again.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDecline}
                                    disabled={processing}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white/5 text-gray-300 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50 transition-all"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={processing}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#d4af37] to-amber-600 text-white shadow-lg shadow-[#d4af37]/20 hover:from-[#d4af37] hover:to-amber-700 disabled:opacity-50 transition-all"
                                >
                                    {processing ? "Processing..." : "Accept Promotion"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div
                                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg mb-4 ${
                                    result.success
                                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                        : "bg-gradient-to-br from-red-400 to-red-600"
                                }`}
                            >
                                {result.success ? (
                                    <Icons.Check className="w-8 h-8 text-white" />
                                ) : (
                                    <Icons.XMark className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {result.success ? "Success" : "Error"}
                            </h3>
                            <p className="text-sm text-gray-400">{result.message}</p>
                            {result.newRole && (
                                <p className="text-xs text-[#d4af37] mt-3">
                                    Redirecting to HOD Portal...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderPromotionConsent;
