# Statistics Orphan Finder - Functional Requirements

Functional requirements for the integration

## Overview
Home Assistant custom integration that identifies and manages orphaned statistics entities in the database.

## Core Features

### 1. Orphan Finder Tab

#### Display
- Table with columns:
  - Entity ID (clickable → opens HA more-info dialog)
  - Status badge (deleted | unavailable)
  - Origin (Long-term | Short-term | Both)
  - Last Updated (timestamp)
  - Statistics Count (number)
  - Actions (Generate SQL button)

#### Filtering
- Filter by status: all | deleted | unavailable
- Default: show all

#### Sorting
- Sortable columns: entity_id, status, origin, last_update, count
- Multi-column sort (click multiple headers, maintains stack)
- Default: entity_id ascending
- Visual indicators: ▲ ▼ with sort order numbers

#### Database Overview Cards
- 4 cards showing database stats:
  - States table (count + size)
  - Statistics table (count + size)
  - Statistics Short-term (count + size)
  - Other tables (count + size)
- Display formatted sizes (KB, MB, GB)
- Display formatted counts (with commas)

#### Orphan Storage Summary
- Show storage used by deleted entities
- Show storage used by unavailable entities
- Display in human-readable format

#### Generate SQL Modal
- Triggered by "Generate SQL" button
- Shows:
  - Entity ID being removed
  - Origin tables affected
  - Storage that will be freed
  - SQL transaction (BEGIN/COMMIT with DELETE statements)
  - Copy to clipboard button
- Warning message about backups
- Close button

### 2. Storage Overview Tab

#### Display
- 15-column comparison table:
  1. Entity ID (clickable)
  2. Entity Registry (badge: ✓ Enabled | ⊘ Disabled | ✕ Not in Registry)
  3. State Machine (badge: ✓ Available | ⚠ Unavailable | ○ Not Present)
  4. States Meta (✓ or empty)
  5. States (✓ or empty)
  6. States # (count, right-aligned)
  7. Message Interval (text: "30s", "5min", "2h")
  8. Last State Update (ISO datetime)
  9. Stats Meta (✓ or empty) [grouped with left border]
  10. Stats Short (✓ or empty)
  11. Stats Long (✓ or empty)
  12. Short # (count, right-aligned)
  13. Long # (count, right-aligned)
  14. Last Stats Update (ISO datetime)
  15. Actions (info icon button)

#### Summary Cards (2 rows)
**Row 1:**
- Total Entities
- In Entity Registry (clickable, shows sub-totals: Enabled, Disabled)
- In State Machine (clickable, shows sub-totals: Available, Unavailable)
- Deleted (entities not in registry or state machine)

**Row 2:**
- In States (total with state records)
- In Statistics (total with statistics)
- Only States (in states but not statistics)
- Only Statistics (in statistics but not states)

All main values clickable to filter table.

#### Filtering
- Click summary card → filters table
- Multiple filter types:
  - Basic: in_registry, in_state, deleted
  - Registry: Enabled, Disabled
  - State: Available, Unavailable
  - Advanced: only_states, only_stats
- Active filters highlighted in gold
- Clear filters button
- Search box (filters by entity_id substring, case-insensitive)

#### Sorting
- Multi-column sort stack (same as Orphan Finder)
- Sortable columns: all except Actions
- Clear sort button
- Visual indicators with sort order numbers

#### Entity Details Modal
Triggered by clicking info icon or entity ID. Shows:

**Section 1: Status**
- Current state (Available | Unavailable | Unknown)
- If unavailable: reason with user-friendly explanation
  - Disabled by user/integration/device/config
  - Device offline with duration
  - Integration failed/retrying/not loaded
  - Recently unavailable (loading)
  - Never loaded
  - Deleted

**Section 2: Entity Information**
- Platform
- Device name (if applicable)
- Device disabled status
- Config entry title
- Config entry state

**Section 3: Database Presence**
- In Entity Registry (yes/no)
- In State Machine (yes/no)
- Registry Status (Enabled/Disabled/Not in Registry)
- State Status (Available/Unavailable/Not Present)

**Section 4: States Table**
- In states_meta (yes/no)
- In states table (yes/no)
- Total state records (count)
- Last state update (timestamp)

**Section 5: Update Frequency**
- Message interval (formatted)
- Updates in last 24h (count)

**Section 6: Statistics Table**
- In statistics_meta (yes/no)
- In statistics_short_term (yes/no)
- In statistics (long-term) (yes/no)
- Short-term records (count)
- Long-term records (count)
- Last stats update (timestamp)

**Section 7: Statistics Eligibility**
- If NOT in statistics: explanation why
  - Missing state_class attribute
  - Missing unit_of_measurement
  - Non-numeric state value
  - Entity disabled
  - Entity unavailable
  - Entity deleted
  - Appears eligible (may take time)

