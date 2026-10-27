import React, { useEffect, useRef } from 'react';
import { CheckCircle, Truck, Package, Clock, Phone, ArrowRight } from 'lucide-react';
import { Order } from '../types';

interface Props {
  order: Order | null;
  onNavigate: (path: string) => void;
}

function launchNativeConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRot: number;
    life: number;
  }[] = [];

  const colors = ['#C5A059', '#1C1917', '#EAD7D1', '#FAF0EE', '#E2136E'];
  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      life: 1,
    });
  }

  let animationFrame: number;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.life -= 0.012;

      if (p.life > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (active) {
      animationFrame = requestAnimationFrame(render);
    }
  };

  render();
}

export const OrderConfirmationPage: React.FC<Props> = ({ order, onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      launchNativeConfetti(canvasRef.current);
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">Return to home or verify your order tracking ID.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
      {/* Success Hero Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#E8DFD8]">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">
          Order Successfully Placed
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900">
          Thank You, {order.customerName.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto">
          We have received your order. Our team in Banani, Dhaka will verify and package your authentic items.
        </p>

        {/* Order ID Badge */}
        <div className="inline-block bg-[#FAF0EE] border border-[#E8DFD8] px-4 py-2 rounded-lg mt-2">
          <span className="text-xs text-stone-500 mr-2">Order Number:</span>
          <span className="font-mono text-sm font-bold text-stone-900 tracking-wider">
            {order.id}
          </span>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="mt-8 bg-white rounded-xl border border-[#EFE8E2] p-6 sm:p-8 shadow-2xs space-y-8">
        {/* Status & Delivery Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-stone-100 pb-6">
          <div className="space-y-1">
            <span className="text-stone-400 uppercase font-semibold text-[10px]">Delivery Method</span>
            <p className="font-bold text-stone-900">{order.deliveryMethod}</p>
            <p className="text-stone-500 text-[11px]">Courier dispatch within 24 hours</p>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 uppercase font-semibold text-[10px]">Payment Method</span>
            <p className="font-bold text-stone-900 uppercase">{order.paymentMethod}</p>
            <p className="text-emerald-700 font-medium capitalize">Status: {order.paymentStatus}</p>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 uppercase font-semibold text-[10px]">Recipient Phone</span>
            <p className="font-bold text-stone-900">{order.customerPhone}</p>
            <p className="text-stone-500 text-[11px] truncate">{order.customerEmail || 'No email provided'}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-1 text-xs">
          <h4 className="font-semibold uppercase tracking-wider text-stone-900 text-[11px]">
            Delivery Address
          </h4>
          <p className="text-stone-700 leading-relaxed">
            {order.shippingAddress.fullAddress}, {order.shippingAddress.upazila}, {order.shippingAddress.district}
          </p>
          {order.shippingAddress.orderNotes && (
            <p className="text-stone-500 italic mt-1">
              Note: {order.shippingAddress.orderNotes}
            </p>
          )}
        </div>

        {/* Ordered Items */}
        <div className="space-y-3">
          <h4 className="font-editorial text-base font-bold text-stone-900">
            Items in This Order
          </h4>
          <div className="divide-y divide-stone-100 border border-stone-100 rounded-lg overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-[#FAF7F5]">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt=""
                    className="w-12 h-14 object-cover rounded bg-stone-200"
                  />
                  <div>
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    <p className="text-[11px] text-stone-500">
                      Qty: {item.quantity} · SKU: {item.sku}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-stone-900 font-sans">
                  ৳{item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-stone-900 font-sans">৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount:</span>
              <span className="font-semibold font-sans">-৳{order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className="font-sans text-stone-900">
              {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
            <span>Total Payable:</span>
            <span className="font-sans text-lg text-[#1C1917]">৳{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
          <button
            onClick={() => onNavigate('/track-order')}
            className="w-full sm:w-auto px-6 py-3 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded-md shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track This Shipment
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3 border border-stone-300 text-stone-800 hover:bg-stone-50 text-xs uppercase tracking-wider font-semibold rounded-md transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
