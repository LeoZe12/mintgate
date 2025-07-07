import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retries: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [queueSize, setQueueSize] = useState(0);
  const { toast } = useToast();

  // Monitorar status da conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conectado!",
        description: "Você está online novamente. Sincronizando dados...",
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Você está offline. Os dados serão sincronizados quando reconectar.",
        variant: "destructive",
      });
    };

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar queue size inicial
    updateQueueSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
          
          // Escutar atualizações
          registration.addEventListener('updatefound', () => {
            toast({
              title: "Atualização Disponível",
              description: "Uma nova versão do app está disponível. Recarregue a página.",
            });
          });
        })
        .catch((error) => {
          console.error('❌ Falha ao registrar Service Worker:', error);
        });

      // Background Sync (se disponível)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in (registration as any)) {
            return (registration as any).sync.register('sync-offline-data');
          }
        });
      }
    }
  }, []);

  // Abrir IndexedDB
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MintGateOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offline_queue')) {
          const store = db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache_data')) {
          const cacheStore = db.createObjectStore('cache_data', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  };

  // Adicionar dados à queue offline
  const addToOfflineQueue = async (url: string, method: string, data?: any) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offline_queue'], 'readwrite');
      const store = transaction.objectStore('offline_queue');
      
      const queueItem: OfflineQueueItem = {
        url,
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
        timestamp: Date.now(),
        retries: 0,
      };
      
      await store.add(queueItem);
      updateQueueSize();
      
      console.log('📋 Adicionado à queue offline:', url);
    } catch (error) {
      console.error('❌ Erro ao adicionar à queue:', error);
    }
  };

  // Sincronizar dados pendentes
  const syncPendingData = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offline_queue'], 'readonly');
      const store = transaction.objectStore('offline_queue');
      const request = store.getAll();
      
      return new Promise<void>((resolve, reject) => {
        request.onsuccess = async () => {
          const allData = request.result;
          
          for (const item of allData) {
            try {
              const response = await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body,
              });
              
              if (response.ok) {
                // Remover da queue se sincronizado com sucesso
                const deleteTransaction = db.transaction(['offline_queue'], 'readwrite');
                const deleteStore = deleteTransaction.objectStore('offline_queue');
                await deleteStore.delete(item.id!);
                
                console.log('✅ Sincronizado:', item.url);
              }
            } catch (error) {
              console.error('❌ Falha na sincronização:', item.url, error);
              
              // Incrementar tentativas
              if (item.retries < 3) {
                const updateTransaction = db.transaction(['offline_queue'], 'readwrite');
                const updateStore = updateTransaction.objectStore('offline_queue');
                item.retries++;
                await updateStore.put(item);
              }
            }
          }
          
          updateQueueSize();
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  // Atualizar tamanho da queue
  const updateQueueSize = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offline_queue'], 'readonly');
      const store = transaction.objectStore('offline_queue');
      const request = store.count();
      
      request.onsuccess = () => {
        setQueueSize(request.result);
      };
      
      request.onerror = () => {
        console.error('❌ Erro ao contar queue:', request.error);
      };
    } catch (error) {
      console.error('❌ Erro ao contar queue:', error);
    }
  };

  // Cache de dados
  const cacheData = async (key: string, data: any, ttl: number = 3600000) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['cache_data'], 'readwrite');
      const store = transaction.objectStore('cache_data');
      
      await store.put({
        key,
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
      });
      
      console.log('💾 Dados cacheados:', key);
    } catch (error) {
      console.error('❌ Erro ao cachear dados:', error);
    }
  };

  // Recuperar dados do cache
  const getCachedData = async (key: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['cache_data'], 'readonly');
      const store = transaction.objectStore('cache_data');
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          
          if (result && result.expiry > Date.now()) {
            console.log('📋 Dados recuperados do cache:', key);
            resolve(result.data);
          } else if (result) {
            // Remover dados expirados
            const deleteTransaction = db.transaction(['cache_data'], 'readwrite');
            const deleteStore = deleteTransaction.objectStore('cache_data');
            deleteStore.delete(key);
            resolve(null);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao recuperar cache:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('❌ Erro ao recuperar cache:', error);
      return null;
    }
  };

  // Instalar PWA
  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App Instalado!",
          description: "MintGate foi instalado com sucesso em seu dispositivo.",
        });
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Fazer request com fallback offline
  const offlineCapableRequest = async (url: string, options: RequestInit = {}) => {
    try {
      if (isOnline) {
        const response = await fetch(url, options);
        
        // Cache response se for GET
        if (options.method === 'GET' || !options.method) {
          const data = await response.clone().json();
          await cacheData(url, data);
        }
        
        return response;
      } else {
        // Tentar cache primeiro
        const cachedData = await getCachedData(url);
        if (cachedData) {
          return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Adicionar à queue se for POST/PUT/DELETE
        if (options.method && options.method !== 'GET') {
          await addToOfflineQueue(url, options.method, options.body);
        }
        
        throw new Error('Offline - dados não disponíveis');
      }
    } catch (error) {
      console.error('❌ Erro na requisição offline-capable:', error);
      throw error;
    }
  };

  return {
    isOnline,
    isInstallable,
    queueSize,
    installPWA,
    addToOfflineQueue,
    syncPendingData,
    cacheData,
    getCachedData,
    offlineCapableRequest,
  };
};