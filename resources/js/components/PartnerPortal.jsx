import React, { useState } from "react";
import PortalLayout from "./PortalLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import IdCardPanel from "./IdCardPanel.jsx";

// This portal's calls are written as "/api/…" against raw axios, which carries no login token (every call was a 401).
// Route them through the shared authenticated client (its baseURL already supplies "/api").
const axios = {
    get: (url, config) => api.get(url.replace(/^\/api/, ""), config),
    post: (url, data, config) => api.post(url.replace(/^\/api/, ""), data, config),
    put: (url, data, config) => api.put(url.replace(/^\/api/, ""), data, config),
};

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const TIER_BENEFITS_MAP = {
    gold: ["Weekly Bible Verse", "Partner Newsletter"],
    silver: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support"],
    platinum: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support", "Access to Partner Portal", "Special Resource Access"],
    jubilee: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support", "Access to Partner Portal", "Special Resource Access", "Quarterly Partner Meetings", "Special Ministry Recognition"],
    game_changer: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support", "Access to Partner Portal", "Special Resource Access", "Quarterly Partner Meetings", "Special Ministry Recognition", "Priority Event Seating", "Direct Ministry Updates"],
    diamond: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support", "Access to Partner Portal", "Special Resource Access", "Quarterly Partner Meetings", "Special Ministry Recognition", "Priority Event Seating", "Direct Ministry Updates", "Executive Ministry Access", "Annual Partnership Retreat"],
    executive: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support", "Access to Partner Portal", "Special Resource Access", "Quarterly Partner Meetings", "Special Ministry Recognition", "Priority Event Seating", "Direct Ministry Updates", "Executive Ministry Access", "Annual Partnership Retreat", "Board Governance Role", "International Ministry Connection"],
    financial_apostle: ["All benefits unlocked", "Highest mantle of financial partnership and governance", "+ more exclusive benefits"],
};

const TIER_LABELS = {
    gold: "Gold · Financial Seeds",
    silver: "Silver Partner",
    platinum: "Platinum · Vision Partner",
    jubilee: "Jubilee Partner",
    game_changer: "Game Changer Partner",
    diamond: "Diamond Partner",
    executive: "Executive Partner",
    financial_apostle: "Financial Apostle (Elite)",
};

const SECTION_STYLES = "bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg";

