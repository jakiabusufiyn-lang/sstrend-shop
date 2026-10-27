import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, ChevronRight } from 'lucide-react';
import { Product, Category, HomepageContent } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  content: HomepageContent;
  categories: Category[];
  products: Product[];
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  content,
  categories,
  products,
  onNavigate,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestseller'>('featured');

  const hero = content.hero;
  const promo = content.promoBanner;

  // Filter products by tab
  const displayedProducts = products
    .filter(p => {
      if (activeTab === 'new') return p.isNewArrival;
      if (activeTab === 'bestseller') return p.isBestSeller;
      return p.isFeatured;
    })
    .slice(0, 8);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FAF0EE] border-b border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Editorial Text */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E4D7CE] text-stone-700 text-xs uppercase tracking-wider font-medium shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{hero.badgeText || 'Curated 2026 Luxury Collection'}</span>
              </div>

              {/* Exact required headline */}
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] leading-[1.12]">
                {hero.headline}
              </h1>

              {/* Exact required subtitle */}
              <p className="text-base sm:text-lg text-stone-600 font-sans font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {hero.subtitle}
              </p>

              {/* Two Prominent Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => onNavigate(hero.button1Link || '/category/womens-fashion')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-md shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>{hero.button1Text || 'SHOP NOW'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate(hero.button2Link || '/all-products')}
                  className="w-full sm:w-auto px-8 py-4 bg-white/90 hover:bg-white text-stone-900 border border-[#D8CCC4] hover:border-stone-400 text-xs uppercase tracking-[0.2em] font-semibold rounded-md shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  {hero.button2Text || 'EXPLORE COLLECTIONS'}
                </button>
              </div>

              {/* Authenticity Guarantee Note */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5 font-medium text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> Verified Authenticity
                </span>
                <span className="text-stone-300">·</span>
                <span>Direct China Atelier Imports</span>
                <span className="text-stone-300">·</span>
                <span>Prices in BDT (৳)</span>
              </div>
            </div>

            {/* Right Hero Image Banner (Responsive Desktop & Mobile) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background aura */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#EAD7D1] to-[#F5EFEA] rounded-2xl transform -rotate-1 opacity-70 blur-xs" />

                {/* Primary Banner Image */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-[4/5] bg-stone-200 border-2 border-white">
                  <img
                    src={hero.desktopBannerUrl}
                    alt="SSTREAND SHOP China Import Beauty & Fashion 2026"
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Editorial Floating Accent Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-lg border border-[#EFE8E2] shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#A07C38] font-bold">
                        Direct Import Guarantee
                      </p>
                      <p className="text-xs font-semibold text-stone-900 font-editorial">
                        100% Authentic Quality Check
                      </p>
                    </div>
                    <span className="text-xs font-bold font-sans text-stone-800 bg-[#FAF0EE] px-2.5 py-1 rounded">
                      Dhaka 24h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY HIGHLIGHT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
              Curated Collections
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-1">
              Shop by Department
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/all-products')}
            className="text-xs uppercase tracking-wider font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#EAD7D1] font-sans">
                  {cat.itemCount || 4} Products
                </span>
                <h3 className="font-editorial text-lg sm:text-xl font-bold mt-0.5 leading-snug">
                  {cat.name}
                </h3>
                {cat.nameBn && (
                  <p className="text-[11px] text-stone-300 font-sans">{cat.nameBn}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CURATED PRODUCT SHOWCASE TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8DFD8] pb-4 mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
              The 2026 Selection
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-1">
              Trending In Bangladesh
            </h2>
          </div>

          {/* Functional Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#EFE8E2] rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'bestseller'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('/all-products')}
            className="px-8 py-3.5 bg-white border border-[#D8CCC4] hover:border-stone-800 text-stone-900 text-xs uppercase tracking-widest font-semibold rounded-md transition-all cursor-pointer"
          >
            Explore Complete Catalogue
          </button>
        </div>
      </section>

      {/* 4. PROMOTIONAL EDITORIAL BANNER */}
      {promo.enabled && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-[#1C1917] text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] items-center">
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-4 z-10">
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
                  Editorial Spotlight
                </span>
                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {promo.headline}
                </h3>
                <p className="text-stone-300 text-sm sm:text-base font-normal max-w-md font-sans leading-relaxed">
                  {promo.subtitle}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => onNavigate(promo.buttonLink || '/category/skincare')}
                    className="px-7 py-3.5 bg-[#C5A059] hover:bg-[#b08b47] text-stone-950 text-xs uppercase tracking-[0.2em] font-semibold rounded-md transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <span>{promo.buttonText || 'Discover The Edit'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden">
                <img
                  src={promo.imageUrl}
                  alt={promo.headline}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917] via-transparent to-transparent hidden lg:block" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. AUTHENTICITY & TRUST STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-xl p-8 sm:p-12 border border-[#EFE8E2]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-editorial font-bold text-[#C5A059]">100%</div>
            <h4 className="font-editorial text-base font-bold text-stone-900">Direct Atelier Verification</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every garment and cosmetic lot is inspected for authenticity, fabric density, and expiration codes before shipping to Bangladesh.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-editorial font-bold text-[#C5A059]">24-48h</div>
            <h4 className="font-editorial text-base font-bold text-stone-900">Dhaka Express Delivery</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Fast, reliable doorstep delivery with cash on delivery (COD) throughout all 64 districts with real-time parcel tracking.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-editorial font-bold text-[#C5A059]">4.9 ★</div>
            <h4 className="font-editorial text-base font-bold text-stone-900">Customer Satisfaction</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Loved by thousands of women across Dhaka, Chittagong, Sylhet, and beyond for authentic beauty and effortless style.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
