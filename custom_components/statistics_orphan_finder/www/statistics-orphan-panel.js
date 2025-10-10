class StatisticsOrphanPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.orphansData = [];
    this.storageOverviewData = [];
    this.storageOverviewSummary = {};
    this.currentView = 'orphans'; // 'orphans' or 'storage'
    this.sortColumn = 'entity_id';
    this.sortDirection = 'asc';
    this.storageSortStack = [{column: 'entity_id', direction: 'asc'}]; // Multi-column sort stack
    this.statusFilter = 'all'; // all, deleted, unavailable
    this.storageFilter = 'all'; // all, in_registry, not_in_registry, deleted
    this.storageAdvancedFilter = 'all'; // all, sync_issues, only_states, only_stats, orphaned_metadata
    this.registryStatusFilter = null; // null, 'Enabled', 'Disabled'
    this.stateStatusFilter = null; // null, 'Available', 'Unavailable'
    this.searchQuery = '';
    this.loadingProgress = 0;
    this.loadingStatus = '';
    this.databaseSize = { states: 0, statistics: 0, statistics_short_term: 0, other: 0 };
    this.deletedOrphanStorage = 0;
    this.unavailableOrphanStorage = 0;
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.render();
    }
  }

  sortData(column) {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.orphansData.sort((a, b) => {
      let aVal, bVal;

      if (column === 'entity_id') {
        aVal = a.entity_id.toLowerCase();
        bVal = b.entity_id.toLowerCase();
      } else if (column === 'status') {
        aVal = a.status;
        bVal = b.status;
      } else if (column === 'origin') {
        aVal = a.origin;
        bVal = b.origin;
      } else if (column === 'last_update') {
        aVal = a.last_update ? new Date(a.last_update).getTime() : 0;
        bVal = b.last_update ? new Date(b.last_update).getTime() : 0;
      } else {
        aVal = a.count;
        bVal = b.count;
      }

      if (column === 'entity_id' || column === 'status' || column === 'origin') {
        // String comparison
        if (this.sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      } else {
        // Numeric/Date comparison
        if (this.sortDirection === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      }
    });

    this.renderTable();
  }

  getFilteredData() {
    if (this.statusFilter === 'all') {
      return this.orphansData;
    }
    return this.orphansData.filter(orphan => orphan.status === this.statusFilter);
  }

  renderTable() {
    const tableBody = this.shadowRoot.getElementById('orphan-table-body');
    const totalEl = this.shadowRoot.getElementById('total-orphans');
    const deletedEl = this.shadowRoot.getElementById('deleted-count');
    const unavailableEl = this.shadowRoot.getElementById('unavailable-count');

    // Clear table
    tableBody.innerHTML = '';

    // Update counts
    const deletedCount = this.orphansData.filter(o => o.status === 'deleted').length;
    const unavailableCount = this.orphansData.filter(o => o.status === 'unavailable').length;

    totalEl.textContent = this.orphansData.length.toLocaleString();
    deletedEl.textContent = deletedCount.toLocaleString();
    unavailableEl.textContent = unavailableCount.toLocaleString();

    // Update storage cards
    const deletedStorageEl = this.shadowRoot.getElementById('deleted-storage');
    const unavailableStorageEl = this.shadowRoot.getElementById('unavailable-storage');

    deletedStorageEl.textContent = this.formatBytes(this.deletedOrphanStorage);
    unavailableStorageEl.textContent = this.formatBytes(this.unavailableOrphanStorage);

    const filteredData = this.getFilteredData();

    if (filteredData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No orphaned entities found</td></tr>';
    } else {
      filteredData.forEach(orphan => {
        const row = document.createElement('tr');
        const statusBadge = orphan.status === 'deleted'
          ? '<span class="status-badge status-deleted">Deleted</span>'
          : '<span class="status-badge status-unavailable">Unavailable</span>';

        // Origin badge
        let originBadge = '';
        if (orphan.origin === 'Long-term') {
          originBadge = '<span class="origin-badge origin-long-term">Long-term</span>';
        } else if (orphan.origin === 'Short-term') {
          originBadge = '<span class="origin-badge origin-short-term">Short-term</span>';
        } else if (orphan.origin === 'Both') {
          originBadge = '<span class="origin-badge origin-both">Both</span>';
        }

        // Format last_update date
        let lastUpdateFormatted = 'N/A';
        if (orphan.last_update) {
          const date = new Date(orphan.last_update);
          lastUpdateFormatted = date.toLocaleString();
        }

        row.innerHTML = `
          <td><span class="entity-id-link" data-entity-id="${orphan.entity_id}">${orphan.entity_id}</span></td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">${originBadge}</td>
          <td style="text-align: center;">${lastUpdateFormatted}</td>
          <td style="text-align: right;">${orphan.count.toLocaleString()}</td>
          <td style="text-align: center;">
            <button class="remove-btn" data-entity-id="${orphan.entity_id}" data-metadata-id="${orphan.metadata_id}" data-origin="${orphan.origin}">Remove</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Add event listeners to all remove buttons
      this.shadowRoot.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const entityId = e.target.dataset.entityId;
          const metadataId = e.target.dataset.metadataId;
          const origin = e.target.dataset.origin;
          this.showDeleteModal(entityId, metadataId, origin);
        });
      });

      // Add event listeners to all entity ID links
      this.shadowRoot.querySelectorAll('.entity-id-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const entityId = e.target.dataset.entityId;
          this.showMoreInfo(entityId);
        });
      });
    }

    // Update sort indicators
    this.updateSortIndicators();
  }

  updateSortIndicators() {
    const entityHeader = this.shadowRoot.getElementById('header-entity-id');
    const statusHeader = this.shadowRoot.getElementById('header-status');
    const originHeader = this.shadowRoot.getElementById('header-origin');
    const lastUpdateHeader = this.shadowRoot.getElementById('header-last-update');
    const countHeader = this.shadowRoot.getElementById('header-count');

    // Remove all existing indicators
    entityHeader.classList.remove('sorted-asc', 'sorted-desc');
    statusHeader.classList.remove('sorted-asc', 'sorted-desc');
    originHeader.classList.remove('sorted-asc', 'sorted-desc');
    lastUpdateHeader.classList.remove('sorted-asc', 'sorted-desc');
    countHeader.classList.remove('sorted-asc', 'sorted-desc');

    // Add indicator to current sorted column
    const sortClass = this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc';
    if (this.sortColumn === 'entity_id') {
      entityHeader.classList.add(sortClass);
    } else if (this.sortColumn === 'status') {
      statusHeader.classList.add(sortClass);
    } else if (this.sortColumn === 'origin') {
      originHeader.classList.add(sortClass);
    } else if (this.sortColumn === 'last_update') {
      lastUpdateHeader.classList.add(sortClass);
    } else {
      countHeader.classList.add(sortClass);
    }
  }

  updateLoadingProgress(progress, status) {
    this.loadingProgress = progress;
    this.loadingStatus = status;

    const refreshBtn = this.shadowRoot.getElementById('refresh-btn');
    const statusText = this.shadowRoot.getElementById('loading-status-text');

    refreshBtn.style.setProperty('--progress', `${progress}%`);
    statusText.textContent = status;

    if (progress >= 100) {
      refreshBtn.disabled = false;
      setTimeout(() => {
        refreshBtn.style.setProperty('--progress', '0%');
        statusText.textContent = '';
      }, 1000);
    } else {
      refreshBtn.disabled = true;
    }
  }

  async loadDatabaseSize() {
    this.updateLoadingProgress(10, 'Loading database size...');

    try {
      const response = await fetch('/api/statistics_orphan_finder?action=database_size', {
        headers: {
          'Authorization': `Bearer ${this._hass.auth.data.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load database size');
      }

      const data = await response.json();
      this.databaseSize = data;
      this.renderDatabaseChart();

    } catch (error) {
      console.error('Error loading database size:', error);
    }
  }

  async loadOrphans() {
    this.updateLoadingProgress(0, 'Starting...');

    try {
      // Step 1: Load database size
      await this.loadDatabaseSize();
      this.updateLoadingProgress(30, 'Loading orphaned entities...');

      // Step 2: Load orphans
      const response = await fetch('/api/statistics_orphan_finder?action=list', {
        headers: {
          'Authorization': `Bearer ${this._hass.auth.data.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load orphans');
      }

      this.updateLoadingProgress(70, 'Processing data...');

      const data = await response.json();
      this.orphansData = data.orphans || [];
      this.deletedOrphanStorage = data.deleted_storage || 0;
      this.unavailableOrphanStorage = data.unavailable_storage || 0;

      this.updateLoadingProgress(90, 'Rendering table...');

      // Sort and render
      this.sortData(this.sortColumn);

      this.updateLoadingProgress(100, 'Complete!');

    } catch (error) {
      this.updateLoadingProgress(0, 'Error: ' + error.message);
      this.orphansData = [];
      this.deletedOrphanStorage = 0;
      this.unavailableOrphanStorage = 0;
      this.renderTable();
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async showDeleteModal(entityId, metadataId, origin) {
    const modal = this.shadowRoot.getElementById('delete-modal');
    const modalTitle = this.shadowRoot.getElementById('modal-entity-id');
    const sqlBlock = this.shadowRoot.getElementById('modal-sql');
    const storageInfo = this.shadowRoot.getElementById('modal-storage-info');
    const copyBtn = this.shadowRoot.getElementById('copy-sql-btn');

    modalTitle.textContent = entityId;

    // Fetch SQL from API
    try {
      const response = await fetch(`/api/statistics_orphan_finder?action=generate_delete_sql&metadata_id=${metadataId}&origin=${encodeURIComponent(origin)}`, {
        headers: {
          'Authorization': `Bearer ${this._hass.auth.data.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate SQL');
      }

      const data = await response.json();
      sqlBlock.textContent = data.sql;

      // Display storage savings
      if (data.storage_saved && data.storage_saved > 0) {
        storageInfo.textContent = `💾 Storage to be freed: ${this.formatBytes(data.storage_saved)}`;
        storageInfo.style.display = 'block';
      } else {
        storageInfo.style.display = 'none';
      }

      // Setup copy button
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(data.sql).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy to Clipboard';
          }, 2000);
        });
      };

      // Show modal
      modal.style.display = 'flex';
    } catch (error) {
      console.error('Error generating SQL:', error);
      sqlBlock.textContent = 'Error generating SQL statement';
      storageInfo.style.display = 'none';
      modal.style.display = 'flex';
    }
  }

  closeDeleteModal() {
    const modal = this.shadowRoot.getElementById('delete-modal');
    modal.style.display = 'none';
  }

  showMoreInfo(entityId) {
    // Fire the hass-more-info event to show Home Assistant's entity popup dialog
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId }
    });
    this.dispatchEvent(event);
  }

  renderDatabaseChart() {
    const canvas = this.shadowRoot.getElementById('db-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Update legend values
    const statesCountEl = this.shadowRoot.getElementById('states-count');
    const statisticsCountEl = this.shadowRoot.getElementById('statistics-count');
    const statisticsShortTermCountEl = this.shadowRoot.getElementById('statistics-short-term-count');
    const otherCountEl = this.shadowRoot.getElementById('other-count');

    const statesSize = this.databaseSize.states_size || 0;
    const statisticsSize = this.databaseSize.statistics_size || 0;
    const statisticsShortTermSize = this.databaseSize.statistics_short_term_size || 0;
    const otherSize = this.databaseSize.other_size || 0;

    statesCountEl.textContent = `${this.databaseSize.states.toLocaleString()} records - ${this.formatBytes(statesSize)}`;
    statisticsCountEl.textContent = `${this.databaseSize.statistics.toLocaleString()} records - ${this.formatBytes(statisticsSize)}`;
    statisticsShortTermCountEl.textContent = `${this.databaseSize.statistics_short_term.toLocaleString()} records - ${this.formatBytes(statisticsShortTermSize)}`;
    otherCountEl.textContent = `${this.databaseSize.other.toLocaleString()} records - ${this.formatBytes(otherSize)}`;

    // Calculate total and percentages
    const total = this.databaseSize.states + this.databaseSize.statistics + this.databaseSize.statistics_short_term + this.databaseSize.other;

    if (total === 0) {
      // Draw empty state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', centerX, centerY);
      return;
    }

    const statesPercent = this.databaseSize.states / total;
    const statsPercent = this.databaseSize.statistics / total;
    const statsShortTermPercent = this.databaseSize.statistics_short_term / total;
    const otherPercent = this.databaseSize.other / total;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pie chart
    let currentAngle = -Math.PI / 2; // Start at top

    // States (blue)
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (statesPercent * 2 * Math.PI));
    ctx.closePath();
    ctx.fill();
    currentAngle += statesPercent * 2 * Math.PI;

    // Statistics Long-term (green)
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (statsPercent * 2 * Math.PI));
    ctx.closePath();
    ctx.fill();
    currentAngle += statsPercent * 2 * Math.PI;

    // Statistics Short-term (purple)
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (statsShortTermPercent * 2 * Math.PI));
    ctx.closePath();
    ctx.fill();
    currentAngle += statsShortTermPercent * 2 * Math.PI;

    // Other (orange)
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (otherPercent * 2 * Math.PI));
    ctx.closePath();
    ctx.fill();
  }

  async loadStorageOverview() {
    this.updateLoadingProgress(0, 'Loading storage overview...');

    try {
      const response = await fetch('/api/statistics_orphan_finder?action=entity_storage_overview', {
        headers: {
          'Authorization': `Bearer ${this._hass.auth.data.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load storage overview');
      }

      this.updateLoadingProgress(50, 'Processing data...');

      const data = await response.json();
      this.storageOverviewData = data.entities || [];
      this.storageOverviewSummary = data.summary || {};

      this.updateLoadingProgress(90, 'Rendering table...');
      this.renderStorageOverview();

      this.updateLoadingProgress(100, 'Complete!');

    } catch (error) {
      this.updateLoadingProgress(0, 'Error: ' + error.message);
      this.storageOverviewData = [];
      this.storageOverviewSummary = {};
      this.renderStorageOverview();
    }
  }

  switchView(view) {
    this.currentView = view;

    // Update tab buttons
    const orphansTab = this.shadowRoot.getElementById('tab-orphans');
    const storageTab = this.shadowRoot.getElementById('tab-storage');

    orphansTab.classList.remove('active');
    storageTab.classList.remove('active');

    if (view === 'orphans') {
      orphansTab.classList.add('active');
      this.showOrphansView();
    } else {
      storageTab.classList.add('active');
      this.showStorageView();
    }
  }

  showOrphansView() {
    const orphansView = this.shadowRoot.getElementById('orphans-view');
    const storageView = this.shadowRoot.getElementById('storage-view');

    orphansView.style.display = 'block';
    storageView.style.display = 'none';

    // Load data if needed
    if (this.orphansData.length === 0) {
      this.loadOrphans();
    }
  }

  showStorageView() {
    const orphansView = this.shadowRoot.getElementById('orphans-view');
    const storageView = this.shadowRoot.getElementById('storage-view');

    orphansView.style.display = 'none';
    storageView.style.display = 'block';

    // Load data if needed
    if (this.storageOverviewData.length === 0) {
      this.loadStorageOverview();
    }
  }

  getFilteredStorageData() {
    let filtered = this.storageOverviewData;

    // Apply search query
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => e.entity_id.toLowerCase().includes(query));
    }

    // Apply registry status filter (from clickable summary)
    if (this.registryStatusFilter) {
      filtered = filtered.filter(e => e.registry_status === this.registryStatusFilter);
    }

    // Apply state status filter (from clickable summary)
    if (this.stateStatusFilter) {
      filtered = filtered.filter(e => e.state_status === this.stateStatusFilter);
    }

    // Apply basic filter
    if (this.storageFilter === 'in_registry') {
      filtered = filtered.filter(e => e.in_entity_registry);
    } else if (this.storageFilter === 'not_in_registry') {
      filtered = filtered.filter(e => !e.in_entity_registry);
    } else if (this.storageFilter === 'deleted') {
      filtered = filtered.filter(e => !e.in_entity_registry && !e.in_state_machine);
    }

    // Apply advanced filter
    if (this.storageAdvancedFilter === 'sync_issues') {
      // Entities with synchronization issues
      filtered = filtered.filter(e =>
        (e.in_states_meta && !e.in_states) || // orphaned states_meta
        (e.in_statistics_meta && !e.in_statistics_short_term && !e.in_statistics_long_term) // orphaned statistics_meta
      );
    } else if (this.storageAdvancedFilter === 'only_states') {
      // Only in states, not in statistics
      filtered = filtered.filter(e => e.in_states && !e.in_statistics_meta);
    } else if (this.storageAdvancedFilter === 'only_stats') {
      // Only in statistics, not in states
      filtered = filtered.filter(e => e.in_statistics_meta && !e.in_states);
    } else if (this.storageAdvancedFilter === 'orphaned_metadata') {
      // Metadata without actual data
      filtered = filtered.filter(e =>
        (e.in_states_meta && !e.in_states) ||
        (e.in_statistics_meta && !e.in_statistics_short_term && !e.in_statistics_long_term)
      );
    } else if (this.storageAdvancedFilter === 'missing_from_registry') {
      // In database but not in entity registry
      filtered = filtered.filter(e => !e.in_entity_registry && (e.in_states || e.in_statistics_meta));
    } else if (this.storageAdvancedFilter === 'fully_synced') {
      // Entities that are in registry and state machine
      filtered = filtered.filter(e => e.in_entity_registry && e.in_state_machine);
    }

    return filtered;
  }

  sortStorageData(column, shiftKey = false) {
    // Find if column already in sort stack
    const existingIndex = this.storageSortStack.findIndex(s => s.column === column);

    if (!shiftKey) {
      // Normal click - make this the primary sort
      if (existingIndex === 0) {
        // Already primary, toggle direction
        this.storageSortStack[0].direction = this.storageSortStack[0].direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Make this primary sort
        this.storageSortStack = [{column, direction: 'asc'}];
      }
    } else {
      // Shift+Click - add to sort stack or toggle if exists
      if (existingIndex >= 0) {
        // Toggle direction of existing sort
        this.storageSortStack[existingIndex].direction =
          this.storageSortStack[existingIndex].direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Add to sort stack (max 3 columns)
        if (this.storageSortStack.length < 3) {
          this.storageSortStack.push({column, direction: 'asc'});
        }
      }
    }

    this.renderStorageOverview();
  }

  clearStorageSort() {
    this.storageSortStack = [{column: 'entity_id', direction: 'asc'}];
    this.renderStorageOverview();
  }

  renderStorageOverview() {
    const tableBody = this.shadowRoot.getElementById('storage-table-body');
    const summaryContainer = this.shadowRoot.getElementById('storage-summary');

    // Clear table
    tableBody.innerHTML = '';

    // Determine active states for highlighting
    const isRegistryFilterActive = this.storageFilter === 'in_registry' && !this.registryStatusFilter;
    const isEnabledActive = this.registryStatusFilter === 'Enabled';
    const isDisabledActive = this.registryStatusFilter === 'Disabled';
    const isStateFilterActive = this.stateStatusFilter !== null && this.storageFilter === 'all';
    const isAvailableActive = this.stateStatusFilter === 'Available';
    const isUnavailableActive = this.stateStatusFilter === 'Unavailable';
    const isDeletedActive = this.storageFilter === 'deleted';
    const isOnlyStatesActive = this.storageAdvancedFilter === 'only_states';
    const isOnlyStatsActive = this.storageAdvancedFilter === 'only_stats';

    // Render summary with sub-totals (clickable)
    summaryContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stats-card">
          <h2>Total Entities</h2>
          <div class="stats-value">${(this.storageOverviewSummary.total_entities || 0).toLocaleString()}</div>
        </div>
        <div class="stats-card ${(isRegistryFilterActive || isEnabledActive || isDisabledActive) ? 'active-filter' : ''}">
          <h2>In Entity Registry</h2>
          <div class="stats-value stats-value-link ${isRegistryFilterActive ? 'active' : ''}" data-filter-type="basic" data-filter-value="in_registry">${(this.storageOverviewSummary.in_entity_registry || 0).toLocaleString()}</div>
          <div class="stats-subtitle">
            <span class="stats-subtitle-link ${isEnabledActive ? 'active' : ''}" data-filter-type="registry" data-filter-value="Enabled" style="color: ${isEnabledActive ? 'inherit' : 'var(--success-color, #4CAF50)'};">✓ Enabled: ${(this.storageOverviewSummary.registry_enabled || 0).toLocaleString()}</span><br>
            <span class="stats-subtitle-link ${isDisabledActive ? 'active' : ''}" data-filter-type="registry" data-filter-value="Disabled" style="color: ${isDisabledActive ? 'inherit' : 'var(--warning-color, #FF9800)'};">⊘ Disabled: ${(this.storageOverviewSummary.registry_disabled || 0).toLocaleString()}</span>
          </div>
        </div>
        <div class="stats-card ${(isStateFilterActive || isAvailableActive || isUnavailableActive) ? 'active-filter' : ''}">
          <h2>In State Machine</h2>
          <div class="stats-value stats-value-link" data-filter-type="basic" data-filter-value="in_state">${(this.storageOverviewSummary.in_state_machine || 0).toLocaleString()}</div>
          <div class="stats-subtitle">
            <span class="stats-subtitle-link ${isAvailableActive ? 'active' : ''}" data-filter-type="state" data-filter-value="Available" style="color: ${isAvailableActive ? 'inherit' : 'var(--success-color, #4CAF50)'};">✓ Available: ${(this.storageOverviewSummary.state_available || 0).toLocaleString()}</span><br>
            <span class="stats-subtitle-link ${isUnavailableActive ? 'active' : ''}" data-filter-type="state" data-filter-value="Unavailable" style="color: ${isUnavailableActive ? 'inherit' : 'var(--warning-color, #FF9800)'};">⚠ Unavailable: ${(this.storageOverviewSummary.state_unavailable || 0).toLocaleString()}</span>
          </div>
        </div>
        <div class="stats-card ${isDeletedActive ? 'active-filter' : ''}">
          <h2>Deleted</h2>
          <div class="stats-value stats-value-link ${isDeletedActive ? 'active' : ''}" data-filter-type="basic" data-filter-value="deleted">${(this.storageOverviewSummary.deleted_from_registry || 0).toLocaleString()}</div>
          <div class="stats-subtitle">Not in registry or state machine</div>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stats-card ${isOnlyStatesActive ? 'active-filter' : ''}">
          <h2>In States</h2>
          <div class="stats-value stats-value-link" data-filter-type="advanced" data-filter-value="only_states">${(this.storageOverviewSummary.in_states || 0).toLocaleString()}</div>
        </div>
        <div class="stats-card ${isOnlyStatsActive ? 'active-filter' : ''}">
          <h2>In Statistics</h2>
          <div class="stats-value stats-value-link ${isOnlyStatsActive ? 'active' : ''}" data-filter-type="advanced" data-filter-value="only_stats">${(this.storageOverviewSummary.in_statistics_meta || 0).toLocaleString()}</div>
        </div>
        <div class="stats-card ${isOnlyStatesActive ? 'active-filter' : ''}">
          <h2>Only States</h2>
          <div class="stats-value stats-value-link ${isOnlyStatesActive ? 'active' : ''}" data-filter-type="advanced" data-filter-value="only_states">${(this.storageOverviewSummary.only_in_states || 0).toLocaleString()}</div>
        </div>
        <div class="stats-card ${isOnlyStatsActive ? 'active-filter' : ''}">
          <h2>Only Statistics</h2>
          <div class="stats-value stats-value-link ${isOnlyStatsActive ? 'active' : ''}" data-filter-type="advanced" data-filter-value="only_stats">${(this.storageOverviewSummary.only_in_statistics || 0).toLocaleString()}</div>
        </div>
      </div>
    `;

    // Add click handlers for summary links (sub-totals)
    this.shadowRoot.querySelectorAll('.stats-subtitle-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const filterType = e.target.dataset.filterType;
        const filterValue = e.target.dataset.filterValue;
        this.filterByStatus(filterType, filterValue);
      });
    });

    // Add click handlers for main card values
    this.shadowRoot.querySelectorAll('.stats-value-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const filterType = e.target.dataset.filterType;
        const filterValue = e.target.dataset.filterValue;
        this.filterByStatus(filterType, filterValue);
      });
    });

    // Sort data using multi-column sort stack
    const filteredData = this.getFilteredStorageData();
    const sortedData = [...filteredData].sort((a, b) => {
      // Apply sorts in order from stack
      for (const {column, direction} of this.storageSortStack) {
        let aVal, bVal, result = 0;

        if (column === 'entity_id') {
          // String comparison
          aVal = a.entity_id.toLowerCase();
          bVal = b.entity_id.toLowerCase();
          result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else if (column === 'states_count' || column === 'stats_short_count' || column === 'stats_long_count') {
          // Numeric comparison for counts
          aVal = a[column] || 0;
          bVal = b[column] || 0;
          result = aVal - bVal;
        } else if (column === 'last_state_update' || column === 'last_stats_update') {
          // Date comparison
          aVal = a[column] ? new Date(a[column]).getTime() : 0;
          bVal = b[column] ? new Date(b[column]).getTime() : 0;
          result = aVal - bVal;
        } else if (column === 'registry_status' || column === 'state_status') {
          // String comparison for status
          aVal = a[column] || '';
          bVal = b[column] || '';
          result = aVal.localeCompare(bVal);
        } else {
          // Boolean comparison (checkboxes)
          aVal = a[column] ? 1 : 0;
          bVal = b[column] ? 1 : 0;
          result = aVal - bVal;
        }

        // Apply direction
        if (direction === 'desc') {
          result = -result;
        }

        // If not equal, return this result; otherwise continue to next sort
        if (result !== 0) {
          return result;
        }
      }

      return 0; // All sorts were equal
    });

    if (sortedData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="14" style="text-align: center;">No data available</td></tr>';
    } else {
      sortedData.forEach(entity => {
        const row = document.createElement('tr');

        // Helper to create status badge
        const statusBadge = (status, type) => {
          if (type === 'registry') {
            if (status === 'Enabled') {
              return '<span class="status-badge status-enabled" title="Enabled">✓</span>';
            } else if (status === 'Disabled') {
              return '<span class="status-badge status-disabled" title="Disabled">⊘</span>';
            } else {
              return '<span class="status-badge status-not-in-registry" title="Not in Registry">✕</span>';
            }
          } else if (type === 'state') {
            if (status === 'Available') {
              return '<span class="status-badge status-available" title="Available">✓</span>';
            } else if (status === 'Unavailable') {
              return '<span class="status-badge status-unavailable" title="Unavailable">⚠</span>';
            } else {
              return '<span class="status-badge status-not-present" title="Not Present">○</span>';
            }
          }
          return '';
        };

        // Helper to create checkmark or empty cell
        const check = (val) => val ? '✓' : '';

        row.innerHTML = `
          <td><span class="entity-id-link" data-entity-id="${entity.entity_id}">${entity.entity_id}</span></td>
          <td style="text-align: center;">${statusBadge(entity.registry_status, 'registry')}</td>
          <td style="text-align: center;">${statusBadge(entity.state_status, 'state')}</td>
          <td class="group-border-left" style="text-align: center;">${check(entity.in_states_meta)}</td>
          <td style="text-align: center;">${check(entity.in_states)}</td>
          <td style="text-align: right;">${(entity.states_count || 0).toLocaleString()}</td>
          <td style="text-align: center; font-size: 11px;">${entity.last_state_update || ''}</td>
          <td class="group-border-left" style="text-align: center;">${check(entity.in_statistics_meta)}</td>
          <td style="text-align: center;">${check(entity.in_statistics_short_term)}</td>
          <td style="text-align: center;">${check(entity.in_statistics_long_term)}</td>
          <td style="text-align: right;">${(entity.stats_short_count || 0).toLocaleString()}</td>
          <td style="text-align: right;">${(entity.stats_long_count || 0).toLocaleString()}</td>
          <td style="text-align: center; font-size: 11px;">${entity.last_stats_update || ''}</td>
        `;
        tableBody.appendChild(row);
      });

      // Add event listeners to all entity ID links
      this.shadowRoot.querySelectorAll('.entity-id-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const entityId = e.target.dataset.entityId;
          this.showMoreInfo(entityId);
        });
      });
    }

    // Update sort indicators
    this.updateStorageSortIndicators();
  }

  updateStorageSortIndicators() {
    // Remove all existing indicators
    const headers = [
      'storage-header-entity-id',
      'storage-header-registry',
      'storage-header-state',
      'storage-header-states-meta',
      'storage-header-states',
      'storage-header-stats-meta',
      'storage-header-stats-short',
      'storage-header-stats-long',
      'storage-header-states-count',
      'storage-header-stats-short-count',
      'storage-header-stats-long-count',
      'storage-header-last-state-update',
      'storage-header-last-stats-update'
    ];

    headers.forEach(headerId => {
      const header = this.shadowRoot.getElementById(headerId);
      if (header) {
        header.classList.remove('sorted-asc', 'sorted-desc', 'sorted-asc-2', 'sorted-desc-2', 'sorted-asc-3', 'sorted-desc-3');
        // Remove any existing sort indicator text
        const textContent = header.textContent.replace(/[▲▼]₁|[▲▼]₂|[▲▼]₃/g, '').trim();
        header.textContent = textContent;
      }
    });

    // Add indicators for all sorted columns in stack
    const columnMap = {
      'entity_id': 'storage-header-entity-id',
      'registry_status': 'storage-header-registry',
      'state_status': 'storage-header-state',
      'in_entity_registry': 'storage-header-registry',
      'in_state_machine': 'storage-header-state',
      'in_states_meta': 'storage-header-states-meta',
      'in_states': 'storage-header-states',
      'in_statistics_meta': 'storage-header-stats-meta',
      'in_statistics_short_term': 'storage-header-stats-short',
      'in_statistics_long_term': 'storage-header-stats-long',
      'states_count': 'storage-header-states-count',
      'stats_short_count': 'storage-header-stats-short-count',
      'stats_long_count': 'storage-header-stats-long-count',
      'last_state_update': 'storage-header-last-state-update',
      'last_stats_update': 'storage-header-last-stats-update'
    };

    this.storageSortStack.forEach((sort, index) => {
      const headerId = columnMap[sort.column];
      const header = this.shadowRoot.getElementById(headerId);
      if (header) {
        const priority = index + 1;
        const arrow = sort.direction === 'asc' ? '▲' : '▼';
        const subscript = priority === 1 ? '₁' : priority === 2 ? '₂' : '₃';

        // Add class for styling
        const sortClass = sort.direction === 'asc' ?
          (priority === 1 ? 'sorted-asc' : `sorted-asc-${priority}`) :
          (priority === 1 ? 'sorted-desc' : `sorted-desc-${priority}`);
        header.classList.add(sortClass);

        // Add indicator to text
        header.textContent = header.textContent + ' ' + arrow + subscript;
      }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }

        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 400;
          color: var(--primary-text-color);
        }

        .stats-summary {
          background: var(--card-background-color);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
        }

        .stats-summary h2 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--secondary-text-color);
          font-weight: 500;
          text-transform: uppercase;
        }

        .stats-value {
          font-size: 32px;
          font-weight: 300;
          color: var(--primary-text-color);
        }

        .refresh-button {
          position: relative;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          padding: 10px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          transition: background 0.3s;
          overflow: hidden;
          --progress: 0%;
        }

        .refresh-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--progress);
          background: var(--dark-primary-color);
          transition: width 0.3s ease;
          z-index: 0;
        }

        .refresh-button span {
          position: relative;
          z-index: 1;
        }

        .refresh-button:hover:not(:disabled) {
          background: var(--dark-primary-color);
        }

        .refresh-button:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .loading-status {
          text-align: center;
          margin-top: 8px;
          font-size: 12px;
          color: var(--secondary-text-color);
          min-height: 18px;
        }

        .table-container {
          background: var(--card-background-color);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: var(--table-header-background-color, var(--secondary-background-color));
          color: var(--primary-text-color);
          padding: 12px 16px;
          text-align: left;
          font-weight: 500;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        th:hover {
          background: var(--secondary-background-color);
          opacity: 0.8;
        }

        th.sorted-asc::after {
          content: ' ▲';
          font-size: 10px;
          margin-left: 4px;
        }

        th.sorted-desc::after {
          content: ' ▼';
          font-size: 10px;
          margin-left: 4px;
        }

        td {
          padding: 12px 16px;
          border-top: 1px solid var(--divider-color);
          color: var(--primary-text-color);
        }

        tr:hover {
          background: var(--table-row-background-hover-color, rgba(0, 0, 0, 0.04));
        }

        .description {
          color: var(--secondary-text-color);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          justify-content: center;
        }

        .filter-button {
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border: 2px solid var(--divider-color);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .filter-button:hover {
          background: var(--secondary-background-color);
        }

        .filter-button.active {
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-color: var(--primary-color);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-deleted {
          background: var(--error-color, #F44336);
          color: white;
        }

        .status-unavailable {
          color: white;
        }

        .origin-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .origin-long-term {
          background: #4CAF50;
          color: white;
        }

        .origin-short-term {
          background: #9C27B0;
          color: white;
        }

        .origin-both {
          background: #2196F3;
          color: white;
        }

        .remove-btn {
          background: var(--error-color, #F44336);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background 0.3s;
        }

        .remove-btn:hover {
          background: #D32F2F;
        }

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
        }

        .stats-card h2 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--secondary-text-color);
          font-weight: 500;
          text-transform: uppercase;
        }

        .stats-card .stats-value {
          font-size: 32px;
          font-weight: 300;
          color: var(--primary-text-color);
        }

        .stats-card .stats-subtitle {
          margin-top: 8px;
          font-size: 12px;
          color: var(--secondary-text-color);
          font-style: italic;
        }

        .db-size-section {
          background: var(--card-background-color);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
        }

        .db-size-section h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--primary-text-color);
          font-weight: 500;
        }

        .db-chart-container {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        #db-chart {
          flex-shrink: 0;
        }

        .db-legend {
          flex: 1;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .legend-color.states {
          background: #2196F3;
        }

        .legend-color.statistics {
          background: #4CAF50;
        }

        .legend-color.statistics-short-term {
          background: #9C27B0;
        }

        .legend-color.other {
          background: #FF9800;
        }

        .legend-text {
          flex: 1;
        }

        .legend-label {
          font-weight: 500;
          color: var(--primary-text-color);
          display: block;
        }

        .legend-value {
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .button-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--divider-color);
        }

        .tab-button {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--secondary-text-color);
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: -2px;
        }

        .tab-button:hover {
          color: var(--primary-text-color);
          background: var(--secondary-background-color);
        }

        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .view-container {
          display: none;
        }

        .view-container.active {
          display: block;
        }

        .search-filter-container {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px;
          border: 2px solid var(--divider-color);
          border-radius: 4px;
          font-size: 14px;
          color: var(--primary-text-color);
          background: var(--card-background-color);
          transition: border-color 0.3s;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .clear-filters-btn {
          padding: 10px 20px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 2px solid var(--divider-color);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .clear-filters-btn:hover {
          background: var(--divider-color);
        }

        /* Status badge styles */
        .status-badge {
          display: inline-block;
          font-weight: bold;
          font-size: 14px;
        }

        .status-enabled {
          color: var(--success-color, #4CAF50);
        }

        .status-disabled {
          color: var(--warning-color, #FF9800);
        }

        .status-not-in-registry {
          color: var(--error-color, #F44336);
        }

        .status-available {
          color: var(--success-color, #4CAF50);
        }

        .status-unavailable {
          color: var(--warning-color, #FF9800);
        }

        .status-not-present {
          color: var(--secondary-text-color);
        }

        /* Column grouping */
        .group-border-left {
          border-left: 3px solid var(--primary-color) !important;
        }

        th.group-border-left {
          border-left: 3px solid var(--primary-color) !important;
        }

        /* Multi-line header support */
        th {
          white-space: pre-line;
          line-height: 1.3;
        }

        /* Secondary and tertiary sort indicators */
        th.sorted-asc-2::after,
        th.sorted-desc-2::after,
        th.sorted-asc-3::after,
        th.sorted-desc-3::after {
          opacity: 0.6;
        }

        /* Clear sort button */
        .clear-sort-btn {
          padding: 10px 20px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 2px solid var(--divider-color);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .clear-sort-btn:hover {
          background: var(--divider-color);
        }

        /* Clickable summary stats */
        .stats-subtitle-link {
          cursor: pointer;
          transition: all 0.2s;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .stats-subtitle-link:hover {
          opacity: 0.7;
          text-decoration: underline;
        }

        .stats-subtitle-link.active {
          background: var(--primary-color);
          color: var(--text-primary-color, #fff) !important;
          font-weight: bold;
          text-decoration: none;
        }

        /* Clickable main card values */
        .stats-value-link {
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
          padding: 4px 8px;
          margin: -4px -8px;
        }

        .stats-value-link:hover {
          background: var(--secondary-background-color);
          transform: scale(1.05);
        }

        .stats-value-link.active {
          background: var(--primary-color);
          color: var(--text-primary-color, #fff);
          font-weight: bold;
        }

        /* Active filter card indication */
        .stats-card.active-filter {
          border: 2px solid var(--primary-color);
          box-shadow: 0 0 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.4);
        }

        /* Clickable entity IDs */
        .entity-id-link {
          cursor: pointer;
          color: var(--primary-text-color);
          text-decoration: none;
          transition: all 0.2s;
        }

        .entity-id-link:hover {
          color: var(--primary-text-color);
          text-decoration: underline;
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background-color: var(--card-background-color);
          padding: 24px;
          border-radius: 8px;
          max-width: 700px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--primary-text-color);
          font-size: 20px;
          font-weight: 500;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--primary-text-color);
          padding: 0;
          width: 32px;
          height: 32px;
          line-height: 32px;
        }

        .modal-close:hover {
          color: var(--error-color, #F44336);
        }

        .modal-warning {
          background: var(--warning-color, #FF9800);
          color: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .modal-storage-info {
          background: var(--success-color, #4CAF50);
          color: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
          text-align: center;
        }

        .modal-sql-container {
          margin-bottom: 16px;
        }

        .modal-sql-container h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--secondary-text-color);
          font-weight: 500;
          text-transform: uppercase;
        }

        .sql-block {
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          padding: 16px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          color: var(--primary-text-color);
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-x: auto;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.3s;
        }

        .modal-btn-primary {
          background: var(--primary-color);
          color: var(--text-primary-color);
        }

        .modal-btn-primary:hover {
          background: var(--dark-primary-color);
        }

        .modal-btn-secondary {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
        }

        .modal-btn-secondary:hover {
          background: var(--divider-color);
        }
      </style>

      <div class="header">
        <h1>Statistics Orphan Finder</h1>
        <div class="button-container">
          <button class="refresh-button" id="refresh-btn"><span>Refresh</span></button>
          <div class="loading-status" id="loading-status-text"></div>
        </div>
      </div>

      <div class="tab-navigation">
        <button class="tab-button active" id="tab-orphans">Orphaned Entities</button>
        <button class="tab-button" id="tab-storage">Storage Overview</button>
      </div>

      <div id="orphans-view" class="view-container" style="display: block;">
        <div class="description">
          This tool identifies entities that exist in Home Assistant's long-term statistics
          database but are no longer present in your current configuration.
          <strong>Deleted</strong> entities have been completely removed, while <strong>Unavailable</strong>
          entities are registered but currently offline or disabled.
        </div>

      <div class="db-size-section">
        <h2>Database Size</h2>
        <div class="db-chart-container">
          <canvas id="db-chart" width="200" height="200"></canvas>
          <div class="db-legend">
            <div class="legend-item">
              <div class="legend-color states"></div>
              <div class="legend-text">
                <span class="legend-label">States</span>
                <span class="legend-value" id="states-count">0 records</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color statistics"></div>
              <div class="legend-text">
                <span class="legend-label">Statistics Long-term</span>
                <span class="legend-value" id="statistics-count">0 records</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color statistics-short-term"></div>
              <div class="legend-text">
                <span class="legend-label">Statistics Short-term</span>
                <span class="legend-value" id="statistics-short-term-count">0 records</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color other"></div>
              <div class="legend-text">
                <span class="legend-label">Other</span>
                <span class="legend-value" id="other-count">0 records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stats-card">
          <h2>Total Orphaned</h2>
          <div class="stats-value" id="total-orphans">-</div>
        </div>
        <div class="stats-card">
          <h2>Deleted</h2>
          <div class="stats-value" id="deleted-count">-</div>
        </div>
        <div class="stats-card">
          <h2>Unavailable</h2>
          <div class="stats-value" id="unavailable-count">-</div>
        </div>
        <div class="stats-card">
          <h2>💾 Deleted Storage</h2>
          <div class="stats-value" id="deleted-storage">-</div>
          <div class="stats-subtitle">Safe to remove</div>
        </div>
        <div class="stats-card">
          <h2>💾 Unavailable Storage</h2>
          <div class="stats-value" id="unavailable-storage">-</div>
          <div class="stats-subtitle">May return online</div>
        </div>
      </div>

      <div class="filter-buttons">
        <button class="filter-button active" id="filter-all">All</button>
        <button class="filter-button" id="filter-deleted">Deleted Only</button>
        <button class="filter-button" id="filter-unavailable">Unavailable Only</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th id="header-entity-id" class="sorted-asc">Entity ID</th>
              <th id="header-status" style="text-align: center;">Status</th>
              <th id="header-origin" style="text-align: center;">Origin</th>
              <th id="header-last-update" style="text-align: center;">Last Updated</th>
              <th id="header-count" style="text-align: right;">Statistics Count</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="orphan-table-body">
            <tr>
              <td colspan="6" style="text-align: center;">No data loaded</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <!-- Storage Overview View -->
      <div id="storage-view" class="view-container" style="display: none;">
        <div class="description">
          Complete overview of all entities across Home Assistant's storage locations.
          This shows which entities exist in the Entity Registry, State Machine, and various database tables.
        </div>

        <div id="storage-summary"></div>

        <div class="search-filter-container">
          <div class="search-box">
            <input type="text" id="storage-search" placeholder="🔍 Search entity IDs..." />
          </div>
          <button class="clear-filters-btn" id="clear-storage-filters">Clear Filters</button>
          <button class="clear-sort-btn" id="clear-storage-sort">Clear Sort</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th id="storage-header-entity-id" class="sorted-asc">Entity ID</th>
                <th id="storage-header-registry" style="text-align: center; font-size: 10px;">ENTITY
REGISTRY</th>
                <th id="storage-header-state" style="text-align: center; font-size: 10px;">STATE
MACHINE</th>
                <th id="storage-header-states-meta" class="group-border-left" style="text-align: center; font-size: 10px;">States
Meta</th>
                <th id="storage-header-states" style="text-align: center; font-size: 10px;">States</th>
                <th id="storage-header-states-count" style="text-align: right; font-size: 10px;">States #</th>
                <th id="storage-header-last-state-update" style="text-align: center; font-size: 10px;">Last State
Update</th>
                <th id="storage-header-stats-meta" class="group-border-left" style="text-align: center; font-size: 10px;">Stats
Meta</th>
                <th id="storage-header-stats-short" style="text-align: center; font-size: 10px;">Stats
Short</th>
                <th id="storage-header-stats-long" style="text-align: center; font-size: 10px;">Stats
Long</th>
                <th id="storage-header-stats-short-count" style="text-align: right; font-size: 10px;">Short #</th>
                <th id="storage-header-stats-long-count" style="text-align: right; font-size: 10px;">Long #</th>
                <th id="storage-header-last-stats-update" style="text-align: center; font-size: 10px;">Last Stats
Update</th>
              </tr>
            </thead>
            <tbody id="storage-table-body">
              <tr>
                <td colspan="14" style="text-align: center;">No data loaded</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Modal -->
      <div id="delete-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Remove Entity: <span id="modal-entity-id"></span></h2>
            <button class="modal-close" id="modal-close-btn">&times;</button>
          </div>
          <div class="modal-warning">
            ⚠️ Warning: This will permanently delete all statistics data for this entity. This action cannot be undone!
          </div>
          <div class="modal-storage-info" id="modal-storage-info" style="display: none;"></div>
          <div class="modal-sql-container">
            <h3>SQL Statement</h3>
            <pre class="sql-block" id="modal-sql"></pre>
          </div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-primary" id="copy-sql-btn">Copy to Clipboard</button>
            <button class="modal-btn modal-btn-secondary" id="modal-cancel-btn">Close</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('refresh-btn').addEventListener('click', () => {
      this.loadOrphans();
    });

    this.shadowRoot.getElementById('header-entity-id').addEventListener('click', () => {
      this.sortData('entity_id');
    });

    this.shadowRoot.getElementById('header-status').addEventListener('click', () => {
      this.sortData('status');
    });

    this.shadowRoot.getElementById('header-origin').addEventListener('click', () => {
      this.sortData('origin');
    });

    this.shadowRoot.getElementById('header-last-update').addEventListener('click', () => {
      this.sortData('last_update');
    });

    this.shadowRoot.getElementById('header-count').addEventListener('click', () => {
      this.sortData('count');
    });

    // Filter buttons
    this.shadowRoot.getElementById('filter-all').addEventListener('click', () => {
      this.setFilter('all');
    });

    this.shadowRoot.getElementById('filter-deleted').addEventListener('click', () => {
      this.setFilter('deleted');
    });

    this.shadowRoot.getElementById('filter-unavailable').addEventListener('click', () => {
      this.setFilter('unavailable');
    });

    // Modal event listeners
    this.shadowRoot.getElementById('modal-close-btn').addEventListener('click', () => {
      this.closeDeleteModal();
    });

    this.shadowRoot.getElementById('modal-cancel-btn').addEventListener('click', () => {
      this.closeDeleteModal();
    });

    // Close modal when clicking on backdrop
    this.shadowRoot.getElementById('delete-modal').addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal') {
        this.closeDeleteModal();
      }
    });

    // Tab navigation
    this.shadowRoot.getElementById('tab-orphans').addEventListener('click', () => {
      this.switchView('orphans');
    });

    this.shadowRoot.getElementById('tab-storage').addEventListener('click', () => {
      this.switchView('storage');
    });

    // Storage table column sorting (with Shift+Click support)
    this.shadowRoot.getElementById('storage-header-entity-id').addEventListener('click', (e) => {
      this.sortStorageData('entity_id', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-registry').addEventListener('click', (e) => {
      this.sortStorageData('registry_status', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-state').addEventListener('click', (e) => {
      this.sortStorageData('state_status', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-states-meta').addEventListener('click', (e) => {
      this.sortStorageData('in_states_meta', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-states').addEventListener('click', (e) => {
      this.sortStorageData('in_states', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-stats-meta').addEventListener('click', (e) => {
      this.sortStorageData('in_statistics_meta', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-stats-short').addEventListener('click', (e) => {
      this.sortStorageData('in_statistics_short_term', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-stats-long').addEventListener('click', (e) => {
      this.sortStorageData('in_statistics_long_term', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-states-count').addEventListener('click', (e) => {
      this.sortStorageData('states_count', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-stats-short-count').addEventListener('click', (e) => {
      this.sortStorageData('stats_short_count', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-stats-long-count').addEventListener('click', (e) => {
      this.sortStorageData('stats_long_count', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-last-state-update').addEventListener('click', (e) => {
      this.sortStorageData('last_state_update', e.shiftKey);
    });

    this.shadowRoot.getElementById('storage-header-last-stats-update').addEventListener('click', (e) => {
      this.sortStorageData('last_stats_update', e.shiftKey);
    });

    // Search box
    this.shadowRoot.getElementById('storage-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderStorageOverview();
    });

    // Clear filters button
    this.shadowRoot.getElementById('clear-storage-filters').addEventListener('click', () => {
      this.searchQuery = '';
      this.storageFilter = 'all';
      this.storageAdvancedFilter = 'all';
      this.registryStatusFilter = null;
      this.stateStatusFilter = null;
      this.shadowRoot.getElementById('storage-search').value = '';

      this.renderStorageOverview();
    });

    // Clear sort button
    this.shadowRoot.getElementById('clear-storage-sort').addEventListener('click', () => {
      this.clearStorageSort();
    });

    this.content = this.shadowRoot.querySelector('div');
  }

  setFilter(filter) {
    this.statusFilter = filter;

    // Update button states
    const buttons = this.shadowRoot.querySelectorAll('.filter-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeButton = this.shadowRoot.getElementById(`filter-${filter}`);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    this.renderTable();
  }

  filterByStatus(statusType, statusValue) {
    // Reset filters first
    this.registryStatusFilter = null;
    this.stateStatusFilter = null;
    this.storageAdvancedFilter = 'all';
    this.storageFilter = 'all';

    // Set filter based on type
    if (statusType === 'registry') {
      // Sub-category: Enabled or Disabled
      this.storageFilter = 'in_registry';
      this.registryStatusFilter = statusValue;
    } else if (statusType === 'state') {
      // Sub-category: Available or Unavailable
      this.stateStatusFilter = statusValue;
    } else if (statusType === 'basic') {
      // Main card value
      this.storageFilter = statusValue;
    } else if (statusType === 'advanced') {
      // Advanced filter
      this.storageAdvancedFilter = statusValue;
    }

    this.renderStorageOverview();
  }
}

customElements.define('statistics-orphan-panel', StatisticsOrphanPanel);
