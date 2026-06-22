export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type CrawlMode = 'scrape' | 'map' | 'crawl';

export interface CrawlJob {
  id: string;
  user_id: string;
  mode: CrawlMode;
  start_url: string;
  status: JobStatus;
  config: Record<string, unknown>;
  max_pages: number;
  worker_task_id: string | null;
  pages_discovered: number;
  pages_completed: number;
  pages_failed: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CrawlPage {
  id: string;
  job_id: string;
  url: string;
  title: string | null;
  status_code: number | null;
  markdown: string | null;
  links: string[];
  ai_extraction: Record<string, unknown> | null;
  error_message: string | null;
  crawled_at: string;
}

export const MOCK_JOBS: CrawlJob[] = [
  {
    id: 'job-001',
    user_id: 'user-abc',
    mode: 'crawl',
    start_url: 'https://docs.stripe.com',
    status: 'completed',
    config: { max_depth: 5 },
    max_pages: 2000,
    worker_task_id: 'task-f8a2b1c3',
    pages_discovered: 1847,
    pages_completed: 1832,
    pages_failed: 15,
    error_message: null,
    created_at: '2026-06-22T06:14:00Z',
    started_at: '2026-06-22T06:14:12Z',
    completed_at: '2026-06-22T07:02:44Z',
  },
  {
    id: 'job-002',
    user_id: 'user-abc',
    mode: 'map',
    start_url: 'https://nextjs.org',
    status: 'running',
    config: { max_depth: 5 },
    max_pages: 500,
    worker_task_id: 'task-d3e9f0a1',
    pages_discovered: 312,
    pages_completed: 289,
    pages_failed: 2,
    error_message: null,
    created_at: '2026-06-22T08:50:00Z',
    started_at: '2026-06-22T08:50:08Z',
    completed_at: null,
  },
  {
    id: 'job-003',
    user_id: 'user-abc',
    mode: 'scrape',
    start_url: 'https://vercel.com/blog/turbopack-benchmarks',
    status: 'completed',
    config: {},
    max_pages: 1,
    worker_task_id: 'task-c1a2d3e4',
    pages_discovered: 1,
    pages_completed: 1,
    pages_failed: 0,
    error_message: null,
    created_at: '2026-06-22T05:30:00Z',
    started_at: '2026-06-22T05:30:02Z',
    completed_at: '2026-06-22T05:30:09Z',
  },
  {
    id: 'job-004',
    user_id: 'user-abc',
    mode: 'crawl',
    start_url: 'https://tailwindcss.com/docs',
    status: 'failed',
    config: { max_depth: 3 },
    max_pages: 300,
    worker_task_id: 'task-b9c8d7e6',
    pages_discovered: 42,
    pages_completed: 0,
    pages_failed: 42,
    error_message: 'Worker connection timeout after 30s — task-b9c8d7e6 did not respond',
    created_at: '2026-06-21T22:10:00Z',
    started_at: '2026-06-21T22:10:05Z',
    completed_at: '2026-06-21T22:40:11Z',
  },
  {
    id: 'job-005',
    user_id: 'user-abc',
    mode: 'map',
    start_url: 'https://linear.app',
    status: 'completed',
    config: { max_depth: 4 },
    max_pages: 1000,
    worker_task_id: 'task-a0b1c2d3',
    pages_discovered: 621,
    pages_completed: 619,
    pages_failed: 2,
    error_message: null,
    created_at: '2026-06-21T14:20:00Z',
    started_at: '2026-06-21T14:20:09Z',
    completed_at: '2026-06-21T14:55:33Z',
  },
  {
    id: 'job-006',
    user_id: 'user-abc',
    mode: 'scrape',
    start_url: 'https://github.com/vercel/next.js/blob/main/README.md',
    status: 'completed',
    config: {},
    max_pages: 1,
    worker_task_id: 'task-e1f2a3b4',
    pages_discovered: 1,
    pages_completed: 1,
    pages_failed: 0,
    error_message: null,
    created_at: '2026-06-21T10:05:00Z',
    started_at: '2026-06-21T10:05:03Z',
    completed_at: '2026-06-21T10:05:11Z',
  },
  {
    id: 'job-007',
    user_id: 'user-abc',
    mode: 'crawl',
    start_url: 'https://supabase.com/docs',
    status: 'queued',
    config: { max_depth: 5 },
    max_pages: 2000,
    worker_task_id: null,
    pages_discovered: 0,
    pages_completed: 0,
    pages_failed: 0,
    error_message: null,
    created_at: '2026-06-22T09:10:00Z',
    started_at: null,
    completed_at: null,
  },
  {
    id: 'job-008',
    user_id: 'user-abc',
    mode: 'map',
    start_url: 'https://railway.app/docs',
    status: 'cancelled',
    config: { max_depth: 3 },
    max_pages: 200,
    worker_task_id: 'task-f0e1d2c3',
    pages_discovered: 88,
    pages_completed: 61,
    pages_failed: 0,
    error_message: null,
    created_at: '2026-06-20T16:45:00Z',
    started_at: '2026-06-20T16:45:07Z',
    completed_at: null,
  },
];

export const MOCK_PAGES: CrawlPage[] = [
  {
    id: 'page-001',
    job_id: 'job-001',
    url: 'https://docs.stripe.com',
    title: 'Stripe Documentation',
    status_code: 200,
    markdown: `# Stripe Documentation\n\nWelcome to the Stripe docs. Start integrating Stripe's products and tools to accept payments, send payouts, and manage your business online.\n\n## Get started\n\n- [Quickstart guide](/docs/quickstart)\n- [Accept a payment](/docs/payments/accept-a-payment)\n- [Set up subscriptions](/docs/billing/subscriptions/overview)\n\n## Popular topics\n\n### Payments\nBuild an integration to accept payments online or in person.\n\n### Billing\nCreate and manage subscriptions and recurring revenue.\n\n### Connect\nBuild a platform or marketplace and pay out sellers or service providers globally.`,
    links: ['https://docs.stripe.com/quickstart', 'https://docs.stripe.com/payments'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:15:01Z',
  },
  {
    id: 'page-002',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/payments/accept-a-payment',
    title: 'Accept a Payment — Stripe Docs',
    status_code: 200,
    markdown: `# Accept a Payment\n\nLearn how to build a payment form and confirm a PaymentIntent.\n\n## Before you begin\n\nRegister for a Stripe account and obtain your API keys from the Dashboard.\n\n## Step 1: Set up Stripe\n\n\`\`\`bash\nnpm install stripe @stripe/stripe-js\n\`\`\`\n\n## Step 2: Create a PaymentIntent\n\nA PaymentIntent tracks the customer's payment lifecycle, keeping track of any failed payment attempts and ensuring the customer is only charged once.\n\n\`\`\`javascript\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: 2000,\n  currency: 'usd',\n});\n\`\`\``,
    links: ['https://docs.stripe.com/payments/payment-intents', 'https://docs.stripe.com/api/payment_intents'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:15:14Z',
  },
  {
    id: 'page-003',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/billing/subscriptions/overview',
    title: 'Subscriptions Overview — Stripe Billing',
    status_code: 200,
    markdown: `# Subscriptions\n\nStripe Billing lets you charge customers on a recurring basis. Build flexible subscription logic with trials, discounts, metered billing, and more.\n\n## Core concepts\n\n**Products** define what you're selling. **Prices** define how much and how often. **Subscriptions** tie a customer to a price and handle recurring billing automatically.\n\n## Creating a subscription\n\n\`\`\`javascript\nconst subscription = await stripe.subscriptions.create({\n  customer: 'cus_xxx',\n  items: [{ price: 'price_xxx' }],\n});\n\`\`\``,
    links: ['https://docs.stripe.com/billing/subscriptions/trials'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:15:28Z',
  },
  {
    id: 'page-004',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/connect',
    title: 'Connect — Stripe Docs',
    status_code: 200,
    markdown: `# Stripe Connect\n\nStripe Connect is the fastest way to integrate payments into your platform or marketplace for iOS, Android, and the web.\n\n## Account types\n\n- **Standard**: Stripe-hosted dashboard, full Stripe branding\n- **Express**: Limited Stripe dashboard, your branding on hosted onboarding\n- **Custom**: Fully white-labeled, you control the entire experience\n\n## Getting started\n\nChoose an account type, then use the Connect Onboarding API to collect required information from your users.`,
    links: ['https://docs.stripe.com/connect/accounts'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:15:44Z',
  },
  {
    id: 'page-005',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/api',
    title: 'API Reference — Stripe Docs',
    status_code: 200,
    markdown: `# Stripe API Reference\n\nThe Stripe API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.\n\n## Authentication\n\nThe Stripe API uses API keys to authenticate requests. You can view and manage your API keys in the Stripe Dashboard.\n\n\`\`\`bash\ncurl https://api.stripe.com/v1/charges \\\n  -u sk_test_xxx:\n\`\`\``,
    links: ['https://docs.stripe.com/api/charges', 'https://docs.stripe.com/api/customers'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:16:02Z',
  },
  {
    id: 'page-006',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/webhooks',
    title: 'Webhooks — Stripe Docs',
    status_code: 200,
    markdown: `# Webhooks\n\nListen for events on your Stripe account so your integration can automatically trigger reactions.\n\n## How webhooks work\n\nStripe sends webhook events to notify your application when an event happens in your account. Stripe sends a POST request to your endpoint with a JSON payload.\n\n## Receiving events\n\n1. Create a webhook endpoint in your Dashboard\n2. Handle the events your integration needs\n3. Return a 200 response quickly\n\n\`\`\`javascript\napp.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {\n  const sig = req.headers['stripe-signature'];\n  // verify + handle event\n  res.json({ received: true });\n});\n\`\`\``,
    links: ['https://docs.stripe.com/webhooks/best-practices'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:16:19Z',
  },
  {
    id: 'page-007',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/radar',
    title: 'Radar — Fraud Protection',
    status_code: 200,
    markdown: `# Stripe Radar\n\nProtect your business from fraud with machine learning that adapts to your business.\n\n## How Radar works\n\nRadar evaluates every transaction using machine learning models trained on data from millions of businesses. It assigns each payment a risk score and can block or allow payments based on rules you configure.\n\n## Radar rules\n\nWrite rules to take action on payments based on their attributes. Rules use a simple expression language.`,
    links: ['https://docs.stripe.com/radar/rules'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:16:38Z',
  },
  {
    id: 'page-008',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/terminal',
    title: 'Terminal — In-person Payments',
    status_code: 200,
    markdown: `# Stripe Terminal\n\nAccept in-person payments with Stripe's programmable point-of-sale platform.\n\n## Supported readers\n\n- **BBPOS WisePOS E** — countertop reader\n- **Stripe Reader M2** — handheld reader\n- **BBPOS Chipper 2X BT** — mobile reader\n\n## Integration path\n\n1. Install the Terminal SDK for your platform\n2. Connect to a reader\n3. Create a PaymentIntent on your server\n4. Collect payment on the reader`,
    links: ['https://docs.stripe.com/terminal/quickstart'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:17:00Z',
  },
  {
    id: 'page-009',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/identity',
    title: 'Identity — Stripe Docs',
    status_code: 200,
    markdown: `# Stripe Identity\n\nProgrammatically confirm the identity of global users to prevent fraud, streamline risk operations, and increase trust and safety.\n\n## Verification sessions\n\nA VerificationSession is the programmatic representation of your verification. It contains details about the type of verification, such as what verification check to perform.`,
    links: ['https://docs.stripe.com/identity/verification-sessions'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:17:14Z',
  },
  {
    id: 'page-010',
    job_id: 'job-001',
    url: 'https://docs.stripe.com/tax',
    title: 'Stripe Tax — Automated Tax Compliance',
    status_code: 200,
    markdown: `# Stripe Tax\n\nAutomate tax compliance for your business. Calculate, collect, and report taxes across 40+ countries and all US states.\n\n## Supported tax types\n\n- Sales tax (US)\n- VAT (EU, UK, Australia, and more)\n- GST (Canada, Australia, New Zealand, India)\n\n## Integration\n\nAdd \`automatic_tax: { enabled: true }\` to your PaymentIntents, Subscriptions, or Checkout Sessions.`,
    links: ['https://docs.stripe.com/tax/set-up'],
    ai_extraction: null,
    error_message: null,
    crawled_at: '2026-06-22T06:17:28Z',
  },
];

export const MOCK_USAGE = {
  pages_used: 3224,
  quota: 10000,
  jobs_run: 8,
  jobs_completed: 5,
  jobs_failed: 1,
  billing_period: '2026-06',
};