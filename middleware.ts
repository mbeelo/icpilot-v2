import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  console.log('Middleware running for:', request.nextUrl.pathname);

  // Allow demo routes without authentication
  if (request.nextUrl.pathname.startsWith('/demo')) {
    console.log('Allowing demo route');
    return response;
  }

  // Allow public routes
  const publicRoutes = ['/', '/login', '/register', '/blog', '/api/auth']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  )

  if (isPublicRoute) {
    console.log('Allowing public route');
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value;
          console.log(`Middleware cookie get: ${name} = ${cookie ? 'EXISTS' : 'MISSING'}`);
          return cookie;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('Middleware auth check:', { user: !!user, error, url: request.url });

  if (!user || error) {
    console.log('Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/icp-builder',
    '/icp-builder/:path*',
    '/objection-killer',
    '/objection-killer/:path*',
    '/message-generator',
    '/message-generator/:path*',
    '/qualification-framework',
    '/qualification-framework/:path*',
    '/library',
    '/library/:path*'
  ]
}