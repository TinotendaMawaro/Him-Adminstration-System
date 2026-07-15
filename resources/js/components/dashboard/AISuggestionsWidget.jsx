import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import EventCard from "./EventCard";

export default function AISuggestionsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", "events"],
    queryFn: () => api.get("/recommendations/events").then((r) => r.data.data ?? []),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <div className="gradient-border card-hover p-5">
        <h3 className="text-sm font-bold text-white mb-3">✨ Recommended For You</h3>
        <p className="text-xs text-gray-500">Loading suggestions...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="gradient-border card-hover p-5">
        <h3 className="text-sm font-bold text-white mb-3">✨ Recommended For You</h3>
        <p className="text-xs text-gray-500">
          Start engaging with events to get personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-border card-hover p-5">
      <h3 className="text-sm font-bold text-white mb-3">✨ Recommended For You</h3>
      <p className="text-[10px] text-gray-400 mb-3">Based on your interests and activity</p>
      <div className="space-y-2">
        {data.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
