import { useState } from "react";
import { Flame, Leaf, Droplet, Plus, Minus } from "lucide-react";
import { NutrientStamp } from "../shared/NutrientStamp";

export function MenuItem({ item, onAdd }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty]   = useState(1);

  return (
    <div
      className="border-b py-5 cursor-pointer"
      style={{ borderColor: "#E4E0D4" }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start gap-3" dir="ltr">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3
              className="text-lg font-bold leading-snug"
              style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
            >
              {item.name}
            </h3>
            <span
              className="text-base font-bold shrink-0 tabular-nums"
              style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
            >
              {item.price} EGP
            </span>
          </div>

          <p
            className={`text-sm leading-relaxed transition-all ${open ? "" : "line-clamp-1"}`}
            style={{ color: "#6B6557" }}
          >
            {item.desc}
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <NutrientStamp icon={Flame} label={`${item.cal} kcal`} rotate={-2} />
            {item.tags.map((tag, i) => (
              <NutrientStamp
                key={tag}
                icon={i === 0 ? Leaf : Droplet}
                label={tag}
                rotate={i % 2 === 0 ? 1 : -1.5}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-3 mt-3"
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-2">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#E4E0D4" }}
          >
            <Minus className="w-3 h-3" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
          </button>
          <span className="text-sm font-bold tabular-nums w-4 text-center" style={{ color: "#1F2A1E" }}>
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#E4E0D4" }}
          >
            <Plus className="w-3 h-3" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
          </button>
        </div>
        <button
          className="px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: item.color }}
          onClick={() => { onAdd(item, qty); setQty(1); }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          Add
        </button>
      </div>
    </div>
  );
}
