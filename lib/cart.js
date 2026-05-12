'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zooplats_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('zooplats_cart', JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    setLastAdded(product);
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const update = (id, qty) => {
    if (qty <= 0) return remove(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clear = () => setItems([]);
  const clearLastAdded = () => setLastAdded(null);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count, total, lastAdded, clearLastAdded }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
