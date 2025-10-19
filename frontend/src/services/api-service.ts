/**
 * API Service for Statistics Orphan Finder
 * Handles all communication with the backend
 */

import type {
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
   * Generate delete SQL for an entity
   */
  async generateDeleteSql(
    entityId: string,
    origin: OrphanOrigin,
    inStatesMeta: boolean,
    inStatisticsMeta: boolean
  ): Promise<GenerateSqlResponse> {
    const url = `${API_BASE}?action=generate_delete_sql` +
      `&entity_id=${encodeURIComponent(entityId)}` +
      `&in_states_meta=${inStatesMeta ? 'true' : 'false'}` +
      `&in_statistics_meta=${inStatisticsMeta ? 'true' : 'false'}` +
      `&origin=${encodeURIComponent(origin)}`;

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
