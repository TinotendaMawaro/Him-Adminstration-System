import React, { useEffect, useRef } from 'react';

export default function Landing() {
    const heroRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.target.classList.add('visible')),
            { threshold: 0.1 }
        );
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --blue-950: #03134a;
                    --blue-900: #0a1f7a;
                    --blue-700: #1a3db5;
                    --blue-500: #2563eb;
                    --blue-400: #3b82f6;
                    --blue-200: #bfdbfe;
                    --blue-50:  #eff6ff;
                    --gold:     #f0c040;
                    --white:    #ffffff;
                    --gray-100: #f1f5f9;
                    --gray-500: #64748b;
                }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: var(--white);
                    color: var(--blue-950);
                    overflow-x: hidden;
                }

                /* ── NAV ── */
                nav {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 1.25rem 4rem;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(37,99,235,0.08);
                }
                .nav-logo {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.4rem; font-weight: 900;
                    color: var(--blue-700);
                    letter-spacing: -0.5px;
                }
                .nav-logo span { color: var(--gold); }
                .nav-links { display: flex; gap: 2.5rem; align-items: center; }
                .nav-links a {
                    font-size: 0.875rem; font-weight: 500; color: var(--gray-500);
                    text-decoration: none; transition: color 0.2s;
                }
                .nav-links a:hover { color: var(--blue-700); }
                .btn-nav {
                    padding: 0.6rem 1.5rem;
                    background: var(--blue-500); color: white;
                    border-radius: 6px; font-size: 0.875rem; font-weight: 500;
                    text-decoration: none; transition: background 0.2s, transform 0.15s;
                }
                .btn-nav:hover { background: var(--blue-700); transform: translateY(-1px); }

                /* ── HERO ── */
                .hero {
                    min-height: 100vh;
                    display: grid; grid-template-columns: 1fr 1fr;
                    align-items: center;
                    padding: 8rem 4rem 4rem;
                    background: linear-gradient(135deg, var(--blue-50) 0%, white 60%);
                    position: relative; overflow: hidden;
                }
                .hero::before {
                    content: '';
                    position: absolute; top: -200px; right: -200px;
                    width: 700px; height: 700px;
                    background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .hero::after {
                    content: '';
                    position: absolute; bottom: -100px; left: 10%;
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(240,192,64,0.06) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .hero-text { position: relative; z-index: 2; }
                .hero-eyebrow {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    font-size: 0.75rem; font-weight: 500; letter-spacing: 0.15em;
                    text-transform: uppercase; color: var(--blue-500);
                    background: var(--blue-50); border: 1px solid var(--blue-200);
                    padding: 0.35rem 1rem; border-radius: 999px; margin-bottom: 1.5rem;
                }
                .hero-eyebrow::before {
                    content: ''; width: 6px; height: 6px;
                    background: var(--blue-400); border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                .hero h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.8rem, 5vw, 4.2rem);
                    font-weight: 900; line-height: 1.1;
                    color: var(--blue-950); margin-bottom: 1.5rem;
                    letter-spacing: -1.5px;
                }
                .hero h1 em {
                    font-style: normal; color: var(--blue-500);
                    position: relative;
                }
                .hero h1 em::after {
                    content: '';
                    position: absolute; bottom: 4px; left: 0; right: 0; height: 3px;
                    background: var(--gold); border-radius: 2px;
                }
                .hero p {
                    font-size: 1.1rem; line-height: 1.75; color: var(--gray-500);
                    max-width: 460px; margin-bottom: 2.5rem;
                }
                .hero-actions { display: flex; gap: 1rem; align-items: center; }
                .btn-primary {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    padding: 0.9rem 2rem;
                    background: var(--blue-500); color: white;
                    border-radius: 8px; font-size: 0.95rem; font-weight: 500;
                    text-decoration: none;
                    box-shadow: 0 4px 24px rgba(37,99,235,0.35);
                    transition: all 0.2s;
                }
                .btn-primary:hover {
                    background: var(--blue-700);
                    box-shadow: 0 8px 32px rgba(37,99,235,0.45);
                    transform: translateY(-2px);
                }
                .btn-secondary {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    padding: 0.9rem 1.75rem;
                    color: var(--blue-700); font-size: 0.95rem; font-weight: 500;
                    text-decoration: none; border-radius: 8px;
                    border: 1.5px solid var(--blue-200);
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: var(--blue-50);
                    border-color: var(--blue-400);
                }

                /* ── HERO VISUAL ── */
                .hero-visual {
                    position: relative; z-index: 2;
                    display: flex; justify-content: center; align-items: center;
                }
                .dashboard-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 32px 80px rgba(3,19,74,0.15), 0 0 0 1px rgba(37,99,235,0.08);
                    padding: 2rem;
                    width: 100%; max-width: 420px;
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 1.5rem;
                }
                .card-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1rem; font-weight: 700; color: var(--blue-950);
                }
                .card-badge {
                    font-size: 0.7rem; font-weight: 500;
                    background: #dcfce7; color: #16a34a;
                    padding: 0.2rem 0.6rem; border-radius: 999px;
                }
                .stat-row {
                    display: grid; grid-template-columns: 1fr 1fr 1fr;
                    gap: 0.75rem; margin-bottom: 1.5rem;
                }
                .stat-box {
                    background: var(--blue-50);
                    border-radius: 10px; padding: 0.75rem;
                    text-align: center;
                }
                .stat-num {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.4rem; font-weight: 900;
                    color: var(--blue-700);
                }
                .stat-label {
                    font-size: 0.65rem; color: var(--gray-500);
                    text-transform: uppercase; letter-spacing: 0.05em;
                }
                .bar-chart { display: flex; flex-direction: column; gap: 0.6rem; }
                .bar-row { display: flex; align-items: center; gap: 0.75rem; }
                .bar-label { font-size: 0.75rem; color: var(--gray-500); width: 60px; flex-shrink: 0; }
                .bar-track {
                    flex: 1; height: 8px; background: var(--gray-100);
                    border-radius: 999px; overflow: hidden;
                }
                .bar-fill {
                    height: 100%; border-radius: 999px;
                    background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
                    animation: grow 1.5s ease-out forwards;
                    transform-origin: left;
                }
                @keyframes grow {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                .bar-pct { font-size: 0.7rem; font-weight: 500; color: var(--blue-700); width: 32px; }

                /* floating decorative cards */
                .float-pill {
                    position: absolute;
                    background: white;
                    border-radius: 12px;
                    padding: 0.6rem 1rem;
                    box-shadow: 0 8px 32px rgba(3,19,74,0.12);
                    font-size: 0.8rem; font-weight: 500;
                    display: flex; align-items: center; gap: 0.5rem;
                    white-space: nowrap;
                }
                .float-pill.top { top: 10%; right: -10px; animation: float 5s ease-in-out infinite 1s; }
                .float-pill.bottom { bottom: 15%; left: -30px; animation: float 7s ease-in-out infinite 0.5s; }
                .pill-dot { width: 8px; height: 8px; border-radius: 50%; }

                /* ── FEATURES ── */
                .features {
                    padding: 6rem 4rem;
                    background: white;
                }
                .section-label {
                    text-align: center;
                    font-size: 0.75rem; font-weight: 500; letter-spacing: 0.15em;
                    text-transform: uppercase; color: var(--blue-500);
                    margin-bottom: 0.75rem;
                }
                .section-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 3.5vw, 2.8rem);
                    font-weight: 900; text-align: center;
                    color: var(--blue-950); letter-spacing: -1px;
                    margin-bottom: 1rem;
                }
                .section-sub {
                    text-align: center; color: var(--gray-500);
                    font-size: 1rem; line-height: 1.7; max-width: 480px;
                    margin: 0 auto 3.5rem;
                }
                .features-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem; max-width: 1100px; margin: 0 auto;
                }
                .feature-card {
                    background: var(--blue-50);
                    border: 1px solid rgba(37,99,235,0.08);
                    border-radius: 16px; padding: 2rem;
                    transition: all 0.3s; cursor: default;
                }
                .feature-card:hover {
                    background: white;
                    border-color: var(--blue-200);
                    box-shadow: 0 16px 48px rgba(37,99,235,0.1);
                    transform: translateY(-4px);
                }
                .feature-icon {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: var(--blue-500);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.3rem; margin-bottom: 1.25rem;
                }
                .feature-card h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.1rem; font-weight: 700;
                    color: var(--blue-950); margin-bottom: 0.5rem;
                }
                .feature-card p { font-size: 0.9rem; color: var(--gray-500); line-height: 1.65; }

                /* ── CTA ── */
                .cta {
                    margin: 0 4rem 6rem;
                    background: linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 100%);
                    border-radius: 24px; padding: 5rem 4rem;
                    text-align: center; position: relative; overflow: hidden;
                }
                .cta::before {
                    content: '';
                    position: absolute; top: -100px; right: -100px;
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(240,192,64,0.15) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .cta h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 900; color: white;
                    letter-spacing: -1px; margin-bottom: 1rem;
                    position: relative; z-index: 1;
                }
                .cta p {
                    color: var(--blue-200); font-size: 1rem; line-height: 1.7;
                    max-width: 440px; margin: 0 auto 2.5rem;
                    position: relative; z-index: 1;
                }
                .cta-actions {
                    display: flex; gap: 1rem; justify-content: center;
                    position: relative; z-index: 1;
                }
                .btn-white {
                    padding: 0.9rem 2rem;
                    background: white; color: var(--blue-700);
                    border-radius: 8px; font-size: 0.95rem; font-weight: 500;
                    text-decoration: none; transition: all 0.2s;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                }
                .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
                .btn-ghost {
                    padding: 0.9rem 1.75rem;
                    color: white; border: 1.5px solid rgba(255,255,255,0.3);
                    border-radius: 8px; font-size: 0.95rem; font-weight: 500;
                    text-decoration: none; transition: all 0.2s;
                }
                .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }

                /* ── FOOTER ── */
                footer {
                    padding: 2rem 4rem;
                    border-top: 1px solid var(--gray-100);
                    display: flex; align-items: center; justify-content: space-between;
                }
                .footer-logo {
                    font-family: 'Playfair Display', serif;
                    font-weight: 900; font-size: 1.1rem; color: var(--blue-700);
                }
                .footer-logo span { color: var(--gold); }
                footer p { font-size: 0.8rem; color: var(--gray-500); }

                /* ── REVEAL ── */
                .reveal { opacity: 0; transform: translateY(24px); transition: all 0.6s ease; }
                .reveal.visible { opacity: 1; transform: translateY(0); }

                @media (max-width: 900px) {
                    nav { padding: 1rem 1.5rem; }
                    .nav-links { display: none; }
                    .hero { grid-template-columns: 1fr; padding: 7rem 1.5rem 3rem; text-align: center; }
                    .hero p { margin: 0 auto 2rem; }
                    .hero-actions { justify-content: center; flex-wrap: wrap; }
                    .hero-visual { display: none; }
                    .features { padding: 4rem 1.5rem; }
                    .features-grid { grid-template-columns: 1fr; }
                    .cta { margin: 0 1.5rem 4rem; padding: 3rem 1.5rem; }
                    .cta-actions { flex-direction: column; align-items: center; }
                    footer { flex-direction: column; gap: 0.5rem; text-align: center; }
                }
            `}</style>

            {/* NAV */}
            <nav>
                <div className="nav-logo">Heart<span>felt</span></div>
            </nav>

            {/* HERO */}
            <section className="hero" ref={heroRef}>
                <div className="hero-text">
                    <h1>
                        Manage with<br />
                        <em>clarity</em> &amp; care
                    </h1>
                    <p>
                        A thoughtful platform designed to bring order, insight, and warmth
                        to every aspect of your heartfelt's operations.
                    </p>
                    <div className="hero-actions">
                        <a href="/register" className="btn-primary">
                            Get started free →
                        </a>
                        <a href="/login" className="btn-secondary">
                            Sign in
                        </a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div style={{ position: 'relative' }}>
                        {/* Floating pills */}
                        <div className="float-pill top">
                            <div className="pill-dot" style={{ background: '#22c55e' }}></div>
                            12 tasks completed today
                        </div>
                        <div className="float-pill bottom">
                            <div className="pill-dot" style={{ background: 'var(--blue-400)' }}></div>
                            3 new registrations
                        </div>

                        {/* Dashboard card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div className="card-title">Overview</div>
                                <div className="card-badge">● Live</div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-box">
                                    <div className="stat-num">50</div>
                                    <div className="stat-label">Regions</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-num">1050</div>
                                    <div className="stat-label">Zones</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-num">20</div>
                                    <div className="stat-label">Pastors</div>
                                </div>
                            </div>
                            <div className="bar-chart">
                                {[
                                    { label: 'Zone1', pct: 72 },
                                    { label: 'Zone2', pct: 88 },
                                    { label: 'Zone3', pct: 61 },
                                    { label: 'Zone5', pct: 95 },
                                    { label: 'Zone6', pct: 79 },
                                ].map(({ label, pct }) => (
                                    <div className="bar-row" key={label}>
                                        <div className="bar-label">{label}</div>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="bar-pct">{pct}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
