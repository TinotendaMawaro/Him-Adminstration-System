import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HODIcons } from "./HODIcons";
import { HODGlassCard, HODGoldButton, HODSkyButton, HODBadge, HODDrawer } from "./HODComponents";

const CHURCH_EVENTS_2026 = Object.freeze([
  { id: "e1", title: "21 Days of Prayer and Fasting", startDate: "2026-01-11", endDate: "2026-01-31", category: "International", location: "IOC and Zones" },
  { id: "e2", title: "Anointing Night", startDate: "2026-01-30", endDate: "2026-01-30", category: "International", location: "IOC" },
  { id: "e3", title: "Operation Come and See", startDate: "2026-01-18", endDate: "2026-01-18", category: "Events" },
  { id: "e4", title: "Homegroup Opening", startDate: "2026-02-03", endDate: "2026-02-03", category: "Events" },
  { id: "e5", title: "International Day of Fruitfulness", startDate: "2026-02-07", endDate: "2026-02-07", category: "International", location: "IOC" },
  { id: "e6", title: "Mega Worship", startDate: "2026-02-11", endDate: "2026-02-14", category: "International", location: "Richland" },
  { id: "e7", title: "Operation Come and See", startDate: "2026-02-15", endDate: "2026-02-15", category: "Events" },
  { id: "e8", title: "Kingdom Service Conference", startDate: "2026-02-26", endDate: "2026-02-28", category: "International", location: "Richland" },
  { id: "e9", title: "Anointing Night", startDate: "2026-02-27", endDate: "2026-02-27", category: "International", location: "Richland" },
  { id: "e10", title: "Intercessors Conference", startDate: "2026-03-11", endDate: "2026-03-14", category: "International", location: "Richland" },
  { id: "e11", title: "Helpers Day", startDate: "2026-03-15", endDate: "2026-03-15", category: "International", location: "IOC and Zones" },
  { id: "e12", title: "Festival Of Joy", startDate: "2026-03-21", endDate: "2026-03-21", category: "International", location: "Zones" },
  { id: "e13", title: "Super Sunday", startDate: "2026-03-22", endDate: "2026-03-22", category: "International", location: "IOC" },
  { id: "e14", title: "Operation Come and See", startDate: "2026-03-22", endDate: "2026-03-22", category: "Events" },
  { id: "e15", title: "Anointing Night", startDate: "2026-04-03", endDate: "2026-04-03", category: "International", location: "IOC" },
  { id: "e16", title: "Regional Passover", startDate: "2026-04-03", endDate: "2026-04-05", category: "International", location: "IOC and Zones" },
  { id: "e17", title: "Children's Church Revival", startDate: "2026-04-12", endDate: "2026-04-14", category: "International", location: "IOC and Zones" },
  { id: "e18", title: "Shine Camp", startDate: "2026-04-15", endDate: "2026-04-18", category: "International", location: "Richland" },
  { id: "e19", title: "Operation Come and See", startDate: "2026-04-19", endDate: "2026-04-19", category: "Events" },
  { id: "e20", title: "Anointing Night – Pastors", startDate: "2026-05-01", endDate: "2026-05-01", category: "International", location: "Richland" },
  { id: "e21", title: "Super Singles", startDate: "2026-05-07", endDate: "2026-05-09", category: "International", location: "Richland" },
  { id: "e22", title: "Operation Come and See", startDate: "2026-05-17", endDate: "2026-05-17", category: "Events" },
  { id: "e23", title: "Marketplace Breakthrough Summit", startDate: "2026-05-27", endDate: "2026-05-30", category: "International", location: "IOC" },
  { id: "e24", title: "Covenant Days Of Blessing", startDate: "2026-06-07", endDate: "2026-06-07", category: "International", location: "IOC" },
  { id: "e25", title: "Marriages Conference", startDate: "2026-06-18", endDate: "2026-06-20", category: "International", location: "IOC" },
  { id: "e26", title: "Operation Come and See", startDate: "2026-06-21", endDate: "2026-06-21", category: "Events" },
  { id: "e27", title: "Liberation Night", startDate: "2026-06-26", endDate: "2026-06-26", category: "International" },
  { id: "e28", title: "Women on Fire Conference", startDate: "2026-07-01", endDate: "2026-07-04", category: "International", location: "Richland" },
  { id: "e29", title: "Operation Come and See", startDate: "2026-07-19", endDate: "2026-07-19", category: "Events" },
  { id: "e30", title: "Empowerment Summit SA", startDate: "2026-07-23", endDate: "2026-07-25", category: "International", location: "South Africa" },
  { id: "e31", title: "Anointing Night – Men on Fire", startDate: "2026-07-30", endDate: "2026-07-30", category: "International", location: "IOC" },
  { id: "e32", title: "Pastors Prayer Outing", startDate: "2026-08-03", endDate: "2026-08-05", category: "International", location: "Richland" },
  { id: "e33", title: "Operation Come and See", startDate: "2026-08-16", endDate: "2026-08-16", category: "Events" },
  { id: "e34", title: "Gideon Prayer Army", startDate: "2026-08-19", endDate: "2026-08-21", category: "International", location: "Richland" },
  { id: "e35", title: "Catch The Fire Conference", startDate: "2026-08-24", endDate: "2026-08-30", category: "International", location: "Richland", image: "/images/ctf.jpeg" },
  { id: "e36", title: "Operation Come and See", startDate: "2026-09-20", endDate: "2026-09-20", category: "Events" },
  { id: "e37", title: "Anointing Night – Night to Remember", startDate: "2026-10-02", endDate: "2026-10-02", category: "International", location: "IOC" },
  { id: "e38", title: "Parents Day", startDate: "2026-10-04", endDate: "2026-10-04", category: "Events", location: "All Zones" },
  { id: "e39", title: "Dubai Apostolic Visit (Fresh Oil)", startDate: "2026-10-08", endDate: "2026-10-10", category: "International", location: "UAE" },
  { id: "e40", title: "Men on Fire", startDate: "2026-10-14", endDate: "2026-10-17", category: "International", location: "Richland" },
  { id: "e41", title: "International Sports Day", startDate: "2026-10-17", endDate: "2026-10-17", category: "International", location: "Richland" },
  { id: "e42", title: "Operation Come and See", startDate: "2026-10-18", endDate: "2026-10-18", category: "Events" },
  { id: "e43", title: "Super Sunday", startDate: "2026-10-18", endDate: "2026-10-18", category: "International", location: "Richland" },
  { id: "e44", title: "White Sunday", startDate: "2026-10-25", endDate: "2026-10-25", category: "Events", location: "All Zones" },
  { id: "e45", title: "Success Night", startDate: "2026-10-30", endDate: "2026-10-30", category: "International", location: "IOC" },
  { id: "e46", title: "Interdenominational Ministers and Leaders Conference", startDate: "2026-11-12", endDate: "2026-11-14", category: "International", location: "Richland" },
  { id: "e47", title: "Spiritual Heritage Week", startDate: "2026-11-16", endDate: "2026-11-22", category: "International", location: "IOC and Zones" },
  { id: "e48", title: "Operation Come and See", startDate: "2026-11-22", endDate: "2026-11-22", category: "Events" },
  { id: "e49", title: "Anointing Night – Children's Ministry", startDate: "2026-11-27", endDate: "2026-11-27", category: "International", location: "IOC" },
  { id: "e50", title: "Day of Honor", startDate: "2026-12-06", endDate: "2026-12-06", category: "Events", location: "All Zones" },
  { id: "e51", title: "Pastor's Seminar", startDate: "2026-12-07", endDate: "2026-12-09", category: "International" },
  { id: "e52", title: "Home Groups Close", startDate: "2026-12-08", endDate: "2026-12-08", category: "Events", location: "All Zones" },
  { id: "e53", title: "Operation Come and See & Welfare Day & Children's Church Service", startDate: "2026-12-13", endDate: "2026-12-13", category: "Events", location: "All Zones" },
  { id: "e54", title: "Success Camp", startDate: "2026-12-16", endDate: "2026-12-19", category: "International", image: "/images/Success.jpg" },
  { id: "e55", title: "Absolute Fasting", startDate: "2026-12-28", endDate: "2026-12-29", category: "International", location: "IOC and Zones" },
  { id: "e56", title: "Marchover Night & Thanksgiving Service", startDate: "2026-12-31", endDate: "2026-12-31", category: "International", location: "Richland" },
]);

