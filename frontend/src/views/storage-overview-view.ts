/**
 * StorageOverviewView - Storage overview tab with 15-column table
 * This component solves the table width problem with horizontal scroll + sticky first column
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber } from '../services/formatters';
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

  protected willUpdate(changedProperties: Map<string, any>) {
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
        margin-bottom: 8px;
      }

      .search-and-sort-row filter-bar {
        flex: 1;
      }
    `
  ];

  /**
   * Get entities that are eligible for deletion (deleted entities only)
   */
  private get selectableEntities(): StorageEntity[] {
    return this.filteredEntities.filter(entity =>
      !entity.in_entity_registry &&
      !entity.in_state_machine &&
      (entity.in_states_meta || entity.in_statistics_meta)
    );
  }

  /**
   * Get Set of selectable entity IDs for efficient lookups
   */
  private get selectableEntityIds(): Set<string> {
    return new Set(this.selectableEntities.map(e => e.entity_id));
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
        label: 'ENTITY\nREGISTRY',
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
        label: 'STATE\nMACHINE',
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
        label: 'States\nMeta',
        sortable: true,
        align: 'center',
        className: 'group-border-left',
        render: (entity: StorageEntity) => entity.in_states_meta ? '✓' : ''
      },
      {
        id: 'states',
        label: 'States',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_states ? '✓' : ''
      },
      {
        id: 'states_count',
        label: 'States #',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.states_count)
      },
      {
        id: 'update_interval',
        label: 'Message\nInterval',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => entity.update_interval || ''
      },
      {
        id: 'last_state_update',
        label: 'Last State\nUpdate',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.last_state_update || ''
      },
      {
        id: 'stats_meta',
        label: 'Stats\nMeta',
        sortable: true,
        align: 'center',
        className: 'group-border-left',
        render: (entity: StorageEntity) => entity.in_statistics_meta ? '✓' : ''
      },
      {
        id: 'stats_short',
        label: 'Stats\nShort',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_statistics_short_term ? '✓' : ''
      },
      {
        id: 'stats_long',
        label: 'Stats\nLong',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.in_statistics_long_term ? '✓' : ''
      },
      {
        id: 'stats_short_count',
        label: 'Short #',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.stats_short_count)
      },
      {
        id: 'stats_long_count',
        label: 'Long #',
        sortable: true,
        align: 'right',
        render: (entity: StorageEntity) => formatNumber(entity.stats_long_count)
      },
      {
        id: 'last_stats_update',
        label: 'Last Stats\nUpdate',
        sortable: true,
        align: 'center',
        render: (entity: StorageEntity) => entity.last_stats_update || ''
      },
      {
        id: 'actions',
        label: 'ACTIONS',
        sortable: false,
        align: 'center',
        width: '80px',
        className: 'group-border-left',
        render: (entity: StorageEntity) => {
          const isDeleted = !entity.in_entity_registry && !entity.in_state_machine && (entity.in_states_meta || entity.in_statistics_meta);

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
              ${isDeleted ? html`
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

  private handleHealthAction(e: CustomEvent) {
    const action = e.detail.action;

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
    }
  }

  private handleSearchChanged(e: CustomEvent) {
    this.searchQuery = e.detail.query;
  }

  private handleClearFilters() {
    this.searchQuery = '';
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    this.statesFilter = null;
    this.statisticsFilter = null;
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

  private handleOpenMoreInfo(e: CustomEvent) {
    try {
      if (!this.hass) {
        console.warn('Cannot open more info: Home Assistant connection not available');
        return;
      }
      const event = new Event('hass-more-info', { bubbles: true, composed: true });
      (event as any).detail = { entityId: e.detail.entityId };
      this.dispatchEvent(event);
    } catch (err) {
      console.error('Error opening more info dialog:', err);
      // Fail gracefully
    }
  }

  private handleGenerateSql(entity: StorageEntity) {
    try {
      // Validate hass connection
      if (!this.hass) {
        console.warn('Cannot generate SQL: Home Assistant connection not available');
        return;
      }

      // Determine origin based on which tables the entity is in
      let origin: string;
      let count: number;

      const inStates = entity.in_states_meta;
      const inStatistics = entity.in_statistics_meta;

      if (inStates && inStatistics) {
        // In both states and statistics
        origin = 'States+Statistics';
        count = entity.states_count + entity.stats_short_count + entity.stats_long_count;
      } else if (inStates) {
        // Only in states
        origin = 'States';
        count = entity.states_count;
      } else if (inStatistics) {
        // Only in statistics - use existing logic
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

      // Convert StorageEntity to DeleteModalData format
      const modalData: DeleteModalData = {
        entityId: entity.entity_id,
        metadataId: entity.metadata_id || 0, // Will be looked up by backend for states_meta
        origin: origin as any,
        status: 'deleted',
        count: count
      };

      // Dispatch event to parent to fetch SQL
      // Pass flags so backend knows which tables to query
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
    } catch (err) {
      console.error('Error generating SQL:', err);
      // Fail gracefully
    }
  }

  // Called by parent when SQL is ready
  async showDeleteModal(data: DeleteModalData, sql: string, storageSaved: number) {
    try {
      await this._loadDeleteSqlModal();
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
      // Validate hass connection
      if (!this.hass) {
        console.error('Cannot generate SQL: Home Assistant connection not available');
        return;
      }

      this.isGeneratingBulkSql = true;
      this.bulkSqlTotal = this.selectedEntityIds.size;
      this.bulkSqlProgress = 0;

      const apiService = new ApiService(this.hass);
      const results: BulkSqlGenerationResult = {
        entities: [],
        total_storage_saved: 0,
        total_count: 0,
        success_count: 0,
        error_count: 0
      };

      // Get selected entities with full data
      const selectedEntities = this.entities.filter(e =>
        this.selectedEntityIds.has(e.entity_id)
      );

      // Generate SQL for each entity sequentially
      for (const entity of selectedEntities) {
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

          results.entities.push({
            entity_id: entity.entity_id,
            sql: response.sql,
            storage_saved: response.storage_saved,
            count: count
          });

          results.total_storage_saved += response.storage_saved;
          results.total_count += count;
          results.success_count++;
        } catch (err) {
          console.error(`Error generating SQL for ${entity.entity_id}:`, err);
          results.entities.push({
            entity_id: entity.entity_id,
            sql: '',
            storage_saved: 0,
            count: 0,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
          results.error_count++;
        }
      }

      // Format combined SQL
      const combinedSql = results.entities
        .map(e => {
          if (e.error) {
            return `-- Entity: ${e.entity_id}\n-- ERROR: ${e.error}\n`;
          }
          const storageMB = (e.storage_saved / (1024 * 1024)).toFixed(2);
          return `-- Entity: ${e.entity_id} (${e.count.toLocaleString()} records, ${storageMB} MB saved)\n${e.sql}`;
        })
        .join('\n\n');

      // Show modal with bulk results
      const modalData: DeleteModalData = {
        entityId: `${results.success_count} entities`,
        metadataId: 0,
        origin: 'Both' as any,
        status: 'deleted',
        count: results.total_count
      };

      await this._loadDeleteSqlModal();
      this.deleteModalData = modalData;
      this.deleteSql = combinedSql;
      this.deleteStorageSaved = results.total_storage_saved;

      // Clear selection after successful generation
      this.selectedEntityIds = new Set();
    } catch (err) {
      console.error('Error in bulk SQL generation:', err);
      // Keep selection so user can retry
    } finally {
      this.isGeneratingBulkSql = false;
      this.bulkSqlProgress = 0;
      this.bulkSqlTotal = 0;
    }
  }

  render() {
    const hasActiveFilters =
      this.searchQuery ||
      this.basicFilter ||
      this.registryFilter ||
      this.stateFilter ||
      this.advancedFilter;

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

      <entity-table
        .entities=${this.filteredEntities}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${true}
        .emptyMessage=${'No entities found'}
        .showCheckboxes=${true}
        .selectedIds=${this.selectedEntityIds}
        .selectableEntityIds=${this.selectableEntityIds}
        @sort-changed=${this.handleSortChanged}
        @selection-changed=${this.handleSelectionChanged}
      ></entity-table>

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
          @close-modal=${this.handleCloseDeleteModal}
        ></delete-sql-modal>
      ` : ''}

      ${this.selectedEntityIds.size > 0 ? html`
        <selection-panel
          .selectedCount=${this.selectedEntityIds.size}
          .selectableCount=${this.selectableEntities.length}
          .isGenerating=${this.isGeneratingBulkSql}
          .generatingProgress=${this.bulkSqlProgress}
          .generatingTotal=${this.bulkSqlTotal}
          @select-all=${this.handleSelectAll}
          @deselect-all=${this.handleDeselectAll}
          @generate-bulk-sql=${this.handleGenerateBulkSql}
        ></selection-panel>
      ` : ''}
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('storage-overview-view')) {
  customElements.define('storage-overview-view', StorageOverviewView);
}
