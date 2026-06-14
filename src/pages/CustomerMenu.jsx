import { useState, useRef, useEffect } from "react";
import { Leaf, Search, ShoppingBag, X, Clock } from "lucide-react";
import { DAILY_SPECIAL } from "../data/menuData";
import { useMenuItems, useOrders, useSettings } from "../hooks/useSupabase";
import { useCart } from "../hooks/useCart";
import { useCustomer } from "../hooks/useCustomer";
import { MenuItem, MenuItemSkeleton } from "../components/customer/MenuItem";
import { DailySpecialCard } from "../components/customer/DailySpecialCard";
import { OrderModal } from "../components/customer/OrderModal";
import { OrderTracker } from "../components/customer/OrderTracker";
import { WelcomePromo, SuccessToast } from "../components/customer/Overlays";
import { supabase } from "../data/supabase";

// ─── Story Viewer ──────────────────────────────────────────────
function StoryViewer({ images, onClose }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const DURATION = 4000;

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= DURATION) {
        clearInterval(timerRef.current);
        if (current < images.length - 1) setCurrent((p) => p + 1);
        else onClose();
      }
    }, 30);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const prev = () => { if (current > 0) setCurrent((p) => p - 1); };
  const next = () => { if (current < images.length - 1) setCurrent((p) => p + 1); else onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#000", touchAction: "none" }}>
      <div className="flex gap-1 px-3 pt-10 pb-2">
        {images.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
            <div
              className="h-full rounded-full transition-none"
              style={{ backgroundColor: "#fff", width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>
      <button onClick={onClose} className="absolute top-10 right-4 z-10 p-2">
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <img src={images[current]} alt={`story-${current}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        <div className="absolute inset-0 flex">
          <div className="flex-1" onClick={prev} />
          <div className="flex-1" onClick={next} />
        </div>
      </div>
    </div>
  );
}

// ─── Story Circle ──────────────────────────────────────────────
function StoryCircle({ onOpenStory, hasStory }) {
  return (
    <button onClick={onOpenStory} className="relative flex items-center justify-center focus:outline-none" style={{ width: 72, height: 72, borderRadius: "50%" }}>
      {hasStory && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, #8FA888 0%, #1F2A1E 50%, #D98B5F 100%)", padding: 3 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#FAF7F0" }} />
        </div>
      )}
      <div style={{ position: "absolute", inset: hasStory ? 5 : 0, borderRadius: "50%", backgroundColor: "#1F2A1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Leaf style={{ width: 26, height: 26, color: "#fff" }} strokeWidth={2} />
      </div>
    </button>
  );
}

// ─── Empty State ───────────────────────────────────────────────
function EmptyState({ searchTerm }) {
  return (
    <div className="py-14 flex flex-col items-center gap-4">
      {/* Simple SVG illustration */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="#F0EDE4" />
        <ellipse cx="40" cy="54" rx="16" ry="5" fill="#E4E0D4" />
        <path d="M28 38 Q40 22 52 38" stroke="#C9C4B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="33" cy="39" r="2.5" fill="#C9C4B8" />
        <circle cx="47" cy="39" r="2.5" fill="#C9C4B8" />
        <path d="M34 46 Q40 50 46 46" stroke="#C9C4B8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M56 18 Q62 12 68 18 Q62 24 56 18Z" fill="#8FA888" opacity="0.5" />
        <path d="M14 26 Q18 20 22 26 Q18 32 14 26Z" fill="#D98B5F" opacity="0.4" />
      </svg>
      <div className="text-center">
        <p className="text-base font-bold mb-1" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
          Nothing here yet
        </p>
        <p className="text-sm" style={{ color: "#A39B86" }}>
          {searchTerm ? `No dishes match "${searchTerm}"` : "No items in this category"}
        </p>
      </div>
    </div>
  );
}

// ─── Recently Ordered Banner ───────────────────────────────────
function RecentlyOrderedBanner({ items, onAdd }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5" style={{ color: "#A39B86" }} />
        <span className="text-xs font-bold tracking-[0.12em]" style={{ color: "#A39B86" }}>ORDER AGAIN?</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAdd(item, 1)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shrink-0 transition-all active:scale-95"
            style={{ borderColor: "#E4E0D4", backgroundColor: "#FFFFFF" }}
          >
            {item.image && (
              <img src={item.image} alt={item.name} className="w-7 h-7 rounded-lg object-cover" />
            )}
            <div className="text-left">
              <p className="text-xs font-bold" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>{item.name}</p>
              <p className="text-xs" style={{ color: "#A39B86" }}>{item.price} EGP</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function CustomerMenu() {
  const { items, loading: itemsLoading } = useMenuItems();
  const { settings } = useSettings();
  const { placeOrder } = useOrders();

  const { cart, addToCart, inc, dec, clear, totalItems, totalPrice } = useCart();
  const { phone, setPhone, address, setAddress, note, setNote, orderCount, incrementOrders } = useCustomer();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm,     setSearchTerm]     = useState("");
  const [showOrder,      setShowOrder]      = useState(false);
  const [showWelcome,    setShowWelcome]    = useState(true);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [showTracker,    setShowTracker]    = useState(false);
  const [trackerOrderId, setTrackerOrderId] = useState(null);

  // Story state
  const [storyImages, setStoryImages] = useState([]);
  const [showStory,   setShowStory]   = useState(false);

  // Lock body scroll when any modal/sheet is open
  useEffect(() => {
    const locked = showOrder || showTracker || showStory;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showOrder, showTracker, showStory]);

  // ── Favorites ──
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("greenо_favorites") || "[]"); }
    catch { return []; }
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("greenо_favorites", JSON.stringify(next));
      return next;
    });
  };

  // ── Recently Ordered ──
  const [recentlyOrdered, setRecentlyOrdered] = useState(() => {
    try { return JSON.parse(localStorage.getItem("greenо_recent") || "[]"); }
    catch { return []; }
  });

  // Load story images
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("story_images").select("url").order("created_at", { ascending: true });
      if (!error && data) setStoryImages(data.map((r) => r.url));
    })();
  }, []);

  const config         = settings || {};
  const isOpen         = config.isOpen ?? false;
  const restaurantName = config.restaurantName || "greenó";
  const tagline        = config.tagline        || "Eat Clean. Live Green.";
  const deliveryTime   = config.deliveryTime   || "30–45 min";
  const categories     = ["All", "Favorites", ...(config.categories || ["Salads", "Bowls", "Smoothies", "Treats"])];

  const allItems    = items.length > 0 ? items : [];
  const specialItem = allItems.find((i) => i.isSpecial) || DAILY_SPECIAL;
  const menuItems   = allItems.filter((i) => !i.isSpecial);

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "Favorites") return favorites.includes(item.id);
    const matchesCat    = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.desc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch && item.available;
  });

  // Recently ordered items resolved to full item objects
  const recentItems = recentlyOrdered
    .map((id) => menuItems.find((i) => i.id === id))
    .filter(Boolean)
    .slice(0, 5);

  const handleOrderPlaced = async () => {
    // Save recently ordered
    const orderedIds = cart.map((c) => c.id);
    setRecentlyOrdered((prev) => {
      const merged = [...new Set([...orderedIds, ...prev])].slice(0, 10);
      localStorage.setItem("greenо_recent", JSON.stringify(merged));
      return merged;
    });

    try {
      const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
      const fee      = config.deliveryFee || 20;
      const total    = subtotal + fee;
      const saved    = await placeOrder({ cart, phone, address, note, total });
      const orderId  = saved?.id || (1000 + orderCount + 1);
      incrementOrders();
      clear();
      setShowOrder(false);
      setShowSuccess(true);
      setTrackerOrderId(orderId);
    } catch (err) {
      console.error("Order save failed:", err);
      const newCount = incrementOrders();
      clear();
      setShowOrder(false);
      setShowSuccess(true);
      setTrackerOrderId(1000 + newCount);
    }
  };

  return (
    <>
      {showStory && storyImages.length > 0 && (
        <StoryViewer images={storyImages} onClose={() => setShowStory(false)} />
      )}

      <div className="w-full min-h-dvh flex justify-center" style={{ backgroundColor: "#EFEBE1", fontFamily: "'Inter', sans-serif" }} dir="ltr">
        <div className="w-full min-h-dvh flex flex-col relative" style={{ backgroundColor: "#FAF7F0", maxWidth: "100vw" }}>

          {/* ── Header ── */}
          <div className="px-4 pt-8 pb-3" dir="ltr">
            <div className="flex items-center gap-4">
              {/* Story circle — جنب الاسم مش فوقه */}
              <StoryCircle hasStory={storyImages.length > 0} onOpenStory={() => storyImages.length > 0 && setShowStory(true)} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif", letterSpacing: "-0.01em" }}
                >
                  {restaurantName}
                </h1>
                <p className="text-xs mb-2" style={{ color: "#6B6557" }}>{tagline}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: isOpen ? "#8FA888" : "#E4E0D4", color: isOpen ? "#1F2A1E" : "#8A8578" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOpen ? "#1F2A1E" : "#A39B86" }} />
                    {isOpen ? "Open Now" : "Closed"}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#E4E0D4", color: "#6B6557" }}
                  >
                    {deliveryTime}
                  </span>
                </div>
              </div>
            </div>

            {orderCount > 0 && (
              <p className="text-xs mt-2" style={{ color: "#A39B86" }}>
                🌿 You've ordered {orderCount} time{orderCount > 1 ? "s" : ""} — order {Math.max(0, 5 - (orderCount % 5))} more for a free treat!
              </p>
            )}
          </div>

          {/* ── Daily Special ── */}
          <div className="px-4 mb-4">
            <DailySpecialCard special={specialItem} onAdd={addToCart} />
          </div>

          {/* ── Recently Ordered ── */}
          {recentItems.length > 0 && (
            <RecentlyOrderedBanner items={recentItems} onAdd={addToCart} />
          )}

          {/* ── Search ── */}
          <div className="px-4 mb-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-full border" style={{ borderColor: "#E4E0D4", backgroundColor: "#FFFFFF" }}>
              <Search className="w-4 h-4 shrink-0" style={{ color: "#A39B86" }} strokeWidth={2.5} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search a dish or ingredient..."
                className="text-sm bg-transparent outline-none w-full"
                style={{ color: "#1F2A1E" }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X className="w-4 h-4" style={{ color: "#A39B86" }} />
                </button>
              )}
            </div>
          </div>

          {/* ── Category Pills ── */}
          <div className="px-4 mb-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-bold shrink-0 transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: activeCategory === cat ? "#1F2A1E" : "transparent",
                  color:           activeCategory === cat ? "#FAF7F0" : "#6B6557",
                  border:          activeCategory === cat ? "none" : "1px solid #E4E0D4",
                  fontFamily:      "'Fraunces', serif",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Section Label ── */}
          <div className="px-4 mt-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>
              {activeCategory === "All" ? "01 — TODAY'S PICKS" : activeCategory.toUpperCase()}
            </span>
            <span className="text-xs font-medium" style={{ color: "#A39B86" }}>
              {itemsLoading ? "—" : `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* ── Items ── */}
          <div className="px-4 flex-1 pb-28">
            {itemsLoading ? (
              // ── Skeleton Loading ──
              Array.from({ length: 5 }).map((_, i) => <MenuItemSkeleton key={i} />)
            ) : filteredItems.length === 0 ? (
              <EmptyState searchTerm={searchTerm} />
            ) : (
              filteredItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onAdd={addToCart}
                  favorites={favorites}
                  onToggleFav={toggleFavorite}
                />
              ))
            )}
          </div>

          {/* ── FAB Cart ── */}
          <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4" style={{ backgroundColor: "transparent", pointerEvents: "none" }}>
            <div style={{ maxWidth: "100vw", margin: "0 auto", pointerEvents: "auto" }}>
              {trackerOrderId && (
                <button
                  onClick={() => setShowTracker(true)}
                  className="w-full mb-2 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border transition-colors"
                  style={{ borderColor: "#8FA888", color: "#1F2A1E", backgroundColor: "#FAF7F0", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#8FA888" }} />
                  Track Order #{trackerOrderId}
                </button>
              )}
              <button
                className="w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-opacity"
                style={{ backgroundColor: "#1F2A1E", opacity: totalItems === 0 ? 0.45 : 1, boxShadow: "0 4px 24px rgba(31,42,30,0.25)", pointerEvents: totalItems === 0 ? "none" : "auto" }}
                onClick={() => setShowOrder(true)}
                disabled={totalItems === 0}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>View Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#8FA888", color: "#1F2A1E" }}>{totalItems}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{totalPrice} EGP</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {showWelcome && <WelcomePromo onClose={() => setShowWelcome(false)} />}
        {showSuccess  && <SuccessToast onDone={() => setShowSuccess(false)} />}
        {showTracker  && <OrderTracker orderNumber={trackerOrderId} onClose={() => setShowTracker(false)} />}

        {showOrder && (
          <OrderModal
            cart={cart}
            onClose={() => setShowOrder(false)}
            onInc={inc} onDec={dec}
            phone={phone}     setPhone={setPhone}
            address={address} setAddress={setAddress}
            note={note}       setNote={setNote}
            onPlaced={handleOrderPlaced}
            deliveryFee={config.deliveryFee}
            minOrder={config.minOrder}
            whatsapp={config.whatsappNumber}
          />
        )}
      </div>
    </>
  );
}
