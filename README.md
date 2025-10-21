# Statistics Orphan Finder for Home Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Home Assistant custom component that helps you identify and manage orphaned statistics entities in your database. Over time, as you remove devices or entities, their historical statistics data can remain in the database, consuming valuable storage space. This integration helps you find and clean up these orphaned entries.

> **Note**: Developed for personal use, this tool is shared as-is. Use it at your own risk.

## Features

### Comprehensive Entity Analysis
- **Complete Database Scan**: Analyzes all entities across states and statistics tables in your Home Assistant database
- **Storage Footprint Tracking**: See exactly how much database space each entity uses
- **Precise Update Tracking**: Accurate 24-hour update counts and message intervals for all entities (no longer limited to 50 samples)
- **Smart Filtering & Search**: Filter by registry status, state machine presence, statistics tracking, and more
- **Visual Filter Panel**: Interactive summary cards with clickable filters for quick analysis

### Orphan Detection & Cleanup
- **Automatic Orphan Detection**: Identifies deleted entities still consuming database space
- **Bulk Selection**: Select multiple deleted entities with checkboxes
- **Bulk SQL Generation**: Generate combined deletion statements for multiple entities at once
- **Storage Impact Analysis**: See exactly how much space will be freed before deletion
- **Safe SQL Generation**: Creates safe, reviewable SQL statements for data removal

### Enhanced Entity Diagnostics
Click any entity ID to view detailed diagnostics with intelligent analysis:
- **Context-Aware Availability**: Smart explanations for entity status (no more "Unknown reason")
- **Domain-Aware Statistics Eligibility**: Identifies incompatible entity types (binary_sensor, switch, light, etc.)
- **Logical Validation Order**: Checks numeric state before suggesting configuration changes
- **Device & Integration Info**: Platform details, device associations, and integration status
- **Complete Storage Breakdown**: Records across all database tables (states_meta, states, statistics_meta, etc.)

### User Experience
- **Beautiful Interface**: Clean, responsive web panel integrated into Home Assistant's sidebar
- **Multi-Database Support**: Works with SQLite, MySQL/MariaDB, and PostgreSQL
- **Direct Entity Access**: Click entity IDs to open Home Assistant's more-info dialog
- **Real-Time Filtering**: Active filters highlighted for easy identification

## Screenshots

The integration adds a new "Statistics Orphans" panel to your Home Assistant sidebar (with a database-search icon).

### Main Interface
- **Storage Health Summary**: Visual breakdown cards showing total entities, deleted entities, storage usage, etc.
  - Click any card to instantly filter the table below
  - Filter panel with registry status, state status, states table, and statistics table filters
- **Comprehensive Entity Table**: Complete list of all entities with detailed columns:
  - Entity ID (clickable for detailed diagnostics)
  - Entity Registry status (Enabled/Disabled/Not in Registry)
  - State Machine status (Available/Unavailable/Not Present)
  - States table presence and record counts
  - Statistics table presence and record counts
  - Update frequency and 24-hour update counts
  - Actions: View details and generate delete SQL for orphaned entities
- **Search & Sort**: Real-time search and multi-column sorting
- **Bulk Operations**: Select multiple deleted entities with checkboxes and generate combined SQL

### Entity Details Modal
- Comprehensive diagnostics for any entity
- Smart availability analysis with actionable explanations
- Statistics eligibility checker with domain awareness
- Device, platform, and integration information
- Complete storage breakdown across all database tables

## Installation

### HACS
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=dmrtnssn&repository=https%3A%2F%2Fgithub.com%2Fdmrtnssn%2Fstatistics-orphan-finder)

(As always, you should be careful with software which lets you pull random code from the Internet and run it)
### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/dmrtnssn/statistics-orphan-finder/releases)
2. Extract the downloaded archive
3. Copy the `custom_components/statistics_orphan_finder` directory to your Home Assistant's `custom_components` directory
   - The path should be: `<config>/custom_components/statistics_orphan_finder/`
   - If the `custom_components` directory doesn't exist, create it in the same directory as your `configuration.yaml`
