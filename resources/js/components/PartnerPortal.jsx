import React, { useState } from "react";
import PortalLayout from "./PortalLayout";

// Partner Dashboard - Premium Frosted Glass
const PartnerDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-50/80 via-white/80 to-rose-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome, Partner {user?.name?.split(" ")[1] || "John"}!
        </h1>
        <p className="text-gray-500">
          Thank you for your partnership with Heartfelt International Ministry.
        </p>
      </div>

      {/* Partner Stats - Premium Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Partnership Level</p>
          <p className="text-2xl font-bold text-gray-900">Silver Partner</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Total Giving</p>
          <p className="text-2xl font-bold text-gray-900">$2,450</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">$150</p>
        </div>
      </div>

      {/* Giving History - Premium Glass */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Giving History</h3>
        <div className="space-y-3">
          {[
            { date: "Feb 2026", amount: "$150", type: "Monthly" },
            { date: "Jan 2026", amount: "$150", type: "Monthly" },
            { date: "Dec 2025", amount: "$200", type: "Thanksgiving" },
            { date: "Nov 2025", amount: "$150", type: "Monthly" },
          ].map((giving, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div>
                <p className="text-gray-900 font-semibold">{giving.type}</p>
                <p className="text-gray-400 text-sm">{giving.date}</p>
              </div>
              <p className="text-pink-600 font-bold">{giving.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Benefits - Premium Glass */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Priority seating at services",
            "Monthly partner fellowship",
            "Quarterly ministry updates",
            "Special partner recognition",
            "Exclusive prayer requests",
            "Annual partner celebration"
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Partner Portal
export default function PartnerPortal({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <PartnerDashboard user={user} />;
      default:
        return <PartnerDashboard user={user} />;
    }
  };

  return (
    <PortalLayout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      colorScheme="pink"
    >
      {renderPage()}
    </PortalLayout>
  );
}
