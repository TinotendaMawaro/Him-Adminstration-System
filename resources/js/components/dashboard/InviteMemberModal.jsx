import React, { useState, useEffect } from "react";

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
    primary: "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105",
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

function InviteMemberModal({ isOpen, onClose, homegroupName, homegroupId, onSuccess }) {
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
       const token = localStorage.getItem('him_token');
       const response = await fetch(`/api/homegroups/${homegroupId}/available-members`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       const data = await response.json();
       if (data.success) {
         // Exclude members already in this homegroup
         const filtered = (data.members || []).filter(m => m.homegroup_id != homegroupId);
         setMembers(filtered);
       } else {
         setError(data.message || 'Failed to load members');
       }
     } catch (err) {
       console.error('Error fetching members:', err);
       setError('Failed to load members');
     }
   };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async (memberId) => {
    setInviting(true);
    setError("");
    try {
      const token = localStorage.getItem('him_token');
      const response = await fetch(`/api/homegroups/${homegroupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ member_id: memberId }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        setSearchTerm("");
        // Remove invited member from list
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } else {
        setError(data.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Invite to {homegroupName}</h2>
          <p className="text-gray-500 text-sm mt-1">Select a member to invite</p>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
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
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No members available</div>
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
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                  </div>
                  <span className="ml-auto text-rose-500 hover:bg-rose-50 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <RippleButton variant="secondary" onClick={onClose} disabled={inviting}>Cancel</RippleButton>
        </div>
        <style>{`
          @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
          }
          .animate-ripple {
            animation: ripple 0.6s linear forwards;
          }
        `}</style>
      </div>
    </div>
  );
}

export { RippleButton };
export default InviteMemberModal;
