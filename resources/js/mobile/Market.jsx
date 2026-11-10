import { useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Edit3, Flag, Image as ImageIcon, MapPin, MessageSquareQuote, Minus, Package, Pause, Play, Plus, Receipt, Search, ShieldCheck, ShoppingBag, Store, Tag, Trash2, Truck, X, Loader2, Sparkles, Phone } from "lucide-react";
import { Avatar, Btn, ActionSheet, ConfirmSheet, Empty, ErrorState, IconBtn, InView, ScrollTabs, Segmented, Sheet, Skel, TopBar, Verified, toast, cx, Chip } from "./ui.jsx";
import { Scroller } from "./Feed.jsx";
import { Brand } from "./Home.jsx";
import { ReportSheet } from "./Post.jsx";
import { community, compressImage, errorMessage, haptic, market, money, timeAgo } from "./lib.js";
import { useNav } from "./nav.jsx";
import { PartnerLock } from "./Partnership.jsx";
import { useUser } from "../context/UserContext.jsx";

const STATUS = {
    pending: ["Waiting for seller", "#b45309"], accepted: ["Accepted", "#2f6bff"], rejected: ["Declined", "#e11d48"], paid: ["Paid", "#12a150"], shipped: ["On the way", "#7c3aed"],
    completed: ["Completed", "#12a150"], cancelled: ["Cancelled", "#667791"], requested: ["Quote requested", "#b45309"], quoted: ["Quote received", "#2f6bff"], declined: ["Declined", "#e11d48"],
};
const StatusPill = ({ s }) => { const [l, c] = STATUS[s] || [s, "#667791"]; return <span className="hm-badge" style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c, height: 22 }}>{l}</span>; };

// ── Browse ──────────────────────────────────────────────────────────────────────────────────────

