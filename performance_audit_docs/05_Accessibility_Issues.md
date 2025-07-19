# 05 - Accessibility: Low Contrast Text & Non-Descriptive Links

## Issue Description

The Lighthouse reports identified two key accessibility issues that hinder usability for a diverse range of users, particularly those with visual impairments or who rely on assistive technologies:

1.  **Low-Contrast Text:** Background and foreground colors do not have a sufficient contrast ratio. This makes text difficult or impossible for many users to read, especially those with low vision or color blindness.
    *   **Failing Elements identified:**
        *   `© 2025 Evergreen Web Solutions` (`<p>` tag)
        *   `Karma Training is Northwestern British Columbias premier provider of workplace …` (`<footer>` tag)

2.  **Links Do Not Have a Discernible Name:** Links lack descriptive text, which negatively impacts screen reader users and search engine understanding. Link text (and alternate text for images, when used as links) that is discernible, unique, and focusable improves the navigation experience.
    *   **Failing Elements identified:**
        *   `div.bg-gray-800 > div.container > div.flex > a.flex` (`<a href="mailto:info @karmatraining.ca" class="flex items-center space-x-2 hover:text-yellow-400 transition-colors">`)
        *   Multiple instances of `div.grid > div > div.flex > a.text-gray-400` (`<a href="#" class="text-gray-400 hover:text-white">`)
        *   SEO section also flagged "Learn More" links as non-descriptive.

## Diagnosis

To diagnose these accessibility issues, you can:

1.  **Lighthouse Report Details:**
    *   Review the "Accessibility" section, specifically the "Contrast" and "Names and labels" audits. These sections list the failing elements and provide links to learn more.
2.  **Chrome DevTools - Accessibility Tab:**
    *   **Contrast:** Use the Color Picker in the Elements tab to check contrast ratios. Chrome DevTools can highlight elements with insufficient contrast.
    *   **Screen Reader Simulation:** Use a screen reader (e.g., NVDA for Windows, VoiceOver for macOS) to navigate the page and hear how links are announced. This will quickly reveal non-descriptive links.
3.  **Manual Inspection:**
    *   Visually inspect the page for text that is hard to read against its background.
    *   Click on links and observe their context. If the link text alone doesn't convey its purpose, it's likely non-descriptive.
4.  **Project-Specific Context:**
    *   **Low Contrast Text:** The identified elements (`© 2025 Evergreen Web Solutions` and `Karma Training is Northwestern British Columbias premier provider of workplace …`) are located within the `<footer className="bg-gray-900 text-white">` in `src/app/components/layout/footer.tsx`. The text color is `text-gray-400` or `text-gray-500` against a `bg-gray-900` background, which likely fails contrast ratios.
    *   **Non-Descriptive Links:**
        *   The social media links in `src/app/components/layout/footer.tsx` use generic `href="#"` and only display icons (`<Facebook />`, `<Linkedin />`, `<Twitter />`) without discernible text or `aria-label`.
        *   The mailto link in `src/app/components/layout/footer.tsx` (`<a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">{footerContent?.email}</a>`) uses the email address as the link text, which is better than nothing but could be more descriptive.
        *   The "Learn More" links for courses are likely found in components like `src/app/components/home/featured-courses.tsx` or `src/app/courses/CoursesPageClient.tsx`.

## Troubleshooting

Troubleshooting involves adjusting color palettes to meet contrast standards and ensuring all interactive elements, especially links, have clear and meaningful labels.

1.  **Contrast Issues:** Often a result of choosing colors for aesthetic reasons without considering accessibility guidelines. In this project, the use of Tailwind CSS classes like `text-gray-400`, `text-gray-500`, and `bg-gray-900` needs to be reviewed against WCAG contrast requirements.
2.  **Non-Descriptive Links:** Arise from using generic phrases like "Click Here," "Learn More," or empty links (`href="#"`) without providing additional context for screen readers. The use of icon-only links without `aria-label` is a common oversight.

## Proposed Solutions

### A. Address Low-Contrast Text

1.  **Adjust Color Palette (Tailwind CSS):**
    *   Modify the Tailwind CSS classes used for the foreground or background colors of the identified elements to meet WCAG (Web Content Accessibility Guidelines) 2.1 AA standards.
    *   For small text (less than 18pt regular or 14pt bold), a contrast ratio of at least 4.5:1 is required.
    *   For large text (18pt regular or 14pt bold and larger), a contrast ratio of at least 3:1 is required.
    *   **Action:** For the footer text in `src/app/components/layout/footer.tsx` (e.g., `text-gray-400` and `text-gray-500` against `bg-gray-900`), consider changing `text-gray-400` to `text-gray-200` or `text-gray-300` and `text-gray-500` to `text-gray-300` or `text-gray-400` to improve contrast. Test these changes thoroughly.
2.  **Use Accessibility Tools:**
    *   Utilize online contrast checkers (e.g., WebAIM Contrast Checker) or browser extensions to test color combinations after adjusting Tailwind classes.

### B. Provide Discernible Link Names

1.  **Descriptive Anchor Text:**
    *   Change generic link text to be descriptive of the link's destination or purpose.
    *   **Action:** For the social media links in `src/app/components/layout/footer.tsx`:
        *   Instead of `<a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>`
        *   Use: `<a href="https://www.facebook.com/yourprofile" className="text-gray-400 hover:text-white" aria-label="Follow us on Facebook"><Facebook /></a>` (and replace `href="#"` with actual URLs).
    *   **Action:** For the mailto link in `src/app/components/layout/footer.tsx`:
        *   Instead of `<a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">{footerContent?.email}</a>`
        *   Consider: `<a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">Email us at {footerContent?.email}</a>` or `<a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">Send us an email</a>`.
    *   **Action:** For the "Learn More" links for courses (e.g., in `src/app/components/home/featured-courses.tsx` or `src/app/courses/CoursesPageClient.tsx`):
        *   Instead of: `<a href="/courses/skid-steer-loader">Learn More</a>`
        *   Use: `<a href="/courses/skid-steer-loader">Learn more about Skid Steer Loader Training</a>` or `<a href="/courses/skid-steer-loader">View Skid Steer Loader Course Details</a>`.
2.  **`aria-label` for Icons/Non-Text Links:**
    *   If a link is purely an icon or has no visible text, provide an `aria-label` attribute to describe its purpose for screen readers. This is crucial for the social media icons in the footer.
    *   **Example:** `<a href="/contact" aria-label="Contact Us"> <Icon /> </a>`
3.  **Contextual Links:**
    *   Ensure that the surrounding text provides enough context for the link if the link text itself cannot be fully descriptive.

Addressing these accessibility issues will make the website more inclusive and usable for a wider audience, improving the overall user experience and compliance with accessibility standards.