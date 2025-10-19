"""Storage calculation service for Statistics Orphan Finder."""
import logging
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine

from homeassistant.config_entries import ConfigEntry

from ..const import CONF_DB_URL

_LOGGER = logging.getLogger(__name__)


class StorageCalculator:
    """Service for calculating entity storage sizes."""

    def __init__(self, entry: ConfigEntry) -> None:
        """Initialize storage calculator."""
        self.entry = entry

    def calculate_entity_storage(
        self,
        engine: Engine,
        entity_id: str,
        origin: str,
        in_states_meta: bool = False,
        in_statistics_meta: bool = False,
        metadata_id_statistics: int | None = None
    ) -> int:
        """Calculate estimated storage size for an entity's data.

        Args:
            engine: Database engine
            entity_id: The entity_id
            origin: Origin indicator (States, Short-term, Long-term, Both, States+Statistics)
            in_states_meta: Whether entity is in states_meta table
            in_statistics_meta: Whether entity is in statistics_meta table
            metadata_id_statistics: Optional metadata_id for statistics (if known)

        Returns:
            Total estimated storage size in bytes
        """
        total_size = 0

        with engine.connect() as conn:
            # Determine database type
            db_url = self.entry.data[CONF_DB_URL]
            is_sqlite = db_url.startswith("sqlite")
            is_mysql = "mysql" in db_url or "mariadb" in db_url
            is_postgres = "postgresql" in db_url or "postgres" in db_url

            try:
                # Calculate size for states table
                if in_states_meta or origin == "States" or origin == "States+Statistics":
                    states_size = self._calculate_states_size(
                        conn, entity_id, is_sqlite, is_mysql, is_postgres
                    )
                    total_size += states_size

                # Calculate size for statistics tables
                if in_statistics_meta or origin in ["Short-term", "Long-term", "Both", "States+Statistics"]:
                    statistics_size = self._calculate_statistics_size(
                        conn, entity_id, origin, is_sqlite, is_mysql, is_postgres, metadata_id_statistics
                    )
                    total_size += statistics_size

            except Exception as err:
                _LOGGER.warning("Could not calculate entity storage: %s", err)
                total_size = 0

        return total_size

    def _calculate_states_size(
        self,
        conn,
        entity_id: str,
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool
    ) -> int:
        """Calculate storage size for states table data."""
        # Look up metadata_id from states_meta
        query = text("SELECT metadata_id FROM states_meta WHERE entity_id = :entity_id")
        result = conn.execute(query, {"entity_id": entity_id})
        row = result.fetchone()

        if not row:
            return 0

        states_metadata_id = row[0]
        count_query = text("SELECT COUNT(*) FROM states WHERE metadata_id = :metadata_id")
        count_result = conn.execute(count_query, {"metadata_id": states_metadata_id})
        row_count = count_result.fetchone()[0]

        size = 0
        if is_mysql:
            size_query = text("""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = 'states'
            """)
            size_result = conn.execute(size_query)
            avg_row_length = size_result.fetchone()[0] or 150
            size = row_count * avg_row_length
        elif is_postgres:
            size_query = text("""
                SELECT pg_total_relation_size('states') / NULLIF((SELECT COUNT(*) FROM states), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            avg_row_size = size_result.fetchone()[0] or 150
            size = row_count * int(avg_row_size)
        else:  # SQLite
            size = row_count * 150

        # Add states_meta row size
        size += 100

        return size

    def _calculate_statistics_size(
        self,
        conn,
        entity_id: str,
        origin: str,
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool,
        metadata_id_statistics: int | None = None
    ) -> int:
        """Calculate storage size for statistics table data."""
        # Look up metadata_id from statistics_meta if not provided
        if metadata_id_statistics is None:
            query = text("SELECT id FROM statistics_meta WHERE statistic_id = :entity_id")
            result = conn.execute(query, {"entity_id": entity_id})
            row = result.fetchone()
            if row:
                metadata_id_statistics = row[0]

        if not metadata_id_statistics:
            return 0

        size = 0

        # Calculate size for long-term statistics
        if origin in ["Long-term", "Both", "States+Statistics"]:
            size += self._calculate_table_size(
                conn, "statistics", metadata_id_statistics, is_sqlite, is_mysql, is_postgres
            )

        # Calculate size for short-term statistics
        if origin in ["Short-term", "Both", "States+Statistics"]:
            size += self._calculate_table_size(
                conn, "statistics_short_term", metadata_id_statistics, is_sqlite, is_mysql, is_postgres
            )

        # Add statistics_meta row size
        size += 200

        return size

    def _calculate_table_size(
        self,
        conn,
        table_name: str,
        metadata_id: int,
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool
    ) -> int:
        """Calculate storage size for a specific table."""
        count_query = text(f"SELECT COUNT(*) FROM {table_name} WHERE metadata_id = :metadata_id")
        count_result = conn.execute(count_query, {"metadata_id": metadata_id})
        row_count = count_result.fetchone()[0]

        if is_mysql:
            size_query = text(f"""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = '{table_name}'
            """)
            size_result = conn.execute(size_query)
            avg_row_length = size_result.fetchone()[0] or 100
            return row_count * avg_row_length
        elif is_postgres:
            size_query = text(f"""
                SELECT pg_total_relation_size('{table_name}') / NULLIF((SELECT COUNT(*) FROM {table_name}), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            avg_row_size = size_result.fetchone()[0] or 100
            return row_count * int(avg_row_size)
        else:  # SQLite
            return row_count * 100