function ListingCard({ l, onOpen }) {
    return (
        <button onClick={() => onOpen(l)} className="hm-card overflow-hidden text-left active:scale-[.98] transition-transform">
            <div className="relative" style={{ aspectRatio: "1 / 1", background: "var(--surface2)" }}>
                {l.images?.[0] ? <img src={l.images[0]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--mut)" }}><ShoppingBag size={34} /></div>}
                {!l.in_stock && <div className="absolute inset-0 flex items-center justify-center font-extrabold text-white" style={{ background: "rgba(0,0,0,.5)" }}>SOLD OUT</div>}
                {l.price_type === "quote" && <span className="absolute top-2 left-2 hm-badge" style={{ background: "rgba(255,255,255,.92)", color: "#0b1b30" }}>Get a quote</span>}
            </div>
            <div className="p-3">
                <div className="font-extrabold text-[15px]" style={{ color: "var(--brand)" }}><span className="dark:text-white" style={{ color: "var(--ink)" }}>{l.price_type === "quote" ? "Ask for price" : money(l.price, l.currency)}</span></div>
                <div className="text-[13.5px] font-semibold leading-snug line-clamp-2 mt-0.5">{l.title}</div>
                <div className="text-[11.5px] mt-1.5 flex items-center gap-1 truncate" style={{ color: "var(--mut)" }}>{l.seller?.name}{l.seller?.verified && <Verified size={11} />}</div>
            </div>
        </button>
    );
}

export default function Market({ boot }) {
    const nav = useNav();
    const qc = useQueryClient();
    const [q, setQ] = useState("");
    const [term, setTerm] = useState("");
    const [cat, setCat] = useState("");
    const [sort, setSort] = useState("new");
    const timer = useRef(0);
    const cats = boot?.categories?.market || [];
    const canSell = boot?.can_sell;
    const locked = !!boot?.partnership?.locked;      // expired partnership: the marketplace is closed until they renew
    const query = useInfiniteQuery({ queryKey: ["market", term, cat, sort], initialPageParam: 1, enabled: !locked, queryFn: ({ pageParam }) => market.listings({ q: term || undefined, category: cat || undefined, sort, page: pageParam }), getNextPageParam: (l) => l?.next_page ?? undefined, staleTime: 30_000 });
    const items = query.data?.pages.flatMap((p) => p.items) ?? [];

    if (locked) return <div className="flex flex-col h-full hm-safe-top"><PartnerLock what="the marketplace" /></div>;

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 hm-safe-top hm-glass shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between" style={{ minHeight: 56 }}><Brand /><div className="flex"><IconBtn icon={Receipt} label="My orders" onClick={() => nav.push("orders", { as: "buyer" })} />{canSell && <IconBtn icon={Store} label="My shop" onClick={() => nav.push("shop")} />}</div></div>
                <div className="pb-3 relative"><Search size={18} className="absolute left-3.5 top-[13px]" style={{ color: "var(--mut)" }} /><input className="hm-input" style={{ paddingLeft: 42, height: 44 }} placeholder="Search the marketplace" value={q} onChange={(e) => { setQ(e.target.value); clearTimeout(timer.current); timer.current = setTimeout(() => setTerm(e.target.value.trim()), 350); }} /></div>
            </div>
            <Scroller tab="market" onRefresh={() => qc.invalidateQueries({ queryKey: ["market"] })}>
                <div className="pt-1"><ScrollTabs value={cat} onChange={setCat} tabs={[{ value: "", label: "All" }, ...cats.map((c) => ({ value: c, label: c }))]} /></div>

                {!canSell ? (
                    <div className="mx-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--gold) 22%, transparent), color-mix(in srgb, var(--gold) 6%, transparent))", border: "1px solid color-mix(in srgb, var(--gold) 40%, transparent)" }}>
                        <ShieldCheck size={26} style={{ color: "var(--gold)" }} /><div className="flex-1 text-[13px]"><b>Partners-only shops.</b> Everyone can buy; only active partners can sell. Join the partnership programme to open your own shop.</div>
                    </div>
                ) : (
                    <button onClick={() => nav.push("listing-edit")} className="mx-4 mb-3 w-[calc(100%-32px)] rounded-2xl p-3.5 flex items-center gap-3 text-left text-white" style={{ background: "linear-gradient(135deg,#0f2744,#2f6bff)" }}><Store size={24} /><div className="flex-1 font-bold text-[14px]">Sell something<div className="text-xs font-medium opacity-80">List a product or service in 1 minute</div></div><Plus size={22} /></button>
                )}

                <div className="px-4 flex items-center justify-between pb-2"><span className="text-xs font-bold" style={{ color: "var(--mut)" }}>{items.length > 0 ? "Fresh from our partners" : ""}</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs font-bold outline-none" style={{ color: "var(--mut)", appearance: "none", WebkitAppearance: "none", border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 12, padding: "7px 12px" }} aria-label="Sort"><option value="new">Newest</option><option value="popular">Popular</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option></select></div>

                <div className="px-4 pb-8">
                    {query.isLoading && <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <Skel key={i} h={230} r={18} />)}</div>}
                    {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}
                    {!query.isLoading && items.length === 0 && <Empty icon={ShoppingBag} title="Nothing for sale yet" text={term || cat ? "Try a different search or category." : "Partners can list products and services here."} />}
                    <div className="grid grid-cols-2 gap-3">{items.map((l) => <ListingCard key={l.id} l={l} onOpen={() => nav.push("listing", { id: l.id })} />)}</div>
                    <InView onVisible={() => query.fetchNextPage()} disabled={!query.hasNextPage || query.isFetchingNextPage} />
                </div>
            </Scroller>
        </div>
    );
}

// ── Product page ────────────────────────────────────────────────────────────────────────────────

