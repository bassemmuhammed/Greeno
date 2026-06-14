import { useState, useRef, useEffect } from "react";
import { Leaf, Search, ShoppingBag, X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DAILY_SPECIAL } from "../data/menuData";
import { useMenuItems, useOrders, useSettings } from "../hooks/useSupabase";
import { useCart } from "../hooks/useCart";
import { useCustomer } from "../hooks/useCustomer";
import { MenuItem } from "../components/customer/MenuItem";
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
        if (current < images.length - 1) {
          setCurrent((p) => p + 1);
        } else {
          onClose();
        }
      }
    }, 30);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const prev = () => { if (current > 0) setCurrent((p) => p - 1); };
  const next = () => { if (current < images.length - 1) setCurrent((p) => p + 1); else onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#000", touchAction: "none" }}
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-10 pb-2">
        {images.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
            <div
              className="h-full rounded-full transition-none"
              style={{
                backgroundColor: "#fff",
                width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Close */}
      <button onClick={onClose} className="absolute top-10 right-4 z-10 p-2">
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Image */}
      <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <img
          src={images[current]}
          alt={`story-${current}`}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
          }}
        />
        {/* Tap zones */}
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
    <button
      onClick={onOpenStory}
      className="relative flex items-center justify-center focus:outline-none"
      style={{ width: 72, height: 72, borderRadius: "50%" }}
    >
      {/* Gradient ring */}
      {hasStory && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8FA888 0%, #1F2A1E 50%, #D98B5F 100%)",
            padding: 3,
          }}
        >
          {/* White gap between ring and icon */}
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#FAF7F0" }} />
        </div>
      )}
      {/* Icon circle */}
      <div
        style={{
          position: "absolute",
          inset: hasStory ? 5 : 0,
          borderRadius: "50%",
          backgroundColor: "#1F2A1E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Leaf style={{ width: 26, height: 26, color: "#fff" }} strokeWidth={2} />
      </div>
    </button>
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
  const [storyImages,  setStoryImages]  = useState([]);
  const [showStory,    setShowStory]    = useState(false);

  // Load story images from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("story_images")
        .select("url")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setStoryImages(data.map((r) => r.url));
      }
    })();
  }, []);

  const config           = settings || {};
  const isOpen           = config.isOpen ?? false;
  const restaurantName   = config.restaurantName || "greenó";
  const tagline          = config.tagline        || "Eat Clean. Live Green.";
  const deliveryTime     = config.deliveryTime   || "30–45 min";
  const categories       = ["All", ...(config.categories || ["Salads", "Bowls", "Smoothies", "Treats"])];

  const allItems    = items.length > 0 ? items : [];
  const specialItem = allItems.find((i) => i.isSpecial) || DAILY_SPECIAL;
  const menuItems   = allItems.filter((i) => !i.isSpecial);

  const filteredItems = menuItems.filter((item) => {
    const matchesCat    = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.desc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch && item.available;
  });

  const handleOrderPlaced = async () => {
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
      {/* Story Viewer */}
      {showStory && storyImages.length > 0 && (
        <StoryViewer images={storyImages} onClose={() => setShowStory(false)} />
      )}

      <div
        className="w-full min-h-dvh flex justify-center"
        style={{ backgroundColor: "#EFEBE1", fontFamily: "'Inter', sans-serif" }}
        dir="ltr"
      >
        <div
          className="w-full min-h-dvh flex flex-col relative"
          style={{ backgroundColor: "#FAF7F0", maxWidth: "100vw" }}
        >

          {/* ── Header ── */}
          <div className="px-4 pt-8 pb-4" dir="ltr">
            <div className="flex flex-col items-center text-center gap-2">

              {/* Story Circle */}
              <StoryCircle
                hasStory={storyImages.length > 0}
                onOpenStory={() => storyImages.length > 0 && setShowStory(true)}
              />

              <h1
                className="text-3xl font-bold leading-tight"
                style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif", letterSpacing: "-0.01em" }}
              >
                {restaurantName}
              </h1>
              <p className="text-xs" style={{ color: "#6B6557" }}>{tagline}</p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: isOpen ? "#8FA888" : "#E4E0D4", color: isOpen ? "#1F2A1E" : "#8A8578" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOpen ? "#1F2A1E" : "#A39B86" }} />
                  {isOpen ? "Open Now" : "Closed"}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "#E4E0D4", color: "#6B6557" }}
                >
                  {deliveryTime}
                </span>
              </div>

              {orderCount > 0 && (
                <p className="text-xs" style={{ color: "#A39B86" }}>
                  🌿 You've ordered {orderCount} time{orderCount > 1 ? "s" : ""} — order {Math.max(0, 5 - (orderCount % 5))} more for a free treat!
                </p>
              )}
            </div>
          </div>

          {/* ── Daily Special ── */}
          <div className="px-4 mb-4">
            <DailySpecialCard special={specialItem} onAdd={addToCart} />
          </div>

          {/* ── Search ── */}
          <div className="px-4 mb-3">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-full border"
              style={{ borderColor: "#E4E0D4", backgroundColor: "#FFFFFF" }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: "#A39B86" }} strokeWidth={2.5} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search a dish or ingredient..."
                className="text-sm bg-transparent outline-none w-full"
                style={{ color: "#1F2A1E" }}
              />
            </div>
          </div>

          {/* ── Category Pills ── */}
          <div
            className="px-4 mb-2 flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-bold shrink-0 transition-colors"
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
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Items ── */}
          <div className="px-4 flex-1 pb-28">
            {itemsLoading ? (
              <div className="py-10 text-center">
                <p className="text-sm animate-pulse" style={{ color: "#A39B86" }}>Loading menu…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: "#A39B86" }}>No dishes match your search.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <MenuItem key={item.id} item={item} onAdd={addToCart} />
              ))
            )}
          </div>

          {/* ── FAB Cart Button (Fixed Footer) ── */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4"
            style={{ backgroundColor: "transparent", pointerEvents: "none" }}
          >
            <div style={{ maxWidth: "100vw", margin: "0 auto", pointerEvents: "auto" }}>
              {/* Track order button */}
              {trackerOrderId && (
                <button
                  onClick={() => setShowTracker(true)}
                  className="w-full mb-2 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border transition-colors"
                  style={{
                    borderColor: "#8FA888",
                    color: "#1F2A1E",
                    backgroundColor: "#FAF7F0",
                    boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#8FA888" }} />
                  Track Order #{trackerOrderId}
                </button>
              )}

              {/* View Order FAB */}
              <button
                className="w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-opacity"
                style={{
                  backgroundColor: "#1F2A1E",
                  opacity: totalItems === 0 ? 0.45 : 1,
                  boxShadow: "0 4px 24px rgba(31,42,30,0.25)",
                  pointerEvents: totalItems === 0 ? "none" : "auto",
                }}
                onClick={() => setShowOrder(true)}
                disabled={totalItems === 0}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                    View Order
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: "#8FA888", color: "#1F2A1E" }}
                  >
                    {totalItems}
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">{totalPrice} EGP</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {showWelcome && <WelcomePromo onClose={() => setShowWelcome(false)} />}
        {showSuccess  && <SuccessToast onDone={() => setShowSuccess(false)} />}
        {showTracker  && (
          <OrderTracker orderNumber={trackerOrderId} onClose={() => setShowTracker(false)} />
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
