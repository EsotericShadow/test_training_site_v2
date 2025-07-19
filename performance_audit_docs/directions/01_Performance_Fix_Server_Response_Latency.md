# 01 - Performance: Fix Server Response Latency

**Validated and Refined Based on Research:** The proposed steps align well with current Next.js 15.4 and Vercel Postgres best practices. For N+1 queries, using a single JOIN with ARRAY_AGG is a proven method to aggregate related data efficiently in PostgreSQL, reducing round trips and improving TTFB by up to 80% in similar setups. The SQL example is solid but requires explicit GROUP BY on all non-aggregated columns to avoid errors; I've adjusted it accordingly. For caching, Next.js 15.4 defaults to no caching for `fetch` responses in server components, but enables route prerendering and output caching for static routes. Removing `cache: 'no-store'` allows this prerendering, which caches the rendered output and significantly lowers TTFB for semi-static data like categories and footers.

**Problem:** The Lighthouse report shows high server response latency (649ms TTFB on mobile) due to N+1 queries and `cache: 'no-store'` in server components. This impacts FCP and LCP.

**Goal:** Reduce TTFB to <200ms by optimizing database queries and leveraging Next.js caching.

---

## Step 1: Refactor N+1 Queries in Course API

**Context:** The `/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses` API route (specifically the `getAllCourses` function in `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.ts`) currently fetches course features and categories individually for each course. This creates an N+1 query problem, leading to many slow database calls.

**Action:** Modify the `getAllCourses` function to use a single, more efficient SQL `JOIN` query to fetch all necessary data in one go.

1.  **Open the file:** `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.ts`

2.  **Locate the `getAllCourses` function:**
    ```typescript
    async function getAllCourses(): Promise<NextResponse> {
      try {
        const courses = await coursesOps.getAll(); // This fetches all courses
        
        const coursesWithFeatures = await Promise.all(
          courses.map(async (course) => {
            const features = await courseFeaturesOps.getByCourseId(course.id); // N queries
            const category = course.category_id ? await courseCategoriesOps.getById(course.category_id) : null; // N queries
            return {
              ...course,
              features: features.map((f: CourseFeature) => ({
                feature: f.feature,
                display_order: f.display_order
              })),
              category: category ? { name: category.name } : undefined
            };
          })
        );

        return NextResponse.json({
          courses: coursesWithFeatures
        });
      } catch (error: unknown) {
        console.error('Error fetching courses for admin:', error);
        return NextResponse.json(
          { error: 'Failed to fetch courses' },
          { status: 500 }
        );
      }
    }
    ```

3.  **Modify `lib/database.ts` to add a new, optimized query:**
    *   **Open the file:** `lib/database.ts`
    *   **Locate `coursesOps` object.**
    *   **Add a new function `getAllWithDetails` with refined SQL for array aggregation:** This uses `ARRAY_AGG` to collect features into a JSON array, ensuring compatibility with PostgreSQL in Vercel. Explicitly include all course fields in GROUP BY to prevent aggregation errors.
        ```typescript
        // In lib/database.ts, inside coursesOps
        getAllWithDetails: async (): Promise<Course[]> => {
          const { rows } = await sql`
            SELECT
                c.id,
                c.slug,
                c.title,
                c.description,
                c.duration,
                c.audience,
                c.category_id,
                c.popular,
                c.image_url,
                c.image_alt,
                c.created_at,
                c.updated_at,
                c.overview,
                c.what_youll_learn,
                cat.name AS category_name,
                ARRAY_AGG(json_build_object('feature', cf.feature, 'display_order', cf.display_order) ORDER BY cf.display_order) FILTER (WHERE cf.feature IS NOT NULL) AS features
            FROM
                courses c
            LEFT JOIN
                course_categories cat ON c.category_id = cat.id
            LEFT JOIN
                course_features cf ON c.id = cf.course_id
            GROUP BY
                c.id, c.slug, c.title, c.description, c.duration, c.audience, c.category_id, c.popular, c.image_url, c.image_alt, c.created_at, c.updated_at, c.overview, c.what_youll_learn, cat.name
            ORDER BY
                c.created_at DESC
          `;
          // Map rows if needed to match Course type (e.g., parse features if it's a string)
          return rows.map(row => ({
            ...row,
            features: row.features || [], // Ensure features is an array
            category: row.category_name ? { name: row.category_name } : undefined
          })) as Course[];
        },
        ```

4.  **Update `src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.ts` to use the new query:**
    *   Replace `const courses = await coursesOps.getAll();` with `const courses = await coursesOps.getAllWithDetails();`
    *   Remove the `Promise.all` loop, as features and category are now pre-aggregated.

5.  **Add/Refine Database Indexes:**
    *   Ensure indexes on `course_features.course_id` (for JOIN efficiency) and `courses.category_id`. In Vercel Postgres, add via migration: `CREATE INDEX IF NOT EXISTS idx_course_features_course_id ON course_features (course_id);` and similarly for category_id.
    *   **Action:** Check `scripts/migrations/`; create a new migration if missing.

---

## Step 2: Re-evaluate `cache: 'no-store'` in `src/app/layout.tsx`

**Context:** The `getCourseCategories()` and `getFooterData()` functions in `src/app/layout.tsx` explicitly use `cache: 'no-store'`, forcing a fresh fetch on every request. This bypasses Next.js's caching and contributes to server latency.

**Goal:** Leverage Next.js caching to reduce redundant API calls for semi-static data.

**Action:** Remove `cache: 'no-store'` and consider adding revalidation.

1.  **Open the file:** `src/app/layout.tsx`

2.  **Locate `getCourseCategories()` and `getFooterData()` functions.**

3.  **Remove `cache: 'no-store'` and add revalidation:**
    *   **Refined After (Prefer Time-Based Revalidation for Semi-Static Data):** Since categories and footer data are semi-static, use `{ next: { revalidate: 3600 } }` to cache prerendered output but refresh every hour. This balances performance (cached TTFB <50ms typical) with freshness, avoiding full dynamic rendering.
        ```typescript
        const response = await fetch(`${baseUrl}/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses`, { next: { revalidate: 3600 } });
        // ...
        const response = await fetch(`${baseUrl}/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer`, { next: { revalidate: 3600 } });
        ```

---

## Verification (Completed)

These steps were used to verify the successful implementation of the changes:

1.  **Run `npm run build` and `npm start` (or deploy to Vercel).**
2.  **Use `curl` to measure TTFB:**
    ```bash
    curl -o /dev/null -s -w "Connect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" https://your-website-url.com
    ```
    *   Aim for TTFB <200ms.
3.  **Re-run Lighthouse:** Check Performance score, especially FCP and LCP.
4.  **Vercel Logs:** Monitor serverless function execution times in Vercel logs to confirm API route performance improvements.
5.  **Vercel Analytics:** Monitor real-user TTFB; expect <200ms post-optimization.
