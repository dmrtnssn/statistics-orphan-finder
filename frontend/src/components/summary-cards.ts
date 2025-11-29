/**
 * SummaryCards component
 * Displays summary statistics in card format
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { sharedStyles } from '../styles/shared-styles';

export interface SummaryCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  clickable?: boolean;
  active?: boolean;
  subtotals?: {
    label: string;
    value: string | number;
    clickable?: boolean;
    active?: boolean;
    color?: string;
  }[];
}

export class SummaryCards extends LitElement {
  @property({ type: Array }) cards: SummaryCard[] = [];
  @property({ type: Number }) columns = 4;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .cards-container {
        display: grid;
        gap: var(--spacing-lg, 16px);
        margin-bottom: var(--spacing-lg, 16px);
      }

      .cards-container.cols-2 {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .cards-container.cols-4 {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .card-value {
        cursor: default;
      }

      .card-value.clickable {
        cursor: pointer;
        color: var(--primary-color);
      }

      .card-value.clickable:hover {
        text-decoration: underline;
      }

      .card-subtotals {
        margin-top: 8px;
        font-size: 12px;
      }

      .card-subtotal {
        cursor: default;
      }

      .card-subtotal.clickable {
        cursor: pointer;
      }

      .card-subtotal.clickable:hover {
        text-decoration: underline;
      }

      .card-subtotal.active {
        font-weight: 600;
      }
    `
  ];

  private handleCardClick(cardId: string) {
    const card = this.cards.find(c => c.id === cardId);
    if (card?.clickable) {
      this.dispatchEvent(new CustomEvent('card-clicked', {
        detail: { cardId },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleSubtotalClick(cardId: string, subtotalLabel: string) {
    this.dispatchEvent(new CustomEvent('subtotal-clicked', {
      detail: { cardId, subtotalLabel },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="cards-container cols-${this.columns}">
        ${this.cards.map(card => html`
          <div class="stats-card ${card.active ? 'active' : ''}">
            <h2>${card.title}</h2>
            <div
              class="stats-value ${card.clickable ? 'clickable' : ''}"
              @click=${() => card.clickable && this.handleCardClick(card.id)}
            >
              ${card.value}
            </div>
            ${card.subtitle ? html`
              <div class="stats-subtitle">${card.subtitle}</div>
            ` : ''}
            ${card.subtotals && card.subtotals.length > 0 ? html`
              <div class="card-subtotals">
                ${card.subtotals.map(subtotal => html`
                  <div
                    class="card-subtotal ${subtotal.clickable ? 'clickable' : ''} ${subtotal.active ? 'active' : ''}"
                    style=${subtotal.color ? `color: ${subtotal.color}` : ''}
                    @click=${() => subtotal.clickable && this.handleSubtotalClick(card.id, subtotal.label)}
                  >
                    ${subtotal.label}: ${subtotal.value}
                  </div>
                `)}
              </div>
            ` : ''}
          </div>
        `)}
      </div>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('summary-cards')) {
  customElements.define('summary-cards', SummaryCards);
}
