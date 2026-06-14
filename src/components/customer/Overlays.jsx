import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export function WelcomePromo({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(31,42,30,0.5)" }}
      onClick={onClose}
      dir="ltr"
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 relative text-center"
        style={{ backgroundColor: "#FAF7F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#E4E0D4" }}
        >
          <X className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
        </button>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#1F2A1E" }}
        >
          <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] mb-2" style={{ color: "#A39B86" }}>
          MONTHLY SUBSCRIPTION
        </p>
        <h2 className="text-2xl font-bold mb-2 leading-snug" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
          Special Discount on Monthly Plans
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6B6557" }}>
          Subscribe to a monthly healthy meal plan and enjoy exclusive savings on every order.
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white"
          style={{ backgroundColor: "#1F2A1E", fontFamily: "'Fraunces', serif" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function SuccessToast({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
      style={{ backgroundColor: "#1F2A1E" }}
      dir="ltr"
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#8FA888" }}>
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-bold text-white">Order sent! We'll confirm on WhatsApp.</span>
    </div>
  );
}
