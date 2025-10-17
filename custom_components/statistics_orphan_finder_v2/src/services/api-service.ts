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
   */
  async generateDeleteSql(metadataId: number, origin: OrphanOrigin): Promise<GenerateSqlResponse> {
    const url = `${API_BASE}?action=generate_delete_sql&metadata_id=${metadataId}&origin=${encodeURIComponent(origin)}`;
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
