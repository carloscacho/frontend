import { NextResponse } from 'next/server';

export function middleware(request) {
  const userCookies = request.cookies.get('usuarioData')?.value;
  if(!userCookies) return NextResponse.next();
  const {token} = JSON.parse(userCookies);
  const { pathname } = request.nextUrl;

  // Se já estiver logado e tentar acessar login ou raiz do admin, redireciona para home
  if (token && (pathname === '/admin/login' || pathname === '/admin')) {
    return NextResponse.redirect(new URL('/admin/home', request.url));
  }

  // Proteção de rotas admin (exceto login)
  if (!token && pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
