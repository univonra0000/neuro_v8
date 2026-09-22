import { DurableObject } from "cloudflare:workers";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
        return new Response("WebSocket required", { status: 426 });
      }
      const id = env.NEURO_ROOM.idFromName("global");
      return env.NEURO_ROOM.get(id).fetch(request);
    }

    if (url.pathname === "/api/status") {
      return Response.json({
        ok: true,
        app: "NEURO SYNC V8",
        websocket: "/ws",
        mode: "digital network signal",
        note: "1–20 Hz is a digital event rate, not measured brain EEG."
      });
    }

    return env.ASSETS.fetch(request);
  }
};

export class NeuroRoom extends DurableObject {
  async fetch(request) {
    const pair = new WebSocketPair();
    const ws = pair[1];
    this.ctx.acceptWebSocket(ws);
    ws.serializeAttachment({
      id: null,
      locationOptIn: false,
      lat: null,
      lon: null,
      connectedAt: Date.now()
    });
    this.broadcastPresence();
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws, raw) {
    let p;
    try { p = JSON.parse(raw); } catch { return; }

    const a = ws.deserializeAttachment() || {};
    if (p.deviceId) {
      a.id = String(p.deviceId).slice(0, 60);
      ws.serializeAttachment(a);
    }

    if (p.type === "presence" || p.type === "ping") {
      this.broadcastPresence();
      return;
    }

    if (p.type === "location") {
      a.locationOptIn = !!p.optIn;
      if (a.locationOptIn && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))) {
        a.lat = Number(p.lat);
        a.lon = Number(p.lon);
      } else if (!a.locationOptIn) {
        a.lat = null; a.lon = null;
      }
      ws.serializeAttachment(a);
      this.broadcastPresence();
      return;
    }

    if (p.type === "frequency") {
      const hz = Math.max(1, Math.min(20, Number(p.hz) || 1));
      this.broadcast(JSON.stringify({
        type: "frequency",
        hz,
        deviceId: a.id || "device",
        ts: Date.now()
      }));
      return;
    }

    if (p.type === "message") {
      const text = String(p.text || "").trim().slice(0, 500);
      if (!text) return;
      this.broadcast(JSON.stringify({
        type: "message",
        text,
        deviceId: a.id || "device",
        ts: Date.now()
      }));
    }
  }

  async webSocketClose() { this.broadcastPresence(); }
  async webSocketError() { this.broadcastPresence(); }

  broadcastPresence() {
    const sockets = this.ctx.getWebSockets();
    const participants = sockets.map(ws => {
      const a = ws.deserializeAttachment() || {};
      return {
        deviceId: a.id || "device",
        online: true,
        locationOptIn: !!a.locationOptIn,
        lat: a.locationOptIn ? a.lat : null,
        lon: a.locationOptIn ? a.lon : null
      };
    });
    this.broadcast(JSON.stringify({
      type: "presence",
      online: sockets.length,
      participants,
      ts: Date.now()
    }));
  }

  broadcast(msg) {
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(msg); } catch {}
    }
  }
}
