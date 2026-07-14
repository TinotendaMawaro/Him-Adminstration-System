import { Icons } from "../../MembersPortal";

export default function SpiritualJourney({ milestones = [] }) {
  if (!milestones.length) {
    return (
      <div className="gradient-border card-hover p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Icons.HandsPraying className="w-4 h-4 text-[#d4af37]" />
          Spiritual Journey
        </h3>
        <p className="text-xs text-gray-500 text-center py-8">
          Your spiritual milestones will appear here as you grow in your journey.
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-border card-hover p-6">
      <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <Icons.HandsPraying className="w-4 h-4 text-[#d4af37]" />
        Spiritual Journey
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#d4af37] via-sky-500 to-transparent" />

        <div className="space-y-6">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative flex gap-4">
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: (milestone.color || "#d4af37") + "20",
                  border: `2px solid ${milestone.color || "#d4af37"}`,
                }}
              >
                <span className="text-sm">{milestone.icon || "🌟"}</span>
              </div>

              <div className="flex-1 pb-6">
                <p className="text-[10px] text-gray-500">
                  {new Date(milestone.achieved_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
                <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
                {milestone.subtitle && (
                  <p className="text-xs text-gray-400">{milestone.subtitle}</p>
                )}
                {milestone.description && (
                  <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
