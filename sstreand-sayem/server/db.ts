import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Product,
  Category,
  Order,
  Coupon,
  HomepageContent,
  StoreSettings,
} from './types.js';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'sstreand_shop.json');

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  homepageContent: HomepageContent;
  settings: StoreSettings;
  media: { id: string; url: string; name: string; size: number; uploadedAt: string }[];
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error reading db.json, generating default data:', err);
    }
    const defaultData = this.getDefaultSeedData();
    this.saveDatabase(defaultData);
    return defaultData;
  }

  public saveDatabase(dataToSave?: DatabaseSchema): void {
    try {
      const data = dataToSave || this.data;
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  private getDefaultSeedData(): DatabaseSchema {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Sstreand@2026!Admin';
    const adminUser: User = {
      id: 'usr_admin_001',
      name: 'SSTRADEADMIN',
      email: 'admin@sstreand.com',
      phone: '01700000000',
      passwordHash: hashPassword(adminPassword),
      role: 'admin',
      mustChangePassword: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      addresses: [],
    };

    const categories: Category[] = [
      {
        id: 'cat_1',
        name: "Women's Fashion",
        nameBn: 'মহিলাদের ফ্যাশন',
        slug: 'womens-fashion',
        description: 'Elegant dresses, luxury coordinates, imported tops, and comfortable designer silhouettes.',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        order: 1,
        itemCount: 4,
      },
      {
        id: 'cat_2',
        name: "Women's Handbags",
        nameBn: 'মহিলাদের হ্যান্ডব্যাগ',
        slug: 'womens-handbags',
        description: 'Exquisite crossbody bags, premium structured totes, evening clutches, and leather satchels.',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        order: 2,
        itemCount: 3,
      },
      {
        id: 'cat_3',
        name: 'Skincare',
        nameBn: 'স্কিনকেয়ার',
        slug: 'skincare',
        description: 'Authentic radiant serums, moisture barrier creams, brightening essences, and mineral SPF.',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        order: 3,
        itemCount: 4,
      },
      {
        id: 'cat_4',
        name: 'Beauty & Cosmetics',
        nameBn: 'বিউটি ও প্রসাধন',
        slug: 'beauty-cosmetics',
        description: 'Velvet lip tints, radiant cushions, luminous blushes, and long-lasting eye pigments.',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        order: 4,
        itemCount: 3,
      },
      {
        id: 'cat_5',
        name: 'New Arrivals',
        nameBn: 'নতুন আগমন',
        slug: 'new-arrivals',
        description: 'The newest 2026 curated imports and radiant beauty arrivals.',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
        order: 5,
        itemCount: 5,
      },
      {
        id: 'cat_6',
        name: 'Best Sellers',
        nameBn: 'সর্বাধিক বিক্রিত',
        slug: 'best-sellers',
        description: 'Top-rated, customer-adored fashion statements and holy-grail skincare formulas.',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        order: 6,
        itemCount: 6,
      },
      {
        id: 'cat_7',
        name: 'Sale & Offers',
        nameBn: 'অফার ও মূল্যছাড়',
        slug: 'sale-offers',
        description: 'Exclusive seasonal discounts and limited-time savings on authentic collections.',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
        order: 7,
        itemCount: 5,
      },
    ];

    const products: Product[] = [
      {
        id: 'prod_001',
        name: 'Celestial Silk Pleated Wrap Dress',
        nameBn: 'সিল্ক প্লিটেড র‍্যাপ ড্রেস',
        slug: 'celestial-silk-pleated-wrap-dress',
        sku: 'SST-FAS-001',
        category: 'womens-fashion',
        subcategory: 'Dresses',
        description: 'Crafted from breathable mulberry silk blend with intricate accordion micro-pleats. Features an adjustable waist tie and graceful mid-calf sweep designed for everyday elegance and festive gatherings.',
        descriptionBn: 'উচ্চমানের সিল্ক ব্লেন্ডে তৈরি সূক্ষ্ম প্লিটেড র‍্যাপ ড্রেস। আরামদায়ক ও আভিজাত্যপূর্ণ লুকের জন্য অসাধারণ।',
        specifications: {
          Material: 'Mulberry Silk & High-Grade Chiffon Blend',
          Fit: 'Relaxed A-Line with Cinched Waist',
          Length: 'Midi (46 inches)',
          Care: 'Dry Clean or Gentle Cold Handwash',
          Origin: 'Direct Imported (Guangzhou Luxury Atelier)',
        },
        regularPrice: 4200,
        salePrice: 3450,
        discountPercent: 18,
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'China (Verified Atelier Import)',
        variations: [
          { id: 'v1', name: 'Champagne Rose - S', type: 'color', value: 'Champagne Rose', skuModifier: '-CR-S', stockModifier: 4 },
          { id: 'v2', name: 'Champagne Rose - M', type: 'color', value: 'Champagne Rose', skuModifier: '-CR-M', stockModifier: 6 },
          { id: 'v3', name: 'Midnight Charcoal - L', type: 'color', value: 'Midnight Charcoal', skuModifier: '-MC-L', stockModifier: 4 },
        ],
        ratings: 4.9,
        reviewCount: 38,
        reviews: [
          {
            id: 'rev_1',
            userName: 'Nusrat Jahan',
            rating: 5,
            comment: 'The fabric feels so luxurious on the skin! Absolutely authentic import quality. Delivered in Dhaka within 24 hours.',
            date: '2026-03-12',
            verifiedPurchase: true,
          },
          {
            id: 'rev_2',
            userName: 'Sabrina Rahman',
            rating: 5,
            comment: 'Perfect stitching and gorgeous drape. Exactly like the photo. Highly recommend SSTREAND SHOP!',
            date: '2026-03-01',
            verifiedPurchase: true,
          },
        ],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        isPublished: true,
        createdAt: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 'prod_002',
        name: 'Aurelia Vegan Leather Structured Mini Tote',
        nameBn: 'অরেলিয়া ভেগান লেদার মিনি টোট ব্যাগ',
        slug: 'aurelia-vegan-leather-structured-mini-tote',
        sku: 'SST-BAG-002',
        category: 'womens-handbags',
        subcategory: 'Mini Bags & Totes',
        description: 'An architectural silhouette crafted from scratch-resistant, water-repellent vegan saffiano leather. Features custom brushed champagne-gold hardware, magnetic clasp, and detachable crossbody strap.',
        descriptionBn: 'প্রিমিয়াম ওয়াটার-রেপেলেন্ট স্যাফিয়ানো লেদারে তৈরি লাক্সারি মিনি টোট ব্যাগ। সাথে পাচ্ছেন ডিটাচেবল স্ট্র্যাপ ও প্রিমিয়াম মেটালিক ফিনিশিং।',
        specifications: {
          Material: 'Premium Scratch-Resistant Microfiber Vegan Leather',
          Dimensions: '21cm (L) x 16cm (H) x 8cm (W)',
          Hardware: 'Champagne Gold Plated Alloy',
          Closure: 'Concealed Magnetic Flap',
          Includes: 'Adjustable Shoulder Strap & Dust Bag',
        },
        regularPrice: 3800,
        salePrice: 2950,
        discountPercent: 22,
        stock: 9,
        images: [
          'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'China (Premium Leathercraft Hub)',
        variations: [
          { id: 'v4', name: 'Alabaster Ivory', type: 'color', value: 'Alabaster Ivory', stockModifier: 4 },
          { id: 'v5', name: 'Caramel Latte', type: 'color', value: 'Caramel Latte', stockModifier: 3 },
          { id: 'v6', name: 'Ebony Black', type: 'color', value: 'Ebony Black', stockModifier: 2 },
        ],
        ratings: 4.8,
        reviewCount: 24,
        reviews: [
          {
            id: 'rev_3',
            userName: 'Tanzila Haque',
            rating: 5,
            comment: 'The finishing is stunning! Gold accents look authentic and premium. Fits my phone, wallet and compact makeup easily.',
            date: '2026-03-15',
            verifiedPurchase: true,
          },
        ],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        isPublished: true,
        createdAt: '2026-02-12T11:30:00.000Z',
      },
      {
        id: 'prod_003',
        name: 'Radiance Infusion 10% Niacinamide & Peptide Serum',
        nameBn: 'রেডিয়ান্স ইনফিউশন নিয়াসিনামাইড সিরাম',
        slug: 'radiance-infusion-niacinamide-peptide-serum',
        sku: 'SST-SKN-003',
        category: 'skincare',
        subcategory: 'Serums & Essences',
        description: 'Clinical grade brightening formula infused with 10% pure Niacinamide, Quad-Peptide complex, and fermented rice water. Minimizes enlarged pores, fades hyperpigmentation, and strengthens the skin moisture barrier for glass skin glow.',
        descriptionBn: '১০% খাঁটি নিয়াসিনামাইড এবং পেপটাইড সমৃদ্ধ রেডিয়েন্ট সিরাম। দাগ দূর করে ত্বকে আনে স্বাস্থ্যোজ্জ্বল দীপ্তি। ১০০% খাঁটি অথেনটিক ফর্মুলা।',
        specifications: {
          Volume: '50ml (1.7 fl. oz.)',
          SkinType: 'All Skin Types (Acne-prone & Sensitive tested)',
          KeyActives: '10% Niacinamide, Copper Peptides, Hyaluronic Acid, Fermented Galactomyces',
          Formulation: 'Silky Lightweight Non-Sticky Essence',
          Testing: 'Dermatologist Verified, Non-Comedogenic',
        },
        regularPrice: 2200,
        salePrice: 1750,
        discountPercent: 20,
        stock: 28,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1608248597359-204192b023f0?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'Imported Skincare Lab',
        variations: [
          { id: 'v7', name: 'Standard Bottle 50ml', type: 'volume', value: '50ml', stockModifier: 20 },
          { id: 'v8', name: 'Jumbo Size 100ml', type: 'volume', value: '100ml', priceModifier: 1100, stockModifier: 8 },
        ],
        ratings: 5.0,
        reviewCount: 52,
        reviews: [
          {
            id: 'rev_4',
            userName: 'Dr. Farhana Ahmed',
            rating: 5,
            comment: 'I checked the batch code and safety seal upon arrival—100% authentic import! Great absorption without tacky feeling.',
            date: '2026-03-20',
            verifiedPurchase: true,
          },
        ],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        isPublished: true,
        createdAt: '2026-02-14T08:15:00.000Z',
      },
      {
        id: 'prod_004',
        name: 'Luminous Dew Velvet Cushion Foundation SPF 50+ PA++++',
        nameBn: 'লুমিনাস ভেলভেট কুশন ফাউন্ডেশন',
        slug: 'luminous-dew-velvet-cushion-foundation',
        sku: 'SST-COS-004',
        category: 'beauty-cosmetics',
        subcategory: 'Face & Foundation',
        description: 'Weightless medium-to-full buildable coverage with a second-skin satin finish. Formulated with 80% skin-conditioning essence and broad-spectrum SPF 50+ protection against tropical UVA/UVB rays.',
        descriptionBn: 'হালকা কিন্তু দীর্ঘস্থায়ী কাভারেজ ও এসপিএফ ৫০+ সুরক্ষাযুক্ত প্রিমিয়াম কুশন। বাংলাদেশের আবহাওয়ায় সারাদিন ফ্রেশ থাকে।',
        specifications: {
          Weight: '15g + 15g Free Refill Included',
          Finish: 'Natural Velvet Radiance',
          SunProtection: 'SPF 50+ / PA++++ Mineral & Chemical Shield',
          Benefits: 'Sweat-Resistant, Transfer-Proof, Non-Cakey',
        },
        regularPrice: 2800,
        salePrice: 2150,
        discountPercent: 23,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'Direct Import',
        variations: [
          { id: 'v9', name: '#21 Light Warm Vanilla', type: 'shade', value: '#21 Warm Vanilla', stockModifier: 6 },
          { id: 'v10', name: '#23 Natural Sand Beige', type: 'shade', value: '#23 Natural Sand Beige', stockModifier: 8 },
          { id: 'v11', name: '#25 Honey Warm Golden', type: 'shade', value: '#25 Warm Golden', stockModifier: 4 },
        ],
        ratings: 4.9,
        reviewCount: 31,
        reviews: [
          {
            id: 'rev_5',
            userName: 'Mehnaz Chowdhury',
            rating: 5,
            comment: 'Shade 23 matches my Bangladeshi warm tone flawlessly! And the free refill makes this such high value.',
            date: '2026-03-18',
            verifiedPurchase: true,
          },
        ],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        isPublished: true,
        createdAt: '2026-02-18T14:00:00.000Z',
      },
      {
        id: 'prod_005',
        name: 'Monogram Parisian Quilted Chain Shoulder Bag',
        nameBn: 'প্যারিসিয়ান কুইল্টেড চেইন শোল্ডার ব্যাগ',
        slug: 'monogram-parisian-quilted-chain-shoulder-bag',
        sku: 'SST-BAG-005',
        category: 'womens-handbags',
        subcategory: 'Shoulder Bags',
        description: 'Timeless diamond chevron quilting with heavy-gauge sliding chain that converts effortlessly from double-shoulder to crossbody length. Dual compartment interior with velvet lining and zip divider.',
        descriptionBn: 'ক্লাসিক ডায়মন্ড কুইল্টিং ও প্রিমিয়াম চেইন বিশিষ্ট লাক্সারি শোল্ডার ব্যাগ। পার্টি কিংবা অফিস উভয় জায়গাতেই পারফেক্ট।',
        specifications: {
          Material: 'Supple Embossed Calfskin Texture (Cruelty-Free)',
          ChainDrop: '32cm doubled, 56cm single cross-body',
          Compartments: '2 main sections, 1 zippered center pocket, 1 card sleeve',
          Lock: 'Twist-lock logo hardware',
        },
        regularPrice: 4600,
        salePrice: 3890,
        discountPercent: 15,
        stock: 11,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'Direct Import Atelier',
        variations: [
          { id: 'v12', name: 'Noir Black', type: 'color', value: 'Noir Black', stockModifier: 6 },
          { id: 'v13', name: 'Blush Nude', type: 'color', value: 'Blush Nude', stockModifier: 5 },
        ],
        ratings: 4.8,
        reviewCount: 19,
        reviews: [],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        isPublished: true,
        createdAt: '2026-02-22T09:00:00.000Z',
      },
      {
        id: 'prod_006',
        name: 'Ultra-Hydrating Barrier Repair Ceramide Cream',
        nameBn: 'হাইড্রেটিং ব্যারিয়ার রিপেয়ার সিরামাইড ক্রিম',
        slug: 'ultra-hydrating-barrier-repair-ceramide-cream',
        sku: 'SST-SKN-006',
        category: 'skincare',
        subcategory: 'Moisturizers',
        description: 'Rich yet cloud-weight barrier restoration cream powered by 5 essential ceramides, centella asiatica, and cholesterol lipid matrix. Calms redness, heals damaged moisture barriers, and locks hydration for 72 hours.',
        descriptionBn: '৫টি এসেনশিয়াল সিরামাইড ও সেন্টেলা সমৃদ্ধ ক্রিম। ত্বকের লালচে ভাব ও শুষ্কতা দূর করে ত্বককে কোমল ও টানটান রাখে।',
        specifications: {
          Volume: '80g / 2.8 oz',
          KeyIngredients: 'Ceramide NP, AP, EOP, Centella Asiatica, Panthenol B5',
          Formulation: 'Velvety Butter-Cream, Fast-Absorbing',
          Origin: 'Verified Clinical Import',
        },
        regularPrice: 2100,
        salePrice: 1650,
        discountPercent: 21,
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
        ],
        isImported: true,
        isAuthenticVerified: true,
        originCountry: 'Direct Skincare Import',
        variations: [
          { id: 'v14', name: 'Standard Tub 80g', type: 'volume', value: '80g', stockModifier: 35 },
        ],
        ratings: 4.9,
        reviewCount: 44,
        reviews: [],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: true,
        isPublished: true,
        createdAt: '2026-02-24T12:00:00.000Z',
      },
    ];

    const homepageContent: HomepageContent = {
      announcementBar: {
        enabled: true,
        text: '✨ Welcome to SSTREAND SHOP! Free delivery across Bangladesh on orders over ৳3,000 | 100% Authenticity Guaranteed',
        link: '/sale-offers',
      },
      hero: {
        headline: 'China Import Beauty & Radiant Skincare 2026',
        subtitle: '100% authentic and comfortable fashion.',
        button1Text: 'SHOP NOW',
        button1Link: '/category/womens-fashion',
        button2Text: 'EXPLORE COLLECTIONS',
        button2Link: '/all-products',
        desktopBannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
        mobileBannerUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=85',
        badgeText: 'Curated 2026 Luxury Collection',
      },
      promoBanner: {
        enabled: true,
        headline: 'Radiance Essentials & Designer Leather',
        subtitle: 'Elevate your daily ritual with dermatologically tested skincare and handcrafted imported bags.',
        buttonText: 'Discover The Edit',
        buttonLink: '/category/skincare',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
      },
      contactInfo: {
        phone: '+880 1711-223344',
        whatsapp: '+880 1711-223344',
        email: 'concierge@sstreand.com',
        address: 'Level 4, House 12, Road 11, Banani, Dhaka-1213, Bangladesh',
        facebookUrl: 'https://facebook.com/sstreandshop',
        instagramUrl: 'https://instagram.com/sstreandshop',
        tiktokUrl: 'https://tiktok.com/@sstreandshop',
      },
      footerNotice: '© 2026 SSTREAND SHOP Bangladesh. All rights reserved. 100% Genuine Imported Fashion & Radiant Skincare.',
    };

    const settings: StoreSettings = {
      storeName: 'SSTREAND SHOP',
      currency: 'BDT',
      currencySymbol: '৳',
      insideDhakaFee: 70,
      outsideDhakaFee: 130,
      freeShippingMinAmount: 3000,
      bankDetails: {
        bankName: 'Eastern Bank PLC (EBL)',
        accountName: 'SSTREAND SHOP BANGLADESH',
        accountNumber: '1041060987654',
        branchName: 'Banani Branch, Dhaka',
        routingNumber: '095260124',
        instructions: 'Please transfer the exact order amount using internet banking or branch deposit, and provide the transaction reference / deposit slip during checkout or to concierge@sstreand.com.',
      },
      bkashMerchantNumber: '01711223344',
      nagadMerchantNumber: '01711223344',
      socialAuth: {
        googleClientIdConfigured: false,
        facebookAppIdConfigured: false,
      },
    };

    const coupons: Coupon[] = [
      {
        id: 'coup_1',
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 1500,
        maxDiscount: 500,
        expiryDate: '2026-12-31T23:59:59.000Z',
        isActive: true,
        usageCount: 14,
      },
      {
        id: 'coup_2',
        code: 'EID2026',
        discountType: 'fixed',
        discountValue: 350,
        minPurchaseAmount: 3000,
        expiryDate: '2026-12-31T23:59:59.000Z',
        isActive: true,
        usageCount: 29,
      },
    ];

    const sampleOrders: Order[] = [
      {
        id: 'SST-2026-1001',
        customerName: 'Samira Hossain',
        customerPhone: '01812345678',
        customerEmail: 'samira.h@gmail.com',
        shippingAddress: {
          district: 'Dhaka',
          upazila: 'Gulshan 2',
          fullAddress: 'Road 54, House 18, Apt 4B',
          orderNotes: 'Please call before delivery',
        },
        items: [
          {
            productId: 'prod_001',
            name: 'Celestial Silk Pleated Wrap Dress',
            sku: 'SST-FAS-001',
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80',
            price: 3450,
            quantity: 1,
            selectedVariations: { Color: 'Champagne Rose', Size: 'M' },
            total: 3450,
          },
        ],
        subtotal: 3450,
        deliveryCharge: 0, // Free above 3000
        deliveryMethod: 'Inside Dhaka (1-2 Days)',
        discountAmount: 345,
        couponCode: 'WELCOME10',
        total: 3105,
        paymentMethod: 'bkash',
        paymentStatus: 'verified',
        transactionId: '9G7K21MN4X',
        orderStatus: 'shipped',
        trackingNumber: 'REDX-DH-98214',
        createdAt: '2026-03-24T14:20:00.000Z',
        updatedAt: '2026-03-25T10:00:00.000Z',
        timeline: [
          { status: 'pending', note: 'Order placed by customer via bKash', timestamp: '2026-03-24T14:20:00.000Z' },
          { status: 'confirmed', note: 'bKash Transaction 9G7K21MN4X verified by merchant', timestamp: '2026-03-24T14:35:00.000Z' },
          { status: 'processing', note: 'Order quality checked and luxury gift packed', timestamp: '2026-03-25T08:00:00.000Z' },
          { status: 'shipped', note: 'Dispatched via RedX Express (Tracking: REDX-DH-98214)', timestamp: '2026-03-25T10:00:00.000Z' },
        ],
      },
    ];

    return {
      users: [adminUser],
      products,
      categories,
      orders: sampleOrders,
      coupons,
      homepageContent,
      settings,
      media: [
        {
          id: 'med_1',
          url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
          name: 'hero_desktop_editorial.jpg',
          size: 482100,
          uploadedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'med_2',
          url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
          name: 'hero_mobile_banner.jpg',
          size: 320400,
          uploadedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
  }

  // --- Users & Profiles ---
  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    return this.data.users.find(u => u.phone === phone);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.saveDatabase();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
    this.saveDatabase();
    return this.data.users[userIndex];
  }

  public getAllCustomers(): Omit<User, 'passwordHash'>[] {
    return this.data.users
      .filter(u => u.role === 'customer')
      .map(({ passwordHash, ...rest }) => rest);
  }

  // --- Products ---
  public getAllProducts(filter?: {
    category?: string;
    search?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    onSale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    publishedOnly?: boolean;
  }): Product[] {
    let result = [...this.data.products];

    if (filter?.publishedOnly) {
      result = result.filter(p => p.isPublished);
    }
    if (filter?.category) {
      result = result.filter(p => p.category === filter.category);
    }
    if (filter?.isFeatured) {
      result = result.filter(p => p.isFeatured);
    }
    if (filter?.isNewArrival) {
      result = result.filter(p => p.isNewArrival);
    }
    if (filter?.isBestSeller) {
      result = result.filter(p => p.isBestSeller);
    }
    if (filter?.onSale) {
      result = result.filter(p => p.salePrice && p.salePrice < p.regularPrice);
    }
    if (filter?.minPrice !== undefined) {
      result = result.filter(p => (p.salePrice || p.regularPrice) >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      result = result.filter(p => (p.salePrice || p.regularPrice) <= filter.maxPrice!);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getProductById(idOrSlug: string): Product | undefined {
    return this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  public createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.updateCategoryCounts();
    this.saveDatabase();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.updateCategoryCounts();
    this.saveDatabase();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.updateCategoryCounts();
      this.saveDatabase();
      return true;
    }
    return false;
  }

  private updateCategoryCounts() {
    this.data.categories.forEach(cat => {
      cat.itemCount = this.data.products.filter(p => p.category === cat.slug && p.isPublished).length;
    });
  }

  // --- Categories ---
  public getAllCategories(): Category[] {
    this.updateCategoryCounts();
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug === slug);
  }

  public createCategory(cat: Category): Category {
    this.data.categories.push(cat);
    this.saveDatabase();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveDatabase();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const prev = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Orders ---
  public createOrder(order: Order): Order {
    // Inventory safeguard: decrement stock for purchased items
    for (const item of order.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    this.data.orders.unshift(order);
    this.saveDatabase();
    return order;
  }

  public getAllOrders(): Order[] {
    return this.data.orders;
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders.filter(o => o.userId === userId);
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.orders[idx];
  }

  // --- Coupons ---
  public getAllCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.saveDatabase();
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.saveDatabase();
    return this.data.coupons[idx];
  }

  public deleteCoupon(id: string): boolean {
    const prev = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    if (this.data.coupons.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Homepage Content & Settings ---
  public getHomepageContent(): HomepageContent {
    return this.data.homepageContent;
  }

  public updateHomepageContent(updates: Partial<HomepageContent>): HomepageContent {
    this.data.homepageContent = { ...this.data.homepageContent, ...updates };
    this.saveDatabase();
    return this.data.homepageContent;
  }

  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Media Library ---
  public getMedia(): DatabaseSchema['media'] {
    return this.data.media || [];
  }

  public addMedia(item: DatabaseSchema['media'][0]): void {
    if (!this.data.media) this.data.media = [];
    this.data.media.unshift(item);
    this.saveDatabase();
  }

  public removeMedia(id: string): boolean {
    if (!this.data.media) return false;
    const prev = this.data.media.length;
    this.data.media = this.data.media.filter(m => m.id !== id);
    if (this.data.media.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseService();
