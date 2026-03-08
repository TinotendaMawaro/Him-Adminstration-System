import { useState } from "react";

export default function Header({ title, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      {/* Title Section */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-sky-900 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-gold-500 to-sky-500 animate-pulse"></span>
          Praise the Lord, {user?.name || "Pastor C Vutabwashe"}
        </p>
      </div>
      
      {/* Actions Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-smooth group">
          <svg className="w-5 h-5 text-gray-600 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification badge */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg shadow-red-500/40 animate-pulse"></span>
        </button>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-smooth cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-white shadow-lg">
              {user?.name?.charAt(0) || "P"}
            </div>
            <div className="hidden lg:block">
              <p className="text-gray-900 font-semibold text-sm">{user?.name || "Pastor John"}</p>
              <p className="text-gray-500 text-xs">Zone Shepherd</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    // Handle profile click
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    // Handle settings click
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
