// TerapiaBot v2 - Service Worker
// Version 1.0.0

const CACHE_NAME = 'terapiabot-v2-cache-v1';
const RUNTIME_CACHE = 'terapiabot-v2-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('⚙️ Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching core assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Remove old caches
                            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim(); // Take control of all pages immediately
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Skip external Abacus.AI chatbot (always fetch from network)
    if (url.hostname === 'apps.abacus.ai') {
        event.respondWith(fetch(request));
        return;
    }
    
    // Strategy: Cache First, falling back to Network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('📦 Serving from cache:', request.url);
                    
                    // Update cache in background (stale-while-revalidate)
                    fetch(request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(RUNTIME_CACHE)
                                    .then((cache) => {
                                        cache.put(request, networkResponse);
                                    });
                            }
                        })
                        .catch(() => {
                            // Network fetch failed, but we have cache
                        });
                    
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                console.log('🌐 Fetching from network:', request.url);
                return fetch(request)
                    .then((networkResponse) => {
                        // Don't cache if response is not successful
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                            return networkResponse;
                        }
                        
                        // Clone the response (can only be consumed once)
                        const responseToCache = networkResponse.clone();
                        
                        // Cache successful responses
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('❌ Fetch failed:', error);
                        
                        // Return offline page for HTML requests
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, return error
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
    console.log('📨 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls;
        caches.open(RUNTIME_CACHE)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: URLs cached successfully');
            })
            .catch((error) => {
                console.error('❌ Service Worker: Failed to cache URLs', error);
            });
    }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            // Implement sync logic here if needed
            Promise.resolve()
        );
    }
});

// Push notification (if needed in future)
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New message from TerapiaBot',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('TerapiaBot v2', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('🚀 Service Worker: Script loaded');