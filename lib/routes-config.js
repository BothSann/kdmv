/**
 * Route Access Configuration
 * Defines which routes require authentication and authorization
 */

// Public routes - accessible by everyone (guest, customer, admin)
export const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/products/[id]", // Dynamic route pattern
  "/collections",
  "/collections/[slug]",
];

// Auth routes - only for unauthenticated users
export const AUTH_ROUTES = ["/auth/login", "/auth/register"];

// Special auth routes - accessible by anyone (for email confirmation)
export const PUBLIC_AUTH_ROUTES = ["/auth/confirm"];

// Customer routes - require authentication (any authenticated user)
export const CUSTOMER_ROUTES = [
  "/account",
  "/account/profile",
  "/account/orders",
  "/account/orders/[id]",
  "/account/address",
  "/account/address/create",
  "/account/address/[id]/edit",
  "/account/settings",
  "/checkouts",
  "/checkouts/success/[id]",
];

// Admin routes - require admin role (checked in layout)
export const ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/products",
  "/admin/products/create",
  "/admin/products/[id]",
  "/admin/products/[id]/edit",
  "/admin/orders",
  "/admin/orders/[id]",
  "/admin/collections",
  "/admin/collections/create",
  "/admin/collections/[id]",
  "/admin/collections/[id]/edit",
  "/admin/coupons",
  "/admin/coupons/create",
  "/admin/coupons/[id]",
  "/admin/coupons/[id]/edit",
  "/admin/users",
  "/admin/users/create",
  "/admin/account",
  "/admin/account/profile",
  "/admin/account/password",
  "/admin/account/appearance",
  "/admin/settings",
];

// Error pages - accessible by everyone
export const ERROR_ROUTES = ["/error", "/unauthorized", "/not-found"];

/**
 * Check if a path matches a route pattern
 * Handles dynamic routes like /products/[id]
 */
export function matchesRoute(pathname, routePattern) {
  // Direct match
  if (pathname === routePattern) return true;

  // Convert route pattern to regex
  // /products/[id] → /^\/products\/[^/]+$/
  // /products/[id]/edit → /^\/products\/[^/]+\/edit$/
  const pattern = routePattern
    .replace(/\[([^\]]+)\]/g, "[^/]+") // Replace [id] with regex
    .replace(/\//g, "\\/"); // Escape slashes

  const regex = new RegExp(`^${pattern}$`);
  return regex.test(pathname);
}

/**
 * Determine if pathname is public
 */
export function isPublicRoute(pathname) {
  return (
    PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    PUBLIC_AUTH_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    ERROR_ROUTES.some((route) => matchesRoute(pathname, route))
  );
}

/**
 * Determine if pathname is an auth route
 */
export function isAuthRoute(pathname) {
  return AUTH_ROUTES.some((route) => matchesRoute(pathname, route));
}

/**
 * Determine if pathname requires authentication
 */
export function requiresAuth(pathname) {
  return (
    CUSTOMER_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    ADMIN_ROUTES.some((route) => matchesRoute(pathname, route))
  );
}

/**
 * Determine if pathname is an admin route
 */
export function isAdminRoute(pathname) {
  return ADMIN_ROUTES.some((route) => matchesRoute(pathname, route));
}
