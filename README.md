<p align="center">
  <img src="public/KDMV_LOGO_OG_BLACK.png" alt="KDMV Logo" width="120" />
</p>

<h1 align="center">KDMV - Cambodian Lifestyle E-Commerce Platform</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
</p>

<p align="center">
  A full-stack e-commerce platform for a Cambodian lifestyle and apparel brand, featuring Bakong KHQR national payment integration, an admin dashboard, and a modern customer storefront.
</p>

---

<details>
<summary><strong>Table of Contents</strong></summary>

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Payment Integration (Bakong KHQR)](#payment-integration-bakong-khqr)
- [User Guides](#user-guides)
- [Development Commands](#development-commands)
- [Author](#author)
- [License](#license)

</details>

---

## About the Project

**KDMV** (Kampuchea Digital Marketing Ventures) is a full-featured e-commerce web application built as an exit exam / graduation project by **Thann Sopheakboth**. It serves as a storefront for a Cambodian lifestyle and apparel brand, providing both a customer shopping experience and a comprehensive admin management dashboard.

What sets KDMV apart is its integration with **Bakong KHQR** — Cambodia's national QR payment system operated by the National Bank of Cambodia (NBC). Customers can pay by scanning a KHQR code with any Bakong-compatible banking app, making the platform tailored for the Cambodian market.

---

## Key Features

### Customer Storefront

- Browse products by type, gender, and collection
- Search products with real-time results
- Product detail pages with color/size variant selection and image gallery
- Shopping cart with optimistic updates and local storage persistence
- Checkout with address selection and promo code support
- **Bakong KHQR payment** — scan QR code or open deeplink in banking app
- Order history and tracking
- Account management (profile, addresses, password, theme)
- Responsive design with light/dark mode

### Admin Dashboard

- Analytics dashboard with revenue, orders, AOV, and customer metrics
- Charts for revenue trends, order status distribution, and payment status
- Top-selling products and low stock alerts
- Full product CRUD with variant management (color x size matrix)
- Product image upload and ordering
- Collection management with product assignment and display ordering
- Order management with status workflow (Pending → Confirmed → Shipped → Delivered)
- Coupon / promo code management with usage limits and validity dates
- Hero banner management for homepage promotions
- User management with role-based access (admin / customer)
- Bulk actions (select all, bulk delete)

---

## Tech Stack

| Technology | Purpose | Version |
|---|---|---|
| [Next.js](https://nextjs.org) | React framework (App Router) | 16.0.10 |
| [React](https://react.dev) | UI library | 19.2.0 |
| [Supabase](https://supabase.com) | Database, Auth, Storage | 2.56.0 |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS | 4.x |
| [Zustand](https://zustand.docs.pmnd.rs) | Client state management | 5.0.8 |
| [Radix UI](https://radix-ui.com) / shadcn/ui | Accessible UI primitives | — |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Forms and validation | 7.66.0 / 4.1.12 |
| [Recharts](https://recharts.org) | Dashboard charts | 2.15.4 |
| [Bakong KHQR](https://bakong.nbc.org.kh) | Cambodia national QR payments | 1.0.7 |
| [Framer Motion](https://motion.dev) | Animations | 12.23.24 |
| [Embla Carousel](https://www.embla-carousel.com) | Image carousels | 8.6.0 |
| [date-fns](https://date-fns.org) | Date utilities (Asia/Phnom_Penh TZ) | 4.1.0 |
| [Hono](https://hono.dev) | KHQR proxy server | — |

---

## Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│  Client (Browser)                                   │
│  ┌───────────────┐  ┌────────────────────────────┐  │
│  │ React Components │  │ Zustand Stores (Cart, Auth) │  │
│  └───────┬───────┘  └────────────┬───────────────┘  │
└──────────┼───────────────────────┼──────────────────┘
           │                       │
           ▼                       ▼
┌─────────────────────────────────────────────────────┐
│  Server Actions  (server/actions/*.js)               │
│  "use server" — validation, auth checks, business    │
│  logic                                               │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Data Access Layer  (lib/data/*.js)                  │
│  Reusable query functions, RLS-aware                 │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Storage)              │
│  Row-Level Security on all customer-facing tables    │
└─────────────────────────────────────────────────────┘
```

### Payment Flow

```
Customer clicks "Pay"
        │
        ▼
createOrderAndInitiatePaymentAction()
        │
        ▼
Generate KHQR string (bakong-khqr library)
        │
        ▼
Display QR code + deeplink to customer
        │
        ▼
Customer scans QR / opens banking app deeplink
        │
        ▼
Poll checkPaymentStatus() every 3-5 seconds
        │    (via KHQR Proxy → Bakong API)
        ▼
Payment confirmed → Order status → CONFIRMED
```

---

## Screenshots

> **Note:** Add your own screenshots to the `docs/screenshots/` directory and update the paths below.

| | | |
|:---:|:---:|:---:|
| ![Homepage](docs/screenshots/customer/homepage.png) | ![Products](docs/screenshots/customer/products.png) | ![Product Detail](docs/screenshots/customer/product-detail.png) |
| Homepage | Product Listing | Product Detail |
| ![Cart](docs/screenshots/customer/cart.png) | ![Checkout](docs/screenshots/customer/checkout.png) | ![Payment QR](docs/screenshots/customer/payment-qr.png) |
| Shopping Cart | Checkout | KHQR Payment |
| ![Dashboard](docs/screenshots/admin/dashboard.png) | ![Admin Products](docs/screenshots/admin/products.png) | ![Admin Orders](docs/screenshots/admin/orders.png) |
| Admin Dashboard | Product Management | Order Management |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com))
- A **Supabase** project ([create one](https://supabase.com/dashboard))
- *(Optional)* A Bakong merchant account for payment integration

### Installation

```bash
# Clone the repository
git clone https://github.com/BothSann/kdmv.git
cd kdmv

# Install dependencies
npm install
```

### Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xxx.supabase.co`) | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (safe for client) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `NEXT_PUBLIC_BASE_URL` | App base URL (`http://localhost:3000` for dev) | Yes |
| `BAKONG_API_URL` | Bakong API endpoint (`https://api-bakong.nbc.gov.kh`) | For payments |
| `BAKONG_ACCESS_TOKEN` | Bakong merchant JWT (expires periodically) | For payments |
| `NEXT_PUBLIC_KHQR_PROXY_URL` | KHQR proxy server URL (Cambodia-based) | For payments |
| `KHQR_PROXY_API_KEY` | KHQR proxy authentication key | For payments |

> **Warning:** Never commit `.env.local` to version control. The `SUPABASE_SERVICE_ROLE_KEY` has full database access and must remain secret.

### Database Setup

1. Create a new Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Run the schema from [`supabase-schema.sql`](supabase-schema.sql) in the Supabase SQL Editor
3. Create the following **Storage buckets** in your Supabase dashboard:
   - `product-images`
   - `clothes-images`
   - `avatars`
   - `collection-images`
   - `hero-banner-images`
4. Configure Row-Level Security (RLS) policies as needed

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server uses **Turbopack** for fast refresh.

### Production Build

```bash
# Build and start separately
npm run build
npm start

# Or combined
npm run prod
```

---

## Project Structure

```
kdmv/
├── app/                          # Next.js App Router
│   ├── (admin)/admin/            # Admin dashboard pages
│   ├── (auth)/auth/              # Authentication pages
│   ├── (customer)/               # Customer-facing pages
│   │   ├── account/              # Profile, orders, addresses
│   │   ├── checkouts/            # Checkout and payment
│   │   ├── collections/          # Browse collections
│   │   ├── products/             # Product listing and details
│   │   └── search/               # Search results
│   ├── (index)/                  # Public pages (homepage)
│   └── api/                      # API routes
├── components/
│   ├── ui/                       # shadcn/ui primitives (30+ components)
│   ├── admin/                    # Admin-specific components
│   ├── product/                  # Product display components
│   ├── checkouts/                # Checkout flow components
│   └── ...                       # Other domain components
├── server/
│   ├── actions/                  # Server Actions (auth, product, order, etc.)
│   └── services/                 # Business logic services
├── lib/
│   ├── data/                     # Data access layer (Supabase queries)
│   │   └── products/             # Product-specific queries
│   ├── validations/              # Zod schemas
│   ├── config.js                 # App configuration
│   ├── constants.js              # Constants (pagination, provinces)
│   ├── routes-config.js          # Route access control
│   └── bakong-khqr.js            # KHQR payment utilities
├── store/                        # Zustand stores
│   ├── useAuthStore.js           # Auth state and user profile
│   ├── useCartStore.js           # Cart with optimistic updates
│   └── useUIStore.js             # UI state (theme, modals)
├── utils/supabase/               # Supabase client instances
│   ├── client.js                 # Client-side (anon key, RLS)
│   ├── server.js                 # Server-side (cookie sessions)
│   └── supabaseAdmin.js          # Admin (service role, bypasses RLS)
├── hooks/                        # Custom React hooks
├── context/                      # React context providers
├── khqr-proxy/                   # Standalone KHQR proxy (Hono.js + Docker)
├── public/                       # Static assets
├── supabase-schema.sql           # Database schema reference
└── .env.example                  # Environment variable template
```

---

## Database Schema

The PostgreSQL database (hosted on Supabase) contains the following tables:

### User & Authentication

| Table | Description |
|---|---|
| `profiles` | Extended user info — name, role (admin/customer), phone, province, avatar |

### Product Catalog

| Table | Description |
|---|---|
| `products` | Product records — name, code, price, discount, type, gender |
| `product_variants` | Color x size inventory matrix with SKU and quantity |
| `product_images` | Product image URLs with display ordering |
| `colors` | Color options (name, hex code) |
| `sizes` | Size options (e.g., S, M, L, XL) |
| `product_types` | Product categories (e.g., T-Shirt, Hoodie) |
| `genders` | Gender categories for filtering |

### Collections & Promotions

| Table | Description |
|---|---|
| `collections` | Curated product groups with banner images |
| `collection_products` | Products assigned to collections with display order |
| `promo_codes` | Discount coupons with usage limits and validity dates |
| `promo_code_usage` | Tracks which customers have used which promo codes |
| `hero_banners` | Homepage promotional banners |

### Shopping & Orders

| Table | Description |
|---|---|
| `shopping_cart` | Customer cart items (linked to product variants) |
| `orders` | Order records — status, totals, shipping address, promo code |
| `order_items` | Individual items within an order |
| `order_status_history` | Audit trail of order status changes |
| `payment_transactions` | Bakong KHQR payment records — QR string, hash, status |

### Customer Data

| Table | Description |
|---|---|
| `customer_addresses` | Saved shipping/billing addresses |
| `wishlist` | Customer product favorites |

All customer-facing tables have **Row-Level Security (RLS)** enabled. Customers can only access their own data; admin users have full access via the service role client.

---

## Payment Integration (Bakong KHQR)

### What is Bakong KHQR?

**Bakong** is Cambodia's national payment system, operated by the National Bank of Cambodia (NBC). **KHQR** (Khmer QR) is the standardized QR code format used across all Cambodian banks. Any customer with a Bakong-compatible banking app can pay by scanning a KHQR code.

### How It Works in KDMV

1. **Order creation** — customer completes checkout, a KHQR string is generated with the order amount
2. **QR display** — the styled QR code and a banking app deeplink are shown to the customer
3. **Payment** — customer scans the QR with their banking app or taps the deeplink
4. **Verification** — the server polls the Bakong API (via KHQR Proxy) every 3-5 seconds using an MD5 transaction hash
5. **Confirmation** — on successful payment, the order status is updated to CONFIRMED

### KHQR Proxy Server

The Bakong API is only accessible from within Cambodia. The KHQR Proxy (located in `khqr-proxy/`) is a lightweight **Hono.js** server deployed on a Cambodia-based server that relays requests to the Bakong API.

```bash
# Start the proxy server
cd khqr-proxy
docker-compose up
```

**Proxy endpoints:**
- `POST /bakong/v1/generate_deeplink_by_qr` — Generate a banking app deeplink from a KHQR string
- `POST /bakong/v1/check_transaction_by_md5` — Verify payment status by MD5 hash

### Key Files

- [`lib/bakong-khqr.js`](lib/bakong-khqr.js) — KHQR utilities (generate, verify, decode)
- [`server/actions/payment-action.js`](server/actions/payment-action.js) — Payment processing server actions
- [`khqr-proxy/src/index.ts`](khqr-proxy/src/index.ts) — Proxy server source
- [`khqr-proxy/docker-compose.yml`](khqr-proxy/docker-compose.yml) — Docker deployment config

---

## User Guides

Detailed step-by-step guides with screenshot placeholders are available in the `docs/` directory:

- **[Customer User Guide](docs/CUSTOMER-GUIDE.md)** — How to browse, shop, pay, and manage your account
- **[Admin User Guide](docs/ADMIN-GUIDE.md)** — How to manage products, orders, collections, coupons, banners, and users

---

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run prod` | Build and start production (combined) |
| `npm run lint` | Run ESLint |

---

## Author

**Thann Sopheakboth**

- GitHub: [@BothSann](https://github.com/BothSann)

Built as an exit exam / graduation project.

---

## License

This project is for educational purposes. All rights reserved.
