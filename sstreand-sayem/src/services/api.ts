import {
  Product,
  Category,
  Order,
  User,
  Coupon,
  HomepageContent,
  StoreSettings,
} from '../types';

const TOKEN_KEY = 'sstreand_auth_token';
const ADMIN_TOKEN_KEY = 'sstreand_admin_token';

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const getAdminToken = (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}, isAdmin = false): Promise<T> {
  const token = isAdmin ? getAdminToken() : getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Products
  async getProducts(params?: Record<string, string | number | boolean>): Promise<{ products: Product[]; count: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const qStr = query.toString();
    return request<{ products: Product[]; count: number }>(`/products${qStr ? `?${qStr}` : ''}`);
  },

  async getProduct(idOrSlug: string): Promise<{ product: Product; related: Product[] }> {
    return request<{ product: Product; related: Product[] }>(`/products/${idOrSlug}`);
  },

  async addReview(productId: string, data: { userName?: string; rating: number; comment: string }): Promise<any> {
    return request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/categories');
  },

  // Homepage Content & Settings
  async getHomepageContent(): Promise<{ content: HomepageContent }> {
    return request<{ content: HomepageContent }>('/homepage-content');
  },

  async getSettings(): Promise<{ settings: StoreSettings }> {
    return request<{ settings: StoreSettings }>('/settings');
  },

  // Coupons
  async validateCoupon(code: string, amount: number): Promise<{ valid: boolean; code: string; discountAmount: number }> {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    });
  },

  // Orders
  async createOrder(orderData: any): Promise<{ order: Order }> {
    return request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(): Promise<{ orders: Order[] }> {
    return request<{ orders: Order[] }>('/orders/my-orders');
  },

  async trackOrder(orderId: string, phone: string): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`);
  },

  // Payments
  async initiateBkash(orderId: string, amount: number): Promise<any> {
    return request('/payments/bkash/create', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount }),
    });
  },

  async executeBkash(orderId: string, paymentID: string, trxID: string): Promise<any> {
    return request('/payments/bkash/execute', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentID, trxID }),
    });
  },

  async initiateNagad(orderId: string, amount: number): Promise<any> {
    return request('/payments/nagad/create', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount }),
    });
  },

  async verifyNagad(orderId: string, paymentReference: string, trxID: string): Promise<any> {
    return request('/payments/nagad/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentReference, trxID }),
    });
  },

  async getBankInstructions(): Promise<{ bankDetails: StoreSettings['bankDetails'] }> {
    return request('/payments/bank/instructions');
  },

  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: { name: string; email: string; phone: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async updateProfile(data: { name: string; phone: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async addAddress(address: any): Promise<{ addresses: any[]; address: any }> {
    return request('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  async deleteAddress(id: string): Promise<{ addresses: any[] }> {
    return request(`/auth/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  async socialLogin(provider: 'google' | 'facebook', token: string, profileData?: any): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, token, profileData }),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  // --- ADMIN API CALLS ---
  admin: {
    async login(username: string, password: string): Promise<{ token: string; user: User }> {
      const res = await request<{ token: string; user: User }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAdminToken(res.token);
      return res;
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
      return request('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }, true);
    },

    async getStats(): Promise<any> {
      return request('/admin/stats', {}, true);
    },

    async getAllProducts(): Promise<{ products: Product[] }> {
      return request<{ products: Product[] }>('/products/admin/all', {}, true);
    },

    async createProduct(product: Partial<Product>): Promise<{ product: Product }> {
      return request<{ product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }, true);
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product }> {
      return request<{ product: Product }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }, true);
    },

    async deleteProduct(id: string): Promise<any> {
      return request(`/products/${id}`, { method: 'DELETE' }, true);
    },

    async createCategory(cat: Partial<Category>): Promise<{ category: Category }> {
      return request<{ category: Category }>('/categories', {
        method: 'POST',
        body: JSON.stringify(cat),
      }, true);
    },

    async updateCategory(id: string, updates: Partial<Category>): Promise<{ category: Category }> {
      return request<{ category: Category }>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }, true);
    },

    async deleteCategory(id: string): Promise<any> {
      return request(`/categories/${id}`, { method: 'DELETE' }, true);
    },

    async updateHomepage(content: Partial<HomepageContent>): Promise<{ content: HomepageContent }> {
      return request<{ content: HomepageContent }>('/homepage-content', {
        method: 'PUT',
        body: JSON.stringify(content),
      }, true);
    },

    async updateSettings(settings: Partial<StoreSettings>): Promise<{ settings: StoreSettings }> {
      return request<{ settings: StoreSettings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }, true);
    },

    async getOrders(params?: { status?: string; search?: string }): Promise<{ orders: Order[] }> {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      return request<{ orders: Order[] }>(`/admin/orders${q.toString() ? `?${q.toString()}` : ''}`, {}, true);
    },

    async updateOrderStatus(orderId: string, status: string, note?: string): Promise<{ order: Order }> {
      return request<{ order: Order }>(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      }, true);
    },

    async updateOrderPayment(orderId: string, paymentStatus: string, transactionId?: string): Promise<{ order: Order }> {
      return request<{ order: Order }>(`/admin/orders/${orderId}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus, transactionId }),
      }, true);
    },

    async addOrderTracking(orderId: string, trackingNumber: string, courier?: string): Promise<{ order: Order }> {
      return request<{ order: Order }>(`/admin/orders/${orderId}/tracking`, {
        method: 'POST',
        body: JSON.stringify({ trackingNumber, courier }),
      }, true);
    },

    async getCustomers(): Promise<{ customers: any[] }> {
      return request<{ customers: any[] }>('/admin/customers', {}, true);
    },

    async getCoupons(): Promise<{ coupons: Coupon[] }> {
      return request<{ coupons: Coupon[] }>('/admin/coupons', {}, true);
    },

    async createCoupon(coupon: Partial<Coupon>): Promise<{ coupon: Coupon }> {
      return request<{ coupon: Coupon }>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(coupon),
      }, true);
    },

    async deleteCoupon(id: string): Promise<any> {
      return request(`/admin/coupons/${id}`, { method: 'DELETE' }, true);
    },

    async uploadImage(file: File): Promise<{ url: string; name: string; size: number }> {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return request<{ url: string; name: string; size: number }>('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: base64, name: file.name, size: file.size }),
      }, true);
    },

    async addExternalMedia(url: string, name?: string): Promise<any> {
      return request('/media/external', {
        method: 'POST',
        body: JSON.stringify({ url, name }),
      }, true);
    },

    async getMedia(): Promise<{ media: any[] }> {
      return request('/media', {}, true);
    },

    async deleteMedia(id: string): Promise<any> {
      return request(`/media/${id}`, { method: 'DELETE' }, true);
    },

    logout(): void {
      clearAdminToken();
    },
  },
};