function OrderSheet({ listing, open, onClose }) {
    const nav = useNav();
    const [qty, setQty] = useState(1);
    const [f, setF] = useState({ contact_phone: "", delivery_address: "", note: "" });
    const [busy, setBusy] = useState(false);
    const max = listing.stock ?? 99;
    const submit = async () => {
        setBusy(true);
        try { await market.order(listing.id, { quantity: qty, ...f }); toast.success("Order sent to the seller"); onClose(); nav.push("orders", { as: "buyer" }); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open={open} onClose={onClose} title="Place your order" footer={<div className="flex items-center gap-3"><div className="flex-1"><div className="text-xs" style={{ color: "var(--mut)" }}>Total</div><div className="font-extrabold text-xl">{money(listing.price * qty, listing.currency)}</div></div><Btn loading={busy} onClick={submit} className="px-8">Send order</Btn></div>}>
            <div className="space-y-4 pb-2">
                <div className="flex items-center gap-3"><div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ background: "var(--surface2)" }}>{listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1 min-w-0"><div className="font-bold leading-snug line-clamp-2">{listing.title}</div><div className="text-sm" style={{ color: "var(--mut)" }}>{money(listing.price, listing.currency)} each</div></div>
                    <div className="flex items-center gap-2"><button className="hm-icon-btn" style={{ background: "var(--surface2)" }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={18} /></button><span className="w-7 text-center font-extrabold text-lg">{qty}</span><button className="hm-icon-btn" style={{ background: "var(--surface2)" }} onClick={() => setQty(Math.min(max, qty + 1))}><Plus size={18} /></button></div></div>
                <div><label className="hm-label">Your phone (so the seller can reach you)</label><input className="hm-input" inputMode="tel" value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} placeholder="+263 77 123 4567" /></div>
                <div><label className="hm-label">Delivery address (optional)</label><input className="hm-input" value={f.delivery_address} onChange={(e) => setF({ ...f, delivery_address: e.target.value })} /></div>
                <div><label className="hm-label">Note to the seller (optional)</label><textarea className="hm-input" rows={2} maxLength={500} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
                <p className="text-xs rounded-xl p-3" style={{ background: "var(--surface2)", color: "var(--mut)" }}>Payment is arranged directly with the seller (cash, mobile money or bank). Heartfelt tracks your order but never holds your money.</p>
            </div>
        </Sheet>
    );
}

function QuoteSheet({ listing, open, onClose }) {
    const nav = useNav();
    const [qty, setQty] = useState(1);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        setBusy(true);
        try { await market.askQuote(listing.id, { quantity: qty, message }); toast.success("Quote request sent"); onClose(); nav.push("orders", { as: "buyer", tab: "quotes" }); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open={open} onClose={onClose} title="Request a quote" footer={<Btn block loading={busy} disabled={message.trim().length < 5} onClick={submit}>Send request</Btn>}>
            <div className="space-y-4 pb-2"><p className="text-sm" style={{ color: "var(--mut)" }}>Tell {listing.seller?.name?.split(" ")[0]} what you need. They'll reply with a price and how long it's valid.</p>
                <div><label className="hm-label">Quantity</label><input type="number" min="1" className="hm-input" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} /></div>
                <div><label className="hm-label">What do you need?</label><textarea className="hm-input" rows={5} maxLength={1000} placeholder="Describe size, date, place, budget…" value={message} onChange={(e) => setMessage(e.target.value)} /></div></div>
        </Sheet>
    );
}

