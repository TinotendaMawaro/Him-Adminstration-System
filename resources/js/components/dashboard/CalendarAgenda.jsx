import { useMemo } from "react";

export default function CalendarAgenda({ events = [], onSelectEvent }) {
  const grouped = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!event.starts_at) return;
      const key = new Date(event.starts_at).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return Object.entries(map).sort(([a], [b]) => new Date(a) - new Date(b));
  }, [events]);

  if (!events.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">No events match your filters.</div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateStr, dayEvents]) => (
        <div key={dateStr}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
              {new Date(dateStr).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="space-y-2">
            {dayEvents.map((event) => {
              const time = event.starts_at
                ? new Date(event.starts_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "TBD";

              return (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent?.(event)}
                  className="w-full text-left gradient-border card-hover p-3 flex items-center gap-3"
                >
                  <span className="text-xs text-gray-500 font-mono w-16 flex-shrink-0">{time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                    <p className="text-[10px] text-gray-400">{event.venue_name || "Venue TBD"}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${
                      event.category === "International"
                        ? "bg-[#d4af37]/10 text-[#d4af37]"
                        : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {event.category || "General"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
