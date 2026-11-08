import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Film, Image as ImageIcon, Link2, Plus, Type, X, Users, Clapperboard, Loader2 } from "lucide-react";
import { Sheet, Btn, Chip, toast, Avatar, cx } from "./ui.jsx";
import { channels, community, compressImage, errorMessage, haptic, storageUrl } from "./lib.js";
import { useUser } from "../context/UserContext.jsx";

const YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([A-Za-z0-9_-]{11})/i;
const ytId = (u) => (u.match(YT) || [])[1];

/**
 * Create a post: text, photos (picked from the phone, resized and uploaded), a YouTube/Vimeo video, a short, or a poll,
 * optionally inside one of your channels.
 */
export default function Composer({ open, onClose, onPosted, channelId: presetChannel, initialKind = "text" }) {
    const { user } = useUser();
    const [kind, setKind] = useState(initialKind);
    const [body, setBody] = useState("");
    const [images, setImages] = useState([]);           // [{url}]
    const [uploading, setUploading] = useState(0);
    const [video, setVideo] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [hours, setHours] = useState(24);
    const [channelId, setChannelId] = useState(presetChannel || "");
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    const { data: mine } = useQuery({ queryKey: ["my-channels"], queryFn: () => channels.list({ scope: "mine" }), enabled: open && !presetChannel, staleTime: 60_000 });
    const myChannels = (mine?.data || []).filter((c) => c.my_status === "active");

    const reset = () => { setBody(""); setImages([]); setVideo(""); setOptions(["", ""]); setKind("text"); };
    const vid = ytId(video);
    const validVideo = vid || /vimeo\.com\/\d{6,12}/i.test(video);
    const pollOk = options.map((o) => o.trim()).filter(Boolean).length >= 2;
    const canPost = !busy && !uploading && (
        kind === "poll" ? body.trim() && pollOk
        : kind === "photo" ? images.length > 0
        : kind === "video" || kind === "short" ? validVideo
        : body.trim().length > 0);

    const pick = async (files) => {
        const list = Array.from(files || []).slice(0, 4 - images.length);
        for (const f of list) {
            setUploading((n) => n + 1);
            try {
                const small = await compressImage(f);
                const r = await community.uploadImage(small);
                setImages((s) => [...s, { url: r.url }]);
            } catch (e) { toast.error(errorMessage(e, "That photo couldn't be uploaded.")); } finally { setUploading((n) => n - 1); }
        }
    };

    const submit = async () => {
        setBusy(true); haptic(15);
        const payload = { body: body.trim() || undefined, channel_id: presetChannel || channelId || undefined };
        if (kind === "photo") payload.media_urls = images.map((i) => i.url);
        if (kind === "video" || kind === "short") { payload.media_urls = [video.trim()]; if (kind === "short") payload.kind = "short"; }
        if (kind === "poll") payload.poll = { options: options.map((o) => o.trim()).filter(Boolean), hours };
        try {
            const r = await community.createPost(payload);
            toast.success(presetChannel || channelId ? "Posted to the channel" : "Posted!");
            reset(); onPosted?.(r.data); onClose();
        } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };

    const tools = [["text", "Text", Type], ["photo", "Photo", ImageIcon], ["video", "Video", Film], ["short", "Short", Clapperboard], ["poll", "Poll", BarChart3]];

    return (
        <Sheet open={open} onClose={onClose} full title="New post"
            footer={<div className="flex items-center gap-3"><div className="text-xs font-semibold flex-1" style={{ color: body.length > 1900 ? "var(--danger)" : "var(--mut)" }}>{body.length}/2000</div><Btn loading={busy} disabled={!canPost} onClick={submit} className="px-8">Post</Btn></div>}>
            <div className="flex items-start gap-3 pt-1">
                <Avatar user={{ id: user?.id, name: user?.name, avatar: storageUrl(user?.profile_photo) }} size={44} />
                <textarea autoFocus value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} rows={kind === "text" ? 6 : 3}
                    placeholder={kind === "poll" ? "Ask a question…" : "What's on your heart? Use #hashtags and @mentions"} className="flex-1 bg-transparent outline-none resize-none text-[17px] leading-relaxed pt-2" style={{ minHeight: 90 }} />
            </div>

            <div className="flex gap-2 overflow-x-auto hm-hide-scroll py-2 -mx-1 px-1">{tools.map(([v, l, I]) => <Chip key={v} on={kind === v} icon={I} onClick={() => setKind(v)}>{l}</Chip>)}</div>

            {kind === "photo" && (
                <div className="mt-2">
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((im, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden"><img src={im.url} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.6)", color: "#fff" }} aria-label="Remove"><X size={14} /></button></div>
                        ))}
                        {Array.from({ length: uploading }).map((_, i) => <div key={`u${i}`} className="aspect-square rounded-2xl flex items-center justify-center hm-skel"><Loader2 className="animate-spin" size={20} /></div>)}
                        {images.length + uploading < 4 && (
                            <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold" style={{ border: "2px dashed var(--line)", color: "var(--mut)" }}><Plus size={22} />Add</button>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
                    <p className="text-xs mt-2" style={{ color: "var(--mut)" }}>Up to 4 photos. They're resized on your phone before uploading.</p>
                </div>
            )}

            {(kind === "video" || kind === "short") && (
                <div className="mt-2 space-y-3">
                    <label className="hm-label">YouTube or Vimeo link</label>
                    <div className="relative"><Link2 size={18} className="absolute left-3.5 top-3.5" style={{ color: "var(--mut)" }} /><input className="hm-input" style={{ paddingLeft: 40 }} placeholder="https://youtu.be/…" value={video} onChange={(e) => setVideo(e.target.value)} inputMode="url" /></div>
                    {vid && <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: kind === "short" ? "9/12" : "16/9", maxHeight: 280 }}><img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" /></div>}
                    {video && !validVideo && <p className="text-xs" style={{ color: "var(--danger)" }}>Only YouTube and Vimeo links can be shared.</p>}
                </div>
            )}

            {kind === "poll" && (
                <div className="mt-2 space-y-2">
                    {options.map((o, i) => (
                        <div key={i} className="flex gap-2"><input className="hm-input" placeholder={`Option ${i + 1}`} maxLength={60} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} />{options.length > 2 && <button className="hm-icon-btn" onClick={() => setOptions(options.filter((_, j) => j !== i))} aria-label="Remove option"><X size={18} /></button>}</div>
                    ))}
                    {options.length < 4 && <Btn variant="soft" size="sm" icon={Plus} onClick={() => setOptions([...options, ""])}>Add option</Btn>}
                    <div><label className="hm-label mt-2">Poll length</label><select className="hm-input" value={hours} onChange={(e) => setHours(+e.target.value)}>{[[1, "1 hour"], [6, "6 hours"], [24, "1 day"], [72, "3 days"], [168, "7 days"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                </div>
            )}

            {!presetChannel && myChannels.length > 0 && (
                <div className="mt-4"><label className="hm-label">Post to</label>
                    <div className="flex gap-2 overflow-x-auto hm-hide-scroll"><Chip on={!channelId} onClick={() => setChannelId("")}>Everyone</Chip>{myChannels.map((c) => <Chip key={c.id} on={channelId === c.id} icon={Users} onClick={() => setChannelId(c.id)}>{c.name}</Chip>)}</div>
                </div>
            )}
        </Sheet>
    );
}
