import React, { useState, useMemo, useCallback } from "react";

const PARTNERSHIP_TIERS = [
    { key: "gold", label: "Financial Seeds", subtitle: "Resource Giving", minAmount: 5, period: "/mo", description: "Begin your partnership journey with faithful giving", color: "from-yellow-400 to-yellow-600", benefits: ["Weekly Bible Verse", "Partner Newsletter"] },
    { key: "silver", label: "Silver Partner", subtitle: "Silver", minAmount: 10, period: "/mo", description: "Standing together in covenant support", color: "from-gray-300 to-gray-500", benefits: ["Weekly Bible Verse", "Partner Newsletter", "Monthly Ministry Updates", "Prayer Support"] },
    { key: "platinum", label: "Vision Partner", subtitle: "Platinum", minAmount: 20, period: "/mo", description: "Dedicated supporter of the kingdom vision", color: "from-gray-400 to-gray-600", benefits: ["+ Silver benefits", "Access to Partner Portal", "Special Resource Access"] },
    { key: "jubilee", label: "Jubilee Partner", subtitle: "Jubilee", minAmount: 50, period: "/mo", description: "Celebrated covenant contributor", color: "from-emerald-400 to-emerald-600", benefits: ["+ Platinum benefits", "Quarterly Partner Meetings", "Special Ministry Recognition"] },
    { key: "game_changer", label: "Game Changer", subtitle: "Game Changer", minAmount: 100, period: "/mo", description: "Transforms lives through strategic generosity", color: "from-sky-400 to-blue-600", benefits: ["+ Jubilee benefits", "Priority Event Seating", "Direct Ministry Updates"] },
    { key: "diamond", label: "Diamond Partner", subtitle: "Diamond", minAmount: 200, period: "/mo", description: "Extraordinary covenant of support and influence", color: "from-cyan-300 to-cyan-600", benefits: ["+ GameChanger benefits", "Executive Ministry Access", "Annual Partnership Retreat"] },
    { key: "executive", label: "Executive Partner", subtitle: "Executive", minAmount: 400, period: "/mo", description: "Strategic partner at executive level", color: "from-violet-400 to-violet-700", benefits: ["+ Diamond benefits", "Board Governance Role", "International Ministry Connection"] },
    { key: "financial_apostle", label: "Financial Apostle", subtitle: "Elite Status · Highest Mantle", minAmount: 400, period: "+/mo", description: "Highest mantle of financial partnership and governance", color: "from-gold-300 via-gold-500 to-amber-600", benefits: ["All benefits unlocked", "Highest mantle of financial partnership and governance", "+ more exclusive benefits"] },
];

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const BenefitItem = ({ children }) => (
    <div className="flex items-center gap-2 text-sm text-gray-300">
        <svg className="w-4 h-4 text-[#d4af37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span>{children}</span>
    </div>
);

const TierBadge = ({ subtitle }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
        <span aria-hidden="true">★</span>
        <span>{subtitle}</span>
    </span>
);

const SectionHeader = ({ title, description, icon }) => (
    <div className="flex items-start gap-4 mb-6">
        {icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 shadow-lg shadow-[#d4af37]/20 shrink-0">
                <div className="w-6 h-6 text-white">{icon}</div>
            </div>
        )}
        <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            {description && <p className="text-gray-300 text-sm leading-relaxed">{description}</p>}
        </div>
    </div>
);

