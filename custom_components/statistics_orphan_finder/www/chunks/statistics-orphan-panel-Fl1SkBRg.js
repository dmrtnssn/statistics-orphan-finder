import { i, n, a as i$1, x, t, r, e } from "./lit-core-C_-GaGI3.js";
const sharedStyles = i`
  /* Base styles */
  :host {
    display: block;
    font-family: var(--paper-font-body1_-_font-family);
    color: var(--primary-text-color);
  }

  /* Cards and containers */
  .card {
    background: var(--card-background-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  /* Typography */
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Buttons */
  button {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background: var(--dark-primary-color);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .secondary-button:hover {
    background: var(--divider-color);
  }

  /* Table styles */
  .table-container {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }

  .table-scroll {
    overflow-x: auto;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: var(--table-header-background-color, var(--secondary-background-color));
    color: var(--primary-text-color);
    padding: 12px 8px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    background: var(--divider-color);
  }

  td {
    padding: 12px 8px;
    border-bottom: 1px solid var(--divider-color);
  }

  tr:hover td {
    background: var(--table-row-background-hover-color, var(--secondary-background-color));
  }

  /* Sticky first column */
  .sticky-column {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--card-background-color);
    /* Performance optimizations for sticky positioning */
    will-change: transform;      /* Hint browser to optimize */
    transform: translateZ(0);    /* Force GPU acceleration */
  }

  .sticky-column::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: var(--divider-color);
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  th.sticky-column {
    z-index: 3;
  }

  tr:hover .sticky-column {
    background: var(--table-row-background-hover-color, var(--secondary-background-color));
  }

  /* Group borders for column grouping */
  .group-border-left {
    border-left: 2px solid var(--divider-color);
  }

  /* Status badges */
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-enabled,
  .status-available {
    color: var(--success-color, #4CAF50);
  }

  .status-disabled,
  .status-unavailable {
    color: var(--warning-color, #FF9800);
  }

  .status-deleted,
  .status-not-in-registry,
  .status-not-present {
    color: var(--error-color, #F44336);
  }

  /* Links */
  .entity-id-link {
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: none;
  }

  .entity-id-link:hover {
    text-decoration: underline;
  }

  /* Loading state */
  .loading {
    text-align: center;
    padding: 32px;
    color: var(--secondary-text-color);
  }

  .loading-spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  /* Summary grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stats-card {
    background: var(--card-background-color);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
    transition: all 0.3s;
  }

  .stats-card.clickable {
    cursor: pointer;
  }

  .stats-card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px 0 rgba(0, 0, 0, 0.2));
  }

  .stats-card.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.2));
    border: 1px solid rgba(255, 193, 7, 0.5);
  }

  .stats-value {
    font-size: 28px;
    font-weight: 300;
    color: var(--primary-text-color);
    margin: 8px 0;
  }

  .stats-subtitle {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  /* Filters */
  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .filter-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .filter-button:hover {
    background: var(--divider-color);
  }

  .filter-button.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.3));
    border-color: rgba(255, 193, 7, 0.8);
    color: var(--primary-text-color);
  }

  /* Search box */
  .search-box {
    flex: 1;
    min-width: 200px;
  }

  input[type="search"],
  input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  /* Modals */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    max-width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--divider-color);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: var(--primary-text-color);
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .mt-16 {
    margin-top: 16px;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .hidden {
    display: none;
  }
`;
const API_BASE = "statistics_orphan_finder";
class ApiService {
  constructor(hass) {
    this.hass = hass;
  }
  /**
   * Validate that hass connection is available
   */
  validateConnection() {
    if (!this.hass) {
      throw new Error("Home Assistant connection not available. Please reload the page.");
    }
    if (!this.hass.callApi) {
      throw new Error("Home Assistant API not available. Connection may have been lost.");
    }
  }
  /**
   * Fetch database size information
   */
  async fetchDatabaseSize() {
    this.validateConnection();
    try {
      return await this.hass.callApi("GET", `${API_BASE}?action=database_size`);
    } catch (err) {
      throw new Error(`Failed to fetch database size: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /**
   * Fetch entity storage overview
   */
  async fetchEntityStorageOverview() {
    this.validateConnection();
    try {
      return await this.hass.callApi("GET", `${API_BASE}?action=entity_storage_overview`);
    } catch (err) {
      throw new Error(`Failed to fetch entity storage overview: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /**
   * Fetch entity storage overview step by step
   */
  async fetchEntityStorageOverviewStep(step) {
    this.validateConnection();
    try {
      return await this.hass.callApi("GET", `${API_BASE}?action=entity_storage_overview_step&step=${step}`);
    } catch (err) {
      throw new Error(`Failed to fetch overview step ${step}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /**
   * Generate delete SQL for an entity
   */
  async generateDeleteSql(entityId, origin, inStatesMeta, inStatisticsMeta) {
    this.validateConnection();
    try {
      const url = `${API_BASE}?action=generate_delete_sql&entity_id=${encodeURIComponent(entityId)}&in_states_meta=${inStatesMeta ? "true" : "false"}&in_statistics_meta=${inStatisticsMeta ? "true" : "false"}&origin=${encodeURIComponent(origin)}`;
      return await this.hass.callApi("GET", url);
    } catch (err) {
      throw new Error(`Failed to generate delete SQL: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /**
   * Show Home Assistant's more-info dialog for an entity
   */
  showMoreInfo(entityId) {
    const event = new Event("hass-more-info", {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId };
    document.querySelector("home-assistant")?.dispatchEvent(event);
  }
}
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i2 = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i2);
  if (i2 === 0) {
    return `${value} ${sizes[i2]}`;
  } else if (value >= 100) {
    return `${value.toFixed(0)} ${sizes[i2]}`;
  } else if (value >= 10) {
    return `${value.toFixed(1)} ${sizes[i2]}`;
  } else {
    return `${value.toFixed(2)} ${sizes[i2]}`;
  }
}
function formatNumber(num) {
  return num.toLocaleString();
}
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}
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
function debounce(func, wait) {
  let timeout = null;
  return function(...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$5(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$5(target, key, result);
  return result;
};
let StorageHealthSummary = class extends i$1 {
  constructor() {
    super(...arguments);
    this.summary = null;
    this.entities = [];
    this.databaseSize = null;
    this.activeFilter = null;
  }
  getUnavailableLongTerm() {
    const sevenDaysInSeconds = 7 * 24 * 3600;
    return this.entities.filter(
      (e2) => e2.state_status === "Unavailable" && e2.unavailable_duration_seconds !== null && e2.unavailable_duration_seconds > sevenDaysInSeconds
    ).length;
  }
  estimateStorageMB(entityCount) {
    const statesSize = entityCount * 200;
    const statsSize = entityCount * 150;
    const mb = (statesSize + statsSize) / (1024 * 1024);
    if (mb < 10) {
      return mb.toFixed(1);
    }
    return Math.round(mb).toString();
  }
  getActualStorageMB(storageBytes, entityCount) {
    if (storageBytes !== void 0 && storageBytes > 0) {
      const mb = storageBytes / (1024 * 1024);
      if (mb < 10) {
        return mb.toFixed(1);
      }
      return Math.round(mb).toString();
    }
    return this.estimateStorageMB(entityCount);
  }
  handleAction(action) {
    this.dispatchEvent(new CustomEvent("action-clicked", {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }
  drawChart() {
    const canvas = this.shadowRoot?.getElementById("pie-chart");
    if (!canvas || !this.databaseSize) {
      console.warn("[StorageHealthSummary] Canvas or database size not available");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[StorageHealthSummary] Could not get canvas 2D context");
      return;
    }
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;
    console.log("[StorageHealthSummary] Drawing chart with sizes:", {
      states,
      statsShort,
      statsLong,
      other,
      total
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (total === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data", centerX, centerY);
      return;
    }
    const segments = [
      { size: states, percent: states / total, color: "#2196F3", label: "States" },
      { size: statsShort, percent: statsShort / total, color: "#FF9800", label: "Statistics Short-term" },
      { size: statsLong, percent: statsLong / total, color: "#4CAF50", label: "Statistics Long-term" },
      { size: other, percent: other / total, color: "#9E9E9E", label: "Other" }
    ].sort((a, b) => b.size - a.size);
    let currentAngle = -Math.PI / 2;
    segments.forEach((segment) => {
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segment.percent * 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      currentAngle += segment.percent * 2 * Math.PI;
    });
  }
  renderPieChart() {
    if (!this.databaseSize) {
      console.warn("[StorageHealthSummary] Database size data not available");
      return x`<div class="no-issues">Database size information unavailable<br><small>Click Refresh to load data</small></div>`;
    }
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;
    console.log("[StorageHealthSummary] Database sizes:", {
      states,
      statsLong,
      statsShort,
      other,
      total
    });
    if (isNaN(total) || !isFinite(total)) {
      console.error("[StorageHealthSummary] Invalid database size data (NaN/Infinity)");
      return x`<div class="no-issues">Invalid database size data<br><small>Check browser console for details</small></div>`;
    }
    if (total === 0) {
      return x`<div class="no-issues">No database data<br><small>Database appears empty</small></div>`;
    }
    const segments = [
      { percent: states / total * 100, color: "#2196F3", label: "States", size: states },
      { percent: statsShort / total * 100, color: "#FF9800", label: "Statistics Short-term", size: statsShort },
      { percent: statsLong / total * 100, color: "#4CAF50", label: "Statistics Long-term", size: statsLong },
      { percent: other / total * 100, color: "#9E9E9E", label: "Other", size: other }
    ];
    const getRecordCount = (label) => {
      switch (label) {
        case "States":
          return this.databaseSize?.states || 0;
        case "Statistics Short-term":
          return this.databaseSize?.statistics_short_term || 0;
        case "Statistics Long-term":
          return this.databaseSize?.statistics || 0;
        case "Other":
          return this.databaseSize?.other || 0;
        default:
          return 0;
      }
    };
    return x`
      <div class="chart-title">Database Storage</div>
      <canvas id="pie-chart" width="220" height="220"></canvas>
      <div class="chart-legend">
        ${segments.map((segment) => {
      const recordCount = getRecordCount(segment.label);
      return x`
            <div class="legend-item">
              <div class="legend-color" style="background: ${segment.color}"></div>
              <div class="legend-content">
                <div class="legend-main">
                  <span class="legend-label">${segment.label}</span>
                  <span class="legend-value">${formatBytes(segment.size)}</span>
                </div>
                <div class="legend-count">${formatNumber(recordCount)} records</div>
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
  renderActionSummary() {
    if (!this.summary) {
      return x`<div class="no-issues">Summary data unavailable</div>`;
    }
    const actions = [];
    const deleted = this.summary.deleted_from_registry;
    const unavailableLong = this.getUnavailableLongTerm();
    const disabled = this.summary.registry_disabled;
    const onlyStates = this.summary.only_in_states;
    const onlyStats = this.summary.only_in_statistics;
    const active = this.summary.state_available;
    const total = this.summary.total_entities;
    if (deleted > 0) {
      const storageMB = this.getActualStorageMB(this.summary.deleted_storage_bytes, deleted);
      actions.push({
        priority: "critical",
        icon: "🔴",
        text: `${formatNumber(deleted)} deleted entities wasting ${storageMB}MB`,
        action: "cleanup_deleted",
        button: "Clean up"
      });
    }
    if (unavailableLong > 0) {
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(unavailableLong)} entities unavailable for 7+ days`,
        action: "investigate_unavailable",
        button: "Investigate"
      });
    }
    if (disabled > 0) {
      const potentialMB = this.getActualStorageMB(this.summary.disabled_storage_bytes, disabled);
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(disabled)} disabled entities using ${potentialMB}MB`,
        action: "review_disabled",
        button: "Review"
      });
    }
    if (onlyStates > 0 || onlyStats > 0) {
      const totalSingle = onlyStates + onlyStats;
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(totalSingle)} entities in single storage (${formatNumber(onlyStates)} states, ${formatNumber(onlyStats)} stats)`,
        action: "optimize_storage",
        button: "Review"
      });
    }
    const activePercent = total > 0 ? Math.round(active / total * 100) : 0;
    actions.push({
      priority: "success",
      icon: "✅",
      text: `${formatNumber(active)} entities active and healthy (${activePercent}%)`,
      action: null,
      button: null
    });
    if (actions.length === 1 && actions[0].priority === "success") {
      return x`
        <div class="no-issues">
          ✓ All systems healthy<br>
          ${formatNumber(active)} active entities
        </div>
      `;
    }
    return x`
      <div class="action-list">
        ${actions.map((item) => x`
          <div class="action-item ${item.priority}">
            <span class="action-icon">${item.icon}</span>
            <span class="action-text">${item.text}</span>
            ${item.button ? x`
              <button class="action-btn" @click=${() => this.handleAction(item.action)}>
                ${item.button}
              </button>
            ` : ""}
          </div>
        `)}
      </div>
    `;
  }
  render() {
    if (!this.summary) {
      return x`<div class="loading">Loading status summary...</div>`;
    }
    return x`
      <div class="summary-container">
        <!-- Column 1: Pie Chart -->
        <div class="column chart-column">
          ${this.renderPieChart()}
        </div>

        <!-- Column 2: Action Summary -->
        <div class="column summary-column">
          <div class="summary-title">Summary</div>
          ${this.renderActionSummary()}
        </div>

        <!-- Column 3: Placeholder -->
        <div class="column placeholder-column">
          Reserved for<br>future features
        </div>
      </div>
    `;
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("databaseSize") && this.databaseSize) {
      requestAnimationFrame(() => this.drawChart());
    }
  }
};
StorageHealthSummary.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
        margin-bottom: 24px;
      }

      .summary-container {
        display: grid;
        grid-template-columns: 300px 1fr 200px;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 1200px) {
        .summary-container {
          grid-template-columns: 1fr;
        }
      }

      .column {
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      /* Column 1: Pie Chart */
      .chart-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* Debug: Uncomment to verify container size */
        /* background: rgba(255, 255, 0, 0.1); */
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      #pie-chart {
        width: 220px;
        height: 220px;
        display: block;
      }

      .chart-legend {
        margin-top: 16px;
        width: 100%;
      }

      .legend-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .legend-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .legend-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .legend-label {
        color: var(--primary-text-color);
      }

      .legend-value {
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .legend-count {
        font-size: 11px;
        font-weight: 400;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }

      /* Column 2: Action Summary */
      .summary-column {
        display: flex;
        flex-direction: column;
      }

      .summary-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      .action-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .action-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 6px;
        border-left: 4px solid transparent;
      }

      .action-item.critical {
        border-left-color: #F44336;
      }

      .action-item.warning {
        border-left-color: #FF9800;
      }

      .action-item.success {
        border-left-color: #4CAF50;
      }

      .action-icon {
        font-size: 18px;
        min-width: 22px;
      }

      .action-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: var(--primary-text-color);
      }

      .action-btn {
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .action-btn:hover {
        background: var(--dark-primary-color);
        transform: translateY(-1px);
      }

      .no-issues {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      /* Column 3: Placeholder */
      .placeholder-column {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        text-align: center;
        min-height: 200px;
      }

      @media (max-width: 1200px) {
        .placeholder-column {
          display: none;
        }
      }
    `
];
__decorateClass$5([
  n({ type: Object })
], StorageHealthSummary.prototype, "summary", 2);
__decorateClass$5([
  n({ type: Array })
], StorageHealthSummary.prototype, "entities", 2);
__decorateClass$5([
  n({ type: Object })
], StorageHealthSummary.prototype, "databaseSize", 2);
__decorateClass$5([
  n({ type: String })
], StorageHealthSummary.prototype, "activeFilter", 2);
StorageHealthSummary = __decorateClass$5([
  t("storage-health-summary")
], StorageHealthSummary);
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$4(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$4(target, key, result);
  return result;
};
let FilterBar = class extends i$1 {
  constructor() {
    super(...arguments);
    this.filters = [];
    this.showSearch = false;
    this.searchPlaceholder = "Search entities...";
    this.searchValue = "";
    this.showClearButton = false;
    this.debouncedSearch = debounce((value) => {
      this.dispatchEvent(new CustomEvent("search-changed", {
        detail: { query: value },
        bubbles: true,
        composed: true
      }));
    }, 300);
  }
  handleFilterClick(filterId) {
    this.dispatchEvent(new CustomEvent("filter-clicked", {
      detail: { filterId },
      bubbles: true,
      composed: true
    }));
  }
  handleSearchInput(e2) {
    const input = e2.target;
    this.searchValue = input.value;
    this.debouncedSearch(this.searchValue);
  }
  handleClearFilters() {
    this.searchValue = "";
    this.dispatchEvent(new CustomEvent("clear-filters", {
      bubbles: true,
      composed: true
    }));
  }
  render() {
    return x`
      <div class="filter-container">
        ${this.filters.map((filter) => x`
          <button
            class="filter-button ${filter.active ? "active" : ""}"
            @click=${() => this.handleFilterClick(filter.id)}
          >
            ${filter.label}
          </button>
        `)}

        ${this.showSearch ? x`
          <div class="search-box">
            <input
              type="search"
              placeholder=${this.searchPlaceholder}
              .value=${this.searchValue}
              @input=${this.handleSearchInput}
            />
          </div>
        ` : ""}

        ${this.showClearButton ? x`
          <button
            class="secondary-button clear-button"
            @click=${this.handleClearFilters}
          >
            Clear Filters
          </button>
        ` : ""}
      </div>
    `;
  }
};
FilterBar.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .filter-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .clear-button {
        margin-left: auto;
      }
    `
];
__decorateClass$4([
  n({ type: Array })
], FilterBar.prototype, "filters", 2);
__decorateClass$4([
  n({ type: Boolean })
], FilterBar.prototype, "showSearch", 2);
__decorateClass$4([
  n({ type: String })
], FilterBar.prototype, "searchPlaceholder", 2);
__decorateClass$4([
  n({ type: String })
], FilterBar.prototype, "searchValue", 2);
__decorateClass$4([
  n({ type: Boolean })
], FilterBar.prototype, "showClearButton", 2);
FilterBar = __decorateClass$4([
  t("filter-bar")
], FilterBar);
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$3(target, key, result);
  return result;
};
let EntityTable = class extends i$1 {
  constructor() {
    super(...arguments);
    this.entities = [];
    this.columns = [];
    this.sortable = true;
    this.stickyFirstColumn = false;
    this.sortStack = [{ column: "", direction: "asc" }];
    this.emptyMessage = "No data available";
    this.showCheckboxes = false;
    this.selectedIds = /* @__PURE__ */ new Set();
    this.selectableEntityIds = /* @__PURE__ */ new Set();
  }
  handleSort(columnId) {
    if (!this.sortable) return;
    const column = this.columns.find((c) => c.id === columnId);
    if (!column?.sortable) return;
    const currentSort = this.sortStack[0];
    if (currentSort && currentSort.column === columnId) {
      const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
      this.sortStack = [{ column: columnId, direction: newDirection }];
    } else {
      this.sortStack = [{ column: columnId, direction: "asc" }];
    }
    this.dispatchEvent(new CustomEvent("sort-changed", {
      detail: { sortStack: this.sortStack },
      bubbles: true,
      composed: true
    }));
  }
  getSortIndicator(columnId) {
    const sortIndex = this.sortStack.findIndex((s) => s.column === columnId);
    if (sortIndex < 0) return "";
    const sort = this.sortStack[sortIndex];
    const arrow = sort.direction === "asc" ? "▲" : "▼";
    return x`
      <span class="sort-indicator">${arrow}</span>
    `;
  }
  handleEntityClick(entityId) {
    this.dispatchEvent(new CustomEvent("entity-clicked", {
      detail: { entityId },
      bubbles: true,
      composed: true
    }));
  }
  handleRowAction(entity, action) {
    this.dispatchEvent(new CustomEvent("row-action", {
      detail: { entity, action },
      bubbles: true,
      composed: true
    }));
  }
  handleCheckboxChange(entity, event) {
    const checkbox = event.target;
    const entityId = entity.entity_id;
    this.dispatchEvent(new CustomEvent("selection-changed", {
      detail: {
        entityId,
        selected: checkbox.checked
      },
      bubbles: true,
      composed: true
    }));
  }
  renderCell(entity, column) {
    if (column.render) {
      const content = column.render(entity);
      if (typeof content === "string") {
        return x`${content}`;
      }
      return content;
    }
    const value = column.getValue ? column.getValue(entity) : entity[column.id];
    return x`${value ?? ""}`;
  }
  render() {
    if (this.entities.length === 0) {
      return x`
        <div class="table-container">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div>${this.emptyMessage}</div>
          </div>
        </div>
      `;
    }
    return x`
      <div class="table-wrapper">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                ${this.showCheckboxes ? x`
                  <th class="checkbox-column sticky-column"></th>
                ` : ""}
                ${this.columns.map((column, index) => {
      const isSticky = this.stickyFirstColumn && index === 0;
      const isSortable = column.sortable !== false && this.sortable;
      const classes = [
        isSticky ? "sticky-column" : "",
        isSortable ? "sortable" : "",
        column.className || "",
        column.align ? `align-${column.align}` : ""
      ].filter(Boolean).join(" ");
      return x`
                    <th
                      class=${classes}
                      style=${column.width ? `width: ${column.width}` : ""}
                      @click=${() => isSortable && this.handleSort(column.id)}
                    >
                      ${column.label}
                      ${isSortable ? this.getSortIndicator(column.id) : ""}
                    </th>
                  `;
    })}
              </tr>
            </thead>
            <tbody>
              ${this.entities.map((entity) => {
      const entityId = entity.entity_id;
      const isSelectable = this.selectableEntityIds.has(entityId);
      const isSelected = this.selectedIds.has(entityId);
      return x`
                  <tr>
                    ${this.showCheckboxes ? x`
                      <td class="checkbox-column sticky-column">
                        <div class="checkbox-cell">
                          <input
                            type="checkbox"
                            .checked=${isSelected}
                            ?disabled=${!isSelectable}
                            @change=${(e2) => this.handleCheckboxChange(entity, e2)}
                            title=${isSelectable ? "Select this entity" : "This entity cannot be deleted"}
                          />
                        </div>
                      </td>
                    ` : ""}
                    ${this.columns.map((column, index) => {
        const isSticky = this.stickyFirstColumn && index === 0;
        const classes = [
          isSticky ? "sticky-column" : "",
          column.className || "",
          column.align ? `align-${column.align}` : ""
        ].filter(Boolean).join(" ");
        return x`
                        <td class=${classes}>
                          ${this.renderCell(entity, column)}
                        </td>
                      `;
      })}
                  </tr>
                `;
    })}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
EntityTable.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .table-wrapper {
        position: relative;
      }

      .table-scroll {
        overflow-x: auto;
        overflow-y: visible;
        /* Performance optimizations */
        overflow-scrolling: touch;  /* Smooth scrolling on mobile */
        -webkit-overflow-scrolling: touch;
      }

      /* CSS containment for better paint performance */
      tbody tr {
        contain: layout style paint;  /* Isolate layout calculations */
        content-visibility: auto;     /* Browser lazy-paints off-screen rows */
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

      .checkbox-column {
        width: 50px;
        text-align: center;
        padding: 8px;
      }

      .checkbox-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--primary-color);
      }

      input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.3;
      }
    `
];
__decorateClass$3([
  n({ type: Array })
], EntityTable.prototype, "entities", 2);
__decorateClass$3([
  n({ type: Array })
], EntityTable.prototype, "columns", 2);
__decorateClass$3([
  n({ type: Boolean })
], EntityTable.prototype, "sortable", 2);
__decorateClass$3([
  n({ type: Boolean })
], EntityTable.prototype, "stickyFirstColumn", 2);
__decorateClass$3([
  n({ type: Array })
], EntityTable.prototype, "sortStack", 2);
__decorateClass$3([
  n({ type: String })
], EntityTable.prototype, "emptyMessage", 2);
__decorateClass$3([
  n({ type: Boolean })
], EntityTable.prototype, "showCheckboxes", 2);
__decorateClass$3([
  n({ type: Object })
], EntityTable.prototype, "selectedIds", 2);
__decorateClass$3([
  n({ type: Object })
], EntityTable.prototype, "selectableEntityIds", 2);
EntityTable = __decorateClass$3([
  t("entity-table")
], EntityTable);
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let SelectionPanel = class extends i$1 {
  constructor() {
    super(...arguments);
    this.selectedCount = 0;
    this.selectableCount = 0;
    this.isGenerating = false;
    this.generatingProgress = 0;
    this.generatingTotal = 0;
  }
  handleSelectAll() {
    this.dispatchEvent(new CustomEvent("select-all", {
      bubbles: true,
      composed: true
    }));
  }
  handleDeselectAll() {
    this.dispatchEvent(new CustomEvent("deselect-all", {
      bubbles: true,
      composed: true
    }));
  }
  handleGenerateSql() {
    this.dispatchEvent(new CustomEvent("generate-bulk-sql", {
      bubbles: true,
      composed: true
    }));
  }
  render() {
    const allSelected = this.selectedCount === this.selectableCount && this.selectableCount > 0;
    return x`
      <div class="selection-panel">
        <div class="left-section">
          <div class="count">
            ${this.selectedCount} ${this.selectedCount === 1 ? "entity" : "entities"} selected
          </div>
          ${this.isGenerating ? x`
            <div class="progress-text">
              Generating SQL for ${this.generatingProgress} of ${this.generatingTotal}...
            </div>
          ` : ""}
        </div>

        <div class="actions">
          <button
            class="select-all-btn"
            @click=${this.handleSelectAll}
            ?disabled=${allSelected || this.isGenerating}
            title=${allSelected ? "All entities selected" : "Select all filtered deleted entities"}
          >
            Select All${this.selectableCount > 0 ? ` (${this.selectableCount})` : ""}
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
            ${this.isGenerating ? x`
              <span class="loading-spinner"></span>
              Generating...
            ` : x`
              Generate Delete SQL
            `}
          </button>
        </div>
      </div>
    `;
  }
};
SelectionPanel.styles = [
  sharedStyles,
  i`
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
__decorateClass$2([
  n({ type: Number })
], SelectionPanel.prototype, "selectedCount", 2);
__decorateClass$2([
  n({ type: Number })
], SelectionPanel.prototype, "selectableCount", 2);
__decorateClass$2([
  n({ type: Boolean })
], SelectionPanel.prototype, "isGenerating", 2);
__decorateClass$2([
  n({ type: Number })
], SelectionPanel.prototype, "generatingProgress", 2);
__decorateClass$2([
  n({ type: Number })
], SelectionPanel.prototype, "generatingTotal", 2);
SelectionPanel = __decorateClass$2([
  t("selection-panel")
], SelectionPanel);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let StorageOverviewView = class extends i$1 {
  constructor() {
    super(...arguments);
    this.entities = [];
    this.summary = null;
    this.databaseSize = null;
    this.searchQuery = "";
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
    this.selectedEntity = null;
    this.deleteModalData = null;
    this.deleteSql = "";
    this.deleteStorageSaved = 0;
    this.selectedEntityIds = /* @__PURE__ */ new Set();
    this.isGeneratingBulkSql = false;
    this.bulkSqlProgress = 0;
    this.bulkSqlTotal = 0;
    this._cachedFilteredEntities = [];
    this._lastFilterKey = "";
    this._entityDetailsModalLoaded = false;
    this._deleteSqlModalLoaded = false;
  }
  /**
   * Lazy load the entity details modal component
   */
  async _loadEntityDetailsModal() {
    if (!this._entityDetailsModalLoaded) {
      await import("./entity-details-modal-P9GLtvZm.js");
      this._entityDetailsModalLoaded = true;
    }
  }
  /**
   * Lazy load the delete SQL modal component
   */
  async _loadDeleteSqlModal() {
    if (!this._deleteSqlModalLoaded) {
      await import("./delete-sql-modal-CfpoFSMj.js");
      this._deleteSqlModalLoaded = true;
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("entities")) {
      this._lastFilterKey = "";
      this._cachedFilteredEntities = [];
    }
    if (changedProperties.has("hass") && !this.hass) {
      console.warn("StorageOverviewView: hass connection became unavailable");
    }
  }
  /**
   * Get entities that are eligible for deletion (deleted entities only)
   */
  get selectableEntities() {
    return this.filteredEntities.filter(
      (entity) => !entity.in_entity_registry && !entity.in_state_machine && (entity.in_states_meta || entity.in_statistics_meta)
    );
  }
  /**
   * Get Set of selectable entity IDs for efficient lookups
   */
  get selectableEntityIds() {
    return new Set(this.selectableEntities.map((e2) => e2.entity_id));
  }
  get filteredEntities() {
    const filterKey = `${this.searchQuery}|${this.basicFilter}|${this.registryFilter}|${this.stateFilter}|${this.advancedFilter}|${this.sortStack.map((s) => `${s.column}:${s.direction}`).join(",")}`;
    if (filterKey === this._lastFilterKey && this._cachedFilteredEntities.length > 0) {
      return this._cachedFilteredEntities;
    }
    let filtered = [...this.entities];
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((e2) => e2.entity_id.toLowerCase().includes(query));
    }
    if (this.basicFilter === "in_registry") {
      filtered = filtered.filter((e2) => e2.in_entity_registry);
    } else if (this.basicFilter === "in_state") {
      filtered = filtered.filter((e2) => e2.in_state_machine);
    } else if (this.basicFilter === "deleted") {
      filtered = filtered.filter((e2) => !e2.in_entity_registry && !e2.in_state_machine);
    }
    if (this.registryFilter) {
      filtered = filtered.filter((e2) => e2.registry_status === this.registryFilter);
    }
    if (this.stateFilter) {
      filtered = filtered.filter((e2) => e2.state_status === this.stateFilter);
    }
    if (this.advancedFilter === "only_states") {
      filtered = filtered.filter((e2) => e2.in_states && !e2.in_statistics_meta);
    } else if (this.advancedFilter === "only_stats") {
      filtered = filtered.filter((e2) => e2.in_statistics_meta && !e2.in_states);
    }
    this._lastFilterKey = filterKey;
    this._cachedFilteredEntities = this.sortEntities(filtered);
    return this._cachedFilteredEntities;
  }
  sortEntities(entities) {
    return [...entities].sort((a, b) => {
      for (const { column, direction } of this.sortStack) {
        let result = 0;
        switch (column) {
          case "entity_id":
            result = a.entity_id.localeCompare(b.entity_id);
            break;
          case "registry":
          case "registry_status":
            result = a.registry_status.localeCompare(b.registry_status);
            break;
          case "state":
          case "state_status":
            result = a.state_status.localeCompare(b.state_status);
            break;
          case "states_count":
          case "stats_short_count":
          case "stats_long_count":
            result = a[column] - b[column];
            break;
          case "update_interval":
            const aInterval = a.update_interval_seconds ?? 999999;
            const bInterval = b.update_interval_seconds ?? 999999;
            result = aInterval - bInterval;
            break;
          case "last_state_update":
          case "last_stats_update":
            const aTime = a[column] ? new Date(a[column]).getTime() : 0;
            const bTime = b[column] ? new Date(b[column]).getTime() : 0;
            result = aTime - bTime;
            break;
          default:
            const aVal = a[column] ? 1 : 0;
            const bVal = b[column] ? 1 : 0;
            result = aVal - bVal;
        }
        if (direction === "desc") result = -result;
        if (result !== 0) return result;
      }
      return 0;
    });
  }
  getActiveFilterType() {
    if (this.basicFilter) return this.basicFilter;
    if (this.registryFilter) return `registry_${this.registryFilter}`;
    if (this.stateFilter) return `state_${this.stateFilter}`;
    if (this.advancedFilter) return this.advancedFilter;
    return null;
  }
  get tableColumns() {
    return [
      {
        id: "entity_id",
        label: "Entity ID",
        sortable: true,
        render: (entity) => x`
          <span class="entity-id-link" @click=${() => this.handleEntityClick(entity)}>
            ${entity.entity_id}
          </span>
        `
      },
      {
        id: "registry",
        label: "ENTITY\nREGISTRY",
        sortable: true,
        align: "center",
        render: (entity) => {
          if (entity.registry_status === "Enabled") {
            return x`<span class="status-badge status-enabled" title="Enabled">✓</span>`;
          } else if (entity.registry_status === "Disabled") {
            return x`<span class="status-badge status-disabled" title="Disabled">⊘</span>`;
          }
          return x`<span class="status-badge status-not-in-registry" title="Not in Registry">✕</span>`;
        }
      },
      {
        id: "state",
        label: "STATE\nMACHINE",
        sortable: true,
        align: "center",
        render: (entity) => {
          if (entity.state_status === "Available") {
            return x`<span class="status-badge status-available" title="Available">✓</span>`;
          } else if (entity.state_status === "Unavailable") {
            return x`<span class="status-badge status-unavailable" title="Unavailable">⚠</span>`;
          }
          return x`<span class="status-badge status-not-present" title="Not Present">○</span>`;
        }
      },
      {
        id: "states_meta",
        label: "States\nMeta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_states_meta ? "✓" : ""
      },
      {
        id: "states",
        label: "States",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_states ? "✓" : ""
      },
      {
        id: "states_count",
        label: "States #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.states_count)
      },
      {
        id: "update_interval",
        label: "Message\nInterval",
        sortable: true,
        align: "right",
        render: (entity) => entity.update_interval || ""
      },
      {
        id: "last_state_update",
        label: "Last State\nUpdate",
        sortable: true,
        align: "center",
        render: (entity) => entity.last_state_update || ""
      },
      {
        id: "stats_meta",
        label: "Stats\nMeta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_statistics_meta ? "✓" : ""
      },
      {
        id: "stats_short",
        label: "Stats\nShort",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_short_term ? "✓" : ""
      },
      {
        id: "stats_long",
        label: "Stats\nLong",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_long_term ? "✓" : ""
      },
      {
        id: "stats_short_count",
        label: "Short #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_short_count)
      },
      {
        id: "stats_long_count",
        label: "Long #",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_long_count)
      },
      {
        id: "last_stats_update",
        label: "Last Stats\nUpdate",
        sortable: true,
        align: "center",
        render: (entity) => entity.last_stats_update || ""
      },
      {
        id: "actions",
        label: "ACTIONS",
        sortable: false,
        align: "center",
        width: "80px",
        className: "group-border-left",
        render: (entity) => {
          const isDeleted = !entity.in_entity_registry && !entity.in_state_machine && (entity.in_states_meta || entity.in_statistics_meta);
          return x`
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button
                class="info-icon-btn"
                @click=${() => this.handleEntityClick(entity)}
                title="Show details"
                style="background: none; border: none; cursor: pointer; padding: 4px; color: #3288cb;"
              >
                <svg viewBox="0 0 90 90" width="18" height="18" fill="currentColor">
                  <circle cx="45" cy="45" r="45"/>
                  <path d="M54.717 63.299c-.264-.074-.566-.011-.769.164-5.643 5.009-7.288 5.625-7.734 5.657-.056.004-.18-.048-.344-.211-.206-.201-.317-.465-.342-.807-.172-2.383 1.447-9.741 4.812-21.87 2.826-10.143 3.089-12.2 3.041-12.863-.071-.99-.563-1.759-1.46-2.287-.854-.501-2.025-.701-3.477-.596-2.448.177-5.362 1.206-8.661 3.06-.943.531-1.926 1.166-2.92 1.886-2.622 1.9-4.06 4.79-3.848 7.729.017.241.206.446.478.522.273.075.578.005.773-.177 2.602-2.419 4.335-3.902 5.153-4.409.873-.54 1.651-.837 2.315-.885.245-.018.368-.027.397.38.039.541-.047 1.188-.255 1.919-4.927 16.991-7.17 27.343-6.86 31.647.106 1.463.672 2.6 1.684 3.382 1.024.793 2.363 1.137 3.976 1.02 1.757-.127 3.866-.902 6.446-2.369 1.241-.706 2.849-1.847 4.78-3.391 2.277-1.822 3.475-4.366 3.287-6.98-.017-.241-.201-.445-.471-.523z" fill="white"/>
                  <circle cx="50.831" cy="19.591" r="6.171" fill="white"/>
                </svg>
              </button>
              ${isDeleted ? x`
                <button
                  class="secondary-button"
                  @click=${() => this.handleGenerateSql(entity)}
                  title="Generate SQL to delete this entity"
                style="background: none; border: none; cursor: pointer; padding: 4px; color: #f44336;"
                >
<svg width="18" height="18" viewBox="0.045500002801418304 0.04500000178813934 0.45000001788139343 0.4500001072883606" fill="currentColor" style="color: #f44336">
  <path d="M.158.09A.045.045 0 0 1 .203.045h.135A.045.045 0 0 1 .383.09v.045h.09a.022.022 0 1 1 0 .045H.449l-.02.273a.045.045 0 0 1-.045.042H.156A.045.045 0 0 1 .111.453L.092.18H.068a.022.022 0 0 1 0-.045h.09zm.045.045h.135V.09H.202zM.137.18l.019.27h.228L.403.18zm.088.045a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .224.225m.09 0a.02.02 0 0 1 .022.022v.135a.022.022 0 1 1-.045 0V.247A.02.02 0 0 1 .313.225" fill="#f44336"/>
</svg>                </button>
              ` : ""}
            </div>
          `;
        }
      }
    ];
  }
  handleHealthAction(e2) {
    const action = e2.detail.action;
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    switch (action) {
      case "cleanup_deleted":
        this.basicFilter = "deleted";
        break;
      case "investigate_unavailable":
        this.stateFilter = "Unavailable";
        this.basicFilter = "in_state";
        break;
      case "review_disabled":
        this.registryFilter = "Disabled";
        this.basicFilter = "in_registry";
        break;
      case "optimize_storage":
        this.advancedFilter = "only_states";
        break;
    }
  }
  handleSearchChanged(e2) {
    this.searchQuery = e2.detail.query;
  }
  handleClearFilters() {
    this.searchQuery = "";
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
  }
  handleSortChanged(e2) {
    this.sortStack = e2.detail.sortStack;
  }
  handleClearSort() {
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
  }
  async handleEntityClick(entity) {
    try {
      await this._loadEntityDetailsModal();
      this.selectedEntity = entity;
    } catch (err) {
      console.error("Error loading entity details modal:", err);
    }
  }
  handleCloseModal() {
    this.selectedEntity = null;
  }
  handleOpenMoreInfo(e2) {
    try {
      if (!this.hass) {
        console.warn("Cannot open more info: Home Assistant connection not available");
        return;
      }
      const event = new Event("hass-more-info", { bubbles: true, composed: true });
      event.detail = { entityId: e2.detail.entityId };
      this.dispatchEvent(event);
    } catch (err) {
      console.error("Error opening more info dialog:", err);
    }
  }
  handleGenerateSql(entity) {
    try {
      if (!this.hass) {
        console.warn("Cannot generate SQL: Home Assistant connection not available");
        return;
      }
      let origin;
      let count;
      const inStates = entity.in_states_meta;
      const inStatistics = entity.in_statistics_meta;
      if (inStates && inStatistics) {
        origin = "States+Statistics";
        count = entity.states_count + entity.stats_short_count + entity.stats_long_count;
      } else if (inStates) {
        origin = "States";
        count = entity.states_count;
      } else if (inStatistics) {
        if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
          origin = "Both";
        } else if (entity.in_statistics_long_term) {
          origin = "Long-term";
        } else {
          origin = "Short-term";
        }
        count = entity.stats_short_count + entity.stats_long_count;
      } else {
        return;
      }
      const modalData = {
        entityId: entity.entity_id,
        metadataId: entity.metadata_id || 0,
        // Will be looked up by backend for states_meta
        origin,
        status: "deleted",
        count
      };
      this.dispatchEvent(new CustomEvent("generate-sql", {
        detail: {
          entity_id: entity.entity_id,
          in_states_meta: inStates,
          in_statistics_meta: inStatistics,
          metadata_id: entity.metadata_id,
          origin,
          entity: modalData
        },
        bubbles: true,
        composed: true
      }));
    } catch (err) {
      console.error("Error generating SQL:", err);
    }
  }
  // Called by parent when SQL is ready
  async showDeleteModal(data, sql, storageSaved) {
    try {
      await this._loadDeleteSqlModal();
      this.deleteModalData = data;
      this.deleteSql = sql;
      this.deleteStorageSaved = storageSaved;
    } catch (err) {
      console.error("Error loading delete SQL modal:", err);
    }
  }
  handleCloseDeleteModal() {
    this.deleteModalData = null;
    this.deleteSql = "";
    this.deleteStorageSaved = 0;
  }
  /**
   * Handle selection change from table checkbox
   */
  handleSelectionChanged(e2) {
    const { entityId, selected } = e2.detail;
    if (selected) {
      this.selectedEntityIds.add(entityId);
    } else {
      this.selectedEntityIds.delete(entityId);
    }
    this.selectedEntityIds = new Set(this.selectedEntityIds);
  }
  /**
   * Handle select all filtered deleted entities
   */
  handleSelectAll() {
    this.selectedEntityIds = new Set(
      this.selectableEntities.map((e2) => e2.entity_id)
    );
  }
  /**
   * Handle deselect all
   */
  handleDeselectAll() {
    this.selectedEntityIds = /* @__PURE__ */ new Set();
  }
  /**
   * Handle bulk SQL generation for selected entities
   */
  async handleGenerateBulkSql() {
    if (this.selectedEntityIds.size === 0) return;
    try {
      if (!this.hass) {
        console.error("Cannot generate SQL: Home Assistant connection not available");
        return;
      }
      this.isGeneratingBulkSql = true;
      this.bulkSqlTotal = this.selectedEntityIds.size;
      this.bulkSqlProgress = 0;
      const apiService = new ApiService(this.hass);
      const results = {
        entities: [],
        total_storage_saved: 0,
        total_count: 0,
        success_count: 0,
        error_count: 0
      };
      const selectedEntities = this.entities.filter(
        (e2) => this.selectedEntityIds.has(e2.entity_id)
      );
      for (const entity of selectedEntities) {
        this.bulkSqlProgress++;
        try {
          const inStates = entity.in_states_meta;
          const inStatistics = entity.in_statistics_meta;
          let origin;
          let count;
          if (inStates && inStatistics) {
            origin = "States+Statistics";
            count = entity.states_count + entity.stats_short_count + entity.stats_long_count;
          } else if (inStates) {
            origin = "States";
            count = entity.states_count;
          } else if (inStatistics) {
            if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
              origin = "Both";
            } else if (entity.in_statistics_long_term) {
              origin = "Long-term";
            } else {
              origin = "Short-term";
            }
            count = entity.stats_short_count + entity.stats_long_count;
          } else {
            continue;
          }
          const response = await apiService.generateDeleteSql(
            entity.entity_id,
            origin,
            inStates,
            inStatistics
          );
          results.entities.push({
            entity_id: entity.entity_id,
            sql: response.sql,
            storage_saved: response.storage_saved,
            count
          });
          results.total_storage_saved += response.storage_saved;
          results.total_count += count;
          results.success_count++;
        } catch (err) {
          console.error(`Error generating SQL for ${entity.entity_id}:`, err);
          results.entities.push({
            entity_id: entity.entity_id,
            sql: "",
            storage_saved: 0,
            count: 0,
            error: err instanceof Error ? err.message : "Unknown error"
          });
          results.error_count++;
        }
      }
      const combinedSql = results.entities.map((e2) => {
        if (e2.error) {
          return `-- Entity: ${e2.entity_id}
-- ERROR: ${e2.error}
`;
        }
        const storageMB = (e2.storage_saved / (1024 * 1024)).toFixed(2);
        return `-- Entity: ${e2.entity_id} (${e2.count.toLocaleString()} records, ${storageMB} MB saved)
${e2.sql}`;
      }).join("\n\n");
      const modalData = {
        entityId: `${results.success_count} entities`,
        metadataId: 0,
        origin: "Both",
        status: "deleted",
        count: results.total_count
      };
      await this._loadDeleteSqlModal();
      this.deleteModalData = modalData;
      this.deleteSql = combinedSql;
      this.deleteStorageSaved = results.total_storage_saved;
      this.selectedEntityIds = /* @__PURE__ */ new Set();
    } catch (err) {
      console.error("Error in bulk SQL generation:", err);
    } finally {
      this.isGeneratingBulkSql = false;
      this.bulkSqlProgress = 0;
      this.bulkSqlTotal = 0;
    }
  }
  render() {
    const hasActiveFilters = this.searchQuery || this.basicFilter || this.registryFilter || this.stateFilter || this.advancedFilter;
    return x`
      <div class="description">
        Complete overview of all entities across Home Assistant's storage locations.
        Table features horizontal scrolling with sticky first column.
      </div>

      <storage-health-summary
        .summary=${this.summary}
        .entities=${this.entities}
        .databaseSize=${this.databaseSize}
        .activeFilter=${this.getActiveFilterType()}
        @action-clicked=${this.handleHealthAction}
      ></storage-health-summary>

      <h2>Entity Storage Details</h2>
      <filter-bar
        .filters=${[]}
        .showSearch=${true}
        .searchPlaceholder=${"Search entity ID..."}
        .searchValue=${this.searchQuery}
        .showClearButton=${hasActiveFilters}
        @search-changed=${this.handleSearchChanged}
        @clear-filters=${this.handleClearFilters}
      ></filter-bar>

      <div class="clear-sort-container">
        <button class="secondary-button" @click=${this.handleClearSort}>Clear Sort</button>
      </div>

      <entity-table
        .entities=${this.filteredEntities}
        .columns=${this.tableColumns}
        .sortStack=${this.sortStack}
        .stickyFirstColumn=${true}
        .emptyMessage=${"No entities found"}
        .showCheckboxes=${true}
        .selectedIds=${this.selectedEntityIds}
        .selectableEntityIds=${this.selectableEntityIds}
        @sort-changed=${this.handleSortChanged}
        @selection-changed=${this.handleSelectionChanged}
      ></entity-table>

      ${this.selectedEntity ? x`
        <entity-details-modal
          .entity=${this.selectedEntity}
          @close-modal=${this.handleCloseModal}
          @open-more-info=${this.handleOpenMoreInfo}
        ></entity-details-modal>
      ` : ""}

      ${this.deleteModalData ? x`
        <delete-sql-modal
          .data=${this.deleteModalData}
          .sql=${this.deleteSql}
          .storageSaved=${this.deleteStorageSaved}
          @close-modal=${this.handleCloseDeleteModal}
        ></delete-sql-modal>
      ` : ""}

      ${this.selectedEntityIds.size > 0 ? x`
        <selection-panel
          .selectedCount=${this.selectedEntityIds.size}
          .selectableCount=${this.selectableEntities.length}
          .isGenerating=${this.isGeneratingBulkSql}
          .generatingProgress=${this.bulkSqlProgress}
          .generatingTotal=${this.bulkSqlTotal}
          @select-all=${this.handleSelectAll}
          @deselect-all=${this.handleDeselectAll}
          @generate-bulk-sql=${this.handleGenerateBulkSql}
        ></selection-panel>
      ` : ""}
    `;
  }
};
StorageOverviewView.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }

      .clear-sort-container {
        margin-bottom: 8px;
        text-align: right;
      }
    `
];
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "hass", 2);
__decorateClass$1([
  n({ type: Array })
], StorageOverviewView.prototype, "entities", 2);
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "summary", 2);
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "databaseSize", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "searchQuery", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "basicFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "registryFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "stateFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "advancedFilter", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "sortStack", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "selectedEntity", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalData", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteSql", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteStorageSaved", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "selectedEntityIds", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "isGeneratingBulkSql", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "bulkSqlProgress", 2);
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "bulkSqlTotal", 2);
StorageOverviewView = __decorateClass$1([
  t("storage-overview-view")
], StorageOverviewView);
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
let StatisticsOrphanPanel = class extends i$1 {
  constructor() {
    super(...arguments);
    this.loading = false;
    this.loadingSteps = [];
    this.currentStepIndex = 0;
    this.error = null;
    this.databaseSize = null;
    this.storageEntities = [];
    this.storageSummary = null;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.hass) {
      this.apiService = new ApiService(this.hass);
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("hass") && this.hass) {
      this.apiService = new ApiService(this.hass);
      if (this.error?.includes("connection") || this.error?.includes("Connection")) {
        this.error = null;
      }
    }
  }
  initLoadingSteps(steps) {
    this.loadingSteps = steps.map((label, index) => ({
      label,
      status: index === 0 ? "active" : "pending"
    }));
    this.currentStepIndex = 0;
  }
  completeCurrentStep() {
    if (this.currentStepIndex < this.loadingSteps.length) {
      this.loadingSteps[this.currentStepIndex].status = "complete";
      this.currentStepIndex++;
      if (this.currentStepIndex < this.loadingSteps.length) {
        this.loadingSteps[this.currentStepIndex].status = "active";
      }
      this.requestUpdate();
    }
  }
  async loadStorageOverviewData() {
    this.loading = true;
    this.error = null;
    this.initLoadingSteps([
      "Initializing",
      "Scanning states_meta table",
      "Scanning states table",
      "Scanning statistics_meta table",
      "Scanning statistics_short_term table",
      "Scanning statistics (long-term) table",
      "Reading entity registry and state machine",
      "Calculating storage for deleted entities",
      "Finalizing and generating summary"
    ]);
    try {
      if (!this.hass) {
        throw new Error("Home Assistant connection not available. Please reload the page.");
      }
      for (let step = 0; step <= 8; step++) {
        const result = await this.apiService.fetchEntityStorageOverviewStep(step);
        if (step === 8) {
          this.storageEntities = result.entities;
          this.storageSummary = result.summary;
        }
        if (step < 8) {
          this.completeCurrentStep();
        }
      }
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.error = null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error loading storage overview data:", err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }
  handleRefresh() {
    this.loadStorageOverviewData();
  }
  handleRetry() {
    this.error = null;
    this.loadStorageOverviewData();
  }
  async handleGenerateSql(e2) {
    const { entity_id, in_states_meta, in_statistics_meta, origin, entity } = e2.detail;
    this.loading = true;
    try {
      if (!this.hass) {
        throw new Error("Home Assistant connection not available. Please reload the page.");
      }
      const result = await this.apiService.generateDeleteSql(
        entity_id,
        origin,
        in_states_meta,
        in_statistics_meta
      );
      const modalData = {
        entityId: entity.entityId || entity.entity_id || entity_id,
        metadataId: entity.metadata_id || 0,
        origin,
        status: entity.status || "deleted",
        count: entity.count
      };
      if (this.storageView) {
        await this.storageView.showDeleteModal(modalData, result.sql, result.storage_saved);
      }
      this.error = null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Failed to generate SQL";
      console.error("Error generating SQL:", err);
    } finally {
      this.loading = false;
    }
  }
  render() {
    return x`
      <div class="header">
        <h1>Statistics Orphan Finder</h1>
        <button class="refresh-button" @click=${this.handleRefresh}>
          ↻ Refresh
        </button>
      </div>

      ${this.error ? x`
        <div class="error-message">
          <div>
            <strong>Error:</strong> ${this.error}
          </div>
          <button
            class="secondary-button"
            @click=${this.handleRetry}
            style="margin-top: 12px;"
          >
            Retry
          </button>
        </div>
      ` : ""}

      <storage-overview-view
        .hass=${this.hass}
        .entities=${this.storageEntities}
        .summary=${this.storageSummary}
        .databaseSize=${this.databaseSize}
        @generate-sql=${this.handleGenerateSql}
      ></storage-overview-view>

      ${this.loading ? x`
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-title">Refreshing data</div>

            <div class="loading-spinner"></div>

            ${this.loadingSteps.length > 0 ? x`
              <div class="loading-step-counter">
                Step ${this.currentStepIndex + 1} of ${this.loadingSteps.length}
              </div>

              <div class="loading-step-description">
                ${this.loadingSteps[this.currentStepIndex]?.label || ""}
              </div>
            ` : ""}
          </div>
        </div>
      ` : ""}
    `;
  }
};
StatisticsOrphanPanel.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
        padding: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-content {
        background: var(--card-background-color);
        padding: 32px;
        border-radius: 8px;
        min-width: 400px;
        max-width: 500px;
      }

      .loading-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 32px;
        text-align: center;
        color: var(--primary-text-color);
      }

      .loading-spinner {
        display: block;
        margin: 0 auto 24px;
      }

      .loading-step-counter {
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }

      .loading-step-description {
        text-align: center;
        font-size: 15px;
        color: var(--primary-text-color);
        min-height: 20px;
      }

      .error-message {
        background: rgba(244, 67, 54, 0.1);
        border-left: 4px solid var(--error-color, #F44336);
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
        color: var(--error-color, #F44336);
      }

      .refresh-button {
        margin-left: 16px;
      }
    `
];
__decorateClass([
  n({ type: Object })
], StatisticsOrphanPanel.prototype, "hass", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "loading", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "loadingSteps", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "currentStepIndex", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "error", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "databaseSize", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "storageEntities", 2);
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "storageSummary", 2);
__decorateClass([
  e("storage-overview-view")
], StatisticsOrphanPanel.prototype, "storageView", 2);
StatisticsOrphanPanel = __decorateClass([
  t("statistics-orphan-panel")
], StatisticsOrphanPanel);
export {
  StatisticsOrphanPanel as S,
  formatDuration as a,
  formatBytes as b,
  copyToClipboard as c,
  formatNumber as f,
  sharedStyles as s
};
//# sourceMappingURL=statistics-orphan-panel-Fl1SkBRg.js.map
