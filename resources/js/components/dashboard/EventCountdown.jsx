import { useState, useEffect } from "react";

function calculateTimeLeft(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { total: diff, days, hours, minutes };
}

export default function EventCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 60000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return (
      <span className="text-emerald-400 font-bold text-sm">
        Event is happening now!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
      ].map((unit, i) => (
        <div key={unit.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">
            {unit.label}
          </div>
          {i < 2 && (
            <div className="text-[#d4af37] text-xl font-light mx-1 hidden md:block">
              :
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
