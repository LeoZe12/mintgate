
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PlateDB extends DBSchema {
  plates: {
    key: string;
    value: {
      plate: string;
      confidence: number;
      timestamp: number;
      imageHash: string;
      region?: string;
      processing_time: number;
    };
    indexes: {
      'by-plate': string;
      'by-timestamp': number;
    };
  };
}

class PlateCacheService {
  private db: IDBPDatabase<PlateDB> | null = null;
  private readonly DB_NAME = 'PlateRecognizerCache';
  private readonly DB_VERSION = 1;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<PlateDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('plates', { keyPath: 'imageHash' });
        store.createIndex('by-plate', 'plate');
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  private async generateImageHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getCachedResult(file: File): Promise<any | null> {
    await this.init();
    if (!this.db) return null;

    const hash = await this.generateImageHash(file);
    const cached = await this.db.get('plates', hash);

    if (!cached) return null;

    // Verificar se o cache expirou
    if (Date.now() - cached.timestamp > this.CACHE_EXPIRY) {
      await this.db.delete('plates', hash);
      return null;
    }

    return {
      results: [{
        plate: cached.plate,
        confidence: cached.confidence,
        region: cached.region ? { code: cached.region } : undefined,
      }],
      processing_time: cached.processing_time,
      filename: file.name,
    };
  }

  async cacheResult(file: File, result: any): Promise<void> {
    await this.init();
    if (!this.db || !result.results || result.results.length === 0) return;

    const hash = await this.generateImageHash(file);
    const firstResult = result.results[0];

    await this.db.put('plates', {
      imageHash: hash,
      plate: firstResult.plate,
      confidence: firstResult.confidence,
      timestamp: Date.now(),
      region: firstResult.region?.code,
      processing_time: result.processing_time,
    });
  }

  async clearExpiredCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction('plates', 'readwrite');
    const store = transaction.objectStore('plates');
    const index = store.index('by-timestamp');

    const expiredTimestamp = Date.now() - this.CACHE_EXPIRY;
    const range = IDBKeyRange.upperBound(expiredTimestamp);

    for await (const cursor of index.iterate(range)) {
      await cursor.delete();
    }
  }
}

export const plateCacheService = new PlateCacheService();
