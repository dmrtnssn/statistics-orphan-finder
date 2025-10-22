/**
 * CacheService - Manages localStorage caching for Statistics Orphan Finder
 * Provides persistent storage across browser sessions with version control and expiration
 */

import type { DatabaseSize, StorageEntity, StorageSummary } from '../types';

const CACHE_KEY = 'statistics_orphan_finder_cache';
const CACHE_VERSION = 1;

export interface CachedData {
  version: number;
  timestamp: number; // Unix timestamp in milliseconds
  data: {
    databaseSize: DatabaseSize | null;
    storageEntities: StorageEntity[];
    storageSummary: StorageSummary | null;
  };
}

export class CacheService {
  /**
   * Save data to localStorage cache
   */
  static saveCache(
    databaseSize: DatabaseSize | null,
    storageEntities: StorageEntity[],
    storageSummary: StorageSummary | null
  ): boolean {
    try {
      const cacheData: CachedData = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        data: {
          databaseSize,
          storageEntities,
          storageSummary,
        },
      };

      const serialized = JSON.stringify(cacheData);
      localStorage.setItem(CACHE_KEY, serialized);
      console.debug('[CacheService] Data cached successfully', {
        timestamp: new Date(cacheData.timestamp).toISOString(),
        entities: storageEntities.length,
      });
      return true;
    } catch (error) {
      // Handle quota exceeded, private browsing, etc.
      console.debug('[CacheService] Failed to save cache:', error);
      return false;
    }
  }

  /**
   * Load data from localStorage cache
   * Returns null if cache doesn't exist, is invalid, or version mismatch
   */
  static loadCache(): CachedData | null {
    try {
      const serialized = localStorage.getItem(CACHE_KEY);
      if (!serialized) {
        console.debug('[CacheService] No cache found');
        return null;
      }

      const parsed = JSON.parse(serialized) as CachedData;

      // Validate cache structure
      if (
        !parsed ||
        typeof parsed.version !== 'number' ||
        typeof parsed.timestamp !== 'number' ||
        !parsed.data
      ) {
        console.debug('[CacheService] Invalid cache structure, clearing');
        this.clearCache();
        return null;
      }

      // Check version compatibility
      if (parsed.version !== CACHE_VERSION) {
        console.debug(
          `[CacheService] Cache version mismatch (${parsed.version} !== ${CACHE_VERSION}), clearing`
        );
        this.clearCache();
        return null;
      }

      // Validate data structure
      if (
        !Array.isArray(parsed.data.storageEntities) ||
        (parsed.data.databaseSize !== null && typeof parsed.data.databaseSize !== 'object') ||
        (parsed.data.storageSummary !== null && typeof parsed.data.storageSummary !== 'object')
      ) {
        console.debug('[CacheService] Invalid data structure in cache, clearing');
        this.clearCache();
        return null;
      }

      console.debug('[CacheService] Cache loaded successfully', {
        timestamp: new Date(parsed.timestamp).toISOString(),
        age: this.formatAge(this.getCacheAge(parsed)),
        entities: parsed.data.storageEntities.length,
      });

      return parsed;
    } catch (error) {
      // JSON parse error or other issues
      console.debug('[CacheService] Failed to load cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.debug('[CacheService] Cache cleared');
    } catch (error) {
      console.debug('[CacheService] Failed to clear cache:', error);
    }
  }

  /**
   * Get cache age in milliseconds
   * Returns null if no cache exists
   */
  static getCacheAge(cache: CachedData | null = null): number | null {
    try {
      const cachedData = cache || this.loadCache();
      if (!cachedData) {
        return null;
      }
      return Date.now() - cachedData.timestamp;
    } catch {
      return null;
    }
  }

  /**
   * Check if cache is stale (older than maxAge milliseconds)
   */
  static isCacheStale(maxAgeMs: number, cache: CachedData | null = null): boolean {
    const age = this.getCacheAge(cache);
    if (age === null) {
      return true; // No cache = stale
    }
    return age > maxAgeMs;
  }

  /**
   * Format cache age as human-readable string
   */
  static formatAge(ageMs: number | null): string {
    if (ageMs === null) {
      return 'unknown';
    }

    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }
  }

  /**
   * Get cache metadata (without full data)
   */
  static getCacheMetadata(): { timestamp: number; age: number; ageFormatted: string } | null {
    try {
      const cache = this.loadCache();
      if (!cache) {
        return null;
      }
      const age = this.getCacheAge(cache);
      return {
        timestamp: cache.timestamp,
        age: age || 0,
        ageFormatted: this.formatAge(age),
      };
    } catch {
      return null;
    }
  }
}
