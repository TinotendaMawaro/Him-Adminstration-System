import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * A tiny native-style navigator: five tabs that stay mounted (so scroll positions survive), plus a stack of full-screen
 * pages that slide over them. The browser / Android back button pops the stack instead of leaving the app.
 *
 * The stack is updated immediately by our own actions; the browser history is kept in step silently. `pending` counts the
 * history moves WE caused, so the matching popstate events are ignored (otherwise "Back" followed quickly by a tab tap
 * would step back twice and leave the app).
 */
const NavCtx = createContext(null);
export const useNav = () => useContext(NavCtx);

export function NavProvider({ children }) {
    const [tab, setTabState] = useState("home");
    const [stack, setStack] = useState([]);
    const frameRef = useRef(null);
    const depth = useRef(0);
    const pending = useRef(0);
    const [exitPrompt, setExitPrompt] = useState(false);
    const tabRef = useRef("home");
    tabRef.current = tab;

    const push = useCallback((name, props = {}) => {
        try { window.history.pushState({ hm: depth.current + 1 }, "", window.location.href); } catch { /* ignore */ }
        depth.current += 1;
        setStack((s) => [...s, { id: `${Date.now()}-${Math.random()}`, name, props }]);
    }, []);

    const pop = useCallback(() => {
        if (depth.current <= 0) return;
        depth.current -= 1;
        pending.current += 1;
        setStack((s) => s.slice(0, -1));
        window.history.back();
    }, []);

    const replace = useCallback((name, props = {}) => {
        setStack((s) => [...s.slice(0, -1), { id: `${Date.now()}-${Math.random()}`, name, props }]);
    }, []);

    const reset = useCallback(() => {
        const n = depth.current;
        if (n <= 0) return;
        depth.current = 0;
        pending.current += 1;       // history.go(-n) fires one popstate
        setStack([]);
        window.history.go(-n);
    }, []);

    const setTab = useCallback((t) => {
        setTabState((cur) => {
            if (cur === t) document.querySelector(`[data-tab-scroll="${t}"]`)?.scrollTo({ top: 0, behavior: "smooth" });   // tapping the active tab scrolls to top
            return t;
        });
        reset();
    }, [reset]);

    // Back at the very first screen would close the app: ask first. (Other tabs go back to Home first.)
    const handleRootBack = useCallback(() => {
        if (tabRef.current !== "home") { setTabState("home"); return; }
        setExitPrompt(true);
    }, []);

    useEffect(() => {
        try { window.history.pushState({ hmRoot: true }, "", window.location.href); } catch { /* ignore */ }   // the "stay" entry
        const onPop = () => {
            if (pending.current > 0) { pending.current -= 1; return; }       // caused by our own pop()/reset()
            if (depth.current > 0) {                                          // the person pressed the browser / Android back button
                depth.current -= 1;
                setStack((s) => s.slice(0, -1));
                return;
            }
            try { window.history.pushState({ hmRoot: true }, "", window.location.href); } catch { /* ignore */ }   // stay in the app
            handleRootBack();
        };
        window.addEventListener("popstate", onPop);

        // Installed Android app: the hardware back button comes through Capacitor instead of popstate.
        let handle;
        import("@capacitor/app").then(({ App }) => {
            App.addListener("backButton", () => {
                if (depth.current > 0) { depth.current -= 1; pending.current += 1; setStack((s) => s.slice(0, -1)); window.history.back(); return; }
                handleRootBack();
            }).then((h) => { handle = h; });
        }).catch(() => { /* running in a normal browser */ });

        return () => { window.removeEventListener("popstate", onPop); handle?.remove?.(); };
    }, [handleRootBack]);

    const leaveApp = useCallback(async () => {
        setExitPrompt(false);
        try { const { App } = await import("@capacitor/app"); await App.exitApp(); return; } catch { /* not the installed app */ }
        window.history.go(-2);       // browser / PWA: step back out of the app
    }, []);

    const value = useMemo(() => ({ tab, setTab, stack, push, pop, replace, frameRef, exitPrompt, setExitPrompt, leaveApp }), [tab, setTab, stack, push, pop, replace, exitPrompt, leaveApp]);

    return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}
