import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// AI Studio dev server must run on port 3000
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Parse JSON bodies with generous limit for product edits & base64
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Uploads directory static serving
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // SEO: Dynamic robots.txt
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(
      `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${process.env.APP_URL || 'https://sstreandshop.com'}/sitemap.xml`
    );
  });

  // SEO: Dynamic sitemap.xml
  app.get('/sitemap.xml', (_req, res) => {
    const products = db.getAllProducts({ publishedOnly: true });
    const categories = db.getAllCategories();
    const baseUrl = process.env.APP_URL || 'https://sstreandshop.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    // Static main routes
    const staticRoutes = [
      '',
      '/all-products',
      '/new-arrivals',
      '/best-sellers',
      '/sale-offers',
      '/about-us',
      '/contact-us',
      '/shipping-policy',
      '/return-policy',
      '/faq',
    ];

    staticRoutes.forEach(route => {
      xml += `  <url><loc>${baseUrl}${route}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
    });

    categories.forEach(cat => {
      xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    });

    products.forEach(prod => {
      xml += `  <url><loc>${baseUrl}/product/${prod.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.type('application/xml');
    res.send(xml);
  });

  if (!isProd) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist folder
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ SSTREAND SHOP Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start SSTREAND SHOP server:', err);
  process.exit(1);
});
