import React, { useRef } from "react";

const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l1.5 1.5.75-.75 2.25-1.5.75.75 1.5 1.5M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
    </svg>
);

const DocumentDownloadIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 13l3-3m0 0l-3-3m3 3H3" />
    </svg>
);

const ShareIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100-2.25 2.217L8 10.907l-1.107-.01a2.25 2.25 0 100 4.43 2.217L8 10.907l1.107.01zm0 0l2.217 2.217L12 14.124l-1.107-.01-2.217-2.217z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5l3 3m0 0l-3 3m3-3H9" />
    </svg>
);

const CrossIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function buildMembershipPayload(user) {
    return {
        name: user?.name || "Member",
        memberCode: user?.unique_code || user?.member?.member_code || "xxxxx",
        zone: user?.zone?.name || "Not Assigned",
        region: user?.zone?.region?.name || "Not Assigned",
        pastor: user?.pastor?.user?.name || user?.zone?.pastor_name || "Not Assigned",
        email: user?.email || "",
        phone: user?.phone || "",
        membershipDate: user?.member?.membership_date || "",
        status: user?.member?.status || "active",
        church: "Heartfelt International Ministries",
    };
}

export default function MembershipCard({ user }) {
    const cardRef = useRef(null);
    const payload = buildMembershipPayload(user);
    const qrData = JSON.stringify(payload);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0A192F&color=ffffff&data=${encodeURIComponent(qrData)}`;

    const membershipCode = payload.memberCode;
    const zoneName = payload.zone;
    const regionName = payload.region;
    const pastorName = payload.pastor;
    const tier = "Prospective";

    const handleDownload = () => {
        if (!cardRef.current) return;
        const printContent = cardRef.current.innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Membership Card - ${payload.name}</title>
                    <style>
                        body { font-family: system-ui, sans-serif; padding: 20px; background: #0A192F; color: white; }
                        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; max-width: 420px; margin: 0 auto; }
                        .label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; }
                        .value { font-size: 14px; font-weight: bold; color: white; font-family: monospace; }
                    </style>
                </head>
                <body><div class="card">${printContent}</div></body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My HIM Membership Card",
                    text: `Heartfelt International Ministries Membership\nMember: ${payload.name}\nZone: ${zoneName}\nCode: ${membershipCode}`,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            const text = `Heartfelt International Ministries Membership\nMember: ${payload.name}\nZone: ${zoneName}\nCode: ${membershipCode}`;
            navigator.clipboard.writeText(text);
            alert("Membership details copied to clipboard!");
        }
    };

    return (
        <div ref={cardRef} className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            {/* Premium header bar */}
            <div className="relative bg-gradient-to-r from-[#d4af37]/20 via-amber-500/10 to-[#d4af37]/20 border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
                            <CrossIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#d4af37] uppercase font-bold tracking-wider">Heartfelt International Ministries</p>
                            <p className="text-sm font-bold text-white tracking-wide">Membership Card</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            {payload.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: Member details */}
                    <div className="space-y-4">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Member Name</p>
                            <p className="text-base font-bold text-white">{payload.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Membership Code</p>
                                <p className="text-sm font-bold text-white font-mono tracking-wider">{membershipCode}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Zone</p>
                                <p className="text-sm font-bold text-white">{zoneName}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Region</p>
                                <p className="text-sm font-bold text-white">{regionName}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Pastor</p>
                                <p className="text-sm font-bold text-white truncate" title={pastorName}>{pastorName}</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Partnership Tier</p>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/20">{tier}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: QR Code */}
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-5">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-3 tracking-wider">Scan for Digital Card</p>
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white p-2 shadow-lg shadow-black/20">
                            <img
                                src={qrUrl}
                                alt="Membership QR Code"
                                className="w-48 h-48 md:w-52 md:h-52 object-contain"
                            />
                        </div>
                        <p className="text-[9px] text-gray-500 mt-3 text-center leading-relaxed">
                            Scan this code to view verified membership details
                        </p>
                    </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
                    <button
                        onClick={handleDownload}
                        className="flex-1 btn btn-sm bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 border border-white/10"
                    >
                        <DocumentDownloadIcon className="w-3.5 h-3.5" />
                        Download
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 btn btn-sm bg-gradient-to-r from-[#d4af37] to-amber-600 text-white hover:from-[#d4af37]/90 hover:to-amber-600/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#d4af37]/10"
                    >
                        <ShareIcon className="w-3.5 h-3.5" />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
}
