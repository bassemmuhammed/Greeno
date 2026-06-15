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

// ─── Add-ons Data ───────────────────────────────────────────────
const ADDONS = [
  { id: "chicken",    label: "Chicken",           detail: "50g",  price: 45 },
  { id: "tuna",       label: "Tuna Diet",         detail: "50g",  price: 40 },
  { id: "egg",        label: "Boiled Egg",        detail: "",     price: 15 },
  { id: "quinoa",     label: "Quinoa",            detail: "",     price: 25 },
  { id: "mushroom",   label: "Mushroom",          detail: "",     price: 30 },
  { id: "avocado",    label: "Avocado",           detail: "",     price: 30 },
  { id: "lettuce",    label: "Lettuce",           detail: "",     price: 10 },
  { id: "arugula",    label: "Arugula",           detail: "",     price: 10 },
  { id: "chickpeas",  label: "Chickpeas",         detail: "",     price: 10 },
  { id: "redbeans",   label: "Red Beans",         detail: "",     price: 10 },
  { id: "redcabbage", label: "Red Cabbage",       detail: "",     price: 10 },
  { id: "bellpepper", label: "Mixed Bell Pepper", detail: "",     price: 10 },
  { id: "carrots",    label: "Carrots",           detail: "",     price: 10 },
  { id: "cucumber",   label: "Cucumber",          detail: "",     price: 10 },
  { id: "beet",       label: "Beet",              detail: "",     price: 10 },
  { id: "sweetcorn",  label: "Sweet Corn",        detail: "",     price: 15 },
  { id: "toast",      label: "Toasted Brown Toast", detail: "",   price: 10 },
  { id: "walnut",     label: "Walnut",            detail: "",     price: 25 },
  { id: "caesar",     label: "Caesar Sauce",      detail: "",     price: 25 },
  { id: "honeymust",  label: "Honey Mustard",     detail: "",     price: 25 },
  { id: "ranch",      label: "Yogurt Ranch",      detail: "",     price: 25 },
  { id: "balsamic",   label: "Honey Balsamic",    detail: "",     price: 25 },
  { id: "soya",       label: "Light Soya",        detail: "",     price: 25 },
  { id: "lemonherb",  label: "Lemon Herb",        detail: "",     price: 25 },
];

