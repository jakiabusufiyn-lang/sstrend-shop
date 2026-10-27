import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, MapPin, LogOut, Plus, Trash2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Address } from '../types';

interface AccountPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address modal/form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressTitle, setAddressTitle] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Profile Edit
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone);
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({ name: profileName, phone: profilePhone });
      updateUser(res.user);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSubmitting(true);
    try {
      const res = await api.addAddress({
        title: addressTitle,
        fullName,
        phone,
        district,
        upazila,
        fullAddress,
        isDefault: (user?.addresses || []).length === 0,
      });
      if (user) {
        updateUser({ ...user, addresses: res.addresses });
      }
      setShowAddAddress(false);
      setFullName('');
      setPhone('');
      setUpazila('');
      setFullAddress('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (user) {
        updateUser({ ...user, addresses: res.addresses });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#FAF0EE] rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500">
          <UserIcon className="w-8 h-8 text-stone-400" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
          Customer Account Access
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
          Sign in or register to view your order history, manage delivery addresses, and enjoy saved wishlist items.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md shadow-md"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DFD8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Customer Dashboard
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{user.email || user.phone}</p>
        </div>

        <button
          onClick={async () => {
            await logout();
            onNavigate('/');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 rounded-md text-xs font-semibold text-stone-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setTab('orders')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'orders' ? 'bg-[#1C1917] text-white shadow-2xs' : 'text-stone-700 hover:bg-white'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setTab('addresses')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'addresses' ? 'bg-[#1C1917] text-white shadow-2xs' : 'text-stone-700 hover:bg-white'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({(user.addresses || []).length})
          </button>

          <button
            onClick={() => setTab('profile')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'profile' ? 'bg-[#1C1917] text-white shadow-2xs' : 'text-stone-700 hover:bg-white'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Profile Details
          </button>
        </aside>

        {/* Content Tab Panel */}
        <main className="md:col-span-3">
          {/* TAB 1: ORDERS */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Order History
              </h3>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-dashed border-stone-200">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-editorial text-base font-semibold text-stone-800">
                    You haven’t placed any orders yet.
                  </p>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Explore our China import collection with Cash on Delivery in Bangladesh.
                  </p>
                  <button
                    onClick={() => onNavigate('/all-products')}
                    className="px-6 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-xl border border-[#EFE8E2] p-5 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
                        <div>
                          <span className="font-mono text-sm font-bold text-stone-900 mr-3">
                            {ord.id}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                            {ord.orderStatus}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                            Payment: {ord.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={it.image}
                                alt=""
                                className="w-10 h-12 object-cover rounded bg-stone-100"
                              />
                              <div>
                                <p className="font-medium text-stone-900">{it.name}</p>
                                <p className="text-[10px] text-stone-500">Qty: {it.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-stone-900 font-sans">
                              ৳{it.total.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Total Amount: <strong className="text-stone-950 font-bold font-sans">৳{ord.total.toLocaleString()}</strong> ({ord.paymentMethod.toUpperCase()})
                        </span>
                        <button
                          onClick={() => onNavigate('/track-order')}
                          className="text-[#A07C38] font-semibold hover:underline"
                        >
                          Track Parcel →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {tab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  Saved Delivery Addresses
                </h3>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {/* Add address modal/drawer */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-white p-5 rounded-xl border border-[#E8DFD8] shadow-sm space-y-4 animate-scaleUp"
                >
                  <h4 className="font-editorial text-base font-bold text-stone-900">
                    New Delivery Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Address Label</label>
                      <input
                        type="text"
                        value={addressTitle}
                        onChange={(e) => setAddressTitle(e.target.value)}
                        placeholder="e.g. Home, Office, Banani Studio"
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01711223344"
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">District</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Dhaka, Chittagong..."
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Upazila / Area</label>
                      <input
                        type="text"
                        required
                        value={upazila}
                        onChange={(e) => setUpazila(e.target.value)}
                        placeholder="Banani, Dhanmondi..."
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-medium mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="House 12, Road 11, Flat 4B"
                        className="w-full p-2 bg-[#FAF7F5] border border-stone-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 border border-stone-300 text-xs font-semibold rounded text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressSubmitting}
                      className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 bg-white rounded-lg border border-[#EFE8E2] space-y-2 relative shadow-2xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        {addr.title}
                      </span>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-stone-900">{addr.fullName}</p>
                    <p className="text-xs text-stone-600">{addr.phone}</p>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {addr.fullAddress}, {addr.upazila}, {addr.district}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {tab === 'profile' && (
            <div className="bg-white rounded-xl border border-[#EFE8E2] p-6 shadow-2xs space-y-6 max-w-lg">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Personal Information
              </h3>

              {profileMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded">
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400">Email is linked to authentication credentials</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F5] border border-stone-300 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1C1917] text-white uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
