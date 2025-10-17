/**
 * OrphanFinderView - Main view for orphaned entities tab
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber, formatBytes, formatDate } from '../services/formatters';
import type {
  OrphanEntity,
  DatabaseSize,
  ColumnConfig,
  SortState,
  OrphanFilterValue,
  DeleteModalData,
  HomeAssistant
} from '../types';
import '../components/summary-cards';
import '../components/filter-bar';
import '../components/entity-table';
import '../components/delete-sql-modal';
import type { SummaryCard } from '../components/summary-cards';

@customElement('orphan-finder-view')
export class OrphanFinderView extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: Array }) orphans: OrphanEntity[] = [];
  @property({ type: Object }) databaseSize: DatabaseSize | null = null;
  @property({ type: Number }) deletedStorage = 0;
  @property({ type: Number }) unavailableStorage = 0;

  @state() private filter: OrphanFilterValue = 'all';
  @state() private sortStack: SortState[] = [{ column: 'entity_id', direction: 'asc' }];
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
    `
  ];

  private get filteredOrphans(): OrphanEntity[] {
    let filtered = [...this.orphans];

    // Apply status filter
    if (this.filter === 'deleted') {
      filtered = filtered.filter(o => o.status === 'deleted');
    } else if (this.filter === 'unavailable') {
      filtered = filtered.filter(o => o.status === 'unavailable');
    }

    // Apply sorting
    return this.sortOrphans(filtered);
  }

  private sortOrphans(orphans: OrphanEntity[]): OrphanEntity[] {
    return [...orphans].sort((a, b) => {
      for (const { column, direction } of this.sortStack) {
        let result = 0;

        switch (column) {
          case 'entity_id':
            result = a.entity_id.localeCompare(b.entity_id);
            break;
          case 'status':
            result = a.status.localeCompare(b.status);
            break;
          case 'origin':
            result = a.origin.localeCompare(b.origin);
            break;
          case 'last_update':
            const aTime = a.last_update ? new Date(a.last_update).getTime() : 0;
            const bTime = b.last_update ? new Date(b.last_update).getTime() : 0;
            result = aTime - bTime;
            break;
          case 'count':
            result = a.count - b.count;
            break;
        }

        if (direction === 'desc') result = -result;
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  private get summaryCards(): SummaryCard[] {
    const cards: SummaryCard[] = [];

    if (this.databaseSize) {
      cards.push(
        {
          id: 'states',
          title: 'States Table',
          value: formatNumber(this.databaseSize.states),
          subtitle: formatBytes(this.databaseSize.states_size)
        },
        {
          id: 'statistics',
          title: 'Statistics',
          value: formatNumber(this.databaseSize.statistics),
          subtitle: formatBytes(this.databaseSize.statistics_size)
        },
        {
          id: 'statistics_short_term',
          title: 'Statistics Short-term',
          value: formatNumber(this.databaseSize.statistics_short_term),
          subtitle: formatBytes(this.databaseSize.statistics_short_term_size)
        },
        {
          id: 'other',
          title: 'Other Tables',
          value: formatNumber(this.databaseSize.other),
          subtitle: formatBytes(this.databaseSize.other_size)
        }
      );
    }

    return cards;
  }

  private get storageCards(): SummaryCard[] {
    return [
      {
        id: 'deleted_storage',
        title: 'Deleted Entities Storage',
        value: formatBytes(this.deletedStorage),
        subtitle: `${this.orphans.filter(o => o.status === 'deleted').length} entities`
      },
      {
        id: 'unavailable_storage',
        title: 'Unavailable Entities Storage',
        value: formatBytes(this.unavailableStorage),
        subtitle: `${this.orphans.filter(o => o.status === 'unavailable').length} entities`
      }
    ];
  }

  private get tableColumns(): ColumnConfig<OrphanEntity>[] {
    return [
      {
        id: 'entity_id',
        label: 'Entity ID',
        sortable: true,
        render: (entity: OrphanEntity) => html`
          <span class="entity-id-link" @click=${() => this.handleEntityClick(entity.entity_id)}>
            ${entity.entity_id}
          </span>
        `
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        align: 'center',
        render: (entity: OrphanEntity) => {
          const badgeClass = entity.status === 'deleted' ? 'status-deleted' : 'status-unavailable';
          const icon = entity.status === 'deleted' ? '✕' : '⚠';
          return html`<span class="status-badge ${badgeClass}">${icon} ${entity.status}</span>`;
        }
      },
      {
        id: 'origin',
        label: 'Origin',
        sortable: true,
        align: 'center',
        getValue: (entity: OrphanEntity) => entity.origin
      },
      {
        id: 'last_update',
        label: 'Last Updated',
        sortable: true,
        align: 'center',
        render: (entity: OrphanEntity) => entity.last_update ? formatDate(entity.last_update) : ''
      },
      {
        id: 'count',
        label: 'Statistics Count',
        sortable: true,
        align: 'right',
        render: (entity: OrphanEntity) => formatNumber(entity.count)
      },
      {
        id: 'actions',
        label: 'Actions',
        sortable: false,
        align: 'center',
        render: (entity: OrphanEntity) => html`
          <button @click=${() => this.handleGenerateSql(entity)}>Generate SQL</button>
        `
      }
    ];
  }

  private handleFilterClick(filterId: string) {
    this.filter = filterId as OrphanFilterValue;
  }

  private handleClearFilters() {
    this.filter = 'all';
  }

  private handleSortChanged(e: CustomEvent) {
    this.sortStack = e.detail.sortStack;
  }

  private handleEntityClick(entityId: string) {
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    (event as any).detail = { entityId };
    this.dispatchEvent(event);
  }

  private async handleGenerateSql(entity: OrphanEntity) {
    // Dispatch event to parent to fetch SQL
    this.dispatchEvent(new CustomEvent('generate-sql', {
      detail: {
        metadataId: entity.metadata_id,
        origin: entity.origin,
        entity
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

  private handleCloseModal() {
    this.deleteModalData = null;
    this.deleteSql = '';
    this.deleteStorageSaved = 0;
  }

  render() {
    const filterButtons = [
      { id: 'all', label: 'All', active: this.filter === 'all' },
      { id: 'deleted', label: 'Deleted Only', active: this.filter === 'deleted' },
      { id: 'unavailable', label: 'Unavailable Only', active: this.filter === 'unavailable' }
    ];

    return html`
      <div class="description">
        Find and remove orphaned statistics entities that no longer exist in Home Assistant.
      </div>

      <h2>Database Overview</h2>
      <summary-cards .cards=${this.summaryCards} .columns=${4}></summary-cards>

      <h2>Orphaned Entities Storage</h2>
      <summary-cards .cards=${this.storageCards} .columns=${2}></summary-cards>

      <h2>Orphaned Entities</h2>
      <filter-bar
        .filters=${filterButtons}
        .showClearButton=${this.filter !== 'all'}
        @filter-clicked=${(e: CustomEvent) => this.handleFilterClick(e.detail.filterId)}
        @clear-filters=${this.handleClearFilters}
      ></filter-bar>

      <entity-table
        .entities=${this.filteredOrphans}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${false}
        .emptyMessage=${'No orphaned entities found'}
        @sort-changed=${this.handleSortChanged}
      ></entity-table>

      ${this.deleteModalData ? html`
        <delete-sql-modal
          .data=${this.deleteModalData}
          .sql=${this.deleteSql}
          .storageSaved=${this.deleteStorageSaved}
          @close-modal=${this.handleCloseModal}
        ></delete-sql-modal>
      ` : ''}
    `;
  }
}
