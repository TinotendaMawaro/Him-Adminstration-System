import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../MembersPortal";
import EventCard from "./EventCard";

export default function RecommendationsWidget({ user }) {
  const { data: events } = useQuery({
    queryKey: ["recommendations", "events", user?.id],
    queryFn: () => api.get("/recommendations/events").then((r) => r.data.data ?? []),
    staleTime: 1000 * 60 * 30,
    enabled: !!user,
  });

  const CONFERENCES = [
    { name: "Catch The Fire Conference", note: "Aug 24–30 · Richland" },
    { name: "Empowerment Summit SA", note: "Jul 23–25 · South Africa" },
    { name: "Kingdom Service Conference", note: "Feb 26–28 · Richland" },
    { name: "Women on Fire Conference", note: "Jul 1–4 · Richland" },
    { name: "Interdenominational Ministers & Leaders Conference", note: "Nov 12–14 · Richland" },
  ];

  return (
    <div className="space-y-4">
      <div className="gradient-border card-hover p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.MapPin className="w-4 h-4 text-[#d4af37]" />
          Recommended For You
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Engage with events across the ministry and we'll tailor recommendations
          to the gatherings you care about. Start with these upcoming
          conferences and summits:
        </p>
        <ul className="space-y-2">
          {CONFERENCES.map((conf) => (
            <li
              key={conf.name}
              className="flex items-start gap-2 text-xs text-gray-300"
            >
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#d4af37] shrink-0" />
              <span>
                <span className="font-medium text-gray-100">{conf.name}</span>
                <span className="block text-[10px] text-gray-500">{conf.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-gray-500 mt-4">
          Register for an event and it will appear under your registered events.
        </p>
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
