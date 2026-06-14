import { useState } from "react";
import { Flame, Leaf, Droplet, Plus, X, Save, Edit3, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { NutrientStamp } from "../shared/NutrientStamp";

// ── Tag input ────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <div
            key={tag}
            className="flex items-center gap-1 px-2 py-1 border rounded-sm text-[10px] font-bold"
            style={{ borderColor: "#1F2A1E", color: "#1F2A1E", transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
          >
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="w-2.5 h-2.5" strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add a tag and press Enter"
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
        />
        <button onClick={add} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: "#E4E0D4", color: "#1F2A1E" }}>
          Add
        </button>
      </div>
    </div>
  );
}

// ── Item editor form ─────────────────────────────────────────
export function ItemEditor({ item, categories, onSave, onCancel }) {
  const [draft, setDraft] = useState(item);

  const field = (label, key, type = "text") => (
    <div key={key}>
      <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>{label}</label>
      <input
        type={type}
        value={draft[key]}
        onChange={(e) => setDraft({ ...draft, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
      />
    </div>
  );

  return (
    <div className="rounded-2xl p-4 mb-3 flex flex-col gap-3" style={{ backgroundColor: "#FFFFFF", border: "2px solid #1F2A1E" }}>
      {field("Dish Name", "name")}
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Description</label>
        <textarea
          value={draft.desc}
          onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
        />
      </div>
      <div className="flex gap-3">
        {field("Price (EGP)", "price", "number")}
        {field("Calories", "cal", "number")}
      </div>
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Category</label>
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Tags</label>
        <TagInput tags={draft.tags} onChange={(tags) => setDraft({ ...draft, tags })} />
      </div>
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onSave(draft)}
          className="flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 text-sm font-bold text-white"
          style={{ backgroundColor: "#1F2A1E" }}
        >
          <Save className="w-3.5 h-3.5" strokeWidth={2.5} /> Save
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-bold"
          style={{ border: "1px solid #E4E0D4", color: "#6B6557" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Single item row ───────────────────────────────────────────
export function MenuItemRow({ item, onEdit, onDelete, onToggleAvailable }) {
  return (
    <div
      className="border-b py-4 flex items-start justify-between gap-3 transition-opacity"
      style={{ borderColor: "#E4E0D4", opacity: item.available ? 1 : 0.5 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-base font-bold leading-snug" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
            {item.name}
          </h3>
          <span className="text-sm font-bold shrink-0 tabular-nums" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
            {item.price} EGP
          </span>
        </div>
        <p className="text-xs leading-relaxed line-clamp-1 mb-2" style={{ color: "#6B6557" }}>{item.desc}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <NutrientStamp icon={Flame} label={`${item.cal} kcal`} rotate={-2} />
          <NutrientStamp label={item.category} tone="sage" rotate={1} />
          {item.tags.map((tag, i) => (
            <NutrientStamp key={tag} icon={i === 0 ? Leaf : Droplet} label={tag} rotate={i % 2 === 0 ? 1 : -1.5} tone="clay" />
          ))}
          {!item.available && <NutrientStamp label="Unavailable" tone="clay" rotate={-1} />}
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button onClick={() => onToggleAvailable(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E4E0D4" }}>
          {item.available
            ? <Eye className="w-3.5 h-3.5" style={{ color: "#8FA888" }} strokeWidth={2.5} />
            : <EyeOff className="w-3.5 h-3.5" style={{ color: "#A39B86" }} strokeWidth={2.5} />}
        </button>
        <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E4E0D4" }}>
          <Edit3 className="w-3.5 h-3.5" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
        </button>
        <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E4E0D4" }}>
          <Trash2 className="w-3.5 h-3.5" style={{ color: "#D98B5F" }} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── Daily special editor ──────────────────────────────────────
export function DailySpecialEditor({ special, items, onChange }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E4E0D4" }}>
      <p className="text-[10px] font-bold tracking-[0.2em] mb-3 flex items-center gap-1" style={{ color: "#D98B5F" }}>
        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
        DAILY SPECIAL
      </p>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Dish</label>
          <select
            value={special.itemId}
            onChange={(e) => onChange({ ...special, itemId: Number(e.target.value) })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
          >
            {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          {[["Special Price (EGP)", "price"], ["Original Price (EGP)", "originalPrice"]].map(([label, key]) => (
            <div key={key} className="flex-1">
              <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>{label}</label>
              <input
                type="number"
                value={special[key]}
                onChange={(e) => onChange({ ...special, [key]: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none tabular-nums"
                style={{ border: "1px solid #E4E0D4", color: "#1F2A1E", backgroundColor: "#FAF7F0" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
