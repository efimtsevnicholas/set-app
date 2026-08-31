import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase auth client for Server Components and server code.
 *
 * Next.js does not allow cookie mutation while a Server Component is rendering.
 * Session refresh persistence is handled by middleware.js, where response cookies
 * may legally be written. The try/catch is intentional and follows the SSR pattern:
 * reads continue to work during render, while cookie refresh is persisted by middleware.
 */
export async function createAuthServerClient() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Cookie writes are forbidden during Server Component rendering.
            // middleware.js refreshes and persists the auth cookies instead.
          }
        },
      },
    }
  );
}

export async function requireUser() {
  const supabase = await createAuthServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error('UNAUTHORIZED');
  return user;
}
