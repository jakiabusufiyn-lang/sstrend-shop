import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { api } from '../services/api';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariations?: Record<string, string>) => boolean;
  removeFromCart: (productId: string, variations?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variations?: Record<string, string>) => boolean;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  setDeliveryDistrict: (district: string) => void;
  deliveryDistrict: string;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  finalTotal: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'sstreand_cart_v1';
const FREE_SHIPPING_THRESHOLD = 3000;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryDistrict, setDeliveryDistrict] = useState('Dhaka');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const getVariationKey = (variations?: Record<string, string>) => {
    if (!variations) return '';
    return Object.entries(variations)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
  };

  const addToCart = (product: Product, quantity = 1, selectedVariations?: Record<string, string>): boolean => {
    if (product.stock <= 0) return false;

    let addedSuccessfully = true;
    setCart(prev => {
      const varKey = getVariationKey(selectedVariations);
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && getVariationKey(item.selectedVariations) === varKey
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;
        if (newQty > product.stock) {
          addedSuccessfully = false;
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        if (quantity > product.stock) {
          addedSuccessfully = false;
          return prev;
        }
        return [...prev, { productId: product.id, product, quantity, selectedVariations }];
      }
    });

    if (addedSuccessfully) {
      setIsCartOpen(true);
    }
    return addedSuccessfully;
  };

  const removeFromCart = (productId: string, variations?: Record<string, string>) => {
    const varKey = getVariationKey(variations);
    setCart(prev =>
      prev.filter(
        item => !(item.productId === productId && getVariationKey(item.selectedVariations) === varKey)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variations?: Record<string, string>): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId, variations);
      return true;
    }

    let success = true;
    const varKey = getVariationKey(variations);

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId && getVariationKey(item.selectedVariations) === varKey) {
          if (quantity > item.product.stock) {
            success = false;
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });

    return success;
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.salePrice || item.product.regularPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const isDhaka = deliveryDistrict.toLowerCase().includes('dhaka');
  const deliveryCharge = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : isDhaka ? 70 : 130;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a valid coupon code.' };
    }
    try {
      const res = await api.validateCoupon(code.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discountAmount: res.discountAmount,
        });
        return { success: true, message: `Coupon applied! You saved ৳${res.discountAmount}` };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Coupon could not be applied' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        deliveryCharge,
        deliveryDistrict,
        setDeliveryDistrict,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        finalTotal,
        freeShippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
