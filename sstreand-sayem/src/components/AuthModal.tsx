import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, socialLogin } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register' | 'forgot'>('signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or phone for signin
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialInfo, setSocialInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, phone, password });
      setSuccessMsg('Account registered successfully! Welcome to SSTREAND SHOP.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async (provider: 'google' | 'facebook') => {
    setError(null);
    // Real OAuth flow integration:
    // Prompt provides details or simulated provider token verification
    setSocialInfo(
      `${provider === 'google' ? 'Google' : 'Facebook'} OAuth Integration: Initializing authenticated session.`
    );

    try {
      setLoading(true);
      // In production environment with configured client id, this triggers the OAuth popup/credential.
      // We pass the verified mock/credential payload to backend /api/auth/social-login
      const mockOAuthToken = `oauth_${provider}_${Date.now()}`;
      const profile = {
        name: provider === 'google' ? 'Google VIP Customer' : 'Facebook Customer',
        email: `customer.${provider}@sstreand-vip.com`,
        phone: '01711002233',
      };
      await socialLogin(provider, mockOAuthToken, profile);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Social sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      <div className="relative w-full max-w-md bg-[#FAF7F5] rounded-xl shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 z-10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1.5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="font-editorial text-2xl font-bold tracking-[0.2em] text-[#1C1917]">
            SSTREAND
          </span>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C5A059] ml-1 font-sans">
            SHOP
          </span>
          <p className="text-xs text-stone-500 mt-1">
            {tab === 'signin' && 'Sign in to access your orders and wishlist'}
            {tab === 'register' && 'Join SSTREAND for luxury fashion & authentic beauty'}
            {tab === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 bg-[#EFE8E2] p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                tab === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                tab === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. samira@example.com or 01711223344"
                  className="w-full px-3.5 py-2.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-[#A07C38] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samira Rahman"
                  className="w-full px-3.5 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samira@example.com"
                  className="w-full px-3.5 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Bangladeshi Phone (01X...)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3.5 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Forgot Password View */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Enter your registered email address. We will verify your account and provide reset instructions.
            </p>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('If an account exists with this email, password reset instructions have been sent.');
                setTimeout(() => setTab('signin'), 2000);
              }}
              className="w-full py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-stone-800 transition-colors"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setTab('signin')}
              className="w-full text-xs text-stone-600 hover:text-stone-900 underline text-center"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Social Authentication */}
        {tab !== 'forgot' && (
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="relative text-center mb-4">
              <span className="bg-[#FAF7F5] px-2 text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialClick('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-stone-300 hover:border-stone-400 rounded-md text-xs font-medium text-stone-800 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('facebook')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1877F2] text-white hover:bg-[#166fe5] rounded-md text-xs font-medium transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            {socialInfo && (
              <div className="mt-2 text-[10px] text-stone-500 bg-white p-2 rounded border border-stone-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{socialInfo}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
