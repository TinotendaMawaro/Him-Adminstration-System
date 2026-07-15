import { useMemo } from "react";
import SmartEventCard from "./SmartEventCard";

function getGroupLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(date);
  const eventDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );
  const diffDays = Math.round((eventDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 7) return "This Week";
  if (diffDays > 7 && diffDays <= 14) return "Next Week";
  if (eventDate.getMonth() === now.getMonth()) return "Later This Month";
  return "Next Month";
}

function groupEventsByDate(events) {
  const groups = {};
  events.forEach((event) => {
    if (!event.starts_at) return;
    const label = getGroupLabel(event.starts_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
  });
  return groups;
}

export default function EventsTimeline({
  events,
  isRegistered,
  onRegister,
  onCancelRegistration,
  registrationStatus,
  page = 1,
  onPageChange,
  pageSize = 6,
  onViewDetails,
  onShare,
  onAddReminder,
}) {
  const grouped = useMemo(() => groupEventsByDate(events || []), [events]);

  const order = [
    "Today",
    "Tomorrow",
    "This Week",
    "Next Week",
    "Later This Month",
    "Next Month",
  ];

  const sortedGroups = order.filter((label) => grouped[label]);

  const flatEvents = useMemo(() => sortedGroups.flatMap((label) => grouped[label]), [sortedGroups, grouped]);
  const totalPages = Math.max(1, Math.ceil(flatEvents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedEvents = flatEvents.slice((safePage - 1) * pageSize, safePage * pageSize);

  const paginatedGroups = useMemo(() => {
    const map = {};
    paginatedEvents.forEach((event) => {
      const label = getGroupLabel(event.starts_at);
      if (!map[label]) map[label] = [];
      map[label].push(event);
    });
    return map;
  }, [paginatedEvents]);

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Events Found
        </h3>
        <p className="text-gray-500 text-sm">
          Check back later for new events or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.keys(paginatedGroups).length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No events on this page.</div>
      )}
      {Object.entries(paginatedGroups).map(([label, groupEvents]) => (
        <div key={label}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
              {label}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-[10px] text-gray-500">
              {groupEvents.length} event{groupEvents.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {groupEvents.map((event) => (
              <SmartEventCard
                key={event.id}
                event={event}
                isRegistered={isRegistered?.[event.id]}
                onRegister={onRegister}
                onCancelRegistration={onCancelRegistration}
                registrationStatus={registrationStatus?.[event.id]}
                onViewDetails={onViewDetails}
                onShare={onShare}
                onAddReminder={onAddReminder}
              />
            ))}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => onPageChange?.(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
