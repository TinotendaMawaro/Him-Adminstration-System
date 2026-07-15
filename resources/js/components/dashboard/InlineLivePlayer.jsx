import { useState, useEffect } from "react";
import { Icons } from "../MembersPortal";

export default function InlineLivePlayer({ event }) {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!event?.is_livestream) return;

    const tick = () => {
      setViewerCount((count) => Math.max(0, count + Math.floor(Math.random() * 11) - 5));
    };

    const id = setInterval(tick, 5000);
    setViewerCount(1200 + Math.floor(Math.random() * 200));
    return () => clearInterval(id);
  }, [event?.id, event?.is_livestream]);

  if (!event?.is_livestream || !event.livestream_url) return null;

  const youtubeMatch = event.livestream_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  const videoId = youtubeMatch?.[1];

  return (
    <div className="lux-card overflow-hidden">
      <div className="relative pt-[56.25%] bg-black">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&live=1`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Live stream unavailable
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-gentle-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live Now</span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Icons.Users className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white">{viewerCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 flex flex-wrap items-center gap-2">
        <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
          <Icons.HandsPraying className="w-3 h-3" /> Prayer Request
        </button>
        <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
          <Icons.Heart className="w-3 h-3" /> Give
        </button>
        <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
          <Icons.Clock className="w-3 h-3" /> Watch Later
        </button>
        <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
          <Icons.Share className="w-3 h-3" /> Share Stream
        </button>
      </div>
    </div>
  );
}
