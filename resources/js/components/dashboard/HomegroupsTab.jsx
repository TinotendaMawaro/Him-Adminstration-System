import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";

// Ripple Effect Button Component
function RippleButton({ children, onClick, className = "", variant = "primary", shakeOnClick = false, disabled = false }) {
  const [ripples, setRipples] = useState([]);
  const [shaking, setShaking] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (disabled) return;
    
    const button = buttonRef.current;
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
}

// Drawer Component - Slide-out Panel
function Drawer({ isOpen, onClose, title, children, size = "md" }) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer Panel - Slide from right */}
      <div className="absolute right-0 top-0 h-full w-full">
        <div className={`relative h-full bg-white/95 backdrop-blur-2xl shadow-2xl animate-slide-in-right ${sizes[size]} ml-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Homegroup Modal
function CreateHomegroupModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    meeting_day: "Sunday",
    meeting_time: "10:00"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Homegroup name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/homegroups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({ name: "", location: "", meeting_day: "Sunday", meeting_time: "10:00" });
      } else {
        setError(data.message || 'Failed to create homegroup');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Homegroup</h2>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Homegroup Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              placeholder="e.g., North Zone Group A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              placeholder="Address or meeting point"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Day</label>
              <select
                name="meeting_day"
                value={formData.meeting_day}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Time</label>
              <input
                type="time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
          <RippleButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Homegroup'}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}

// Assign Leader Modal
function AssignLeaderModal({ isOpen, onClose, homegroupName, homegroupId, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && homegroupId) {
      fetchMembers();
    }
  }, [isOpen, homegroupId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/homegroups/${homegroupId}/available-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedMember) return;

    setAssigning(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/homegroups/${homegroupId}/assign-leader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ leader_id: selectedMember.id }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to assign leader');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Assign Leader</h2>
          <p className="text-gray-500 text-sm mt-1">Select a member to lead {homegroupName}</p>
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
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No members available</div>
            ) : (
              filteredMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                    selectedMember?.id === member.id 
                      ? 'bg-emerald-50 border-2 border-emerald-400' 
                      : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                  </div>
                  {selectedMember?.id === member.id && (
                    <svg className="w-5 h-5 text-emerald-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
          <RippleButton onClick={handleAssign} disabled={!selectedMember || assigning}>
            {assigning ? 'Assigning...' : 'Assign Leader'}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}

// Demote Leader Confirmation Modal
function DemoteConfirmationModal({ isOpen, onClose, onConfirm, leaderName, homegroupName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demote {leaderName}?</h2>
          <p className="text-gray-500">
            This will remove {leaderName} as the leader of {homegroupName}. 
            They will remain as a regular member.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-3">
          <RippleButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</RippleButton>
          <RippleButton variant="dangerGlow" onClick={onConfirm} disabled={loading}>
            {loading ? 'Demoting...' : 'Demote'}
          </RippleButton>
        </div>
      </div>
    </div>
  );
}

// View Members Modal
function ViewMembersModal({ isOpen, onClose, homegroupName, members, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{homegroupName} Members</h2>
          <p className="text-gray-500 text-sm mt-1">{members.length} members in this homegroup</p>
        </div>
        <div className="p-6 max-h-80 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No members in this homegroup</div>
          ) : (
            members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role || 'Member'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.status}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <RippleButton variant="secondary" onClick={onClose}>Close</RippleButton>
        </div>
      </div>
    </div>
  );
}

// Homegroup Card with Animated Hover Border Glow
function HomegroupCard({ homegroup, onAssignLeader, onDemoteLeader, onViewMembers }) {
  return (
    <div 
      className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => onViewMembers(homegroup)}
    >
      {/* Animated border glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-[-2px] rounded-3xl bg-gradient-to-r from-gold-400 via-emerald-400 to-sky-400" style={{ animation: 'spin 3s linear infinite' }} />
      </div>
      
      {/* Inner card to cover the glow */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-[1.4rem] m-0.5 p-5 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-sky-400/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          {/* Member count badge */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full blur-md opacity-30"></div>
            <div className="relative px-3 py-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full text-white text-sm font-bold shadow-lg">
              {homegroup.members} members
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">{homegroup.name}</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {homegroup.location || 'No location set'}
          </p>
        </div>

        {/* Meeting Info */}
        <div className="bg-emerald-50/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Meeting Schedule</p>
          <p className="font-semibold text-gray-900">
            {homegroup.meeting_day || 'Not set'} at {homegroup.meeting_time || 'Not set'}
          </p>
        </div>

        {/* Leader Info */}
        {homegroup.leader ? (
          <div className="bg-white/50 rounded-2xl p-4 mb-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Group Leader</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white font-bold text-sm">
                {homegroup.leader.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{homegroup.leader.name}</p>
                <p className="text-xs text-gray-500">Since {homegroup.leader_since || 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-500">No leader assigned</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {homegroup.leader ? (
            <>
              <RippleButton 
                variant="secondary" 
                className="flex-1 text-sm"
                onClick={() => onAssignLeader(homegroup)}
              >
                Replace Leader
              </RippleButton>
              <RippleButton 
                variant="danger" 
                className="text-sm"
                shakeOnClick={true}
                onClick={() => onDemoteLeader(homegroup)}
              >
                Demote
              </RippleButton>
            </>
          ) : (
            <RippleButton 
              className="flex-1 text-sm"
              onClick={() => onAssignLeader(homegroup)}
            >
              Assign Leader
            </RippleButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating Add Button
function FloatingAddButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="fixed bottom-8 right-8 z-40 group">
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
      <div className="relative flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300 hover:scale-110">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-white font-semibold">{label}</span>
      </div>
    </button>
  );
}

// Main Homegroups Tab Component
export default function HomegroupsTab() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedHomegroup, setSelectedHomegroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [demoteLoading, setDemoteLoading] = useState(false);

  // Use react-query to fetch homegroups from pastor's zone endpoint
  const { data: homegroupsData, isLoading, error, refetch } = useQuery({
    queryKey: ['pastor-homegroups'],
    queryFn: async () => {
      const res = await api.get('/pastors/home-groups');
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      // Map members_count to members for component compatibility
      return res.data.data.map((hg) => ({
        ...hg,
        members: hg.members_count,
      }));
    },
    staleTime: 30000, // 30 seconds cache
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const homegroups = homegroupsData || [];
  const loading = isLoading;

  // Manual refresh function
  const refreshHomegroups = () => {
    queryClient.invalidateQueries({ queryKey: ['pastor-homegroups'] });
  };

  const handleAssignLeader = (homegroup) => {
    setSelectedHomegroup(homegroup);
    setShowAssignModal(true);
  };

  const handleDemoteLeader = (homegroup) => {
    setSelectedHomegroup(homegroup);
    setShowDemoteModal(true);
  };

  const handleConfirmDemote = async () => {
    if (!selectedHomegroup) return;

    setDemoteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/homegroups/${selectedHomegroup.id}/demote-leader`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (data.success) {
        refreshHomegroups();
        setShowDemoteModal(false);
        setSelectedHomegroup(null);
      }
    } catch (err) {
      console.error('Error demoting leader:', err);
    } finally {
      setDemoteLoading(false);
    }
  };

  const handleViewMembers = async (homegroup) => {
    setSelectedHomegroup(homegroup);
    setMembersLoading(true);
    setShowMembersModal(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/homegroups/${homegroup.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.homegroup.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Groups</h2>
          <p className="text-gray-500 mt-1">Manage your zone's home groups</p>
        </div>
        <div className="text-sm text-gray-500">
          {homegroups.length} home group{homegroups.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid of Homegroup Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Skeleton loaders */}
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-5 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
              </div>
              <div className="mb-4">
                <div className="h-5 w-3/4 rounded bg-gray-200 mb-2"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
              <div className="bg-gray-100/50 rounded-xl p-3">
                <div className="h-3 w-1/3 rounded bg-gray-200 mb-2"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : homegroups.length === 0 ? (
        <div className="text-center py-20 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Home Groups Yet</h3>
          <p className="text-gray-500 mb-6">Create your first home group to get started</p>
          <RippleButton onClick={() => setShowCreateModal(true)}>
            Create Home Group
          </RippleButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {homegroups.map((homegroup) => (
            <HomegroupCard
              key={homegroup.id}
              homegroup={homegroup}
              onAssignLeader={handleAssignLeader}
              onDemoteLeader={handleDemoteLeader}
              onViewMembers={handleViewMembers}
            />
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <FloatingAddButton onClick={() => setShowCreateModal(true)} label="Create Homegroup" />

      {/* Modals */}
      <CreateHomegroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={refreshHomegroups}
      />

      <AssignLeaderModal 
        isOpen={showAssignModal} 
        onClose={() => { setShowAssignModal(false); setSelectedHomegroup(null); }}
        homegroupName={selectedHomegroup?.name}
        homegroupId={selectedHomegroup?.id}
        onSuccess={refreshHomegroups}
      />

      <DemoteConfirmationModal 
        isOpen={showDemoteModal}
        onClose={() => { setShowDemoteModal(false); setSelectedHomegroup(null); }}
        onConfirm={handleConfirmDemote}
        leaderName={selectedHomegroup?.leader?.name}
        homegroupName={selectedHomegroup?.name}
        loading={demoteLoading}
      />

      <ViewMembersModal 
        isOpen={showMembersModal}
        onClose={() => { setShowMembersModal(false); setSelectedHomegroup(null); setMembers([]); }}
        homegroupName={selectedHomegroup?.name}
        members={members}
        loading={membersLoading}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

