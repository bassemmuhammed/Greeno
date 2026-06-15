import { useState, useEffect, useCallback } from "react";
import { supabase } from "../data/supabase";
import { MENU_ITEMS, MOCK_ORDERS, RESTAURANT_CONFIG, DAILY_SPECIAL, INITIAL_HOURS } from "../data/menuData";

// ─── Menu Items ───────────────────────────────────────────────
export function useMenuItems() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id");
    if (error) {
      console.error("useMenuItems:", error);
      // Fallback to static data
      setItems(MENU_ITEMS.map((i) => ({ ...i, desc: i.desc, sold: 0 })));
      setError(error.message);
    } else {
      setItems(data.map(normalizeItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const saveItem = async (draft) => {
    const row = denormalizeItem(draft);
    if (!draft.id || draft.id === 0) {
      const { data, error } = await supabase.from("menu_items").insert([row]).select().single();
      if (error) throw error;
      setItems((prev) => [...prev, normalizeItem(data)]);
      return normalizeItem(data);
    } else {
      const { data, error } = await supabase.from("menu_items").update(row).eq("id", draft.id).select().single();
      if (error) throw error;
      setItems((prev) => prev.map((i) => (i.id === draft.id ? normalizeItem(data) : i)));
      return normalizeItem(data);
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleAvailable = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase.from("menu_items").update({ available: !item.available }).eq("id", id);
    if (error) throw error;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  const incrementSold = async (id, qty = 1) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newSold = (item.sold || 0) + qty;
    await supabase.from("menu_items").update({ sold: newSold }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, sold: newSold } : i)));
  };

  return { items, loading, error, saveItem, deleteItem, toggleAvailable, incrementSold, refetch: fetch };
}

// ─── Daily Special ─────────────────────────────────────────────
export function useDailySpecial(items) {
  const special = items.find((i) => i.isSpecial) || { ...DAILY_SPECIAL };
  return special;
}

// ─── Orders ───────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    if (error) {
      console.error("useOrders:", error);
      setOrders(MOCK_ORDERS);
      setError(error.message);
    } else {
      setOrders(data.map(normalizeOrder));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Subscribe to realtime new orders
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => [normalizeOrder(payload.new), ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? normalizeOrder(payload.new) : o)));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const placeOrder = async ({ cart, phone, address, note, total }) => {
    const itemsText = cart.map((c) => `${c.qty}x ${c.name}`).join(", ");
    const { data, error } = await supabase
      .from("orders")
      .insert([{ items_text: itemsText, total, phone, address, note, status: "Preparing" }])
      .select()
      .single();
    if (error) throw error;
    return normalizeOrder(data);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return { orders, loading, error, placeOrder, updateStatus, refetch: fetch };
}

// ─── Settings ─────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState(null);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);

  const fallback = {
    restaurantName: RESTAURANT_CONFIG.name,
    tagline:        RESTAURANT_CONFIG.tagline,
    whatsappNumber: RESTAURANT_CONFIG.whatsapp,
    deliveryFee:    RESTAURANT_CONFIG.deliveryFee,
    minOrder:       RESTAURANT_CONFIG.minOrder,
    deliveryTime:   RESTAURANT_CONFIG.deliveryTime,
    isOpen:         true,
    hours:          INITIAL_HOURS,
    categories:     ["Salads", "Bowls", "Smoothies", "Treats"],
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
      if (error) {
        console.error("useSettings:", error);
        setSettingsState(fallback);
        setError(error.message);
      } else {
        setSettingsState(normalizeSettings(data));
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async (patch) => {
    const merged = { ...settings, ...patch };
    const row    = denormalizeSettings(merged);
    const { error } = await supabase.from("settings").update({ ...row, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) throw error;
    setSettingsState(merged);
  };

  return { settings: settings || fallback, loading, error, saveSettings };
}

// ─── Normalizers (DB → App) ───────────────────────────────────
function normalizeItem(row) {
  let sizes = row.sizes;
  if (typeof sizes === "string") {
    try { sizes = JSON.parse(sizes); } catch { sizes = null; }
  }
  return {
    id:            row.id,
    name:          row.name,
    desc:          row.description,
    price:         Number(row.price),
    cal:           row.cal,
    tags:          row.tags || [],
    color:         row.color || "#8FA888",
    category:      row.category,
    available:     row.available,
    isSpecial:     row.is_special,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    sold:          row.sold || 0,
    sizes:         Array.isArray(sizes) && sizes.length > 1 ? sizes : null,
  };
}

function denormalizeItem(item) {
  return {
    name:           item.name,
    description:    item.desc,
    price:          item.price,
    cal:            item.cal,
    tags:           item.tags || [],
    color:          item.color || "#8FA888",
    category:       item.category,
    available:      item.available,
    is_special:     item.isSpecial || false,
    original_price: item.originalPrice || null,
    sold:           item.sold || 0,
    sizes:          item.sizes || null,
  };
}

function normalizeOrder(row) {
  const d = new Date(row.created_at);
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return {
    id:     row.id,
    time,
    items:  row.items_text,
    total:  Number(row.total),
    status: row.status,
    phone:  row.phone || "",
  };
}

function normalizeSettings(row) {
  return {
    restaurantName: row.restaurant_name,
    tagline:        row.tagline,
    whatsappNumber: row.whatsapp,
    deliveryFee:    Number(row.delivery_fee),
    minOrder:       Number(row.min_order),
    deliveryTime:   row.delivery_time,
    isOpen:         row.is_open,
    hours:          Array.isArray(row.hours) && row.hours.length > 0 ? row.hours : INITIAL_HOURS,
    categories:     row.categories || ["Salads", "Bowls", "Smoothies", "Treats"],
  };
}

function denormalizeSettings(s) {
  return {
    restaurant_name: s.restaurantName,
    tagline:         s.tagline,
    whatsapp:        s.whatsappNumber,
    delivery_fee:    s.deliveryFee,
    min_order:       s.minOrder,
    delivery_time:   s.deliveryTime,
    is_open:         s.isOpen,
    hours:           s.hours,
    categories:      s.categories,
  };
}
