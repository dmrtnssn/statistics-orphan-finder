/**
 * DeleteSqlModal component
 * Shows SQL deletion statements and allows copying
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatBytes } from '../services/formatters';
import { copyToClipboard } from '../services/dom-utils';
import type { DeleteModalData, StorageEntity } from '../types';

export class DeleteSqlModal extends LitElement {
  @property({ type: Object }) data: DeleteModalData | null = null;
  @property({ type: String }) sql = '';
  @property({ type: Number }) storageSaved = 0;
  @property({ type: Array }) entities: StorageEntity[] = [];
  @property({ type: Number }) deletedCount = 0;
  @property({ type: Number }) disabledCount = 0;
  @property({ type: String }) mode: 'confirm' | 'display' = 'display';

  @state() private copyButtonText = 'Copy to Clipboard';
  @state() private checkbox1 = false;  // "I understand deleted statistics are PERMANENT"
  @state() private checkbox2 = false;  // "I understand disabled entities may be re-enabled"

  static styles = [
    sharedStyles,
    css`
      .sql-container {
        background: var(--secondary-background-color);
        padding: 16px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 16px 0;
        max-height: 400px;
        overflow-y: auto;
      }

      .bulk-summary {
        background: rgba(33, 150, 243, 0.1);
        border-left: 4px solid var(--primary-color);
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
      }

      .bulk-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
        font-size: 14px;
      }

      .bulk-stat {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }

      .bulk-stat-label {
        color: var(--secondary-text-color);
      }

      .bulk-stat-value {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .warning {
        background: rgba(255, 152, 0, 0.1);
        border-left: 4px solid var(--warning-color, #FF9800);
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 16px;
        margin-bottom: 16px;
      }

      .info-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .info-value {
        color: var(--primary-text-color);
      }

      .copy-button {
        width: 100%;
        margin-top: 8px;
      }

      .copy-button.copied {
        background: var(--success-color, #4CAF50);
      }

      /* Confirmation Mode Styles */
      .entities-list {
        list-style: none;
        padding: 12px;
        margin: 0 0 16px 0;
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      .entities-list.disabled {
        background: rgba(255, 152, 0, 0.05);
        border: 1px solid rgba(255, 152, 0, 0.2);
      }

      .entities-list li {
        padding: 6px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .entities-list li:last-child {
        border-bottom: none;
      }

      .entities-list code {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: var(--primary-text-color);
      }

      .checkboxes {
        margin: 20px 0;
      }

      .checkboxes label {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 12px;
        cursor: pointer;
        color: var(--primary-text-color);
        line-height: 1.5;
      }

      .checkboxes label:last-child {
        margin-bottom: 0;
      }

      .checkboxes input[type="checkbox"] {
        margin-top: 3px;
        cursor: pointer;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .delete-button {
        width: 100%;
        margin-top: 8px;
        background: #F44336;
        color: white;
      }

      .delete-button:hover:not(:disabled) {
        background: #D32F2F;
      }

      .delete-button:disabled {
        background: rgba(244, 67, 54, 0.3);
        color: rgba(255, 255, 255, 0.5);
        cursor: not-allowed;
      }
    `
  ];

  private handleClose() {
    this.dispatchEvent(new CustomEvent('close-modal', {
      bubbles: true,
      composed: true
    }));
  }

  private async handleCopy() {
    try {
      await copyToClipboard(this.sql);
      this.copyButtonText = '✓ Copied!';
      setTimeout(() => {
        this.copyButtonText = 'Copy to Clipboard';
      }, 2000);
    } catch (error) {
      this.copyButtonText = '✗ Failed to copy';
      setTimeout(() => {
        this.copyButtonText = 'Copy to Clipboard';
      }, 2000);
    }
  }

  private handleCancel() {
    // Reset checkboxes
    this.checkbox1 = false;
    this.checkbox2 = false;

    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true
    }));
  }

  private handleConfirm() {
    this.dispatchEvent(new CustomEvent('confirm', {
      bubbles: true,
      composed: true
    }));
  }


  private renderConfirmationMode() {
    const totalCount = this.deletedCount + this.disabledCount;
    const hasDisabled = this.disabledCount > 0;
    const allCheckboxesChecked = hasDisabled ? (this.checkbox1 && this.checkbox2) : this.checkbox1;

    // Separate entities by type
    const deletedEntities = this.entities.filter(e =>
      !e.in_entity_registry && !e.in_state_machine
    );
    const disabledEntities = this.entities.filter(e =>
      e.registry_status === 'Disabled'
    );

    return html`
      <div class="modal-overlay" @click=${this.handleCancel}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()} style="max-width: 600px;">
          <div class="modal-header">
            <h2>Confirm Statistics Deletion</h2>
            <button class="modal-close" @click=${this.handleCancel}>&times;</button>
          </div>

          <div class="modal-body">
            <div class="warning">
              <strong>Warning:</strong> This will permanently delete ${totalCount} ${totalCount === 1 ? 'entity' : 'entities'} from your database.
              ${hasDisabled ? ' Disabled entities can be re-enabled, but their statistics will be lost.' : ''}
              Always backup before performing deletions.
            </div>

            ${deletedEntities.length > 0 ? html`
              <ul class="entities-list">
                ${deletedEntities.map(e => html`<li><code>${e.entity_id}</code></li>`)}
              </ul>
            ` : ''}

            ${disabledEntities.length > 0 ? html`
              <ul class="entities-list disabled">
                ${disabledEntities.map(e => html`<li><code>${e.entity_id}</code></li>`)}
              </ul>
            ` : ''}

            <div class="checkboxes">
              <label>
                <input
                  type="checkbox"
                  ?checked=${this.checkbox1}
                  @change=${(e: Event) => this.checkbox1 = (e.target as HTMLInputElement).checked}
                >
                I understand deleted statistics are PERMANENT
              </label>
              ${hasDisabled ? html`
                <label>
                  <input
                    type="checkbox"
                    ?checked=${this.checkbox2}
                    @change=${(e: Event) => this.checkbox2 = (e.target as HTMLInputElement).checked}
                  >
                  I understand disabled entities may be re-enabled
                </label>
              ` : ''}
            </div>

            <button
              class="delete-button"
              ?disabled=${!allCheckboxesChecked}
              @click=${this.handleConfirm}
              title=${!allCheckboxesChecked ? 'Check all boxes to enable' : ''}
            >
              Delete Statistics for ${totalCount} ${totalCount === 1 ? 'Entity' : 'Entities'}
            </button>
          </div>

          <div class="modal-footer">
            <button class="secondary-button" @click=${this.handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    // Show confirmation mode if mode is 'confirm'
    if (this.mode === 'confirm') {
      return this.renderConfirmationMode();
    }

    // Show SQL display mode (original behavior)
    if (!this.data) return html``;

    // Detect if this is a bulk operation
    const isBulk = this.data.entityId.includes(' entities');
    const entityCount = isBulk ? parseInt(this.data.entityId.split(' ')[0]) : 1;

    return html`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()} style="max-width: 800px;">
          <div class="modal-header">
            <h2>${isBulk ? 'SQL for ' + entityCount + ' ' + (entityCount === 1 ? 'Entity' : 'Entities') : this.data.entityId}</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            ${isBulk ? html`
              <div class="bulk-summary">
                <div class="bulk-stats">
                  <div class="bulk-stat">
                    <span class="bulk-stat-label">Entities:</span>
                    <span class="bulk-stat-value">${entityCount}</span>
                  </div>
                  <div class="bulk-stat">
                    <span class="bulk-stat-label">Total Records:</span>
                    <span class="bulk-stat-value">${this.data.count.toLocaleString()}</span>
                  </div>
                  <div class="bulk-stat">
                    <span class="bulk-stat-label">Storage Saved:</span>
                    <span class="bulk-stat-value">${formatBytes(this.storageSaved)}</span>
                  </div>
                </div>
              </div>
            ` : html`
              <div class="info-grid">
                <span class="info-label">Record Count:</span>
                <span class="info-value">${this.data.count.toLocaleString()}</span>

                <span class="info-label">Storage Saved:</span>
                <span class="info-value">${formatBytes(this.storageSaved)}</span>
              </div>
            `}

            <h3>SQL Statement${isBulk ? 's' : ''}:</h3>
            <div class="sql-container">${this.sql}</div>

            <button
              class="copy-button ${this.copyButtonText.includes('Copied') ? 'copied' : ''}"
              @click=${this.handleCopy}
            >
              ${this.copyButtonText}
            </button>
          </div>

          <div class="modal-footer">
            <button class="secondary-button" @click=${this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('delete-sql-modal')) {
  customElements.define('delete-sql-modal', DeleteSqlModal);
}
