// "My church": the parts of the old members portal that now live natively in the app
// (zone, home group, department, prayer requests, personal details and profile photo).
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Camera, ChevronRight, Church as ChurchIcon, HandHeart, Home as HomeIcon, MapPin, MessageCircleHeart, Send, UserRound, Users } from "lucide-react";
import { Avatar, Btn, ConfirmSheet, Empty, ErrorState, Sheet, Skel, TopBar, toast } from "./ui.jsx";
import api from "../lib/api.js";
import { compressImage, errorMessage, formatWhen, haptic } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

const list = (res) => {
    const d = res?.data?.data ?? res?.data?.homegroups ?? res?.data ?? [];
    return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
};

function Row({ icon: Icon, label, hint, onClick, color = "var(--accent)" }) {
    return (
        <button onClick={() => { haptic(6); onClick?.(); }} className="w-full flex items-center gap-3.5 px-4 min-h-[60px] py-2 text-left active:bg-[var(--surface2)]">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color }}><Icon size={20} /></span>
            <span className="flex-1 min-w-0"><span className="block font-semibold text-[15.5px]">{label}</span>{hint && <span className="block text-xs truncate" style={{ color: "var(--mut)" }}>{hint}</span>}</span>
            <ChevronRight size={18} style={{ color: "var(--mut)" }} />
        </button>
    );
}

const Field = ({ label, children }) => <div className="mb-3"><label className="hm-label">{label}</label>{children}</div>;
const Body = ({ children }) => <div className="flex-1 overflow-y-auto hm-scroll px-4 pb-8 pt-3">{children}</div>;

