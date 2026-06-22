import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that don't require auth — the login/signup page, plus anything under /api
// that needs to be publicly reachable (the Crawl4AI webhook callback, specifically,
// since that's called BY the worker, not by a logged-in browser session).
const PUBLIC_PATHS = ['/sign-up-login-screen', '/api/jobs/webhook', '/api/worker/health'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  // This response object is what we attach refreshed cookies to. Starting from
  // NextResponse.next() (not a fresh Response) is required — overwriting it loses
  // the original request context Next.js needs downstream.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write the refreshed cookies onto BOTH the incoming request (so this same
          // middleware invocation sees them) and the outgoing response (so the browser
          // actually receives the updated session). Skipping either half is what causes
          // the "looks logged in but server can't validate it" symptom.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: this call is what actually refreshes the session token if it's expired
  // or about to expire. Removing this call is the single most common way to break
  // Supabase auth in a Next.js app — do not delete it even if it looks redundant.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated visitor hitting a protected page -> bounce to login.
  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL('/sign-up-login-screen', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated visitor hitting the login page -> send them to the dashboard
  // instead of showing the login form again.
  if (user && pathname === '/sign-up-login-screen') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on every request EXCEPT:
     * - static files (_next/static, _next/image)
     * - favicon
     * - common image extensions
     * Adjust this list if you add other static asset types.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
