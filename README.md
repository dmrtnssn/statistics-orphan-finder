# Statistics Orphan Finder for Home Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Home Assistant custom component that helps you identify and manage orphaned statistics entities in your database. Over time, as you remove devices or entities, their historical statistics data can remain in the database, consuming valuable storage space. This integration helps you find and clean up these orphaned entries.

> **Note**: Developed for personal use, this tool is shared as-is. Use it at your own risk.

## Features

### Orphan Finder
- **Automatic Detection**: Scans your Home Assistant database to find statistics for entities that no longer exist
- **Status Classification**: Distinguishes between truly deleted entities and temporarily unavailable ones
- **Storage Analysis**: Calculates how much database space is being used by orphaned statistics
- **SQL Generation**: Generates safe SQL statements to remove orphaned data

### Storage Overview
- **Comprehensive Entity Analysis**: View all entities with their storage footprint across states and statistics tables
- **Smart Filtering**: Filter entities by registry status, state machine presence, statistics tracking, and more
- **Update Frequency Tracking**: See message intervals and update frequency for each entity
- **Entity Details Modal**: Click any entity ID to view detailed diagnostics including availability status, device info, and statistics eligibility
- **Visual Filter Indicators**: Active filters are highlighted for easy identification
- **Database Overview**: Real-time insights into your database size across different tables

### General Features
- **User-Friendly Interface**: Beautiful web-based panel with two tabs integrated into Home Assistant's sidebar
- **Multi-Database Support**: Works with SQLite, MySQL/MariaDB, and PostgreSQL databases
- **Clickable Entity IDs**: Direct access to Home Assistant's more-info dialog for any entity

## Screenshots

The integration adds a new panel to your Home Assistant sidebar with two main tabs:

### Orphan Finder Tab
- View all orphaned statistics entities
- See when each entity was last updated
- Check whether data is in short-term, long-term, or both statistics tables
- Calculate storage space saved by deletion
- Generate and copy SQL deletion statements

### Storage Overview Tab
- Analyze all entities and their database storage footprint
- Filter by registry status, state machine presence, and statistics tracking
- View update frequencies and message intervals
- Click entity IDs to see detailed diagnostics and availability information
- Identify which entities are eligible for statistics tracking and why

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

After installation, you'll find a new "Statistics Orphans" entry in your Home Assistant sidebar (with a database-search icon). The panel has two tabs:

### Understanding the Interface

#### Orphan Finder Tab

This tab helps you identify and remove orphaned statistics:

1. **Database Overview**: Total records and storage space across different database tables
2. **Orphaned Entities List**:
   - **Entity ID**: The identifier of the orphaned entity (clickable to open details)
   - **Status**:
     - `deleted`: Entity no longer exists in Home Assistant
     - `unavailable`: Entity exists but is currently unavailable
   - **Last Update**: When the last statistic was recorded
   - **Origin**: Where the statistics are stored (Long-term, Short-term, or Both)
   - **Record Count**: Number of statistic entries
   - **Storage**: Estimated database space used

#### Storage Overview Tab

This tab provides comprehensive entity storage analysis:

1. **Database Overview Cards**: Visual breakdown of storage by category
   - Total entities in registry
   - Entities in state machine
   - Entities in statistics database
   - Entities only in states (not statistics)
   - Entities only in statistics (not states)
   - Deleted entities
   - Click any card to filter the table below

2. **Entity Table**: Detailed list of all entities with:
   - **Entity ID**: Clickable to open detailed diagnostics modal
   - **Name**: Friendly name of the entity
   - **Registry**: Whether entity is registered in Home Assistant
   - **State**: Whether entity has state machine records
   - **Statistics**: Whether entity has statistics records
   - **Records**: Total number of state records
   - **Storage**: Estimated database space used
   - **Interval**: Message interval (how often entity updates)
   - Search and sort functionality

3. **Entity Details Modal**: Click any entity ID to see:
   - Current availability status (available/unavailable/unknown)
   - Device information and platform
   - Configuration entry details
   - Update frequency and message interval
   - Statistics eligibility explanation
   - Reasons why entity may not be tracked in statistics

### Deleting Orphaned Statistics

**IMPORTANT**: Always backup your database before performing deletions!

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

1. Clone the repository
2. Make your changes
3. Test thoroughly with different database types if possible
4. Submit a pull request

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
