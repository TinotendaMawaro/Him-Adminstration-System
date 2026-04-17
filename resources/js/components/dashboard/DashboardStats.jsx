import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import StatCard from "./StatCard";

const icons = {
  members: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  groups: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  activeGroups: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  departments: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  hod: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const colorMap = {
  members: "sky",
  groups: "emerald",
  activeGroups: "amber",
  departments: "violet",
  hod: "gold",
};

export default function DashboardStats({ onNavigate }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await api.get("/dashboard/metrics");
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch metrics");
      }
      return res.data.data;
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
    retry: 2,
  });

  const metrics = [
    {
      key: "total_active_members",
      label: "Total Active Members",
      icon: icons.members,
      color: colorMap.members,
      onClick: () => onNavigate?.("members"),
    },
    {
      key: "total_home_groups",
      label: "Total Home Groups",
      icon: icons.groups,
      color: colorMap.groups,
      onClick: () => onNavigate?.("home-groups"),
    },
    {
      key: "groups_with_active_members",
      label: "Groups with Active Members",
      icon: icons.activeGroups,
      color: colorMap.activeGroups,
      onClick: () => onNavigate?.("home-groups"),
    },
    {
      key: "total_departments",
      label: "Total Departments",
      icon: icons.departments,
      color: colorMap.departments,
      onClick: () => onNavigate?.("departments"),
    },
    {
      key: "departments_with_hod",
      label: "Departments with HOD",
      icon: icons.hod,
      color: colorMap.hod,
      onClick: () => onNavigate?.("departments"),
    },
  ];

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="animate-pulse bg-gray-100 rounded-3xl h-40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
        <p className="font-medium">Error Loading Stats</p>
        <p className="text-sm mt-1">{error.message}</p>
        <button
          onClick={() => queryClient.invalidateQueries(["dashboard-metrics"])}
          className="mt-2 text-sm text-red-700 underline hover:text-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {metrics.map((metric) => (
        <StatCard
          key={metric.key}
          title={metric.label}
          value={data?.[metric.key] ?? 0}
          icon={metric.icon}
          color={metric.color}
          onClick={metric.onClick}
          animateValue={true}
          className="min-w-0"
        />
      ))}
    </div>
  );
}