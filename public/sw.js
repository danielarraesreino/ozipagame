// Service worker do Vozes da Quebrada — habilita instalação (PWA) + fallback offline.
// Estratégia: network-first nas navegações/assets GET, com cache de apoio. NÃO
// cacheia /api/ (dados dinâmicos do Supabase). Offline cai no cache ou na home.
const CACHE = "oziel-v2"

self.addEventListener("install", (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/")))
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (e) => {
  const req = e.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
  )
})
