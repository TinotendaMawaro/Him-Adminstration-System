// Shared by the bell, the notifications page and the dashboard strip.

/** A message someone sent opens in the inbox; anything else (a member joined, a report is due…) opens in notifications. */
export const isMessage = (n) => (n?.kind ? n.kind === 'message' : n?.category === 'message');

const STYLES = {
    pastor: { icon: '📣', color: 'from-amber-400 to-orange-500' },
    announcement: { icon: '📢', color: 'from-amber-400 to-orange-500' },
    message: { icon: '✉️', color: 'from-sky-400 to-blue-500' },
    report: { icon: '📊', color: 'from-amber-400 to-orange-500' },
    report_reminder: { icon: '⏰', color: 'from-orange-400 to-red-500' },
    event: { icon: '📅', color: 'from-sky-400 to-blue-500' },
    event_reminder: { icon: '🔔', color: 'from-violet-400 to-purple-500' },
    finance: { icon: '💰', color: 'from-emerald-400 to-green-500' },
    member: { icon: '👤', color: 'from-sky-400 to-blue-500' },
    member_update: { icon: '🔄', color: 'from-cyan-400 to-teal-500' },
    appointment: { icon: '🎖️', color: 'from-purple-400 to-violet-500' },
    system: { icon: '📢', color: 'from-gray-400 to-slate-500' },
};

export const notificationStyle = (category) => STYLES[category] || STYLES.system;

export const timeAgo = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

/** The portal page that a (non-message) notification is about, offered as a shortcut inside the notification. */
export const relatedPage = (n) => {
    const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    if (n.category === 'prayer_center') return { page: 'prayer-center', label: 'Open Prayer Center' };
    if (n.category === 'event_registration' || /event/.test(text)) return { page: 'events', label: 'Open Events' };
    if (/home ?group/.test(text)) return { page: 'homegroups', label: 'Open Home Groups' };
    if (/department|hod/.test(text)) return { page: 'departments', label: 'Open Departments' };
    if (/report/.test(text)) return { page: 'reports', label: 'Open Reports' };
    if (/member|transfer|joined/.test(text)) return { page: 'members', label: 'Open Members' };
    if (/partner|payment|giving/.test(text)) return { page: 'partnership', label: 'Open Partnership' };
    return null;
};
