/**
 * Statistics Orphan Finder - Main Panel Component
 * Built with Lit + TypeScript for better maintainability
 */

import { LitElement, html, css } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { sharedStyles } from './styles/shared-styles';
import { ApiService } from './services/api-service';
import { CacheService } from './services/cache-service';
import type {
  DatabaseSize,
  StorageEntity,
  StorageSummary,
  HomeAssistant,
  DeleteModalData
} from './types';
import './views/storage-overview-view';
import type { StorageOverviewView } from './views/storage-overview-view';

export class StatisticsOrphanPanel extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;

  @state() private loading = false;
  @state() private loadingSteps: Array<{label: string, status: 'pending' | 'active' | 'complete'}> = [];
  @state() private currentStepIndex = 0;
  @state() private error: string | null = null;

  // Storage Overview data
  @state() private databaseSize: DatabaseSize | null = null;
  @state() private storageEntities: StorageEntity[] = [];
  @state() private storageSummary: StorageSummary | null = null;

  // Cache management
  @state() private cacheTimestamp: number | null = null;
  @state() private showStaleBanner: boolean = false;
  @state() private dataSource: 'live' | 'cache' | null = null;

  @query('storage-overview-view') private storageView?: StorageOverviewView;

  private apiService!: ApiService;
  private boundVisibilityHandler!: () => void;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-content {
        background: var(--card-background-color);
        padding: 32px;
        border-radius: 8px;
        min-width: 400px;
        max-width: 500px;
      }

      .loading-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 32px;
        text-align: center;
        color: var(--primary-text-color);
      }

      .loading-spinner {
        display: block;
        margin: 0 auto 24px;
      }

      .loading-step-counter {
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }

      .loading-step-description {
        text-align: center;
        font-size: 15px;
        color: var(--primary-text-color);
        min-height: 20px;
      }

      .error-message {
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid var(--error-color, #F44336);
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
        color: var(--error-color, #F44336);
      }

      .stale-cache-banner {
        background: rgba(255, 193, 7, 0.1);
        border-left: 4px solid #FFC107;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .stale-cache-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .stale-cache-content {
        flex: 1;
      }

      .stale-cache-title {
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .stale-cache-message {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .stale-cache-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .cache-indicator {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .refresh-button {
        margin-left: 16px;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    console.debug('[Panel] Component connected to DOM');

    if (this.hass) {
      this.apiService = new ApiService(this.hass);
    }

    // Try to load data from cache immediately
    // This ensures the panel has data to render even after being recreated
    const cacheLoaded = this.loadFromCache();
    console.debug('[Panel] Cache load attempt:', cacheLoaded ? 'success' : 'no cache found');

    // Add visibility change listener for recovery
    this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.debug('[Panel] Component disconnected from DOM');

    // Clean up event listeners
    if (this.boundVisibilityHandler) {
      document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    }
  }

  /**
   * Handle page visibility changes
   * Provides recovery mechanism if panel data is lost
   */
  private handleVisibilityChange(): void {
    if (!document.hidden) {
      // User returned to tab/window
      console.debug('[Panel] Tab became visible, checking panel health');

      // If we have no data and aren't currently loading, try to recover from cache
      if (!this.storageEntities.length && !this.loading && !this.storageSummary) {
        console.warn('[Panel] Panel data lost, attempting recovery from cache');
        const recovered = this.loadFromCache();

        if (!recovered) {
          console.error('[Panel] No cache available for recovery');
          // Could show an error message to user here
          this.error = 'Panel data was lost. Please click Refresh to reload.';
        } else {
          console.log('[Panel] Successfully recovered data from cache');
        }
      }
    }
  }

  protected willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);

    // Reinitialize API service when hass connection changes
    if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass');

      // Only log when connection state actually changes (not on every state update)
      if (this.hass && !oldHass) {
        // Connection established
        console.log('[Panel] Home Assistant connection established');
      } else if (!this.hass && oldHass) {
        // Connection lost
        console.warn('[Panel] Home Assistant connection lost');
        if (!this.error) {
          this.error = 'Connection to Home Assistant lost. Waiting for reconnection...';
        }
      }

      // Reinitialize API service whenever hass is available (even on updates)
      if (this.hass) {
        this.apiService = new ApiService(this.hass);

        // Clear any previous connection errors
        if (this.error?.includes('connection') || this.error?.includes('Connection')) {
          this.error = null;
        }
      }
    }
  }

  private initLoadingSteps(steps: string[]) {
    this.loadingSteps = steps.map((label, index) => ({
      label,
      status: index === 0 ? 'active' : 'pending'
    }));
    this.currentStepIndex = 0;
  }

  private completeCurrentStep() {
    if (this.currentStepIndex < this.loadingSteps.length) {
      this.loadingSteps[this.currentStepIndex].status = 'complete';
      this.currentStepIndex++;

      if (this.currentStepIndex < this.loadingSteps.length) {
        this.loadingSteps[this.currentStepIndex].status = 'active';
      }

      // Trigger re-render
      this.requestUpdate();
    }
  }

  private async loadStorageOverviewData() {
    console.log('[Panel] Starting data load (9-step process)');
    this.loading = true;
    this.error = null;

    this.initLoadingSteps([
      'Initializing',
      'Scanning states_meta table',
      'Scanning states table',
      'Scanning statistics_meta table',
      'Scanning statistics_short_term table',
      'Scanning statistics (long-term) table',
      'Reading entity registry and state machine',
      'Calculating storage for deleted entities',
      'Finalizing and generating summary'
    ]);

    try {
      // Validate hass before starting
      if (!this.hass) {
        throw new Error('Home Assistant connection not available. Please reload the page.');
      }

      // Execute steps 0-8 sequentially
      for (let step = 0; step <= 8; step++) {
        console.debug(`[Panel] Executing step ${step + 1}/9`);
        const result = await this.apiService.fetchEntityStorageOverviewStep(step);

        if (step === 8) {
          // Final step returns the complete overview
          this.storageEntities = result.entities;
          this.storageSummary = result.summary;
          console.log(`[Panel] Data loaded: ${result.entities.length} entities`);
        }

        // Don't increment on the last step to avoid showing "Step 10 of 9"
        if (step < 8) {
          this.completeCurrentStep();
        }
      }

      this.databaseSize = await this.apiService.fetchDatabaseSize();

      // Clear any previous errors on successful load
      this.error = null;

      // Save to cache after successful load
      this.saveToCache();
      console.log('[Panel] Data load complete and cached');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[Panel] Error loading storage overview data:', err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }

  private handleRefresh() {
    this.loadStorageOverviewData();
  }

  private handleRetry() {
    // Clear error and retry the last operation
    this.error = null;
    this.loadStorageOverviewData();
  }

  /**
   * Load data from cache if available
   */
  private loadFromCache(): boolean {
    try {
      const cache = CacheService.loadCache();
      if (!cache) {
        console.debug('[Panel] No cache available');
        return false;
      }

      // Restore cached data
      this.databaseSize = cache.data.databaseSize;
      this.storageEntities = cache.data.storageEntities;
      this.storageSummary = cache.data.storageSummary;
      this.cacheTimestamp = cache.timestamp;
      this.dataSource = 'cache';

      // Check if cache is stale (>12 hours = 43200000 ms)
      const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
      this.showStaleBanner = CacheService.isCacheStale(TWELVE_HOURS_MS, cache);

      console.log('[Panel] Data restored from cache', {
        age: CacheService.formatAge(CacheService.getCacheAge(cache)),
        entities: this.storageEntities.length,
        isStale: this.showStaleBanner,
      });

      return true;
    } catch (error) {
      console.debug('[Panel] Failed to load from cache:', error);
      return false;
    }
  }

  /**
   * Save current data to cache
   */
  private saveToCache(): void {
    try {
      const success = CacheService.saveCache(
        this.databaseSize,
        this.storageEntities,
        this.storageSummary
      );

      if (success) {
        this.cacheTimestamp = Date.now();
        this.dataSource = 'live';
        this.showStaleBanner = false;
        console.log('[Panel] Data saved to cache');
      }
    } catch (error) {
      console.debug('[Panel] Failed to save to cache:', error);
    }
  }

  /**
   * Get formatted cache age string
   */
  private getCacheAgeString(): string {
    if (!this.cacheTimestamp) {
      return 'unknown';
    }
    const age = Date.now() - this.cacheTimestamp;
    const ageStr = CacheService.formatAge(age);

    // Handle "just now" case for very recent refreshes
    const seconds = Math.floor(age / 1000);
    if (seconds < 10) {
      return 'just now';
    }

    return ageStr;
  }

  /**
   * Dismiss the stale data banner
   */
  private dismissStaleBanner(): void {
    this.showStaleBanner = false;
  }

  private async handleGenerateSql(e: CustomEvent) {
    const { entity_id, in_states_meta, in_statistics_meta, origin, entity } = e.detail;

    this.loading = true;

    try {
      // Validate hass before starting
      if (!this.hass) {
        throw new Error('Home Assistant connection not available. Please reload the page.');
      }

      const result = await this.apiService.generateDeleteSql(
        entity_id,
        origin,
        in_states_meta,
        in_statistics_meta
      );

      const modalData: DeleteModalData = {
        entityId: entity.entityId || entity.entity_id || entity_id,
        metadataId: entity.metadata_id || 0,
        origin,
        status: entity.status || 'deleted',
        count: entity.count
      };

      // Show modal in the storage overview view
      if (this.storageView) {
        await this.storageView.showDeleteModal(modalData, result.sql, result.storage_saved);
      }

      // Clear any previous errors on success
      this.error = null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to generate SQL';
      console.error('Error generating SQL:', err);
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Statistics Orphan Finder</h1>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${this.cacheTimestamp ? html`
            <span class="cache-indicator">
              Refreshed ${this.getCacheAgeString()}
            </span>
          ` : ''}
          <button class="refresh-button" @click=${this.handleRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      ${this.showStaleBanner ? html`
        <div class="stale-cache-banner">
          <div class="stale-cache-icon">⚠️</div>
          <div class="stale-cache-content">
            <div class="stale-cache-title">Showing cached data</div>
            <div class="stale-cache-message">
              Data is from cache (${this.getCacheAgeString()}). Click Refresh to update with latest information.
            </div>
          </div>
          <div class="stale-cache-actions">
            <button @click=${this.handleRefresh}>
              Refresh Now
            </button>
            <button class="secondary-button" @click=${this.dismissStaleBanner}>
              Dismiss
            </button>
          </div>
        </div>
      ` : ''}

      ${this.error ? html`
        <div class="error-message">
          <div>
            <strong>Error:</strong> ${this.error}
          </div>
          <button
            class="secondary-button"
            @click=${this.handleRetry}
            style="margin-top: 12px;"
          >
            Retry
          </button>
        </div>
      ` : ''}

      <storage-overview-view
        .hass=${this.hass}
        .entities=${this.storageEntities}
        .summary=${this.storageSummary}
        .databaseSize=${this.databaseSize}
        @generate-sql=${this.handleGenerateSql}
      ></storage-overview-view>

      ${this.loading ? html`
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-title">Refreshing data</div>

            <div class="loading-spinner"></div>

            ${this.loadingSteps.length > 0 ? html`
              <div class="loading-step-counter">
                Step ${this.currentStepIndex + 1} of ${this.loadingSteps.length}
              </div>

              <div class="loading-step-description">
                ${this.loadingSteps[this.currentStepIndex]?.label || ''}
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    `;
  }
}

// Register the custom element only if not already registered
// Wrap in try-catch to prevent silent failures during module initialization
try {
  if (!customElements.get('statistics-orphan-panel')) {
    customElements.define('statistics-orphan-panel', StatisticsOrphanPanel);
    console.debug('[Panel] Custom element registered successfully');
  } else {
    console.debug('[Panel] Custom element already registered');
  }
} catch (error) {
  console.error('[Panel] Failed to register custom element:', error);
  // Don't re-throw - let Home Assistant handle the error
  // This prevents the entire module from failing to load
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'statistics-orphan-panel': StatisticsOrphanPanel;
  }
}
