import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, AlertCircle, Phone, PackageCheck } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Please provide both Order Number and Phone Number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.trackOrder(orderId.trim().toUpperCase(), phone.trim());
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'No matching order found with the provided details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Verified & Confirmed' },
    { key: 'processing', label: 'Quality Checked & Packed' },
    { key: 'shipped', label: 'In Transit / Dispatched' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx > -1 ? idx : 0;
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">
          Live Parcel Tracking
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Track Your Shipment
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-sans">
          Enter your SSTREAND Order ID and recipient phone number to track real-time delivery status.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 sm:p-8 shadow-2xs max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order ID (e.g. SST-2026-1001)
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                placeholder="SST-2026-XXXX"
                className="w-full text-xs font-mono uppercase px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Recipient Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01711223344"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Locating Order...' : 'Track Order'}</span>
          </button>
        </form>
      </div>

      {/* Tracking Result View */}
      {order && (
        <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 sm:p-8 shadow-2xs space-y-8 animate-fadeIn max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-stone-100 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                Order ID
              </span>
              <h3 className="font-mono text-xl font-bold text-stone-900">{order.id}</h3>
              <p className="text-xs text-stone-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                Current Status
              </span>
              <span className="inline-block mt-0.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <div className="relative flex justify-between">
              {/* Connecting line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-stone-200 -z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-[#C5A059] transition-all duration-500 -z-0"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 90}%` }}
              />

              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center z-10 w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-[#1C1917] text-white shadow-sm ring-4 ring-[#FAF0EE]'
                          : 'bg-white border-2 border-stone-300 text-stone-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-semibold text-stone-800 mt-2 leading-tight">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Dispatch Information (if shipped) */}
          {order.trackingNumber && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" /> Courier Tracking Assigned
              </p>
              <p className="text-stone-700">
                Waybill/Tracking Code: <strong className="font-mono text-stone-900">{order.trackingNumber}</strong>
              </p>
            </div>
          )}

          {/* Timeline Milestones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Audit Timeline
            </h4>
            <div className="divide-y divide-stone-100 text-xs">
              {(order.timeline || []).map((tl, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-stone-900 capitalize block">{tl.status}</span>
                    <span className="text-stone-600">{tl.note}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 shrink-0 ml-4">
                    {new Date(tl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Service Notice */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Need priority concierge assistance?</span>
            <a
              href="tel:+8801711223344"
              className="text-[#A07C38] font-semibold hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> Call +880 1711-223344
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
