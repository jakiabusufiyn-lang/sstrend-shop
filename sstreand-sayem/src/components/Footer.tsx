import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones, MapPin, Phone, Mail } from 'lucide-react';
import { HomepageContent } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  content?: HomepageContent;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, content }) => {
  return (
    <footer className="bg-[#1C1917] text-[#FAF7F5] pt-14 pb-8 border-t border-[#2E2A26]">
      {/* 4 Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#2E2A26]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2A2623] flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-base font-semibold text-white">100% Authentic Imports</h4>
            <p className="text-xs text-stone-400">Directly sourced, laboratory verified radiant skincare and atelier fashion.</p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2A2623] flex items-center justify-center text-[#C5A059]">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-base font-semibold text-white">Nationwide Delivery</h4>
            <p className="text-xs text-stone-400">Dhaka delivery in 24–48 hours; all 64 districts in 2–4 days via premium couriers.</p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2A2623] flex items-center justify-center text-[#C5A059]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-base font-semibold text-white">7-Day Easy Exchange</h4>
            <p className="text-xs text-stone-400">Hassle-free size and shade exchanges with door-to-door courier swap.</p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2A2623] flex items-center justify-center text-[#C5A059]">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-base font-semibold text-white">Dedicated Concierge</h4>
            <p className="text-xs text-stone-400">Personal styling and shade-matching assistance on WhatsApp & Phone.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Address */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl font-bold tracking-[0.2em] text-white">
                SSTREAND
              </span>
              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#C5A059]">
                SHOP
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              SSTREAND SHOP brings curated China import beauty, radiant clinical skincare, luxury handbags, and comfortable women’s fashion to Bangladesh. Authentic luxury with effortless grace.
            </p>
            <div className="space-y-2 text-xs text-stone-300 pt-1">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Level 4, House 12, Road 11, Banani, Dhaka-1213, Bangladesh</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+880 1711-223344 (Concierge & WhatsApp)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>concierge@sstreand.com</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold mb-4">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('/category/womens-fashion')} className="hover:text-white transition-colors">
                  Women's Fashion (মহিলাদের ফ্যাশন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/womens-handbags')} className="hover:text-white transition-colors">
                  Handbags & Totes (হ্যান্ডব্যাগ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/skincare')} className="hover:text-white transition-colors">
                  Radiant Skincare (স্কিনকেয়ার)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/beauty-cosmetics')} className="hover:text-white transition-colors">
                  Beauty & Cosmetics (প্রসাধন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/new-arrivals')} className="hover:text-white transition-colors">
                  New 2026 Arrivals (নতুন আগমন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/sale-offers')} className="hover:text-white transition-colors">
                  Sale & Offers (মূল্যছাড়)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shipping-policy')} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/return-policy')} className="hover:text-white transition-colors">
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact-us')} className="hover:text-white transition-colors">
                  Contact Banani Showroom
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about-us')} className="hover:text-white transition-colors">
                  About SSTREAND
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h5 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold mb-4">
              Security & Trust
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms-conditions')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin/login')} className="hover:text-[#C5A059] transition-colors">
                  Merchant Admin Access
                </button>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-[11px] text-stone-400 uppercase tracking-wider font-medium mb-2">
                Supported Payments:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-stone-300">
                <span className="bg-[#2E2A26] px-2 py-1 rounded">bKash</span>
                <span className="bg-[#2E2A26] px-2 py-1 rounded">Nagad</span>
                <span className="bg-[#2E2A26] px-2 py-1 rounded">Bank Transfer</span>
                <span className="bg-[#2E2A26] px-2 py-1 rounded text-[#C5A059]">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#2E2A26] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <p>
          {content?.footerNotice ||
            '© 2026 SSTREAND SHOP Bangladesh. All rights reserved. 100% Genuine Imported Fashion & Radiant Skincare.'}
        </p>
        <p className="text-stone-400">
          Made for Bangladesh · Currency: BDT (৳)
        </p>
      </div>
    </footer>
  );
};
