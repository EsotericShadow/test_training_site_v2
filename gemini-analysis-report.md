# Gemini Analysis Report - karma-training-website (v0.1.0)

This report details findings regarding API redundancies, middleware issues, and instructions for removing Turbopack in the `karma-training-website` Next.js application.

## API Redundancies

The project exhibits redundancy in API endpoints, particularly between public-facing routes and their administrative (`adm_f7f8556683f1cdc65391d8d2_8e91` prefixed) counterparts. While some duplication is expected for public read access versus admin read/write access, there are opportunities for consolidation and clearer separation of concerns.

-   **Endpoints:** `src/app/api/team-members/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/route.js`
    -   **Overlap:** Both provide `GET` access to team members. The admin version also includes `POST` for creation. The public `POST` in `src/app/api/team-members/route.js` is secured, making it redundant with the admin `POST`.
    -   **Recommendation:**
        -   Retain `src/app/api/team-members/route.js` for public `GET` access.
        -   Consolidate all `POST`, `PUT`, `DELETE` operations for team members under `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/route.js` (and `[id]/route.js`).
        -   Remove the `POST` export from `src/app/api/team-members/route.js`.

-   **Endpoints:** `src/app/api/hero-section/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/route.js`
    -   **Overlap:** Both provide `GET` access to hero section data. `src/app/api/hero-section/route.js` also contains an insecure `PUT` and `DELETE` method that attempts to perform admin-level operations without proper `withSecureAuth` wrapping, making them vulnerable. The admin version correctly uses `withSecureAuth` for `GET` and `PUT`.
    -   **Recommendation:**
        -   Retain `src/app/api/hero-section/route.js` for public `GET` access.
        -   Remove the `PUT` and `DELETE` exports from `src/app/api/hero-section/route.js`.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for the hero section should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/route.js` and be secured with `withSecureAuth`.

-   **Endpoints:** `src/app/api/footer/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer/route.js`
    -   **Overlap:** Both provide `GET` access to footer data. The admin version also includes `PUT` for updates.
    -   **Recommendation:**
        -   Retain `src/app/api/footer/route.js` for public `GET` access.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for the footer should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer/route.js` and be secured with `withSecureAuth`.

-   **Endpoints:** `src/app/api/courses/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js`
    -   **Overlap:** Both provide `GET` access to all courses and `POST` for creating new courses. The public `POST` in `src/app/api/courses/route.js` is not secured, posing a security risk.
    -   **Recommendation:**
        -   Retain `src/app/api/courses/route.js` for public `GET` access to all courses.
        -   Remove the `POST` export from `src/app/api/courses/route.js`.
        -   All `POST` operations for courses should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js` and be secured with `withSecureAuth`.

-   **Endpoints:** `src/app/api/courses/[slug]/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]/route.js`
    -   **Overlap:** Both provide `GET`, `PUT`, and `DELETE` operations for individual courses. The public `[slug]` routes are not secured, allowing unauthorized modifications and deletions. The admin `[id]` routes are correctly secured.
    -   **Recommendation:**
        -   Retain `src/app/api/courses/[slug]/route.js` for public `GET` access to individual courses by slug.
        -   Remove the `PUT` and `DELETE` exports from `src/app/api/courses/[slug]/route.js`.
        -   All `PUT` and `DELETE` operations for individual courses should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]/route.js` and be secured with `withSecureAuth`.

