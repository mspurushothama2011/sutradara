import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';

// Domain Subrouters
import customerRouter from './routes/customer';
import adminRouter from './routes/admin';

// Direct Route Handlers for Canonical & Backwards-Compatible Legacy Top-Level Endpoints
import customerCatalogRoutes from './routes/customer/catalog.routes';
import customerCategoriesRoutes from './routes/customer/categories.routes';
import customerOrdersRoutes from './routes/customer/orders.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminMarketingRoutes from './routes/admin/marketing.routes';
import adminStaffRoutes from './routes/admin/staff.routes';
import adminAuditRoutes from './routes/admin/audit.routes';

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
      customerDomain: 'http://localhost:4000/api/v1/customer',
      adminDomain: 'http://localhost:4000/api/v1/admin',
      interactiveDocs: 'http://localhost:4000/docs',
      health: 'http://localhost:4000/api/health',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Sutradara API Backend (Customer & Admin Domains Isolated)',
    timestamp: new Date().toISOString(),
  });
});

// 🛍️ PRIMARY CUSTOMER DOMAIN ROUTER
app.use('/api/v1/customer', customerRouter);

// 🏛️ PRIMARY ADMIN / PORTAL DOMAIN ROUTER (Guarded by RBAC & Staff Auth)
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/portal', adminRouter);

// 🔄 Backwards-Compatible Legacy Top-Level Mounts
app.use('/api/v1/products', customerCatalogRoutes);
app.use('/api/v1/categories', customerCategoriesRoutes);
app.use('/api/v1/orders', customerOrdersRoutes);
app.use('/api/v1/auth', adminAuthRoutes);
app.use('/api/v1/marketing', adminMarketingRoutes);
app.use('/api/v1/staff', adminStaffRoutes);
app.use('/api/v1/audit', adminAuditRoutes);

// Global 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`⚡ Sutraಧಾರ API server running on http://localhost:${PORT}`);
  console.log(`🛍️ Customer APIs at http://localhost:${PORT}/api/v1/customer`);
  console.log(`🏛️ Admin APIs at http://localhost:${PORT}/api/v1/admin`);
  console.log(`📖 Visual Interactive API Docs available at http://localhost:${PORT}/docs`);
});
