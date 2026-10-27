export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  mustChangePassword?: boolean;
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  title: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  district: string;
  upazila: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Color: Rose Gold", "Size: M", "Type: Dry Skin"
  type: 'color' | 'size' | 'volume' | 'shade';
  value: string;
  skuModifier?: string;
  stockModifier?: number;
  priceModifier?: number;
}

export interface ProductReview {
  id: string;
  userId?: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string; // Bangla title support
  slug: string;
  sku: string;
  category: string; // slug
  subcategory?: string;
  description: string;
  descriptionBn?: string;
  specifications: Record<string, string>;
  regularPrice: number;
  salePrice?: number;
  discountPercent?: number;
  stock: number;
  images: string[];
  videoUrl?: string;
  isImported?: boolean;
  isAuthenticVerified: boolean;
  originCountry?: string;
  variations: ProductVariation[];
  ratings: number;
  reviewCount: number;
  reviews: ProductReview[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order: number;
  itemCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariations?: Record<string, string>; // e.g. { Color: "Blush", Size: "M" }
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariations?: Record<string, string>;
  total: number;
}

export interface Order {
  id: string; // e.g. SST-2026-1042
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    district: string;
    upazila: string;
    fullAddress: string;
    orderNotes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  deliveryMethod: string; // e.g. "Inside Dhaka (1-2 Days)", "Outside Dhaka (2-4 Days)"
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'bank';
  paymentStatus: 'pending' | 'verified' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: string;
    note: string;
    timestamp: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface HomepageContent {
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  hero: {
    headline: string;
    subtitle: string;
    button1Text: string;
    button1Link: string;
    button2Text: string;
    button2Link: string;
    desktopBannerUrl: string;
    mobileBannerUrl: string;
    badgeText: string;
  };
  promoBanner: {
    enabled: boolean;
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
  };
  contactInfo: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
  };
  footerNotice: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingMinAmount: number;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
    routingNumber?: string;
    instructions: string;
  };
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  socialAuth: {
    googleClientIdConfigured: boolean;
    facebookAppIdConfigured: boolean;
  };
}
