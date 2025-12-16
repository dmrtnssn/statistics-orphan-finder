/**
 * ModalOrchestrationService - SQL generation workflows and modal orchestration
 * Handles single entity and bulk SQL generation with progress tracking
 */

import { ApiService } from './api-service';
import type { StorageEntity, DeleteModalData, HomeAssistant, OrphanOrigin } from '../types';

export interface SingleEntitySqlResult {
  sql: string;
  storage_saved: number;
  modalData: DeleteModalData;
}

export interface BulkSqlResult {
  status: 'success' | 'partial';
  entities: Array<{
    entity_id: string;
    sql: string;
    storage_saved: number;
    count: number;
    error?: string;
  }>;
  total_storage_saved: number;
  total_count: number;
  success_count: number;
  error_count: number;
}

export class ModalOrchestrationService {
  private apiService: ApiService;

  constructor(hass: HomeAssistant) {
    this.apiService = new ApiService(hass);
  }

  /**
   * Determine origin and count for an entity based on which tables it's in
   */
  determineEntityOriginAndCount(entity: StorageEntity): { origin: string; count: number } | null {
    const inStates = entity.in_states_meta;
    const inStatistics = entity.in_statistics_meta;

    if (inStates && inStatistics) {
      return {
        origin: 'States+Statistics',
        count: entity.states_count + entity.stats_short_count + entity.stats_long_count
      };
    } else if (inStates) {
      return {
        origin: 'States',
        count: entity.states_count
      };
    } else if (inStatistics) {
      let origin: string;
      if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
        origin = 'Both';
      } else if (entity.in_statistics_long_term) {
        origin = 'Long-term';
      } else {
        origin = 'Short-term';
      }
      return {
        origin,
        count: entity.stats_short_count + entity.stats_long_count
      };
    }

    // Not in any table - shouldn't happen
    return null;
  }

  /**
   * Generate SQL for a single entity
   * Returns SQL string, storage saved, and modal data
   */
  async generateSingleEntitySql(entity: StorageEntity): Promise<SingleEntitySqlResult> {
    // Determine origin based on which tables the entity is in
    const result = this.determineEntityOriginAndCount(entity);
    if (!result) {
      throw new Error(`Entity ${entity.entity_id} is not in any table`);
    }

    const { origin, count } = result;
    const inStates = entity.in_states_meta;
    const inStatistics = entity.in_statistics_meta;

    // Call API to generate SQL
    const response = await this.apiService.generateDeleteSql(
      entity.entity_id,
      origin as OrphanOrigin,
      inStates,
      inStatistics
    );

    // Create modal data
    const modalData: DeleteModalData = {
      entityId: entity.entity_id,
      metadataId: entity.metadata_id || 0,
      origin: origin as OrphanOrigin,
      status: 'deleted', // We're deleting statistics for both deleted and disabled entities
      count: count
    };

    return {
      sql: response.sql,
      storage_saved: response.storage_saved,
      modalData
    };
  }

  /**
   * Generate bulk SQL for multiple entities with progress tracking
   * Calls progressCallback with (current, total) after each entity
   */
  async generateBulkSql(
    entities: StorageEntity[],
    progressCallback?: (current: number, total: number) => void
  ): Promise<BulkSqlResult> {
    // Use a mutable object while building results
    const resultsBuilder = {
      entities: [] as Array<{
        entity_id: string;
        sql: string;
        storage_saved: number;
        count: number;
        error?: string;
      }>,
      total_storage_saved: 0,
      total_count: 0,
      success_count: 0,
      error_count: 0
    };

    // Generate SQL for each entity sequentially
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      // Update progress
      if (progressCallback) {
        progressCallback(i + 1, entities.length);
      }

      try {
        // Determine parameters for SQL generation
        const result = this.determineEntityOriginAndCount(entity);
        if (!result) {
          // Skip entities not in any table
          resultsBuilder.entities.push({
            entity_id: entity.entity_id,
            sql: '',
            storage_saved: 0,
            count: 0,
            error: 'Entity not in any table'
          });
          resultsBuilder.error_count++;
          continue;
        }

        const { origin, count } = result;
        const inStates = entity.in_states_meta;
        const inStatistics = entity.in_statistics_meta;

        // Call API to generate SQL
        const response = await this.apiService.generateDeleteSql(
          entity.entity_id,
          origin as OrphanOrigin,
          inStates,
          inStatistics
        );

        resultsBuilder.entities.push({
          entity_id: entity.entity_id,
          sql: response.sql,
          storage_saved: response.storage_saved,
          count: count
        });

        resultsBuilder.total_storage_saved += response.storage_saved;
        resultsBuilder.total_count += count;
        resultsBuilder.success_count++;
      } catch (err) {
        console.error(`Error generating SQL for ${entity.entity_id}:`, err);
        resultsBuilder.entities.push({
          entity_id: entity.entity_id,
          sql: '',
          storage_saved: 0,
          count: 0,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
        resultsBuilder.error_count++;
      }
    }

    // Return properly typed result based on error count
    return {
      status: resultsBuilder.error_count > 0 ? 'partial' : 'success',
      ...resultsBuilder
    };
  }

  /**
   * Format bulk SQL result for display (adds comments and formatting)
   */
  formatSqlForDisplay(result: BulkSqlResult): string {
    return result.entities
      .map((e) => {
        if (e.error) {
          return `-- Entity: ${e.entity_id}\n-- ERROR: ${e.error}\n`;
        }
        const storageMB = (e.storage_saved / (1024 * 1024)).toFixed(2);
        return `-- Entity: ${e.entity_id} (${e.count.toLocaleString()} records, ${storageMB} MB saved)\n${e.sql}`;
      })
      .join('\n\n');
  }

  /**
   * Calculate total storage that would be saved for a list of entities
   */
  calculateTotalStorage(entities: StorageEntity[]): number {
    // This is an estimation based on entity counts
    // Actual storage calculation would require database queries
    let total = 0;
    for (const entity of entities) {
      // Rough estimate: 100 bytes per state record, 50 bytes per stats record
      total += entity.states_count * 100;
      total += entity.stats_short_count * 50;
      total += entity.stats_long_count * 50;
    }
    return total;
  }
}
