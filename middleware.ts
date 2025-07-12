import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // Rotas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tem token e está na página de login, redirecionar para dashboard
  if (token && isPublicRoute && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 