// ─── Item Details Bottom Sheet ──────────────────────────────────
function ItemDetailsSheet({ item, onClose, onAdd, isFav, onToggleFav }) {
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showAddons, setShowAddons]         = useState(false);

  // Sizes inside sheet
  const hasSizes    = item.sizes && item.sizes.length > 1;
  const [selectedSize, setSelectedSize] = useState(0);
  const activePrice = hasSizes ? item.sizes[selectedSize].price : item.price;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice  = (activePrice + addonsTotal) * qty;

  const handleAdd = () => {
    const sizeName = hasSizes ? ` (${item.sizes[selectedSize].label})` : "";
    const finalItem = {
      ...item,
      name:   item.name + sizeName,
      price:  activePrice + addonsTotal,
      addons: selectedAddons.map((a) => a.label),
    };
    onAdd(finalItem, qty);
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
        className="w-full max-w-sm rounded-t-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "#FAF7F0", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* Image */}
          {item.image && (
            <div className="relative w-full" style={{ height: 200 }}>
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #FAF7F0 0%, transparent 60%)" }} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(31,42,30,0.6)" }}
              >
                <X className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
              <button
                onClick={onToggleFav}
                className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
                style={{ backgroundColor: isFav ? "#D98B5F" : "rgba(31,42,30,0.6)" }}
              >
                <Heart className="w-4 h-4" style={{ color: "#fff", fill: isFav ? "#fff" : "none" }} strokeWidth={2} />
              </button>
            </div>
          )}

          <div className="px-5 pt-4">
            {/* Name & price */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-2xl font-bold leading-tight" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                {item.name}
              </h2>
              <span className="text-xl font-bold shrink-0 tabular-nums" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                {item.price} EGP
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#6B6557" }}>{item.desc}</p>

            {/* Nutrients */}
            <div className="flex flex-wrap gap-2 mb-4">
              <NutrientStamp icon={Flame} label={`${hasSizes ? item.sizes[selectedSize].cal || item.cal : item.cal} kcal`} rotate={-2} />
              {item.tags.map((tag, i) => (
                <NutrientStamp key={tag} icon={i === 0 ? Leaf : Droplet} label={tag} rotate={i % 2 === 0 ? 1 : -1.5} />
              ))}
            </div>

            {/* ── Size Selector in Sheet ── */}
            {hasSizes && (
              <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "1.5px solid #E4E0D4" }}>
                {item.sizes.map((s, idx) => {
                  const isActive = selectedSize === idx;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setSelectedSize(idx)}
                      className="w-full flex items-center justify-between px-4 py-3 transition-all"
                      style={{
                        backgroundColor: isActive ? "#1F2A1E" : idx > 0 ? "#F5F2EA" : "#fff",
                        borderTop: idx > 0 ? "1px solid #E4E0D4" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            border: `2px solid ${isActive ? "#8FA888" : "#C9C4B8"}`,
                            backgroundColor: isActive ? "#8FA888" : "transparent",
                          }}
                        >
                          {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold" style={{ color: isActive ? "#FAF7F0" : "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                            {s.label}
                          </span>
                          {s.cal && (
                            <span className="text-xs ml-2" style={{ color: isActive ? "#8FA888" : "#9B9589" }}>
                              · {s.cal} kcal
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold tabular-nums" style={{ color: isActive ? "#FAF7F0" : "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                        {s.price} EGP
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Add-ons Toggle ── */}
            <button
              onClick={() => setShowAddons((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-3 transition-all"
              style={{
                backgroundColor: showAddons ? "#1F2A1E" : "#EDE9DF",
                color: showAddons ? "#FAF7F0" : "#1F2A1E",
              }}
            >
              <span className="text-sm font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                🥗 Customize with Add-ons
              </span>
              <div className="flex items-center gap-2">
                {selectedAddons.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#8FA888", color: "#fff" }}
                  >
                    +{selectedAddons.length}
                  </span>
                )}
                <span className="text-xs opacity-70">{showAddons ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* ── Add-ons Grid ── */}
            {showAddons && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ADDONS.map((addon) => {
                  const isSelected = !!selectedAddons.find((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all active:scale-95"
                      style={{
                        backgroundColor: isSelected ? "#1F2A1E" : "#fff",
                        border: `1.5px solid ${isSelected ? "#1F2A1E" : "#E4E0D4"}`,
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold leading-tight" style={{ color: isSelected ? "#FAF7F0" : "#1F2A1E" }}>
                          {addon.label}
                        </p>
                        {addon.detail && (
                          <p className="text-xs" style={{ color: isSelected ? "#8FA888" : "#9B9589" }}>
                            {addon.detail}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-xs font-bold ml-1 shrink-0"
                        style={{ color: isSelected ? "#8FA888" : "#6B6557" }}
                      >
                        +{addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected addons summary */}
            {selectedAddons.length > 0 && (
              <div
                className="flex flex-wrap gap-1.5 mb-4 px-3 py-2.5 rounded-2xl"
                style={{ backgroundColor: "#EDE9DF" }}
              >
                {selectedAddons.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: "#8FA888", color: "#fff" }}
                  >
                    {a.label}
                    <button onClick={() => toggleAddon(a)} className="opacity-70 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Bottom: Qty + Add ── */}
        <div
          className="px-5 pb-8 pt-3"
          style={{ borderTop: "1px solid #E4E0D4", backgroundColor: "#FAF7F0" }}
        >
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
                <><ShoppingBag className="w-4 h-4" strokeWidth={2} /> Add to Order — {totalPrice} EGP</>
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

  // Sizes support: item.sizes = [{label:"Regular", price:175}, {label:"Large", price:230}]
  const hasSizes = item.sizes && item.sizes.length > 1;
  const [selectedSize, setSelectedSize] = useState(0); // index
  const activePrice = hasSizes ? item.sizes[selectedSize].price : item.price;
  const activeItem  = hasSizes ? { ...item, price: activePrice, name: `${item.name} (${item.sizes[selectedSize].label})` } : item;

  const isFav = favorites?.includes(item.id);

  const handleAdd = (e) => {
    e?.stopPropagation();
    onAdd(activeItem, qty);
    setQty(1);
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
              <div className="flex items-center gap-2 shrink-0">
                {/* Size toggle pills */}
                {hasSizes && (
                  <div
                    className="flex rounded-full overflow-hidden"
                    style={{ border: "1.5px solid #E4E0D4" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.sizes.map((s, idx) => (
                      <button
                        key={s.label}
                        onClick={() => setSelectedSize(idx)}
                        className="px-2.5 py-1 text-xs font-bold transition-all"
                        style={{
                          backgroundColor: selectedSize === idx ? "#1F2A1E" : "transparent",
                          color: selectedSize === idx ? "#FAF7F0" : "#6B6557",
                          fontFamily: "'Fraunces', serif",
                          borderRight: idx < item.sizes.length - 1 ? "1.5px solid #E4E0D4" : "none",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <span
                  className="text-base font-bold tabular-nums"
                  style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
                >
                  {activePrice} EGP
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed line-clamp-1" style={{ color: "#6B6557" }}>
              {hasSizes && item.sizes[selectedSize].desc ? item.sizes[selectedSize].desc : item.desc}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <NutrientStamp icon={Flame} label={`${hasSizes ? item.sizes[selectedSize].cal || item.cal : item.cal} kcal`} rotate={-2} />
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
