import { useState } from "react";
import { Clock, Tag, Save, X } from "lucide-react";

export function SettingsPanel({ settings, setSettings, hours, setHours, categories, setCategories }) {
  const [newCat, setNewCat] = useState("");
  const inputStyle = { border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" };

  const addCategory = () => {
    const c = newCat.trim();
    if (c && !categories.includes(c)) setCategories([...categories, c]);
    setNewCat("");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Restaurant info */}
      <section>
        <p className="text-xs font-bold tracking-[0.15em] mb-2" style={{ color: "#A39B86" }}>RESTAURANT INFO</p>
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
          {[
            { label: "Restaurant Name",   key: "restaurantName" },
            { label: "Tagline",            key: "tagline" },
            { label: "WhatsApp Number",    key: "whatsappNumber", hint: "Country code, no + or spaces. Orders are sent here." },
          ].map(({ label, key, hint }) => (
            <div key={key}>
              <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>{label}</label>
              <input
                type="text"
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
              {hint && <p className="text-[10px] mt-1" style={{ color: "#A39B86" }}>{hint}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section>
        <p className="text-xs font-bold tracking-[0.15em] mb-2" style={{ color: "#A39B86" }}>DELIVERY</p>
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
          <div className="flex gap-3">
            {[["Delivery Fee (EGP)", "deliveryFee"], ["Min Order (EGP)", "minOrder"]].map(([label, key]) => (
              <div key={key} className="flex-1">
                <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>{label}</label>
                <input
                  type="number"
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none tabular-nums"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Delivery Time Estimate</label>
            <input
              type="text"
              value={settings.deliveryTime}
              onChange={(e) => setSettings({ ...settings, deliveryTime: e.target.value })}
              placeholder="30–45 min"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Opening hours */}
      <section>
        <p className="text-xs font-bold tracking-[0.15em] mb-2 flex items-center gap-1.5" style={{ color: "#A39B86" }}>
          <Clock className="w-3 h-3" strokeWidth={2.5} /> OPENING HOURS
        </p>
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
          {hours.map((h, i) => (
            <div
              key={h.day}
              className="flex items-center gap-2 py-2.5"
              style={{ borderBottom: i < hours.length - 1 ? "1px solid #E4E0D4" : "none" }}
            >
              <span className="text-sm font-medium w-20 shrink-0" style={{ color: "#1F2A1E" }}>{h.day}</span>
              {h.closed ? (
                <span className="flex-1 text-xs" style={{ color: "#A39B86" }}>Closed</span>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  {["open", "close"].map((field) => (
                    <input
                      key={field}
                      type="time"
                      value={h[field]}
                      onChange={(e) =>
                        setHours(hours.map((x, idx) => idx === i ? { ...x, [field]: e.target.value } : x))
                      }
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none tabular-nums"
                      style={inputStyle}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setHours(hours.map((x, idx) => idx === i ? { ...x, closed: !x.closed } : x))}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: h.closed ? "#1F2A1E" : "#FAF7F0",
                  color:           h.closed ? "#FAF7F0" : "#A39B86",
                  border:          h.closed ? "none"    : "1px solid #E4E0D4",
                }}
              >
                {h.closed ? "Closed" : "Open"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <p className="text-xs font-bold tracking-[0.15em] mb-2 flex items-center gap-1.5" style={{ color: "#A39B86" }}>
          <Tag className="w-3 h-3" strokeWidth={2.5} /> CATEGORIES
        </p>
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat, i) => (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border rounded-sm text-xs font-bold"
                style={{ borderColor: "#1F2A1E", color: "#1F2A1E", transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
              >
                {cat}
                <button onClick={() => setCategories(categories.filter((c) => c !== cat))}>
                  <X className="w-3 h-3" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              placeholder="New category name"
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
            <button
              onClick={addCategory}
              className="px-3 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: "#E4E0D4", color: "#1F2A1E" }}
            >
              Add
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: "#A39B86" }}>
            Removing a category does not delete its dishes.
          </p>
        </div>
      </section>

      <button
        className="w-full py-3.5 rounded-full flex items-center justify-center gap-1.5 text-sm font-bold text-white"
        style={{ backgroundColor: "#1F2A1E" }}
      >
        <Save className="w-4 h-4" strokeWidth={2.5} /> Save Settings
      </button>
    </div>
  );
}
