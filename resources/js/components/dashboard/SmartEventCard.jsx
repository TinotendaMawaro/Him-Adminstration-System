import { useState } from "react";
import { Icons } from "../MembersPortal";
import StatusBadge from "./StatusBadge";

function formatEventDate(startsAt, endsAt) {
  if (!startsAt) return "Date TBD";
  const start = new Date(startsAt);
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (endsAt) {
    const end = new Date(endsAt);
    const endStr = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} • ${timeStr} - ${endStr}`;
  }
  return `${dateStr} • ${timeStr}`;
}

function getCategoryAccent(category) {
  if (category === "International") return "from-[#d4af37] to-amber-600";
  if (category === "Prayer") return "from-sky-400 to-sky-600";
  if (category === "Events") return "from-emerald-400 to-emerald-600";
  return "from-gray-400 to-gray-600";
}

export default function SmartEventCard({
  event,
  isRegistered,
  onRegister,
  onCancelRegistration,
  registrationStatus,
  onViewDetails,
  onShare,
  onAddReminder,
}) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const status = registrationStatus || (isRegistered ? "registered" : null);
  const showActions = !event.is_past;
  const accent = getCategoryAccent(event.category);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`lux-card transition-all duration-500 ${
          isHovered ? "shadow-2xl shadow-black/40" : ""
        }`}
        style={{ animationDelay: "100ms" }}
      >
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          {/* Event Visual */}
          <div className="relative w-full sm:w-40 h-44 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0">
            {event.image && !imgError ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${accent} flex items-center justify-center`}
              >
                <span className="text-white/90 text-3xl font-light tracking-tight">
                  {event.title?.[0] || "📅"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Category Badge */}
            <span
              className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                event.category === "International"
                  ? "bg-[#d4af37]/90 text-[#0A192F]"
                  : event.category === "Prayer"
                  ? "bg-sky-400/90 text-[#0A192F]"
                  : "bg-white/90 text-gray-900"
              }`}
            >
              {event.category === "International" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A192F]" />
              )}
              {event.category || "General"}
            </span>
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                    {event.title}
                  </h3>
                  {event.theme && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      "{event.theme}"
                    </p>
                  )}
                </div>
                <StatusBadge status={event.status} />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-400">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icons.Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  </div>
                  <span className="text-gray-300">{formatEventDate(event.starts_at, event.ends_at)}</span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icons.MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                    <span className="text-gray-300">{event.venue_name}</span>
                  </div>
                )}
                {event.host && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icons.User className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                    <span className="text-gray-300">{event.host}</span>
                  </div>
                )}
                {event.location && !event.venue_name && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icons.MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                    <span className="text-gray-300">{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Premium Actions Bar */}
        {showActions && (
          <div className="px-5 sm:px-6 py-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
            <div className="flex flex-wrap items-center gap-2">
              {!isRegistered && event.registration_open && status !== "registering" && (
                <button
                  onClick={() => onRegister?.(event.id)}
                  className="lux-btn px-5 py-2 text-xs font-semibold bg-gradient-to-r from-[#d4af37] to-amber-600 text-white shadow-lg shadow-[#d4af37]/20 hover:from-[#d4af37] hover:to-amber-500"
                >
                  Register
                </button>
              )}
              {status === "registering" && (
                <span className="text-xs text-gray-500">Registering...</span>
              )}
              {isRegistered && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Icons.Check className="w-3.5 h-3.5" /> Registered
                </span>
              )}
              <button onClick={() => onViewDetails?.(event)} className="lux-btn px-3 py-2 text-[10px] font-semibold bg-white/5 ring-1 ring-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                Details
              </button>
              {event.venue_address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.venue_address)}`}
                  target="_blank"
                  rel="noopener"
                  className="lux-btn px-3 py-2 text-[10px] font-semibold bg-white/5 ring-1 ring-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Directions
                </a>
              )}
              {event.is_livestream && event.livestream_url && (
                <a
                  href={event.livestream_url}
                  target="_blank"
                  rel="noopener"
                  className="lux-btn px-3 py-2 text-[10px] font-semibold bg-rose-500/10 ring-1 ring-rose-500/25 text-rose-300 hover:bg-rose-500/15"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-gentle-pulse inline-block mr-1.5" />
                  Watch Live
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => onAddReminder?.(event)} className="lux-btn p-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-gray-400 hover:text-white hover:bg-white/10">
                <Icons.Calendar className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onShare?.(event)} className="lux-btn p-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-gray-400 hover:text-white hover:bg-white/10">
                <Icons.Share className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
