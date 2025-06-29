# Karma Training Website

This is a Next.js application designed for a karma training website, featuring public-facing content and a secure administrative panel for content management.

## Table of Contents

1.  [Features](#features)
2.  [Project Structure](#project-structure)
3.  [API Endpoints](#api-endpoints)
4.  [Authentication & Session Management](#authentication--session-management)
5.  [Security Considerations](#security-considerations)
6.  [Development Setup](#development-setup)
7.  [Testing](#testing)
8.  [Build Configuration](#build-configuration)
9.  [Dependency Audit](#dependency-audit)
10. [Utility and Migration Scripts](#utility-and-migration-scripts)

## Features

*   **Public Website:** Displays company information, courses, team members, and a contact form.
*   **Admin Panel:** Secure area for managing website content, including:
    *   Company Info (name, slogan, description, contact details)
    *   Company Values
    *   "Why Choose Us" points
    *   Course Categories
    *   Courses (with features, images, and slugs)
    *   Team Members
    *   Hero Section content (slogan, headings, background images, buttons)
    *   Footer content (company info, quick links, certifications, badges)
    *   File Management (upload, organize, and manage media assets)
*   **Secure Authentication:** Admin login with JWT-based sessions, IP binding, device fingerprinting, and rate limiting.
*   **CSRF Protection:** Implemented for sensitive admin actions.
*   **Centralized Logging:** Structured logging with different severity levels.
*   **Image Optimization:** Next.js Image component with various formats and remote patterns.
*   **Security Headers:** Configured for enhanced application security.

## Project Structure

*   **`.next/`**: Next.js build output directory.
*   **`lib/`**: Core utility functions and modules:
    *   `account-security.js`: Manages account lockout and failed login attempts.
    *   `csrf.js`: CSRF token generation and validation.
    *   `database.js`: Centralized database interaction logic for all data models.
    *   `lib-utils.ts`: General-purpose utility functions (e.g., `cn`, `formatPrice`).
    *   `logger.js`: Centralized logging mechanism.
    *   `rate-limiter.js`: Robust rate-limiting capabilities for API endpoints.
    *   `secure-jwt.js`: Handles JWT creation, verification, and secure authentication for admin sessions.
    *   `session-manager.js`: Manages user sessions, integrating with secure JWTs and database operations.
    *   `security-utils.js`: General security utilities, input sanitization, validation, honeypot checks.
*   **`public/`**: Static assets (images, fonts, `robots.txt`).
*   **`scripts/`**: Various maintenance, migration, and development utility scripts.
*   **`src/`**: Main source code directory:
    *   **`src/app/`**: Next.js App Router directory.
        *   **`src/app/api/`**: API routes.
        *   **`src/app/adm_f7f8556683f1cdc65391d8d2_8e91/`**: Admin-specific pages and UI components.
        *   **`src/app/components/`**: Reusable React components.
        *   **`src/app/contact/`**: Contact page and related components.
        *   **`src/app/courses/`**: Courses pages and related components.
        *   **`src/app/privacy/`**: Privacy policy page.
        *   **`src/app/sitemap.xml/`**: Sitemap generation route.
        *   **`src/app/terms/`**: Terms and conditions page.
    *   **`src/middleware.ts`**: Next.js middleware for request handling, authentication, and security.
*   **`.eslintrc.json`**: ESLint configuration.
*   **`.gitignore`**: Git ignore patterns.
*   **`database-init.js`**: Script to initialize the SQLite database schema.
*   **`jest.config.js`**: Jest configuration.
*   **`next.config.ts`**: Next.js configuration (build settings, image optimization, security headers).
*   **`package.json`**: Project metadata, dependencies, and scripts.
*   **`pnpm-lock.yaml`**: pnpm lockfile.
*   **`tailwind.config.ts`**: Tailwind CSS configuration.
*   **`tsconfig.json`**: TypeScript configuration.

## API Endpoints

The project utilizes a clear separation between public-facing and administrative API endpoints.

*   **Public Endpoints (`src/app/api/`)**: Primarily for `GET` requests to fetch data for the public website.
    *   `team-members/route.js`: `GET` all team members.
    *   `hero-section/route.js`: `GET` hero section data.
    *   `footer/route.js`: `GET` footer data.
    *   `courses/route.js`: `GET` all courses.
    *   `courses/[slug]/route.js`: `GET` individual course by slug.
    *   `company-info/route.js`: `GET` company information.
    *   `contact/submit/route.js`: `POST` for contact form submissions (rate-limited).
*   **Admin Endpoints (`src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/`)**: Secured with `withSecureAuth` for `POST`, `PUT`, and `DELETE` operations, and also provide `GET` access for administrative purposes.
    *   `auth/route.js`: `GET` for authentication check and session renewal.
    *   `login/route.js`: `POST` for admin login.
    *   `logout/route.js`: `POST` for admin logout (CSRF protected).
    *   `sessions/route.js`: `GET` all active sessions for the current user, `DELETE` to terminate all other sessions.
    *   `sessions/[id]/route.js`: `DELETE` a specific session by ID.
    *   `team-members/route.js` & `[id]/route.js`: `POST`, `PUT`, `DELETE` for team members.
    *   `hero-section/route.js`: `PUT` for hero section data.
    *   `footer/route.js`: `PUT` for footer data.
    *   `courses/route.js` & `[id]/route.js`: `POST`, `PUT`, `DELETE` for courses.
    *   `company-info/route.js`: `PUT` for company information.
    *   `csrf-token/route.js`: `GET` to retrieve CSRF token for client-side.

**Note on Redundancy:** Public API routes should only expose `GET` methods. All `POST`, `PUT`, and `DELETE` operations should be handled exclusively by the secured admin API routes.

## Authentication & Session Management

The application uses JWTs for admin session management, implemented in `lib/secure-jwt.js` and `lib/session-manager.js`.

*   **JWT Generation:** Secure JWTs are generated upon successful login with claims including user ID, username, email, IP hash, and device fingerprint.
*   **Token Verification:** JWTs are verified for signature, expiration, IP binding, and device fingerprint to prevent hijacking.
*   **Session Database:** Sessions are stored in the database (`admin_sessions` table) and managed via `lib/database.js`.
*   **Session Renewal:** Sessions are automatically renewed if they are nearing expiry.
*   **Account Security:** `lib/account-security.js` handles brute-force protection, account lockout, and failed login attempt tracking.

## Security Considerations

*   **Environment Variables:** `JWT_SECRET` is a critical environment variable required for JWT signing and verification. Ensure it is set to a long, random string (at least 32 characters). For local development, use a `.env.local` file.
*   **CSRF Protection:** All `POST`, `PUT`, and `DELETE` admin API routes should implement CSRF validation using `lib/csrf.js`. The client-side must fetch and include the CSRF token in request headers.
*   **Rate Limiting:** `lib/rate-limiter.js` provides robust rate-limiting. It is applied to the login route and recommended for other public-facing `POST` routes like the contact form.
*   **Security Headers:** Essential security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Content-Security-Policy`, `Strict-Transport-Security`) are configured in `next.config.ts` and `src/middleware.ts`. Global headers are set in `next.config.ts`, while `middleware.ts` handles conditional or more dynamic headers for admin paths.
*   **Input Sanitization & Validation:** `lib/security-utils.js` provides utilities for sanitizing and validating user inputs to prevent XSS and other injection attacks.

## Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd karma-training-website
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env.local` file in the project root:
    ```
    JWT_SECRET=your_long_and_random_secret_key_here
    # Add other environment variables as needed, e.g., DATABASE_URL
    ```
4.  **Initialize and Migrate Database Schema:**
    ```bash
    pnpm db:init
    # This command runs all pending schema migrations.
    ```
5.  **Seed Initial Data (Optional):**
    ```bash
    pnpm db:seed:admin
    pnpm db:seed:content
    # These commands populate the database with default admin users and content.
    ```
6.  **Run Development Server:**
    ```bash
    pnpm dev
    # or npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Testing

The project uses Jest for unit/integration tests and Playwright for end-to-end (E2E) tests.

*   **Unit/Integration Tests (Jest):**
    *   `pnpm test` - Run all tests.
    *   `pnpm test:watch` - Run tests in watch mode.
    *   `pnpm test:coverage` - Generate test coverage report.
    *   **Recommendation:** Ensure comprehensive unit tests for all `lib` utilities and critical API routes, covering input validation, business logic, and error handling.
*   **End-to-End Tests (Playwright):**
    *   `pnpm test:e2e` - Run E2E tests.
    *   **Recommendation:** Expand E2E tests to cover critical user flows, especially for the admin panel (login/logout, CRUD operations, session management) and public forms.

## Build Configuration

The project uses Next.js with Webpack for building.

*   **Turbopack Removal:** The project has been configured to remove Turbopack and use Webpack as the default bundler.
*   **Webpack Optimizations:**
    *   Persistent caching is enabled for faster builds.
    *   Bundle analysis can be performed using `pnpm run analyze` to identify large modules.
    *   Next.js handles many optimizations by default (code splitting, tree shaking, minification).

## Dependency Audit

Key dependencies and their recommendations:

*   `jose`: Used for JWT operations (Edge Runtime compatible).
*   `critters`: Investigate if actively used; consider removal if not.
*   `jsdom`: Move from `dependencies` to `devDependencies` if only used for testing.
*   `gtag`: Verify explicit usage; consider removal if redundant with other analytics.
*   `react-parallax`, `react-scroll-parallax`: Confirm active UI usage; consider removal if not.

## Utility and Migration Scripts

The `scripts/` directory contains various scripts for database management and maintenance:

*   **`scripts/migrations/`**: Contains versioned schema migration files. Each file defines `up()` and `down()` functions for applying and reverting schema changes.
*   **`scripts/migrate.js`**: The central migration runner. Use `pnpm db:migrate` to apply pending migrations, `pnpm db:rollback` to revert the last migration, and `pnpm db:status` to view migration status.
*   **`scripts/seed-default-admin-users.js`**: Seeds default admin and webmaster users (idempotent).
*   **`scripts/seed-content.js`**: Seeds initial content data for various tables (idempotent).

These scripts ensure a controlled and versioned approach to database schema evolution and data population.