const TierCard = React.memo(function TierCard({ tier, onPartnerClick }) {
    const isElite = tier.key === "financial_apostle";
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => onPartnerClick?.(tier.key, tier.minAmount)}>
            <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} aria-hidden="true" />
            <div className="relative p-5">
                {isElite && <div className="mb-3"><TierBadge subtitle={tier.subtitle} /></div>}
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.color} shadow-lg shrink-0`}>
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm leading-tight">{tier.label}</h4>
                        {!isElite && <p className="text-xs text-gray-400 mt-0.5">{tier.subtitle}</p>}
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{tier.description}</p>
                        <p className="text-sm font-bold text-[#d4af37] mt-2">{formatCurrency(tier.minAmount)}{tier.period}</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {tier.benefits.map((benefit, idx) => <BenefitItem key={idx}>{benefit}</BenefitItem>)}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] group-hover:text-[#f59e0b] transition-colors">Partner Now <span aria-hidden="true">→</span></span>
                </div>
            </div>
        </div>
    );
});

const TiersView = React.memo(function TiersView({ tiers, onPartnerClick }) {
    return (
        <div className="space-y-6">
            <SectionHeader title="Partnership Tiers" description="Each tier represents a covenant level of giving — tithe, seed, offering. Choose where God has called you." icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>} />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {tiers.map((tier) => <TierCard key={tier.key} tier={tier} onPartnerClick={onPartnerClick} />)}
            </div>
        </div>
    );
});

const PaymentDetails = ({ method }) => {
    if (method === "bank_transfer") {
        return (
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-900">Bank Transfer</p>
                <p className="text-[11px] text-gray-600">Bank: Standard Chartered</p>
                <p className="text-[11px] text-gray-600">Branch: Germiston</p>
                <p className="text-[11px] text-gray-600">Account Name: Heartfelt International Ministries</p>
                <p className="text-[11px] text-gray-600">Sort Code: 051001</p>
                <p className="text-[11px] text-gray-600">Account Number: 024174599</p>
                <p className="text-[11px] text-gray-600">SWIFT: SBZAZAJJ</p>
                <p className="text-[11px] text-amber-600 font-medium">Please send proof of payment.</p>
            </div>
        );
    }
    if (method === "ecocash") {
        return (
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-900">Ecocash</p>
                <p className="text-[11px] text-gray-600">Merchant Code: 337403</p>
                <p className="text-[11px] text-gray-600">Dial *151# to pay. Use the merchant code above and enter the partnership amount.</p>
            </div>
        );
    }
    if (method === "paypal") {
        return (
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-900">PayPal / Cards</p>
                <p className="text-[11px] text-gray-600">Give securely online with PayPal or credit/debit card.</p>
                <a href="https://www.paypal.com/donate/?cmd=_donations&business=donation%40heartfeltonline.org&item_name=Donation%20to%20Heartfelt%20Online&amount=25&currency_code=USD&no_shipping=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-white text-xs font-semibold hover:from-[#f59e0b] hover:to-amber-700 transition-all">
                    Donate via PayPal
                </a>
            </div>
        );
    }
    return null;
};

export default function MembersPartnershipPage() {
    const [activeView, setActiveView] = useState("tiers");
    const [error, setError] = useState("");
    const [paymentModal, setPaymentModal] = useState(null);
    const [titheModal, setTitheModal] = useState(false);
    const [titheType, setTitheType] = useState("tithe");
    const [paymentForm, setPaymentForm] = useState({ amount: "", method: "paypal", transaction_id: "", notes: "", receipt: null });
    const [submitting, setSubmitting] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(null);

    const tiers = useMemo(() => PARTNERSHIP_TIERS, []);

    const clearError = useCallback(() => setError(""), []);
    const openPaymentModal = useCallback((tierKey, minAmount) => setPaymentModal({ tierKey, amount: minAmount }), []);
    const closePaymentModal = useCallback(() => { setPaymentModal(null); setPaymentSuccess(null); }, []);
    const handlePaymentSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 1000));
        setPaymentSuccess("Payment submitted successfully! Your tier will be activated upon verification.");
        setSubmitting(false);
    }, []);
    const handleTitheSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 1000));
        setTitheModal(false);
        setPaymentForm({ amount: "", method: "paypal", transaction_id: "", notes: "", receipt: null });
        setSubmitting(false);
    }, []);

    const tabs = useMemo(() => [
        { key: "giving", label: "Tithes & Offerings", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> },
        { key: "tiers", label: "Partnership Tiers", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg> },
    ], []);

    return (
        <div className="space-y-6">
            {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm" role="alert">
                    {error}
                    <button onClick={clearError} className="ml-3 underline text-rose-200 font-medium">Dismiss</button>
                </div>
            )}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] border border-white/10 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full blur-3xl" aria-hidden="true" />
                <div className="relative">
                    <h2 className="text-3xl font-bold text-white mb-2">Partnership Portal</h2>
                    <p className="text-gray-300 text-base max-w-2xl">Your partnership unlocks blessings and activates benefits. Choose how you would like to give below.</p>
                </div>
            </div>
            <nav className="flex flex-wrap gap-3" aria-label="Partnership sections">
                {tabs.map((tab) => {
                    const active = activeView === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveView(tab.key)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-gradient-to-r from-[#d4af37] to-amber-600 text-white shadow-lg shadow-[#d4af37]/25" : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"}`}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
            {activeView === "giving" && (
                <div className="space-y-6">
                    <SectionHeader title="Tithes & Offerings" description="Partner with the ministry through your giving." icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { key: "tithe", label: "Tithe", desc: "10% of income", color: "from-emerald-400 to-emerald-600", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> },
                            { key: "offering", label: "Offering", desc: "Freewill giving", color: "from-sky-400 to-sky-600", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m0-9v3.75" /></svg> },
                            { key: "family_altar", label: "Seed", desc: "Covenant giving", color: "from-amber-400 to-amber-600", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
                        ].map((btn) => (
                            <button key={btn.key} onClick={() => { setTitheType(btn.key); setTitheModal(true); }} className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute inset-0 bg-gradient-to-br ${btn.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
                                <div className="relative p-6 text-center">
                                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${btn.color} shadow-lg flex items-center justify-center text-white`}>
                                        {btn.icon}
                                    </div>
                                    <h4 className="font-semibold text-white text-base mb-1">{btn.label}</h4>
                                    <p className="text-sm text-gray-400">{btn.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {activeView === "tiers" && <TiersView tiers={tiers} onPartnerClick={openPaymentModal} />}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closePaymentModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Complete Partnership Payment</h3>
                            <p className="text-sm text-gray-500 mb-4">Paying for: {PARTNERSHIP_TIERS.find((t) => t.key === paymentModal.tierKey)?.label}</p>
                            {paymentSuccess ? (
                                <div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-4">{paymentSuccess}</div>
                                    <button type="button" onClick={closePaymentModal} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium">Close</button>
                                </div>
                            ) : (
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                                        <input type="number" min="1" step="0.01" required value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]">
                                            <option value="paypal">PayPal / Cards</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="ecocash">Ecocash</option>
                                        </select>
                                    </div>
                                    <PaymentDetails method={paymentForm.method} />
                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-white font-medium disabled:opacity-50 shadow-lg shadow-[#d4af37]/25">
                                            {submitting ? "Processing..." : "Submit Payment"}
                                        </button>
                                        <button type="button" onClick={closePaymentModal} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {titheModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setTitheModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {titheType === "tithe" ? "Pay Tithe" : titheType === "offering" ? "Give an Offering" : "Covenant Seed / Family Altar"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">Your giving unlocks blessings and activates benefits.</p>
                            <form onSubmit={handleTitheSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                                    <input type="number" min="1" step="0.01" required value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                        <option value="paypal">PayPal / Cards</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="ecocash">Ecocash</option>
                                    </select>
                                </div>
                                <PaymentDetails method={paymentForm.method} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
                                    <input type="text" value={paymentForm.transaction_id} onChange={(e) => setPaymentForm((f) => ({ ...f, transaction_id: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt (optional)</label>
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => setPaymentForm((f) => ({ ...f, receipt: e.target.files[0] || null }))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-medium disabled:opacity-50">
                                        {submitting ? "Submitting..." : `Submit ${titheType === "tithe" ? "Tithe" : titheType === "offering" ? "Offering" : "Seed"}`}
                                    </button>
                                    <button type="button" onClick={() => setTitheModal(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
