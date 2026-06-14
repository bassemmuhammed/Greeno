// Seed-packet style rotated stamp — used across both customer & owner UI
export function NutrientStamp({ icon: Icon, label, rotate = 0, tone = "deep" }) {
  const palette = {
    deep: { border: "#1F2A1E", color: "#1F2A1E" },
    sage: { border: "#8FA888", color: "#1F2A1E" },
    clay: { border: "#D98B5F", color: "#1F2A1E" },
  };
  const t = palette[tone] ?? palette.deep;
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 border rounded-sm text-[10px] font-bold"
      style={{
        borderColor: t.border,
        color: t.color,
        transform: `rotate(${rotate}deg)`,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={2.5} />}
      {label}
    </div>
  );
}
