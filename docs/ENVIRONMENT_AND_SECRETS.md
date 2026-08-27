# Sutradara — Environment Variables & Secrets Reference

This document catalogs every environment variable required across Frontend and Backend, where to acquire credentials, and security rules for deployment.

---

## 🔒 1. Backend Environment Variables (`backend/.env`)

```ini
# Server Configuration
PORT=4000
NODE_ENV=development # "production" in live deployment
FRONTEND_URL=http://localhost:3000 # "https://sutradara.in" in production

# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars

# Payment Gateway (Razorpay)
# Acquire from: https://dashboard.razorpay.com/#/app/keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_hmac_secret_key

# Logistics & Courier (Shiprocket)
# Acquire from: https://app.shiprocket.in/api-user
SHIPROCKET_API_EMAIL=operations@sutradara.in
SHIPROCKET_API_PASSWORD=your_shiprocket_password

# Media Storage (Cloudinary)
# Acquire from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=sutradara
CLOUDINARY_API_KEY=XXXXXXXXXXXXXXX
CLOUDINARY_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🌐 2. Frontend Environment Variables (`frontend/.env.local`)

```ini
# API Gateway Target
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 # "https://api.sutradara.in/api/v1" in production

# Public Payment Key (Frontend Razorpay Modal)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX

# Store Identity & URLs
NEXT_PUBLIC_STORE_NAME="Sutradara"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🛡️ 3. Rules for Handling Secrets

1. **Never Commit Secrets:** `.env` and `.env.local` are strictly included in `.gitignore`.
2. **Production Vault:** In production, inject variables directly through the **Vercel** and **Railway** web dashboard secret managers.
3. **Key Rotation:** Rotate JWT secrets and Razorpay API keys every 6 months or immediately upon any suspected leak.
