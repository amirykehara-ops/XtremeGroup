// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
  pointsCost?: number; 
  isCanje?: boolean;// ← Costo en puntos para canjes
}
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, pointsCost?: number) => void;  // ← Está bien así
  removeFromCart: (productId: number, color?: string) => void;
  updateQuantity: (productId: number, color?: string, delta?: number) => void; // ← delta obligatorio al final
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

const addToCart = (product: Product, quantity = 1, color?: string, unitPointsCost = 0) => {
  setCart(prev => {
    const existingIndex = prev.findIndex(
      item => item.product.id === product.id && item.color === color
    );

    if (existingIndex !== -1) {
      const updated = [...prev];
      updated[existingIndex].quantity += quantity;
      // Sumamos pointsCost si ya existe
      updated[existingIndex].pointsCost! += unitPointsCost * quantity;
      return updated;
    }

    // Nuevo item
    return [...prev, { 
      product, 
      quantity, 
      color,
      pointsCost: unitPointsCost * quantity  // ← Guardamos el costo en puntos
    }];
  });
};

  const removeFromCart = (productId: number, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.color === color)
    ));
  };

  const updateQuantity = (productId: number, color?: string, delta: number = 1) => {
  setCart(prev => {
    return prev.map(item => {
      if (item.product.id === productId && item.color === color) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return null;

        // --- CORRECCIÓN AQUÍ: Recalcular puntos ---
        let newPointsCost = item.pointsCost;
        
        // Si el item tiene puntos (es un canje)
        if (item.pointsCost && item.pointsCost > 0) {
          // Calculamos cuánto vale 1 unidad en puntos (costo total / cantidad actual)
          const unitPoints = item.pointsCost / item.quantity;
          // El nuevo costo es el valor de 1 unidad por la nueva cantidad
          newPointsCost = Math.round(unitPoints * newQuantity);
        }

        return { 
          ...item, 
          quantity: newQuantity, 
          pointsCost: newPointsCost // Actualizamos el valor
        };
      }
      return item;
    }).filter(Boolean) as CartItem[];
  });
};

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cart.length;  // número de productos distintos (no cantidad total)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};