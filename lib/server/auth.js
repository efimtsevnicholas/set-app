import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function requireUser() {
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (values) => values.forEach(({name,value,options}) => store.set(name,value,options)),
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('UNAUTHORIZED');
  return user;
}
