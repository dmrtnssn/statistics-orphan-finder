/**
 * EntityFilterService - Pure functions for filtering and sorting entities
 * Provides memoized filtering and multi-column sorting for storage entities
 */

import type { StorageEntity, SortState } from '../types';

export interface FilterCriteria {
  searchQuery: string;
  basicFilter: string | null;
  registryFilter: string | null;
  stateFilter: string | null;
  advancedFilter: string | null;
  statesFilter: string | null;
  statisticsFilter: string | null;
}

export class EntityFilterService {
  // Memoization cache: filterKey -> filtered & sorted entities
  private static _cache = new Map<string, StorageEntity[]>();

  /**
   * Generate cache key from filter parameters and sort stack
   */
  static generateFilterKey(filters: FilterCriteria, sortStack: SortState[]): string {
    return `${filters.searchQuery}|${filters.basicFilter}|${filters.registryFilter}|${filters.stateFilter}|${filters.advancedFilter}|${filters.statesFilter}|${filters.statisticsFilter}|${sortStack.map(s => `${s.column}:${s.direction}`).join(',')}`;
  }

  /**
   * Main entry point: Filter and sort entities with memoization
   */
  static filterAndSort(
    entities: StorageEntity[],
    filters: FilterCriteria,
    sortStack: SortState[]
  ): StorageEntity[] {
    // Generate cache key
    const cacheKey = this.generateFilterKey(filters, sortStack);

    // Return cached result if available
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)!;
    }

    // Apply all filters
    let filtered = [...entities];

    filtered = this.applySearchFilter(filtered, filters.searchQuery);
    filtered = this.applyBasicFilter(filtered, filters.basicFilter);
    filtered = this.applyRegistryFilter(filtered, filters.registryFilter);
    filtered = this.applyStateFilter(filtered, filters.stateFilter);
    filtered = this.applyAdvancedFilter(filtered, filters.advancedFilter);
    filtered = this.applyStatesFilter(filtered, filters.statesFilter);
    filtered = this.applyStatisticsFilter(filtered, filters.statisticsFilter);

    // Sort the results
    const result = this.sortEntities(filtered, sortStack);

    // Cache and return
    this._cache.set(cacheKey, result);
    return result;
  }

  /**
   * Apply search query filter (entity_id contains query)
   */
  static applySearchFilter(entities: StorageEntity[], query: string): StorageEntity[] {
    if (!query) return entities;

    const lowerQuery = query.toLowerCase();
    return entities.filter(e => e.entity_id.toLowerCase().includes(lowerQuery));
  }

  /**
   * Apply basic filter (in_registry, in_state, deleted, numeric_sensors_no_stats)
   */
  static applyBasicFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;

    switch (filter) {
      case 'in_registry':
        return entities.filter(e => e.in_entity_registry);
      case 'in_state':
        return entities.filter(e => e.in_state_machine);
      case 'deleted':
        return entities.filter(e => !e.in_entity_registry && !e.in_state_machine);
      case 'numeric_sensors_no_stats':
        return entities.filter(e =>
          e.entity_id.startsWith('sensor.') &&
          e.in_states_meta &&
          !e.in_statistics_meta &&
          e.statistics_eligibility_reason &&
          !e.statistics_eligibility_reason.includes("is not numeric")
        );
      default:
        return entities;
    }
  }

  /**
   * Apply registry status filter (Enabled, Disabled)
   */
  static applyRegistryFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;
    return entities.filter(e => e.registry_status === filter);
  }

  /**
   * Apply state status filter (Available, Unavailable)
   */
  static applyStateFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;
    return entities.filter(e => e.state_status === filter);
  }

  /**
   * Apply advanced filter (only_states, only_stats)
   */
  static applyAdvancedFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;

    switch (filter) {
      case 'only_states':
        return entities.filter(e => e.in_states && !e.in_statistics_meta);
      case 'only_stats':
        return entities.filter(e => e.in_statistics_meta && !e.in_states);
      default:
        return entities;
    }
  }

  /**
   * Apply states table filter (in_states, not_in_states)
   */
  static applyStatesFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;

    switch (filter) {
      case 'in_states':
        return entities.filter(e => e.in_states);
      case 'not_in_states':
        return entities.filter(e => !e.in_states);
      default:
        return entities;
    }
  }

  /**
   * Apply statistics table filter (in_statistics, not_in_statistics)
   */
  static applyStatisticsFilter(entities: StorageEntity[], filter: string | null): StorageEntity[] {
    if (!filter) return entities;

    switch (filter) {
      case 'in_statistics':
        return entities.filter(e => e.in_statistics_meta);
      case 'not_in_statistics':
        return entities.filter(e => !e.in_statistics_meta);
      default:
        return entities;
    }
  }

  /**
   * Sort entities by sort stack (multi-column sorting)
   */
  static sortEntities(entities: StorageEntity[], sortStack: SortState[]): StorageEntity[] {
    return [...entities].sort((a, b) => {
      for (const { column, direction } of sortStack) {
        let result = 0;

        switch (column) {
          case 'entity_id':
            result = a.entity_id.localeCompare(b.entity_id);
            break;
          case 'registry':
          case 'registry_status':
            result = a.registry_status.localeCompare(b.registry_status);
            break;
          case 'state':
          case 'state_status':
            result = a.state_status.localeCompare(b.state_status);
            break;
          case 'states_count':
          case 'stats_short_count':
          case 'stats_long_count':
            result = (a[column as keyof StorageEntity] as number) - (b[column as keyof StorageEntity] as number);
            break;
          case 'update_interval':
            const aInterval = a.update_interval_seconds ?? 999999;
            const bInterval = b.update_interval_seconds ?? 999999;
            result = aInterval - bInterval;
            break;
          case 'last_state_update':
          case 'last_stats_update':
            const aTime = a[column] ? new Date(a[column] as string).getTime() : 0;
            const bTime = b[column] ? new Date(b[column] as string).getTime() : 0;
            result = aTime - bTime;
            break;
          default:
            // Boolean columns
            const aVal = a[column as keyof StorageEntity] ? 1 : 0;
            const bVal = b[column as keyof StorageEntity] ? 1 : 0;
            result = aVal - bVal;
        }

        if (direction === 'desc') result = -result;
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  /**
   * Clear memoization cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this._cache.clear();
  }
}
