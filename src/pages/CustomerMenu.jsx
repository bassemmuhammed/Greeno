import { useState } from "react";
import { Leaf, Search } from "lucide-react";
import { CATEGORIES, DAILY_SPECIAL } from "../data/menuData";
import { useMenuItems, useOrders, useSettings } from "../hooks/useSupabase";
import { useCart } from "../hooks/useCart";
import { useCustomer } from "../hooks/useCustomer";
import { MenuItem } from "../components/customer/MenuItem";
import { DailySpecialCard } from "../components/customer/DailySpecialCard";
import { OrderModal } from "../components/customer/OrderModal";
import { OrderTracker } from "../components/customer/OrderTracker";
import { WelcomePromo, SuccessToast } from "../components/customer/Overlays";

export default function CustomerMenu() {
  const { items, loading: itemsLoading } = useMenuItems();
  const { settings, loading: settingsLoading } = useSettings();
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

  // Use DB settings or fallback
  const config = settings || {};
  const isOpen = config.isOpen ?? false;
  const restaurantName = config.restaurantName || "greenó";
  const tagline        = config.tagline        || "Eat Clean. Live Green.";
  const deliveryTime   = config.deliveryTime   || "30–45 min";
  const categories     = ["All", ...(config.categories || ["Salads", "Bowls", "Smoothies", "Treats"])];

  // Menu items from DB (exclude special from main list if shown separately)
  const allItems   = items.length > 0 ? items : [];
  const specialItem = allItems.find((i) => i.isSpecial) || DAILY_SPECIAL;
  const menuItems  = allItems.filter((i) => !i.isSpecial);

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
    // Save order to Supabase
    try {
      const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
      const fee        = config.deliveryFee || 20;
      const total      = subtotal + fee;
      const saved      = await placeOrder({ cart, phone, address, note, total });
      const orderId    = saved?.id || (1000 + orderCount + 1);
      const newCount   = incrementOrders();
      clear();
      setShowOrder(false);
      setShowSuccess(true);
      setTrackerOrderId(orderId);
    } catch (err) {
      console.error("Order save failed:", err);
      // Still complete the flow even if DB save fails
      const newCount = incrementOrders();
      clear();
      setShowOrder(false);
      setShowSuccess(true);
      setTrackerOrderId(1000 + newCount);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ backgroundColor: "#EFEBE1", fontFamily: "'Inter', sans-serif" }}
      dir="ltr"
    >
      <div className="w-full max-w-sm min-h-screen flex flex-col" style={{ backgroundColor: "#FAF7F0" }}>

        {/* Header */}
        <div className="px-6 pt-12 pb-6" dir="ltr">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#1F2A1E" }}>
              <Leaf className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold mb-1" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif", letterSpacing: "-0.01em" }}>
              {restaurantName}
            </h1>
            <p className="text-sm mb-3" style={{ color: "#6B6557" }}>{tagline}</p>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: isOpen ? "#8FA888" : "#E4E0D4", color: isOpen ? "#1F2A1E" : "#8A8578" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOpen ? "#1F2A1E" : "#A39B86" }} />
                {isOpen ? "Open Now" : "Closed"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#E4E0D4", color: "#6B6557" }}>
                {deliveryTime}
              </span>
            </div>
            {orderCount > 0 && (
              <p className="text-xs mt-3" style={{ color: "#A39B86" }}>
                🌿 You've ordered {orderCount} time{orderCount > 1 ? "s" : ""} — order {Math.max(0, 5 - (orderCount % 5))} more for a free treat!
              </p>
            )}
          </div>
        </div>

        {/* Daily Special */}
        <div className="px-6 mb-5">
          <DailySpecialCard special={specialItem} onAdd={addToCart} />
        </div>

        {/* Search */}
        <div className="px-6 mb-4">
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
          </div>
        </div>

        {/* Category pills */}
        <div className="px-6 mb-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
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

        {/* Section label */}
        <div className="px-6 mt-4 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>
            {activeCategory === "All" ? "01 — TODAY'S PICKS" : activeCategory.toUpperCase()}
          </span>
          <span className="text-xs font-medium" style={{ color: "#A39B86" }}>
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Items */}
        <div className="px-6 flex-1">
          {itemsLoading ? (
            <div className="py-10 text-center">
              <p className="text-sm animate-pulse" style={{ color: "#A39B86" }}>Loading menu…</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: "#A39B86" }}>No dishes match your search.</p>
            </div>
          ) : (
            filteredItems.map((item) => <MenuItem key={item.id} item={item} onAdd={addToCart} />)
          )}
        </div>

        {/* Cart bar */}
        <div className="px-6 py-5 mt-4 flex flex-col gap-3">
          <button
            className="w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-opacity"
            style={{ backgroundColor: "#1F2A1E", opacity: totalItems === 0 ? 0.5 : 1 }}
            onClick={() => setShowOrder(true)}
            disabled={totalItems === 0}
          >
            <span className="text-sm font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>View Order</span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8FA888", color: "#1F2A1E" }}>
                {totalItems}
              </span>
              <span className="text-sm font-bold text-white tabular-nums">{totalPrice} EGP</span>
            </div>
          </button>

          {trackerOrderId && (
            <button
              onClick={() => setShowTracker(true)}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border transition-colors"
              style={{ borderColor: "#8FA888", color: "#1F2A1E", backgroundColor: "transparent" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#8FA888" }} />
              Track Order #{trackerOrderId}
            </button>
          )}
        </div>
      </div>

      {showWelcome  && <WelcomePromo onClose={() => setShowWelcome(false)} />}
      {showSuccess  && <SuccessToast onDone={() => setShowSuccess(false)} />}
      {showTracker  && <OrderTracker orderNumber={trackerOrderId} onClose={() => setShowTracker(false)} />}

      {showOrder && (
        <OrderModal
          cart={cart}
          onClose={() => setShowOrder(false)}
          onInc={inc} onDec={dec}
          phone={phone}    setPhone={setPhone}
          address={address} setAddress={setAddress}
          note={note}      setNote={setNote}
          onPlaced={handleOrderPlaced}
          deliveryFee={config.deliveryFee}
          minOrder={config.minOrder}
          whatsapp={config.whatsappNumber}
        />
      )}
    </div>
  );
}
