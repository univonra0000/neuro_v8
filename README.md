# NEURO SYNC V8 — Future Update

This package puts the WebSocket/Durable Object backend and frontend in the same Cloudflare Worker project.

## Included
- Past / Present / Future-ready digital signal event flow
- 1–20 Hz digital event control
- Send/receive messages
- Live connected-device count
- Signal wave + pink neon lighting
- Beep-beep response
- Voice/microphone input with browser permission
- Voice result is sent after a completed recognition result
- Sticky ON/OFF connection control
- Sticky menu
- Opt-in people/participant location map
- Automatic reconnect while ON
- Single Worker `/ws` endpoint
- No hidden location tracking

## Important technical meaning
The frequency control is a digital network event rate. A normal phone browser cannot detect or transmit actual EEG/thoughts. Real brain-signal input requires compatible EEG/BCI hardware and an appropriate integration.

## Deploy
1. Put the files in a Cloudflare Workers project.
2. Run `npx wrangler deploy`.
3. Open `https://neuro-v8.univonra.workers.dev/`.
4. Press ON.
5. Open the same URL on another participating device and press ON.
6. Use Message or Trigger Signal.

The old `comn-setelite` relay is not required by this version.

## Naming
Use **CONNECTED PARTICIPANTS** for the live count and **CONNECT TO PEOPLE** for the user action. Do not label ordinary web connections as connected brains; actual brain-signal functions require EEG/BCI hardware.

## Cloudflare build fix
The compatibility date is set to `2026-09-20` so the deployment does not use the future date that caused the previous Cloudflare build error.


## Deployment override
Use `npx wrangler deploy --compatibility-date 2026-09-20` in Cloudflare Workers Builds. The configuration also uses `2026-09-20` to avoid the future-date error shown by the user's build environment.
