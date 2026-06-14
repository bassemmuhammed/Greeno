import { useState } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { ...item, qty }];
    });
  };

  const inc = (id) => setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: c.qty + 1 } : c));

  const dec = (id) =>
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter((c) => c.qty > 0)
    );

  const clear = () => setCart([]);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return { cart, addToCart, inc, dec, clear, totalItems, totalPrice };
}