export function ListingScreen({ id }) {
    const nav = useNav();
    const qc = useQueryClient();
    const { user } = useUser();
    const [ordering, setOrdering] = useState(false);
    const [quoting, setQuoting] = useState(false);
    const [report, setReport] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [slide, setSlide] = useState(0);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["listing", id], queryFn: () => market.listing(id) });
    const l = data?.data;
    if (isLoading) return <div className="flex flex-col h-full"><TopBar back title="" /><div className="p-4 space-y-3"><Skel h={300} r={24} /><Skel h={28} w="60%" /><Skel h={80} /></div></div>;
    if (isError) return <div className="flex flex-col h-full"><TopBar back title="Listing" /><ErrorState error={error} onRetry={refetch} /></div>;
    const remove = async () => { try { await market.remove(l.id); toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["market"] }); nav.pop(); } catch (e) { toast.error(errorMessage(e)); } };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="" transparent right={!l.mine ? <IconBtn icon={Flag} label="Report" onClick={() => setReport(true)} /> : <IconBtn icon={Edit3} label="Edit" onClick={() => nav.push("listing-edit", { id: l.id })} />} />
            <div className="hm-scroll pb-4">
                <div className="relative" style={{ background: "var(--surface2)" }}>
                    <div className="flex overflow-x-auto snap-x snap-mandatory hm-hide-scroll" style={{ aspectRatio: "1 / 1" }} onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
                        {(l.images?.length ? l.images : [null]).map((src, i) => <div key={i} className="w-full shrink-0 snap-center flex items-center justify-center" style={{ minWidth: "100%" }}>{src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <ShoppingBag size={56} style={{ color: "var(--mut)" }} />}</div>)}
                    </div>
                    {l.images?.length > 1 && <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">{l.images.map((_, i) => <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === slide ? 18 : 6, background: i === slide ? "#fff" : "rgba(255,255,255,.55)" }} />)}</div>}
                </div>
                <div className="p-4 space-y-4">
                    <div><div className="flex items-start justify-between gap-3"><h1 className="font-extrabold text-[22px] leading-tight">{l.title}</h1><StatusPill s={l.status === "active" ? "accepted" : "cancelled"} /></div>
                        <div className="font-extrabold text-2xl mt-1" style={{ color: "var(--accent)" }}>{l.price_type === "quote" ? "Price on request" : money(l.price, l.currency)}</div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs font-bold"><span className="hm-chip" style={{ height: 28 }}><Tag size={13} />{l.category}</span>{l.location && <span className="hm-chip" style={{ height: 28 }}><MapPin size={13} />{l.location}</span>}{l.stock !== null && <span className="hm-chip" style={{ height: 28 }}><Package size={13} />{l.stock} in stock</span>}</div></div>
                    <p className="text-[15.5px] leading-relaxed whitespace-pre-wrap">{l.description}</p>
                    <button onClick={() => nav.push("profile", { id: l.seller.id })} className="hm-card p-3.5 w-full flex items-center gap-3 text-left"><Avatar user={l.seller} size={48} /><div className="flex-1 min-w-0"><div className="font-bold flex items-center gap-1.5">{l.seller.name}{l.seller.verified && <Verified size={14} />}<span className="hm-badge hm-badge-gold">Partner</span></div><div className="text-xs" style={{ color: "var(--mut)" }}>@{l.seller.handle}{l.seller.zone ? ` · ${l.seller.zone}` : ""}</div></div><ChevronRight size={18} style={{ color: "var(--mut)" }} /></button>
                </div>
            </div>
            <div className="p-3 shrink-0 hm-safe-bottom flex gap-3" style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
                {l.mine ? <><Btn variant="soft" block icon={Edit3} onClick={() => nav.push("listing-edit", { id: l.id })}>Edit</Btn><Btn variant="danger" icon={Trash2} onClick={() => setConfirm(true)} aria-label="Delete" /></>
                    : l.status !== "active" || !l.in_stock ? <Btn block disabled>Not available</Btn>
                    : l.price_type === "quote" ? <Btn block icon={MessageSquareQuote} onClick={() => setQuoting(true)}>Request a quote</Btn>
                    : <><Btn variant="soft" icon={MessageSquareQuote} onClick={() => setQuoting(true)}>Ask</Btn><Btn block icon={ShoppingBag} onClick={() => setOrdering(true)}>Order · {money(l.price, l.currency)}</Btn></>}
            </div>
            {!l.mine && <><OrderSheet listing={l} open={ordering} onClose={() => setOrdering(false)} /><QuoteSheet listing={l} open={quoting} onClose={() => setQuoting(false)} /><ReportSheet open={report} onClose={() => setReport(false)} type="listing" id={l.id} /></>}
            <ConfirmSheet open={confirm} onClose={() => setConfirm(false)} title="Delete this listing?" confirm="Delete" danger onConfirm={remove} />
        </div>
    );
}

// ── Orders & quotes ─────────────────────────────────────────────────────────────────────────────

