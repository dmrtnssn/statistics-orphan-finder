/**
 * Statistics Orphan Finder V2 - Main Panel Component
 * Built with Lit + TypeScript for better maintainability
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { sharedStyles } from './styles/shared-styles';
import { ApiService } from './services/api-service';
import type {
  OrphanEntity,
  DatabaseSize,
  StorageEntity,
  StorageSummary,
  HomeAssistant,
  DeleteModalData
} from './types';
import './views/orphan-finder-view';
import './views/storage-overview-view';
import type { OrphanFinderView } from './views/orphan-finder-view';
import type { StorageOverviewView } from './views/storage-overview-view';

@customElement('statistics-orphan-panel-v2')
export class StatisticsOrphanPanelV2 extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;

  @state() private currentView: 'orphans' | 'storage' = 'orphans';
  @state() private loading = false;
  @state() private loadingMessage = '';
  @state() private loadingSteps: Array<{label: string, status: 'pending' | 'active' | 'complete'}> = [];
  @state() private currentStepIndex = 0;
  @state() private error: string | null = null;

  // Orphan Finder data
  @state() private orphans: OrphanEntity[] = [];
  @state() private databaseSize: DatabaseSize | null = null;
  @state() private deletedStorage = 0;
  @state() private unavailableStorage = 0;

  // Storage Overview data
  @state() private storageEntities: StorageEntity[] = [];
  @state() private storageSummary: StorageSummary | null = null;

  @query('orphan-finder-view') private orphanView?: OrphanFinderView;
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

      .tab-navigation {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
      }

      .tab-button {
        padding: 8px 24px;
        background: var(--secondary-background-color);
        border: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        transition: background 0.3s;
      }

      .tab-button:hover {
        background: var(--divider-color);
      }

      .tab-button.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
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
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        text-align: center;
        color: var(--primary-text-color);
      }

      .loading-steps {
        margin-bottom: 20px;
      }

      .loading-step {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        font-size: 14px;
      }

      .step-indicator {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
      }

      .step-label {
        color: var(--primary-text-color);
      }

      .loading-step.pending .step-label {
        color: var(--secondary-text-color);
        opacity: 0.6;
      }

      .loading-step.active .step-label {
        font-weight: 500;
        color: var(--primary-color);
      }

      .loading-step.complete .step-label {
        color: var(--primary-text-color);
      }

      .loading-progress {
        text-align: center;
        font-size: 13px;
        color: var(--secondary-text-color);
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
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
    this.apiService = new ApiService(this.hass);
    // Don't auto-load data - user must click Refresh button
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

  private async loadOrphanFinderData() {
    this.loading = true;
    this.error = null;

    this.initLoadingSteps([
      'Reading entity registry',
      'Reading state machine',
      'Scanning states_meta table',
      'Scanning statistics_meta table',
      'Identifying deleted entities',
      'Identifying unavailable entities',
      'Calculating storage usage',
      'Fetching database statistics'
    ]);

    try {
      this.loadingMessage = 'Analyzing orphaned entities...';
      // Simulate backend steps (in reality, backend does all at once)
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // entity registry
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // state machine
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // states_meta
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // statistics_meta
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // deleted entities

      const orphanData = await this.apiService.fetchOrphansList();
      this.orphans = orphanData.orphans;
      this.deletedStorage = orphanData.deleted_storage;
      this.unavailableStorage = orphanData.unavailable_storage;
      this.completeCurrentStep(); // unavailable entities
      this.completeCurrentStep(); // storage usage

      this.loadingMessage = 'Fetching database statistics...';
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.completeCurrentStep(); // database stats

      this.loadingMessage = 'Complete!';
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error loading orphan finder data:', err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }

  private async loadStorageOverviewData() {
    this.loading = true;
    this.error = null;

    this.initLoadingSteps([
      'Reading entity registry',
      'Reading state machine',
      'Scanning states_meta table',
      'Scanning states table',
      'Scanning statistics_meta table',
      'Scanning statistics tables',
      'Calculating entity summaries',
      'Fetching database statistics'
    ]);

    try {
      this.loadingMessage = 'Building storage overview...';
      // Simulate backend steps (in reality, backend does all at once)
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // entity registry
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // state machine
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // states_meta
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // states table
      await new Promise(resolve => setTimeout(resolve, 100));
      this.completeCurrentStep(); // statistics_meta

      const overview = await this.apiService.fetchEntityStorageOverview();
      this.storageEntities = overview.entities;
      this.storageSummary = overview.summary;
      this.completeCurrentStep(); // statistics tables
      this.completeCurrentStep(); // calculating summaries

      this.loadingMessage = 'Fetching database statistics...';
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.completeCurrentStep(); // database stats

      this.loadingMessage = 'Complete!';
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error loading storage overview data:', err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }

  private handleTabChange(view: 'orphans' | 'storage') {
    this.currentView = view;
    // Don't auto-load data - user must click Refresh button
  }

  private handleRefresh() {
    if (this.currentView === 'orphans') {
      this.loadOrphanFinderData();
    } else {
      this.loadStorageOverviewData();
    }
  }

  private async handleGenerateSql(e: CustomEvent) {
    const { entity_id, in_states_meta, in_statistics_meta, metadataId, origin, entity } = e.detail;

    this.loading = true;
    this.loadingMessage = 'Generating SQL...';

    try {
      let result;

      // Use new API if entity_id is provided (from Storage Overview)
      if (entity_id !== undefined && in_states_meta !== undefined) {
        result = await this.apiService.generateDeleteSql(entity_id, origin, in_states_meta, in_statistics_meta);
      } else {
        // Legacy API for Orphan Finder view (metadata_id + origin)
        result = await this.apiService.generateDeleteSql(metadataId, origin);
      }

      const modalData: DeleteModalData = {
        entityId: entity.entityId || entity.entity_id || entity_id,
        metadataId: metadataId || 0,
        origin,
        status: entity.status || 'deleted',
        count: entity.count
      };

      // Show modal in the active view
      if (this.currentView === 'orphans' && this.orphanView) {
        this.orphanView.showDeleteModal(modalData, result.sql, result.storage_saved);
      } else if (this.currentView === 'storage' && this.storageView) {
        this.storageView.showDeleteModal(modalData, result.sql, result.storage_saved);
      }
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
          <strong>Error:</strong> ${this.error}
        </div>
      ` : ''}

      <div class="tab-navigation">
        <button
          class="tab-button ${this.currentView === 'orphans' ? 'active' : ''}"
          @click=${() => this.handleTabChange('orphans')}
        >
          Orphaned Entities
        </button>
        <button
          class="tab-button ${this.currentView === 'storage' ? 'active' : ''}"
          @click=${() => this.handleTabChange('storage')}
        >
          Storage Overview
        </button>
      </div>

      ${this.currentView === 'orphans' ? html`
        <orphan-finder-view
          .hass=${this.hass}
          .orphans=${this.orphans}
          .databaseSize=${this.databaseSize}
          .deletedStorage=${this.deletedStorage}
          .unavailableStorage=${this.unavailableStorage}
          @generate-sql=${this.handleGenerateSql}
        ></orphan-finder-view>
      ` : html`
        <storage-overview-view
          .hass=${this.hass}
          .entities=${this.storageEntities}
          .summary=${this.storageSummary}
          .databaseSize=${this.databaseSize}
          @generate-sql=${this.handleGenerateSql}
        ></storage-overview-view>
      `}

      ${this.loading ? html`
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-title">${this.loadingMessage}</div>

            ${this.loadingSteps.length > 0 ? html`
              <div class="loading-steps">
                ${this.loadingSteps.map((step, index) => {
                  let indicator = '○';
                  if (step.status === 'complete') indicator = '●';
                  else if (step.status === 'active') indicator = '⧗';

                  return html`
                    <div class="loading-step ${step.status}">
                      <span class="step-indicator">${indicator}</span>
                      <span class="step-label">${step.label}</span>
                    </div>
                  `;
                })}
              </div>

              <div class="loading-progress">
                Step ${this.currentStepIndex + 1} of ${this.loadingSteps.length}
              </div>
            ` : html`
              <div style="text-align: center;">
                <div class="loading-spinner"></div>
              </div>
            `}
          </div>
        </div>
      ` : ''}
    `;
  }
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'statistics-orphan-panel-v2': StatisticsOrphanPanelV2;
  }
}
