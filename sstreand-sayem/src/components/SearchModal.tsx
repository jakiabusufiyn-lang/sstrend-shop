import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await api.getProducts({ search: query.trim() });
          setResults(res.products.slice(0, 6));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const popularKeywords = [
    'Silk Pleated Dress',
    'Niacinamide Serum',
    'Ceramide Barrier Cream',
    'Mini Leather Tote',
    'Velvet Cushion SPF 50',
    'Quilted Shoulder Bag',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col items-center">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-[#FAF7F5] rounded-b-xl shadow-2xl mt-0 sm:mt-12 z-10 border border-[#E8DFD8] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#E8DFD8] flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onViewAllResults(query.trim());
                onClose();
              }
            }}
            placeholder="Search dresses, serums, bags, cosmetics..."
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 font-medium px-2 py-1"
          >
            Esc
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="py-8 text-center text-xs text-stone-500">
              Searching authentic collections...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
                <span>Matching Products ({results.length})</span>
                <button
                  onClick={() => {
                    onViewAllResults(query);
                    onClose();
                  }}
                  className="text-[#A07C38] font-semibold hover:underline flex items-center gap-1"
                >
                  View all results <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-[#EFE8E2]">
                {results.map((product) => {
                  const price = product.salePrice || product.regularPrice;
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="py-3 flex items-center gap-3 hover:bg-white/80 p-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-editorial text-sm font-semibold text-stone-900 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="uppercase tracking-wider text-[10px] text-[#A07C38]">
                            {product.category.replace('-', ' ')}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-[10px]">{product.sku}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-stone-900 font-sans">
                          ৳{price.toLocaleString()}
                        </p>
                        {product.salePrice && product.salePrice < product.regularPrice && (
                          <span className="text-[10px] text-stone-400 line-through">
                            ৳{product.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && query.trim().length > 1 && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-editorial text-base font-semibold text-stone-800">
                No products found for "{query}"
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Check your spelling or try searching for skincare, wrap dress, or mini handbag.
              </p>
            </div>
          )}

          {/* Popular searches suggestions */}
          {results.length === 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setQuery(kw)}
                    className="text-xs px-3 py-1.5 bg-white hover:bg-[#EAD7D1]/40 border border-[#E4D7CE] rounded-full text-stone-700 transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
