import { useEffect, useState } from "react";

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatCountdown(targetIso, now) {
  const target = targetIso ? new Date(targetIso) : null;
  if (!target) return "—";
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Now";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function EventsHeaderStats({ stats }) {
  const now = useNow(1000);
  const currentMonth =
    stats?.currentMonth ||
    now.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const items = [
    {
      label: currentMonth,
      value: stats?.thisMonthCount ?? 0,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      label: "Next Event In",
      value: formatCountdown(stats?.next_event_starts_at, now),
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: `Total ${currentMonth}`,
      value: stats?.totalThisMonth ?? 0,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      label: "Livestreams Today",
      value: stats?.livestreamsToday ?? 0,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
          />
        </svg>
      ),
      link: "https://www.youtube.com/@ApostleTavongaVutabwashe/",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <div
          key={item.label}
          className="gradient-border card-hover p-3 md:p-4"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#d4af37]">
              {item.icon}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">
            {item.label}
          </p>
          <p className="text-lg md:text-xl font-bold text-white tabular-nums">
            {item.value}
          </p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener"
              className="text-[10px] text-[#d4af37] hover:text-amber-400 font-semibold mt-1 inline-block"
            >
              Watch now <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
