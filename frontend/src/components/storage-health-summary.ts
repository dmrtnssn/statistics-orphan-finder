/**
 * StorageHealthSummary - 3-Column Layout with Pie Chart & Action Summary
 * Column 1: Database size pie chart | Column 2: Action summary | Column 3: Placeholder
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber, formatBytes } from '../services/formatters';
import type { StorageSummary, StorageEntity, DatabaseSize } from '../types';

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
        /* Debug: Uncomment to verify container size */
        /* background: rgba(255, 255, 0, 0.1); */
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
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

      .action-item.clickable {
        cursor: pointer;
        transition: background 0.2s ease, transform 0.1s ease;
      }

      .action-item.clickable:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: translateY(-1px);
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

      /* Column 3: Filter Panel */
      .filter-panel-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        .filter-panel-column {
          display: none;
        }
      }
    `
  ];

  private getUnavailableLongTerm(): number {
    const sevenDaysInSeconds = 7 * 24 * 3600;
    return this.entities.filter(e =>
      e.state_status === 'Unavailable' &&
      e.unavailable_duration_seconds !== null &&
      e.unavailable_duration_seconds > sevenDaysInSeconds
    ).length;
  }

  private estimateStorageMB(entityCount: number): string {
    const statesSize = entityCount * 200; // ~200 bytes per state row
    const statsSize = entityCount * 150; // ~150 bytes per stat row
    const mb = (statesSize + statsSize) / (1024 * 1024);

    // Show 1 decimal place if < 10MB, otherwise round to whole number
    if (mb < 10) {
      return mb.toFixed(1);
    }
    return Math.round(mb).toString();
  }

  private getActualStorageMB(storageBytes: number | undefined, entityCount: number): string {
    if (storageBytes !== undefined && storageBytes > 0) {
      const mb = storageBytes / (1024 * 1024);
      if (mb < 10) {
        return mb.toFixed(1);
      }
      return Math.round(mb).toString();
    }
    // Fallback to estimation
    return this.estimateStorageMB(entityCount);
  }

  private getFilterCount(group: string, value: string): number {
    const source = this.entities;
    if (!source || source.length === 0) {
      return 0;
    }

    switch (group) {
      case 'registry':
        switch (value) {
          case 'Enabled':
            return source.filter(e => e.registry_status === 'Enabled').length;
          case 'Disabled':
            return source.filter(e => e.registry_status === 'Disabled').length;
          case 'Not in Registry':
            return source.filter(e => e.registry_status === 'Not in Registry').length;
        }
        break;

      case 'state':
        switch (value) {
          case 'Available':
            return source.filter(e => e.state_status === 'Available').length;
          case 'Unavailable':
            return source.filter(e => e.state_status === 'Unavailable').length;
          case 'Not Present':
            return source.filter(e => e.state_status === 'Not Present').length;
        }
        break;

      case 'states':
        switch (value) {
          case 'in_states':
            return source.filter(e => e.in_states).length;
          case 'not_in_states':
            return source.filter(e => !e.in_states).length;
        }
        break;

      case 'statistics':
        switch (value) {
          case 'in_statistics':
            return source.filter(e => e.in_statistics_long_term || e.in_statistics_short_term).length;
          case 'not_in_statistics':
            return source.filter(e => !e.in_statistics_long_term && !e.in_statistics_short_term).length;
        }
        break;
    }

    return 0;
  }

  private isFilterDisabled(group: string, value: string): boolean {
    // Check if this filter is currently active
    let isActive = false;
    switch (group) {
      case 'registry':
        isActive = this.activeRegistry === value;
        break;
      case 'state':
        isActive = this.activeState === value;
        break;
      case 'states':
        isActive = this.activeStates === value;
        break;
      case 'statistics':
        isActive = this.activeStatistics === value;
        break;
    }

    // If filter is active, never disable it (allow toggling off)
    if (isActive) {
      return false;
    }

    // Otherwise, disable if count is 0
    return this.getFilterCount(group, value) === 0;
  }

  private handleAction(action: string) {
    this.dispatchEvent(new CustomEvent('action-clicked', {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }

  private handleActionKey(event: KeyboardEvent, action: string) {
    if (action && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.handleAction(action);
    }
  }

  private handleFilterClick(group: string, value: string) {
    this.dispatchEvent(new CustomEvent('filter-changed', {
      detail: { group, value },
      bubbles: true,
      composed: true
    }));
  }

  private handleFilterReset() {
    this.dispatchEvent(new CustomEvent('filter-reset', {
      bubbles: true,
      composed: true
    }));
  }

  private drawChart() {
    const canvas = this.shadowRoot?.getElementById('pie-chart') as HTMLCanvasElement;
    if (!canvas || !this.databaseSize) {
      console.warn('[StorageHealthSummary] Canvas or database size not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[StorageHealthSummary] Could not get canvas 2D context');
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Ensure all values are numbers (handle undefined/null)
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;

    console.log('[StorageHealthSummary] Drawing chart with sizes:', {
      states,
      statsShort,
      statsLong,
      other,
      total
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
      // Draw empty state
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', centerX, centerY);
      return;
    }

    // Create segments array and sort by size (largest first)
    const segments = [
      { size: states, percent: states / total, color: '#2196F3', label: 'States' },
      { size: statsShort, percent: statsShort / total, color: '#FF9800', label: 'Statistics Short-term' },
      { size: statsLong, percent: statsLong / total, color: '#4CAF50', label: 'Statistics Long-term' },
      { size: other, percent: other / total, color: '#9E9E9E', label: 'Other' }
    ].sort((a, b) => b.size - a.size);

    // Start at top (12 o'clock position)
    let currentAngle = -Math.PI / 2;

    // Draw each segment in sorted order
    segments.forEach(segment => {
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (segment.percent * 2 * Math.PI));
      ctx.closePath();
      ctx.fill();
      currentAngle += segment.percent * 2 * Math.PI;
    });
  }

  private renderPieChart() {
    if (!this.databaseSize) {
      console.warn('[StorageHealthSummary] Database size data not available');
      return html`<div class="no-issues">Database size information unavailable<br><small>Click Refresh to load data</small></div>`;
    }

    // Ensure all values are numbers (handle undefined/null)
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;

    console.log('[StorageHealthSummary] Database sizes:', {
      states,
      statsLong,
      statsShort,
      other,
      total
    });

    // Check for invalid data
    if (isNaN(total) || !isFinite(total)) {
      console.error('[StorageHealthSummary] Invalid database size data (NaN/Infinity)');
      return html`<div class="no-issues">Invalid database size data<br><small>Check browser console for details</small></div>`;
    }

    if (total === 0) {
      return html`<div class="no-issues">No database data<br><small>Database appears empty</small></div>`;
    }

    // Define segments in fixed legend order: States, Short-term, Long-term, Other
    const segments = [
      { percent: (states / total) * 100, color: '#2196F3', label: 'States', size: states },
      { percent: (statsShort / total) * 100, color: '#FF9800', label: 'Statistics Short-term', size: statsShort },
      { percent: (statsLong / total) * 100, color: '#4CAF50', label: 'Statistics Long-term', size: statsLong },
      { percent: (other / total) * 100, color: '#9E9E9E', label: 'Other', size: other }
    ];

    // Map segments to their record counts
    const getRecordCount = (label: string): number => {
      switch (label) {
        case 'States': return this.databaseSize?.states || 0;
        case 'Statistics Short-term': return this.databaseSize?.statistics_short_term || 0;
        case 'Statistics Long-term': return this.databaseSize?.statistics || 0;
        case 'Other': return this.databaseSize?.other || 0;
        default: return 0;
      }
    };

    return html`
      <div class="chart-title">Database Storage</div>
      <div class="chart-wrapper">
        <canvas id="pie-chart" width="220" height="220"></canvas>
        <div class="chart-legend">
          ${segments.map(segment => {
            const recordCount = getRecordCount(segment.label);
            return html`
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

  private renderActionSummary() {
    if (!this.summary) {
      return html`<div class="no-issues">Summary data unavailable</div>`;
    }

    const actions = [];
    const deleted = this.summary.deleted_from_registry;
    const unavailableLong = this.getUnavailableLongTerm();
    const disabled = this.summary.registry_disabled;
    const active = this.summary.state_available;
    const total = this.summary.total_entities;

    // Critical: Deleted entities
    if (deleted > 0) {
      const storageMB = this.getActualStorageMB(this.summary.deleted_storage_bytes, deleted);
      actions.push({
        priority: 'critical',
        icon: '🔴',
        text: `${formatNumber(deleted)} deleted entities wasting ${storageMB}MB`,
        action: 'cleanup_deleted',
        button: 'Clean up'
      });
    }

    // Warning: Unavailable long-term
    if (unavailableLong > 0) {
      actions.push({
        priority: 'warning',
        icon: '⚠️',
        text: `${formatNumber(unavailableLong)} entities unavailable for 7+ days`,
        action: 'investigate_unavailable',
        button: 'Investigate'
      });
    }

    // Warning: Disabled entities
    if (disabled > 0) {
      const potentialMB = this.getActualStorageMB(this.summary.disabled_storage_bytes, disabled);
      actions.push({
        priority: 'warning',
        icon: '⚠️',
        text: `${formatNumber(disabled)} disabled entities using ${potentialMB}MB`,
        action: 'review_disabled',
        button: 'Review'
      });
    }

    // Warning: Numeric sensors missing statistics
    // Count sensor entities that are numeric but don't have statistics recorded
    const sensorsMissingStats = this.entities.filter(e =>
      e.entity_id.startsWith('sensor.') &&
      e.in_states_meta &&
      !e.in_statistics_meta &&
      // Exclude non-numeric sensors
      e.statistics_eligibility_reason &&
      !e.statistics_eligibility_reason.includes("is not numeric")
    ).length;

    if (sensorsMissingStats > 0) {
      actions.push({
        priority: 'warning',
        icon: '⚠️',
        text: `${formatNumber(sensorsMissingStats)} numeric sensors missing statistics`,
        action: 'review_numeric_sensors',
        button: 'Review'
      });
    }

    // Success: Healthy entities
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    actions.push({
      priority: 'success',
      icon: '✅',
      text: `${formatNumber(active)} entities active and healthy (${activePercent}%)`,
      action: null,
      button: null
    });

    if (actions.length === 1 && actions[0].priority === 'success') {
      return html`
        <div class="no-issues">
          ✓ All systems healthy<br>
          ${formatNumber(active)} active entities
        </div>
      `;
    }

    return html`
      <div class="action-list">
        ${actions.map(item => {
          const isClickable = !!item.action;
          return html`
            <div
              class="action-item ${item.priority} ${isClickable ? 'clickable' : ''}"
              role=${isClickable ? 'button' : 'presentation'}
              tabindex=${isClickable ? '0' : '-1'}
              @click=${isClickable ? () => this.handleAction(item.action!) : null}
              @keydown=${isClickable ? (e: KeyboardEvent) => this.handleActionKey(e, item.action!) : null}
            >
              <span class="action-icon">${item.icon}</span>
              <span class="action-text">${item.text}</span>
              ${item.button ? html`
                <span class="action-btn">${item.button}</span>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  render() {
    if (!this.summary) {
      return html`<div class="loading">Loading status summary...</div>`;
    }

    return html`
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

        <!-- Column 3: Filter Panel -->
        <div class="column filter-panel-column">
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
                class="filter-btn ${this.activeRegistry === 'Enabled' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('registry', 'Enabled')}
                @click=${() => this.handleFilterClick('registry', 'Enabled')}
              >Enabled (${this.getFilterCount('registry', 'Enabled')})</button>
              <button
                class="filter-btn ${this.activeRegistry === 'Disabled' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('registry', 'Disabled')}
                @click=${() => this.handleFilterClick('registry', 'Disabled')}
              >Disabled (${this.getFilterCount('registry', 'Disabled')})</button>
              <button
                class="filter-btn ${this.activeRegistry === 'Not in Registry' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('registry', 'Not in Registry')}
                @click=${() => this.handleFilterClick('registry', 'Not in Registry')}
              >Not present (${this.getFilterCount('registry', 'Not in Registry')})</button>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-group-label">State machine:</div>
            <div class="filter-buttons">
              <button
                class="filter-btn ${this.activeState === 'Available' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('state', 'Available')}
                @click=${() => this.handleFilterClick('state', 'Available')}
              >Available (${this.getFilterCount('state', 'Available')})</button>
              <button
                class="filter-btn ${this.activeState === 'Unavailable' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('state', 'Unavailable')}
                @click=${() => this.handleFilterClick('state', 'Unavailable')}
              >Unavailable (${this.getFilterCount('state', 'Unavailable')})</button>
              <button
                class="filter-btn ${this.activeState === 'Not Present' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('state', 'Not Present')}
                @click=${() => this.handleFilterClick('state', 'Not Present')}
              >Not present (${this.getFilterCount('state', 'Not Present')})</button>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-group-label">States:</div>
            <div class="filter-buttons">
              <button
                class="filter-btn ${this.activeStates === 'in_states' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('states', 'in_states')}
                @click=${() => this.handleFilterClick('states', 'in_states')}
              >In states (${this.getFilterCount('states', 'in_states')})</button>
              <button
                class="filter-btn ${this.activeStates === 'not_in_states' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('states', 'not_in_states')}
                @click=${() => this.handleFilterClick('states', 'not_in_states')}
              >Not in states (${this.getFilterCount('states', 'not_in_states')})</button>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-group-label">Statistics:</div>
            <div class="filter-buttons">
              <button
                class="filter-btn ${this.activeStatistics === 'in_statistics' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('statistics', 'in_statistics')}
                @click=${() => this.handleFilterClick('statistics', 'in_statistics')}
              >In statistics (${this.getFilterCount('statistics', 'in_statistics')})</button>
              <button
                class="filter-btn ${this.activeStatistics === 'not_in_statistics' ? 'active' : ''}"
                ?disabled=${this.isFilterDisabled('statistics', 'not_in_statistics')}
                @click=${() => this.handleFilterClick('statistics', 'not_in_statistics')}
              >Not in statistics (${this.getFilterCount('statistics', 'not_in_statistics')})</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Draw chart when databaseSize changes
    if (changedProperties.has('databaseSize') && this.databaseSize) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => this.drawChart());
    }
  }
}

// Register the custom element only if not already registered
if (!customElements.get('storage-health-summary')) {
  customElements.define('storage-health-summary', StorageHealthSummary);
}
