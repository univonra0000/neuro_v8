# NEURO SYNC V8 SOFTWARE

Exact relay:
wss://comn-setelite.univonra.workers.dev/ws

Files:
- index.html — complete responsive V8 software
- src/index.js — WebSocket satellite relay
- wrangler.toml — Cloudflare Durable Object binding

Deploy src/index.js to the `comn-setelite` Worker. The Durable Object binding must be:
SATELLITE_ROOM -> SatelliteFrequencyRoom

The app sends 1–20 Hz digital network frequency events. It does not measure or transmit actual EEG/brain activity.
