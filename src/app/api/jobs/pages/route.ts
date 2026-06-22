import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Confirm the job belongs to this user
    const { data: job, error: jobError } = await supabase
      .from('crawl_jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: pages, error: pagesError } = await supabase
      .from('crawl_pages')
      .select('id, url, title, status_code, markdown, links, ai_extraction, error_message, crawled_at')
      .eq('job_id', jobId)
      .order('crawled_at', { ascending: true });

    if (pagesError) {
      console.error('Pages fetch error:', pagesError);
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    return NextResponse.json(pages ?? []);
  } catch (err) {
    console.error('Pages route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
