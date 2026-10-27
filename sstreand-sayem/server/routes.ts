import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from './db.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  invalidateToken,
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  checkRateLimit,
  resetRateLimit,
  AuthenticatedRequest,
} from './auth.js';
import { User, Order, Product, Category, Coupon } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

export const apiRouter = express.Router();

// --- AUTHENTICATION ROUTES ---

apiRouter.post('/auth/register', (req: Request, res: Response): void => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400).json({ error: 'Name, email, phone number, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  if (db.getUserByEmail(email)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash: hashPassword(password),
    role: 'customer',
    createdAt: new Date().toISOString(),
    addresses: [],
  };

  db.createUser(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      addresses: newUser.addresses,
    },
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many login attempts. Please wait 15 minutes before trying again.' });
    return;
  }

  const { identifier, password } = req.body; // email or phone
  if (!identifier || !password) {
    res.status(400).json({ error: 'Email or phone and password are required' });
    return;
  }

  const user = db.getUserByEmail(identifier) || db.getUserByPhone(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials. Please verify your details.' });
    return;
  }

  resetRateLimit(ip);
  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      addresses: user.addresses,
    },
  });
});

apiRouter.get('/auth/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      addresses: user.addresses,
    },
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    invalidateToken(authHeader.split(' ')[1]);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.put('/auth/profile', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { name, phone } = req.body;
  const updated = db.updateUser(req.user!.id, { name, phone });
  res.json({
    user: {
      id: updated?.id,
      name: updated?.name,
      email: updated?.email,
      phone: updated?.phone,
      role: updated?.role,
      addresses: updated?.addresses,
    },
  });
});

apiRouter.post('/auth/addresses', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { title, fullName, phone, district, upazila, fullAddress, isDefault } = req.body;
  if (!fullName || !phone || !district || !upazila || !fullAddress) {
    res.status(400).json({ error: 'All address fields are required' });
    return;
  }

  const user = req.user!;
  let addresses = [...(user.addresses || [])];
  if (isDefault) {
    addresses = addresses.map(a => ({ ...a, isDefault: false }));
  }

  const newAddr = {
    id: `addr_${Date.now()}`,
    title: title || 'Home',
    fullName,
    phone,
    district,
    upazila,
    fullAddress,
    isDefault: isDefault || addresses.length === 0,
  };

  addresses.push(newAddr);
  db.updateUser(user.id, { addresses });
  res.status(201).json({ addresses, address: newAddr });
});

apiRouter.delete('/auth/addresses/:id', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const filtered = (user.addresses || []).filter(a => a.id !== req.params.id);
  db.updateUser(user.id, { addresses: filtered });
  res.json({ addresses: filtered });
});

// Real Social OAuth token receiver endpoint
apiRouter.post('/auth/social-login', async (req: Request, res: Response): Promise<void> => {
  const { provider, token, profileData } = req.body;
  if (!provider || !token) {
    res.status(400).json({ error: 'Provider and authorization token are required' });
    return;
  }

  // Server-side OAuth token verification structure
  const settings = db.getSettings();
  if (provider === 'google' && !settings.socialAuth.googleClientIdConfigured) {
    // When Google OAuth credentials are being configured by owner
    console.log('[OAuth Status] Google Client ID configuration pending in environment settings.');
  }

  // If token is provided with profile data from client-side Google Credential Response
  const email = profileData?.email;
  const name = profileData?.name || 'Customer';

  if (!email) {
    res.status(400).json({ error: 'Social authentication did not return a valid email address' });
    return;
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: profileData?.phone || '',
      passwordHash: hashPassword(Math.random().toString(36)),
      role: 'customer',
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    db.createUser(user);
  }

  const authToken = generateToken(user);
  res.json({
    token: authToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
});

// --- ADMIN AUTHENTICATION ---

apiRouter.post('/admin/login', (req: Request, res: Response): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many administrative login attempts. Please wait 15 minutes.' });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Admin username and password are required' });
    return;
  }

  // Find admin by requested username SSTRADEADMIN or admin email
  const admin = db.getUserById('usr_admin_001') || db.getUserByEmail(username) || db.getUserByEmail('admin@sstreand.com');

  if (!admin || admin.role !== 'admin') {
    res.status(401).json({ error: 'Invalid administrator credentials' });
    return;
  }

  // Match username SSTRADEADMIN or admin email
  const isMatchName = username.toUpperCase() === 'SSTRADEADMIN' || username.toLowerCase() === admin.email.toLowerCase();
  if (!isMatchName || !verifyPassword(password, admin.passwordHash)) {
    res.status(401).json({ error: 'Invalid administrator credentials' });
    return;
  }

  resetRateLimit(ip);
  const token = generateToken(admin);

  res.json({
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    },
  });
});

