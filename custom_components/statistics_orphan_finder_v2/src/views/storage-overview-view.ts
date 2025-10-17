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
  HomeAssistant
} from '../types';
import '../components/storage-health-summary';
import '../components/filter-bar';
import '../components/entity-table';
import '../components/entity-details-modal';

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
        width: '50px',
        className: 'group-border-left',
        render: (entity: StorageEntity) => html`
          <button
            class="info-icon-btn"
            @click=${() => this.handleEntityClick(entity)}
            title="Show details"
            style="background: none; border: none; cursor: pointer; padding: 4px;"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            </svg>
          </button>
        `
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
    `;
  }
}
