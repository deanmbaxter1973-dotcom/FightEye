const CACHE="fighteye-app-v3";
const STATIC=["/","/manifest.webmanifest","/favicon.svg","/icon-192.png","/icon-512.png"];
const MAX_ENTRIES=80;
const MAX_AGE=7*24*60*60*1000;
async function storedResponse(response){const headers=new Headers(response.headers);headers.set("x-fighteye-cached-at",String(Date.now()));return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}
async function remember(request,response){const cache=await caches.open(CACHE);await cache.put(request,await storedResponse(response.clone()));const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-MAX_ENTRIES)))await cache.delete(key)}
function fresh(response){const stored=Number(response?.headers.get("x-fighteye-cached-at")||0);return Boolean(response&&(!stored||Date.now()-stored<MAX_AGE))}
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("fighteye-app-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{if(response.ok)event.waitUntil(remember(request,response));return response}).catch(async()=>await caches.match(request)||await caches.match("/")||new Response("FightEye is offline. Reconnect to refresh your club data.",{status:503,headers:{"content-type":"text/plain;charset=UTF-8"}})));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>{
    const network=fetch(request).then(response=>{if(response.ok)event.waitUntil(remember(request,response));return response});
    if(fresh(cached)){event.waitUntil(network.catch(()=>undefined));return cached}
    return network.catch(()=>cached||Response.error());
  }));
});
