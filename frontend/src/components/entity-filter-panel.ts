/**
 * EntityFilterPanel - Filter panel for entity table with multi-dimensional filtering
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import type { StorageEntity } from '../types';

export class EntityFilterPanel extends LitElement {
  @property({ type: Array }) entities: StorageEntity[] = [];
  @property({ type: String }) activeRegistry: string | null = null;
  @property({ type: String }) activeState: string | null = null;
  @property({ type: String }) activeStates: string | null = null;
  @property({ type: String }) activeStatistics: string | null = null;

  static styles = [
    sharedStyles,
    css`
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

  render() {
    return html`
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
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('entity-filter-panel')) {
  customElements.define('entity-filter-panel', EntityFilterPanel);
}
