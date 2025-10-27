"""Tests for SqlGenerator."""
from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from sqlalchemy import text
from sqlalchemy.engine import Engine

from custom_components.statistics_orphan_finder.services.sql_generator import (
    SqlGenerator,
)


class TestSqlGenerator:
    """Test SqlGenerator class."""

    def test_generate_delete_sql_states_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generating SQL for states-only entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        assert "BEGIN;" in sql
        assert "COMMIT;" in sql
        assert "DELETE FROM states WHERE metadata_id" in sql
        assert "DELETE FROM states_meta WHERE metadata_id" in sql
        assert "UPDATE states SET old_state_id = NULL" in sql

    def test_generate_delete_sql_statistics_only(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generating SQL for statistics-only entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="Long-term",
            in_states_meta=False,
            in_statistics_meta=True,
            metadata_id_statistics=1,
        )

        assert "BEGIN;" in sql
        assert "COMMIT;" in sql
        assert "DELETE FROM statistics WHERE metadata_id" in sql
        assert "DELETE FROM statistics_meta WHERE id" in sql
        # Should not include short-term
        assert "statistics_short_term" not in sql

    def test_generate_delete_sql_both_statistics(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generating SQL for both short and long-term statistics."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="Both",
            in_states_meta=False,
            in_statistics_meta=True,
            metadata_id_statistics=1,
        )

        assert "DELETE FROM statistics WHERE metadata_id" in sql
        assert "DELETE FROM statistics_short_term WHERE metadata_id" in sql
        assert "DELETE FROM statistics_meta WHERE id" in sql

    def test_generate_delete_sql_states_and_statistics(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generating SQL for entity with both states and statistics."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States+Statistics",
            in_states_meta=True,
            in_statistics_meta=True,
            metadata_id_statistics=1,
        )

        # Should include both states and statistics deletions
        assert "DELETE FROM states WHERE metadata_id" in sql
        assert "DELETE FROM states_meta WHERE metadata_id" in sql
        assert "DELETE FROM statistics WHERE metadata_id" in sql
        assert "DELETE FROM statistics_short_term WHERE metadata_id" in sql
        assert "DELETE FROM statistics_meta WHERE id" in sql

    def test_generate_delete_sql_nonexistent_entity(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generating SQL for non-existent entity."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.nonexistent",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        # Should return no-op comment
        assert "No data found" in sql

    def test_generate_delete_sql_mysql_syntax(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test MySQL uses START TRANSACTION instead of BEGIN."""
        mock_config_entry.data["db_url"] = "mysql://localhost/homeassistant"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        assert "START TRANSACTION;" in sql
        assert "COMMIT;" in sql
        assert "BEGIN;" not in sql

    def test_generate_delete_sql_postgresql_syntax(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test PostgreSQL uses BEGIN/COMMIT."""
        mock_config_entry.data["db_url"] = "postgresql://localhost/homeassistant"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        assert "BEGIN;" in sql
        assert "COMMIT;" in sql

    def test_generate_states_delete(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_states_delete method."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_states_delete(conn, "sensor.temperature")

            assert len(statements) == 3
            # Check order: UPDATE old_state_id, DELETE states, DELETE states_meta
            assert "UPDATE states SET old_state_id = NULL" in statements[0]
            assert "DELETE FROM states WHERE metadata_id" in statements[1]
            assert "DELETE FROM states_meta WHERE metadata_id" in statements[2]

    def test_generate_states_delete_nonexistent_entity(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_states_delete with non-existent entity."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_states_delete(conn, "sensor.nonexistent")

            assert len(statements) == 0

    def test_generate_statistics_delete_long_term(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_statistics_delete for long-term only."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_statistics_delete(
                conn, "sensor.temperature", "Long-term", metadata_id_statistics=1
            )

            assert len(statements) == 2
            assert "DELETE FROM statistics WHERE metadata_id" in statements[0]
            assert "DELETE FROM statistics_meta WHERE id" in statements[1]

    def test_generate_statistics_delete_short_term(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_statistics_delete for short-term only."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_statistics_delete(
                conn, "sensor.temperature", "Short-term", metadata_id_statistics=1
            )

            assert len(statements) == 2
            assert "DELETE FROM statistics_short_term WHERE metadata_id" in statements[0]
            assert "DELETE FROM statistics_meta WHERE id" in statements[1]

    def test_generate_statistics_delete_both(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_statistics_delete for both short and long-term."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_statistics_delete(
                conn, "sensor.temperature", "Both", metadata_id_statistics=1
            )

            assert len(statements) == 3
            assert "DELETE FROM statistics WHERE metadata_id" in statements[0]
            assert "DELETE FROM statistics_short_term WHERE metadata_id" in statements[1]
            assert "DELETE FROM statistics_meta WHERE id" in statements[2]

    def test_generate_statistics_delete_lookup_metadata_id(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_statistics_delete looks up metadata_id when not provided."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_statistics_delete(
                conn, "sensor.temperature", "Long-term", metadata_id_statistics=None
            )

            # Should still generate statements after looking up metadata_id
            assert len(statements) >= 1

    def test_generate_statistics_delete_nonexistent_entity(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _generate_statistics_delete with non-existent entity."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_statistics_delete(
                conn, "sensor.nonexistent", "Long-term", metadata_id_statistics=None
            )

            assert len(statements) == 0


class TestSqlGeneratorSafety:
    """Test SQL generation safety features."""

    def test_sql_uses_integer_metadata_id(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test SQL uses integer metadata_id (not string interpolation)."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.temperature",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        # Metadata IDs should be integers, not strings with quotes
        assert "metadata_id = 1" in sql or "metadata_id = 2" in sql
        assert "metadata_id = '1'" not in sql

    def test_entity_id_lookup_uses_parameterized_query(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test entity_id lookups use parameterized queries (not string interpolation)."""
        generator = SqlGenerator(mock_config_entry)

        # This test verifies the implementation uses text() with parameters
        # rather than f-strings or string concatenation
        with populated_sqlite_engine.connect() as conn:
            # If this doesn't raise an error, parameterization is working
            statements = generator._generate_states_delete(
                conn, "sensor.with'quote"  # Potentially dangerous character
            )

            # Should not find entity but should not error
            assert isinstance(statements, list)

    def test_old_state_id_cleanup_prevents_fk_violation(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test old_state_id is cleared before deleting states."""
        generator = SqlGenerator(mock_config_entry)

        with populated_sqlite_engine.connect() as conn:
            statements = generator._generate_states_delete(conn, "sensor.temperature")

            # First statement should update old_state_id to NULL
            assert statements[0].startswith("UPDATE states SET old_state_id = NULL")
            # This prevents foreign key constraint violations
            assert "DELETE FROM states" in statements[1]


class TestSqlGeneratorIntegration:
    """Integration tests for SQL execution."""

    def test_generated_sql_is_valid(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generated SQL is syntactically valid."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.deleted_entity",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        # Parse SQL by executing in a transaction and rolling back
        with populated_sqlite_engine.connect() as conn:
            trans = conn.begin()
            try:
                # Split and execute each statement
                for statement in sql.split(";"):
                    statement = statement.strip()
                    if statement and not statement.startswith("--"):
                        conn.execute(text(statement))
            finally:
                trans.rollback()

            # If we got here, SQL is valid

    def test_generated_sql_deletes_correctly(
        self, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test generated SQL actually deletes data when executed."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"
        generator = SqlGenerator(mock_config_entry)

        # Verify entity exists
        with populated_sqlite_engine.connect() as conn:
            result = conn.execute(text(
                "SELECT COUNT(*) FROM states_meta WHERE entity_id = 'sensor.deleted_entity'"
            ))
            assert result.scalar() == 1

        # Generate and execute SQL
        sql = generator.generate_delete_sql(
            engine=populated_sqlite_engine,
            entity_id="sensor.deleted_entity",
            origin="States",
            in_states_meta=True,
            in_statistics_meta=False,
        )

        with populated_sqlite_engine.connect() as conn:
            # Execute each statement
            for statement in sql.split(";"):
                statement = statement.strip()
                if statement and not statement.startswith("--"):
                    conn.execute(text(statement))
            conn.commit()

            # Verify entity was deleted
            result = conn.execute(text(
                "SELECT COUNT(*) FROM states_meta WHERE entity_id = 'sensor.deleted_entity'"
            ))
            assert result.scalar() == 0
