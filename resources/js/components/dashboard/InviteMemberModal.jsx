import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import Drawer from "../Drawer.jsx";

// Ripple Button style consistent with HomegroupsTab
const RippleButton = ({ children, onClick, className = "", variant = "primary", shakeOnClick = false, disabled = false }) => {
  const [ripples, setRipples] = useState([]);
  const [shaking, setShaking] = useState(false);
  const buttonRef = React.useRef(null);

  const handleClick = (e) => {
    if (disabled) return;
    
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    if (shakeOnClick) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    
    if (onClick) onClick(e);
  };

  const baseStyles = "relative overflow-hidden px-5 py-2.5 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-[#dfb15b] via-[#dfb15b] to-amber-500 text-white shadow-lg shadow-[#dfb15b]/25 hover:shadow-[#dfb15b]/40 hover:scale-105",
    secondary: "bg-white/80 backdrop-blur-md text-gray-700 border border-white/50 shadow-md hover:shadow-lg hover:bg-white/90",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-red-500/20",
    dangerGlow: "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105",
  };

  return ( 
    <button 
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${shaking ? 'animate-shake' : ''}`}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/40 rounded-full animate-ripple"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
          }}
        />
      ))}
      {children}
    </button>
  );
};

function InviteMemberDrawer({ isOpen, onClose, homegroupName, homegroupId, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && homegroupId) {
      fetchMembers();
    }
  }, [isOpen, homegroupId]);

  const fetchMembers = async () => {
    setError("");
    try {
      const response = await api.get(`/homegroups/${homegroupId}/available-members-for-invite`);
      const data = response.data;
      if (data && data.success) {
        // Exclude members already in this homegroup
        const filtered = (data.members || []).filter(m => m.home_group_id != homegroupId);
        setMembers(filtered);
      } else {
        setError(data?.message || 'Failed to load members');
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.response?.data?.message || 'Failed to load members');
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async (memberId) => {
    setInviting(true);
    setError("");
    try {
      const response = await api.post(`/homegroups/${homegroupId}/invite`, {
        member_id: memberId
      });

      if (response.data && response.data.success) {
        onSuccess();
        setSearchTerm("");
        // Remove invited member from list
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } else {
        setError(response.data?.message || 'Failed to send invitation');
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite to ${homegroupName}`}
      size="md"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#dfb15b]/50 focus:border-[#dfb15b] transition-all"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              No members available
            </div>
          ) : (
            filteredMembers.map(member => (
              <button
                key={member.id}
                onClick={() => handleInvite(member.id)}
                disabled={inviting}
                className="w-full p-4 rounded-xl flex items-center gap-3 transition-all bg-white border-2 border-transparent hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                </div>
                <span className="text-rose-500 hover:bg-rose-50 p-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={inviting}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export default InviteMemberDrawer;
