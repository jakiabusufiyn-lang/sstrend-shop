import React from 'react';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface Props {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const price = product.salePrice || product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col bg-white rounded-lg border border-[#EFE8E2] hover:border-[#D8CCC4] transition-all duration-300 hover:shadow-lg overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-[3/4] w-full bg-[#F5EFEA] overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-rose-600 shadow-sm'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Discreet Discount & Authenticity text overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
          {hasDiscount && (
            <span className="bg-[#1C1917] text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isAuthenticVerified && (
            <span className="bg-emerald-950/80 backdrop-blur-xs text-emerald-100 text-[9px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-xs flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-emerald-300" /> Authentic Import
            </span>
          )}
        </div>

        {/* Quick Add Overlay on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full py-2.5 px-3 bg-[#1C1917]/95 hover:bg-[#1C1917] text-white text-xs uppercase tracking-wider font-medium rounded-md shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-stone-800 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Verified Origin */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-medium text-[#A07C38]">{product.category.replace('-', ' ')}</span>
            {isLowStock && (
              <span className="text-amber-700 font-medium">Only {product.stock} left</span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-editorial text-base sm:text-lg font-semibold text-[#1C1917] hover:text-[#8C6D46] transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.nameBn && (
            <p className="text-[11px] text-stone-500 line-clamp-1 font-sans -mt-0.5 mb-1.5">
              {product.nameBn}
            </p>
          )}

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-medium text-stone-800 text-xs">{product.ratings.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-[11px]">({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Price & SKU */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-[#1C1917] font-sans">
              ৳{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-sans">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-400 font-mono uppercase">{product.sku}</span>
        </div>
      </div>
    </div>
  );
};
