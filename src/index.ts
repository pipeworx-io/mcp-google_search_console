interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Google Search Console MCP Pack
 *
 * SEO and search performance for sites the user owns in Search Console:
 * clicks, impressions, CTR, position, sitemaps, and URL inspection.
 * Requires OAuth connection — gateway injects credentials via
 * _context.google_search_console (scope: webmasters.readonly).
 */


interface GscContext {
  google_search_console?: { accessToken: string };
}

const API = 'https://www.googleapis.com/webmasters/v3';
const INSPECT_API = 'https://searchconsole.googleapis.com/v1';

async function gscFetch(ctx: GscContext, url: string, options: RequestInit = {}) {
  if (!ctx.google_search_console) {
    return { error: 'connection_required', message: 'Connect your Google Search Console account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.google_search_console.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Search Console API error (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'gsc_list_sites',
    description: 'List the sites (properties) in the connected Search Console account, with the permission level for each. Call this first to get the exact siteUrl other tools need (e.g. "https://example.com/" or "sc-domain:example.com").',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'gsc_search_analytics',
    description: 'Query Search Console search-performance data: clicks, impressions, CTR, and average position, grouped by dimensions. Use for "top queries/pages last month", organic CTR, ranking trends. siteUrl must be exactly as returned by gsc_list_sites.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        siteUrl: { type: 'string', description: 'The property URL exactly as listed by gsc_list_sites (e.g. "https://example.com/" or "sc-domain:example.com")' },
        startDate: { type: 'string', description: 'Start date, YYYY-MM-DD (inclusive). Search Console data lags ~2-3 days.' },
        endDate: { type: 'string', description: 'End date, YYYY-MM-DD (inclusive)' },
        dimensions: { type: 'array', items: { type: 'string', enum: ['query', 'page', 'country', 'device', 'date', 'searchAppearance'] }, description: 'Group results by these dimensions (e.g. ["query"] for top queries, ["page"] for top pages, ["date"] for a time series). Default: none (totals).' },
        rowLimit: { type: 'number', description: 'Max rows (default 25, max 25000)' },
        searchType: { type: 'string', enum: ['web', 'image', 'video', 'news', 'discover', 'googleNews'], description: 'Search type / data state (default web)' },
        dimensionFilterGroups: { type: 'array', description: 'Optional Search Console dimensionFilterGroups objects to filter rows (e.g. filter query contains "shoes"). Advanced; pass-through to the API.', items: { type: 'object' } },
      },
      required: ['siteUrl', 'startDate', 'endDate'],
    },
  },
  {
    name: 'gsc_list_sitemaps',
    description: 'List the sitemaps submitted for a property, including last download time, warnings/errors, and indexed counts. Use to audit sitemap health.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        siteUrl: { type: 'string', description: 'The property URL exactly as listed by gsc_list_sites' },
      },
      required: ['siteUrl'],
    },
  },
  {
    name: 'gsc_inspect_url',
    description: 'Inspect a specific URL\'s index status in Google: coverage state, last crawl, canonical, mobile usability, and rich-results status. Use to debug why a page is or isn\'t indexed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        siteUrl: { type: 'string', description: 'The property the URL belongs to, exactly as listed by gsc_list_sites' },
        inspectionUrl: { type: 'string', description: 'The fully-qualified URL to inspect (must belong to siteUrl), e.g. "https://example.com/page"' },
        languageCode: { type: 'string', description: 'BCP-47 language for the result (default "en-US")' },
      },
      required: ['siteUrl', 'inspectionUrl'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as GscContext;
  delete args._context;

  switch (name) {
    case 'gsc_list_sites':
      return gscFetch(context, `${API}/sites`);

    case 'gsc_search_analytics': {
      const { siteUrl, startDate, endDate, dimensions, rowLimit, searchType, dimensionFilterGroups } = args as {
        siteUrl: string; startDate: string; endDate: string; dimensions?: string[];
        rowLimit?: number; searchType?: string; dimensionFilterGroups?: unknown[];
      };
      const body: Record<string, unknown> = {
        startDate,
        endDate,
        rowLimit: Math.min(25000, Math.max(1, rowLimit ?? 25)),
      };
      if (dimensions?.length) body.dimensions = dimensions;
      if (searchType) body.type = searchType;
      if (dimensionFilterGroups?.length) body.dimensionFilterGroups = dimensionFilterGroups;
      return gscFetch(context, `${API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    case 'gsc_list_sitemaps': {
      const siteUrl = args.siteUrl as string;
      return gscFetch(context, `${API}/sites/${encodeURIComponent(siteUrl)}/sitemaps`);
    }

    case 'gsc_inspect_url': {
      const { siteUrl, inspectionUrl, languageCode } = args as { siteUrl: string; inspectionUrl: string; languageCode?: string };
      return gscFetch(context, `${INSPECT_API}/urlInspection/index:inspect`, {
        method: 'POST',
        body: JSON.stringify({ siteUrl, inspectionUrl, languageCode: languageCode ?? 'en-US' }),
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 }, provider: 'google_search_console' } satisfies McpToolExport;