4. Restart Home Assistant
5. The integration should now appear in **Settings** → **Devices & Services** → **Add Integration**

**Alternative**: Clone this repository directly into your `custom_components` folder:
```bash
cd <config>/custom_components
git clone https://github.com/dmrtnssn/statistics-orphan-finder.git statistics_orphan_finder
```

## Configuration

### Adding the Integration

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Statistics Orphan Finder"
4. Follow the configuration steps:
   - **Database URL**: Enter your Home Assistant database URL
     - For SQLite (default): `sqlite:////config/home-assistant_v2.db`
     - For MySQL: `mysql://user:password@localhost/homeassistant`
     - For PostgreSQL: `postgresql://user:password@localhost/homeassistant`
   - **Username** (optional): Database username if not included in URL
   - **Password** (optional): Database password if not included in URL

### Database URL Examples

**SQLite (Home Assistant default)**:
```
sqlite:////config/home-assistant_v2.db
```

**MySQL/MariaDB**:
```
mysql://homeassistant:password@localhost/homeassistant
```

**PostgreSQL**:
```
postgresql://homeassistant:password@localhost/homeassistant
```

## Usage

### Accessing the Panel

After installation, you'll find a new "Statistics Orphans" entry in your Home Assistant sidebar (with a database-search icon). Click the "Refresh" button to scan your database.

### Understanding the Interface

#### Storage Health Summary

The top section provides an at-a-glance overview with interactive filter cards:
- **Total entities** in the registry
- **Entities in state machine**
- **Entities in statistics** database
- **Entities only in states** (not in statistics)
- **Entities only in statistics** (not in states)
- **Deleted entities** (orphaned data)
- **Database size** breakdown

Click any card to instantly filter the entity table below. Additional filter buttons allow you to refine by:
- Registry status (Enabled/Disabled/Not in Registry)
- State status (Available/Unavailable/Not Present)
- States table presence (In states/Not in states)
- Statistics table presence (In statistics/Not in statistics)

#### Entity Table

A comprehensive 15-column table showing all entities:
- **Entity ID**: Clickable to open detailed diagnostics modal
- **Entity Registry**: ✓ Enabled / ⊘ Disabled / ✕ Not in Registry
- **State Machine**: ✓ Available / ⚠ Unavailable / ○ Not Present
- **States Meta, States, States #**: States table tracking
- **Message Interval**: How often the entity updates
- **Last State Update**: Most recent state change timestamp
- **Stats Meta, Short, Long**: Statistics table tracking
- **Short #, Long #**: Record counts in statistics tables
- **Last Stats Update**: Most recent statistics timestamp
- **Actions**: View details button and delete SQL button (for orphaned entities)

Features:
- **Search**: Real-time entity ID search
- **Sort**: Click column headers to sort (shift-click for multi-column)
- **Horizontal scroll**: Table scrolls horizontally with sticky first column
- **Bulk selection**: Checkboxes appear for deleted entities

#### Entity Details Modal

Click any entity ID to view comprehensive diagnostics:
- **Entity Information**: Platform, device, and integration details
- **Current Status**: Availability with intelligent explanations
- **States Table**: Presence, record count, and last update
- **Update Frequency**: Message interval and precise 24-hour update count
- **Statistics Table**: Short-term and long-term tracking status
- **Statistics Eligibility**: Smart analysis explaining why entities can or cannot have statistics:
  - Detects incompatible entity types (binary_sensor, switch, light, automation, etc.)
  - Validates numeric state before suggesting configuration changes
  - Provides actionable, context-aware explanations

### Deleting Orphaned Statistics

**IMPORTANT**: Always backup your database before performing deletions!

#### Single Entity Deletion

1. Click on an orphaned entity to view its details
2. Review the information carefully:
   - Verify you no longer need this entity's historical data
   - Check how much storage space will be freed
