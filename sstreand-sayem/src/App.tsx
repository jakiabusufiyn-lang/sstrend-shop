import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { StaticContentPage } from './pages/StaticContentPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { api } from './services/api';
import { Product, Category, HomepageContent, Order } from './types';

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
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
    address: 'Gulshan 2, Dhaka-1212, Bangladesh',
    facebookUrl: 'https://facebook.com/sstreandshop',
    instagramUrl: 'https://instagram.com/sstreandshop',
    tiktokUrl: 'https://tiktok.com/@sstreandshop',
  },
  footerNotice: '100% Authentic Import Fashion & Beauty · Express Delivery Across Bangladesh',
};

function MainRouter() {
  const { adminUser } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);

  // Active product for detail page
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [searchQueryParam, setSearchQueryParam] = useState<string>('');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial catalog and settings
  useEffect(() => {
    const loadStorefrontData = async () => {
      try {
        const [prodRes, catRes, homeRes] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getHomepageContent(),
        ]);
        setProducts(prodRes.products);
        setCategories(catRes.categories);
        setHomepageContent(homeRes.content);
      } catch (err) {
        console.error('Failed to load storefront data:', err);
      }
    };
    loadStorefrontData();
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.slug}`);
  };

  // Keyboard shortcut for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Admin routes render without storefront layout
  if (currentPath === '/admin/login') {
    return (
      <AdminLoginPage
        onSuccess={() => navigate('/admin')}
        onNavigate={navigate}
      />
    );
  }

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onSuccess={() => navigate('/admin')}
          onNavigate={navigate}
        />
      );
    }
    return <AdminDashboardPage onNavigate={navigate} />;
  }

  // Determine which page component to render
  const renderCurrentPage = () => {
    // 1. Product Detail Page
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      const currentProd = selectedProduct?.slug === slug ? selectedProduct : products.find((p) => p.slug === slug);
      if (currentProd) {
        const related = products
          .filter((p) => p.category === currentProd.category && p.id !== currentProd.id)
          .slice(0, 4);
        return (
          <ProductDetailPage
            product={currentProd}
            relatedProducts={related}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        );
      }
    }

    // 2. Category Pages (/category/:slug)
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      const cat = categories.find((c) => c.slug === slug);
      const catProducts = products.filter((p) => p.category === slug);
      return (
        <ProductListingPage
          title={cat ? cat.name : "Women's Collection"}
          subtitle={cat?.description || 'Authentic imported collection with nationwide delivery in Bangladesh.'}
          products={catProducts}
          categories={categories}
          currentCategorySlug={slug}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 3. All Products
    if (currentPath === '/all-products') {
      return (
        <ProductListingPage
          title="All Collections"
          subtitle="Explore all imported fashion, luxury handbags, radiant clinical serums, and cosmetics."
          products={products}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 4. New Arrivals
    if (currentPath === '/new-arrivals') {
      return (
        <ProductListingPage
          title="New Arrivals 2026"
          subtitle="The latest direct imports from China ateliers and verified skincare laboratories."
          products={products.filter((p) => p.isNewArrival)}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 5. Best Sellers
    if (currentPath === '/best-sellers') {
      return (
        <ProductListingPage
          title="Best Sellers"
          subtitle="Our most loved, top-rated fashion pieces and viral glass-skin skincare essentials."
          products={products.filter((p) => p.isBestSeller)}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 6. Sale & Offers
    if (currentPath === '/sale-offers') {
      return (
        <ProductListingPage
          title="Exclusive Offers & Sale"
          subtitle="Limited-time promotional discounts and seasonal price drops on authentic items."
          products={products.filter((p) => p.salePrice && p.salePrice < p.regularPrice)}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 7. Search Results
    if (currentPath.startsWith('/search')) {
      const query = searchQueryParam;
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
      return (
        <ProductListingPage
          title={`Results for "${query}"`}
          subtitle={`Found ${results.length} matching imported products.`}
          products={results}
          categories={categories}
          searchQuery={query}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 8. Cart Page
    if (currentPath === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    // 9. Checkout Page
    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          onNavigate={navigate}
          onOrderSuccess={(order) => {
            setLastPlacedOrder(order);
          }}
        />
      );
    }

    // 10. Order Confirmation Page
    if (currentPath.startsWith('/order-confirmation')) {
      return (
        <OrderConfirmationPage
          order={lastPlacedOrder}
          onNavigate={navigate}
        />
      );
    }

    // 11. Track Order Page
    if (currentPath === '/track-order') {
      return <TrackOrderPage />;
    }

    // 12. Wishlist Page
    if (currentPath === '/wishlist') {
      return <WishlistPage onNavigate={navigate} onSelectProduct={handleSelectProduct} />;
    }

    // 13. Customer Account Page
    if (currentPath === '/account') {
      return <AccountPage onNavigate={navigate} onOpenAuth={() => setIsAuthOpen(true)} />;
    }

    // 14. Static Content Pages
    if (currentPath === '/about-us') {
      return <StaticContentPage pageType="about" onNavigate={navigate} />;
    }
    if (currentPath === '/contact-us') {
      return <StaticContentPage pageType="contact" onNavigate={navigate} />;
    }
    if (currentPath === '/faq') {
      return <StaticContentPage pageType="faq" onNavigate={navigate} />;
    }
    if (currentPath === '/shipping-policy') {
      return <StaticContentPage pageType="shipping" onNavigate={navigate} />;
    }
    if (currentPath === '/return-policy') {
      return <StaticContentPage pageType="return" onNavigate={navigate} />;
    }
    if (currentPath === '/privacy-policy') {
      return <StaticContentPage pageType="privacy" onNavigate={navigate} />;
    }
    if (currentPath === '/terms-conditions') {
      return <StaticContentPage pageType="terms" onNavigate={navigate} />;
    }

    // Default: Homepage
    return homepageContent ? (
      <HomePage
        content={homepageContent}
        categories={categories}
        products={products}
        onNavigate={navigate}
        onSelectProduct={handleSelectProduct}
      />
    ) : (
      <div className="py-20 text-center text-xs text-stone-500">
        Loading SSTREAND SHOP luxury collections...
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F5] text-[#1C1917] selection:bg-[#EAD7D1]">
      <div>
        {/* Top Announcement Bar */}
        <AnnouncementBar
          content={homepageContent?.announcementBar}
          onNavigate={navigate}
        />

        {/* Sticky Header Navigation */}
        <Navbar
          categories={categories}
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Page Content */}
        <main>{renderCurrentPage()}</main>
      </div>

      {/* Luxury Footer */}
      <Footer onNavigate={navigate} content={homepageContent || undefined} />

      {/* Global Slide-Over Mini-Cart */}
      <CartDrawer onNavigate={navigate} />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onViewAllResults={(q) => {
          setSearchQueryParam(q);
          navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      />

      {/* Global Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <MainRouter />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