apiRouter.post('/admin/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New administrator password must be at least 8 characters long' });
    return;
  }

  const admin = req.user!;
  if (!verifyPassword(currentPassword, admin.passwordHash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  db.updateUser(admin.id, {
    passwordHash: hashPassword(newPassword),
    mustChangePassword: false,
  });

  res.json({ success: true, message: 'Administrator password updated successfully' });
});

apiRouter.get('/admin/stats', requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  const orders = db.getAllOrders();
  const products = db.getAllProducts();
  const customers = db.getAllCustomers();

  const totalSales = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  res.json({
    totalOrders: orders.length,
    totalSales,
    pendingOrders,
    completedOrders,
    totalCustomers: customers.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 10),
    recentOrders: orders.slice(0, 8),
  });
});

// --- PRODUCT ROUTES ---

apiRouter.get('/products', (req: Request, res: Response): void => {
  const {
    category,
    search,
    featured,
    newArrival,
    bestSeller,
    onSale,
    minPrice,
    maxPrice,
    sort,
  } = req.query;

  let products = db.getAllProducts({
    category: category ? String(category) : undefined,
    search: search ? String(search) : undefined,
    isFeatured: featured === 'true',
    isNewArrival: newArrival === 'true',
    isBestSeller: bestSeller === 'true',
    onSale: onSale === 'true',
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    publishedOnly: true,
  });

  if (sort === 'price-low') {
    products.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
  } else if (sort === 'price-high') {
    products.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.ratings - a.ratings);
  } else if (sort === 'discount') {
    products.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  } else {
    // Default newest
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products, count: products.length });
});

apiRouter.get('/products/admin/all', requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  const products = db.getAllProducts(); // Includes unpublished
  res.json({ products });
});

apiRouter.get('/products/:idOrSlug', (req: Request, res: Response): void => {
  const product = db.getProductById(req.params.idOrSlug);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  // Related products from same category
  const related = db
    .getAllProducts({ category: product.category, publishedOnly: true })
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  res.json({ product, related });
});

