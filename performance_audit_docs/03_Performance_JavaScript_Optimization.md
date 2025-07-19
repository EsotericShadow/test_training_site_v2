# 03 - Performance: JavaScript Optimization

## Issue Description

The Lighthouse reports indicate two primary JavaScript-related performance issues:

1.  **Legacy JavaScript:** Polyfills and transforms are being served that are not necessary for modern browsers, leading to wasted bytes (estimated 12 KiB savings on both mobile and desktop).
2.  **Unused JavaScript:** Significant amounts of JavaScript are being downloaded but not executed, increasing transfer size and parsing/compilation time (estimated 244 KiB savings).

These issues contribute to increased page load times, higher Total Blocking Time (TBT), and overall poorer performance, especially on devices with limited processing power or slower network connections.

## Diagnosis

To diagnose JavaScript optimization issues, you can:

1.  **Lighthouse Report Details:**
    *   Review the "Legacy JavaScript" and "Reduce unused JavaScript" sections in the Lighthouse report. These sections list the specific files and the estimated savings.
    *   For legacy JavaScript, it often points to specific Babel transforms or polyfills (e.g., `@babel/plugin-transform-classes`, `Array.prototype.at`).
    *   For unused JavaScript, it lists the files and the amount of bytes that are not used during the initial page load.
2.  **Chrome DevTools - Coverage Tab:**
    *   Open DevTools (F12 or Cmd+Option+I).
    *   Go to `More tools` (three dots menu) -> `Coverage`.
    *   Start recording (the reload button).
    *   Interact with your page.
    *   The Coverage tab will show how much of your CSS and JavaScript code was actually used. Red bars indicate unused bytes, and green bars indicate used bytes. This is excellent for identifying unused code.
3.  **Chrome DevTools - Performance Tab:**
    *   Record a performance profile.
    *   Analyze the "Main" thread activity, looking for long tasks related to "Script Evaluation," "Script Parsing & Compilation," and "Scripting." This can help identify the impact of large JavaScript bundles.
4.  **Project-Specific Context:**
    *   **Legacy JavaScript:** Given that the project uses Next.js 15.3.3, TypeScript, and relies on SWC for transpilation (as indicated by the absence of Babel configuration files and the `browserslist` in `package.json` targeting modern browsers), the presence of "Legacy JavaScript" is unexpected. This suggests that a third-party dependency might be transpiling its code to an older JavaScript version, or a specific configuration is overriding Next.js's default modern output.
    *   **Unused JavaScript:** The Lighthouse report specifically flags Google Tag Manager (`gtag.js`) as a source of unused JavaScript. This script is integrated in `src/app/layout.tsx`. Additionally, Vercel Analytics and Speed Insights are included in production, which also contribute to the overall JavaScript payload.

## Troubleshooting

Troubleshooting JavaScript optimization involves identifying the source of the legacy and unused code and then implementing strategies to reduce or defer it.

1.  **Identify Transpilation Targets:** Understand your project's browser support matrix. The `browserslist` in `package.json` (`"last 2 chrome versions", "last 2 firefox versions", "last 2 safari versions", "last 2 edge versions"`) indicates a focus on modern browsers. If you're only targeting modern browsers, you might be over-transpiling your JavaScript due to a specific dependency.
2.  **Analyze Bundle Contents with `@next/bundle-analyzer`:**
    *   The project's `package.json` includes an `analyze` script (`"analyze": "cross-env ANALYZE=true next build"`). Running this command will generate an interactive treemap visualization of your JavaScript bundles, allowing you to pinpoint which files and dependencies contribute most to the bundle size.
    *   **Action:** Run `npm run analyze` (or `pnpm run analyze`) and examine the generated report to identify large chunks, especially those containing polyfills or unused code.
3.  **Component-Level Usage:** For unused JavaScript, consider if certain components or libraries are being loaded on pages where they are not needed. This is particularly relevant for components that are not immediately visible on page load.

## Proposed Solutions

