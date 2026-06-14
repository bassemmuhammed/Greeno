import { useState, useEffect } from "react";
import { Flame, Leaf, Droplet, Plus, Minus, Heart, X, ShoppingBag } from "lucide-react";
import { NutrientStamp } from "../shared/NutrientStamp";

// ─── Skeleton Card ──────────────────────────────────────────────
export function MenuItemSkeleton() {
  return (
    <div className="border-b py-5 animate-pulse" style={{ borderColor: "#E4E0D4" }}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <div className="h-5 w-32 rounded-full" style={{ backgroundColor: "#E4E0D4" }} />
            <div className="h-5 w-16 rounded-full" style={{ backgroundColor: "#E4E0D4" }} />
          </div>
          <div className="h-3 w-48 rounded-full mb-3" style={{ backgroundColor: "#E4E0D4" }} />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full" style={{ backgroundColor: "#E4E0D4" }} />
            <div className="h-6 w-16 rounded-full" style={{ backgroundColor: "#E4E0D4" }} />
          </div>
        </div>
        <div className="w-20 h-20 rounded-2xl shrink-0" style={{ backgroundColor: "#E4E0D4" }} />
      </div>
    </div>
  );
}

// ─── Item Details Bottom Sheet ──────────────────────────────────
function ItemDetailsSheet({ item, onClose, onAdd, isFav, onToggleFav }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleAdd = () => {
    onAdd(item, qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(31,42,30,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: "#FAF7F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {item.image && (
          <div className="relative w-full" style={{ height: 220 }}>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #FAF7F0 0%, transparent 60%)" }} />
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(31,42,30,0.6)" }}
            >
              <X className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
            {/* Fav on image */}
            <button
              onClick={onToggleFav}
              className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ backgroundColor: isFav ? "#D98B5F" : "rgba(31,42,30,0.6)" }}
            >
              <Heart className="w-4 h-4" style={{ color: "#fff", fill: isFav ? "#fff" : "none" }} strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="px-6 pt-4 pb-8">
          {/* Name & price */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-2xl font-bold leading-tight" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
              {item.name}
            </h2>
            <span className="text-xl font-bold shrink-0 tabular-nums" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
              {item.price} EGP
            </span>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B6557" }}>{item.desc}</p>

          {/* Nutrients */}
          <div className="flex flex-wrap gap-2 mb-5">
            <NutrientStamp icon={Flame} label={`${item.cal} kcal`} rotate={-2} />
            {item.tags.map((tag, i) => (
              <NutrientStamp key={tag} icon={i === 0 ? Leaf : Droplet} label={tag} rotate={i % 2 === 0 ? 1 : -1.5} />
            ))}
          </div>

          {/* Qty + Add */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border" style={{ borderColor: "#E4E0D4" }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
              </button>
              <span className="text-sm font-bold w-5 text-center tabular-nums" style={{ color: "#1F2A1E" }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>
                <Plus className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
              </button>
            </div>

            <button
              className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all"
              style={{
                backgroundColor: added ? "#8FA888" : "#1F2A1E",
                transform: added ? "scale(0.97)" : "scale(1)",
                fontFamily: "'Fraunces', serif",
              }}
              onClick={handleAdd}
            >
              {added ? (
                <>✓ Added!</>
              ) : (
                <><ShoppingBag className="w-4 h-4" strokeWidth={2} /> Add to Order — {item.price * qty} EGP</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Menu Item ──────────────────────────────────────────────────
export function MenuItem({ item, onAdd, favorites, onToggleFav }) {
  const [qty, setQty]         = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [addFlash, setAddFlash]   = useState(false);

  const isFav = favorites?.includes(item.id);

  const handleAdd = (e) => {
    e?.stopPropagation();
    onAdd(item, qty);
    setQty(1);
    // Flash animation
    setAddFlash(true);
    setTimeout(() => setAddFlash(false), 500);
  };

  return (
    <>
      <div
        className="border-b py-5 cursor-pointer"
        style={{ borderColor: "#E4E0D4" }}
        onClick={() => setShowSheet(true)}
      >
        <div className="flex items-start gap-3" dir="ltr">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg font-bold leading-snug"
                  style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
                >
                  {item.name}
                </h3>
                {/* Fav heart */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFav?.(item.id); }}
                  className="transition-transform active:scale-75"
                  style={{ lineHeight: 1 }}
                >
                  <Heart
                    className="w-4 h-4"
                    style={{ color: isFav ? "#D98B5F" : "#C9C4B8", fill: isFav ? "#D98B5F" : "none" }}
                    strokeWidth={2}
                  />
                </button>
              </div>
              <span
                className="text-base font-bold shrink-0 tabular-nums"
                style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
              >
                {item.price} EGP
              </span>
            </div>

            <p className="text-sm leading-relaxed line-clamp-1" style={{ color: "#6B6557" }}>
              {item.desc}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <NutrientStamp icon={Flame} label={`${item.cal} kcal`} rotate={-2} />
              {item.tags.map((tag, i) => (
                <NutrientStamp key={tag} icon={i === 0 ? Leaf : Droplet} label={tag} rotate={i % 2 === 0 ? 1 : -1.5} />
              ))}
            </div>
          </div>

          {/* Item image thumbnail */}
          {item.image && (
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden shrink-0"
              style={{ border: "1px solid #E4E0D4" }}
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
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

          {/* Add button with flash animation */}
          <button
            className="px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold text-white transition-all"
            style={{
              backgroundColor: addFlash ? "#8FA888" : item.color,
              transform: addFlash ? "scale(1.12)" : "scale(1)",
            }}
            onClick={handleAdd}
          >
            <Plus
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: addFlash ? "rotate(45deg)" : "rotate(0deg)" }}
              strokeWidth={3}
            />
            {addFlash ? "Added!" : "Add"}
          </button>
        </div>
      </div>

      {showSheet && (
        <ItemDetailsSheet
          item={item}
          onClose={() => setShowSheet(false)}
          onAdd={(itm, q) => { onAdd(itm, q); }}
          isFav={isFav}
          onToggleFav={() => onToggleFav?.(item.id)}
        />
      )}
    </>
  );
}
