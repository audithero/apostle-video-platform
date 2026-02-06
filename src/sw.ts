/// <reference lib="webworker" />

/**
 * Service Worker for Apostle Video Platform
 *
 * Caching strategies:
 * - CacheFirst: static assets (JS, CSS, fonts)
 * - StaleWhileRevalidate: images from R2/CDN
 * - NetworkOnly: video streams (Mux), auth endpoints
 * - Offline fallback: /offline page
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "apostle-v1";
const OFFLINE_URL = "/offline";

// Assets to precache on install
const PRECACHE_ASSETS = [OFFLINE_URL];

// ---------- Install ----------
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }),
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ---------- Activate ----------
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ---------- Helpers ----------

function isStaticAsset(url: URL): boolean {
  return /\.(js|css|woff2?|ttf|eot)(\?.*)?$/.test(url.pathname);
}

function isImageAsset(url: URL): boolean {
  return /\.(png|jpe?g|gif|svg|webp|avif|ico)(\?.*)?$/.test(url.pathname);
}

function isR2OrCDNImage(url: URL): boolean {
  // Match R2 public bucket URLs and common CDN patterns
  return (
    isImageAsset(url) &&
    (url.hostname.includes("r2.dev") ||
      url.hostname.includes("cloudflare") ||
      url.hostname.includes("cdn"))
  );
}

function isVideoStream(url: URL): boolean {
  // Mux video streaming URLs
  return (
    url.hostname.includes("mux.com") ||
    url.hostname.includes("stream.mux") ||
    url.pathname.includes(".m3u8") ||
    url.pathname.includes(".ts")
  );
}

function isAuthEndpoint(url: URL): boolean {
  return (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/api/trpc")
  );
}

function isNavigationRequest(request: Request): boolean {
  return request.mode === "navigate";
}

// ---------- Caching strategies ----------

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => {
      // Network failed; if we have a cached version it was already returned
      return cached ?? new Response("Network error", { status: 503 });
    });

  // Return cached version immediately if available, otherwise wait for network
  return cached ?? fetchPromise;
}

async function networkOnly(request: Request): Promise<Response> {
  return fetch(request);
}

// ---------- Fetch handler ----------
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests and CDN images
  if (url.origin !== self.location.origin && !isR2OrCDNImage(url)) {
    // Let video streams and external requests pass through
    if (isVideoStream(url)) {
      event.respondWith(networkOnly(event.request));
      return;
    }
    return;
  }

  // Never cache auth or API endpoints
  if (isAuthEndpoint(url)) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  // Video streams: always network-only
  if (isVideoStream(url)) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Images (including R2/CDN): stale-while-revalidate
  if (isImageAsset(url) || isR2OrCDNImage(url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return cached ?? new Response("Offline", { status: 503 });
      }),
    );
    return;
  }

  // Everything else: try network, fall back to cache
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached ?? new Response("Offline", { status: 503 });
    }),
  );
});

// ---------- Message handler for skip-waiting ----------
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
