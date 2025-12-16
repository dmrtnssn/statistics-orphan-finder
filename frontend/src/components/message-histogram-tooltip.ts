/**
 * Message Histogram Tooltip
 * Shows a CSS bar chart of hourly message counts with configurable time range
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ApiService } from '../services/api-service';
import { formatInterval, formatFullTimestamp } from '../services/formatters';
import type { HomeAssistant } from '../types';
import { sharedStyles } from '../styles/shared-styles';

export class MessageHistogramTooltip extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: String }) entityId!: string;
  @property({ type: String }) lastUpdate: string | null = null;
  @state() private timeRange: 24 | 48 | 168 = 24;
  @state() private loading = false;
  @state() private hourlyCounts: number[] = [];
  @state() private totalMessages = 0;
  @state() private error: string | null = null;
  private currentLoadRequest = 0; // Track request sequence to prevent race conditions
  private _isDisconnected = false; // Prevent state updates after component is removed from DOM

  static styles = [
    sharedStyles,
    css`
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

  async connectedCallback() {
    super.connectedCallback();
    this._isDisconnected = false; // Reset flag when component is (re)connected
    await this.loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._isDisconnected = true; // Prevent pending async operations from updating state
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Reload data if entityId changes
    if (changedProperties.has('entityId')) {
      this.loadData();
    }
  }

  private async loadData() {
    // Don't start loading if already disconnected
    if (this._isDisconnected) return;

    this.loading = true;
    this.error = null;

    // Increment request counter to identify this specific request
    this.currentLoadRequest++;
    const thisRequestId = this.currentLoadRequest;

    const apiService = new ApiService(this.hass);

    try {
      const data = await apiService.fetchMessageHistogram(this.entityId, this.timeRange);

      // Only update state if this is still the latest request AND component is still connected
      // Prevents race condition when quickly hovering between entities
      // Prevents memory leak when component is removed before request completes
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        this.hourlyCounts = data.hourly_counts;
        this.totalMessages = data.total_messages;
      }
    } catch (err) {
      // Only update error if this is still the latest request AND component is still connected
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        console.error('Failed to load histogram:', err);
        this.error = err instanceof Error ? err.message : 'Failed to load data';
      }
    } finally {
      // Only clear loading if this is still the latest request AND component is still connected
      if (thisRequestId === this.currentLoadRequest && !this._isDisconnected) {
        this.loading = false;
      }
    }
  }

  private async handleTimeRangeChange(range: 24 | 48 | 168) {
    if (this.timeRange === range) return;
    this.timeRange = range;
    await this.loadData();
  }

  render() {
    return html`
      <div class="header">
        <div class="entity-name" title="${this.entityId}">${this.entityId}</div>
        <div class="time-selector">
          <button
            class="time-btn ${this.timeRange === 24 ? 'active' : ''}"
            @click=${() => this.handleTimeRangeChange(24)}
            ?disabled=${this.loading}
          >24h</button>
          <button
            class="time-btn ${this.timeRange === 48 ? 'active' : ''}"
            @click=${() => this.handleTimeRangeChange(48)}
            ?disabled=${this.loading}
          >48h</button>
          <button
            class="time-btn ${this.timeRange === 168 ? 'active' : ''}"
            @click=${() => this.handleTimeRangeChange(168)}
            ?disabled=${this.loading}
          >7d</button>
        </div>
      </div>

      ${this.renderContent()}
    `;
  }

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (this.hourlyCounts.length === 0) {
      return html`<div class="stats">No data available</div>`;
    }

    const maxCount = Math.max(...this.hourlyCounts, 1);
    const avgPerHour = this.totalMessages / this.timeRange;

    // Get current hour start (aligned to clock hours)
    const now = new Date();
    const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);

    return html`
      <div class="chart">
        ${this.hourlyCounts.map((count, index) => {
          const height = (count / maxCount) * 100;
          const isEmpty = count === 0;

          // Calculate the time range for this hour bucket
          // index 0 = oldest hour, index N-1 = most recent (incomplete) hour
          // Buckets are aligned to clock hours (e.g., 14:00-15:00, 15:00-16:00)
          const hoursFromStart = index;
          const startTime = new Date(currentHourStart.getTime() - ((this.hourlyCounts.length - hoursFromStart) * 3600 * 1000));
          const endTime = new Date(startTime.getTime() + (3600 * 1000));

          const timeRangeStr = `${this.formatTime(startTime)}-${this.formatTime(endTime)}`;

          // Calculate interval for this hour (average seconds between messages)
          const intervalSeconds = count > 0 ? Math.round(3600 / count) : 0;
          const intervalStr = formatInterval(intervalSeconds);

          const tooltipText = count > 0
            ? `${count} messages (I: ${intervalStr}) ${timeRangeStr}`
            : `0 messages ${timeRangeStr}`;

          return html`
            <div
              class="bar ${isEmpty ? 'empty' : ''}"
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

      ${this.lastUpdate ? html`
        <div class="timestamp">
          Last update: ${formatFullTimestamp(this.lastUpdate)}
        </div>
      ` : ''}
    `;
  }

  /**
   * Format time as HH:MM
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('message-histogram-tooltip')) {
  customElements.define('message-histogram-tooltip', MessageHistogramTooltip);
}
