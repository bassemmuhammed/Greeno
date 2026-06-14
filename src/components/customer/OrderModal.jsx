import { X, ShoppingBag, Plus, Minus } from "lucide-react";
import { RESTAURANT_CONFIG } from "../../data/menuData";

function buildWhatsAppMessage(cart, phone, address, note, subtotal, fee, total) {
  let msg = `*New Order - ${RESTAURANT_CONFIG.name}*\n\n`;
  cart.forEach((c) => { msg += `${c.qty}x ${c.name} - ${c.price * c.qty} EGP\n`; });
  msg += `\n*Subtotal:* ${subtotal} EGP`;
  msg += `\n*Delivery:* ${fee} EGP`;
  msg += `\n*Total: ${total} EGP*\n\n`;
  msg += `*Phone:* ${phone}\n`;
  msg += `*Address:* ${address}\n`;
  if (note) msg += `*Notes:* ${note}\n`;
  return encodeURIComponent(msg);
}

export function OrderModal({ cart, onClose, onInc, onDec, phone, setPhone, address, setAddress, note, setNote, onPlaced }) {
  const { deliveryFee, minOrder, whatsapp } = RESTAURANT_CONFIG;
  const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0;
  const belowMin   = subtotal > 0 && subtotal < minOrder;

  const inputStyle = { backgroundColor: "#FFFFFF", borderColor: "#E4E0D4", color: "#1F2A1E" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(31,42,30,0.5)" }}
      onClick={onClose}
      dir="ltr"
    >
      <div
        className="w-full max-w-sm rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "#FAF7F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
            Your Order
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E4E0D4" }}
          >
            <X className="w-4 h-4" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: "#C9C4B8" }} strokeWidth={2} />
            <p className="text-sm" style={{ color: "#A39B86" }}>Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex flex-col gap-4 mb-6">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                      {c.name}
                    </p>
                    <p className="text-xs" style={{ color: "#A39B86" }}>{c.price} EGP</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => onDec(c.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center border"
                      style={{ borderColor: "#E4E0D4" }}
                    >
                      <Minus className="w-3 h-3" style={{ color: "#1F2A1E" }} strokeWidth={2.5} />
                    </button>
                    <span className="text-sm font-bold tabular-nums w-4 text-center" style={{ color: "#1F2A1E" }}>
                      {c.qty}
                    </span>
                    <button
                      onClick={() => onInc(c.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: c.color }}
                    >
                      <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery details */}
            <div className="flex flex-col gap-3 mb-6">
              {[
                { label: "Phone Number",     key: "phone",   setter: setPhone,   type: "tel",  placeholder: "e.g. 010 1234 5678",              val: phone },
                { label: "Delivery Address", key: "address", setter: setAddress, type: "text", placeholder: "Street, building, floor, apt",     val: address },
              ].map(({ label, setter, type, placeholder, val }) => (
                <div key={label}>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>{label}</label>
                  <input
                    type={type}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: "#6B6557" }}>Order Notes (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-2 pt-4 border-t mb-2" style={{ borderColor: "#E4E0D4" }}>
              {[["Subtotal", subtotal], ["Delivery Fee", deliveryFee]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#6B6557" }}>{l}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "#1F2A1E" }}>{v} EGP</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t mt-1" style={{ borderColor: "#E4E0D4" }}>
                <span className="text-sm font-bold" style={{ color: "#6B6557" }}>Total</span>
                <span className="text-xl font-bold tabular-nums" style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif" }}>
                  {grandTotal} EGP
                </span>
              </div>
            </div>

            {belowMin && (
              <p className="text-xs font-bold text-center mb-3" style={{ color: "#D98B5F" }}>
                Minimum order is {minOrder} EGP — add {minOrder - subtotal} EGP more
              </p>
            )}

            <button
              disabled={!phone || !address || belowMin}
              onClick={() => {
                const msg = buildWhatsAppMessage(cart, phone, address, note, subtotal, deliveryFee, grandTotal);
                window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
                onPlaced();
              }}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-opacity mt-3"
              style={{
                backgroundColor: "#1F2A1E",
                fontFamily: "'Fraunces', serif",
                opacity: (!phone || !address || belowMin) ? 0.5 : 1,
              }}
            >
              Place Order via WhatsApp
            </button>
          </>
        )}
      </div>
    </div>
  );
}
