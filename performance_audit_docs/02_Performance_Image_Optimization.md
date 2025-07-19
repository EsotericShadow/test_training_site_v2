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

## Proposed Solutions

### A. Optimize `next/image` Usage with Vercel Blob

1.  **Set Appropriate `width` and `height`:**
    *   Always provide `width` and `height` props that reflect the *expected rendered size* of the image. This helps prevent layout shifts and allows Next.js to generate correctly sized images from Vercel Blob.
    *   For responsive images, these values act as an aspect ratio.
2.  **Utilize the `sizes` Attribute Effectively:**
    *   The `sizes` attribute is crucial for responsive images. It tells the browser how wide the image will be at different viewport sizes, allowing Next.js to select the most appropriate image source (`srcset`) from Vercel Blob.
    *   **Example:** `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
    *   This tells the browser: "If the viewport is <= 768px, the image will take up 100% of the viewport width. If <= 1200px, 50%. Otherwise, 33%."
    *   **Action:** Review all `Image` components (e.g., in `src/app/components/ui/Logo.tsx`, `src/app/about/AboutPageClient.tsx`, etc.) and ensure `sizes` is accurately defined based on the image's responsive behavior in your CSS.
3.  **Adjust `quality` Prop:**
    *   Experiment with the `quality` prop (default is 75). Lowering it can significantly reduce file size with minimal visual degradation.
    *   **Action:** For images like the logo (`src/app/components/ui/Logo.tsx`), which is flagged for compression, try reducing its `quality` prop (e.g., from 75 to 60 or even lower if visually acceptable).
4.  **Re-evaluate `object-contain` and CSS for Sizing:**
    *   In `src/app/components/ui/Logo.tsx`, the `object-contain` class combined with `width` and `height` props might be causing the image to be scaled in a way that makes the intrinsic size much larger than the rendered size.
    *   **Action:** Re-evaluate the CSS and `Image` props for the logo to ensure the rendered size aligns with the `width`/`height` props and the `sizes` attribute. If `object-contain` is causing issues, consider alternative CSS or adjusting the `width`/`height` to match the actual rendered dimensions more closely.

### B. Optimize Original Image Assets in Vercel Blob

1.  **Pre-optimize Source Images Before Upload:**
    *   Even with Next.js Image Optimization, starting with reasonably sized and compressed source images uploaded to Vercel Blob is beneficial.
    *   **Action:** Before uploading images to Vercel Blob (e.g., via the admin panel or scripts like `scripts/seed-30-why-choose-us-items.js`), use image compression tools (e.g., TinyPNG, ImageOptim) to reduce their initial file size.
2.  **Choose Appropriate Formats:**
    *   Next.js automatically converts to WebP/AVIF, but ensure your original images are in a suitable format (e.g., JPEG for photos, PNG for graphics with transparency).

### C. General Image Best Practices

1.  **Lazy Loading:**
    *   By default, `next/image` lazy loads images that are not in the viewport. Ensure `priority` is only used for LCP images (above-the-fold) to avoid unnecessary loading of non-critical images.
2.  **Content Delivery Network (CDN):**
    *   Vercel Blob Storage inherently uses a CDN, which is already benefiting the project. Ensure `next.config.ts` `remotePatterns` correctly list all image sources, including `*.vercel-storage.com` and any other external image hosts.

By systematically reviewing each `Image` component and applying these optimizations, significant improvements in LCP and overall page performance can be achieved.