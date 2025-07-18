# Security Audit Report - Karma Training Website

This report details specific, actionable security vulnerabilities and areas for improvement identified within the `karma-training-website` project. It serves as a checklist for hardening the application's security perimeter.

## 1. API Endpoint Security & Access Control

**Vulnerability:** Public API routes currently expose `POST`, `PUT`, or `DELETE` methods, allowing unauthenticated users to potentially modify or create data. All data modification operations should be restricted to authenticated and authorized administrators via the `/adm_f7f8556683f1cdc65391d8d2_8e91` prefixed routes.

**Actionable Items:**

*   **`src/app/api/team-members/route.js`**
    *   **Issue:** Contains a `POST` export.
    *   **Action:** Remove the `export async function POST(...)` block. All team member creation should occur via the admin API.

*   **`src/app/api/hero-section/route.js`**
    *   **Issue:** Contains `PUT` and `DELETE` exports.
    *   **Action:** Remove the `export async function PUT(...)` and `export async function DELETE(...)` blocks. Hero section modifications should occur via the admin API.

*   **`src/app/api/footer/route.js`**
    *   **Issue:** Needs verification. If `PUT` or `DELETE` exports exist, they should be removed.
    *   **Action:** Review `src/app/api/footer/route.js`. If `export async function PUT(...)` or `export async function DELETE(...)` are present, remove them. Footer modifications should occur via the admin API.

*   **`src/app/api/courses/route.js`**
    *   **Issue:** Contains a `POST` export.
    *   **Action:** Remove the `export async function POST(...)` block. Course creation should occur via the admin API.

*   **`src/app/api/courses/[slug]/route.js`**
    *   **Issue:** Contains `PUT` and `DELETE` exports.
    *   **Action:** Remove the `export async function PUT(...)` and `export async function DELETE(...)` blocks. Course modifications and deletions should occur via the admin API.

*   **`src/app/api/company-info/route.js`**
    *   **Issue:** Needs verification. If `PUT` or `DELETE` exports exist, they should be removed.
    *   **Action:** Review `src/app/api/company-info/route.js`. If `export async function PUT(...)` or `export async function DELETE(...)` are present, remove them. Company info modifications should occur via the admin API.

## 2. Cross-Site Request Forgery (CSRF) Protection

**Vulnerability:** Several admin `POST`, `PUT`, and `DELETE` routes currently lack explicit CSRF token validation, making them susceptible to CSRF attacks.

**Actionable Items:**

*   **General Action:** For remaining routes, ensure the `POST`, `PUT`, or `DELETE` handler includes CSRF validation. This typically involves:
    1.  Importing `validateToken` from `../../../../../lib/csrf`.
    2.  Extracting `admin_token` from cookies and `x-csrf-token` from request headers.
    3.  Adding a check: `if (!adminToken || !csrfToken || !validateToken(adminToken, csrfToken)) { return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 }); }`

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/courses/route.js`**
    *   **Action:** Add CSRF validation to the `POST` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/courses/[id]/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` and `DELETE` handlers.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/team-members/route.js`**
    *   **Action:** Add CSRF validation to the `POST` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/team-members/[id]/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` and `DELETE` handlers.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/hero-section/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/footer/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/company-info/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/files/route.js`**
    *   **Action:** Add CSRF validation to the `POST` handler.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/files/[id]/route.js`**
    *   **Action:** Add CSRF validation to the `PUT` and `DELETE` handlers.

*   **`src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/logout/route.js`**
    *   **Action:** Add CSRF validation to the `POST` handler. (This was implicitly covered by the general action, but explicitly adding it for clarity as it was a major point of concern).

## 3. Rate Limiting

**Vulnerability:** The contact form endpoint (`src/app/api/contact/submit/route.js`) is susceptible to abuse (e.g., spam, resource exhaustion) without robust rate limiting.

**Actionable Items:**

*   **`src/app/api/contact/submit/route.js`**
    *   **Issue:** Needs to explicitly use `lib/rate-limiter.js` for comprehensive rate limiting.
    *   **Action:** Implement `applyRateLimit(request, ip, 'contact_form')` at the beginning of the `POST` handler to protect against excessive submissions.

## 4. Input Validation & Sanitization

**Vulnerability:** Inconsistent or insufficient input validation and sanitization across API routes can lead to injection attacks (XSS, SQL Injection).

**Actionable Items:**

*   **General Action:** Review all API routes that accept user input (`POST`, `PUT`) to ensure `lib/security-utils.js` `sanitizeInput` and `validateInput` functions are consistently and appropriately applied to *all* incoming data fields.

*   **Key Files for Review:**
    *   `src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/courses/route.js` (for `POST` and `PUT` data)
    *   `src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/team-members/route.js` (for `POST` and `PUT` data)
    *   `src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/company-info/route.js` (for `PUT` data)
    *   `src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/footer/route.js` (for `PUT` data)
    *   `src/app/api/adm_f7f556683f1cdc65391d8d2_8e91/files/route.js` (for `POST` and `PUT` data)
    *   `src/app/api/contact/submit/route.js` (for `POST` data - already uses some validation, but ensure it's comprehensive).

## 5. Sensitive Data Handling

**Vulnerability:** Detailed error messages or stack traces exposed to clients in production environments can provide attackers with valuable information about the application's internals.

**Actionable Items:**

*   **General Action:** Ensure all API routes and middleware consistently use `handleApiError` from `lib/logger.js` to catch and standardize error responses, preventing sensitive details from leaking to the client.

*   **Key Files for Review:**
    *   All API routes (`src/app/api/**/*.js`)
    *   `src/middleware.ts`

## 6. Dependency Management

**Vulnerability:** Unused third-party libraries increase the attack surface and bundle size. Keeping unnecessary dependencies can introduce unknown vulnerabilities.

**Actionable Items:**

*   **Audit and Remove Unused Dependencies:**
    *   **`critters`**: Review its usage. If not explicitly configured or used for critical CSS, remove it from `package.json`.
    *   **`jsdom`**: Currently in `dependencies`. If its use is limited to testing or build processes, move it to `devDependencies`.
    *   **`gtag`**: Verify if it's explicitly used for analytics not covered by `@google-analytics/data` or `@vercel/analytics`. If not, remove it.
    *   **`react-parallax` & `react-scroll-parallax`**: Confirm active usage in UI components. If not, remove them.
    *   **Action:** After confirming non-usage, run `pnpm uninstall <package-name>` for each. Then run `pnpm install` to update the lockfile.

## 7. Logging and Monitoring

**Vulnerability:** Insufficient logging of security-relevant events can hinder incident detection and response.

**Actionable Items:**

*   **General Action:** Review all authentication, authorization, and data modification points to ensure appropriate logging using `logger.info`, `logger.warn`, and `logger.error` from `lib/logger.js`.

*   **Key Events to Log (with relevant metadata like IP, User ID, Action, Outcome):**
    *   Successful and failed login attempts.
    *   Account lockouts.
    *   Password changes.
    *   Session creation, renewal, and termination.
    *   Unauthorized access attempts (e.g., 401/403 responses).
    *   CSRF validation failures.
    *   Rate limit triggers.
    *   Successful and failed data creation/modification/deletion operations in admin APIs.

*   **Production Logging:** For production deployments, integrate `lib/logger.js` with a centralized log management system (e.g., ELK Stack, Datadog, Splunk) and configure alerts for suspicious activities.