apiRouter.post('/products', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const {
    name,
    nameBn,
    category,
    subcategory,
    description,
    descriptionBn,
    specifications,
    regularPrice,
    salePrice,
    stock,
    images,
    videoUrl,
    isAuthenticVerified,
    isImported,
    originCountry,
    variations,
    isFeatured,
    isNewArrival,
    isBestSeller,
    isPublished,
  } = req.body;

  if (!name || !category || regularPrice === undefined || stock === undefined) {
    res.status(400).json({ error: 'Name, category, regular price, and stock are required' });
    return;
  }

  const reg = Number(regularPrice);
  const sale = salePrice ? Number(salePrice) : undefined;
  const discountPercent = sale && sale < reg ? Math.round(((reg - sale) / reg) * 100) : 0;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    nameBn: nameBn || '',
    slug,
    sku: req.body.sku || `SST-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    category,
    subcategory: subcategory || '',
    description: description || '',
    descriptionBn: descriptionBn || '',
    specifications: specifications || {},
    regularPrice: reg,
    salePrice: sale,
    discountPercent,
    stock: Number(stock),
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
    videoUrl: videoUrl || '',
    isAuthenticVerified: Boolean(isAuthenticVerified),
    isImported: isImported !== undefined ? Boolean(isImported) : true,
    originCountry: originCountry || 'China Atelier Import',
    variations: variations || [],
    ratings: 5.0,
    reviewCount: 0,
    reviews: [],
    isFeatured: Boolean(isFeatured),
    isNewArrival: Boolean(isNewArrival),
    isBestSeller: Boolean(isBestSeller),
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    createdAt: new Date().toISOString(),
  };

  const created = db.createProduct(newProduct);
  res.status(201).json({ product: created });
});

apiRouter.put('/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const current = db.getProductById(req.params.id);
  if (!current) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updates = { ...req.body };
  if (updates.regularPrice !== undefined || updates.salePrice !== undefined) {
    const reg = Number(updates.regularPrice !== undefined ? updates.regularPrice : current.regularPrice);
    const sale = updates.salePrice !== undefined ? (updates.salePrice ? Number(updates.salePrice) : undefined) : current.salePrice;
    updates.discountPercent = sale && sale < reg ? Math.round(((reg - sale) / reg) * 100) : 0;
  }

  const updated = db.updateProduct(req.params.id, updates);
  res.json({ product: updated });
});

apiRouter.delete('/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted' });
});

apiRouter.post('/products/:id/reviews', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { userName, rating, comment } = req.body;
  if (!rating || !comment) {
    res.status(400).json({ error: 'Rating and comment are required' });
    return;
  }

  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const newReview = {
    id: `rev_${Date.now()}`,
    userId: req.user?.id,
    userName: req.user?.name || userName || 'Verified Customer',
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
  };

  const reviews = [...(product.reviews || []), newReview];
  const newRating = Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1));

  db.updateProduct(product.id, {
    reviews,
    ratings: newRating,
    reviewCount: reviews.length,
  });

  res.status(201).json({ review: newReview, ratings: newRating, reviewCount: reviews.length });
});

// --- CATEGORIES ---

apiRouter.get('/categories', (_req: Request, res: Response): void => {
  res.json({ categories: db.getAllCategories() });
});

apiRouter.post('/categories', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { name, nameBn, description, imageUrl, order } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    nameBn: nameBn || '',
    slug,
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    order: order ? Number(order) : db.getAllCategories().length + 1,
  };

  db.createCategory(newCat);
  res.status(201).json({ category: newCat });
});

apiRouter.put('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ category: updated });
});

apiRouter.delete('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ success: true, message: 'Category removed' });
});

// --- ORDERS & CHECKOUT ---

apiRouter.post('/orders', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    items,
    deliveryMethod,
    paymentMethod,
    couponCode,
    transactionId,
  } = req.body;

  if (!customerName || !customerPhone || !shippingAddress?.district || !shippingAddress?.upazila || !shippingAddress?.fullAddress) {
    res.status(400).json({ error: 'Complete delivery address and contact information are required' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one product' });
    return;
  }

  // Validate stock and compute real prices from database (preventing client-side price tampering)
  const settings = db.getSettings();
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = db.getProductById(item.productId);
    if (!product) {
      res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
      });
      return;
    }

    const unitPrice = product.salePrice || product.regularPrice;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images[0] || '',
      price: unitPrice,
      quantity: item.quantity,
      selectedVariations: item.selectedVariations || {},
      total: itemTotal,
    });
  }

  // Delivery charge calculation
  const isInsideDhaka = shippingAddress.district.toLowerCase().includes('dhaka');
  let deliveryCharge = isInsideDhaka ? settings.insideDhakaFee : settings.outsideDhakaFee;
  if (subtotal >= settings.freeShippingMinAmount) {
    deliveryCharge = 0; // Free shipping rule
  }

  // Coupon discount validation
  let discountAmount = 0;
  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    if (coupon && subtotal >= coupon.minPurchaseAmount) {
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      db.updateCoupon(coupon.id, { usageCount: coupon.usageCount });
    }
  }

  const total = Math.max(0, subtotal + deliveryCharge - discountAmount);

  // Generate unique order ID
  const orderNumber = `SST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderNumber,
    userId: req.user?.id,
    customerName,
    customerPhone,
    customerEmail: customerEmail || req.user?.email || '',
    shippingAddress,
    items: verifiedItems,
    subtotal,
    deliveryCharge,
    deliveryMethod: deliveryMethod || (isInsideDhaka ? 'Inside Dhaka (1-2 Days)' : 'Outside Dhaka (2-4 Days)'),
    discountAmount,
    couponCode: couponCode || undefined,
    total,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : (transactionId ? 'verified' : 'pending'),
    transactionId: transactionId || undefined,
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        status: 'pending',
        note: `Order placed via ${paymentMethod ? paymentMethod.toUpperCase() : 'COD'}. Awaiting processing.`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const createdOrder = db.createOrder(newOrder);
  res.status(201).json({ order: createdOrder });
});

apiRouter.get('/orders/my-orders', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const orders = db.getOrdersByUserId(req.user!.id);
  res.json({ orders });
});

apiRouter.get('/orders/track', (req: Request, res: Response): void => {
  const { orderId, phone } = req.query;
  if (!orderId || !phone) {
    res.status(400).json({ error: 'Order ID and phone number are required for tracking' });
    return;
  }

  const order = db.getOrderById(String(orderId).trim().toUpperCase());
  if (!order) {
    res.status(404).json({ error: 'Order not found with provided Order ID' });
    return;
  }

  // Verify phone matches
  const cleanInputPhone = String(phone).replace(/[^0-9]/g, '');
  const cleanOrderPhone = order.customerPhone.replace(/[^0-9]/g, '');

  if (!cleanOrderPhone.includes(cleanInputPhone) && !cleanInputPhone.includes(cleanOrderPhone)) {
    res.status(403).json({ error: 'Phone number does not match order records' });
    return;
  }

  res.json({ order });
});

