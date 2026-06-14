import { useState, useEffect } from "react";

const STORAGE_KEY = "greeno_customer";

export function useCustomer() {
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");
  const [note, setNote]         = useState("");
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        setPhone(saved.phone || "");
        setAddress(saved.address || "");
        setOrderCount(saved.orderCount || 0);
      }
    } catch (_) {}
  }, []);

  const incrementOrders = () => {
    const next = orderCount + 1;
    setOrderCount(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, address, orderCount: next }));
    } catch (_) {}
    return next;
  };

  return { phone, setPhone, address, setAddress, note, setNote, orderCount, incrementOrders };
}
