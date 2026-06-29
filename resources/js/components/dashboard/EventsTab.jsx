import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api.js";

const Icons = {
    Calendar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Clock: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Users: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    CheckCircle: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export default function EventsTab() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [registrationStatus, setRegistrationStatus] = useState({});

    const { data: eventsResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['zone-events', activeTab],
        queryFn: async () => {
            const response = await api.get(`/events?${activeTab === "upcoming" ? "upcoming=true" : ""}`);
            if (!response.data.success) throw new Error(response.data.message || 'Failed to load events');
            
            // Filter and sort events
            const events = response.data.data.map(e => ({
                ...e,
                startDate: e.starts_at ? new Date(e.starts_at).toLocaleDateString() : null,
                startTime: e.starts_at ? new Date(e.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                isPast: e.starts_at ? new Date(e.starts_at) < new Date() : false,
            }));

            // If past events tab, filter for past events
            if (activeTab === "past") {
                return events.filter(e => e.isPast);
            }
            
            // For upcoming, sort by date (most recent first)
            return events.sort((a, b) => {
                if (!a.starts_at || !b.starts_at) return 0;
                return new Date(b.starts_at) - new Date(a.starts_at);
            });
        },
        staleTime: 30000,
        gcTime: 300000,
        refetchOnWindowFocus: true,
    });

    const events = eventsResponse || [];

    const handleRegister = async (eventId) => {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: 'registering' }));
        try {
            const response = await api.post(`/events/${eventId}/register`);
            if (response.data.success) {
                setRegistrationStatus(prev => ({ ...prev, [eventId]: 'registered' }));
                refetch();
            }
        } catch (err) {
            setRegistrationStatus(prev => ({ ...prev, [eventId]: 'error' }));
        }
    };

    const handleCancelRegistration = async (eventId) => {
        setRegistrationStatus(prev => ({ ...prev, [eventId]: 'cancelling' }));
        try {
            const response = await api.delete(`/events/${eventId}/register`);
            if (response.data.success) {
                setRegistrationStatus(prev => ({ ...prev, [eventId]: 'cancelled' }));
                refetch();
            }
        } catch (err) {
            setRegistrationStatus(prev => ({ ...prev, [eventId]: 'error' }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error.message}</p>
                <button onClick={() => refetch()} className="mt-3 text-gold-600 hover:underline">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tab Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                    <p className="text-gray-500 mt-1">Upcoming and past events in your zone</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === "upcoming"
                                ? "bg-gradient-to-r from-sky-400 to-sky-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === "past"
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Past Events
                    </button>
                </div>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="text-center py-20 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40">
                    <Icons.Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {activeTab === "upcoming" ? "No Upcoming Events" : "No Past Events"}
                    </h3>
                    <p className="text-gray-500">
                        {activeTab === "upcoming" 
                            ? "Check back later for new events" 
                            : "No events have occurred yet"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => {
                        const isRegistered = event.registrations?.[0]?.status === 'confirmed';
                        const regStatus = registrationStatus[event.id] || (isRegistered ? 'registered' : null);

                        return (
                            <div key={event.id} className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="relative bg-white/70 backdrop-blur-xl rounded-[1.4rem] m-0.5 p-5 h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-100/10 flex items-center justify-center">
                                            <Icons.Calendar className="w-6 h-6 text-sky-600" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            event.isPast
                                                ? "bg-gray-100 text-gray-600"
                                                : "bg-emerald-50 text-emerald-600"
                                        }`}>
                                            {event.isPast ? "Past" : "Upcoming"}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                        {event.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                                        )}
                                    </div>

                                    <div className="bg-emerald-50/50 rounded-xl p-3 mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Event Schedule</p>
                                        <p className="font-semibold text-gray-900">
                                            {event.startDate || 'Date TBD'} at {event.startTime || 'Time TBD'}
                                        </p>
                                        {event.venue_name && (
                                            <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                <Icons.MapPin className="w-4 h-4" />
                                                {event.venue_name}
                                            </p>
                                        )}
                                    </div>

                                    {event.category && (
                                        <span className="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 mb-4">
                                            {event.category}
                                        </span>
                                    )}

                                    {/* Registration Status & Actions */}
                                    {!event.isPast && event.requires_registration && (
                                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                            {regStatus === 'registering' ? (
                                                <span className="text-sm text-gray-500">Registering...</span>
                                            ) : isRegistered ? (
                                                <div className="flex items-center gap-2">
                                                    <Icons.CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <span className="text-sm font-medium text-emerald-700">Registered</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(event.id)}
                                                    disabled={regStatus === 'registering'}
                                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 text-white font-semibold hover:from-sky-500 hover:to-sky-700 transition-all duration-300 disabled:opacity-50"
                                                >
                                                    Register
                                                </button>
                                            )}
                                            {event.capacity && (
                                                <span className="text-sm text-gray-500">
                                                    {event.registrations_count || 0} / {event.capacity} registered
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}