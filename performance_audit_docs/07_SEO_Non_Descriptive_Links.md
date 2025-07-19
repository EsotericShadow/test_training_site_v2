# 07 - SEO: Non-Descriptive Links

## Issue Description

The Lighthouse report indicates that some links on the page do not have descriptive text. This is flagged under "Content Best Practices" in the SEO section. While not directly impacting the SEO score as much as other factors, descriptive link text helps search engines understand your content and the context of the linked pages. It also improves accessibility for users relying on screen readers.

**Failing Elements identified:**
- Multiple instances of "Learn More" links pointing to course pages (e.g., `/courses/skid-steer-loader`).

## Diagnosis

To diagnose non-descriptive links, you can:

1.  **Lighthouse Report Details:**
    *   Review the "SEO" section, specifically the "Links do not have descriptive text" audit. It lists the problematic links and their destinations.
2.  **Manual Inspection:**
    *   Visually scan the page for generic link texts like "Click Here," "Read More," or "Learn More."
    *   Consider if the link text alone provides enough information about what the user will find on the destination page.
3.  **Screen Reader Simulation:**
    *   Use a screen reader to navigate the page. Listen to how the links are announced. If the context is missing, it's a problem.
4.  **Project-Specific Context:**
    *   The "Learn More" links for courses are likely found in components such as `src/app/components/home/featured-courses.tsx` (for featured courses on the homepage) and `src/app/courses/CoursesPageClient.tsx` (for the main courses listing page or individual course pages).

## Troubleshooting

Troubleshooting involves identifying generic link texts and replacing them with more informative and context-rich phrases.

1.  **Generic Phrases:** The primary cause is using common, non-specific phrases for links.
2.  **Lack of Context:** The link text doesn't convey the topic or content of the linked page.

## Proposed Solutions

1.  **Use Descriptive Anchor Text:**
    *   Replace generic link text with phrases that clearly indicate the content of the linked page.
    *   **Action:** For course links (e.g., in `src/app/components/home/featured-courses.tsx` or `src/app/courses/CoursesPageClient.tsx`), instead of "Learn More," use the course title or a phrase that includes it. For example:
        *   Instead of: `<a href="/courses/skid-steer-loader">Learn More</a>`
        *   Use: `<a href="/courses/skid-steer-loader">Learn more about Skid Steer Loader Training</a>`
        *   Or: `<a href="/courses/skid-steer-loader">Skid Steer Loader Course Details</a>`
2.  **Incorporate Keywords (Naturally):**
    *   Where appropriate, include relevant keywords in your anchor text. This helps search engines understand the topic of the linked page and can improve its ranking for those keywords.
    *   However, avoid keyword stuffing; the primary goal is clarity for the user.
3.  **Contextualize Links:**
    *   Ensure that the surrounding text provides additional context for the link, even if the anchor text is already descriptive.

By making link texts more descriptive, you improve both the user experience (especially for those using assistive technologies) and the search engine's ability to understand and rank your content.