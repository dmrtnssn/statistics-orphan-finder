"""Tests for DatabaseService."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import text
from sqlalchemy.engine import Engine

from custom_components.statistics_orphan_finder.services.database_service import (
    DatabaseService,
)


class TestDatabaseService:
    """Test DatabaseService class."""

    def test_get_engine_creates_engine(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test that get_engine creates a new engine on first call."""
        service = DatabaseService(mock_hass, mock_config_entry)

        assert service._engine is None

        engine = service.get_engine()

        assert engine is not None
        assert service._engine is engine

    def test_get_engine_reuses_existing_engine(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test that get_engine reuses existing engine."""
        service = DatabaseService(mock_hass, mock_config_entry)

        engine1 = service.get_engine()
        engine2 = service.get_engine()

        assert engine1 is engine2

    def test_get_engine_with_credentials(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test engine creation with username and password."""
        mock_config_entry.data = {
            "db_url": "mysql://localhost/homeassistant",
            "username": "test_user",
            "password": "test_pass",
        }

        service = DatabaseService(mock_hass, mock_config_entry)

        with patch("custom_components.statistics_orphan_finder.services.database_service.create_engine") as mock_create:
            mock_create.return_value = MagicMock()
            service.get_engine()

            # Verify credentials were encoded in the URL
            call_args = mock_create.call_args[0][0]
            assert "test_user" in call_args
            assert "test_pass" in call_args

    def test_get_engine_with_special_characters_in_password(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test engine creation with special characters in password."""
        mock_config_entry.data = {
            "db_url": "mysql://localhost/homeassistant",
            "username": "user",
            "password": "p@ss:w0rd!",
        }

        service = DatabaseService(mock_hass, mock_config_entry)

        with patch("custom_components.statistics_orphan_finder.services.database_service.create_engine") as mock_create:
            mock_create.return_value = MagicMock()
            service.get_engine()

            # Verify password was URL-encoded
            call_args = mock_create.call_args[0][0]
            assert "p%40ss%3Aw0rd%21" in call_args

    def test_close_disposes_engine(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test that close disposes the engine."""
        service = DatabaseService(mock_hass, mock_config_entry)
        engine = service.get_engine()

        service.close()

        assert service._engine is None

    @pytest.mark.asyncio
    async def test_async_get_database_size_sqlite(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test async_get_database_size with SQLite."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"

        service = DatabaseService(mock_hass, mock_config_entry)
        service._engine = populated_sqlite_engine

        result = await service.async_get_database_size()

        # Verify returned structure
        assert "states" in result
        assert "statistics" in result
        assert "statistics_short_term" in result
        assert "other" in result
        assert "states_size" in result
        assert "statistics_size" in result
        assert "statistics_short_term_size" in result
        assert "other_size" in result

        # Verify counts
        assert result["states"] == 4  # 4 state records
        assert result["statistics"] == 3  # 3 long-term stats
        assert result["statistics_short_term"] == 3  # 3 short-term stats

    @pytest.mark.asyncio
    async def test_async_get_database_size_handles_missing_table(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, sqlite_engine: Engine
    ):
        """Test async_get_database_size handles missing statistics_short_term table."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"

        # Drop statistics_short_term table to simulate older HA version
        with sqlite_engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS statistics_short_term"))
            conn.commit()

        service = DatabaseService(mock_hass, mock_config_entry)
        service._engine = sqlite_engine

        result = await service.async_get_database_size()

        # Should handle missing table gracefully
        assert result["statistics_short_term"] == 0

    @pytest.mark.asyncio
    async def test_async_get_database_size_error_handling(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_get_database_size error handling."""
        from sqlalchemy.exc import SQLAlchemyError

        service = DatabaseService(mock_hass, mock_config_entry)

        # Create an engine that will fail with SQLAlchemyError
        with patch.object(service, "_fetch_database_size") as mock_fetch:
            mock_fetch.side_effect = SQLAlchemyError("Connection failed")

            result = await service.async_get_database_size()

            # Should return default values on error
            assert result["states"] == 0
            assert result["statistics"] == 0
            assert result["states_size"] == 0

    def test_fetch_database_size_calculates_sqlite_sizes(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test _fetch_database_size calculates sizes correctly for SQLite."""
        mock_config_entry.data["db_url"] = "sqlite:///:memory:"

        service = DatabaseService(mock_hass, mock_config_entry)
        service._engine = populated_sqlite_engine

        result = service._fetch_database_size()

        # Sizes should be calculated proportionally
        assert result["states_size"] > 0
        assert result["statistics_size"] > 0
        assert result["statistics_short_term_size"] > 0

    def test_close_without_engine_noop(self, mock_hass: MagicMock, mock_config_entry: MagicMock):
        """close should handle None engine safely."""
        service = DatabaseService(mock_hass, mock_config_entry)
        service._engine = None
        service.close()  # Should not raise

    def test_fetch_database_size_mysql_tables(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_mysql_connection: MagicMock,
    ):
        """_fetch_database_size should process MySQL table sizes."""
        mock_config_entry.data["db_url"] = "mysql://localhost/homeassistant"
        service = DatabaseService(mock_hass, mock_config_entry)

        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_mysql_connection

        with patch.object(service, "get_engine", return_value=mock_engine), patch.object(
            service, "get_db_type", return_value=(False, True, False)
        ):
            result = service._fetch_database_size()

        assert result["states_size"] >= 0
        assert result["statistics_size"] >= 0
        assert result["statistics_short_term_size"] >= 0

    def test_fetch_database_size_postgres_tables(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_postgres_connection: MagicMock,
    ):
        """_fetch_database_size should process PostgreSQL table sizes."""
        mock_config_entry.data["db_url"] = "postgresql://localhost/homeassistant"
        service = DatabaseService(mock_hass, mock_config_entry)

        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_postgres_connection

        with patch.object(service, "get_engine", return_value=mock_engine), patch.object(
            service, "get_db_type", return_value=(False, False, True)
        ):
            result = service._fetch_database_size()

        assert result["states_size"] >= 0
        assert result["statistics_size"] >= 0
        assert result["statistics_short_term_size"] >= 0


class TestDatabaseSizeMultiDB:
    """Test database size calculation for MySQL/PostgreSQL branches."""

    @pytest.mark.asyncio
    async def test_async_get_database_size_mysql(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_mysql_connection: MagicMock,
    ):
        mock_config_entry.data["db_url"] = "mysql://localhost/homeassistant"
        service = DatabaseService(mock_hass, mock_config_entry)

        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_mysql_connection

        with patch.object(service, "get_engine", return_value=mock_engine), patch.object(
            service, "get_db_type", return_value=(False, True, False)
        ):
            result = await service.async_get_database_size()

        assert result["states"] >= 0
        assert result["states_size"] >= 0
        assert result["statistics_size"] >= 0

    @pytest.mark.asyncio
    async def test_async_get_database_size_postgres(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_postgres_connection: MagicMock,
    ):
        mock_config_entry.data["db_url"] = "postgresql://localhost/homeassistant"
        service = DatabaseService(mock_hass, mock_config_entry)

        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_postgres_connection

        with patch.object(service, "get_engine", return_value=mock_engine), patch.object(
            service, "get_db_type", return_value=(False, False, True)
        ):
            result = await service.async_get_database_size()

        assert result["states"] >= 0
        assert result["states_size"] >= 0
        assert result["statistics_size"] >= 0


class TestDatabaseServiceIntegration:
    """Integration tests with real database."""

    def test_real_database_connection(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test connecting to a real in-memory database."""
        service = DatabaseService(mock_hass, mock_config_entry)
        engine = service.get_engine()

        # Verify we can execute queries
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.fetchone()[0] == 1

        service.close()

    def test_concurrent_connections(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test that service can handle multiple concurrent operations."""
        service = DatabaseService(mock_hass, mock_config_entry)
        service._engine = populated_sqlite_engine

        # Simulate concurrent queries
        results = []
        with service.get_engine().connect() as conn1:
            with service.get_engine().connect() as conn2:
                result1 = conn1.execute(text("SELECT COUNT(*) FROM states"))
                result2 = conn2.execute(text("SELECT COUNT(*) FROM statistics_meta"))
                results.append(result1.fetchone()[0])
                results.append(result2.fetchone()[0])

        assert results[0] == 4  # states count
        assert results[1] == 3  # statistics_meta count
