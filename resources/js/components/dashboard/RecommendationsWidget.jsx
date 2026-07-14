import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../MembersPortal";
import SermonCard from "./SermonCard";
import EventCard from "./EventCard";

export default function RecommendationsWidget({ user }) {
  const { data: sermons } = useQuery({
    queryKey: ["recommendations", "sermons", user?.id],
    queryFn: () => api.get("/recommendations/sermons").then((r) => r.data.data ?? []),
    staleTime: 1000 * 60 * 30,
    enabled: !!user,
  });

  const { data: events } = useQuery({
    queryKey: ["recommendations", "events", user?.id],
    queryFn: () => api.get("/recommendations/events").then((r) => r.data.data ?? []),
    staleTime: 1000 * 60 * 30,
    enabled: !!user,
  });

  return (
    <div className="space-y-4">
      <div className="gradient-border card-hover p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Icons.BookOpen className="w-4 h-4 text-[#d4af37]" />
          Recommended For You
        </h3>
        <div className="space-y-2">
          {sermons?.length > 0 ? (
            sermons.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} />)
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              Start watching sermons to get personalized recommendations.
            </p>
          )}
        </div>
      </div>

      <div className="gradient-border card-hover p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Icons.Calendar className="w-4 h-4 text-sky-400" />
          Events In Your Area
        </h3>
        <div className="space-y-2">
          {events?.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">
              No upcoming events in your area right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
