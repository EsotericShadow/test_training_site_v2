# API Route Handler Patterns for `withSecureAuth`

This document outlines the correct TypeScript patterns for creating Next.js API Route Handlers that are wrapped with the `withSecureAuth` Higher-Order Component (HOC). Following these patterns is crucial to avoid complex type errors during the build process.

## The Core Problem

The `withSecureAuth` HOC complicates Next.js's standard type inference for route handlers. This can lead to build failures with errors like `Type "..." is not a valid type for the function's second argument`.

The solution is to be more explicit with type definitions. The correct pattern depends on whether the route is dynamic or non-dynamic.

---

## Pattern 1: Dynamic Routes (e.g., `.../[id]/route.ts`)

For dynamic routes that include parameters in the URL, the established pattern is to use a `RouteContext` interface.

### Example: `src/app/api/.../courses/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withSecureAuth, AuthResult } from '../../../../../../lib/secure-jwt';
import { coursesOps } from '../../../../../../lib/database';

// 1. Define a RouteContext interface to describe the shape of the context object.
//    `params` is a Promise as required by Next.js 15+.
//    `auth` is the object injected by our HOC.
interface RouteContext {
  params: Promise<{
    id: string;
  }>;
  auth: AuthResult;
}

// 2. The handler function uses the RouteContext interface for its second argument.
async function getCourse(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id, 10);
    
    // ... handler logic
    
    return NextResponse.json({ course });
  } catch (error: unknown) {
    // ... error handling
  }
}

// 3. The export does not require an explicit type annotation.
export const GET = withSecureAuth(getCourse);
```

---

## Pattern 2: Non-Dynamic Routes (e.g., `.../files/route.ts`)

For non-dynamic routes, a simpler signature often works. However, when the compiler fails, the most robust solution is to explicitly type the **export** using a shared type alias.

### Example: `src/app/api/.../files/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { filesOps } from '../../../../../lib/database';

// 1. Define a generic handler type. This exact signature has been shown
//    to satisfy the compiler for non-dynamic routes under the HOC.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse>;

// 2. The handler function itself can use a simpler signature.
//    It must accept the two arguments that the HOC will pass.
async function getAllFiles(
  _request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  try {
    const files = await filesOps.getAll();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// 3. Explicitly type the export with the handler type.
//    This is the crucial step that resolves the type ambiguity.
export const GET: AppRouteHandlerFn = withSecureAuth(getAllFiles);
```