### A. Reduce Legacy JavaScript

1.  **Verify `browserslist` and Dependency Transpilation:**
    *   **Action:** Double-check the `browserslist` configuration in `package.json` to ensure it accurately reflects your target audience. If it's already targeting modern browsers, the legacy JavaScript is likely coming from a third-party dependency.
    *   **Investigation:** If the bundle analyzer points to a specific dependency as the source of legacy JavaScript, investigate if that dependency can be configured to output modern JavaScript, or if there's a more modern alternative.
2.  **Next.js Modern Mode:**
    *   Next.js, by default, aims to serve modern JavaScript to modern browsers. Ensure no custom configurations in `next.config.ts` or other build files are inadvertently forcing a legacy build for all users.

### B. Reduce Unused JavaScript

1.  **Code Splitting and Lazy Loading with `next/dynamic`:**
    *   **Concept:** Break down your JavaScript bundle into smaller chunks that are loaded only when needed. The project already utilizes `next/dynamic` in several places (e.g., `src/app/about/AboutPageClient.tsx`, `src/app/components/home/DynamicAboutSnippet.tsx`, `src/app/layout.tsx`).
    *   **Action:** Review components that are not critical for the initial viewport and consider converting them to dynamic imports using `next/dynamic`.
        ```typescript
        // Example of dynamic import in Next.js
        import dynamic from 'next/dynamic';

        const MyHeavyComponent = dynamic(() => import('../components/MyHeavyComponent'), {
          ssr: false, // Only load on client-side if not needed for initial render
          loading: () => <p>Loading...</p>, // Optional loading state
        });

        // In your component:
        // <MyHeavyComponent />
        ```
    *   **Route-Based Code Splitting:** Next.js automatically performs route-based code splitting. Ensure you're not importing large components or libraries globally that are only used on specific pages.
2.  **Tree Shaking:**
    *   **Concept:** Ensure your build tools (Next.js's SWC compiler) are effectively removing unused exports from your JavaScript modules.
    *   **Action:** Use named imports (`import { func } from 'module';`) instead of default imports (`import module from 'module';`) or wildcard imports (`import * as module from 'module';`) when possible, as named imports are easier for tree-shaking algorithms to optimize.
3.  **Remove Unused Dependencies:**
    *   Periodically review your `package.json` dependencies. If a library is no longer used, uninstall it.
    *   Use tools like `depcheck` to identify unused dependencies.
4.  **Optimize Third-Party Scripts (Google Analytics/GTM & Vercel Analytics/Speed Insights):**
    *   The Lighthouse report specifically flags Google Tag Manager (`gtag.js`) as a source of unused JavaScript. This script is loaded in `src/app/layout.tsx`.
    *   **Action:** Ensure the Google Analytics script is loaded with the `strategy="afterInteractive"` or `strategy="lazyOnload"` prop in Next.js's `Script` component to defer its loading until after the critical content has rendered.
        ```typescript
        // src/app/layout.tsx
        import Script from 'next/script';

        // ...

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive" // or "lazyOnload"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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
    *   **Action:** Consider if all features of Google Tag Manager are necessary for the initial page load. If not, explore ways to load only essential tags initially.
    *   **Vercel Analytics and Speed Insights:** These are loaded conditionally in production in `src/app/layout.tsx`. While beneficial for monitoring, they do add to the JavaScript payload.
        *   **Action:** Ensure they are configured to minimize their impact on performance. Vercel's own documentation often provides best practices for integrating these.
5.  **`experimental.optimizePackageImports`:**
    *   The `next.config.ts` file includes `experimental.optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog']`. This Next.js feature helps optimize imports from specified packages, potentially reducing bundle size.
    *   **Action:** Verify that these packages are being used efficiently and that this optimization is having the desired effect. Consider adding other large, frequently imported packages to this list if they support it.

This optimization is crucial for improving the interactive readiness of the page and reducing the Total Blocking Time, especially on desktop where the TBT is significantly higher.