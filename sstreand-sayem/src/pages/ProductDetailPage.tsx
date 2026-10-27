import React, { useState } from 'react';
import {
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface Props {
  product: Product;
  relatedProducts: Product[];
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<Props> = ({
  product,
  relatedProducts,
  onNavigate,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    // Select first variation of each type by default if available
    const initial: Record<string, string> = {};
    if (product.variations && product.variations.length > 0) {
      product.variations.forEach((v) => {
        if (!initial[v.type]) {
          initial[v.type] = v.value;
        }
      });
    }
    return initial;
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const price = product.salePrice || product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariations);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariations);
    onNavigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on SSTREAND SHOP`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await api.addReview(product.id, {
        userName: reviewerName.trim() || 'Verified Customer',
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewerName('');
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Group variations by type
  const variationTypes = Array.from(new Set(product.variations.map((v) => v.type)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-stone-500 flex items-center gap-2">
        <button onClick={() => onNavigate('/')} className="hover:text-stone-900">
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate(`/category/${product.category}`)}
          className="hover:text-stone-900 capitalize"
        >
          {product.category.replace('-', ' ')}
        </button>
        <span>/</span>
        <span className="text-stone-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx
                      ? 'border-[#1C1917] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 relative aspect-[4/5] bg-[#F5EFEA] rounded-xl overflow-hidden border border-[#EFE8E2]">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {hasDiscount && (
                <span className="bg-[#1C1917] text-white text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded">
                  -{product.discountPercent}% OFF
                </span>
              )}
              {product.isAuthenticVerified && (
                <span className="bg-emerald-950/85 backdrop-blur-xs text-emerald-100 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" /> Authentic Import Verified
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-stone-700 rounded-full shadow-sm transition-all"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {shareCopied && (
              <div className="absolute top-16 right-4 bg-stone-900 text-white text-xs px-3 py-1.5 rounded shadow-lg">
                Link copied to clipboard!
              </div>
            )}
          </div>
        </div>

        {/* Right: Purchasing Details & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Origin & SKU */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="uppercase tracking-widest font-semibold text-[#A07C38]">
                {product.originCountry || 'Imported Atelier Quality'}
              </span>
              <span className="font-mono text-stone-400">SKU: {product.sku}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {product.nameBn && (
              <p className="text-sm text-stone-600 font-sans -mt-2">
                {product.nameBn}
              </p>
            )}

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.ratings)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-stone-900 font-sans">{product.ratings.toFixed(1)}</span>
              <span>·</span>
              <span className="underline underline-offset-2">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-sans text-3xl font-bold text-[#1C1917]">
                ৳{price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="font-sans text-base text-stone-400 line-through">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Save ৳{(product.regularPrice - price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Availability Indicator */}
            <div className="pt-1">
              {isOutOfStock ? (
                <p className="text-xs text-rose-600 font-medium">Currently Sold Out</p>
              ) : product.stock <= 5 ? (
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Limited stock: Only {product.stock} items available in Dhaka warehouse
                </p>
              ) : (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In Stock · Ready for Immediate Dispatch
                </p>
              )}
            </div>

            {/* Product Variations (Colors, Sizes, Shades, Volume) */}
            {variationTypes.map((vType) => {
              const options = product.variations.filter((v) => v.type === vType);
              return (
                <div key={vType} className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-stone-800">
                      Select {vType}:
                    </span>
                    <span className="text-stone-600 font-medium">
                      {selectedVariations[vType] || options[0]?.value}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isSelected = selectedVariations[vType] === opt.value;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedVariations((prev) => ({ ...prev, [vType]: opt.value }))
                          }
                          className={`px-3.5 py-1.5 text-xs rounded-md border font-medium transition-all ${
                            isSelected
                              ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                              : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400'
                          }`}
                        >
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-300 rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-stone-900 font-sans">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  Total: <strong className="text-stone-900 font-sans font-bold">৳{(price * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="grid grid-cols-5 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="col-span-4 py-3.5 px-6 bg-white border-2 border-stone-900 hover:bg-stone-50 text-stone-900 text-xs uppercase tracking-[0.15em] font-bold rounded-md shadow-2xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`py-3.5 px-3 rounded-md border flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 bg-white text-stone-700 hover:text-rose-600 hover:border-stone-400'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-md shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            >
              <span>BUY NOW (CASH ON DELIVERY)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Value Accordion / Delivery & Returns info */}
          <div className="bg-[#FAF0EE] rounded-lg p-4 space-y-3 text-xs text-stone-700 border border-[#E8DFD8]">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#A07C38] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">Bangladesh Delivery Options</p>
                <p className="text-stone-600">Inside Dhaka ৳70 (1–2 days) · Outside Dhaka ৳130 (2–4 days). Free delivery on orders over ৳3,000.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#A07C38] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">7-Day Easy Exchange</p>
                <p className="text-stone-600">Doorstep return and size exchange support throughout Bangladesh.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#A07C38] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">100% Authenticity Guarantee</p>
                <p className="text-stone-600">Directly sourced luxury imports. Full refund if proven non-authentic.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="border-t border-[#E8DFD8] pt-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-editorial text-2xl font-bold text-stone-900">Product Description</h3>
            <p className="text-sm text-stone-700 leading-relaxed font-sans">{product.description}</p>
            {product.descriptionBn && (
              <div className="p-4 bg-[#F4EBE5] rounded-md text-xs text-stone-800 leading-relaxed font-sans">
                <span className="font-semibold block mb-1">বাংলা বিবরণ:</span>
                {product.descriptionBn}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-4">Specifications</h3>
            <div className="bg-white rounded-lg border border-[#EFE8E2] divide-y divide-stone-100 text-xs">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-3 flex justify-between">
                  <span className="font-medium text-stone-500">{key}</span>
                  <span className="font-semibold text-stone-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Genuine Customer Reviews Section */}
      <div className="border-t border-[#E8DFD8] pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Real feedback from verified purchasers across Bangladesh.
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-lg border border-[#EFE8E2] space-y-2 shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-xs text-stone-900">{rev.userName}</h5>
                    <div className="flex items-center text-amber-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.date}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed pt-1 font-sans">{rev.comment}</p>
                {rev.verifiedPurchase && (
                  <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Verified Bangladesh Purchase
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 col-span-2">
              Be the first to review this imported product!
            </p>
          )}
        </div>

        {/* Add Review Form */}
        <div className="bg-[#FAF0EE] rounded-xl p-6 sm:p-8 max-w-2xl border border-[#E8DFD8]">
          <h4 className="font-editorial text-lg font-bold text-stone-900 mb-1">
            Write a Customer Review
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            Share your experience with product quality, authenticity, and fit.
          </p>

          {reviewSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
              Thank you! Your verified review has been submitted.
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Farzana Islam"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-500"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-800 ml-2 font-sans">{reviewRating} Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Your Review</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How did the product feel? Was the delivery fast?"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-stone-800 transition-colors"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#E8DFD8] pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              You May Also Adore
            </h3>
            <button
              onClick={() => onNavigate(`/category/${product.category}`)}
              className="text-xs uppercase tracking-wider text-[#A07C38] font-semibold hover:underline"
            >
              View More in Department →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
