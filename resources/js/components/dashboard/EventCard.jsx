export default function EventCard({ event }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm">📅</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{event.title}</p>
        <p className="text-[10px] text-gray-400">
          {event.starts_at ? new Date(event.starts_at).toLocaleDateString() : "TBD"} • {event.venue_name || "TBD"}
        </p>
      </div>
      <button className="text-[10px] text-sky-400 font-semibold hover:text-sky-300">
        Details →
      </button>
    </div>
  );
}
