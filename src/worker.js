import { DurableObject } from "cloudflare:workers";

const MAX_TEXT = 500;
const MAX_PACKET = 4096;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // WebSocket backend is now part of neuro-v8 itself.
    if (url.pathname === "/ws") {
      if (
        request.method !== "GET" ||
        request.headers.get("Upgrade")?.toLowerCase() !== "websocket"
      ) {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }

      const id = env.NEURO_SYNC_ROOM.idFromName("global");
      return env.NEURO_SYNC_ROOM.get(id).fetch(request);
    }

    // Health/API check.
    if (url.pathname === "/api/status") {
      return Response.json({
        ok: true,
        app: "NEURO SYNC V8",
        websocket: "/ws",
        mode: "digital network synchronization",
        time: Date.now()
      });
    }

    // Everything else comes from the mobile/web app in /public.
    return env.ASSETS.fetch(request);
  }
};

export class NeuroSyncRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    server.serializeAttachment({
      deviceId: null,
      connectedAt: Date.now()
    });

    await this.broadcastPresence();

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_PACKET) return;

    let p;
    try {
      p = JSON.parse(message);
    } catch {
      this.safe(ws, { type: "error", message: "Invalid JSON" });
      return;
    }

    const a = ws.deserializeAttachment() || {};

    if (p.deviceId) {
      a.deviceId = String(p.deviceId).slice(0, 80);
      ws.serializeAttachment(a);
    }

    if (p.type === "presence") {
      await this.broadcastPresence();
      return;
    }

    if (p.type === "frequency") {
      const hz = Math.max(1, Math.min(20, Number(p.hz) || 1));

      this.broadcast(JSON.stringify({
        type: "frequency",
        hz,
        deviceId: a.deviceId || "unknown",
        time: Date.now()
      }));
      return;
    }

    if (p.type === "message") {
      const text = String(p.text || "").trim().slice(0, MAX_TEXT);
      if (!text) return;

      this.broadcast(JSON.stringify({
        type: "message",
        text,
        deviceId: a.deviceId || "unknown",
        time: Date.now()
      }));
      return;
    }

    if (p.type === "ping") {
      this.safe(ws, { type: "pong", time: Date.now() });
    }
  }

  async webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch {}
    await this.broadcastPresence();
  }

  async webSocketError(ws) {
    try { ws.close(1011, "WebSocket error"); } catch {}
    await this.broadcastPresence();
  }

  async broadcastPresence() {
    this.broadcast(JSON.stringify({
      type: "presence",
      online: this.ctx.getWebSockets().length,
      time: Date.now()
    }));
  }

  broadcast(message) {
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(message); } catch {}
    }
  }

  safe(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch {}
  }
}
