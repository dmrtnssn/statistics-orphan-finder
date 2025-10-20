import { i, n, a as i$1, x, t } from "./lit-core-C_-GaGI3.js";
import { s as sharedStyles, f as formatNumber, a as formatDuration } from "./statistics-orphan-panel-FGIpGagr.js";
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
let EntityDetailsModal = class extends i$1 {
  constructor() {
    super(...arguments);
    this.entity = null;
  }
  handleClose() {
    this.dispatchEvent(new CustomEvent("close-modal", {
      bubbles: true,
      composed: true
    }));
  }
  handleOpenMoreInfo() {
    if (!this.entity) return;
    this.handleClose();
    this.dispatchEvent(new CustomEvent("open-more-info", {
      detail: { entityId: this.entity.entity_id },
      bubbles: true,
      composed: true
    }));
  }
  renderStatusIndicator() {
    if (!this.entity) return "";
    let statusClass = "status-unknown";
    if (this.entity.state_status === "Available") {
      statusClass = "status-available";
    } else if (this.entity.state_status === "Unavailable") {
      statusClass = "status-unavailable";
    }
    return x`<span class="status-indicator ${statusClass}"></span>`;
  }
  render() {
    if (!this.entity) return x``;
    return x`
      <div class="modal-overlay" @click=${this.handleClose}>
        <div class="modal-content entity-details-content" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Entity Details</h2>
            <button class="modal-close" @click=${this.handleClose}>&times;</button>
          </div>

          <div class="modal-body">
            <!-- Entity Identity -->
            <div class="details-section">
              <h3>Entity Information</h3>
              <div class="details-grid">
                <span class="detail-label">Entity ID:</span>
                <span class="detail-value clickable" @click=${this.handleOpenMoreInfo}>
                  ${this.entity.entity_id}
                </span>

                ${this.entity.platform ? x`
                  <span class="detail-label">Platform:</span>
                  <span class="detail-value">${this.entity.platform}</span>
                ` : ""}

                ${this.entity.device_name ? x`
                  <span class="detail-label">Device:</span>
                  <span class="detail-value">
                    ${this.entity.device_name}
                    ${this.entity.device_disabled ? " (disabled)" : ""}
                  </span>
                ` : ""}

                ${this.entity.config_entry_title ? x`
                  <span class="detail-label">Integration:</span>
                  <span class="detail-value">
                    ${this.entity.config_entry_title}
                    ${this.entity.config_entry_state ? ` (${this.entity.config_entry_state})` : ""}
                  </span>
                ` : ""}
              </div>
            </div>

            <!-- Status -->
            <div class="details-section">
              <h3>Current Status</h3>
              <div class="details-grid">
                <span class="detail-label">State:</span>
                <span class="detail-value">
                  ${this.renderStatusIndicator()}
                  ${this.entity.state_status}
                </span>

                <span class="detail-label">Registry:</span>
                <span class="detail-value">${this.entity.registry_status}</span>
              </div>

              ${this.entity.availability_reason ? x`
                <div class="reason-box">
                  <strong>Reason:</strong> ${this.entity.availability_reason}
                </div>
              ` : ""}

              ${this.entity.unavailable_duration_seconds ? x`
                <div class="reason-box">
                  <strong>Duration:</strong> ${formatDuration(this.entity.unavailable_duration_seconds)}
                </div>
              ` : ""}
            </div>

            <!-- States Table -->
            <div class="details-section">
              <h3>States Table</h3>
              <div class="details-grid">
                <span class="detail-label">In states_meta:</span>
                <span class="detail-value">${this.entity.in_states_meta ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In states:</span>
                <span class="detail-value">${this.entity.in_states ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">State records:</span>
                <span class="detail-value">${formatNumber(this.entity.states_count)}</span>

                ${this.entity.last_state_update ? x`
                  <span class="detail-label">Last update:</span>
                  <span class="detail-value">${this.entity.last_state_update}</span>
                ` : ""}
              </div>
            </div>

            <!-- Update Frequency -->
            ${this.entity.update_interval ? x`
              <div class="details-section">
                <h3>Update Frequency</h3>
                <div class="details-grid">
                  <span class="detail-label">Message interval:</span>
                  <span class="detail-value">${this.entity.update_interval}</span>

                  ${this.entity.update_count_24h ? x`
                    <span class="detail-label">Updates (24h):</span>
                    <span class="detail-value">${formatNumber(this.entity.update_count_24h)}</span>
                  ` : ""}
                </div>
              </div>
            ` : ""}

            <!-- Statistics Table -->
            <div class="details-section">
              <h3>Statistics Table</h3>
              <div class="details-grid">
                <span class="detail-label">In statistics_meta:</span>
                <span class="detail-value">${this.entity.in_statistics_meta ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In short-term:</span>
                <span class="detail-value">${this.entity.in_statistics_short_term ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">In long-term:</span>
                <span class="detail-value">${this.entity.in_statistics_long_term ? "✓ Yes" : "✗ No"}</span>

                <span class="detail-label">Short-term records:</span>
                <span class="detail-value">${formatNumber(this.entity.stats_short_count)}</span>

                <span class="detail-label">Long-term records:</span>
                <span class="detail-value">${formatNumber(this.entity.stats_long_count)}</span>

                ${this.entity.last_stats_update ? x`
                  <span class="detail-label">Last update:</span>
                  <span class="detail-value">${this.entity.last_stats_update}</span>
                ` : ""}
              </div>
            </div>

            <!-- Statistics Eligibility -->
            ${this.entity.statistics_eligibility_reason ? x`
              <div class="details-section">
                <h3>Statistics Eligibility</h3>
                <div class="reason-box">
                  ${this.entity.statistics_eligibility_reason}
                </div>
              </div>
            ` : ""}
          </div>

          <div class="modal-footer">
            <button @click=${this.handleOpenMoreInfo}>Open More Info</button>
            <button class="secondary-button" @click=${this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
};
EntityDetailsModal.styles = [
  sharedStyles,
  i`
      .details-section {
        margin-bottom: 24px;
      }

      .details-section:last-child {
        margin-bottom: 0;
      }

      .details-section h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .details-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 16px;
      }

      .detail-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .detail-value {
        color: var(--primary-text-color);
        text-align: right;
      }

      .detail-value.clickable {
        color: var(--primary-color);
        cursor: pointer;
      }

      .detail-value.clickable:hover {
        text-decoration: underline;
      }

      .status-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .status-available {
        background: var(--success-color, #4CAF50);
      }

      .status-unavailable {
        background: var(--warning-color, #FF9800);
      }

      .status-unknown {
        background: var(--error-color, #F44336);
      }

      .reason-box {
        background: var(--secondary-background-color);
        padding: 12px;
        border-radius: 4px;
        margin-top: 8px;
        font-size: 13px;
      }

      /* Desktop: 580px centered modal */
      .entity-details-content {
        max-width: 580px;
      }

      /* Mobile: Fullscreen modal */
      @media (max-width: 500px) {
        .entity-details-content {
          max-width: 100%;
          width: 100%;
          max-height: 100vh;
          border-radius: 0;
          margin: 0;
        }

        .modal-body {
          padding: 16px;
        }
      }
    `
];
__decorateClass([
  n({ type: Object })
], EntityDetailsModal.prototype, "entity", 2);
EntityDetailsModal = __decorateClass([
  t("entity-details-modal")
], EntityDetailsModal);
export {
  EntityDetailsModal
};
//# sourceMappingURL=entity-details-modal-CdXirOGA.js.map
