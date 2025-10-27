/**
 * API Service for Statistics Orphan Finder
 * Handles all communication with the backend
 */

import type {
  DatabaseSize,
  EntityStorageOverviewResponse,
  GenerateSqlResponse,
  MessageHistogramResponse,
  OrphanOrigin,
  HomeAssistant,
  StepResponse
} from '../types';

const API_BASE = 'statistics_orphan_finder';

export class ApiService {
  constructor(private hass: HomeAssistant) {}

  /**
   * Validate that hass connection is available
   */
  private validateConnection(): void {
    if (!this.hass) {
      throw new Error('Home Assistant connection not available. Please reload the page.');
    }
    if (!this.hass.callApi) {
      throw new Error('Home Assistant API not available. Connection may have been lost.');
    }
  }

  /**
   * Fetch database size information
   */
  async fetchDatabaseSize(): Promise<DatabaseSize> {
    this.validateConnection();
    try {
      return await this.hass.callApi<DatabaseSize>('GET', `${API_BASE}?action=database_size`);
    } catch (err) {
      throw new Error(`Failed to fetch database size: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch entity storage overview step by step (progressive loading)
   * Steps 0-7 return status updates, step 8 returns complete overview
   */
  async fetchEntityStorageOverviewStep(step: number): Promise<StepResponse> {
    this.validateConnection();

    if (step < 0 || step > 8) {
      throw new Error(`Invalid step: ${step}. Must be between 0-8.`);
    }

    try {
      return await this.hass.callApi<StepResponse>(
        'GET',
        `${API_BASE}?action=entity_storage_overview_step&step=${step}`
      );
    } catch (err) {
      throw new Error(
        `Failed to fetch overview step ${step}: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
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
    this.validateConnection();
    try {
      const url = `${API_BASE}?action=generate_delete_sql` +
        `&entity_id=${encodeURIComponent(entityId)}` +
        `&in_states_meta=${inStatesMeta ? 'true' : 'false'}` +
        `&in_statistics_meta=${inStatisticsMeta ? 'true' : 'false'}` +
        `&origin=${encodeURIComponent(origin)}`;

      return await this.hass.callApi<GenerateSqlResponse>('GET', url);
    } catch (err) {
      throw new Error(`Failed to generate delete SQL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch hourly message histogram for an entity
   */
  async fetchMessageHistogram(entityId: string, hours: number): Promise<MessageHistogramResponse> {
    this.validateConnection();

    if (![24, 48, 168].includes(hours)) {
      throw new Error(`Invalid hours parameter: ${hours}. Must be 24, 48, or 168.`);
    }

    try {
      const url = `${API_BASE}?action=entity_message_histogram` +
        `&entity_id=${encodeURIComponent(entityId)}` +
        `&hours=${hours}`;

      return await this.hass.callApi<MessageHistogramResponse>('GET', url);
    } catch (err) {
      throw new Error(`Failed to fetch message histogram: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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
