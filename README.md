# mcp-google_search_console

Google Search Console MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `gsc_list_sites` | List the sites (properties) in the connected Search Console account, with the permission level for each. Call this first to get the exact siteUrl other tools need (e.g. "https://example.com/" or "sc-domain:example.com"). |
| `gsc_search_analytics` | Query Search Console search-performance data: clicks, impressions, CTR, and average position, grouped by dimensions. Use for "top queries/pages last month", organic CTR, ranking trends. siteUrl must be exactly as returned by gsc_list_sites. |
| `gsc_list_sitemaps` | List the sitemaps submitted for a property, including last download time, warnings/errors, and indexed counts. Use to audit sitemap health. |
| `gsc_inspect_url` | Inspect a specific URL's index status in Google: coverage state, last crawl, canonical, mobile usability, and rich-results status. Use to debug why a page is or isn't indexed. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "google_search_console": {
      "url": "https://gateway.pipeworx.io/google_search_console/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Google_search_console data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
