/**
 * SelectionPanel component
 * Bottom panel that appears when entities are selected
 * Shows count, actions for bulk operations
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';

@customElement('selection-panel')
export class SelectionPanel extends LitElement {
  @property({ type: Number }) selectedCount = 0;
  @property({ type: Number }) selectableCount = 0;
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
        left: 0;
        right: 0;
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

    return html`
      <div class="selection-panel">
        <div class="left-section">
          <div class="count">
            ${this.selectedCount} ${this.selectedCount === 1 ? 'entity' : 'entities'} selected
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

declare global {
  interface HTMLElementTagNameMap {
    'selection-panel': SelectionPanel;
  }
}
