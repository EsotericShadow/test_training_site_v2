# 02 - Performance: Image Optimization

## Issue Description

Both mobile and desktop Lighthouse reports indicate significant opportunities for image optimization. Images are identified as being larger than necessary for their displayed dimensions, and some could benefit from increased compression. This leads to larger transfer sizes, increased load times, and negatively impacts Largest Contentful Paint (LCP).

**Mobile Report Findings:**
- Estimated savings: 229 KiB
- Multiple images are larger than their displayed dimensions (e.g., 495x696 displayed as 276x256).
- Some images could benefit from increased compression factor.
- Specific mention of `/_next/image?url=%2Fassets%2Flogos%2Flogo.png` being larger than needed (384x206 displayed as 150x80).

**Desktop Report Findings:**
- Estimated savings: 1,052 KiB (significantly higher than mobile)
- Similar issues with images being larger than displayed dimensions (e.g., 1896x1080 displayed as 398x224).
- Many images could benefit from increased compression.
- The logo image (`/_next/image?url=%2Fassets%2Flogos%2Flogo.png`) is also flagged for being larger than needed (640x343 displayed as 150x80).

## Diagnosis

To diagnose image optimization issues, you can:

1.  **Lighthouse Report Details:**
    *   Review the "Improve image delivery" section. It lists specific image URLs, their resource size, estimated savings, and the reason for the recommendation (e.g., "This image file is larger than it needs to be..." or "Increasing the image compression factor could improve...").
    *   Pay close attention to the displayed dimensions versus the intrinsic dimensions of the image.
2.  **Browser Developer Tools (Elements and Network Tabs):**
    *   **Elements Tab:** Inspect `<img>` elements. Hover over them to see their rendered size on the page. Compare this to the `src` attribute or the `_next/image` URL parameters.
    *   **Network Tab:** Filter by "Img". Observe the `Size` (transfer size) and `Dimensions` (intrinsic size) of each image. Compare the intrinsic size to the size it's actually rendered at on the page.
3.  **Next.js Image Component Usage & Vercel Blob Integration:**
    *   The project uses `next/image` for image optimization and sources images primarily from **Vercel Blob Storage** (as indicated by `@vercel/blob` dependency and `*.vercel-storage.com` in `next.config.ts` `remotePatterns`).
    *   Examine how `next/image` is being used throughout the application. Look for instances where `width`, `height`, `sizes`, and `quality` props are not optimally set, especially for images served from Vercel Blob URLs.
    *   Check if `object-fit` or other CSS properties are causing images to be rendered at different sizes than their `width`/`height` props suggest. For example, the "Karma Training Logo" in `src/app/components/ui/Logo.tsx` was flagged for layout shifts and being larger than its displayed dimensions, potentially due to `object-contain` and mismatched `width`/`height` props.

## Troubleshooting

Troubleshooting image optimization involves ensuring that images are served at the correct dimensions and with appropriate compression for the user's device and viewport, particularly when using `next/image` with Vercel Blob Storage.

1.  **Incorrect `width`/`height` or `sizes`:** The most common issue is providing `width` and `height` props that don't match the actual rendered size, or not providing an effective `sizes` attribute for responsive images. This is crucial for images fetched from Vercel Blob, as `next/image` uses these props to generate optimized image URLs.
2.  **Suboptimal `quality`:** The `quality` prop for `next/image` might be set too high, leading to larger file sizes without a noticeable visual improvement. This applies to all images, including those from Vercel Blob.
3.  **Missing `object-fit` consideration:** If `object-fit` is used, the intrinsic dimensions might be much larger than the rendered dimensions, leading to wasted bytes. This was observed with the logo in `src/app/components/ui/Logo.tsx`.
4.  **Large original assets in Vercel Blob:** While Next.js optimizes, starting with excessively large original images uploaded to Vercel Blob will still result in larger optimized images than necessary.

## Proposed Solutions (Implemented)

### A. Optimized `next/image` Usage with Vercel Blob

1.  **Set Appropriate `width`, `height`, `sizes`, and `quality`:**
    *   Reviewed and adjusted `Image` component props in key files including:
        *   `src/app/components/ui/Logo.tsx`: Adjusted `md` size height to `80` and set `quality={60}`.
        *   `src/app/components/home/featured-courses.tsx`: Added `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` and `quality={75}` to course images.
        *   `src/app/components/home/WhyChooseUsBento.tsx`: Added `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` and `quality={75}` (or `60` for fallback) to images.
        *   `src/app/about/AboutPageClient.tsx`: Added `quality={80}` to the hero image and `quality={75}` to team member photos.
        *   `src/app/courses/[courseid]/CoursePageClient.tsx` and `src/app/courses/[courseid]/ExpandedCoursePageClient.tsx`: Added `quality={80}` to course hero images.
    *   These adjustments ensure images are served at more appropriate dimensions and with better compression for various viewports, reducing transfer sizes and improving LCP.

### B. Optimized Original Image Assets in Vercel Blob

1.  **Pre-optimization Script:**
    *   A new script, `scripts/optimize-images.js`, has been created. This script uses the `sharp` library to resize images to a maximum width of 1920px and convert them to WebP format with a quality of 75 (or 60 for logos/fallbacks) before they are uploaded to Vercel Blob. This reduces the initial file size of source images, further enhancing the effectiveness of Next.js Image Optimization.

These implementations directly address the image optimization issues identified in the audit, leading to significant improvements in Largest Contentful Paint (LCP) and overall page performance.

**Further Considerations (Not yet implemented, but still relevant for overall performance):**

*   **Lazy Loading:** Ensure `priority` is only used for LCP images (above-the-fold) to avoid unnecessary loading of non-critical images.
*   **Content Delivery Network (CDN):** Vercel Blob Storage inherently uses a CDN, which is already benefiting the project. Ensure `next.config.ts` `remotePatterns` correctly list all image sources, including `*.vercel-storage.com` and any other external image hosts.