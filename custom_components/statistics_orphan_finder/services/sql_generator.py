"""SQL generation service for Statistics Orphan Finder."""
import logging
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine

from homeassistant.config_entries import ConfigEntry

from ..const import CONF_DB_URL

_LOGGER = logging.getLogger(__name__)


class SqlGenerator:
    """Service for generating SQL DELETE statements."""

    def __init__(self, entry: ConfigEntry) -> None:
        """Initialize SQL generator."""
        self.entry = entry

    def generate_delete_sql(
        self,
        engine: Engine,
        entity_id: str,
        origin: str,
        in_states_meta: bool = False,
        in_statistics_meta: bool = False,
        metadata_id_statistics: int | None = None
    ) -> str:
        """Generate SQL DELETE statement for removing orphaned entity.

        Args:
            engine: Database engine
            entity_id: The entity_id to delete
            origin: Origin indicator (States, Short-term, Long-term, Both, States+Statistics)
            in_states_meta: Whether entity is in states_meta table
            in_statistics_meta: Whether entity is in statistics_meta table
            metadata_id_statistics: Optional metadata_id for statistics (if known)

        Returns:
            SQL DELETE statement wrapped in a transaction
        """
        # Determine database type
        db_url = self.entry.data[CONF_DB_URL]
        is_sqlite = db_url.startswith("sqlite")
        is_mysql = "mysql" in db_url or "mariadb" in db_url

        # Choose transaction syntax based on database type
        if is_mysql:
            begin_stmt = "START TRANSACTION;"
            commit_stmt = "COMMIT;"
        else:  # SQLite and PostgreSQL use BEGIN/COMMIT
            begin_stmt = "BEGIN;"
            commit_stmt = "COMMIT;"

        # Build DELETE statements
        delete_statements = []

        with engine.connect() as conn:
            # Handle states_meta deletion
            if in_states_meta or origin == "States" or origin == "States+Statistics":
                states_statements = self._generate_states_delete(conn, entity_id)
                delete_statements.extend(states_statements)

            # Handle statistics_meta deletion
            if in_statistics_meta or origin in ["Short-term", "Long-term", "Both", "States+Statistics"]:
                statistics_statements = self._generate_statistics_delete(
                    conn, entity_id, origin, metadata_id_statistics
                )
                delete_statements.extend(statistics_statements)

        # Combine into transaction block
        if not delete_statements:
            return "-- No data found to delete"

        sql = begin_stmt + "\n"
        sql += "\n".join(delete_statements) + "\n"
        sql += commit_stmt

        return sql

    def _generate_states_delete(self, conn, entity_id: str) -> list[str]:
        """Generate DELETE statements for states tables.

        Args:
            conn: Database connection
            entity_id: Entity ID to delete

        Returns:
            List of DELETE SQL statements
        """
        statements = []

        try:
            # Look up metadata_id from states_meta
            query = text("SELECT metadata_id FROM states_meta WHERE entity_id = :entity_id")
            result = conn.execute(query, {"entity_id": entity_id})
            row = result.fetchone()

            if row:
                states_metadata_id = row[0]
                # First, clear any old_state_id references to states we're about to delete
                # This prevents foreign key constraint violations
                # Using nested subquery for MySQL compatibility
                statements.append(
                    f"UPDATE states SET old_state_id = NULL WHERE old_state_id IN "
                    f"(SELECT state_id FROM (SELECT state_id FROM states WHERE metadata_id = {states_metadata_id}) AS temp);"
                )
                # Delete from states table (child records)
                statements.append(f"DELETE FROM states WHERE metadata_id = {states_metadata_id};")
                # Then delete from states_meta (parent record)
                statements.append(f"DELETE FROM states_meta WHERE metadata_id = {states_metadata_id};")
        except Exception as err:
            _LOGGER.warning("Could not look up states_meta metadata_id for %s: %s", entity_id, err)

        return statements

    def _generate_statistics_delete(
        self,
        conn,
        entity_id: str,
        origin: str,
        metadata_id_statistics: int | None = None
    ) -> list[str]:
        """Generate DELETE statements for statistics tables.

        Args:
            conn: Database connection
            entity_id: Entity ID to delete
            origin: Origin indicator (Short-term, Long-term, Both, States+Statistics)
            metadata_id_statistics: Optional metadata_id for statistics (if known)

        Returns:
            List of DELETE SQL statements
        """
        statements = []

        try:
            # Look up metadata_id from statistics_meta if not provided
            if metadata_id_statistics is None:
                query = text("SELECT id FROM statistics_meta WHERE statistic_id = :entity_id")
                result = conn.execute(query, {"entity_id": entity_id})
                row = result.fetchone()

                if row:
                    metadata_id_statistics = row[0]

            if metadata_id_statistics:
                # Determine which statistics tables to delete from based on origin
                if origin == "Long-term":
                    statements.append(f"DELETE FROM statistics WHERE metadata_id = {metadata_id_statistics};")
                elif origin == "Short-term":
                    statements.append(f"DELETE FROM statistics_short_term WHERE metadata_id = {metadata_id_statistics};")
                elif origin == "Both":
                    statements.append(f"DELETE FROM statistics WHERE metadata_id = {metadata_id_statistics};")
                    statements.append(f"DELETE FROM statistics_short_term WHERE metadata_id = {metadata_id_statistics};")
                elif origin == "States+Statistics":
                    # For combined origin, delete from both statistics tables
                    statements.append(f"DELETE FROM statistics WHERE metadata_id = {metadata_id_statistics};")
                    statements.append(f"DELETE FROM statistics_short_term WHERE metadata_id = {metadata_id_statistics};")

                # Always delete from statistics_meta last (parent record)
                statements.append(f"DELETE FROM statistics_meta WHERE id = {metadata_id_statistics};")
        except Exception as err:
            _LOGGER.warning("Could not look up statistics_meta metadata_id for %s: %s", entity_id, err)

        return statements
