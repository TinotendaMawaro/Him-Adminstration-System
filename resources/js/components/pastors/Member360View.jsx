import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../icons";
import SpiritualJourney from "../dashboard/sections/SpiritualJourney";

export default function Member360View({ memberId, onClose }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pastor-member-360", memberId],
    queryFn: () => api.get(`/pastors/members/${memberId}/360`).then((r) => r.data.data ?? null),
    enabled: !!memberId,
    onSuccess: (result) => {
      if (result?.notes) {
        setNotes(result.notes);
      }
    },
  });

  const notesMutation = useMutation({
    mutationFn: (notesText) =>
      api.put(`/pastors/members/${memberId}/notes`, { notes: notesText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastor-member-360", memberId] });
    },
  });

  const handleSaveNotes = () => {
    notesMutation.mutate(notes);
  };

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0A192F] border-l border-white/10 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-[#0A192F]/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
          <h2 className="text-sm font-bold text-white">Member 360° View</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icons.XMark className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : data ? (
          <div className="p-4 space-y-6">
            {/* Identity Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                {(data.member?.full_name || "M").charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{data.member?.full_name}</h3>
                <p className="text-[10px] text-gray-400">
                  Member since {data.member?.membership_date}
                </p>
                <p className="text-[10px] text-gray-400">
                  Zone: {data.affiliations?.zone_name}
                </p>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="gradient-border card-hover p-4">
              <h4 className="text-xs font-bold text-white mb-3">Engagement Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Events Attended" value={data.engagement?.total_events_attended} />
                <MetricCard label="Upcoming" value={data.engagement?.upcoming_events} />
                <MetricCard label="HG Tenure" value={`${data.engagement?.home_group_tenure_months || 0} mo`} />
                <MetricCard label="Total Giving" value={data.engagement?.total_donations ? `$${data.engagement.total_donations}` : "-"} />
              </div>
            </div>

            {/* Spiritual Journey */}
            <SpiritualJourney milestones={data.milestones || []} />

            {/* Badges */}
            {data.badges?.length > 0 && (
              <div className="gradient-border card-hover p-4">
                <h4 className="text-xs font-bold text-white mb-3">Badges Earned</h4>
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((ub) => (
                    <span
                      key={ub.id}
                      className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-[#d4af37] to-amber-600 text-white"
                    >
                      {ub.badgeCatalog?.icon} {ub.badgeCatalog?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events */}
            {data.events?.length > 0 && (
              <div className="gradient-border card-hover p-4">
                <h4 className="text-xs font-bold text-white mb-3">Recent Events</h4>
                <div className="space-y-2">
                  {data.events.map((evt) => (
                    <div key={evt.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-xs font-semibold text-white">{evt.title}</p>
                        <p className="text-[10px] text-gray-400">{evt.starts_at}</p>
                      </div>
                      <span className="text-[10px] text-gray-500">{evt.venue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pastor Notes */}
            <div className="gradient-border card-hover p-4">
              <h4 className="text-xs font-bold text-white mb-3">Pastor Notes</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50 resize-none"
                placeholder="Add private notes about this member..."
              />
              <button
                onClick={handleSaveNotes}
                disabled={notesMutation.isPending}
                className="mt-2 w-full btn bg-gradient-to-r from-[#d4af37] to-amber-600 text-white"
              >
                {notesMutation.isPending ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">No data available.</div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-white">{value ?? "-"}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
