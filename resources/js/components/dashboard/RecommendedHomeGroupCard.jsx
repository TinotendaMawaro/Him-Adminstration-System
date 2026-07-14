import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../MembersPortal";

export default function RecommendedHomeGroupCard({ onJoin }) {
  const { data } = useQuery({
    queryKey: ["recommendations", "home-groups"],
    queryFn: () => api.get("/recommendations/home-groups").then((r) => r.data.data ?? null),
    staleTime: 1000 * 60 * 60,
  });

  const recommendation = data?.data || data;

  if (!recommendation) return null;

  return (
    <div className="gradient-border card-hover p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Icons.MapPin className="w-3.5 h-3.5 text-emerald-300" />
        </div>
        <h3 className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
          Recommended For You
        </h3>
      </div>
      <div className="bg-emerald-500/10 rounded-xl p-3">
        <p className="text-xs font-bold text-white">{recommendation.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {recommendation.meeting_day} • {recommendation.meeting_time}
        </p>
        <p className="text-[10px] text-emerald-300 mt-1 font-semibold">
          {recommendation.distance_km} km away • Perfect for new members!
        </p>
        <button
          onClick={() => onJoin?.(recommendation.id)}
          className="mt-2 w-full btn btn-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
        >
          Join This Group
        </button>
      </div>
    </div>
  );
}
