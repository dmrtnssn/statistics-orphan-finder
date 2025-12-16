/**
 * EntitySelectionService - Pure functions for entity selection logic
 * Determines which entities are selectable for deletion and provides selection breakdowns
 */

import type { StorageEntity } from '../types';

export type EntitySelectionType = 'deleted' | 'disabled' | 'not-selectable';

export class EntitySelectionService {
  // Memoization cache for disabled entity IDs
  private static _disabledIdsCache = new Map<string, Set<string>>();

  /**
   * Generate cache key from entities array
   * Uses array length and first/last entity IDs for fast cache key generation
   */
  private static generateCacheKey(entities: StorageEntity[]): string {
    if (!entities || entities.length === 0) return 'empty';
    const first = entities[0]?.entity_id || '';
    const last = entities[entities.length - 1]?.entity_id || '';
    return `${entities.length}:${first}:${last}`;
  }

  /**
   * Check if entity has been disabled and has statistics data
   * Note: Disabled entities with statistics are eligible for cleanup
   */
  static isDisabledForAtLeast90Days(entity: StorageEntity): boolean {
    try {
      // Entity must be disabled
      if (!entity || entity.registry_status !== 'Disabled') return false;

      // Must have statistics or states data (otherwise nothing to delete)
      return !!(entity.in_states_meta || entity.in_statistics_meta);
    } catch (err) {
      console.warn('[EntitySelectionService] Error in isDisabledForAtLeast90Days:', entity?.entity_id, err);
      return false;
    }
  }

  /**
   * Get entity selection type for UI differentiation
   */
  static getEntitySelectionType(entity: StorageEntity): EntitySelectionType {
    const hasData = entity.in_states_meta || entity.in_statistics_meta;
    if (!hasData) return 'not-selectable';

    // Deleted entities (not in registry, not in state machine)
    if (!entity.in_entity_registry && !entity.in_state_machine) {
      return 'deleted';
    }

    // Disabled entities (in registry, disabled)
    if (this.isDisabledForAtLeast90Days(entity)) {
      return 'disabled';
    }

    return 'not-selectable';
  }

  /**
   * Check if entity has data that can be deleted
   */
  static hasDataToDelete(entity: StorageEntity): boolean {
    return !!(entity.in_states_meta || entity.in_statistics_meta);
  }

  /**
   * Filter entities that are eligible for deletion
   * Includes both deleted entities and disabled entities with data
   */
  static getSelectableEntities(entities: StorageEntity[]): StorageEntity[] {
    return entities.filter(entity => {
      const hasData = this.hasDataToDelete(entity);
      if (!hasData) return false;

      // Deleted entities (not in registry and not in state machine)
      const isDeleted = !entity.in_entity_registry && !entity.in_state_machine;

      // Disabled entities with data
      const isDisabledLongEnough = this.isDisabledForAtLeast90Days(entity);

      return isDeleted || isDisabledLongEnough;
    });
  }

  /**
   * Get Set of selectable entity IDs for efficient lookup
   */
  static getSelectableEntityIds(entities: StorageEntity[]): Set<string> {
    return new Set(this.getSelectableEntities(entities).map(e => e.entity_id));
  }

  /**
   * Get Set of disabled entity IDs (for visual differentiation)
   */
  static getDisabledEntityIds(entities: StorageEntity[]): Set<string> {
    // Defensive: Return empty set if entities array is not ready
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      return new Set();
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(entities);
    if (this._disabledIdsCache.has(cacheKey)) {
      return this._disabledIdsCache.get(cacheKey)!;
    }

    // Compute disabled entity IDs
    try {
      const result = new Set(
        entities
          .filter(e => e && this.isDisabledForAtLeast90Days(e))
          .map(e => e.entity_id)
      );

      // Cache the result
      this._disabledIdsCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[EntitySelectionService] Error computing disabledEntityIds:', err);
      return new Set();
    }
  }

  /**
   * Get breakdown of selected entities by type (deleted vs disabled)
   */
  static getSelectionBreakdown(
    selectedEntityIds: Set<string>,
    allEntities: StorageEntity[]
  ): { deleted: StorageEntity[]; disabled: StorageEntity[] } {
    const deleted: StorageEntity[] = [];
    const disabled: StorageEntity[] = [];

    selectedEntityIds.forEach(entityId => {
      const entity = allEntities.find(e => e.entity_id === entityId);
      if (!entity) return;

      const type = this.getEntitySelectionType(entity);
      if (type === 'deleted') deleted.push(entity);
      if (type === 'disabled') disabled.push(entity);
    });

    return { deleted, disabled };
  }

  /**
   * Format how long ago statistics were last updated for a disabled entity
   * This gives users context about data staleness
   */
  static formatDisabledDuration(entity: StorageEntity): string {
    if (!entity.last_stats_update) return 'unknown duration';

    const lastUpdate = new Date(entity.last_stats_update).getTime();
    const ageMs = Date.now() - lastUpdate;
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));

    if (days < 1) return 'stats updated today';
    if (days === 1) return 'stats 1 day old';
    if (days < 30) return `stats ${days} days old`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? 'stats 1 month old' : `stats ${months} months old`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    if (remainingMonths === 0) {
      return years === 1 ? 'stats 1 year old' : `stats ${years} years old`;
    }
    return `stats ${years} year${years === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'} old`;
  }
}
