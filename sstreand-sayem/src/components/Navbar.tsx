import React, { useState } from 'react';
import {
  Search,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Phone,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';

interface NavbarProps {
  categories: Category[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
}) => {
  const { totalItems, openCart } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, adminUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: "Women's Fashion", path: '/category/womens-fashion' },
    { label: 'Handbags', path: '/category/womens-handbags' },
    { label: 'Skincare', path: '/category/skincare' },
    { label: 'Beauty & Cosmetics', path: '/category/beauty-cosmetics' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Best Sellers', path: '/best-sellers' },
    { label: 'Sale & Offers', path: '/sale-offers', isSale: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#E8DFD8] transition-all">
        {/* Sub-bar with trust guarantee & contacts */}
        <div className="hidden lg:flex items-center justify-between px-8 py-1 bg-[#F4EBE5] text-[11px] text-stone-600 tracking-wider uppercase border-b border-[#E4D7CE]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-stone-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> 100% Authentic Imported Collections
            </span>
            <span>·</span>
            <span>Fast Nationwide Delivery (Dhaka 24-48h)</span>
            <span>·</span>
            <span>Cash on Delivery Available</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/track-order')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Track Your Order
            </button>
            <span>·</span>
            <a href="tel:+8801711223344" className="flex items-center gap-1 hover:text-stone-900 transition-colors">
              <Phone className="w-3 h-3 text-[#C5A059]" /> +880 1711-223344
            </a>
            <span>·</span>
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 text-stone-900 bg-white hover:bg-[#FAF0EE] px-2.5 py-0.5 rounded border border-[#C5A059] font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#C5A059]" />
              <span>Admin Panel (অ্যাডমিন প্যানেল)</span>
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile hamburger menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-stone-800 hover:text-stone-950 focus:outline-none"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={onOpenSearch}
                className="p-2 text-stone-800 hover:text-stone-950 ml-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 flex justify-center lg:justify-start items-center">
              <button
                onClick={() => onNavigate('/')}
                className="group text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-editorial text-2xl sm:text-3xl lg:text-3xl font-bold tracking-[0.2em] text-[#1C1917] group-hover:text-[#8C6D46] transition-colors">
                    SSTREAND
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#C5A059] font-sans">
                    SHOP
                  </span>
                </div>
                <div className="hidden sm:block text-[9px] tracking-[0.25em] text-stone-500 uppercase -mt-1 font-sans">
                  Luxury Fashion & Radiant Skincare
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map(link => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => onNavigate(link.path)}
                    className={`relative text-xs tracking-wider uppercase font-medium transition-all py-1 cursor-pointer ${
                      isActive
                        ? 'text-[#1C1917] font-semibold'
                        : link.isSale
                        ? 'text-[#C5A059] font-semibold hover:text-[#A07C38]'
                        : 'text-stone-600 hover:text-[#1C1917]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1C1917]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Search trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 bg-[#F4EBE5] hover:bg-[#EFE3DC] rounded-md transition-colors cursor-pointer border border-[#E8DFD8]"
                aria-label="Search catalogue"
              >
                <Search className="w-3.5 h-3.5 text-stone-600" />
                <span className="tracking-wide">Search skincare, fashion...</span>
                <kbd className="text-[10px] bg-white/70 px-1.5 py-0.5 rounded text-stone-400">⌘K</kbd>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => onNavigate('/wishlist')}
                className="relative p-2 text-stone-800 hover:text-[#1C1917] transition-colors cursor-pointer"
                aria-label={`Wishlist with ${wishlistItems.length} items`}
              >
                <Heart className="w-5 h-5 text-stone-700 hover:text-rose-600 transition-colors" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Customer Account / Sign In */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (user) {
                      setAccountDropdownOpen(!accountDropdownOpen);
                    } else {
                      onOpenAuth();
                    }
                  }}
                  className="flex items-center gap-1.5 p-2 text-stone-800 hover:text-[#1C1917] transition-colors cursor-pointer"
                  aria-label="Customer account"
                >
                  <UserIcon className="w-5 h-5 text-stone-700" />
                  {user && (
                    <span className="hidden xl:inline text-xs font-medium text-stone-800 truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                  {user && <ChevronDown className="hidden xl:inline w-3 h-3 text-stone-500" />}
                </button>

                {/* Logged in User dropdown */}
                {user && accountDropdownOpen && (
                  <div
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email || user.phone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onNavigate('/account');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-[#FAF7F5] transition-colors"
                    >
                      My Profile & Orders
                    </button>
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onNavigate('/track-order');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-[#FAF7F5] transition-colors"
                    >
                      Track Shipment
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#C5A059] font-semibold hover:bg-[#FAF7F5] transition-colors"
                      >
                        Admin Control Panel
                      </button>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('/account?tab=logout');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag / Cart */}
              <button
                onClick={openCart}
                className="relative p-2.5 bg-[#1C1917] text-[#FAF7F5] rounded-full hover:bg-stone-800 transition-all shadow-sm cursor-pointer"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4 text-[#FAF7F5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C5A059] text-[#1C1917] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Admin Panel button */}
              <button
                onClick={() => onNavigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#1C1917] text-[#C5A059] hover:bg-stone-800 rounded-md text-xs font-bold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs cursor-pointer transition-colors"
                title="Admin Control Panel"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (One-Handed UX) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-[#FAF7F5] h-full shadow-2xl flex flex-col justify-between z-10 p-6 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD8]">
                <div className="flex items-baseline gap-1">
                  <span className="font-editorial text-2xl font-bold tracking-[0.2em] text-[#1C1917]">
                    SSTREAND
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5A059]">
                    SHOP
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search input */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-stone-500 bg-white rounded-lg border border-stone-200"
                >
                  <Search className="w-4 h-4 text-stone-400" />
                  <span>Search authentic collections...</span>
                </button>
              </div>

              {/* Mobile Admin Panel shortcut */}
              <div className="mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/admin');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#1C1917] text-[#C5A059] hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C5A059]" />
                    <span>Admin Panel (অ্যাডমিন কন্ট্রোল)</span>
                  </span>
                  <span className="text-[10px] bg-[#C5A059] text-stone-950 px-2 py-0.5 rounded font-mono font-bold">
                    MANAGE
                  </span>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="mt-6 space-y-1">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.path);
                    }}
                    className={`w-full text-left px-3 py-3 rounded-md text-sm uppercase tracking-wider font-medium transition-colors ${
                      currentPath === link.path
                        ? 'bg-[#EAD7D1] text-[#1C1917] font-semibold'
                        : link.isSale
                        ? 'text-[#A07C38] font-semibold hover:bg-white'
                        : 'text-stone-700 hover:bg-white'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* Customer quick options */}
              <div className="mt-6 pt-5 border-t border-[#E8DFD8] space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/track-order');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-600 hover:text-stone-950 flex items-center justify-between"
                >
                  <span>Track Your Order</span>
                  <span className="text-stone-400">→</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/wishlist');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-600 hover:text-stone-950 flex items-center justify-between"
                >
                  <span>Wishlist ({wishlistItems.length})</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/account');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-900 hover:text-stone-950"
                  >
                    Logged in as: {user.name} (My Account)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center mt-2 px-4 py-2.5 bg-[#1C1917] text-white rounded-md text-xs uppercase tracking-wider font-medium"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-6 border-t border-[#E8DFD8] text-[11px] text-stone-500 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> 100% Authentic Guaranteed
              </div>
              <p>Hotline: +880 1711-223344</p>
              <p className="text-[10px] text-stone-400">Currency: BDT (৳) | Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
