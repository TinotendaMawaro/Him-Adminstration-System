const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "international", label: "International" },
  { value: "regional", label: "Regional" },
  { value: "zone", label: "Zone" },
  { value: "homegroup", label: "Homegroup" },
  { value: "department", label: "Department" },
];

const DEMOGRAPHICS_OPTIONS = [
  "Youth",
  "Women on Fire",
  "Men on Fire",
  "Marketplace Fellowship",
  "Children",
  "Singles",
  "Marriage",
  "Pastors",
];

function FilterPill({ active, onClick, children, ...props }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
        active
          ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/25"
          : "bg-white/5 text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-gray-200"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function EventsFilterBar({ filters, onChange }) {
  const toggleArray = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const setSingle = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1 hidden md:block">
        Scope
      </span>
      {SCOPE_OPTIONS.map((opt) => (
        <FilterPill
          key={opt.value}
          active={filters.scope === opt.value}
          onClick={() => setSingle("scope", opt.value)}
        >
          {opt.label}
        </FilterPill>
      ))}

      <span className="w-px h-5 bg-white/10 mx-2 hidden md:block" />
    </div>
  );
}
