import React, { useState } from 'react';
import { Lock, User, AlertCircle, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onNavigate }) => {
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('SSTRADEADMIN');
  const [password, setPassword] = useState('Sstreand@2026!Admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(username.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setUsername('SSTRADEADMIN');
    setPassword('Sstreand@2026!Admin');
    setLoading(true);
    try {
      await adminLogin('SSTRADEADMIN', 'Sstreand@2026!Admin');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8DFD8] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-[#1C1917] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold">
            Admin Control Center (অ্যাডমিন কন্ট্রোল)
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            SSTREAND Admin Portal
          </h1>
          <p className="text-xs text-stone-500 font-sans">
            প্রডাক্ট এড/এডিট, হোমপেজ টেক্সট ও ব্যানার এবং অর্ডার ম্যানেজমেন্ট
          </p>
        </div>

        {/* Quick Demo 1-Click Access Button */}
        <div className="p-4 bg-[#FAF0EE] rounded-xl border border-[#E8DFD8] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C5A059]" /> Quick Access (সরাসরি প্রবেশ করুন)
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded text-stone-600 font-mono">1-Click</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Default credentials are set. Click below to enter the full dashboard instantly:
          </p>
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-[#1C1917] text-[#FAF7F5] hover:bg-stone-800 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span>{loading ? 'Entering Portal...' : 'Enter Admin Control Panel Now (সরাসরি প্রবেশ করুন)'}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>

          {/* Credentials Display Info */}
          <div className="pt-2 border-t border-[#E8DFD8] text-[11px] text-stone-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Admin Username:</span>
              <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                SSTRADEADMIN
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Default Password:</span>
              <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 select-all">
                Sstreand@2026!Admin
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="SSTRADEADMIN"
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F5] border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FAF7F5] hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs uppercase tracking-widest font-bold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In with Custom Password'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-stone-900 underline"
          >
            ← Return to Storefront
          </button>
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
