# Sutradara — Cloudflare & Infrastructure Configuration Guide

This guide contains all settings, firewall rules, and caching configurations required to set up Cloudflare in front of Sutradara.

---

## 🌐 1. DNS & SSL/TLS Setup

### A. Nameservers
Point your domain registrar (e.g. GoDaddy/Namecheap) nameservers to Cloudflare:
```
NS 1: <assigned-by-cloudflare>.ns.cloudflare.com
NS 2: <assigned-by-cloudflare>.ns.cloudflare.com
```

### B. DNS Records
| Type | Name | Target / Content | Proxy Status | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| **CNAME** | `@` (root) | `cname.vercel-dns.com` | 🟠 Proxied | Frontend Storefront |
| **CNAME** | `www` | `cname.vercel-dns.com` | 🟠 Proxied | WWW redirect |
| **CNAME** | `api` | `<your-railway-app>.up.railway.app` | 🟠 Proxied | Backend Express API |

### C. SSL/TLS Encryption Mode
* Set to **Full (Strict)** in Cloudflare Dashboard $\rightarrow$ SSL/TLS $\rightarrow$ Overview.
* **Always Use HTTPS:** Enabled (`ON`).
* **Minimum TLS Version:** `TLS 1.2` (or `TLS 1.3`).
* **Automatic HTTPS Rewrites:** Enabled (`ON`).

---

## 🛡️ 2. Web Application Firewall (WAF) & Security Rules

### Rule 1: Allow Payment & Courier Webhooks (Critical)
* **Goal:** Ensure Cloudflare does not challenge or block Razorpay / Shiprocket webhook events.
* **Expression:**
  ```text
  (http.request.uri.path in {"/api/v1/payments/webhook" "/api/v1/shipping/webhook"})
  ```
* **Action:** `Bypass` $\rightarrow$ Disable Security Features (WAF, Bot Fight Mode).

### Rule 2: Rate-Limit Portal Login & Auth Endpoints
* **Goal:** Stop brute-force credential stuffing on staff and customer accounts.
* **Expression:**
  ```text
  (http.request.uri.path contains "/api/v1/auth/login" or http.request.uri.path contains "/portal/login")
  ```
* **Rate Limit:** More than 5 requests per 15 minutes per IP.
* **Action:** `Block` or `Managed Challenge`.

### Rule 3: Anti-Scraping / Bot Fight Mode
* **Dashboard Path:** Security $\rightarrow$ Bots $\rightarrow$ **Bot Fight Mode**.
* **Setting:** `ON`.
* Challenges known headless scrapers attempting to download high-res saree catalog photos.

---

## ⚡ 3. Edge Caching & Page Rules

### Rule A: Dynamic API Endpoints — Bypass Cache (Critical)
* **URL Match:** `api.sutradara.in/*` or `sutradara.in/api/*`
* **Settings:**
  * **Cache Level:** `Bypass`
  * **Disable Performance Features:** `Bypass Cache`
  * *(Ensures live stock count, cart, and payment status are never stale).*

### Rule B: Static Saree Assets & 240 Scroll Frames — Edge Cache
* **URL Match:** `sutradara.in/frames/*` and `sutradara.in/images/*`
* **Settings:**
  * **Cache Level:** `Cache Everything`
  * **Edge Cache TTL:** `1 Month`
  * **Browser Cache TTL:** `1 Month`
  * *(Delivers 240 scroll frames from Indian edge nodes in under 50ms).*

---

## 🚀 4. Performance Optimizations (Free Tier)

* **Brotli Compression:** Enabled (`ON`) — shrinks JS/CSS by up to 20% compared to Gzip.
* **Early Hints:** Enabled (`ON`) — preloads Google Fonts (Playfair Display & Inter) before HTML finishes parsing.
* **HTTP/3 (with QUIC):** Enabled (`ON`) — faster mobile connections over Indian cellular networks (Jio/Airtel).
