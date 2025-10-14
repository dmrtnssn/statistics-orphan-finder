# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-14

### Added

#### Core Features
- Initial release of Statistics Orphan Finder custom component for Home Assistant
- Automatic detection of orphaned statistics entities in the database
- Status classification distinguishing between deleted and temporarily unavailable entities
- SQL generation for safe cleanup of orphaned data
- Web-based management panel integrated into Home Assistant sidebar
- Multi-database support for SQLite, MySQL/MariaDB, and PostgreSQL

#### Orphan Finder Tab
- Database overview showing total records and storage space across different tables
- Orphaned entities list with detailed information:
  - Entity ID with clickable links
  - Entity status (deleted/unavailable)
  - Last update timestamp
  - Origin (Long-term, Short-term, or Both statistics)
  - Record count and storage estimation
- Storage analysis calculating database space used by orphaned statistics
- Copy-to-clipboard functionality for generated SQL statements

#### Storage Overview Tab
- Comprehensive entity storage analysis across all Home Assistant entities
- Visual database overview cards showing:
  - Total entities in registry
  - Entities in state machine
  - Entities in statistics database
  - Entities only in states (not tracked in statistics)
  - Entities only in statistics (not in state machine)
  - Deleted entities
- Smart filtering system:
  - Filter by registry status
  - Filter by state machine presence
  - Filter by statistics tracking status
  - Visual indicators for active filters with border highlights
- Sortable entity table displaying:
  - Entity ID (clickable)
  - Friendly name
  - Registry, state, and statistics status
  - Record counts
  - Storage footprint
  - Message interval (update frequency)
- Entity details modal providing:
  - Real-time availability status with color-coded indicators
  - Device information and platform details
  - Configuration entry information
  - Update frequency and message interval calculations
  - Statistics eligibility explanations
  - Diagnostic information for entities not tracked in statistics

#### User Interface Enhancements
- Clickable entity IDs throughout the interface that open Home Assistant's more-info dialog
- Smart formatting for message intervals (seconds/minutes/hours)
- Search functionality for filtering entities
- Responsive design adapting to different screen sizes
- Color-coded status indicators (red/yellow/green) for quick visual reference
- Active filter highlighting with glowing borders

#### Developer Features
- Async database operations to prevent blocking Home Assistant
- Optimized database queries with proper indexing
- Clean component architecture following Home Assistant best practices
- Config flow for UI-based setup
- Proper error handling and logging

[1.0.0]: https://github.com/dmrtnssn/statistics-orphan-finder/releases/tag/v1.0.0
