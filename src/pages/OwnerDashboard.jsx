import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, TrendingUp, Package, ShoppingBag, Settings, Star, LogOut, Plus, RefreshCw, AlertCircle, ImagePlus, Trash2, Images } from "lucide-react";
import { WEEKLY_SALES } from "../data/menuData";
import { useMenuItems, useOrders, useSettings } from "../hooks/useSupabase";
import { StatCard, MiniBarChart, StatusToggleCard } from "../components/owner/StatsWidgets";
import { ItemEditor, MenuItemRow, DailySpecialEditor } from "../components/owner/MenuManagement";
import { OrderRow } from "../components/owner/OrderRow";
import { SettingsPanel } from "../components/owner/SettingsPanel";
import { supabase } from "../data/supabase";

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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "#A39B86" }} />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: "#FFF3EE", border: "1px solid #D98B5F" }}>
      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#D98B5F" }} />
      <p className="text-xs" style={{ color: "#D98B5F" }}>{message}</p>
    </div>
  );
}

// ─── Story Manager Component ───────────────────────────────────
function StoryManager() {
  const [images,    setImages]    = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);
  const fileRef = useRef(null);

  const loadImages = async () => {
    const { data, error } = await supabase
      .from("story_images")
      .select("id, url")
      .order("created_at", { ascending: true });
    if (!error && data) setImages(data);
  };

  useEffect(() => { loadImages(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const ext      = file.name.split(".").pop();
        const fileName = `story_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("story-images")
          .upload(fileName, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("story-images")
          .getPublicUrl(fileName);
        // Save URL to table
        const { error: insertError } = await supabase
          .from("story_images")
          .insert([{ url: urlData.publicUrl }]);
        if (insertError) throw insertError;
      }
      await loadImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id, url) => {
    try {
      // Extract file name from URL
      const fileName = url.split("/").pop();
      await supabase.storage.from("story-images").remove([fileName]);
      await supabase.from("story_images").delete().eq("id", id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="rounded-2xl p-4 mt-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2} />
          <p className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>
            STORY IMAGES
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-opacity"
          style={{ backgroundColor: "#1F2A1E", opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
          ) : (
            <ImagePlus className="w-3.5 h-3.5" strokeWidth={2.5} />
          )}
          {uploading ? "Uploading…" : "Add Photos"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ backgroundColor: "#FFF3EE", border: "1px solid #D98B5F" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#D98B5F" }} />
          <p className="text-xs" style={{ color: "#D98B5F" }}>{error}</p>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center py-8 rounded-xl cursor-pointer"
          style={{ border: "1.5px dashed #E4E0D4" }}
        >
          <ImagePlus className="w-8 h-8 mb-2" style={{ color: "#C4BFB4" }} strokeWidth={1.5} />
          <p className="text-xs font-medium" style={{ color: "#A39B86" }}>Tap to upload story photos</p>
          <p className="text-[10px] mt-1" style={{ color: "#C4BFB4" }}>They'll appear as stories for customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={img.url} alt="story" className="w-full h-full object-cover" />
              <button
                onClick={() => handleDelete(img.id, img.url)}
                className="absolute inset-0 flex items-center justify-center transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.45)", opacity: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                onTouchStart={(e) => e.currentTarget.style.opacity = 1}
                onTouchEnd={(e) => {
                  handleDelete(img.id, img.url);
                  e.currentTarget.style.opacity = 0;
                }}
              >
                <Trash2 className="w-5 h-5 text-white" strokeWidth={2} />
              </button>
            </div>
          ))}
          {/* Add more button */}
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl flex items-center justify-center"
            style={{ border: "1.5px dashed #E4E0D4" }}
          >
            <Plus className="w-5 h-5" style={{ color: "#C4BFB4" }} strokeWidth={2} />
          </button>
        </div>
      )}

      <p className="text-[10px] mt-3" style={{ color: "#C4BFB4" }}>
        {images.length} photo{images.length !== 1 ? "s" : ""} · Customers tap the logo to view
      </p>
    </div>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("greeno_admin");
    navigate("/login");
  };

  const { items, loading: itemsLoading, error: itemsError, saveItem, deleteItem, toggleAvailable } = useMenuItems();
  const { orders, loading: ordersLoading, error: ordersError, updateStatus } = useOrders();
  const { settings, loading: settingsLoading, error: settingsError, saveSettings } = useSettings();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  const categories = settings.categories || ["Salads", "Bowls", "Smoothies", "Treats"];
  const isOpen     = settings.isOpen ?? true;

  // Overview metrics
  const totalSalesToday = orders.reduce((s, o) => s + o.total, 0);
  const avgOrder        = orders.length ? Math.round(totalSalesToday / orders.length) : 0;
  const weekTotal       = WEEKLY_SALES.reduce((a, b) => a + b, 0);
  const topItem         = [...items].sort((a, b) => (b.sold || 0) - (a.sold || 0))[0];
  const special         = items.find((i) => i.isSpecial);

  const handleSaveItem = async (draft) => {
    setSaveError(null);
    try {
      await saveItem(draft);
      setEditingItem(null);
      setIsAddingNew(false);
    } catch (e) {
      setSaveError(e.message);
    }
  };

  const handleSaveSettings = async (patch) => {
    setSaveError(null);
    try {
      await saveSettings(patch);
    } catch (e) {
      setSaveError(e.message);
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
          <button onClick={handleLogout} className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: "#E4E0D4" }}>
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
              {settingsLoading ? <LoadingSpinner /> : (
                <StatusToggleCard
                  isOpen={isOpen}
                  onToggle={() => handleSaveSettings({ isOpen: !isOpen })}
                />
              )}

              {ordersError && <ErrorBanner message="Using sample orders — couldn't reach database." />}

              <div className="flex gap-3">
                <StatCard label="TODAY'S SALES" value={`${totalSalesToday} EGP`} sub={`${orders.length} orders`} icon={TrendingUp} />
                <StatCard label="AVG ORDER"     value={`${avgOrder} EGP`}        sub="per order"                icon={ShoppingBag} />
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

              {topItem && (
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FAF7F0" }}>
                    <Star className="w-4 h-4" style={{ color: "#D98B5F" }} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.15em] mb-0.5" style={{ color: "#A39B86" }}>TOP SELLER THIS WEEK</p>
                    <p className="text-sm font-bold leading-snug" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                      {topItem.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: "#1F2A1E" }}>
                    {topItem.sold}x
                  </span>
                </div>
              )}

              {special && (
                <div>
                  <p className="text-xs font-bold tracking-[0.15em] mb-2" style={{ color: "#A39B86" }}>DAILY SPECIAL</p>
                  <DailySpecialEditor
                    special={{ itemId: special.id, price: special.price, originalPrice: special.originalPrice }}
                    items={items}
                    onChange={async ({ itemId, price, originalPrice }) => {
                      // unmark old special
                      if (special) await saveItem({ ...special, isSpecial: false });
                      const newSpecial = items.find((i) => i.id === itemId);
                      if (newSpecial) await saveItem({ ...newSpecial, isSpecial: true, price, originalPrice });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── Menu ─── */}
          {activeTab === "menu" && (
            <div>
              {itemsError && <ErrorBanner message="Using sample menu — couldn't reach database." />}
              {saveError  && <ErrorBanner message={saveError} />}

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

              {itemsLoading ? <LoadingSpinner /> : (
                <>
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
                        onDelete={(id) => deleteItem(id)}
                        onToggleAvailable={(id) => toggleAvailable(id)}
                      />
                    )
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Orders ─── */}
          {activeTab === "orders" && (
            <div>
              {ordersError && <ErrorBanner message="Using sample orders — couldn't reach database." />}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>TODAY'S ORDERS</p>
                <p className="text-xs" style={{ color: "#A39B86" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
              {ordersLoading ? <LoadingSpinner /> : (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={(id, status) => updateStatus(id, status)}
                  />
                ))
              )}
            </div>
          )}

          {/* ─── Settings ─── */}
          {activeTab === "settings" && (
            <>
              {settingsError && <ErrorBanner message="Using default settings — couldn't reach database." />}
              {saveError     && <ErrorBanner message={saveError} />}
              {settingsLoading ? <LoadingSpinner /> : (
                <SettingsPanel
                  settings={settings}
                  setSettings={(s) => handleSaveSettings(s)}
                  hours={settings.hours}
                  setHours={(h) => handleSaveSettings({ hours: h })}
                  categories={categories}
                  setCategories={(c) => handleSaveSettings({ categories: c })}
                />
              )}
              <StoryManager />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
