"""Storage calculation service for Statistics Orphan Finder."""
import logging
from typing import Any, NamedTuple

from sqlalchemy import text
from sqlalchemy.engine import Engine

from homeassistant.config_entries import ConfigEntry

from .database_service import get_database_type
from .storage_constants import (
    DEFAULT_STATES_ROW_SIZE,
    STATES_META_ROW_SIZE,
    DEFAULT_STATISTICS_ROW_SIZE,
    STATISTICS_META_ROW_SIZE,
)

_LOGGER = logging.getLogger(__name__)


class MetadataIdRow(NamedTuple):
    """Result row for metadata_id queries (states_meta)."""
    metadata_id: int


class StatisticsMetaRow(NamedTuple):
    """Result row for statistics_meta id queries."""
    id: int


class CountRow(NamedTuple):
    """Result row for COUNT(*) queries."""
    count: int


class AvgRowSizeRow(NamedTuple):
    """Result row for average row size queries."""
    avg_row_size: float


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
            is_sqlite, is_mysql, is_postgres = get_database_type(self.entry)

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

        metadata_row = MetadataIdRow(metadata_id=row[0])
        count_query = text("SELECT COUNT(*) FROM states WHERE metadata_id = :metadata_id")
        count_result = conn.execute(count_query, {"metadata_id": metadata_row.metadata_id})
        count_row = CountRow(count=count_result.fetchone()[0])

        size = 0
        if is_mysql:
            size_query = text("""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = 'states'
            """)
            size_result = conn.execute(size_query)
            avg_size_row = AvgRowSizeRow(avg_row_size=size_result.fetchone()[0] or DEFAULT_STATES_ROW_SIZE)
            size = count_row.count * avg_size_row.avg_row_size
        elif is_postgres:
            size_query = text("""
                SELECT pg_total_relation_size('states') / NULLIF((SELECT COUNT(*) FROM states), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            avg_size_row = AvgRowSizeRow(avg_row_size=size_result.fetchone()[0] or DEFAULT_STATES_ROW_SIZE)
            size = count_row.count * int(avg_size_row.avg_row_size)
        else:  # SQLite
            size = count_row.count * DEFAULT_STATES_ROW_SIZE

        # Add states_meta row size
        size += STATES_META_ROW_SIZE

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
                stats_meta_row = StatisticsMetaRow(id=row[0])
                metadata_id_statistics = stats_meta_row.id

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
        size += STATISTICS_META_ROW_SIZE

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
        """Calculate storage size for a specific table.

        Args:
            conn: Database connection
            table_name: Name of the table (must be in allowed list)
            metadata_id: Metadata ID to filter by
            is_sqlite: Whether database is SQLite
            is_mysql: Whether database is MySQL/MariaDB
            is_postgres: Whether database is PostgreSQL

        Returns:
            Estimated storage size in bytes

        Raises:
            ValueError: If table_name is not in the allowed list
        """
        from sqlalchemy import column, literal

        # Validate table name against whitelist to prevent SQL injection
        ALLOWED_TABLES = {'statistics', 'statistics_short_term', 'states'}
        if table_name not in ALLOWED_TABLES:
            raise ValueError(f"Invalid table name: {table_name}. Must be one of: {', '.join(ALLOWED_TABLES)}")

        # Use parameterized query with :table_name binding for count
        # Note: SQLAlchemy text() doesn't support table name parameters, so we use validated whitelist + string formatting
        # This is safe because table_name has been validated against ALLOWED_TABLES above
        count_query = text(f"SELECT COUNT(*) FROM {table_name} WHERE metadata_id = :metadata_id")
        count_result = conn.execute(count_query, {"metadata_id": metadata_id})
        count_row = CountRow(count=count_result.fetchone()[0])

        if is_mysql:
            # Use parameterized query for table name in information_schema
            size_query = text("""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = :table_name
            """)
            size_result = conn.execute(size_query, {"table_name": table_name})
            avg_size_row = AvgRowSizeRow(avg_row_size=size_result.fetchone()[0] or DEFAULT_STATISTICS_ROW_SIZE)
            return count_row.count * avg_size_row.avg_row_size
        elif is_postgres:
            # For PostgreSQL, use proper type casting and parameterization where possible
            # pg_total_relation_size requires string literal, so we use validated table_name
            size_query = text(f"""
                SELECT pg_total_relation_size('{table_name}') / NULLIF((SELECT COUNT(*) FROM {table_name}), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            avg_size_row = AvgRowSizeRow(avg_row_size=size_result.fetchone()[0] or DEFAULT_STATISTICS_ROW_SIZE)
            return count_row.count * int(avg_size_row.avg_row_size)
        else:  # SQLite
            return count_row.count * DEFAULT_STATISTICS_ROW_SIZE
