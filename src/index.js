import { DurableObject } from "cloudflare:workers";
const MIN_HZ=1,MAX_HZ=20,MAX_PACKET=4096;
export default{async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==="/")return new Response("Satellite relay OK\nWSS: wss://comn-setelite.univonra.workers.dev/ws",{headers:{"content-type":"text/plain;charset=UTF-8"}});
 if(url.pathname!=="/ws")return new Response("Not Found",{status:404});
 if(request.method!=="GET"||request.headers.get("Upgrade")?.toLowerCase()!=="websocket")return new Response("Expected WebSocket upgrade",{status:426});
 return env.SATELLITE_ROOM.get(env.SATELLITE_ROOM.idFromName("global")).fetch(request);
}};
export class SatelliteFrequencyRoom extends DurableObject{
 async fetch(request){const pair=new WebSocketPair(),client=pair[0],server=pair[1];this.ctx.acceptWebSocket(server);server.serializeAttachment({deviceId:crypto.randomUUID().slice(0,12),lat:null,lon:null,optIn:false});await this.presence();return new Response(null,{status:101,webSocket:client})}
 async webSocketMessage(ws,message){if(typeof message!=="string"||message.length>MAX_PACKET)return;let p;try{p=JSON.parse(message)}catch{return}let a=ws.deserializeAttachment()||{};if(p.deviceId)a.deviceId=String(p.deviceId).slice(0,60);
 if(p.type==="presence"){a.optIn=!!p.locationOptIn;ws.serializeAttachment(a);await this.presence();return}
 if(p.type==="location"){if(!Number.isFinite(+p.lat)||!Number.isFinite(+p.lon))return;a.lat=+p.lat;a.lon=+p.lon;a.optIn=true;ws.serializeAttachment(a);await this.presence();return}
 if(p.type==="frequency"){let hz=+p.hz;if(!Number.isFinite(hz)||hz<MIN_HZ||hz>MAX_HZ){this.safe(ws,{type:"error",message:"Frequency must be 1-20 Hz"});return}this.broadcast(JSON.stringify({type:"frequency",hz,deviceId:a.deviceId||"unknown",time:Date.now()}));return}
 if(p.type==="ping")this.safe(ws,{type:"pong",time:Date.now()})
 }
 async webSocketClose(ws,code,reason){try{ws.close(code,reason)}catch{}await this.presence()}
 async webSocketError(ws){try{ws.close(1011,"WebSocket error")}catch{}await this.presence()}
 async presence(){let participants=this.ctx.getWebSockets().map(w=>w.deserializeAttachment()||{}).filter(a=>a.optIn&&a.lat!=null&&a.lon!=null).map(a=>({deviceId:a.deviceId,lat:a.lat,lon:a.lon,online:true}));this.broadcast(JSON.stringify({type:"presence",online:this.ctx.getWebSockets().length,participants,time:Date.now()}))}
 broadcast(m){for(const w of this.ctx.getWebSockets())try{w.send(m)}catch{}}
 safe(w,o){try{w.send(JSON.stringify(o))}catch{}}
}