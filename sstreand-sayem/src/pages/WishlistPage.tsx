import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-[#FAF0EE] rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-editorial text-3xl font-bold text-stone-900 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-8 font-sans">
          Save your favourite silk wrap dresses, radiant skincare formulas, and imported handbags to view them anytime.
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8DFD8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
            Saved Favourites
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            My Wishlist ({wishlistItems.length})
          </h1>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs text-stone-500 hover:text-rose-600 transition-colors self-start sm:self-auto"
        >
          Clear All Wishlist Items
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlistItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
};
