import { useState } from "react";
import { Icons } from "../MembersPortal";

export default function MyRegisteredEvents({ registrations, onCancel, onBrowse }) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcoming = registrations?.filter((r) => !r.attended && new Date(r.starts_at) >= new Date()) || [];
  const past = registrations?.filter((r) => r.attended || new Date(r.starts_at) < new Date()) || [];

  const display = activeTab === "upcoming" ? upcoming : past;

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-16 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40">
        <div className="text-4xl mb-4">🎫</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Registered Events Yet
        </h3>
        <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
          Registration is quick and confirmation is instant. Browse upcoming
          events to reserve your place.
        </p>
        <button
          onClick={onBrowse}
          className="lux-btn px-5 py-2.5 text-xs font-semibold bg-[#d4af37] text-[#0A192F] hover:bg-amber-400 transition-all"
        >
          Browse Events <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">My Registered Events</h3>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {display.map((reg) => (
          <div
            key={reg.id}
            className="lux-card p-5 flex flex-col sm:flex-row gap-5"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-[#d4af37] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10px] text-[#d4af37] font-mono">
                    HIM-2026
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {reg.id?.toString().slice(-6)}
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 font-mono">
                {reg.registration_number || `#${reg.id}`}
              </p>
            </div>

            <div className="flex-1">
              <h4 className="text-base font-bold text-white">{reg.event_title}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {reg.starts_at
                  ? new Date(reg.starts_at).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date TBD"}
              </p>
              {reg.venue_name && (
                <p className="text-xs text-gray-400 mt-1">
                  {reg.venue_name}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`lux-chip ${
                    reg.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25"
                      : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      reg.status === "confirmed"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  {reg.status === "confirmed" ? "Confirmed" : reg.status}
                </span>
                <span
                  className={`lux-chip ${
                    reg.attended
                      ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25"
                      : "bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/25"
                  }`}
                >
                  {reg.attended ? "Checked In" : "Not Checked In"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
                <Icons.DocumentDownload className="w-3 h-3" /> PDF
              </button>
              <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
                <Icons.DocumentDownload className="w-3 h-3" /> Image
              </button>
              {reg.can_pay_online && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("him:give", { detail: { type: "event_registration", registrationId: reg.id } }))}
                  className="lux-btn px-3 py-1.5 text-[10px] bg-amber-500/15 ring-1 ring-amber-500/30 text-amber-200 hover:bg-amber-500/25 font-semibold"
                >
                  Pay ${Number(reg.balance_due).toFixed(2)} online
                </button>
              )}
              {activeTab === "upcoming" && (
                <button
                  onClick={() => onCancel?.(reg.event_id)}
                  className="lux-btn px-3 py-1.5 text-[10px] bg-rose-500/10 ring-1 ring-rose-500/25 text-rose-300 hover:bg-rose-500/15"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
