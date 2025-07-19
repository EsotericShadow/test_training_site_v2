# Lighthouse Audit Overview - July 18, 2025

This document provides an overview of the performance, accessibility, best practices, and SEO issues identified by the Lighthouse audit conducted on July 18, 2025, with specific context pertaining to the `karma-training-website` project.

## Summary of Scores:

| Category        | Mobile Score | Desktop Score |
|-----------------|--------------|---------------|
| **Performance** | 97           | 69            |
| **Accessibility**| 92           | 92            |
| **Best Practices**| 96           | 96            |
| **SEO**         | 97           | 92            |

## Key Metrics:

| Metric                      | Mobile Value | Desktop Value |
|-----------------------------|--------------|---------------|
| **First Contentful Paint (FCP)** | 0.9 s        | 0.3 s         |
| **Largest Contentful Paint (LCP)** | 1.2 s        | 0.4 s         |
| **Total Blocking Time (TBT)** | 160 ms       | 3,790 ms      |
| **Cumulative Layout Shift (CLS)** | 0.001        | 0             |
| **Speed Index (SI)**        | 3.4 s        | 1.3 s         |

## Identified Issues and Proposed Documentation Structure:

The following sections detail each identified issue, providing diagnosis, troubleshooting steps, and proposed solutions within the context of the `karma-training-website` project's architecture (Next.js, Vercel, PostgreSQL, Tailwind CSS, etc.).

### 1. Performance Issues
- **Server Response Latency:** The first network request is slow (observed 649 ms on mobile). This is significantly impacted by the use of `cache: 'no-store'` in server components (`src/app/layout.tsx`) and N+1 query patterns in API routes (`src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.ts`) interacting with `@vercel/postgres`.
  - *Detailed documentation: [01_Performance_Server_Response_Latency.md](01_Performance_Server_Response_Latency.md)*
- **Image Optimization:** Multiple images are larger than needed for their displayed dimensions or could benefit from increased compression (more significant savings on desktop). This relates to the usage of `next/image` with images served from Vercel Blob Storage.
  - *Detailed documentation: [02_Performance_Image_Optimization.md](02_Performance_Image_Optimization.md)*
- **JavaScript Optimization:** Legacy JavaScript is being served to modern browsers, and there is unused JavaScript. This is influenced by third-party scripts like Google Tag Manager (`gtag.js` in `src/app/layout.tsx`) and the overall Next.js bundling process.
  - *Detailed documentation: [03_Performance_JavaScript_Optimization.md](03_Performance_JavaScript_Optimization.md)*
- **Long Main-Thread Tasks:** Several long tasks were identified on the main thread (significantly higher on desktop). This is often a symptom of unoptimized JavaScript execution and can be exacerbated by inefficient data processing or third-party scripts.
  - *Detailed documentation: [04_Performance_Long_Main_Thread_Tasks.md](04_Performance_Long_Main_Thread_Tasks.md)*
- **Forced Reflows:** JavaScript is causing layout recalculations (identified on desktop). This can be related to how CSS properties are manipulated or how `next/image` is used without proper dimensioning.
  - *Detailed documentation: [04_Performance_Long_Main_Thread_Tasks.md](04_Performance_Long_Main_Thread_Tasks.md)*

### 2. Accessibility Issues
- **Low Contrast Text:** Background and foreground colors do not have sufficient contrast ratio in some areas, particularly in the footer (`src/app/components/layout/footer.tsx`) where Tailwind CSS classes (`text-gray-400`, `bg-gray-900`) are used.
  - *Detailed documentation: [05_Accessibility_Issues.md](05_Accessibility_Issues.md)*
- **Non-Descriptive Links:** Links do not have discernible names or descriptive text, affecting both accessibility and SEO. This is seen in generic "Learn More" links for courses (e.g., in `src/app/components/home/featured-courses.tsx`) and icon-only social media links in the footer (`src/app/components/layout/footer.tsx`).
  - *Detailed documentation: [05_Accessibility_Issues.md](05_Accessibility_Issues.md)*

### 3. Best Practices Issues
- **Browser Errors:** Errors were logged to the console, specifically a `Permissions policy violation` related to geolocation, which is explicitly blocked in `next.config.ts`.
  - *Detailed documentation: [06_Best_Practices_Issues.md](06_Best_Practices_Issues.md)*
- **CSP Effectiveness:** The Content Security Policy (CSP) is not fully effective against XSS attacks due to `'unsafe-inline'` and `'unsafe-eval'` directives in development, and a lack of nonces/hashes in production, as configured in `src/middleware.ts` and `next.config.ts`.
  - *Detailed documentation: [06_Best_Practices_Issues.md](06_Best_Practices_Issues.md)*
- **Missing COOP Header:** No Cross-Origin-Opener-Policy (COOP) header was found, which can help mitigate certain cross-origin attacks.
  - *Detailed documentation: [06_Best_Practices_Issues.md](06_Best_Practices_Issues.md)*
- **Missing Trusted Types:** No `Content-Security-Policy` header with Trusted Types directive was found, which can mitigate DOM-based XSS vulnerabilities.
  - *Detailed documentation: [06_Best_Practices_Issues.md](06_Best_Practices_Issues.md)*

### 4. SEO Issues
- **Non-Descriptive SEO Links:** Links do not have descriptive text, which can hinder search engine understanding. This is primarily seen in the "Learn More" links for courses (e.g., in `src/app/components/home/featured-courses.tsx`).
  - *Detailed documentation: [07_SEO_Non_Descriptive_Links.md](07_SEO_Non_Descriptive_Links.md)*

Each of these issues is documented in detail in its respective Markdown file, providing specific file paths, code examples, and actionable recommendations tailored to the `karma-training-website` project.

## 5. Architectural Considerations

Beyond individual issues, a deeper analysis reveals interdependencies and underlying architectural patterns contributing to the audit findings. This section provides a meta-analysis, exploring potential root causes and suggesting proactive, long-term strategies for a more performant, secure, and accessible application.
  - *Detailed documentation: [08_Architectural_Considerations.md](08_Architectural_Considerations.md)*

## 6. Code Quality and Maintainability

This section addresses broader software engineering principles that indirectly impact performance, security, and the long-term health of the codebase, including code style, type safety, error handling, and dependency management.
  - *Detailed documentation: [09_Code_Quality_and_Maintainability.md](09_Code_Quality_and_Maintainability.md)*