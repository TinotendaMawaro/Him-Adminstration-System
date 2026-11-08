import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import PremiumCard from "./PremiumCard";

// ============================================================================
// The pastor's dashboard statistics: THEIR ZONE only, real numbers.
// Trends and the little history charts come from the server (month on month, last 7 months).
// Nothing is estimated and no church-wide totals are shown.
// ============================================================================

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const ICONS = {
  members: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  joined: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z",
  groups: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  pastors: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  reports: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  giving: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** key = field in /dashboard/metrics; navigateTo = pastor portal tab */
const METRICS = [
  { key: "total_active_members", label: "Active members", icon: "members", variant: "sky", navigateTo: "members" },
  { key: "new_members_this_month", label: "New this month", icon: "joined", variant: "emerald", navigateTo: "members" },
  { key: "total_home_groups", label: "Home groups", icon: "groups", variant: "violet", navigateTo: "homegroups" },
  { key: "zone_pastors", label: "Pastors in my zone", icon: "pastors", variant: "amber", navigateTo: "zone" },
  { key: "reports_this_month", label: "Reports this month", icon: "reports", variant: "sky", navigateTo: "reports" },
  { key: "zone_giving_month", label: "Giving this month", icon: "giving", variant: "emerald", navigateTo: "reports", format: money },
];

export default function DashboardStats({ onNavigate }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/metrics");
        if (!res.data.success) throw new Error(res.data.message || "Failed to fetch metrics");
        return res.data.data;
      } catch (err) {
        throw new Error(err?.response?.data?.message || err.message || "Network error");
      }
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  const grid = "grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5";

  if (isLoading && !data) {
    return (
      <div className={grid} role="status" aria-label="Loading dashboard statistics">
        {METRICS.map((m, i) => (
          <div key={m.key} className="min-w-0 opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
            <PremiumCard title={m.label} value={0} icon={<Icon d={ICONS[m.icon]} />} variant={m.variant} loading />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700" role="alert" aria-live="polite">
        <p className="font-semibold text-base">Unable to load statistics</p>
        <p className="text-sm mt-1 text-rose-600 break-words">{error.message}</p>
        <button onClick={() => { queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] }); refetch(); }} className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors">Retry</button>
      </div>
    );
  }

  const zone = data?.zone;
  const visible = METRICS.filter((m) => data && data[m.key] !== null && data[m.key] !== undefined);

  return (
    <div>
      {zone && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          {zone.name} <span className="font-normal normal-case tracking-normal">({zone.code}{zone.region ? ` · ${zone.region}` : ""})</span>: statistics for your zone only
        </p>
      )}
      <div className={grid} role="group" aria-label="Zone statistics">
        {visible.map((m, i) => {
          const value = data[m.key];
          const trend = data.trends?.[m.key];
          const spark = data.sparklines?.[m.key] || [];
          const text = m.format ? m.format(value) : value;
          return (
            <div key={m.key} className="min-w-0 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" style={{ animationDelay: `${120 + i * 80}ms`, animationFillMode: "forwards" }} role="group" aria-label={`${m.label} card`}>
              <PremiumCard
                id={m.key}
                title={m.label}
                value={m.format ? text : value}
                icon={<Icon d={ICONS[m.icon]} />}
                variant={m.variant}
                trend={trend ? trend.value : undefined}
                trendDirection={trend?.direction || "neutral"}
                sparklineData={spark}
                onClick={() => onNavigate && onNavigate(m.navigateTo)}
                animateValue={!m.format}
                aria-label={`${m.label}: ${m.format ? text : Number(value).toLocaleString()}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
