"""DataUpdateCoordinator for Statistics Orphan Finder."""
import logging
from datetime import timedelta
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from datetime import datetime, timezone

from .const import DOMAIN, CONF_DB_URL, CONF_USERNAME, CONF_PASSWORD

_LOGGER = logging.getLogger(__name__)


class StatisticsOrphanCoordinator(DataUpdateCoordinator):
    """Coordinator to fetch orphaned statistics entities."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=None,  # Manual updates only
        )
        self.entry = entry
        self._engine = None
        self._categorized_storage = {"deleted_storage": 0, "unavailable_storage": 0}

    def _get_engine(self):
        """Get or create database engine."""
        if self._engine is None:
            db_url = self.entry.data[CONF_DB_URL]
            username = self.entry.data.get(CONF_USERNAME)
            password = self.entry.data.get(CONF_PASSWORD)

            # Build connection string
            if username and password:
                if "://" in db_url:
                    protocol, rest = db_url.split("://", 1)
                    db_url = f"{protocol}://{username}:{password}@{rest}"

            self._engine = create_engine(db_url, pool_pre_ping=True)

        return self._engine

    def _determine_availability_reason(self, entity_id, registry_entry, state, device_registry):
        """Determine why an entity is unavailable with user-friendly hint."""

        # Entity is administratively disabled
        if registry_entry and registry_entry.disabled:
            reasons = {
                "user": "Manually disabled by user",
                "integration": "Disabled by integration",
                "device": "Disabled because parent device is disabled",
                "config_entry": "Disabled because integration config is disabled"
            }
            return reasons.get(registry_entry.disabled_by, "Disabled")

        # Check device status
        if registry_entry and registry_entry.device_id:
            device_entry = device_registry.async_get(registry_entry.device_id)
            if device_entry and device_entry.disabled:
                return f"Parent device '{device_entry.name}' is disabled"

        # Check config entry status
        if registry_entry and registry_entry.config_entry_id:
            config_entry = self.hass.config_entries.async_get_entry(
                registry_entry.config_entry_id
            )
            if config_entry:
                platform_name = registry_entry.platform or "integration"
                if config_entry.state.name == "SETUP_ERROR":
                    return f"Integration failed to load ({platform_name})"
                elif config_entry.state.name == "SETUP_RETRY":
                    return f"Integration retrying setup ({platform_name})"
                elif config_entry.state.name == "NOT_LOADED":
                    return f"Integration not loaded ({platform_name})"

        # Check if recently unavailable (likely still loading)
        if state and state.state in ["unavailable", "unknown"]:
            now = datetime.now(timezone.utc)
            duration = (now - state.last_changed).total_seconds()

            if duration < 120:  # Less than 2 minutes
                return f"Recently unavailable ({int(duration)}s) - may still be loading"
            elif duration < 3600:  # Less than 1 hour
                return f"Unavailable for {int(duration/60)} minutes - device likely offline or unreachable"
            elif duration < 86400:  # Less than 1 day
                return f"Offline for {int(duration/3600)} hours - device unplugged or unreachable"
            else:
                days = int(duration/86400)
                return f"Offline for {days} day{'s' if days > 1 else ''} - device unplugged or unreachable"

        # Entity doesn't exist in state machine at all
        if not state:
            if registry_entry:
                return "Registered but never loaded - integration may have issues"
            else:
                return "Entity has been deleted - no longer exists in Home Assistant"

        return "Unknown reason"

    def _determine_statistics_eligibility(self, entity_id, registry_entry, state):
        """Determine why an entity is not eligible for statistics with user-friendly explanation."""

        # If entity is already in statistics, no need to check eligibility
        # (This check should be done by the caller before calling this method)

        # Check if entity is deleted or not registered
        if not registry_entry:
            return "Entity has been deleted from Home Assistant"

        # Check if entity is disabled
        if registry_entry.disabled:
            return "Entity is disabled - statistics are not recorded for disabled entities"

        # Check if entity has no state
        if not state:
            return "Entity has no state - it may not be loaded or never provided a state"

        # Check if entity state is unavailable or unknown
        if state.state in ["unavailable", "unknown"]:
            return "Entity is currently unavailable - statistics require valid state values"

        # Get state attributes
        attributes = state.attributes or {}

        # Check for state_class attribute (required for statistics)
        state_class = attributes.get("state_class")
        if not state_class:
            return "Missing 'state_class' attribute - entities need state_class (measurement, total, or total_increasing) to be recorded in statistics"

        # Check for unit_of_measurement (required for statistics)
        unit = attributes.get("unit_of_measurement")
        if not unit:
            return "Missing 'unit_of_measurement' attribute - statistics require a unit of measurement"

        # Check if state value is numeric
        try:
            float(state.state)
        except (ValueError, TypeError):
            return f"State value '{state.state}' is not numeric - statistics only work with numeric values"

        # If all checks pass, entity should be eligible
        return "Entity appears eligible for statistics - it may take time to appear, or check recorder configuration"

    def _calculate_update_frequency(self, entity_id):
        """Calculate update frequency from states table."""
        engine = self._get_engine()

        with engine.connect() as conn:
            # Get last 50 state updates
            query = text("""
                SELECT last_updated_ts
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                WHERE sm.entity_id = :entity_id
                ORDER BY last_updated_ts DESC
                LIMIT 50
            """)
            result = conn.execute(query, {"entity_id": entity_id})
            timestamps = [row[0] for row in result]

            if len(timestamps) < 2:
                return None

            # Calculate intervals between consecutive updates
            intervals = []
            for i in range(len(timestamps) - 1):
                interval = timestamps[i] - timestamps[i+1]
                intervals.append(interval)

            if not intervals:
                return None

            avg_interval = sum(intervals) / len(intervals)

            # Count updates in last 24 hours
            cutoff = datetime.now(timezone.utc).timestamp() - 86400
            count_24h = sum(1 for ts in timestamps if ts >= cutoff)

            interval_seconds = int(avg_interval)
            return {
                'interval_seconds': interval_seconds,
                'update_count_24h': count_24h,
                'interval_text': self._format_interval(interval_seconds)
            }

    def _format_interval(self, seconds):
        """Format update interval in human-readable format."""
        if seconds == 0 or seconds is None:
            return None

        # Format based on duration
        if seconds < 60:
            # Less than 60 seconds: show in seconds
            return f"{seconds}s"
        elif seconds < 3600:
            # Between 60 and 3599 seconds: show in minutes
            minutes = seconds / 60
            if minutes >= 10:
                return f"{minutes:.1f}min"
            else:
                return f"{minutes:.2f}min"
        else:
            # 3600 seconds or more: show in hours
            hours = seconds / 3600
            if hours >= 10:
                return f"{hours:.1f}h"
            else:
                return f"{hours:.2f}h"

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch orphaned entities from statistics."""
        try:
            # Get entity registry
            entity_registry = er.async_get(self.hass)
            return await self.hass.async_add_executor_job(
                self._fetch_orphaned_entities, entity_registry
            )
        except SQLAlchemyError as err:
            raise UpdateFailed(f"Error communicating with database: {err}") from err

    def _fetch_orphaned_entities(self, entity_registry) -> dict[str, Any]:
        """Fetch orphaned entities (blocking I/O)."""
        engine = self._get_engine()

        with engine.connect() as conn:
            # Get all unique metadata_ids from statistics (long-term)
            query = text("""
                SELECT DISTINCT metadata_id
                FROM statistics
            """)
            result = conn.execute(query)
            stats_metadata_ids = {row[0] for row in result}

            # Get all unique metadata_ids from statistics_short_term
            query_short = text("""
                SELECT DISTINCT metadata_id
                FROM statistics_short_term
            """)
            try:
                result_short = conn.execute(query_short)
                stats_short_term_metadata_ids = {row[0] for row in result_short}
            except Exception:
                # Table might not exist in older HA versions
                stats_short_term_metadata_ids = set()

            # Combine all metadata IDs
            all_metadata_ids = stats_metadata_ids | stats_short_term_metadata_ids

            # Get metadata for these IDs
            if not all_metadata_ids:
                return {}

            placeholders = ",".join([":id" + str(i) for i in range(len(all_metadata_ids))])
            query = text(f"""
                SELECT id, statistic_id
                FROM statistics_meta
                WHERE id IN ({placeholders})
            """)

            params = {f"id{i}": mid for i, mid in enumerate(all_metadata_ids)}
            result = conn.execute(query, params)

            metadata_map = {row[0]: row[1] for row in result}

            # Check which entities exist in Home Assistant
            orphaned_data = {}

            for metadata_id, entity_id in metadata_map.items():
                # Check state machine (currently active entities)
                state = self.hass.states.get(entity_id)

                # Check entity registry (persisted entities, even if unavailable)
                registry_entry = entity_registry.async_get(entity_id)

                # Determine status
                status = None
                if registry_entry is not None:
                    # Entity exists in registry
                    if state is None:
                        status = "unavailable"  # Registered but no state
                    # else: entity exists and has state (not orphaned, skip)
                elif state is None:
                    # Not in registry and no state = truly deleted
                    status = "deleted"
                # else: has state but not in registry (unusual, but skip)

                # Only include if truly deleted or unavailable
                if status:
                    # Determine origin (which table(s) contain this entity)
                    in_long_term = metadata_id in stats_metadata_ids
                    in_short_term = metadata_id in stats_short_term_metadata_ids

                    if in_long_term and in_short_term:
                        origin = "Both"
                    elif in_long_term:
                        origin = "Long-term"
                    else:
                        origin = "Short-term"

                    # Count statistics entries and get the most recent statistic timestamp
                    # The 'start_ts' column contains Unix timestamps
                    count = 0
                    last_update_ts = None

                    if in_long_term:
                        stats_query = text("""
                            SELECT COUNT(*) as count,
                                   MAX(start_ts) as last_update_ts
                            FROM statistics
                            WHERE metadata_id = :metadata_id
                        """)
                        stats_result = conn.execute(stats_query, {"metadata_id": metadata_id})
                        row = stats_result.fetchone()
                        count += row[0]
                        if row[1] and (not last_update_ts or row[1] > last_update_ts):
                            last_update_ts = row[1]

                    if in_short_term:
                        stats_short_query = text("""
                            SELECT COUNT(*) as count,
                                   MAX(start_ts) as last_update_ts
                            FROM statistics_short_term
                            WHERE metadata_id = :metadata_id
                        """)
                        stats_short_result = conn.execute(stats_short_query, {"metadata_id": metadata_id})
                        row = stats_short_result.fetchone()
                        count += row[0]
                        if row[1] and (not last_update_ts or row[1] > last_update_ts):
                            last_update_ts = row[1]

                    # Convert Unix timestamp to datetime
                    last_update = None
                    if last_update_ts:
                        from datetime import datetime
                        last_update = datetime.fromtimestamp(last_update_ts)

                    orphaned_data[entity_id] = {
                        "count": count,
                        "status": status,
                        "last_update": last_update.isoformat() if last_update else None,
                        "origin": origin,
                        "metadata_id": metadata_id
                    }

            _LOGGER.info(
                "Found %d orphaned entities in statistics (%d deleted, %d unavailable)",
                len(orphaned_data),
                sum(1 for v in orphaned_data.values() if v["status"] == "deleted"),
                sum(1 for v in orphaned_data.values() if v["status"] == "unavailable")
            )

            # Calculate categorized storage
            self._categorized_storage = self._calculate_categorized_storage(orphaned_data)

            return orphaned_data

    def _fetch_database_size(self) -> dict[str, Any]:
        """Fetch database size information (blocking I/O)."""
        engine = self._get_engine()

        with engine.connect() as conn:
            # Determine database type
            db_url = self.entry.data[CONF_DB_URL]
            is_sqlite = db_url.startswith("sqlite")
            is_mysql = "mysql" in db_url or "mariadb" in db_url
            is_postgres = "postgresql" in db_url or "postgres" in db_url

            # Get database size for different tables
            # Query for states table size
            states_query = text("""
                SELECT COUNT(*) as count
                FROM states
            """)
            states_result = conn.execute(states_query)
            states_count = states_result.fetchone()[0]

            # Query for statistics table (long-term)
            statistics_query = text("""
                SELECT COUNT(*) as count
                FROM statistics
            """)
            statistics_result = conn.execute(statistics_query)
            statistics_count = statistics_result.fetchone()[0]

            # Query for statistics_short_term table
            statistics_short_term_count = 0
            statistics_short_term_query = text("""
                SELECT COUNT(*) as count
                FROM statistics_short_term
            """)
            try:
                statistics_short_term_result = conn.execute(statistics_short_term_query)
                statistics_short_term_count = statistics_short_term_result.fetchone()[0]
            except Exception:
                # Table might not exist in older HA versions
                pass

            # Get table sizes in bytes
            states_size = 0
            statistics_size = 0
            statistics_short_term_size = 0
            other_size = 0

            try:
                if is_sqlite:
                    # For SQLite, use page_count and page_size
                    # Get total database size
                    size_query = text("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
                    result = conn.execute(size_query)
                    total_size = result.fetchone()[0]

                    # Estimate based on row counts (rough approximation)
                    total_count = states_count + statistics_count + statistics_short_term_count
                    if total_count > 0:
                        states_size = int((states_count / total_count) * total_size * 0.85)
                        statistics_size = int((statistics_count / total_count) * total_size * 0.85)
                        statistics_short_term_size = int((statistics_short_term_count / total_count) * total_size * 0.85)
                        other_size = total_size - states_size - statistics_size - statistics_short_term_size
                    else:
                        other_size = total_size

                elif is_mysql:
                    # For MySQL/MariaDB
                    size_query = text("""
                        SELECT
                            table_name,
                            data_length + index_length as size
                        FROM information_schema.tables
                        WHERE table_schema = DATABASE()
                        AND table_name IN ('states', 'statistics', 'statistics_meta', 'statistics_short_term', 'events', 'event_data', 'event_types', 'state_attributes', 'states_meta', 'recorder_runs')
                    """)
                    result = conn.execute(size_query)
                    for row in result:
                        table_name = row[0]
                        size = row[1] or 0
                        if table_name == 'states':
                            states_size = size
                        elif table_name == 'statistics':
                            statistics_size = size
                        elif table_name == 'statistics_short_term':
                            statistics_short_term_size = size
                        else:
                            other_size += size

                elif is_postgres:
                    # For PostgreSQL
                    size_query = text("""
                        SELECT
                            tablename,
                            pg_total_relation_size(schemaname||'.'||tablename) as size
                        FROM pg_tables
                        WHERE schemaname = 'public'
                        AND tablename IN ('states', 'statistics', 'statistics_meta', 'statistics_short_term', 'events', 'event_data', 'event_types', 'state_attributes', 'states_meta', 'recorder_runs')
                    """)
                    result = conn.execute(size_query)
                    for row in result:
                        table_name = row[0]
                        size = row[1] or 0
                        if table_name == 'states':
                            states_size = size
                        elif table_name == 'statistics':
                            statistics_size = size
                        elif table_name == 'statistics_short_term':
                            statistics_short_term_size = size
                        else:
                            other_size += size

            except Exception as err:
                _LOGGER.warning("Could not fetch table sizes: %s", err)

            # For "other", we'll calculate based on total database size
            # Get a rough estimate of total records
            total_count = states_count + statistics_count + statistics_short_term_count

            # Return the counts and sizes
            return {
                "states": states_count,
                "statistics": statistics_count,
                "statistics_short_term": statistics_short_term_count,
                "other": max(0, int(total_count * 0.1)),  # Estimate ~10% for metadata and other tables
                "states_size": states_size,
                "statistics_size": statistics_size,
                "statistics_short_term_size": statistics_short_term_size,
                "other_size": other_size
            }

    async def async_get_database_size(self) -> dict[str, Any]:
        """Get database size information."""
        try:
            return await self.hass.async_add_executor_job(self._fetch_database_size)
        except SQLAlchemyError as err:
            _LOGGER.error("Error fetching database size: %s", err)
            return {
                "states": 0,
                "statistics": 0,
                "statistics_short_term": 0,
                "other": 0,
                "states_size": 0,
                "statistics_size": 0,
                "statistics_short_term_size": 0,
                "other_size": 0
            }

    def _calculate_entity_storage(self, metadata_id: int, origin: str) -> int:
        """Calculate estimated storage size for an entity's statistics."""
        engine = self._get_engine()
        total_size = 0

        with engine.connect() as conn:
            # Determine database type
            db_url = self.entry.data[CONF_DB_URL]
            is_sqlite = db_url.startswith("sqlite")
            is_mysql = "mysql" in db_url or "mariadb" in db_url
            is_postgres = "postgresql" in db_url or "postgres" in db_url

            try:
                # Calculate size for long-term statistics
                if origin in ["Long-term", "Both"]:
                    count_query = text("SELECT COUNT(*) FROM statistics WHERE metadata_id = :metadata_id")
                    count_result = conn.execute(count_query, {"metadata_id": metadata_id})
                    row_count = count_result.fetchone()[0]

                    if is_mysql:
                        # Get average row length from information_schema
                        size_query = text("""
                            SELECT avg_row_length
                            FROM information_schema.tables
                            WHERE table_schema = DATABASE() AND table_name = 'statistics'
                        """)
                        size_result = conn.execute(size_query)
                        avg_row_length = size_result.fetchone()[0] or 100
                        total_size += row_count * avg_row_length
                    elif is_postgres:
                        # Estimate based on table size / total rows
                        size_query = text("""
                            SELECT pg_total_relation_size('statistics') / NULLIF((SELECT COUNT(*) FROM statistics), 0) as avg_row_size
                        """)
                        size_result = conn.execute(size_query)
                        avg_row_size = size_result.fetchone()[0] or 100
                        total_size += row_count * int(avg_row_size)
                    else:  # SQLite
                        # Estimate ~100 bytes per row (conservative estimate)
                        total_size += row_count * 100

                # Calculate size for short-term statistics
                if origin in ["Short-term", "Both"]:
                    count_query = text("SELECT COUNT(*) FROM statistics_short_term WHERE metadata_id = :metadata_id")
                    count_result = conn.execute(count_query, {"metadata_id": metadata_id})
                    row_count = count_result.fetchone()[0]

                    if is_mysql:
                        size_query = text("""
                            SELECT avg_row_length
                            FROM information_schema.tables
                            WHERE table_schema = DATABASE() AND table_name = 'statistics_short_term'
                        """)
                        size_result = conn.execute(size_query)
                        avg_row_length = size_result.fetchone()[0] or 100
                        total_size += row_count * avg_row_length
                    elif is_postgres:
                        size_query = text("""
                            SELECT pg_total_relation_size('statistics_short_term') / NULLIF((SELECT COUNT(*) FROM statistics_short_term), 0) as avg_row_size
                        """)
                        size_result = conn.execute(size_query)
                        avg_row_size = size_result.fetchone()[0] or 100
                        total_size += row_count * int(avg_row_size)
                    else:  # SQLite
                        total_size += row_count * 100

                # Add metadata row size (typically small, ~200 bytes)
                total_size += 200

            except Exception as err:
                _LOGGER.warning("Could not calculate entity storage: %s", err)
                total_size = 0

        return total_size

    def _calculate_categorized_storage(self, orphaned_data: dict) -> dict:
        """Calculate total storage categorized by status."""
        deleted_storage = 0
        unavailable_storage = 0

        for entity_id, data in orphaned_data.items():
            storage = self._calculate_entity_storage(data['metadata_id'], data['origin'])
            if data['status'] == 'deleted':
                deleted_storage += storage
            else:  # unavailable
                unavailable_storage += storage

        return {
            "deleted_storage": deleted_storage,
            "unavailable_storage": unavailable_storage
        }

    def generate_delete_sql(self, metadata_id: int, origin: str) -> str:
        """Generate SQL DELETE statement for removing orphaned entity."""
        # Determine database type
        db_url = self.entry.data[CONF_DB_URL]
        is_sqlite = db_url.startswith("sqlite")
        is_mysql = "mysql" in db_url or "mariadb" in db_url
        is_postgres = "postgresql" in db_url or "postgres" in db_url

        # Choose transaction syntax based on database type
        if is_mysql:
            begin_stmt = "START TRANSACTION;"
            commit_stmt = "COMMIT;"
        else:  # SQLite and PostgreSQL use BEGIN/COMMIT
            begin_stmt = "BEGIN;"
            commit_stmt = "COMMIT;"

        # Build DELETE statements based on origin
        delete_statements = []

        if origin == "Long-term":
            delete_statements.append(f"DELETE FROM statistics WHERE metadata_id = {metadata_id};")
        elif origin == "Short-term":
            delete_statements.append(f"DELETE FROM statistics_short_term WHERE metadata_id = {metadata_id};")
        elif origin == "Both":
            delete_statements.append(f"DELETE FROM statistics WHERE metadata_id = {metadata_id};")
            delete_statements.append(f"DELETE FROM statistics_short_term WHERE metadata_id = {metadata_id};")

        # Always delete from metadata table last
        delete_statements.append(f"DELETE FROM statistics_meta WHERE id = {metadata_id};")

        # Combine into transaction block
        sql = begin_stmt + "\n"
        sql += "\n".join(delete_statements) + "\n"
        sql += commit_stmt

        return sql

    def _fetch_entity_storage_overview(self) -> dict[str, Any]:
        """Fetch comprehensive overview of entity storage across all tables (blocking I/O)."""
        engine = self._get_engine()
        from collections import defaultdict

        entity_map = defaultdict(lambda: {
            'in_states_meta': False,
            'in_states': False,
            'in_statistics_meta': False,
            'in_statistics_short_term': False,
            'in_statistics_long_term': False,
            'states_count': 0,
            'stats_short_count': 0,
            'stats_long_count': 0,
            'last_state_update': None,
            'last_stats_update': None,
        })

        with engine.connect() as conn:
            # 1. Get entities from states_meta
            _LOGGER.info("Querying states_meta...")
            query = text("SELECT DISTINCT entity_id FROM states_meta")
            result = conn.execute(query)
            for row in result:
                entity_map[row[0]]['in_states_meta'] = True

            # 2. Get entities from states with counts and last update
            _LOGGER.info("Querying states...")
            query = text("""
                SELECT sm.entity_id, COUNT(*) as count, MAX(s.last_updated_ts) as last_update
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                GROUP BY sm.entity_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                entity_map[entity_id]['in_states'] = True
                entity_map[entity_id]['states_count'] = row[1]
                if row[2]:
                    from datetime import datetime
                    entity_map[entity_id]['last_state_update'] = datetime.fromtimestamp(row[2]).isoformat()

            # 3. Get entities from statistics_meta
            _LOGGER.info("Querying statistics_meta...")
            query = text("SELECT DISTINCT statistic_id FROM statistics_meta")
            result = conn.execute(query)
            for row in result:
                entity_map[row[0]]['in_statistics_meta'] = True

            # 4. Get entities from statistics_short_term with counts
            _LOGGER.info("Querying statistics_short_term...")
            try:
                query = text("""
                    SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                    FROM statistics_short_term s
                    JOIN statistics_meta sm ON s.metadata_id = sm.id
                    GROUP BY sm.statistic_id
                """)
                result = conn.execute(query)
                for row in result:
                    entity_id = row[0]
                    entity_map[entity_id]['in_statistics_short_term'] = True
                    entity_map[entity_id]['stats_short_count'] = row[1]
                    if row[2]:
                        from datetime import datetime
                        last_update = datetime.fromtimestamp(row[2]).isoformat()
                        if not entity_map[entity_id]['last_stats_update'] or \
                           last_update > entity_map[entity_id]['last_stats_update']:
                            entity_map[entity_id]['last_stats_update'] = last_update
            except Exception as err:
                _LOGGER.warning("Could not query statistics_short_term: %s", err)

            # 5. Get entities from statistics (long-term) with counts
            _LOGGER.info("Querying statistics (long-term)...")
            query = text("""
                SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                FROM statistics s
                JOIN statistics_meta sm ON s.metadata_id = sm.id
                GROUP BY sm.statistic_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                entity_map[entity_id]['in_statistics_long_term'] = True
                entity_map[entity_id]['stats_long_count'] = row[1]
                if row[2]:
                    from datetime import datetime
                    last_update = datetime.fromtimestamp(row[2]).isoformat()
                    if not entity_map[entity_id]['last_stats_update'] or \
                       last_update > entity_map[entity_id]['last_stats_update']:
                        entity_map[entity_id]['last_stats_update'] = last_update

        # Get entity registry and device registry for comparison
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)

        # Convert to list format and add registry info
        entities_list = []
        for entity_id, info in sorted(entity_map.items()):
            # Check if in entity registry and get status
            registry_entry = entity_registry.async_get(entity_id)
            in_registry = registry_entry is not None

            # Determine registry status
            if registry_entry is not None:
                registry_status = "Disabled" if registry_entry.disabled else "Enabled"
            else:
                registry_status = "Not in Registry"

            # Check if in current state machine and get status
            state = self.hass.states.get(entity_id)
            in_state_machine = state is not None

            # Determine state machine status
            if state is not None:
                if state.state in ["unavailable", "unknown"]:
                    state_status = "Unavailable"
                else:
                    state_status = "Available"
            else:
                state_status = "Not Present"

            # Collect additional metadata for entity details
            platform = registry_entry.platform if registry_entry else None
            disabled_by = registry_entry.disabled_by if registry_entry else None

            # Get device information
            device_name = None
            device_disabled = False
            if registry_entry and registry_entry.device_id:
                device_entry = device_registry.async_get(registry_entry.device_id)
                if device_entry:
                    device_name = device_entry.name
                    device_disabled = device_entry.disabled or False

            # Get config entry information
            config_entry_state = None
            config_entry_title = None
            if registry_entry and registry_entry.config_entry_id:
                config_entry = self.hass.config_entries.async_get_entry(
                    registry_entry.config_entry_id
                )
                if config_entry:
                    config_entry_state = config_entry.state.name
                    config_entry_title = config_entry.title

            # Determine availability reason
            availability_reason = self._determine_availability_reason(
                entity_id, registry_entry, state, device_registry
            )

            # Calculate unavailable duration
            unavailable_duration_seconds = None
            if state and state.state in ["unavailable", "unknown"]:
                now = datetime.now(timezone.utc)
                unavailable_duration_seconds = int((now - state.last_changed).total_seconds())

            # Calculate update frequency (only for entities with states)
            update_frequency_data = None
            if info['in_states']:
                try:
                    update_frequency_data = self._calculate_update_frequency(entity_id)
                except Exception as err:
                    _LOGGER.debug("Could not calculate frequency for %s: %s", entity_id, err)

            # Determine statistics eligibility (only for entities NOT in statistics)
            statistics_eligibility_reason = None
            if not info['in_statistics_meta']:
                try:
                    statistics_eligibility_reason = self._determine_statistics_eligibility(
                        entity_id, registry_entry, state
                    )
                except Exception as err:
                    _LOGGER.debug("Could not determine statistics eligibility for %s: %s", entity_id, err)
                    statistics_eligibility_reason = "Unable to determine eligibility"

            entities_list.append({
                'entity_id': entity_id,
                'in_entity_registry': in_registry,
                'registry_status': registry_status,
                'in_state_machine': in_state_machine,
                'state_status': state_status,
                'in_states_meta': info['in_states_meta'],
                'in_states': info['in_states'],
                'in_statistics_meta': info['in_statistics_meta'],
                'in_statistics_short_term': info['in_statistics_short_term'],
                'in_statistics_long_term': info['in_statistics_long_term'],
                'states_count': info['states_count'],
                'stats_short_count': info['stats_short_count'],
                'stats_long_count': info['stats_long_count'],
                'last_state_update': info['last_state_update'],
                'last_stats_update': info['last_stats_update'],
                # Additional metadata for entity details
                'platform': platform,
                'disabled_by': disabled_by,
                'device_name': device_name,
                'device_disabled': device_disabled,
                'config_entry_state': config_entry_state,
                'config_entry_title': config_entry_title,
                'availability_reason': availability_reason,
                'unavailable_duration_seconds': unavailable_duration_seconds,
                # Update interval data
                'update_interval': update_frequency_data['interval_text'] if update_frequency_data else None,
                'update_interval_seconds': update_frequency_data['interval_seconds'] if update_frequency_data else None,
                'update_count_24h': update_frequency_data['update_count_24h'] if update_frequency_data else None,
                # Statistics eligibility
                'statistics_eligibility_reason': statistics_eligibility_reason,
            })

        # Generate summary statistics
        summary = {
            'total_entities': len(entity_map),
            'in_entity_registry': sum(1 for e in entities_list if e['in_entity_registry']),
            'registry_enabled': sum(1 for e in entities_list if e['registry_status'] == 'Enabled'),
            'registry_disabled': sum(1 for e in entities_list if e['registry_status'] == 'Disabled'),
            'in_state_machine': sum(1 for e in entities_list if e['in_state_machine']),
            'state_available': sum(1 for e in entities_list if e['state_status'] == 'Available'),
            'state_unavailable': sum(1 for e in entities_list if e['state_status'] == 'Unavailable'),
            'in_states_meta': sum(1 for e in entities_list if e['in_states_meta']),
            'in_states': sum(1 for e in entities_list if e['in_states']),
            'in_statistics_meta': sum(1 for e in entities_list if e['in_statistics_meta']),
            'in_statistics_short_term': sum(1 for e in entities_list if e['in_statistics_short_term']),
            'in_statistics_long_term': sum(1 for e in entities_list if e['in_statistics_long_term']),
            'only_in_states': sum(1 for e in entities_list if e['in_states'] and not e['in_statistics_meta']),
            'only_in_statistics': sum(1 for e in entities_list if e['in_statistics_meta'] and not e['in_states']),
            'in_both_states_and_stats': sum(1 for e in entities_list if e['in_states'] and e['in_statistics_meta']),
            'orphaned_states_meta': sum(1 for e in entities_list if e['in_states_meta'] and not e['in_states']),
            'orphaned_statistics_meta': sum(1 for e in entities_list if e['in_statistics_meta'] and not (e['in_statistics_short_term'] or e['in_statistics_long_term'])),
            'deleted_from_registry': sum(1 for e in entities_list if not e['in_entity_registry'] and not e['in_state_machine']),
        }

        _LOGGER.info(
            "Entity storage overview: %d total entities, %d in registry, %d in state machine",
            summary['total_entities'],
            summary['in_entity_registry'],
            summary['in_state_machine']
        )

        return {
            'entities': entities_list,
            'summary': summary
        }

    async def async_get_entity_storage_overview(self) -> dict[str, Any]:
        """Get comprehensive entity storage overview."""
        try:
            return await self.hass.async_add_executor_job(self._fetch_entity_storage_overview)
        except SQLAlchemyError as err:
            _LOGGER.error("Error fetching entity storage overview: %s", err)
            return {
                'entities': [],
                'summary': {}
            }

    async def async_shutdown(self) -> None:
        """Shutdown coordinator."""
        if self._engine:
            await self.hass.async_add_executor_job(self._engine.dispose)
