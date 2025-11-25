"""Database service for Statistics Orphan Finder."""
import logging
from typing import Any
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine import Engine

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import CONF_DB_URL, CONF_USERNAME, CONF_PASSWORD

_LOGGER = logging.getLogger(__name__)


def get_database_type(entry: ConfigEntry) -> tuple[bool, bool, bool]:
    """Determine database type from connection URL.

    Args:
        entry: Config entry containing database URL.

    Returns:
        Tuple of (is_sqlite, is_mysql, is_postgres) boolean flags.
    """
    db_url = entry.data[CONF_DB_URL]
    is_sqlite = db_url.startswith("sqlite")
    is_mysql = "mysql" in db_url or "mariadb" in db_url
    is_postgres = "postgresql" in db_url or "postgres" in db_url
    return (is_sqlite, is_mysql, is_postgres)


class DatabaseService:
    """Service for database operations."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize database service."""
        self.hass = hass
        self.entry = entry
        self._engine: Engine | None = None

    def get_engine(self) -> Engine:
        """Get or create database engine."""
        if self._engine is None:
            db_url = self.entry.data[CONF_DB_URL]
            username = self.entry.data.get(CONF_USERNAME)
            password = self.entry.data.get(CONF_PASSWORD)

            # Build connection string with proper URL encoding for credentials
            if username and password:
                if "://" in db_url:
                    protocol, rest = db_url.split("://", 1)
                    # URL-encode credentials to handle special characters
                    encoded_username = quote_plus(username)
                    encoded_password = quote_plus(password)
                    db_url = f"{protocol}://{encoded_username}:{encoded_password}@{rest}"

            self._engine = create_engine(db_url, pool_pre_ping=True)

        return self._engine

    def get_db_type(self) -> tuple[bool, bool, bool]:
        """Determine database type from connection URL.

        Returns:
            Tuple of (is_sqlite, is_mysql, is_postgres) boolean flags.
        """
        return get_database_type(self.entry)

    def close(self) -> None:
        """Close database engine."""
        if self._engine:
            self._engine.dispose()
            self._engine = None

    def _fetch_database_size(self) -> dict[str, Any]:
        """Fetch database size information (blocking I/O)."""
        engine = self.get_engine()

        with engine.connect() as conn:
            # Determine database type
            is_sqlite, is_mysql, is_postgres = self.get_db_type()

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
