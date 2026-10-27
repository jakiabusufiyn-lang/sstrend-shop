import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getAuthToken, getAdminToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  adminUser: User | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook', token: string, profile?: any) => Promise<void>;
  adminLogin: (user: string, pass: string) => Promise<void>;
  adminLogout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (getAuthToken()) {
          const res = await api.getMe();
          setUser(res.user);
        }
      } catch (err) {
        console.error('Failed to restore customer session:', err);
        api.logout().catch(() => {});
      }

      try {
        if (getAdminToken()) {
          // If admin token exists, check admin user
          const stats = await api.admin.getStats().catch(() => null);
          if (stats) {
            setAdminUser({
              id: 'usr_admin_001',
              name: 'SSTRADEADMIN',
              email: 'admin@sstreand.com',
              phone: '01700000000',
              role: 'admin',
              addresses: [],
            });
          } else {
            api.admin.logout();
          }
        }
      } catch {
        api.admin.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const socialLogin = async (provider: 'google' | 'facebook', token: string, profile?: any) => {
    const res = await api.socialLogin(provider, token, profile);
    setUser(res.user);
  };

  const adminLogin = async (username: string, pass: string) => {
    const res = await api.admin.login(username, pass);
    setAdminUser(res.user);
  };

  const adminLogout = () => {
    api.admin.logout();
    setAdminUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  const refreshUser = async () => {
    if (getAuthToken()) {
      const res = await api.getMe();
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isLoading,
        login,
        register,
        logout,
        socialLogin,
        adminLogin,
        adminLogout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
