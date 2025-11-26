"""Tests for database utility functions."""
from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from custom_components.statistics_orphan_finder.services.database_service import (
    get_database_type,
)
from custom_components.statistics_orphan_finder.const import CONF_DB_URL


class TestGetDatabaseType:
    """Test get_database_type utility function."""

    def test_sqlite_detection(self, mock_config_entry: MagicMock):
        """Test SQLite URL detection."""
        mock_config_entry.data = {CONF_DB_URL: "sqlite:///path/to/database.db"}

        is_sqlite, is_mysql, is_postgres = get_database_type(mock_config_entry)

        assert is_sqlite is True
        assert is_mysql is False
        assert is_postgres is False

    def test_mysql_detection(self, mock_config_entry: MagicMock):
        """Test MySQL URL detection."""
        mock_config_entry.data = {CONF_DB_URL: "mysql://user:pass@localhost/db"}

        is_sqlite, is_mysql, is_postgres = get_database_type(mock_config_entry)

        assert is_sqlite is False
        assert is_mysql is True
        assert is_postgres is False

    def test_mariadb_detection(self, mock_config_entry: MagicMock):
        """Test MariaDB URL detection."""
        mock_config_entry.data = {CONF_DB_URL: "mariadb://user:pass@localhost/db"}

        is_sqlite, is_mysql, is_postgres = get_database_type(mock_config_entry)

        assert is_sqlite is False
        assert is_mysql is True
        assert is_postgres is False

    def test_postgresql_detection(self, mock_config_entry: MagicMock):
        """Test PostgreSQL URL detection (full name)."""
        mock_config_entry.data = {CONF_DB_URL: "postgresql://user:pass@localhost/db"}

        is_sqlite, is_mysql, is_postgres = get_database_type(mock_config_entry)

        assert is_sqlite is False
        assert is_mysql is False
        assert is_postgres is True

    def test_postgres_short_detection(self, mock_config_entry: MagicMock):
        """Test PostgreSQL URL detection (short name)."""
        mock_config_entry.data = {CONF_DB_URL: "postgres://user:pass@localhost/db"}

        is_sqlite, is_mysql, is_postgres = get_database_type(mock_config_entry)

        assert is_sqlite is False
        assert is_mysql is False
        assert is_postgres is True
