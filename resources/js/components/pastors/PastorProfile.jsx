import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import ProfilePictureUpload from "../ProfilePictureUpload";

const TITLES = ["Pastor", "Apostle", "Prophet", "Evangelist", "Bishop", "Reverend", "Dr", "Mr", "Mrs", "Ms"];
const FIELD = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 md:text-sm";
const READONLY = "w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base text-gray-600 md:text-sm";

const Section = ({ title, children }) => (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
);

const Label = ({ label, wide, children }) => (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
        <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
        {children}
    </label>
);

/** The pastor's own profile: all their details, editable, with the photo picked from the gallery. */
export default function PastorProfile({ user, onUpdate }) {
    const qc = useQueryClient();
    const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["pastor-profile"], queryFn: async () => (await api.get("/pastors/profile")).data.data });
    const [f, setF] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => { if (data) setF({ ...data }); }, [data]);

    const save = useMutation({
        mutationFn: async () => (await api.put("/pastors/profile", f)).data.data,
        onSuccess: (d) => {
            qc.setQueryData(["pastor-profile"], d);
            onUpdate?.({ ...user, name: d.full_name, email: d.email, phone: d.phone, address: d.address });
            setMsg({ ok: true, text: "Your profile was saved." });
        },
        onError: (e) => {
            const errs = e.response?.data?.errors;
            setMsg({ ok: false, text: errs ? Object.values(errs).flat()[0] : e.response?.data?.message || "We could not save your profile. Please try again." });
        },
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your profile…</div>;
    if (isError || !f) return <div className="p-8 text-center"><p className="text-gray-600">We could not load your profile.</p><button onClick={() => refetch()} className="mt-3 rounded-xl bg-blue-900 px-5 py-2 font-semibold text-white">Try again</button></div>;

    const set = (k) => (e) => { setMsg(null); setF((p) => ({ ...p, [k]: e.target.value })); };
    const input = (k, props = {}) => <input className={FIELD} value={f[k] ?? ""} onChange={set(k)} {...props} />;

    return (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <ProfilePictureUpload currentPic={data?.photo || user?.profile_photo} onUpdate={(pic) => { onUpdate?.({ ...user, profile_photo: pic }); qc.invalidateQueries({ queryKey: ["pastor-profile"] }); }} />
                <p className="text-xl font-bold text-gray-900">{data.full_name}</p>
                <p className="text-sm text-gray-500">{data.position} · {data.zone || "No zone yet"}</p>
                {data.roles.length > 0 && <div className="flex flex-wrap justify-center gap-1.5">{data.roles.map((r) => <span key={r} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">{r}</span>)}</div>}
                <p className="text-xs text-gray-400">Pastor code {data.code}</p>
            </div>

            <Section title="Personal details">
                <Label label="Title"><select className={FIELD} value={f.title || "Pastor"} onChange={set("title")}>{TITLES.map((t) => <option key={t}>{t}</option>)}</select></Label>
                <Label label="Date of birth">{input("date_of_birth", { type: "date", max: new Date().toISOString().slice(0, 10) })}</Label>
                <Label label="First name">{input("first_name", { required: true, autoComplete: "given-name" })}</Label>
                <Label label="Surname">{input("surname", { required: true, autoComplete: "family-name" })}</Label>
                <Label label="Email address">{input("email", { type: "email", required: true, autoComplete: "email" })}</Label>
                <Label label="Phone number">{input("phone", { type: "tel", autoComplete: "tel" })}</Label>
                <Label label="Home address" wide>{input("address")}</Label>
            </Section>

            <Section title="Where you serve">
                <Label label="Zone"><div className={READONLY}>{data.zone || "—"}{data.zone_code ? ` (${data.zone_code})` : ""}</div></Label>
                <Label label="Region"><div className={READONLY}>{data.region || "—"}</div></Label>
                <Label label="Country"><div className={READONLY}>{data.country || "—"}</div></Label>
                <Label label="Position in the church, department or zone">{input("position", { placeholder: "e.g. Pastor in Charge, Youth leader" })}</Label>
                <p className="text-xs text-gray-400 sm:col-span-2">Zone, region and country are set by head office. Ask them if they need to change.</p>
            </Section>

            <Section title="Next of kin">
                <Label label="Full name">{input("next_of_kin_name")}</Label>
                <Label label="Relationship">{input("next_of_kin_relationship", { placeholder: "e.g. Spouse, Brother" })}</Label>
                <Label label="Phone number" wide>{input("next_of_kin_phone", { type: "tel" })}</Label>
            </Section>

            <Section title="Qualifications">
                <Label label="Qualifications and training" wide><textarea className={FIELD} rows={4} value={f.qualifications ?? ""} onChange={set("qualifications")} placeholder="Theology degrees, certificates, courses…" /></Label>
            </Section>

            {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
            <button type="submit" disabled={save.isPending} className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
                {save.isPending ? "Saving…" : "Save my profile"}
            </button>
        </form>
    );
}
