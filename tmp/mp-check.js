import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useUser } from "../context/UserContext";
import api from "../lib/api";
import HomeGroupCommunity from "./HomeGroupCommunity";
import HomeGroupSelector from "./HomeGroupSelector.jsx";
import DepartmentRequest from "./DepartmentRequest.jsx";
import Drawer from "./Drawer.jsx";
import EventsTab from "./dashboard/EventsTab.jsx";
import LeaveReasonModal from "./LeaveReasonModal.jsx";
import MembershipCard from "./MembershipCard.jsx";
import PrayerCenter from "./prayer-center/PrayerCenter.jsx";
import ProfileCompletenessNudge from "./dashboard/sections/ProfileCompletenessNudge.jsx";
import SpiritualJourney from "./dashboard/sections/SpiritualJourney.jsx";
import RecommendationsWidget from "./dashboard/RecommendationsWidget.jsx";
import RecommendedHomeGroupCard from "./dashboard/RecommendedHomeGroupCard.jsx";
import Member360View from "./pastors/Member360View.jsx";
import LocationEntry from "./onboarding/LocationEntry.jsx";
const FloatingParticles = () => {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 80;
      const y = (e.clientY - innerHeight / 2) / 80;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: 3 + Math.random() * 5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 18 + Math.random() * 15,
      delay: Math.random() * 12,
      opacity: 0.1 + Math.random() * 0.2,
      color: Math.random() > 0.5 ? "gold" : "sky"
    }));
  }, []);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: "fixed inset-0 overflow-hidden pointer-events-none",
      style: { transform: `translate(${offset.x}px, ${offset.y}px)` }
    },
    particles.map((p) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: p.id,
        className: "absolute rounded-full",
        style: {
          width: p.size,
          height: p.size,
          left: p.left + "%",
          top: p.top + "%",
          background: p.color === "gold" ? "rgba(212,175,55,0.15)" : "rgba(14,165,233,0.1)",
          animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
          opacity: p.opacity
        }
      }
    ))
  );
};
const Icons = {
  Home: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      }
    )
  ),
  MapPin: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      }
    )
  ),
  Users: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      }
    )
  ),
  Calendar: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      }
    )
  ),
  DocumentText: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      }
    )
  ),
  Bell: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      }
    )
  ),
  BuildingOffice: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      }
    )
  ),
  Clock: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      }
    )
  ),
  User: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      }
    )
  ),
  Check: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M4.5 12.75l6 6 9-9"
      }
    )
  ),
  XMark: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M6 18L18 6M6 6l12 12"
      }
    )
  ),
  Heart: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.385.848-4.5 2.153-1.292-1.513-2.877-2.337-4.718-2.337C3.6 3.75 1.5 5.765 1.5 8.25c0 4.242 3.71 7.5 8.25 11.25 4.5-3.75 8.25-7 8.25-11.25z"
      }
    )
  ),
  ChartBar: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M3 13.5V3a1.5 1.5 0 013 0v9.75m6-2.25V9a1.5 1.5 0 013 0v4.5m6-2.25V5.25a1.5 1.5 0 013 0v7.5M3 21h18M5.25 21h.008v.008H5.25V21zm4.5 0h.008v.008H9.75V21zm4.5 0h.008v.008h-.008V21zm4.5 0h.008v.008H18.75V21z"
      }
    )
  ),
  BookOpen: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 6.253v13m0-13C10.832 5.477 9.457 5 8 5c-2.21 0-4 1.343-4 3 0 1.861 1.528 3.407 3.378 3.833v1.357c0 .416-.247.77-.564.939C5.447 15.937 4.5 16.793 4.5 18c0 1.104.896 2 2 2h12c1.104 0 2-.896 2-2 0-1.207-.947-2.063-1.936-2.339-.317-.169-.564-.523-.564-.939v-1.357C16.472 11.761 18 10.215 18 9c0-1.657-1.79-3-4-3s4 .903 4 3 0 3-1.79 3 4 4c0-1.657-1.79-3-4-3z"
      }
    )
  ),
  ShieldCheck: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M9 12.75l1.5 1.5.75-.75 2.25-1.5.75.75 1.5 1.5M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
      }
    )
  ),
  ChatBubble: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M2.25 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-1.44 0-2.79-.38-3.96-1.04L2.25 21V12z"
      }
    )
  ),
  HandRaised: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v7.5A2.25 2.25 0 008.25 13.5h2.25m0-9V3.75A2.25 2.25 0 0112 6v1.5m0-1.5h2.25A2.25 2.25 0 0117 7.5v7.5a2.25 2.25 0 002.25 2.25h2.25"
      }
    )
  ),
  HandsPraying: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 18.5v-9m0 0l-3.5 3.5m3.5-3.5l3.5 3.5M6.5 13.5l-2 2m14-2l2 2M6.5 10.5l-2-2m14 2l2-2M4.5 9.75v9.75A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75"
      }
    )
  ),
  Star: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l.143.435a1.998 1.998 0 001.907 1.558h.474c.97 0 1.397 1.24.594 1.812l-.397.293a1.998 1.998 0 01-1.124.427h-.672c-.496 0-.682-.628-.327-.978l.225-.193a1.998 1.998 0 00.528-2.043l-.143-.435c-.3-.921-1.603-.921-1.902 0l-.143.435a1.998 1.998 0 001.907 1.558h.474c.97 0 1.397 1.24.594 1.812l-.397.293a1.998 1.998 0 01-1.124.427h-.672c-.496 0-.682-.628-.327-.978l.225-.193a1.998 1.998 0 00.528-2.043l-.143-.435z"
      }
    )
  ),
  ChevronDown: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
      }
    )
  ),
  DocumentDownload: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 13l3-3m0 0l-3-3m3 3H3"
      }
    )
  ),
  Share: ({ className }) => /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M7.217 10.907a2.25 2.25 0 100-2.25 2.217L8 10.907l-1.107-.01a2.25 2.25 0 100 4.43 2.217L8 10.907l1.107.01zm0 0l2.217 2.217L12 14.124l-1.107-.01-2.217-2.217z"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M15 13.5l3 3m0 0l-3 3m3-3H9"
      }
    )
  )
};
const HomegroupSection = ({ user, onViewHomegroup, onRequestLeave, homegroupLoading, onBrowseHomegroups }) => {
  const hg = user && user.home_group;
  if (hg && hg.name) {
    const isLeader = hg.leader_id === user?.id;
    return /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover" }, /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm" }, /* @__PURE__ */ React.createElement(Icons.Users, { className: "w-3.5 h-3.5 text-white" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "My Homegroup")), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onViewHomegroup,
        className: "text-[#dfb15b] hover:text-amber-400 text-[10px] font-semibold flex items-center gap-0.5"
      },
      "View All ",
      /* @__PURE__ */ React.createElement("span", null, "\u2192")
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 mb-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md" }, /* @__PURE__ */ React.createElement(Icons.Users, { className: "w-5 h-5 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-white text-xs" }, hg.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, "Active"))), !isLeader && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onRequestLeave("homegroup"),
        className: "btn btn-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
      },
      "Leave Group"
    ), isLeader && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 text-center" }, "As leader, contact pastor to transfer leadership before leaving.")));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 mx-auto mb-2.5 rounded-xl bg-emerald-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.Users, { className: "w-6 h-6 text-emerald-300" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-0.5" }, "No Homegroup Yet"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mb-2" }, "Join a homegroup to connect with fellow members and grow spiritually."), /* @__PURE__ */ React.createElement("div", { className: "bg-emerald-500/10 rounded-lg p-2 mb-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-emerald-300 mb-1" }, "\u{1F4A1} Recommended For You"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-white" }, "IOC Central"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-500" }, "Wednesdays | 3 km away | Perfect for new members!")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onBrowseHomegroups || onViewHomegroup,
      disabled: homegroupLoading,
      className: "btn btn-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-70"
    },
    homegroupLoading ? /* @__PURE__ */ React.createElement("span", { className: "flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4 animate-spin", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10", strokeWidth: "2", strokeDasharray: "32", strokeLinecap: "round" })), "Loading...") : "Browse Homegroups"
  )));
};
const DepartmentsSection = ({ user, onViewDepartments, onRequestLeave }) => {
  const dept = user && user.department;
  if (dept && dept.name) {
    const isHod = dept.hod_id === user?.id;
    return /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover" }, /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm" }, /* @__PURE__ */ React.createElement(Icons.BuildingOffice, { className: "w-3.5 h-3.5 text-white" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "My Department")), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onViewDepartments,
        className: "text-[#dfb15b] hover:text-amber-400 text-[10px] font-semibold flex items-center gap-0.5"
      },
      "View All ",
      /* @__PURE__ */ React.createElement("span", null, "\u2192")
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 mb-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md" }, /* @__PURE__ */ React.createElement(Icons.BuildingOffice, { className: "w-5 h-5 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-white text-xs" }, dept.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, "Active"))), !isHod && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onRequestLeave("department"),
        className: "btn btn-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
      },
      "Leave Department"
    ), isHod && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 text-center" }, "As HOD, contact pastor to transfer leadership before leaving.")));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 mx-auto mb-2.5 rounded-xl bg-purple-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.BuildingOffice, { className: "w-6 h-6 text-purple-300" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-0.5" }, "No Department Yet"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mb-2" }, "Join a department to serve alongside other members and discover your gifts."), /* @__PURE__ */ React.createElement("div", { className: "bg-purple-500/10 rounded-lg p-2 mb-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-purple-300 mb-1" }, "\u{1F4A1} Suggested Ministry"), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-white" }, "Media & ICT"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-500" }, "4 Open Positions | Training Available")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onViewDepartments,
      className: "btn btn-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
    },
    "Browse Departments"
  )));
};
const CHURCH_EVENTS_2026 = [
  {
    id: "e1",
    title: "21 Days of Prayer and Fasting",
    startDate: "2026-01-11",
    endDate: "2026-01-31",
    category: "International",
    location: "IOC and Zones"
  },
  {
    id: "e2",
    title: "Anointing Night",
    startDate: "2026-01-30",
    endDate: "2026-01-30",
    category: "International",
    location: "IOC"
  },
  {
    id: "e3",
    title: "Operation Come and See",
    startDate: "2026-01-18",
    endDate: "2026-01-18",
    category: "Events"
  },
  {
    id: "e4",
    title: "Homegroup Opening",
    startDate: "2026-02-03",
    endDate: "2026-02-03",
    category: "Events"
  }
];
function MembersPortal({ onLogout }) {
  const queryClient = useQueryClient();
  const { user, updateUser } = useUser();
  const { data: invitationsData } = useQuery({
    queryKey: ["homegroup-invitations"],
    queryFn: async () => {
      const res = await api.get("/homegroup-invitations");
      if (!res.data.success) throw new Error();
      return res.data.invitations || [];
    },
    staleTime: 15e3,
    refetchInterval: 3e4
  });
  const { data: deptRequestsData } = useQuery({
    queryKey: ["department-requests"],
    queryFn: async () => {
      const res = await api.get("/department-requests");
      if (!res.data.success) throw new Error();
      return res.data.requests || [];
    },
    staleTime: 15e3,
    refetchInterval: 3e4
  });
  const pendingInvitationsCount = (invitationsData || []).filter(
    (inv) => inv.status === "pending"
  ).length;
  const pendingDeptCount = (deptRequestsData || []).filter(
    (r) => r.status === "pending"
  ).length;
  const upcomingEventsCount = CHURCH_EVENTS_2026.filter(
    (e) => new Date(e.startDate) >= new Date((/* @__PURE__ */ new Date()).toDateString())
  ).length;
  const [activeTab, setActiveTab] = useState("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showHomegroupSelector, setShowHomegroupSelector] = useState(false);
  const [homegroupLoading, setHomegroupLoading] = useState(false);
  const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
  const [leaveModal, setLeaveModal] = useState({ show: false, type: null });
  const [connectSubmenu, setConnectSubmenu] = useState(null);
  const [showLocationEntry, setShowLocationEntry] = useState(false);
  const [selectedMemberFor360, setSelectedMemberFor360] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    surname: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    country: "",
    postal_code: "",
    date_of_birth: "",
    gender_id: "",
    demography_id: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setNotificationsOpen(false);
    setConnectSubmenu(null);
    setIsEditingProfile(false);
  };
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await api.put("/members/me", {
        name: profileForm.name,
        surname: profileForm.surname,
        date_of_birth: profileForm.date_of_birth
      });
      await api.put("/members/me/location", {
        address_line_1: profileForm.address_line_1,
        address_line_2: profileForm.address_line_2,
        city: profileForm.city,
        province: profileForm.province,
        country: profileForm.country,
        postal_code: profileForm.postal_code,
        latitude: user?.latitude,
        longitude: user?.longitude
      });
      updateUser({
        name: profileForm.name,
        phone: profileForm.phone,
        address_line_1: profileForm.address_line_1,
        city: profileForm.city,
        province: profileForm.province,
        country: profileForm.country
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
    } catch (err) {
      alert("Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };
  useEffect(() => {
    if (user && !user.location_captured && !localStorage.getItem("location-entry-skipped")) {
      const timer = setTimeout(() => setShowLocationEntry(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        surname: user.member?.surname || "",
        phone: user.phone || "",
        address_line_1: user.address_line_1 || "",
        address_line_2: user.address_line_2 || "",
        city: user.city || "",
        province: user.province || "",
        country: user.country || "",
        postal_code: user.postal_code || "",
        date_of_birth: user.member?.date_of_birth || "",
        gender_id: user.member?.gender_id || "",
        demography_id: user.member?.demography_id || ""
      });
    }
  }, [user]);
  const handleBrowseHomegroups = useCallback(() => {
    setHomegroupLoading(true);
    const timer = setTimeout(() => {
      setShowHomegroupSelector(true);
      setHomegroupLoading(false);
    }, 2e3);
    fetch("/api/home-groups/available", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("him_token")}`
      }
    }).then(() => {
      clearTimeout(timer);
      setHomegroupLoading(false);
      setShowHomegroupSelector(true);
    }).catch(() => {
      clearTimeout(timer);
      setHomegroupLoading(false);
      setShowHomegroupSelector(true);
    });
  }, []);
  const onRequestLeave = useCallback((type) => {
    console.log("[DEBUG] onRequestLeave called with type:", type);
    setLeaveModal({ show: true, type });
  }, []);
  const handleNotificationToggle = () => {
    setNotificationsOpen((prev) => !prev);
  };
  const handleLeaveHomegroup = async (reason) => {
    try {
      console.log("[DEBUG] Leaving homegroup with reason:", reason);
      console.log("[DEBUG] Token exists:", !!localStorage.getItem("him_token"));
      const response = await api.delete("/home-group/leave", {
        data: { reason }
      });
      console.log("[DEBUG] Response:", response.data);
      if (response.data && response.data.success) {
        updateUser({ home_group_id: null, home_group: null });
        queryClient.invalidateQueries({ queryKey: ["homegroup-invitations"] });
      } else {
        alert(response.data?.message || "Failed to leave home group.");
      }
    } catch (err) {
      console.error("[DEBUG] Leave homegroup error:", err);
      const msg = err.response?.data?.message || err.message || "An error occurred";
      alert(`Failed to leave home group: ${msg}`);
    }
  };
  const handleLeaveDepartment = async (reason) => {
    try {
      const response = await api.delete("/department/leave", {
        data: { reason }
      });
      if (response.data && response.data.success) {
        updateUser({ department_id: null, department: null });
      } else {
        alert(response.data?.message || "Failed to leave department.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "An error occurred";
      alert(`Failed to leave department: ${msg}`);
    }
  };
  const handleAction = (id) => {
    if (id === "feedback") setActiveTab("home");
    if (id === "homegroups") setShowHomegroupSelector(true);
    if (id === "departments") setShowDepartmentSelector(true);
    if (id === "edit-profile") setIsEditingProfile(true);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen relative bg-[#0A192F]" }, /* @__PURE__ */ React.createElement(FloatingParticles, null), /* @__PURE__ */ React.createElement("style", null, `
                .gradient-border { position: relative; background: rgba(255,255,255,0.05); border-radius: 14px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
                .gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, #dfb15b, #0ea5e9, #dfb15b); background-size: 200% 200%; animation: gradient-shift 4s ease infinite; z-index: -1; opacity: 0; transition: opacity 0.4s ease; }
                .gradient-border:hover::before { opacity: 0.3; }
                .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2); }
                .badge-pulse { animation: pulse-glow 2s ease-in-out infinite; }
                .tab-panel { animation: tabFadeIn 0.3s ease-out; }
                @keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .nav-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; transition: all 0.2s; border: none; background: rgba(255,255,255,0.05); cursor: pointer; color: #e5e7eb; }
                .nav-btn.nav-active { background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1)); color: #ffffff; }
                .nav-btn.nav-inactive { color: #9ca3af; }
                .nav-btn.nav-inactive:hover { background: rgba(255,255,255,0.1); color: #e5e7eb; }
                .nav-icon { width: 14px; height: 14px; }
                .nav-icon-wrap { position: relative; display: inline-flex; }
                .nav-badge { position: absolute; top: -3px; right: -3px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .nav-avatar { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #dfb15b, #f59e0b); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; position: relative; }
                .nav-avatar-dot { position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; background: #22c55e; border-radius: 50%; border: 1px solid #0A192F; }
                .nav-logout { padding: 5px; border-radius: 7px; color: #9ca3af; transition: all 0.2s; border: none; background: rgba(255,255,255,0.05); cursor: pointer; }
                .nav-logout:hover { color: #ef4444; background: rgba(239, 68, 68, 0.15); }
                .mobile-tab { position: relative; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; flex: 1; height: 100%; }
                .mobile-tab-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .mobile-tab-label { font-size: 9px; font-weight: 500; transition: color 0.2s; }
                .mobile-tab-dot { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: #dfb15b; }
                .page-heading { font-size: 1.125rem; font-weight: 600; color: #ffffff; margin: 0; letter-spacing: -0.01em; }
                .btn { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 7px; font-size: 10px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
                .btn-sm { padding: 3px 8px; font-size: 9px; border-radius: 6px; }
                .btn-lg { padding: 5px 12px; font-size: 11px; border-radius: 8px; }
                .mobile-badge { position: absolute; top: -1px; right: -1px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .text-gradient-gold { background: linear-gradient(135deg, #dfb15b, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes floatUp { 0% { transform: translateY(100vh); } 100% { transform: translateY(-100vh); } }
            `), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 pb-20" }, /* @__PURE__ */ React.createElement("nav", { className: "hidden md:block bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-sm sticky top-0 z-40" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between h-14" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("home"),
      className: "nav-btn " + (activeTab === "home" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.Home, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Home")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("zone"),
      className: "nav-btn " + (activeTab === "zone" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.MapPin, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Zone")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("homegroup"),
      className: "nav-btn " + (activeTab === "homegroup" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.Users, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Connect")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("prayer-center"),
      className: "nav-btn " + (activeTab === "prayer-center" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.HandsPraying, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Prayer")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("events"),
      className: "nav-btn " + (activeTab === "events" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.Calendar, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Events")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("reports"),
      className: "nav-btn " + (activeTab === "reports" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.DocumentText, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Reports")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        handleTabChange("notifications");
        handleNotificationToggle();
      },
      className: "nav-btn " + (activeTab === "notifications" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement("span", { className: "nav-icon-wrap" }, /* @__PURE__ */ React.createElement(Icons.Bell, { className: "nav-icon" }), pendingInvitationsCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "nav-badge" }, pendingInvitationsCount)),
    /* @__PURE__ */ React.createElement("span", null, "Alerts")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("partnership"),
      className: "nav-btn " + (activeTab === "partnership" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.Heart, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Partnership")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("profile"),
      className: "nav-btn " + (activeTab === "profile" ? "nav-active" : "nav-inactive")
    },
    /* @__PURE__ */ React.createElement(Icons.User, { className: "nav-icon" }),
    " ",
    /* @__PURE__ */ React.createElement("span", null, "Profile")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "nav-avatar" }, (user?.name || "M").charAt(0), /* @__PURE__ */ React.createElement("span", { className: "nav-avatar-dot" })), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onLogout,
      className: "nav-logout",
      title: "Logout"
    },
    /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "w-4 h-4",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2
      },
      /* @__PURE__ */ React.createElement(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        }
      )
    )
  ))))), /* @__PURE__ */ React.createElement(
    "nav",
    {
      className: "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/5 backdrop-blur-2xl border-t border-white/10",
      style: {
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-around h-16" }, [
      {
        id: "home",
        icon: Icons.Home,
        label: "Home",
        gradient: "from-sky-400 to-sky-600"
      },
      {
        id: "zone",
        icon: Icons.MapPin,
        label: "Zone",
        gradient: "from-[#d4af37] to-amber-600"
      },
      {
        id: "homegroup",
        icon: Icons.Users,
        label: "Connect",
        gradient: "from-emerald-400 to-emerald-600"
      },
      {
        id: "prayer-center",
        icon: Icons.HandsPraying,
        label: "Prayer",
        gradient: "from-[#D4AF37] to-amber-600"
      },
      {
        id: "events",
        icon: Icons.Calendar,
        label: "Events",
        gradient: "from-violet-400 to-violet-600"
      },
      {
        id: "reports",
        icon: Icons.DocumentText,
        label: "Reports",
        gradient: "from-orange-400 to-orange-600"
      },
      {
        id: "notifications",
        icon: Icons.Bell,
        label: "Alerts",
        gradient: "from-rose-400 to-rose-600",
        badge: pendingInvitationsCount
      },
      {
        id: "partnership",
        icon: Icons.Heart,
        label: "Partner",
        gradient: "from-pink-400 to-pink-600"
      },
      {
        id: "profile",
        icon: Icons.User,
        label: "Profile",
        gradient: "from-indigo-400 to-indigo-600"
      }
    ].map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      const isNotif = item.id === "notifications";
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: item.id,
          onClick: () => {
            if (isNotif) {
              handleTabChange("notifications");
              handleNotificationToggle();
            } else handleTabChange(item.id);
          },
          className: "mobile-tab"
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "mobile-tab-icon " + (isActive ? "bg-gradient-to-br text-white shadow-lg scale-110" : "text-gray-400"),
            style: isActive ? {
              background: "linear-gradient(135deg, " + item.gradient + ")"
            } : {}
          },
          /* @__PURE__ */ React.createElement(Icon, { className: "w-5 h-5" }),
          (item.badge || 0) > 0 && isActive && /* @__PURE__ */ React.createElement("span", { className: "mobile-badge" }, item.badge)
        ),
        /* @__PURE__ */ React.createElement(
          "span",
          {
            className: "mobile-tab-label " + (isActive ? "text-white" : "text-gray-400")
          },
          item.label
        ),
        isActive && /* @__PURE__ */ React.createElement("span", { className: "mobile-tab-dot" })
      );
    }))
  ), /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8" }, activeTab === "home" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white" }, "Good Evening", user?.name ? `, ${user.name.split(" ")[0]}` : "", " ", /* @__PURE__ */ React.createElement("span", { className: "text-[#d4af37]" }, "\u{1F44B}")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-300 mt-1" }, "Welcome to Heartfelt International Ministries")), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold" }, "ACTIVE MEMBER ", /* @__PURE__ */ React.createElement(Icons.ShieldCheck, { className: "w-3 h-3" })), /* @__PURE__ */ React.createElement("span", { className: "block text-xs text-gray-400 mt-1" }, "VERIFIED"), user?.zone?.name && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "Your membership has been registered successfully. You are now officially part of the ", user.zone.name, " zone.")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-medium uppercase" }, "Membership Code"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-white font-mono" }, user?.unique_code || user?.member?.member_code || "xxxxx")), /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-medium uppercase" }, "Zone"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-white" }, user?.zone?.name || "xxx")), /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-medium uppercase" }, "Region"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-white" }, user?.zone?.region?.name || "xxx")), /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 font-medium uppercase" }, "Pastor"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-white truncate" }, user?.pastor?.user?.name || user?.zone?.pastor_name || "xxx"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement(
    HomegroupSection,
    {
      user,
      onViewHomegroup: () => handleAction("homegroups"),
      onRequestLeave,
      homegroupLoading,
      onBrowseHomegroups: handleBrowseHomegroups
    }
  ), /* @__PURE__ */ React.createElement(
    DepartmentsSection,
    {
      user,
      onViewDepartments: () => handleAction("departments"),
      onRequestLeave
    }
  )), /* @__PURE__ */ React.createElement(RecommendedHomeGroupCard, { onJoin: (groupId) => {
    handleBrowseHomegroups();
    setTimeout(() => setShowHomegroupSelector(true), 2e3);
  } }), /* @__PURE__ */ React.createElement(ProfileCompletenessNudge, { user }), /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icons.ChartBar, { className: "w-4 h-4 text-[#d4af37]" }), "Spiritual Progress"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg font-bold text-white" }, upcomingEventsCount), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400" }, "Upcoming Events")), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg font-bold text-white" }, user?.home_group ? "1" : "0", " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "/1")), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400" }, "Homegroups Joined")), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg font-bold text-white" }, user?.department ? "1" : "0", " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "/1")), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400" }, "Departments Joined")), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg font-bold text-purple-400" }, "Prospective"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400" }, "Tier")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2.5" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "Upcoming Events"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleTabChange("events"),
      className: "text-[10px] text-[#dfb15b] font-semibold hover:text-amber-400"
    },
    "View All"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, CHURCH_EVENTS_2026.slice(0, 4).map((event) => /* @__PURE__ */ React.createElement("div", { key: event.id, className: "gradient-border card-hover p-3 cursor-pointer", onClick: () => handleTabChange("events") }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-2 py-0.5 rounded ${event.category === "International" ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-sky-500/20 text-sky-300"}` }, event.category === "International" ? "\u{1F525} FEATURED" : "\u{1F4C5}"), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-white" }, event.title), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, event.startDate, " \u2022 ", event.location || "Open to All"))))))), /* @__PURE__ */ React.createElement("div", { className: "gradient-border p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-2 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icons.BookOpen, { className: "w-4 h-4 text-[#d4af37]" }), "Daily Scripture"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-300 italic mb-3" }, '"Those who are planted in the house of the Lord shall flourish in the courts of our God." \u2014 Psalm 92:13'), /* @__PURE__ */ React.createElement("h4", { className: "text-[10px] font-bold text-white mb-2" }, "Action Items"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, [
    { id: 1, text: "Complete your digital profile to unlock all portal features" },
    { id: 2, text: "Connect with a local Homegroup" },
    { id: 3, text: "Sign up for Department orientation" },
    { id: 4, text: "Activate your Partnership package to support the global vision" }
  ].map((item) => /* @__PURE__ */ React.createElement("label", { key: item.id, className: "flex items-center gap-2 text-[10px]" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", className: "w-3 h-3 rounded border-gray-600 bg-white/10" }), /* @__PURE__ */ React.createElement("span", { className: "text-gray-300" }, item.text)))))), activeTab === "zone" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-md bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-sm" }, /* @__PURE__ */ React.createElement(Icons.MapPin, { className: "w-4 h-4 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "My Zone"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, user && user.zone ? user.zone.name : "Not Assigned"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 text-[10px] text-gray-300 mb-3" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Region:"), " ", user && user.zone && user.zone.region ? user.zone.region.name : "\u2014"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Pastor:"), " ", user && user.pastor ? user.pastor.user.name : user && user.zone && user.zone.pastor_name ? user.zone.pastor_name : "Not Assigned"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Address:"), " ", user && user.zone ? user.zone.address || "\u2014" : "\u2014"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Phone:"), " ", user && user.zone ? user.zone.phone || "\u2014" : "\u2014")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleAction("view-zone"),
      className: "btn btn-lg bg-gradient-to-r from-[#dfb15b]/20 to-amber-500/20 text-[#d4af37] border border-[#dfb15b]/30 hover:from-[#dfb15b]/30 hover:to-amber-500/30 transition-all"
    },
    "View Zone Details"
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-2 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icons.ShieldCheck, { className: "w-4 h-4 text-[#d4af37]" }), "Digital Membership Card"), /* @__PURE__ */ React.createElement(MembershipCard, { user }))), activeTab === "homegroup" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.Users, { className: "w-4 h-4 text-white" })), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-white" }, "My Groups"))), /* @__PURE__ */ React.createElement(
    HomegroupSection,
    {
      user,
      onViewHomegroup: () => handleAction("homegroups"),
      onRequestLeave
    }
  ), /* @__PURE__ */ React.createElement(
    DepartmentsSection,
    {
      user,
      onViewDepartments: () => handleAction("departments"),
      onRequestLeave
    }
  )), activeTab === "events" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "All Upcoming Events")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-2.5" }, CHURCH_EVENTS_2026.filter(
    (e) => new Date(e.startDate) >= new Date((/* @__PURE__ */ new Date()).toDateString())
  ).slice(0, 8).map((event) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: event.id,
      className: "gradient-border card-hover p-3 cursor-pointer",
      onClick: () => handleAction("view-events")
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-9 h-9 rounded-md bg-gradient-to-br " + (event.category === "International" ? "from-[#d4af37] to-amber-500" : "from-sky-400 to-sky-600") + " flex items-center justify-center shadow-sm flex-shrink-0"
      },
      /* @__PURE__ */ React.createElement(Icons.Calendar, { className: "w-4 h-4 text-white" })
    ), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white truncate" }, event.title), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mt-0.5" }, event.startDate, event.endDate !== event.startDate ? " \u2014 " + event.endDate : ""), event.location && /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-500 mt-0.5" }, "\u{1F4CD} ", event.location)), /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "px-1.5 py-0.5 rounded-md text-[9px] font-bold " + (event.category === "International" ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-sky-500/20 text-sky-300")
      },
      event.category
    ))
  )))), activeTab === "reports" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 mx-auto mb-2.5 rounded-md bg-orange-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.DocumentText, { className: "w-5 h-5 text-orange-300" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-0.5" }, "Submit a Report"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mb-2.5" }, "Share prayer requests, report absences, or give feedback."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleAction("submit-reports"),
      className: "btn btn-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg transition-all"
    },
    "Open Report Form"
  ))), activeTab === "notifications" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white" }, "Notifications"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400" }, pendingInvitationsCount + pendingDeptCount, " ", "pending")), /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, (invitationsData || []).filter((inv) => inv.status === "pending").map((inv) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: inv.id,
      className: "gradient-border card-hover p-3"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-md bg-rose-500/20 flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icons.Users, { className: "w-4 h-4 text-rose-300" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-white" }, inv.home_group ? inv.home_group.name : "Homegroup Invitation"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400 mt-0.5" }, "You have been invited to join this homegroup"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-500 mt-0.5" }, inv.created_at ? new Date(
      inv.created_at
    ).toLocaleDateString() : "")))
  )), (deptRequestsData || []).filter((r) => r.status === "pending").map((req) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: req.id,
      className: "gradient-border card-hover p-3"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ React.createElement(Icons.BuildingOffice, { className: "w-4 h-4 text-purple-300" })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-white" }, req.department ? req.department.name : "Department Request"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-400 mt-0.5" }, "Your request is pending approval"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-gray-500 mt-0.5" }, req.created_at ? new Date(
      req.created_at
    ).toLocaleDateString() : "")))
  ))), (invitationsData || []).filter(
    (inv) => inv.status === "pending"
  ).length === 0 && (deptRequestsData || []).filter(
    (r) => r.status === "pending"
  ).length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 mx-auto mb-2 rounded-md bg-gray-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.Bell, { className: "w-5 h-5 text-gray-400" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-0.5" }, "All Caught Up!"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, "No new notifications.")) : null), activeTab === "partnership" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 mx-auto mb-2.5 rounded-md bg-pink-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.Heart, { className: "w-5 h-5 text-pink-300" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-white mb-0.5" }, "Partnership"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400 mb-2.5" }, "Support the global vision of HIM"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleAction("become-partner"),
      className: "btn btn-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg transition-all"
    },
    "Activate Partnership"
  ))), activeTab === "profile" && /* @__PURE__ */ React.createElement("div", { className: "tab-panel space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg" }, (user?.name || "M").charAt(0)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-base font-bold text-white" }, user?.name || "Member"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, user?.email), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-400" }, user?.zone?.name || "No zone", " \u2022 ", user?.member?.status || "Active"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsEditingProfile(!isEditingProfile),
      className: "btn bg-white/5 text-white hover:bg-white/10 border border-white/10"
    },
    isEditingProfile ? "Cancel" : "Edit Profile"
  ))), isEditingProfile ? (
    /* EDIT FORM */
    /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-5 space-y-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white mb-3" }, "Personal Information"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "First Name *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.name, onChange: (e) => setProfileForm({ ...profileForm, name: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Surname"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.surname, onChange: (e) => setProfileForm({ ...profileForm, surname: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Phone"), /* @__PURE__ */ React.createElement("input", { type: "tel", value: profileForm.phone, onChange: (e) => setProfileForm({ ...profileForm, phone: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Date of Birth"), /* @__PURE__ */ React.createElement("input", { type: "date", value: profileForm.date_of_birth, onChange: (e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" }))), /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white mb-3 mt-4" }, "Address"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Address Line 1 *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.address_line_1, onChange: (e) => setProfileForm({ ...profileForm, address_line_1: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Address Line 2"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.address_line_2, onChange: (e) => setProfileForm({ ...profileForm, address_line_2: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "City *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.city, onChange: (e) => setProfileForm({ ...profileForm, city: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Province *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.province, onChange: (e) => setProfileForm({ ...profileForm, province: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Country *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.country, onChange: (e) => setProfileForm({ ...profileForm, country: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase" }, "Postal Code"), /* @__PURE__ */ React.createElement("input", { type: "text", value: profileForm.postal_code, onChange: (e) => setProfileForm({ ...profileForm, postal_code: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]/50" })))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleSaveProfile,
        disabled: profileSaving,
        className: "w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-600 text-white font-bold text-sm rounded-xl hover:from-[#d4af37] hover:to-amber-700 transition-all disabled:opacity-70 shadow-lg"
      },
      profileSaving ? "Saving..." : "Save Changes"
    ))
  ) : (
    /* READ-ONLY INFO */
    /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white mb-3" }, "Personal Information"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 text-[10px]" }, /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Full Name"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Email"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.email || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Phone"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.phone || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Member Code"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.member_code || user?.unique_code || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Date of Birth"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.date_of_birth ? new Date(user.member.date_of_birth).toLocaleDateString() : "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Gender"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.gender?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Demography"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.demography?.name || "\u2014")))), /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white mb-3" }, "Address"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 text-[10px]" }, /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Address"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium text-right max-w-[60%]" }, user?.address_line_1 ? `${user.address_line_1}${user.address_line_2 ? ", " + user.address_line_2 : ""}` : "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "City"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.city || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Province"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.province || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Country"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.country || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Postal Code"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.postal_code || "\u2014")))), /* @__PURE__ */ React.createElement("div", { className: "gradient-border card-hover p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold text-white mb-3" }, "Church Affiliation"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 text-[10px]" }, /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Zone"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.zone?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Region"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.zone?.region?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Home Group"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.home_group?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Department"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.department?.name || "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Baptised"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.is_baptised ? "Yes" : "No")), /* @__PURE__ */ React.createElement("p", { className: "flex justify-between py-1.5 border-b border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Membership Date"), /* @__PURE__ */ React.createElement("span", { className: "text-white font-medium" }, user?.member?.membership_date ? new Date(user.member.membership_date).toLocaleDateString() : "\u2014")))), /* @__PURE__ */ React.createElement(SpiritualJourney, { milestones: user?.spiritual_milestones || [] }), /* @__PURE__ */ React.createElement(RecommendationsWidget, { user }))
  )), activeTab === "prayer-center" && /* @__PURE__ */ React.createElement(PrayerCenter, null))), showHomegroupSelector && /* @__PURE__ */ React.createElement(
    Drawer,
    {
      isOpen: showHomegroupSelector,
      onClose: () => setShowHomegroupSelector(false),
      title: "My Home Group",
      size: "lg"
    },
    /* @__PURE__ */ React.createElement(
      HomeGroupSelector,
      {
        user,
        onClose: () => setShowHomegroupSelector(false),
        onLeave: () => handleAction("homegroups"),
        onRequestLeave
      }
    )
  ), showDepartmentSelector && /* @__PURE__ */ React.createElement(
    Drawer,
    {
      isOpen: showDepartmentSelector,
      onClose: () => setShowDepartmentSelector(false),
      title: "My Department",
      size: "lg"
    },
    /* @__PURE__ */ React.createElement(
      DepartmentRequest,
      {
        user,
        onClose: () => setShowDepartmentSelector(false),
        onRequestLeave: setLeaveModal
      }
    )
  ), /* @__PURE__ */ React.createElement(
    LeaveReasonModal,
    {
      isOpen: leaveModal.show,
      onClose: () => setLeaveModal({ show: false, type: null }),
      onConfirm: (reason) => {
        if (leaveModal.type === "homegroup") {
          handleLeaveHomegroup(reason);
        } else if (leaveModal.type === "department") {
          handleLeaveDepartment(reason);
        }
        setLeaveModal({ show: false, type: null });
      },
      title: leaveModal.type === "homegroup" ? "Leave Home Group" : "Leave Department",
      description: leaveModal.type === "homegroup" ? "Please provide a reason for leaving your home group." : "Please provide a reason for leaving your department."
    }
  ), showLocationEntry && /* @__PURE__ */ React.createElement(
    LocationEntry,
    {
      onComplete: (saved) => {
        setShowLocationEntry(false);
        if (saved) {
          updateUser({
            location_captured: true,
            address_line_1: saved.address_line_1,
            city: saved.city,
            country: saved.country,
            latitude: saved.latitude,
            longitude: saved.longitude
          });
        }
      }
    }
  ), selectedMemberFor360 && /* @__PURE__ */ React.createElement(
    Member360View,
    {
      memberId: selectedMemberFor360,
      onClose: () => setSelectedMemberFor360(null)
    }
  ));
}
const keyframesStyle = `
    @keyframes floatUp {
        0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
        10% { opacity: var(--particle-opacity); }
        90% { opacity: var(--particle-opacity); }
        100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
    }
    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        50% { box-shadow: 0 0 20px 4px rgba(212, 175, 55, 0.15); }
    }
`;
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = keyframesStyle;
  document.head.appendChild(style);
}
export {
  Icons,
  MembersPortal as default
};
