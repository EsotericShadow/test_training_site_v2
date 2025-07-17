
// types/api.ts

import { NextRequest, NextResponse } from 'next/server';
import { AuthResult } from '../lib/secure-jwt';

export type SecureAdminApiHandler = (
  req: NextRequest,
  context: { params: Promise<string> | unknown; auth: AuthResult }
) => Promise<NextResponse>;
