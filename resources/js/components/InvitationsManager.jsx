import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";

// Invitation Badge Component
function InvitationBadge({ count }) {
  if (!count || count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 flex items-center justify-center bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg shadow-rose-500/50 animate-bounce-spring">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Invitation Icon
const InvitationIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 20.25a2.25 2.25 0 004.5 0l2.25-2.25a2.25 2.25 0 000-3L7.5 12m4.5 0L3.75 17.25M7.5 12h12.5" />
  </svg>
);

// Single Invitation Card
function InvitationCard({ invitation, onAccept, onDecline }) {
  const [showDeclineNote, setShowDeclineNote] = useState(false);
  const [declineNote, setDeclineNote] = useState("");
  const [declining, setDeclining] = useState(false);

  const handleDecline = async () => {
    if (!declineNote.trim() && !window.confirm("Are you sure you want to decline this invitation?")) {
      return;
    }
    setDeclining(true);
    try {
      await onDecline(invitation.id, declineNote);
      setShowDeclineNote(false);
      setDeclineNote("");
    } finally {
      setDeclining(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <InvitationIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg truncate">
                {invitation.homegroup?.name || "Home Group Invitation"}
              </h4>
              <p className="text-sm text-gray-600">
                Invited by Pastor {invitation.pastor?.name || "Unknown"}
              </p>
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg whitespace-nowrap">
              Pending
            </span>
          </div>
          {invitation.homegroup?.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {invitation.homegroup.location}
            </p>
          )}
          {invitation.homegroup?.meeting_day && invitation.homegroup.meeting_time && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {invitation.homegroup.meeting_day} at {new Date(invitation.homegroup.meeting_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Invited on {formatDate(invitation.invited_at)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAccept(invitation.id)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
          >
            Accept
          </button>
          {!showDeclineNote ? (
            <button
              onClick={() => setShowDeclineNote(true)}
              className="px-4 py-2 bg-white/50 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
            >
              Decline
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Optional: Reason for declining"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/50 resize-none"
              />
              <button
                onClick={handleDecline}
                disabled={declining}
                className="w-full px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {declining ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyInvitations() {
  return (
    <div className="text-center py-12 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400/20 to-amber-500/20 flex items-center justify-center">
        <InvitationIcon className="w-8 h-8 text-gold-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No Pending Invitations</h3>
      <p className="text-gray-500 mt-1">You're all caught up! No homegroup invitations at this time.</p>
    </div>
  );
}

// Main Invitations Manager Component (Drawer content)
export default function InvitationsManager({ isOpen, onClose, userId }) {
  const queryClient = useQueryClient();

  // Fetch invitations
  const { data: invitationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['homegroup-invitations'],
    queryFn: async () => {
      const res = await api.get('/homegroup-invitations');
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      return res.data.invitations;
    },
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: isOpen, // Only fetch when drawer is open
  });

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async (invitationId) => {
      const res = await api.post(`/homegroup-invitations/${invitationId}/accept`);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to accept');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homegroup-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['my-home-group'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: async ({ invitationId, note }) => {
      const res = await api.post(`/homegroup-invitations/${invitationId}/decline`, {
        note: note || null,
      });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to decline');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homegroup-invitations'] });
    },
  });

  if (!isOpen) return null;

  const pendingInvitations = invitationsData?.filter(inv => inv.status === 'pending') || [];
  const processedCount = invitationsData?.length - pendingInvitations.length || 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white/95 backdrop-blur-2xl shadow-2xl z-50 animate-slide-in-right overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
            <InvitationIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Home Group Invitations</h2>
            <p className="text-sm text-gray-500">{pendingInvitations.length} pending • {processedCount} processed</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load invitations. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-gold-600 hover:text-gold-700 font-medium"
            >
              Retry
            </button>
          </div>
        ) : pendingInvitations.length === 0 ? (
          <EmptyInvitations />
        ) : (
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={acceptMutation.mutate}
                onDecline={declineMutation.mutate}
              />
            ))}
          </div>
        )}

        {/* History Section */}
        {processedCount > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Invitations</h3>
            <div className="space-y-2 opacity-60">
              {invitationsData
                .filter(inv => inv.status !== 'pending')
                .slice(0, 5)
                .map((invitation) => (
                  <div key={invitation.id} className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {invitation.homegroup?.name || "Unknown Home Group"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invitation.status === 'accepted' ? '✓ Accepted' : '✗ Declined'}
                          {invitation.responded_at && ` on ${new Date(invitation.responded_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invitation.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes bounce-spring {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-bounce-spring {
          animation: bounce-spring 2s ease-in-out infinite;
        }
      `}</style>
    </div>
    </>
  );
}