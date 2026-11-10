import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../icons";

const formatDistance = (km) => {
    if (km == null) return "";
    if (km < 1) return `${Math.round(km * 1000)} m away`;
    return `${km} km away`;
};

const meetingLabel = (day, time) => {
    const parts = [day, time].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Schedule TBA";
};

const contextLabel = (reason, zone) => {
    if (reason === "same_zone") return zone ? `In your ${zone} zone` : "In your zone";
    if (reason === "same_region") return "In your region";
    if (reason === "same_province") return "In your province";
    return "Closest to you";
};

export default function NearbyHomeGroups({ onJoin }) {
    const { data, isLoading } = useQuery({
        queryKey: ["recommendations", "nearby-home-groups"],
        queryFn: () =>
            api.get("/recommendations/nearby-home-groups").then((r) => r.data.data ?? null),
        staleTime: 1000 * 60 * 30,
    });

    if (!isLoading && !data) return null;

    return (
        <div className="rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/15 p-3.5 mb-5 text-left">
            <div className="flex items-center gap-2 mb-1">
                <Icons.MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wide">
                    Suggested home group
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-2 mt-1">
                    <div className="h-4 w-2/3 rounded bg-emerald-500/20 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-emerald-500/10 animate-pulse" />
                </div>
            ) : (
                <>
                    <p className="text-sm font-semibold text-white">{data.name}</p>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        {contextLabel(data.match_reason, data.zone)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDistance(data.distance_km)}
                        {data.zone ? ` · ${data.zone}` : ""}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {meetingLabel(data.meeting_day, data.meeting_time)}
                        {data.member_count != null ? ` · ${data.member_count} members` : ""}
                        {data.leader ? ` · Led by ${data.leader}` : ""}
                    </p>
                </>
            )}
        </div>
    );
}
