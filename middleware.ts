import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Allow demo routes without authentication
    if (req.nextUrl.pathname.startsWith('/demo')) {
      return NextResponse.next();
    }

    // For all other protected routes, the withAuth wrapper will handle authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow demo routes
        if (req.nextUrl.pathname.startsWith('/demo')) {
          return true;
        }

        // Log for debugging
        console.log('Middleware checking auth for:', req.nextUrl.pathname, 'Token exists:', !!token);

        // Require authentication for all other protected routes
        return !!token;
      }
    },
    pages: {
      signIn: '/login',
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/icp-builder/:path*',
    '/objection-killer/:path*',
    '/message-generator/:path*',
    '/qualification-framework/:path*',
    '/library/:path*'
  ]
}