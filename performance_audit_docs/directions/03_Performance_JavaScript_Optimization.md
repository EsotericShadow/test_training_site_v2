# 03 - Performance: JavaScript Optimization

**Validated and Refined Based on Research:** Bundle analyzer usage confirmed: Set ANALYZE=true for build to generate client.html, nodejs.html, and edge.html reports in .next/analyze/. Hover for stats; focus on large vendor chunks. For gtag.js, switch to `lazyOnload` defers to browser idle, reducing TBT vs. `afterInteractive` (post-hydration). Legacy JS: Ensure browserslist targets modern; analyzer helps spot polyfills from deps—update or replace. Unused JS: Limit scripts to specific layouts; use named imports for tree shaking.

**Problem:** The site serves legacy JavaScript to modern browsers and has significant unused JavaScript (e.g., `gtag.js`), contributing to high TBT and slower script evaluation.

**Goal:** Reduce JavaScript payload, minimize parsing/compilation time, and improve TBT.

---

## Step 1: Analyze JavaScript Bundles

**Context:** Understanding what makes up your JavaScript bundles is the first step to optimizing them. The project already has `@next/bundle-analyzer` configured.

**Action:** Run the bundle analyzer to visualize the JavaScript payload.

1.  **Run the analyze script:**
    ```bash
    ANALYZE=true pnpm build
    ```
    *   Reports open automatically; if not, check `.next/analyze/` for HTML files. Filter by module size; aim to reduce chunks >100KB.

---

## Step 2: Optimize Third-Party Scripts (Google Analytics/GTM)

**Context:** Google Tag Manager (`gtag.js`) is loaded in `src/app/layout.tsx` and is flagged as a source of unused JavaScript. While `strategy="afterInteractive"` is used, further deferral can improve initial load.

**Action:** Change the loading strategy for `gtag.js` to `lazyOnload`.

1.  **Open the file:** `src/app/layout.tsx`

2.  **Locate the `Script` components for Google Analytics:**
    ```typescript
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_title: document.title,
          page_location: window.location.href,
        });
      `}
    </Script>
    ```

3.  **Change to `strategy="lazyOnload"`:**
    *   Ideal for analytics; loads during idle, minimizing initial TBT impact.
        ```typescript
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        ```

4.  **Vercel Analytics and Speed Insights:** If impacting, move to specific layouts if not global.

---

## Step 3: Reduce Legacy JavaScript

**Context:** The project uses Next.js with SWC and targets modern browsers via `browserslist`. The presence of legacy JavaScript suggests a third-party dependency might be the culprit.

**Action:** Ensure your build process is not unnecessarily transpiling modern JavaScript.

1.  **Verify `browserslist`:**
    *   **Open the file:** `package.json`
    *   **Locate the `browserslist` entry:**
        ```json
        "browserslist": [
          "last 2 chrome versions",
          "last 2 firefox versions",
          "last 2 safari versions",
          "last 2 edge versions"
        ],
        ```
    *   **Confirm:** This configuration correctly targets modern browsers. If the bundle analyzer (Step 1) points to a specific dependency causing legacy JS, investigate if that dependency can be updated or configured to output modern JavaScript.

---

## Step 4: Reduce Unused JavaScript (Tree Shaking & Code Splitting)

**Context:** Next.js automatically performs route-based code splitting and SWC handles tree shaking. However, further optimization is possible.

**Action:** Ensure effective tree shaking and strategic code splitting.

1.  **Use Named Imports Consistently:**
    *   **Action:** Throughout your codebase, prefer named imports over default or wildcard imports when possible. This helps tree-shaking algorithms identify and remove unused code more effectively.
    *   **Example:**
        *   **Good:** `import { Button } from '@radix-ui/react-dialog';`
        *   **Avoid:** `import * as Dialog from '@radix-ui/react-dialog';`

2.  **Strategic `next/dynamic` Usage:**
    *   **Context:** The project already uses `next/dynamic` in several places (e.g., `src/app/about/AboutPageClient.tsx`, `src/app/components/home/DynamicAboutSnippet.tsx`, `src/app/layout.tsx`).
    *   **Action:** Review components that are not critical for the initial viewport or user interaction and convert them to dynamic imports.
    *   **Consider `ssr: false`:** For components that only run on the client-side and are not needed for initial server-side rendering, use `ssr: false` to prevent them from being included in the server bundle.
        ```typescript
        import dynamic from 'next/dynamic';

        const MyHeavyClientComponent = dynamic(() => import('./MyHeavyClientComponent'), {
          ssr: false, // Only load on client-side
          loading: () => <p>Loading...</p>, // Optional loading state
        });
        ```

3.  **Remove Unused Dependencies:**
    *   **Action:** After running the bundle analyzer, if you identify any large dependencies that are no longer used, remove them from `package.json`.
    *   **Tool:** Use `depcheck` to identify unused dependencies:
        ```bash
        pnpm install -g depcheck # Install globally if not already
        depcheck
        ```
        *   Review the output and remove any identified unused dependencies.

---

## Verification

1.  **Run `npm run build` and `npm start` (or deploy to Vercel).**
2.  **Re-run Lighthouse:** Check Performance score, especially TBT and the "Reduce unused JavaScript" audit. Aim for TBT <200ms and minimal unused JS.
3.  **Chrome DevTools (Coverage Tab):** Verify that the percentage of unused JavaScript has decreased.
4.  **Chrome DevTools (Performance Tab):** Analyze the flame chart to see if script evaluation and parsing times have reduced.