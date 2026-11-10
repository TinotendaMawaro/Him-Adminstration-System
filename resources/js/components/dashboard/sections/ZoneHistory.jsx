import { useState, useEffect } from "react";
import api from "../../../lib/api.js";

// Timeline-style Zone History Section - fetches real data from API
export default function ZoneHistory() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: "milestone", notes: "" });

  const load = async function() {
    try {
      var response = await api.get('/pastors/zone-history');
      var result = response.data;
      if (result.success) {
        setHistory(result.data);
      } else {
        setError(result.message || 'Failed to load history');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveEntry = async function(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post('/pastors/zone-history', form);
      setAdding(false);
      setForm({ ...form, notes: "" });
      await load();
    } catch (err) {
      var errs = err.response && err.response.data && err.response.data.errors;
      setFormError((errs && Object.values(errs).flat()[0]) || (err.response && err.response.data && err.response.data.message) || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  var formatDate = function(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  var getTypeIcon = function(type) {
    switch (type) {
      case "pastor_change":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      case "achievement":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case "event":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "growth":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case "zone_created":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  var getTypeColor = function(type) {
    switch (type) {
      case "pastor_change": return "violet";
      case "achievement": return "gold";
      case "event": return "sky";
      case "growth": return "emerald";
      case "zone_created": return "rose";
      default: return "gray";
    }
  };

  var filterOptions = [
    { value: "all", label: "All Events" },
    { value: "pastor_change", label: "Pastor Changes" },
    { value: "achievement", label: "Achievements" },
    { value: "event", label: "Events" },
    { value: "growth", label: "Growth" },
  ];

  var filteredHistory = filter === "all"
    ? history
    : history.filter(item => item.type === filter);

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
        <div className="p-6 text-center text-red-500">
          <p>Error loading history: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Zone History</h3>
          </div>

          <button type="button" onClick={() => setAdding((v) => !v)} className="px-4 py-2 rounded-xl bg-gold-500 text-white text-sm font-semibold hover:bg-gold-600 transition-colors">
            {adding ? "Cancel" : "+ Add entry"}
          </button>

          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {adding && (
        <form onSubmit={saveEntry} className="px-6 py-4 border-b border-gray-100/50 bg-gold-50/40 grid grid-cols-1 sm:grid-cols-6 gap-3">
          <label className="sm:col-span-2 text-xs font-semibold text-gray-600">Date
            <input type="date" required max={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal" />
          </label>
          <label className="sm:col-span-2 text-xs font-semibold text-gray-600">Type
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal">
              <option value="milestone">Milestone</option><option value="achievement">Achievement</option><option value="event">Event</option><option value="growth">Growth</option><option value="note">Note</option>
            </select>
          </label>
          <div className="sm:col-span-2 flex items-end"><button type="submit" disabled={saving || form.notes.trim().length < 3} className="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save to history"}</button></div>
          <label className="sm:col-span-6 text-xs font-semibold text-gray-600">What happened?
            <textarea required rows={2} maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal" placeholder="e.g. Zone crossed 100 members" />
          </label>
          {formError && <p role="alert" className="sm:col-span-6 text-sm text-rose-600">{formError}</p>}
        </form>
      )}

      {/* Timeline Content */}
      <div className="p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-sky-400 to-gray-200"></div>

          {/* Timeline items */}
          <div className="space-y-6">
            {filteredHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="relative flex gap-4 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Icon dot */}
                <div className="relative z-10 flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>

                {/* Content card */}
                <div className="flex-1 pb-6">
                  <div className="group p-4 rounded-2xl bg-white/60 hover:bg-white/80 border border-gray-100/50 hover:border-gray-200/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getTypeColor(item.type)}-100 text-${getTypeColor(item.type)}-600`}>
                            {item.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>

                        {/* Pastor info if available */}
                        {item.pastor && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                              {item.pastor.name.charAt(0)}
                            </div>
                            <span className="text-xs text-gray-600">
                              {item.pastor.name}
                              {item.pastor.isCurrent && (
                                <span className="ml-1 text-gold-600">(Current)</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-gray-400">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No history records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
