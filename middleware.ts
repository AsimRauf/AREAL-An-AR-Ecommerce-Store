import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only redirect custom auth routes, not NextAuth.js routes
  if (pathname === '/api/auth/signin' || pathname === '/api/auth/signup') {
    const pageRoute = pathname.replace('/api/auth', '/auth')
    return NextResponse.redirect(new URL(pageRoute, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/signin', '/api/auth/signup']
}