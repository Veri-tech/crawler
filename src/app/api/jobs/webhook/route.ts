import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    // Verify shared secret
    const incomingSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.VERICRAWL_WEBHOOK_SECRET;

    if (!expectedSecret || incomingSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await req.json();

    // Crawl4AI sends task_id and results in the payload
    const taskId: string | undefined = payload?.task_id || payload?.id;
    const jobIdHeader = req.headers.get('x-job-id');

    if (!taskId && !jobIdHeader) {
      return NextResponse.json({ error: 'Missing task_id in payload' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Look up the job by worker_task_id or job id from header
    let jobQuery = supabase.from('crawl_jobs').select('*');
    if (jobIdHeader) {
      jobQuery = jobQuery.eq('id', jobIdHeader);
    } else {
      jobQuery = jobQuery.eq('worker_task_id', taskId);
    }

    const { data: job, error: jobError } = await jobQuery.single();

    if (jobError || !job) {
      console.error('Webhook: job not found for task_id', taskId, jobIdHeader);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Idempotency check — skip if already terminal
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const isSuccess = payload?.status === 'completed' || payload?.success === true;
    const isFailure = payload?.status === 'failed' || payload?.error;

    if (isFailure) {
      const errMsg = payload?.error || payload?.error_message || 'Worker reported failure';
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error_message: String(errMsg).slice(0, 500),
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({ ok: true });
    }

    if (!isSuccess) {
      // Intermediate progress update — update page counts if provided
      if (payload?.pages_completed !== undefined || payload?.pages_discovered !== undefined) {
        await supabase
          .from('crawl_jobs')
          .update({
            pages_discovered: payload.pages_discovered ?? job.pages_discovered,
            pages_completed: payload.pages_completed ?? job.pages_completed,
            pages_failed: payload.pages_failed ?? job.pages_failed,
          })
          .eq('id', job.id);
      }
      return NextResponse.json({ ok: true });
    }

    // Success — process results
    const results: Array<{
      url?: string;
      title?: string;
      status_code?: number;
      markdown?: string;
      links?: string[];
      error?: string;
    }> = payload?.results || payload?.pages || [];

    let pagesCompleted = 0;
    let pagesFailed = 0;

    if (results.length > 0) {
      const pageRows = results.map((r) => {
        const hasError = !!r.error;
        if (hasError) pagesFailed++;
        else pagesCompleted++;

        return {
          job_id: job.id,
          url: r.url || '',
          title: r.title || null,
          status_code: r.status_code || null,
          markdown: r.markdown || null,
          links: r.links || [],
          ai_extraction: null,
          error_message: r.error || null,
          crawled_at: new Date().toISOString(),
        };
      });

      // Insert pages in batches of 500 to avoid payload limits
      const BATCH = 500;
      for (let i = 0; i < pageRows.length; i += BATCH) {
        const batch = pageRows.slice(i, i + BATCH);
        const { error: pagesError } = await supabase.from('crawl_pages').insert(batch);
        if (pagesError) {
          console.error('Webhook: pages insert error', pagesError);
        }
      }
    }

    // Update job to completed
    await supabase
      .from('crawl_jobs')
      .update({
        status: 'completed',
        pages_discovered: results.length,
        pages_completed: pagesCompleted,
        pages_failed: pagesFailed,
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', job.id);

    // Upsert usage row for current billing period
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    await supabase.rpc('increment_usage', {
      p_user_id: job.user_id,
      p_billing_period: billingPeriod,
      p_pages: pagesCompleted,
    });

    return NextResponse.json({ ok: true, pagesInserted: pagesCompleted });
  } catch (err) {
    console.error('Webhook route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
