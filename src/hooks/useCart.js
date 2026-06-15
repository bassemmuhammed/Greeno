import { useState } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, qty = 1) => {
    // unique key = id + name (includes size label) + addons
    const cartKey = `${item.id}__${item.name}__${(item.addons || []).join(",")}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.cartKey === cartKey);
      if (existing) {
        return prev.map((c) => c.cartKey === cartKey ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { ...item, qty, cartKey }];
    });
  };

  const inc = (cartKey) => setCart((prev) => prev.map((c) => c.cartKey === cartKey ? { ...c, qty: c.qty + 1 } : c));

  const dec = (cartKey) =>
    setCart((prev) =>
      prev.map((c) => c.cartKey === cartKey ? { ...c, qty: c.qty - 1 } : c).filter((c) => c.qty > 0)
    );

  const clear = () => setCart([]);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return { cart, addToCart, inc, dec, clear, totalItems, totalPrice };
}