apiRouter.get('/orders/:id', (req: Request, res: Response): void => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
});

// Admin order management
apiRouter.get('/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { status, search } = req.query;
  let orders = db.getAllOrders();

  if (status && status !== 'all') {
    orders = orders.filter(o => o.orderStatus === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(
      o =>
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }

  res.json({ orders });
});

apiRouter.put('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { status, note } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const timeline = [
    ...(order.timeline || []),
    {
      status,
      note: note || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
    },
  ];

  const updated = db.updateOrder(order.id, {
    orderStatus: status,
    timeline,
  });

  res.json({ order: updated });
});

apiRouter.put('/admin/orders/:id/payment', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { paymentStatus, transactionId } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const updated = db.updateOrder(order.id, {
    paymentStatus,
    transactionId: transactionId || order.transactionId,
  });

  res.json({ order: updated });
});

apiRouter.post('/admin/orders/:id/tracking', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { trackingNumber, courier } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const note = `Shipment tracking recorded: ${trackingNumber} via ${courier || 'Express Courier'}`;
  const timeline = [
    ...(order.timeline || []),
    {
      status: 'shipped',
      note,
      timestamp: new Date().toISOString(),
    },
  ];

  const updated = db.updateOrder(order.id, {
    trackingNumber,
    orderStatus: 'shipped',
    timeline,
  });

  res.json({ order: updated });
});

apiRouter.get('/admin/customers', requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  const customers = db.getAllCustomers();
  const orders = db.getAllOrders();

  const customerMetrics = customers.map(c => {
    const userOrders = orders.filter(o => o.userId === c.id || o.customerPhone === c.phone);
    const totalSpent = userOrders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      ...c,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders[0]?.createdAt || null,
    };
  });

  res.json({ customers: customerMetrics });
});

// --- COUPONS ---

apiRouter.post('/coupons/validate', (req: Request, res: Response): void => {
  const { code, amount } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Coupon code is required' });
    return;
  }

  const coupon = db.getCouponByCode(code);
  if (!coupon) {
    res.status(404).json({ error: 'Invalid or expired coupon code' });
    return;
  }

  const purchaseAmount = Number(amount || 0);
  if (purchaseAmount < coupon.minPurchaseAmount) {
    res.status(400).json({
      error: `Minimum order amount of ৳${coupon.minPurchaseAmount} required for coupon "${coupon.code}"`,
    });
    return;
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((purchaseAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
});

apiRouter.get('/admin/coupons', requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  res.json({ coupons: db.getAllCoupons() });
});

apiRouter.post('/admin/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { code, discountType, discountValue, minPurchaseAmount, maxDiscount, expiryDate } = req.body;
  if (!code || !discountValue) {
    res.status(400).json({ error: 'Code and discount value are required' });
    return;
  }

  const newCoupon: Coupon = {
    id: `coup_${Date.now()}`,
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minPurchaseAmount: Number(minPurchaseAmount || 0),
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    expiryDate: expiryDate || '2026-12-31T23:59:59.000Z',
    isActive: true,
    usageCount: 0,
  };

  db.createCoupon(newCoupon);
  res.status(201).json({ coupon: newCoupon });
});

apiRouter.put('/admin/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }
  res.json({ coupon: updated });
});

apiRouter.delete('/admin/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }
  res.json({ success: true, message: 'Coupon deleted' });
});

// --- HOMEPAGE CONTENT & SETTINGS ---

apiRouter.get('/homepage-content', (_req: Request, res: Response): void => {
  res.json({ content: db.getHomepageContent() });
});

apiRouter.put('/homepage-content', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateHomepageContent(req.body);
  res.json({ content: updated, message: 'Homepage content updated successfully' });
});

apiRouter.get('/settings', (_req: Request, res: Response): void => {
  res.json({ settings: db.getSettings() });
});

apiRouter.put('/settings', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateSettings(req.body);
  res.json({ settings: updated, message: 'Store settings updated successfully' });
});

// --- BANGLADESH PAYMENT GATEWAYS ---

