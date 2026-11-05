import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

// The card renderer (SVG card + local QR code, PNG/SVG download, print) is one plain script shared with the
// staff portals: public/js/him-idcard.js. Loaded once, on demand.
let libPromise = null;
function loadCardLib() {
    if (window.HIMCard) return Promise.resolve(window.HIMCard);
    libPromise ??= new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "/js/him-idcard.js";
        s.onload = () => resolve(window.HIMCard);
        s.onerror = () => { libPromise = null; reject(new Error("The ID card could not be loaded.")); };
        document.head.appendChild(s);
    });
    return libPromise;
}

/** The signed-in person's ID card: full name, zone, date of birth, number and a scannable QR code. Same for every role. */
export default function IdCardPanel() {
    const stage = useRef(null);
    const [card, setCard] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const { data, isLoading, error: fetchError, refetch } = useQuery({
        queryKey: ["id-card"],
        queryFn: async () => (await api.get("/id-card")).data.data,
        staleTime: 10 * 60 * 1000,
    });

    useEffect(() => {
        if (!data) return;
        let cancelled = false;
        loadCardLib()
            .then((lib) => lib.prepare(data))
            .then((prepared) => { if (!cancelled) setCard(prepared); })
            .catch((e) => { if (!cancelled) setError(e.message || "The ID card could not be drawn."); });
        return () => { cancelled = true; };
    }, [data]);

    useEffect(() => {
        if (card && stage.current) window.HIMCard.mount(stage.current, card);
    }, [card]);

    const fileStem = card ? `HIM-ID-${card.number}` : "HIM-ID";
    const run = useCallback(async (fn) => {
        setBusy(true);
        try { await fn(); } finally { setBusy(false); }
    }, []);

    const btn = "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm" aria-label="My ID card">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">My ID card</h3>
                    <p className="text-sm text-gray-500">Scan the QR code to confirm it is genuine. Download it for your phone or print it at card size.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className={`${btn} bg-amber-500 text-white hover:bg-amber-600`} disabled={!card || busy} onClick={() => run(() => window.HIMCard.downloadPng(card, fileStem))}>
                        Download PNG
                    </button>
                    <button className={`${btn} border border-gray-200 text-gray-700 hover:bg-gray-50`} disabled={!card} onClick={() => window.HIMCard.downloadSvg(card, fileStem)}>
                        Download SVG
                    </button>
                    <button className={`${btn} border border-gray-200 text-gray-700 hover:bg-gray-50`} disabled={!card} onClick={() => window.HIMCard.print(card)}>
                        Print
                    </button>
                </div>
            </header>

            {(fetchError || error) && (
                <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
                    {error || fetchError?.response?.data?.message || "Your ID card could not be loaded."}{" "}
                    <button className="font-semibold underline" onClick={() => { setError(""); refetch(); }}>Try again</button>
                </div>
            )}

            {(isLoading || (data && !card && !error)) && (
                <div className="mt-4 grid gap-4 md:grid-cols-2" aria-busy="true">
                    {[0, 1].map((i) => <div key={i} className="aspect-[856/540] animate-pulse rounded-2xl bg-gray-100" />)}
                </div>
            )}

            <div ref={stage} className="mt-4 grid max-w-4xl gap-4 md:grid-cols-2" />
        </section>
    );
}
