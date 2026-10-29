'use strict';
// Cache only this application's static shell. Database/auth/API requests are
// always network-only; an offline cached response must never pose as cloud data.
const CACHE_NAME='dar-quran-women2-static-20261029-v2';
const ROOT=new URL('./',self.registration.scope);
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'].map(x=>new URL(x,ROOT).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await Promise.allSettled(FILES.map(async url=>{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response);}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('dar-quran-women2-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==ROOT.origin||url.search||!FILES.includes(url.href))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(event.request,{cache:'no-cache'});
   if(response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(event.request,response.clone());}
   return response;
  }catch(error){
   const cached=await caches.match(event.request,{cacheName:CACHE_NAME});
   if(cached)return cached;
   throw error;
  }
 })());
});
