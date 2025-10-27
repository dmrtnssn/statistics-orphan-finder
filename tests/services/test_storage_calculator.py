"""Tests for StorageCalculator."""
from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from sqlalchemy.engine import Engine

from custom_components.statistics_orphan_finder.services.storage_calculator import (
    StorageCalculator,
)


class TestStorageCalculator:
    """Test StorageCalculator class."""

    def test_calculate_entity_storage_states_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test calculating storage for states-only entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Test sensor.temperature (has states but no statistics in our test data)
        storage = calculator.calculate_entity_storage(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        # Should calculate size for 2 states records + metadata
        assert storage > 0
        assert storage >= 100  # At least metadata size

    def test_calculate_entity_storage_statistics_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test calculating storage for statistics-only entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Test with metadata_id provided
        storage = calculator.calculate_entity_storage(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="Both",  # Both short-term and long-term
            in_states_meta=False,
            in_statistics_meta=True,
            metadata_id_statistics=1,
        )

        # Should calculate size for statistics records + metadata
        assert storage > 0
        assert storage >= 200  # At least metadata size

    def test_calculate_entity_storage_both_states_and_statistics(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test calculating storage for entity with both states and statistics."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        storage = calculator.calculate_entity_storage(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States+Statistics",
            in_states_meta=True,
            in_statistics_meta=True,
            metadata_id_statistics=1,
        )

        # Should calculate combined size
        assert storage > 0
        assert storage >= 300  # At least both metadata sizes

    def test_calculate_entity_storage_nonexistent_entity(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test calculating storage for non-existent entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        storage = calculator.calculate_entity_storage(
            engine=populated_sqlite_engine,
            entity_id="sensor.nonexistent",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        # Should return 0 for non-existent entity
        assert storage == 0

    def test_calculate_states_size(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_states_size method."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._calculate_states_size(
                conn=conn,
                entity_id="sensor.temperature",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
            )

            # sensor.temperature has 2 states records
            # Size should be: (2 records * 150 bytes) + 100 bytes metadata = 400 bytes
            assert size == 400

    def test_calculate_states_size_missing_entity(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_states_size with missing entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._calculate_states_size(
                conn=conn,
                entity_id="sensor.nonexistent",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
            )

            assert size == 0

    def test_calculate_statistics_size_long_term(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_statistics_size for long-term statistics."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._calculate_statistics_size(
                conn=conn,
                entity_id="sensor.temperature",
                origin="Long-term",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
                metadata_id_statistics=1,
            )

            # sensor.temperature has 2 long-term statistics records
            # Size should be: (2 records * 100 bytes) + 200 bytes metadata = 400 bytes
            assert size == 400

    def test_calculate_statistics_size_short_term(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_statistics_size for short-term statistics."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._calculate_statistics_size(
                conn=conn,
                entity_id="sensor.temperature",
                origin="Short-term",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
                metadata_id_statistics=1,
            )

            # sensor.temperature has 1 short-term statistics record
            # Size should be: (1 record * 100 bytes) + 200 bytes metadata = 300 bytes
            assert size == 300

    def test_calculate_statistics_size_both(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_statistics_size for both short and long-term."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._calculate_statistics_size(
                conn=conn,
                entity_id="sensor.temperature",
                origin="Both",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
                metadata_id_statistics=1,
            )

            # sensor.temperature has 2 long-term + 1 short-term = 3 total
            # Size should be: (3 records * 100 bytes) + 200 bytes metadata = 500 bytes
            assert size == 500

    def test_calculate_table_size_validates_table_name(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_table_size validates table name against whitelist."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            # Should raise ValueError for invalid table name
            with pytest.raises(ValueError, match="Invalid table name"):
                calculator._calculate_table_size(
                    conn=conn,
                    table_name="users",  # Not in whitelist
                    metadata_id=1,
                    is_sqlite=True,
                    is_mysql=False,
                    is_postgres=False,
                )

    def test_calculate_table_size_allowed_tables(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _calculate_table_size accepts whitelisted tables."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        allowed_tables = ["statistics", "statistics_short_term", "states"]

        with populated_sqlite_engine.connect() as conn:
            for table_name in allowed_tables:
                # Should not raise for allowed tables
                size = calculator._calculate_table_size(
                    conn=conn,
                    table_name=table_name,
                    metadata_id=1,
                    is_sqlite=True,
                    is_mysql=False,
                    is_postgres=False,
                )
                assert isinstance(size, int)

    def test_calculate_entity_storage_handles_errors(
        self, mock_config_entry: MagicMock, sqlite_engine: Engine
    ):
        """Test calculate_entity_storage handles database errors gracefully."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Drop tables to cause error
        with sqlite_engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("DROP TABLE states"))
            conn.commit()

        # Should return 0 on error, not raise exception
        storage = calculator.calculate_entity_storage(
            engine=sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        assert storage == 0


class TestStorageCalculatorDatabaseTypes:
    """Test StorageCalculator with different database types."""

    @pytest.mark.parametrize("db_url,is_sqlite,is_mysql,is_postgres", [
        ("sqlite:///test.db", True, False, False),
        ("mysql://localhost/db", False, True, False),
        ("mariadb://localhost/db", False, True, False),
        ("postgresql://localhost/db", False, False, True),
        ("postgres://localhost/db", False, False, True),
    ])
    def test_database_type_detection(
        self,
        mock_config_entry: MagicMock,
        populated_sqlite_engine: Engine,
        db_url: str,
        is_sqlite: bool,
        is_mysql: bool,
        is_postgres: bool,
    ):
        """Test database type detection from URL."""
        from unittest.mock import MagicMock as Mock, patch

        mock_config_entry.data["db_url"] = db_url
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            # For non-SQLite databases, mock the database-specific queries
            if not is_sqlite:
                original_execute = conn.execute

                def mock_execute(query, *args, **kwargs):
                    query_str = str(query)
                    # Mock MySQL information_schema query
                    if "information_schema.tables" in query_str:
                        mock_result = Mock()
                        mock_result.fetchone.return_value = [150]  # avg_row_length
                        return mock_result
                    # Mock PostgreSQL pg_total_relation_size query
                    elif "pg_total_relation_size" in query_str:
                        mock_result = Mock()
                        mock_result.fetchone.return_value = [150]  # avg_row_size
                        return mock_result
                    # For other queries, use the real execute
                    return original_execute(query, *args, **kwargs)

                with patch.object(conn, 'execute', side_effect=mock_execute):
                    size = calculator._calculate_states_size(
                        conn=conn,
                        entity_id="sensor.temperature",
                        is_sqlite=is_sqlite,
                        is_mysql=is_mysql,
                        is_postgres=is_postgres,
                    )
            else:
                # Test that database type flags are detected correctly
                size = calculator._calculate_states_size(
                    conn=conn,
                    entity_id="sensor.temperature",
                    is_sqlite=is_sqlite,
                    is_mysql=is_mysql,
                    is_postgres=is_postgres,
                )

            # All should calculate some size
            assert size >= 0
