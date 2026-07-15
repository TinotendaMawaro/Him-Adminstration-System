import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import EventsHeaderAnalytics from "./EventsHeaderAnalytics";
import EventsFilterBar from "./EventsFilterBar";
import FeaturedEventBanner from "./FeaturedEventBanner";
import EventsTimeline from "./EventsTimeline";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegistrationModal from "./RegistrationModal";
import CalendarViewToggle from "./CalendarViewToggle";
import CalendarMonth from "./CalendarMonth";
import CalendarAgenda from "./CalendarAgenda";
import InlineLivePlayer from "./InlineLivePlayer";
import EventDetailModal from "./EventDetailModal";
import AISuggestionsWidget from "./AISuggestionsWidget";

const INITIAL_FILTERS = {
  scope: "all",
  demographics: [],
  eventType: [],
  view: "list",
};

const FALLBACK_EVENTS = [
  { id: "e29", title: "Operation Come and See", startDate: "2026-07-19", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-07-19T09:00:00Z", ends_at: "2026-07-19T12:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e30", title: "Empowerment Summit SA", startDate: "2026-07-23", endDate: "2026-07-25", location: "South Africa", category: "International", type: "Conferences", scope: "international", starts_at: "2026-07-23T09:00:00Z", ends_at: "2026-07-25T18:00:00Z", venue_name: "South Africa", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e31", title: "Anointing Night – Men on Fire", startDate: "2026-07-30", location: "IOC", category: "International", type: "Leadership", scope: "international", starts_at: "2026-07-30T18:00:00Z", ends_at: "2026-07-30T21:00:00Z", venue_name: "IOC", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e32", title: "Pastors Prayer Outing", startDate: "2026-08-03", endDate: "2026-08-05", location: "Richland", category: "International", type: "Prayer", scope: "international", starts_at: "2026-08-03T08:00:00Z", ends_at: "2026-08-05T17:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e33", title: "Operation Come and See", startDate: "2026-08-16", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-08-16T09:00:00Z", ends_at: "2026-08-16T12:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e34", title: "Gideon Prayer Army", startDate: "2026-08-19", endDate: "2026-08-21", location: "Richland", category: "International", type: "Prayer", scope: "international", starts_at: "2026-08-19T09:00:00Z", ends_at: "2026-08-21T18:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e35", title: "Catch The Fire Conference", startDate: "2026-08-24", endDate: "2026-08-30", location: "Richland", image: "/images/ctf.jpeg", category: "International", type: "Conferences", scope: "international", starts_at: "2026-08-24T09:00:00Z", ends_at: "2026-08-30T18:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: true, is_featured: true },
  { id: "e36", title: "Operation Come and See", startDate: "2026-09-20", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-09-20T09:00:00Z", ends_at: "2026-09-20T12:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e37", title: "Anointing Night – Night to Remember", startDate: "2026-10-02", location: "IOC", category: "International", type: "Conferences", scope: "international", starts_at: "2026-10-02T18:00:00Z", ends_at: "2026-10-02T21:00:00Z", venue_name: "IOC", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e38", title: "Parents Day", startDate: "2026-10-04", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-10-04T10:00:00Z", ends_at: "2026-10-04T15:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e39", title: "Dubai Apostolic Visit (Fresh Oil)", startDate: "2026-10-08", endDate: "2026-10-10", location: "UAE", category: "International", type: "Conferences", scope: "international", starts_at: "2026-10-08T09:00:00Z", ends_at: "2026-10-10T18:00:00Z", venue_name: "UAE", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e40", title: "Men on Fire", startDate: "2026-10-14", endDate: "2026-10-17", location: "Richland", category: "International", type: "Leadership", scope: "international", starts_at: "2026-10-14T09:00:00Z", ends_at: "2026-10-17T18:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e41", title: "International Sports Day", startDate: "2026-10-17", location: "Richland", category: "International", type: "Conferences", scope: "international", starts_at: "2026-10-17T10:00:00Z", ends_at: "2026-10-17T17:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e42", title: "Operation Come and See", startDate: "2026-10-18", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-10-18T09:00:00Z", ends_at: "2026-10-18T12:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e43", title: "Super Sunday", startDate: "2026-10-18", location: "Richland", category: "International", type: "Conferences", scope: "international", starts_at: "2026-10-18T10:00:00Z", ends_at: "2026-10-18T13:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e44", title: "White Sunday", startDate: "2026-10-25", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-10-25T10:00:00Z", ends_at: "2026-10-25T15:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e45", title: "Success Night", startDate: "2026-10-30", location: "IOC", category: "International", type: "Conferences", scope: "international", starts_at: "2026-10-30T18:00:00Z", ends_at: "2026-10-30T21:00:00Z", venue_name: "IOC", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e46", title: "Interdenominational Ministers and Leaders Conference", startDate: "2026-11-12", endDate: "2026-11-14", location: "Richland", category: "International", type: "Leadership", scope: "international", starts_at: "2026-11-12T09:00:00Z", ends_at: "2026-11-14T18:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e47", title: "Spiritual Heritage Week", startDate: "2026-11-16", endDate: "2026-11-22", location: "IOC and Zones", category: "International", type: "Conferences", scope: "international", starts_at: "2026-11-16T09:00:00Z", ends_at: "2026-11-22T18:00:00Z", venue_name: "IOC and Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e48", title: "Operation Come and See", startDate: "2026-11-22", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-11-22T09:00:00Z", ends_at: "2026-11-22T12:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e49", title: "Anointing Night – Children's Ministry", startDate: "2026-11-27", location: "IOC", category: "International", type: "Conferences", scope: "international", starts_at: "2026-11-27T18:00:00Z", ends_at: "2026-11-27T21:00:00Z", venue_name: "IOC", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e50", title: "Day of Honor", startDate: "2026-12-06", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-12-06T10:00:00Z", ends_at: "2026-12-06T15:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e51", title: "Pastor's Seminar", startDate: "2026-12-07", endDate: "2026-12-09", location: "TBD", category: "International", type: "Training", scope: "international", starts_at: "2026-12-07T09:00:00Z", ends_at: "2026-12-09T17:00:00Z", venue_name: "TBD", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e52", title: "Home Groups Close", startDate: "2026-12-08", location: "All Zones", category: "Events", type: "Leadership", scope: "zone", starts_at: "2026-12-08T17:00:00Z", ends_at: "2026-12-08T19:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e53", title: "Operation Come and See & Welfare Day & Children's Church Service", startDate: "2026-12-13", location: "All Zones", category: "Events", type: "Conferences", scope: "zone", starts_at: "2026-12-13T09:00:00Z", ends_at: "2026-12-13T15:00:00Z", venue_name: "All Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e54", title: "Success Camp", startDate: "2026-12-16", endDate: "2026-12-19", location: "TBD", category: "International", image: "/images/Success.jpg", type: "Training", scope: "international", starts_at: "2026-12-16T09:00:00Z", ends_at: "2026-12-19T17:00:00Z", venue_name: "TBD", status: "published", is_past: false, registration_open: true, requires_registration: true },
  { id: "e55", title: "Absolute Fasting", startDate: "2026-12-28", endDate: "2026-12-29", location: "IOC and Zones", category: "International", type: "Prayer", scope: "international", starts_at: "2026-12-28T09:00:00Z", ends_at: "2026-12-29T18:00:00Z", venue_name: "IOC and Zones", status: "published", is_past: false, registration_open: true, requires_registration: false },
  { id: "e56", title: "Marchover Night & Thanksgiving Service", startDate: "2026-12-31", location: "Richland", category: "International", type: "Conferences", scope: "international", starts_at: "2026-12-31T18:00:00Z", ends_at: "2026-12-31T21:00:00Z", venue_name: "Richland", status: "published", is_past: false, registration_open: true, requires_registration: false },
];

export { FALLBACK_EVENTS };
export default function EventsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [registrationModal, setRegistrationModal] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelinePage, setTimelinePage] = useState(1);

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.scope !== "all") params.append("scope", filters.scope);
      if (filters.eventType?.length) params.append("type", filters.eventType.join(","));
      if (filters.view === "upcoming") params.append("upcoming", "true");
      const res = await api.get(`/events?${params.toString()}`);
      if (!res.data.success) throw new Error(res.data.message || "Failed to load events");
      return res.data.data || [];
    },
    staleTime: 30000,
  });

  const { data: featuredData } = useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const res = await api.get("/events/featured");
      return res.data.data || null;
    },
    staleTime: 60000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["events", "stats"],
    queryFn: async () => {
      const res = await api.get("/events/stats");
      return res.data.data || {};
    },
    staleTime: 30000,
  });

  const { data: myRegistrationsData } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const res = await api.get("/events/my-registrations");
      return res.data.data || [];
    },
    staleTime: 30000,
  });

  const events = useMemo(() => {
    const source = eventsData && eventsData.length > 0 ? eventsData : FALLBACK_EVENTS;
    return source.map((event) => ({
      ...event,
      is_past: event.starts_at ? new Date(event.starts_at) < new Date() : false,
    }));
  }, [eventsData]);
  const featuredEvent = featuredData || FALLBACK_EVENTS.find((e) => e.is_featured) || FALLBACK_EVENTS[0];
  const stats = statsData || {
    thisMonthCount: FALLBACK_EVENTS.length,
    nextEventIn: null,
    totalThisMonth: FALLBACK_EVENTS.length,
    livestreamsToday: 0,
    registeredCount: 0,
    attendedCount: 0,
  };

  const isRegisteredMap = useMemo(() => {
    const map = {};
    (myRegistrationsData || []).forEach((r) => {
      map[r.event_id] = true;
    });
    return map;
  }, [myRegistrationsData]);

  const handleRegister = async (eventId) => {
    setRegistrationModal(eventId);
  };

  const handleConfirmRegistration = async (eventId, data) => {
    setRegistrationStatus((prev) => ({ ...prev, [eventId]: "registering" }));
    try {
      const res = await api.post(`/events/${eventId}/register`, data);
      if (res.data.success) {
        setRegistrationStatus((prev) => ({ ...prev, [eventId]: "registered" }));
        setRegistrationModal(null);
        queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    } catch (err) {
      setRegistrationStatus((prev) => ({ ...prev, [eventId]: "error" }));
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    try {
      const res = await api.delete(`/events/${eventId}/register`);
      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration.");
    }
  };

  const handleAddReminder = (event) => {
    if (!event?.starts_at) return;
    const date = new Date(event.starts_at);
    const title = event.title || "Event";
    const details = `${date.toLocaleString()}\n${event.venue_name || ""}`.trim();

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      setTimeout(() => {
        new Notification(`Reminder: ${title}`, { body: details });
      }, 1000);
    }

    alert(`Reminder set for:\n\n${title}\n${details}`);
  };

  const handleShare = async (event) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/events/${event.id}` : event.id;
    const text = event.title ? `Join me for ${event.title}` : "Check out this event";

    if (typeof window !== "undefined" && navigator?.share) {
      try {
        await navigator.share({ title: event.title, text, url });
        return;
      } catch {}
    }

    if (typeof window !== "undefined" && navigator?.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Event link copied to clipboard.");
      return;
    }

    alert(`${text}\n${url}`);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  const liveEvent = events.find((e) => e.is_livestream && new Date(e.starts_at) <= new Date() && (!e.ends_at || new Date(e.ends_at) >= new Date()));

  return (
    <div className="space-y-6">
      <EventsHeaderAnalytics stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <EventsFilterBar filters={filters} onChange={(next) => { setFilters(next); setTimelinePage(1); }} />
        <CalendarViewToggle view={filters.view} onChange={(view) => setFilters((f) => ({ ...f, view }))} />
      </div>

      {featuredEvent && (
        <FeaturedEventBanner
          event={featuredEvent}
          onRegister={handleRegister}
          isRegistered={isRegisteredMap[featuredEvent.id]}
          onAddReminder={handleAddReminder}
          onShare={handleShare}
          onViewDetails={handleViewDetails}
        />
      )}

      {liveEvent && (
        <InlineLivePlayer event={liveEvent} />
      )}

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Upcoming Events</h3>
        {filters.view === "monthly" ? (
          <CalendarMonth events={events} onSelectEvent={setSelectedEvent} />
        ) : filters.view === "agenda" ? (
          <CalendarAgenda events={events} onSelectEvent={setSelectedEvent} />
        ) : (
          <EventsTimeline
            events={events}
            isRegistered={isRegisteredMap}
            onRegister={handleRegister}
            onCancelRegistration={handleCancelRegistration}
            registrationStatus={registrationStatus}
            page={timelinePage}
            onPageChange={setTimelinePage}
            pageSize={6}
            onViewDetails={handleViewDetails}
            onShare={handleShare}
            onAddReminder={handleAddReminder}
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">My Registered Events</h3>
        <MyRegisteredEvents registrations={myRegistrationsData} onCancel={handleCancelRegistration} />
      </div>

      <AISuggestionsWidget />

      {registrationModal && (
        <RegistrationModal
          event={
            events.find((e) => e.id === registrationModal) ||
            featuredEvent
          }
          onClose={() => setRegistrationModal(null)}
          onConfirm={handleConfirmRegistration}
        />
      )}

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
