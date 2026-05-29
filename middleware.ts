import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In a real implementation with Firebase Auth and Next.js, reading auth state from cookies
// or using Firebase Admin is required for middleware.
// For this client-heavy scaffold, we'll implement route guards largely in layout/components using AuthContext,
// but we set up the shell here as requested.
// Full server-side session checks require passing Firebase IdToken to cookies.

export function middleware(request: NextRequest) {
  // Let client-side layout handle the hard redirects for now 
  // since we rely entirely on the client auth context.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
