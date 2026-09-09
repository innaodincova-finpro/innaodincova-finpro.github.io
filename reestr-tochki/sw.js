const CACHE='reestr-tochki-v1';
const SHELL=['./','./manifest.webmanifest','./install.js','/tochka-dnya/supabase.js','/tochka-dnya/registry.js','/tochka-dnya/registry-icon-192.png','/tochka-dnya/registry-icon-512.png','/tochka-dnya/registry-icon-180.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('reestr-tochki-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 const allowed=SHELL.some(p=>new URL(p,self.registration.scope).pathname===url.pathname);
 if(!allowed && !(req.mode==='navigate' && url.pathname.startsWith('/reestr-tochki/')))return;
 const key=req.mode==='navigate'?new URL('./',self.registration.scope).href:req;
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,copy)));}return res;}).catch(()=>caches.match(key).then(cached=>cached||new Response('Нет подключения. Откройте Реестр после восстановления интернета.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
