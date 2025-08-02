# Karma Training Website

This is the official website for Karma Training, built to provide information about our courses, team, and services.

## Table of Contents

1.  [Technologies Used](#technologies-used)
2.  [Prerequisites](#prerequisites)
3.  [Installation](#installation)
    *   [Cloning the Repository](#cloning-the-repository)
    *   [Installing Dependencies](#installing-dependencies)
    *   [Environment Variables](#environment-variables)
    *   [Database Setup](#database-setup)
        *   [Local MySQL with Docker](#local-mysql-with-docker)
        *   [Creating the Database](#creating-the-database)
        *   [Running Migrations](#running-migrations)
        *   [Database Seeding (Note)](#database-seeding-note)
4.  [Running the Application](#running-the-application)
5.  [Project Structure](#project-structure)
6.  [Key Architectural Decisions](#key-architectural-decisions)
    *   [Next.js App Router](#nextjs-app-router)
    *   [API Routes (Public vs. Admin)](#api-routes-public-vs-admin)
    *   [Authentication Flow](#authentication-flow)
    *   [Data Flow](#data-flow)
    *   [File Uploads and Management](#file-uploads-and-management)
7.  [Database Schema Overview](#database-schema-overview)
8.  [Security Features](#security-features)
9.  [Scripts](#scripts)
    *   [Image Optimization](#image-optimization)
10. [Deployment](#deployment)
11. [License](#license)

---

## Technologies Used

*   **Frontend:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **Database:** MySQL (using `mysql2/promise` for Node.js connectivity)
*   **Database Management:** phpMyAdmin (for local development/management)
*   **Deployment:** NetNation (Hosting)
*   **Package Manager:** pnpm
*   **Language:** TypeScript
*   **Linting:** ESLint
*   **Testing:** Jest (unit/integration), Playwright (E2E)
*   **Image Optimization:** Sharp
*   **Authentication:** JWT (JSON Web Tokens) with enhanced security features
*   **Security:** CSRF protection, Rate Limiting, Account Lockout, Honeypot

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   pnpm (Package Manager)
*   Docker (for local MySQL database setup)
*   MySQL Client (optional, for direct database interaction)
*   phpMyAdmin (optional, but recommended for easy local database management)

## Installation

### Cloning the Repository

```bash
git clone [repository-url]
cd karma-training-website
```

### Installing Dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root of your project. This file will contain sensitive environment variables. You will need to define the following:

```
# .env.local

# MySQL Database Configuration
MYSQL_HOST=your_mysql_host        # e.g., localhost or the Docker container IP
MYSQL_PORT=3307                  # Or your MySQL port (e.g., 3306 for default Docker)
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database_name

# JWT Secret for Authentication
# Generate a strong, random string (e.g., using `openssl rand -base64 32`)
JWT_SECRET=your_very_secret_jwt_key

# Node.js Environment (development or production)
NODE_ENV=development # Set to 'production' for production deployments

# Public Domain for Security Checks (update for your NetNation domain)
NEXT_PUBLIC_DOMAIN=your-netnation-domain.com # e.g., karma-training.com

# Optional: Zapier Webhook URL for Contact Form Submissions
# If not set, contact form submissions will only be stored in the database.
# ZAPIER_WEBHOOK_URL=your_zapier_webhook_url

# Optional: Enable Next.js Bundle Analyzer (set to 'true' to enable)
# ANALYZE=true
```
*Note: Ensure your MySQL server is running and accessible with the provided credentials.*

### Database Setup

#### Local MySQL with Docker

For local development, it is recommended to run MySQL using Docker. If you don't have a MySQL container running, you can start one with a command similar to this:

```bash
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3307:3306 -d mysql:8.0
```
*   Replace `my-secret-pw` with your desired root password.
*   The `-p 3307:3306` maps port 3307 on your host to port 3306 inside the container. Adjust `MYSQL_PORT` in your `.env.local` accordingly.
*   You can then connect to this container using `MYSQL_HOST=127.0.0.1` (or `localhost`), `MYSQL_PORT=3307`, `MYSQL_USER=root`, and `MYSQL_PASSWORD=my-secret-pw`.
*   Remember to create the database specified in `MYSQL_DATABASE` within this MySQL instance.

#### Creating the Database

Using phpMyAdmin or your MySQL client, create a new database for the project (e.g., `karma_training_db`). The name should match `MYSQL_DATABASE` in your `.env.local` file.

#### Running Migrations

This project uses custom scripts for database migrations. To set up your database schema, run:

```bash
pnpm run db:migrate
```
This command will execute all pending migrations, creating the necessary tables and the `schema_migrations` table to track applied migrations. The `db:init` script also runs migrations.

#### Database Seeding (Note)

The `package.json` references `db:seed:admin` and `db:seed:content`, but the corresponding scripts (`scripts/seed-default-admin-users.js` and `scripts/seed-content.js`) are not currently present in the codebase. If initial data or admin users are required, these scripts would need to be implemented.

## Running the Application

To start the development server:

```bash
pnpm run dev
```

The application will be accessible at `http://localhost:3000` (or another port if 3000 is in use).

## Project Structure

The project follows a standard Next.js application structure with additional directories for backend logic, scripts, and types:

*   `lib/`: Contains core backend logic, database operations, security utilities, and session management.
*   `public/`: Static assets like images, robots.txt, and uploaded files.
    *   `public/uploads/`: Directory for user-uploaded content, categorized into subfolders (e.g., `company`, `course-images`, `general`, `other`, `team-photos`).
*   `scripts/`: Various utility scripts for database migrations, image optimization, and data fetching.
    *   `scripts/migrations/`: SQL migration files for database schema changes.
*   `src/`: Main application source code.
    *   `src/app/`: Next.js App Router structure for pages and API routes.
        *   `src/app/api/`: API routes for both public-facing and admin functionalities.
            *   `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/`: **Admin API routes**. This directory name is a security measure to obscure admin endpoints.
        *   `src/app/components/`: Reusable React components, categorized by their usage (e.g., `admin`, `forms`, `home`, `layout`, `ui`).
        *   `src/app/hooks/`: Custom React hooks.
        *   `src/app/[...]/page.tsx`: Next.js pages for different sections of the website (e.g., `about`, `contact`, `courses`, `privacy`, `terms`).
    *   `src/middleware.ts`: Next.js middleware for global request handling, including authentication and security.
*   `types/`: TypeScript type definitions for database entities and API responses.

## Key Architectural Decisions

### Next.js App Router

The application leverages the Next.js App Router for routing, data fetching, and rendering. This allows for a mix of server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR) as needed.

### API Routes (Public vs. Admin)

*   **Public API Routes (`src/app/api/`):** These endpoints serve public-facing data (e.g., course listings, hero section content) and handle public interactions (e.g., contact form submissions). They are generally read-only or handle non-sensitive data.
*   **Admin API Routes (`src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/`):** These endpoints are secured and handle all administrative operations such as managing courses, team members, company information, file uploads, and user sessions. The obfuscated directory name (`adm_f7f8556683f1cdc65391d8d2_8e91`) is a security measure to make these endpoints less discoverable.

### Authentication Flow

The admin panel uses a robust JWT-based authentication system:

1.  **Login:** Admin users submit credentials to `/api/adm_f7f8556683f1cdc65391d8d2_8e91/login`.
2.  **Token Generation:** Upon successful authentication, a secure JWT (`admin_token`) is generated and stored as an HTTP-only, secure, same-site cookie. This token includes user ID, username, email, and security-related claims (IP hash, device fingerprint).
3.  **Session Management:** A corresponding session record is created in the MySQL database (`admin_sessions` table), linking the token to the user and storing IP address and user agent for enhanced security.
4.  **Secure API Access:** All admin API routes are protected by `withSecureAuth` middleware. This middleware:
    *   Validates the `admin_token` from the cookie.
    *   Verifies the JWT signature and expiration.
    *   Performs IP address and device fingerprint matching against the token's claims to prevent session hijacking.
    *   Manages session renewal (refreshing the token and updating `expires_at` in the database) if the token is nearing expiration.
    *   Enforces rate limiting for API requests.
5.  **Logout:** The `/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout` endpoint invalidates the session in the database and clears the `admin_token` cookie.

### Data Flow

*   **Frontend to Backend:** User interactions on the Next.js frontend trigger API calls to the appropriate `/api` routes. Data is typically sent as JSON in the request body.
*   **Backend to Database:** API routes interact with the MySQL database via the `lib/database.ts` module, which uses `mysql2/promise` for connection pooling and query execution.
*   **Database to Backend:** Data is retrieved from MySQL, processed by the API routes, and sent back to the frontend as JSON responses.
*   **Image Uploads:** Handled via `FormData` to the `/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload` endpoint, which stores files locally in `public/uploads/` and records metadata in the database.

### File Uploads and Management

The application supports uploading various file types, primarily images, through the admin panel.

*   **Upload Process:** Files are uploaded via a dedicated admin API endpoint (`/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload`).
*   **Local Storage:** Uploaded files are stored directly on the server's filesystem within the `public/uploads/` directory, organized by category (e.g., `team-photos`, `course-images`).
*   **Database Metadata:** For each uploaded file, metadata (filename, original name, size, MIME type, URL, dimensions, alt text, title, description, tags, category, featured status, uploaded by user) is stored in the `files` table in the MySQL database.
*   **Image Optimization:** The `scripts/optimize-images.js` utility can be used to process uploaded images, converting them to WebP and resizing them for web delivery.

## Database Schema Overview

The MySQL database schema is managed through migrations (`scripts/migrations/`) and includes tables for various application entities:

*   `schema_migrations`: Tracks applied database migrations.
*   `admin_users`: Stores admin user credentials (username, hashed password, email, last login, token version).
*   `admin_sessions`: Manages active admin user sessions (user ID, token, expiration, last activity, IP address, user agent).
*   `failed_login_attempts`: Records failed login attempts for account and IP lockout mechanisms.
*   `csrf_tokens`: Stores CSRF tokens for one-time use validation.
*   `company_info`: General company details (name, slogan, description, mission, contact info).
*   `company_values`: Core values of the company.
*   `company_why_choose_us`: Items highlighting reasons to choose Karma Training.
*   `course_categories`: Categories for courses.
*   `courses`: Details about each training course (title, description, duration, audience, slug, image, category).
*   `course_features`: Specific features or learning outcomes for courses.
*   `team_members`: Information about team members (name, role, bio, photo, specializations).
*   `hero_section`: Content for the website's main hero section (slogan, headings, background image, buttons).
*   `hero_stats`: Statistics displayed in the hero section.
*   `hero_features`: Features highlighted in the hero section.
*   `footer_content`: General content for the website footer.
*   `footer_stats`: Statistics displayed in the footer.
*   `footer_quick_links`: Quick navigation links in the footer.
*   `footer_certifications`: Certifications displayed in the footer.
*   `footer_bottom_badges`: Badges displayed at the very bottom of the footer.
*   `files`: Metadata for uploaded files (filename, URL, size, type, category, alt text, etc.).
*   `file_folders`: Organizes uploaded files into folders.
*   `contact_submissions`: Stores data from contact form submissions.
*   `public_sessions`: Temporary sessions for public-facing security features (e.g., CSRF token generation for contact form).

## Security Features

The application is built with a strong focus on security, incorporating several measures to protect against common web vulnerabilities:

*   **JWT Authentication:** Secure JSON Web Token-based authentication for admin panel access. Tokens are HTTP-only, secure, and same-site.
*   **Session Management:** Robust session management with IP address and device fingerprinting checks to prevent session hijacking. Sessions have defined lifespans and renewal mechanisms.
*   **CSRF Protection:** Anti-Cross-Site Request Forgery tokens are generated and validated for sensitive POST/PUT/DELETE operations, especially within the admin panel and for the contact form. Tokens are single-use and time-limited.
*   **Rate Limiting:** Implemented using an in-memory store (should be Redis or similar in production) for:
    *   Login attempts (progressive rate limiting).
    *   Admin API requests.
    *   Public API requests.
    *   Contact form submissions.
*   **Account Lockout:** Temporarily locks user accounts after a configurable number of failed login attempts, preventing brute-force attacks. IP-based lockout is also implemented.
*   **Honeypot:** A hidden field in the contact form (`lib/security-utils.ts`) to detect and deter automated spam submissions by bots.
*   **Input Sanitization & Validation:** All user inputs are rigorously sanitized (using `isomorphic-dompurify`) and validated server-side (`lib/security-utils.ts`) to prevent:
    *   Cross-Site Scripting (XSS)
    *   SQL Injection (through parameterized queries in `lib/database.ts`)
    *   Other common injection attacks.
*   **Secure Headers:** Next.js configuration (`next.config.ts`) includes various HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy) to mitigate common web attacks.
*   **Password Hashing:** User passwords are securely hashed using `bcryptjs`.
*   **Error Handling & Logging:** Centralized error handling (`lib/logger.ts`) and logging for security-related events, aiding in detection and debugging. Sensitive information is not logged.

## Scripts

Here are some useful scripts available in `package.json`:

*   `pnpm run dev`: Starts the Next.js development server.
*   `pnpm run build`: Builds the Next.js application for production.
*   `pnpm run start`: Starts the production-built application.
*   `pnpm run lint`: Runs ESLint to check for code style issues.
*   `pnpm run lint:fix`: Runs ESLint and attempts to fix issues.
*   `pnpm run db:init`: Initializes the database by running migrations.
*   `pnpm run db:migrate`: Runs database migrations to update the schema.
*   `pnpm run db:rollback`: Rolls back the last applied database migration.
*   `pnpm run db:status`: Displays the status of database migrations (applied vs. pending).
*   `pnpm run type-check`: Runs TypeScript compiler to check for type errors.
*   `pnpm run test`: Runs Jest unit/integration tests.
*   `pnpm run test:watch`: Runs Jest tests in watch mode.
*   `pnpm run test:coverage`: Runs Jest tests and generates a coverage report.
*   `pnpm run test:e2e`: Runs Playwright end-to-end tests.
*   `pnpm run analyze`: Analyzes the Next.js bundle size (requires `ANALYZE=true` in `.env.local`).

### Image Optimization

To optimize images in a specific directory and output them to another:

```bash
node scripts/optimize-images.js <inputDirectory> <outputDirectory>
```
*Example:*
```bash
node scripts/optimize-images.js public/uploads/raw public/uploads/optimized
```
This script will resize images to a maximum width of 1920px and convert them to WebP format with 75% quality.

## Deployment

This application is designed for deployment on NetNation hosting. Specific deployment steps will depend on your NetNation account configuration, but generally involve:

1.  Building the application: `pnpm run build`.
2.  **Update Sitemap Configuration:** Before building for production, ensure the `siteUrl` in `next-sitemap.config.js` is updated to your live NetNation domain (e.g., `https://karma-training.com/`).
3.  Transferring the build output to your NetNation server.
4.  Configuring your web server (e.g., Apache/Nginx) to serve the Next.js application.
5.  Ensuring your MySQL database is accessible from the NetNation environment.

## License

[Specify your license here, e.g., MIT License]