-   **Endpoints:** `src/app/api/company-info/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info/route.js`
    -   **Overlap:** Both provide `GET` access to company information. The admin version also includes `PUT` for updates.
    -   **Recommendation:**
        -   Retain `src/app/api/company-info/route.js` for public `GET` access.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for company info should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info/route.js` and be secured with `withSecureAuth`.

## Middleware Issues

The `middleware.ts` file plays a crucial role in security and request handling. Several areas can be improved for robustness and consistency.

-   **Issue:** Missing `JWT_SECRET` environment variable. The `lib/secure-jwt.js` module explicitly throws an error if `process.env.JWT_SECRET` is not set or is less than 32 characters long. This is a critical security dependency.
    -   **Evidence:** `lib/secure-jwt.js` line 5: `if (!JWT_SECRET || JWT_SECRET.length < 32) { throw new Error('JWT_SECRET must be set and at least 32 characters long'); }`
    -   **Recommendation:** Ensure `JWT_SECRET` is properly configured in the deployment environment. For local development, create a `.env.local` file in the project root with `JWT_SECRET=your_long_and_random_secret_key_here`. It is also highly recommended to create a `.env.example` file (if not already present) to guide developers on required environment variables.

-   **Issue:** Inconsistent session validation logic between `middleware.ts` and `secure-jwt.js`/`session-manager.js`. `middleware.ts` calls `validateSession`, which in turn calls `verifySecureToken`. Both `secure-jwt.js` and `middleware.ts` perform checks for token validity, expiration, and security violations (IP/device fingerprint mismatch). This creates a slight redundancy and could lead to confusion if logic diverges.
    -   **Evidence:** `middleware.ts` lines 35-36: `const sessionResult = await validateSession(token, request) as SessionValidationResult;` and `lib/secure-jwt.js` lines 140-141: `const tokenResult = await verifySecureToken(token, request);`
    -   **Recommendation:** Centralize the primary session validation and security checks within `lib/session-manager.js` and `lib/secure-jwt.js`. `middleware.ts` should primarily act as an orchestrator, calling the session manager and handling redirects based on its comprehensive validation result. The `middleware.ts` can then rely on the `sessionResult.valid` and `sessionResult.reason` for its logic, rather than duplicating checks.

-   **Issue:** `middleware.ts` uses `console.warn` and `console.error` for logging, which might not be ideal for production environments where structured logging or integration with a dedicated logging service (like the one in `lib/logger.js`) is preferred.
    -   **Evidence:** `middleware.ts` lines 30, 39, 60.
    -   **Recommendation:** Replace `console.warn` and `console.error` with calls to `logger.warn` and `logger.error` from `lib/logger.js` for consistent and potentially more robust logging.

-   **Issue:** The `middleware.ts` `config.matcher` array has a potential redundancy or conflict: `'(.*)'` matches all paths, and `'/((?!_next/static|_next/image|favicon.ico|api).*)'` attempts to exclude certain paths. The order and combination might lead to unexpected behavior or unnecessary processing for excluded paths.
    -   **Evidence:** `middleware.ts` lines 90-94.
    -   **Recommendation:** Simplify the `matcher` to be more explicit and avoid overlapping patterns. If the intent is to apply HTTPS enforcement and security headers to all paths *except* the specified exclusions, the second pattern is sufficient and more precise.

## Remove Turbopack and Configure Webpack

The project is currently configured to use Turbopack for development. To remove Turbopack and revert to Webpack (Next.js's default bundler), follow these steps:

1.  **Update `package.json`:**
    Modify the `dev` script to remove the `--turbopack` flag.

    ```json
    {
      "name": "karma-training-website",
      "version": "0.1.0",
      "private": true,
      "type": "module",
      "scripts": {
        "dev": "next dev -H 0.0.0.0",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "lint:fix": "next lint --fix",
        "db:init": "node database-init.js",
        "type-check": "tsc --noEmit",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:e2e": "playwright test",
        "analyze": "cross-env ANALYZE=true next build"
      },
      "dependencies": {
        "@google-analytics/data": "^5.1.0",
        "@heroicons/react": "^2.2.0",
        "@hookform/resolvers": "^5.0.1",
        "@radix-ui/react-dialog": "^1.1.14",
        "@radix-ui/react-dropdown-menu": "^2.1.15",
        "@sendgrid/mail": "^8.1.5",
        "@tailwindcss/postcss": "^4.1.8",
        "@vercel/analytics": "^1.5.0",
        "@vercel/blob": "^1.1.1",
        "@vercel/postgres": "^0.10.0",
        "@vercel/speed-insights": "^1.2.0",
        "bcryptjs": "^3.0.2",
        "clsx": "^2.1.1",
        "critters": "^0.0.23",
        "dompurify": "^3.2.6",
        "dotenv": "^16.5.0",
        "formidable": "^3.5.4",
        "gtag": "^1.0.1",
        "isomorphic-dompurify": "^2.25.0",
        "jsdom": "^26.1.0",
        "jsonwebtoken": "^9.0.2",
        "limiter": "^3.0.0",
        "lucide-react": "^0.511.0",
        "multer": "^2.0.1",
        "next": "15.3.3",
        "next-seo": "^6.8.0",
        "next-sitemap": "^4.2.3",
        "nodemailer": "^7.0.3",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-hook-form": "^7.57.0",
        "react-markdown": "^10.1.0",
        "react-parallax": "^3.5.2",
        "react-scroll-parallax": "^3.4.5",
        "remark-gfm": "^4.0.1",
        "sanitize-html": "^2.17.0",
        "tailwind-merge": "^3.3.0",
        "validator": "^13.15.15",
        "zod": "^3.25.56"
      },
      "devDependencies": {
        "@eslint/eslintrc": "^3",
        "@types/dompurify": "^3.0.5",
        "@types/jsonwebtoken": "^9.0.9",
        "@types/node": "^20.17.57",
        "@types/nodemailer": "^6.4.17",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@types/validator": "^13.15.1",
        "autoprefixer": "^10.4.21",
        "eslint": "^9",
        "eslint-config-next": "15.3.3",
        "postcss": "^8.5.4",
        "tailwindcss": "^4.1.8",
        "typescript": "^5"
      }
    }
    ```

2.  **Update `next.config.ts`:**
    Remove the `turbopack: {},` entry from the `nextConfig` object.

    ```typescript
    import type { NextConfig } from "next";

    const nextConfig: NextConfig = {
      // Performance optimizations
      experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
      },
      
      // Image optimization
      images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '192.168.1.222', // Your IP address
            port: '3000',
            pathname: '/**',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '3000',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: '*.vercel.app',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: '*.vercel-storage.com',
            pathname: '/**',
          },
          // Additional patterns for common image sources
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'cdn.pixabay.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'via.placeholder.com',
            pathname: '/**',
          },
        ],
      },
      
      // Enhanced Security headers
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              // HTTP Strict Transport Security (HSTS)
              // Tells browsers to always use HTTPS for this domain
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
              // Prevent clickjacking attacks
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              // Prevent MIME type sniffing
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              // Help prevent XSS attacks
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
              },
              // Control referrer information
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin',
              },
              // Restrict browser features
              {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
              },
              // Enhanced Content Security Policy - FIXED for Analytics
              {
                key: 'Content-Security-Policy',
                value: [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: http://192.168.1.222:3000 https://*.vercel.app https://*.vercel-storage.com https://images.unsplash.com https://cdn.pixabay.com https://via.placeholder.com",
                  "font-src 'self'",
                  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://vitals.vercel-insights.com",
                  "media-src 'self'",
                  "object-src 'none'",
                  "frame-ancestors 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "upgrade-insecure-requests",
                ].join('; '),
              },
            ],
          },
          // Add specific headers for API routes if needed
          {
            source: '/api/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-store, max-age=0',
              },
            ],
          },
        ];
      },
      
      // Compression and caching
      compress: true,
      poweredByHeader: false,
      
      // Optional: Configure trailing slash behavior
      trailingSlash: false,
      
      // Optional: Configure redirects if needed
      async redirects() {
        return [];
      },
      
      // Optional: Configure rewrites if needed
      async rewrites() {
        return [];
      },
    };

    export default nextConfig;
    ```

3.  **Run `npm install` (or `pnpm install` if used) to update dependencies.**
    ```bash
    npm install
    # or if using pnpm
    pnpm install
    ```

4.  **Test with `npm run dev` to confirm Webpack usage.**
    ```bash
    npm run dev
    ```
    You should no longer see messages related to Turbopack in the console output when starting the development server.
