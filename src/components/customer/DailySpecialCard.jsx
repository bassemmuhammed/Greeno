import { Plus, Sparkles } from "lucide-react";

export function DailySpecialCard({ special, onAdd }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ backgroundColor: "#1F2A1E" }}>
      <div
        className="absolute top-3 -right-8 px-9 py-1 text-[10px] font-bold tracking-[0.15em] rotate-45 pointer-events-none z-0"
        style={{ backgroundColor: "#D98B5F", color: "#1F2A1E" }}
      >
        SPECIAL
      </div>

      <div className="relative z-10">
        <p
          className="text-[10px] font-bold tracking-[0.2em] mb-1.5 flex items-center gap-1"
          style={{ color: "#8FA888" }}
        >
          <Sparkles className="w-3 h-3" strokeWidth={2.5} />
          DAILY SPECIAL
        </p>
        <h3
          className="text-xl font-bold leading-snug mb-1 pr-16"
          style={{ color: "#FAF7F0", fontFamily: "'Fraunces', serif" }}
        >
          {special.name}
        </h3>
        <p className="text-xs leading-relaxed mb-3 pr-10" style={{ color: "#C9C4B4" }}>
          {special.desc}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "#FAF7F0", fontFamily: "'Fraunces', serif" }}
            >
              {special.price} EGP
            </span>
            <span className="text-xs line-through tabular-nums" style={{ color: "#6B6557" }}>
              {special.originalPrice} EGP
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAdd(special, 1)}
            className="px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
            style={{ backgroundColor: "#8FA888", color: "#1F2A1E" }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
