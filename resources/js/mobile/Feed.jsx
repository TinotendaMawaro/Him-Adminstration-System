import { useCallback, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { PostCard } from "./Post.jsx";
import { Empty, ErrorState, InView, PostSkeleton, cx } from "./ui.jsx";
import { haptic } from "./lib.js";

/** A scrolling page with native-style pull-to-refresh. */
export function Scroller({ children, onRefresh, tab, className, style }) {
    const ref = useRef(null);
    const start = useRef(null);
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onTouchStart = (e) => { if (ref.current?.scrollTop <= 0) start.current = e.touches[0].clientY; };
    const onTouchMove = (e) => {
        if (start.current === null || !onRefresh) return;
        const dy = e.touches[0].clientY - start.current;
        if (dy > 0 && ref.current?.scrollTop <= 0) setPull(Math.min(90, dy * 0.5));
    };
    const onTouchEnd = async () => {
        if (pull > 60 && onRefresh) {
            haptic(15); setRefreshing(true); setPull(54);
            try { await onRefresh(); } finally { setRefreshing(false); setPull(0); }
        } else setPull(0);
        start.current = null;
    };

    return (
        <div ref={ref} data-tab-scroll={tab} className={cx("hm-scroll", className)} style={style} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {onRefresh && (
                <div className="flex items-center justify-center overflow-hidden" style={{ height: pull, transition: start.current === null ? "height .25s ease" : "none", color: "var(--mut)" }}>
                    {(refreshing || pull > 10) && <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} style={{ transform: `rotate(${pull * 4}deg)`, opacity: Math.min(1, pull / 50) }} />}
                </div>
            )}
            {children}
        </div>
    );
}

/** Infinite list of post cards. `fetcher(page)` must return { items, next_page }. */
export function FeedList({ queryKey, fetcher, empty, header, onTag, compact }) {
    const qc = useQueryClient();
    const q = useInfiniteQuery({
        queryKey, initialPageParam: 1, queryFn: ({ pageParam }) => fetcher(pageParam), getNextPageParam: (last) => last?.next_page ?? undefined, staleTime: 20_000,
    });
    const posts = q.data?.pages.flatMap((p) => p.items) ?? [];
    const remove = useCallback((id) => qc.setQueryData(queryKey, (d) => d && { ...d, pages: d.pages.map((pg) => ({ ...pg, items: pg.items.filter((p) => p.id !== id) })) }), [qc, queryKey]);

    return (
        <div className="px-3 pt-3 pb-6 space-y-3">
            {header}
            {q.isLoading && <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>}
            {q.isError && <ErrorState error={q.error} onRetry={q.refetch} />}
            {!q.isLoading && !q.isError && posts.length === 0 && (empty || <Empty title="Nothing here yet" text="When people post, you'll see it here." />)}
            {posts.map((p) => <PostCard key={p.id} post={p} onRemove={remove} onTag={onTag} compact={compact} />)}
            <InView onVisible={() => q.fetchNextPage()} disabled={!q.hasNextPage || q.isFetchingNextPage} />
            {q.isFetchingNextPage && <div className="flex justify-center py-3"><Loader2 className="animate-spin" size={22} style={{ color: "var(--mut)" }} /></div>}
        </div>
    );
}
