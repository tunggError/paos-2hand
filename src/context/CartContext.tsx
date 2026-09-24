"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

export interface PendingOrder {
  orderId: string;
  expireTime: number;
  total: number;
  shippingFee: number;
  igMessage: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    province: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  pendingOrder: PendingOrder | null;
  setPendingOrder: (order: PendingOrder | null) => void;
  clearPendingOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingOrder, setPendingOrderState] = useState<PendingOrder | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('paos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }

    const savedOrder = localStorage.getItem('paos_pending_order');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (parsed.expireTime > Date.now()) {
          setPendingOrderState(parsed);
        } else {
          localStorage.removeItem('paos_pending_order');
          localStorage.removeItem('paos_cart'); // clear cart if expired
          setCart([]);
        }
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('paos_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Vì đồ 2hand chỉ có 1 cái duy nhất, nếu đã có trong giỏ thì không thêm nữa
      if (prev.find((p) => p.id === item.id)) return prev;
      return [...prev, item];
    });
    setIsCartOpen(true); // Tự động mở giỏ hàng khi thêm
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Tính tổng tiền (phải chuyển từ chuỗi "350.000đ" sang số 350000)
  const cartTotal = cart.reduce((total, item) => {
    // Chỉ giữ lại số
    const numStr = item.price.replace(/\D/g, '');
    const priceNum = numStr ? parseInt(numStr, 10) : 0;
    return total + priceNum;
  }, 0);

  const setPendingOrder = (order: PendingOrder | null) => {
    setPendingOrderState(order);
    if (order) {
      localStorage.setItem('paos_pending_order', JSON.stringify(order));
    } else {
      localStorage.removeItem('paos_pending_order');
    }
  };

  const clearPendingOrder = () => {
    setPendingOrderState(null);
    localStorage.removeItem('paos_pending_order');
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, clearCart, 
      isCartOpen, setIsCartOpen, cartTotal,
      pendingOrder, setPendingOrder, clearPendingOrder
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