// ── Hub ───────────────────────────────────────────────────────────────────────────────────────
export function ChurchHub() {
    const nav = useNav();
    const { user } = useUser();
    const summary = useQuery({ queryKey: ["zone-summary"], queryFn: () => api.get("/members/zone-summary").then((r) => r.data.data), staleTime: 300_000 });
    const hg = useQuery({ queryKey: ["my-homegroup"], queryFn: () => api.get("/home-group/my-request").then((r) => r.data), staleTime: 60_000 });
    const dp = useQuery({ queryKey: ["my-department"], queryFn: () => api.get("/department-request/my").then((r) => r.data), staleTime: 60_000 });
    const zone = user?.zone;
    const s = summary.data;
    const hgName = hg.data?.member?.home_group?.name, hgPending = hg.data?.pending?.home_group?.name || hg.data?.pending?.homeGroup?.name;
    const dpName = dp.data?.member?.department?.name, dpPending = dp.data?.pending?.department?.name;

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="My church" subtitle={zone?.name} />
            <Body>
                <div className="rounded-3xl p-5 text-white" style={{ background: "linear-gradient(150deg,#0f2744,#1e3a5f 60%,#2f6bff 140%)" }}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80"><MapPin size={14} />My zone</div>
                    <div className="text-2xl font-extrabold mt-1 leading-tight">{zone?.name || "No zone yet"}</div>
                    <div className="text-sm opacity-85">{[zone?.code, zone?.region?.name || zone?.region].filter(Boolean).join(" · ")}</div>
                    {zone?.pastor?.name && <div className="text-sm mt-2 opacity-90">Pastor: <b>{zone.pastor.name}</b></div>}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[["Members", s?.total_members], ["Home groups", s?.total_home_groups], ["Departments", s?.total_departments]].map(([l, v]) => (
                            <div key={l} className="rounded-2xl py-2.5 text-center" style={{ background: "rgba(255,255,255,.12)" }}>
                                {summary.isLoading ? <Skel w={30} h={20} className="mx-auto" /> : <div className="font-extrabold text-xl">{v ?? "–"}</div>}
                                <div className="text-[11px] opacity-80">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <section className="mt-5"><h3 className="hm-label">Belonging</h3>
                    <div className="hm-card overflow-hidden divide-y">
                        <Row icon={HomeIcon} color="#12a150" label="Home group" hint={hgName || (hgPending ? `Request pending: ${hgPending}` : "Find and join a home group")} onClick={() => nav.push("homegroup")} />
                        <Row icon={Building2} color="#7c3aed" label="Department" hint={dpName || (dpPending ? `Request pending: ${dpPending}` : "Serve in a department")} onClick={() => nav.push("department")} />
                    </div>
                </section>
                <section className="mt-5"><h3 className="hm-label">Care</h3>
                    <div className="hm-card overflow-hidden divide-y">
                        <Row icon={MessageCircleHeart} color="#e11d48" label="Prayer & messages to my pastor" hint="Private requests, praise reports and counselling" onClick={() => nav.push("prayer")} />
                        <Row icon={HandHeart} color="#b45309" label="Partnership" hint="Become a partner and open a marketplace shop" onClick={() => nav.push("partner-info")} />
                    </div>
                </section>
                <section className="mt-5"><h3 className="hm-label">About me</h3>
                    <div className="hm-card overflow-hidden divide-y">
                        <Row icon={UserRound} color="#2f6bff" label="Personal details & photo" hint="Name, phone, birthday, address" onClick={() => nav.push("personal")} />
                    </div>
                </section>
            </Body>
        </div>
    );
}

// ── Home group ────────────────────────────────────────────────────────────────────────────────
export function HomeGroupScreen() {
    const qc = useQueryClient();
    const [pick, setPick] = useState(null), [notes, setNotes] = useState(""), [leave, setLeave] = useState(false), [reason, setReason] = useState("");
    const mine = useQuery({ queryKey: ["my-homegroup"], queryFn: () => api.get("/home-group/my-request").then((r) => r.data) });
    const groups = useQuery({ queryKey: ["homegroups-available"], queryFn: () => api.get("/home-groups/available"), enabled: !mine.data?.member, staleTime: 60_000 });
    const done = (msg) => { toast(msg, "success"); qc.invalidateQueries({ queryKey: ["my-homegroup"] }); qc.invalidateQueries({ queryKey: ["zone-summary"] }); setPick(null); setLeave(false); };
    const request = useMutation({ mutationFn: () => api.post("/home-group/request", { home_group_id: pick.id, notes: notes || undefined }), onSuccess: () => done("Request sent to the leader"), onError: (e) => toast(errorMessage(e), "error") });
    const cancel = useMutation({ mutationFn: () => api.delete("/home-group/cancel-request"), onSuccess: () => done("Request cancelled"), onError: (e) => toast(errorMessage(e), "error") });
    const leaveM = useMutation({ mutationFn: () => api.delete("/home-group/leave", { data: { reason } }), onSuccess: () => done("You have left the home group"), onError: (e) => toast(errorMessage(e), "error") });
    const m = mine.data?.member, pending = mine.data?.pending;

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Home group" subtitle="Small groups that meet through the week" />
            <Body>
                {mine.isLoading && <><Skel h={96} r={20} /><Skel h={64} r={20} className="mt-3" /></>}
                {mine.isError && <ErrorState error={mine.error} onRetry={mine.refetch} />}
                {m?.home_group && (
                    <div className="hm-card p-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Your home group</div>
                        <div className="text-xl font-extrabold mt-1">{m.home_group.name}</div>
                        <div className="text-sm mt-1" style={{ color: "var(--mut)" }}>{[m.home_group.meeting_day, m.home_group.meeting_time?.slice?.(0, 5), m.home_group.location].filter(Boolean).join(" · ") || "Meeting details to be announced"}</div>
                        {m.home_group.leader?.name && <div className="text-sm mt-2">Leader: <b>{m.home_group.leader.name}</b></div>}
                        {m.lead_pastor?.name && <div className="text-sm">Pastor: <b>{m.lead_pastor.name}</b></div>}
                        <Btn variant="soft" size="sm" className="mt-4" onClick={() => setLeave(true)}>Leave group</Btn>
                    </div>
                )}
                {pending && (
                    <div className="hm-card p-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#b45309" }}>Request pending</div>
                        <div className="text-lg font-extrabold mt-1">{pending.home_group?.name || pending.homeGroup?.name || "Home group"}</div>
                        <p className="text-sm mt-1" style={{ color: "var(--mut)" }}>The group leader or your pastor will respond soon. You'll get a notification.</p>
                        <Btn variant="soft" size="sm" className="mt-3" loading={cancel.isPending} onClick={() => cancel.mutate()}>Cancel request</Btn>
                    </div>
                )}
                {!m && !pending && !mine.isLoading && (
                    <>
                        {mine.data?.rejected && <p className="text-sm rounded-2xl p-3 mb-3" style={{ background: "var(--surface2)", color: "var(--mut)" }}>Your last request was declined. You can choose another group.</p>}
                        <h3 className="hm-label">Groups in your zone</h3>
                        {groups.isLoading && <Skel h={80} r={20} />}
                        {!groups.isLoading && !list(groups.data).length && <Empty icon={Users} title="No home groups yet" text="Your pastor hasn't created any home groups in your zone." />}
                        <div className="space-y-3">
                            {list(groups.data).map((g) => (
                                <button key={g.id} onClick={() => setPick(g)} className="hm-card p-4 w-full text-left active:scale-[.99] transition-transform">
                                    <div className="font-bold text-[16px]">{g.name}</div>
                                    <div className="text-sm" style={{ color: "var(--mut)" }}>{[g.meeting_day, g.meeting_time, g.location].filter(Boolean).join(" · ") || "Meeting details to be announced"}</div>
                                    {g.leader?.name && <div className="text-xs mt-1" style={{ color: "var(--mut)" }}>Led by {g.leader.name}</div>}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </Body>
            <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? `Join ${pick.name}?` : ""} footer={<Btn block loading={request.isPending} onClick={() => request.mutate()}>Send request</Btn>}>
                <Field label="Note to the leader (optional)"><textarea className="hm-input" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Introduce yourself…" /></Field>
            </Sheet>
            <Sheet open={leave} onClose={() => setLeave(false)} title="Leave this home group?" footer={<Btn block variant="danger" loading={leaveM.isPending} disabled={reason.trim().length < 3} onClick={() => leaveM.mutate()}>Leave group</Btn>}>
                <Field label="Please tell us why"><textarea className="hm-input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            </Sheet>
        </div>
    );
}

// ── Department ────────────────────────────────────────────────────────────────────────────────
export function DepartmentScreen() {
    const qc = useQueryClient();
    const [pick, setPick] = useState(null), [notes, setNotes] = useState(""), [leave, setLeave] = useState(false), [reason, setReason] = useState("");
    const mine = useQuery({ queryKey: ["my-department"], queryFn: () => api.get("/department-request/my").then((r) => r.data) });
    const depts = useQuery({ queryKey: ["departments-all"], queryFn: () => api.get("/departments", { params: { per_page: 60 } }), enabled: !mine.data?.member, staleTime: 120_000 });
    const done = (msg) => { toast(msg, "success"); qc.invalidateQueries({ queryKey: ["my-department"] }); setPick(null); setLeave(false); };
    const request = useMutation({ mutationFn: () => api.post("/department-request", { department_id: pick.id, notes: notes || undefined }), onSuccess: () => done("Request sent to the pastor"), onError: (e) => toast(errorMessage(e), "error") });
    const cancel = useMutation({ mutationFn: () => api.delete("/department-request/cancel"), onSuccess: () => done("Request cancelled"), onError: (e) => toast(errorMessage(e), "error") });
    const leaveM = useMutation({ mutationFn: () => api.delete("/department/leave", { data: { reason } }), onSuccess: () => done("You have left the department"), onError: (e) => toast(errorMessage(e), "error") });
    const m = mine.data?.member, pending = mine.data?.pending;

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Department" subtitle="Serve with your gifts" />
            <Body>
                {mine.isLoading && <Skel h={96} r={20} />}
                {mine.isError && <ErrorState error={mine.error} onRetry={mine.refetch} />}
                {m?.department && (
                    <div className="hm-card p-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Your department</div>
                        <div className="text-xl font-extrabold mt-1">{m.department.name}</div>
                        {m.department.description && <p className="text-sm mt-1" style={{ color: "var(--mut)" }}>{m.department.description}</p>}
                        <Btn variant="soft" size="sm" className="mt-4" onClick={() => setLeave(true)}>Leave department</Btn>
                    </div>
                )}
                {pending && (
                    <div className="hm-card p-4">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#b45309" }}>Request pending</div>
                        <div className="text-lg font-extrabold mt-1">{pending.department?.name}</div>
                        <p className="text-sm mt-1" style={{ color: "var(--mut)" }}>Your pastor will review your request.</p>
                        <Btn variant="soft" size="sm" className="mt-3" loading={cancel.isPending} onClick={() => cancel.mutate()}>Cancel request</Btn>
                    </div>
                )}
                {!m && !pending && !mine.isLoading && (
                    <>
                        <h3 className="hm-label">Departments</h3>
                        {depts.isLoading && <Skel h={80} r={20} />}
                        {!depts.isLoading && !list(depts.data).length && <Empty icon={Building2} title="No departments yet" />}
                        <div className="space-y-3">
                            {list(depts.data).map((d) => (
                                <button key={d.id} onClick={() => setPick(d)} className="hm-card p-4 w-full text-left active:scale-[.99] transition-transform">
                                    <div className="flex items-center gap-3"><span className="w-3 h-10 rounded-full shrink-0" style={{ background: d.color || "var(--accent)" }} />
                                        <div className="min-w-0"><div className="font-bold text-[16px] truncate">{d.name}</div>
                                            <div className="text-sm line-clamp-2" style={{ color: "var(--mut)" }}>{d.description || "Serve in this ministry"}</div></div></div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </Body>
            <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? `Join ${pick.name}?` : ""} footer={<Btn block loading={request.isPending} onClick={() => request.mutate()}>Send request</Btn>}>
                <Field label="Why do you want to serve here? (optional)"><textarea className="hm-input" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            </Sheet>
            <Sheet open={leave} onClose={() => setLeave(false)} title="Leave this department?" footer={<Btn block variant="danger" loading={leaveM.isPending} disabled={reason.trim().length < 3} onClick={() => leaveM.mutate()}>Leave department</Btn>}>
                <Field label="Please tell us why"><textarea className="hm-input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            </Sheet>
        </div>
    );
}

// ── Prayer & messages ─────────────────────────────────────────────────────────────────────────
export function PrayerScreen() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false), [detail, setDetail] = useState(null);
    const [f, setF] = useState({ category_id: "", subject: "", message: "", priority: "normal" });
    const cats = useQuery({ queryKey: ["prayer-cats"], queryFn: () => api.get("/prayer-center/categories"), staleTime: 600_000 });
    const msgs = useQuery({ queryKey: ["prayer-msgs"], queryFn: () => api.get("/prayer-center/messages") });
    const send = useMutation({
        mutationFn: () => api.post("/prayer-center/messages", { ...f, category_id: +f.category_id }),
        onSuccess: () => { toast("Sent to your pastor", "success"); setOpen(false); setF({ category_id: "", subject: "", message: "", priority: "normal" }); qc.invalidateQueries({ queryKey: ["prayer-msgs"] }); },
        onError: (e) => toast(errorMessage(e), "error"),
    });
    const ok = f.category_id && f.subject.trim().length >= 3 && f.message.trim().length >= 5;
    const rows = list(msgs.data);

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Prayer & messages" subtitle="Private to you and your pastor" right={<Btn size="sm" icon={Send} onClick={() => setOpen(true)}>New</Btn>} />
            <Body>
                {msgs.isLoading && <><Skel h={80} r={20} /><Skel h={80} r={20} className="mt-3" /></>}
                {msgs.isError && <ErrorState error={msgs.error} onRetry={msgs.refetch} />}
                {!msgs.isLoading && !rows.length && <Empty icon={MessageCircleHeart} title="Nothing sent yet" text="Share a prayer request, praise report or ask for counselling. Only your pastor sees it." action={<Btn onClick={() => setOpen(true)}>Write to my pastor</Btn>} />}
                <div className="space-y-3">
                    {rows.map((m) => (
                        <button key={m.id} onClick={() => setDetail(m)} className="hm-card p-4 w-full text-left">
                            <div className="flex items-center gap-2 text-xs"><span className="hm-badge">{m.category?.name || "Message"}</span><span style={{ color: "var(--mut)" }}>{formatWhen(m.created_at)}</span><span className="ml-auto font-bold capitalize" style={{ color: m.status === "resolved" ? "#12a150" : "var(--mut)" }}>{String(m.status || "").replace("_", " ")}</span></div>
                            <div className="font-bold mt-1.5 truncate">{m.subject}</div>
                            <div className="text-sm line-clamp-2" style={{ color: "var(--mut)" }}>{m.message}</div>
                            {m.replies?.length > 0 && <div className="text-xs font-bold mt-2" style={{ color: "var(--accent)" }}>{m.replies.length} repl{m.replies.length > 1 ? "ies" : "y"} from your pastor</div>}
                        </button>
                    ))}
                </div>
            </Body>
            <Sheet open={open} onClose={() => setOpen(false)} title="Write to your pastor" full footer={<Btn block loading={send.isPending} disabled={!ok} icon={Send} onClick={() => send.mutate()}>Send</Btn>}>
                <Field label="What is this about?">
                    <select className="hm-input" value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}><option value="">Choose…</option>{list(cats.data).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                </Field>
                <Field label="Subject"><input className="hm-input" maxLength={255} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
                <Field label="Message"><textarea className="hm-input" rows={6} maxLength={5000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
                <Field label="Urgency"><select className="hm-input" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></Field>
            </Sheet>
            <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail?.subject || ""} full>
                {detail && <>
                    <p className="whitespace-pre-wrap text-[15px]">{detail.message}</p>
                    <h3 className="hm-label mt-5">Replies</h3>
                    {!detail.replies?.length && <p className="text-sm" style={{ color: "var(--mut)" }}>No reply yet. Your pastor has been notified.</p>}
                    {detail.replies?.map((r) => <div key={r.id} className="hm-card p-3 mt-2"><div className="text-xs font-bold">{r.user?.name || "Pastor"} · <span style={{ color: "var(--mut)" }}>{formatWhen(r.created_at)}</span></div><p className="text-sm mt-1 whitespace-pre-wrap">{r.message || r.body}</p></div>)}
                </>}
            </Sheet>
        </div>
    );
}

// ── Personal details + photo ──────────────────────────────────────────────────────────────────
export function PhotoPicker({ onDone, size = 120, label = "Choose a photo" }) {
    const ref = useRef(null);
    const { user, updateUser } = useUser();
    const [busy, setBusy] = useState(false);
    const upload = async (file) => {
        if (!file) return;
        setBusy(true);
        try {
            const small = await compressImage(file, 900, 0.85);
            const fd = new FormData();
            fd.append("photo", small, "photo.jpg");
            const { data } = await api.post("/profile/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
            updateUser?.({ profile_photo: data?.user?.profile_photo });
            toast("Photo saved", "success");
            onDone?.(data?.user?.profile_photo);
        } catch (e) { toast(errorMessage(e, "Could not upload that photo. Try a smaller one."), "error"); }
        setBusy(false);
    };
    return (
        <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => ref.current?.click()} className="relative rounded-full active:scale-95 transition-transform" aria-label={label}>
                <Avatar user={{ id: user?.id, name: user?.name, avatar: user?.profile_photo }} size={size} />
                <span className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: "var(--accent)" }}><Camera size={19} /></span>
            </button>
            <input ref={ref} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
            <Btn variant={user?.profile_photo ? "soft" : "primary"} size="sm" loading={busy} onClick={() => ref.current?.click()}>{user?.profile_photo ? "Change photo" : label}</Btn>
        </div>
    );
}

