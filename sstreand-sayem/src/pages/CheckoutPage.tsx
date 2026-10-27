import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lock,
  Phone,
  Building,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (order: Order) => void;
}

// Bangladesh 64 Districts List
const BD_DISTRICTS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Chittagong',
  'Cox\'s Bazar',
  'Sylhet',
  'Moulvibazar',
  'Rajshahi',
  'Bogra',
  'Khulna',
  'Jessore',
  'Barisal',
  'Comilla',
  'Mymensingh',
  'Rangpur',
  'Dinajpur',
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Bhola',
  'Brahmanbaria',
  'Chandpur',
  'Chapainawabganj',
  'Chuadanga',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Habiganj',
  'Jamalpur',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Munshiganj',
  'Naogaon',
  'Narail',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Tangail',
  'Thakurgaon',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const {
    cart,
    subtotal,
    deliveryCharge,
    finalTotal,
    appliedCoupon,
    clearCart,
    deliveryDistrict,
    setDeliveryDistrict,
  } = useCart();
  const { user } = useAuth();

  // Checkout Form
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [district, setDistrict] = useState(deliveryDistrict || 'Dhaka');
  const [upazila, setUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'bank'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from user saved addresses if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setCustomerName(defaultAddr.fullName || user.name);
        setCustomerPhone(defaultAddr.phone || user.phone);
        setDistrict(defaultAddr.district);
        setUpazila(defaultAddr.upazila);
        setFullAddress(defaultAddr.fullAddress);
        setDeliveryDistrict(defaultAddr.district);
      }
    }
  }, [user]);

  // Sync delivery district change
  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setDeliveryDistrict(d);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !district || !upazila.trim() || !fullAddress.trim()) {
      setError('Please fill in all required delivery address fields.');
      return;
    }

    // Phone validation
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01711223344).');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'bank') && !transactionId.trim()) {
      setError(`Please provide your ${paymentMethod.toUpperCase()} Transaction Reference / TrxID.`);
      return;
    }

    setSubmitting(true);
    try {
      const isInsideDhaka = district.toLowerCase().includes('dhaka');
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: {
          district,
          upazila: upazila.trim(),
          fullAddress: fullAddress.trim(),
          orderNotes: orderNotes.trim() || undefined,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedVariations: item.selectedVariations,
        })),
        deliveryMethod: isInsideDhaka ? 'Inside Dhaka (1-2 Days)' : 'Outside Dhaka (2-4 Days)',
        paymentMethod,
        couponCode: appliedCoupon?.code,
        transactionId: transactionId.trim() || undefined,
      };

      const res = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(res.order);
      onNavigate(`/order-confirmation/${res.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">No Items to Checkout</h2>
        <p className="text-xs text-stone-500 mb-6">Please add authentic luxury items to your cart first.</p>
        <button
          onClick={() => onNavigate('/all-products')}
          className="px-6 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
        >
          View Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900">
          Fast Bangladesh Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-sans">
          Doorstep delivery with 100% genuine imported guarantee across all 64 districts.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Customer Details & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer Information */}
          <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1917] text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
              Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Samira Rahman"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bangladeshi Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01711223344"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">Delivery rider will call this number</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">For digital invoice and receipt</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  District (জেলা) *
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                >
                  {BD_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} {dist === 'Dhaka' ? '(৳70 Delivery)' : '(৳130 Delivery)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Upazila / Area / Thana (থানা / এলাকা) *
                </label>
                <input
                  type="text"
                  required
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="e.g. Banani, Dhanmondi, Uttara, Panchlaish"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Street & House Address (পূর্ণ ঠিকানা) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="House number, road number, flat/apt floor, landmarks"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Order Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Please ring doorbell twice, deliver after 3 PM"
                  className="w-full text-xs px-3.5 py-2 bg-[#FAF7F5] border border-stone-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1917] text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash On Delivery (COD) */}
              <label
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-[#1C1917] bg-[#FAF0EE]'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-stone-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Pay upon delivery at your doorstep
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-800 font-medium">
                  ✓ Inspect package before paying
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="accent-[#E2136E]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#E2136E]">
                      bKash Payment
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Merchant checkout or Send Money
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-stone-600">
                  Instant verification via TrxID
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7931E] bg-orange-50/50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="accent-[#F7931E]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#D35400]">
                      Nagad Payment
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Official Merchant Number
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-stone-600">
                  Instant verification via TrxID
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'bank'
                    ? 'border-[#1C1917] bg-[#FAF0EE]'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="accent-stone-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-900">
                      Bank Wire / Transfer
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Eastern Bank PLC (EBL)
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-stone-600">
                  Direct corporate account
                </div>
              </label>
            </div>

            {/* Payment Details Drawer based on selection */}
            {paymentMethod === 'bkash' && (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg text-xs space-y-2">
                <p className="font-bold text-[#E2136E]">bKash Payment Instructions:</p>
                <p className="text-stone-700 leading-relaxed">
                  1. Go to your bKash app and select <strong>Make Payment</strong> or <strong>Send Money</strong>.
                  <br />
                  2. Enter Merchant Number: <strong className="font-mono text-sm text-[#E2136E]">01711223344</strong>
                  <br />
                  3. Enter Exact Amount: <strong className="font-mono text-stone-900 font-bold font-sans">৳{finalTotal.toLocaleString()}</strong>
                  <br />
                  4. Reference: Enter your phone number or name.
                </p>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Enter bKash Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9G7K21MN4X"
                    className="w-full text-xs font-mono uppercase px-3 py-2 bg-white border border-pink-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'nagad' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-xs space-y-2">
                <p className="font-bold text-[#D35400]">Nagad Payment Instructions:</p>
                <p className="text-stone-700 leading-relaxed">
                  1. Dial *167# or open Nagad App.
                  <br />
                  2. Select Merchant Pay to: <strong className="font-mono text-sm text-[#D35400]">01711223344</strong>
                  <br />
                  3. Amount: <strong className="font-mono text-stone-900 font-bold font-sans">৳{finalTotal.toLocaleString()}</strong>
                </p>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Enter Nagad Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    placeholder="e.g. 7M20PK9X1"
                    className="w-full text-xs font-mono uppercase px-3 py-2 bg-white border border-orange-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="p-4 bg-[#FAF7F5] border border-stone-300 rounded-lg text-xs space-y-2">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#C5A059]" /> Bank Transfer Details:
                </p>
                <div className="bg-white p-3 rounded border border-stone-200 font-mono text-[11px] space-y-1">
                  <p>Bank: Eastern Bank PLC (EBL)</p>
                  <p>Account Name: SSTREAND SHOP BANGLADESH</p>
                  <p>Account Number: 1041060987654</p>
                  <p>Branch: Banani Branch, Dhaka</p>
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Deposit Reference / Transaction Slip No *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. EBL-DEP-98124"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Order Review ({cart.reduce((a, b) => a + b.quantity, 0)} items)
            </h3>

            {/* Item Mini List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 pr-1">
              {cart.map((item) => {
                const unitPrice = item.product.salePrice || item.product.regularPrice;
                return (
                  <div key={`${item.productId}-${JSON.stringify(item.selectedVariations || {})}`} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-12 h-14 object-cover rounded bg-stone-100 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-editorial font-semibold text-stone-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Qty: {item.quantity}{' '}
                          {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 &&
                            `(${Object.values(item.selectedVariations).join(', ')})`}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 font-sans shrink-0">
                      ৳{(unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100">
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
                <span>Delivery Charge ({district})</span>
                <span className="font-semibold font-sans text-stone-900">
                  {deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Total Payable Amount</span>
                <span className="font-sans text-xl text-[#1C1917]">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Placing Order...' : 'Confirm Order Now'}</span>
            </button>

            {/* Trust Assurances */}
            <div className="pt-2 text-[11px] text-stone-500 space-y-1.5 text-center">
              <p className="flex items-center justify-center gap-1.5 text-stone-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> 100% Authentic Quality Guaranteed
              </p>
              <p>We prevent duplicate submissions and protect your privacy.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
