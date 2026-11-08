import api from "../lib/api.js";

/** Where uploaded files live. Empty on the web (same origin); the server's address inside a native app. */
export const ASSET_ORIGIN = import.meta.env.VITE_ASSET_ORIGIN || "";
export const storageUrl = (path) => (path ? `${ASSET_ORIGIN}/storage/${String(path).replace(/^\/+/, "")}` : null);
export const absUrl = (u) => (u && u.startsWith("/") ? ASSET_ORIGIN + u : u);

/** Thin, typed-by-convention wrappers over the community / channels / market API (same login and database as the web portals). */
const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body || {})).data;
const put = async (url, body) => (await api.put(url, body || {})).data;
const del = async (url) => (await api.delete(url)).data;

export const errorMessage = (e, fallback = "Something went wrong. Please try again.") => {
    const d = e?.response?.data;
    if (d?.errors) return Object.values(d.errors).flat()[0];
    if (e?.response?.status === 429) return "You're going a little fast. Please wait a moment.";
    return d?.message || (e?.message === "Network Error" ? "No connection. Check your internet and try again." : fallback);
};

export const community = {
    bootstrap: () => get("/community/bootstrap"),
    feed: (params) => get("/community/feed", params),
    shorts: (page) => get("/community/shorts", { page }),
    bookmarks: (page) => get("/community/bookmarks", { page }),
    explore: () => get("/community/explore"),
    search: (q) => get("/community/search", { q }),
    post: (id) => get(`/community/posts/${id}`),
    createPost: (body) => post("/community/posts", body),
    deletePost: (id) => del(`/community/posts/${id}`),
    like: (id) => post(`/community/posts/${id}/like`),
    bookmark: (id) => post(`/community/posts/${id}/bookmark`),
    repost: (id) => post(`/community/posts/${id}/repost`),
    vote: (id, option) => post(`/community/posts/${id}/vote`, { option }),
    view: (id) => post(`/community/posts/${id}/view`).catch(() => {}),
    pin: (id) => post(`/community/posts/${id}/pin`),
    comments: (id) => get(`/community/posts/${id}/comments`),
    addComment: (id, body, parent_id) => post(`/community/posts/${id}/comments`, { body, parent_id }),
    deleteComment: (id) => del(`/community/comments/${id}`),
    likeComment: (id) => post(`/community/comments/${id}/like`),
    stories: () => get("/community/stories"),
    createStory: (body) => post("/community/stories", body),
    viewStory: (id) => post(`/community/stories/${id}/view`).catch(() => {}),
    deleteStory: (id) => del(`/community/stories/${id}`),
    me: () => get("/community/me"),
    updateMe: (body) => put("/community/me", body),
    profile: (id) => get(`/community/users/${id}`),
    follow: (id) => post(`/community/users/${id}/follow`),
    block: (id) => post(`/community/users/${id}/block`),
    people: (id, type) => get(`/community/users/${id}/people`, { type }),
    report: (type, id, reason, details) => post("/community/report", { type, id, reason, details }),
    uploadImage: async (file) => {
        const form = new FormData();
        form.append("image", file);
        return (await api.post("/community/media", form, { headers: { "Content-Type": "multipart/form-data" } })).data;
    },
};

export const channels = {
    list: (params) => get("/channels", params),
    create: (body) => post("/channels", body),
    show: (id) => get(`/channels/${id}`),
    update: (id, body) => put(`/channels/${id}`, body),
    remove: (id) => del(`/channels/${id}`),
    join: (id) => post(`/channels/${id}/join`),
    leave: (id) => post(`/channels/${id}/leave`),
    members: (id, status) => get(`/channels/${id}/members`, { status }),
    decide: (id, userId, action) => post(`/channels/${id}/members/${userId}`, { action }),
    posts: (id, page) => get(`/channels/${id}/posts`, { page }),
    messages: (id, since) => get(`/channels/${id}/messages`, { since }),
    say: (id, body) => post(`/channels/${id}/messages`, { body }),
    goals: (id) => get(`/channels/${id}/goals`),
    createGoal: (id, body) => post(`/channels/${id}/goals`, body),
    updateGoal: (goalId, body) => put(`/goals/${goalId}`, body),
    meetings: (id) => get(`/channels/${id}/meetings`),
    createMeeting: (id, body) => post(`/channels/${id}/meetings`, body),
    rsvp: (meetingId, status) => post(`/meetings/${meetingId}/rsvp`, { status }),
    cancelMeeting: (meetingId) => del(`/meetings/${meetingId}`),
};

export const watch = {
    teachings: (series) => get("/watch/teachings", series ? { series } : undefined),
    viewTeaching: (id) => post(`/watch/teachings/${id}/view`).catch(() => {}),
    live: () => get("/watch/live"),
    schedule: (body) => post("/watch/live", body),
    remind: (id) => post(`/watch/live/${id}/remind`),
    setStatus: (id, status) => put(`/watch/live/${id}/status`, { status }),
};

export const market = {
    meta: () => get("/market/meta"),
    listings: (params) => get("/market/listings", params),
    mine: () => get("/market/listings/mine"),
    listing: (id) => get(`/market/listings/${id}`),
    save: (body, id) => (id ? put(`/market/listings/${id}`, body) : post("/market/listings", body)),
    remove: (id) => del(`/market/listings/${id}`),
    order: (id, body) => post(`/market/listings/${id}/order`, body),
    orders: (as, status) => get("/market/orders", { as, status }),
    setOrder: (id, status, note) => put(`/market/orders/${id}`, { status, note }),
    askQuote: (id, body) => post(`/market/listings/${id}/quote`, body),
    quotes: (as) => get("/market/quotes", { as }),
    answerQuote: (id, body) => put(`/market/quotes/${id}`, body),
};

// ── Small helpers ───────────────────────────────────────────────────────────────────────────────

export function timeAgo(iso) {
    if (!iso) return "";
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 45) return "now";
    if (s < 3600) return `${Math.round(s / 60)}m`;
    if (s < 86400) return `${Math.round(s / 3600)}h`;
    if (s < 86400 * 7) return `${Math.round(s / 86400)}d`;
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatWhen(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function compact(n) {
    n = Number(n || 0);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
}

export function money(amount, currency = "USD") {
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency} ${Number(amount).toFixed(2)}`;
    }
}

export const haptic = (ms = 10) => {
    try { navigator.vibrate?.(ms); } catch { /* not supported */ }
};

/** Resize + re-encode a photo in the browser before upload (phones take 5-10 MB pictures). */
export async function compressImage(file, maxSide = 1600, quality = 0.82) {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    return new File([blob], (file.name || "photo").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