function OrderCard({ o, onChange }) {
    const nav = useNav();
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState("");
    const [asking, setAsking] = useState(null);
    const set = async (status, n) => { setBusy(true); haptic(12); try { await market.setOrder(o.id, status, n); toast.success("Order updated"); onChange(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); setAsking(null); } };
    const seller = o.role === "seller";
    const other = seller ? o.buyer : o.seller;
    const actions = seller
        ? { pending: [["accepted", "Accept", "primary"], ["rejected", "Decline", "danger"]], accepted: [["paid", "Mark paid", "soft"], ["shipped", "Mark shipped", "primary"]], paid: [["shipped", "Mark shipped", "primary"]] }[o.status] || []
        : { pending: [["cancelled", "Cancel order", "danger"]], accepted: [["cancelled", "Cancel", "danger"]], shipped: [["completed", "I received it", "primary"]] }[o.status] || [];
    return (
        <div className="hm-card p-4 space-y-3">
            <div className="flex items-start gap-3"><div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0" style={{ background: "var(--surface2)" }}>{o.listing?.image && <img src={o.listing.image} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0"><div className="font-bold leading-snug line-clamp-2">{o.listing?.title || "Listing"}</div><div className="text-xs mt-0.5" style={{ color: "var(--mut)" }}>{o.reference} · {timeAgo(o.created_at)}</div></div><StatusPill s={o.status} /></div>
            <div className="flex items-center justify-between text-sm"><span style={{ color: "var(--mut)" }}>{o.quantity} × {money(o.unit_price, o.currency)}</span><span className="font-extrabold text-base">{money(o.total, o.currency)}</span></div>
            <button onClick={() => nav.push("profile", { id: other.id })} className="flex items-center gap-2.5 text-left w-full"><Avatar user={other} size={30} /><span className="text-[13px] font-semibold">{seller ? "Buyer" : "Seller"}: {other.name}</span></button>
            {(o.buyer_note || o.seller_note || (seller && (o.contact_phone || o.delivery_address))) && (
                <div className="rounded-xl p-3 text-[13px] space-y-1" style={{ background: "var(--surface2)" }}>
                    {o.buyer_note && <div><b>Buyer:</b> {o.buyer_note}</div>}{seller && o.contact_phone && <div className="flex items-center gap-1.5"><Phone size={13} /><a href={`tel:${o.contact_phone}`} className="font-bold" style={{ color: "var(--accent)" }}>{o.contact_phone}</a></div>}{seller && o.delivery_address && <div className="flex items-center gap-1.5"><MapPin size={13} />{o.delivery_address}</div>}{o.seller_note && <div><b>Seller:</b> {o.seller_note}</div>}
                </div>)}
            {actions.length > 0 && <div className="flex gap-2">{actions.map(([s, l, v]) => <Btn key={s} size="sm" variant={v} loading={busy} className="flex-1" onClick={() => (seller && (s === "accepted" || s === "rejected") ? setAsking(s) : set(s))}>{l}</Btn>)}</div>}
            <Sheet open={!!asking} onClose={() => setAsking(null)} title={asking === "accepted" ? "Accept this order" : "Decline this order"} footer={<Btn block variant={asking === "accepted" ? "primary" : "danger"} loading={busy} onClick={() => set(asking, note || undefined)}>{asking === "accepted" ? "Accept order" : "Decline order"}</Btn>}>
                <label className="hm-label">Message to the buyer (optional)</label><textarea className="hm-input" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={asking === "accepted" ? "e.g. Ready on Friday. Pay on delivery." : "e.g. Sorry, out of stock."} />
            </Sheet>
        </div>
    );
}

function QuoteCard({ q, onChange }) {
    const [busy, setBusy] = useState(false);
    const [reply, setReply] = useState(false);
    const [price, setPrice] = useState("");
    const [text, setText] = useState("");
    const [days, setDays] = useState(7);
    const seller = q.role === "seller";
    const other = seller ? q.buyer : q.seller;
    const act = async (body) => { setBusy(true); try { const r = await market.answerQuote(q.id, body); toast.success(body.action === "accept" ? "Order created from the quote" : "Updated"); onChange(); setReply(false); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); } };
    return (
        <div className="hm-card p-4 space-y-3">
            <div className="flex items-start gap-3"><div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0" style={{ background: "var(--surface2)" }}>{q.listing?.image && <img src={q.listing.image} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1 min-w-0"><div className="font-bold leading-snug line-clamp-1">{q.listing?.title}</div><div className="text-xs" style={{ color: "var(--mut)" }}>{q.reference} · {seller ? q.buyer.name : q.seller.name} · {timeAgo(q.created_at)}</div></div><StatusPill s={q.expired ? "cancelled" : q.status} /></div>
            <div className="rounded-xl p-3 text-[13.5px]" style={{ background: "var(--surface2)" }}><b>{seller ? "Request" : "You asked"} ({q.quantity}×):</b> {q.message}</div>
            {q.quoted_price !== null && <div className="rounded-xl p-3" style={{ background: "color-mix(in srgb, var(--accent) 9%, transparent)" }}><div className="flex justify-between items-center"><span className="text-xs font-bold" style={{ color: "var(--mut)" }}>QUOTED PRICE</span><span className="font-extrabold text-xl">{money(q.quoted_price, q.listing?.currency || "USD")}</span></div>{q.seller_reply && <div className="text-[13.5px] mt-1">{q.seller_reply}</div>}{q.valid_until && <div className="text-xs mt-1" style={{ color: q.expired ? "var(--danger)" : "var(--mut)" }}>{q.expired ? "Expired" : "Valid until"} {q.valid_until}</div>}</div>}
            {seller && q.status === "requested" && <div className="flex gap-2"><Btn size="sm" className="flex-1" onClick={() => setReply(true)}>Send quote</Btn><Btn size="sm" variant="danger" loading={busy} onClick={() => act({ action: "decline" })}>Decline</Btn></div>}
            {!seller && q.status === "quoted" && !q.expired && <div className="flex gap-2"><Btn size="sm" className="flex-1" loading={busy} icon={Check} onClick={() => act({ action: "accept" })}>Accept &amp; order</Btn><Btn size="sm" variant="soft" loading={busy} onClick={() => act({ action: "decline" })}>No thanks</Btn></div>}
            {!seller && q.status === "requested" && <Btn size="sm" variant="soft" block loading={busy} onClick={() => act({ action: "cancel" })}>Cancel request</Btn>}
            <Sheet open={reply} onClose={() => setReply(false)} title="Send your quote" footer={<Btn block loading={busy} disabled={!(+price > 0)} onClick={() => act({ action: "quote", price: +price, reply: text || undefined, valid_days: days })}>Send quote</Btn>}>
                <div className="space-y-4 pb-2"><div><label className="hm-label">Your price ({q.listing?.currency || "USD"})</label><input type="number" inputMode="decimal" className="hm-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" /></div>
                    <div><label className="hm-label">Valid for</label><select className="hm-input" value={days} onChange={(e) => setDays(+e.target.value)}>{[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}</select></div>
                    <div><label className="hm-label">Message (optional)</label><textarea className="hm-input" rows={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} placeholder="What's included, delivery, deposit…" /></div></div>
            </Sheet>
        </div>
    );
}

