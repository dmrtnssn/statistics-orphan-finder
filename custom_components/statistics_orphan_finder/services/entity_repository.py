"""Database repository for entity data queries."""
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from .entity_analyzer import EntityAnalyzer

_LOGGER = logging.getLogger(__name__)


class EntityRepository:
    """Stateless repository for querying entity data from database.

    All methods accept an SQLAlchemy engine and return data structures
    without side effects. The coordinator orchestrates the queries and
    updates session data.
    """

    @staticmethod
    def fetch_states_meta(engine: Engine) -> set[str]:
        """Fetch all entity IDs from states_meta table.

        Args:
            engine: SQLAlchemy database engine

        Returns:
            set: Entity IDs found in states_meta
        """
        with engine.connect() as conn:
            query = text("SELECT DISTINCT entity_id FROM states_meta")
            result = conn.execute(query)
            return {row[0] for row in result}

    @staticmethod
    def fetch_states_with_counts(engine: Engine) -> tuple[dict[str, Any], dict[str, Any]]:
        """Fetch states counts, last updates, and update frequencies.

        Performs two queries:
        1. State counts and last update timestamps
        2. Update frequencies for entities (batched for N+1 prevention)

        Args:
            engine: SQLAlchemy database engine

        Returns:
            tuple: (states_data, frequency_data) dictionaries
                - states_data: {entity_id: {count, last_update}}
                - frequency_data: {entity_id: {interval_seconds, update_count_24h, interval_text}}
        """
        states_data = {}
        frequency_data = {}

        with engine.connect() as conn:
            # Query 1: Fetch state counts and last updates
            query = text("""
                SELECT sm.entity_id, COUNT(*) as count, MAX(s.last_updated_ts) as last_update
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                GROUP BY sm.entity_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                states_data[entity_id] = {
                    'count': row[1],
                    'last_update': datetime.fromtimestamp(row[2]).isoformat() if row[2] else None
                }

            # Query 2: PERFORMANCE OPTIMIZATION - Batch calculate update frequencies
            # This eliminates N+1 queries that would happen in step 6
            cutoff_ts = datetime.now(timezone.utc).timestamp() - 86400
            frequency_query = text("""
                SELECT sm.entity_id, COUNT(*) as count_24h
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                WHERE s.last_updated_ts >= :cutoff
                GROUP BY sm.entity_id
                HAVING COUNT(*) >= 2
            """)
            freq_result = conn.execute(frequency_query, {"cutoff": cutoff_ts})
            for row in freq_result:
                entity_id, count_24h = row[0], row[1]
                interval_seconds = 86400 // count_24h
                frequency_data[entity_id] = {
                    'interval_seconds': interval_seconds,
                    'update_count_24h': count_24h,
                    'interval_text': EntityAnalyzer.format_interval(interval_seconds)
                }

        return states_data, frequency_data

    @staticmethod
    def fetch_statistics_meta(engine: Engine) -> dict[str, int]:
        """Fetch statistics metadata with entity IDs and metadata IDs.

        Fetches both id and statistic_id to avoid N+1 queries in later steps.

        Args:
            engine: SQLAlchemy database engine

        Returns:
            dict: Mapping of entity_id to metadata_id
        """
        metadata_map = {}

        with engine.connect() as conn:
            query = text("SELECT id, statistic_id FROM statistics_meta")
            result = conn.execute(query)
            for row in result:
                metadata_id, entity_id = row[0], row[1]
                metadata_map[entity_id] = metadata_id

        return metadata_map

    @staticmethod
    def fetch_statistics_short_term(engine: Engine) -> dict[str, Any]:
        """Fetch short-term statistics counts and last updates.

        Args:
            engine: SQLAlchemy database engine

        Returns:
            dict: {entity_id: {count, last_update}}
                Returns empty dict if table doesn't exist (older HA versions)

        Raises:
            SQLAlchemyError: For unexpected database errors (not OperationalError)
        """
        stats_data = {}

        with engine.connect() as conn:
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
                    stats_data[entity_id] = {
                        'count': row[1],
                        'last_update': datetime.fromtimestamp(row[2]).isoformat() if row[2] else None
                    }
            except OperationalError as err:
                # Table might not exist in older HA versions or different database configurations
                _LOGGER.info("statistics_short_term table not available: %s", err)
            except SQLAlchemyError as err:
                # Unexpected database error - log as error and re-raise
                _LOGGER.error("Database error querying statistics_short_term: %s", err)
                raise

        return stats_data

    @staticmethod
    def fetch_statistics_long_term(engine: Engine) -> dict[str, Any]:
        """Fetch long-term statistics counts and last updates.

        Args:
            engine: SQLAlchemy database engine

        Returns:
            dict: {entity_id: {count, last_update}}
        """
        stats_data = {}

        with engine.connect() as conn:
            query = text("""
                SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                FROM statistics s
                JOIN statistics_meta sm ON s.metadata_id = sm.id
                GROUP BY sm.statistic_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                stats_data[entity_id] = {
                    'count': row[1],
                    'last_update': datetime.fromtimestamp(row[2]).isoformat() if row[2] else None
                }

        return stats_data
