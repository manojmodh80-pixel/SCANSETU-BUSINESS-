# ScanSetu Business

Starter multi-retailer smart-link platform.

- Public page: `/?shop=demo` or `/r/demo`
- Dashboard: `/dashboard.html`
- Data: Cloudflare KV
- Admin authentication: `ADMIN_PASSWORD` Worker secret

Before deployment, create a NEW KV namespace and replace the placeholder ID in `wrangler.toml`. Do not reuse the Anantaa KV namespace.
