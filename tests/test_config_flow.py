"""Tests for StatisticsOrphanFinderConfigFlow."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResultType

from custom_components.statistics_orphan_finder.config_flow import (
    StatisticsOrphanFinderConfigFlow,
    validate_db_connection,
)
from custom_components.statistics_orphan_finder.const import (
    DOMAIN,
    CONF_DB_URL,
    CONF_USERNAME,
    CONF_PASSWORD,
)


class TestValidateDbConnection:
    """Test validate_db_connection function."""

    @pytest.mark.asyncio
    async def test_valid_sqlite_connection(self, mock_hass: MagicMock):
        """Test successful SQLite connection validation."""
        from sqlalchemy.exc import SQLAlchemyError

        data = {CONF_DB_URL: "sqlite:///:memory:"}

        with patch("sqlalchemy.create_engine") as mock_create:
            # Mock engine and connection
            mock_engine = MagicMock()
            mock_conn = MagicMock()
            mock_result = MagicMock()
            mock_result.fetchone.return_value = (100,)
            mock_conn.execute.return_value = mock_result
            mock_conn.__enter__ = MagicMock(return_value=mock_conn)
            mock_conn.__exit__ = MagicMock(return_value=False)
            mock_engine.connect.return_value = mock_conn
            mock_create.return_value = mock_engine

            result = await validate_db_connection(mock_hass, data)

            assert result == {"title": "Statistics Orphan Finder"}
            mock_create.assert_called_once()
            mock_engine.dispose.assert_called_once()

    @pytest.mark.asyncio
    async def test_connection_with_credentials(self, mock_hass: MagicMock):
        """Test connection with username and password."""
        data = {
            CONF_DB_URL: "mysql://localhost:3306/homeassistant",
            CONF_USERNAME: "test_user",
            CONF_PASSWORD: "test_pass",
        }

        with patch("sqlalchemy.create_engine") as mock_create:
            mock_engine = MagicMock()
            mock_conn = MagicMock()
            mock_result = MagicMock()
            mock_result.fetchone.return_value = (100,)
            mock_conn.execute.return_value = mock_result
            mock_conn.__enter__ = MagicMock(return_value=mock_conn)
            mock_conn.__exit__ = MagicMock(return_value=False)
            mock_engine.connect.return_value = mock_conn
            mock_create.return_value = mock_engine

            result = await validate_db_connection(mock_hass, data)

            # Verify credentials were encoded in URL
            call_args = mock_create.call_args[0][0]
            assert "test_user" in call_args
            assert "test_pass" in call_args
            assert result == {"title": "Statistics Orphan Finder"}

    @pytest.mark.asyncio
    async def test_connection_with_special_chars_in_password(self, mock_hass: MagicMock):
        """Test URL encoding of special characters in password."""
        data = {
            CONF_DB_URL: "mysql://localhost:3306/homeassistant",
            CONF_USERNAME: "user",
            CONF_PASSWORD: "p@ss:w0rd!",
        }

        with patch("sqlalchemy.create_engine") as mock_create:
            mock_engine = MagicMock()
            mock_conn = MagicMock()
            mock_result = MagicMock()
            mock_result.fetchone.return_value = (100,)
            mock_conn.execute.return_value = mock_result
            mock_conn.__enter__ = MagicMock(return_value=mock_conn)
            mock_conn.__exit__ = MagicMock(return_value=False)
            mock_engine.connect.return_value = mock_conn
            mock_create.return_value = mock_engine

            result = await validate_db_connection(mock_hass, data)

            # Verify password was URL-encoded
            call_args = mock_create.call_args[0][0]
            assert "p%40ss%3Aw0rd%21" in call_args
            assert result == {"title": "Statistics Orphan Finder"}

    @pytest.mark.asyncio
    async def test_connection_failure(self, mock_hass: MagicMock):
        """Test database connection failure."""
        from sqlalchemy.exc import OperationalError

        data = {CONF_DB_URL: "sqlite:///nonexistent.db"}

        with patch("sqlalchemy.create_engine") as mock_create:
            mock_engine = MagicMock()
            mock_engine.connect.side_effect = OperationalError("", "", "")
            mock_create.return_value = mock_engine

            with pytest.raises(ValueError, match="cannot_connect"):
                await validate_db_connection(mock_hass, data)

    @pytest.mark.asyncio
    async def test_missing_statistics_table(self, mock_hass: MagicMock):
        """Test validation failure when statistics table is missing."""
        from sqlalchemy.exc import OperationalError

        data = {CONF_DB_URL: "sqlite:///:memory:"}

        with patch("sqlalchemy.create_engine") as mock_create:
            mock_engine = MagicMock()
            mock_conn = MagicMock()
            # Simulate table not found error
            mock_conn.execute.side_effect = OperationalError("no such table: statistics", "", "")
            mock_conn.__enter__ = MagicMock(return_value=mock_conn)
            mock_conn.__exit__ = MagicMock(return_value=False)
            mock_engine.connect.return_value = mock_conn
            mock_create.return_value = mock_engine

            with pytest.raises(ValueError, match="cannot_connect"):
                await validate_db_connection(mock_hass, data)


class TestConfigFlow:
    """Test StatisticsOrphanFinderConfigFlow."""

    @pytest.mark.asyncio
    async def test_show_form_on_init(self, mock_hass: MagicMock):
        """Test that form is shown on initialization."""
        flow = StatisticsOrphanFinderConfigFlow()
        flow.hass = mock_hass

        result = await flow.async_step_user(user_input=None)

        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "user"
        assert result["errors"] == {}

    @pytest.mark.asyncio
    async def test_successful_config_entry_creation(self, mock_hass: MagicMock):
        """Test successful config entry creation."""
        flow = StatisticsOrphanFinderConfigFlow()
        flow.hass = mock_hass

        user_input = {CONF_DB_URL: "sqlite:///:memory:"}

        with patch(
            "custom_components.statistics_orphan_finder.config_flow.validate_db_connection",
            return_value={"title": "Statistics Orphan Finder"},
        ):
            result = await flow.async_step_user(user_input=user_input)

            assert result["type"] == FlowResultType.CREATE_ENTRY
            assert result["title"] == "Statistics Orphan Finder"
            assert result["data"] == user_input

    @pytest.mark.asyncio
    async def test_connection_error_shows_form_with_error(self, mock_hass: MagicMock):
        """Test that connection errors show form with error message."""
        flow = StatisticsOrphanFinderConfigFlow()
        flow.hass = mock_hass

        user_input = {CONF_DB_URL: "sqlite:///bad.db"}

        with patch(
            "custom_components.statistics_orphan_finder.config_flow.validate_db_connection",
            side_effect=ValueError("cannot_connect"),
        ):
            result = await flow.async_step_user(user_input=user_input)

            assert result["type"] == FlowResultType.FORM
            assert result["errors"] == {"base": "cannot_connect"}

    @pytest.mark.asyncio
    async def test_unknown_error_shows_form_with_error(self, mock_hass: MagicMock):
        """Test that unknown errors show form with generic error message."""
        flow = StatisticsOrphanFinderConfigFlow()
        flow.hass = mock_hass

        user_input = {CONF_DB_URL: "sqlite:///:memory:"}

        with patch(
            "custom_components.statistics_orphan_finder.config_flow.validate_db_connection",
            side_effect=Exception("Unexpected error"),
        ):
            result = await flow.async_step_user(user_input=user_input)

            assert result["type"] == FlowResultType.FORM
            assert result["errors"] == {"base": "unknown"}
