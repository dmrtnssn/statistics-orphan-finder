/**
 * Shared CSS styles for all components
 * Uses Home Assistant CSS custom properties for theming
 */

import { css } from 'lit';

export const sharedStyles = css`
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
    background: var(--gradient-hover);
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
