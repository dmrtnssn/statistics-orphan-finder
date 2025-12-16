/**
 * StorageHealthSummary - 3-Column Layout with Pie Chart & Action Summary
 * Column 1: Database size pie chart | Column 2: Action summary | Column 3: Filter panel
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import type { StorageSummary, StorageEntity, DatabaseSize } from '../types';
import './database-pie-chart';
import './health-action-list';
import './entity-filter-panel';

export class StorageHealthSummary extends LitElement {
  @property({ type: Object }) summary: StorageSummary | null = null;
  @property({ type: Array }) entities: StorageEntity[] = [];
  @property({ type: Object }) databaseSize: DatabaseSize | null = null;
  @property({ type: String }) activeFilter: string | null = null;
  @property({ type: String }) activeRegistry: string | null = null;
  @property({ type: String }) activeState: string | null = null;
  @property({ type: String }) activeStates: string | null = null;
  @property({ type: String }) activeStatistics: string | null = null;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        margin-bottom: 24px;
      }

      .summary-container {
        display: grid;
        grid-template-columns: 520px 1fr 325px;
        gap: var(--spacing-xl, 24px);
        margin-bottom: var(--spacing-xl, 24px);
      }

      @media (max-width: 1200px) {
        .summary-container {
          grid-template-columns: 1fr;
        }
      }

      .column {
        background: var(--gradient-card);
        border-radius: var(--radius-lg, 14px);
        box-shadow: var(--shadow-sm);
        padding: var(--spacing-2xl, 32px);
        border: 1px solid color-mix(in srgb, var(--divider-color) 30%, transparent);
        transition: all var(--duration-normal, 250ms) var(--ease-out-smooth);
      }

      .column:hover {
        box-shadow: var(--shadow-md);
      }

      /* Column styling */
      .chart-column {
        display: flex;
        flex-direction: column;
      }

      .summary-column {
        display: flex;
        flex-direction: column;
      }

      .filter-panel-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      @media (max-width: 1200px) {
        .filter-panel-column {
          display: none;
        }
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }
    `
  ];

  render() {
    if (!this.summary) {
      return html`<div class="loading">Loading status summary...</div>`;
    }

    return html`
      <div class="summary-container">
        <!-- Column 1: Pie Chart -->
        <div class="column chart-column">
          <database-pie-chart
            .databaseSize=${this.databaseSize}
          ></database-pie-chart>
        </div>

        <!-- Column 2: Action Summary -->
        <div class="column summary-column">
          <health-action-list
            .summary=${this.summary}
            .entities=${this.entities}
            @action-clicked=${(e: CustomEvent) => {
              this.dispatchEvent(new CustomEvent('action-clicked', {
                detail: e.detail,
                bubbles: true,
                composed: true
              }));
            }}
          ></health-action-list>
        </div>

        <!-- Column 3: Filter Panel -->
        <div class="column filter-panel-column">
          <entity-filter-panel
            .entities=${this.entities}
            .activeRegistry=${this.activeRegistry}
            .activeState=${this.activeState}
            .activeStates=${this.activeStates}
            .activeStatistics=${this.activeStatistics}
            @filter-changed=${(e: CustomEvent) => {
              this.dispatchEvent(new CustomEvent('filter-changed', {
                detail: e.detail,
                bubbles: true,
                composed: true
              }));
            }}
            @filter-reset=${() => {
              this.dispatchEvent(new CustomEvent('filter-reset', {
                bubbles: true,
                composed: true
              }));
            }}
          ></entity-filter-panel>
        </div>
      </div>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('storage-health-summary')) {
  customElements.define('storage-health-summary', StorageHealthSummary);
}
