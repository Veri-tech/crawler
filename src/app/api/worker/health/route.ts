import { NextResponse } from 'next/server';

// Pings the Crawl4AI worker's /health endpoint server-side, so the worker URL/token
// never reaches the browser. Returns a simple online/offline status for the dashboard
// badge to render honestly instead of a hardcoded "Worker online" label.

export async function GET() {
  const crawl4aiBase = process.env.CRAWL4AI_BASE_URL;

  if (!crawl4aiBase) {
    return NextResponse.json({ online: false, reason: 'not_configured' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // don't hang the dashboard waiting on a dead worker

    const res = await fetch(`${crawl4aiBase}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ online: false, reason: 'unhealthy', status: res.status });
    }

    return NextResponse.json({ online: true });
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'unreachable';
    return NextResponse.json({ online: false, reason });
  }
}
