# NEURO SYNC V8 — Satellite Frequency

## Fixed endpoint
WSS: wss://comn-setelite.univonra.workers.dev/ws

## Front-end
Open `index.html` in your web hosting.

## Worker
Deploy `src/index.js` to the Cloudflare Worker named `comn-setelite`.

The Worker needs this Durable Object binding:
SATELLITE_ROOM -> SatelliteFrequencyRoom

`wrangler.toml` is included for Wrangler deployments.

## What it does
- 1–20 Hz digital network frequency value
- SEND TO ALL
- START STREAM / STOP STREAM
- online device count
- received frequency
- live signal animation
- reconnect on disconnect
- device ID stored locally

The frequency is a network value/event. It is not an EEG measurement or mind-reading system. Real brain-frequency measurement requires compatible physiological/EEG hardware.
