# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Statistics Orphan Finder is a Home Assistant custom integration that helps identify and manage orphaned statistics entities in the database. It provides a web-based panel for analyzing entity storage usage, detecting deleted entities, and generating SQL statements to clean up orphaned data.

**Domain**: `statistics_orphan_finder`
**Version**: 2.7.0
**Type**: Custom panel with database analysis backend
**Test Coverage**: 91% (193 tests, all passing)

## Architecture

### Backend (Python)

The Python backend follows a service-oriented architecture:

- **`__init__.py`**: Entry point that registers the frontend panel and API view. Copies frontend files from `www/` to Home Assistant's `www/community/` directory on setup.
- **`coordinator.py`**: `StatisticsOrphanCoordinator` orchestrates all data fetching operations. Implements an 8-step progressive data loading system to avoid blocking the UI.
- **`config_flow.py`**: Handles UI-based configuration for database connection (SQLite, MySQL, PostgreSQL).

**Service Modules** (in `services/`):
- **`database_service.py`**: Database connection management and size calculations
- **`entity_analyzer.py`**: Entity availability analysis, statistics eligibility checking, and update frequency calculations
- **`storage_calculator.py`**: Calculates storage usage for entities across multiple database tables
- **`sql_generator.py`**: Generates safe DELETE SQL statements for orphaned entities

### Frontend (TypeScript + Lit)

Built with Lit 3.x web components, TypeScript 5.x, and Vite 5.x:

- **Source**: `frontend/src/` (development files)
- **Build output**: `custom_components/statistics_orphan_finder/www/` (production files)
- **Entry point**: `statistics-orphan-panel.ts`

The frontend is organized into:
- `components/`: Reusable UI components (entity-table, filter-bar, summary-cards, modals, etc.)
- `views/`: Main tab views (storage-overview-view)
- `services/`: API client (`api-service.ts`), formatters, cache, DOM utilities
- `types/`: TypeScript type definitions (Entity, Summary, etc.)
- `styles/`: Shared CSS (`shared-styles.ts`)

**Build configuration** (`vite.config.ts`):
- Outputs ES modules with code splitting enabled
- Separates Lit library into `lit-core` chunk for caching
- Minifies with Terser (removes comments)
- Source maps enabled for debugging
- Path alias `@` points to `src/`

### API Endpoints

The integration registers a single API endpoint at `/api/statistics_orphan_finder` with these actions:

1. **`?action=database_size`**: Returns total database size information
2. **`?action=entity_storage_overview_step&step=N`**: Progressive data loading (steps 0-8)
3. **`?action=entity_message_histogram`**: Returns hourly message counts for an entity
   - Query params: `entity_id`, `hours` (24, 48, or 168)
4. **`?action=generate_delete_sql`**: Generates SQL deletion statements
   - Query params: `origin`, `entity_id`, `in_states_meta`, `in_statistics_meta`

All endpoints handled by `StatisticsOrphanView` in `__init__.py`, which delegates to coordinator methods.

### Data Flow

1. Frontend calls `/api/statistics_orphan_finder?action=entity_storage_overview_step&step=N`
2. API view routes to `coordinator.async_execute_overview_step(step)`
3. Coordinator executes one of 8 steps:
   - **Step 0**: Initialize data structures (`_init_step_data`)
   - **Step 1**: Fetch `states_meta` entities
   - **Step 2**: Fetch `states` with counts and last update timestamps
   - **Step 3**: Fetch `statistics_meta` with metadata IDs (stored for later use)
   - **Step 4**: Fetch `statistics_short_term` with counts
   - **Step 5**: Fetch `statistics` (long-term) with counts
   - **Step 6**: Enrich with entity/device registry and state machine info
   - **Step 7**: Calculate storage for deleted entities
   - **Step 8**: Calculate storage for disabled entities, generate summary, cleanup
4. Each step returns partial results to avoid UI blocking
5. Frontend aggregates results and displays in table
6. **Important**: `_step_data` holds intermediate state between steps, cleaned up in Step 8

## Development Commands

### Testing

**Run all tests:**
```bash
./run-tests.sh                    # Run all tests with full output
./run-tests.sh --silent           # Run with minimal output (just success rate and failures)
./run-tests.sh -s                 # Short form of --silent
./run-tests.sh --coverage         # Run with coverage report (HTML + terminal)
./run-tests.sh -c                 # Short form of --coverage
```

**Run specific tests:**
```bash
./run-tests.sh tests/test_coordinator.py                    # Single file
./run-tests.sh tests/test_coordinator.py::TestClass         # Single test class
./run-tests.sh tests/test_coordinator.py::TestClass::test_method  # Single test
./run-tests.sh -v                                           # Verbose output
```

