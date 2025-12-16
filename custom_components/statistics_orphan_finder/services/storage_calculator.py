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

    def calculate_batch_storage(
        self,
        engine: Engine,
        entities: list[dict[str, Any]]
    ) -> dict[str, int]:
        """Calculate storage sizes for multiple entities in batched queries.

        Args:
            engine: Database engine
            entities: List of entity dicts with keys:
                - entity_id: The entity_id
                - origin: Origin indicator (States, Short-term, Long-term, Both, States+Statistics)
                - in_states_meta: Whether entity is in states_meta table
                - in_statistics_meta: Whether entity is in statistics_meta table
                - metadata_id_statistics: Optional metadata_id for statistics (if known)

        Returns:
            Dictionary mapping entity_id to total storage size in bytes
        """
        if not entities:
            return {}

        storage_map: dict[str, int] = {e['entity_id']: 0 for e in entities}

        with engine.connect() as conn:
            # Determine database type
            is_sqlite, is_mysql, is_postgres = get_database_type(self.entry)

            try:
                # Batch calculate states storage
                states_entities = [
                    e for e in entities
                    if e.get('in_states_meta') or e.get('origin') in ['States', 'States+Statistics']
                ]
                if states_entities:
                    states_storage = self._batch_calculate_states_size(
                        conn, states_entities, is_sqlite, is_mysql, is_postgres
                    )
                    for entity_id, size in states_storage.items():
                        storage_map[entity_id] += size

                # Batch calculate statistics storage
                stats_entities = [
                    e for e in entities
                    if e.get('in_statistics_meta') or e.get('origin') in ['Short-term', 'Long-term', 'Both', 'States+Statistics']
                ]
                if stats_entities:
                    stats_storage = self._batch_calculate_statistics_size(
                        conn, stats_entities, is_sqlite, is_mysql, is_postgres
                    )
                    for entity_id, size in stats_storage.items():
                        storage_map[entity_id] += size

            except Exception as err:
                _LOGGER.warning("Could not calculate batch entity storage: %s", err)

        return storage_map

    def _batch_calculate_states_size(
        self,
        conn,
        entities: list[dict[str, Any]],
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool
    ) -> dict[str, int]:
        """Batch calculate storage size for states table data.

        Args:
            conn: Database connection
            entities: List of entity dicts with entity_id
            is_sqlite: Whether database is SQLite
            is_mysql: Whether database is MySQL/MariaDB
            is_postgres: Whether database is PostgreSQL

        Returns:
            Dictionary mapping entity_id to states storage size
        """
        storage_map: dict[str, int] = {}
        entity_ids = [e['entity_id'] for e in entities]

        # Batch query 1: Get all metadata_ids at once
        from sqlalchemy import bindparam
        query = text("""
            SELECT entity_id, metadata_id
            FROM states_meta
            WHERE entity_id IN :entity_ids
        """).bindparams(bindparam("entity_ids", expanding=True))
        result = conn.execute(query, {"entity_ids": entity_ids})
        entity_to_metadata = {row[0]: row[1] for row in result.fetchall()}

        if not entity_to_metadata:
            return storage_map

        metadata_ids = list(entity_to_metadata.values())

        # Batch query 2: Get counts for all metadata_ids at once
        count_query = text("""
            SELECT metadata_id, COUNT(*)
            FROM states
            WHERE metadata_id IN :metadata_ids
            GROUP BY metadata_id
        """).bindparams(bindparam("metadata_ids", expanding=True))
        count_result = conn.execute(count_query, {"metadata_ids": metadata_ids})
        metadata_to_count = {row[0]: row[1] for row in count_result.fetchall()}

        # Get average row size once for all entities
        avg_row_size = DEFAULT_STATES_ROW_SIZE
        if is_mysql:
            size_query = text("""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = 'states'
            """)
            size_result = conn.execute(size_query)
            row = size_result.fetchone()
            avg_row_size = row[0] if row and row[0] else DEFAULT_STATES_ROW_SIZE
        elif is_postgres:
            size_query = text("""
                SELECT pg_total_relation_size('states') / NULLIF((SELECT COUNT(*) FROM states), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            row = size_result.fetchone()
            avg_row_size = int(row[0]) if row and row[0] else DEFAULT_STATES_ROW_SIZE

        # Calculate storage for each entity
        for entity_id, metadata_id in entity_to_metadata.items():
            count = metadata_to_count.get(metadata_id, 0)
            storage_map[entity_id] = (count * avg_row_size) + STATES_META_ROW_SIZE

        return storage_map

    def _batch_calculate_statistics_size(
        self,
        conn,
        entities: list[dict[str, Any]],
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool
    ) -> dict[str, int]:
        """Batch calculate storage size for statistics table data.

        Args:
            conn: Database connection
            entities: List of entity dicts with entity_id, origin, metadata_id_statistics
            is_sqlite: Whether database is SQLite
            is_mysql: Whether database is MySQL/MariaDB
            is_postgres: Whether database is PostgreSQL

        Returns:
            Dictionary mapping entity_id to statistics storage size
        """
        storage_map: dict[str, int] = {}

        # Separate entities that need metadata_id lookup vs those that already have it
        entities_needing_lookup = [e for e in entities if not e.get('metadata_id_statistics')]
        entities_with_metadata = [e for e in entities if e.get('metadata_id_statistics')]

        # Build entity_id to metadata_id mapping
        entity_to_metadata: dict[str, int] = {}

        # Add entities that already have metadata_id
        for e in entities_with_metadata:
            entity_to_metadata[e['entity_id']] = e['metadata_id_statistics']

        # Batch lookup metadata_ids for entities that don't have it
        if entities_needing_lookup:
            from sqlalchemy import bindparam
            entity_ids = [e['entity_id'] for e in entities_needing_lookup]
            query = text("""
                SELECT statistic_id, id
                FROM statistics_meta
                WHERE statistic_id IN :entity_ids
            """).bindparams(bindparam("entity_ids", expanding=True))
            result = conn.execute(query, {"entity_ids": entity_ids})
            for row in result.fetchall():
                entity_to_metadata[row[0]] = row[1]

        if not entity_to_metadata:
            return storage_map

        # Build origin lookup
        entity_to_origin = {e['entity_id']: e.get('origin', '') for e in entities}

        # Separate metadata_ids by which tables to query
        long_term_metadata_ids = [
            mid for eid, mid in entity_to_metadata.items()
            if entity_to_origin.get(eid) in ['Long-term', 'Both', 'States+Statistics']
        ]
        short_term_metadata_ids = [
            mid for eid, mid in entity_to_metadata.items()
            if entity_to_origin.get(eid) in ['Short-term', 'Both', 'States+Statistics']
        ]

        # Batch query statistics table counts
        metadata_to_long_term_count: dict[int, int] = {}
        metadata_to_short_term_count: dict[int, int] = {}

        if long_term_metadata_ids:
            metadata_to_long_term_count = self._batch_get_table_counts(
                conn, 'statistics', long_term_metadata_ids
            )

        if short_term_metadata_ids:
            metadata_to_short_term_count = self._batch_get_table_counts(
                conn, 'statistics_short_term', short_term_metadata_ids
            )

        # Get average row size once for statistics tables
        avg_row_size = self._get_statistics_avg_row_size(conn, is_sqlite, is_mysql, is_postgres)

        # Calculate storage for each entity
        for entity_id, metadata_id in entity_to_metadata.items():
            origin = entity_to_origin.get(entity_id, '')
            total_count = 0

            if origin in ['Long-term', 'Both', 'States+Statistics']:
                total_count += metadata_to_long_term_count.get(metadata_id, 0)

            if origin in ['Short-term', 'Both', 'States+Statistics']:
                total_count += metadata_to_short_term_count.get(metadata_id, 0)

            storage_map[entity_id] = (total_count * avg_row_size) + STATISTICS_META_ROW_SIZE

        return storage_map

    def _batch_get_table_counts(
        self,
        conn,
        table_name: str,
        metadata_ids: list[int]
    ) -> dict[int, int]:
        """Batch get counts from a statistics table.

        Args:
            conn: Database connection
            table_name: Name of table (statistics or statistics_short_term)
            metadata_ids: List of metadata_ids to query

        Returns:
            Dictionary mapping metadata_id to count
        """
        # Validate table name against whitelist
        ALLOWED_TABLES = {'statistics', 'statistics_short_term'}
        if table_name not in ALLOWED_TABLES:
            raise ValueError(f"Invalid table name: {table_name}")

        if not metadata_ids:
            return {}

        # Remove duplicates
        unique_metadata_ids = list(set(metadata_ids))

        from sqlalchemy import bindparam
        query = text(f"""
            SELECT metadata_id, COUNT(*)
            FROM {table_name}
            WHERE metadata_id IN :metadata_ids
            GROUP BY metadata_id
        """).bindparams(bindparam("metadata_ids", expanding=True))
        result = conn.execute(query, {"metadata_ids": unique_metadata_ids})
        return {row[0]: row[1] for row in result.fetchall()}

    def _get_statistics_avg_row_size(
        self,
        conn,
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool
    ) -> int:
        """Get average row size for statistics tables.

        Args:
            conn: Database connection
            is_sqlite: Whether database is SQLite
            is_mysql: Whether database is MySQL/MariaDB
            is_postgres: Whether database is PostgreSQL

        Returns:
            Average row size in bytes
        """
        if is_mysql:
            size_query = text("""
                SELECT avg_row_length
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = 'statistics'
            """)
            size_result = conn.execute(size_query)
            row = size_result.fetchone()
            return row[0] if row and row[0] else DEFAULT_STATISTICS_ROW_SIZE
        elif is_postgres:
            size_query = text("""
                SELECT pg_total_relation_size('statistics') / NULLIF((SELECT COUNT(*) FROM statistics), 0) as avg_row_size
            """)
            size_result = conn.execute(size_query)
            row = size_result.fetchone()
            return int(row[0]) if row and row[0] else DEFAULT_STATISTICS_ROW_SIZE
        else:  # SQLite
            return DEFAULT_STATISTICS_ROW_SIZE

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
