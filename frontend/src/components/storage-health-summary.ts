/**
 * StorageHealthSummary - 3-Column Layout with Pie Chart & Action Summary
 * Column 1: Database size pie chart | Column 2: Action summary | Column 3: Placeholder
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber, formatBytes } from '../services/formatters';
import type { StorageSummary, StorageEntity, DatabaseSize } from '../types';

@customElement('storage-health-summary')
export class StorageHealthSummary extends LitElement {
  @property({ type: Object }) summary: StorageSummary | null = null;
  @property({ type: Array }) entities: StorageEntity[] = [];
  @property({ type: Object }) databaseSize: DatabaseSize | null = null;
  @property({ type: String }) activeFilter: string | null = null;

  static styles = [
    sharedStyles,
    css`
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

  private handleAction(action: string) {
    this.dispatchEvent(new CustomEvent('action-clicked', {
      detail: { action },
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
    const onlyStates = this.summary.only_in_states;
    const onlyStats = this.summary.only_in_statistics;
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

    // Warning: Single storage system
    if (onlyStates > 0 || onlyStats > 0) {
      const totalSingle = onlyStates + onlyStats;
      actions.push({
        priority: 'warning',
        icon: '⚠️',
        text: `${formatNumber(totalSingle)} entities in single storage (${formatNumber(onlyStates)} states, ${formatNumber(onlyStats)} stats)`,
        action: 'optimize_storage',
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
        ${actions.map(item => html`
          <div class="action-item ${item.priority}">
            <span class="action-icon">${item.icon}</span>
            <span class="action-text">${item.text}</span>
            ${item.button ? html`
              <button class="action-btn" @click=${() => this.handleAction(item.action!)}>
                ${item.button}
              </button>
            ` : ''}
          </div>
        `)}
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

        <!-- Column 3: Placeholder -->
        <div class="column placeholder-column">
          Reserved for<br>future features
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
