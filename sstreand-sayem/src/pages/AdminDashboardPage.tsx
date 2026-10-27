import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  AlertTriangle,
  Upload,
  Copy,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Product,
  Category,
  Order,
  HomepageContent,
  StoreSettings,
  Coupon,
} from '../types';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { adminUser, adminLogout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'homepage' | 'media' | 'orders' | 'customers' | 'settings'
  >('overview');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Homepage Content
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [savingContent, setSavingContent] = useState(false);

  // Media Library
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [externalUrl, setExternalUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);

  // Settings & Coupons
  const [settings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1500);

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(adminUser?.mustChangePassword || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notifications
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [sRes, pRes, cRes, oRes, hRes, mRes, custRes, setRes, coupRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAllProducts(),
        api.getCategories(),
        api.admin.getOrders(),
        api.getHomepageContent(),
        api.admin.getMedia(),
        api.admin.getCustomers(),
        api.getSettings(),
        api.admin.getCoupons(),
      ]);
      setStats(sRes);
      setProducts(pRes.products);
      setCategories(cRes.categories);
      setOrders(oRes.orders);
      setHomepageContent(hRes.content);
      setMediaList(mRes.media);
      setCustomers(custRes.customers);
      setStoreSettings(setRes.settings);
      setCoupons(coupRes.coupons);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  // Product Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (isNewProduct) {
        const res = await api.admin.createProduct(editingProduct);
        setProducts([res.product, ...products]);
        notify('New product added to catalogue');
      } else if (editingProduct.id) {
        const res = await api.admin.updateProduct(editingProduct.id, editingProduct);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.product : p)));
        notify('Product details updated');
      }
      setEditingProduct(null);
      setIsNewProduct(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.admin.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      notify('Product deleted');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      if (editingCategory.id) {
        const res = await api.admin.updateCategory(editingCategory.id, editingCategory);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? res.category : c)));
        notify('Category updated');
      } else {
        const res = await api.admin.createCategory(editingCategory);
        setCategories([...categories, res.category]);
        notify('Category created');
      }
      setEditingCategory(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.admin.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
      notify(`Order status set to ${status}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await api.admin.updateOrderPayment(orderId, paymentStatus);
      setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
      notify(`Payment status set to ${paymentStatus}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignTracking = async (orderId: string, trackingNumber: string) => {
    if (!trackingNumber.trim()) return;
    try {
      const res = await api.admin.addOrderTracking(orderId, trackingNumber.trim(), 'RedX / Steadfast Express');
      setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
      notify('Courier tracking number recorded');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'District', 'Total (BDT)', 'Payment', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      o.customerPhone,
      o.shippingAddress.district,
      o.total,
      o.paymentMethod.toUpperCase(),
      o.orderStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SSTREAND_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageContent) return;
    setSavingContent(true);
    try {
      await api.admin.updateHomepage(homepageContent);
      notify('Homepage content published successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.admin.uploadImage(file);
      setMediaList([{ id: `med_${Date.now()}`, url: res.url, name: res.name, size: res.size }, ...mediaList]);
      notify('Image uploaded to media library');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddExternalMedia = async () => {
    if (!externalUrl.trim()) return;
    try {
      const res = await api.admin.addExternalMedia(externalUrl.trim());
      setMediaList([res.media, ...mediaList]);
      setExternalUrl('');
      notify('External media added');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    try {
      await api.admin.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      notify('Password updated successfully (পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে)');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await api.admin.createCoupon({
        code: newCouponCode.toUpperCase().trim(),
        discountType: 'percentage',
        discountValue: Number(newCouponDiscount),
        minPurchaseAmount: Number(newCouponMin),
      });
      setCoupons([...coupons, res.coupon]);
      setNewCouponCode('');
      notify('Discount coupon created');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      {/* Top Admin Header */}
      <header className="bg-[#1C1917] text-white border-b border-[#2D2A26] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span className="font-editorial text-xl font-bold tracking-[0.2em] text-white">
              SSTREAND
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
              ADMIN
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-stone-500 font-mono">
            / Bangladesh Hub
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Storefront</span>
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1.5 text-[#C5A059] hover:underline"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Security</span>
          </button>

          <button
            onClick={() => {
              adminLogout();
              onNavigate('/admin/login');
            }}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Floating Action Notice */}
      {actionNotice && (
        <div className="fixed top-14 right-6 bg-[#1C1917] text-[#FAF7F5] border border-[#C5A059] px-4 py-2.5 rounded-lg text-xs font-medium shadow-xl z-50">
          ✓ {actionNotice}
        </div>
      )}

      {/* Must Change Password Warning Banner */}
      {adminUser?.mustChangePassword && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <strong>Initial Bootstrap Account Notice:</strong> Please update your default admin password to ensure complete security.
          </span>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="font-bold underline uppercase tracking-wider text-[11px]"
          >
            Change Password Now
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs with Bengali Labels */}
      <div className="bg-white border-b border-[#E8DFD8] px-4 sm:px-8 overflow-x-auto shadow-2xs">
        <div className="flex space-x-1 sm:space-x-2 py-2">
          {[
            { id: 'overview', label: 'Overview (ওভারভিউ)', icon: LayoutDashboard },
            { id: 'products', label: 'Products (প্রোডাক্ট এড ও এডিট)', icon: Package },
            { id: 'homepage', label: 'Homepage Editor (টেক্সট ও ব্যানার)', icon: Edit },
            { id: 'orders', label: 'Orders (অর্ডার নিয়ন্ত্রণ)', icon: ShoppingBag },
            { id: 'media', label: 'Media (ছবি আপলোড)', icon: ImageIcon },
            { id: 'categories', label: 'Categories (ক্যাটাগরি)', icon: Layers },
            { id: 'customers', label: 'Customers (গ্রাহক তালিকা)', icon: Users },
            { id: 'settings', label: 'Settings & Coupons (সেটিংস ও কুপন)', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1917] text-[#C5A059] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Actions Bar */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DFD8] shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-editorial text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Quick Actions (কুইক অ্যাকশন)</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  প্রডাক্ট এড, হোমপেজ টেক্সট ও ব্যানার পরিবর্তন, এবং অর্ডার নিয়ন্ত্রণ করুন
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setEditingProduct({
                      name: '',
                      nameBn: '',
                      category: 'womens-fashion',
                      regularPrice: 2500,
                      stock: 10,
                      isAuthenticVerified: true,
                      isImported: true,
                      originCountry: 'China Atelier Import',
                      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
                      isPublished: true,
                      isFeatured: true,
                    });
                    setIsNewProduct(true);
                  }}
                  className="px-3.5 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>+ Add Product (প্রডাক্ট এড)</span>
                </button>

                <button
                  onClick={() => setActiveTab('homepage')}
                  className="px-3.5 py-2 bg-[#FAF0EE] hover:bg-[#F4EBE5] text-stone-900 border border-[#E4D7CE] text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-[#A07C38]" />
                  <span>Edit Text (টেক্সট এডিট)</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />
                  <span>Manage Orders (অর্ডার লিস্ট)</span>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-700" />
                  <span>Upload Image (ছবি আপলোড)</span>
                </button>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-2 bg-[#FAF0EE] hover:bg-[#F4EBE5] text-[#8C6D2D] border border-[#E4D7CE] text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Change Password (পাসওয়ার্ড পরিবর্তন)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 bg-white rounded-xl border border-[#EFE8E2] shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Total Sales (মোট বিক্রি BDT)
                </span>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  ৳{(stats?.totalSales || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">Verified orders</p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-[#EFE8E2] shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Total Orders
                </span>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  {stats?.totalOrders || orders.length}
                </p>
                <p className="text-[11px] text-stone-500">Nationwide courier</p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-[#EFE8E2] shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Pending Processing
                </span>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-amber-600">
                  {stats?.pendingOrders || 0}
                </p>
                <p className="text-[11px] text-stone-500">Awaiting dispatch</p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-[#EFE8E2] shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Low Stock Items
                </span>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-rose-600">
                  {stats?.lowStockCount || 0}
                </p>
                <p className="text-[11px] text-stone-500">≤ 5 units left</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                <h3 className="font-editorial text-lg font-bold text-stone-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#A07C38] font-semibold hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">District</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-3 font-mono font-bold text-stone-900">{ord.id}</td>
                        <td className="py-3 font-medium text-stone-800">{ord.customerName}</td>
                        <td className="py-3 text-stone-600">{ord.shippingAddress.district}</td>
                        <td className="py-3 font-bold text-stone-900 font-sans">৳{ord.total.toLocaleString()}</td>
                        <td className="py-3 uppercase text-[11px] font-semibold text-stone-700">{ord.paymentMethod}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-300 rounded-md pr-8"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    nameBn: '',
                    category: 'womens-fashion',
                    subcategory: '',
                    description: '',
                    regularPrice: 2500,
                    stock: 10,
                    isAuthenticVerified: true,
                    isImported: true,
                    originCountry: 'China Atelier Import',
                    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
                    variations: [],
                    isPublished: true,
                    isFeatured: true,
                  });
                  setIsNewProduct(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md shadow-2xs hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            {/* Product Edit / Create Modal or Card */}
            {editingProduct && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-white rounded-xl border border-[#E8DFD8] p-6 shadow-md space-y-4 animate-scaleUp"
              >
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <h3 className="font-editorial text-lg font-bold text-stone-900">
                    {isNewProduct ? 'Add Product to Catalogue' : `Edit: ${editingProduct.name}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="text-xs text-stone-400 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">Product Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Bangla Title (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editingProduct.nameBn || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, nameBn: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Category *</label>
                    <select
                      value={editingProduct.category || 'womens-fashion'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Regular Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.regularPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Sale Price (৳ - Optional)</label>
                    <input
                      type="number"
                      value={editingProduct.salePrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Origin Country</label>
                    <input
                      type="text"
                      value={editingProduct.originCountry || 'China Atelier Import'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originCountry: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Primary Image URL</label>
                    <input
                      type="text"
                      value={editingProduct.images?.[0] || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-stone-700 font-semibold mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>

                  <div className="sm:col-span-3 flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isAuthenticVerified || false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isAuthenticVerified: e.target.checked })}
                      />
                      <span className="font-semibold text-emerald-800">100% Authentic Verified Badge</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFeatured || false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      />
                      <span>Featured on Homepage</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isNewArrival || false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                      />
                      <span>New Arrival</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isPublished !== false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                      />
                      <span>Published & Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-stone-300 text-xs font-semibold rounded text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-[#EFE8E2] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F5] border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Authentic</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded bg-stone-100 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-stone-900">{prod.name}</p>
                              <p className="text-[10px] text-stone-400">{prod.originCountry}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-stone-600">{prod.sku}</td>
                          <td className="py-3 px-4 capitalize">{prod.category.replace('-', ' ')}</td>
                          <td className="py-3 px-4 font-bold font-sans">
                            ৳{(prod.salePrice || prod.regularPrice).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.stock <= 5 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {prod.stock} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {prod.isAuthenticVerified ? (
                              <span className="text-emerald-700 font-bold text-xs">✓ Verified</span>
                            ) : (
                              <span className="text-stone-400">Unverified</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsNewProduct(false);
                              }}
                              className="p-1 text-stone-600 hover:text-stone-900"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div className="flex justify-between items-center">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Department Categories
              </h3>
              <button
                onClick={() =>
                  setEditingCategory({
                    name: '',
                    nameBn: '',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
                    order: categories.length + 1,
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {editingCategory && (
              <form onSubmit={handleSaveCategory} className="bg-white p-5 rounded-xl border border-stone-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Bangla Name (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editingCategory.nameBn || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, nameBn: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={editingCategory.imageUrl || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                      className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono text-[11px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1.5 border rounded">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-[#1C1917] text-white rounded">
                    Save Category
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl border border-[#EFE8E2] divide-y divide-stone-100 overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={cat.imageUrl} alt="" className="w-12 h-12 object-cover rounded-md" />
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">{cat.name}</h4>
                      <p className="text-stone-500 font-mono text-[10px]">Slug: /{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: HOMEPAGE CONTENT EDITOR ================= */}
        {activeTab === 'homepage' && homepageContent && (
          <form onSubmit={handleSaveHomepage} className="space-y-8 animate-fadeIn max-w-4xl">
            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
                Top Announcement Bar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={homepageContent.announcementBar.text}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        announcementBar: { ...homepageContent.announcementBar, text: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-stone-800 font-medium pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homepageContent.announcementBar.enabled}
                      onChange={(e) =>
                        setHomepageContent({
                          ...homepageContent,
                          announcementBar: { ...homepageContent.announcementBar, enabled: e.target.checked },
                        })
                      }
                    />
                    <span>Show Announcement Bar</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
                Homepage Hero Section
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">
                    Main Hero Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={homepageContent.hero.headline}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, headline: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded font-serif text-sm font-bold"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Current Master: “China Import Beauty & Radiant Skincare 2026”
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">
                    Hero Subtitle *
                  </label>
                  <input
                    type="text"
                    required
                    value={homepageContent.hero.subtitle}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded text-xs"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Current Master: “100% authentic and comfortable fashion.”
                  </span>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Button 1 Label</label>
                  <input
                    type="text"
                    value={homepageContent.hero.button1Text}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, button1Text: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded uppercase font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Button 1 Link</label>
                  <input
                    type="text"
                    value={homepageContent.hero.button1Link}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, button1Link: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Button 2 Label</label>
                  <input
                    type="text"
                    value={homepageContent.hero.button2Text}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, button2Text: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded uppercase font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Button 2 Link</label>
                  <input
                    type="text"
                    value={homepageContent.hero.button2Link}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, button2Link: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Desktop Banner Image URL</label>
                  <input
                    type="text"
                    value={homepageContent.hero.desktopBannerUrl}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, desktopBannerUrl: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Mobile Banner Image URL</label>
                  <input
                    type="text"
                    value={homepageContent.hero.mobileBannerUrl}
                    onChange={(e) =>
                      setHomepageContent({
                        ...homepageContent,
                        hero: { ...homepageContent.hero, mobileBannerUrl: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingContent}
              className="px-8 py-3.5 bg-[#1C1917] text-white text-xs uppercase tracking-widest font-bold rounded-md shadow-md hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {savingContent ? 'Publishing Changes...' : 'Save & Publish Live Homepage'}
            </button>
          </form>
        )}

        {/* ================= TAB 5: MEDIA LIBRARY ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
                Upload New Image or Add URL
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-stone-500 transition-colors">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-800 mb-1">
                    Upload from Phone or Desktop
                  </p>
                  <p className="text-[10px] text-stone-400 mb-3">JPG, PNG, WebP up to 10MB</p>
                  <label className="px-4 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer hover:bg-stone-800">
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-stone-700">
                    Or Insert External Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 text-xs p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalMedia}
                      className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded"
                    >
                      Add URL
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Direct image CDN or Unsplash photo URL
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shadow-2xs"
                >
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.url);
                        notify('URL copied to clipboard');
                      }}
                      className="p-1.5 bg-white text-stone-900 rounded-md text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy URL
                    </button>
                    <button
                      onClick={async () => {
                        await api.admin.deleteMedia(m.id);
                        setMediaList(mediaList.filter((item) => item.id !== m.id));
                        notify('Media removed');
                      }}
                      className="p-1.5 bg-rose-600 text-white rounded-md text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-lg">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID, Phone, or Customer Name..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-300 rounded-md pr-8"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-stone-300 rounded-md p-2.5"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-stone-800 text-xs font-semibold rounded-md shadow-2xs hover:bg-stone-50 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" /> Export Orders (CSV)
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#EFE8E2] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F5] border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer & Phone</th>
                      <th className="py-3 px-4">Delivery District</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders
                      .filter((o) => {
                        if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
                        if (!orderSearch) return true;
                        const q = orderSearch.toLowerCase();
                        return (
                          o.id.toLowerCase().includes(q) ||
                          o.customerPhone.includes(q) ||
                          o.customerName.toLowerCase().includes(q)
                        );
                      })
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">{ord.id}</td>
                          <td className="py-3 px-4 text-stone-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-stone-900">{ord.customerName}</p>
                            <p className="text-[11px] text-stone-500 font-mono">{ord.customerPhone}</p>
                          </td>
                          <td className="py-3 px-4 text-stone-700">{ord.shippingAddress.district}</td>
                          <td className="py-3 px-4 font-bold text-stone-900 font-sans">
                            ৳{ord.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="block font-semibold uppercase text-[10px]">{ord.paymentMethod}</span>
                            <span
                              className={`text-[10px] font-bold capitalize ${
                                ord.paymentStatus === 'verified' ? 'text-emerald-700' : 'text-stone-500'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="text-xs bg-[#FAF7F5] border border-stone-300 rounded p-1 font-medium capitalize"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/50" />
                <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">Manage Order</span>
                      <h3 className="font-mono text-xl font-bold text-stone-900">{selectedOrder.id}</h3>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-xs text-stone-400">
                      Close
                    </button>
                  </div>

                  <div className="text-xs space-y-2 bg-[#FAF7F5] p-4 rounded-lg">
                    <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    <p><strong>Address:</strong> {selectedOrder.shippingAddress.fullAddress}, {selectedOrder.shippingAddress.upazila}, {selectedOrder.shippingAddress.district}</p>
                    {selectedOrder.shippingAddress.orderNotes && (
                      <p><strong>Notes:</strong> {selectedOrder.shippingAddress.orderNotes}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-800">
                      Payment Verification ({selectedOrder.paymentMethod.toUpperCase()})
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                        className="text-xs p-2 border border-stone-300 rounded flex-1 capitalize"
                      >
                        <option value="pending">Pending Verification</option>
                        <option value="verified">Verified / Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    {selectedOrder.transactionId && (
                      <p className="text-[11px] text-stone-600 font-mono">
                        TrxID Provided: <strong>{selectedOrder.transactionId}</strong>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-800">
                      Courier Tracking Code (RedX / Steadfast / Pathao)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={selectedOrder.trackingNumber || ''}
                        id="trackingInput"
                        placeholder="e.g. REDX-DH-98214"
                        className="flex-1 text-xs p-2 border border-stone-300 rounded font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (document.getElementById('trackingInput') as HTMLInputElement)?.value;
                          handleAssignTracking(selectedOrder.id, val);
                        }}
                        className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Items Ordered
                    </h4>
                    <div className="divide-y divide-stone-100 text-xs">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-stone-900">{it.name}</p>
                            <p className="text-[10px] text-stone-500">Qty: {it.quantity} · SKU: {it.sku}</p>
                          </div>
                          <span className="font-bold text-stone-900 font-sans">
                            ৳{it.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="font-editorial text-xl font-bold text-stone-900">
              Registered Customers ({customers.length})
            </h3>
            <div className="bg-white rounded-xl border border-[#EFE8E2] overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F5] border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Lifetime Spent</th>
                    <th className="py-3 px-4">Addresses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900">{c.name}</p>
                        <p className="text-[11px] text-stone-400">{c.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono">{c.phone}</td>
                      <td className="py-3 px-4 font-bold">{c.totalOrders || 0}</td>
                      <td className="py-3 px-4 font-bold font-sans">৳{(c.totalSpent || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-stone-600">{(c.addresses || []).length} saved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 8: SETTINGS & COUPONS ================= */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
                Bangladesh Delivery Rates & Free Shipping
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Inside Dhaka Fee (৳)</label>
                  <input
                    type="number"
                    value={settings.insideDhakaFee}
                    onChange={(e) => setStoreSettings({ ...settings, insideDhakaFee: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Outside Dhaka Fee (৳)</label>
                  <input
                    type="number"
                    value={settings.outsideDhakaFee}
                    onChange={(e) => setStoreSettings({ ...settings, outsideDhakaFee: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Free Delivery Min Amount (৳)</label>
                  <input
                    type="number"
                    value={settings.freeShippingMinAmount}
                    onChange={(e) => setStoreSettings({ ...settings, freeShippingMinAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">bKash Official Merchant Number</label>
                  <input
                    type="text"
                    value={settings.bkashMerchantNumber}
                    onChange={(e) => setStoreSettings({ ...settings, bkashMerchantNumber: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Nagad Official Merchant Number</label>
                  <input
                    type="text"
                    value={settings.nagadMerchantNumber}
                    onChange={(e) => setStoreSettings({ ...settings, nagadMerchantNumber: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await api.admin.updateSettings(settings);
                  notify('Store settings saved');
                }}
                className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>

            {/* Admin Security & Password Change Card */}
            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C5A059]" />
                    <span>Admin Password & Security (অ্যাডমিন পাসওয়ার্ড পরিবর্তন)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    অ্যাকাউন্টের বর্তমান পাসওয়ার্ড দিয়ে নতুন ৮+ অক্ষরের নিরাপদ পাসওয়ার্ড সেট করুন।
                  </p>
                </div>
                <div className="text-[11px] font-mono bg-[#FAF7F5] border border-stone-200 px-2.5 py-1 rounded text-stone-700">
                  Account: <strong>SSTRADEADMIN</strong>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-md">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-md font-semibold">
                  ✓ পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! (Password updated successfully!)
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Current Password (বর্তমান পাসওয়ার্ড)
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড (Default: Sstreand@2026!Admin)"
                      className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded font-mono"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      ডিফল্ট পাসওয়ার্ড: <code className="text-stone-700 font-bold font-mono">Sstreand@2026!Admin</code>
                    </span>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      New Password (নতুন পাসওয়ার্ড - কমপক্ষে ৮ অক্ষর)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন ৮+ অক্ষরের পাসওয়ার্ড দিন"
                      className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded font-mono"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      কমপক্ষে ৮ অক্ষরের বড়-ছোট হাত ও চিহ্ন মিশ্রিত পাসওয়ার্ড দিন
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-colors shadow-xs"
                  >
                    Update Password (পাসওয়ার্ড সেভ করুন)
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EFE8E2] space-y-4 shadow-2xs">
              <h3 className="font-editorial text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
                Discount Coupons
              </h3>

              <form onSubmit={handleCreateCoupon} className="flex flex-wrap gap-3 items-end text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE2026"
                    className="p-2 uppercase bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="p-2 w-20 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Min Order (৳)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="p-2 w-28 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] text-white font-semibold rounded"
                >
                  Create Coupon
                </button>
              </form>

              <div className="divide-y divide-stone-100 text-xs">
                {coupons.map((coup) => (
                  <div key={coup.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-stone-900 mr-2">{coup.code}</span>
                      <span className="text-stone-500">
                        {coup.discountValue}% Off · Min Purchase ৳{coup.minPurchaseAmount.toLocaleString()} · Used {coup.usageCount} times
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await api.admin.deleteCoupon(coup.id);
                        setCoupons(coupons.filter((c) => c.id !== coup.id));
                        notify('Coupon removed');
                      }}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowPasswordModal(false)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-2xl border border-stone-200 z-10 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Update Administrator Password
            </h3>
            <p className="text-xs text-stone-500">
              Set a strong, private password for <code className="bg-stone-100 px-1 py-0.5 rounded">SSTRADEADMIN</code>.
            </p>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter secure new password"
                  className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border rounded text-stone-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] text-white font-semibold rounded"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
