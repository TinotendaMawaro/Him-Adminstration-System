import { Icons } from "../MembersPortal";
import EventCountdown from "./EventCountdown";

export default function FeaturedEventBanner({ event, onRegister, isRegistered, onAddReminder, onShare, onViewDetails }) {
  if (!event) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${event.banner_image || event.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/80 to-transparent" />

      <div className="relative p-6 md:p-8 space-y-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider ring-1 ring-[#d4af37]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            Featured Event
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-3">
            {event.title}
          </h3>
          {event.theme && (
            <p className="text-sm text-gray-300 italic mt-1">"{event.theme}"</p>
          )}
        </div>

        <div className="space-y-2 text-xs text-gray-300">
          {event.host && (
            <p className="flex items-center gap-2">
              <Icons.User className="w-3.5 h-3.5 text-[#d4af37]" />
              {Array.isArray(event.host) ? event.host.join(" & ") : event.host}
            </p>
          )}
          {event.venue_name && (
            <p className="flex items-center gap-2">
              <Icons.MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              {event.venue_name}
              {event.venue_address && <span className="text-gray-500">• {event.venue_address}</span>}
            </p>
          )}
        </div>

        {event.starts_at && (
          <div className="lux-card p-4 inline-block">
            <EventCountdown targetDate={event.starts_at} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!isRegistered && event.registration_open && (
            <button
              onClick={() => onRegister?.(event.id)}
              className="lux-btn px-5 py-2 text-sm bg-gradient-to-r from-[#d4af37] to-amber-600 text-white shadow-lg shadow-[#d4af37]/20 hover:from-[#d4af37] hover:to-amber-500"
            >
              Register Now
            </button>
          )}
          <button onClick={() => onAddReminder?.(event)} className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10">
            <Icons.Bell className="w-3.5 h-3.5" /> Add Reminder
          </button>
          <button onClick={() => onShare?.(event)} className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10">
            <Icons.Share className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={() => onViewDetails?.(event)} className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10">
            View Details
          </button>
        </div>

        {event.registration_count > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-amber-600 border-2 border-[#0A192F] flex items-center justify-center text-[8px] text-white font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-300">
              <span className="text-white font-semibold">
                {event.registration_count.toLocaleString()}
              </span>{" "}
              people registered
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
