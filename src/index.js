import { DurableObject } from "cloudflare:workers";

const MIN_HZ=1, MAX_HZ=20, MAX_PACKET=4096;

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname==="/") return new Response(
      "Satellite relay OK\nWSS: wss://comn-setelite.univonra.workers.dev/ws",
      {headers:{"content-type":"text/plain;charset=UTF-8"}}
    );
    if(url.pathname!=="/ws") return new Response("Not Found",{status:404});
    if(request.method!=="GET"||request.headers.get("Upgrade")?.toLowerCase()!=="websocket")
      return new Response("Expected WebSocket upgrade",{status:426});
    const id=env.SATELLITE_ROOM.idFromName("global-frequency-room");
    return env.SATELLITE_ROOM.get(id).fetch(request);
  }
};

export class SatelliteFrequencyRoom extends DurableObject {
  async fetch(request) {
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({deviceId:crypto.randomUUID().slice(0,12)});
    await this.presence();
    return new Response(null,{status:101,webSocket:client});
  }
  async webSocketMessage(ws,message) {
    if(typeof message!=="string"||message.length>MAX_PACKET)return;
    let p;try{p=JSON.parse(message)}catch{return}
    const a=ws.deserializeAttachment()||{};
    if(p.deviceId){a.deviceId=String(p.deviceId).slice(0,60);ws.serializeAttachment(a)}
    if(p.type==="presence"){await this.presence();return}
    if(p.type==="ping"){this.safe(ws,{type:"pong",time:Date.now()});return}
    if(p.type==="frequency"){
      const hz=Number(p.hz);
      if(!Number.isFinite(hz)||hz<MIN_HZ||hz>MAX_HZ){
        this.safe(ws,{type:"error",message:"Frequency must be 1-20 Hz"});return;
      }
      this.broadcast(JSON.stringify({
        type:"frequency",hz,deviceId:a.deviceId||"unknown",
        source:String(p.source||"v8").slice(0,30),time:Date.now()
      }));
    }
  }
  async webSocketClose(ws,code,reason){try{ws.close(code,reason)}catch{}await this.presence()}
  async webSocketError(ws){try{ws.close(1011,"WebSocket error")}catch{}await this.presence()}
  async presence(){this.broadcast(JSON.stringify({type:"presence",online:this.ctx.getWebSockets().length,time:Date.now()}))}
  broadcast(m){for(const ws of this.ctx.getWebSockets())try{ws.send(m)}catch{}}
  safe(ws,o){try{ws.send(JSON.stringify(o))}catch{}}
}