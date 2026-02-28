import {manifest, version} from '@parcel/service-worker';
declare var self: ServiceWorkerGlobalScope;

function isCacheable(request:Request) {
  //const url = new URL(request.url);
  //return !url.pathname.endsWith(".json");
  return true
}

async function install() {
    const cache = await caches.open(version);
    await cache.addAll(manifest);
}
self.addEventListener('install', e => e.waitUntil(install()));
  
async function activate() {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => key !== version && caches.delete(key))
    );
}
self.addEventListener('activate', e => e.waitUntil(activate()));

async function cacheFirstWithRefresh(request:Request) {
  if (!(request.url.indexOf('http') === 0)) return;
  const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(version);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  return (await caches.match(request)) || (await fetchResponsePromise);
}



// Try network first and fallback on cache
async function networkRevalidateAndCache(ev:FetchEvent) {
  try {
    const fetchResponse = await fetch(ev.request);
    if (fetchResponse.ok) {
      const cache = await caches.open(version);
      if (ev.request.url.startsWith('http')) {
        await cache.put(ev.request, fetchResponse.clone());
      }
      return fetchResponse;
    } else {
      const cacheResponse = await caches.match(ev.request);
      return cacheResponse;
    }
  } catch (err) {
    console.log("Could not return cache or fetch NF", err);
  }
}

self.addEventListener("fetch", (ev) => {
  ev.respondWith((async () => {
    try {
      const response = await networkRevalidateAndCache(ev);
      return response;
    } catch (err) {
      console.log("Could not return cache or fetch NF", err);
    }
  })());
})

/*self.addEventListener("fetch", async (event) => {
  if (isCacheable(event.request)) {
    event.respondWith(cacheFirstWithRefresh(event.request));
  }
});*/
