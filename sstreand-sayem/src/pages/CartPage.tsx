import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryCharge,
    deliveryDistrict,
    setDeliveryDistrict,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    finalTotal,
    freeShippingRemaining,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setApplyingCoupon(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponCodeInput);
    setApplyingCoupon(false);
    setCouponMessage({ text: result.message, error: !result.success });
    if (result.success) {
      setCouponCodeInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-[#FAF0EE] rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
          <ShoppingBag className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="font-editorial text-3xl font-bold text-stone-900 mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto mb-8 font-sans">
          Discover our curated collection of China import beauty, radiant skincare, luxury handbags, and comfortable women’s fashion.
        </p>
        <button
          onClick={() => onNavigate('/all-products')}
          className="px-8 py-3.5 bg-[#1C1917] text-white text-xs uppercase tracking-widest font-semibold rounded-md shadow-md hover:bg-stone-800 transition-colors"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mb-8">
        Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="bg-[#FAF0EE] border border-[#E8DFD8] rounded-lg p-4 flex items-center justify-between text-xs">
            {freeShippingRemaining > 0 ? (
              <p className="text-stone-700">
                Add <strong className="text-stone-950 font-bold font-sans">৳{freeShippingRemaining.toLocaleString()}</strong> more to your cart to qualify for <span className="text-[#A07C38] font-bold">FREE Delivery Across Bangladesh</span>!
              </p>
            ) : (
              <p className="text-emerald-800 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> You have unlocked FREE nationwide shipping!
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#EFE8E2] divide-y divide-stone-100 overflow-hidden shadow-2xs">
            {cart.map((item) => {
              const unitPrice = item.product.salePrice || item.product.regularPrice;
              const itemTotal = unitPrice * item.quantity;
              return (
                <div
                  key={`${item.productId}-${JSON.stringify(item.selectedVariations || {})}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#A07C38] font-semibold">
                        {item.product.category.replace('-', ' ')}
                      </span>
                      <h3 className="font-editorial text-base sm:text-lg font-semibold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h3>
                      {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                        <p className="text-xs text-stone-500">
                          {Object.entries(item.selectedVariations)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-stone-900 font-sans">
                        ৳{unitPrice.toLocaleString()}{' '}
                        {item.product.salePrice && item.product.salePrice < item.product.regularPrice && (
                          <span className="text-[10px] text-stone-400 line-through font-normal">
                            ৳{item.product.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="flex items-center border border-stone-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariations)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900 font-sans">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariations)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-stone-900 font-sans">
                        ৳{itemTotal.toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId, item.selectedVariations)}
                        className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-6">
            <h3 className="font-editorial text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            {/* Delivery Destination Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Delivery Destination:
              </label>
              <select
                value={deliveryDistrict}
                onChange={(e) => setDeliveryDistrict(e.target.value)}
                className="w-full text-xs bg-[#FAF7F5] border border-stone-300 rounded-md p-2.5 text-stone-900"
              >
                <option value="Dhaka">Inside Dhaka (৳70 · 1-2 Days)</option>
                <option value="Chittagong">Outside Dhaka - Chittagong (৳130 · 2-4 Days)</option>
                <option value="Sylhet">Outside Dhaka - Sylhet (৳130 · 2-4 Days)</option>
                <option value="Rajshahi">Outside Dhaka - Rajshahi (৳130 · 2-4 Days)</option>
                <option value="Other">Outside Dhaka - All Other 60 Districts (৳130)</option>
              </select>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C5A059]" /> Promo Coupon Code:
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-md text-xs text-emerald-800">
                  <span>Code: <strong>{appliedCoupon.code}</strong> (-৳{appliedCoupon.discountAmount})</span>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-500 hover:text-rose-600 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 uppercase text-xs px-3 py-2 bg-[#FAF7F5] border border-stone-300 rounded-md uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCodeInput.trim()}
                    className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-md hover:bg-stone-800 disabled:opacity-50"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponMessage && (
                <p className={`text-xs ${couponMessage.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900 font-sans">৳{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-sans">-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-sans text-stone-900">
                  {deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Final Total</span>
                <span className="font-sans text-xl text-[#1C1917]">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-4 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
