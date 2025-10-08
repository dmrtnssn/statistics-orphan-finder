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

    async def async_shutdown(self) -> None:
        """Shutdown coordinator."""
        if self._engine:
            await self.hass.async_add_executor_job(self._engine.dispose)
