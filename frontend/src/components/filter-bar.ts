/**
 * FilterBar component
 * Handles filtering and search functionality
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';
import { debounce } from '../services/timing-utils';

interface FilterButton {
  id: string;
  label: string;
  active?: boolean;
}

export class FilterBar extends LitElement {
  @property({ type: Array }) filters: FilterButton[] = [];
  @property({ type: Boolean }) showSearch = false;
  @property({ type: String }) searchPlaceholder = 'Search entities...';
  @property({ type: String}) searchValue = '';
  @property({ type: Boolean }) showClearButton = false;

  static styles = [
    sharedStyles,
    css`
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

  private debouncedSearch = debounce((value: string) => {
    this.dispatchEvent(new CustomEvent('search-changed', {
      detail: { query: value },
      bubbles: true,
      composed: true
    }));
  }, 300);

  private handleFilterClick(filterId: string) {
    this.dispatchEvent(new CustomEvent('filter-clicked', {
      detail: { filterId },
      bubbles: true,
      composed: true
    }));
  }

  private handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchValue = input.value;
    this.debouncedSearch(this.searchValue);
  }

  private handleClearFilters() {
    this.searchValue = '';
    this.dispatchEvent(new CustomEvent('clear-filters', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="filter-container">
        ${this.filters.map(filter => html`
          <button
            class="filter-button ${filter.active ? 'active' : ''}"
            @click=${() => this.handleFilterClick(filter.id)}
          >
            ${filter.label}
          </button>
        `)}

        ${this.showSearch ? html`
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
        ` : ''}

        ${this.showClearButton ? html`
          <button
            class="secondary-button clear-button"
            @click=${this.handleClearFilters}
          >
            Clear Filters
          </button>
        ` : ''}
      </div>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('filter-bar')) {
  customElements.define('filter-bar', FilterBar);
}
