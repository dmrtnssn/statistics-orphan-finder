/**
 * StorageOverviewView - Storage overview tab with 15-column table
 * This component solves the table width problem with horizontal scroll + sticky first column
 */

import { LitElement, html, css, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber, formatRelativeTime, formatFullTimestamp } from '../services/formatters';
import type {
  StorageEntity,
  StorageSummary,
  DatabaseSize,
  ColumnConfig,
  SortState,
  DeleteModalData,
  HomeAssistant,
  BulkSqlGenerationResult
} from '../types';
import { ApiService } from '../services/api-service';
import '../components/storage-health-summary';
import '../components/filter-bar';
import '../components/entity-table';
import '../components/selection-panel';
import '../components/message-histogram-tooltip';
// Modals are lazy-loaded to reduce initial bundle size

export class StorageOverviewView extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: Array }) entities: StorageEntity[] = [];
  @property({ type: Object }) summary: StorageSummary | null = null;
  @property({ type: Object }) databaseSize: DatabaseSize | null = null;

  @state() private searchQuery = '';
  @state() private basicFilter: string | null = null;
  @state() private registryFilter: string | null = null;
  @state() private stateFilter: string | null = null;
  @state() private advancedFilter: string | null = null;
  @state() private statesFilter: string | null = null;
  @state() private statisticsFilter: string | null = null;
  @state() private sortStack: SortState[] = [{ column: 'entity_id', direction: 'asc' }];
  @state() private selectedEntity: StorageEntity | null = null;
  @state() private deleteModalData: DeleteModalData | null = null;
  @state() private deleteSql = '';
  @state() private deleteStorageSaved = 0;

  // Confirmation mode state for new two-state modal
  @state() private deleteModalMode: 'confirm' | 'display' = 'display';
  @state() private deleteModalEntities: StorageEntity[] = [];
  @state() private deleteModalDeletedCount = 0;
  @state() private deleteModalDisabledCount = 0;

  // Selection state for bulk operations
  @state() private selectedEntityIds: Set<string> = new Set();
  @state() private isGeneratingBulkSql = false;
  @state() private bulkSqlProgress = 0;
  @state() private bulkSqlTotal = 0;

  // Memoization for filtered entities
  private _cachedFilteredEntities: StorageEntity[] = [];
  private _lastFilterKey = '';

  // Lazy loading flags for modal components
  private _entityDetailsModalLoaded = false;
  private _deleteSqlModalLoaded = false;

  // Message histogram state
  @state() private histogramEntityId: string | null = null;
  @state() private histogramLastUpdate: string | null = null;
  @state() private histogramPosition = { x: 0, y: 0 };
  private histogramHideTimeout: number | null = null;

  /**
   * Lazy load the entity details modal component
   */
  private async _loadEntityDetailsModal() {
    if (!this._entityDetailsModalLoaded) {
      await import('../components/entity-details-modal');
      this._entityDetailsModalLoaded = true;
    }
  }

  /**
   * Lazy load the delete SQL modal component
   */
  private async _loadDeleteSqlModal() {
    if (!this._deleteSqlModalLoaded) {
      await import('../components/delete-sql-modal');
      this._deleteSqlModalLoaded = true;
    }
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    // Clear cache when entities array changes
    if (changedProperties.has('entities')) {
      this._lastFilterKey = '';
      this._cachedFilteredEntities = [];
    }

    // Validate hass connection
    if (changedProperties.has('hass') && !this.hass) {
      console.warn('StorageOverviewView: hass connection became unavailable');
    }
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }

      .search-and-sort-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }

      .search-and-sort-row filter-bar {
        flex: 1;
      }

      .table-container {
        /* Add bottom padding when selection panel is visible to prevent last row from being covered */
        padding-bottom: 0;
        transition: padding-bottom 0.3s ease-out;
      }

      .table-container.has-selections {
        padding-bottom: 100px;
      }

      .message-interval-cell {
        cursor: help;
        position: relative;
      }

      .histogram-tooltip {
        position: fixed;
        z-index: 9999;
        pointer-events: auto;
      }
    `
  ];

  /**
   * Check if entity has been disabled and has statistics data
   *
   * Note: Disabled entities with statistics are eligible for cleanup.
   * This allows users to delete historical data for entities they've disabled.
   */
  private isDisabledForAtLeast90Days(entity: StorageEntity): boolean {
    try {
      // Entity must be disabled
      if (!entity || entity.registry_status !== 'Disabled') return false;

      // Must have statistics or states data (otherwise nothing to delete)
      return !!(entity.in_states_meta || entity.in_statistics_meta);
    } catch (err) {
      console.warn('[StorageOverviewView] Error in isDisabledForAtLeast90Days:', entity?.entity_id, err);
      return false;
    }
  }

  /**
   * Get entity selection type for UI differentiation
   */
  private getEntitySelectionType(entity: StorageEntity): 'deleted' | 'disabled' | 'not-selectable' {
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
   * Get entities that are eligible for deletion
   * Includes both deleted entities and disabled entities
   */
  private get selectableEntities(): StorageEntity[] {
    return this.filteredEntities.filter(entity => {
      const hasData = entity.in_states_meta || entity.in_statistics_meta;
      if (!hasData) return false;

      // Deleted entities (existing behavior)
      const isDeleted = !entity.in_entity_registry && !entity.in_state_machine;

      // Disabled entities with statistics
      const isDisabledLongEnough = this.isDisabledForAtLeast90Days(entity);

      return isDeleted || isDisabledLongEnough;
    });
  }

  /**
   * Get Set of selectable entity IDs for efficient lookups
   */
  private get selectableEntityIds(): Set<string> {
    return new Set(this.selectableEntities.map(e => e.entity_id));
  }

  /**
   * Get set of disabled entity IDs (for visual differentiation)
   */
  private get disabledEntityIds(): Set<string> {
    // Defensive: Return empty set if entities array is not ready
    if (!this.entities || !Array.isArray(this.entities) || this.entities.length === 0) {
      return new Set();
    }

    try {
      return new Set(
        this.entities
          .filter(e => e && this.isDisabledForAtLeast90Days(e))
          .map(e => e.entity_id)
      );
    } catch (err) {
      console.warn('[StorageOverviewView] Error computing disabledEntityIds:', err);
      return new Set();
    }
  }

  /**
   * Get breakdown of selected entities by type (deleted vs disabled)
   */
  private get selectionBreakdown(): { deleted: StorageEntity[]; disabled: StorageEntity[] } {
    const deleted: StorageEntity[] = [];
    const disabled: StorageEntity[] = [];

    this.selectedEntityIds.forEach(entityId => {
      const entity = this.entities.find(e => e.entity_id === entityId);
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
  private formatDisabledDuration(entity: StorageEntity): string {
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

  private get filteredEntities(): StorageEntity[] {
    // Create a cache key from all filter parameters
    const filterKey = `${this.searchQuery}|${this.basicFilter}|${this.registryFilter}|${this.stateFilter}|${this.advancedFilter}|${this.statesFilter}|${this.statisticsFilter}|${this.sortStack.map(s => `${s.column}:${s.direction}`).join(',')}`;

    // Return cached result if filters haven't changed
    if (filterKey === this._lastFilterKey && this._cachedFilteredEntities.length > 0) {
      return this._cachedFilteredEntities;
    }

    // Filters changed - recompute
    let filtered = [...this.entities];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.entity_id.toLowerCase().includes(query));
    }

    // Basic filters
    if (this.basicFilter === 'in_registry') {
      filtered = filtered.filter(e => e.in_entity_registry);
    } else if (this.basicFilter === 'in_state') {
      filtered = filtered.filter(e => e.in_state_machine);
    } else if (this.basicFilter === 'deleted') {
      filtered = filtered.filter(e => !e.in_entity_registry && !e.in_state_machine);
    } else if (this.basicFilter === 'numeric_sensors_no_stats') {
      filtered = filtered.filter(e =>
        e.entity_id.startsWith('sensor.') &&
        e.in_states_meta &&
        !e.in_statistics_meta &&
        e.statistics_eligibility_reason &&
        !e.statistics_eligibility_reason.includes("is not numeric")
      );
    }

    // Registry status filter
    if (this.registryFilter) {
      filtered = filtered.filter(e => e.registry_status === this.registryFilter);
    }

    // State status filter
    if (this.stateFilter) {
      filtered = filtered.filter(e => e.state_status === this.stateFilter);
    }

    // Advanced filters
    if (this.advancedFilter === 'only_states') {
      filtered = filtered.filter(e => e.in_states && !e.in_statistics_meta);
    } else if (this.advancedFilter === 'only_stats') {
      filtered = filtered.filter(e => e.in_statistics_meta && !e.in_states);
    }

    // States filter
    if (this.statesFilter === 'in_states') {
      filtered = filtered.filter(e => e.in_states);
    } else if (this.statesFilter === 'not_in_states') {
      filtered = filtered.filter(e => !e.in_states);
    }

    // Statistics filter
    if (this.statisticsFilter === 'in_statistics') {
      filtered = filtered.filter(e => e.in_statistics_meta);
    } else if (this.statisticsFilter === 'not_in_statistics') {
      filtered = filtered.filter(e => !e.in_statistics_meta);
    }

    // Cache the result
    this._lastFilterKey = filterKey;
    this._cachedFilteredEntities = this.sortEntities(filtered);

    return this._cachedFilteredEntities;
  }

  private sortEntities(entities: StorageEntity[]): StorageEntity[] {
    return [...entities].sort((a, b) => {
      for (const { column, direction } of this.sortStack) {
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

  private getActiveFilterType(): string | null {
    if (this.basicFilter) return this.basicFilter;
    if (this.registryFilter) return `registry_${this.registryFilter}`;
    if (this.stateFilter) return `state_${this.stateFilter}`;
    if (this.advancedFilter) return this.advancedFilter;
    return null;
  }

  private get tableColumns(): ColumnConfig<StorageEntity>[] {
    return [
      {
        id: 'entity_id',
        label: 'Entity ID',
        sortable: true,
        render: (entity: StorageEntity) => html`
          <span class="entity-id-link" @click=${() => this.handleEntityClick(entity)}>
            ${entity.entity_id}
          </span>
        `
      },
      {
        id: 'registry',
        label: 'Registry',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => {
          if (entity.registry_status === 'Enabled') {
            return html`<span class="status-badge status-enabled" title="Enabled">✓</span>`;
          } else if (entity.registry_status === 'Disabled') {
            return html`<span class="status-badge status-disabled" title="Disabled">⊘</span>`;
          }
          return html`<span class="status-badge status-not-in-registry" title="Not in Registry">✕</span>`;
        }
      },
      {
        id: 'state',
        label: 'State machine',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => {
          if (entity.state_status === 'Available') {
            return html`<span class="status-badge status-available" title="Available">✓</span>`;
          } else if (entity.state_status === 'Unavailable') {
            return html`<span class="status-badge status-unavailable" title="Unavailable">⚠</span>`;
          }
          return html`<span class="status-badge status-not-present" title="Not Present">○</span>`;
        }
      },
      {
        id: 'states_meta',
        label: 'States meta',
        sortable: true,
        align: 'center',
        className: 'group-border-left',
        render: (entity: StorageEntity) => entity.in_states_meta ? '✓' : ''
      },
      {
        id: 'states',
        label: 'States table',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_states ? '✓' : ''
      },
      {
        id: 'states_count',
        label: 'States records',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.states_count)
      },
      {
        id: 'update_interval',
        label: 'Message cadence',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => html`
          <div
            class="message-interval-cell"
            @mouseenter=${(e: MouseEvent) => this.handleShowHistogram(entity.entity_id, e)}
            @mouseleave=${() => this.handleHideHistogram()}
          >
            ${entity.update_interval || ''}
          </div>
        `
      },
      {
        id: 'last_state_update',
        label: 'Last state update',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => html`
          <div
            class="message-interval-cell"
            @mouseenter=${(e: MouseEvent) => this.handleShowHistogram(entity.entity_id, e, entity.last_state_update)}
            @mouseleave=${() => this.handleHideHistogram()}
          >
            ${formatRelativeTime(entity.last_state_update)}
          </div>
        `
      },
      {
        id: 'stats_meta',
        label: 'Stats meta',
        sortable: true,
        align: 'center',
        className: 'group-border-left',
        render: (entity: StorageEntity) => entity.in_statistics_meta ? '✓' : ''
      },
      {
        id: 'stats_short',
        label: 'Short stats',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_statistics_short_term ? '✓' : ''
      },
      {
        id: 'stats_long',
        label: 'Long stats',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_statistics_long_term ? '✓' : ''
      },
      {
        id: 'stats_short_count',
        label: 'Short records',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.stats_short_count)
      },
      {
        id: 'stats_long_count',
        label: 'Long records',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.stats_long_count)
      },
      {
        id: 'last_stats_update',
        label: 'Last stats update',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => html`
          <span title="${formatFullTimestamp(entity.last_stats_update)}">
            ${formatRelativeTime(entity.last_stats_update)}
          </span>
        `
      },
      {
        id: 'actions',
        label: 'Actions',
        sortable: false,
        align: 'center',
        width: '80px',
        className: 'group-border-left',
        render: (entity: StorageEntity) => {
          // Show delete button for both deleted entities AND disabled entities
          const isSelectable = this.selectableEntityIds.has(entity.entity_id);

          return html`
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button
                class="info-icon-btn"
                @click=${() => this.handleEntityClick(entity)}
                title="Show details"
                style="background: none; border: none; cursor: pointer; padding: 4px; color: #3288cb;"
              >
                <svg viewBox="0 0 90 90" width="18" height="18" fill="currentColor">
                  <circle cx="45" cy="45" r="45"/>
                  <path d="M54.717 63.299c-.264-.074-.566-.011-.769.164-5.643 5.009-7.288 5.625-7.734 5.657-.056.004-.18-.048-.344-.211-.206-.201-.317-.465-.342-.807-.172-2.383 1.447-9.741 4.812-21.87 2.826-10.143 3.089-12.2 3.041-12.863-.071-.99-.563-1.759-1.46-2.287-.854-.501-2.025-.701-3.477-.596-2.448.177-5.362 1.206-8.661 3.06-.943.531-1.926 1.166-2.92 1.886-2.622 1.9-4.06 4.79-3.848 7.729.017.241.206.446.478.522.273.075.578.005.773-.177 2.602-2.419 4.335-3.902 5.153-4.409.873-.54 1.651-.837 2.315-.885.245-.018.368-.027.397.38.039.541-.047 1.188-.255 1.919-4.927 16.991-7.17 27.343-6.86 31.647.106 1.463.672 2.6 1.684 3.382 1.024.793 2.363 1.137 3.976 1.02 1.757-.127 3.866-.902 6.446-2.369 1.241-.706 2.849-1.847 4.78-3.391 2.277-1.822 3.475-4.366 3.287-6.98-.017-.241-.201-.445-.471-.523z" fill="white"/>
                  <circle cx="50.831" cy="19.591" r="6.171" fill="white"/>
                </svg>
              </button>
              ${isSelectable ? html`
                <button
                  class="secondary-button"
                  @click=${() => this.handleGenerateSql(entity)}
                  title="Generate SQL to delete this entity"
                style="background: none; border: none; cursor: pointer; padding: 4px; color: #f44336;"
                >
<svg width="18" height="18" viewBox="0.045500002801418304 0.04500000178813934 0.45000001788139343 0.4500001072883606" fill="currentColor" style="color: #f44336">
  <path d="M.158.09A.045.045 0 0 1 .203.045h.135A.045.045 0 0 1 .383.09v.045h.09a.022.022 0 1 1 0 .045H.449l-.02.273a.045.045 0 0 1-.045.042H.156A.045.045 0 0 1 .111.453L.092.18H.068a.022.022 0 0 1 0-.045h.09zm.045.045h.135V.09H.202zM.137.18l.019.27h.228L.403.18zm.088.045a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .224.225m.09 0a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .313.225" fill="#f44336"/>
</svg>                </button>
              ` : ''}
            </div>
          `;
        }
      }
    ];
  }

  private handleHealthAction(e: CustomEvent<{ action: string }>) {
    const action = e.detail?.action;

    if (!action) {
      console.warn('[StorageOverviewView] Health action called without action detail');
      return;
    }

    // Clear all filters first
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;

    // Apply the clicked filter based on action
    switch (action) {
      case 'cleanup_deleted':
        this.basicFilter = 'deleted';
        break;
      case 'investigate_unavailable':
        this.stateFilter = 'Unavailable';
        this.basicFilter = 'in_state';
        break;
      case 'review_disabled':
        this.registryFilter = 'Disabled';
        this.basicFilter = 'in_registry';
        break;
      case 'optimize_storage':
        this.advancedFilter = 'only_states';
        break;
      case 'review_numeric_sensors':
        this.basicFilter = 'numeric_sensors_no_stats';
        break;
    }
  }

  private handleSearchChanged(e: CustomEvent) {
    this.searchQuery = e.detail.query;
  }

  private resetFilters(includeSearch = true) {
    if (includeSearch) {
      this.searchQuery = '';
    }
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    this.statesFilter = null;
    this.statisticsFilter = null;
  }

  private handleClearFilters() {
    this.resetFilters(true);
  }

  private handlePanelFilterReset() {
    this.resetFilters(false);
  }

  private handleFilterPanelChange(e: CustomEvent) {
    const { group, value } = e.detail;

    // Toggle filter: if already active, clear it; otherwise set it
    switch (group) {
      case 'registry':
        this.registryFilter = this.registryFilter === value ? null : value;
        break;
      case 'state':
        this.stateFilter = this.stateFilter === value ? null : value;
        break;
      case 'states':
        this.statesFilter = this.statesFilter === value ? null : value;
        break;
      case 'statistics':
        this.statisticsFilter = this.statisticsFilter === value ? null : value;
        break;
    }
  }

  private handleSortChanged(e: CustomEvent) {
    this.sortStack = e.detail.sortStack;
  }

  private handleClearSort() {
    this.sortStack = [{ column: 'entity_id', direction: 'asc' }];
  }

  private async handleEntityClick(entity: StorageEntity) {
    try {
      await this._loadEntityDetailsModal();
      this.selectedEntity = entity;
    } catch (err) {
      console.error('Error loading entity details modal:', err);
      // Fail gracefully - don't crash the component
    }
  }

  private handleCloseModal() {
    this.selectedEntity = null;
  }

  private handleOpenMoreInfo(e: CustomEvent<{ entityId: string }>) {
    try {
      if (!this.hass) {
        console.warn('Cannot open more info: Home Assistant connection not available');
        return;
      }

      const entityId = e.detail?.entityId;
      if (!entityId) {
        console.warn('Cannot open more info: No entity ID provided');
        return;
      }

      const event = new Event('hass-more-info', { bubbles: true, composed: true });
      (event as any).detail = { entityId };
      this.dispatchEvent(event);
    } catch (err) {
      console.error('Error opening more info dialog:', err);
      // Fail gracefully
    }
  }

  private async handleGenerateSql(entity: StorageEntity) {
    try {
      // Validate hass connection
      if (!this.hass) {
        console.warn('Cannot generate SQL: Home Assistant connection not available');
        return;
      }

      // Load the modal component first
      await this._loadDeleteSqlModal();

      // Determine if entity is deleted or disabled
      const isDeleted = !entity.in_entity_registry && !entity.in_state_machine;
      const isDisabled = entity.registry_status === 'Disabled';

      // Show confirmation modal first
      this.deleteModalMode = 'confirm';
      this.deleteModalEntities = [entity];
      this.deleteModalDeletedCount = isDeleted ? 1 : 0;
      this.deleteModalDisabledCount = isDisabled ? 1 : 0;

      // Trigger modal to show by setting a placeholder data object
      this.deleteModalData = {
        entityId: entity.entity_id,
        metadataId: entity.metadata_id || 0,
        origin: 'Both' as any, // Will be set properly after confirmation
        status: 'deleted', // Both deleted and disabled entities get their stats deleted
        count: 0 // Will be set properly after confirmation
      };
    } catch (err) {
      console.error('Error showing confirmation modal:', err);
      // Fail gracefully
    }
  }

  // Called by parent when SQL is ready (for single entity operations)
  async showDeleteModal(data: DeleteModalData, sql: string, storageSaved: number) {
    try {
      await this._loadDeleteSqlModal();
      // Transition modal to display mode with the SQL
      this.deleteModalMode = 'display';
      this.deleteModalData = data;
      this.deleteSql = sql;
      this.deleteStorageSaved = storageSaved;
    } catch (err) {
      console.error('Error loading delete SQL modal:', err);
      // Fail gracefully - don't crash the component
    }
  }

  private handleCloseDeleteModal() {
    this.deleteModalData = null;
    this.deleteSql = '';
    this.deleteStorageSaved = 0;
    this.deleteModalMode = 'display';
    this.deleteModalEntities = [];
    this.deleteModalDeletedCount = 0;
    this.deleteModalDisabledCount = 0;
  }

  /**
   * Handle cancel from confirmation modal
   */
  private handleDeleteModalCancel() {
    // Just close the modal
    this.handleCloseDeleteModal();
  }

  /**
   * Handle confirm from confirmation modal - generate SQL and show it
   */
  private async handleDeleteModalConfirm() {
    try {
      if (this.deleteModalEntities.length === 0) return;

      // Check if this is a single entity or bulk operation
      const isBulk = this.deleteModalEntities.length > 1;

      if (isBulk) {
        // Bulk operation - generate SQL for all selected entities
        await this.generateBulkSqlAfterConfirmation();
      } else {
        // Single entity operation
        const entity = this.deleteModalEntities[0];
        await this.generateSingleEntitySqlAfterConfirmation(entity);
      }
    } catch (err) {
      console.error('Error generating SQL after confirmation:', err);
      // Close modal on error
      this.handleCloseDeleteModal();
    }
  }

  /**
   * Generate SQL for a single entity after user confirms
   */
  private async generateSingleEntitySqlAfterConfirmation(entity: StorageEntity) {
    // Determine origin based on which tables the entity is in
    let origin: string;
    let count: number;

    const inStates = entity.in_states_meta;
    const inStatistics = entity.in_statistics_meta;

    if (inStates && inStatistics) {
      origin = 'States+Statistics';
      count = entity.states_count + entity.stats_short_count + entity.stats_long_count;
    } else if (inStates) {
      origin = 'States';
      count = entity.states_count;
    } else if (inStatistics) {
      if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
        origin = 'Both';
      } else if (entity.in_statistics_long_term) {
        origin = 'Long-term';
      } else {
        origin = 'Short-term';
      }
      count = entity.stats_short_count + entity.stats_long_count;
    } else {
      // Not in any table - shouldn't happen
      return;
    }

    // Update modal data
    const modalData: DeleteModalData = {
      entityId: entity.entity_id,
      metadataId: entity.metadata_id || 0,
      origin: origin as any,
      status: 'deleted', // We're deleting statistics for both deleted and disabled entities
      count: count
    };

    // Dispatch event to parent to fetch SQL
    this.dispatchEvent(new CustomEvent('generate-sql', {
      detail: {
        entity_id: entity.entity_id,
        in_states_meta: inStates,
        in_statistics_meta: inStatistics,
        metadata_id: entity.metadata_id,
        origin: origin,
        entity: modalData
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Generate bulk SQL for multiple entities after user confirms
   */
  private async generateBulkSqlAfterConfirmation() {
    if (this.deleteModalEntities.length === 0) return;

    try {
      // Validate hass connection
      if (!this.hass) {
        console.error('Cannot generate SQL: Home Assistant connection not available');
        return;
      }

      this.isGeneratingBulkSql = true;
      this.bulkSqlTotal = this.deleteModalEntities.length;
      this.bulkSqlProgress = 0;

      const apiService = new ApiService(this.hass);

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
      for (const entity of this.deleteModalEntities) {
        this.bulkSqlProgress++;

        try {
          // Determine parameters for SQL generation
          const inStates = entity.in_states_meta;
          const inStatistics = entity.in_statistics_meta;

          let origin: string;
          let count: number;

          if (inStates && inStatistics) {
            origin = 'States+Statistics';
            count = entity.states_count + entity.stats_short_count + entity.stats_long_count;
          } else if (inStates) {
            origin = 'States';
            count = entity.states_count;
          } else if (inStatistics) {
            if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
              origin = 'Both';
            } else if (entity.in_statistics_long_term) {
              origin = 'Long-term';
            } else {
              origin = 'Short-term';
            }
            count = entity.stats_short_count + entity.stats_long_count;
          } else {
            // Skip entities not in any table
            continue;
          }

          // Call API to generate SQL
          const response = await apiService.generateDeleteSql(
            entity.entity_id,
            origin as any,
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

      // Create properly typed result based on error count
      const results: BulkSqlGenerationResult = resultsBuilder.error_count > 0
        ? {
            status: 'partial',
            ...resultsBuilder
          }
        : {
            status: 'success',
            entities: resultsBuilder.entities,
            total_storage_saved: resultsBuilder.total_storage_saved,
            total_count: resultsBuilder.total_count,
            success_count: resultsBuilder.success_count,
            error_count: 0
          };

      // Format combined SQL
      const combinedSql = resultsBuilder.entities
        .map((e) => {
          if (e.error) {
            return `-- Entity: ${e.entity_id}\n-- ERROR: ${e.error}\n`;
          }
          const storageMB = (e.storage_saved / (1024 * 1024)).toFixed(2);
          return `-- Entity: ${e.entity_id} (${e.count.toLocaleString()} records, ${storageMB} MB saved)\n${e.sql}`;
        })
        .join('\n\n');

      // Update modal to display mode with SQL
      this.deleteModalMode = 'display';
      this.deleteModalData = {
        entityId: `${resultsBuilder.success_count} entities`,
        metadataId: 0,
        origin: 'Both' as any,
        status: 'deleted',
        count: resultsBuilder.total_count
      };
      this.deleteSql = combinedSql;
      this.deleteStorageSaved = resultsBuilder.total_storage_saved;

      // Clear selection after successful generation
      this.selectedEntityIds = new Set();
    } catch (err) {
      console.error('Error in bulk SQL generation:', err);
      // Close modal on error
      this.handleCloseDeleteModal();
    } finally {
      this.isGeneratingBulkSql = false;
      this.bulkSqlProgress = 0;
      this.bulkSqlTotal = 0;
    }
  }

  /**
   * Handle selection change from table checkbox
   */
  private handleSelectionChanged(e: CustomEvent) {
    const { entityId, selected } = e.detail;

    if (selected) {
      this.selectedEntityIds.add(entityId);
    } else {
      this.selectedEntityIds.delete(entityId);
    }

    // Trigger re-render by creating new Set
    this.selectedEntityIds = new Set(this.selectedEntityIds);
  }

  /**
   * Handle select all filtered deleted entities
   */
  private handleSelectAll() {
    this.selectedEntityIds = new Set(
      this.selectableEntities.map(e => e.entity_id)
    );
  }

  /**
   * Handle deselect all
   */
  private handleDeselectAll() {
    this.selectedEntityIds = new Set();
  }

  /**
   * Handle bulk SQL generation for selected entities
   */
  private async handleGenerateBulkSql() {
    if (this.selectedEntityIds.size === 0) return;

    try {
      // Load the modal component first
      await this._loadDeleteSqlModal();

      // Get breakdown of selected entities
      const { deleted, disabled } = this.selectionBreakdown;

      // Show confirmation modal first (for both deleted and disabled)
      this.deleteModalMode = 'confirm';
      this.deleteModalEntities = [...deleted, ...disabled];
      this.deleteModalDeletedCount = deleted.length;
      this.deleteModalDisabledCount = disabled.length;

      // Trigger modal to show by setting a placeholder data object
      const totalCount = deleted.length + disabled.length;
      this.deleteModalData = {
        entityId: `${totalCount} entities`,
        metadataId: 0,
        origin: 'Both' as any, // Will be set properly after confirmation
        status: 'deleted',
        count: 0 // Will be set properly after confirmation
      };
    } catch (err) {
      console.error('Error showing confirmation modal:', err);
      // Fail gracefully
    }
  }

  /**
   * Show message histogram tooltip for an entity
   */
  private handleShowHistogram(entityId: string, event: MouseEvent, lastUpdate: string | null = null) {
    // Clear any pending hide timeout
    if (this.histogramHideTimeout !== null) {
      window.clearTimeout(this.histogramHideTimeout);
      this.histogramHideTimeout = null;
    }

    const target = event.currentTarget as HTMLElement;
    const cellRect = target.getBoundingClientRect();

    const tooltipWidth = 420;
    const tooltipHeight = 220;
    const offset = 16;

    let x = cellRect.right + offset;
    let y = cellRect.top;

    if (x + tooltipWidth > window.innerWidth) {
      x = cellRect.left - tooltipWidth - offset;
    }

    if (y + tooltipHeight > window.innerHeight) {
      y = window.innerHeight - tooltipHeight - offset;
    }

    x = Math.max(offset, x);
    y = Math.max(offset, y);

    this.histogramPosition = { x, y };
    this.histogramEntityId = entityId;
    this.histogramLastUpdate = lastUpdate;
  }

  /**
   * Hide message histogram tooltip with a small delay
   */
  private handleHideHistogram() {
    // Add delay so user can move mouse to tooltip
    this.histogramHideTimeout = window.setTimeout(() => {
      this.histogramEntityId = null;
      this.histogramHideTimeout = null;
    }, 300);
  }

  /**
   * Keep histogram visible when mouse enters it
   */
  private handleHistogramMouseEnter() {
    if (this.histogramHideTimeout !== null) {
      window.clearTimeout(this.histogramHideTimeout);
      this.histogramHideTimeout = null;
    }
  }

  /**
   * Hide histogram when mouse leaves it
   */
  private handleHistogramMouseLeave() {
    this.histogramEntityId = null;
  }

  render() {
    const hasActiveFilters =
      this.searchQuery ||
      this.basicFilter ||
      this.registryFilter ||
      this.stateFilter ||
      this.advancedFilter ||
      this.statesFilter ||
      this.statisticsFilter;

    return html`
      <div class="description">
        Complete overview of all entities across Home Assistant's storage locations.
        Table features horizontal scrolling with sticky first column.
      </div>

      <storage-health-summary
        .summary=${this.summary}
        .entities=${this.filteredEntities}
        .databaseSize=${this.databaseSize}
        .activeFilter=${this.getActiveFilterType()}
        .activeRegistry=${this.registryFilter}
        .activeState=${this.stateFilter}
        .activeStates=${this.statesFilter}
        .activeStatistics=${this.statisticsFilter}
        @action-clicked=${this.handleHealthAction}
        @filter-changed=${this.handleFilterPanelChange}
        @filter-reset=${this.handlePanelFilterReset}
      ></storage-health-summary>

      <h2>Entity Storage Details</h2>
      <div class="search-and-sort-row">
        <filter-bar
          .filters=${[]}
          .showSearch=${true}
          .searchPlaceholder=${'Search entity ID...'}
          .searchValue=${this.searchQuery}
          .showClearButton=${hasActiveFilters}
          @search-changed=${this.handleSearchChanged}
          @clear-filters=${this.handleClearFilters}
        ></filter-bar>
        <button class="secondary-button" @click=${this.handleClearSort}>Clear Sort</button>
      </div>

      <div class="table-container ${this.selectedEntityIds.size > 0 ? 'has-selections' : ''}">
        <entity-table
          .entities=${this.filteredEntities}
          .columns=${this.tableColumns}
          .sortStack=${this.sortStack}
          .stickyFirstColumn=${true}
          .emptyMessage=${'No entities found'}
          .showCheckboxes=${true}
          .selectedIds=${this.selectedEntityIds}
          .selectableEntityIds=${this.selectableEntityIds}
          .disabledEntityIds=${this.disabledEntityIds}
          @sort-changed=${this.handleSortChanged}
          @selection-changed=${this.handleSelectionChanged}
        ></entity-table>
      </div>

      ${this.selectedEntity ? html`
        <entity-details-modal
          .entity=${this.selectedEntity}
          @close-modal=${this.handleCloseModal}
          @open-more-info=${this.handleOpenMoreInfo}
        ></entity-details-modal>
      ` : ''}

      ${this.deleteModalData ? html`
        <delete-sql-modal
          .data=${this.deleteModalData}
          .sql=${this.deleteSql}
          .storageSaved=${this.deleteStorageSaved}
          .mode=${this.deleteModalMode}
          .entities=${this.deleteModalEntities}
          .deletedCount=${this.deleteModalDeletedCount}
          .disabledCount=${this.deleteModalDisabledCount}
          @close-modal=${this.handleCloseDeleteModal}
          @cancel=${this.handleDeleteModalCancel}
          @confirm=${this.handleDeleteModalConfirm}
        ></delete-sql-modal>
      ` : ''}

      ${this.selectedEntityIds.size > 0 ? html`
        <selection-panel
          .selectedCount=${this.selectedEntityIds.size}
          .selectableCount=${this.selectableEntities.length}
          .isGenerating=${this.isGeneratingBulkSql}
          .generatingProgress=${this.bulkSqlProgress}
          .generatingTotal=${this.bulkSqlTotal}
          .deletedCount=${this.selectionBreakdown.deleted.length}
          .disabledCount=${this.selectionBreakdown.disabled.length}
          @select-all=${this.handleSelectAll}
          @deselect-all=${this.handleDeselectAll}
          @generate-bulk-sql=${this.handleGenerateBulkSql}
        ></selection-panel>
      ` : ''}

      ${this.histogramEntityId ? html`
        <div
          class="histogram-tooltip"
          style="left: ${this.histogramPosition.x}px; top: ${this.histogramPosition.y}px;"
          @mouseenter=${this.handleHistogramMouseEnter}
          @mouseleave=${this.handleHistogramMouseLeave}
        >
          <message-histogram-tooltip
            .hass=${this.hass}
            .entityId=${this.histogramEntityId}
            .lastUpdate=${this.histogramLastUpdate}
          ></message-histogram-tooltip>
        </div>
      ` : ''}
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('storage-overview-view')) {
  customElements.define('storage-overview-view', StorageOverviewView);
}
