/**
 * SkeletonLoader - Modern loading placeholder for tables
 * Shows animated skeleton rows while data loads
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class SkeletonLoader extends LitElement {
  @property({ type: Number }) rows = 10;
  @property({ type: Number }) columns = 15;

  static styles = css`
    :host {
      display: block;
    }

    .skeleton-table {
      width: 100%;
      border-spacing: 0;
    }

    .skeleton-row {
      height: 48px;
    }

    .skeleton-cell {
      padding: var(--spacing-md, 12px);
    }

    .skeleton-line {
      height: 12px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--divider-color) 30%, transparent) 0%,
        color-mix(in srgb, var(--divider-color) 50%, transparent) 50%,
        color-mix(in srgb, var(--divider-color) 30%, transparent) 100%
      );
      background-size: 200% 100%;
      border-radius: var(--radius-sm, 6px);
      animation: shimmer 1.5s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Vary widths for realism */
    .skeleton-cell:nth-child(1) .skeleton-line { width: 80%; }
    .skeleton-cell:nth-child(2) .skeleton-line { width: 60%; }
    .skeleton-cell:nth-child(3) .skeleton-line { width: 90%; }
    .skeleton-cell:nth-child(4) .skeleton-line { width: 70%; }
    .skeleton-cell:nth-child(5) .skeleton-line { width: 85%; }
    .skeleton-cell:nth-child(6) .skeleton-line { width: 65%; }
    .skeleton-cell:nth-child(7) .skeleton-line { width: 75%; }
    .skeleton-cell:nth-child(8) .skeleton-line { width: 80%; }
    .skeleton-cell:nth-child(9) .skeleton-line { width: 70%; }
    .skeleton-cell:nth-child(10) .skeleton-line { width: 60%; }
    .skeleton-cell:nth-child(11) .skeleton-line { width: 90%; }
    .skeleton-cell:nth-child(12) .skeleton-line { width: 65%; }
    .skeleton-cell:nth-child(13) .skeleton-line { width: 75%; }
    .skeleton-cell:nth-child(14) .skeleton-line { width: 85%; }
    .skeleton-cell:nth-child(15) .skeleton-line { width: 70%; }
  `;

  render() {
    return html`
      <table class="skeleton-table">
        <tbody>
          ${Array(this.rows).fill(0).map(() => html`
            <tr class="skeleton-row">
              ${Array(this.columns).fill(0).map(() => html`
                <td class="skeleton-cell">
                  <div class="skeleton-line"></div>
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

// Register the custom element only if not already registered
if (!customElements.get('skeleton-loader')) {
  customElements.define('skeleton-loader', SkeletonLoader);
}
