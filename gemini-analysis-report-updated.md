# Gemini Analysis Report - karma-training-website (v0.1.0)

This report details findings regarding API redundancies, middleware issues, and instructions for removing Turbopack in the `karma-training-website` Next.js application.

## API Redundancies

The project exhibits redundancy in API endpoints, particularly between public-facing routes and their administrative (`adm_f7f8556683f1cdc65391d8d2_8e91` prefixed) counterparts. While some duplication is expected for public read access versus admin read/write access, there are opportunities for consolidation and clearer separation of concerns.

-   **Endpoints:** `src/app/api/team-members/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/route.js`
    -   **Overlap:** Both provide `GET` access to team members. The admin version also includes `POST` for creation. The public `POST` in `src/app/api/team-members/route.js` is secured, making it redundant with the admin `POST`.
    -   **Validation:** Confirmed. The public `POST` is secured, but it's still redundant as the admin path exists for this purpose. Consolidating write operations under the admin path is a good security practice.
    -   **Recommendation:**
        -   Retain `src/app/api/team-members/route.js` for public `GET` access.
        -   Consolidate all `POST`, `PUT`, `DELETE` operations for team members under `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/route.js` (and `[id]/route.js`).
        -   Remove the `POST` export from `src/app/api/team-members/route.js`.
        ```typescript
        // src/app/api/team-members/route.js
        import { NextResponse } from 'next/server';
        import { teamMembersOps } from '../../../../lib/database';

        // GET - Get all team members (PUBLIC ACCESS for homepage)
        export async function GET() {
          try {
            const teamMembers = await teamMembersOps.getAll();
            return NextResponse.json(teamMembers);
          } catch (error) {
            console.error('Error fetching team members:', error);
            return NextResponse.json(
              { error: 'Failed to fetch team members' },
              { status: 500 }
            );
          }
        }

        // Remove the POST export:
        // export const POST = withSecureAuth(createTeamMember);
        ```

-   **Endpoints:** `src/app/api/hero-section/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/route.js`
    -   **Overlap:** Both provide `GET` access to hero section data. `src/app/api/hero-section/route.js` also contains an insecure `PUT` and `DELETE` method that attempts to perform admin-level operations without proper `withSecureAuth` wrapping, making them vulnerable. The admin version correctly uses `withSecureAuth` for `GET` and `PUT`.
    -   **Validation:** Confirmed. The previous analysis was accurate regarding the insecurity of `PUT` and `DELETE` in the public route. The `withSecureAuth` wrapper is crucial for consistent security.
    -   **Recommendation:**
        -   Retain `src/app/api/hero-section/route.js` for public `GET` access.
        -   Remove the `PUT` and `DELETE` exports from `src/app/api/hero-section/route.js`.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for the hero section should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/route.js` and be secured with `withSecureAuth`.
        ```typescript
        // src/app/api/hero-section/route.js
        import { NextResponse } from 'next/server';
        import { heroSectionOps, heroStatsOps, heroFeaturesOps } from '../../../../lib/database'; // Removed adminSessionsOps as it's not needed for public GET

        // GET - Public access to hero section data
        export async function GET() {
          try {
            const heroSection = await heroSectionOps.get();
            const heroStats = await heroStatsOps.getAll();
            const heroFeatures = await heroFeaturesOps.getAll();

            return NextResponse.json({
              heroSection,
              heroStats,
              heroFeatures
            });
          } catch (error) {
            console.error('Error fetching hero section:', error);
            return NextResponse.json(
              { error: 'Failed to fetch hero section data' },
              { status: 500 }
            );
          }
        }

        // Remove the PUT and DELETE exports:
        // export async function PUT(request) { ... }
        // export async function DELETE(request) { ... }
        ```

-   **Endpoints:** `src/app/api/footer/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer/route.js`
    -   **Overlap:** Both provide `GET` access to footer data. The admin version also includes `PUT` for updates.
    -   **Validation:** Confirmed. The previous analysis was accurate.
    -   **Recommendation:**
        -   Retain `src/app/api/footer/route.js` for public `GET` access.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for the footer should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer/route.js` and be secured with `withSecureAuth`.