export function OrdersScreen({ as: initialAs = "buyer", tab: initialTab = "orders" }) {
    const { data: meta } = useQuery({ queryKey: ["market-meta"], queryFn: market.meta, staleTime: 60_000 });
    const [as, setAs] = useState(initialAs);
    const [tab, setTab] = useState(initialTab);
    const orders = useQuery({ queryKey: ["orders", as], queryFn: () => market.orders(as) });
    const quotes = useQuery({ queryKey: ["quotes", as], queryFn: () => market.quotes(as) });
    const canSell = meta?.data?.can_sell;
    const cur = tab === "orders" ? orders : quotes;
    const list = cur.data?.data || [];
    const qc = useQueryClient();
    const refresh = () => { orders.refetch(); quotes.refetch(); qc.invalidateQueries({ queryKey: ["bootstrap"] }); };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title={as === "seller" ? "Shop orders" : "My orders"} />
            <div className="px-4 pt-3 space-y-3">
                {canSell && <Segmented value={as} onChange={setAs} options={[{ value: "buyer", label: "I'm buying", icon: ShoppingBag }, { value: "seller", label: "I'm selling", icon: Store }]} />}
                <Segmented value={tab} onChange={setTab} options={[{ value: "orders", label: "Orders", icon: Package }, { value: "quotes", label: "Quotes", icon: MessageSquareQuote }]} />
            </div>
            <div className="hm-scroll px-4 py-3 space-y-3 pb-10">
                {cur.isLoading && <><Skel h={150} r={18} /><Skel h={150} r={18} /></>}
                {cur.isError && <ErrorState error={cur.error} onRetry={cur.refetch} />}
                {!cur.isLoading && list.length === 0 && <Empty icon={tab === "orders" ? Package : MessageSquareQuote} title={tab === "orders" ? "No orders yet" : "No quotes yet"} text={as === "seller" ? "Orders and quote requests from members will show up here." : "Things you order or ask about will be tracked here."} />}
                {tab === "orders" ? list.map((o) => <OrderCard key={o.id} o={o} onChange={refresh} />) : list.map((q) => <QuoteCard key={q.id} q={q} onChange={refresh} />)}
            </div>
        </div>
    );
}

// ── Seller: my shop and the listing editor ──────────────────────────────────────────────────────

