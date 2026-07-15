const VIEW_OPTIONS = [
  { value: "list", label: "List" },
  { value: "monthly", label: "Monthly" },
  { value: "agenda", label: "Agenda" },
  { value: "timeline", label: "Timeline" },
];

export default function CalendarViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center bg-white/5 rounded-xl p-1">
      {VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            view === opt.value
              ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/25"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
