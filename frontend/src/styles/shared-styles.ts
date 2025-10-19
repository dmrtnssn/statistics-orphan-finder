/**
 * Shared CSS styles for all components
 * Uses Home Assistant CSS custom properties for theming
 */

import { css } from 'lit';

export const sharedStyles = css`
  /* Base styles */
  :host {
    display: block;
    font-family: var(--paper-font-body1_-_font-family);
    color: var(--primary-text-color);
  }

  /* Cards and containers */
  .card {
    background: var(--card-background-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  /* Typography */
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Buttons */
  button {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background: var(--dark-primary-color);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .secondary-button:hover {
    background: var(--divider-color);
  }

  /* Table styles */
  .table-container {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
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
    background: var(--table-header-background-color, var(--secondary-background-color));
    color: var(--primary-text-color);
    padding: 12px 8px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    background: var(--divider-color);
  }

  td {
    padding: 12px 8px;
    border-bottom: 1px solid var(--divider-color);
  }

  tr:hover td {
    background: var(--table-row-background-hover-color, var(--secondary-background-color));
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

  /* Status badges */
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-enabled,
  .status-available {
    color: var(--success-color, #4CAF50);
  }

  .status-disabled,
  .status-unavailable {
    color: var(--warning-color, #FF9800);
  }

  .status-deleted,
  .status-not-in-registry,
  .status-not-present {
    color: var(--error-color, #F44336);
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

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  /* Summary grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stats-card {
    background: var(--card-background-color);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
    transition: all 0.3s;
  }

  .stats-card.clickable {
    cursor: pointer;
  }

  .stats-card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px 0 rgba(0, 0, 0, 0.2));
  }

  .stats-card.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.2));
    border: 1px solid rgba(255, 193, 7, 0.5);
  }

  .stats-value {
    font-size: 28px;
    font-weight: 300;
    color: var(--primary-text-color);
    margin: 8px 0;
  }

  .stats-subtitle {
    font-size: 12px;
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
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .filter-button:hover {
    background: var(--divider-color);
  }

  .filter-button.active {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.3));
    border-color: rgba(255, 193, 7, 0.8);
    color: var(--primary-text-color);
  }

  /* Search box */
  .search-box {
    flex: 1;
    min-width: 200px;
  }

  input[type="search"],
  input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  /* Modals */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    max-width: 90%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--divider-color);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: var(--primary-text-color);
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
