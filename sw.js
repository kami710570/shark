// 讓網頁秒開、沒網路也能用（資料同步由 Firestore 自己處理）
// 先用手機裡存的版本打開，同時在背景檢查有沒有新版；有新版就存起來並通知頁面，下次打開（或按「更新」）生效
const CACHE = 'shark-v39';
const SHELL = ['./', './index.html', './config.js?v=5', './manifest.webmanifest', './icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => fetch(u, { cache: 'reload' }).then(r => r.ok && c.put(u === './' ? './index.html' : u, r)).catch(() => { })))));
  self.skipWaiting();
});
const LIB = 'shark-lib'; // Firebase SDK 另外放：改版時不用重新下載
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== LIB).map(k => caches.delete(k))))); self.clients.claim(); });
const notify = () => self.clients.matchAll({ type: 'window' }).then(cs => cs.forEach(c => c.postMessage({ type: 'shark-update' })));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const page = req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
    const key = page ? './index.html' : req;
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(key, { ignoreSearch: page }), old = hit && page ? hit.clone() : null; // 先複製一份：原本那份會交給頁面用掉
      // 背景更新：用 no-cache 讓瀏覽器帶 ETag 去問，沒改的話只回一個很小的 304
      const net = fetch(req, { cache: 'no-cache' }).then(async res => {
        if (!res.ok) return res;
        const fresh = res.clone();
        if (old) {
          const a = old.headers.get('etag'), b = res.headers.get('etag');
          const changed = a && b ? a !== b : (await old.text()) !== (await res.clone().text());
          await c.put(key, fresh);
          if (changed) notify();
        } else await c.put(key, fresh);
        return res;
      }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || (page ? new Response('目前離線，請連上網路後再打開一次。', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }) : Response.error());
    }));
  } else if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    // Firebase SDK 網址含版本號，內容不會變：直接用快取
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(LIB).then(c => c.put(req, copy)); } return res; })));
  }
});
