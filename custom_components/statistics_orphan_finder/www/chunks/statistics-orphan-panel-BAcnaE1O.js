import { i, a as i$1, x, n, r, e } from "./lit-core-eQjJmNqs.js";
const sharedStyles = i`
  /* ========================================
   * DESIGN SYSTEM TOKENS
   * Modern & Approachable Aesthetic
   * ======================================== */

  /* Typography Scale */
  :host {
    /* Font Families */
    --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;
    --font-family-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;

    /* Font Sizes */
    --font-size-display: 28px;
    --font-size-heading: 18px;
    --font-size-body: 15px;
    --font-size-small: 13px;
    --font-size-micro: 11px;

    /* Font Weights */
    --font-weight-display: 600;
    --font-weight-heading: 600;
    --font-weight-body: 400;
    --font-weight-small: 500;
    --font-weight-micro: 600;

    /* Line Heights */
    --line-height-display: 1.3;
    --line-height-heading: 1.4;
    --line-height-body: 1.6;
    --line-height-small: 1.5;
    --line-height-micro: 1.4;

    /* Letter Spacing */
    --letter-spacing-micro: 0.3px;

    /* Spacing Scale (8px rhythm) */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    --spacing-2xl: 32px;
    --spacing-3xl: 48px;

    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --radius-full: 9999px;

    /* Shadows (layered, modern) */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.10), 0 10px 10px rgba(0, 0, 0, 0.04);
    --shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08);
    --shadow-active: 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

    /* Motion & Transitions */
    --ease-out-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --ease-in-smooth: cubic-bezier(0.55, 0.085, 0.68, 0.53);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 350ms;

    /* Color Gradients (theme-aware with color-mix) */
    --gradient-card: linear-gradient(145deg,
      var(--card-background-color) 0%,
      color-mix(in srgb, var(--card-background-color) 95%, var(--primary-color) 5%) 100%);
    --gradient-hover: linear-gradient(145deg,
      var(--card-background-color) 0%,
      color-mix(in srgb, var(--card-background-color) 90%, var(--primary-color) 10%) 100%);
    --gradient-active: linear-gradient(135deg,
      color-mix(in srgb, var(--primary-color) 15%, transparent) 0%,
      color-mix(in srgb, var(--primary-color) 25%, transparent) 100%);
  }

  /* Base styles */
  :host {
    display: block;
    font-family: var(--font-family-base);
    color: var(--primary-text-color);
  }

  /* Cards and containers */
  .card {
    background: var(--gradient-card);
    border-radius: var(--radius-md, 10px);
    padding: var(--spacing-lg, 16px);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-normal, 250ms) var(--ease-out-smooth);
  }

  .card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-1px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg, 16px);
    padding-bottom: var(--spacing-lg, 16px);
    border-bottom: 1px solid var(--divider-color);
  }

  /* Typography */
  h1 {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: var(--font-size-display, 28px);
    font-weight: var(--font-weight-display, 600);
    line-height: var(--line-height-display, 1.3);
    color: var(--primary-text-color);
    letter-spacing: -0.02em;
  }

  h2 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: var(--font-size-heading, 18px);
    font-weight: var(--font-weight-heading, 600);
    line-height: var(--line-height-heading, 1.4);
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-micro, 0.3px);
  }

  /* Buttons */
  button {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: var(--radius-sm, 6px);
    padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
    font-size: var(--font-size-body, 15px);
    font-weight: var(--font-weight-small, 500);
    cursor: pointer;
    transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
    box-shadow: var(--shadow-sm);
  }

  button:hover {
    background: var(--dark-primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  button:active {
    box-shadow: var(--shadow-active);
    transform: translateY(0);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    box-shadow: none;
    border: 1.5px solid var(--divider-color);
  }

  .secondary-button:hover {
    background: var(--gradient-hover);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  /* Table styles */
  .table-container {
    background: var(--gradient-card);
    border-radius: var(--radius-md, 10px);
    box-shadow: var(--shadow-sm);
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
    background: linear-gradient(180deg,
      var(--table-header-background-color, var(--secondary-background-color)) 0%,
      color-mix(in srgb, var(--table-header-background-color, var(--secondary-background-color)) 95%, var(--primary-color) 5%) 100%
    );
    color: var(--primary-text-color);
    padding: var(--spacing-md, 12px) var(--spacing-md, 12px);
    text-align: left;
    font-weight: var(--font-weight-micro, 600);
    font-size: var(--font-size-micro, 11px);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-micro, 0.3px);
    position: sticky;
    top: 0;
    z-index: 2;
    border-bottom: 2px solid var(--divider-color);
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background var(--duration-fast, 150ms) var(--ease-out-smooth);
  }

  th.sortable:hover {
    background: color-mix(in srgb, var(--divider-color) 80%, var(--primary-color) 20%);
  }

  td {
    padding: var(--spacing-md, 12px) var(--spacing-md, 12px);
    border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
    font-size: var(--font-size-body, 15px);
    line-height: var(--line-height-body, 1.6);
    transition: background var(--duration-fast, 150ms) var(--ease-out-smooth);
  }

  tr:hover td {
    background: color-mix(in srgb, var(--card-background-color) 95%, var(--primary-color) 5%);
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

  /* Status badges - Soft, approachable styling */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-xs, 4px) var(--spacing-md, 10px);
    border-radius: var(--radius-sm, 6px);
    font-size: var(--font-size-small, 13px);
    font-weight: var(--font-weight-small, 500);
  }

  .status-enabled,
  .status-available {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.25));
    color: color-mix(in srgb, var(--success-color, #4CAF50) 85%, #000 15%);
    border: 1px solid rgba(76, 175, 80, 0.3);
  }

  .status-disabled,
  .status-unavailable {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.25));
    color: color-mix(in srgb, var(--warning-color, #FF9800) 85%, #000 15%);
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  .status-deleted,
  .status-not-in-registry,
  .status-not-present {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(244, 67, 54, 0.25));
    color: color-mix(in srgb, var(--error-color, #F44336) 85%, #000 15%);
    border: 1px solid rgba(244, 67, 54, 0.3);
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

  /* Small spinner variant for inline button use */
  .loading-spinner-sm {
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
    to { transform: rotate(360deg); }
  }

  /* Empty state - Enhanced with better hierarchy */
  .empty-state {
    text-align: center;
    padding: var(--spacing-3xl, 48px) var(--spacing-xl, 24px);
    color: var(--secondary-text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg, 16px);
  }

  .empty-state-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-md, 12px);
    opacity: 0.4;
    filter: grayscale(0.3);
  }

  .empty-state-icon svg {
    width: 64px;
    height: 64px;
    stroke: var(--secondary-text-color);
    opacity: 0.5;
  }

  .empty-state-title {
    font-size: var(--font-size-heading, 18px);
    font-weight: var(--font-weight-heading, 600);
    color: var(--primary-text-color);
    margin: 0;
  }

  .empty-state-description {
    font-size: var(--font-size-body, 15px);
    line-height: var(--line-height-body, 1.6);
    max-width: 400px;
    margin: 0;
    color: var(--secondary-text-color);
  }

  /* Summary grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stats-card {
    background: var(--gradient-card);
    padding: var(--spacing-lg, 16px) var(--spacing-2xl, 32px);
    border-radius: var(--radius-lg, 14px);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-normal, 250ms) var(--ease-out-smooth);
    border: 1px solid color-mix(in srgb, var(--divider-color) 30%, transparent);
  }

  .stats-card.clickable {
    cursor: pointer;
  }

  .stats-card.clickable:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px) scale(1.01);
  }

  .stats-card.active {
    background: var(--gradient-active);
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  .stats-value {
    font-size: 32px;
    font-weight: 200;
    color: var(--primary-text-color);
    margin: var(--spacing-sm, 8px) 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .stats-subtitle {
    font-size: var(--font-size-small, 13px);
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
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border: 1.5px solid var(--divider-color);
    padding: var(--spacing-sm, 8px) var(--spacing-lg, 16px);
    border-radius: var(--radius-xl, 20px);
    font-size: var(--font-size-small, 13px);
    font-weight: var(--font-weight-small, 500);
    cursor: pointer;
    transition: all var(--duration-normal, 250ms) var(--ease-out-smooth);
  }

  .filter-button:hover {
    background: var(--gradient-hover);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .filter-button.active {
    background: var(--gradient-active);
    border-color: var(--primary-color);
    color: var(--primary-color);
    font-weight: 600;
  }

  /* Search box */
  .search-box {
    flex: 1;
    min-width: 200px;
  }

  input[type="search"],
  input[type="text"] {
    width: 100%;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
    border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
    border-radius: var(--radius-md, 10px);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: var(--font-size-body, 15px);
    font-family: var(--font-family-base);
    transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent);
  }

  /* Modals - Enhanced with backdrop blur */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn var(--duration-normal, 250ms) var(--ease-out-smooth);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--card-background-color);
    border-radius: var(--radius-lg, 14px);
    box-shadow: var(--shadow-xl);
    border: 1px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
    max-width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp var(--duration-slow, 350ms) var(--ease-out-smooth);
  }

  @keyframes slideUp {
    from {
      transform: translateY(40px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    padding: var(--spacing-2xl, 32px);
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: var(--spacing-2xl, 32px);
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: var(--spacing-xl, 24px) var(--spacing-2xl, 32px);
    border-top: 1px solid var(--divider-color);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm, 8px);
  }

  .modal-close {
    background: transparent;
    border: none;
    border-radius: var(--radius-full, 9999px);
    font-size: 24px;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
  }

  .modal-close:hover {
    background: color-mix(in srgb, var(--divider-color) 30%, transparent);
    color: var(--primary-text-color);
    transform: scale(1.1);
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
   * Extract structured error information from API response
   * Backend returns: { error: string, error_category?: string }
   */
  extractErrorInfo(err) {
    if (err && typeof err === "object") {
      const message2 = err.error || err.message || "Unknown error";
      const category = err.error_category;
      return { message: message2, category };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { message };
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
   * Fetch entity storage overview step by step (progressive loading)
   * Step 0 initializes and returns session_id
   * Steps 1-8 require session_id parameter
   */
  async fetchEntityStorageOverviewStep(step, sessionId) {
    this.validateConnection();
    if (step < 0 || step > 8) {
      throw new Error(`Invalid step: ${step}. Must be between 0-8.`);
    }
    if (step > 0 && !sessionId) {
      throw new Error(`session_id is required for step ${step}`);
    }
    try {
      let url = `${API_BASE}?action=entity_storage_overview_step&step=${step}`;
      if (sessionId) {
        url += `&session_id=${encodeURIComponent(sessionId)}`;
      }
      return await this.hass.callApi("GET", url);
    } catch (err) {
      throw new Error(
        `Failed to fetch overview step ${step}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
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
   * Fetch hourly message histogram for an entity
   */
  async fetchMessageHistogram(entityId, hours) {
    this.validateConnection();
    if (![24, 48, 168].includes(hours)) {
      throw new Error(`Invalid hours parameter: ${hours}. Must be 24, 48, or 168.`);
    }
    try {
      const url = `${API_BASE}?action=entity_message_histogram&entity_id=${encodeURIComponent(entityId)}&hours=${hours}`;
      return await this.hass.callApi("GET", url);
    } catch (err) {
      throw new Error(`Failed to fetch message histogram: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
}
const CACHE_KEY = "statistics_orphan_finder_cache";
const CACHE_VERSION = 1;
class CacheService {
  /**
   * Save data to localStorage cache
   */
  static saveCache(databaseSize, storageEntities, storageSummary) {
    try {
      const cacheData = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        data: {
          databaseSize,
          storageEntities,
          storageSummary
        }
      };
      const serialized = JSON.stringify(cacheData);
      localStorage.setItem(CACHE_KEY, serialized);
      console.debug("[CacheService] Data cached successfully", {
        timestamp: new Date(cacheData.timestamp).toISOString(),
        entities: storageEntities.length
      });
      return true;
    } catch (error) {
      console.debug("[CacheService] Failed to save cache:", error);
      return false;
    }
  }
  /**
   * Load data from localStorage cache
   * Returns null if cache doesn't exist, is invalid, or version mismatch
   */
  static loadCache() {
    try {
      const serialized = localStorage.getItem(CACHE_KEY);
      if (!serialized) {
        console.debug("[CacheService] No cache found");
        return null;
      }
      const parsed = JSON.parse(serialized);
      if (!parsed || typeof parsed.version !== "number" || typeof parsed.timestamp !== "number" || !parsed.data) {
        console.debug("[CacheService] Invalid cache structure, clearing");
        this.clearCache();
        return null;
      }
      if (parsed.version !== CACHE_VERSION) {
        console.debug(
          `[CacheService] Cache version mismatch (${parsed.version} !== ${CACHE_VERSION}), clearing`
        );
        this.clearCache();
        return null;
      }
      if (!Array.isArray(parsed.data.storageEntities) || parsed.data.databaseSize !== null && typeof parsed.data.databaseSize !== "object" || parsed.data.storageSummary !== null && typeof parsed.data.storageSummary !== "object") {
        console.debug("[CacheService] Invalid data structure in cache, clearing");
        this.clearCache();
        return null;
      }
      console.debug("[CacheService] Cache loaded successfully", {
        timestamp: new Date(parsed.timestamp).toISOString(),
        age: this.formatAge(this.getCacheAge(parsed)),
        entities: parsed.data.storageEntities.length
      });
      return parsed;
    } catch (error) {
      console.debug("[CacheService] Failed to load cache:", error);
      this.clearCache();
      return null;
    }
  }
  /**
   * Clear the cache
   */
  static clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.debug("[CacheService] Cache cleared");
    } catch (error) {
      console.debug("[CacheService] Failed to clear cache:", error);
    }
  }
  /**
   * Get cache age in milliseconds
   * Returns null if no cache exists
   */
  static getCacheAge(cache = null) {
    try {
      const cachedData = cache || this.loadCache();
      if (!cachedData) {
        return null;
      }
      return Date.now() - cachedData.timestamp;
    } catch {
      return null;
    }
  }
  /**
   * Check if cache is stale (older than maxAge milliseconds)
   */
  static isCacheStale(maxAgeMs, cache = null) {
    const age = this.getCacheAge(cache);
    if (age === null) {
      return true;
    }
    return age > maxAgeMs;
  }
  /**
   * Format cache age as human-readable string
   */
  static formatAge(ageMs) {
    if (ageMs === null) {
      return "unknown";
    }
    const seconds = Math.floor(ageMs / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else {
      return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
    }
  }
  /**
   * Get cache metadata (without full data)
   */
  static getCacheMetadata() {
    try {
      const cache = this.loadCache();
      if (!cache) {
        return null;
      }
      const age = this.getCacheAge(cache);
      return {
        timestamp: cache.timestamp,
        age: age || 0,
        ageFormatted: this.formatAge(age)
      };
    } catch {
      return null;
    }
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
function formatInterval(seconds) {
  if (seconds === null || seconds === 0) {
    return "";
  }
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = seconds / 60;
    return minutes >= 10 ? `${minutes.toFixed(1)}min` : `${minutes.toFixed(2)}min`;
  } else {
    const hours = seconds / 3600;
    return hours >= 10 ? `${hours.toFixed(1)}h` : `${hours.toFixed(2)}h`;
  }
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
function formatRelativeTime(isoString) {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1e3);
    if (diffSeconds < 60) {
      return `${diffSeconds}s`;
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays}d`;
    }
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths}mo`;
    }
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y`;
  } catch {
    return "-";
  }
}
function formatFullTimestamp(isoString) {
  if (!isoString) return "Never updated";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}
