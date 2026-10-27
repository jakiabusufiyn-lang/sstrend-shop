import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, X, Sparkles, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  categories: Category[];
  currentCategorySlug?: string;
  searchQuery?: string;
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductListingPage: React.FC<Props> = ({
  title,
  subtitle,
  products,
  categories,
  currentCategorySlug,
  searchQuery,
  onNavigate,
  onSelectProduct,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(10000); // max price filter
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyAuthentic, setOnlyAuthentic] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Extract unique subcategories from products in this view
  const subcategories = useMemo(() => {
    const subs = new Set<string>();
    products.forEach(p => {
      if (p.subcategory) subs.add(p.subcategory);
    });
    return Array.from(subs);
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedSubcategory !== 'all') {
      list = list.filter(p => p.subcategory === selectedSubcategory);
    }

    list = list.filter(p => (p.salePrice || p.regularPrice) <= priceRange);

    if (onlyInStock) {
      list = list.filter(p => p.stock > 0);
    }

    if (onlyAuthentic) {
      list = list.filter(p => p.isAuthenticVerified);
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.ratings - a.ratings);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, selectedSubcategory, priceRange, onlyInStock, onlyAuthentic, sortBy]);

  const displayedList = filteredProducts.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="border-b border-[#E8DFD8] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {searchQuery && (
            <span className="text-xs uppercase tracking-widest text-[#C5A059] font-medium">
              Search Results
            </span>
          )}
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-300 rounded-md text-xs font-semibold text-stone-800"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-300 rounded-md px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-6 pr-4 border-r border-[#E8DFD8]">
          {/* Categories Quick Filter */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-3">
              Departments
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              <li>
                <button
                  onClick={() => onNavigate('/all-products')}
                  className={`w-full text-left py-1 hover:text-stone-900 transition-colors ${
                    !currentCategorySlug ? 'font-semibold text-stone-950' : ''
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigate(`/category/${c.slug}`)}
                    className={`w-full text-left py-1 hover:text-stone-900 transition-colors ${
                      currentCategorySlug === c.slug ? 'font-semibold text-stone-950' : ''
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Subcategories (if available) */}
          {subcategories.length > 0 && (
            <div className="pt-4 border-t border-[#E8DFD8]">
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-3">
                Subcategory
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`block w-full text-left py-1 ${
                    selectedSubcategory === 'all' ? 'font-semibold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  All Subcategories
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`block w-full text-left py-1 ${
                      selectedSubcategory === sub ? 'font-semibold text-stone-900' : 'text-stone-600'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-[#E8DFD8]">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900">
                Max Price
              </h4>
              <span className="text-xs font-semibold text-stone-900 font-sans">
                ৳{priceRange.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="200"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>৳1,000</span>
              <span>৳10,000+</span>
            </div>
          </div>

          {/* Checkbox Attributes */}
          <div className="pt-4 border-t border-[#E8DFD8] space-y-2.5">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-stone-900 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAuthentic}
                onChange={(e) => setOnlyAuthentic(e.target.checked)}
                className="rounded text-stone-900 focus:ring-0"
              />
              <span>Verified Authentic Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 lg:col-span-4">
          <div className="mb-4 text-xs text-stone-500 flex justify-between items-center">
            <span>Showing {displayedList.length} of {filteredProducts.length} items</span>
          </div>

          {displayedList.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-stone-300 my-8">
              <h3 className="font-editorial text-xl font-semibold text-stone-800">
                No products match your selected filters
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-6">
                Try widening your price range or resetting selected subcategories to see all authentic imports.
              </p>
              <button
                onClick={() => {
                  setSelectedSubcategory('all');
                  setPriceRange(10000);
                  setOnlyInStock(false);
                  setOnlyAuthentic(false);
                }}
                className="px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-8 py-3 bg-white border border-[#D8CCC4] hover:border-stone-800 text-stone-900 text-xs uppercase tracking-widest font-semibold rounded-md transition-all shadow-2xs"
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-4/5 max-w-sm bg-[#FAF7F5] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8DFD8]">
                <h3 className="font-editorial text-lg font-bold text-stone-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price slider */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-stone-900">Max Price</span>
                  <span className="font-semibold text-stone-900 font-sans">
                    ৳{priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="200"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>

              {/* Attributes */}
              <div className="space-y-3 pt-4 border-t border-[#E8DFD8]">
                <label className="flex items-center gap-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={onlyAuthentic}
                    onChange={(e) => setOnlyAuthentic(e.target.checked)}
                  />
                  <span>Verified Authentic Only</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
