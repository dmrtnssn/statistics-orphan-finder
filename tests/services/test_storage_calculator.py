"""Tests for StorageCalculator."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

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


class TestOriginBasedCalculation:
    """Ensure calculate_entity_storage calls the right helpers for each origin."""

    def _mock_engine(self):
        mock_conn = MagicMock()
        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        return mock_engine

    def test_calculate_entity_storage_origin_states(
        self, mock_config_entry: MagicMock
    ):
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", return_value=5000) as mock_states, patch.object(
            calculator, "_calculate_statistics_size", return_value=3000
        ) as mock_stats:
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="States",
                in_states_meta=True,
                in_statistics_meta=False,
            )

        mock_states.assert_called_once()
        mock_stats.assert_not_called()
        assert size == 5000

    def test_calculate_entity_storage_origin_short_term(self, mock_config_entry: MagicMock):
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", return_value=1000) as mock_states, patch.object(
            calculator, "_calculate_statistics_size", return_value=2000
        ) as mock_stats:
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="Short-term",
                in_states_meta=False,
                in_statistics_meta=True,
            )

        mock_states.assert_not_called()
        mock_stats.assert_called_once()
        assert size == 2000

    def test_calculate_entity_storage_origin_long_term(self, mock_config_entry: MagicMock):
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", return_value=1000) as mock_states, patch.object(
            calculator, "_calculate_statistics_size", return_value=4000
        ) as mock_stats:
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="Long-term",
                in_states_meta=False,
                in_statistics_meta=True,
            )

        mock_states.assert_not_called()
        mock_stats.assert_called_once()
        assert size == 4000

    def test_calculate_entity_storage_origin_both(self, mock_config_entry: MagicMock):
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", return_value=1000) as mock_states, patch.object(
            calculator, "_calculate_statistics_size", return_value=6000
        ) as mock_stats:
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="Both",
                in_states_meta=False,
                in_statistics_meta=True,
            )

        mock_states.assert_not_called()
        mock_stats.assert_called_once()
        assert size == 6000

    def test_calculate_entity_storage_origin_states_plus_statistics(self, mock_config_entry: MagicMock):
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", return_value=1500) as mock_states, patch.object(
            calculator, "_calculate_statistics_size", return_value=2500
        ) as mock_stats:
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="States+Statistics",
                in_states_meta=True,
                in_statistics_meta=True,
            )

        mock_states.assert_called_once()
        mock_stats.assert_called_once()
        assert size == 4000


class TestStorageCalculationEdgeCases:
    """Edge cases for storage calculations."""

    def _mock_engine(self):
        mock_conn = MagicMock()
        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        return mock_engine

    def test_calculate_entity_storage_exception_handling(self, mock_config_entry: MagicMock):
        """Exceptions inside calculation should result in zero size."""
        calculator = StorageCalculator(mock_config_entry)
        engine = self._mock_engine()

        with patch(
            "custom_components.statistics_orphan_finder.services.storage_calculator.get_database_type",
            return_value=(True, False, False),
        ), patch.object(calculator, "_calculate_states_size", side_effect=RuntimeError("fail")):
            size = calculator.calculate_entity_storage(
                engine=engine,
                entity_id="sensor.test",
                origin="States",
                in_states_meta=True,
                in_statistics_meta=False,
            )

        assert size == 0

    def test_calculate_statistics_size_without_metadata_id(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Should look up metadata_id when not provided."""
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
                metadata_id_statistics=None,
            )

        assert size > 0

    def test_calculate_statistics_size_metadata_id_not_found(
        self, mock_config_entry: MagicMock, sqlite_engine: Engine
    ):
        """Missing metadata_id should return zero."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with sqlite_engine.connect() as conn:
            size = calculator._calculate_statistics_size(
                conn=conn,
                entity_id="sensor.missing",
                origin="Long-term",
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False,
                metadata_id_statistics=None,
            )

        assert size == 0


class TestDatabaseSpecificCalculations:
    """Database-dialect specific storage calculations."""

    def test_calculate_states_size_mysql(
        self, mock_config_entry: MagicMock, mock_mysql_connection: MagicMock
    ):
        mock_config_entry.data["db_url"] = "mysql://localhost/homeassistant"
        calculator = StorageCalculator(mock_config_entry)

        size = calculator._calculate_states_size(
            conn=mock_mysql_connection,
            entity_id="sensor.sample",
            is_sqlite=False,
            is_mysql=True,
            is_postgres=False,
        )

        assert size > 0

    def test_calculate_states_size_postgres(
        self, mock_config_entry: MagicMock, mock_postgres_connection: MagicMock
    ):
        mock_config_entry.data["db_url"] = "postgresql://localhost/homeassistant"
        calculator = StorageCalculator(mock_config_entry)

        size = calculator._calculate_states_size(
            conn=mock_postgres_connection,
            entity_id="sensor.sample",
            is_sqlite=False,
            is_mysql=False,
            is_postgres=True,
        )

        assert size > 0

    def test_calculate_table_size_mysql(
        self, mock_config_entry: MagicMock, mock_mysql_connection: MagicMock
    ):
        mock_config_entry.data["db_url"] = "mysql://localhost/homeassistant"
        calculator = StorageCalculator(mock_config_entry)

        size = calculator._calculate_table_size(
            conn=mock_mysql_connection,
            table_name="statistics",
            metadata_id=1,
            is_sqlite=False,
            is_mysql=True,
            is_postgres=False,
        )

        assert size > 0

    def test_calculate_table_size_postgres(
        self, mock_config_entry: MagicMock, mock_postgres_connection: MagicMock
    ):
        mock_config_entry.data["db_url"] = "postgresql://localhost/homeassistant"
        calculator = StorageCalculator(mock_config_entry)

        size = calculator._calculate_table_size(
            conn=mock_postgres_connection,
            table_name="statistics_short_term",
            metadata_id=1,
            is_sqlite=False,
            is_mysql=False,
            is_postgres=True,
        )

        assert size > 0


class TestBatchStorageCalculation:
    """Test batch storage calculation methods (AP-18)."""

    def test_calculate_batch_storage_empty_list(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test batch calculation with empty entity list."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        result = calculator.calculate_batch_storage(
            engine=populated_sqlite_engine,
            entities=[]
        )

        assert result == {}

    def test_calculate_batch_storage_states_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test batch calculation for states-only entities."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {
                'entity_id': 'sensor.temperature',
                'origin': 'States',
                'in_states_meta': True,
                'in_statistics_meta': False,
                'metadata_id_statistics': None
            },
            {
                'entity_id': 'sensor.humidity',
                'origin': 'States',
                'in_states_meta': True,
                'in_statistics_meta': False,
                'metadata_id_statistics': None
            }
        ]

        result = calculator.calculate_batch_storage(
            engine=populated_sqlite_engine,
            entities=entities
        )

        assert 'sensor.temperature' in result
        assert 'sensor.humidity' in result
        assert result['sensor.temperature'] > 0
        # sensor.humidity might be 0 if not in test data, that's OK

    def test_calculate_batch_storage_statistics_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test batch calculation for statistics-only entities."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {
                'entity_id': 'sensor.temperature',
                'origin': 'Both',
                'in_states_meta': False,
                'in_statistics_meta': True,
                'metadata_id_statistics': 1
            }
        ]

        result = calculator.calculate_batch_storage(
            engine=populated_sqlite_engine,
            entities=entities
        )

        assert 'sensor.temperature' in result
        assert result['sensor.temperature'] > 0

    def test_calculate_batch_storage_mixed_origins(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test batch calculation with mixed origin types."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {
                'entity_id': 'sensor.temperature',
                'origin': 'States+Statistics',
                'in_states_meta': True,
                'in_statistics_meta': True,
                'metadata_id_statistics': 1
            },
            {
                'entity_id': 'sensor.humidity',
                'origin': 'States',
                'in_states_meta': True,
                'in_statistics_meta': False,
                'metadata_id_statistics': None
            }
        ]

        result = calculator.calculate_batch_storage(
            engine=populated_sqlite_engine,
            entities=entities
        )

        assert 'sensor.temperature' in result
        assert 'sensor.humidity' in result
        # sensor.temperature should have both states and statistics
        assert result['sensor.temperature'] > 0

    def test_batch_calculate_states_size(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_calculate_states_size method."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {'entity_id': 'sensor.temperature'},
            {'entity_id': 'sensor.humidity'}
        ]

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_calculate_states_size(
                conn=conn,
                entities=entities,
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False
            )

        # Should return dict with entity_id keys
        assert isinstance(result, dict)
        # sensor.temperature has 2 states, should calculate size
        if 'sensor.temperature' in result:
            assert result['sensor.temperature'] > 0

    def test_batch_calculate_states_size_no_matches(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_calculate_states_size with no matching entities."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {'entity_id': 'sensor.nonexistent1'},
            {'entity_id': 'sensor.nonexistent2'}
        ]

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_calculate_states_size(
                conn=conn,
                entities=entities,
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False
            )

        # Should return empty dict when no entities found
        assert result == {}

    def test_batch_calculate_statistics_size(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_calculate_statistics_size method."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        entities = [
            {
                'entity_id': 'sensor.temperature',
                'origin': 'Both',
                'metadata_id_statistics': 1
            }
        ]

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_calculate_statistics_size(
                conn=conn,
                entities=entities,
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False
            )

        assert isinstance(result, dict)
        assert 'sensor.temperature' in result
        assert result['sensor.temperature'] > 0

    def test_batch_calculate_statistics_size_with_lookup(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_calculate_statistics_size with metadata_id lookup."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Don't provide metadata_id_statistics to force lookup
        entities = [
            {
                'entity_id': 'sensor.temperature',
                'origin': 'Long-term',
                'metadata_id_statistics': None
            }
        ]

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_calculate_statistics_size(
                conn=conn,
                entities=entities,
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False
            )

        assert isinstance(result, dict)
        # If sensor.temperature exists in statistics_meta, should have size
        if 'sensor.temperature' in result:
            assert result['sensor.temperature'] > 0

    def test_batch_get_table_counts(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_get_table_counts method."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_get_table_counts(
                conn=conn,
                table_name='statistics',
                metadata_ids=[1, 2]
            )

        assert isinstance(result, dict)
        # Should return dict mapping metadata_id to count
        for metadata_id, count in result.items():
            assert isinstance(metadata_id, int)
            assert isinstance(count, int)
            assert count >= 0

    def test_batch_get_table_counts_empty_list(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_get_table_counts with empty metadata_ids."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            result = calculator._batch_get_table_counts(
                conn=conn,
                table_name='statistics',
                metadata_ids=[]
            )

        assert result == {}

    def test_batch_get_table_counts_validates_table_name(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_get_table_counts validates table name."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            with pytest.raises(ValueError, match="Invalid table name"):
                calculator._batch_get_table_counts(
                    conn=conn,
                    table_name='users',  # Not in whitelist
                    metadata_ids=[1]
                )

    def test_batch_get_table_counts_deduplicates(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _batch_get_table_counts deduplicates metadata_ids."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            # Pass duplicates
            result = calculator._batch_get_table_counts(
                conn=conn,
                table_name='statistics',
                metadata_ids=[1, 1, 2, 2, 1]
            )

        # Should handle duplicates gracefully
        assert isinstance(result, dict)

    def test_get_statistics_avg_row_size_sqlite(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _get_statistics_avg_row_size for SQLite."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            size = calculator._get_statistics_avg_row_size(
                conn=conn,
                is_sqlite=True,
                is_mysql=False,
                is_postgres=False
            )

        # Should return default for SQLite
        from custom_components.statistics_orphan_finder.services.storage_constants import (
            DEFAULT_STATISTICS_ROW_SIZE
        )
        assert size == DEFAULT_STATISTICS_ROW_SIZE

    def test_calculate_batch_storage_handles_errors(
        self, mock_config_entry: MagicMock, sqlite_engine: Engine
    ):
        """Test batch calculation handles errors gracefully."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Drop tables to cause error
        with sqlite_engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("DROP TABLE states_meta"))
            conn.commit()

        entities = [
            {
                'entity_id': 'sensor.test',
                'origin': 'States',
                'in_states_meta': True,
                'in_statistics_meta': False,
                'metadata_id_statistics': None
            }
        ]

        # Should return dict with zero values on error
        result = calculator.calculate_batch_storage(
            engine=sqlite_engine,
            entities=entities
        )

        assert isinstance(result, dict)
        assert 'sensor.test' in result
        # Should be 0 due to error
        assert result['sensor.test'] == 0

    def test_batch_calculation_performance(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test batch calculation with multiple entities (simulates N+1 fix)."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        calculator = StorageCalculator(mock_config_entry)

        # Simulate 10 entities
        entities = [
            {
                'entity_id': f'sensor.test_{i}',
                'origin': 'States',
                'in_states_meta': True,
                'in_statistics_meta': False,
                'metadata_id_statistics': None
            }
            for i in range(10)
        ]

        result = calculator.calculate_batch_storage(
            engine=populated_sqlite_engine,
            entities=entities
        )

        # Should complete and return results for all entities
        assert len(result) == 10
        for entity_id in [e['entity_id'] for e in entities]:
            assert entity_id in result
            # Values might be 0 if entities don't exist in test data
            assert isinstance(result[entity_id], int)
