import { useState, useEffect } from "react";
import api from "../../lib/api.js";

const ROW_CLASS = "h-9";
const TH_CLASS = "px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-widest bg-white/75 backdrop-blur-md border-b border-gray-100";
const TD_CLASS = "px-2 py-1 text-xs text-gray-900 border-b border-gray-100 align-middle";
const INPUT_CLASS = "h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs focus:ring-1 focus:ring-[#dfb15b]/60 focus:border-[#dfb15b]";

export default function MemberDrawer({ member, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (!member) return;
    setForm({
      name: member.name || "",
      surname: member.surname || "",
      phone: member.phone || "",
      email: member.email || "",
    });
    setEditing(false);
  }, [member?.id]);

  const updateField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/members/me", {
        name: form.name,
        surname: form.surname,
      });
      if (res.data.success) {
        setEditing(false);
        onUpdated?.();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const memberCode = member?.member_code || member?.member_number || "N/A";
  const fullName = member?.full_name || [member?.name, member?.surname].filter(Boolean).join(" ") || "Unknown";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#dfb15b]/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-[#dfb15b]">{(member?.name || "?")?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 leading-tight">{fullName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-gray-500">{memberCode}</span>
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border bg-white ${member?.status === "active" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}>
                    {member?.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Full Name</p>
                {editing ? (
                  <input className={INPUT_CLASS} value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                ) : (
                  <p className="text-xs text-gray-900 font-medium truncate" title={member?.name || "N/A"}>{member?.name || "N/A"}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Surname</p>
                {editing ? (
                  <input className={INPUT_CLASS} value={form.surname} onChange={(e) => updateField("surname", e.target.value)} />
                ) : (
                  <p className="text-xs text-gray-900 font-medium truncate" title={member?.surname || "N/A"}>{member?.surname || "N/A"}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Phone</p>
                <p className="text-xs text-gray-900 font-medium truncate" title={member?.phone || "N/A"}>{member?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Email</p>
                <p className="text-xs text-gray-900 font-medium truncate" title={member?.email || "N/A"}>{member?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Zone</p>
                <p className="text-xs text-gray-900 font-medium truncate" title={member?.zone?.name || "N/A"}>{member?.zone?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Home Group</p>
                <p className="text-xs text-gray-900 font-medium truncate" title={member?.homeGroup?.name || "N/A"}>{member?.homeGroup?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Department</p>
                <p className="text-xs text-gray-900 font-medium truncate" title={member?.department?.name || "N/A"}>{member?.department?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Membership Date</p>
                <p className="text-xs text-gray-900 font-medium">{member?.membership_date ? new Date(member.membership_date).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button disabled={saving} onClick={handleSave} className="flex-1 h-8 bg-[#dfb15b] text-white text-xs font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button disabled={saving} onClick={() => setEditing(false)} className="flex-1 h-8 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex-1 h-8 bg-[#dfb15b] text-white text-xs font-medium rounded-lg hover:bg-amber-600">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