const HODActivitiesPage = ({ departmentId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");

  const events = CHURCH_EVENTS_2026.map((ev) => {
    const [year, month, day] = ev.startDate.split("-").map(Number);
    const start = new Date(year, month - 1, day);
    const [endYear, endMonth, endDay] = (ev.endDate || ev.startDate).split("-").map(Number);
    const end = new Date(endYear, endMonth - 1, endDay);

    return {
      id: ev.id,
      title: ev.title,
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      endDate: end.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      location: ev.location || "TBC",
      category: ev.category,
      color: ev.category === "International" ? "from-[#dfb15b] to-amber-500" : "from-sky-400 to-sky-600",
      description: "",
      status: "upcoming",
      type: "event",
      image: ev.image,
    };
  });

  const filteredEvents = events.filter((ev) => {
    const [y, m, d] = ev.start.split("-").map(Number);
    const evDate = new Date(y, m - 1, d);

    if (view === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return evDate >= startOfWeek && evDate <= endOfWeek;
    }

    return evDate.getMonth() === selectedDate.getMonth() && evDate.getFullYear() === selectedDate.getFullYear();
  });

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-xl" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const daysEvents = filteredEvents.filter((ev) => ev.start === dateStr || (ev.start <= dateStr && ev.end >= dateStr));

      days.push(
        <div
          key={day}
          className={`h-24 border rounded-xl p-2 transition-all hover:shadow-md ${
            daysEvents.length > 0 ? "border-[#dfb15b]/20 bg-[#dfb15b]/10" : "border-gray-100 bg-white/50"
          }`}
        >
          <span className="text-sm font-medium text-gray-700">{day}</span>
          <div className="mt-1 space-y-1">
            {daysEvents.map((ev) => (
              <div
                key={ev.id}
                className={`text-[10px] px-2 py-1 rounded-lg bg-gradient-to-r ${ev.color} text-white font-medium truncate cursor-pointer`}
              >
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const upcomingHighlights = events.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Church Calendar 2026</h2>
          <p className="text-gray-500 mt-1">Official church events and programs for 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <HODGlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Calendar View</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-2 rounded-lg hover:bg-gray-100">
                  <HODIcons.ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-gray-900 min-w-[140px] text-center">
                  {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-2 rounded-lg hover:bg-gray-100">
                  <HODIcons.ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">{getDaysInMonth()}</div>
          </HODGlassCard>
        </div>

        <div className="space-y-6">
          <HODGlassCard className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {upcomingHighlights.map((ev) => {
                const eventDate = new Date(ev.start);
                return (
                  <div key={ev.id} className="p-3 rounded-xl border border-gray-100 bg-white/70 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ev.color} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
                        {eventDate.getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ev.date} {ev.endDate !== ev.start ? `- ${ev.endDate}` : ""}
                        </p>
                        {ev.location && <p className="text-xs text-gray-500 mt-0.5">{ev.location}</p>}
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{ev.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </HODGlassCard>
        </div>
      </div>
    </div>
  );
};

export default HODActivitiesPage;