-   **Endpoints:** `src/app/api/courses/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js`
    -   **Overlap:** Both provide `GET` access to all courses and `POST` for creating new courses. The public `POST` in `src/app/api/courses/route.js` is not secured, posing a security risk.
    -   **Validation:** Confirmed. The public `POST` is indeed insecure.
    -   **Recommendation:**
        -   Retain `src/app/api/courses/route.js` for public `GET` access to all courses.
        -   Remove the `POST` export from `src/app/api/courses/route.js`.
        -   All `POST` operations for courses should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js` and be secured with `withSecureAuth`.
        ```typescript
        // src/app/api/courses/route.js
        import { NextResponse } from 'next/server';
        import { coursesOps, courseFeaturesOps, courseCategoriesOps } from '../../../../lib/database';

        export async function GET() {
          try {
            const courses = await coursesOps.getAll();
            const courseCategories = await courseCategoriesOps.getAll();

            const enrichedCourses = await Promise.all(courses.map(async (course) => {
              const features = await courseFeaturesOps.getByCourseId(course.id);
              return {
                ...course,
                features: features.map((feature) => ({
                  feature: feature.feature,
                  display_order: feature.display_order
                })).sort((a, b) => a.display_order - b.display_order),
                category: courseCategories.find((cat) => cat.id === course.category_id) || { name: 'Uncategorized' }
              };
            }));

            return NextResponse.json(enrichedCourses);
          } catch (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json([], { status: 500 });
          }
        }

        // Remove the POST export:
        // export async function POST(request) { ... }
        ```

-   **Endpoints:** `src/app/api/courses/[slug]/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]/route.js`
    -   **Overlap:** Both provide `GET`, `PUT`, and `DELETE` operations for individual courses. The public `[slug]` routes are not secured, allowing unauthorized modifications and deletions. The admin `[id]` routes are correctly secured.
    -   **Validation:** Confirmed. The public `PUT` and `DELETE` are indeed insecure.
    -   **Recommendation:**
        -   Retain `src/app/api/courses/[slug]/route.js` for public `GET` access to individual courses by slug.
        -   Remove the `PUT` and `DELETE` exports from `src/app/api/courses/[slug]/route.js`.
        -   All `PUT` and `DELETE` operations for individual courses should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]/route.js` and be secured with `withSecureAuth`.
        ```typescript
        // src/app/api/courses/[slug]/route.js
        import { NextResponse } from 'next/server';
        import { coursesOps, courseFeaturesOps, courseCategoriesOps } from '../../../../../lib/database';

        export async function GET(request, { params }) {
          const { slug } = params;

          try {
            const course = await coursesOps.getBySlug(slug);

            if (!course) {
              return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }

            const features = await courseFeaturesOps.getByCourseId(course.id);
            const category = await courseCategoriesOps.getById(course.category_id);

            const enrichedCourse = {
              ...course,
              features: features.map((feature) => ({
                feature: feature.feature,
                display_order: feature.display_order
              })).sort((a, b) => a.display_order - b.display_order),
              category: category || { name: 'Uncategorized' }
            };

            return NextResponse.json(enrichedCourse);
          } catch (error) {
            console.error(`Error fetching course with slug ${slug}:`, error);
            return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
          }
        }

        // Remove the PUT and DELETE exports:
        // export async function PUT(request, { params }) { ... }
        // export async function DELETE(request, { params }) { ... }
        ```

