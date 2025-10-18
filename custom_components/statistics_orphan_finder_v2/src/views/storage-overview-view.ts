/**
 * StorageOverviewView - Storage overview tab with 15-column table
 * This component solves the table width problem with horizontal scroll + sticky first column
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber } from '../services/formatters';
import type {
  StorageEntity,
  StorageSummary,
  DatabaseSize,
  ColumnConfig,
  SortState,
  DeleteModalData,
  HomeAssistant
} from '../types';
import '../components/storage-health-summary';
import '../components/filter-bar';
import '../components/entity-table';
import '../components/entity-details-modal';
import '../components/delete-sql-modal';

@customElement('storage-overview-view')
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
  @state() private sortStack: SortState[] = [{ column: 'entity_id', direction: 'asc' }];
  @state() private selectedEntity: StorageEntity | null = null;
  @state() private deleteModalData: DeleteModalData | null = null;
  @state() private deleteSql = '';
  @state() private deleteStorageSaved = 0;

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

      .clear-sort-container {
        margin-bottom: 8px;
        text-align: right;
      }
    `
  ];

  private get filteredEntities(): StorageEntity[] {
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

    return this.sortEntities(filtered);
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
                style="background: none; border: none; cursor: pointer; padding: 4px; color: var(--secondary-text-color);"
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
                  style="padding: 4px 8px; font-size: 11px;"
                >
                  <svg width="18" height="18" viewBox="0 0 90 90" fill="currentColor"><path d="M.158.09A.045.045 0 0 1 .203.045h.135A.045.045 0 0 1 .383.09v.045h.09a.022.022 0 1 1 0 .045H.449l-.02.273a.045.045 0 0 1-.045.042H.156A.045.045 0 0 1 .111.453L.092.18H.068a.022.022 0 0 1 0-.045h.09zm.045.045h.135V.09H.202zM.137.18l.019.27h.228L.403.18zm.088.045a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .224.225m.09 0a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .313.225" fill="#0D0D0D"/></svg>
                </button>
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
  }

  private handleSortChanged(e: CustomEvent) {
    this.sortStack = e.detail.sortStack;
  }

  private handleClearSort() {
    this.sortStack = [{ column: 'entity_id', direction: 'asc' }];
  }

  private handleEntityClick(entity: StorageEntity) {
    this.selectedEntity = entity;
  }

  private handleCloseModal() {
    this.selectedEntity = null;
  }

  private handleOpenMoreInfo(e: CustomEvent) {
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    (event as any).detail = { entityId: e.detail.entityId };
    this.dispatchEvent(event);
  }

  private handleGenerateSql(entity: StorageEntity) {
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
  }

  // Called by parent when SQL is ready
  showDeleteModal(data: DeleteModalData, sql: string, storageSaved: number) {
    this.deleteModalData = data;
    this.deleteSql = sql;
    this.deleteStorageSaved = storageSaved;
  }

  private handleCloseDeleteModal() {
    this.deleteModalData = null;
    this.deleteSql = '';
    this.deleteStorageSaved = 0;
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
        .entities=${this.entities}
        .databaseSize=${this.databaseSize}
        .activeFilter=${this.getActiveFilterType()}
        @action-clicked=${this.handleHealthAction}
      ></storage-health-summary>

      <h2>Entity Storage Details</h2>
      <filter-bar
        .filters=${[]}
        .showSearch=${true}
        .searchPlaceholder=${'Search entity ID...'}
        .searchValue=${this.searchQuery}
        .showClearButton=${hasActiveFilters}
        @search-changed=${this.handleSearchChanged}
        @clear-filters=${this.handleClearFilters}
      ></filter-bar>

      <div class="clear-sort-container">
        <button class="secondary-button" @click=${this.handleClearSort}>Clear Sort</button>
      </div>

      <entity-table
        .entities=${this.filteredEntities}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${true}
        .emptyMessage=${'No entities found'}
        @sort-changed=${this.handleSortChanged}
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
    `;
  }
}
