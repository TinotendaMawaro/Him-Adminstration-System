import React from "react";
import { Download, ShieldCheck, Smartphone } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import "./authAnimations.css";

// Hosted on Vercel Blob so the 30 MB file stays out of the website bundle.
const APK = "https://v0doujhmrwvyr9wc.public.blob.vercel-storage.com/downloads/Heartfelt-Community.apk?download=1";

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

/** Where "Join" on the website lands: members and partners use the mobile app, so this walks them through installing it. */
export default function DownloadPage() {
    const ios = isIos();
    const steps = [
        "Tap “Download the app” below. Your phone may ask to allow downloads from your browser: allow it.",
        "Open the downloaded file “Heartfelt-Community.apk” and tap Install. If asked, allow installing from this source.",
        "Open Heartfelt Community and tap Join to create your account with your zone code, or Sign in if you already have one.",
    ];
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070f1d] px-4 py-10 font-sans text-white">
            <AnimatedBackground />
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 50% at 15% 10%, rgba(47,107,255,.28), transparent 70%), radial-gradient(50% 45% at 90% 95%, rgba(201,168,76,.22), transparent 70%)" }} />
            <main className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
                <img src="/images/logo.webp" alt="Heartfelt International Ministries" className="logo-shake h-28 w-auto object-contain" />
                <h1 className="mt-6 text-3xl font-extrabold" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>Join us on the app</h1>
                <p className="mt-2 text-slate-300">Members and partners use the Heartfelt Community mobile app. Install it to join the church family, give, watch and stay connected.</p>

                <div className="mt-7 w-full rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-left backdrop-blur-2xl">
                    <a href={APK} download className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 font-bold shadow-lg shadow-blue-900/40 transition hover:-translate-y-0.5">
                        <Download size={20} /> Download the app (Android)
                    </a>
                    {ios && <p className="mt-3 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-200">The iPhone version is coming soon. For now please use an Android phone, or ask your pastor for help.</p>}
                    <ol className="mt-5 space-y-3">
                        {steps.map((t, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-200">
                                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-300/20 text-xs font-bold text-amber-200">{i + 1}</span>{t}
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="mt-5 flex items-start gap-2 text-left text-xs text-slate-400"><ShieldCheck size={16} className="mt-0.5 flex-none text-emerald-300" /> The app is only available from this website. Never install it from anywhere else, and never share your password.</div>
                <div className="mt-2 flex items-start gap-2 text-left text-xs text-slate-400"><Smartphone size={16} className="mt-0.5 flex-none text-sky-300" /> Pastors sign in on the website. Everyone else, including heads of department, uses the app.</div>
                <a href="/login" className="mt-6 text-sm font-semibold text-amber-200 underline underline-offset-4">← Back to sign in</a>
            </main>
        </div>
    );
}
