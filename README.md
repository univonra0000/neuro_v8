# NEURO SYNC V8 — all-in-one

This version puts the frontend and WebSocket/Durable Object backend in the SAME Cloudflare Worker:

https://neuro-v8.univonra.workers.dev/

WebSocket:
wss://neuro-v8.univonra.workers.dev/ws

No separate satellite Worker is required for this version.

Deploy from the repository root with Cloudflare Workers. The static app is in `public/` and the Worker backend is in `src/worker.js`.

The network synchronizes digital frequency events, messages, and connected-device counts. It does not detect or transmit thoughts or EEG without external BCI/EEG hardware.
