import { Icons } from "../icons";

export default function StatusBadge({ status }) {
  const config = {
    upcoming: {
      class: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
      label: "Upcoming",
      icon: <Icons.Clock className="w-3 h-3" />,
    },
    live: {
      class: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
      label: "Live",
      icon: (
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-gentle-pulse" />
      ),
    },
    completed: {
      class: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20",
      label: "Completed",
      icon: <Icons.Check className="w-3 h-3" />,
    },
    cancelled: {
      class: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
      label: "Cancelled",
      icon: null,
    },
    draft: {
      class: "bg-gray-100 text-gray-500 ring-1 ring-gray-500/20",
      label: "Draft",
      icon: null,
    },
  };

  const safeStatus = status?.toLowerCase() || "upcoming";
  const badge = config[safeStatus] || config.upcoming;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${badge.class}`}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
}
