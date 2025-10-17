/**
 * Reusable EntityTable component
 * Handles sorting, filtering, sticky columns, and horizontal scroll
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ColumnConfig, SortState } from '../types';
import { sharedStyles } from '../styles/shared-styles';

@customElement('entity-table')
export class EntityTable extends LitElement {
  @property({ type: Array }) entities: any[] = [];
  @property({ type: Array }) columns: ColumnConfig[] = [];
  @property({ type: Boolean }) sortable = true;
  @property({ type: Boolean }) stickyFirstColumn = false;
  @property({ type: Array }) sortStack: SortState[] = [{ column: '', direction: 'asc' }];
  @property({ type: String }) emptyMessage = 'No data available';

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .table-wrapper {
        position: relative;
      }

      .table-scroll {
        overflow-x: auto;
        overflow-y: visible;
      }

      .sort-indicator {
        margin-left: 4px;
        font-size: 10px;
        color: var(--primary-color);
      }

      .sort-order {
        font-size: 9px;
        vertical-align: super;
        margin-left: 2px;
      }

      .align-right {
        text-align: right;
      }

      .align-center {
        text-align: center;
      }
    `
  ];

  private handleSort(columnId: string) {
    if (!this.sortable) return;

    const column = this.columns.find(c => c.id === columnId);
    if (!column?.sortable) return;

    // Check if clicking the same column - toggle direction
    const currentSort = this.sortStack[0];
    if (currentSort && currentSort.column === columnId) {
      const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
      this.sortStack = [{ column: columnId, direction: newDirection }];
    } else {
      // New column - replace sort
      this.sortStack = [{ column: columnId, direction: 'asc' }];
    }

    this.dispatchEvent(new CustomEvent('sort-changed', {
      detail: { sortStack: this.sortStack },
      bubbles: true,
      composed: true
    }));
  }

  private getSortIndicator(columnId: string) {
    const sortIndex = this.sortStack.findIndex(s => s.column === columnId);
    if (sortIndex < 0) return '';

    const sort = this.sortStack[sortIndex];
    const arrow = sort.direction === 'asc' ? '▲' : '▼';

    return html`
      <span class="sort-indicator">${arrow}</span>
    `;
  }

  private handleEntityClick(entityId: string) {
    this.dispatchEvent(new CustomEvent('entity-clicked', {
      detail: { entityId },
      bubbles: true,
      composed: true
    }));
  }

  private handleRowAction(entity: any, action: string) {
    this.dispatchEvent(new CustomEvent('row-action', {
      detail: { entity, action },
      bubbles: true,
      composed: true
    }));
  }

  private renderCell(entity: any, column: ColumnConfig) {
    if (column.render) {
      const content = column.render(entity);
      if (typeof content === 'string') {
        return html`${content}`;
      }
      return content;
    }

    const value = column.getValue ? column.getValue(entity) : entity[column.id];
    return html`${value ?? ''}`;
  }

  render() {
    if (this.entities.length === 0) {
      return html`
        <div class="table-container">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div>${this.emptyMessage}</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="table-wrapper">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                ${this.columns.map((column, index) => {
                  const isSticky = this.stickyFirstColumn && index === 0;
                  const isSortable = column.sortable !== false && this.sortable;
                  const classes = [
                    isSticky ? 'sticky-column' : '',
                    isSortable ? 'sortable' : '',
                    column.className || '',
                    column.align ? `align-${column.align}` : ''
                  ].filter(Boolean).join(' ');

                  return html`
                    <th
                      class=${classes}
                      style=${column.width ? `width: ${column.width}` : ''}
                      @click=${() => isSortable && this.handleSort(column.id)}
                    >
                      ${column.label}
                      ${isSortable ? this.getSortIndicator(column.id) : ''}
                    </th>
                  `;
                })}
              </tr>
            </thead>
            <tbody>
              ${this.entities.map(entity => html`
                <tr>
                  ${this.columns.map((column, index) => {
                    const isSticky = this.stickyFirstColumn && index === 0;
                    const classes = [
                      isSticky ? 'sticky-column' : '',
                      column.className || '',
                      column.align ? `align-${column.align}` : ''
                    ].filter(Boolean).join(' ');

                    return html`
                      <td class=${classes}>
                        ${this.renderCell(entity, column)}
                      </td>
                    `;
                  })}
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
