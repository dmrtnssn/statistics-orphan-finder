import { a as i, i as i$1, x, n, r } from "./lit-core-eQjJmNqs.js";
import { s as sharedStyles, b as formatBytes } from "./statistics-orphan-panel-Cq4qpCL9.js";
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
var __defProp = Object.defineProperty;
var __decorateClass = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp(target, key, result);
  return result;
};
const _DeleteSqlModal = class _DeleteSqlModal extends i {
  constructor() {
    super(...arguments);
    this.data = null;
    this.sql = "";
    this.storageSaved = 0;
    this.entities = [];
    this.deletedCount = 0;
    this.disabledCount = 0;
    this.mode = "display";
    this.copyButtonText = "Copy to Clipboard";
    this.checkbox1 = false;
    this.checkbox2 = false;
  }
  handleClose() {
    this.dispatchEvent(new CustomEvent("close-modal", {
      bubbles: true,
      composed: true
    }));
  }
  async handleCopy() {
    try {
      await copyToClipboard(this.sql);
      this.copyButtonText = "✓ Copied!";
      setTimeout(() => {
        this.copyButtonText = "Copy to Clipboard";
      }, 2e3);
    } catch (error) {
      this.copyButtonText = "✗ Failed to copy";
      setTimeout(() => {
        this.copyButtonText = "Copy to Clipboard";
      }, 2e3);
    }
  }
  handleCancel() {
    this.checkbox1 = false;
    this.checkbox2 = false;
    this.dispatchEvent(new CustomEvent("cancel", {
      bubbles: true,
      composed: true
    }));
  }
  handleConfirm() {
    this.dispatchEvent(new CustomEvent("confirm", {
      bubbles: true,
      composed: true
    }));
  }
  renderConfirmationMode() {
    const totalCount = this.deletedCount + this.disabledCount;
    const hasDisabled = this.disabledCount > 0;
    const allCheckboxesChecked = hasDisabled ? this.checkbox1 && this.checkbox2 : this.checkbox1;
    const deletedEntities = this.entities.filter(
      (e) => !e.in_entity_registry && !e.in_state_machine
    );
    const disabledEntities = this.entities.filter(
      (e) => e.registry_status === "Disabled"
    );
    return x`
      <div class="modal-overlay" @click=${this.handleCancel}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()} style="max-width: 600px;">
          <div class="modal-header">
            <h2>Confirm Statistics Deletion</h2>
            <button class="modal-close" @click=${this.handleCancel}>&times;</button>
          </div>

          <div class="modal-body">
            <div class="warning">
              <strong>Warning:</strong> This will permanently delete ${totalCount} ${totalCount === 1 ? "entity" : "entities"} from your database.
              ${hasDisabled ? " Disabled entities can be re-enabled, but their statistics will be lost." : ""}
              Always backup before performing deletions.
            </div>

            ${deletedEntities.length > 0 ? x`
              <ul class="entities-list">
                ${deletedEntities.map((e) => x`<li><code>${e.entity_id}</code></li>`)}
              </ul>
            ` : ""}

            ${disabledEntities.length > 0 ? x`
              <ul class="entities-list disabled">
                ${disabledEntities.map((e) => x`<li><code>${e.entity_id}</code></li>`)}
              </ul>
            ` : ""}

            <div class="checkboxes">
              <label>
                <input
                  type="checkbox"
                  ?checked=${this.checkbox1}
                  @change=${(e) => this.checkbox1 = e.target.checked}
                >
                I understand deleted statistics are PERMANENT
              </label>
              ${hasDisabled ? x`
                <label>
                  <input
                    type="checkbox"
                    ?checked=${this.checkbox2}
                    @change=${(e) => this.checkbox2 = e.target.checked}
                  >
                  I understand disabled entities may be re-enabled
                </label>
              ` : ""}
            </div>

            <button
              class="delete-button"
              ?disabled=${!allCheckboxesChecked}
              @click=${this.handleConfirm}
              title=${!allCheckboxesChecked ? "Check all boxes to enable" : ""}
            >
              Delete Statistics for ${totalCount} ${totalCount === 1 ? "Entity" : "Entities"}
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
    if (this.mode === "confirm") {
      return this.renderConfirmationMode();
    }
    if (!this.data) return x``;
    const isBulk = this.data.entityId.includes(" entities");
    const entityCount = isBulk ? parseInt(this.data.entityId.split(" ")[0]) : 1;
    return x`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()} style="max-width: 800px;">
          <div class="modal-header">
            <h2>${isBulk ? "SQL for " + entityCount + " " + (entityCount === 1 ? "Entity" : "Entities") : this.data.entityId}</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            ${isBulk ? x`
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
            ` : x`
              <div class="info-grid">
                <span class="info-label">Record Count:</span>
                <span class="info-value">${this.data.count.toLocaleString()}</span>

                <span class="info-label">Storage Saved:</span>
                <span class="info-value">${formatBytes(this.storageSaved)}</span>
              </div>
            `}

            <h3>SQL Statement${isBulk ? "s" : ""}:</h3>
            <div class="sql-container">${this.sql}</div>

            <button
              class="copy-button ${this.copyButtonText.includes("Copied") ? "copied" : ""}"
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
};
_DeleteSqlModal.styles = [
  sharedStyles,
  i$1`
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
let DeleteSqlModal = _DeleteSqlModal;
__decorateClass([
  n({ type: Object })
], DeleteSqlModal.prototype, "data");
__decorateClass([
  n({ type: String })
], DeleteSqlModal.prototype, "sql");
__decorateClass([
  n({ type: Number })
], DeleteSqlModal.prototype, "storageSaved");
__decorateClass([
  n({ type: Array })
], DeleteSqlModal.prototype, "entities");
__decorateClass([
  n({ type: Number })
], DeleteSqlModal.prototype, "deletedCount");
__decorateClass([
  n({ type: Number })
], DeleteSqlModal.prototype, "disabledCount");
__decorateClass([
  n({ type: String })
], DeleteSqlModal.prototype, "mode");
__decorateClass([
  r()
], DeleteSqlModal.prototype, "copyButtonText");
__decorateClass([
  r()
], DeleteSqlModal.prototype, "checkbox1");
__decorateClass([
  r()
], DeleteSqlModal.prototype, "checkbox2");
if (!customElements.get("delete-sql-modal")) {
  customElements.define("delete-sql-modal", DeleteSqlModal);
}
export {
  DeleteSqlModal
};
//# sourceMappingURL=delete-sql-modal-6WAAU2qM.js.map
