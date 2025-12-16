/**
 * HealthActionList - Displays prioritized action items based on health analysis
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { formatNumber } from '../services/formatters';
import type { StorageSummary, StorageEntity } from '../types';

export class HealthActionList extends LitElement {
  @property({ type: Object }) summary: StorageSummary | null = null;
  @property({ type: Array }) entities: StorageEntity[] = [];

  static styles = [
    sharedStyles,
    css`
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

  private handleActionKey(event: KeyboardEvent, action: string) {
    if (action && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.handleAction(action);
    }
  }

  render() {
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
        <div class="summary-title">Summary</div>
        <div class="no-issues">
          ✓ All systems healthy<br>
          ${formatNumber(active)} active entities
        </div>
      `;
    }

    return html`
      <div class="summary-title">Summary</div>
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
}

// Register the custom element only if not already registered
if (!customElements.get('health-action-list')) {
  customElements.define('health-action-list', HealthActionList);
}