export function ShopScreen() {
    const nav = useNav();
    const qc = useQueryClient();
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["my-listings"], queryFn: market.mine });
    const orders = useQuery({ queryKey: ["orders", "seller"], queryFn: () => market.orders("seller", "pending"), retry: false });
    const quotes = useQuery({ queryKey: ["quotes", "seller"], queryFn: () => market.quotes("seller"), retry: false });
    const list = data?.data || [];
    const waiting = (orders.data?.data?.length || 0) + (quotes.data?.data?.filter((q) => q.status === "requested").length || 0);
    const toggle = async (l) => { try { await market.save({ title: l.title, description: l.description, category: l.category, price: l.price, currency: l.currency, price_type: l.price_type, stock: l.stock, images: l.images, location: l.location, status: l.status === "active" ? "paused" : "active" }, l.id); toast.success(l.status === "active" ? "Listing paused" : "Listing live again"); refetch(); qc.invalidateQueries({ queryKey: ["market"] }); } catch (e) { toast.error(errorMessage(e)); } };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="My shop" right={<IconBtn icon={Plus} label="New listing" onClick={() => nav.push("listing-edit")} />} />
            <div className="hm-scroll px-4 py-3 space-y-3 pb-10">
                <button onClick={() => nav.push("orders", { as: "seller" })} className="w-full rounded-2xl p-4 flex items-center gap-3 text-left text-white" style={{ background: "linear-gradient(135deg,#0f2744,#2f6bff)" }}><Receipt size={26} /><div className="flex-1"><div className="font-extrabold">Orders &amp; quotes</div><div className="text-xs opacity-85">{waiting > 0 ? `${waiting} waiting for your reply` : "Nothing waiting"}</div></div>{waiting > 0 && <span className="hm-tab-dot" style={{ position: "static", border: 0 }}>{waiting}</span>}<ChevronRight size={20} /></button>
                {isLoading && <Skel h={90} r={18} />}
                {isError && <ErrorState error={error} onRetry={refetch} />}
                {!isLoading && list.length === 0 && <Empty icon={Store} title="Your shop is empty" text="Add your first product or service. Members can order it or ask for a quote." action={<Btn size="sm" onClick={() => nav.push("listing-edit")}>Add a listing</Btn>} />}
                {list.map((l) => (
                    <div key={l.id} className="hm-card p-3 flex gap-3"><button onClick={() => nav.push("listing", { id: l.id })} className="w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ background: "var(--surface2)" }}>{l.images?.[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" />}</button>
                        <div className="flex-1 min-w-0"><div className="font-bold line-clamp-1">{l.title}</div><div className="text-sm font-extrabold" style={{ color: "var(--accent)" }}>{l.price_type === "quote" ? "By quote" : money(l.price, l.currency)}</div>
                            <div className="text-xs mt-0.5 flex gap-2 items-center flex-wrap" style={{ color: "var(--mut)" }}><StatusPill s={l.status === "active" ? "accepted" : "cancelled"} />{l.stock !== null && <span>{l.stock} left</span>}<span>{l.orders} sold</span></div>
                            <div className="flex gap-2 mt-2"><Btn size="sm" variant="soft" icon={Edit3} onClick={() => nav.push("listing-edit", { id: l.id })}>Edit</Btn>{l.status !== "suspended" && <Btn size="sm" variant="soft" icon={l.status === "active" ? Pause : Play} onClick={() => toggle(l)}>{l.status === "active" ? "Pause" : "Resume"}</Btn>}</div>
                            {l.status === "suspended" && <div className="text-xs mt-1" style={{ color: "var(--danger)" }}>Suspended by head office</div>}</div></div>
                ))}
            </div>
        </div>
    );
}