**Test structure:**
- `tests/` - Test files (193 tests, 91% coverage)
- `tests/conftest.py` - Shared fixtures (sqlite_engine, populated_sqlite_engine, mock_hass, etc.)
- `tests/services/` - Service module tests
- `.coveragerc` - Coverage configuration (important: defines omit patterns, exclude_lines)
- `pytest.ini` - Pytest configuration (coverage enabled by default)

**Coverage details:**
- Overall: 91% (910 statements, 850 covered)
- Perfect coverage: storage_calculator.py (100%), const.py (100%), services/__init__.py (100%)
- Excellent: coordinator.py (91%), entity_analyzer.py (92%), sql_generator.py (95%), __init__.py (91%)

### Frontend Build

```bash
cd frontend
npm install              # Install dependencies (Lit, TypeScript, Vite)
npm run dev             # Watch mode for development (auto-rebuild)
npm run build           # Production build (output to ../custom_components/statistics_orphan_finder/www/)
npm run build:prod      # Same as build but with production mode flag
```

### Build and Deploy

**Automated deployment script:**
```bash
./build-and-deploy.sh    # Runs tests, builds frontend, uploads to Home Assistant
```

The script executes in this order:
1. **Step 1**: Run tests with `./run-tests.sh -s` (deployment aborts if tests fail)
2. **Step 2**: Build frontend with `npm run build`
3. **Step 3**: Upload to Home Assistant via SCP

**Note**: User builds manually - Claude should NOT run builds automatically.

### Testing in Home Assistant

After building frontend:
1. Copy `custom_components/statistics_orphan_finder/` to your HA `custom_components/` directory
2. Restart Home Assistant
3. Add integration via Settings → Devices & Services → Statistics Orphan Finder
4. Access panel via sidebar ("Statistics Orphans")

## Key Patterns

### Progressive Data Loading

The coordinator uses an 8-step process to avoid blocking:
- Each step is executed via `async_execute_overview_step(step_number)`
- Intermediate data stored in `self._step_data`
- Frontend shows progress indicator while steps execute
- Final step (8) cleans up `_step_data` and returns complete results

### Database Abstraction

- SQLAlchemy for database abstraction (supports SQLite, MySQL, PostgreSQL)
- Queries use `text()` for raw SQL with proper parameter binding
- Database engine created lazily via `DatabaseService.get_engine()`
- Connection pooling handled by SQLAlchemy

### Storage Calculation

Storage estimates combine:
- States table: `states_meta` (metadata) + `states` (actual records)
- Statistics tables: `statistics_meta` (metadata) + `statistics_short_term` + `statistics` (long-term)
- Estimates based on average row sizes and record counts
- **Database-specific calculations**: Different estimation methods for SQLite, MySQL/MariaDB, and PostgreSQL (see `StorageCalculator._calculate_states_size` and `_calculate_statistics_size`)
- Uses entity's `metadata_id` from `statistics_meta` to efficiently query statistics tables without N+1 problem

### SQL Generation

Generated SQL statements:
- Delete from `states` (if entity has state records)
- Delete from `states_meta` (if entity in states metadata)
- Delete from `statistics_short_term` (if entity has short-term stats)
- Delete from `statistics` (if entity has long-term stats)
- Delete from `statistics_meta` (if entity in statistics metadata)

All DELETE statements use proper WHERE clauses with entity_id or metadata_id.

## File Locations

### Python Backend
- `custom_components/statistics_orphan_finder/*.py` - Core integration files (2,023 lines)
- `custom_components/statistics_orphan_finder/services/*.py` - Service modules
- `custom_components/statistics_orphan_finder/www/` - Built frontend (auto-generated, DO NOT edit)

### Frontend Development
- `frontend/src/` - TypeScript source files (5,862 lines - edit these)
- `frontend/package.json` - Node dependencies
- `frontend/vite.config.ts` - Build configuration
- `frontend/tsconfig.json` - TypeScript configuration

### Testing
- `tests/` - Test files (4,023 lines, 193 tests)
- `tests/conftest.py` - Shared fixtures and test configuration
- `tests/services/` - Service module tests
- `run-tests.sh` - Test runner script with coverage support
- `.coveragerc` - Coverage configuration (keep in repo - has important exclusion patterns)
- `pytest.ini` - Pytest configuration

### Scripts
- `build-and-deploy.sh` - Automated build, test, and deploy script
- `run-tests.sh` - Test runner with silent mode and coverage options

### Documentation
- `CLAUDE.md` - This file (developer guidance)
- `CLAUDE.local.md` - Local development notes (not in git)
- `docs/BUILD_INSTRUCTIONS.md` - Simplified build instructions

## Important Constraints