export function PersonalScreen() {
    const { user, updateUser } = useUser();
    const qc = useQueryClient();
    const m = user?.member || {};
    const [f, setF] = useState({ name: user?.name || "", phone: user?.phone || "", dob: (m.date_of_birth || user?.date_of_birth || "").slice?.(0, 10) || "", city: user?.city || "", address: user?.address_line_1 || "" });
    const save = useMutation({
        mutationFn: () => api.put("/members/me/profile", { user: { name: f.name, phone: f.phone || null, city: f.city || null, address_line_1: f.address || null }, member: { date_of_birth: f.dob || null } }),
        onSuccess: () => { toast("Details saved", "success"); updateUser?.({ name: f.name, phone: f.phone }); qc.invalidateQueries({ queryKey: ["bootstrap"] }); },
        onError: (e) => toast(errorMessage(e), "error"),
    });
    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Personal details" />
            <Body>
                <div className="py-4"><PhotoPicker /></div>
                <Field label="Full name"><input className="hm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
                <Field label="Phone"><input className="hm-input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>
                <Field label="Date of birth"><input className="hm-input" type="date" max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
                <Field label="Address"><input className="hm-input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} autoComplete="street-address" /></Field>
                <Field label="City"><input className="hm-input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} autoComplete="address-level2" /></Field>
                <Btn block loading={save.isPending} disabled={f.name.trim().length < 2} onClick={() => save.mutate()}>Save details</Btn>
            </Body>
        </div>
    );
}

// ── Mandatory profile photo ───────────────────────────────────────────────────────────────────
export function PhotoGate() {
    const { user } = useUser();
    if (!user || user.profile_photo) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5" style={{ background: "rgba(8,16,32,.82)", backdropFilter: "blur(6px)" }} role="dialog" aria-modal="true" aria-label="Add your profile photo">
            <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "var(--surface, #fff)", color: "var(--ink, #0f172a)" }}>
                <ChurchIcon size={28} className="mx-auto" style={{ color: "var(--accent, #2f6bff)" }} />
                <h2 className="text-xl font-extrabold mt-2">Add your profile photo</h2>
                <p className="text-sm mt-1 mb-5" style={{ color: "var(--mut, #64748b)" }}>Everyone in the church family shows their face: it appears on your ID card, posts and messages. It takes a few seconds.</p>
                <PhotoPicker label="Take or choose a photo" />
            </div>
        </div>
    );
}
