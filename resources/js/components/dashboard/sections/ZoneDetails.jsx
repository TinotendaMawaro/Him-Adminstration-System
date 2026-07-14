import { useState, useEffect } from "react";
import api from "../../../lib/api.js";

const TypeConfig = {
  pastor_change: {
    label: "Pastor Change",
    color: "violet",
    bg: "bg-violet-500",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  achievement: {
    label: "Achievement",
    color: "gold",
    bg: "bg-[#dfb15b]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  event: {
    label: "Event",
    color: "sky",
    bg: "bg-sky-500",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  growth: {
    label: "Growth",
    color: "emerald",
    bg: "bg-emerald-500",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  zone_created: {
    label: "Established",
    color: "rose",
    bg: "bg-rose-500",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatYear(dateString) {
  if (!dateString) return "";
  return new Date(dateString).getFullYear();
}

export default function ZoneDetails({ zone, showInfo = true }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    var _fetchData = async function () {
      try {
        var response = await api.get("/members/zone-history");
        var result = response.data;
        if (result.success && isMounted) {
          setHistory(result.data);
        } else if (isMounted) {
          setError(result.message || "Failed to load history");
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    _fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const zoneName = zone?.name || "Zone";
  const establishedYear = zone?.year_established || (zone?.created_at ? formatYear(zone.created_at) : "");

  return (
    <div className="space-y-8">
      {showInfo && (
        <>
          {/* Zone Identity Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10 p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            <div className="relative flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-2xl shadow-[#dfb15b]/20">
                  <span className="text-white font-bold text-2xl tracking-tight">
                    {zoneName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#dfb15b] uppercase tracking-[0.2em] mb-1">
                  Zone Details
                </p>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                  {zoneName}
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  {zone?.description || "A vibrant community of believers committed to spiritual growth and fellowship."}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Zone Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">
              Zone Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfb15b]/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#dfb15b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Region</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {zone?.region?.name || "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfb15b]/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#dfb15b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Pastor</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {zone?.pastor_name || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Address</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {zone?.address || "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {zone?.phone || "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/20 to-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Established</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {establishedYear ? `Year ${establishedYear}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h.75" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-0.5">Zone Code</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {zone?.code || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Zone Timeline */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">
          Zone Timeline
        </h3>
        <div className="relative">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dfb15b]"></div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
              <p className="text-sm text-red-400">Error loading timeline: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Vertical timeline line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#dfb15b]/50 via-sky-500/30 to-transparent" />

              <div className="space-y-6">
                {history.map((item, idx) => {
                  const config = TypeConfig[item.type] || TypeConfig.pastor_change;
                  return (
                    <div
                      key={item.id || idx}
                      className="relative flex gap-4"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Icon node */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shadow-lg`}>
                          {config.icon}
                        </div>
                      </div>

                      {/* Timeline card */}
                      <div className="flex-1 pb-6">
                        <div className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-sm font-bold text-white">
                                  {item.title}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${config.color}-500/20 text-${config.color}-400`}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {item.description}
                              </p>

                              {/* Pastor info */}
                              {item.pastor && (
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-[10px] font-bold">
                                    {item.pastor.name.charAt(0)}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {item.pastor.name}
                                    {item.pastor.isCurrent && (
                                      <span className="ml-1.5 text-[#dfb15b] font-medium">(Current)</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Date range */}
                              <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                                <span>{formatDate(item.start_date)}</span>
                                {item.end_date && (
                                  <>
                                    <span>—</span>
                                    <span>{formatDate(item.end_date)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {history.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">No timeline records found</p>
                    <p className="text-xs text-gray-500 mt-1">Zone history will appear here as events unfold.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
