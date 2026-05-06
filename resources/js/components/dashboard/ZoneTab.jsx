import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ZoneInfo from "./sections/ZoneInfo";
import ZoneHistory from "./sections/ZoneHistory";
import Achievements from "./sections/Achievements";
import api from "../../lib/api.js";

function AnimatedCard(props) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), props.delay || 0);
    return () => clearTimeout(timer);
  }, [props.delay]);
  const animClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";
  return <div className={"transition-all duration-700 ease-out transform " + animClass + " " + (props.className || "")}>{props.children}</div>;
}

function QuickStatCard(props) {
  const colors = { sky: "from-sky-400 to-sky-600", emerald: "from-emerald-400 to-emerald-600", violet: "from-violet-400 to-violet-600", gold: "from-gold-400 to-gold-600" };
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/60 transition-all duration-300">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{props.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={"text-2xl font-bold bg-gradient-to-r " + colors[props.color || "sky"] + " bg-clip-text text-transparent"}>{props.value}</p>
        {props.change ? <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{props.change}</span> : null}
      </div>
    </div>
  );
}

function MiniPastorsList({ pastorsData }) {
  const current = pastorsData.find(p => p.isCurrent) || null;
  const others = pastorsData.filter(p => !p.isCurrent);
  return (
    <div className="space-y-4">
      {current && <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gold-50/50 to-sky-50/50 border border-gold-200/30">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
          <span className="text-white font-bold">{current.name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-bold text-gray-900">{current.name}</p>
          <p className="text-sm text-gray-500">{current.title}</p>
          <p className="text-xs text-gold-600 mt-1">Since {current.since}</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full">Current</span>
      </div>}
      {others.length > 0 && <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Previous Pastors</p>
        <div className="space-y-2">
          {others.map(pastor => <div key={pastor.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold text-sm">{pastor.name.charAt(0)}</div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{pastor.name}</p>
              <p className="text-xs text-gray-500">{pastor.period}</p>
            </div>
          </div>)}
        </div>
      </div>}
    </div>
  );
}

export default function ZoneTab({ user }) {
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['pastor-zone-summary'],
    queryFn: async () => {
      const res = await api.get('/pastors/zone-summary');
      if (!res.data.success) throw new Error(res.data.message || 'Failed to load zone summary');
      return res.data.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const { data: historyData, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['pastor-zone-history'],
    queryFn: async () => {
      const res = await api.get('/pastors/zone-history');
      if (!res.data.success) throw new Error(res.data.message || 'Failed to load zone history');
      return res.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const zone = user?.zone;

  // Derive zoneData, pastorsData, timelineData from props and query results
  const zoneData = useMemo(() => ({
    name: zone?.name || user?.zoneName || "IOC",
    description: "A vibrant community of believers committed to spiritual growth and fellowship.",
    location: (zone?.region?.country?.name || '') + ' - ' + (zone?.region?.name || ''),
    established: zone?.created_at ? new Date(zone.created_at).getFullYear().toString() : "2020",
    membersCount: summaryData?.total_members?.toString() || "0",
    homeGroupsCount: summaryData?.total_home_groups?.toString() || "0",
    departmentsCount: summaryData?.total_departments?.toString() || "0",
    address: zone?.address || "",
    phone: zone?.phone || "",
  }), [zone, user?.zoneName, summaryData]);

  const timelineData = useMemo(() => {
    // historyData is the timeline array directly (from queryFn returning res.data.data)
    return Array.isArray(historyData) ? historyData.slice(0, 4) : [];
  }, [historyData]);

  const pastorsData = useMemo(() => {
    const currentPastor = zone?.currentPastor || user;
    const otherPastors = (zone?.pastors?.filter(p => p.id !== currentPastor?.id) || []).slice(0, 3);
    const list = [{
      id: currentPastor?.id || 1,
      name: currentPastor?.name || user?.name || "Zone Pastor",
      title: "Lead Pastor",
      since: zoneData.established,
      isCurrent: true
    }];
    otherPastors.forEach(pastor => {
      list.push({
        id: pastor.id,
        name: pastor.name,
        title: "Associate Pastor",
        period: "2023 - 2024",
        isCurrent: false
      });
    });
    return list;
  }, [zone, user, zoneData.established]);

  const achievements = [
    { title: "Members", icon: "M", tier: "platinum" },
    { title: "Home Groups", icon: "H", tier: "gold" },
    { title: "Spiritual", icon: "S", tier: "gold" },
    { title: "Depts", icon: "D", tier: "silver" },
    { title: "Community", icon: "C", tier: "silver" },
    { title: "Youth", icon: "Y", tier: "bronze" },
  ];

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const [drawerState, setDrawerState] = useState({ isOpen: false, title: "", content: null });
  const openDrawer = (title, content) => setDrawerState({ isOpen: true, title, content });
  const closeDrawer = () => setDrawerState(prev => ({ ...prev, isOpen: false }));

  // Combined loading/error states
  const loading = summaryLoading || historyLoading;
  const error = summaryError?.message || historyError?.message;

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div></div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500"><p>Error loading zone data: {error}</p></div>;
  }

  return (
    <div className="space-y-6">
      <AnimatedCard delay={0}>
        <div className="bg-gradient-to-br from-sky-500/10 via-white/60 to-gold-500/10 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold-200/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-200/20 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/20">
                  <span className="text-white font-bold text-3xl">{zoneData.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{zoneData.name}</h2>
                  <span className="px-3 py-1 bg-sky-100 text-sky-600 text-xs font-semibold rounded-full">Zone Pastor</span>
                </div>
                <p className="text-gray-600 mb-4 max-w-xl">{zoneData.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {zoneData.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Est. {zoneData.established}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <QuickStatCard label="Members" value={zoneData.membersCount} change="+12%" color="sky" />
                <QuickStatCard label="Home Groups" value={zoneData.homeGroupsCount} change="+3" color="emerald" />
                <QuickStatCard label="Depts" value={zoneData.departmentsCount} color="violet" />
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard delay={100}>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Zonal Information</h3>
                </div>
                <button onClick={() => openDrawer("Edit Zone Infomation", <ZoneInfo zone={zoneData} />)} className="px-4 py-2 rounded-xl bg-sky-100/50 text-sky-600 font-medium text-sm hover:bg-sky-100 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                        <p className="font-semibold text-gray-900">{zoneData.location || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                      <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Established</p>
                        <p className="font-semibold text-gray-900">{zoneData.established}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                        <p className="font-semibold text-gray-900">{zoneData.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                        <p className="font-semibold text-gray-900">{zoneData.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Pastors & Leadership</h3>
              </div>
              <div className="p-6">
                <MiniPastorsList pastorsData={pastorsData} />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Zone Timeline</h3>
              </div>
              <div className="p-6">
                {timelineData.length > 0 ? <ZoneHistory timeline={timelineData} /> : <p className="text-gray-500 text-sm">No history available</p>}
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <AnimatedCard delay={400}>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="p-6">
                <Achievements achievements={achievements} />
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Drawer */}
      {drawerState.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{drawerState.title}</h2>
                <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {drawerState.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}