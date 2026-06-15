import { useState, useEffect } from "react";
import { X, ClipboardCheck, ChefHat, Bike, PackageCheck } from "lucide-react";
import { supabase } from "../../data/supabase";

// ── Map Supabase status → step index ──────────────────────────
// ORDER_STEPS: 0=Confirmed, 1=Preparing, 2=Out for delivery, 3=Delivered
const STATUS_TO_STEP = {
  "Preparing":        1,
  "Out for delivery": 2,
  "Delivered":        3,
};

const ORDER_STEPS = [
  { key: "confirmed",  label: "Order Confirmed",   desc: "We've received your order and it's being reviewed." },
  { key: "preparing",  label: "Preparing",          desc: "Our kitchen is preparing your food fresh." },
  { key: "delivery",   label: "Out for Delivery",   desc: "Your order is on its way to you!" },
  { key: "delivered",  label: "Delivered",          desc: "Enjoy your meal! Hope you love it. 🌿" },
];

const STEP_ICONS = [ClipboardCheck, ChefHat, Bike, PackageCheck];

export function OrderTracker({ orderNumber, onClose, onDelivered }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading,   setLoading]   = useState(true);

  // ── Initial fetch ──────────────────────────────────────────
  useEffect(() => {
    if (!orderNumber) return;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderNumber)
        .single();

      if (!error && data?.status) {
        setStepIndex(STATUS_TO_STEP[data.status] ?? 0);
      }
      setLoading(false);
    };

    fetchStatus();

    // ── Realtime subscription ──────────────────────────────
    const channel = supabase
      .channel(`order-${orderNumber}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
          filter: `id=eq.${orderNumber}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          if (newStatus) {
            setStepIndex(STATUS_TO_STEP[newStatus] ?? 0);
            if (newStatus === "Delivered") {
              onDelivered?.();
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderNumber]);

  const isFinished = stepIndex >= ORDER_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir="ltr">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "#A39B86" }}>
            ORDER #{orderNumber}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E4E0D4" }}
          >
            <X className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
          {loading ? "Loading…" : isFinished ? "Delivered!" : "Tracking your order"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "#6B6557" }}>
          {loading
            ? "Fetching your order status…"
            : isFinished
            ? "Thanks for ordering — hope you enjoy it!"
            : "Updates in real time as your order moves along."}
        </p>

        {/* Steps */}
        <div className="flex flex-col">
          {ORDER_STEPS.map((step, i) => {
            const Icon      = STEP_ICONS[i];
            const isDone    = i < stepIndex;
            const isCurrent = i === stepIndex;
            const isLast    = i === ORDER_STEPS.length - 1;
            const isActive  = isDone || isCurrent;

            return (
              <div key={step.key} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500"
                    style={{
                      backgroundColor: isActive ? "#1F2A1E" : "#E4E0D4",
                      color:           isActive ? "#FAF7F0" : "#A39B86",
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 my-1 transition-colors duration-700"
                      style={{ backgroundColor: isDone ? "#1F2A1E" : "#E4E0D4", minHeight: "28px" }}
                    />
                  )}
                </div>

                {/* Label */}
                <div className={`${isLast ? "pb-0" : "pb-6"}`}>
                  <p
                    className="text-sm font-bold mb-0.5 flex items-center gap-2"
                    style={{ color: isActive ? "#1F2A1E" : "#A39B86", fontFamily: "'Fraunces', serif" }}
                  >
                    {step.label}
                    {isCurrent && !isLast && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "#8FA888" }}
                      />
                    )}
                  </p>
                  <p className="text-xs" style={{ color: isActive ? "#6B6557" : "#C9C4B4" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
