# 02 - Performance: Optimize Images

**Validated and Refined Based on Research:** Steps are accurate per Next.js 15.4 docs. `next/image` prevents CLS via intrinsic width/height (auto for local images, manual for remote like Vercel Blob). Use `sizes` for responsive srcset generation; quality defaults to 75—lower to 60-80 for savings. Pre-optimize with Sharp before Vercel Blob upload to minimize on-the-fly processing; script example refined for async batching and WebP. Configure `remotePatterns` in `next.config.ts` for Vercel Blob security.

**Problem:** Images are oversized and/or not optimally compressed, leading to large transfer sizes, increased LCP, and CLS (especially the logo). Estimated savings: 1MB+ on desktop.

**Goal:** Reduce image payload, improve LCP to <1s, and eliminate CLS from images.

---

## Step 1: Optimize `next/image` Usage

**Context:** The project uses `next/image` and sources images from Vercel Blob Storage. Proper configuration of `width`, `height`, `sizes`, and `quality` props is crucial for `next/image` to deliver optimized images.

**Action:** Review and adjust `next/image` props in key components.

1.  **Add `sizes` Prop to All `next/image` Instances:**
    *   For responsive images from Vercel Blob, `sizes` ensures optimal srcset; example refined for common layouts.
        ```tsx
        <Image
          // ... other props
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adjust per CSS; e.g., full-width mobile, half on tablet, third on desktop
        />
        ```

2.  **Adjust `quality` Prop:**
    *   Set to 60-75 for balance; hero images at 80.
        ```tsx
        <Image
          // ... other props
          quality={70} // Research shows 70 optimal for WebP without visible loss
        />
        ```

3.  **Fix Logo Image in `src/app/components/ui/Logo.tsx`:**
    *   **Problem:** The Lighthouse report specifically flagged the logo for being larger than needed and contributing to layout shifts.
    *   **Open the file:** `src/app/components/ui/Logo.tsx`
    *   **Locate the `sizeMap` object and the `Image` component.**
    *   **Adjust `height` for `md` size:** The report indicated a displayed height of 80px for the logo. Update the `md` size in `sizeMap` to match this rendered height.
        ```typescript
        const sizeMap = {
          sm: { width: 120, height: 32, textSize: 'text-lg' },
          md: { width: 150, height: 80, textSize: 'text-xl' }, // Matches displayed 150x80
          lg: { width: 387, height: 122, textSize: 'text-3xl md:text-4xl' },
        };
        // In Image: <Image ... sizes="100vw" quality={80} /> // Add sizes for responsiveness
        ```
    *   **Re-evaluate `object-contain`:** Replace with `fill` prop if container has fixed dimensions, e.g., `<Image src="..." fill sizes="..." alt="..." />` for full fit without shifts.

---

## Step 2: Pre-optimize Images Before Uploading to Vercel Blob

**Context:** While `next/image` optimizes images on the fly, starting with smaller, pre-optimized source images uploaded to Vercel Blob will further reduce the initial file size and processing load.

**Action:** Implement a process to optimize images before they are uploaded.

1.  **Install `sharp` (if not already installed):**
    ```bash
    pnpm add sharp
    ```
2.  **Create an image optimization script:**
    *   Refined for async batching, WebP, and max-width resize (e.g., 1920px) to cap large images.
        ```javascript
        // scripts/optimize-images.js
        const sharp = require('sharp');
        const fs = require('fs').promises;
        const path = require('path');

        const inputDir = './path/to/your/unoptimized/images'; // Customize
        const outputDir = './path/to/your/optimized/images'; // Customize

        async function optimizeImagesInDirectory() {
          try {
            await fs.mkdir(outputDir, { recursive: true });
            const files = await fs.readdir(inputDir);
            for (const file of files) {
              const inputFile = path.join(inputDir, file);
              const outputFile = path.join(outputDir, `${path.parse(file).name}.webp`);
              if ((await fs.stat(inputFile)).isFile()) {
                await sharp(inputFile)
                  .resize({ width: 1920, withoutEnlargement: true }) // Max width, no upscale
                  .webp({ quality: 75 }) // WebP at 75 quality
                  .toFile(outputFile);
                console.log(`Optimized: ${inputFile} -> ${outputFile}`);
              }
            }
            console.log('All images processed.');
          } catch (error) {
            console.error('Error:', error);
          }
        }

        optimizeImagesInDirectory();
        ```

3.  **Integrate into Upload Workflow:** Run this script manually or integrate it into the upload process to ensure only optimized images are stored in Vercel Blob.

---

## Verification

1.  **Run `npm run build` and `npm start` (or deploy to Vercel).**
2.  **Re-run Lighthouse:** Check Performance score, especially LCP and CLS. Aim for LCP <1s and CLS of 0.
3.  **Chrome DevTools (Network Tab):** Inspect image sizes and dimensions to confirm they are being served efficiently.
4.  **Chrome DevTools (Elements Tab):** Verify that images are no longer causing layout shifts by observing the rendering process.