import { i, n, r, a as i$1, x, t } from "./lit-core-C_-GaGI3.js";
import { s as sharedStyles, c as copyToClipboard, b as formatBytes } from "./statistics-orphan-panel-Dta5DDhQ.js";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
let DeleteSqlModal = class extends i$1 {
  constructor() {
    super(...arguments);
    this.data = null;
    this.sql = "";
    this.storageSaved = 0;
    this.copyButtonText = "Copy to Clipboard";
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
  render() {
    if (!this.data) return x``;
    const isBulk = this.data.entityId.includes(" entities");
    const entityCount = isBulk ? parseInt(this.data.entityId.split(" ")[0]) : 1;
    return x`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()} style="max-width: 800px;">
          <div class="modal-header">
            <h2>${isBulk ? "Bulk Delete SQL" : `Remove Entity: ${this.data.entityId}`}</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            <div class="warning">
              <strong>⚠️ Warning:</strong> This action will permanently delete data from your database.
              Always backup your database before performing deletions!
            </div>

            ${isBulk ? x`
              <div class="bulk-summary">
                <div class="bulk-summary-title">Bulk Operation Summary</div>
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
                <span class="info-label">Entity ID:</span>
                <span class="info-value">${this.data.entityId}</span>

                <span class="info-label">Status:</span>
                <span class="info-value">${this.data.status}</span>

                <span class="info-label">Origin:</span>
                <span class="info-value">${this.data.origin}</span>

                <span class="info-label">Record Count:</span>
                <span class="info-value">${this.data.count.toLocaleString()}</span>

                <span class="info-label">Storage Saved:</span>
                <span class="info-value">${formatBytes(this.storageSaved)}</span>
              </div>
            `}

            <h3>SQL Deletion Statement${isBulk ? "s" : ""}:</h3>
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
DeleteSqlModal.styles = [
  sharedStyles,
  i`
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

      .bulk-summary-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--primary-text-color);
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
    `
];
__decorateClass([
  n({ type: Object })
], DeleteSqlModal.prototype, "data", 2);
__decorateClass([
  n({ type: String })
], DeleteSqlModal.prototype, "sql", 2);
__decorateClass([
  n({ type: Number })
], DeleteSqlModal.prototype, "storageSaved", 2);
__decorateClass([
  r()
], DeleteSqlModal.prototype, "copyButtonText", 2);
DeleteSqlModal = __decorateClass([
  t("delete-sql-modal")
], DeleteSqlModal);
export {
  DeleteSqlModal
};
//# sourceMappingURL=delete-sql-modal-BXDy_Xdz.js.map
