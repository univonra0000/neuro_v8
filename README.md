# NEURO SYNC V8

Cloudflare Workers static web app for the `neuro-v8` Worker.

Satellite relay:
`wss://comn-setelite.univonra.workers.dev/ws`

Cloudflare Builds can deploy this repository with:

`npx wrangler deploy`

The app is served from `public/`.

Important: `comn-setelite` is the separate WebSocket/Durable Object relay. Its Durable Object binding should NOT be placed in this `neuro-v8` app configuration.

The app is mobile responsive and includes connection ON/OFF, optional location sharing/map, online-device count, and 1–20 Hz digital network frequency events.
