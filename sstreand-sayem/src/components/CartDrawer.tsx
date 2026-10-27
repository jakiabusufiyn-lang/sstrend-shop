import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingRemaining,
    finalTotal,
    deliveryCharge,
    appliedCoupon,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FAF7F5] h-full shadow-2xl flex flex-col justify-between z-10 animate-slideIn">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            <h2 className="font-editorial text-xl font-bold text-stone-900 tracking-wide">
              Your Shopping Bag
            </h2>
            <span className="text-xs text-stone-500 font-sans">
              ({cart.reduce((a, b) => a + b.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#F4EBE5] px-5 py-3 border-b border-[#E8DFD8]">
          {freeShippingRemaining > 0 ? (
            <div>
              <p className="text-xs text-stone-700">
                Add <strong className="text-stone-900 font-semibold font-sans">৳{freeShippingRemaining.toLocaleString()}</strong> more to enjoy <span className="text-[#A07C38] font-bold">FREE DELIVERY</span> in Bangladesh!
              </p>
              <div className="w-full bg-[#E4D7CE] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#C5A059] h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((3000 - freeShippingRemaining) / 3000) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Congratulations! You unlocked FREE delivery across Bangladesh.
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#EAD7D1]/50 flex items-center justify-center text-stone-500 mb-4">
                <ShoppingBag className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-editorial text-lg font-semibold text-stone-800">Your bag is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1 mb-6">
                Explore our authentic collections of imported fashion, radiant skincare, and luxury handbags.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/all-products');
                }}
                className="px-6 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium rounded-md hover:bg-stone-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => {
              const unitPrice = item.product.salePrice || item.product.regularPrice;
              const itemTotal = unitPrice * item.quantity;
              return (
                <div
                  key={`${item.productId}-${JSON.stringify(item.selectedVariations || {})}`}
                  className="flex gap-4 p-3 bg-white rounded-lg border border-[#EFE8E2] shadow-2xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-md bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-editorial text-sm font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedVariations)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {Object.entries(item.selectedVariations)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}

                      <p className="text-xs font-semibold text-stone-900 mt-1 font-sans">
                        ৳{unitPrice.toLocaleString()}{' '}
                        {item.product.salePrice && item.product.salePrice < item.product.regularPrice && (
                          <span className="text-[10px] text-stone-400 line-through font-normal">
                            ৳{item.product.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariations)}
                          className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-stone-800 font-sans">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariations)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900 font-sans">
                        ৳{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-[#E8DFD8] space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 font-sans">৳{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-semibold font-sans">-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="text-stone-900 font-sans">
                  {deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-bold text-stone-900">
                <span>Total Amount</span>
                <span className="text-base font-bold text-[#1C1917] font-sans">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/cart');
                }}
                className="w-full py-2.5 px-3 border border-stone-300 text-stone-800 hover:bg-stone-50 rounded-md text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                View Full Bag
              </button>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/checkout');
                }}
                className="w-full py-2.5 px-3 bg-[#1C1917] text-white hover:bg-stone-800 rounded-md text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-center text-stone-400">
              Cash on Delivery (COD) · bKash · Nagad · Bank Transfer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
