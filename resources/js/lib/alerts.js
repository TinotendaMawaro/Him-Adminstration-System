// Device alerts for new notifications (works in browsers and the installed app/PWA while it is open).
// Nothing is requested until the person turns alerts on.

const supported = () => typeof window !== "undefined" && "Notification" in window;

export const alertsState = () => (!supported() ? "unsupported" : Notification.permission);   // granted | denied | default | unsupported

export async function enableAlerts() {
    if (!supported()) return "unsupported";
    try { return await Notification.requestPermission(); } catch { return "denied"; }
}

/** Show a system notification for something that just arrived (only if the person allowed it and the app is in the background). */
export function showAlert(title, body, onClick) {
    if (alertsState() !== "granted" || !document.hidden) return false;
    try {
        const n = new Notification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: "him-" + title });
        n.onclick = () => { window.focus(); onClick?.(); n.close(); };
        return true;
    } catch { return false; }
}

/** "(3) Heartfelt": the unread count in the tab title, so it shows even when the tab is hidden. */
export function setTitleBadge(count, base = "Heartfelt International Ministries") {
    document.title = count > 0 ? `(${count > 99 ? "99+" : count}) ${base}` : base;
}