3. Click "Generate SQL" to create deletion statements
4. Copy the SQL statements
5. Execute them on your database:
   - **SQLite**: Use DB Browser for SQLite or the command line
   - **MySQL/MariaDB**: Use phpMyAdmin, MySQL Workbench, or command line
   - **PostgreSQL**: Use pgAdmin or command line

#### Bulk Deletion

1. Filter the entity table to show only deleted entities
2. Use checkboxes to select multiple entities for deletion
3. Click "Select All" to select all filtered deleted entities at once
4. Click "Generate Bulk SQL" to create combined deletion statements
5. Review the summary showing total entities, records, and storage to be freed
6. Copy and execute the combined SQL statements on your database

### Safety Recommendations

- **Backup First**: Always create a database backup before deleting data
- **Test in Development**: If possible, test on a development instance first
- **Review Carefully**: Double-check that you're deleting the right entities
- **Start Small**: Begin by removing one or two orphans to verify the process
- **Unavailable Entities**: Be cautious with "unavailable" entities - they might come back online

## Technical Details

### What are Orphaned Statistics?

Orphaned statistics occur when:
- You remove an integration or device
- You delete an entity
- You rename an entity (old statistics remain under the old name)
- An integration changes its entity IDs

The statistics data remains in the database even though the entity no longer exists, consuming storage space.

### Database Tables

This integration scans:
- `statistics`: Long-term historical data (typically 10+ days)
- `statistics_short_term`: Recent data (typically last 10 days)
- `statistics_meta`: Metadata about tracked statistics

### Performance

- Scanning is done asynchronously and won't block Home Assistant
- Database queries are optimized with proper indexing
- Updates are manual to avoid unnecessary database load

## Troubleshooting

### Cannot Connect to Database

**Error**: "Cannot connect to database"

**Solutions**:
- Verify your database URL is correct
- Check that credentials (if any) are valid
- Ensure the database is accessible from Home Assistant
- For SQLite, verify the file path is correct

### No Orphans Found

**If you expected orphans but none appear**:
- The integration only shows truly deleted or unavailable entities
- Entities that exist and are functioning normally won't appear
- Statistics might have been cleaned by Home Assistant's recorder already

### Frontend Panel Not Loading

**Solutions**:
- Clear your browser cache
- Do a "hard refresh" (Ctrl+Shift+R or Cmd+Shift+R)
- Check the Home Assistant logs for errors
- Verify the integration is properly installed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

This project separates development files from runtime files for a clean HACS-compliant structure.

**Project Structure:**
```
statistics-orphan-finder/
├── frontend/                   # TypeScript development
│   ├── src/                   # Source code
│   ├── scripts/               # Build scripts
│   ├── package.json           # Dependencies
│   ├── tsconfig.json          # TypeScript config
│   └── vite.config.ts         # Build config
├── docs/                      # Documentation
└── custom_components/
    └── statistics_orphan_finder/  # Runtime files only
        ├── *.py               # Python backend
        ├── services/          # Service modules
        └── www/               # Built frontend (auto-generated)
```

**Frontend Development:**
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Watch mode for development
npm run build           # Build for production
```

The build process automatically outputs to `custom_components/statistics_orphan_finder/www/`.

**Testing:**
1. Make your changes in `frontend/src/` (TypeScript) or `custom_components/statistics_orphan_finder/` (Python)
2. Build frontend: `cd frontend && npm run build`
3. Copy `custom_components/statistics_orphan_finder/` to your HA instance
4. Restart Home Assistant
5. Test thoroughly with different database types if possible

**Submitting Changes:**
1. Ensure frontend builds without errors
2. Test with real Home Assistant instance
3. Submit a pull request with clear description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/dmrtnssn/statistics-orphan-finder/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/dmrtnssn/statistics-orphan-finder/discussions)
- **Home Assistant Community**: [Community Forum Thread](https://community.home-assistant.io/)

## Disclaimer

This integration interacts with your Home Assistant database. While it takes care to generate safe SQL statements, **always backup your database** before performing any deletions. The authors are not responsible for data loss.

## Credits

Developed with the help of the Home Assistant community.
