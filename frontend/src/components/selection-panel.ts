/**
 * SelectionPanel component
 * Bottom panel that appears when entities are selected
 * Shows count, actions for bulk operations
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';

export class SelectionPanel extends LitElement {
  @property({ type: Number }) selectedCount = 0;
  @property({ type: Number }) selectableCount = 0;
  @property({ type: Number }) deletedCount = 0;
  @property({ type: Number }) disabledCount = 0;
  @property({ type: Boolean }) isGenerating = false;
  @property({ type: Number }) generatingProgress = 0;
  @property({ type: Number }) generatingTotal = 0;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .selection-panel {
        position: fixed;
        bottom: 0;
        /* Account for Home Assistant sidebar (256px) + app padding (16px) */
        left: max(272px, calc(256px + 16px));
        right: 16px;
        background: linear-gradient(180deg,
          var(--card-background-color) 0%,
          color-mix(in srgb, var(--card-background-color) 97%, var(--primary-color) 3%) 100%
        );
        border-top: 2px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        padding: var(--spacing-xl, 24px) var(--spacing-2xl, 32px);
        z-index: 100;
        box-shadow: var(--shadow-lg);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: slideUpPanel var(--duration-normal, 250ms) var(--ease-out-smooth);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-xl, 24px);
      }

      /* Adjust for narrow sidebar */
      @media (max-width: 870px) {
        .selection-panel {
          left: 80px; /* Narrow sidebar + padding */
        }
      }

      @keyframes slideUpPanel {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

      .left-section {
        display: flex;
        align-items: center;
        gap: var(--spacing-xl, 24px);
      }

      .count {
        font-size: var(--font-size-heading, 18px);
        font-weight: var(--font-weight-heading, 600);
        color: var(--primary-text-color);
      }

      .progress-text {
        font-size: var(--font-size-body, 15px);
        color: var(--secondary-text-color);
      }

      .breakdown {
        display: flex;
        gap: var(--spacing-xl, 24px);
        font-size: var(--font-size-small, 13px);
        color: var(--secondary-text-color);
        margin-top: var(--spacing-xs, 4px);
      }

      .breakdown-item {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm, 8px);
        padding: var(--spacing-xs, 4px) var(--spacing-md, 12px);
        border-radius: var(--radius-xl, 20px);
        background: color-mix(in srgb, var(--secondary-background-color) 50%, transparent);
        font-weight: var(--font-weight-small, 500);
      }

      .breakdown-item.deleted {
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 15%, transparent);
        border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
      }

      .breakdown-item.disabled {
        color: var(--warning-color, #FF9800);
        background: color-mix(in srgb, var(--warning-color) 15%, transparent);
        border: 1px solid rgba(255, 152, 0, 0.3);
      }

      .breakdown-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .breakdown-dot.deleted {
        background: var(--primary-color);
      }

      .breakdown-dot.disabled {
        background: var(--warning-color, #FF9800);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-md, 12px);
      }

      .select-all-btn {
        padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
        background: var(--secondary-background-color);
        border: 1.5px solid var(--divider-color);
        border-radius: var(--radius-sm, 6px);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: var(--font-size-body, 15px);
        font-weight: var(--font-weight-small, 500);
        transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
        box-shadow: var(--shadow-sm);
      }

      .select-all-btn:hover:not(:disabled) {
        background: var(--gradient-hover);
        border-color: var(--primary-color);
        transform: translateY(-1px);
      }

      .deselect-btn {
        padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
        background: transparent;
        border: 1.5px solid var(--divider-color);
        border-radius: var(--radius-sm, 6px);
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: var(--font-size-body, 15px);
        font-weight: var(--font-weight-small, 500);
        transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
      }

      .deselect-btn:hover:not(:disabled) {
        border-color: var(--primary-text-color);
        color: var(--primary-text-color);
      }

      .generate-btn {
        padding: 10px 24px;
        background: var(--primary-color);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s;
        white-space: nowrap;
      }

      .generate-btn:hover:not(:disabled) {
        background: var(--primary-color);
        opacity: 0.9;
      }

      .generate-btn:disabled,
      .select-all-btn:disabled,
      .deselect-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .selection-panel {
          left: 16px; /* Mobile - no sidebar */
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .left-section {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .actions {
          flex-wrap: wrap;
        }
      }
    `
  ];

  private handleSelectAll() {
    this.dispatchEvent(new CustomEvent('select-all', {
      bubbles: true,
      composed: true
    }));
  }

  private handleDeselectAll() {
    this.dispatchEvent(new CustomEvent('deselect-all', {
      bubbles: true,
      composed: true
    }));
  }

  private handleGenerateSql() {
    this.dispatchEvent(new CustomEvent('generate-bulk-sql', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const allSelected = this.selectedCount === this.selectableCount && this.selectableCount > 0;
    const hasBreakdown = this.disabledCount > 0;

    return html`
      <div class="selection-panel">
        <div class="left-section">
          <div>
            <div class="count">
              ${this.selectedCount} ${this.selectedCount === 1 ? 'entity' : 'entities'} selected
            </div>
            ${hasBreakdown && !this.isGenerating ? html`
              <div class="breakdown">
                ${this.deletedCount > 0 ? html`
                  <div class="breakdown-item deleted">
                    <span class="breakdown-dot deleted"></span>
                    ${this.deletedCount} deleted
                  </div>
                ` : ''}
                ${this.disabledCount > 0 ? html`
                  <div class="breakdown-item disabled">
                    <span class="breakdown-dot disabled"></span>
                    ${this.disabledCount} disabled
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          ${this.isGenerating ? html`
            <div class="progress-text">
              Generating SQL for ${this.generatingProgress} of ${this.generatingTotal}...
            </div>
          ` : ''}
        </div>

        <div class="actions">
          <button
            class="select-all-btn"
            @click=${this.handleSelectAll}
            ?disabled=${allSelected || this.isGenerating}
            title=${allSelected ? 'All entities selected' : 'Select all filtered deleted entities'}
          >
            Select All${this.selectableCount > 0 ? ` (${this.selectableCount})` : ''}
          </button>

          <button
            class="deselect-btn"
            @click=${this.handleDeselectAll}
            ?disabled=${this.selectedCount === 0 || this.isGenerating}
          >
            Deselect All
          </button>

          <button
            class="generate-btn"
            @click=${this.handleGenerateSql}
            ?disabled=${this.selectedCount === 0 || this.isGenerating}
          >
            ${this.isGenerating ? html`
              <span class="loading-spinner-sm"></span>
              Generating...
            ` : html`
              Generate Delete SQL
            `}
          </button>
        </div>
      </div>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('selection-panel')) {
  customElements.define('selection-panel', SelectionPanel);
}

declare global {
  interface HTMLElementTagNameMap {
    'selection-panel': SelectionPanel;
  }
}
