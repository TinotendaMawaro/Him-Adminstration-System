import React, { useRef, useState } from "react";
import api from "../lib/api.js";
import { compressImage, uploadErrorMessage } from "../lib/image.js";
import { useUser } from "../context/UserContext.jsx";

/**
 * Pastors and HODs must have a profile photo: it appears on their ID card and next to everything they post.
 * Until one is uploaded this full-screen prompt stays up (the app has its own version for members).
 */
export default function ProfilePhotoGate() {
    const { user, updateUser } = useUser();
    const ref = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState(null);

    if (!user || user.profile_photo) return null;

    const upload = async (file) => {
        if (!file) return;
        setError("");
        setPreview(URL.createObjectURL(file));
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append("photo", await compressImage(file, 1000, 0.85));
            const { data } = await api.post("/profile/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
            updateUser?.({ profile_photo: data?.user?.profile_photo });
        } catch (e) {
            setError(uploadErrorMessage(e));
            setPreview(null);
        }
        setBusy(false);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="photo-gate-title">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
                <button type="button" onClick={() => ref.current?.click()} className="relative mx-auto block h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white ring-4 ring-amber-300/60" aria-label="Choose a photo">
                    {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="text-4xl font-bold">{(user.name || "?").charAt(0).toUpperCase()}</span>}
                </button>
                <h2 id="photo-gate-title" className="mt-4 text-xl font-extrabold text-slate-900">Add your profile photo</h2>
                <p className="mt-1 text-sm text-slate-500">Your photo appears on your ID card and in the church community. Please add one to continue.</p>
                {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <input ref={ref} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">
                    {busy ? "Uploading…" : "Take or choose a photo"}
                </button>
            </div>
        </div>
    );
}
