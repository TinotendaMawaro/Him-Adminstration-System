import { useMemo, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

export default function CalendarMonth({ events = [], onSelectEvent }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!event.starts_at) return;
      const date = new Date(event.starts_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const isSameDay = (a, b) =>
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const changeMonth = (delta) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="lux-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="lux-btn px-3 py-1.5 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200">
          ←
        </button>
        <h3 className="text-sm font-bold text-white">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button onClick={() => changeMonth(1)} className="lux-btn px-3 py-1.5 text-xs bg-white/5 ring-1 ring-white/10 text-gray-200">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-white/5 p-2 text-center">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{day}</span>
          </div>
        ))}
        {days.map((date, idx) => {
          const key = date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : `empty-${idx}`;
          const dayEvents = date ? eventsByDate[key] || [] : [];
          const isToday = isSameDay(date, today);
          const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();

          return (
            <div
              key={key}
              className={`min-h-[80px] md:min-h-[100px] p-1.5 transition-colors ${
                isCurrentMonth ? "bg-white/5" : "bg-white/5 opacity-40"
              } ${isToday ? "ring-1 ring-[#d4af37] ring-inset" : ""}`}
            >
              {date && (
                <>
                  <span className={`text-[10px] font-semibold ${isToday ? "text-[#d4af37]" : "text-gray-400"}`}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => onSelectEvent?.(event)}
                        className={`w-full text-left text-[9px] px-1 py-0.5 rounded truncate ${
                          event.category === "International"
                            ? "bg-[#d4af37]/10 text-[#d4af37]"
                            : "bg-sky-500/20 text-sky-300"
                        }`}
                      >
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-gray-500">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
