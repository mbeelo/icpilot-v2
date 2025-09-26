import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
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