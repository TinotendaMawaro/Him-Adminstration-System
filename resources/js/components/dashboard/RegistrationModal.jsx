import { useState } from "react";
import { Icons } from "../icons";

export default function RegistrationModal({ event, onClose, onConfirm }) {
  const [attendanceType, setAttendanceType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!event) return null;

  const handleConfirm = async () => {
    if (!attendanceType) return;
    setSubmitting(true);
    try {
      await onConfirm?.(event.id, { attendance_type: attendanceType });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md lux-card p-6 animate-[fade-in-scale_0.3s_ease-out_forwards]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Icons.XMark className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Register for Event</h3>
        <div className="lux-divider mb-5" />

        <div className="mb-5">
          <p className="text-sm font-semibold text-white">{event.title}</p>
          <p className="text-xs text-gray-400 mt-1">
            {event.starts_at
              ? new Date(event.starts_at).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date TBD"}
          </p>
        </div>

        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Select Attendance Type
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setAttendanceType("physical")}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              attendanceType === "physical"
                ? "border-[#d4af37] bg-[#d4af37]/5"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                  attendanceType === "physical"
                    ? "border-[#d4af37]"
                    : "border-gray-500"
                }`}
              >
                {attendanceType === "physical" && (
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Physical Attendance
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {event.venue_name || "Venue TBD"}
                  {event.venue_address && ` • ${event.venue_address}`}
                </p>
                {event.capacity && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {event.registration_count || 0} / {event.capacity}{" "}
                    registered
                    {event.is_full && " (FULL)"}
                  </p>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => setAttendanceType("online")}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              attendanceType === "online"
                ? "border-[#d4af37] bg-[#d4af37]/5"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                  attendanceType === "online"
                    ? "border-[#d4af37]"
                    : "border-gray-500"
                }`}
              >
                {attendanceType === "online" && (
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Online Attendance
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {event.is_livestream
                    ? "Livestream via YouTube"
                    : "Online participation link will be sent after registration"}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="lux-btn px-4 py-2 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!attendanceType || submitting}
            className="lux-btn px-5 py-2 text-sm bg-gradient-to-r from-[#d4af37] to-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
