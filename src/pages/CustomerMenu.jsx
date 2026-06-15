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
  const timerRef   = useRef(null);
  const elapsedRef = useRef(0);       // ms already consumed before a pause
  const DURATION   = 4000;

  // ── Hold to pause ──
  const [isPaused, setIsPaused] = useState(false);

  // ── Swipe down to close ──
  const [dragY, setDragY]       = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef  = useRef(0);
  const dragYRef   = useRef(0);       // shadow ref so onTouchEnd reads latest value

  const onTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsPaused(true);
  };
  const onTouchMove = (e) => {
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      dragYRef.current = delta;
      setDragY(delta);
    }
  };
  const onTouchEnd = () => {
    setIsDragging(false);
    const dy = dragYRef.current;
    if (dy > 90) {
      // close instantly — no animation
      dragYRef.current = 0;
      onClose();
    } else {
      // snap back, resume timer
      dragYRef.current = 0;
      setDragY(0);
      setIsPaused(false);
    }
  };

  // ── Timer: pauses while finger is held ──
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
  }, [current]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(timerRef.current);
      return;
    }
    const start = Date.now() - elapsedRef.current;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= DURATION) {
        clearInterval(timerRef.current);
        if (current < images.length - 1) setCurrent((p) => p + 1);
        else onClose();
      }
    }, 30);
    return () => clearInterval(timerRef.current);
  }, [current, isPaused]);

  const prev = () => { if (current > 0) setCurrent((p) => p - 1); };
  const next = () => { if (current < images.length - 1) setCurrent((p) => p + 1); else onClose(); };

  const dragOpacity = Math.max(1 - dragY / 320, 0);
  const dragScale   = Math.max(1 - dragY / 900, 0.88);

  // Current story object: { url, caption, tagX, tagY } — caption position
  // (tagX/tagY, in %) is set by the owner from the dashboard.
  const story = images[current];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: "#000",
        touchAction: "none",
        transform: `translateY(${dragY}px) scale(${dragScale})`,
        opacity: dragOpacity,
        transition: isDragging ? "none" : "transform 0.18s ease-out, opacity 0.18s ease-out",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Blurred background — fills entire screen */}
      <div style={{
        position: "absolute", inset: "-40px",
        backgroundImage: `url(${story.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(50px) brightness(0.22) saturate(1.8)",
        zIndex: 0,
      }} />

      {/* Main image — centered in full screen */}
      <img
        src={story.url}
        alt={`story-${current}`}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 1,
        }}
      />

      {/* Progress bars — overlaid on top */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-2 pb-2" style={{ zIndex: 10 }}>
        {images.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
            <div
              className="h-full rounded-full transition-none"
              style={{ backgroundColor: "#fff", width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button onClick={onClose} className="absolute right-4 z-20 p-2" style={{ top: "0.5rem" }}>
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Caption tag */}
      {story.caption && (
        <div
          style={{
            position: "absolute",
            left: `${story.tagX ?? 50}%`,
            top: `${story.tagY ?? 88}%`,
            transform: "translate(-50%, -50%)",
            maxWidth: "85%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            dir="rtl"
            style={{
              background: "linear-gradient(135deg, rgba(31,42,30,0.92) 0%, rgba(31,42,30,0.85) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 18,
              padding: "12px 20px",
              border: "1px solid rgba(143,168,136,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(143,168,136,0.5)" }} />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: "#8FA888" }}>
                <path d="M12 2C6 2 3 8 3 12c0 5 4 10 9 10 1-4 0-8-2-10 3 1 6 4 6 8 2-2 5-6 5-10C21 5 17 2 12 2z" fill="#8FA888" />
              </svg>
              <div style={{ height: 1, flex: 1, background: "rgba(143,168,136,0.5)" }} />
            </div>
            <p
              style={{
                color: "#FAF7F0",
                fontWeight: 800,
                fontSize: 15,
                fontFamily: "'Fraunces', serif",
                textAlign: "center",
                margin: 0,
                whiteSpace: "pre-wrap",
                letterSpacing: "0.01em",
                lineHeight: 1.4,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {story.caption}
            </p>
          </div>
        </div>
      )}

      {/* Tap zones — left = prev, right = next */}
      <div className="absolute inset-0 flex" style={{ zIndex: 5 }}>
        <div className="flex-1" onClick={prev} style={{ cursor: "pointer" }} />
        <div className="flex-1" onClick={next} style={{ cursor: "pointer" }} />
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
  const [trackerOrderId, setTrackerOrderId] = useState(() => {
    try { return localStorage.getItem("greenо_tracker") || null; }
    catch { return null; }
  });

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

  // Load story images (with caption + tag position set by the owner)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("story_images")
        .select("url, caption, tag_x, tag_y")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setStoryImages(data.map((r) => ({
          url: r.url,
          caption: r.caption || "",
          tagX: r.tag_x,
          tagY: r.tag_y,
        })));
      }
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
      localStorage.setItem("greenо_tracker", orderId);
    } catch (err) {
      console.error("Order save failed:", err);
      const newCount = incrementOrders();
      clear();
      setShowOrder(false);
      setShowSuccess(true);
      const fallbackId = 1000 + newCount;
      setTrackerOrderId(fallbackId);
      localStorage.setItem("greenо_tracker", fallbackId);
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
              {/* Story circle */}
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

            {/* ── Track Order Banner ── */}
            {trackerOrderId && (
              <button
                onClick={() => setShowTracker(true)}
                className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden relative"
                style={{
                  backgroundColor: "#1F2A1E",
                  boxShadow: "0 2px 12px rgba(31,42,30,0.18)",
                }}
              >
                {/* Shimmer sweep */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(100deg, transparent 20%, rgba(143,168,136,0.18) 50%, transparent 80%)",
                    animation: "shimmer 2.2s infinite",
                  }}
                />
                <style>{`
                  @keyframes shimmer {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  @keyframes ping-slow {
                    0%, 100% { transform: scale(1);   opacity: 1; }
                    50%       { transform: scale(1.55); opacity: 0; }
                  }
                `}</style>

                {/* Pulse dot */}
                <span className="relative flex shrink-0" style={{ width: 10, height: 10 }}>
                  <span
                    className="absolute inline-flex rounded-full"
                    style={{
                      width: 10, height: 10,
                      backgroundColor: "#8FA888",
                      animation: "ping-slow 1.4s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="relative inline-flex rounded-full"
                    style={{ width: 10, height: 10, backgroundColor: "#8FA888" }}
                  />
                </span>

                <div className="flex-1 text-left">
                  <p className="text-xs font-bold" style={{ color: "#8FA888", fontFamily: "'Fraunces', serif", letterSpacing: "0.08em" }}>
                    ORDER IN PROGRESS
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#FAF7F0", fontFamily: "'Fraunces', serif" }}>
                    Track Order #{trackerOrderId}
                  </p>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#8FA888", shrink: 0 }}>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* ── Daily Special ── */}
          <div className="px-4 mb-4">
            <DailySpecialCard special={specialItem} onAdd={addToCart} />
          </div>

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
          {totalItems > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4" style={{ backgroundColor: "transparent", pointerEvents: "none" }}>
              <div style={{ maxWidth: "100vw", margin: "0 auto", pointerEvents: "auto" }}>
                <button
                  className="w-full py-4 rounded-2xl flex items-center justify-between px-5"
                  style={{ backgroundColor: "#1F2A1E", boxShadow: "0 4px 24px rgba(31,42,30,0.25)" }}
                  onClick={() => setShowOrder(true)}
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
          )}
        </div>

        {showWelcome && <WelcomePromo onClose={() => setShowWelcome(false)} />}
        {showSuccess  && <SuccessToast onDone={() => setShowSuccess(false)} />}
        {showTracker  && (
          <OrderTracker
            orderNumber={trackerOrderId}
            onClose={() => setShowTracker(false)}
            onDelivered={() => {
              localStorage.removeItem("greenо_tracker");
              setTrackerOrderId(null);
              setShowTracker(false);
            }}
          />
        )}

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
