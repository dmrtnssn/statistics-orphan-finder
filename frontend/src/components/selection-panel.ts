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
        background: var(--card-background-color);
        border-top: 2px solid var(--primary-color);
        padding: 16px 24px;
        z-index: 100;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      /* Adjust for narrow sidebar */
      @media (max-width: 870px) {
        .selection-panel {
          left: 80px; /* Narrow sidebar + padding */
        }
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .left-section {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .count {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .progress-text {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .breakdown {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .breakdown-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .breakdown-item.deleted {
        color: var(--primary-color);
      }

      .breakdown-item.disabled {
        color: #FF9800;
      }

      .breakdown-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .breakdown-dot.deleted {
        background: var(--primary-color);
      }

      .breakdown-dot.disabled {
        background: #FF9800;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .select-all-btn {
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }

      .select-all-btn:hover:not(:disabled) {
        background: var(--divider-color);
      }

      .deselect-btn {
        padding: 8px 16px;
        background: transparent;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
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

      .loading-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
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
              <span class="loading-spinner"></span>
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
