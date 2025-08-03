# Gemini Code Assistant Context

This document provides context for the Gemini Code Assistant to understand the Karma Training Website project.

## Project Overview

This is a Next.js application for a karma training website. It includes a public-facing website and a secure admin panel for content management. The project is built with TypeScript and utilizes a PostgreSQL database (via Vercel Postgres) for data storage.

### Key Technologies

*   **Framework:** Next.js 15
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** Vercel Postgres (pg)
*   **Authentication:** JWT-based for the admin panel
*   **Testing:** Jest for unit/integration tests, Playwright for E2E tests
*   **Deployment:** Vercel

## Building and Running

### Prerequisites

*   Node.js (version specified in `.nvmrc` if available)
*   pnpm (or npm/yarn)

### Development

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env.local` file in the project root and add the following:
    ```
    JWT_SECRET=your_long_and_random_secret_key_here
    # Add other environment variables as needed, e.g., DATABASE_URL
    ```

3.  **Initialize and Migrate Database:**
    ```bash
    pnpm db:init
    ```

4.  **Run the Development Server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

### Testing

*   **Run all tests:**
    ```bash
    pnpm test
    ```
*   **Run tests in watch mode:**
    ```bash
    pnpm test:watch
    ```
*   **Generate test coverage report:**
    ```bash
    pnpm test:coverage
    ```
*   **Run E2E tests:**
    ```bash
    pnpm test:e2e
    ```

### Production Build

*   **Build the application:**
    ```bash
    pnpm build
    ```
*   **Start the production server:**
    ```bash
    pnpm start
    ```

## Development Conventions

### Coding Style

*   The project follows the standard Next.js and TypeScript conventions.
*   ESLint is configured for linting. Use `pnpm lint` to check for issues and `pnpm lint:fix` to automatically fix them.

### Database

*   Database interactions are handled through the `lib/database.ts` file, which provides a set of exported objects for each database table.
*   Migrations are located in the `scripts/migrations` directory and are managed using the scripts in `package.json` (e.g., `pnpm db:migrate`, `pnpm db:rollback`).

### Security

*   Admin routes are protected by the `src/middleware.ts` file, which validates JWTs and sets security headers.
*   CSRF protection is implemented for sensitive admin actions.
*   Rate limiting is applied to the login route and other public-facing `POST` routes.
*   Security headers are configured in `next.config.ts` and `src/middleware.ts`.

### API

*   Public API routes are located in `src/app/api` and are primarily for `GET` requests.
*   Admin API routes are located in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91` and are secured with `withSecureAuth` for `POST`, `PUT`, and `DELETE` operations.