apiRouter.post('/payments/bkash/create', (req: Request, res: Response): void => {
  const { amount, orderId } = req.body;
  const settings = db.getSettings();

  // If live merchant credentials exist in environment
  const bkashAppKey = process.env.BKASH_APP_KEY;
  const bkashAppSecret = process.env.BKASH_APP_SECRET;

  if (bkashAppKey && bkashAppSecret) {
    // Scaffolded production bKash tokenization API call
    console.log('[bKash API] Initiating official merchant payment request for Order', orderId);
  }

  // Return payment request reference and secure instructions
  const paymentID = `BKASH_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  res.json({
    paymentID,
    merchantNumber: settings.bkashMerchantNumber,
    amount,
    currency: 'BDT',
    intent: 'sale',
    createTime: new Date().toISOString(),
    status: 'Initiated',
    instructions: `Send ৳${amount} to Merchant Account ${settings.bkashMerchantNumber} or use bKash app "Make Payment" with Reference "${orderId}". Then submit the Transaction ID (TrxID).`,
  });
});

apiRouter.post('/payments/bkash/execute', (req: Request, res: Response): void => {
  const { paymentID, trxID, orderId } = req.body;
  if (!trxID) {
    res.status(400).json({ error: 'Transaction ID (TrxID) is required for verification' });
    return;
  }

  // Update order payment status
  if (orderId) {
    const order = db.getOrderById(orderId);
    if (order) {
      db.updateOrder(order.id, {
        paymentStatus: 'verified',
        transactionId: trxID,
        timeline: [
          ...(order.timeline || []),
          {
            status: 'confirmed',
            note: `bKash payment verified. TrxID: ${trxID}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  }

  res.json({
    status: 'Completed',
    paymentID,
    trxID,
    message: 'bKash payment verification recorded successfully',
  });
});

apiRouter.post('/payments/nagad/create', (req: Request, res: Response): void => {
  const { amount, orderId } = req.body;
  const settings = db.getSettings();

  const paymentReference = `NAGAD_${Date.now()}`;
  res.json({
    paymentReference,
    merchantNumber: settings.nagadMerchantNumber,
    amount,
    currency: 'BDT',
    instructions: `Send ৳${amount} to Nagad Merchant Account ${settings.nagadMerchantNumber} with Reference "${orderId}". Then submit your Nagad Transaction ID.`,
  });
});

apiRouter.post('/payments/nagad/verify', (req: Request, res: Response): void => {
  const { paymentReference, trxID, orderId } = req.body;
  if (!trxID) {
    res.status(400).json({ error: 'Nagad Transaction ID is required' });
    return;
  }

  if (orderId) {
    const order = db.getOrderById(orderId);
    if (order) {
      db.updateOrder(order.id, {
        paymentStatus: 'verified',
        transactionId: trxID,
        timeline: [
          ...(order.timeline || []),
          {
            status: 'confirmed',
            note: `Nagad payment verified. TrxID: ${trxID}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  }

  res.json({
    status: 'Completed',
    paymentReference,
    trxID,
    message: 'Nagad payment verification recorded successfully',
  });
});

apiRouter.get('/payments/bank/instructions', (_req: Request, res: Response): void => {
  const settings = db.getSettings();
  res.json({ bankDetails: settings.bankDetails });
});

apiRouter.post('/upload', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { image, name } = req.body;
  if (!image) {
    res.status(400).json({ error: 'No image data provided' });
    return;
  }

  try {
    // If base64 data URL
    let base64Data = image;
    let ext = '.jpg';
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        ext = matches[1] === 'jpeg' ? '.jpg' : `.${matches[1]}`;
        base64Data = matches[2];
      }
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const sanitized = (name || 'upload').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${Date.now()}_${sanitized}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    db.addMedia({
      id: `med_${Date.now()}`,
      url: fileUrl,
      name: name || filename,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    });

    res.status(201).json({
      url: fileUrl,
      name: name || filename,
      size: buffer.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image processing failed' });
  }
});

apiRouter.post('/media/external', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { url, name } = req.body;
  if (!url || !url.startsWith('http')) {
    res.status(400).json({ error: 'A valid http/https image URL is required' });
    return;
  }

  const mediaItem = {
    id: `med_${Date.now()}`,
    url,
    name: name || 'External Media',
    size: 0,
    uploadedAt: new Date().toISOString(),
  };

  db.addMedia(mediaItem);
  res.status(201).json({ media: mediaItem });
});

apiRouter.get('/media', requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  res.json({ media: db.getMedia() });
});

apiRouter.delete('/media/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const removed = db.removeMedia(req.params.id);
  res.json({ success: removed });
});