1. **No automatic builds**: User builds frontend manually. Claude should NOT run `npm run build` unless explicitly requested.
2. **HACS compliance**: Custom component structure follows HACS standards (see `hacs.json`). All runtime files in `custom_components/`, dev files in `frontend/` and `docs/`.
3. **Frontend file copying**: `__init__.py` copies `www/` files to `www/community/statistics_orphan_finder/` on setup with cache-busting timestamps.
4. **Code splitting**: Vite build creates `chunks/` directory for code-split bundles. Lit library separated into `lit-core` chunk for better caching.
5. **Multi-database support**: Must work with SQLite, MySQL/MariaDB, and PostgreSQL. Storage calculations differ per DB type (see `StorageCalculator._calculate_*_size` methods).
6. **TypeScript decorators**: `tsconfig.json` requires `experimentalDecorators: true` and `useDefineForClassFields: false` for Lit decorators.

## Database Schema Dependencies

The integration expects these Home Assistant recorder tables:
- `states_meta`: Entity metadata for states
- `states`: State history records
- `statistics_meta`: Entity metadata for statistics
- `statistics_short_term`: Short-term statistics (typically last 10 days)
- `statistics`: Long-term statistics (10+ days)

Queries join on:
- `states.metadata_id = states_meta.metadata_id`
- `statistics.metadata_id = statistics_meta.id`
- `statistics_short_term.metadata_id = statistics_meta.id`

## Common Tasks

### Adding tests for new features
1. Create test file in `tests/` (use `test_*.py` naming)
2. Use existing fixtures from `conftest.py`:
   - `sqlite_engine` - In-memory SQLite with HA schema
   - `populated_sqlite_engine` - Pre-populated with test data
   - `mock_hass` - Mocked Home Assistant instance
   - `mock_entity_registry`, `mock_device_registry` - Registry mocks
3. Run tests: `./run-tests.sh tests/test_yourfile.py -v`
4. Check coverage: `./run-tests.sh --coverage`
5. Target: 80%+ coverage for new code

### Adding a new analysis step
1. Add step method in `coordinator.py` (e.g., `_fetch_step_N_...`)
2. Update `_execute_overview_step()` to route to new step
3. Update total step count in `_init_step_data()`
4. Update frontend to handle new step
5. **Add tests** for the new step in `tests/test_coordinator.py`

### Adding a new service module
1. Create file in `custom_components/statistics_orphan_finder/services/`
2. Add class and import to `services/__init__.py`
3. Instantiate in `StatisticsOrphanCoordinator.__init__()` (e.g., `self.new_service = NewService(hass, entry)`)
4. Use via coordinator methods or delegate to service methods
5. **Create test file** in `tests/services/test_yourservice.py`

### Modifying frontend
1. Edit TypeScript files in `frontend/src/`
2. Run `npm run dev` for auto-rebuild during development (watch mode)
3. Test in Home Assistant by hard-refreshing panel (Ctrl+Shift+R)
4. Run `npm run build` for production build when done
5. Check browser console (F12) for TypeScript errors
6. Verify `chunks/` directory is copied to HA's `www/community/statistics_orphan_finder/`

### Changing database queries
1. Locate query in appropriate service module or `coordinator.py`
2. Update SQL via `text()` constructor with proper parameter binding
3. **Add/update tests** to cover the query changes
4. Test against all database types if possible (SQLite, MySQL, PostgreSQL)
5. Consider performance impact for large databases (Home Assistant DBs can be 10+ GB)
6. For multi-step queries, ensure `metadata_id` is fetched early to avoid N+1 queries

### Before committing changes
1. Run tests: `./run-tests.sh --silent` (must pass)
2. Check coverage hasn't dropped significantly
3. Build frontend if modified: `cd frontend && npm run build`
4. Test in actual Home Assistant instance
5. The `build-and-deploy.sh` script runs tests automatically before deployment

## Configuration

### Config Entry

Configured via UI (Settings → Devices & Services → Add Integration). Config flow in `config_flow.py` collects:
- **Database URL** (`CONF_DB_URL`): SQLAlchemy connection string
  - SQLite: `sqlite:////config/home-assistant_v2.db`
  - MySQL: `mysql://user:pass@host/database`
  - PostgreSQL: `postgresql://user:pass@host/database`
- **Username** (`CONF_USERNAME`): Optional, for separate DB credentials
- **Password** (`CONF_PASSWORD`): Optional, for separate DB credentials

Constants defined in `const.py`: `DOMAIN`, `CONF_DB_URL`, `CONF_USERNAME`, `CONF_PASSWORD`

### Panel Registration

In `async_setup_entry` (`__init__.py`):
1. Copies `www/` files to `<config>/www/community/statistics_orphan_finder/`
2. Registers frontend panel with cache-busting timestamp
3. Registers API view (`StatisticsOrphanView`)
4. Creates coordinator instance

Panel uses Home Assistant's `frontend.async_register_built_in_panel` with:
- Component: `custom` (generic custom panel type)
- Module URL: `/local/community/statistics_orphan_finder/statistics-orphan-panel.js?t={timestamp}`
- Icon: `mdi:database-search`
- Sidebar title: "Statistics Orphans"
- Admin-only access: `require_admin=True`