-   **Endpoints:** `src/app/api/company-info/route.js` and `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info/route.js`
    -   **Overlap:** Both provide `GET` access to company information. The admin version also includes `PUT` for updates.
    -   **Validation:** Confirmed. The previous analysis was accurate.
    -   **Recommendation:**
        -   Retain `src/app/api/company-info/route.js` for public `GET` access.
        -   All `PUT` (and any future `POST`/`DELETE`) operations for company info should exclusively reside in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info/route.js` and be secured with `withSecureAuth`.

## Middleware Issues

The `middleware.ts` file plays a crucial role in security and request handling. Several areas can be improved for robustness and consistency.

-   **Issue:** Missing `JWT_SECRET` environment variable.
    -   **Evidence:** `lib/secure-jwt.js` line 5: `if (!JWT_SECRET || JWT_SECRET.length < 32) { throw new Error('JWT_SECRET must be set and at least 32 characters long'); }`
    -   **Validation:** Confirmed. The `lib/secure-jwt.js` code explicitly checks for `JWT_SECRET` and throws an error if it's missing or too short. The `.env*` files are git-ignored, and no `.env.example` was found in the initial directory listing.
    -   **Recommendation:** Ensure `JWT_SECRET` is properly configured in the deployment environment. For local development, create a `.env.local` file in the project root with `JWT_SECRET=your_long_and_random_secret_key_here`. It is also highly recommended to create a `.env.example` file (if not already present) to guide developers on required environment variables. Additionally, consider using `zod` for environment variable validation:
        ```typescript
        // Example: config/env.ts
        import { z } from 'zod';

        const envSchema = z.object({
          JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
          // Add other environment variables here, e.g., DATABASE_URL
        });

        export const env = envSchema.parse(process.env);
        ```
        Then, in `lib/secure-jwt.js`, import `env` and use `env.JWT_SECRET`.

-   **Issue:** Inconsistent session validation logic.
    -   **Evidence:** `middleware.ts` lines 35-36: `const sessionResult = await validateSession(token, request) as SessionValidationResult;` and `lib/secure-jwt.js` lines 140-141: `const tokenResult = await verifySecureToken(token, request);`
    -   **Validation:** Confirmed. There's a clear overlap in validation logic between `middleware.ts`, `lib/session-manager.js`, and `lib/secure-jwt.js`.
    -   **Recommendation:** Centralize the primary session validation and security checks within `lib/session-manager.js` and `lib/secure-jwt.js`. `middleware.ts` should primarily act as an orchestrator, calling the session manager and handling redirects based on its comprehensive validation result. The `middleware.ts` can then rely on the `sessionResult.valid` and `sessionResult.reason` for its logic, rather than duplicating checks. Here's a refined `middleware.ts` snippet:
        ```typescript
        // src/middleware.ts
        import { NextRequest, NextResponse } from 'next/server';
        import { validateSession } from './lib/session-manager';
        import { logger } from './lib/logger';

        // Type definition for enhanced session validation result
        interface SessionValidationResult {
          valid: boolean;
          reason?: string;
          session?: any;
          needsRenewal?: boolean;
          timeLeft?: number;
          securityLevel?: string;
        }

        export async function middleware(request: NextRequest) {
          const url = request.nextUrl.clone();
          const isAdminPath = url.pathname.startsWith('/adm_f7f8556683f1cdc65391d8d2_8e91');

          // HTTPS Enforcement - Redirect HTTP to HTTPS in production
          if (process.env.NODE_ENV === 'production' &&
              url.protocol === 'http:' &&
              !url.hostname.includes('localhost')) {
            url.protocol = 'https:';
            return NextResponse.redirect(url);
          }

          // Only check admin paths for authentication
          if (isAdminPath) {
            const ip = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

            const token = request.cookies.get('admin_token')?.value;

            if (!token) {
              logger.warn(`Middleware: No admin token found for ${url.pathname} from IP ${ip}`);
              return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
            }

            try {
              const sessionResult = await validateSession(token, request) as SessionValidationResult;

              if (!sessionResult.valid) {
                logger.warn(`Middleware: Session validation failed for ${url.pathname} from IP ${ip}: ${sessionResult.reason}`);
                const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
                response.cookies.delete('admin_token');
                return response;
              }

              logger.info(`Middleware: Session valid for ${url.pathname} from IP ${ip} (${sessionResult.securityLevel || 'unknown'} security)`);

              const response = NextResponse.next();

              // Add security headers for admin paths
              response.headers.set('X-Frame-Options', 'DENY');
              response.headers.set('X-Content-Type-Options', 'nosniff');
              response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
              response.headers.set('X-XSS-Protection', '1; mode=block');

              // Add CSP header for admin paths
              response.headers.set(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
              );

              if (sessionResult.needsRenewal) {
                response.headers.set('X-Session-Renewal-Needed', 'true');
                response.headers.set('X-Session-Time-Left', sessionResult.timeLeft?.toString() || '0');
              }

              return response;
            } catch (error) {
              logger.error(`Middleware: Session validation error for ${url.pathname} from IP ${ip}:`, error);
              const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
              response.cookies.delete('admin_token');
              return response;
            }
          }

          // For non-admin paths, add basic security headers
          const response = NextResponse.next();
          response.headers.set('X-Content-Type-Options', 'nosniff');
          response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          response.headers.set('X-XSS-Protection', '1; mode=block');

          return response;
        }

        export const config = {
          matcher: [
            // Match all paths except static files and API routes that need different headers
            '/((?!_next/static|_next/image|favicon.ico|api).*)',
          ],
        };
        ```

-   **Issue:** `middleware.ts` uses `console.warn` and `console.error`.
    -   **Evidence:** `middleware.ts` lines 30, 39, 60.
    -   **Validation:** Confirmed.
    -   **Recommendation:** Replace `console.warn` and `console.error` with calls to `logger.warn` and `logger.error` from `lib/logger.js` for consistent and potentially more robust logging. (Already incorporated in the `middleware.ts` snippet above).

-   **Issue:** The `middleware.ts` `config.matcher` array has a potential redundancy or conflict.
    -   **Evidence:** `middleware.ts` lines 90-94.
    -   **Validation:** Confirmed. The `'(.*)'` is redundant if the second, more specific pattern is intended to be the primary matcher.
    -   **Recommendation:** Simplify the `matcher` to be more explicit and avoid overlapping patterns. If the intent is to apply HTTPS enforcement and security headers to all paths *except* the specified exclusions, the second pattern is sufficient and more precise. (Already incorporated in the `middleware.ts` snippet above).

-   **Additional Middleware Issues:**
    -   **CSRF Integration:** `lib/csrf.js` provides `generateToken` and `validateToken`. `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout/route.js` uses `validateToken`. However, other `POST`/`PUT`/`DELETE` admin routes (e.g., for courses, team members, hero section, footer, company info) do not explicitly use CSRF protection.
        -   **Recommendation:** Implement CSRF protection for all `POST`, `PUT`, and `DELETE` routes under `adm_f7f8556683f1cdc65391d8d2_8e91`. This would involve:
            1.  Generating a CSRF token on the client-side when an admin page loads.
            2.  Including the CSRF token in the request headers (e.g., `X-CSRF-Token`) for all `POST`, `PUT`, `DELETE` requests to admin API routes.
            3.  Validating the CSRF token on the server-side in each admin API route handler using `lib/csrf.js`.
            *Example for an admin `POST` route (e.g., `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js` POST):*
            ```typescript
            // In an admin API route (e.g., src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.js POST)
            import { NextResponse } from 'next/server';
            import { withSecureAuth } from '../../../../../lib/secure-jwt';
            import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';
            import { validateToken } from '../../../../../lib/csrf'; // Import validateToken

            async function createCourse(request) {
              const token = request.cookies.get('admin_token')?.value;
              const csrfToken = request.headers.get('x-csrf-token'); // Assuming token is sent in header

              if (!token || !csrfToken || !validateToken(token, csrfToken)) {
                return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
              }

              // ... rest of your createCourse logic
            }

            export const POST = withSecureAuth(createCourse);
            ```
    -   **Rate Limiting Integration:** `lib/rate-limiter.js` provides `applyRateLimit` and `applyProgressiveRateLimit`. `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/login/route.js` correctly uses `applyProgressiveRateLimit`. This is good.
        -   **Recommendation:** Consider applying `applyRateLimit` to other public-facing `POST` routes (e.g., contact form submission) to prevent abuse.

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

4.  **Test with `npm run dev` and `npm run build` to confirm Webpack usage.**
    ```bash
    npm run dev
    npm run build
    npm start
    ```
    You should no longer see messages related to Turbopack in the console output when starting the development server or building the project.

5.  **Optimize Webpack performance:**
    -   **Leverage Next.js Defaults:** Next.js 15.3.3 is highly optimized with Webpack 5. Many common optimizations (like code splitting, tree shaking, minification) are handled by default.
    -   **Bundle Analysis:** Use `npm run analyze` (which leverages `@next/bundle-analyzer`) to visualize bundle size and identify large modules that might need optimization.
    -   **Image Optimization:** The existing `images` configuration in `next.config.ts` is good. Ensure images are properly sized and lazy-loaded in components.
    -   **Font Optimization:** Next.js handles font optimization by default.
    -   **Environment Variables:** Ensure sensitive environment variables are not exposed to the client-side bundle. Next.js automatically handles `NEXT_PUBLIC_` prefix for client-side exposure.

## Additional Findings

-   **Unused Dependencies:**
    -   `critters`: This dependency is typically used for critical CSS extraction, often in conjunction with Webpack. Its direct usage or configuration isn't immediately apparent from the provided context. If not explicitly configured or used, it might be a leftover.
        -   **Recommendation:** Investigate if `critters` is actively used or configured. If not, consider removing it to reduce bundle size and dependencies.
    -   `jsdom`: This is a Node.js implementation of web standards, often used for testing or server-side rendering of DOM. Its presence in `dependencies` rather than `devDependencies` might indicate it's used in a runtime environment, which is unusual for a Next.js frontend.
        -   **Recommendation:** Verify if `jsdom` is genuinely required at runtime. If it's only for testing or build processes, move it to `devDependencies`.

-   **Unoptimized Scripts:**
    -   The various migration and utility scripts (e.g., `database-init.js`, `cleanup-placeholder-files.js`, `clear-duplicate-sessions.mjs`, etc.) should be reviewed for idempotency, comprehensive error handling, and logging. While their functionality is specific, ensuring they can be run multiple times without adverse effects is crucial for maintainability.
        -   **Recommendation:** Review these scripts for idempotency, comprehensive error handling, and logging. Consider adding a dedicated script runner or task management system (e.g., `ts-node` for TypeScript scripts) if the project scales.

-   **Security Headers in `next.config.ts` vs. `middleware.ts`:**
    -   **Observation:** Both `next.config.ts` and `middleware.ts` set security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Content-Security-Policy`).
    -   **Recommendation:** Consolidate security header management. Prefer setting global security headers in `next.config.ts` as it applies them to all responses, including static assets. Use `middleware.ts` for conditional headers or more dynamic security logic (e.g., based on authentication status or specific routes). Avoid duplication to prevent conflicts and simplify maintenance. The `Content-Security-Policy` in `middleware.ts` is more restrictive for admin paths, which is good, but the base headers can be set in `next.config.ts`.
