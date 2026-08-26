# mcp-google_search_console

Google Search Console MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/google_search_console/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Google_search_console data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
