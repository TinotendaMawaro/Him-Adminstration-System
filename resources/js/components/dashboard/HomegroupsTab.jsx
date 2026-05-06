import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import InviteMemberDrawer from "./InviteMemberModal.jsx";
import Drawer from "../Drawer.jsx";
import Pagination from "../Pagination.jsx";

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
      const response = await api.post('/homegroups', formData);

      if (response.data && response.data.success) {
        onSuccess();
        onClose();
        setFormData({ name: "", location: "", meeting_day: "Sunday", meeting_time: "10:00" });
      } else {
        setError(response.data?.message || 'Failed to create homegroup');
      }
    } catch (err) {
      // Extract detailed error message from Laravel validation or other errors
      const errMsg = err.response?.data?.message ||
                     (err.response?.data?.errors && JSON.stringify(err.response.data.errors)) ||
                     err.message ||
                     'An error occurred. Please try again.';
      setError(errMsg);
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

// Assign Leader Drawer
function AssignLeaderDrawer({ isOpen, onClose, homegroupName, homegroupId, onSuccess }) {
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
      const response = await api.get(`/homegroups/${homegroupId}/available-members`);
      if (response.data && response.data.success) {
        setMembers(response.data.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
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
      const response = await api.post(`/homegroups/${homegroupId}/assign-leader`, {
        leader_id: selectedMember.id
      });

      if (response.data && response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to assign leader');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Leader - ${homegroupName}`}
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
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-3"></div>
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
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
                onClick={() => setSelectedMember(member)}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  selectedMember && selectedMember.id === member.id
                    ? 'bg-emerald-50 border-2 border-emerald-400'
                    : 'bg-white border-2 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                </div>
                {selectedMember && selectedMember.id === member.id && (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMember || assigning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold hover:from-gold-500 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {assigning ? 'Assigning...' : 'Assign Leader'}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// Demote Leader Confirmation Drawer
function DemoteConfirmationDrawer({ isOpen, onClose, onConfirm, leaderName, homegroupName, loading }) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Demote ${leaderName}?`}
      size="sm"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Demotion</h3>
          <p className="text-gray-600">
            This will remove <strong>{leaderName}</strong> as the leader of <strong>{homegroupName}</strong>.
            They will remain as a regular member.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Demoting...' : 'Demote Leader'}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// View Members Drawer
function ViewMembersDrawer({ isOpen, onClose, homegroupName, members, loading }) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${homegroupName} Members`}
      size="md"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-500">
          {members.length} members in this homegroup
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-3"></div>
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              No members in this homegroup
            </div>
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

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// Homegroup Card with Animated Hover Border Glow
function HomegroupCard({ homegroup, onAssignLeader, onDemoteLeader, onInviteMember, onViewMembers }) {
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
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
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
          <RippleButton
            variant="secondary"
            className="w-full text-sm"
            onClick={() => onInviteMember(homegroup)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Invite Member
            </span>
          </RippleButton>
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedHomegroup, setSelectedHomegroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [demoteLoading, setDemoteLoading] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Use react-query to fetch homegroups from pastor's zone endpoint with pagination
  const { data: homegroupsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['pastor-homegroups', currentPage, perPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
      });
      const res = await api.get(`/pastors/home-groups?${params}`);
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      // Map members_count to members for component compatibility
      const data = res.data.data.map((hg) => ({
        ...hg,
        members: hg.members_count,
      }));

      // Save to localStorage for persistence
      localStorage.setItem('homegroups-data', JSON.stringify(res.data));
      return { data, meta: res.data.meta };
    },
    staleTime: 30000, // 30 seconds cache
    gcTime: 300000,
    refetchOnWindowFocus: true,
    retry: 1,
    keepPreviousData: true,
    initialData: () => {
      // Load from localStorage if available
      const cached = localStorage.getItem('homegroups-data');
      return cached ? JSON.parse(cached) : undefined;
    },
  });

  const homegroups = homegroupsResponse?.data || [];
  const paginationMeta = homegroupsResponse?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0
  };
  const loading = isLoading;

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  const handleInviteMember = (homegroup) => {
    setSelectedHomegroup(homegroup);
    setShowInviteModal(true);
  };

    const handleConfirmDemote = async () => {
      if (!selectedHomegroup) return;

      setDemoteLoading(true);
      try {
        const response = await api.post(`/homegroups/${selectedHomegroup.id}/demote-leader`);

        if (response.data && response.data.success) {
          refreshHomegroups();
          setShowDemoteModal(false);
          setSelectedHomegroup(null);
        } else {
          setError(response.data?.message || 'Failed to demote leader');
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
        setError(msg);
      } finally {
        setDemoteLoading(false);
      }
    };

    const handleViewMembers = async (homegroup) => {
        setSelectedHomegroup(homegroup);
        setMembersLoading(true);
        setShowMembersModal(true);

        try {
            const response = await api.get(`/homegroups/${homegroup.id}`);
            if (response.data && response.data.success) {
                setMembers(response.data.homegroup?.members || []);
            } else {
                setMembers([]);
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
              onInviteMember={handleInviteMember}
              onViewMembers={handleViewMembers}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta.total > 0 && (
        <Pagination
          currentPage={paginationMeta.current_page}
          totalPages={paginationMeta.last_page}
          totalItems={paginationMeta.total}
          itemsPerPage={paginationMeta.per_page}
          onPageChange={handlePageChange}
        />
      )}

      {/* Floating Create Button */}
      <FloatingAddButton onClick={() => setShowCreateModal(true)} label="Create Homegroup" />

      {/* Modals */}
      <CreateHomegroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={refreshHomegroups}
      />

        <AssignLeaderDrawer
          isOpen={showAssignModal}
          onClose={() => { setShowAssignModal(false); setSelectedHomegroup(null); }}
          homegroupName={selectedHomegroup && selectedHomegroup.name}
          homegroupId={selectedHomegroup && selectedHomegroup.id}
          onSuccess={refreshHomegroups}
        />

        <InviteMemberDrawer
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          homegroupName={selectedHomegroup && selectedHomegroup.name}
          homegroupId={selectedHomegroup && selectedHomegroup.id}
          onSuccess={refreshHomegroups}
        />

      <DemoteConfirmationDrawer
        isOpen={showDemoteModal}
        onClose={() => { setShowDemoteModal(false); setSelectedHomegroup(null); }}
        onConfirm={handleConfirmDemote}
        leaderName={selectedHomegroup && selectedHomegroup.leader && selectedHomegroup.leader.name}
        homegroupName={selectedHomegroup && selectedHomegroup.name}
        loading={demoteLoading}
      />

      <ViewMembersDrawer
        isOpen={showMembersModal}
        onClose={() => { setShowMembersModal(false); setSelectedHomegroup(null); setMembers([]); }}
        homegroupName={selectedHomegroup && selectedHomegroup.name}
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

