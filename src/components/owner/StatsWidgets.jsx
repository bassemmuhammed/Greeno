import { Power } from "lucide-react";

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4 flex-1 min-w-0" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>{label}</p>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FAF7F0" }}>
          <Icon className="w-3.5 h-3.5" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "#6B6557" }}>{sub}</p>}
    </div>
  );
}

export function MiniBarChart({ data }) {
  const max    = Math.max(...data);
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="flex items-end gap-2 h-28 mt-3" dir="ltr">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-md"
            style={{
              height: `${(v / max) * 100}%`,
              backgroundColor: i === data.length - 1 ? "#1F2A1E" : "#8FA888",
              minHeight: "8px",
            }}
          />
          <span className="text-[10px] font-bold" style={{ color: "#A39B86" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusToggleCard({ isOpen, onToggle }) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: "#1F2A1E" }}>
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] mb-1 flex items-center gap-1" style={{ color: "#8FA888" }}>
          <Power className="w-3 h-3" strokeWidth={2.5} />
          STORE STATUS
        </p>
        <p className="text-lg font-bold" style={{ color: "#FAF7F0", fontFamily: "'Fraunces', serif" }}>
          {isOpen ? "Open Now" : "Closed"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#C9C4B4" }}>
          {isOpen ? "Customers can place orders" : "Menu shows as closed to customers"}
        </p>
      </div>
      <button
        onClick={onToggle}
        className="relative w-14 h-8 rounded-full transition-colors shrink-0"
        style={{ backgroundColor: isOpen ? "#8FA888" : "#4A453A" }}
        aria-label="Toggle store open status"
      >
        <div
          className="absolute top-1 w-6 h-6 rounded-full transition-all"
          style={{ backgroundColor: "#FAF7F0", left: isOpen ? "calc(100% - 28px)" : "4px" }}
        />
      </button>
    </div>
  );
}
