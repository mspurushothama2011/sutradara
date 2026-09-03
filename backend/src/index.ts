import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';

// Customer Domain Routes
import customerAuthRoutes from './routes/customer/auth.routes';
import customerOrdersRoutes from './routes/customer/orders.routes';

// Portal Domain Routes (Staff & Admin)
import portalAuthRoutes from './routes/auth.routes';
import portalProductsRoutes from './routes/products.routes';
import portalMarketingRoutes from './routes/marketing.routes';
import portalStaffRoutes from './routes/staff.routes';
import portalOrdersRoutes from './routes/orders.routes';
import portalAuditRoutes from './routes/audit.routes';
import categoriesRoutes from './routes/categories.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Trust reverse proxies (Cloudflare, Railway, Vercel)
app.set('trust proxy', 1);

// CORS configuration supporting credentials (cookies)
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json());

// 📖 Interactive Visual API Dashboard (Swagger UI)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Root welcoming endpoint on port 4000
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Sutraಧಾರ Royal Handloom Core API',
    status: 'ONLINE ⚡',
    interactiveDocs: 'http://localhost:4000/docs',
    frontendWebsiteUrl: 'http://localhost:3000',
    documentation: 'Open http://localhost:4000/docs to explore and test all APIs interactively.',
    apiEndpoints: {
      interactiveDocs: 'http://localhost:4000/docs',
      health: 'http://localhost:4000/api/health',
      customerCatalog: 'http://localhost:4000/api/v1/products',
      categories: 'http://localhost:4000/api/v1/categories',
      customerOrders: 'http://localhost:4000/api/v1/customer/orders',
      portalAuth: 'http://localhost:4000/api/v1/portal/auth/login',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Sutradara API Backend (Customer & Portal Domains)',
    timestamp: new Date().toISOString(),
  });
});

// 🛍️ Customer Domain Endpoints
app.use('/api/v1/customer/auth', customerAuthRoutes);
app.use('/api/v1/customer/orders', customerOrdersRoutes);
app.use('/api/v1/categories', categoriesRoutes);

// 🏛️ Staff / Admin Portal Domain Endpoints (Protected by RBAC)
app.use('/api/v1/portal/auth', portalAuthRoutes);
app.use('/api/v1/portal/products', portalProductsRoutes);
app.use('/api/v1/portal/marketing', portalMarketingRoutes);
app.use('/api/v1/portal/staff', portalStaffRoutes);
app.use('/api/v1/portal/orders', portalOrdersRoutes);
app.use('/api/v1/portal/audit', portalAuditRoutes);

// Compatibility fallback for existing portal routes
app.use('/api/v1/auth', portalAuthRoutes);
app.use('/api/v1/products', portalProductsRoutes);
app.use('/api/v1/marketing', portalMarketingRoutes);
app.use('/api/v1/staff', portalStaffRoutes);
app.use('/api/v1/orders', portalOrdersRoutes);
app.use('/api/v1/audit', portalAuditRoutes);

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`⚡ Sutraಧಾರ API server running on http://localhost:${PORT}`);
  console.log(`📖 Visual Interactive API Docs available at http://localhost:${PORT}/docs`);
});
