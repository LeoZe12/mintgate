const CACHE_NAME = 'mintgate-v1.0.0';
const STATIC_CACHE = 'mintgate-static-v1.0.0';
const DYNAMIC_CACHE = 'mintgate-dynamic-v1.0.0';

// Recursos essenciais para funcionamento offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
];

// URLs de API que devem ser cacheadas
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  /^https:\/\/.*\.supabase\.co\/functions\/v1\//,
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('❌ Erro ao cachear recursos:', error);
      })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle imediato
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégia para recursos estáticos
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Estratégia para APIs do Supabase
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estratégia para imagens de câmera
  if (request.url.includes('camera') || request.url.includes('snapshot') || request.url.includes('picture')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estratégia padrão: Network First com fallback
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Estratégia: Cache First (para recursos estáticos)
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('📋 Servindo do cache:', request.url);
      return cached;
    }
    
    console.log('🌐 Buscando na rede:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro cache-first:', error);
    return new Response('Offline - Recurso não disponível', { status: 503 });
  }
}

// Estratégia: Network First (para APIs)
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Tentando rede primeiro:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      console.log('💾 Cacheado:', request.url);
    }
    
    return response;
  } catch (error) {
    console.log('📋 Rede falhou, tentando cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('✅ Servindo do cache offline:', request.url);
      return cached;
    }
    
    console.error('❌ Não encontrado no cache:', request.url);
    return new Response(
      JSON.stringify({ 
        error: 'Offline - Dados não disponíveis',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia: Stale While Revalidate (para imagens)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch em background para atualizar o cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Retorna o cache imediatamente se disponível
  if (cached) {
    console.log('📋 Servindo stale do cache:', request.url);
    return cached;
  }
  
  // Se não há cache, espera a rede
  console.log('🌐 Primeiro carregamento, aguardando rede:', request.url);
  return fetchPromise || new Response('Offline - Imagem não disponível', { status: 503 });
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronização em background:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log('📡 Sincronizando dados offline...');
    
    // Abrir IndexedDB para dados pendentes
    const db = await openIndexedDB();
    const transaction = db.transaction(['offline_queue'], 'readonly');
    const store = transaction.objectStore('offline_queue');
    const pendingData = await store.getAll();
    
    // Processar dados pendentes
    for (const item of pendingData) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });
        
        // Remover do queue se sincronizado com sucesso
        const deleteTransaction = db.transaction(['offline_queue'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('offline_queue');
        await deleteStore.delete(item.id);
        
        console.log('✅ Sincronizado:', item.url);
      } catch (error) {
        console.error('❌ Falha ao sincronizar:', item.url, error);
      }
    }
    
    console.log('🎉 Sincronização concluída');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Abrir IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MintGateOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_queue')) {
        const store = db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}