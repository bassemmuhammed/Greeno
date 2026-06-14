import { useState, useEffect } from "react";
import { X, ClipboardCheck, ChefHat, Bike, PackageCheck } from "lucide-react";
import { ORDER_STEPS, STEP_DURATIONS } from "../../data/menuData";

const STEP_ICONS = [ClipboardCheck, ChefHat, Bike, PackageCheck];

export function OrderTracker({ orderNumber, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= ORDER_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATIONS[stepIndex]);
    return () => clearTimeout(t);
  }, [stepIndex]);

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
          {isFinished ? "Delivered!" : "Tracking your order"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "#6B6557" }}>
          {isFinished
            ? "Thanks for ordering — hope you enjoy it!"
            : "We'll update this in real time as your order moves along."}
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
                    style={{
                      color:      isActive ? "#1F2A1E" : "#A39B86",
                      fontFamily: "'Fraunces', serif",
                    }}
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
