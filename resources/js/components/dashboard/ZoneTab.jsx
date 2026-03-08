import React, { useState, useEffect } from "react";
import ZoneDrawer from "./drawers/ZoneDrawer";
import ZoneInfo, { PastorsList } from "./sections/ZoneInfo";
import ZoneHistory from "./sections/ZoneHistory";
import Achievements from "./sections/Achievements";

function AnimatedCard(props) {
  var delay = props.delay || 0;
  var className = props.className || "";
  var children = props.children;
  var _useState = useState(false);
  var isVisible = _useState[0];
  var setIsVisible = _useState[1];
  useEffect(function() {
    var timer = setTimeout(function() { setIsVisible(true); }, delay);
    return function() { clearTimeout(timer); };
  }, [delay]);
  var animClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";
  return React.createElement("div", { className: "transition-all duration-700 ease-out transform " + animClass + " " + className }, children);
}

function QuickStatCard(props) {
  var label = props.label;
  var value = props.value;
  var change = props.change;
  var color = props.color || "sky";
  var colors = { sky: "from-sky-400 to-sky-600", emerald: "from-emerald-400 to-emerald-600", violet: "from-violet-400 to-violet-600", gold: "from-gold-400 to-gold-600" };
  return React.createElement("div", { className: "bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/60 transition-all duration-300" },
    React.createElement("p", { className: "text-xs text-gray-500 uppercase tracking-wider" }, label),
    React.createElement("div", { className: "flex items-end justify-between mt-2" },
      React.createElement("p", { className: "text-2xl font-bold bg-gradient-to-r " + colors[color] + " bg-clip-text text-transparent" }, value),
      change ? React.createElement("span", { className: "text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full" }, change) : null
    )
  );
}

function MiniPastorsList(props) {
  var pastorsData = props.pastorsData;
  var current = null;
  var others = [];
  for (var i = 0; i < pastorsData.length; i++) {
    if (pastorsData[i].isCurrent) { current = pastorsData[i]; }
    else { others.push(pastorsData[i]); }
  }
  return React.createElement("div", { className: "space-y-4" },
    current ? React.createElement("div", { className: "flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gold-50/50 to-sky-50/50 border border-gold-200/30" },
      React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20" },
        React.createElement("span", { className: "text-white font-bold" }, current.name.charAt(0))
      ),
      React.createElement("div", { className: "flex-1" },
        React.createElement("p", { className: "font-bold text-gray-900" }, current.name),
        React.createElement("p", { className: "text-sm text-gray-500" }, current.title),
        React.createElement("p", { className: "text-xs text-gold-600 mt-1" }, "Since " + current.since)
      ),
      React.createElement("span", { className: "px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full" }, "Current")
    ) : null,
    others.length > 0 ? React.createElement("div", null,
      React.createElement("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" }, "Previous Pastors"),
      React.createElement("div", { className: "space-y-2" },
        others.map(function(pastor) {
          return React.createElement("div", { key: pastor.id, className: "flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors" },
            React.createElement("div", { className: "w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold text-sm" }, pastor.name.charAt(0)),
            React.createElement("div", { className: "flex-1" },
              React.createElement("p", { className: "font-medium text-gray-900 text-sm" }, pastor.name),
              React.createElement("p", { className: "text-xs text-gray-500" }, pastor.period)
            )
          );
        })
      )
    ) : null
  );
}

