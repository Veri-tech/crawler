import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_PAGES_HARD_CAP = 2000;
const MONTHLY_QUOTA = 10000;

function buildCrawlerConfig(mode: string, maxPages: number) {
  if (mode === 'scrape') {
    // Single URL — no deep crawl strategy
    return {
      crawler_config: {
        extraction_strategy: {
          type: 'NoExtractionStrategy',
        },
      },
    };
  }

  const deepCrawlStrategy = {
    type: 'BFSDeepCrawlStrategy',
    max_depth: 5,
    max_pages: maxPages,
  };

  if (mode === 'map') {
    // Discovery only — no content extraction
    return {
      crawler_config: {
        deep_crawl_strategy: deepCrawlStrategy,
        extraction_strategy: null,
      },
    };
  }

  // crawl mode — full BFS with content extraction
  return {
    crawler_config: {
      deep_crawl_strategy: deepCrawlStrategy,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { start_url, mode, max_pages } = body;

    // Validate inputs
    if (!start_url || typeof start_url !== 'string') {
      return NextResponse.json({ error: 'start_url is required' }, { status: 400 });
    }
    if (!['scrape', 'map', 'crawl'].includes(mode)) {
      return NextResponse.json({ error: 'mode must be scrape, map, or crawl' }, { status: 400 });
    }
    try {
      new URL(start_url);
    } catch {
      return NextResponse.json({ error: 'start_url must be a valid URL' }, { status: 400 });
    }

    // Cap max_pages server-side
    const cappedMaxPages = mode === 'scrape' ? 1 : Math.min(Number(max_pages) || MAX_PAGES_HARD_CAP, MAX_PAGES_HARD_CAP);

    // Check monthly quota
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const { data: usageRow } = await supabase
      .from('crawl_usage')
      .select('pages_used')
      .eq('user_id', user.id)
      .eq('billing_period', billingPeriod)
      .single();

    const currentUsage = usageRow?.pages_used ?? 0;
    if (currentUsage >= MONTHLY_QUOTA) {
      return NextResponse.json(
        { error: 'Monthly quota of 10,000 pages exceeded. Upgrade your plan to continue.' },
        { status: 429 }
      );
    }

    // Insert job row with status 'queued'
    const { data: job, error: insertError } = await supabase
      .from('crawl_jobs')
      .insert({
        user_id: user.id,
        mode,
        start_url,
        status: 'queued',
        max_pages: cappedMaxPages,
        config: { max_depth: 5 },
      })
      .select()
      .single();

    if (insertError || !job) {
      console.error('Job insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Build webhook URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vericrawl5637.builtwithrocket.new';
    const webhookUrl = `${siteUrl}/api/jobs/webhook`;

    // Submit to Crawl4AI worker
    const crawl4aiBase = process.env.CRAWL4AI_BASE_URL;
    const crawl4aiToken = process.env.CRAWL4AI_API_TOKEN;
    const webhookSecret = process.env.VERICRAWL_WEBHOOK_SECRET;

    if (!crawl4aiBase) {
      // Worker not configured — mark job as failed
      await supabase
        .from('crawl_jobs')
        .update({ status: 'failed', error_message: 'Crawl4AI worker URL not configured (CRAWL4AI_BASE_URL missing)' })
        .eq('id', job.id);
      return NextResponse.json({ error: 'Crawl worker not configured' }, { status: 503 });
    }

    const workerPayload = {
      urls: [start_url],
      ...buildCrawlerConfig(mode, cappedMaxPages),
      webhook_config: {
        webhook_url: webhookUrl,
        webhook_data_in_payload: true,
        webhook_headers: {
          'X-Webhook-Secret': webhookSecret || '',
          'X-Job-Id': job.id,
        },
      },
    };

    const workerHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (crawl4aiToken) {
      workerHeaders['Authorization'] = `Bearer ${crawl4aiToken}`;
    }

    const workerRes = await fetch(`${crawl4aiBase}/crawl/job`, {
      method: 'POST',
      headers: workerHeaders,
      body: JSON.stringify(workerPayload),
    });

    if (!workerRes.ok) {
      const errText = await workerRes.text();
      console.error('Crawl4AI worker error:', errText);
      await supabase
        .from('crawl_jobs')
        .update({ status: 'failed', error_message: `Worker rejected job: ${errText.slice(0, 200)}` })
        .eq('id', job.id);
      return NextResponse.json({ error: 'Worker rejected the job', detail: errText }, { status: 502 });
    }

    const workerData = await workerRes.json();
    const taskId = workerData?.task_id || workerData?.id || null;

    // Update job to 'running' with the worker task_id
    await supabase
      .from('crawl_jobs')
      .update({ status: 'running', worker_task_id: taskId, started_at: new Date().toISOString() })
      .eq('id', job.id);

    return NextResponse.json({ jobId: job.id, taskId }, { status: 201 });
  } catch (err) {
    console.error('Submit route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
