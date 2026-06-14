const STATUS_STYLES = {
  Delivered:         { bg: "#8FA888", color: "#1F2A1E" },
  "Out for delivery":{ bg: "#D98B5F", color: "#1F2A1E" },
  Preparing:         { bg: "#E4E0D4", color: "#6B6557" },
};

export function OrderRow({ order, onStatusChange }) {
  const tone = STATUS_STYLES[order.status] ?? STATUS_STYLES.Preparing;
  return (
    <div className="border-b py-4" style={{ borderColor: "#E4E0D4" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
          #{order.id}
        </span>
        <span className="text-xs" style={{ color: "#A39B86" }}>{order.time}</span>
      </div>
      <p className="text-xs leading-relaxed mb-2" style={{ color: "#6B6557" }}>{order.items}</p>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs" style={{ color: "#A39B86" }}>{order.phone}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: "#1F2A1E" }}>{order.total} EGP</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {Object.keys(STATUS_STYLES).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(order.id, s)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors"
            style={{
              backgroundColor: order.status === s ? STATUS_STYLES[s].bg : "#FAF7F0",
              color:           order.status === s ? STATUS_STYLES[s].color : "#A39B86",
              border:          order.status === s ? "none" : "1px solid #E4E0D4",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
