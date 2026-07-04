import React, { useRef } from "react";

// Inline icons for MembershipCard
const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l1.5 1.5.75-.75 2.25-1.5.75.75 1.5 1.5M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
    </svg>
);

const DocumentDownloadIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 13l3-3m0 0l-3-3m3 3H3" />
    </svg>
);

const ShareIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100-2.25 2.217L8 10.907l-1.107-.01a2.25 2.25 0 100 4.43 2.217L8 10.907l1.107.01zm0 0l2.217 2.217L12 14.124l-1.107-.01-2.217-2.217z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5l3 3m0 0l-3 3m3-3H9" />
    </svg>
);

/**
 * Digital Membership Card Component
 * Displays user's membership details with download/share functionality
 */
export default function MembershipCard({ user }) {
    const cardRef = useRef(null);

    const membershipCode = user?.unique_code || user?.member?.member_code || "xxxxx";
    const zoneName = user?.zone?.name || "Not Assigned";
    const regionName = user?.zone?.region?.name || "Not Assigned";
    const pastorName = user?.pastor?.user?.name || user?.zone?.pastor_name || "Not Assigned";
    const tier = "Prospective";

    const handleDownload = () => {
        if (!cardRef.current) return;

        // Use print-friendly approach
        const printContent = cardRef.current.innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Membership Card - ${user?.name || "Member"}</title>
                    <style>
                        body { font-family: system-ui, sans-serif; padding: 20px; background: #0A192F; color: white; }
                        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; max-width: 400px; margin: 0 auto; }
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
                    text: `Heartfelt International Ministries Membership\nMember: ${user?.name}\nZone: ${zoneName}\nCode: ${membershipCode}`,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            // Fallback: copy to clipboard
            const text = `Heartfelt International Ministries Membership\nMember: ${user?.name}\nZone: ${zoneName}\nCode: ${membershipCode}`;
            navigator.clipboard.writeText(text);
            alert("Membership details copied to clipboard!");
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div ref={cardRef} className="p-4">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Heartfelt International Ministries</p>
                        <p className="text-xs font-bold text-white">Membership Card</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Card Content */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 bg-gradient-to-r from-[#d4af37]/10 to-transparent p-2 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase">Member Name</p>
                        <p className="text-sm font-bold text-white">{user?.name || "Member"}</p>
                    </div>

                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Membership Code</p>
                        <p className="text-sm font-bold text-white font-mono">{membershipCode}</p>
                    </div>

                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Zone</p>
                        <p className="text-sm font-bold text-white">{zoneName}</p>
                    </div>

                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Region</p>
                        <p className="text-sm font-bold text-white">{regionName}</p>
                    </div>

                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Pastor</p>
                        <p className="text-sm font-bold text-white truncate">{pastorName}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase">Partnership Tier</p>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">{tier}</span>
                        </div>
                    </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                    <button
                        onClick={handleDownload}
                        className="flex-1 btn btn-sm bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                    >
                        <DocumentDownloadIcon className="w-3 h-3" />
                        Download
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 btn btn-sm bg-gradient-to-r from-[#d4af37] to-amber-600 text-white hover:from-[#d4af37]/80 hover:to-amber-600/80 transition-all flex items-center justify-center gap-1"
                    >
                        <ShareIcon className="w-3 h-3" />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
}