**Actions:**
- Close button
- Open more-info dialog button (opens HA's native dialog)

### 3. Tab Navigation
- Two tabs: "Orphaned Entities" and "Storage Overview"
- Tabs switch views without page reload
- Active tab highlighted
- Maintains state when switching tabs

### 4. Loading States
- Progress bar during data fetch
- Loading status text:
  - "Fetching orphaned entities..."
  - "Fetching database size..."
  - "Fetching entity storage overview..."
  - "Rendering table..."
  - "Complete!"
- Loading overlay prevents interaction
- Error states shown with message

### 5. API Integration
Four endpoints on `/api/statistics_orphan_finder`:

**GET ?action=list**
Response:
```json
{
  "orphans": [
    {
      "entity_id": "sensor.old_sensor",
      "count": 12345,
      "status": "deleted",
      "last_update": "2024-10-01T12:00:00",
      "origin": "Both",
      "metadata_id": 123
    }
  ],
  "deleted_storage": 1048576,
  "unavailable_storage": 524288
}
```

**GET ?action=database_size**
Response:
```json
{
  "states": 100000,
  "statistics": 50000,
  "statistics_short_term": 5000,
  "other": 10000,
  "states_size": 10485760,
  "statistics_size": 5242880,
  "statistics_short_term_size": 524288,
  "other_size": 1048576
}
```

**GET ?action=entity_storage_overview**
Response:
```json
{
  "entities": [
    {
      "entity_id": "sensor.example",
      "in_entity_registry": true,
      "registry_status": "Enabled",
      "in_state_machine": true,
      "state_status": "Available",
      "in_states_meta": true,
      "in_states": true,
      "in_statistics_meta": true,
      "in_statistics_short_term": true,
      "in_statistics_long_term": true,
      "states_count": 1000,
      "stats_short_count": 100,
      "stats_long_count": 500,
      "last_state_update": "2024-10-15T...",
      "last_stats_update": "2024-10-15T...",
      "platform": "mqtt",
      "disabled_by": null,
      "device_name": "My Device",
      "device_disabled": false,
      "config_entry_state": "LOADED",
      "config_entry_title": "MQTT",
      "availability_reason": "...",
      "unavailable_duration_seconds": null,
      "update_interval": "30s",
      "update_interval_seconds": 30,
      "update_count_24h": 2880,
      "statistics_eligibility_reason": "..."
    }
  ],
  "summary": {
    "total_entities": 1000,
    "in_entity_registry": 950,
    "registry_enabled": 900,
    "registry_disabled": 50,
    "in_state_machine": 920,
    "state_available": 900,
    "state_unavailable": 20,
    "in_states_meta": 920,
    "in_states": 920,
    "in_statistics_meta": 300,
    "in_statistics_short_term": 280,
    "in_statistics_long_term": 290,
    "only_in_states": 620,
    "only_in_statistics": 0,
    "in_both_states_and_stats": 300,
    "orphaned_states_meta": 0,
    "orphaned_statistics_meta": 10,
    "deleted_from_registry": 30
  }
}
```

**GET ?action=generate_delete_sql&metadata_id=X&origin=Y**
Response:
```json
{
  "sql": "BEGIN;\nDELETE FROM...\nCOMMIT;",
  "storage_saved": 1048576
}
```

## UI/UX Requirements

### Styling
- Uses Home Assistant CSS variables for theming
- Card-based layout with rounded corners
- Responsive design
- Shadow DOM for style encapsulation
- Hover effects on interactive elements
- Active filter highlighting (gold background)
- Status badges with colors:
  - Green (✓): enabled, available
  - Orange (⚠, ⊘): unavailable, disabled
  - Red/Gray (✕, ○): not present, deleted

### Interactions
- Clickable entity IDs open HA more-info
- Clickable summary cards filter table
- Sortable table headers
- Searchable entity IDs
- Modal overlays
- Copy-to-clipboard functionality
- Keyboard accessible (tab navigation, enter to activate)

### Visual Grouping
- Storage Overview table has visual column groups:
  - States group (columns 4-8) with left border
  - Statistics group (columns 9-14) with left border

### Formatting
- Numbers: comma separators (1,234)
- Sizes: human-readable (1.5 MB, 123 KB)
- Dates: ISO format or relative
- Intervals: human-readable (30s, 5min, 2h)

## Edge Cases & Error Handling

1. Empty states:
   - No orphans found → "No orphaned entities found"
   - No data loaded → "No data loaded"
   - Loading error → "Error: [message]"

2. Missing data:
   - Handle null/undefined gracefully
   - Show empty cells as blank
   - Don't break on missing timestamps

3. Sort stability:
   - Maintain order for equal values
   - Clear sort order on clear button

4. Filter combinations:
   - Multiple filters work together (AND logic)
   - Search + filters combine

5. API errors:
   - Show error message
   - Don't break UI
   - Allow retry

## Performance Requirements

1. Handle large datasets:
   - 1000+ entities in storage overview
   - Smooth scrolling
   - Fast sorting/filtering

2. Lazy rendering:
   - Only render visible rows (future enhancement)

3. Debounced search:
   - Don't filter on every keystroke

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- Shadow DOM support
- CSS Custom Properties

## Home Assistant Integration

- Panel registered in sidebar
- Icon: mdi:database-search
- Title: "Statistics Orphans"
- Admin-only access
- Integrates with hass object for:
  - API calls
  - More-info dialogs
  - Theme variables