export function ListingEditor({ id }) {
    const nav = useNav();
    const qc = useQueryClient();
    const { data } = useQuery({ queryKey: ["listing", id], queryFn: () => market.listing(id), enabled: !!id });
    const { data: meta } = useQuery({ queryKey: ["market-meta"], queryFn: market.meta, staleTime: 60_000 });
    const m = meta?.data;
    const existing = data?.data;
    const [f, setF] = useState(null);
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(0);
    const fileRef = useRef(null);
    const form = f || (existing ? { title: existing.title, description: existing.description, category: existing.category, price_type: existing.price_type, price: existing.price ?? "", currency: existing.currency, stock: existing.stock ?? "", location: existing.location || "", images: existing.images || [] } : (id ? null : { title: "", description: "", category: "", price_type: "fixed", price: "", currency: "USD", stock: "", location: "", images: [] }));
    const set = (k, v) => setF({ ...form, [k]: v });
    if (!form) return <div className="flex flex-col h-full"><TopBar back title="Edit listing" /><div className="p-4"><Skel h={200} r={18} /></div></div>;
    if (m && !m.can_sell) return <div className="flex flex-col h-full"><TopBar back title="Sell" /><Empty icon={ShieldCheck} title="Partners only" text={m.seller_rule} /></div>;

    const pick = async (files) => {
        for (const file of Array.from(files).slice(0, 6 - form.images.length)) {
            setUploading((n) => n + 1);
            try { const r = await community.uploadImage(await compressImage(file, 1400)); setF((cur) => ({ ...(cur || form), images: [...(cur || form).images, r.url] })); } catch (e) { toast.error(errorMessage(e, "That photo couldn't be uploaded.")); } finally { setUploading((n) => n - 1); }
        }
    };
    const valid = form.title.trim().length >= 3 && form.description.trim().length >= 10 && form.category && (form.price_type === "quote" || +form.price > 0);
    const save = async () => {
        setBusy(true);
        try { await market.save({ ...form, price: form.price_type === "quote" ? undefined : +form.price, stock: form.stock === "" ? undefined : +form.stock }, id); toast.success(id ? "Listing updated" : "Listing published"); qc.invalidateQueries({ queryKey: ["market"] }); qc.invalidateQueries({ queryKey: ["my-listings"] }); qc.invalidateQueries({ queryKey: ["listing", id] }); nav.pop(); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title={id ? "Edit listing" : "New listing"} />
            <div className="hm-scroll px-4 py-4 space-y-4 pb-6">
                <div><label className="hm-label">Photos (up to 6)</label>
                    <div className="grid grid-cols-3 gap-2">{form.images.map((u, i) => <div key={i} className="relative aspect-square rounded-2xl overflow-hidden"><img src={u} alt="" className="w-full h-full object-cover" /><button onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.6)", color: "#fff" }} aria-label="Remove"><X size={14} /></button>{i === 0 && <span className="absolute bottom-1 left-1 hm-badge" style={{ background: "rgba(0,0,0,.6)", color: "#fff" }}>Cover</span>}</div>)}
                        {Array.from({ length: uploading }).map((_, i) => <div key={`u${i}`} className="aspect-square rounded-2xl hm-skel flex items-center justify-center"><Loader2 className="animate-spin" size={20} /></div>)}
                        {form.images.length + uploading < 6 && <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold" style={{ border: "2px dashed var(--line)", color: "var(--mut)" }}><ImageIcon size={22} />Add</button>}</div>
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} /></div>
                <div><label className="hm-label">Title</label><input className="hm-input" maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="What are you selling?" /></div>
                <div><label className="hm-label">Description</label><textarea className="hm-input" rows={5} maxLength={2000} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Details, sizes, delivery, how to pay…" /></div>
                <div><label className="hm-label">Category</label><select className="hm-input" value={form.category} onChange={(e) => set("category", e.target.value)}><option value="">Choose…</option>{(m?.categories || []).map((c) => <option key={c}>{c}</option>)}</select></div>
                <Segmented value={form.price_type} onChange={(v) => set("price_type", v)} options={[{ value: "fixed", label: "Fixed price", icon: Tag }, { value: "quote", label: "Request a quote", icon: MessageSquareQuote }]} />
                {form.price_type === "fixed" && <div className="flex gap-3"><div className="flex-1"><label className="hm-label">Price</label><input type="number" inputMode="decimal" className="hm-input" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" /></div><div style={{ width: 110 }}><label className="hm-label">Currency</label><select className="hm-input" value={form.currency} onChange={(e) => set("currency", e.target.value)}>{(m?.currencies || ["USD"]).map((c) => <option key={c}>{c}</option>)}</select></div></div>}
                <div className="flex gap-3"><div className="flex-1"><label className="hm-label">Stock (optional)</label><input type="number" min="0" className="hm-input" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="Unlimited" /></div><div className="flex-1"><label className="hm-label">Location</label><input className="hm-input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Harare" /></div></div>
            </div>
            <div className="p-3 shrink-0 hm-safe-bottom" style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}><Btn block loading={busy} disabled={!valid || !!uploading} onClick={save}>{id ? "Save changes" : "Publish listing"}</Btn></div>
        </div>
    );
}
