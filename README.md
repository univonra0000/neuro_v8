# NEURO SYNC V8 — FINAL CLOUDFLARE FIX

This build preserves the existing Cloudflare Durable Object class `NeuroSyncRoom`.

## GitHub deployment
1. Replace `src/worker.js` and `wrangler.toml` in `univonra0000/neuro_v8` on `main`.
2. Commit the changes.
3. In Cloudflare, retry the build.

Build command: None
Deploy command: `npx wrangler deploy`
Root directory: `/`

Do not rename `NeuroSyncRoom` to `NeuroRoom`; the existing deployed Durable Object namespace is already `NeuroSyncRoom`.
