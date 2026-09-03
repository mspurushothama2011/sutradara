export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Sutraಧಾರ Luxury Handloom Saree Platform API',
    version: '1.0.0',
    description: `
**Sutraಧಾರ Royal Handloom E-Commerce Backend**
Sovereign e-commerce platform connecting patrons directly with the venerated weaver guilds of Varanasi, Kanchipuram, Yeola, and Chanderi.

### Security Architecture:
* **Zero-Client Price Trust:** All totals, coupons, and discounts computed server-side.
* **Granular Capability RBAC:** Role-based access control with token/cookie authentication.
* **High-Assurance Delivery:** 4-digit Secure Drop OTP on doorstep delivery.
    `,
    contact: {
      name: 'Sutraಧಾರ Engineering Team',
      email: 'engineering@sutradara.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/products': {
      get: {
        tags: ['Product Catalog'],
        summary: 'List sarees with multi-attribute filtering',
        description: 'Query authentic sarees directly from PostgreSQL with optional filtering by Craft Cluster, Zari Type, and 1-of-1 Heirloom status.',
        parameters: [
          { name: 'craftRegion', in: 'query', schema: { type: 'string' }, description: 'Loom cluster (e.g. Varanasi, Kanchipuram, Yeola, Chanderi, Patan, Mysore)' },
          { name: 'zariType', in: 'query', schema: { type: 'string' }, description: 'Zari classification (e.g. Pure Gold Zari, Tested Gold Zari)' },
          { name: 'isHeirloom1of1', in: 'query', schema: { type: 'boolean' }, description: 'Filter only single-piece 1-of-1 unrepeatable heirlooms' },
          { name: 'isFeatured', in: 'query', schema: { type: 'boolean' }, description: 'Filter featured showcase sarees' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name, motifs, or SKU' },
        ],
        responses: {
          200: {
            description: 'List of matching authentic sarees',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'number' },
                    products: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/products/{slug}': {
      get: {
        tags: ['Product Catalog'],
        summary: 'Get single saree details by URL slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'varanasi-royal-kadhwa-pure-katan-silk-saree' },
        ],
        responses: {
          200: { description: 'Saree detail with Silk Mark and provenance' },
          404: { description: 'Saree not found in catalog' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Craft Clusters & Categories'],
        summary: 'List all 8 master craft clusters and their sub-categories',
        responses: {
          200: {
            description: 'Array of categories including sub-categories (enforced max 3 each)',
          },
        },
      },
    },
    '/customer/auth/send-otp': {
      post: {
        tags: ['Customer Authentication (Patron)'],
        summary: 'Request 6-Digit Email OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'patron@royal.in' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP generated and sent (devOtp returned in development mode)' },
        },
      },
    },
    '/customer/auth/verify-otp': {
      post: {
        tags: ['Customer Authentication (Patron)'],
        summary: 'Verify 6-Digit Email OTP & Authenticate Patron',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'patron@royal.in' },
                  otp: { type: 'string', example: '123456' },
                  name: { type: 'string', example: 'Ananya Deshmukh' },
                  phone: { type: 'string', example: '+91 98201 54321' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful, JWT token and user record returned' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/customer/auth/me': {
      get: {
        tags: ['Customer Authentication (Patron)'],
        summary: 'Get logged-in patron profile and saved delivery addresses',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Patron profile and address book' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/customer/auth/address': {
      post: {
        tags: ['Customer Authentication (Patron)'],
        summary: 'Save new delivery address (supports multi-recipient gifting)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['street', 'city', 'state', 'pincode'],
                properties: {
                  recipientName: { type: 'string', example: 'Sunita Deshmukh' },
                  recipientPhone: { type: 'string', example: '+91 98201 54321' },
                  street: { type: 'string', example: '14, Altamount Road, Cumballa Hill' },
                  landmark: { type: 'string', example: 'Near Ambani Villa' },
                  city: { type: 'string', example: 'Mumbai' },
                  state: { type: 'string', example: 'Maharashtra' },
                  pincode: { type: 'string', example: '400026' },
                  isDefault: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Address saved to PostgreSQL' },
        },
      },
    },
    '/customer/orders/create': {
      post: {
        tags: ['Customer Orders & Checkout'],
        summary: 'Place Order & Acquire Saree (Instant Development Bypass Mode)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'shippingAddress'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        quantity: { type: 'number', example: 1 },
                      },
                    },
                  },
                  shippingAddress: {
                    type: 'object',
                    required: ['street', 'city', 'state', 'pincode'],
                    properties: {
                      recipientName: { type: 'string', example: 'Ananya Deshmukh' },
                      recipientPhone: { type: 'string', example: '+91 98201 54321' },
                      street: { type: 'string', example: '14 Altamount Road' },
                      city: { type: 'string', example: 'Mumbai' },
                      state: { type: 'string', example: 'Maharashtra' },
                      pincode: { type: 'string', example: '400026' },
                    },
                  },
                  couponCode: { type: 'string', example: 'VIRASAT10' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Order created with status PAID and 4-digit drop OTP' },
        },
      },
    },
    '/customer/orders/my-orders': {
      get: {
        tags: ['Customer Orders & Checkout'],
        summary: 'List all acquisitions and orders for logged-in customer',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Array of customer orders' },
        },
      },
    },
    '/orders/track/{orderId}': {
      get: {
        tags: ['High-Assurance Logistics Tracking'],
        summary: 'Public Live Delivery Tracking by Order Number or AWB',
        parameters: [
          { name: 'orderId', in: 'path', required: true, schema: { type: 'string' }, example: 'SUT-2026-1001' },
        ],
        responses: {
          200: { description: 'Live tracking timeline, status, and drop OTP (inspection video scrubbed for privacy)' },
          404: { description: 'Order reference not found' },
        },
      },
    },
    '/portal/auth/login': {
      post: {
        tags: ['Staff & Admin Workspace'],
        summary: 'Staff / Admin Portal Login (Credentials Verification)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@sutradara.in' },
                  password: { type: 'string', example: 'AdminPassword@2026' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with role capabilities and JWT token' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Staff & Admin Workspace'],
        summary: 'List all orders in the system (Requires orders:manage capability)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of all customer orders' },
        },
      },
    },
    '/orders/{orderId}/dispatch': {
      patch: {
        tags: ['Staff & Admin Workspace'],
        summary: 'Update Order Dispatch & Attach QC Video (Requires orders:manage capability)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'orderId', in: 'path', required: true, schema: { type: 'string' }, example: 'SUT-2026-1001' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PAID', 'QC_INSPECTED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'], example: 'SHIPPED' },
                  courierPartner: { type: 'string', example: 'Bluedart Apex Air' },
                  awbNumber: { type: 'string', example: 'BD-77890214IN' },
                  inspectionVideoUrl: { type: 'string', example: 'https://assets.sutradara.in/videos/ban-kat-001-inspection-20s.mp4' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Order dispatch updated and milestone appended to timeline' },
        },
      },
    },
    '/marketing/deal': {
      get: {
        tags: ['Marketing Suite'],
        summary: 'Get active Deal of the Day with countdown timer',
        responses: {
          200: { description: 'Active deal saree details and expiration timestamp' },
        },
      },
    },
    '/marketing/validate-coupon': {
      post: {
        tags: ['Marketing Suite'],
        summary: 'Validate coupon code against database terms',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'cartTotal'],
                properties: {
                  code: { type: 'string', example: 'VIRASAT10' },
                  cartTotal: { type: 'number', example: 38500 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Coupon validity, discount amount, and final price' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Access Token or login to receive automatic HttpOnly cookie.',
      },
    },
  },
};