function ZoneTab(props) {
  var user = props.user;
  var _useState = useState({ isOpen: false, title: "", content: null });
  var drawerState = _useState[0];
  var setDrawerState = _useState[1];
  
  var zoneData = { 
    name: user?.zone?.name || user?.zoneName || "IOC",
    description: "A vibrant community of believers committed to spiritual growth and fellowship.", 
    location: "Northern District", 
    established: "2020", 
    membersCount: "250", 
    homeGroupsCount: "20", 
    departmentsCount: "8" 
  };
  
  var pastorsData = [
    { id: 1, name: user && user.name ? user.name : "Pastor C Vutabwashe", title: "Lead Pastor", since: "January 2024", isCurrent: true },
    { id: 2, name: "Pastor Mary Johnson", title: "Associate Pastor", period: "2020 - 2023", isCurrent: false },
    { id: 3, name: "Pastor David Lee", title: "Youth Pastor", period: "2018 - 2020", isCurrent: false },
  ];
  
  var openDrawer = function(title, content) { setDrawerState({ isOpen: true, title: title, content: content }); };
  var closeDrawer = function() { setDrawerState(function(prev) { return Object.assign({}, prev, { isOpen: false }); }); };
  
  var timelineItems = [
    { type: "pastor_change", title: "New Pastor Appointed", description: "Pastor John appointed as Zone Pastor", date: "Jan 15, 2024" },
    { type: "achievement", title: "Zone Achievement", description: "North Zone reached 250 members", date: "Dec 10, 2023" },
    { type: "event", title: "Zone Conference", description: "Annual zone conference held", date: "Nov 5, 2023" },
    { type: "growth", title: "Home Group Expansion", description: "Opened 3 new home groups", date: "Jun 15, 2023" },
  ];
  
  var achievements = [
    { title: "Members", icon: "M", tier: "platinum" },
    { title: "Home Groups", icon: "H", tier: "gold" },
    { title: "Spiritual", icon: "S", tier: "gold" },
    { title: "Depts", icon: "D", tier: "silver" },
    { title: "Community", icon: "C", tier: "silver" },
    { title: "Youth", icon: "Y", tier: "bronze" },
  ];
  
  var getTierColor = function(tier) {
    var colors = { platinum: "from-slate-300 to-slate-500", gold: "from-yellow-300 to-yellow-500", silver: "from-gray-300 to-gray-400", bronze: "from-orange-300 to-orange-500" };
    return colors[tier] || colors.gold;
  };

  return React.createElement("div", { className: "space-y-6" },
    React.createElement(AnimatedCard, { delay: 0 },
      React.createElement("div", { className: "bg-gradient-to-br from-sky-500/10 via-white/60 to-gold-500/10 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-sm overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 overflow-hidden" },
          React.createElement("div", { className: "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold-200/20 to-transparent rounded-full blur-3xl" }),
          React.createElement("div", { className: "absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-200/20 to-transparent rounded-full blur-3xl" })
        ),
        React.createElement("div", { className: "relative p-6 lg:p-8" },
          React.createElement("div", { className: "flex flex-col lg:flex-row lg:items-center gap-6" },
            React.createElement("div", { className: "relative" },
              React.createElement("div", { className: "w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/20" },
                React.createElement("span", { className: "text-white font-bold text-3xl" }, zoneData.name.charAt(0))
              ),
              React.createElement("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center" },
                React.createElement("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20" },
                  React.createElement("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" })
                )
              )
            ),
            React.createElement("div", { className: "flex-1" },
              React.createElement("div", { className: "flex items-center gap-3 mb-2" },
                React.createElement("h2", { className: "text-2xl lg:text-3xl font-bold text-gray-900" }, zoneData.name),
                React.createElement("span", { className: "px-3 py-1 bg-sky-100 text-sky-600 text-xs font-semibold rounded-full" }, "Zone Pastor")
              ),
              React.createElement("p", { className: "text-gray-600 mb-4 max-w-xl" }, zoneData.description),
              React.createElement("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-500" },
                React.createElement("div", { className: "flex items-center gap-1.5" },
                  React.createElement("svg", { className: "w-4 h-4 text-sky-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" })
                  ),
                  zoneData.location
                ),
                React.createElement("div", { className: "flex items-center gap-1.5" },
                  React.createElement("svg", { className: "w-4 h-4 text-gold-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })
                  ),
                  "Est. " + zoneData.established
                )
              )
            ),
            React.createElement("div", { className: "grid grid-cols-3 gap-3" },
              React.createElement(QuickStatCard, { label: "Members", value: zoneData.membersCount, change: "+12%", color: "sky" }),
              React.createElement(QuickStatCard, { label: "Home Groups", value: zoneData.homeGroupsCount, change: "+3", color: "emerald" }),
              React.createElement(QuickStatCard, { label: "Depts", value: zoneData.departmentsCount, color: "violet" })
            )
          )
        )
      )
    ),
    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
      React.createElement("div", { className: "lg:col-span-2 space-y-6" },
        React.createElement(AnimatedCard, { delay: 100 },
          React.createElement("div", { className: "bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden" },
            React.createElement("div", { className: "px-6 py-5 border-b border-gray-100/50 flex items-center justify-between" },
              React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20" },
                  React.createElement("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" })
                  )
                ),
                React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Zonal Information")
              ),
              React.createElement("button", { onClick: function() { openDrawer("Edit Zone Infomation", React.createElement(ZoneInfo, { zone: zoneData })); }, className: "px-4 py-2 rounded-xl bg-sky-100/50 text-sky-600 font-medium text-sm hover:bg-sky-100 transition-colors flex items-center gap-2" },
                React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" })
                ),
                "Edit"
              )
            ),
            React.createElement("div", { className: "p-6" },
              React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement("div", { className: "space-y-4" },
                  React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-gray-50/50" },
                    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center" },
                      React.createElement("svg", { className: "w-5 h-5 text-sky-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" })
                      )
                    ),
                    React.createElement("div", null,
                      React.createElement("p", { className: "text-xs text-gray-500 uppercase tracking-wider" }, "Location"),
                      React.createElement("p", { className: "font-semibold text-gray-900" }, zoneData.location)
                    )
                  ),
                  React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-gray-50/50" },
                    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center" },
                      React.createElement("svg", { className: "w-5 h-5 text-gold-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })
                      )
                    ),
                    React.createElement("div", null,
                      React.createElement("p", { className: "text-xs text-gray-500 uppercase tracking-wider" }, "Established"),
                      React.createElement("p", { className: "font-semibold text-gray-900" }, zoneData.established)
                    )
                  )
                ),
                React.createElement("div", null,
                  React.createElement("div", { className: "flex items-center justify-between mb-3" },
                    React.createElement("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider" }, "Zonal Pastors"),
                    React.createElement("button", { onClick: function() { openDrawer("All Pastors", React.createElement(PastorsList, { pastors: pastorsData, onViewProfile: function(p) { console.log("View:", p); } })); }, className: "text-xs text-sky-600 hover:text-sky-700 font-medium" }, "View All")
                  ),
                  React.createElement(MiniPastorsList, { pastorsData: pastorsData })
                )
              )
            )
          )
        ),
        React.createElement(AnimatedCard, { delay: 200 },
          React.createElement("div", { className: "bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden" },
            React.createElement("div", { className: "px-6 py-5 border-b border-gray-100/50 flex items-center justify-between" },
              React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20" },
                  React.createElement("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" })
                  )
                ),
                React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, " History")
              ),
              React.createElement("button", { onClick: function() { openDrawer("Full History", React.createElement(ZoneHistory, null)); }, className: "text-sm text-sky-600 hover:text-sky-700 font-medium" }, "View Timeline")
            ),
            React.createElement("div", { className: "p-6" },
              React.createElement("div", { className: "relative" },
                React.createElement("div", { className: "absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-sky-400 to-gray-200" }),
                React.createElement("div", { className: "space-y-4" },
                  timelineItems.map(function(item, idx) {
                    var iconClass = "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ";
                    if (item.type === "pastor_change") iconClass += "bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/20";
                    else if (item.type === "achievement") iconClass += "bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold-500/20";
                    else if (item.type === "event") iconClass += "bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/20";
                    else iconClass += "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20";
                    return React.createElement("div", { key: idx, className: "relative flex gap-4" },
                      React.createElement("div", { className: "relative z-10 flex-shrink-0" },
                        React.createElement("div", { className: iconClass },
                          React.createElement("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            item.type === "pastor_change" ? React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" }) :
                            item.type === "achievement" ? React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" }) :
                            item.type === "event" ? React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) :
                            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" })
                          )
                        )
                      ),
                      React.createElement("div", { className: "flex-1 pb-4" },
                        React.createElement("div", { className: "p-3 rounded-xl bg-white/60 border border-gray-100/50 hover:bg-white/80 transition-colors" },
                          React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", null,
                              React.createElement("h4", { className: "font-semibold text-gray-900 text-sm" }, item.title),
                              React.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, item.description)
                            ),
                            React.createElement("span", { className: "text-xs text-gray-400 whitespace-nowrap" }, item.date)
                          )
                        )
                      )
                    );
                  })
                )
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "space-y-6" },
        React.createElement(AnimatedCard, { delay: 300 },
          React.createElement("div", { className: "bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden" },
            React.createElement("div", { className: "px-6 py-5 border-b border-gray-100/50 flex items-center justify-between" },
              React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("div", { className: "w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20" },
                  React.createElement("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" })
                  )
                ),
                React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Achievements")
              ),
              React.createElement("button", { onClick: function() { openDrawer("All Achievements", React.createElement(Achievements, null)); }, className: "text-sm text-sky-600 hover:text-sky-700 font-medium" }, "View All")
            ),
            React.createElement("div", { className: "px-6 py-4 border-b border-gray-100/50" },
              React.createElement("div", { className: "flex items-center justify-between mb-2" },
                React.createElement("span", { className: "text-sm text-gray-600" }, "Progress"),
                React.createElement("span", { className: "text-sm font-semibold text-gray-900" }, "6/12")
              ),
              React.createElement("div", { className: "w-full h-2 bg-gray-100 rounded-full overflow-hidden" },
                React.createElement("div", { className: "h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500", style: { width: "50%" } })
              )
            ),
            React.createElement("div", { className: "p-6" },
              React.createElement("div", { className: "grid grid-cols-3 gap-3" },
                achievements.map(function(badge, idx) {
                  return React.createElement("div", { key: idx, className: "text-center p-3 rounded-xl bg-white/60 border border-gray-100/50 hover:scale-105 transition-transform cursor-pointer hover:shadow-lg" },
                    React.createElement("div", { className: "w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br " + getTierColor(badge.tier) + " flex items-center justify-center text-xs font-bold text-white" }, badge.icon),
                    React.createElement("p", { className: "text-xs font-medium text-gray-700" }, badge.title),
                    React.createElement("p", { className: "text-[10px] text-gray-400 uppercase" }, badge.tier)
                  );
                })
              )
            )
          )
        )
      )
    ),
    React.createElement(ZoneDrawer, { isOpen: drawerState.isOpen, onClose: closeDrawer, title: drawerState.title, size: "lg" },
      drawerState.content
    )
  );
}

export default ZoneTab;
