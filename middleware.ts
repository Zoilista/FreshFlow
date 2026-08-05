import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const activeLocale = routing.locales.includes(segments[0] as typeof routing.locales[number]) ? segments[0] : routing.defaultLocale;
  const pathWithoutLocale = routing.locales.includes(segments[0] as typeof routing.locales[number]) 
    ? '/' + segments.slice(1).join('/') 
    : pathname;

  const isPublicRoute =
    pathWithoutLocale === '/' ||
    pathWithoutLocale === '' ||
    pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register') ||
    pathWithoutLocale.startsWith('/pricing') ||
    pathWithoutLocale.startsWith('/api/');

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${activeLocale}/login`;
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/register'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${activeLocale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api/*         (API routes — handled by route.ts files directly)
     * - static assets (svg, png, jpg, …)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
