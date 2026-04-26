import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import PremiumCard from "./PremiumCard";

// ============================================================================
// ICON LIBRARY — thin-stroke, consistent 20×20px
// ============================================================================

const Icons = {
  zones: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  pastors: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  regions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
};

// ============================================================================
// DESIGN TOKENS — color variant mapping
// ============================================================================

const variantMap = {
  sky: "sky",
  emerald: "emerald",
  amber: "amber",
  violet: "violet",
};

// ============================================================================
// MOCK SPARKLINE DATA — replace with real historical API when available
// Generates 7-day trend data for each metric (smooth curve simulation)
// ============================================================================

function generateSparkline(baseValue, volatility = 0.15) {
  const data = [];
  let current = baseValue * (1 - volatility);
  for (let i = 0; i < 7; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * baseValue;
    current = Math.max(baseValue * 0.7, Math.min(baseValue * 1.3, current + change));
    data.push(Math.round(current));
  }
  // Ensure last value equals base (trend-end anchored)
  data[6] = baseValue;
  return data;
}

// ============================================================================
// METRIC DEFINITIONS — with color, navigation, and sparkline generator
// ============================================================================

const metricDefinitions = [
  {
    key: "total_zones",
    label: "Total Zones",
    icon: Icons.zones,
    color: "sky",
    variant: "sky",
    navigateTo: "zones",
    sparklineBase: 83,      // current count
    sparklineVolatility: 0.08,
  },
  {
    key: "total_pastors",
    label: "Total Pastors",
    icon: Icons.pastors,
    color: "emerald",
    variant: "emerald",
    navigateTo: "pastors",
    sparklineBase: 139,
    sparklineVolatility: 0.05,
  },
  {
    key: "total_regions",
    label: "Total Regions",
    icon: Icons.regions,
    color: "amber",
    variant: "amber",
    navigateTo: "regions",
    sparklineBase: 22,
    sparklineVolatility: 0.02,
  },
];

// ============================================================================
// MAIN DASHBOARD STATS COMPONENT
// ============================================================================

export default function DashboardStats({ onNavigate }) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/metrics");
        if (!res.data.success) {
          throw new Error(res.data.message || "Failed to fetch metrics");
        }

        // Enrich with trend + sparkline data
        const enriched = enrichWithTrendsAndSparklines(res.data.data);
        return enriched;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Network error";
        throw new Error(message);
      }
    },
    staleTime: 30000,
    cacheTime: 300000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  // ==========================================================================
  // ENRICHMENT: Add mock trends + deterministic sparklines
  // In production, trends & sparklines will come from the backend
  // ==========================================================================
  function enrichWithTrendsAndSparklines(metrics) {
    return {
      ...metrics,
      trends: {
        total_zones: { value: 5.2, direction: "up" },
        total_pastors: { value: 3.1, direction: "up" },
        total_regions: { value: 0, direction: "neutral" },
      },
      sparklines: {
        total_zones: generateSparkline(83, 0.08),
        total_pastors: generateSparkline(139, 0.05),
        total_regions: generateSparkline(22, 0.02),
      },
    };
  }

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (isLoading && !data) {
    return (
       <div
         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5"
         role="status"
         aria-label="Loading dashboard statistics"
       >
        {metricDefinitions.map((metric, index) => {
          const isThird = index === 2;
          const wrapperClasses = isThird
            ? 'lg:col-span-2 flex justify-center'
            : '';
          const innerWidthClass = isThird
            ? 'w-full md:w-[calc(50%-10px)] max-w-[480px]'
            : 'w-full';
          return (
            <div
              key={metric.key}
              className={`opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards] ${wrapperClasses}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={innerWidthClass}>
                <PremiumCard
                  title={metric.label}
                  value={0}
                  icon={metric.icon}
                  variant={metric.variant}
                  loading={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================
  if (isError) {
    return (
      <div
        className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-4">
          <svg
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base">Unable to load statistics</p>
            <p className="text-sm mt-1 text-rose-600 break-words">
              {error.message}
            </p>
            <button
              onClick={() => {
                queryClient.invalidateQueries(["dashboard-metrics"]);
                refetch();
              }}
              className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
              aria-label="Retry loading dashboard statistics"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SUCCESS STATE — render premium cards with staggered entrance
  // ==========================================================================
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5"
      role="grid"
      aria-label="Dashboard statistics"
    >
      {metricDefinitions.map((metric, index) => {
        const metricData = data?.[metric.key] ?? 0;
        const trendData = data?.trends?.[metric.key];
        const sparklineData = data?.sparklines?.[metric.key] || [];
        const isThird = index === 2;
        const wrapperClasses = isThird
          ? 'lg:col-span-2 flex justify-center'
          : '';
        const innerWidthClass = isThird
          ? 'w-full md:w-[calc(50%-10px)] max-w-[480px]'
          : 'w-full';

        return (
          <div
            key={metric.key}
            className={`opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] ${wrapperClasses}`}
            style={{
              animationDelay: `${150 + index * 100}ms`,
              animationFillMode: "forwards",
            }}
            role="gridcell"
          >
            <div className={innerWidthClass}>
              <PremiumCard
                id={metric.key}
                title={metric.label}
                value={metricData}
                icon={metric.icon}
                variant={metric.variant}
                trend={trendData?.value}
                trendDirection={trendData?.direction || "up"}
                trendLabel="vs last month"
                sparklineData={sparklineData}
                onClick={() => onNavigate?.(metric.navigateTo)}
                animateValue={true}
                aria-label={`${metric.label}: ${metricData.toLocaleString()}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

