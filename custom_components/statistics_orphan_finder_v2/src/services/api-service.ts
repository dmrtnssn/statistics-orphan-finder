/**
 * API Service for Statistics Orphan Finder
 * Handles all communication with the backend
 */

import type {
  OrphanListResponse,
  DatabaseSize,
  EntityStorageOverviewResponse,
  GenerateSqlResponse,
  OrphanOrigin,
  HomeAssistant
} from '../types';

const API_BASE = 'statistics_orphan_finder_v2';

export class ApiService {
  constructor(private hass: HomeAssistant) {}

  /**
   * Fetch orphaned entities list
   */
  async fetchOrphansList(): Promise<OrphanListResponse> {
    return this.hass.callApi<OrphanListResponse>('GET', `${API_BASE}?action=list`);
  }

  /**
   * Fetch database size information
   */
  async fetchDatabaseSize(): Promise<DatabaseSize> {
    return this.hass.callApi<DatabaseSize>('GET', `${API_BASE}?action=database_size`);
  }

  /**
   * Fetch entity storage overview
   */
  async fetchEntityStorageOverview(): Promise<EntityStorageOverviewResponse> {
    return this.hass.callApi<EntityStorageOverviewResponse>('GET', `${API_BASE}?action=entity_storage_overview`);
  }

  /**
   * Generate delete SQL for an orphaned entity
   * Supports both legacy (metadata_id + origin) and new (entity_id + flags) modes
   */
  async generateDeleteSql(
    metadataIdOrEntityId: number | string,
    origin: OrphanOrigin,
    inStatesMeta?: boolean,
    inStatisticsMeta?: boolean
  ): Promise<GenerateSqlResponse> {
    let url = `${API_BASE}?action=generate_delete_sql`;

    // New mode: pass entity_id and flags
    if (typeof metadataIdOrEntityId === 'string' || inStatesMeta !== undefined) {
      url += `&entity_id=${encodeURIComponent(metadataIdOrEntityId.toString())}`;
      url += `&in_states_meta=${inStatesMeta ? 'true' : 'false'}`;
      url += `&in_statistics_meta=${inStatisticsMeta ? 'true' : 'false'}`;
      url += `&origin=${encodeURIComponent(origin)}`;
    } else {
      // Legacy mode: metadata_id + origin (for backwards compatibility)
      url += `&metadata_id=${metadataIdOrEntityId}&origin=${encodeURIComponent(origin)}`;
    }

    return this.hass.callApi<GenerateSqlResponse>('GET', url);
  }

  /**
   * Show Home Assistant's more-info dialog for an entity
   */
  showMoreInfo(entityId: string): void {
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true,
    });
    (event as any).detail = { entityId };
    document.querySelector('home-assistant')?.dispatchEvent(event);
  }
}
