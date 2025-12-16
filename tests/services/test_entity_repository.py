"""Tests for EntityRepository service."""
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from custom_components.statistics_orphan_finder.services.entity_repository import (
    EntityRepository,
)


class TestEntityRepository:
    """Test EntityRepository functionality."""

    def test_fetch_states_meta_returns_entity_ids(self, populated_sqlite_engine):
        """Test fetch_states_meta returns set of entity IDs."""
        result = EntityRepository.fetch_states_meta(populated_sqlite_engine)

        assert isinstance(result, set)
        assert len(result) > 0
        assert "sensor.temperature" in result
        assert "sensor.humidity" in result

    def test_fetch_states_meta_empty_table(self, sqlite_engine):
        """Test fetch_states_meta with empty states_meta table."""
        result = EntityRepository.fetch_states_meta(sqlite_engine)

        assert isinstance(result, set)
        assert len(result) == 0

    def test_fetch_states_with_counts_returns_tuple(self, populated_sqlite_engine):
        """Test fetch_states_with_counts returns tuple of dicts."""
        states_data, frequency_data = EntityRepository.fetch_states_with_counts(
            populated_sqlite_engine
        )

        assert isinstance(states_data, dict)
        assert isinstance(frequency_data, dict)

    def test_fetch_states_with_counts_data_structure(self, populated_sqlite_engine):
        """Test fetch_states_with_counts returns correct data structure."""
        states_data, frequency_data = EntityRepository.fetch_states_with_counts(
            populated_sqlite_engine
        )

        # Check states_data structure
        assert len(states_data) > 0
        for entity_id, data in states_data.items():
            assert 'count' in data
            assert 'last_update' in data
            assert isinstance(data['count'], int)
            assert data['count'] > 0

    def test_fetch_states_with_counts_frequency_data(self, populated_sqlite_engine):
        """Test fetch_states_with_counts frequency data structure."""
        # Insert frequent states for testing
        with populated_sqlite_engine.connect() as conn:
            # Get metadata_id for sensor.temperature
            query = text("SELECT metadata_id FROM states_meta WHERE entity_id = 'sensor.temperature'")
            result = conn.execute(query)
            metadata_id = result.scalar()

            # Insert multiple recent states
            now = datetime.now(timezone.utc).timestamp()
            for i in range(10):
                insert = text("""
                    INSERT INTO states (metadata_id, state, last_updated_ts)
                    VALUES (:metadata_id, :state, :timestamp)
                """)
                conn.execute(insert, {
                    "metadata_id": metadata_id,
                    "state": f"{20 + i}",
                    "timestamp": now - (i * 3600)  # Hourly updates
                })
            conn.commit()

        states_data, frequency_data = EntityRepository.fetch_states_with_counts(
            populated_sqlite_engine
        )

        # Check frequency_data for entities with enough updates
        if "sensor.temperature" in frequency_data:
            freq = frequency_data["sensor.temperature"]
            assert 'interval_seconds' in freq
            assert 'update_count_24h' in freq
            assert 'interval_text' in freq
            assert isinstance(freq['interval_seconds'], int)
            assert isinstance(freq['update_count_24h'], int)

    def test_fetch_states_with_counts_empty_table(self, sqlite_engine):
        """Test fetch_states_with_counts with empty states table."""
        states_data, frequency_data = EntityRepository.fetch_states_with_counts(
            sqlite_engine
        )

        assert states_data == {}
        assert frequency_data == {}

    def test_fetch_statistics_meta_returns_mapping(self, populated_sqlite_engine):
        """Test fetch_statistics_meta returns entity_id to metadata_id mapping."""
        result = EntityRepository.fetch_statistics_meta(populated_sqlite_engine)

        assert isinstance(result, dict)
        assert len(result) > 0

        # Check structure: entity_id -> metadata_id
        for entity_id, metadata_id in result.items():
            assert isinstance(entity_id, str)
            assert isinstance(metadata_id, int)

    def test_fetch_statistics_meta_empty_table(self, sqlite_engine):
        """Test fetch_statistics_meta with empty statistics_meta table."""
        result = EntityRepository.fetch_statistics_meta(sqlite_engine)

        assert isinstance(result, dict)
        assert len(result) == 0

    def test_fetch_statistics_short_term_returns_dict(self, populated_sqlite_engine):
        """Test fetch_statistics_short_term returns dictionary."""
        result = EntityRepository.fetch_statistics_short_term(populated_sqlite_engine)

        assert isinstance(result, dict)

    def test_fetch_statistics_short_term_data_structure(self, populated_sqlite_engine):
        """Test fetch_statistics_short_term returns correct data structure."""
        result = EntityRepository.fetch_statistics_short_term(populated_sqlite_engine)

        if len(result) > 0:  # Only test if table has data
            for entity_id, data in result.items():
                assert isinstance(entity_id, str)
                assert 'count' in data
                assert 'last_update' in data
                assert isinstance(data['count'], int)
                assert data['count'] > 0

    def test_fetch_statistics_short_term_missing_table(self, sqlite_engine):
        """Test fetch_statistics_short_term handles missing table gracefully."""
        # Drop the table to simulate older HA version
        with sqlite_engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS statistics_short_term"))
            conn.commit()

        # Should return empty dict, not raise exception
        result = EntityRepository.fetch_statistics_short_term(sqlite_engine)
        assert result == {}

    def test_fetch_statistics_short_term_operational_error(self, sqlite_engine):
        """Test fetch_statistics_short_term logs and handles OperationalError."""
        with patch('custom_components.statistics_orphan_finder.services.entity_repository._LOGGER') as mock_logger:
            # Drop the table to trigger OperationalError
            with sqlite_engine.connect() as conn:
                conn.execute(text("DROP TABLE IF EXISTS statistics_short_term"))
                conn.commit()

            result = EntityRepository.fetch_statistics_short_term(sqlite_engine)

            # Should log the error
            assert mock_logger.info.called
            # Should return empty dict
            assert result == {}

    def test_fetch_statistics_short_term_sqlalchemy_error_raises(self, sqlite_engine):
        """Test fetch_statistics_short_term re-raises unexpected SQLAlchemyError."""
        # We'll test this by mocking the execute to raise a generic SQLAlchemyError
        with patch('custom_components.statistics_orphan_finder.services.entity_repository._LOGGER'):
            with patch.object(sqlite_engine, 'connect') as mock_connect:
                mock_conn = mock_connect.return_value.__enter__.return_value
                mock_conn.execute.side_effect = SQLAlchemyError("Unexpected error")

                with pytest.raises(SQLAlchemyError):
                    EntityRepository.fetch_statistics_short_term(sqlite_engine)

    def test_fetch_statistics_long_term_returns_dict(self, populated_sqlite_engine):
        """Test fetch_statistics_long_term returns dictionary."""
        result = EntityRepository.fetch_statistics_long_term(populated_sqlite_engine)

        assert isinstance(result, dict)

    def test_fetch_statistics_long_term_data_structure(self, populated_sqlite_engine):
        """Test fetch_statistics_long_term returns correct data structure."""
        result = EntityRepository.fetch_statistics_long_term(populated_sqlite_engine)

        if len(result) > 0:  # Only test if table has data
            for entity_id, data in result.items():
                assert isinstance(entity_id, str)
                assert 'count' in data
                assert 'last_update' in data
                assert isinstance(data['count'], int)
                assert data['count'] > 0

    def test_fetch_statistics_long_term_empty_table(self, sqlite_engine):
        """Test fetch_statistics_long_term with empty statistics table."""
        result = EntityRepository.fetch_statistics_long_term(sqlite_engine)

        assert isinstance(result, dict)
        assert len(result) == 0

    def test_fetch_states_with_counts_timestamp_conversion(self, populated_sqlite_engine):
        """Test fetch_states_with_counts converts timestamps to ISO format."""
        states_data, _ = EntityRepository.fetch_states_with_counts(populated_sqlite_engine)

        for entity_id, data in states_data.items():
            if data['last_update'] is not None:
                # Should be ISO format string
                assert isinstance(data['last_update'], str)
                # Should be parseable
                datetime.fromisoformat(data['last_update'])

    def test_fetch_statistics_meta_correct_mapping(self, populated_sqlite_engine):
        """Test fetch_statistics_meta creates correct entity_id to metadata_id mapping."""
        # Insert known data
        with populated_sqlite_engine.connect() as conn:
            insert = text("INSERT INTO statistics_meta (id, statistic_id) VALUES (999, 'test.entity')")
            conn.execute(insert)
            conn.commit()

        result = EntityRepository.fetch_statistics_meta(populated_sqlite_engine)

        # Verify the mapping
        assert 'test.entity' in result
        assert result['test.entity'] == 999

    def test_fetch_statistics_short_term_timestamp_conversion(self, populated_sqlite_engine):
        """Test fetch_statistics_short_term converts timestamps to ISO format."""
        result = EntityRepository.fetch_statistics_short_term(populated_sqlite_engine)

        for entity_id, data in result.items():
            if data['last_update'] is not None:
                # Should be ISO format string
                assert isinstance(data['last_update'], str)
                # Should be parseable
                datetime.fromisoformat(data['last_update'])

    def test_fetch_statistics_long_term_timestamp_conversion(self, populated_sqlite_engine):
        """Test fetch_statistics_long_term converts timestamps to ISO format."""
        result = EntityRepository.fetch_statistics_long_term(populated_sqlite_engine)

        for entity_id, data in result.items():
            if data['last_update'] is not None:
                # Should be ISO format string
                assert isinstance(data['last_update'], str)
                # Should be parseable
                datetime.fromisoformat(data['last_update'])

    def test_repository_is_stateless(self, populated_sqlite_engine):
        """Test EntityRepository is stateless and can be called multiple times."""
        # Call methods multiple times
        result1 = EntityRepository.fetch_states_meta(populated_sqlite_engine)
        result2 = EntityRepository.fetch_states_meta(populated_sqlite_engine)

        # Results should be identical
        assert result1 == result2

        # No state should be stored in the class
        repo = EntityRepository()
        assert not hasattr(repo, '_cache')
        assert not hasattr(repo, '_state')

    def test_all_methods_accept_engine_parameter(self, sqlite_engine):
        """Test all repository methods accept engine as parameter."""
        # Should not raise exceptions for parameter mismatch
        EntityRepository.fetch_states_meta(sqlite_engine)
        EntityRepository.fetch_states_with_counts(sqlite_engine)
        EntityRepository.fetch_statistics_meta(sqlite_engine)
        EntityRepository.fetch_statistics_short_term(sqlite_engine)
        EntityRepository.fetch_statistics_long_term(sqlite_engine)
