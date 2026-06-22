import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase?.auth?.getUser();

    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: jobs, error } = await supabase?.from('crawl_jobs')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

    if (error) {
      console.error('List jobs error:', error);
      return NextResponse?.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    return NextResponse?.json(jobs ?? []);
  } catch (err) {
    console.error('List route error:', err);
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 });
  }
}
