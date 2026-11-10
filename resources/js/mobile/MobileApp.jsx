import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home as HomeIcon, PlaySquare, ShoppingBag, User, Users, WifiOff } from "lucide-react";
import "./mobile.css";
import { DarkProvider, Toaster, useDark, cx } from "./ui.jsx";
import { ChurchHub, DepartmentScreen, HomeGroupScreen, PersonalScreen, PhotoGate, PrayerScreen } from "./Church.jsx";
import { NavProvider, useNav } from "./nav.jsx";
import Home, { Explore, HashtagScreen, PostScreen } from "./Home.jsx";
import Watch from "./Watch.jsx";
import Channels, { ChannelScreen } from "./Channels.jsx";
import Market, { ListingEditor, ListingScreen, OrdersScreen, ShopScreen } from "./Market.jsx";
import Me, { EditProfile, EventsScreen, IdCardScreen, PartnerInfo, ProfileScreen, SavedScreen } from "./Me.jsx";
import NotificationsScreen from "./Notifications.jsx";
import { setTitleBadge, showAlert } from "../lib/alerts.js";
import { community } from "./lib.js";

const TABS = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "watch", label: "Watch", icon: PlaySquare },
    { id: "channels", label: "Channels", icon: Users },
    { id: "market", label: "Market", icon: ShoppingBag },
    { id: "me", label: "Me", icon: User },
];

function Shell({ onLogout }) {
    const nav = useNav();
    const { dark } = useDark();
    const [visited, setVisited] = useState({ home: true });
    const [offline, setOffline] = useState(!navigator.onLine);
    const bootQ = useQuery({ queryKey: ["bootstrap"], queryFn: community.bootstrap, staleTime: 30_000, refetchInterval: 60_000, refetchOnWindowFocus: true });
    const boot = bootQ.data?.data;
    const deepLinked = useRef(false);

    // New notification since the last check: show the count in the tab title and, if allowed, alert the device.
    const lastUnread = useRef(null);
    useEffect(() => {
        const n = boot?.unread_notifications;
        if (n == null) return;
        setTitleBadge(n);
        if (lastUnread.current != null && n > lastUnread.current) showAlert("Heartfelt", `You have ${n} unread notification${n > 1 ? "s" : ""}`, () => nav.push("notifications"));
        lastUnread.current = n;
    }, [boot?.unread_notifications]);   // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { setVisited((v) => (v[nav.tab] ? v : { ...v, [nav.tab]: true })); }, [nav.tab]);

    useEffect(() => {
        const on = () => setOffline(false), off = () => setOffline(true);
        window.addEventListener("online", on); window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);

    // Links like /?post=12 or /?channel=3 open the right screen straight away.
    useEffect(() => {
        if (deepLinked.current || !boot) return;
        deepLinked.current = true;
        const q = new URLSearchParams(window.location.search);
        const tab = q.get("tab");
        if (TABS.some((t) => t.id === tab)) nav.setTab(tab);          // home-screen shortcuts: /?tab=watch
        const map = [["post", "post"], ["channel", "channel"], ["listing", "listing"], ["u", "profile"]];
        for (const [key, screen] of map) {
            const id = Number(q.get(key));
            if (id > 0) { nav.push(screen, { id }); window.history.replaceState({ ...window.history.state }, "", window.location.pathname); break; }
        }
    }, [boot]);   // eslint-disable-line react-hooks/exhaustive-deps

    const screens = useMemo(() => ({
        profile: (p) => <ProfileScreen {...p} />, channel: (p) => <ChannelScreen {...p} />, listing: (p) => <ListingScreen {...p} />, "listing-edit": (p) => <ListingEditor {...p} />,
        orders: (p) => <OrdersScreen {...p} />, shop: () => <ShopScreen />, explore: () => <Explore />, hashtag: (p) => <HashtagScreen {...p} />, post: (p) => <PostScreen {...p} />,
        notifications: () => <NotificationsScreen />, saved: () => <SavedScreen />, events: () => <EventsScreen />, idcard: () => <IdCardScreen />, "edit-profile": () => <EditProfile />,
        "partner-info": () => <PartnerInfo />, church: () => <ChurchHub />, homegroup: () => <HomeGroupScreen />, department: () => <DepartmentScreen />, prayer: () => <PrayerScreen />, personal: () => <PersonalScreen />,
    }), []);

    const badges = { watch: boot?.live_now || 0, me: boot?.unread_notifications || 0 };

    return (
        <div className={cx("hm-app", dark && "dark")}>
            <div className="hm-root">
                <div className="hm-frame" ref={nav.frameRef}>
                    {offline && <div className="flex items-center justify-center gap-2 text-xs font-bold py-1.5 text-white z-50 hm-safe-top" style={{ background: "#b45309" }}><WifiOff size={14} />You're offline. Showing what was loaded earlier.</div>}

                    <div className="flex-1 min-h-0 relative">
                        {TABS.map((t) => visited[t.id] && (
                            <div key={t.id} className="absolute inset-0 flex-col" style={{ display: nav.tab === t.id ? "flex" : "none" }}>
                                {t.id === "home" && <Home boot={boot} />}
                                {t.id === "watch" && <Watch boot={boot} />}
                                {t.id === "channels" && <Channels />}
                                {t.id === "market" && <Market boot={boot} />}
                                {t.id === "me" && <Me boot={boot} onLogout={onLogout} />}
                            </div>
                        ))}

                        {nav.stack.map((s) => <div key={s.id} className="hm-screen">{screens[s.name]?.(s.props) ?? null}</div>)}
                    </div>

                    <nav className="hm-tabbar hm-glass" role="tablist" aria-label="Main">
                        {TABS.map((t) => (
                            <button key={t.id} role="tab" aria-selected={nav.tab === t.id} className="hm-tab" data-on={nav.tab === t.id} onClick={() => nav.setTab(t.id)}>
                                <t.icon size={23} strokeWidth={nav.tab === t.id ? 2.4 : 2} />
                                {t.label}
                                {badges[t.id] > 0 && <span className="hm-tab-dot">{badges[t.id] > 9 ? "9+" : badges[t.id]}</span>}
                            </button>
                        ))}
                    </nav>
                    <PhotoGate />
                    <Toaster />
                </div>
            </div>
        </div>
    );
}

/** The member / partner experience as a mobile app: community, watch, channels, marketplace, and your church life. */
export default function MobileApp({ onLogout }) {
    useEffect(() => {
        // Installable + fast to open: the service worker keeps the app shell and build files (never any private data).
        if ("serviceWorker" in navigator && import.meta.env.PROD) navigator.serviceWorker.register("/sw.js").catch(() => {});
        document.documentElement.style.overscrollBehavior = "none";
        const meta = document.querySelector('meta[name="theme-color"]') || Object.assign(document.head.appendChild(document.createElement("meta")), { name: "theme-color" });
        const prev = meta.content; meta.content = "#0f2744";
        return () => { document.documentElement.style.overscrollBehavior = ""; meta.content = prev; };
    }, []);
    return (
        <DarkProvider>
            <NavProvider>
                <Shell onLogout={onLogout} />
            </NavProvider>
        </DarkProvider>
    );
}
