import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { Icons } from "../../icons";

export default function ProfileCompletenessNudge({ user, onNavigateToProfile }) {
  const { data } = useQuery({
    queryKey: ["profile-completeness"],
    queryFn: () => api.get("/profile/completeness").then((r) => r.data.data ?? null),
    enabled: !!user,
  });

  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !data || data.score >= 90) return null;

  const topMissing = data.missing_fields?.slice(0, 2) || [];

  return (
    <div className="gradient-border card-hover p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center">
            <Icons.User className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Complete Your Profile</p>
            <p className="text-[10px] text-gray-400">
              {data.score}% complete — Add{" "}
              {topMissing
                .map((f) => f.field.replace("member.", "").replace("user.", ""))
                .join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-full transition-all"
              style={{ width: `${data.score}%` }}
            />
          </div>
          <button
            onClick={() => {
              setDismissed(true);
              localStorage.setItem("profile-nudge-dismissed-score", data.score.toString());
            }}
            className="text-gray-500 hover:text-white"
          >
            <Icons.XMark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
