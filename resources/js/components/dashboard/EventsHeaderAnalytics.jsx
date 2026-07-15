import EventsHeaderStats from "./EventsHeaderStats";

export default function EventsHeaderAnalytics({ stats }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative p-6 md:p-8 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-[0.2em] mb-1">
            Events Hub
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            📅 Events: Stay connected with everything happening across
            Heartfelt International Ministries.
          </h2>
          <p className="text-sm text-gray-400 italic mt-2 font-serif">
            "My Times & Seasons."
          </p>
        </div>

        <EventsHeaderStats stats={stats} />

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <span className="text-xs text-gray-400">
            Registered:{" "}
            <span className="text-white font-semibold">
              {stats?.registeredCount ?? 0}
            </span>
          </span>
          <span className="text-xs text-gray-400">
            Attended:{" "}
            <span className="text-white font-semibold">
              {stats?.attendedCount ?? 0}
            </span>
          </span>
          <a
            href="https://youtube.com/@HIM"
            target="_blank"
            rel="noopener"
            className="text-xs text-[#d4af37] hover:text-amber-400 font-semibold flex items-center gap-1"
          >
            Livestreams available today <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
