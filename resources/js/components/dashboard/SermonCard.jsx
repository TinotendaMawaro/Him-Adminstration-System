export default function SermonCard({ sermon }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm">🎵</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{sermon.title}</p>
        <p className="text-[10px] text-gray-400">{sermon.category}</p>
      </div>
      <button className="text-[10px] text-[#d4af37] font-semibold hover:text-amber-400">
        Watch →
      </button>
    </div>
  );
}