function PartnerDashboard({ user }) {
    const queryClient = useQueryClient();
    const [activePage, setActivePage] = useState("dashboard");
    const [payType, setPayType] = useState("tithe");
    const [payForm, setPayForm] = useState({ amount: "", method: "cash", transaction_id: "", notes: "", receipt: null });
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);

    const { data: meData, isLoading: loadingMe } = useQuery({
        queryKey: ["partner", "me"],
        queryFn: async () => {
            const { data } = await axios.get("/api/partners/me");
            return data.data;
        },
    });

    const { data: summaryData } = useQuery({
        queryKey: ["partner", "summary"],
        queryFn: async () => {
            const { data } = await axios.get("/api/partners/me/summary");
            return data.data;
        },
    });

    const { data: paymentsData } = useQuery({
        queryKey: ["partner", "payments"],
        queryFn: async () => {
            const { data } = await axios.get("/api/partners/me/payments");
            return data.data;
        },
    });

    const { data: benefitsData } = useQuery({
        queryKey: ["partner", "benefits"],
        queryFn: async () => {
            const { data } = await axios.get("/api/partners/me/benefits");
            return data.data;
        },
    });

    const submitPayment = useMutation({
        mutationFn: async (payload) => {
            const form = new FormData();
            form.append("type", payload.type);
            form.append("amount", payload.amount);
            form.append("method", payload.method);
            form.append("transaction_id", payload.transaction_id || "");
            form.append("notes", payload.notes || "");
            form.append("currency", "USD");
            if (payload.receipt) form.append("receipt", payload.receipt);
            const { data } = await axios.post("/api/partners/me/payment", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: () => {
            setSuccessMsg("Payment submitted successfully! We will verify and unlock your benefits shortly.");
            setPayForm({ amount: "", method: "cash", transaction_id: "", notes: "", receipt: null });
            queryClient.invalidateQueries(["partner"]);
        },
        onSettled: () => setSubmitting(false),
    });

    const handlePaySubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMsg(null);
        submitPayment.mutate({
            type: payType,
            amount: payForm.amount,
            method: payForm.method,
            transaction_id: payForm.transaction_id,
            notes: payForm.notes,
            receipt: payForm.receipt,
        });
    };

    const partner = meData;
    const tierKey = partner?.tier?.value || partner?.tier || "gold";
    const tierLabel = TIER_LABELS[tierKey] || TIER_LABELS.gold;
    const apiBenefits = (benefitsData || []).map(b => b.label);
    const benefits = apiBenefits.length > 0 ? apiBenefits : (TIER_BENEFITS_MAP[tierKey] || TIER_BENEFITS_MAP.gold);
    const colorMap = {
        gold: "from-yellow-100 to-yellow-200 text-yellow-800",
        silver: "from-gray-100 to-gray-200 text-gray-800",
        platinum: "from-gray-200 to-gray-300 text-gray-900",
        jubilee: "from-emerald-100 to-emerald-200 text-emerald-900",
        game_changer: "from-sky-100 to-sky-200 text-sky-900",
        diamond: "from-cyan-100 to-cyan-200 text-cyan-900",
        executive: "from-violet-100 to-violet-200 text-violet-900",
        financial_apostle: "from-gold-200 via-gold-300 to-amber-300 text-amber-900",
    };

    const renderPage = () => {
        if (activePage === "give" || activePage === "payments") {
            return (
                <div className="space-y-6">
                    <div className={SECTION_STYLES}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Give Online</h3>{successMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{successMsg}</div>}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {[
                                { key: "tithe", label: "Tithe", desc: "10% of your income", icon: "📈" },
                                { key: "offering", label: "Offering", desc: "Freewill giving", icon: "🎁" },
                                { key: "family_altar", label: "Seed / Family Altar", desc: "Special covenant giving", icon: "🏠" },
                            ].map((btn) => (
                                <button key={btn.key} onClick={() => { setPayType(btn.key); setSuccessMsg(null); }}
                                    className={`flex-1 min-w-[140px] py-4 rounded-2xl border text-center transition-all ${payType === btn.key ? "border-gold-400 shadow-lg bg-gold-50" : "border-white/60 bg-white hover:bg-gray-50"}`}>
                                    <span className="text-2xl block mb-1">{btn.icon}</span>
                                    <span className="block text-sm font-semibold text-gray-900">{btn.label}</span>
                                    <span className="block text-xs text-gray-500">{btn.desc}</span>
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handlePaySubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                                <input type="number" min="1" step="0.01" required value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400">
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="card">Card (Visa/Mastercard)</option>
                                    <option value="mobile_money">Mobile Money (EcoCash)</option>
                                    <option value="online">PayPal / Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction / Receipt Reference</label>
                                <input type="text" value={payForm.transaction_id} onChange={(e) => setPayForm((f) => ({ ...f, transaction_id: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" rows="2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt (optional)</label>
                                <input type="file" accept="image/*,.pdf" onChange={(e) => setPayForm((f) => ({ ...f, receipt: e.target.files[0] || null }))} className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm" />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium shadow-lg shadow-gold-500/25 hover:from-gold-500 hover:to-gold-700 transition-all disabled:opacity-50">
                                {submitting ? "Submitting..." : `Submit ${payType === "tithe" ? "Tithe" : payType === "offering" ? "Offering" : "Seed"}`}
                            </button>
                        </form>
                    </div>

                    {paymentsData && (
                        <div className={SECTION_STYLES}>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Giving</h3>
                            <div className="space-y-3">
                                {paymentsData.data && paymentsData.data.length > 0 ? paymentsData.data.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-white/60">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{p.type?.label || p.type?.value}</p>
                                            <p className="text-xs text-gray-500">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "Pending"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{p.status?.label || p.status?.value}</span>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No payments recorded yet.</p>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className={`bg-gradient-to-br ${colorMap[tierKey] || colorMap.gold} rounded-3xl p-8 border border-white/40 shadow-lg`}>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1">Your Partnership Level</p>
                    <h1 className="text-3xl font-bold mb-2">{partner?.full_name || user?.name || "Partner"}</h1>
                    <p className="text-lg font-medium">{tierLabel}</p>
                    <p className="text-sm opacity-80 mt-1">Member since {partner?.partnership_date ? new Date(partner.partnership_date).toLocaleDateString() : "N/A"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={SECTION_STYLES}>
                        <p className="text-xs text-gray-500 mb-1">Total Giving</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData?.total_giving)}</p>
                    </div>
                    <div className={SECTION_STYLES}>
                        <p className="text-xs text-gray-500 mb-1">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData?.this_month)}</p>
                    </div>
                    <div className={SECTION_STYLES}>
                        <p className="text-xs text-gray-500 mb-1">This Year</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData?.this_year)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={SECTION_STYLES}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Benefits</h3>
                        <div className="space-y-2">
                            {benefits.map((b, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-base">✨</span>
                                    <span>{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={SECTION_STYLES}>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Give</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { key: "tithe", label: "Tithe" },
                                    { key: "offering", label: "Offering" },
                                    { key: "family_altar", label: "Seed" },
                                ].map((btn) => (
                                    <button key={btn.key} onClick={() => { setActivePage("give"); setPayType(btn.key); }}
                                        className="py-3 rounded-xl bg-white border border-white/60 text-xs font-bold text-gray-900 hover:shadow-md transition-all">
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={SECTION_STYLES}>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Upgrade Tier</h3>
                            <p className="text-sm text-gray-600 mb-3">Partner at a higher level and unlock more benefits.</p>
                            <button onClick={() => setActivePage("upgrade")} className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium shadow-lg hover:from-gold-500 hover:to-gold-700 transition-all">
                                View Tiers & Upgrade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PortalLayout
            user={user}
            activePage={activePage}
            setActivePage={(p) => { setActivePage(p); if (p === "payments" || p === "give") { setActivePage("give"); } }}
            onLogout={() => {}}
            colorScheme="pink"
        >
            {activePage === "upgrade" ? (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-3xl p-8 border border-gold-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partnership Tiers</h2>
                        <p className="text-gray-600 text-sm">Choose the level of partnership God is calling you into.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[
                            { key: "gold", min: 5, label: "Financial Seeds", color: "from-yellow-400 to-yellow-600" },
                            { key: "silver", min: 10, label: "Silver Partner", color: "from-gray-300 to-gray-500" },
                            { key: "platinum", min: 20, label: "Platinum", color: "from-gray-400 to-gray-600" },
                            { key: "jubilee", min: 50, label: "Jubilee Partner", color: "from-emerald-400 to-emerald-600" },
                            { key: "game_changer", min: 100, label: "Game Changer", color: "from-sky-400 to-blue-600" },
                            { key: "diamond", min: 200, label: "Diamond Partner", color: "from-cyan-300 to-cyan-600" },
                            { key: "executive", min: 400, label: "Executive Partner", color: "from-violet-400 to-violet-700" },
                            { key: "financial_apostle", min: 400, label: "Financial Apostle", color: "from-gold-300 via-gold-500 to-amber-600", elite: true },
                        ].map((tier) => (
                            <div key={tier.key} className={`rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-5 ${tierKey === tier.key ? "ring-2 ring-gold-400" : ""}`}>
                                {tier.elite && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold-300 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md mb-3">★ Elite Status</span>}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} shadow-lg flex items-center justify-center text-white mb-3`}>✦</div>
                                <h4 className="font-bold text-gray-900">{tier.label}</h4>
                                <p className="text-sm font-semibold text-gold-700">${tier.min}+ / month</p>
                                <ul className="mt-3 space-y-1 text-xs text-gray-600 list-disc list-inside">
                                    {(TIER_BENEFITS_MAP[tier.key] || []).map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                                {tierKey === tier.key ? (
                                    <button disabled className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold">Current Tier</button>
                                ) : (
                                    <button onClick={() => { setActivePage("give"); setPayType("partnership"); setPayForm((f) => ({ ...f, amount: String(tier.min) })); }}
                                        className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs font-bold shadow hover:from-gold-500 hover:to-gold-700 transition-all">
                                        Partner at This Level
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {renderPage()}
                    {activePage !== "give" && activePage !== "payments" && <div className="mt-6"><IdCardPanel /></div>}
                </>
            )}
        </PortalLayout>
    );
}

export default function PartnerPortal({ user, onLogout }) {
    return <PartnerDashboard user={user} />;
}
