import { redirect } from 'next/navigation';
import SetApp from './components/SetApp.js';
import { getAccessState } from '../lib/server/access.js';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const { hasAccess } = await getAccessState();
    if (!hasAccess) redirect('/subscribe');
    return <SetApp />;
  } catch (error) {
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error;
    if (error?.message === 'UNAUTHORIZED') redirect('/login');
    throw error;
  }
}