const _EntityFilterService = class _EntityFilterService {
  /**
   * Generate cache key from filter parameters and sort stack
   */
  static generateFilterKey(filters, sortStack) {
    return `${filters.searchQuery}|${filters.basicFilter}|${filters.registryFilter}|${filters.stateFilter}|${filters.advancedFilter}|${filters.statesFilter}|${filters.statisticsFilter}|${sortStack.map((s) => `${s.column}:${s.direction}`).join(",")}`;
  }
  /**
   * Main entry point: Filter and sort entities with memoization
   */
  static filterAndSort(entities, filters, sortStack) {
    const cacheKey = this.generateFilterKey(filters, sortStack);
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }
    let filtered = [...entities];
    filtered = this.applySearchFilter(filtered, filters.searchQuery);
    filtered = this.applyBasicFilter(filtered, filters.basicFilter);
    filtered = this.applyRegistryFilter(filtered, filters.registryFilter);
    filtered = this.applyStateFilter(filtered, filters.stateFilter);
    filtered = this.applyAdvancedFilter(filtered, filters.advancedFilter);
    filtered = this.applyStatesFilter(filtered, filters.statesFilter);
    filtered = this.applyStatisticsFilter(filtered, filters.statisticsFilter);
    const result = this.sortEntities(filtered, sortStack);
    this._cache.set(cacheKey, result);
    return result;
  }
  /**
   * Apply search query filter (entity_id contains query)
   */
  static applySearchFilter(entities, query) {
    if (!query) return entities;
    const lowerQuery = query.toLowerCase();
    return entities.filter((e2) => e2.entity_id.toLowerCase().includes(lowerQuery));
  }
  /**
   * Apply basic filter (in_registry, in_state, deleted, numeric_sensors_no_stats)
   */
  static applyBasicFilter(entities, filter) {
    if (!filter) return entities;
    switch (filter) {
      case "in_registry":
        return entities.filter((e2) => e2.in_entity_registry);
      case "in_state":
        return entities.filter((e2) => e2.in_state_machine);
      case "deleted":
        return entities.filter((e2) => !e2.in_entity_registry && !e2.in_state_machine);
      case "numeric_sensors_no_stats":
        return entities.filter(
          (e2) => e2.entity_id.startsWith("sensor.") && e2.in_states_meta && !e2.in_statistics_meta && e2.statistics_eligibility_reason && !e2.statistics_eligibility_reason.includes("is not numeric")
        );
      default:
        return entities;
    }
  }
  /**
   * Apply registry status filter (Enabled, Disabled)
   */
  static applyRegistryFilter(entities, filter) {
    if (!filter) return entities;
    return entities.filter((e2) => e2.registry_status === filter);
  }
  /**
   * Apply state status filter (Available, Unavailable)
   */
  static applyStateFilter(entities, filter) {
    if (!filter) return entities;
    return entities.filter((e2) => e2.state_status === filter);
  }
  /**
   * Apply advanced filter (only_states, only_stats)
   */
  static applyAdvancedFilter(entities, filter) {
    if (!filter) return entities;
    switch (filter) {
      case "only_states":
        return entities.filter((e2) => e2.in_states && !e2.in_statistics_meta);
      case "only_stats":
        return entities.filter((e2) => e2.in_statistics_meta && !e2.in_states);
      default:
        return entities;
    }
  }
  /**
   * Apply states table filter (in_states, not_in_states)
   */
  static applyStatesFilter(entities, filter) {
    if (!filter) return entities;
    switch (filter) {
      case "in_states":
        return entities.filter((e2) => e2.in_states);
      case "not_in_states":
        return entities.filter((e2) => !e2.in_states);
      default:
        return entities;
    }
  }
  /**
   * Apply statistics table filter (in_statistics, not_in_statistics)
   */
  static applyStatisticsFilter(entities, filter) {
    if (!filter) return entities;
    switch (filter) {
      case "in_statistics":
        return entities.filter((e2) => e2.in_statistics_meta);
      case "not_in_statistics":
        return entities.filter((e2) => !e2.in_statistics_meta);
      default:
        return entities;
    }
  }
  /**
   * Sort entities by sort stack (multi-column sorting)
   */
  static sortEntities(entities, sortStack) {
    return [...entities].sort((a, b) => {
      for (const { column, direction } of sortStack) {
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
  /**
   * Clear memoization cache (useful for testing or memory management)
   */
  static clearCache() {
    this._cache.clear();
  }
};
_EntityFilterService._cache = /* @__PURE__ */ new Map();
let EntityFilterService = _EntityFilterService;
const _EntitySelectionService = class _EntitySelectionService {
  /**
   * Generate cache key from entities array
   * Uses array length and first/last entity IDs for fast cache key generation
   */
  static generateCacheKey(entities) {
    if (!entities || entities.length === 0) return "empty";
    const first = entities[0]?.entity_id || "";
    const last = entities[entities.length - 1]?.entity_id || "";
    return `${entities.length}:${first}:${last}`;
  }
  /**
   * Check if entity has been disabled and has statistics data
   * Note: Disabled entities with statistics are eligible for cleanup
   */
  static isDisabledForAtLeast90Days(entity) {
    try {
      if (!entity || entity.registry_status !== "Disabled") return false;
      return !!(entity.in_states_meta || entity.in_statistics_meta);
    } catch (err) {
      console.warn("[EntitySelectionService] Error in isDisabledForAtLeast90Days:", entity?.entity_id, err);
      return false;
    }
  }
  /**
   * Get entity selection type for UI differentiation
   */
  static getEntitySelectionType(entity) {
    const hasData = entity.in_states_meta || entity.in_statistics_meta;
    if (!hasData) return "not-selectable";
    if (!entity.in_entity_registry && !entity.in_state_machine) {
      return "deleted";
    }
    if (this.isDisabledForAtLeast90Days(entity)) {
      return "disabled";
    }
    return "not-selectable";
  }
  /**
   * Check if entity has data that can be deleted
   */
  static hasDataToDelete(entity) {
    return !!(entity.in_states_meta || entity.in_statistics_meta);
  }
  /**
   * Filter entities that are eligible for deletion
   * Includes both deleted entities and disabled entities with data
   */
  static getSelectableEntities(entities) {
    return entities.filter((entity) => {
      const hasData = this.hasDataToDelete(entity);
      if (!hasData) return false;
      const isDeleted = !entity.in_entity_registry && !entity.in_state_machine;
      const isDisabledLongEnough = this.isDisabledForAtLeast90Days(entity);
      return isDeleted || isDisabledLongEnough;
    });
  }
  /**
   * Get Set of selectable entity IDs for efficient lookup
   */
  static getSelectableEntityIds(entities) {
    return new Set(this.getSelectableEntities(entities).map((e2) => e2.entity_id));
  }
  /**
   * Get Set of disabled entity IDs (for visual differentiation)
   */
  static getDisabledEntityIds(entities) {
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      return /* @__PURE__ */ new Set();
    }
    const cacheKey = this.generateCacheKey(entities);
    if (this._disabledIdsCache.has(cacheKey)) {
      return this._disabledIdsCache.get(cacheKey);
    }
    try {
      const result = new Set(
        entities.filter((e2) => e2 && this.isDisabledForAtLeast90Days(e2)).map((e2) => e2.entity_id)
      );
      this._disabledIdsCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn("[EntitySelectionService] Error computing disabledEntityIds:", err);
      return /* @__PURE__ */ new Set();
    }
  }
  /**
   * Get breakdown of selected entities by type (deleted vs disabled)
   */
  static getSelectionBreakdown(selectedEntityIds, allEntities) {
    const deleted = [];
    const disabled = [];
    selectedEntityIds.forEach((entityId) => {
      const entity = allEntities.find((e2) => e2.entity_id === entityId);
      if (!entity) return;
      const type = this.getEntitySelectionType(entity);
      if (type === "deleted") deleted.push(entity);
      if (type === "disabled") disabled.push(entity);
    });
    return { deleted, disabled };
  }
  /**
   * Format how long ago statistics were last updated for a disabled entity
   * This gives users context about data staleness
   */
  static formatDisabledDuration(entity) {
    if (!entity.last_stats_update) return "unknown duration";
    const lastUpdate = new Date(entity.last_stats_update).getTime();
    const ageMs = Date.now() - lastUpdate;
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1e3));
    if (days < 1) return "stats updated today";
    if (days === 1) return "stats 1 day old";
    if (days < 30) return `stats ${days} days old`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? "stats 1 month old" : `stats ${months} months old`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor(days % 365 / 30);
    if (remainingMonths === 0) {
      return years === 1 ? "stats 1 year old" : `stats ${years} years old`;
    }
    return `stats ${years} year${years === 1 ? "" : "s"}, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"} old`;
  }
};
_EntitySelectionService._disabledIdsCache = /* @__PURE__ */ new Map();
let EntitySelectionService = _EntitySelectionService;
class ModalOrchestrationService {
  constructor(hass) {
    this.apiService = new ApiService(hass);
  }
  /**
   * Determine origin and count for an entity based on which tables it's in
   */
  determineEntityOriginAndCount(entity) {
    const inStates = entity.in_states_meta;
    const inStatistics = entity.in_statistics_meta;
    if (inStates && inStatistics) {
      return {
        origin: "States+Statistics",
        count: entity.states_count + entity.stats_short_count + entity.stats_long_count
      };
    } else if (inStates) {
      return {
        origin: "States",
        count: entity.states_count
      };
    } else if (inStatistics) {
      let origin;
      if (entity.in_statistics_long_term && entity.in_statistics_short_term) {
        origin = "Both";
      } else if (entity.in_statistics_long_term) {
        origin = "Long-term";
      } else {
        origin = "Short-term";
      }
      return {
        origin,
        count: entity.stats_short_count + entity.stats_long_count
      };
    }
    return null;
  }
  /**
   * Generate SQL for a single entity
   * Returns SQL string, storage saved, and modal data
   */
  async generateSingleEntitySql(entity) {
    const result = this.determineEntityOriginAndCount(entity);
    if (!result) {
      throw new Error(`Entity ${entity.entity_id} is not in any table`);
    }
    const { origin, count } = result;
    const inStates = entity.in_states_meta;
    const inStatistics = entity.in_statistics_meta;
    const response = await this.apiService.generateDeleteSql(
      entity.entity_id,
      origin,
      inStates,
      inStatistics
    );
    const modalData = {
      entityId: entity.entity_id,
      metadataId: entity.metadata_id || 0,
      origin,
      status: "deleted",
      // We're deleting statistics for both deleted and disabled entities
      count
    };
    return {
      sql: response.sql,
      storage_saved: response.storage_saved,
      modalData
    };
  }
  /**
   * Generate bulk SQL for multiple entities with progress tracking
   * Calls progressCallback with (current, total) after each entity
   */
  async generateBulkSql(entities, progressCallback) {
    const resultsBuilder = {
      entities: [],
      total_storage_saved: 0,
      total_count: 0,
      success_count: 0,
      error_count: 0
    };
    for (let i2 = 0; i2 < entities.length; i2++) {
      const entity = entities[i2];
      if (progressCallback) {
        progressCallback(i2 + 1, entities.length);
      }
      try {
        const result = this.determineEntityOriginAndCount(entity);
        if (!result) {
          resultsBuilder.entities.push({
            entity_id: entity.entity_id,
            sql: "",
            storage_saved: 0,
            count: 0,
            error: "Entity not in any table"
          });
          resultsBuilder.error_count++;
          continue;
        }
        const { origin, count } = result;
        const inStates = entity.in_states_meta;
        const inStatistics = entity.in_statistics_meta;
        const response = await this.apiService.generateDeleteSql(
          entity.entity_id,
          origin,
          inStates,
          inStatistics
        );
        resultsBuilder.entities.push({
          entity_id: entity.entity_id,
          sql: response.sql,
          storage_saved: response.storage_saved,
          count
        });
        resultsBuilder.total_storage_saved += response.storage_saved;
        resultsBuilder.total_count += count;
        resultsBuilder.success_count++;
      } catch (err) {
        console.error(`Error generating SQL for ${entity.entity_id}:`, err);
        resultsBuilder.entities.push({
          entity_id: entity.entity_id,
          sql: "",
          storage_saved: 0,
          count: 0,
          error: err instanceof Error ? err.message : "Unknown error"
        });
        resultsBuilder.error_count++;
      }
    }
    return {
      status: resultsBuilder.error_count > 0 ? "partial" : "success",
      ...resultsBuilder
    };
  }
  /**
   * Format bulk SQL result for display (adds comments and formatting)
   */
  formatSqlForDisplay(result) {
    return result.entities.map((e2) => {
      if (e2.error) {
        return `-- Entity: ${e2.entity_id}
-- ERROR: ${e2.error}
`;
      }
      const storageMB = (e2.storage_saved / (1024 * 1024)).toFixed(2);
      return `-- Entity: ${e2.entity_id} (${e2.count.toLocaleString()} records, ${storageMB} MB saved)
${e2.sql}`;
    }).join("\n\n");
  }
  /**
   * Calculate total storage that would be saved for a list of entities
   */
  calculateTotalStorage(entities) {
    let total = 0;
    for (const entity of entities) {
      total += entity.states_count * 100;
      total += entity.stats_short_count * 50;
      total += entity.stats_long_count * 50;
    }
    return total;
  }
}
var __defProp$9 = Object.defineProperty;
var __decorateClass$9 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$9(target, key, result);
  return result;
};
const _DatabasePieChart = class _DatabasePieChart extends i$1 {
  constructor() {
    super(...arguments);
    this.databaseSize = null;
  }
  drawChart() {
    const canvas = this.shadowRoot?.getElementById("pie-chart");
    if (!canvas || !this.databaseSize) {
      console.warn("[DatabasePieChart] Canvas or database size not available");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[DatabasePieChart] Could not get canvas 2D context");
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
    console.log("[DatabasePieChart] Drawing chart with sizes:", {
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
  render() {
    if (!this.databaseSize) {
      console.warn("[DatabasePieChart] Database size data not available");
      return x`<div class="no-data">Database size information unavailable<br><small>Click Refresh to load data</small></div>`;
    }
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;
    console.log("[DatabasePieChart] Database sizes:", {
      states,
      statsLong,
      statsShort,
      other,
      total
    });
    if (isNaN(total) || !isFinite(total)) {
      console.error("[DatabasePieChart] Invalid database size data (NaN/Infinity)");
      return x`<div class="no-data">Invalid database size data<br><small>Check browser console for details</small></div>`;
    }
    if (total === 0) {
      return x`<div class="no-data">No database data<br><small>Database appears empty</small></div>`;
    }
    const segments = [
      { percent: states / total * 100, color: "#2196F3", label: "States", size: states },
      { percent: statsShort / total * 100, color: "#FF9800", label: "Statistics Short-term", size: statsShort },
      { percent: statsLong / total * 100, color: "#4CAF50", label: "Statistics Long-term", size: statsLong },
      { percent: other / total * 100, color: "#9E9E9E", label: "Other", size: other }
    ].sort((a, b) => b.size - a.size);
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
      <div class="chart-wrapper">
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
_DatabasePieChart.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .chart-title {
        font-size: var(--font-size-heading, 18px);
        font-weight: var(--font-weight-heading, 600);
        margin-bottom: var(--spacing-lg, 16px);
        color: var(--primary-text-color);
      }

      .chart-wrapper {
        display: flex;
        gap: 20px;
        align-items: center;
      }

      #pie-chart {
        width: 220px;
        height: 220px;
        display: block;
        flex-shrink: 0;
      }

      .chart-legend {
        flex: 1;
        min-width: 200px;
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

      .no-data {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
    `
];
let DatabasePieChart = _DatabasePieChart;
__decorateClass$9([
  n({ type: Object })
], DatabasePieChart.prototype, "databaseSize");
if (!customElements.get("database-pie-chart")) {
  customElements.define("database-pie-chart", DatabasePieChart);
}
var __defProp$8 = Object.defineProperty;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$8(target, key, result);
  return result;
};
const _HealthActionList = class _HealthActionList extends i$1 {
  constructor() {
    super(...arguments);
    this.summary = null;
    this.entities = [];
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
  handleActionKey(event, action) {
    if (action && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      this.handleAction(action);
    }
  }
  render() {
    if (!this.summary) {
      return x`<div class="no-issues">Summary data unavailable</div>`;
    }
    const actions = [];
    const deleted = this.summary.deleted_from_registry;
    const unavailableLong = this.getUnavailableLongTerm();
    const disabled = this.summary.registry_disabled;
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
    const sensorsMissingStats = this.entities.filter(
      (e2) => e2.entity_id.startsWith("sensor.") && e2.in_states_meta && !e2.in_statistics_meta && // Exclude non-numeric sensors
      e2.statistics_eligibility_reason && !e2.statistics_eligibility_reason.includes("is not numeric")
    ).length;
    if (sensorsMissingStats > 0) {
      actions.push({
        priority: "warning",
        icon: "⚠️",
        text: `${formatNumber(sensorsMissingStats)} numeric sensors missing statistics`,
        action: "review_numeric_sensors",
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
        <div class="summary-title">Summary</div>
        <div class="no-issues">
          ✓ All systems healthy<br>
          ${formatNumber(active)} active entities
        </div>
      `;
    }
    return x`
      <div class="summary-title">Summary</div>
      <div class="action-list">
        ${actions.map((item) => {
      const isClickable = !!item.action;
      return x`
            <div
              class="action-item ${item.priority} ${isClickable ? "clickable" : ""}"
              role=${isClickable ? "button" : "presentation"}
              tabindex=${isClickable ? "0" : "-1"}
              @click=${isClickable ? () => this.handleAction(item.action) : null}
              @keydown=${isClickable ? (e2) => this.handleActionKey(e2, item.action) : null}
            >
              <span class="action-icon">${item.icon}</span>
              <span class="action-text">${item.text}</span>
              ${item.button ? x`
                <span class="action-btn">${item.button}</span>
              ` : ""}
            </div>
          `;
    })}
      </div>
    `;
  }
};
_HealthActionList.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .summary-title {
        font-size: var(--font-size-heading, 18px);
        font-weight: var(--font-weight-heading, 600);
        margin-bottom: var(--spacing-lg, 16px);
        color: var(--primary-text-color);
      }

      .action-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 12px);
      }

      .action-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md, 12px);
        padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
        background: color-mix(in srgb, var(--secondary-background-color) 30%, transparent);
        border-radius: var(--radius-md, 10px);
        border-left: 4px solid transparent;
        transition: all var(--duration-normal, 250ms) var(--ease-out-smooth);
      }

      .action-item.critical {
        border-left-color: var(--error-color, #F44336);
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.08), rgba(244, 67, 54, 0.12));
      }

      .action-item.warning {
        border-left-color: var(--warning-color, #FF9800);
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.12));
      }

      .action-item.success {
        border-left-color: var(--success-color, #4CAF50);
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.12));
      }

      .action-item.clickable {
        cursor: pointer;
      }

      .action-item.clickable:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }

      .action-item.clickable:active {
        transform: translateY(0);
      }

      .action-item.clickable:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
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
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.2);
        color: inherit;
        border: 1px solid currentColor;
        border-radius: 999px;
        white-space: nowrap;
      }

      .no-issues {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
    `
];
let HealthActionList = _HealthActionList;
__decorateClass$8([
  n({ type: Object })
], HealthActionList.prototype, "summary");
__decorateClass$8([
  n({ type: Array })
], HealthActionList.prototype, "entities");
if (!customElements.get("health-action-list")) {
  customElements.define("health-action-list", HealthActionList);
}
var __defProp$7 = Object.defineProperty;
var __decorateClass$7 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$7(target, key, result);
  return result;
};
const _EntityFilterPanel = class _EntityFilterPanel extends i$1 {
  constructor() {
    super(...arguments);
    this.entities = [];
    this.activeRegistry = null;
    this.activeState = null;
    this.activeStates = null;
    this.activeStatistics = null;
  }
  getFilterCount(group, value) {
    const source = this.entities;
    if (!source || source.length === 0) {
      return 0;
    }
    switch (group) {
      case "registry":
        switch (value) {
          case "Enabled":
            return source.filter((e2) => e2.registry_status === "Enabled").length;
          case "Disabled":
            return source.filter((e2) => e2.registry_status === "Disabled").length;
          case "Not in Registry":
            return source.filter((e2) => e2.registry_status === "Not in Registry").length;
        }
        break;
      case "state":
        switch (value) {
          case "Available":
            return source.filter((e2) => e2.state_status === "Available").length;
          case "Unavailable":
            return source.filter((e2) => e2.state_status === "Unavailable").length;
          case "Not Present":
            return source.filter((e2) => e2.state_status === "Not Present").length;
        }
        break;
      case "states":
        switch (value) {
          case "in_states":
            return source.filter((e2) => e2.in_states).length;
          case "not_in_states":
            return source.filter((e2) => !e2.in_states).length;
        }
        break;
      case "statistics":
        switch (value) {
          case "in_statistics":
            return source.filter((e2) => e2.in_statistics_long_term || e2.in_statistics_short_term).length;
          case "not_in_statistics":
            return source.filter((e2) => !e2.in_statistics_long_term && !e2.in_statistics_short_term).length;
        }
        break;
    }
    return 0;
  }
  isFilterDisabled(group, value) {
    let isActive = false;
    switch (group) {
      case "registry":
        isActive = this.activeRegistry === value;
        break;
      case "state":
        isActive = this.activeState === value;
        break;
      case "states":
        isActive = this.activeStates === value;
        break;
      case "statistics":
        isActive = this.activeStatistics === value;
        break;
    }
    if (isActive) {
      return false;
    }
    return this.getFilterCount(group, value) === 0;
  }
  handleFilterClick(group, value) {
    this.dispatchEvent(new CustomEvent("filter-changed", {
      detail: { group, value },
      bubbles: true,
      composed: true
    }));
  }
  handleFilterReset() {
    this.dispatchEvent(new CustomEvent("filter-reset", {
      bubbles: true,
      composed: true
    }));
  }
  render() {
    return x`
      <div class="filter-panel-header">
        <div class="filter-panel-title">Filters</div>
        <button class="filter-reset-btn" @click=${this.handleFilterReset}>
          Reset
        </button>
      </div>

      <div class="filter-group">
        <div class="filter-group-label">Registry:</div>
        <div class="filter-buttons">
          <button
            class="filter-btn ${this.activeRegistry === "Enabled" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("registry", "Enabled")}
            @click=${() => this.handleFilterClick("registry", "Enabled")}
          >Enabled (${this.getFilterCount("registry", "Enabled")})</button>
          <button
            class="filter-btn ${this.activeRegistry === "Disabled" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("registry", "Disabled")}
            @click=${() => this.handleFilterClick("registry", "Disabled")}
          >Disabled (${this.getFilterCount("registry", "Disabled")})</button>
          <button
            class="filter-btn ${this.activeRegistry === "Not in Registry" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("registry", "Not in Registry")}
            @click=${() => this.handleFilterClick("registry", "Not in Registry")}
          >Not present (${this.getFilterCount("registry", "Not in Registry")})</button>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-group-label">State machine:</div>
        <div class="filter-buttons">
          <button
            class="filter-btn ${this.activeState === "Available" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("state", "Available")}
            @click=${() => this.handleFilterClick("state", "Available")}
          >Available (${this.getFilterCount("state", "Available")})</button>
          <button
            class="filter-btn ${this.activeState === "Unavailable" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("state", "Unavailable")}
            @click=${() => this.handleFilterClick("state", "Unavailable")}
          >Unavailable (${this.getFilterCount("state", "Unavailable")})</button>
          <button
            class="filter-btn ${this.activeState === "Not Present" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("state", "Not Present")}
            @click=${() => this.handleFilterClick("state", "Not Present")}
          >Not present (${this.getFilterCount("state", "Not Present")})</button>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-group-label">States:</div>
        <div class="filter-buttons">
          <button
            class="filter-btn ${this.activeStates === "in_states" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("states", "in_states")}
            @click=${() => this.handleFilterClick("states", "in_states")}
          >In states (${this.getFilterCount("states", "in_states")})</button>
          <button
            class="filter-btn ${this.activeStates === "not_in_states" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("states", "not_in_states")}
            @click=${() => this.handleFilterClick("states", "not_in_states")}
          >Not in states (${this.getFilterCount("states", "not_in_states")})</button>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-group-label">Statistics:</div>
        <div class="filter-buttons">
          <button
            class="filter-btn ${this.activeStatistics === "in_statistics" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("statistics", "in_statistics")}
            @click=${() => this.handleFilterClick("statistics", "in_statistics")}
          >In statistics (${this.getFilterCount("statistics", "in_statistics")})</button>
          <button
            class="filter-btn ${this.activeStatistics === "not_in_statistics" ? "active" : ""}"
            ?disabled=${this.isFilterDisabled("statistics", "not_in_statistics")}
            @click=${() => this.handleFilterClick("statistics", "not_in_statistics")}
          >Not in statistics (${this.getFilterCount("statistics", "not_in_statistics")})</button>
        </div>
      </div>
    `;
  }
};
_EntityFilterPanel.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .filter-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .filter-panel-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .filter-reset-btn {
        background: transparent;
        color: var(--primary-color);
        border: none;
        font-size: 12px;
        padding: 2px 10px;
        border-radius: 999px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .filter-reset-btn:hover {
        background: rgba(50, 136, 203, 0.12);
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .filter-group-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .filter-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .filter-btn {
        padding: 6px 12px;
        font-size: 12px;
        background: var(--secondary-background-color);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-text-color);
        min-width: 60px;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }

      .filter-btn:hover:not(:disabled),
      .filter-btn:focus-visible {
        background: rgba(50, 136, 203, 0.08);
        border-color: rgba(50, 136, 203, 0.3);
        outline: none;
      }

      .filter-btn.active {
        background: linear-gradient(135deg, rgba(50, 136, 203, 0.22), rgba(35, 84, 140, 0.3));
        border-color: rgba(50, 136, 203, 0.8);
        color: var(--text-primary-color, #fff);
        box-shadow: 0 4px 10px rgba(50, 136, 203, 0.2);
      }

      .filter-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      @media (max-width: 1200px) {
        :host {
          display: none;
        }
      }
    `
];
let EntityFilterPanel = _EntityFilterPanel;
__decorateClass$7([
  n({ type: Array })
], EntityFilterPanel.prototype, "entities");
__decorateClass$7([
  n({ type: String })
], EntityFilterPanel.prototype, "activeRegistry");
__decorateClass$7([
  n({ type: String })
], EntityFilterPanel.prototype, "activeState");
__decorateClass$7([
  n({ type: String })
], EntityFilterPanel.prototype, "activeStates");
__decorateClass$7([
  n({ type: String })
], EntityFilterPanel.prototype, "activeStatistics");
if (!customElements.get("entity-filter-panel")) {
  customElements.define("entity-filter-panel", EntityFilterPanel);
}
var __defProp$6 = Object.defineProperty;
var __decorateClass$6 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$6(target, key, result);
  return result;
};
const _StorageHealthSummary = class _StorageHealthSummary extends i$1 {
  constructor() {
    super(...arguments);
    this.summary = null;
    this.entities = [];
    this.databaseSize = null;
    this.activeFilter = null;
    this.activeRegistry = null;
    this.activeState = null;
    this.activeStates = null;
    this.activeStatistics = null;
  }
  render() {
    if (!this.summary) {
      return x`<div class="loading">Loading status summary...</div>`;
    }
    return x`
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
            @action-clicked=${(e2) => {
      this.dispatchEvent(new CustomEvent("action-clicked", {
        detail: e2.detail,
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
            @filter-changed=${(e2) => {
      this.dispatchEvent(new CustomEvent("filter-changed", {
        detail: e2.detail,
        bubbles: true,
        composed: true
      }));
    }}
            @filter-reset=${() => {
      this.dispatchEvent(new CustomEvent("filter-reset", {
        bubbles: true,
        composed: true
      }));
    }}
          ></entity-filter-panel>
        </div>
      </div>
    `;
  }
};
_StorageHealthSummary.styles = [
  sharedStyles,
  i`
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
let StorageHealthSummary = _StorageHealthSummary;
__decorateClass$6([
  n({ type: Object })
], StorageHealthSummary.prototype, "summary");
__decorateClass$6([
  n({ type: Array })
], StorageHealthSummary.prototype, "entities");
__decorateClass$6([
  n({ type: Object })
], StorageHealthSummary.prototype, "databaseSize");
__decorateClass$6([
  n({ type: String })
], StorageHealthSummary.prototype, "activeFilter");
__decorateClass$6([
  n({ type: String })
], StorageHealthSummary.prototype, "activeRegistry");
__decorateClass$6([
  n({ type: String })
], StorageHealthSummary.prototype, "activeState");
__decorateClass$6([
  n({ type: String })
], StorageHealthSummary.prototype, "activeStates");
__decorateClass$6([
  n({ type: String })
], StorageHealthSummary.prototype, "activeStatistics");
if (!customElements.get("storage-health-summary")) {
  customElements.define("storage-health-summary", StorageHealthSummary);
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
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$5(target, key, result);
  return result;
};
const _FilterBar = class _FilterBar extends i$1 {
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
            <span class="search-icon">🔍</span>
            <input
              type="search"
              placeholder=${this.searchPlaceholder}
              .value=${this.searchValue}
              @input=${this.handleSearchInput}
              aria-label=${this.searchPlaceholder}
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
_FilterBar.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .filter-container {
        display: flex;
        gap: var(--spacing-sm, 8px);
        flex-wrap: wrap;
        align-items: center;
      }

      .search-box {
        position: relative;
      }

      .search-icon {
        position: absolute;
        left: var(--spacing-md, 12px);
        top: 50%;
        transform: translateY(-50%);
        color: var(--secondary-text-color);
        pointer-events: none;
        font-size: 16px;
        opacity: 0.6;
      }

      .search-box input[type="search"] {
        padding-left: 38px;
      }

      .clear-button {
        margin-left: auto;
      }
    `
];
let FilterBar = _FilterBar;
__decorateClass$5([
  n({ type: Array })
], FilterBar.prototype, "filters");
__decorateClass$5([
  n({ type: Boolean })
], FilterBar.prototype, "showSearch");
__decorateClass$5([
  n({ type: String })
], FilterBar.prototype, "searchPlaceholder");
__decorateClass$5([
  n({ type: String })
], FilterBar.prototype, "searchValue");
__decorateClass$5([
  n({ type: Boolean })
], FilterBar.prototype, "showClearButton");
if (!customElements.get("filter-bar")) {
  customElements.define("filter-bar", FilterBar);
}
var __defProp$4 = Object.defineProperty;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$4(target, key, result);
  return result;
};
const _EntityTable = class _EntityTable extends i$1 {
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
    this.disabledEntityIds = /* @__PURE__ */ new Set();
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
    try {
      if (column.render) {
        const content = column.render(entity);
        if (typeof content === "string") {
          return x`${content}`;
        }
        return content;
      }
      const value = column.getValue ? column.getValue(entity) : entity[column.id];
      return x`${value ?? ""}`;
    } catch (err) {
      console.error("[EntityTable] Error rendering cell:", err);
      return x`<span style="color: red;" title="${err instanceof Error ? err.message : "Error"}">Error</span>`;
    }
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
      const isDisabled = this.disabledEntityIds.has(entityId);
      let tooltipText = "";
      if (isSelectable) {
        if (isDisabled) {
          tooltipText = "Select this DISABLED entity (statistics older than 90 days)";
        } else {
          tooltipText = "Select this deleted entity";
        }
      } else {
        if (entity.registry_status === "Disabled") {
          tooltipText = "Cannot delete - statistics updated within last 90 days";
        } else {
          tooltipText = "Cannot delete - entity still exists or has no statistics";
        }
      }
      const rowClasses = isDisabled && isSelectable ? "disabled-entity-row" : "";
      return x`
                  <tr class=${rowClasses}>
                    ${this.showCheckboxes ? x`
                      <td class="checkbox-column sticky-column">
                        <div class="checkbox-cell">
                          <input
                            type="checkbox"
                            class=${isDisabled && isSelectable ? "disabled-entity" : ""}
                            .checked=${isSelected}
                            ?disabled=${!isSelectable}
                            @change=${(e2) => this.handleCheckboxChange(entity, e2)}
                            title=${tooltipText}
                            aria-label="Select ${entityId}"
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
_EntityTable.styles = [
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
        padding: var(--spacing-sm, 8px);
      }

      .checkbox-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--primary-color);
        border-radius: var(--radius-sm, 6px);
        transition: all var(--duration-fast, 150ms) var(--ease-out-smooth);
      }

      input[type="checkbox"]:hover:not(:disabled) {
        transform: scale(1.1);
      }

      input[type="checkbox"].disabled-entity {
        accent-color: var(--warning-color, #FF9800);
      }

      input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.3;
      }

      .disabled-entity-row {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.02), rgba(255, 152, 0, 0.03));
      }

      .disabled-entity-row:hover {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.07));
      }

      /* Optional zebra striping for better readability */
      tbody tr:nth-child(even) {
        background: color-mix(in srgb, var(--secondary-background-color) 3%, transparent);
      }

      tbody tr:nth-child(even):hover {
        background: color-mix(in srgb, var(--card-background-color) 95%, var(--primary-color) 5%);
      }

    `
];
let EntityTable = _EntityTable;
__decorateClass$4([
  n({ type: Array })
], EntityTable.prototype, "entities");
__decorateClass$4([
  n({ type: Array })
], EntityTable.prototype, "columns");
__decorateClass$4([
  n({ type: Boolean })
], EntityTable.prototype, "sortable");
__decorateClass$4([
  n({ type: Boolean })
], EntityTable.prototype, "stickyFirstColumn");
__decorateClass$4([
  n({ type: Array })
], EntityTable.prototype, "sortStack");
__decorateClass$4([
  n({ type: String })
], EntityTable.prototype, "emptyMessage");
__decorateClass$4([
  n({ type: Boolean })
], EntityTable.prototype, "showCheckboxes");
__decorateClass$4([
  n({ type: Object })
], EntityTable.prototype, "selectedIds");
__decorateClass$4([
  n({ type: Object })
], EntityTable.prototype, "selectableEntityIds");
__decorateClass$4([
  n({ type: Object })
], EntityTable.prototype, "disabledEntityIds");
if (!customElements.get("entity-table")) {
  customElements.define("entity-table", EntityTable);
}
var __defProp$3 = Object.defineProperty;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$3(target, key, result);
  return result;
};
const _SelectionPanel = class _SelectionPanel extends i$1 {
  constructor() {
    super(...arguments);
    this.selectedCount = 0;
    this.selectableCount = 0;
    this.deletedCount = 0;
    this.disabledCount = 0;
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
    const hasBreakdown = this.disabledCount > 0;
    return x`
      <div class="selection-panel">
        <div class="left-section">
          <div>
            <div class="count">
              ${this.selectedCount} ${this.selectedCount === 1 ? "entity" : "entities"} selected
            </div>
            ${hasBreakdown && !this.isGenerating ? x`
              <div class="breakdown">
                ${this.deletedCount > 0 ? x`
                  <div class="breakdown-item deleted">
                    <span class="breakdown-dot deleted"></span>
                    ${this.deletedCount} deleted
                  </div>
                ` : ""}
                ${this.disabledCount > 0 ? x`
                  <div class="breakdown-item disabled">
                    <span class="breakdown-dot disabled"></span>
                    ${this.disabledCount} disabled
                  </div>
                ` : ""}
              </div>
            ` : ""}
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
              <span class="loading-spinner-sm"></span>
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
_SelectionPanel.styles = [
  sharedStyles,
  i`
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
let SelectionPanel = _SelectionPanel;
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "selectedCount");
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "selectableCount");
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "deletedCount");
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "disabledCount");
__decorateClass$3([
  n({ type: Boolean })
], SelectionPanel.prototype, "isGenerating");
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "generatingProgress");
__decorateClass$3([
  n({ type: Number })
], SelectionPanel.prototype, "generatingTotal");
if (!customElements.get("selection-panel")) {
  customElements.define("selection-panel", SelectionPanel);
}
var __defProp$2 = Object.defineProperty;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$2(target, key, result);
  return result;
};
const _MessageHistogramTooltip = class _MessageHistogramTooltip extends i$1 {
  constructor() {
    super(...arguments);
    this.lastUpdate = null;
    this.timeRange = 24;
    this.loading = false;
    this.hourlyCounts = [];
    this.totalMessages = 0;
    this.error = null;
    this.currentLoadRequest = 0;
    this._isDisconnected = false;
  }
  async connectedCallback() {
    super.connectedCallback();
    this._isDisconnected = false;
    await this.loadData();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._isDisconnected = true;
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("entityId")) {
      this.loadData();
    }
  }
  async loadData() {
    if (this._isDisconnected) return;
    this.loading = true;
    this.error = null;
    this.currentLoadRequest++;
    const thisRequestId = this.currentLoadRequest;
    const apiService = new ApiService(this.hass);
    try {
      const data = await apiService.fetchMessageHistogram(this.entityId, this.timeRange);
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        this.hourlyCounts = data.hourly_counts;
        this.totalMessages = data.total_messages;
      }
    } catch (err) {
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        console.error("Failed to load histogram:", err);
        this.error = err instanceof Error ? err.message : "Failed to load data";
      }
    } finally {
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        this.loading = false;
      }
    }
  }
  async handleTimeRangeChange(range) {
    if (this.timeRange === range) return;
    this.timeRange = range;
    await this.loadData();
  }
  render() {
    return x`
      <div class="header">
        <div class="entity-name" title="${this.entityId}">${this.entityId}</div>
        <div class="time-selector">
          <button
            class="time-btn ${this.timeRange === 24 ? "active" : ""}"
            @click=${() => this.handleTimeRangeChange(24)}
            ?disabled=${this.loading}
          >24h</button>
          <button
            class="time-btn ${this.timeRange === 48 ? "active" : ""}"
            @click=${() => this.handleTimeRangeChange(48)}
            ?disabled=${this.loading}
          >48h</button>
          <button
            class="time-btn ${this.timeRange === 168 ? "active" : ""}"
            @click=${() => this.handleTimeRangeChange(168)}
            ?disabled=${this.loading}
          >7d</button>
        </div>
      </div>

      ${this.renderContent()}
    `;
  }
  renderContent() {
    if (this.loading) {
      return x`<div class="loading">Loading...</div>`;
    }
    if (this.error) {
      return x`<div class="error">${this.error}</div>`;
    }
    if (this.hourlyCounts.length === 0) {
      return x`<div class="stats">No data available</div>`;
    }
    const maxCount = Math.max(...this.hourlyCounts, 1);
    const avgPerHour = this.totalMessages / this.timeRange;
    const now = /* @__PURE__ */ new Date();
    const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    return x`
      <div class="chart">
        ${this.hourlyCounts.map((count, index) => {
      const height = count / maxCount * 100;
      const isEmpty = count === 0;
      const hoursFromStart = index;
      const startTime = new Date(currentHourStart.getTime() - (this.hourlyCounts.length - hoursFromStart) * 3600 * 1e3);
      const endTime = new Date(startTime.getTime() + 3600 * 1e3);
      const timeRangeStr = `${this.formatTime(startTime)}-${this.formatTime(endTime)}`;
      const intervalSeconds = count > 0 ? Math.round(3600 / count) : 0;
      const intervalStr = formatInterval(intervalSeconds);
      const tooltipText = count > 0 ? `${count} messages (I: ${intervalStr}) ${timeRangeStr}` : `0 messages ${timeRangeStr}`;
      return x`
            <div
              class="bar ${isEmpty ? "empty" : ""}"
              style="height: ${height}%"
              title="${tooltipText}"
            ></div>
          `;
    })}
      </div>

      <div class="stats">
        ${this.totalMessages.toLocaleString()} messages in last ${this.timeRange}h
        (avg: ${avgPerHour.toFixed(1)}/hour)
      </div>

      ${this.lastUpdate ? x`
        <div class="timestamp">
          Last update: ${formatFullTimestamp(this.lastUpdate)}
        </div>
      ` : ""}
    `;
  }
  /**
   * Format time as HH:MM
   */
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
};
_MessageHistogramTooltip.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 18px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 450px;
        max-width: 750px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
      }

      .entity-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }

      .time-selector {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .time-btn {
        padding: 2px 8px;
        font-size: 11px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--primary-text-color);
      }

      .time-btn:hover {
        background: var(--divider-color);
      }

      .time-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .chart {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 120px;
        margin: 12px 0;
        padding: 0 4px;
      }

      .bar {
        flex: 1;
        background: var(--primary-color);
        min-height: 2px;
        transition: background 0.2s, opacity 0.2s;
        border-radius: 2px 2px 0 0;
        cursor: pointer;
        position: relative;
      }

      .bar:hover {
        background: var(--accent-color);
        opacity: 0.8;
      }

      .bar.empty {
        background: var(--divider-color);
        opacity: 0.3;
      }

      .stats {
        font-size: 11px;
        color: var(--secondary-text-color);
        text-align: center;
        padding: 4px 0;
      }

      .timestamp {
        font-size: 10px;
        color: var(--secondary-text-color);
        text-align: center;
        padding: 4px 0 0 0;
        margin-top: 4px;
        border-top: 1px solid var(--divider-color);
        opacity: 0.8;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
        font-size: 12px;
      }
    `
];
let MessageHistogramTooltip = _MessageHistogramTooltip;
__decorateClass$2([
  n({ type: Object })
], MessageHistogramTooltip.prototype, "hass");
__decorateClass$2([
  n({ type: String })
], MessageHistogramTooltip.prototype, "entityId");
__decorateClass$2([
  n({ type: String })
], MessageHistogramTooltip.prototype, "lastUpdate");
__decorateClass$2([
  r()
], MessageHistogramTooltip.prototype, "timeRange");
__decorateClass$2([
  r()
], MessageHistogramTooltip.prototype, "loading");
__decorateClass$2([
  r()
], MessageHistogramTooltip.prototype, "hourlyCounts");
__decorateClass$2([
  r()
], MessageHistogramTooltip.prototype, "totalMessages");
__decorateClass$2([
  r()
], MessageHistogramTooltip.prototype, "error");
if (!customElements.get("message-histogram-tooltip")) {
  customElements.define("message-histogram-tooltip", MessageHistogramTooltip);
}
var __defProp$1 = Object.defineProperty;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$1(target, key, result);
  return result;
};
const _StorageOverviewView = class _StorageOverviewView extends i$1 {
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
    this.statesFilter = null;
    this.statisticsFilter = null;
    this.sortStack = [{ column: "entity_id", direction: "asc" }];
    this.selectedEntity = null;
    this.deleteModalData = null;
    this.deleteSql = "";
    this.deleteStorageSaved = 0;
    this.deleteModalMode = "display";
    this.deleteModalEntities = [];
    this.deleteModalDeletedCount = 0;
    this.deleteModalDisabledCount = 0;
    this.selectedEntityIds = /* @__PURE__ */ new Set();
    this.isGeneratingBulkSql = false;
    this.bulkSqlProgress = 0;
    this.bulkSqlTotal = 0;
    this._entityDetailsModalLoaded = false;
    this._deleteSqlModalLoaded = false;
    this._modalOrchestrator = null;
    this.histogramEntityId = null;
    this.histogramLastUpdate = null;
    this.histogramPosition = { x: 0, y: 0 };
    this.histogramHideTimeout = null;
  }
  /**
   * Lazy load the entity details modal component
   */
  async _loadEntityDetailsModal() {
    if (!this._entityDetailsModalLoaded) {
      await import("./entity-details-modal-DEQUYUjZ.js");
      this._entityDetailsModalLoaded = true;
    }
  }
  /**
   * Lazy load the delete SQL modal component
   */
  async _loadDeleteSqlModal() {
    if (!this._deleteSqlModalLoaded) {
      await import("./delete-sql-modal-CH3yGxSS.js");
      this._deleteSqlModalLoaded = true;
    }
  }
  /**
   * Get or create the modal orchestration service
   */
  get modalOrchestrator() {
    if (!this._modalOrchestrator || !this.hass) {
      this._modalOrchestrator = new ModalOrchestrationService(this.hass);
    }
    return this._modalOrchestrator;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("entities")) {
      EntityFilterService.clearCache();
    }
    if (changedProperties.has("hass") && !this.hass) {
      console.warn("StorageOverviewView: hass connection became unavailable");
    }
  }
  /**
   * Get entities that are eligible for deletion
   * Includes both deleted entities and disabled entities
   */
  get selectableEntities() {
    return EntitySelectionService.getSelectableEntities(this.filteredEntities);
  }
  /**
   * Get Set of selectable entity IDs for efficient lookups
   */
  get selectableEntityIds() {
    return EntitySelectionService.getSelectableEntityIds(this.filteredEntities);
  }
  /**
   * Get set of disabled entity IDs (for visual differentiation)
   */
  get disabledEntityIds() {
    return EntitySelectionService.getDisabledEntityIds(this.entities);
  }
  /**
   * Get breakdown of selected entities by type (deleted vs disabled)
   */
  get selectionBreakdown() {
    return EntitySelectionService.getSelectionBreakdown(this.selectedEntityIds, this.entities);
  }
  get filteredEntities() {
    const filters = {
      searchQuery: this.searchQuery,
      basicFilter: this.basicFilter,
      registryFilter: this.registryFilter,
      stateFilter: this.stateFilter,
      advancedFilter: this.advancedFilter,
      statesFilter: this.statesFilter,
      statisticsFilter: this.statisticsFilter
    };
    return EntityFilterService.filterAndSort(this.entities, filters, this.sortStack);
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
        label: "Registry",
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
        label: "State machine",
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
        label: "States meta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_states_meta ? "✓" : ""
      },
      {
        id: "states",
        label: "States table",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_states ? "✓" : ""
      },
      {
        id: "states_count",
        label: "States records",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.states_count)
      },
      {
        id: "update_interval",
        label: "Message cadence",
        sortable: true,
        align: "right",
        render: (entity) => x`
          <div
            class="message-interval-cell"
            @mouseenter=${(e2) => this.handleShowHistogram(entity.entity_id, e2)}
            @mouseleave=${() => this.handleHideHistogram()}
          >
            ${entity.update_interval || ""}
          </div>
        `
      },
      {
        id: "last_state_update",
        label: "Last state update",
        sortable: true,
        align: "center",
        render: (entity) => x`
          <div
            class="message-interval-cell"
            @mouseenter=${(e2) => this.handleShowHistogram(entity.entity_id, e2, entity.last_state_update)}
            @mouseleave=${() => this.handleHideHistogram()}
          >
            ${formatRelativeTime(entity.last_state_update)}
          </div>
        `
      },
      {
        id: "stats_meta",
        label: "Stats meta",
        sortable: true,
        align: "center",
        className: "group-border-left",
        render: (entity) => entity.in_statistics_meta ? "✓" : ""
      },
      {
        id: "stats_short",
        label: "Short stats",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_short_term ? "✓" : ""
      },
      {
        id: "stats_long",
        label: "Long stats",
        sortable: true,
        align: "center",
        render: (entity) => entity.in_statistics_long_term ? "✓" : ""
      },
      {
        id: "stats_short_count",
        label: "Short records",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_short_count)
      },
      {
        id: "stats_long_count",
        label: "Long records",
        sortable: true,
        align: "right",
        render: (entity) => formatNumber(entity.stats_long_count)
      },
      {
        id: "last_stats_update",
        label: "Last stats update",
        sortable: true,
        align: "center",
        render: (entity) => x`
          <span title="${formatFullTimestamp(entity.last_stats_update)}">
            ${formatRelativeTime(entity.last_stats_update)}
          </span>
        `
      },
      {
        id: "actions",
        label: "Actions",
        sortable: false,
        align: "center",
        width: "80px",
        className: "group-border-left",
        render: (entity) => {
          const isSelectable = this.selectableEntityIds.has(entity.entity_id);
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
              ${isSelectable ? x`
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
    const action = e2.detail?.action;
    if (!action) {
      console.warn("[StorageOverviewView] Health action called without action detail");
      return;
    }
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
      case "review_numeric_sensors":
        this.basicFilter = "numeric_sensors_no_stats";
        break;
    }
  }
  handleSearchChanged(e2) {
    this.searchQuery = e2.detail.query;
  }
  resetFilters(includeSearch = true) {
    if (includeSearch) {
      this.searchQuery = "";
    }
    this.basicFilter = null;
    this.registryFilter = null;
    this.stateFilter = null;
    this.advancedFilter = null;
    this.statesFilter = null;
    this.statisticsFilter = null;
  }
  handleClearFilters() {
    this.resetFilters(true);
  }
  handlePanelFilterReset() {
    this.resetFilters(false);
  }
  handleFilterPanelChange(e2) {
    const { group, value } = e2.detail;
    switch (group) {
      case "registry":
        this.registryFilter = this.registryFilter === value ? null : value;
        break;
      case "state":
        this.stateFilter = this.stateFilter === value ? null : value;
        break;
      case "states":
        this.statesFilter = this.statesFilter === value ? null : value;
        break;
      case "statistics":
        this.statisticsFilter = this.statisticsFilter === value ? null : value;
        break;
    }
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
      const entityId = e2.detail?.entityId;
      if (!entityId) {
        console.warn("Cannot open more info: No entity ID provided");
        return;
      }
      const event = new Event("hass-more-info", { bubbles: true, composed: true });
      event.detail = { entityId };
      this.dispatchEvent(event);
    } catch (err) {
      console.error("Error opening more info dialog:", err);
    }
  }
  async handleGenerateSql(entity) {
    try {
      if (!this.hass) {
        console.warn("Cannot generate SQL: Home Assistant connection not available");
        return;
      }
      await this._loadDeleteSqlModal();
      const isDeleted = !entity.in_entity_registry && !entity.in_state_machine;
      const isDisabled = entity.registry_status === "Disabled";
      this.deleteModalMode = "confirm";
      this.deleteModalEntities = [entity];
      this.deleteModalDeletedCount = isDeleted ? 1 : 0;
      this.deleteModalDisabledCount = isDisabled ? 1 : 0;
      this.deleteModalData = {
        entityId: entity.entity_id,
        metadataId: entity.metadata_id || 0,
        origin: "Both",
        // Will be set properly after confirmation
        status: "deleted",
        // Both deleted and disabled entities get their stats deleted
        count: 0
        // Will be set properly after confirmation
      };
    } catch (err) {
      console.error("Error showing confirmation modal:", err);
    }
  }
  // Called by parent when SQL is ready (for single entity operations)
  async showDeleteModal(data, sql, storageSaved) {
    try {
      await this._loadDeleteSqlModal();
      this.deleteModalMode = "display";
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
    this.deleteModalMode = "display";
    this.deleteModalEntities = [];
    this.deleteModalDeletedCount = 0;
    this.deleteModalDisabledCount = 0;
  }
  /**
   * Handle cancel from confirmation modal
   */
  handleDeleteModalCancel() {
    this.handleCloseDeleteModal();
  }
  /**
   * Handle confirm from confirmation modal - generate SQL and show it
   */
  async handleDeleteModalConfirm() {
    try {
      if (this.deleteModalEntities.length === 0) return;
      const isBulk = this.deleteModalEntities.length > 1;
      if (isBulk) {
        await this.generateBulkSqlAfterConfirmation();
      } else {
        const entity = this.deleteModalEntities[0];
        await this.generateSingleEntitySqlAfterConfirmation(entity);
      }
    } catch (err) {
      console.error("Error generating SQL after confirmation:", err);
      this.handleCloseDeleteModal();
    }
  }
  /**
   * Generate SQL for a single entity after user confirms
   */
  async generateSingleEntitySqlAfterConfirmation(entity) {
    try {
      const result = await this.modalOrchestrator.generateSingleEntitySql(entity);
      this.deleteModalMode = "display";
      this.deleteModalData = result.modalData;
      this.deleteSql = result.sql;
      this.deleteStorageSaved = result.storage_saved;
    } catch (err) {
      console.error("Error generating SQL for single entity:", err);
      this.handleCloseDeleteModal();
    }
  }
  /**
   * Generate bulk SQL for multiple entities after user confirms
   */
  async generateBulkSqlAfterConfirmation() {
    if (this.deleteModalEntities.length === 0) return;
    try {
      if (!this.hass) {
        console.error("Cannot generate SQL: Home Assistant connection not available");
        return;
      }
      this.isGeneratingBulkSql = true;
      this.bulkSqlTotal = this.deleteModalEntities.length;
      this.bulkSqlProgress = 0;
      const results = await this.modalOrchestrator.generateBulkSql(
        this.deleteModalEntities,
        (current, total) => {
          this.bulkSqlProgress = current;
          this.bulkSqlTotal = total;
        }
      );
      const combinedSql = this.modalOrchestrator.formatSqlForDisplay(results);
      this.deleteModalMode = "display";
      this.deleteModalData = {
        entityId: `${results.success_count} entities`,
        metadataId: 0,
        origin: "Both",
        status: "deleted",
        count: results.total_count
      };
      this.deleteSql = combinedSql;
      this.deleteStorageSaved = results.total_storage_saved;
      this.selectedEntityIds = /* @__PURE__ */ new Set();
    } catch (err) {
      console.error("Error in bulk SQL generation:", err);
      this.handleCloseDeleteModal();
    } finally {
      this.isGeneratingBulkSql = false;
      this.bulkSqlProgress = 0;
      this.bulkSqlTotal = 0;
    }
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
      await this._loadDeleteSqlModal();
      const { deleted, disabled } = this.selectionBreakdown;
      this.deleteModalMode = "confirm";
      this.deleteModalEntities = [...deleted, ...disabled];
      this.deleteModalDeletedCount = deleted.length;
      this.deleteModalDisabledCount = disabled.length;
      const totalCount = deleted.length + disabled.length;
      this.deleteModalData = {
        entityId: `${totalCount} entities`,
        metadataId: 0,
        origin: "Both",
        // Will be set properly after confirmation
        status: "deleted",
        count: 0
        // Will be set properly after confirmation
      };
    } catch (err) {
      console.error("Error showing confirmation modal:", err);
    }
  }
  /**
   * Show message histogram tooltip for an entity
   */
  handleShowHistogram(entityId, event, lastUpdate = null) {
    if (this.histogramHideTimeout !== null) {
      window.clearTimeout(this.histogramHideTimeout);
      this.histogramHideTimeout = null;
    }
    const target = event.currentTarget;
    const cellRect = target.getBoundingClientRect();
    const tooltipWidth = 420;
    const tooltipHeight = 220;
    const offset = 16;
    let x2 = cellRect.right + offset;
    let y = cellRect.top;
    if (x2 + tooltipWidth > window.innerWidth) {
      x2 = cellRect.left - tooltipWidth - offset;
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = window.innerHeight - tooltipHeight - offset;
    }
    x2 = Math.max(offset, x2);
    y = Math.max(offset, y);
    this.histogramPosition = { x: x2, y };
    this.histogramEntityId = entityId;
    this.histogramLastUpdate = lastUpdate;
  }
  /**
   * Hide message histogram tooltip with a small delay
   */
  handleHideHistogram() {
    this.histogramHideTimeout = window.setTimeout(() => {
      this.histogramEntityId = null;
      this.histogramHideTimeout = null;
    }, 300);
  }
  /**
   * Keep histogram visible when mouse enters it
   */
  handleHistogramMouseEnter() {
    if (this.histogramHideTimeout !== null) {
      window.clearTimeout(this.histogramHideTimeout);
      this.histogramHideTimeout = null;
    }
  }
  /**
   * Hide histogram when mouse leaves it
   */
  handleHistogramMouseLeave() {
    this.histogramEntityId = null;
  }
  render() {
    const hasActiveFilters = this.searchQuery || this.basicFilter || this.registryFilter || this.stateFilter || this.advancedFilter || this.statesFilter || this.statisticsFilter;
    return x`
      <div class="description">
        Complete overview of all entities across Home Assistant's storage locations.
        Table features horizontal scrolling with sticky first column.
      </div>

      <storage-health-summary
        .summary=${this.summary}
        .entities=${this.filteredEntities}
        .databaseSize=${this.databaseSize}
        .activeFilter=${this.getActiveFilterType()}
        .activeRegistry=${this.registryFilter}
        .activeState=${this.stateFilter}
        .activeStates=${this.statesFilter}
        .activeStatistics=${this.statisticsFilter}
        @action-clicked=${this.handleHealthAction}
        @filter-changed=${this.handleFilterPanelChange}
        @filter-reset=${this.handlePanelFilterReset}
      ></storage-health-summary>

      <h2>Entity Storage Details</h2>
      <div class="search-and-sort-row">
        <filter-bar
          .filters=${[]}
          .showSearch=${true}
          .searchPlaceholder=${"Search entity ID..."}
          .searchValue=${this.searchQuery}
          .showClearButton=${hasActiveFilters}
          @search-changed=${this.handleSearchChanged}
          @clear-filters=${this.handleClearFilters}
        ></filter-bar>
        <button class="secondary-button" @click=${this.handleClearSort}>Clear Sort</button>
      </div>

      <div class="table-container ${this.selectedEntityIds.size > 0 ? "has-selections" : ""}">
        <entity-table
          .entities=${this.filteredEntities}
          .columns=${this.tableColumns}
          .sortStack=${this.sortStack}
          .stickyFirstColumn=${true}
          .emptyMessage=${"No entities found"}
          .showCheckboxes=${true}
          .selectedIds=${this.selectedEntityIds}
          .selectableEntityIds=${this.selectableEntityIds}
          .disabledEntityIds=${this.disabledEntityIds}
          @sort-changed=${this.handleSortChanged}
          @selection-changed=${this.handleSelectionChanged}
        ></entity-table>
      </div>

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
          .mode=${this.deleteModalMode}
          .entities=${this.deleteModalEntities}
          .deletedCount=${this.deleteModalDeletedCount}
          .disabledCount=${this.deleteModalDisabledCount}
          @close-modal=${this.handleCloseDeleteModal}
          @cancel=${this.handleDeleteModalCancel}
          @confirm=${this.handleDeleteModalConfirm}
        ></delete-sql-modal>
      ` : ""}

      ${this.selectedEntityIds.size > 0 ? x`
        <selection-panel
          .selectedCount=${this.selectedEntityIds.size}
          .selectableCount=${this.selectableEntities.length}
          .isGenerating=${this.isGeneratingBulkSql}
          .generatingProgress=${this.bulkSqlProgress}
          .generatingTotal=${this.bulkSqlTotal}
          .deletedCount=${this.selectionBreakdown.deleted.length}
          .disabledCount=${this.selectionBreakdown.disabled.length}
          @select-all=${this.handleSelectAll}
          @deselect-all=${this.handleDeselectAll}
          @generate-bulk-sql=${this.handleGenerateBulkSql}
        ></selection-panel>
      ` : ""}

      ${this.histogramEntityId ? x`
        <div
          class="histogram-tooltip"
          style="left: ${this.histogramPosition.x}px; top: ${this.histogramPosition.y}px;"
          @mouseenter=${this.handleHistogramMouseEnter}
          @mouseleave=${this.handleHistogramMouseLeave}
        >
          <message-histogram-tooltip
            .hass=${this.hass}
            .entityId=${this.histogramEntityId}
            .lastUpdate=${this.histogramLastUpdate}
          ></message-histogram-tooltip>
        </div>
      ` : ""}
    `;
  }
};
_StorageOverviewView.styles = [
  sharedStyles,
  i`
      :host {
        display: block;
      }

      .description {
        margin-bottom: 16px;
        color: var(--secondary-text-color);
      }

      .search-and-sort-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }

      .search-and-sort-row filter-bar {
        flex: 1;
      }

      .table-container {
        /* Add bottom padding when selection panel is visible to prevent last row from being covered */
        padding-bottom: 0;
        transition: padding-bottom 0.3s ease-out;
      }

      .table-container.has-selections {
        padding-bottom: 100px;
      }

      .message-interval-cell {
        cursor: help;
        position: relative;
      }

      .histogram-tooltip {
        position: fixed;
        z-index: 9999;
        pointer-events: auto;
      }
    `
];
let StorageOverviewView = _StorageOverviewView;
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "hass");
__decorateClass$1([
  n({ type: Array })
], StorageOverviewView.prototype, "entities");
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "summary");
__decorateClass$1([
  n({ type: Object })
], StorageOverviewView.prototype, "databaseSize");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "searchQuery");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "basicFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "registryFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "stateFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "advancedFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "statesFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "statisticsFilter");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "sortStack");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "selectedEntity");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalData");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteSql");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteStorageSaved");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalMode");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalEntities");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalDeletedCount");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "deleteModalDisabledCount");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "selectedEntityIds");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "isGeneratingBulkSql");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "bulkSqlProgress");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "bulkSqlTotal");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "histogramEntityId");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "histogramLastUpdate");
__decorateClass$1([
  r()
], StorageOverviewView.prototype, "histogramPosition");
if (!customElements.get("storage-overview-view")) {
  customElements.define("storage-overview-view", StorageOverviewView);
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
const _StatisticsOrphanPanel = class _StatisticsOrphanPanel extends i$1 {
  constructor() {
    super(...arguments);
    this.loading = false;
    this.loadingSteps = [];
    this.currentStepIndex = 0;
    this.error = null;
    this.lastFailedStep = null;
    this.lastSessionId = null;
    this.databaseSize = null;
    this.storageEntities = [];
    this.storageSummary = null;
    this.cacheTimestamp = null;
    this.showStaleBanner = false;
    this.dataSource = null;
  }
  connectedCallback() {
    super.connectedCallback();
    console.debug("[Panel] Component connected to DOM");
    if (this.hass) {
      this.apiService = new ApiService(this.hass);
    }
    const cacheLoaded = this.loadFromCache();
    console.debug("[Panel] Cache load attempt:", cacheLoaded ? "success" : "no cache found");
    this.fetchDatabaseSizeOnly();
    this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
    document.addEventListener("visibilitychange", this.boundVisibilityHandler);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    console.debug("[Panel] Component disconnected from DOM");
    if (this.boundVisibilityHandler) {
      document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
    }
  }
  /**
   * Handle page visibility changes
   * Provides recovery mechanism if panel data is lost
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      console.debug("[Panel] Tab became visible, checking panel health");
      if (!this.storageEntities.length && !this.loading && !this.storageSummary) {
        console.warn("[Panel] Panel data lost, attempting recovery from cache");
        const recovered = this.loadFromCache();
        if (!recovered) {
          console.error("[Panel] No cache available for recovery");
          this.error = "Panel data was lost. Please click Refresh to reload.";
        } else {
          console.log("[Panel] Successfully recovered data from cache");
        }
      }
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("hass")) {
      const oldHass = changedProperties.get("hass");
      if (this.hass && !oldHass) {
        console.log("[Panel] Home Assistant connection established");
      } else if (!this.hass && oldHass) {
        console.warn("[Panel] Home Assistant connection lost");
        if (!this.error) {
          this.error = "Connection to Home Assistant lost. Waiting for reconnection...";
        }
      }
      if (this.hass) {
        this.apiService = new ApiService(this.hass);
        if (this.error?.includes("connection") || this.error?.includes("Connection")) {
          this.error = null;
        }
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
    const resumeFromStep = this.lastFailedStep;
    const resumeSessionId = this.lastSessionId;
    if (resumeFromStep !== null && resumeSessionId) {
      console.log(`[Panel] Resuming from step ${resumeFromStep + 1}/9 (session: ${resumeSessionId.substring(0, 8)}...)`);
    } else {
      console.log("[Panel] Starting data load (9-step process)");
    }
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
      let startStep = resumeFromStep !== null ? resumeFromStep : 0;
      let sessionId = resumeSessionId || void 0;
      if (resumeFromStep !== null && resumeFromStep > 0) {
        for (let i2 = 0; i2 < resumeFromStep; i2++) {
          this.completeCurrentStep();
        }
      }
      for (let step = startStep; step <= 8; step++) {
        console.debug(`[Panel] Executing step ${step + 1}/9`);
        try {
          const result = await this.apiService.fetchEntityStorageOverviewStep(step, sessionId);
          if (step === 0 && "session_id" in result) {
            sessionId = result.session_id;
            console.debug(`[Panel] Session initialized: ${sessionId.substring(0, 8)}...`);
          }
          if (step === 8) {
            if ("entities" in result && "summary" in result) {
              this.storageEntities = result.entities;
              this.storageSummary = result.summary;
              console.log(`[Panel] Data loaded: ${result.entities.length} entities`);
            } else {
              throw new Error("Final step did not return expected data structure");
            }
          }
          if (step < 8) {
            this.completeCurrentStep();
          }
        } catch (stepErr) {
          this.lastFailedStep = step;
          this.lastSessionId = sessionId || null;
          console.error(`[Panel] Step ${step + 1}/9 failed, saved for resumption`);
          throw stepErr;
        }
      }
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      this.lastFailedStep = null;
      this.lastSessionId = null;
      this.error = null;
      this.saveToCache();
      console.log("[Panel] Data load complete and cached");
    } catch (err) {
      let errorMessage = "Unknown error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes("session_id") || errorMessage.includes("Invalid or missing session_id")) {
          errorMessage = "Session expired. Please refresh the page to reload data.";
          this.lastFailedStep = null;
          this.lastSessionId = null;
        }
      }
      this.error = errorMessage;
      console.error("[Panel] Error loading storage overview data:", err);
    } finally {
      this.loading = false;
      this.loadingSteps = [];
    }
  }
  handleRefresh() {
    this.lastFailedStep = null;
    this.lastSessionId = null;
    this.loadStorageOverviewData();
  }
  handleRetry() {
    this.error = null;
    this.loadStorageOverviewData();
  }
  /**
   * Fetch only database size (lightweight call for version and metadata)
   */
  async fetchDatabaseSizeOnly() {
    try {
      if (!this.hass || !this.apiService) {
        console.debug("[Panel] Skipping database size fetch - hass not ready");
        return;
      }
      this.databaseSize = await this.apiService.fetchDatabaseSize();
      console.debug("[Panel] Database size fetched (version:", this.databaseSize.version, ")");
    } catch (err) {
      console.debug("[Panel] Failed to fetch database size:", err);
    }
  }
  /**
   * Load data from cache if available
   */
  loadFromCache() {
    try {
      const cache = CacheService.loadCache();
      if (!cache) {
        console.debug("[Panel] No cache available");
        return false;
      }
      this.databaseSize = cache.data.databaseSize;
      this.storageEntities = cache.data.storageEntities;
      this.storageSummary = cache.data.storageSummary;
      this.cacheTimestamp = cache.timestamp;
      this.dataSource = "cache";
      const TWELVE_HOURS_MS = 12 * 60 * 60 * 1e3;
      this.showStaleBanner = CacheService.isCacheStale(TWELVE_HOURS_MS, cache);
      console.log("[Panel] Data restored from cache", {
        age: CacheService.formatAge(CacheService.getCacheAge(cache)),
        entities: this.storageEntities.length,
        isStale: this.showStaleBanner
      });
      return true;
    } catch (error) {
      console.debug("[Panel] Failed to load from cache:", error);
      return false;
    }
  }
  /**
   * Save current data to cache
   */
  saveToCache() {
    try {
      const success = CacheService.saveCache(
        this.databaseSize,
        this.storageEntities,
        this.storageSummary
      );
      if (success) {
        this.cacheTimestamp = Date.now();
        this.dataSource = "live";
        this.showStaleBanner = false;
        console.log("[Panel] Data saved to cache");
      }
    } catch (error) {
      console.debug("[Panel] Failed to save to cache:", error);
    }
  }
  /**
   * Get formatted cache age string
   */
  getCacheAgeString() {
    if (!this.cacheTimestamp) {
      return "unknown";
    }
    const age = Date.now() - this.cacheTimestamp;
    const ageStr = CacheService.formatAge(age);
    const seconds = Math.floor(age / 1e3);
    if (seconds < 10) {
      return "just now";
    }
    return ageStr;
  }
  getCacheBadgeInfo() {
    if (!this.cacheTimestamp) {
      return null;
    }
    const age = Date.now() - this.cacheTimestamp;
    const ageLabel = this.getCacheAgeString();
    const isStale = age > 30 * 60 * 1e3;
    const source = this.dataSource ?? "live";
    let status = source === "live" ? "live" : "cached";
    if (isStale) {
      status = "stale";
    }
    const descriptor = status === "live" ? "live data" : status === "cached" ? "cached data" : "stale cache";
    return {
      label: `Last updated ${ageLabel} · ${descriptor}`,
      status
    };
  }
  /**
   * Dismiss the stale data banner
   */
  dismissStaleBanner() {
    this.showStaleBanner = false;
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
    const cacheBadge = this.getCacheBadgeInfo();
    return x`
      <div class="header">
        <div class="header-left">
          <h1>Statistics Orphan Finder</h1>
          ${this.databaseSize?.version ? x`
            <div class="version">v${this.databaseSize.version}</div>
          ` : ""}
        </div>
        <div class="cache-and-refresh">
          ${cacheBadge ? x`
            <span class="cache-indicator ${cacheBadge.status}">
              <span class="status-dot"></span>
              ${cacheBadge.label}
            </span>
          ` : ""}
          <button class="refresh-button" @click=${this.handleRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      ${this.showStaleBanner ? x`
        <div class="stale-cache-banner">
          <div class="stale-cache-icon">⚠️</div>
          <div class="stale-cache-content">
            <div class="stale-cache-title">Showing cached data</div>
            <div class="stale-cache-message">
              Data is from cache (${this.getCacheAgeString()}). Click Refresh to update with latest information.
            </div>
          </div>
          <div class="stale-cache-actions">
            <button @click=${this.handleRefresh}>
              Refresh Now
            </button>
            <button class="secondary-button" @click=${this.dismissStaleBanner}>
              Dismiss
            </button>
          </div>
        </div>
      ` : ""}

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
_StatisticsOrphanPanel.styles = [
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

      .header-left {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .version {
        font-size: 0.75rem;
        color: #888;
        font-weight: normal;
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

      .stale-cache-banner {
        background: rgba(255, 193, 7, 0.1);
        border-left: 4px solid #FFC107;
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .stale-cache-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .stale-cache-content {
        flex: 1;
      }

      .stale-cache-title {
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .stale-cache-message {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .stale-cache-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .cache-and-refresh {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .refresh-button {
        min-width: 96px;
      }

      .cache-indicator {
        font-size: 12px;
        padding: 6px 14px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .cache-indicator .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .cache-indicator.live {
        background: rgba(76, 175, 80, 0.15);
        color: #2e7d32;
      }

      .cache-indicator.live .status-dot {
        background: #2e7d32;
      }

      .cache-indicator.cached {
        background: rgba(33, 150, 243, 0.15);
        color: #1565c0;
      }

      .cache-indicator.cached .status-dot {
        background: #1565c0;
      }

      .cache-indicator.stale {
        background: rgba(255, 193, 7, 0.2);
        color: #8d6e00;
        border: 1px solid rgba(255, 193, 7, 0.6);
      }

      .cache-indicator.stale .status-dot {
        background: #ff9800;
      }
    `
];
let StatisticsOrphanPanel = _StatisticsOrphanPanel;
__decorateClass([
  n({ type: Object })
], StatisticsOrphanPanel.prototype, "hass");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "loading");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "loadingSteps");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "currentStepIndex");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "error");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "lastFailedStep");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "lastSessionId");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "databaseSize");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "storageEntities");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "storageSummary");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "cacheTimestamp");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "showStaleBanner");
__decorateClass([
  r()
], StatisticsOrphanPanel.prototype, "dataSource");
__decorateClass([
  e("storage-overview-view")
], StatisticsOrphanPanel.prototype, "storageView");
try {
  if (!customElements.get("statistics-orphan-panel")) {
    customElements.define("statistics-orphan-panel", StatisticsOrphanPanel);
    console.debug("[Panel] Custom element registered successfully");
  } else {
    console.debug("[Panel] Custom element already registered");
  }
} catch (error) {
  console.error("[Panel] Failed to register custom element:", error);
}
export {
  StatisticsOrphanPanel as S,
  formatDuration as a,
  formatBytes as b,
  formatNumber as f,
  sharedStyles as s
};
//# sourceMappingURL=statistics-orphan-panel-BAcnaE1O.js.map
