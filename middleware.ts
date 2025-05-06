import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // LOG para depuración
  console.log('Middleware:', { pathname, token });

  // Public paths que no requieren token
  const publicPaths = ['/', '/login', '/register'];
  if (publicPaths.includes(pathname)) {
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
        // Si ya hay token válido y voy a /login o /register…
        // Solo redirigir login y register a la página de análisis si hay token válido
        if (pathname === '/login' || pathname === '/register') {
          return NextResponse.redirect(new URL('/analyze', request.url));
        }
        return NextResponse.next();
      } catch (err) {
        console.error('JWT verify publicPath error:', err);
        return NextResponse.next();
      }
    }
    // sin token, dejo pasar a paths públicos
    return NextResponse.next();
  }

  // Rutas protegidas específicas que requieren autenticación
  const protectedPaths = ['/analyze'];
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // Sin token → redirijo a login
    if (!token) {
      console.log('Middleware: sin token → redirijo a /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Middleware secret:', process.env.JWT_SECRET);

    try {
      // Con token válido → dejo pasar
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
      console.log('Middleware: token válido → dejo pasar a', pathname);
      return NextResponse.next();
    } catch (err) {
      console.error('JWT verify protectedPath error:', err);
      console.log('Middleware: token inválido → redirijo a /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Para el resto de rutas, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};