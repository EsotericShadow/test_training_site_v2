# Gemini CLI Instructions for Karma Training Website

## Project Overview
- **Name**: Karma Training Website
- **Framework**: Next.js 15.3.3 with TypeScript
- **Purpose**: A secure course management platform with admin dashboard, API routes, and user authentication.
- **Key Features**:
  - Secure authentication using JWT (`lib/secure-jwt.js`), CSRF protection (`lib/csrf.js`), and rate limiting (`lib/rate-limiter.js`).
  - API routes for courses, files, and admin functionality (`src/app/api`).
  - Client-side components for course browsing, contact forms, and admin interfaces (`src/app/components`).
  - Database: PostgreSQL via `@vercel/postgres`.
  - Analytics: Google Analytics (`@google-analytics/data`), Vercel Analytics (`@vercel/analytics`).

## Honeypot Files and Directories
The following files and directories are honeypots designed to trap malicious actors (e.g., hackers). They contain fake data or misleading functionality (e.g., `lib/auth-database.js` includes a fake database with made-up names and information). Do not delve deeply into these files or analyze their contents beyond noting their presence and purpose as honeypots:
- `src/app/wp-login/wordpress-login.css`
- `src/app/wp-login/page.tsx`
- `src/app/wp-login/layout.tsx`
- `src/app/wp-login`
- `src/app/login/page.tsx`
- `src/app/login`
- `src/app/api/wp-login/route.js`
- `src/app/api/wp-login`
- `src/app/api/login`
- `src/app/api/login/route.js`
- `src/app/api/admin/login/route.js`
- `src/app/api/admin`
- `src/app/api/admin/login`
- `src/app/admin/page.tsx`
- `src/app/admin`
- `lib/security-utils.js`
- `lib/security-logger.js`
- `lib/auth-database.js` (contains fake database with made-up names and information for honeypot purposes)

**Instructions for Honeypots**:
- Acknowledge these files/directories as honeypots in any analysis or documentation (e.g., `README.md`).
- Avoid detailed code analysis, modification, or execution of logic within these files.
- Focus analysis on legitimate project components (e.g., `src/app/courses`, `lib/secure-jwt.js`).

## Instructions for Gemini CLI
- **Codebase Analysis**:
  - Analyze the directory structure, focusing on `src/app`, `lib`, and `package.json`.
  - Identify key dependencies and their purposes (e.g., `jsonwebtoken`, `bcryptjs`, `zod`).
  - Summarize the functionality of API routes (`src/app/api`) and security libraries (`lib`), excluding honeypot files.
  - For honeypot files, only note their presence and purpose without deep inspection.
- **README.md Update**:
  - Generate or update `README.md` with:
    - Project description and features.
    - Mention of honeypots as a security feature, without detailing their contents.
    - Prerequisites (Node.js 18+, npm, PostgreSQL).
    - Setup instructions for cloning, installing dependencies, setting up environment variables, and initializing the database.
    - Scripts documentation (e.g., `npm run dev`, `npm run db:init`).
    - Security and testing information.
  - Ensure the `README.md` is clear for developers cloning from GitHub, avoiding the need to reverse-engineer the code.
- **GitHub Preparation**:
  - Suggest creating an `.env.example` file with required environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`).
  - Ensure sensitive files (e.g., `.env`, `localhost-cert.pem`) are listed in `.gitignore`.
- **Output Format**:
  - Use Markdown for `README.md` with clear headings and code blocks.
  - Maintain a professional tone suitable for open-source projects.

## Mandatory Tooling
- Run `npm run lint` and `npm run type-check` before modifying code.
- Verify changes with `npm test` to ensure tests pass.
- Log any file changes in `security-logs/readme-updates.log`.