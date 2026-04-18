export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/categories/:path*',
    '/accounts/:path*',
    '/bills/:path*',
    '/goals/:path*',
    '/reports/:path*',
    '/import/:path*',
  ],
};
