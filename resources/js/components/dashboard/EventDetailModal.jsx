import { Icons } from "../icons";

export default function EventDetailModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg lux-card p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <Icons.XMark className="w-5 h-5" />
        </button>

        {event.image && (
          <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-100/10 flex items-center justify-center mb-4 overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h3 className="text-xl font-bold text-white">{event.title}</h3>
        {event.theme && <p className="text-sm text-gray-300 italic mt-1">"{event.theme}"</p>}

        <div className="lux-divider my-4" />

        <div className="space-y-3">
          {event.description && <p className="text-sm text-gray-300">{event.description}</p>}
          {event.starts_at && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Icons.Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              {new Date(event.starts_at).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {event.venue_name && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Icons.MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              {event.venue_name}
              {event.venue_address && <span className="text-gray-500">• {event.venue_address}</span>}
            </p>
          )}
          {event.host && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Icons.User className="w-3.5 h-3.5 text-[#d4af37]" />
              {Array.isArray(event.host) ? event.host.join(" & ") : event.host}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
