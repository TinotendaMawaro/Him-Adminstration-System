import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext.jsx";

/**
 * PartnerEnrollmentPage
 *
 * Protected route: /partner/enroll
 *
 * Entry point: AuthPage partner prompt ("Partner Now") or direct logged-in access.
 *
 * Flow:
 *  - Loads active partnership packages from /api/partnership-packages
 *  - User selects a package, contribution type, and payment method
 *  - Payment proof can be uploaded
 *  - Submits to POST /api/partners/enroll
 *
 * Backend behavior:
 *  - Card/PayPal/Visa → partner created as Active, payment as Completed
 *  - EcoCash/OneMoney/InnBucks/Paynow/Bank Transfer → partner created as Pending, payment as Pending
 *  - Partner number is auto-generated as PT-{ZONE}-{SEQ}
 */

const CONTRIBUTION_TYPES = [
    { key: "monthly", label: "Monthly Recurring" },
    { key: "quarterly", label: "Quarterly" },
    { key: "annually", label: "Annually" },
    { key: "one_time", label: "One-Time Seed" },
];

const PAYMENT_METHODS = [
    { key: "ecocash", label: "EcoCash" },
    { key: "onemoney", label: "OneMoney" },
    { key: "innbucks", label: "InnBucks" },
    { key: "paynow", label: "Paynow" },
    { key: "visa", label: "Visa" },
    { key: "mastercard", label: "Mastercard" },
    { key: "paypal", label: "PayPal" },
    { key: "bank_transfer", label: "Bank Transfer" },
];

export default function PartnerEnrollmentPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: meData, isLoading: loadingMe } = useQuery({
        queryKey: ["partner", "me"],
        queryFn: async () => {
            try {
                const { data } = await axios.get("/api/partners/me");
                return data.data;
            } catch (err) {
                if (err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!user,
    });

    useEffect(() => {
        if (meData && !loadingMe) {
            navigate("/dashboard", { replace: true });
        }
    }, [meData, loadingMe, navigate]);

    if (loadingMe) {
        return <div className="p-8 text-center text-white/70">Loading…</div>;
    }
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [contributionType, setContributionType] = useState("monthly");
    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState("");

    const { data: packagesData, isLoading } = useQuery({
        queryKey: ["partnership-packages"],
        queryFn: async () => {
            const { data } = await axios.get("/api/partnership-packages");
            return data.data;
        },
    });

    const packages = packagesData || [];

    const enrollMutation = useMutation({
        mutationFn: async (payload) => {
            const form = new FormData();
            form.append("package_id", payload.package_id);
            form.append("contribution_type", payload.contribution_type);
            form.append("payment_method", payload.payment_method);
            if (payload.payment_reference) form.append("payment_reference", payload.payment_reference);
            if (payload.payment_notes) form.append("payment_notes", payload.payment_notes);
            if (payload.receipt) form.append("payment_proof", payload.receipt);
            const { data } = await axios.post("/api/partners/enroll", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["partner"]);
            setError("");
            alert("Enrollment submitted! Your partner status is pending until payment is verified.");
            window.location.href = "/dashboard";
        },
        onError: (err) => {
            setError(err.response?.data?.message || "Enrollment failed. Please try again.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!selectedPackageId) {
            setError("Please select a partnership package.");
            return;
        }
        enrollMutation.mutate({
            package_id: selectedPackageId,
            contribution_type: contributionType,
            payment_method: paymentMethod,
            payment_reference: paymentReference,
            payment_notes: paymentNotes,
            receipt: receipt,
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-white/70">Loading packages…</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f1f33] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Become a Partner</h1>
                    <p className="text-white/70 text-sm">Select a package, choose your contribution type, and submit your first payment.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Packages */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackageId(pkg.id)}
                                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${selectedPackageId === pkg.id ? "border-amber-400 bg-white/10 shadow-lg shadow-amber-500/20" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                            >
                                <div className="h-2 rounded-full mb-4" style={{ backgroundColor: pkg.color || "#3b82f6" }} />
                                <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                <p className="text-2xl font-extrabold text-amber-400 mb-2">${pkg.monthly_amount}<span className="text-sm text-white/60">/mo</span></p>
                                <ul className="space-y-1 mb-4">
                                    {(pkg.benefits || []).map((b, i) => (
                                        <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                                            <span className="text-emerald-400">✓</span> {b}
                                        </li>
                                    ))}
                                </ul>
                                {selectedPackageId === pkg.id && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-[#1e3a5f] text-[10px] font-bold uppercase tracking-wider">Selected</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contribution & Payment */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white/70 mb-1 font-medium">Contribution Type</label>
                                <select value={contributionType} onChange={(e) => setContributionType(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                                    {CONTRIBUTION_TYPES.map((ct) => (
                                        <option key={ct.key} value={ct.key} className="text-gray-900">{ct.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-white/70 mb-1 font-medium">Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                                    {PAYMENT_METHODS.map((pm) => (
                                        <option key={pm.key} value={pm.key} className="text-gray-900">{pm.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/70 mb-1 font-medium">Payment Reference / Transaction ID (optional)</label>
                            <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="e.g. EcoCash TXN123456" className="w-full rounded-xl bg-white/10 border border-white/10 text-white px-3 py-2.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>

                        <div>
                            <label className="block text-xs text-white/70 mb-1 font-medium">Payment Notes (optional)</label>
                            <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={3} placeholder="Any additional details about this payment" className="w-full rounded-xl bg-white/10 border border-white/10 text-white px-3 py-2.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>

                        <div>
                            <label className="block text-xs text-white/70 mb-1 font-medium">Upload Receipt / Proof (optional)</label>
                            <input type="file" accept="image/*,.pdf" onChange={(e) => setReceipt(e.target.files[0] || null)} className="w-full rounded-xl bg-white/10 border border-white/10 text-white px-3 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#1e3a5f] hover:file:bg-amber-500" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={enrollMutation.isPending} className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-[#1e3a5f] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {enrollMutation.isPending ? "Submitting…" : "Submit Enrollment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
