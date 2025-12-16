/**
 * DatabasePieChart - Reusable pie chart for visualizing database storage breakdown
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber, formatBytes } from '../services/formatters';
import type { DatabaseSize } from '../types';

export class DatabasePieChart extends LitElement {
  @property({ type: Object }) databaseSize: DatabaseSize | null = null;

  static styles = [
    sharedStyles,
    css`
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

  private drawChart() {
    const canvas = this.shadowRoot?.getElementById('pie-chart') as HTMLCanvasElement;
    if (!canvas || !this.databaseSize) {
      console.warn('[DatabasePieChart] Canvas or database size not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[DatabasePieChart] Could not get canvas 2D context');
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

    console.log('[DatabasePieChart] Drawing chart with sizes:', {
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

  render() {
    if (!this.databaseSize) {
      console.warn('[DatabasePieChart] Database size data not available');
      return html`<div class="no-data">Database size information unavailable<br><small>Click Refresh to load data</small></div>`;
    }

    // Ensure all values are numbers (handle undefined/null)
    const states = this.databaseSize.states_size || 0;
    const statsLong = this.databaseSize.statistics_size || 0;
    const statsShort = this.databaseSize.statistics_short_term_size || 0;
    const other = this.databaseSize.other_size || 0;
    const total = states + statsLong + statsShort + other;

    console.log('[DatabasePieChart] Database sizes:', {
      states,
      statsLong,
      statsShort,
      other,
      total
    });

    // Check for invalid data
    if (isNaN(total) || !isFinite(total)) {
      console.error('[DatabasePieChart] Invalid database size data (NaN/Infinity)');
      return html`<div class="no-data">Invalid database size data<br><small>Check browser console for details</small></div>`;
    }

    if (total === 0) {
      return html`<div class="no-data">No database data<br><small>Database appears empty</small></div>`;
    }

    // Define segments and sort by size (largest first) to match pie chart order
    const segments = [
      { percent: (states / total) * 100, color: '#2196F3', label: 'States', size: states },
      { percent: (statsShort / total) * 100, color: '#FF9800', label: 'Statistics Short-term', size: statsShort },
      { percent: (statsLong / total) * 100, color: '#4CAF50', label: 'Statistics Long-term', size: statsLong },
      { percent: (other / total) * 100, color: '#9E9E9E', label: 'Other', size: other }
    ].sort((a, b) => b.size - a.size);

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
if (!customElements.get('database-pie-chart')) {
  customElements.define('database-pie-chart', DatabasePieChart);
}
