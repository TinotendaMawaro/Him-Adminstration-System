import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";

const UserContext = createContext(null);

export function UserProvider({ children, initialUser = null, token = null }) {
    const [user, setUser]       = useState(initialUser);
    const [loading, setLoading] = useState(!!token && !initialUser);
    const [error, setError]     = useState(null);

    const refreshUser = useCallback(async () => {
        const savedToken = token || localStorage.getItem("him_token");
        if (!savedToken) return;

        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get("/me");
            const freshUser = data.data ?? data.user ?? data;
            setUser(freshUser);
            localStorage.setItem("him_user", JSON.stringify(freshUser));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const savedToken = localStorage.getItem("him_token");
        if (!savedToken) return;

        if (!initialUser) {
            refreshUser();
        } else {
            (async () => {
                try {
                    const { data } = await api.get("/me");
                    const freshUser = data.data ?? data.user ?? data;
                    setUser(freshUser);
                    localStorage.setItem("him_user", JSON.stringify(freshUser));
                } catch (_) {
                    // silently ignore — cached data is still usable
                }
            })();
        }
    }, []);

    const updateUser = useCallback((partial) => {
        setUser((prev) => {
            const updated = { ...(prev || {}), ...partial };
            localStorage.setItem("him_user", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearUser = useCallback(() => {
        setUser(null);
        setError(null);
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
}

/** Hook — throws if used outside <UserProvider> */
export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        console.warn("useUser called outside UserProvider; returning fallback");
        return {
            user: null,
            loading: false,
            error: null,
            refreshUser: async () => {},
            updateUser: () => {},
            clearUser: () => {},
        };
    }
    return ctx;
}

/** Convenience: just the user object */
export function useCurrentUser() {
    return useUser().user;
}
