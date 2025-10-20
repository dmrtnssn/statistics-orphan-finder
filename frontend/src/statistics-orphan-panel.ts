/**
 * Statistics Orphan Finder - Main Panel Component
 * Built with Lit + TypeScript for better maintainability
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { sharedStyles } from './styles/shared-styles';
import { ApiService } from './services/api-service';
import type {
  DatabaseSize,
  StorageEntity,
  StorageSummary,
  HomeAssistant,
  DeleteModalData
} from './types';
import './views/storage-overview-view';
import type { StorageOverviewView } from './views/storage-overview-view';

@customElement('statistics-orphan-panel')
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

  @query('storage-overview-view') private storageView?: StorageOverviewView;

  private apiService!: ApiService;

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

      .refresh-button {
        margin-left: 16px;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    if (this.hass) {
      this.apiService = new ApiService(this.hass);
    }
    // Don't auto-load data - user must click Refresh button
  }

  protected willUpdate(changedProperties: Map<string, any>) {
    super.willUpdate(changedProperties);

    // Reinitialize API service when hass connection changes
    if (changedProperties.has('hass') && this.hass) {
      this.apiService = new ApiService(this.hass);
      // Clear any previous connection errors
      if (this.error?.includes('connection') || this.error?.includes('Connection')) {
        this.error = null;
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
        const result = await this.apiService.fetchEntityStorageOverviewStep(step);

        if (step === 8) {
          // Final step returns the complete overview
          this.storageEntities = result.entities;
          this.storageSummary = result.summary;
        }

        // Don't increment on the last step to avoid showing "Step 10 of 9"
        if (step < 8) {
          this.completeCurrentStep();
        }
      }

      this.databaseSize = await this.apiService.fetchDatabaseSize();

      // Clear any previous errors on successful load
      this.error = null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error loading storage overview data:', err);
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
        <button class="refresh-button" @click=${this.handleRefresh}>
          ↻ Refresh
        </button>
      </div>

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

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'statistics-orphan-panel': StatisticsOrphanPanel;
  }
}
