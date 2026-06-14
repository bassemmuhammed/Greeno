import { useState } from "react";
import { Leaf, TrendingUp, Package, ShoppingBag, Settings, Star, LogOut, Plus } from "lucide-react";
import { MENU_ITEMS, MOCK_ORDERS, WEEKLY_SALES, RESTAURANT_CONFIG, DAILY_SPECIAL } from "../data/menuData";
import { StatCard, MiniBarChart, StatusToggleCard } from "../components/owner/StatsWidgets";
import { ItemEditor, MenuItemRow, DailySpecialEditor } from "../components/owner/MenuManagement";
import { OrderRow } from "../components/owner/OrderRow";
import { SettingsPanel } from "../components/owner/SettingsPanel";

const INITIAL_CATEGORIES = ["Salads", "Bowls", "Smoothies", "Treats"];
const DAY_LABELS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const INITIAL_HOURS = DAY_LABELS.map((day) => ({ day, open: "08:00", close: "23:00", closed: false }));

const INITIAL_SETTINGS = {
  restaurantName: RESTAURANT_CONFIG.name,
  tagline:        RESTAURANT_CONFIG.tagline,
  whatsappNumber: RESTAURANT_CONFIG.whatsapp,
  deliveryFee:    RESTAURANT_CONFIG.deliveryFee,
  minOrder:       RESTAURANT_CONFIG.minOrder,
  deliveryTime:   RESTAURANT_CONFIG.deliveryTime,
};

const TABS = [
  { id: "overview", label: "Overview",  icon: TrendingUp },
  { id: "menu",     label: "Menu",      icon: Package    },
  { id: "orders",   label: "Orders",    icon: ShoppingBag },
  { id: "settings", label: "Settings",  icon: Settings   },
];

const NEW_ITEM_TEMPLATE = {
  id: 0, name: "", desc: "", price: 0, cal: 0,
  tags: [], category: "Salads", color: "#8FA888", sold: 0, available: true,
};

export default function OwnerDashboard() {
  const [items,       setItems]       = useState(MENU_ITEMS.map((i) => ({ ...i, sold: Math.floor(Math.random() * 50) + 10 })));
  const [categories,  setCategories]  = useState(INITIAL_CATEGORIES);
  const [orders,      setOrders]      = useState(MOCK_ORDERS);
  const [isOpen,      setIsOpen]      = useState(true);
  const [activeTab,   setActiveTab]   = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [special,     setSpecial]     = useState({ itemId: 1, price: 120, originalPrice: 150 });
  const [hours,       setHours]       = useState(INITIAL_HOURS);
  const [settings,    setSettings]    = useState(INITIAL_SETTINGS);

  // Overview metrics
  const totalSalesToday  = orders.reduce((s, o) => s + o.total, 0);
  const avgOrder         = Math.round(totalSalesToday / orders.length);
  const weekTotal        = WEEKLY_SALES.reduce((a, b) => a + b, 0);
  const topItem          = [...items].sort((a, b) => b.sold - a.sold)[0];

  // Menu handlers
  const handleSaveItem = (draft) => {
    if (isAddingNew) {
      const newId = Math.max(0, ...items.map((i) => i.id)) + 1;
      setItems([...items, { ...draft, id: newId, sold: 0, color: "#8FA888" }]);
      setIsAddingNew(false);
    } else {
      setItems(items.map((i) => (i.id === draft.id ? draft : i)));
    }
    setEditingItem(null);
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ backgroundColor: "#EFEBE1", fontFamily: "'Inter', sans-serif" }}
      dir="ltr"
    >
      <div className="w-full max-w-sm min-h-screen flex flex-col" style={{ backgroundColor: "#FAF7F0" }}>

        {/* Header */}
        <div className="px-6 pt-10 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1F2A1E" }}>
              <Leaf className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "#A39B86" }}>OWNER DASHBOARD</p>
              <h1 className="text-xl font-bold leading-tight" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                {settings.restaurantName}
              </h1>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: "#E4E0D4" }}>
            <LogOut className="w-4 h-4" style={{ color: "#6B6557" }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-4 flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? "#1F2A1E" : "transparent",
                color:           activeTab === tab.id ? "#FAF7F0" : "#6B6557",
                border:          activeTab === tab.id ? "none" : "1px solid #E4E0D4",
                fontFamily:      "'Fraunces', serif",
              }}
            >
              <tab.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-6 flex-1 pb-8">

          {/* ─── Overview ─── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <StatusToggleCard isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />

              <div className="flex gap-3">
                <StatCard label="TODAY'S SALES" value={`${totalSalesToday} EGP`} sub={`${orders.length} orders`} icon={TrendingUp} />
                <StatCard label="AVG ORDER"     value={`${avgOrder} EGP`}         sub="per order"                icon={ShoppingBag} />
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>THIS WEEK</p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                    {weekTotal} EGP
                  </p>
                </div>
                <MiniBarChart data={WEEKLY_SALES} />
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FAF7F0" }}>
                  <Star className="w-4 h-4" style={{ color: "#D98B5F" }} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.15em] mb-0.5" style={{ color: "#A39B86" }}>TOP SELLER THIS WEEK</p>
                  <p className="text-sm font-bold leading-snug" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                    {topItem?.name}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: "#1F2A1E" }}>
                  {topItem?.sold}x
                </span>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.15em] mb-2" style={{ color: "#A39B86" }}>DAILY SPECIAL</p>
                <DailySpecialEditor special={special} items={items} onChange={setSpecial} />
              </div>
            </div>
          )}

          {/* ─── Menu ─── */}
          {activeTab === "menu" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>
                  {items.length} DISH{items.length !== 1 ? "ES" : ""}
                </p>
                <button
                  onClick={() => { setEditingItem(null); setIsAddingNew(true); }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: "#1F2A1E" }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Add Dish
                </button>
              </div>

              {isAddingNew && (
                <ItemEditor
                  item={{ ...NEW_ITEM_TEMPLATE, category: categories[0] || "Salads" }}
                  categories={categories}
                  onSave={handleSaveItem}
                  onCancel={() => setIsAddingNew(false)}
                />
              )}

              {items.map((item) =>
                editingItem?.id === item.id ? (
                  <ItemEditor
                    key={item.id}
                    item={item}
                    categories={categories}
                    onSave={handleSaveItem}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={setEditingItem}
                    onDelete={(id) => setItems(items.filter((i) => i.id !== id))}
                    onToggleAvailable={(id) => setItems(items.map((i) => i.id === id ? { ...i, available: !i.available } : i))}
                  />
                )
              )}
            </div>
          )}

          {/* ─── Orders ─── */}
          {activeTab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>TODAY'S ORDERS</p>
                <p className="text-xs" style={{ color: "#A39B86" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={(id, status) => setOrders(orders.map((o) => o.id === id ? { ...o, status } : o))}
                />
              ))}
            </div>
          )}

          {/* ─── Settings ─── */}
          {activeTab === "settings" && (
            <SettingsPanel
              settings={settings}   setSettings={setSettings}
              hours={hours}         setHours={setHours}
              categories={categories} setCategories={setCategories}
            />
          )}
        </div>
      </div>
    </div>
  );
}
